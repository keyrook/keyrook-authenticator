/**
 * The client half of the sync protocol.
 *
 * Everything here moves ciphertext. No plaintext secret, no data key and no
 * master password is ever passed to these functions — by the time a record
 * reaches `push`, its `box` is already sealed.
 */
import type { SealedBox } from '../crypto/aead.js';
import type { AccountKdfParams } from './account.js';
import type { PullResult, PushResult, RemoteRecord, SyncAdapter } from './adapter.js';
import type {
  FamilyRecoveryAskRequest,
  FamilyRecoveryAskResponse,
  FamilyRecoveryStepRequired,
  FamilyRecoveryCodeRequest,
  FamilyRecoveryFinishRequest,
  FamilyRecoveryStatusResponse,
  OrgRecoveryBoxRequest,
  OrgRecoveryBoxResponse,
  OrgRecoveryHandoverRequest,
  OrgRecoveryOffRequest,
  OrgRecoveryOnRequest,
  SignInProvider,
  AccountExport,
  ActivityResponse,
  SecurityEvent,
  EmailChangeBeginRequest,
  EmailChangeRequest,
  EmailChangeResponse,
  AccountArchive,
  AccountArchivesResponse,
  AccountKeysResponse,
  ArchivedRecordsResponse,
  DeleteArchiveRequest,
  OpenArchiveRequest,
  OpenArchiveResponse,
  StartOverBeginRequest,
  StartOverBeginResponse,
  StartOverCodeRequest,
  StartOverRequest,
  StartOverScheduledResponse,
  ConsoleRootRequest,
  AddPasskeyRequest,
  PasskeyCreationOptions,
  PasskeyOptionsRequest,
  PasskeySignInOptions,
  PasskeySignInRequest,
  PasskeySignInResponse,
  PasskeysResponse,
  PasskeyUnlock,
  PasskeyView,
  RecoveryCheckedRequest,
  ChangePasswordRequest,
  ConsoleCollected,
  ConsoleKeysResponse,
  ConsolePinsRequest,
  ConsoleRotateRequest,
  ConsoleSummary,
  ConsoleCollectRequest,
  ConsoleRequestFound,
  ConsoleSignInCreated,
  ConsoleSignInRequest,
  CreateBoxRequest,
  CreateRootRequest,
  DeleteAccountRequest,
  AddPasswordRequest,
  OwnerProofFields,
  SecondStepBegun,
  SecondStepRequest,
  SecondStepRequired,
  LinkIdentityRequest,
  UnlinkIdentityRequest,
  DeviceRemovalProof,
  DeviceSummary,
  DevicesResponse,
  RemoveDeviceRequest,
  ProfileRequest,
  ProfileResponse,
  LoginRequest,
  LoginResponse,
  PairingCreated,
  PairingRequest,
  PairingsResponse,
  PairingStatus,
  PairingSummary,
  PreloginResponse,
  ProtectedKeyRequest,
  ProviderLogin,
  ReplaceBoxRequest,
  ProviderRegisterRequest,
  ProviderSessionRequest,
  ProviderSessionResponse,
  PullResponse,
  PushRequest,
  PushResponse,
  RecoverCodeRequest,
  RootRecoverRequest,
  RootRecoverResetRequest,
  RootRecoverResponse,
  RotateRootRequest,
  SetRootRecoveryRequest,
  UpdateBoxRequest,
  RecoverRequest,
  RecoverResetRequest,
  RecoverResponse,
  RecoveryWrapRequest,
  RefreshResponse,
  RegisterRequest,
  RegisterStartRequest,
  SetRecoveryRequest,
  SyncErrorBody,
  SyncErrorCode,
  AcceptOrgInviteRequest,
  ConfirmOrgMemberRequest,
  VerifyOrgMemberRequest,
  CreateOrgRequest,
  OrgDetail,
  OrgEmergencyBox,
  OrgEmergencyRequest,
  OrgInvite,
  OrgInviteRequest,
  OrgProductBoxRequest,
  OrgPullResponse,
  OrgPushRequest,
  OrgPushResponse,
  OrgRecord,
  OrgRoleRequest,
  OrgRoster,
  OrgsResponse,
  RotateOrgRequest,
  CollectionKeysRequest,
  CreateCollectionRequest,
  RenameCollectionRequest,
  RotateCollectionRequest,
} from './protocol.js';

const collectionPath = (orgId: string, collectionId: string) => `/orgs/${encodeURIComponent(orgId)}/collections/${encodeURIComponent(collectionId)}`;

export type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

/**
 * A fetcher that names the build in every request (`authenticator/0.4.0`), so
 * the server can tell it from the builds before keys per product. Pass the
 * result to every call and to `HttpSyncAdapter`.
 */
export function namedClient(fetcher: Fetcher, client: string): Fetcher {
  return (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set('x-keyrook-client', client);
    return fetcher(input, { ...init, headers });
  };
}

export class SyncHttpError extends Error {
  override readonly name = 'SyncHttpError';
  /**
   * On `device_removed`: the removal proof as the server sent it, or null
   * when it sent none. Whatever it is, only `checkDeviceRemovalProof` says
   * whether it means anything.
   */
  readonly proof?: unknown;
  constructor(
    readonly status: number,
    readonly code: SyncErrorCode | 'network',
    message: string,
    options?: { cause?: unknown; proof?: unknown },
  ) {
    super(message, options);
    if (code === 'device_removed') this.proof = options?.proof ?? null;
  }
}

async function request<T>(
  baseUrl: string,
  path: string,
  init: RequestInit,
  fetcher: Fetcher,
): Promise<T> {
  let response: Response;
  try {
    response = await fetcher(`${baseUrl}${path}`, {
      ...init,
      headers: { 'content-type': 'application/json', ...(init.headers ?? {}) },
    });
  } catch (cause) {
    // The message is shown to people as it is, so it says what happened in
    // their words; the browser's own ("TypeError: Failed to fetch") stays on
    // `cause` for whoever is debugging.
    throw new SyncHttpError(
      0,
      'network',
      'Could not reach the sync server. Check your connection and try again.',
      { cause },
    );
  }

  if (!response.ok) {
    // A server that is down or behind a captive portal will not return our
    // error shape; fall back rather than throwing a parse error over the top
    // of the real problem.
    const body = (await response.json().catch(() => null)) as SyncErrorBody | null;
    throw new SyncHttpError(
      response.status,
      body?.error ?? 'unauthorized',
      body?.message ?? `Sync request failed (${response.status}).`,
      { proof: body?.proof },
    );
  }

  // Endpoints that only confirm something happened answer 204 with no body.
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

/** Where the caller keeps tokens. The extension puts them in session storage. */
export interface TokenStore {
  get(): Promise<Tokens | null>;
  set(tokens: Tokens): Promise<void>;
  clear(): Promise<void>;
}

// --- Unauthenticated endpoints ----------------------------------------------

export async function prelogin(
  baseUrl: string,
  email: string,
  fetcher: Fetcher = fetch,
): Promise<AccountKdfParams> {
  const { kdf } = await request<PreloginResponse>(
    baseUrl,
    '/auth/prelogin',
    { method: 'POST', body: JSON.stringify({ email }) },
    fetcher,
  );
  return kdf;
}

/**
 * Asks for a one-time code to be emailed to the address. Resolves the same way
 * whether or not the address already has an account; the email says which.
 */
export async function startRegistration(
  baseUrl: string,
  email: string,
  fetcher: Fetcher = fetch,
): Promise<void> {
  await request<{ sent: true }>(
    baseUrl,
    '/auth/register/start',
    { method: 'POST', body: JSON.stringify({ email } satisfies RegisterStartRequest) },
    fetcher,
  );
}

export function register(
  baseUrl: string,
  body: RegisterRequest,
  fetcher: Fetcher = fetch,
): Promise<LoginResponse> {
  return request<LoginResponse>(
    baseUrl,
    '/auth/register',
    { method: 'POST', body: JSON.stringify(body) },
    fetcher,
  );
}

export function login(
  baseUrl: string,
  body: LoginRequest,
  fetcher: Fetcher = fetch,
): Promise<LoginResponse> {
  return request<LoginResponse>(
    baseUrl,
    '/auth/login',
    { method: 'POST', body: JSON.stringify(body) },
    fetcher,
  );
}

/**
 * Signs in saying this client can ask for a second step: a session, or, on an
 * account that has one, a ticket to finish with (`finishSecondStep`).
 */
export function beginLogin(
  baseUrl: string,
  body: Omit<LoginRequest, 'secondStep'>,
  fetcher: Fetcher = fetch,
): Promise<LoginResponse | SecondStepRequired> {
  return request<LoginResponse | SecondStepRequired>(
    baseUrl,
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ ...body, secondStep: true }) },
    fetcher,
  );
}

/** Finishes a sign-in with its second step: the code, the recovery key's proof, or a passkey. */
export function finishSecondStep(baseUrl: string, body: SecondStepRequest, fetcher: Fetcher = fetch): Promise<LoginResponse> {
  return request<LoginResponse>(baseUrl, '/auth/second-step', { method: 'POST', body: JSON.stringify(body) }, fetcher);
}

/** A challenge for one of the account's passkeys to answer as the second step. */
export function secondStepPasskeyOptions(baseUrl: string, ticket: string, fetcher: Fetcher = fetch): Promise<PasskeySignInOptions> {
  return request<PasskeySignInOptions>(baseUrl, '/auth/second-step/passkey', { method: 'POST', body: JSON.stringify({ ticket }) }, fetcher);
}

/** Fetches the account's wrapped key, for a device holding only the recovery key. */
export async function recover(
  baseUrl: string,
  body: RecoverRequest,
  fetcher: Fetcher = fetch,
): Promise<RecoverResponse> {
  return request<RecoverResponse>(
    baseUrl,
    '/auth/recover',
    { method: 'POST', body: JSON.stringify(body) },
    fetcher,
  );
}

/** Sets a new password through the recovery kit and signs this device in. */
export function recoverReset(
  baseUrl: string,
  body: RecoverResetRequest,
  fetcher: Fetcher = fetch,
): Promise<LoginResponse> {
  return request<LoginResponse>(
    baseUrl,
    '/auth/recover/reset',
    { method: 'POST', body: JSON.stringify(body) },
    fetcher,
  );
}

/**
 * Ends this device's session on the server. Best effort by design: signing out
 * must work offline too, so a caller should clear its tokens whatever this does.
 */
/** Sends a code to the address, if its account resets through a root; answers the same either way. */
export async function requestRecoveryCode(baseUrl: string, email: string, fetcher: Fetcher = fetch): Promise<void> {
  await request<{ sent: true }>(
    baseUrl,
    '/auth/recover/code',
    { method: 'POST', body: JSON.stringify({ email } satisfies RecoverCodeRequest) },
    fetcher,
  );
}

/** The root under the recovery key, for whoever proves the recovery key. */
export function recoverRoot(baseUrl: string, body: RootRecoverRequest, fetcher: Fetcher = fetch): Promise<RootRecoverResponse> {
  return request<RootRecoverResponse>(baseUrl, '/auth/recover/root', { method: 'POST', body: JSON.stringify(body) }, fetcher);
}

/** A new password through the recovery key, the emailed code and the root it opened. */
export function recoverRootReset(
  baseUrl: string,
  body: RootRecoverResetRequest,
  fetcher: Fetcher = fetch,
): Promise<LoginResponse> {
  return request<LoginResponse>(baseUrl, '/auth/recover/root/reset', { method: 'POST', body: JSON.stringify(body) }, fetcher);
}

/**
 * A code to the address, to start the account over with nothing left but the
 * email. Resolves the same way whether or not the address has an account.
 */
export async function requestStartOverCode(baseUrl: string, email: string, fetcher: Fetcher = fetch): Promise<void> {
  await request<{ sent: true }>(
    baseUrl,
    '/auth/start-over/code',
    { method: 'POST', body: JSON.stringify({ email } satisfies StartOverCodeRequest) },
    fetcher,
  );
}

/** Spends the code: the account id the new keys are bound to, and a ticket for `startOver`. */
export function beginStartOver(
  baseUrl: string,
  body: StartOverBeginRequest,
  fetcher: Fetcher = fetch,
): Promise<StartOverBeginResponse> {
  return request<StartOverBeginResponse>(baseUrl, '/auth/start-over/begin', { method: 'POST', body: JSON.stringify(body) }, fetcher);
}

/** Asks to start the account over with new keys, a week from now; what it held is then kept, sealed, for 90 days. */
export function startOver(baseUrl: string, body: StartOverRequest, fetcher: Fetcher = fetch): Promise<StartOverScheduledResponse> {
  return request<StartOverScheduledResponse>(baseUrl, '/auth/start-over', { method: 'POST', body: JSON.stringify(body) }, fetcher);
}

/**
 * A code to the address, to ask a family's organiser for help back in.
 * Resolves the same way whether or not an organiser holds the account's root.
 */
export async function requestFamilyRecoveryCode(baseUrl: string, email: string, fetcher: Fetcher = fetch): Promise<void> {
  await request<{ sent: true }>(
    baseUrl,
    '/auth/family-recovery/code',
    { method: 'POST', body: JSON.stringify({ email } satisfies FamilyRecoveryCodeRequest) },
    fetcher,
  );
}

/** Spends the code: the request, its ticket, and who can help, each organiser told; or, without the account's second step, `{ secondStep: true }`. */
export function askFamilyRecovery(
  baseUrl: string,
  body: FamilyRecoveryAskRequest,
  fetcher: Fetcher = fetch,
): Promise<FamilyRecoveryAskResponse | FamilyRecoveryStepRequired> {
  return request<FamilyRecoveryAskResponse | FamilyRecoveryStepRequired>(baseUrl, '/auth/family-recovery', { method: 'POST', body: JSON.stringify(body) }, fetcher);
}

/** Where a request stands; once handed over, the root's box and every box sealed to the root. */
export function familyRecoveryStatus(baseUrl: string, id: string, ticket: string, fetcher: Fetcher = fetch): Promise<FamilyRecoveryStatusResponse> {
  return request<FamilyRecoveryStatusResponse>(
    baseUrl,
    `/auth/family-recovery/${encodeURIComponent(id)}`,
    { method: 'POST', body: JSON.stringify({ ticket }) },
    fetcher,
  );
}

/** Replaces the root handed over, and signs the page in. */
export function finishFamilyRecovery(baseUrl: string, id: string, body: FamilyRecoveryFinishRequest, fetcher: Fetcher = fetch): Promise<LoginResponse> {
  return request<LoginResponse>(baseUrl, `/auth/family-recovery/${encodeURIComponent(id)}/finish`, { method: 'POST', body: JSON.stringify(body) }, fetcher);
}

/** A challenge to sign in with a passkey, for the origin asking: the page's, or a product's. */
export function passkeySignInOptions(baseUrl: string, fetcher: Fetcher = fetch): Promise<PasskeySignInOptions> {
  return request<PasskeySignInOptions>(baseUrl, '/auth/passkey/options', { method: 'POST', body: '{}' }, fetcher);
}

/** Signs in with a passkey's answer; the root wrapped under it comes back when the passkey unlocks. */
export function passkeySignIn(baseUrl: string, body: PasskeySignInRequest, fetcher: Fetcher = fetch): Promise<PasskeySignInResponse> {
  return request<PasskeySignInResponse>(baseUrl, '/auth/passkey/signin', { method: 'POST', body: JSON.stringify(body) }, fetcher);
}

export async function logout(
  baseUrl: string,
  refreshToken: string,
  fetcher: Fetcher = fetch,
): Promise<void> {
  await request<void>(
    baseUrl,
    '/auth/logout',
    { method: 'POST', body: JSON.stringify({ refreshToken }) },
    fetcher,
  );
}

// --- Signing in to the account page by approval -----------------------------

/** The account page asks to be signed in; it shows `code` and keeps `secret`. */
export function requestConsoleSignIn(
  baseUrl: string,
  body: ConsoleSignInRequest,
  fetcher: Fetcher = fetch,
): Promise<ConsoleSignInCreated> {
  return request<ConsoleSignInCreated>(baseUrl, '/console/requests', { method: 'POST', body: JSON.stringify(body) }, fetcher);
}

/** The account page asks whether a product approved it: a session once, then nothing. */
export function collectConsoleSignIn(
  baseUrl: string,
  id: string,
  body: ConsoleCollectRequest,
  fetcher: Fetcher = fetch,
): Promise<ConsoleCollected> {
  return request<ConsoleCollected>(
    baseUrl,
    `/console/requests/${encodeURIComponent(id)}/collect`,
    { method: 'POST', body: JSON.stringify(body) },
    fetcher,
  );
}

// --- Signing in with a provider --------------------------------------------

/** How this server signs people in besides a password. */
export interface SignInOptions {
  /** The providers it offers, minus any this client does not know. Empty when none. */
  providers: SignInProvider[];
  /**
   * It can hand a sign-in back by a page that messages the client, so the
   * sign-in can happen where the person already is. A server that cannot
   * only redirects, which a browser catches in a window of its own.
   */
  byMessage: boolean;
  /**
   * It can hand a sign-in back to a phone app, at `<app id>:/oauth`
   * (`return=app&app=<app id>`). A server that cannot leaves an app with no
   * way to sign in with a provider.
   */
  byApp: boolean;
  /** It signs in with passkeys. An older server says nothing, which is read as no. */
  passkeys: boolean;
  /** An account may turn on a second step at sign-in; a server may not offer it yet. */
  secondStep: boolean;
  /** Families are offered; a server may keep them off. */
  families: boolean;
  /** A family's plan may hold recovery by an organiser, so a member may ask theirs for help back in. */
  familyRecovery: boolean;
}

export async function signInOptions(baseUrl: string, fetcher: Fetcher = fetch): Promise<SignInOptions> {
  const { providers, returnBy, passkeys, secondStep, families, familyRecovery } = await request<{
    providers: string[];
    returnBy?: string[];
    passkeys?: boolean;
    secondStep?: boolean;
    families?: boolean;
    familyRecovery?: boolean;
  }>(
    baseUrl,
    '/providers',
    { method: 'GET' },
    fetcher,
  );
  return {
    providers: providers.filter((name): name is SignInProvider => name === 'google' || name === 'github'),
    byMessage: Array.isArray(returnBy) && returnBy.includes('message'),
    byApp: Array.isArray(returnBy) && returnBy.includes('app'),
    passkeys: passkeys === true,
    secondStep: secondStep === true,
    families: families === true,
    familyRecovery: familyRecovery === true,
  };
}

/** A ticket and its verifier: a session, or a token to create the account with. */
export function providerSession(
  baseUrl: string,
  body: ProviderSessionRequest,
  fetcher: Fetcher = fetch,
): Promise<ProviderSessionResponse> {
  return request<ProviderSessionResponse>(
    baseUrl,
    '/oauth/session',
    { method: 'POST', body: JSON.stringify(body) },
    fetcher,
  );
}

export function providerRegister(
  baseUrl: string,
  body: ProviderRegisterRequest,
  fetcher: Fetcher = fetch,
): Promise<ProviderLogin> {
  return request<ProviderLogin>(
    baseUrl,
    '/oauth/register',
    { method: 'POST', body: JSON.stringify(body) },
    fetcher,
  );
}

// --- The adapter ------------------------------------------------------------

export interface HttpSyncOptions {
  baseUrl: string;
  tokens: TokenStore;
  fetcher?: Fetcher;
}

/**
 * Refreshes in flight, keyed by the refresh token being spent.
 *
 * The server ends a whole session when a spent refresh token comes back, which
 * is what makes a copied token worthless. It cannot tell a thief from two of
 * the owner's own calls that hit 401 together and both try to refresh — so the
 * client must never do that. Every caller holding the same token shares one
 * exchange.
 */
const inflightRefreshes = new Map<string, Promise<Tokens>>();

export class HttpSyncAdapter implements SyncAdapter {
  readonly id = 'http';
  private readonly fetcher: Fetcher;

  constructor(private readonly options: HttpSyncOptions) {
    this.fetcher = options.fetcher ?? fetch;
  }

  async isAvailable(): Promise<boolean> {
    return (await this.options.tokens.get()) !== null;
  }

  /**
   * Runs an authenticated call, refreshing once on a 401. A refresh the server
   * refuses clears the stored tokens: the session is genuinely gone, and
   * holding dead credentials just produces a loop.
   */
  private async authed<T>(path: string, init: RequestInit): Promise<T> {
    const tokens = await this.options.tokens.get();
    if (!tokens) throw new SyncHttpError(401, 'unauthorized', 'Not signed in.');

    const call = (accessToken: string) =>
      request<T>(
        this.options.baseUrl,
        path,
        { ...init, headers: { ...(init.headers ?? {}), authorization: `Bearer ${accessToken}` } },
        this.fetcher,
      );

    try {
      return await call(tokens.accessToken);
    } catch (error) {
      if (!(error instanceof SyncHttpError) || error.status !== 401) throw error;
      const refreshed = await this.refresh(tokens);
      return call(refreshed.accessToken);
    }
  }

  private async refresh(stale: Tokens): Promise<Tokens> {
    // Another call may have rotated while this one was waiting on its 401. Its
    // result is already stored; spending the old token again would look
    // exactly like a replay and end the session.
    const current = await this.options.tokens.get();
    if (!current) throw new SyncHttpError(401, 'unauthorized', 'Not signed in.');
    if (current.refreshToken !== stale.refreshToken) return current;

    let pending = inflightRefreshes.get(stale.refreshToken);
    if (!pending) {
      pending = this.exchange(stale.refreshToken).finally(() =>
        inflightRefreshes.delete(stale.refreshToken),
      );
      inflightRefreshes.set(stale.refreshToken, pending);
    }
    return pending;
  }

  private async exchange(refreshToken: string): Promise<Tokens> {
    let refreshed: RefreshResponse;
    try {
      refreshed = await request<RefreshResponse>(
        this.options.baseUrl,
        '/auth/refresh',
        { method: 'POST', body: JSON.stringify({ refreshToken }) },
        this.fetcher,
      );
    } catch (error) {
      // Only the server saying no ends the session. An offline laptop or a
      // captive portal is not a reason to sign someone out.
      if (error instanceof SyncHttpError && error.status === 401) {
        await this.options.tokens.clear();
        // A removal reaches the product as one, proof and all, for it to check.
        if (error.code === 'device_removed') throw error;
        throw new SyncHttpError(
          401,
          'unauthorized',
          error.message && !error.message.startsWith('Sync request failed')
            ? error.message
            : 'Your session expired. Sign in again.',
        );
      }
      throw error;
    }

    const next = { accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken };
    await this.options.tokens.set(next);
    return next;
  }

  // --- The account itself ---------------------------------------------------

  async devices(): Promise<DeviceSummary[]> {
    return (await this.authed<DevicesResponse>('/account/devices', { method: 'GET' })).devices;
  }

  /** Asks for a code at the address the account would move to, on the owner's proof. */
  async beginEmailChange(body: EmailChangeBeginRequest): Promise<void> {
    await this.authed<{ sent: true }>('/account/email/begin', { method: 'POST', body: JSON.stringify(body) });
  }

  /** Moves the account to the address the code was sent to; answers the address as kept. */
  async changeEmail(body: EmailChangeRequest): Promise<string> {
    return (await this.authed<EmailChangeResponse>('/account/email', { method: 'POST', body: JSON.stringify(body) })).email;
  }

  /** The last 90 days of sign-ins and changes to the account, newest first. */
  async activity(): Promise<SecurityEvent[]> {
    return (await this.authed<ActivityResponse>('/account/activity', { method: 'GET' })).events;
  }

  /** What the server holds about the account, as the page lets the person download it. */
  async exportAccount(): Promise<AccountExport> {
    return this.authed<AccountExport>('/account/export', { method: 'GET' });
  }

  /** Gives the account a name, or clears it with null; answers the name as kept. */
  async setName(name: string | null): Promise<string | null> {
    const body: ProfileRequest = { name };
    return (await this.authed<ProfileResponse>('/account/profile', { method: 'PUT', body: JSON.stringify(body) })).name;
  }

  /**
   * Removes a device: `id` is its session's (`DeviceSummary.id`). With a
   * proof (`makeDeviceRemovalProof`, for that device's product and
   * `deviceId`), the device is told it was removed and can check it; without,
   * it is signed out and keeps what it holds.
   */
  async revokeDevice(id: string, proof?: DeviceRemovalProof): Promise<void> {
    const body: RemoveDeviceRequest = proof ? { proof } : {};
    await this.authed<void>(`/account/devices/${encodeURIComponent(id)}`, { method: 'DELETE', body: JSON.stringify(body) });
  }

  async changePassword(body: ChangePasswordRequest): Promise<void> {
    await this.authed<void>('/account/password', { method: 'POST', body: JSON.stringify(body) });
  }

  async wrapProtectedKey(body: ProtectedKeyRequest): Promise<void> {
    await this.authed<void>('/account/protected-key', { method: 'PUT', body: JSON.stringify(body) });
  }

  async setRecovery(body: SetRecoveryRequest): Promise<void> {
    await this.authed<void>('/account/recovery', { method: 'PUT', body: JSON.stringify(body) });
  }

  async deleteAccount(body: DeleteAccountRequest): Promise<void> {
    await this.authed<void>('/account', { method: 'DELETE', body: JSON.stringify(body) });
  }

  /** Adds a Google or GitHub identity the person just signed in as. */
  async linkIdentity(body: LinkIdentityRequest): Promise<void> {
    await this.authed<void>('/account/identities', { method: 'POST', body: JSON.stringify(body) });
  }

  /** Removes the account's identity with `provider`, while another way to sign in is left. */
  async unlinkIdentity(provider: string, body: UnlinkIdentityRequest): Promise<void> {
    await this.authed<void>(`/account/identities/${encodeURIComponent(provider)}`, { method: 'DELETE', body: JSON.stringify(body) });
  }

  /** A password for an account that has none. */
  async addPassword(body: AddPasswordRequest): Promise<void> {
    await this.authed<void>('/account/password/add', { method: 'POST', body: JSON.stringify(body) });
  }

  /** Starts turning on a second step: a secret for the authenticator app, shown once. Nothing changes until `confirmSecondStep`. */
  async beginSecondStep(body: OwnerProofFields): Promise<SecondStepBegun> {
    return this.authed<SecondStepBegun>('/account/second-step/begin', { method: 'POST', body: JSON.stringify(body) });
  }

  /** A code from the app just set up: from now on sign-in asks for one. */
  async confirmSecondStep(code: string): Promise<void> {
    await this.authed<void>('/account/second-step/confirm', { method: 'POST', body: JSON.stringify({ code }) });
  }

  /** Turns the second step off, on the owner's proof with the second step itself, or a passkey. */
  async turnOffSecondStep(body: OwnerProofFields): Promise<void> {
    await this.authed<void>('/account/second-step', { method: 'DELETE', body: JSON.stringify(body) });
  }

  /** Cancels a start over still waiting (`AccountKeysResponse.pendingStartOver`). Any session of the account may. */
  async cancelStartOver(): Promise<void> {
    await this.authed<void>('/account/start-over', { method: 'DELETE' });
  }

  /** Tells the server the recovery key just opened the root here, so it reminds no one for a while. */
  async recoveryChecked(body: RecoveryCheckedRequest): Promise<void> {
    await this.authed<void>('/account/keys/root/recovery/checked', { method: 'POST', body: JSON.stringify(body) });
  }

  /** The passkeys that sign in to the account, and whether each unlocks it. */
  async passkeys(): Promise<PasskeysResponse> {
    return this.authed<PasskeysResponse>('/account/passkeys', { method: 'GET' });
  }

  /** What `navigator.credentials.create` needs to make a passkey for the account; the page alone, with the owner's proof. */
  async passkeyOptions(proof: PasskeyOptionsRequest): Promise<PasskeyCreationOptions> {
    return this.authed<PasskeyCreationOptions>('/account/passkeys/options', { method: 'POST', body: JSON.stringify(proof) });
  }

  async addPasskey(body: AddPasskeyRequest): Promise<PasskeyView> {
    return this.authed<PasskeyView>('/account/passkeys', { method: 'POST', body: JSON.stringify(body) });
  }

  /** A challenge to prove the owner with one of the account's passkeys, where a change asks for the password. */
  async passkeyReauthOptions(): Promise<PasskeySignInOptions> {
    return this.authed<PasskeySignInOptions>('/account/passkeys/reauth', { method: 'POST', body: '{}' });
  }

  async renamePasskey(id: string, name: string): Promise<PasskeyView> {
    return this.authed<PasskeyView>(`/account/passkeys/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ name }) });
  }

  /** Lets a passkey open the root: the root wrapped under its answer, with proof of holding the root. */
  async setPasskeyUnlock(id: string, unlock: PasskeyUnlock): Promise<PasskeyView> {
    return this.authed<PasskeyView>(`/account/passkeys/${encodeURIComponent(id)}/wrap`, { method: 'PUT', body: JSON.stringify(unlock) });
  }

  async removePasskey(id: string): Promise<void> {
    await this.authed<void>(`/account/passkeys/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  /** The account's root and this product's key, as the server holds them. */
  async accountKeys(): Promise<AccountKeysResponse> {
    return this.authed<AccountKeysResponse>('/account/keys', { method: 'GET' });
  }

  async createRoot(body: CreateRootRequest): Promise<AccountKeysResponse> {
    return this.authed<AccountKeysResponse>('/account/keys/root', { method: 'POST', body: JSON.stringify(body) });
  }

  async setRootRecovery(body: SetRootRecoveryRequest): Promise<AccountKeysResponse> {
    return this.authed<AccountKeysResponse>('/account/keys/root/recovery', { method: 'PUT', body: JSON.stringify(body) });
  }

  /** A code to the account's address, for replacing the root with a forgotten password. */
  async requestRotateCode(): Promise<void> {
    await this.authed<{ sent: true }>('/account/keys/root/code', { method: 'POST', body: '{}' });
  }

  async rotateRoot(body: RotateRootRequest): Promise<AccountKeysResponse> {
    return this.authed<AccountKeysResponse>('/account/keys/root/rotate', { method: 'POST', body: JSON.stringify(body) });
  }

  async createBox(body: CreateBoxRequest): Promise<AccountKeysResponse> {
    return this.authed<AccountKeysResponse>('/account/keys/box', { method: 'POST', body: JSON.stringify(body) });
  }

  async replaceBox(body: ReplaceBoxRequest): Promise<AccountKeysResponse> {
    return this.authed<AccountKeysResponse>('/account/keys/box/replace', { method: 'POST', body: JSON.stringify(body) });
  }

  async updateBox(body: UpdateBoxRequest): Promise<AccountKeysResponse> {
    return this.authed<AccountKeysResponse>('/account/keys/box', { method: 'PUT', body: JSON.stringify(body) });
  }

  /** What the account held before it started over, as this product sees it. */
  async archives(): Promise<AccountArchive[]> {
    return (await this.authed<AccountArchivesResponse>('/account/archives', { method: 'GET' })).archives;
  }

  /** The archive's wraps under the old password or the old recovery key, for proof of it. */
  async openArchive(id: string, body: OpenArchiveRequest): Promise<OpenArchiveResponse> {
    return this.authed<OpenArchiveResponse>(`/account/archives/${encodeURIComponent(id)}/open`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /** A page of this product's archived records, after the `next` of the page before. */
  async archivedRecords(id: string, after = 0): Promise<ArchivedRecordsResponse> {
    return this.authed<ArchivedRecordsResponse>(`/account/archives/${encodeURIComponent(id)}/records?after=${after}`, {
      method: 'GET',
    });
  }

  async deleteArchive(id: string, body: DeleteArchiveRequest): Promise<void> {
    await this.authed<void>(`/account/archives/${encodeURIComponent(id)}`, { method: 'DELETE', body: JSON.stringify(body) });
  }

  /** The page gives an account that only Keyrook Authenticator has used its root, and Authenticator's key its box. */
  async consoleSetUpRoot(body: ConsoleRootRequest): Promise<ConsoleKeysResponse> {
    return this.authed<ConsoleKeysResponse>('/account/console/root', { method: 'POST', body: JSON.stringify(body) });
  }

  /** The kit's wrap, for a signed-in browser holding the recovery key. */
  async recoveryWrap(body: RecoveryWrapRequest): Promise<RecoverResponse> {
    return this.authed<RecoverResponse>('/account/recovery/wrap', { method: 'POST', body: JSON.stringify(body) });
  }

  // --- Joining by approval ----------------------------------------------------

  async requestPairing(body: PairingRequest): Promise<PairingCreated> {
    return this.authed<PairingCreated>('/pairing', { method: 'POST', body: JSON.stringify(body) });
  }

  async pairingStatus(id: string): Promise<PairingStatus> {
    return this.authed<PairingStatus>(`/pairing/${encodeURIComponent(id)}`, { method: 'GET' });
  }

  async openPairings(): Promise<PairingSummary[]> {
    return (await this.authed<PairingsResponse>('/pairing', { method: 'GET' })).pairings;
  }

  async acceptPairing(id: string, publicKey: string): Promise<void> {
    await this.authed<void>(`/pairing/${encodeURIComponent(id)}/accept`, {
      method: 'POST',
      body: JSON.stringify({ publicKey }),
    });
  }

  async approvePairing(id: string, wrap: SealedBox): Promise<void> {
    await this.authed<void>(`/pairing/${encodeURIComponent(id)}/approve`, {
      method: 'POST',
      body: JSON.stringify({ wrap }),
    });
  }

  async denyPairing(id: string): Promise<void> {
    await this.authed<void>(`/pairing/${encodeURIComponent(id)}/deny`, { method: 'POST', body: '{}' });
  }

  // --- Families ---------------------------------------------------------------

  async orgs(): Promise<OrgsResponse> {
    return this.authed<OrgsResponse>('/orgs', { method: 'GET' });
  }

  async createOrg(body: CreateOrgRequest): Promise<OrgDetail> {
    return this.authed<OrgDetail>('/orgs', { method: 'POST', body: JSON.stringify(body) });
  }

  async org(orgId: string): Promise<OrgDetail> {
    return this.authed<OrgDetail>(`/orgs/${encodeURIComponent(orgId)}`, { method: 'GET' });
  }

  async inviteToOrg(orgId: string, body: OrgInviteRequest): Promise<OrgInvite> {
    return this.authed<OrgInvite>(`/orgs/${encodeURIComponent(orgId)}/invites`, { method: 'POST', body: JSON.stringify(body) });
  }

  /** By an organiser, to take an invitation back; by the invited address, to decline it. */
  async cancelOrgInvite(orgId: string, inviteId: string): Promise<void> {
    await this.authed<void>(`/orgs/${encodeURIComponent(orgId)}/invites/${encodeURIComponent(inviteId)}`, { method: 'DELETE' });
  }

  async acceptOrgInvite(orgId: string, body: AcceptOrgInviteRequest): Promise<OrgDetail> {
    return this.authed<OrgDetail>(`/orgs/${encodeURIComponent(orgId)}/accept`, { method: 'POST', body: JSON.stringify(body) });
  }

  async verifyOrgMember(orgId: string, accountId: string, body: VerifyOrgMemberRequest): Promise<OrgDetail> {
    return this.authed<OrgDetail>(`/orgs/${encodeURIComponent(orgId)}/members/${encodeURIComponent(accountId)}/verify`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async confirmOrgMember(orgId: string, accountId: string, body: ConfirmOrgMemberRequest): Promise<OrgDetail> {
    return this.authed<OrgDetail>(`/orgs/${encodeURIComponent(orgId)}/members/${encodeURIComponent(accountId)}/confirm`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async putOrgRoster(orgId: string, roster: OrgRoster): Promise<OrgRoster> {
    return this.authed<OrgRoster>(`/orgs/${encodeURIComponent(orgId)}/roster`, { method: 'PUT', body: JSON.stringify(roster) });
  }

  /** By an organiser, with the owner's proof: the family and all it shares, for everyone. */
  async deleteOrg(orgId: string, proof: OwnerProofFields): Promise<void> {
    await this.authed<void>(`/orgs/${encodeURIComponent(orgId)}`, { method: 'DELETE', body: JSON.stringify(proof) });
  }

  /** By an organiser, to remove someone; by anyone, with their own account id, to leave. */
  async removeOrgMember(orgId: string, accountId: string): Promise<void> {
    await this.authed<void>(`/orgs/${encodeURIComponent(orgId)}/members/${encodeURIComponent(accountId)}`, { method: 'DELETE' });
  }

  async rotateOrg(orgId: string, body: RotateOrgRequest): Promise<OrgDetail> {
    return this.authed<OrgDetail>(`/orgs/${encodeURIComponent(orgId)}/rotate`, { method: 'POST', body: JSON.stringify(body) });
  }

  async setOrgRole(orgId: string, accountId: string, body: OrgRoleRequest): Promise<OrgDetail> {
    return this.authed<OrgDetail>(`/orgs/${encodeURIComponent(orgId)}/role/${encodeURIComponent(accountId)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async putOrgProductBox(orgId: string, product: string, body: OrgProductBoxRequest): Promise<void> {
    await this.authed<void>(`/orgs/${encodeURIComponent(orgId)}/me/boxes/${encodeURIComponent(product)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /** The caller's member key sealed again to the account's root, after the root was replaced where it could not be. */
  async putOrgPagePin(orgId: string, body: OrgProductBoxRequest): Promise<void> {
    await this.authed<void>(`/orgs/${encodeURIComponent(orgId)}/me/page-pin`, { method: 'PUT', body: JSON.stringify(body) });
  }

  async putOrgRootBox(orgId: string, body: OrgProductBoxRequest): Promise<void> {
    await this.authed<void>(`/orgs/${encodeURIComponent(orgId)}/me/root-box`, { method: 'PUT', body: JSON.stringify(body) });
  }

  async createCollection(orgId: string, body: CreateCollectionRequest): Promise<OrgDetail> {
    return this.authed<OrgDetail>(`/orgs/${encodeURIComponent(orgId)}/collections`, { method: 'POST', body: JSON.stringify(body) });
  }

  async renameCollection(orgId: string, collectionId: string, body: RenameCollectionRequest): Promise<OrgDetail> {
    return this.authed<OrgDetail>(collectionPath(orgId, collectionId), { method: 'PUT', body: JSON.stringify(body) });
  }

  /** Lets confirmed members into a collection. */
  async addCollectionKeys(orgId: string, collectionId: string, body: CollectionKeysRequest): Promise<OrgDetail> {
    return this.authed<OrgDetail>(`${collectionPath(orgId, collectionId)}/keys`, { method: 'POST', body: JSON.stringify(body) });
  }

  /** A new key for a collection; whoever held it and is given none is let out. */
  async rotateCollection(orgId: string, collectionId: string, body: RotateCollectionRequest): Promise<OrgDetail> {
    return this.authed<OrgDetail>(`${collectionPath(orgId, collectionId)}/rotate`, { method: 'POST', body: JSON.stringify(body) });
  }

  async deleteCollection(orgId: string, collectionId: string): Promise<void> {
    await this.authed<void>(collectionPath(orgId, collectionId), { method: 'DELETE' });
  }

  /** Names the caller's emergency contact, with their root sealed to them. */
  async setOrgEmergency(orgId: string, body: OrgEmergencyRequest): Promise<OrgDetail> {
    return this.authed<OrgDetail>(`/orgs/${encodeURIComponent(orgId)}/emergency`, { method: 'PUT', body: JSON.stringify(body) });
  }

  async withdrawOrgEmergency(orgId: string): Promise<void> {
    await this.authed<void>(`/orgs/${encodeURIComponent(orgId)}/emergency`, { method: 'DELETE' });
  }

  /** By the contact: starts the wait; the one who named them is mailed. */
  async requestOrgEmergency(orgId: string, grantorId: string): Promise<OrgDetail> {
    return this.authed<OrgDetail>(`/orgs/${encodeURIComponent(orgId)}/emergency/${encodeURIComponent(grantorId)}/request`, { method: 'POST', body: '{}' });
  }

  /** By the one who named a contact: ends their request. */
  async refuseOrgEmergency(orgId: string): Promise<OrgDetail> {
    return this.authed<OrgDetail>(`/orgs/${encodeURIComponent(orgId)}/emergency/refuse`, { method: 'POST', body: '{}' });
  }

  async orgEmergencyBox(orgId: string, grantorId: string): Promise<OrgEmergencyBox> {
    return this.authed<OrgEmergencyBox>(`/orgs/${encodeURIComponent(orgId)}/emergency/${encodeURIComponent(grantorId)}`, { method: 'GET' });
  }

  /** By an organiser: the next recovery key, to every organiser. */
  async turnOnOrgRecovery(orgId: string, body: OrgRecoveryOnRequest): Promise<OrgDetail> {
    return this.authed<OrgDetail>(`/orgs/${encodeURIComponent(orgId)}/recovery`, { method: 'POST', body: JSON.stringify(body) });
  }

  /** By an organiser: every root kept for them goes, and each member is told. */
  async turnOffOrgRecovery(orgId: string, body: OrgRecoveryOffRequest): Promise<OrgDetail> {
    return this.authed<OrgDetail>(`/orgs/${encodeURIComponent(orgId)}/recovery`, { method: 'DELETE', body: JSON.stringify(body) });
  }

  /** The caller's root, sealed by them to the recovery key in use. */
  async putOrgRecoveryBox(orgId: string, body: OrgRecoveryBoxRequest): Promise<OrgDetail> {
    return this.authed<OrgDetail>(`/orgs/${encodeURIComponent(orgId)}/me/recovery`, { method: 'PUT', body: JSON.stringify(body) });
  }

  async deleteOrgRecoveryBox(orgId: string): Promise<OrgDetail> {
    return this.authed<OrgDetail>(`/orgs/${encodeURIComponent(orgId)}/me/recovery`, { method: 'DELETE' });
  }

  /** By an organiser answering a request: the member's root, sealed to the recovery key. The member is mailed. */
  async orgRecoveryBox(orgId: string, requestId: string): Promise<OrgRecoveryBoxResponse> {
    return this.authed<OrgRecoveryBoxResponse>(`/orgs/${encodeURIComponent(orgId)}/recovery/requests/${encodeURIComponent(requestId)}/box`, {
      method: 'POST',
      body: '{}',
    });
  }

  async handOverOrgRecovery(orgId: string, requestId: string, body: OrgRecoveryHandoverRequest): Promise<void> {
    await this.authed<void>(`/orgs/${encodeURIComponent(orgId)}/recovery/requests/${encodeURIComponent(requestId)}/handover`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async orgPull(orgId: string, since: number, collectionId?: string): Promise<OrgPullResponse> {
    const only = collectionId === undefined ? '' : `&collection=${encodeURIComponent(collectionId)}`;
    return this.authed<OrgPullResponse>(`/orgs/${encodeURIComponent(orgId)}/sync?since=${since}${only}`, { method: 'GET' });
  }

  async orgPush(orgId: string, records: OrgRecord[]): Promise<OrgPushResponse> {
    return this.authed<OrgPushResponse>(`/orgs/${encodeURIComponent(orgId)}/sync`, {
      method: 'POST',
      body: JSON.stringify({ records } satisfies OrgPushRequest),
    });
  }

  // --- The account page -------------------------------------------------------

  async consoleSummary(): Promise<ConsoleSummary> {
    return this.authed<ConsoleSummary>('/account/console', { method: 'GET' });
  }

  async consoleKeys(): Promise<ConsoleKeysResponse> {
    return this.authed<ConsoleKeysResponse>('/account/console/keys', { method: 'GET' });
  }

  async consoleRotate(body: ConsoleRotateRequest): Promise<ConsoleKeysResponse> {
    return this.authed<ConsoleKeysResponse>('/account/console/rotate', { method: 'POST', body: JSON.stringify(body) });
  }

  async consolePins(body: ConsolePinsRequest): Promise<ConsoleKeysResponse> {
    return this.authed<ConsoleKeysResponse>('/account/console/pins', { method: 'PUT', body: JSON.stringify(body) });
  }

  // --- Approving the account page ---------------------------------------------

  /** The request whose code the person typed, to show where it came from before they approve it. */
  async findConsoleRequest(code: string): Promise<ConsoleRequestFound> {
    return this.authed<ConsoleRequestFound>('/console/requests/find', { method: 'POST', body: JSON.stringify({ code }) });
  }

  async approveConsoleRequest(id: string): Promise<void> {
    await this.authed<void>(`/console/requests/${encodeURIComponent(id)}/approve`, { method: 'POST', body: '{}' });
  }

  async denyConsoleRequest(id: string): Promise<void> {
    await this.authed<void>(`/console/requests/${encodeURIComponent(id)}/deny`, { method: 'POST', body: '{}' });
  }

  // --- Records ----------------------------------------------------------------

  async pull(sinceServerRev: number): Promise<PullResult> {
    const body = await this.authed<PullResponse>(`/sync?since=${sinceServerRev}`, {
      method: 'GET',
    });
    return {
      records: body.records,
      serverRev: body.serverRev,
      hasMore: body.hasMore,
      ...(body.recovery ? { recovery: body.recovery } : {}),
      ...(typeof body.epoch === 'string' ? { epoch: body.epoch } : {}),
    };
  }

  async push(records: RemoteRecord[], baseServerRev = 0): Promise<PushResult> {
    if (records.length === 0) {
      const head = await this.pull(baseServerRev);
      return { accepted: [], conflicts: [], serverRev: head.serverRev };
    }

    const body = await this.authed<PushResponse>('/sync', {
      method: 'POST',
      body: JSON.stringify({ records, baseServerRev } satisfies PushRequest),
    });

    return {
      accepted: body.accepted,
      conflicts: body.conflicts,
      serverRev: body.serverRev,
      ...(body.rejectedForLimit ? { rejectedForLimit: body.rejectedForLimit } : {}),
    };
  }
}

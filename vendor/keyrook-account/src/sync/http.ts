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
  SignInProvider,
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
  DeviceSummary,
  DevicesResponse,
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
} from './protocol.js';

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
  constructor(
    readonly status: number,
    readonly code: SyncErrorCode | 'network',
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
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

/** Starts the account over with new keys; what it held is kept, sealed, for 90 days. */
export function startOver(baseUrl: string, body: StartOverRequest, fetcher: Fetcher = fetch): Promise<LoginResponse> {
  return request<LoginResponse>(baseUrl, '/auth/start-over', { method: 'POST', body: JSON.stringify(body) }, fetcher);
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
}

export async function signInOptions(baseUrl: string, fetcher: Fetcher = fetch): Promise<SignInOptions> {
  const { providers, returnBy } = await request<{ providers: string[]; returnBy?: string[] }>(
    baseUrl,
    '/providers',
    { method: 'GET' },
    fetcher,
  );
  return {
    providers: providers.filter((name): name is SignInProvider => name === 'google' || name === 'github'),
    byMessage: Array.isArray(returnBy) && returnBy.includes('message'),
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

  async revokeDevice(id: string): Promise<void> {
    await this.authed<void>(`/account/devices/${encodeURIComponent(id)}`, { method: 'DELETE' });
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

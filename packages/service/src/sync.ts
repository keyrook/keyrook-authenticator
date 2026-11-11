/**
 * Account and sync handling for the service worker.
 *
 * Kept out of `index.ts` so the message router stays readable, and because
 * everything here is about one question: which data key is this vault using,
 * and does the server agree?
 *
 * One rule holds everything together: a signed-in vault either opens with the
 * device key, or with the account password — never with a third password.
 * Every path that changes one password changes the other in the same step, or
 * refuses. Letting them drift is how a user ends up on a new laptop typing a
 * password that no longer exists anywhere but on their old one.
 *
 * How a device opens is its own choice and survives signing in: the account
 * password is for new devices and for changes to the account, not for every
 * glance at a code.
 */
import {
  accountPasswordProblem,
  adoptDataKey,
  assertAcceptableAccountKdf,
  DecryptionError,
  deviceKeyring,
  deriveAccountKeys,
  deriveKeyCheck,
  deriveRecoveryAuthHash,
  AUTHENTICATOR,
  HttpSyncAdapter,
  namedClient,
  logout,
  newAccountKdfParams,
  passphraseKeyring,
  prelogin,
  recover,
  recoverReset,
  register,
  sealRecoveryState,
  startRegistration,
  sealVault,
  SyncHttpError,
  syncOnce,
  unwrapDataKey,
  unwrapRecoveryWrap,
  updateAccount,
  verifyPassword,
  wrapDataKey,
  beginLogin,
  needsSecondStep,
  type AccountKdfParams,
  type AccountRecoveryState,
  type DeviceSummary,
  type SecondStepProof,
  type Fetcher,
  type TokenStore,
  type Tokens,
  type Keyring,
  type LoginResponse,
  type OwnerProof,
  type RecoveryWrap,
  type UnlockedVault,
  type VaultData,
  type VaultFile,
  checkDeviceRemovalProof,
  keepOnlyUnsent,
  makeDeviceRemovalProof,
} from '@authx/core';
import { markReplacementDue, openAccountKey, previousKeys, settleKeys } from './keys.js';
import { platform, syncEnabled } from './platform.js';
import { sessionStart, tokenStore } from './tokens.js';
import type { RemovedNotice, SecondStepAnswer, SecondStepAsked, SyncSummary } from '@authx/ui/lib/protocol.js';
import { finishSignInStep } from './second-step.js';
import { AppError, fail } from '@authx/ui/i18n/errors.js';

/** The product every request is made for, and whose records and key are this app's. */
export const PRODUCT = AUTHENTICATOR;

/**
 * Every request to the server, naming this build (`authenticator/0.4.0`). The
 * global `fetch` is looked up on each call, not once: a test may put another
 * in its place.
 */
export function serverFetch(): Fetcher {
  const { fetch: own, clientName = PRODUCT, clientVersion, accountDataAllowed } = platform();
  const named = namedClient(own ?? ((input, init) => fetch(input, init)), `${clientName}/${clientVersion}`);
  if (!accountDataAllowed) return named;
  // Every request, not only the first: Firefox's consent can be taken back in
  // about:addons while the vault is signed in, and the next sync must then
  // send nothing. The account client reports a refusal here as a failure to
  // reach the server, keeping this as its cause; `handle` says it as it is.
  return async (input, init) => {
    if (!(await accountDataAllowed())) fail('error.accountData.withheld');
    return named(input, init);
  };
}

/**
 * The refusal above, out from under the account client's "could not reach
 * the server" that wraps whatever its fetcher throws; null for anything else.
 */
export function withheldCause(error: unknown): AppError | null {
  const cause = error instanceof Error ? error.cause : undefined;
  return cause instanceof AppError && cause.key === 'error.accountData.withheld' ? cause : null;
}

/** Whether anything may be sent to the account now; always, where the platform does not ask. */
export async function accountDataAllowed(): Promise<boolean> {
  const ask = platform().accountDataAllowed;
  return !ask || (await ask());
}

export function adapter(): HttpSyncAdapter {
  if (!syncEnabled()) fail('error.syncUnavailable');
  return new HttpSyncAdapter({ baseUrl: platform().syncApiUrl, tokens: tokenStore, fetcher: serverFetch() });
}

/** Whether this vault is signed in to an account. */
export function isSignedIn(data: VaultData): data is VaultData & { account: { email: string } } {
  return Boolean(data.account.email) && data.account.plan === 'synced';
}

/**
 * Signed in to an account that has a password. A Google or GitHub account has
 * none, so this vault's master password, if any, is its own business there.
 */
export function hasAccountPassword(data: VaultData): data is VaultData & { account: { email: string } } {
  return isSignedIn(data) && data.account.method !== 'provider';
}

function assertStrongEnough(password: string): void {
  const problem = accountPasswordProblem(password);
  if (problem) fail('error.accountPasswordWeak');
}

/**
 * The account's current keys for a password. The KDF parameters come from the
 * server before anything is authenticated, so they are checked, not trusted.
 */
async function accountKeysFor(email: string, password: string) {
  const kdf = await prelogin(platform().syncApiUrl, email, serverFetch());
  assertAcceptableAccountKdf(kdf);
  return { kdf, keys: await deriveAccountKeys(password, kdf) };
}

/** Proof of the account password, for the changes that need it. */
export async function accountAuthHash(data: VaultData, password: string): Promise<string> {
  if (!isSignedIn(data)) fail('error.notSignedIn');
  return (await accountKeysFor(data.account.email, password)).keys.authHash;
}

/**
 * Checks a password against the account by signing this device in again with
 * it — which also gives it a fresh session. Used when a device-key vault starts
 * locking with the account password, so a typo cannot become a third password.
 */
export async function proveAccountPassword(data: VaultData, password: string): Promise<void> {
  if (!isSignedIn(data)) fail('error.notSignedIn');
  const { keys } = await accountKeysFor(data.account.email, password);
  try {
    const answer = await beginLogin(
      platform().syncApiUrl,
      { email: data.account.email, authHash: keys.authHash, deviceId: data.sync.deviceId, deviceName: deviceName() },
      serverFetch(),
    );
    // The server asks for the second step only once the password is right:
    // proof enough, and the session this device has goes on.
    if (needsSecondStep(answer)) return;
    await storeSession(answer);
  } catch (error) {
    if (error instanceof SyncHttpError && error.code === 'invalid_credentials') {
      fail('error.lockOnlyWithAccountPassword');
    }
    throw error;
  }
}

/**
 * The keyring a vault should keep after adopting the account's data key: the
 * device key if it opened without a password before, the account password if
 * it had one. Joining an account does not change how a device opens.
 */
async function keyringKeepingMode(
  file: VaultFile,
  password: string,
  kdf: AccountKdfParams,
): Promise<Keyring> {
  return file.protection.mode === 'device'
    ? deviceKeyring(await platform().deviceKey.getOrCreate())
    : passphraseKeyring(password, kdf);
}

/**
 * Everything a device knows locally becomes an unsynced change to push, and it
 * forgets which account kit it had seen: a vault that has just joined or
 * created an account has seen none of that account's kits yet.
 *
 * Except removals. A tombstone here was made while this browser belonged to
 * no account — signed out, or never signed in — and sent now it would win
 * over the account's copy and delete it on every device: sign out, tidy this
 * browser, sign back in, and the account has lost those codes everywhere. At
 * revision 0 it is never sent, and whatever the account still holds replaces
 * it; one the account never had stays in Recently deleted, and restoring it
 * makes it an ordinary change again.
 */
export function markEverythingPending(data: VaultData, email: string): VaultData {
  return updateAccount(
    {
      ...data,
      items: data.items.map((item) =>
        item.deletedAt === null ? { ...item, syncedRev: 0 } : { ...item, rev: 0, syncedRev: 0 },
      ),
      sync: { ...data.sync, serverRev: 0, lastSyncAt: null, recoveryAt: 0, epoch: undefined },
    },
    // A password account unless the caller says otherwise: a vault once
    // signed in with Google and now with a password must not keep the old way.
    { email, plan: 'synced', method: 'password', provider: undefined },
  );
}

/** A session's tokens, held here until the sign-in they belong to is done. */
export function memoryTokens(session: Pick<LoginResponse, 'accessToken' | 'refreshToken'>): TokenStore {
  let current: Tokens | null = { accessToken: session.accessToken, refreshToken: session.refreshToken };
  return {
    get: async () => current,
    set: async (tokens) => {
      current = tokens;
    },
    clear: async () => {
      current = null;
    },
  };
}

/**
 * Keeps a new session. Every sign-in ends here, and no refresh does: the time
 * written is when this session began, which a removal proof made before it
 * cannot claim (`checkDeviceRemovalProof`).
 */
export async function storeSession(session: Pick<LoginResponse, 'accessToken' | 'refreshToken' | 'account'>) {
  await tokenStore.set({ accessToken: session.accessToken, refreshToken: session.refreshToken });
  await sessionStart.set({ accountId: session.account.id, signedInAt: Date.now() });
  await platform().disk.remove(REMOVED_KEY);
}

/**
 * Create the account from this device, in one step from either mode.
 *
 * A vault with a master password uses it: it becomes the account password, so
 * there is still only one. A vault that opens with the device key keeps doing
 * so, and the password chosen here is the account's alone — needed on a new
 * device and for changes to the account, not to open this one.
 *
 * The local data key becomes the account's, wrapped under a key derived from
 * the password, so nothing is re-encrypted.
 */
/**
 * Whether this password may become this vault's account password. Checked
 * before a code is sent, so nobody waits for an email only to be told the
 * password was never going to do, and again when the account is made.
 */
async function assertCanSignUpWith(unlocked: UnlockedVault, password: string): Promise<void> {
  if (unlocked.file.protection.mode === 'passphrase') {
    if (!(await verifyPassword(unlocked.file, password))) {
      fail('error.signupWrongMasterPassword');
    }
    if (accountPasswordProblem(password)) {
      fail('error.masterPasswordTooWeakForAccount');
    }
  } else {
    assertStrongEnough(password);
  }
}

/**
 * Step one of signing up: the password is checked here, then a code goes to
 * the address. The server answers the same whether or not the address already
 * has an account — the email says which — so this cannot be used to find out.
 */
export async function prepareSignUp(
  unlocked: UnlockedVault,
  email: string,
  password: string,
): Promise<void> {
  await assertCanSignUpWith(unlocked, password);
  await startRegistration(platform().syncApiUrl, email, serverFetch());
}

export async function signUp(
  unlocked: UnlockedVault,
  email: string,
  password: string,
  code: string,
): Promise<{ file: typeof unlocked.file; data: VaultData; authHash: string }> {
  await assertCanSignUpWith(unlocked, password);

  const kdf = newAccountKdfParams();
  const keys = await deriveAccountKeys(password, kdf);

  // Registering issues the session; there is no need to sign in a second time.
  await storeSession(
    await register(
      platform().syncApiUrl,
      {
        email,
        code,
        authHash: keys.authHash,
        kdf,
        protectedKey: await wrapDataKey(keys.stretchedKey, unlocked.dataKey),
        keyCheck: await deriveKeyCheck(unlocked.dataKey),
        deviceId: unlocked.data.sync.deviceId,
        deviceName: deviceName(),
      },
      serverFetch(),
    ),
  );

  const data = markEverythingPending(unlocked.data, email);
  return {
    file: await sealVault(unlocked.file, unlocked.dataKey, data),
    data,
    authHash: keys.authHash,
  };
}

/**
 * Join an existing account.
 *
 * The account already has a data key and every device must converge on it, so
 * this one re-encrypts: the local payload is re-sealed under the account key.
 * A device that opened with its own key still does; one with a master password
 * now uses the account password, so there is only ever one. Anything already
 * on this device is marked unsynced so the next cycle uploads it rather than
 * losing it. The account's recovery kit arrives with the first pull.
 */
export async function signIn(
  unlocked: UnlockedVault,
  email: string,
  password: string,
  secondStep?: { ticket: string; answer: SecondStepAnswer },
): Promise<{ file: typeof unlocked.file; dataKey: CryptoKey; data: VaultData } | SecondStepAsked> {
  const { kdf, keys } = await accountKeysFor(email, password);
  // On an account with a second step the first answer is a ticket, and the
  // page comes back with the password and the answer: only the password opens
  // the key, and a service worker may be stopped while the code is typed.
  const answer = secondStep
    ? await finishSignInStep(secondStep.ticket, secondStep.answer)
    : await beginLogin(
        platform().syncApiUrl,
        { email, authHash: keys.authHash, deviceId: unlocked.data.sync.deviceId, deviceName: deviceName() },
        serverFetch(),
      );
  if (needsSecondStep(answer)) return { secondStep: answer.secondStep };
  const session = answer;
  // The session is kept only once the key has opened: a sign-in that cannot
  // reach the key must not leave this device looking signed in without one.
  const tokens = memoryTokens(session);
  const opened = await openAccountKey(
    new HttpSyncAdapter({ baseUrl: platform().syncApiUrl, tokens, fetcher: serverFetch() }),
    { session, keys, localKey: unlocked.dataKey, ...(unlocked.data.account.keys ? { pinned: unlocked.data.account.keys } : {}) },
  );
  await storeSession({ ...(await tokens.get())!, account: session.account });
  await markReplacementDue(opened.mustReplace);
  const accountDataKey = opened.dataKey;
  const data = updateAccount(markEverythingPending(unlocked.data, email), { keys: opened.keys });

  return {
    file: await adoptDataKey(
      unlocked.file,
      await keyringKeepingMode(unlocked.file, password, kdf),
      accountDataKey,
      data,
    ),
    dataKey: accountDataKey,
    data,
  };
}

/**
 * Sets a new account password through the recovery kit, given the data key the
 * kit opened. Signs this device in; every other session ends.
 */
async function resetThroughKit(
  email: string,
  recoveryKey: string,
  dataKey: CryptoKey,
  deviceId: string,
  password: string,
) {
  const kdf = newAccountKdfParams();
  const keys = await deriveAccountKeys(password, kdf);
  const session = await recoverReset(
    platform().syncApiUrl,
    {
      email,
      recoveryAuthHash: await deriveRecoveryAuthHash(recoveryKey),
      keyCheck: await deriveKeyCheck(dataKey),
      authHash: keys.authHash,
      kdf,
      protectedKey: await wrapDataKey(keys.stretchedKey, dataKey),
      deviceId,
      deviceName: deviceName(),
    },
    serverFetch(),
  );
  await storeSession(session);
  return kdf;
}

/** The server's refusal of a reset through this app's kit, on an account with a root. */
const RESETS_THROUGH_ROOT = 'An account with a root resets its password through the root.';

/**
 * Recover an account with nothing but its recovery key, from this device.
 *
 * For the case the kit exists for: every device that had the vault is gone,
 * and so is the password. Like joining, this device adopts the account's key.
 *
 * This is the way back for an account only this app uses, which has no root:
 * the account page resets a password through the root, and refuses this kit
 * because it opens this app's key. So it stays here, whatever else moved there.
 */
export async function recoverAccount(
  unlocked: UnlockedVault,
  email: string,
  recoveryKey: string,
  password: string,
): Promise<{ file: typeof unlocked.file; dataKey: CryptoKey; data: VaultData }> {
  assertStrongEnough(password);

  const { wrap } = await recover(
    platform().syncApiUrl,
    { email, recoveryAuthHash: await deriveRecoveryAuthHash(recoveryKey) },
    serverFetch(),
  );
  let dataKey: CryptoKey;
  try {
    dataKey = await unwrapRecoveryWrap(wrap, recoveryKey);
  } catch (error) {
    if (error instanceof DecryptionError) fail('error.recoveryKeyWrong');
    throw error;
  }

  let kdf: AccountKdfParams;
  try {
    kdf = await resetThroughKit(email, recoveryKey, dataKey, unlocked.data.sync.deviceId, password);
  } catch (error) {
    // An account another Keyrook app uses has a root, and a new password has
    // to wrap it too — which only its own recovery flow does, on the account
    // page. This kit still opened, so the person holds the right sheet.
    if (error instanceof SyncHttpError && error.status === 400 && error.message === RESETS_THROUGH_ROOT) {
      fail('error.recoverOnAccountPage');
    }
    throw error;
  }
  const data = markEverythingPending(unlocked.data, email);
  return {
    file: await adoptDataKey(unlocked.file, await keyringKeepingMode(unlocked.file, password, kdf), dataKey, data),
    dataKey,
    data,
  };
}

/**
 * After a local recovery on a signed-in vault: bring the account along, so the
 * new password works everywhere. Only possible when the kit used is also the
 * account's; returns false when it is not, and the caller signs the device out
 * rather than leave the two passwords apart.
 */
export async function followLocalRecovery(
  data: VaultData,
  recoveryKey: string,
  dataKey: CryptoKey,
  password: string,
): Promise<boolean> {
  if (!isSignedIn(data)) return true;
  try {
    await resetThroughKit(data.account.email, recoveryKey, dataKey, data.sync.deviceId, password);
    return true;
  } catch {
    return false;
  }
}

/**
 * Change the account password along with the vault's. The server checks the
 * current one — a session token alone must never be enough — and signs every
 * other device out, so each re-wraps its own vault under the new password when
 * it signs back in.
 */
export async function changeAccountPassword(
  unlocked: UnlockedVault,
  currentPassword: string,
  nextPassword: string,
): Promise<void> {
  if (!isSignedIn(unlocked.data)) return;
  assertStrongEnough(nextPassword);

  const current = await accountKeysFor(unlocked.data.account.email, currentPassword);
  const kdf = newAccountKdfParams();
  const next = await deriveAccountKeys(nextPassword, kdf);

  try {
    await adapter().changePassword({
      currentAuthHash: current.keys.authHash,
      authHash: next.authHash,
      kdf,
      protectedKey: await wrapDataKey(next.stretchedKey, unlocked.dataKey),
    });
  } catch (error) {
    if (error instanceof SyncHttpError && error.code === 'forbidden') {
      // The vault accepted this password a moment ago, so the account has a
      // different one. Say which half disagrees.
      fail('error.passwordsDiverged');
    }
    throw error;
  }
}

/**
 * Refuses unless this app's kit is still the account's recovery key, which it
 * is only while the account has no root. Once another Keyrook app gives it
 * one, the printed sheet opens the root and is made on the account page; a kit
 * issued here then would leave two sheets, and the one printed last opening
 * only this app. The account page, for its part, sends an account without a
 * root back here to make its recovery key.
 */
export async function assertKitIsAccounts(data: VaultData): Promise<void> {
  if (data.account.keys || (await adapter().accountKeys()).root) fail('error.kitOnAccountPage');
}

/** The server's refusals of an owner's second step, which the page answers apart from a wrong password. */
const SECOND_STEP_MISSING = 'Enter the code from your authenticator app too.';
const SECOND_STEP_WRONG = 'That code is not right. Enter the one your authenticator app shows now.';

/**
 * Sets the account's recovery kit to match this device's, or removes it. Needs
 * the account password as well as the data key: anyone at an unlocked vault
 * holds the key, and a kit they issued would let them reset the account.
 */
export async function publishRecovery(
  dataKey: CryptoKey,
  proof: OwnerProof,
  wrap: RecoveryWrap | null,
  recoveryKey: string | null,
  issuedAt: number,
  /** On an account with a second step, beside the password or the sign-in. */
  secondStep?: SecondStepProof,
): Promise<AccountRecoveryState> {
  const state: AccountRecoveryState = { wrap, issuedAt };
  try {
    await adapter().setRecovery({
      ...proof,
      ...(secondStep ? { secondStep } : {}),
      keyCheck: await deriveKeyCheck(dataKey),
      issuedAt,
      state: await sealRecoveryState(dataKey, state),
      wrap,
      recoveryAuthHash: recoveryKey ? await deriveRecoveryAuthHash(recoveryKey) : null,
    });
  } catch (error) {
    if (error instanceof SyncHttpError && error.code === 'stale_revision') {
      fail('error.kitRace');
    }
    if (error instanceof SyncHttpError && error.code === 'forbidden') {
      // Asked for before the password is even checked: the page asks for it.
      if (error.message === SECOND_STEP_MISSING) fail('error.secondStep.missing');
      // A wrong code, and a provider account's refusal, are the server's own
      // sentences, which the page translates.
      if ('authHash' in proof && error.message !== SECOND_STEP_WRONG) fail('error.accountPasswordWrong');
      throw new Error(error.message);
    }
    throw error;
  }
  return state;
}

export async function runSync(unlocked: UnlockedVault): Promise<{
  data: VaultData;
  summary: SyncSummary;
  recovery?: AccountRecoveryState;
}> {
  const outcome = await syncOnce(unlocked.data, {
    adapter: adapter(),
    dataKey: unlocked.dataKey,
    previousKeys: await previousKeys(unlocked.data),
  });

  return {
    data: settleKeys(outcome.data),
    summary: {
      pulled: outcome.pulled,
      pushed: outcome.pushed,
      conflicts: outcome.conflicts,
      rejectedForLimit: outcome.rejectedForLimit,
      rejectedRecords: outcome.rejectedRecords,
      deleted: outcome.deleted,
      at: Date.now(),
    },
    ...(outcome.recovery ? { recovery: outcome.recovery } : {}),
  };
}

export function listDevices(): Promise<DeviceSummary[]> {
  return adapter().devices();
}



/**
 * Deletes the account and everything it stored. The local vault stays. Takes
 * the password, or on a provider account a fresh sign-in with the provider.
 */
export async function deleteAccount(data: VaultData, proof: OwnerProof): Promise<VaultData> {
  if (!isSignedIn(data)) fail('error.notSignedIn');
  try {
    await adapter().deleteAccount(proof);
  } catch (error) {
    if (error instanceof SyncHttpError && error.code === 'forbidden') {
      // A provider account's refusal is the server's own sentence, which
      // the page translates.
      if ('authHash' in proof) fail('error.accountPasswordWrong');
      throw new Error(error.message);
    }
    throw error;
  }
  await tokenStore.clear();
  return forgetAccount(data);
}

/**
 * Signing out ends the session and takes the account's codes off this
 * browser: they live in the account, and signing in again brings them back.
 * The caller has made sure nothing here is still waiting to be sent, so
 * nothing is lost. The vault itself stays — how it opens, its settings, its
 * key — which is what lets a browser signed out by its owner resume with a
 * provider sign-in instead of waiting for another browser's approval.
 */
export async function signOut(data: VaultData): Promise<VaultData> {
  await endSession();
  return { ...forgetAccount(data), items: [] };
}

/** Ends this browser's session on the server, if it has one, and forgets it. */
export async function endSession(): Promise<void> {
  const tokens = await tokenStore.get();
  if (tokens) {
    // Best effort, and briefly: signing out has to work offline, and a server
    // that hangs must not hold the button hostage.
    const named = serverFetch();
    await logout(platform().syncApiUrl, tokens.refreshToken, (input, init) =>
      named(input, { ...init, signal: AbortSignal.timeout(5_000) }),
    ).catch(() => undefined);
  }
  await tokenStore.clear();
}

function forgetAccount(data: VaultData): VaultData {
  return updateAccount(
    { ...data, sync: { ...data.sync, serverRev: 0, lastSyncAt: null, recoveryAt: 0, epoch: undefined } },
    { email: null, plan: 'local', method: undefined, provider: undefined },
  );
}

/**
 * The server ended this device's session — the password changed elsewhere, or
 * the device was removed from the list without a proof this device could
 * check. The email stays so the sign-in form can say which account and offer
 * it back.
 */
export async function markSignedOutElsewhere(data: VaultData): Promise<VaultData> {
  await tokenStore.clear();
  return updateAccount(
    { ...data, sync: { ...data.sync, serverRev: 0, lastSyncAt: null, recoveryAt: 0, epoch: undefined } },
    { plan: 'local' },
  );
}

/**
 * What the popup and the Sync page say after this browser was removed from
 * the account, until the person closes it: when, and whether anything of this
 * browser's own stayed. Plaintext on purpose — nothing in it is secret, and it
 * is read with the vault locked.
 */
const REMOVED_KEY = 'authx.removed';

/**
 * The server says the account's owner removed this device. Believed only with
 * a proof made by a holder of this app's key, for this account, this device
 * and this session (`checkDeviceRemovalProof`): then the account's codes come
 * off, as on Sign out, and what the account never received stays. Without one
 * — none sent, a stale one, another key's — null, and the caller ends the
 * session as for any other reason: a server that could order this on its own
 * could empty every device at once.
 */
export async function endedByRemoval(unlocked: UnlockedVault, proof: unknown): Promise<VaultData | null> {
  const start = await sessionStart.get();
  // Signed in before this build and not asked since: nothing to check against.
  if (!start) return null;
  const removed = await checkDeviceRemovalProof(
    unlocked.dataKey,
    { accountId: start.accountId, product: PRODUCT, deviceId: unlocked.data.sync.deviceId, signedInAt: start.signedInAt },
    proof,
  ).catch(() => false);
  if (!removed) return null;
  await tokenStore.clear();
  const data = forgetAccount(keepOnlyUnsent(unlocked.data));
  const notice: RemovedNotice = { at: Date.now(), kept: data.items.length > 0 };
  await platform().disk.set(REMOVED_KEY, notice);
  return data;
}

export async function removedNotice(): Promise<RemovedNotice | null> {
  return ((await platform().disk.get(REMOVED_KEY)) as RemovedNotice | undefined) ?? null;
}

export async function dismissRemovedNotice(): Promise<void> {
  await platform().disk.remove(REMOVED_KEY);
}

/**
 * Notes which account a session from before this build belongs to, and takes
 * now as its start, the first time the account is asked about: from then on a
 * removal can be checked. The id is the server's word, which costs nothing if
 * false — a proof for the real account then fails, and the codes stay.
 */
export async function noteSessionAccount(accountId: string): Promise<void> {
  if (!(await sessionStart.get())) await sessionStart.set({ accountId, signedInAt: Date.now() });
}

/**
 * Removes a device from the account. One of this app's gets a proof made with
 * this vault's key, so it takes the account's codes off itself when it hears;
 * another product's is only signed out, since its key is not this app's.
 */
export async function revokeDevice(unlocked: UnlockedVault, id: string): Promise<void> {
  const api = adapter();
  const device = (await api.devices()).find((each) => each.id === id);
  if (device?.product !== PRODUCT || !device.deviceId) return api.revokeDevice(id);
  const accountId = (await sessionStart.get())?.accountId ?? (await api.accountKeys()).accountId;
  const proof = await makeDeviceRemovalProof(unlocked.dataKey, { accountId, product: PRODUCT, deviceId: device.deviceId });
  return api.revokeDevice(id, proof);
}

/** How this device is listed among the account's. */
export const deviceName = (): string => platform().deviceName();

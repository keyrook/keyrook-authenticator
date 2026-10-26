/**
 * Signing in to the Keyrook account with one of its passkeys, from the vault
 * service's side. The passkeys belong to the account's page; a page of this
 * app touches one (`Host.accountPasskeys`) and hands the answer here with the
 * PRF answer apart. The server gets what it checks of the answer
 * (`signInWithPasskey` sends `passkeyCredential` of it), never the PRF answer:
 * that opens the account's root here, and the root this app's key, as the
 * password does. The design is keyrook-account's docs/console.md, S17.
 *
 * Narrower than the password, on purpose:
 *
 * - Only a vault that opens with the device key, and goes on doing so. A vault
 *   with a master password makes it the account's password when it signs in —
 *   one password, never a third — and taking the account's key means sealing
 *   the vault again under that password. A touch can do neither.
 * - Only this app's key already on the account. Without one, a password
 *   sign-in seals the key every build before 0.4 used, which only the password
 *   opens; a passkey could only seal this vault's own, and every record
 *   already synced under the other would stop opening.
 *
 * Anything else ends the session the passkey began, and the person signs in
 * another way: the page falls back to the password, or to Google or GitHub.
 */
import {
  adoptDataKey,
  deviceKeyring,
  fromBase64,
  HttpSyncAdapter,
  logout,
  openProductKey,
  passkeySignInOptions,
  signInWithPasskey,
  updateAccount,
  type AccountRoot,
  type LoginResponse,
  type PasskeySignInOptions,
  type SignInProvider,
  type TokenStore,
  type UnlockedVault,
  type VaultData,
  type VaultFile,
} from '@authx/core';
import { fail } from '@authx/ui/i18n/errors.js';
import type { PasskeyTouchSent } from '@authx/ui/lib/protocol.js';
import { keyStateOf, markReplacementDue } from './keys.js';
import { platform, syncEnabled } from './platform.js';
import { deviceName, markEverythingPending, memoryTokens, PRODUCT, serverFetch, storeSession } from './sync.js';

/** A challenge to sign in with, from the server, for this extension's origin. */
export function passkeyChallenge(): Promise<PasskeySignInOptions> {
  if (!syncEnabled()) fail('error.syncUnavailable');
  return passkeySignInOptions(platform().syncApiUrl, serverFetch());
}

/** Thrown in place of making this app's key: a passkey opens the one on the account, or nothing. */
class NoKeyToOpen extends Error {}

/**
 * Talks to the server as any session does, but never makes this app's key on
 * the account: `openProductKey` would, finding none, and only the password
 * knows which key that must be.
 */
class OpeningOnly extends HttpSyncAdapter {
  override createBox(): Promise<never> {
    return Promise.reject(new NoKeyToOpen());
  }
}

/** The 32 bytes a passkey's PRF answered, or null for one that answered nothing that could unlock. */
function prfOf(prf: unknown): Uint8Array | null {
  if (typeof prf !== 'string') return null;
  try {
    const bytes = fromBase64(prf);
    return bytes.length === 32 ? bytes : null;
  } catch {
    return null;
  }
}

/** What a page sent, checked for shape: the service is the vault's writer, and trusts no page's word for that. */
function assertTouch(touch: PasskeyTouchSent): void {
  const answer = touch?.answer as Partial<PasskeyTouchSent['answer']> | undefined;
  if (
    typeof touch?.challengeId !== 'string' ||
    typeof answer?.id !== 'string' ||
    typeof answer.rawId !== 'string' ||
    typeof answer.response !== 'object' ||
    answer.response === null
  ) {
    fail('error.passkey.unchecked');
  }
}

/** The way back for an account this passkey cannot open here: its password, or its provider. */
function refuse(session: LoginResponse): never {
  const email = session.account.email;
  fail(session.account.method === 'provider' ? 'error.passkey.noUnlockProvider' : 'error.passkey.noUnlock', { email });
}

/** Ends a session this sign-in began and cannot use, briefly and at best: the refusal is what the person needs. */
async function endUnused(tokens: TokenStore): Promise<void> {
  const held = await tokens.get();
  if (!held) return;
  const named = serverFetch();
  await logout(platform().syncApiUrl, held.refreshToken, (input, init) =>
    named(input, { ...init, signal: AbortSignal.timeout(5_000) }),
  ).catch(() => undefined);
}

/**
 * This app's key on the account, opened with the root the passkey's PRF
 * answer opened. Throws, after ending the session, whatever does not open it.
 */
async function openWithRoot(
  unlocked: UnlockedVault,
  session: LoginResponse,
  root: AccountRoot,
  tokens: TokenStore,
): Promise<{ key: CryptoKey; keys: ReturnType<typeof keyStateOf>; mustReplace: boolean }> {
  const api = new OpeningOnly({ baseUrl: platform().syncApiUrl, tokens, fetcher: serverFetch() });
  const held = unlocked.data.account.keys;
  const pinned = held?.accountId === session.account.id ? held : undefined;
  try {
    const opened = await openProductKey(api, {
      accountId: session.account.id,
      product: PRODUCT,
      unlockWith: { root },
      ...(pinned ? { pinned: { root: pinned.root } } : {}),
    });
    // Another product replaced the root, and this app's key has not
    // followed: as after a password, only a device that holds it can.
    if (opened.status === 'awaiting-confirmation') fail('error.keys.awaitingConfirmation');
    // No root to open it with, though the passkey opened one: the server's
    // account and its wrap disagree, and the password sorts it out.
    if (opened.status !== 'open') refuse(session);
    return { key: opened.productKey.key, keys: keyStateOf(opened.productKey), mustReplace: opened.mustReplace };
  } catch (error) {
    await endUnused(tokens);
    if (error instanceof NoKeyToOpen) refuse(session);
    throw error;
  }
}

/**
 * Joins the account a passkey signs in to. The vault takes this app's key on
 * the account, as with the password, and keeps opening with the device key;
 * the account's password, if it has one, is untouched and still the only
 * other.
 */
export async function signInWithAccountPasskey(
  unlocked: UnlockedVault,
  touch: PasskeyTouchSent,
): Promise<{ file: VaultFile; dataKey: CryptoKey; data: VaultData }> {
  if (!syncEnabled()) fail('error.syncUnavailable');
  if (unlocked.file.protection.mode !== 'device') fail('error.passkey.masterPassword');
  assertTouch(touch);
  const { session, root } = await signInWithPasskey(
    { baseUrl: platform().syncApiUrl, fetcher: serverFetch() },
    { challengeId: touch.challengeId, answer: touch.answer, prf: prfOf(touch.prf) },
    { deviceId: unlocked.data.sync.deviceId, deviceName: deviceName() },
  );
  // Kept only once the key has opened, as a password sign-in keeps its own.
  const tokens = memoryTokens(session);
  if (!root) {
    // It signs in, and opens nothing: no PRF, or not let unlock since the
    // root was replaced (the account page turns that back on).
    await endUnused(tokens);
    refuse(session);
  }
  const opened = await openWithRoot(unlocked, session, root, tokens);
  await storeSession({ ...(await tokens.get())!, account: session.account });
  await markReplacementDue(opened.mustReplace);

  const email = session.account.email;
  const before = unlocked.data.account;
  let data = updateAccount(markEverythingPending(unlocked.data, email), { keys: opened.keys });
  if (session.account.method === 'provider') {
    // A change to the account is confirmed by signing in again with one of
    // its providers, so the vault needs one. The session names them; the one
    // this vault last signed in with stays first while it is still among them.
    // A server from before names none, and then only that one is known. The
    // server is not trusted with more than a name this app knows.
    const named = Array.isArray(session.account.providers)
      ? session.account.providers.filter((name): name is SignInProvider => name === 'google' || name === 'github')
      : undefined;
    const known = before.method === 'provider' && before.email?.toLowerCase() === email.toLowerCase() ? before.provider : undefined;
    const provider = named ? (known && named.includes(known) ? known : named[0]) : known;
    data = updateAccount(data, { method: 'provider', provider });
  }
  return {
    file: await adoptDataKey(unlocked.file, deviceKeyring(await platform().deviceKey.getOrCreate()), opened.key, data),
    dataKey: opened.key,
    data,
  };
}

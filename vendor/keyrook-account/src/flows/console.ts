/**
 * The account page's flows (docs/console.md): what account.keyrook.com does
 * with the password and the recovery key, which it holds only while one of
 * these runs.
 *
 * The page's code is sent by a server each time it opens, so everything here
 * is written to be held to account: each flow asks for what it needs again,
 * opens only that, checks what the server reports against what it opened, and
 * drops it all when it returns. Nothing is stored, and nothing here keeps a
 * reference to a key, a password or a recovery key after it returns. The page
 * draws screens and calls these; it holds no cryptography of its own.
 */
import { unwrapDataKey, wrapDataKey } from '../crypto/aead.js';
import { openProductBox, sealProductBox } from '../keys/box.js';
import { sealRootPin } from '../keys/pin.js';
import { AUTHENTICATOR, deriveProductKeyCheck } from '../keys/product.js';
import {
  deriveRootCheck,
  newAccountRoot,
  openRootWithPassword,
  openRootWithRecoveryKey,
  wrapRootUnderPassword,
  wrapRootUnderRecoveryKey,
  type AccountRoot,
} from '../keys/root.js';
import {
  accountPasswordProblem,
  deriveAccountKeys,
  newAccountKdfParams,
  type AccountKdfParams,
  type AccountKeys,
} from '../sync/account.js';
import { generateRecoveryKey } from '../sync/kit.js';
import {
  beginStartOver,
  login,
  recoverRoot,
  recoverRootReset,
  startOver,
  type HttpSyncAdapter,
} from '../sync/http.js';
import type { ConsoleKeysResponse, ConsolePinsRequest, LoginResponse, ProviderTicket } from '../sync/protocol.js';
import { deriveKeyCheck, deriveRecoveryAuthHash } from '../sync/recovery.js';
import { passwordKeys, type AccountServer } from './product-key.js';

/** What proves the owner to open the root: the password, or on an account without one the recovery key and a fresh provider sign-in. */
export type ConsoleProof = { email: string; password: string } | { recoveryKey: string; reauth: ProviderTicket };

type Held = ConsoleKeysResponse & { root: NonNullable<ConsoleKeysResponse['root']> };

function assertStrongPassword(password: string): void {
  const problem = accountPasswordProblem(password);
  if (problem) throw new Error(problem);
}

async function newPasswordKeys(password: string, kdf?: AccountKdfParams) {
  assertStrongPassword(password);
  const params = kdf ?? newAccountKdfParams();
  return { kdf: params, keys: await deriveAccountKeys(password, params) };
}

function withRoot(held: ConsoleKeysResponse): Held {
  if (!held.root) throw new Error('This account has no root key yet. Open Keyrook Authenticator to do this.');
  return held as Held;
}

/** The root, opened here, and only if it is the one the server reports: a server that reports another is caught. */
function assertReported(root: AccountRoot, held: Held): AccountRoot {
  if (root.publicKey !== held.root.publicKey) throw new Error('The server reported an account key other than the one that opened.');
  return root;
}

async function openRoot(server: AccountServer, held: Held, proof: ConsoleProof): Promise<{ root: AccountRoot; keys: AccountKeys | null }> {
  if ('password' in proof) {
    if (!held.root.passwordWrap) throw new Error('This account has no password to open its keys with.');
    const { keys } = await passwordKeys(server, proof.email, proof.password);
    return { root: assertReported(await openRootWithPassword(held.root.passwordWrap, keys, held.accountId), held), keys };
  }
  if (held.root.passwordWrap) throw new Error('This account has a password: confirm with it.');
  if (!held.root.recoveryWrap) throw new Error('This account has no recovery key yet.');
  return { root: assertReported(await openRootWithRecoveryKey(held.root.recoveryWrap, proof.recoveryKey, held.accountId), held), keys: null };
}

/** The owner's proof the server asks for, from what the person typed. */
function ownerProof(proof: ConsoleProof, keys: AccountKeys | null): { authHash: string } | { reauth: ProviderTicket } {
  return 'password' in proof ? { authHash: keys!.authHash } : { reauth: proof.reauth };
}

/**
 * Every product's key sealed to this root, opened. One that should open and
 * does not is refused, never skipped: replacing the root without it would
 * leave that product's key behind a root nothing opens.
 */
async function openBoxes(held: Held, root: AccountRoot) {
  const opened: { product: string; key: CryptoKey; keyGeneration: number }[] = [];
  for (const entry of held.products) {
    if (entry.rootGeneration !== held.root.generation) continue;
    let key: CryptoKey;
    try {
      key = await openProductBox(entry.box, root, held.accountId, entry.product);
    } catch {
      throw new Error(`The key of ${entry.product} does not open with this account’s root. Nothing was changed.`);
    }
    opened.push({ product: entry.product, key, keyGeneration: entry.keyGeneration });
  }
  return opened;
}

/** Each product's pin naming this root, the recovery key seen here just now. */
async function pinsFor(held: Held, root: AccountRoot): Promise<ConsolePinsRequest> {
  const now = Date.now();
  const pins = [];
  for (const { product, key, keyGeneration } of await openBoxes(held, root)) {
    pins.push({
      product,
      pin: await sealRootPin(key, { root: root.publicKey, sheetVerifiedAt: now }, held.accountId, product),
      keyCheck: await deriveProductKeyCheck(product, key),
      keyGeneration,
    });
  }
  return { pins };
}

/**
 * Keyrook Authenticator's key, for wrapping again under a new password so its
 * older builds keep working: from its box, opened with the root, or on an
 * account without a root from the wrap under the current password. Null when
 * the older builds are done, or Authenticator has no key.
 */
async function authenticatorKey(held: ConsoleKeysResponse, root: AccountRoot | null, keys: AccountKeys): Promise<CryptoKey | null> {
  if (held.olderAuthenticator !== 'active') return null;
  if (held.root) {
    const box = held.products.find((entry) => entry.product === AUTHENTICATOR && entry.rootGeneration === held.root!.generation);
    return box && root ? openProductBox(box.box, root, held.accountId, AUTHENTICATOR) : null;
  }
  return held.protectedKey ? unwrapDataKey(keys.stretchedKey, held.protectedKey) : null;
}

/** Signs the page in with the password. Returns the session, and nothing derived from the password. */
export async function consoleSignIn(
  server: AccountServer,
  input: { email: string; password: string; deviceId: string; deviceName: string },
): Promise<LoginResponse> {
  const { keys } = await passwordKeys(server, input.email, input.password);
  return login(server.baseUrl, { email: input.email, authHash: keys.authHash, deviceId: input.deviceId, deviceName: input.deviceName }, server.fetcher);
}

/**
 * A new password. The root is opened with the current one and wrapped under
 * the new one; Keyrook Authenticator's key too, while its older builds use the
 * account, with proof it is Authenticator's. Every other device is signed out.
 */
export async function consoleChangePassword(
  api: HttpSyncAdapter,
  server: AccountServer,
  input: { email: string; password: string; newPassword: string; kdf?: AccountKdfParams },
): Promise<void> {
  const next = await newPasswordKeys(input.newPassword, input.kdf);
  const held = await api.consoleKeys();
  const { keys } = await passwordKeys(server, input.email, input.password);
  let rootPasswordWrap;
  let root: AccountRoot | null = null;
  if (held.root) {
    if (!held.root.passwordWrap) throw new Error('This account has no password to open its keys with.');
    root = assertReported(await openRootWithPassword(held.root.passwordWrap, keys, held.accountId), held as Held);
    rootPasswordWrap = await wrapRootUnderPassword(root, next.keys, held.accountId);
  }
  const legacy = await authenticatorKey(held, root, keys);
  await api.changePassword({
    currentAuthHash: keys.authHash,
    authHash: next.keys.authHash,
    kdf: next.kdf,
    ...(rootPasswordWrap ? { rootPasswordWrap } : {}),
    ...(legacy ? { protectedKey: await wrapDataKey(next.keys.stretchedKey, legacy), keyCheck: await deriveKeyCheck(legacy) } : {}),
  });
}

/**
 * A forgotten password: the recovery key opens the root, the emailed code
 * (`requestRecoveryCode` first) lets a new password wrap it. Then each
 * product's pin says the recovery key was seen just now, and Keyrook
 * Authenticator's older builds get their wrap under the new password.
 */
export async function consoleRecover(
  server: AccountServer,
  input: { email: string; recoveryKey: string; code: string; newPassword: string; deviceId: string; deviceName: string; kdf?: AccountKdfParams },
  connect: (session: LoginResponse) => HttpSyncAdapter,
): Promise<LoginResponse> {
  const next = await newPasswordKeys(input.newPassword, input.kdf);
  const recoveryAuthHash = await deriveRecoveryAuthHash(input.recoveryKey);
  const found = await recoverRoot(server.baseUrl, { email: input.email, recoveryAuthHash }, server.fetcher);
  const root = await openRootWithRecoveryKey(found.recoveryWrap, input.recoveryKey, found.accountId);
  const session = await recoverRootReset(
    server.baseUrl,
    {
      email: input.email,
      recoveryAuthHash,
      code: input.code,
      rootCheck: await deriveRootCheck(root),
      authHash: next.keys.authHash,
      kdf: next.kdf,
      rootPasswordWrap: await wrapRootUnderPassword(root, next.keys, found.accountId),
      deviceId: input.deviceId,
      deviceName: input.deviceName,
    },
    server.fetcher,
  );
  if (session.account.id !== found.accountId) throw new Error('The server answered for another account.');
  const api = connect(session);
  const held = withRoot(await api.consoleKeys());
  if (held.accountId !== found.accountId) throw new Error('The server answered for another account.');
  assertReported(root, held);
  await api.consolePins(await pinsFor(held, root));
  const legacy = await authenticatorKey(held, root, next.keys);
  if (legacy) {
    await api.wrapProtectedKey({
      authHash: next.keys.authHash,
      protectedKey: await wrapDataKey(next.keys.stretchedKey, legacy),
      keyCheck: await deriveKeyCheck(legacy),
    });
  }
  return session;
}

/**
 * A new recovery key for the account's root, or the one Keyrook
 * Authenticator's old kit is under (`keepsRecoveryKey`), so one sheet opens
 * everything. Returns the new key, to be shown once; null when the old kit's
 * was kept.
 */
export async function consoleNewRecoveryKey(
  api: HttpSyncAdapter,
  server: AccountServer,
  proof: ConsoleProof,
  keepsRecoveryKey?: string,
): Promise<string | null> {
  const held = withRoot(await api.consoleKeys());
  const { root, keys } = await openRoot(server, held, proof);
  // Every box opened before anything changes: one that does not stops it here.
  const pins = await pinsFor(held, root);
  const sheet = keepsRecoveryKey ?? generateRecoveryKey();
  await api.setRootRecovery({
    recoveryWrap: await wrapRootUnderRecoveryKey(root, sheet, held.accountId),
    recoveryAuthHash: await deriveRecoveryAuthHash(sheet),
    rootCheck: await deriveRootCheck(root),
    ...(keepsRecoveryKey !== undefined ? { keepsRecoveryKey: true } : {}),
    ...ownerProof(proof, keys),
  });
  await api.consolePins(pins);
  return keepsRecoveryKey === undefined ? sheet : null;
}

/**
 * Replaces the account's root, and seals every product's key to the new one:
 * the recovery key was lost, or leaked (`leaked`: each product then replaces
 * its own key when next opened). The old recovery key opens nothing
 * afterwards. Returns the new recovery key, to be shown once.
 */
export async function consoleReplaceRoot(
  api: HttpSyncAdapter,
  server: AccountServer,
  input: { proof: ConsoleProof; leaked: boolean },
): Promise<string> {
  const held = withRoot(await api.consoleKeys());
  const { root, keys } = await openRoot(server, held, input.proof);
  const opened = await openBoxes(held, root);
  const next = await newAccountRoot();
  const sheet = generateRecoveryKey();
  const now = Date.now();
  const products = [];
  for (const { product, key, keyGeneration } of opened) {
    products.push({
      product,
      box: await sealProductBox(key, next.publicKey, held.accountId, product),
      pin: await sealRootPin(key, { root: next.publicKey, sheetVerifiedAt: now }, held.accountId, product),
      keyCheck: await deriveProductKeyCheck(product, key),
      keyGeneration,
    });
  }
  const after = await api.consoleRotate({
    publicKey: next.publicKey,
    rootCheck: await deriveRootCheck(next),
    passwordWrap: keys ? await wrapRootUnderPassword(next, keys, held.accountId) : null,
    recoveryWrap: await wrapRootUnderRecoveryKey(next, sheet, held.accountId),
    recoveryAuthHash: await deriveRecoveryAuthHash(sheet),
    products,
    leaked: input.leaked,
    ...ownerProof(input.proof, keys),
  });
  if (after.root?.publicKey !== next.publicKey) throw new Error('The server reported an account key other than the one just made.');
  return sheet;
}

/**
 * Starts the account over with nothing left but the email: a new root, under
 * a new password and a new recovery key, and no product's key — each product
 * joins afterwards with the key it still holds, or a new one. What the
 * account held is kept, sealed, for 90 days. Returns the session and the new
 * recovery key, to be shown once.
 */
export async function consoleStartOver(
  server: AccountServer,
  input: { email: string; code: string; newPassword?: string; deviceId: string; deviceName: string; kdf?: AccountKdfParams },
  connect: (session: LoginResponse) => HttpSyncAdapter,
): Promise<{ session: LoginResponse; recoveryKey: string }> {
  const begun = await beginStartOver(server.baseUrl, { email: input.email, code: input.code }, server.fetcher);
  const { accountId } = begun;
  let password: { kdf: AccountKdfParams; keys: AccountKeys } | null = null;
  if (begun.method === 'password') {
    if (input.newPassword === undefined) throw new Error('Choose a new password for this account.');
    password = await newPasswordKeys(input.newPassword, input.kdf);
  }
  const root = await newAccountRoot();
  const sheet = generateRecoveryKey();
  const session = await startOver(
    server.baseUrl,
    {
      email: input.email,
      ticket: begun.ticket,
      ...(password ? { authHash: password.keys.authHash, kdf: password.kdf } : {}),
      keys: {
        accountId,
        root: {
          publicKey: root.publicKey,
          rootCheck: await deriveRootCheck(root),
          passwordWrap: password ? await wrapRootUnderPassword(root, password.keys, accountId) : null,
          recoveryWrap: await wrapRootUnderRecoveryKey(root, sheet, accountId),
          recoveryAuthHash: await deriveRecoveryAuthHash(sheet),
        },
      },
      deviceId: input.deviceId,
      deviceName: input.deviceName,
    },
    server.fetcher,
  );
  if (session.account.id !== accountId) throw new Error('The server answered for another account.');
  const held = withRoot(await connect(session).consoleKeys());
  if (held.accountId !== accountId) throw new Error('The server answered for another account.');
  assertReported(root, held);
  return { session, recoveryKey: sheet };
}

/**
 * Deletes the account, every product's data on the server with it: with the
 * password, or on an account without one a fresh provider sign-in.
 */
export async function consoleDeleteAccount(
  api: HttpSyncAdapter,
  server: AccountServer,
  proof: { email: string; password: string } | { reauth: ProviderTicket },
): Promise<void> {
  if ('password' in proof) {
    const { keys } = await passwordKeys(server, proof.email, proof.password);
    await api.deleteAccount({ authHash: keys.authHash });
  } else {
    await api.deleteAccount({ reauth: proof.reauth });
  }
}

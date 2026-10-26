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
import { DecryptionError, unwrapDataKey, wrapDataKey } from '../crypto/aead.js';
import { openProductBox, sealProductBox } from '../keys/box.js';
import { sealRootPin } from '../keys/pin.js';
import { AUTHENTICATOR, deriveProductKeyCheck } from '../keys/product.js';
import { makeDeviceRemovalProof } from '../keys/removal.js';
import {
  deriveRootCheck,
  newAccountRoot,
  openRootWithPasskey,
  openRootWithPassword,
  openRootWithRecoveryKey,
  wrapRootUnderPasskey,
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
import { generateRecoveryKey, unwrapRecoveryWrap } from '../sync/kit.js';
import {
  beginLogin,
  beginStartOver,
  finishSecondStep,
  type HttpSyncAdapter,
  login,
  recoverRoot,
  recoverRootReset,
  register,
  secondStepPasskeyOptions,
  startOver,
} from '../sync/http.js';
import type {
  ConsoleKeysResponse,
  ConsolePinsRequest,
  DeviceSummary,
  LoginResponse,
  OwnerProofFields,
  PasskeyCreationOptions,
  PasskeyView,
  ProviderTicket,
  SecondStepBegun,
  SecondStepProof,
  SecondStepRequired,
} from '../sync/protocol.js';
import { deriveKeyCheck, deriveRecoveryAuthHash } from '../sync/recovery.js';
import { passkeyCredential, signInWithPasskey, type PasskeyAnswer, type PasskeyTouch } from './passkey.js';
import { passwordKeys, type AccountServer } from './product-key.js';

/**
 * What proves the owner and opens the root: the password; on an account
 * without one, the recovery key and a fresh provider sign-in; or one of the
 * account's passkeys that unlocks it, touched just now for a challenge from
 * `passkeyReauthOptions`.
 */
export type ConsoleProof =
  | { email: string; password: string; secondStep?: SecondStepAnswer }
  | { recoveryKey: string; reauth: ProviderTicket; secondStep?: SecondStepAnswer }
  | { passkey: PasskeyTouch };

/**
 * The second step, on an account that has one (docs/console.md, S21): the
 * code the person's authenticator app shows, or their recovery key in its
 * place. A passkey needs none.
 */
export type SecondStepAnswer = { code: string } | { recoveryKey: string };

/** The second step as the server takes it: the recovery key only as its proof, never itself. Products send it with a change too. */
export async function secondStepProof(answer: SecondStepAnswer): Promise<SecondStepProof> {
  return 'code' in answer ? { code: answer.code } : { recoveryAuthHash: await deriveRecoveryAuthHash(answer.recoveryKey) };
}

const withSecondStep = async (answer: SecondStepAnswer | undefined): Promise<{ secondStep?: SecondStepProof }> =>
  answer ? { secondStep: await secondStepProof(answer) } : {};

/**
 * What proves the owner for a change that opens no key: the password, a fresh
 * Google or GitHub sign-in on an account without one, or one of its passkeys.
 */
export type ConsoleOwnerProof =
  | { email: string; password: string; secondStep?: SecondStepAnswer }
  | { reauth: ProviderTicket; secondStep?: SecondStepAnswer }
  | { passkey: PasskeyTouch };

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

async function openRoot(server: AccountServer, held: Held, proof: ConsoleProof | RemovalProof): Promise<{ root: AccountRoot; keys: AccountKeys | null }> {
  if ('passkey' in proof) {
    const { answer, prf } = proof.passkey;
    const wrap = held.passkeyWraps?.find((entry) => entry.id === answer.id);
    if (!wrap || !prf) throw new Error('That passkey does not unlock this account. Confirm with the password instead.');
    try {
      return { root: assertReported(await openRootWithPasskey(wrap.rootWrap, prf, held.accountId, wrap.id), held), keys: null };
    } catch (error) {
      if (error instanceof DecryptionError) throw new Error('That passkey does not unlock this account. Confirm with the password instead.');
      throw error;
    }
  }
  if ('password' in proof) {
    if (!held.root.passwordWrap) throw new Error('This account has no password to open its keys with.');
    const { keys } = await passwordKeys(server, proof.email, proof.password);
    return { root: assertReported(await openRootWithPassword(held.root.passwordWrap, keys, held.accountId), held), keys };
  }
  if (held.root.passwordWrap) throw new Error('This account has a password: confirm with it.');
  if (!held.root.recoveryWrap) throw new Error('This account has no recovery key yet.');
  return { root: assertReported(await openRootWithRecoveryKey(held.root.recoveryWrap, proof.recoveryKey, held.accountId), held), keys: null };
}

/** The owner's proof the server asks for, from what the person typed or touched, with the second step where there is one. */
async function ownerProof(proof: ConsoleProof, keys: AccountKeys | null): Promise<OwnerProofFields> {
  if ('passkey' in proof) return { passkey: { challengeId: proof.passkey.challengeId, credential: passkeyCredential(proof.passkey.answer) } };
  const step = await withSecondStep(proof.secondStep);
  return 'password' in proof ? { authHash: keys!.authHash, ...step } : { reauth: proof.reauth, ...step };
}

/** The owner's proof for a change that opens nothing: the password's proof is derived here and the password dropped. */
async function ownerOnly(server: AccountServer, proof: ConsoleOwnerProof): Promise<OwnerProofFields> {
  if ('password' in proof) return ownerProof(proof, (await passwordKeys(server, proof.email, proof.password)).keys);
  return ownerProof(proof as ConsoleProof, null);
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

/**
 * Signs the page in with the password. Returns the session, and nothing
 * derived from the password; or, on an account with a second step, the
 * ticket to finish with (`consoleSecondStep`).
 */
export async function consoleSignIn(
  server: AccountServer,
  input: { email: string; password: string; deviceId: string; deviceName: string },
): Promise<LoginResponse | SecondStepRequired> {
  const { keys } = await passwordKeys(server, input.email, input.password);
  return beginLogin(server.baseUrl, { email: input.email, authHash: keys.authHash, deviceId: input.deviceId, deviceName: input.deviceName }, server.fetcher);
}

/** Whether a sign-in stopped at its second step (`consoleSignIn`, `beginLogin`). */
export const needsSecondStep = (answer: LoginResponse | SecondStepRequired): answer is SecondStepRequired => 'secondStep' in answer;

/** Finishes a sign-in with its second step: the code, the recovery key in its place, or a passkey touched for `secondStepPasskeyOptions`. */
export async function consoleSecondStep(
  server: AccountServer,
  input: { ticket: string; answer: SecondStepAnswer | { passkey: PasskeyTouch } },
): Promise<LoginResponse> {
  const { ticket, answer } = input;
  const body =
    'passkey' in answer
      ? { ticket, passkey: { challengeId: answer.passkey.challengeId, credential: passkeyCredential(answer.passkey.answer) } }
      : { ticket, ...(await secondStepProof(answer)) };
  return finishSecondStep(server.baseUrl, body, server.fetcher);
}

/** Starts turning on a second step, on the owner's proof: the secret for the authenticator app, to show once. */
export async function consoleBeginSecondStep(api: HttpSyncAdapter, server: AccountServer, input: { proof: ConsoleOwnerProof }): Promise<SecondStepBegun> {
  return api.beginSecondStep(await ownerOnly(server, input.proof));
}

/** Turns the second step off, on the owner's proof with the second step itself, or a passkey. */
export async function consoleTurnOffSecondStep(api: HttpSyncAdapter, server: AccountServer, input: { proof: ConsoleOwnerProof }): Promise<void> {
  await api.turnOffSecondStep(await ownerOnly(server, input.proof));
}

/**
 * A new password. The root is opened with the current one and wrapped under
 * the new one; Keyrook Authenticator's key too, while its older builds use the
 * account, with proof it is Authenticator's. Every other device is signed out.
 */
export async function consoleChangePassword(
  api: HttpSyncAdapter,
  server: AccountServer,
  input: { email: string; password: string; newPassword: string; kdf?: AccountKdfParams; secondStep?: SecondStepAnswer },
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
    ...(await withSecondStep(input.secondStep)),
  });
}

/**
 * Adds a Google or GitHub identity the person just signed in as, on the
 * owner's proof: `link`, the ticket of a sign-in the page started for it
 * (`purpose=link`), or `linkToken`, from a page sign-in the server answered
 * with `status: 'link'`. Nothing opens: an identity only signs in.
 */
export async function consoleLinkProvider(
  api: HttpSyncAdapter,
  server: AccountServer,
  input: { proof: ConsoleOwnerProof } & ({ link: ProviderTicket } | { linkToken: string }),
): Promise<void> {
  await api.linkIdentity({ ...('link' in input ? { link: input.link } : { linkToken: input.linkToken }), ...(await ownerOnly(server, input.proof)) });
}

/** Removes the account's Google or GitHub identity, on the owner's proof, while it keeps another way to sign in. */
export async function consoleUnlinkProvider(
  api: HttpSyncAdapter,
  server: AccountServer,
  input: { proof: ConsoleOwnerProof; provider: string },
): Promise<void> {
  await api.unlinkIdentity(input.provider, await ownerOnly(server, input.proof));
}

/**
 * A password for an account that signs in with Google or GitHub alone. The
 * root opens here with the recovery key and a fresh sign-in, or a passkey
 * that unlocks it, and is wrapped under the new password; the server checks
 * it is the account's root. Google and GitHub go on signing in.
 */
export async function consoleAddPassword(
  api: HttpSyncAdapter,
  server: AccountServer,
  input: { proof: ConsoleProof; newPassword: string; kdf?: AccountKdfParams },
): Promise<void> {
  const next = await newPasswordKeys(input.newPassword, input.kdf);
  const held = withRoot(await api.consoleKeys());
  if (held.root.passwordWrap) throw new Error('This account already has a password.');
  const { root } = await openRoot(server, held, input.proof);
  await api.addPassword({
    authHash: next.keys.authHash,
    kdf: next.kdf,
    rootPasswordWrap: await wrapRootUnderPassword(root, next.keys, held.accountId),
    rootCheck: await deriveRootCheck(root),
    ...(await ownerProof(input.proof, null)),
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
 * A recovery key for the page to show before anything changes. It opens
 * nothing until `consoleNewRecoveryKey` or `consoleReplaceRoot` sets it, which
 * the page asks for only after two of its groups were typed back from what was
 * saved, and the owner then proved. Until then the account's current recovery
 * key keeps working, so a key shown and never kept locks nobody out.
 */
export const consoleMakeRecoveryKey = (): string => generateRecoveryKey();

/**
 * Wraps the account's root under a recovery key: one `consoleMakeRecoveryKey`
 * made and the person saved, or the one Keyrook Authenticator's old kit is
 * under (`kept`), so one sheet opens everything. The current one stops
 * working.
 */
export async function consoleNewRecoveryKey(
  api: HttpSyncAdapter,
  server: AccountServer,
  input: { proof: ConsoleProof; recoveryKey: string; kept?: boolean },
): Promise<void> {
  const held = withRoot(await api.consoleKeys());
  const { root, keys } = await openRoot(server, held, input.proof);
  // Every box opened before anything changes: one that does not stops it here.
  const pins = await pinsFor(held, root);
  await api.setRootRecovery({
    recoveryWrap: await wrapRootUnderRecoveryKey(root, input.recoveryKey, held.accountId),
    recoveryAuthHash: await deriveRecoveryAuthHash(input.recoveryKey),
    rootCheck: await deriveRootCheck(root),
    ...(input.kept ? { keepsRecoveryKey: true } : {}),
    ...(await ownerProof(input.proof, keys)),
  });
  await api.consolePins(pins);
}

/**
 * Replaces the account's root, and seals every product's key to the new one,
 * wrapped under a recovery key `consoleMakeRecoveryKey` made and the person
 * saved: the old one was lost, or leaked (`leaked`: each product then
 * replaces its own key when next opened). The old recovery key opens nothing
 * afterwards.
 */
export async function consoleReplaceRoot(
  api: HttpSyncAdapter,
  server: AccountServer,
  input: { proof: ConsoleProof; leaked: boolean; recoveryKey: string },
): Promise<void> {
  const held = withRoot(await api.consoleKeys());
  const { root, keys } = await openRoot(server, held, input.proof);
  const opened = await openBoxes(held, root);
  const next = await newAccountRoot();
  const sheet = input.recoveryKey;
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
    ...(await ownerProof(input.proof, keys)),
  });
  if (after.root?.publicKey !== next.publicKey) throw new Error('The server reported an account key other than the one just made.');
}

/**
 * Asks to start the account over from the page, with the email alone: a new
 * root under a new password (or none, on an account without one) and a new
 * recovery key, and no product's key, since the page has none; each product
 * joins with a key of its own once it takes effect. It takes effect at
 * `executesAt`, a week on, unless a device still signed in cancels it; no
 * session is issued. The recovery key is returned once, for the page to show
 * now: it is the one that works afterwards.
 */
export async function consoleStartOver(
  server: AccountServer,
  input: { email: string; code: string; newPassword?: string; deviceId: string; deviceName: string; kdf?: AccountKdfParams },
): Promise<{ executesAt: number; recoveryKey: string }> {
  const begun = await beginStartOver(server.baseUrl, { email: input.email, code: input.code }, server.fetcher);
  const { accountId } = begun;
  let password: { kdf: AccountKdfParams; keys: AccountKeys } | null = null;
  if (begun.method === 'password') {
    if (input.newPassword === undefined) throw new Error('Choose a new password for this account.');
    password = await newPasswordKeys(input.newPassword, input.kdf);
  }
  const root = await newAccountRoot();
  const sheet = generateRecoveryKey();
  const { executesAt } = await startOver(
    server.baseUrl,
    {
      schedule: true,
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
  return { executesAt, recoveryKey: sheet };
}

/**
 * Checks the recovery key typed whole on the page: it must open the account's
 * root here, the root the server reports. Then the server is told, so nobody
 * is reminded to look for it for a while. The page decides nothing from that
 * note; neither does any product.
 */
export async function consoleCheckRecoveryKey(api: HttpSyncAdapter, recoveryKey: string): Promise<void> {
  const held = withRoot(await api.consoleKeys());
  if (!held.root.recoveryWrap) throw new Error('This account has no recovery key yet.');
  try {
    assertReported(await openRootWithRecoveryKey(held.root.recoveryWrap, recoveryKey, held.accountId), held);
  } catch (error) {
    if (error instanceof DecryptionError) throw new Error('That recovery key does not open this account.');
    throw error;
  }
  await api.recoveryChecked({ rootRecoveryAuthHash: await deriveRecoveryAuthHash(recoveryKey) });
}

/**
 * Makes an account from the page, after the emailed code: a password and a
 * root, and no product's key, since the page has none. Each product joins with
 * a key of its own the first time it signs in (`openProductKey`). Only a
 * password account: without a password, the first product would have nothing
 * but the recovery key to open the root with.
 */
export async function consoleCreateAccount(
  server: AccountServer,
  input: { email: string; code: string; password: string; deviceId: string; deviceName: string; kdf?: AccountKdfParams },
  connect: (session: LoginResponse) => HttpSyncAdapter,
): Promise<{ session: LoginResponse; recoveryKey: string }> {
  const { kdf, keys } = await newPasswordKeys(input.password, input.kdf);
  const accountId = crypto.randomUUID();
  const root = await newAccountRoot();
  const sheet = generateRecoveryKey();
  const session = await register(
    server.baseUrl,
    {
      email: input.email,
      code: input.code,
      authHash: keys.authHash,
      kdf,
      keys: {
        accountId,
        root: {
          publicKey: root.publicKey,
          rootCheck: await deriveRootCheck(root),
          passwordWrap: await wrapRootUnderPassword(root, keys, accountId),
          recoveryWrap: await wrapRootUnderRecoveryKey(root, sheet, accountId),
          recoveryAuthHash: await deriveRecoveryAuthHash(sheet),
        },
      },
      deviceId: input.deviceId,
      deviceName: input.deviceName,
    },
    server.fetcher,
  );
  if (session.account.id !== accountId) throw new Error('The server made the account under another id.');
  const held = withRoot(await connect(session).consoleKeys());
  if (held.accountId !== accountId) throw new Error('The server answered for another account.');
  assertReported(root, held);
  return { session, recoveryKey: sheet };
}

/**
 * Deletes the account, every product's data on the server with it: with the
 * password, or on an account without one a fresh provider sign-in.
 */
export async function consoleDeleteAccount(api: HttpSyncAdapter, server: AccountServer, proof: ConsoleOwnerProof): Promise<void> {
  await api.deleteAccount(await ownerOnly(server, proof));
}

/** Signs the page in with a passkey. Returns the session; a root the passkey opened is dropped here, since signing in needs none. */
export async function consolePasskeySignIn(
  server: AccountServer,
  touch: PasskeyTouch,
  device: { deviceId: string; deviceName: string },
): Promise<LoginResponse> {
  const { session } = await signInWithPasskey(server, touch, device);
  const { passkey: _dropped, ...login } = session;
  return login;
}

/** The root wrapped under a passkey's PRF answer, checked to open again before it is sent. */
async function unlockFor(root: AccountRoot, accountId: string, credentialId: string, prf: Uint8Array) {
  const rootWrap = await wrapRootUnderPasskey(root, prf, accountId, credentialId);
  if ((await openRootWithPasskey(rootWrap, prf, accountId, credentialId)).publicKey !== root.publicKey) {
    throw new Error('The passkey’s wrap did not open again. Nothing was changed.');
  }
  return { rootWrap, rootCheck: await deriveRootCheck(root) };
}

/**
 * Adds a passkey to the account, with the owner's proof. `make` asks the
 * browser for it (`navigator.credentials.create` with the options given, then
 * `.get` for its PRF answer where creating gave none). When it answers PRF and
 * the account has a root, the root is opened with the proof and wrapped under
 * that answer, so the passkey unlocks too; otherwise it only signs in.
 */
export async function consoleAddPasskey(
  api: HttpSyncAdapter,
  server: AccountServer,
  input: {
    proof: ConsoleProof;
    name: string;
    make: (options: PasskeyCreationOptions) => Promise<{ answer: PasskeyAnswer; prf: Uint8Array | null }>;
  },
): Promise<PasskeyView> {
  const held = await api.consoleKeys();
  // A passkey that only signs in proves the owner but opens nothing, and an
  // account without a root yet (Keyrook Authenticator's alone) has nothing to
  // open: the new passkey then only signs in too.
  const { proof: given } = input;
  const opens =
    held.root !== null &&
    (!('passkey' in given) || (given.passkey.prf !== null && (held.passkeyWraps ?? []).some((entry) => entry.id === given.passkey.answer.id)));
  let opened: { root: AccountRoot; keys: AccountKeys | null } | null = null;
  let proof: OwnerProofFields;
  if (opens) {
    opened = await openRoot(server, held as Held, given);
    proof = await ownerProof(given, opened.keys);
  } else {
    const keys = 'password' in given ? (await passwordKeys(server, given.email, given.password)).keys : null;
    proof = await ownerProof(given, keys);
  }
  const options = await api.passkeyOptions(proof);
  const made = await input.make(options);
  const unlock = opened && made.prf ? await unlockFor(opened.root, held.accountId, made.answer.id, made.prf) : undefined;
  return api.addPasskey({
    challengeId: options.challengeId,
    credential: passkeyCredential(made.answer),
    name: input.name,
    ...(unlock ? { unlock } : {}),
  });
}

/**
 * Lets a passkey already on the account unlock it: after the root it wrapped
 * was replaced, or when it was added before it could. The root is opened with
 * the proof; the passkey's PRF answer, asked for just now, wraps it.
 */
export async function consolePasskeyUnlock(
  api: HttpSyncAdapter,
  server: AccountServer,
  input: { proof: ConsoleProof; passkeyId: string; prf: Uint8Array },
): Promise<PasskeyView> {
  const held = withRoot(await api.consoleKeys());
  const { root } = await openRoot(server, held, input.proof);
  return api.setPasskeyUnlock(input.passkeyId, await unlockFor(root, held.accountId, input.passkeyId, input.prf));
}

/**
 * Gives an account that only Keyrook Authenticator has used its root, so the
 * page can manage its recovery key, passkeys and the rest. Authenticator's key
 * is opened here: on an account with a password, from its wrap under the
 * password; on one without, from Authenticator's old kit with its recovery
 * key, which then wraps the root too, so the account keeps the one recovery
 * key it has. `recoveryKey` on a password account keeps the kit's key as well.
 * The key that opened is sealed back as Authenticator's, and the server checks
 * by its key check that it is.
 */
export async function consoleSetUpRoot(
  api: HttpSyncAdapter,
  server: AccountServer,
  input: { proof: ConsoleProof; recoveryKey?: string },
): Promise<void> {
  const { proof } = input;
  const held = await api.consoleKeys();
  if (held.root) throw new Error('This account already has a root key.');
  if ('passkey' in proof) throw new Error('Confirm with the password, or the recovery key and a sign-in with Google or GitHub.');
  let dataKey: CryptoKey;
  let keys: AccountKeys | null = null;
  let recoveryKey: string | null;
  if ('password' in proof) {
    keys = (await passwordKeys(server, proof.email, proof.password)).keys;
    if (!held.protectedKey) throw new Error('Keyrook Authenticator’s key is not under this password yet. Open Keyrook Authenticator once, then try again.');
    try {
      dataKey = await unwrapDataKey(keys.stretchedKey, held.protectedKey);
    } catch (error) {
      if (error instanceof DecryptionError) throw new Error('That password is not correct.');
      throw error;
    }
    recoveryKey = input.recoveryKey ?? null;
  } else {
    recoveryKey = proof.recoveryKey;
    const { wrap } = await api.recoveryWrap({ recoveryAuthHash: await deriveRecoveryAuthHash(recoveryKey) });
    try {
      dataKey = await unwrapRecoveryWrap(wrap, recoveryKey);
    } catch (error) {
      if (error instanceof DecryptionError) throw new Error('That recovery key does not open this account.');
      throw error;
    }
  }
  // A recovery key kept on a password account must open the same key: one that
  // opened something else is not this account's kit.
  if (keys && recoveryKey !== null) {
    const { wrap } = await api.recoveryWrap({ recoveryAuthHash: await deriveRecoveryAuthHash(recoveryKey) });
    const kept = await unwrapRecoveryWrap(wrap, recoveryKey).catch(() => null);
    if (!kept || (await deriveKeyCheck(kept)) !== (await deriveKeyCheck(dataKey))) throw new Error('That recovery key does not open this account.');
  }

  const { accountId } = held;
  const root = await newAccountRoot();
  await api.consoleSetUpRoot({
    publicKey: root.publicKey,
    rootCheck: await deriveRootCheck(root),
    passwordWrap: keys ? await wrapRootUnderPassword(root, keys, accountId) : null,
    recoveryWrap: recoveryKey === null ? null : await wrapRootUnderRecoveryKey(root, recoveryKey, accountId),
    ...(recoveryKey === null ? {} : { recoveryAuthHash: await deriveRecoveryAuthHash(recoveryKey) }),
    box: await sealProductBox(dataKey, root.publicKey, accountId, AUTHENTICATOR),
    pin: await sealRootPin(dataKey, { root: root.publicKey, sheetVerifiedAt: recoveryKey === null ? null : Date.now() }, accountId, AUTHENTICATOR),
    keyCheck: await deriveProductKeyCheck(AUTHENTICATOR, dataKey),
    ...(await ownerProof(proof, keys)),
  });
  // What the server now reports must be the root made here, holding Authenticator's key.
  const after = withRoot(await api.consoleKeys());
  assertReported(root, after);
  const box = after.products.find((entry) => entry.product === AUTHENTICATOR);
  if (!box || (await deriveKeyCheck(await openProductBox(box.box, root, accountId, AUTHENTICATOR))) !== (await deriveKeyCheck(dataKey))) {
    throw new Error('The server reported an account key other than the one that opened.');
  }
}

/**
 * How the page proves removing a device (`makeDeviceRemovalProof`, in
 * keys/removal.ts): with its product's key opened from the root, by whatever
 * opens the root (`root`); with Keyrook Authenticator's key from its wrap
 * under the password, on an account where the root holds none (`password`);
 * or not at all (`none`) — the page's own sessions, a product whose key the
 * page cannot open, and a device listed without its id by a server from
 * before migration 11. Without a proof the device is only signed out, and
 * keeps what it holds.
 */
export function consoleRemovalProof(held: ConsoleKeysResponse, device: Pick<DeviceSummary, 'product' | 'deviceId'>): 'root' | 'password' | 'none' {
  const { product } = device;
  if (!device.deviceId) return 'none';
  if (held.root && held.products.some((entry) => entry.product === product && entry.rootGeneration === held.root!.generation)) return 'root';
  if (product === AUTHENTICATOR && held.protectedKey) return 'password';
  return 'none';
}

/**
 * What opens a product's key to prove a removal. It opens keys here and
 * proves nothing to the server, which a session is enough for: so no second
 * step, and on an account without a password the recovery key alone, or a
 * passkey that unlocks.
 */
export type RemovalProof = { email: string; password: string } | { recoveryKey: string } | { passkey: PasskeyTouch };

/**
 * Removes a device from the account, with the proof its product's key makes
 * (`makeDeviceRemovalProof`), opened here with what the person typed or
 * touched and dropped when this returns. The server keeps the proof and
 * cannot make one; the device checks it with its own key. `proof` is needed
 * unless `consoleRemovalProof` says `none`; then the device is only signed
 * out. Answers whether a proof went with it.
 */
export async function consoleRemoveDevice(
  api: HttpSyncAdapter,
  server: AccountServer,
  input: { device: Pick<DeviceSummary, 'id' | 'deviceId' | 'product'>; proof: RemovalProof | null },
): Promise<{ proved: boolean }> {
  const { device, proof } = input;
  const held = await api.consoleKeys();
  const way = consoleRemovalProof(held, device);
  if (way === 'none') {
    await api.revokeDevice(device.id);
    return { proved: false };
  }
  if (!proof) throw new Error('Confirm with the password, or the recovery key and a sign-in with Google or GitHub.');
  let key: CryptoKey;
  if (way === 'root') {
    const { root } = await opened(() => openRoot(server, held as Held, proof), proof);
    const entry = held.products.find((box) => box.product === device.product && box.rootGeneration === held.root!.generation)!;
    try {
      key = await openProductBox(entry.box, root, held.accountId, entry.product);
    } catch {
      throw new Error(`The key of ${entry.product} does not open with this account’s root. Nothing was changed.`);
    }
  } else {
    if ('passkey' in proof) throw new Error('That passkey does not unlock this account. Confirm with the password instead.');
    if (!('password' in proof)) throw new Error('This account has a password: confirm with it.');
    const { keys } = await passwordKeys(server, proof.email, proof.password);
    key = await opened(() => unwrapDataKey(keys.stretchedKey, held.protectedKey!), proof);
  }
  await api.revokeDevice(
    device.id,
    await makeDeviceRemovalProof(key, { accountId: held.accountId, product: device.product, deviceId: device.deviceId! }),
  );
  return { proved: true };
}

/** What a key that will not open with what was typed says, in the person's words. */
async function opened<T>(open: () => Promise<T>, proof: RemovalProof): Promise<T> {
  try {
    return await open();
  } catch (error) {
    if (!(error instanceof DecryptionError)) throw error;
    if ('password' in proof) throw new Error('That password is not correct.');
    if ('recoveryKey' in proof) throw new Error('That recovery key does not open this account.');
    throw error;
  }
}

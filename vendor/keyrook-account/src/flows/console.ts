/**
 * The account page's flows: what account.keyrook.com does with the password
 * and the recovery key, which it holds only while one of these runs.
 *
 * The page's code is sent by a server each time it opens, so everything here
 * is written to be held to account: each flow asks for what it needs again,
 * opens only that, checks what the server reports against what it opened, and
 * drops it all when it returns. Nothing is stored, and nothing here keeps a
 * reference to a key, a password or a recovery key after it returns. The page
 * draws screens and calls these; it holds no cryptography of its own.
 */
import { DecryptionError, unwrapDataKey, wrapDataKey, type SealedBox } from '../crypto/aead.js';
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
  askFamilyRecovery,
  beginLogin,
  beginStartOver,
  familyRecoveryStatus,
  finishFamilyRecovery,
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
  OrgBox,
  OrgDetail,
  OrgRole,
  RotateOrgRequest,
  ConsoleKeysResponse,
  ConsolePinsRequest,
  DeviceSummary,
  FamilyRecoveryStepRequired,
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
import { newOrgKey, openOrgKey, sealOrgKey, type AuthBox } from '../keys/org/authbox.js';
import {
  newCollectionKey,
  openCollectionKey,
  openCollectionName,
  sealCollectionHolders,
  sealCollectionKey,
  sealCollectionName,
  sealedHoldersOf,
} from '../keys/org/collection.js';
import { orgCompareCode, orgJoinCode } from '../keys/org/confirm.js';
import {
  newMemberKey,
  openMemberKeyWithProduct,
  openMemberKeyWithRoot,
  sealMemberKeyToRoot,
  sealMemberKeyUnderProduct,
  type MemberKey,
  type MemberRootBox,
} from '../keys/org/member.js';
import {
  checkRoster,
  collectionSenderKey,
  makeRoster,
  mergedOrgPins,
  nextOrgPin,
  openPagePin,
  orgPinFrom,
  pinnedKey,
  retiredKey,
  sealPagePin,
  trustedOrgPin,
  type OrgPin,
  type RosterCheck,
  type RosterMember,
} from '../keys/org/roster.js';
import { vouchedFor, vouchFor } from '../keys/org/vouch.js';
import { sealEmergencyBox } from '../keys/org/emergency.js';
import {
  newHandoverKey,
  newOrgRecoveryKey,
  openOrgRecoveryBox,
  openOrgRecoveryKey,
  openRecoveryHandover,
  orgRecoveryCode,
  sealOrgRecoveryBox,
  sealOrgRecoveryKey,
  sealRecoveryHandover,
  type OrgRecoveryKey,
} from '../keys/org/recovery.js';
import { familyProducts } from '../products.js';
import { newId } from '../util/id.js';
import { passkeyCredential, signInWithPasskey, type PasskeyAnswer, type PasskeyTouch } from './passkey.js';
import { passwordKeys, type AccountServer } from './product-key.js';
import { boxFrom, wire } from './wire.js';

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
 * The second step, on an account that has one: the code the person's
 * authenticator app shows, or their recovery key in its place. A passkey needs
 * none.
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

/**
 * Asks for a code at the address the account would move to, on the owner's
 * proof. Nothing opens: the address carries no key.
 */
export async function consoleBeginEmailChange(
  api: HttpSyncAdapter,
  server: AccountServer,
  input: { proof: ConsoleOwnerProof; email: string },
): Promise<void> {
  await api.beginEmailChange({ email: input.email, ...(await ownerOnly(server, input.proof)) });
}

/** Moves the account to the new address with the code it received; answers the address as kept. */
export async function consoleChangeEmail(api: HttpSyncAdapter, input: { email: string; code: string }): Promise<string> {
  return api.changeEmail({ email: input.email, code: input.code });
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
  const memberRootBoxes = await memberKeysSealedAgain(held.memberRootBoxes ?? [], root, next, held.accountId);
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
    memberRootBoxes,
    ...(await ownerProof(input.proof, keys)),
  });
  if (after.root?.publicKey !== next.publicKey) throw new Error('The server reported an account key other than the one just made.');
}

/**
 * Each family's member key, opened with the root being replaced and sealed to
 * the next. One that does not open is refused, never skipped, as a product's
 * box is: the family's key would be left behind a root nothing opens.
 */
async function memberKeysSealedAgain(boxes: { orgId: string; box: OrgBox }[], root: AccountRoot, next: AccountRoot, accountId: string) {
  const sealed = [];
  for (const entry of boxes) {
    let member: MemberKey;
    try {
      member = await openMemberKeyWithRoot(boxFrom<MemberRootBox>(entry.box), root, entry.orgId, accountId);
    } catch {
      throw new Error('Your key for your family does not open with this account’s root. Nothing was changed.');
    }
    sealed.push({ orgId: entry.orgId, box: wire(await sealMemberKeyToRoot(member, next.publicKey, entry.orgId, accountId)) });
  }
  return sealed;
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
 * page cannot open, and a device listed without its id by an older server.
 * Without a proof the device is only signed out, and keeps what it holds.
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

// --- Families ---------------------------------------------------------------
//
// Each opens the root with what the person typed or touched, then the member
// key sealed to it, then what that opens, and drops all of it when it
// returns. Member keys are taken from the roster once its MAC checks out
// under the family key, never from the server's list of members, but for a
// newcomer's, which the join code vouches for. The page pins each family as a
// product does (`OrgPin`), in the browser (`FamilyPinStore`) and on the server
// sealed under a key only the root makes (`sealPagePin`): the family's key is
// taken only from someone pinned with the key its box is from, and nothing is
// sealed to or taken from someone whose key changed, until the two compare a
// code (`familyCompareOf`, `consoleTrustFamilyMember`).

/** Seals `member` to the root and under each product's key the root opens, for those products' devices. */
async function memberBoxes(held: Held, root: AccountRoot, member: MemberKey, orgId: string) {
  const rootBox = await sealMemberKeyToRoot(member, root.publicKey, orgId, held.accountId);
  const productBoxes = [];
  for (const { product, key } of await openBoxes(held, root)) {
    productBoxes.push({ product, box: await sealMemberKeyUnderProduct(member, key, orgId, held.accountId, product) });
  }
  return { rootBox, productBoxes };
}

/** What a flow on a family opens: the root, the caller's member key, the family key in use, and the roster checked under it. */
interface OpenedFamily {
  accountId: string;
  held: Held;
  /** The caller's own root, opened with what they typed: what emergency access hands over. */
  root: AccountRoot;
  detail: OrgDetail;
  member: MemberKey;
  orgKey: CryptoKey;
  roster: RosterCheck;
  /** Those whose key is not the one this browser pinned: nothing is sealed to them or taken from them until a code is compared. */
  keyChanged: string[];
  /** What this browser now pins, with the keys of those gone, to take what they sealed before they went. */
  pin: OrgPin;
}

/** What this browser keeps of each family the page opened: whose key is whose, never a secret. */
export interface FamilyPinStore {
  get(accountId: string, orgId: string): unknown;
  set(accountId: string, orgId: string, pin: OrgPin): void;
}

/** Where the account lives, and, in a browser, where the page keeps its pins of families. */
export type ConsoleAt = AccountServer & { familyPins?: FamilyPinStore };

/**
 * For a caller that names no store, as a script or a test in Node does: the
 * pins in memory while it runs, so a comparison it trusted holds for the
 * flow it stopped, which then seals it into the server's copy.
 */
const pinsInMemory = new Map<string, unknown>();
const IN_MEMORY: FamilyPinStore = {
  get: (accountId, orgId) => pinsInMemory.get(`${accountId}:${orgId}`),
  set: (accountId, orgId, pin) => void pinsInMemory.set(`${accountId}:${orgId}`, pin),
};
const pinsOf = (server: ConsoleAt): FamilyPinStore => server.familyPins ?? IN_MEMORY;

/** Someone to compare a code with before a flow goes on: who, the key the roster lists for them, and the code over it and the caller's. */
export interface FamilyCompare {
  orgId: string;
  accountId: string;
  memberKey: string;
  code: string;
}

/** A flow stopped until the person compares a code with someone in their family: `familyCompare` says with whom. */
export class FamilyCompareError extends Error {
  override readonly name = 'FamilyCompareError';
  constructor(readonly familyCompare: FamilyCompare) {
    super('Someone in your family has a key this browser has not seen. Compare codes with them first.');
  }
}

async function compareFirst(orgId: string, me: { accountId: string; memberKey: string }, them: { accountId: string; memberKey: string }): Promise<FamilyCompareError> {
  return new FamilyCompareError({ orgId, ...them, code: await orgCompareCode(orgId, me, them) });
}

/** The comparison a flow stopped for, when that is why it stopped. */
export function familyCompareOf(error: unknown): FamilyCompare | null {
  return error instanceof FamilyCompareError ? error.familyCompare : null;
}

/** What this browser and the server's sealed copy pinned of a family, each as read, and the two put together. */
interface PinsRead {
  /** Null on a first look. */
  pin: OrgPin | null;
  local: OrgPin | null;
  sealed: OrgPin | null;
}

/** The same pin: one read that already says what is to be kept is not written again. */
function samePin(kept: OrgPin | null, pin: OrgPin): boolean {
  if (!kept || kept.version !== pin.version || kept.generation !== pin.generation) return false;
  const ids = Object.keys(pin.keys);
  const remembered = (each: OrgPin) => JSON.stringify([each.retired ?? [], Object.entries(each.seen ?? {}).sort()]);
  return ids.length === Object.keys(kept.keys).length && ids.every((id) => pinnedKey(kept, id) === pin.keys[id]) && remembered(kept) === remembered(pin);
}

/**
 * What this browser and the server's sealed copy pinned of the family, put
 * together: both are the person's own, the browser's kept from the server and
 * the server's made under the root. A copy that does not open, under a root
 * since replaced, is none; one gone from the server is caught by the browser
 * that kept it.
 */
async function pinOf(server: ConsoleAt, accountId: string, root: AccountRoot, detail: OrgDetail): Promise<PinsRead> {
  const orgId = detail.org.id;
  let local: OrgPin | null = null;
  try {
    const kept = pinsOf(server).get(accountId, orgId);
    if (kept != null) local = await orgPinFrom(kept);
  } catch {
    local = null;
  }
  let sealed: OrgPin | null = null;
  if (detail.me.pagePin) {
    try {
      sealed = await openPagePin(root, boxFrom<SealedBox>(detail.me.pagePin), orgId, accountId);
    } catch (error) {
      if (!(error instanceof DecryptionError)) throw error;
    }
  }
  // This browser's word stands where the two differ: what it compared, it keeps.
  return { local, sealed, pin: local && sealed ? mergedOrgPins(sealed, local) : (local ?? sealed) };
}

/**
 * Keeps `pin` in this browser and, sealed, on the server: each copy only
 * where the one `read` is not already it, so opening a family nothing
 * changed in writes nothing.
 */
async function keepPin(
  api: HttpSyncAdapter,
  server: ConsoleAt,
  family: { accountId: string; root: AccountRoot; orgId: string },
  pin: OrgPin,
  read: Pick<PinsRead, 'local' | 'sealed'> = { local: null, sealed: null },
): Promise<void> {
  if (!samePin(read.local, pin)) {
    try {
      pinsOf(server).set(family.accountId, family.orgId, pin);
    } catch {
      // A browser that keeps nothing still has the server's sealed copy.
    }
  }
  if (samePin(read.sealed, pin)) return;
  await api.putOrgPagePin(family.orgId, { box: wire(await sealPagePin(family.root, pin, family.orgId, family.accountId)) });
}

/**
 * After the two screens showed the same code: `compare.memberKey` pinned as
 * theirs in this browser, or in memory for a caller that keeps no pins, so
 * the flow that stopped goes on when asked again, and seals it into the
 * server's copy. Only ever on a match the person saw.
 */
export async function consoleTrustFamilyMember(server: ConsoleAt, input: { accountId: string; compare: FamilyCompare }): Promise<void> {
  const { orgId, accountId, memberKey } = input.compare;
  let pin: OrgPin | null = null;
  try {
    const kept = pinsOf(server).get(input.accountId, orgId);
    if (kept != null) pin = await orgPinFrom(kept);
  } catch {
    // Unreadable: this comparison starts it again.
  }
  pinsOf(server).set(input.accountId, orgId, trustedOrgPin(pin, accountId, memberKey));
}

/**
 * The next roster's body: `members`, and the recovery key while recovery is
 * on. One that stopped since the roster was made (`lapseRecovery`) is listed
 * no more, so nobody seals a root to a key someone gone may hold.
 */
function nextBody(family: OpenedFamily, members: RosterMember[]) {
  return { ...family.roster.body, members, recoveryKey: family.detail.recovery.on ? family.roster.body.recoveryKey : null };
}

/** The key the roster lists for `accountId`, or a throw: nothing is sealed to anyone it does not list. */
function rosterKey(roster: RosterCheck, accountId: string): string {
  const line = roster.body.members.find((entry) => entry.accountId === accountId);
  if (!line) throw new Error('The family’s list of members does not name that person. Load the family again.');
  return line.memberKey;
}

/** The key the roster lists for `accountId`, to seal to or take from: not while it is not the one this browser pinned. */
async function memberKeyIn(family: OpenedFamily, accountId: string): Promise<string> {
  const listed = rosterKey(family.roster, accountId);
  if (family.keyChanged.includes(accountId)) {
    throw await compareFirst(family.detail.org.id, { accountId: family.accountId, memberKey: family.member.publicKey }, { accountId, memberKey: listed });
  }
  return listed;
}

/**
 * The caller's member key: from its box under the root; or, when a product
 * replaced the root without holding a box of it, from a product's box the root
 * opens, sealed again to the root on the way. Whatever opens is checked
 * against the roster by the caller.
 */
async function memberKeyOf(api: HttpSyncAdapter, held: Held, root: AccountRoot, detail: OrgDetail): Promise<MemberKey> {
  const orgId = detail.org.id;
  try {
    return await openMemberKeyWithRoot(boxFrom<MemberRootBox>(detail.me.rootBox), root, orgId, held.accountId);
  } catch (error) {
    if (!(error instanceof DecryptionError)) throw error;
  }
  for (const { product, key } of await openBoxes(held, root)) {
    const box = detail.me.productBoxes.find((entry) => entry.product === product);
    if (!box) continue;
    let member: MemberKey;
    try {
      member = await openMemberKeyWithProduct(boxFrom<SealedBox>(box.box), key, orgId, held.accountId, product);
    } catch {
      continue;
    }
    await api.putOrgRootBox(orgId, { box: wire(await sealMemberKeyToRoot(member, root.publicKey, orgId, held.accountId)) });
    return member;
  }
  throw new Error('Your key for your family does not open with this account’s root. Nothing was changed.');
}

async function openFamily(api: HttpSyncAdapter, server: ConsoleAt, orgId: string, proof: ConsoleProof): Promise<OpenedFamily> {
  const held = withRoot(await api.consoleKeys());
  const { root } = await opened(() => openRoot(server, held, proof), proof);
  const detail = await api.org(orgId);
  const member = await memberKeyOf(api, held, root, detail);
  const me = { accountId: held.accountId, memberKey: member.publicKey };
  const { pin, ...read } = await pinOf(server, held.accountId, root, detail);
  const box = detail.me.orgKeyBoxes.find((entry) => entry.generation === detail.org.generation);
  if (!box) throw new Error('You do not hold this family’s key yet: an organiser confirms you first.');
  // Who sent it is named in the roster the server sent; the roster is then
  // checked under the key that opened, so a line changed to let the server's
  // key send it fails one or the other. With a pin, only someone pinned with
  // that key, or vouched for by an organiser pinned (`vouch.ts`), is taken at
  // their word: anyone else is compared first.
  const served = (detail.roster.body as { members?: RosterMember[] }).members ?? [];
  const vouched = (members: readonly RosterMember[], subjects: string[]) =>
    vouchedFor({ orgId, me: member, meId: held.accountId, pin, members, vouches: detail.me.vouches, subjects });
  const senderKey = box.senderId === held.accountId ? member.publicKey : served.find((entry) => entry.accountId === box.senderId)?.memberKey;
  if (!senderKey) throw new Error('The family’s list of members does not name who sent you its key.');
  const pinned = pinnedKey(pin, box.senderId) === senderKey && !retiredKey(pin, senderKey);
  if (box.senderId !== held.accountId && pin && !pinned && (await vouched(served, [box.senderId])).length === 0) {
    throw await compareFirst(orgId, me, { accountId: box.senderId, memberKey: senderKey });
  }
  const orgKey = await openOrgKey(boxFrom<AuthBox>(box.box), { recipient: member, recipientId: held.accountId, senderKey, senderId: box.senderId }, orgId, detail.org.generation);
  const roster = await checkRoster(orgKey, orgId, detail.roster, pin);
  if (rosterKey(roster, held.accountId) !== member.publicKey) throw new Error('The family’s list of members names another key for you.');
  if (rosterKey(roster, box.senderId) !== senderKey) throw new Error('The family’s list of members does not name who sent you its key.');
  // The caller's own key is the one their own box opened: theirs to accept.
  // A key an organiser compared, and said so, is taken as one compared here.
  const compared = [held.accountId, ...(await vouched(roster.body.members, roster.changed))];
  const handed = detail.me.collectionKeyBoxes.filter((entry) => detail.collections.some((collection) => collection.id === entry.collectionId && entry.generation <= collection.generation));
  const next = nextOrgPin(pin, roster, compared, handed);
  await keepPin(api, server, { accountId: held.accountId, root, orgId }, next, read);
  const keyChanged = roster.changed.filter((id) => !compared.includes(id));
  return { accountId: held.accountId, held, root, detail, member, orgKey, roster, keyChanged, pin: next };
}

/**
 * A collection's key of the generation in use, as handed to the caller. One
 * from someone gone opens as from the key the pin kept for them, as a
 * product's does; from someone the pin never had, it is not taken.
 */
async function openHeldCollection(family: OpenedFamily, collectionId: string): Promise<{ key: CryptoKey; generation: number } | null> {
  const collection = family.detail.collections.find((entry) => entry.id === collectionId);
  const box = collection && family.detail.me.collectionKeyBoxes.find((entry) => entry.collectionId === collectionId && entry.generation === collection.generation);
  if (!collection || !box) return null;
  const listed = family.roster.body.members.some((line) => line.accountId === box.senderId);
  const senderKey = listed ? await memberKeyIn(family, box.senderId) : collectionSenderKey(family.pin, box.senderId, collectionId, collection.generation);
  if (!senderKey) return null;
  const key = await openCollectionKey(
    boxFrom<AuthBox>(box.box),
    { recipient: family.member, recipientId: family.accountId, senderKey, senderId: box.senderId },
    { orgId: family.detail.org.id, collectionId, generation: collection.generation },
  );
  return { key, generation: collection.generation };
}

/** A new collection of `product`, its key sealed from the caller to each of `memberIds`, whose keys come from the roster. */
async function createCollectionIn(api: HttpSyncAdapter, family: OpenedFamily, input: { name: string; product: string; memberIds: string[] }): Promise<OrgDetail> {
  const orgId = family.detail.org.id;
  const collectionId = newId();
  const place = { orgId, collectionId, generation: 1 };
  const key = await newCollectionKey();
  const holders = [...new Set([family.accountId, ...input.memberIds])];
  const keyBoxes = [];
  for (const accountId of holders) {
    const from = { sender: family.member, senderId: family.accountId, recipientKey: await memberKeyIn(family, accountId), recipientId: accountId };
    keyBoxes.push({ accountId, box: wire(await sealCollectionKey(key, from, place)) });
  }
  const nameBox = wire(await sealCollectionName(key, input.name, place));
  return api.createCollection(orgId, { id: collectionId, product: input.product, nameBox, holdersBox: wire(await sealCollectionHolders(key, holders, place)), keyBoxes });
}

/**
 * Makes a family, its maker its organiser: a member key, the family key and
 * the first roster, then its first shared collection, of the first product
 * families share (`familyProducts`), named `collectionName`, in the page's own
 * words. Returns the family as its maker sees it.
 */
export async function consoleCreateFamily(
  api: HttpSyncAdapter,
  server: ConsoleAt,
  input: { name: string; collectionName: string; proof: ConsoleProof },
): Promise<OrgDetail> {
  const held = withRoot(await api.consoleKeys());
  const { root } = await opened(() => openRoot(server, held, input.proof), input.proof);
  const orgId = newId();
  const member = await newMemberKey();
  const { rootBox, productBoxes } = await memberBoxes(held, root, member, orgId);
  const orgKey = await newOrgKey();
  const me = held.accountId;
  const roster = await makeRoster(orgKey, orgId, 1, 1, {
    members: [{ accountId: me, role: 'owner', memberKey: member.publicKey, verified: true, confirmedBy: me, confirmedAt: Date.now() }],
    recoveryKey: null,
  });
  const orgKeyBox = await sealOrgKey(orgKey, { sender: member, senderId: me, recipientKey: member.publicKey, recipientId: me }, orgId, 1);
  const detail = await api.createOrg({ id: orgId, kind: 'family', name: input.name, member: { key: member.publicKey, rootBox: wire(rootBox) }, roster, orgKeyBox: wire(orgKeyBox) });
  for (const { product, box } of productBoxes) await api.putOrgProductBox(orgId, product, { box: wire(box) });
  const checked = await checkRoster(orgKey, orgId, roster, null);
  const pin = nextOrgPin(null, checked);
  await keepPin(api, server, { accountId: me, root, orgId }, pin);
  const family: OpenedFamily = { accountId: me, held, root, detail, member, orgKey, roster: checked, keyChanged: [], pin };
  return createCollectionIn(api, family, { name: input.collectionName, product: familyProducts[0]!, memberIds: [] });
}

/** The code each organiser's screen shows the newcomer, made from the newcomer's own key, never from what the server says it is. */
async function joinCodesFor(detail: OrgDetail, accountId: string, member: MemberKey) {
  const codes = [];
  for (const organiser of detail.members.filter((entry) => entry.role === 'owner' && entry.status === 'confirmed')) {
    codes.push({
      organiserId: organiser.accountId,
      name: organiser.name,
      email: organiser.email,
      code: await orgJoinCode({ orgId: detail.org.id, memberId: accountId, memberKey: member.publicKey, organiserId: organiser.accountId, organiserKey: organiser.memberKey }),
    });
  }
  return codes;
}

/**
 * Accepts the invitation to the account's address: a member key, sealed to the
 * root and under each product's key. Returns the family, and the code to
 * compare with each organiser's screen.
 */
export async function consoleAcceptInvite(api: HttpSyncAdapter, server: ConsoleAt, input: { orgId: string; proof: ConsoleProof }) {
  const held = withRoot(await api.consoleKeys());
  const { root } = await opened(() => openRoot(server, held, input.proof), input.proof);
  const member = await newMemberKey();
  const { rootBox, productBoxes } = await memberBoxes(held, root, member, input.orgId);
  await api.acceptOrgInvite(input.orgId, { member: { key: member.publicKey, rootBox: wire(rootBox) } });
  for (const { product, box } of productBoxes) await api.putOrgProductBox(input.orgId, product, { box: wire(box) });
  const detail = await api.org(input.orgId);
  return { detail, codes: await joinCodesFor(detail, held.accountId, member) };
}

/** The codes again, on a later visit: from the member key opened with the root, so the server cannot change what they are made of. */
export async function consoleJoinCodes(api: HttpSyncAdapter, server: ConsoleAt, input: { orgId: string; proof: ConsoleProof }) {
  const held = withRoot(await api.consoleKeys());
  const { root } = await opened(() => openRoot(server, held, input.proof), input.proof);
  const detail = await api.org(input.orgId);
  return joinCodesFor(detail, held.accountId, await memberKeyOf(api, held, root, detail));
}

/** What the organiser said after comparing the codes on the two screens. */
export type JoinComparison = 'match' | 'without-comparing' | 'cancel';

/**
 * Confirms someone waiting: the code from the organiser's own member key and
 * the newcomer's, handed to `compare` to show while the two screens are
 * compared; on a match, or on confirming without comparing, which the roster
 * marks unverified, the family key and the key of each collection the
 * organiser holds (or of `collectionIds`) go to them. On a match, everyone
 * in the family is told so in the organiser's word (`vouch.ts`), and their
 * devices take the key without comparing it again. Null when cancelled,
 * with nothing sent.
 */
export async function consoleConfirmMember(
  api: HttpSyncAdapter,
  server: ConsoleAt,
  input: { orgId: string; accountId: string; proof: ConsoleProof; compare: (code: string) => Promise<JoinComparison>; collectionIds?: string[] },
): Promise<OrgDetail | null> {
  const family = await openFamily(api, server, input.orgId, input.proof);
  const { detail, member, orgKey, roster } = family;
  const newcomer = detail.members.find((entry) => entry.accountId === input.accountId && entry.status === 'accepted');
  if (!newcomer) throw new Error('That person is not waiting to be confirmed.');
  const code = await orgJoinCode({ orgId: input.orgId, memberId: newcomer.accountId, memberKey: newcomer.memberKey, organiserId: family.accountId, organiserKey: member.publicKey });
  const answer = await input.compare(code);
  if (answer === 'cancel') return null;

  const line: RosterMember = {
    accountId: newcomer.accountId,
    role: newcomer.role,
    memberKey: newcomer.memberKey,
    verified: answer === 'match',
    confirmedBy: family.accountId,
    confirmedAt: Date.now(),
  };
  const next = await makeRoster(orgKey, input.orgId, roster.generation, roster.version + 1, nextBody(family, [...roster.body.members, line]));
  const from = { sender: member, senderId: family.accountId, recipientKey: newcomer.memberKey, recipientId: newcomer.accountId };
  const collectionKeyBoxes = [];
  for (const collection of detail.collections) {
    if (input.collectionIds && !input.collectionIds.includes(collection.id)) continue;
    // Its key in use reaches nobody new, and the server refuses it: that holds up this one collection, not the person.
    if (collection.rotationDue) continue;
    const held = await openHeldCollection(family, collection.id);
    if (!held) continue;
    const place = { orgId: input.orgId, collectionId: collection.id, generation: held.generation };
    const holders = await sealedHoldersOf(held.key, input.orgId, collection);
    collectionKeyBoxes.push({
      collectionId: collection.id,
      generation: held.generation,
      box: wire(await sealCollectionKey(held.key, from, place)),
      ...(holders ? { holdersBox: wire(await sealCollectionHolders(held.key, [...holders, newcomer.accountId], place)) } : {}),
    });
  }
  // Invited as an organiser: the recovery key in use too, or they could not help.
  const recoveryKeyBox =
    newcomer.role === 'owner' && detail.recovery.on
      ? wire(await sealOrgRecoveryKey(await openRecoveryKeyOf(family), from, input.orgId, detail.recovery.generation))
      : undefined;
  const vouches = answer === 'match' ? await wordsFor(family, newcomer) : [];
  const confirmed = await api.confirmOrgMember(input.orgId, newcomer.accountId, {
    verified: line.verified,
    roster: next,
    orgKeyBox: wire(await sealOrgKey(orgKey, from, input.orgId, roster.generation)),
    collectionKeyBoxes,
    ...(recoveryKeyBox ? { recoveryKeyBox } : {}),
    ...(vouches.length > 0 ? { vouches } : {}),
  });
  await keepConfirmedKey(api, server, family, newcomer);
  return confirmed;
}

/**
 * The organiser's word that `compared`'s key is theirs, to everyone this
 * browser can seal to, the organiser's own apps too, so someone back with a
 * new key is not compared again on every device.
 */
async function wordsFor(family: OpenedFamily, compared: { accountId: string; memberKey: string }): Promise<{ accountId: string; tag: string }[]> {
  const vouches = [];
  for (const entry of family.roster.body.members) {
    if (entry.accountId === compared.accountId || family.keyChanged.includes(entry.accountId)) continue;
    const fields = { orgId: family.detail.org.id, memberId: compared.accountId, memberKey: compared.memberKey, organiserId: family.accountId, recipientId: entry.accountId };
    vouches.push({ accountId: entry.accountId, tag: await vouchFor(family.member, entry.memberKey, fields) });
  }
  return vouches;
}

/** This browser takes the key it confirmed where it pinned another, for someone coming back. */
async function keepConfirmedKey(api: HttpSyncAdapter, server: ConsoleAt, family: OpenedFamily, member: { accountId: string; memberKey: string }): Promise<void> {
  const kept = pinnedKey(family.pin, member.accountId);
  if (kept === undefined || kept === member.memberKey) return;
  await keepPin(api, server, { accountId: family.accountId, root: family.root, orgId: family.detail.org.id }, trustedOrgPin(family.pin, member.accountId, member.memberKey));
}

/**
 * Compares the code of someone confirmed without it: the code from the
 * organiser's own member key and the one the roster lists, handed to
 * `compare`; on a match the roster marks them verified, and everyone is told
 * in the organiser's word, as a match when joining does. Null when cancelled,
 * with nothing sent.
 */
export async function consoleVerifyMember(
  api: HttpSyncAdapter,
  server: ConsoleAt,
  input: { orgId: string; accountId: string; proof: ConsoleProof; compare: (code: string) => Promise<RecoveryComparison> },
): Promise<OrgDetail | null> {
  const family = await openFamily(api, server, input.orgId, input.proof);
  assertOrganiser(family);
  const { member, orgKey, roster } = family;
  const memberKey = rosterKey(roster, input.accountId);
  const code = await orgJoinCode({ orgId: input.orgId, memberId: input.accountId, memberKey, organiserId: family.accountId, organiserKey: member.publicKey });
  if ((await input.compare(code)) !== 'match') return null;
  const members = roster.body.members.map((line) => (line.accountId === input.accountId ? { ...line, verified: true } : line));
  const next = await makeRoster(orgKey, input.orgId, roster.generation, roster.version + 1, nextBody(family, members));
  const compared = { accountId: input.accountId, memberKey };
  const done = await api.verifyOrgMember(input.orgId, input.accountId, { roster: next, vouches: await wordsFor(family, compared) });
  await keepConfirmedKey(api, server, family, compared);
  return done;
}

/**
 * After someone went: the next family key to everyone left, from the
 * roster's keys; the roster without whoever went; and the next key of each
 * marked collection the organiser holds, to those still in it, its name
 * sealed again under it. A marked collection the organiser does not hold
 * stays marked, for one who does. Old records are sealed again under the new
 * keys by the products, which read them; the page reads none. After the
 * family's key went already, each marked collection the caller holds, an
 * organiser or not.
 */
export async function consoleRotateFamily(api: HttpSyncAdapter, server: ConsoleAt, input: { orgId: string; proof: ConsoleProof }): Promise<OrgDetail> {
  return rotateFamily(api, server, input, false);
}

/**
 * In a family a start over left with no organiser: the caller takes the
 * place, with the next keys, as `consoleRotateFamily` makes them, and a
 * roster that names them an organiser. The server lets only the first of
 * those confirmed through.
 */
export async function consoleTakeOverFamily(api: HttpSyncAdapter, server: ConsoleAt, input: { orgId: string; proof: ConsoleProof }): Promise<OrgDetail> {
  return rotateFamily(api, server, input, true);
}

async function rotateFamily(api: HttpSyncAdapter, server: ConsoleAt, input: { orgId: string; proof: ConsoleProof }, takeOver: boolean): Promise<OrgDetail> {
  const family = await openFamily(api, server, input.orgId, input.proof);
  const { detail, member, roster } = family;
  if (!detail.org.rotationDue) return takeOver ? detail : rotateMarkedCollections(api, family);
  // The family's key is an organiser's, or an heir's, to change.
  if (!takeOver && detail.me.role !== 'owner') return detail;
  const confirmed = new Set(detail.members.filter((entry) => entry.status === 'confirmed').map((entry) => entry.accountId));
  // Someone the server counts in but the roster never listed gets no key.
  for (const accountId of confirmed) rosterKey(roster, accountId);
  const staying = roster.body.members
    .filter((line) => confirmed.has(line.accountId))
    .map((line) => (takeOver && line.accountId === family.accountId ? { ...line, role: 'owner' as const } : line));
  const generation = roster.generation + 1;
  const orgKey = await newOrgKey();
  const next = await makeRoster(orgKey, input.orgId, generation, roster.version + 1, nextBody(family, staying));
  const orgKeyBoxes = [];
  for (const line of staying) {
    const from = { sender: member, senderId: family.accountId, recipientKey: await memberKeyIn(family, line.accountId), recipientId: line.accountId };
    orgKeyBoxes.push({ accountId: line.accountId, box: wire(await sealOrgKey(orgKey, from, input.orgId, generation)) });
  }
  return api.rotateOrg(input.orgId, { generation, roster: next, orgKeyBoxes, collections: await nextCollectionKeys(family) });
}

/**
 * The next key of each marked collection the caller holds, to those its
 * sealed list names who are still in the family, never to whoever the
 * server's list adds; its name and that list sealed again under it. One with
 * no list that opens stays marked.
 */
async function nextCollectionKeys(family: OpenedFamily): Promise<RotateOrgRequest['collections']> {
  const orgId = family.detail.org.id;
  const confirmed = new Set(family.detail.members.filter((entry) => entry.status === 'confirmed').map((entry) => entry.accountId));
  const collections = [];
  for (const collection of family.detail.collections) {
    if (!collection.rotationDue) continue;
    const held = await openHeldCollection(family, collection.id);
    if (!held) continue;
    const holders = (await sealedHoldersOf(held.key, orgId, collection))?.filter((accountId) => confirmed.has(accountId)) ?? [];
    if (holders.length === 0) continue;
    const name = await openCollectionName(held.key, boxFrom<SealedBox>(collection.nameBox), { orgId, collectionId: collection.id, generation: held.generation });
    const place = { orgId, collectionId: collection.id, generation: held.generation + 1 };
    const key = await newCollectionKey();
    const keyBoxes = [];
    for (const accountId of holders) {
      const from = { sender: family.member, senderId: family.accountId, recipientKey: await memberKeyIn(family, accountId), recipientId: accountId };
      keyBoxes.push({ accountId, box: wire(await sealCollectionKey(key, from, place)) });
    }
    const nameBox = wire(await sealCollectionName(key, name, place));
    collections.push({ collectionId: collection.id, generation: place.generation, nameBox, holdersBox: wire(await sealCollectionHolders(key, holders, place)), keyBoxes });
  }
  return collections;
}

/**
 * Each marked collection the caller holds, organiser or not, after the
 * family's key went with someone who did not hold these: an app's new keys
 * (`rotateFamilyKeys`) leave another app's collections marked, and this is
 * where they get theirs if that app never comes. Each goes to exactly those
 * holding it, as the server holds anyone but an organiser to.
 */
async function rotateMarkedCollections(api: HttpSyncAdapter, family: OpenedFamily): Promise<OrgDetail> {
  let detail = family.detail;
  for (const { collectionId, ...next } of await nextCollectionKeys(family)) detail = await api.rotateCollection(detail.org.id, collectionId, next);
  return detail;
}

/**
 * Removes someone, and gives everyone left new keys at once: what they could
 * open stays theirs, what comes after does not. Someone never confirmed held
 * no key, and nothing is rotated.
 */
export async function consoleRemoveFamilyMember(
  api: HttpSyncAdapter,
  server: ConsoleAt,
  input: { orgId: string; accountId: string; proof: ConsoleProof },
): Promise<OrgDetail> {
  await api.removeOrgMember(input.orgId, input.accountId);
  return consoleRotateFamily(api, server, { orgId: input.orgId, proof: input.proof });
}

/**
 * Deletes the family, with all it shares, for everyone: the owner's proof
 * only, as deleting the account asks, since it opens nothing.
 */
export async function consoleDeleteFamily(api: HttpSyncAdapter, server: ConsoleAt, input: { orgId: string; proof: ConsoleProof | ConsoleOwnerProof }): Promise<void> {
  await api.deleteOrg(input.orgId, await ownerOnly(server, input.proof as ConsoleOwnerProof));
}

/**
 * Seals the person's member key under the key of each app the root opens,
 * where that app has no box of it, or one that opens to another key: an app
 * that came to the account after the person joined, on a device that cannot
 * open the root itself (no password, no passkey there). Returns the apps
 * given it.
 */
export async function consoleFamilyKeyToApps(api: HttpSyncAdapter, server: ConsoleAt, input: { orgId: string; proof: ConsoleProof }): Promise<string[]> {
  const family = await openFamily(api, server, input.orgId, input.proof);
  const { accountId, member } = family;
  const given: string[] = [];
  for (const { product, key } of await openBoxes(family.held, family.root)) {
    const box = family.detail.me.productBoxes.find((entry) => entry.product === product);
    const holds = box && (await openMemberKeyWithProduct(boxFrom<SealedBox>(box.box), key, input.orgId, accountId, product).catch(() => null));
    if (holds?.publicKey === member.publicKey) continue;
    await api.putOrgProductBox(input.orgId, product, { box: wire(await sealMemberKeyUnderProduct(member, key, input.orgId, accountId, product)) });
    given.push(product);
  }
  return given;
}

/**
 * The code to compare with someone in the family whose app, or this page,
 * asks for it (`openFamily`'s `compare`, a key that changed): from the
 * person's own member key and the one the roster lists for them, as their
 * app makes it. On a match, `consoleTrustFamilyMember` pins that key here.
 */
export async function consoleFamilyCompareCode(
  api: HttpSyncAdapter,
  server: ConsoleAt,
  input: { orgId: string; accountId: string; proof: ConsoleProof },
): Promise<FamilyCompare> {
  const family = await openFamily(api, server, input.orgId, input.proof);
  const memberKey = rosterKey(family.roster, input.accountId);
  const code = await orgCompareCode(input.orgId, { accountId: family.accountId, memberKey: family.member.publicKey }, { accountId: input.accountId, memberKey });
  return { orgId: input.orgId, accountId: input.accountId, memberKey, code };
}

/** Makes a confirmed member an organiser, or steps the caller down: the roster says who is which, one version up. */
export async function consoleSetFamilyRole(
  api: HttpSyncAdapter,
  server: ConsoleAt,
  input: { orgId: string; accountId: string; role: OrgRole; proof: ConsoleProof },
): Promise<OrgDetail> {
  const family = await openFamily(api, server, input.orgId, input.proof);
  const { roster, orgKey } = family;
  const recipientKey = await memberKeyIn(family, input.accountId);
  const members = roster.body.members.map((line) => (line.accountId === input.accountId ? { ...line, role: input.role } : line));
  // One stepping down who held the recovery key ends it: the server stops it, and the roster lists it no more.
  const stopsRecovery = input.role === 'member' && family.detail.recovery.keyBox != null;
  const body = stopsRecovery ? { ...nextBody(family, members), recoveryKey: null } : nextBody(family, members);
  const next = await makeRoster(orgKey, input.orgId, roster.generation, roster.version + 1, body);
  // A new organiser gets the recovery key in use, from the one naming them, or could not help.
  const recoveryKeyBox =
    input.role === 'owner' && family.detail.recovery.on
      ? wire(
          await sealOrgRecoveryKey(
            await openRecoveryKeyOf(family),
            { sender: family.member, senderId: family.accountId, recipientKey, recipientId: input.accountId },
            input.orgId,
            family.detail.recovery.generation,
          ),
        )
      : undefined;
  return api.setOrgRole(input.orgId, input.accountId, { role: input.role, roster: next, ...(recoveryKeyBox ? { recoveryKeyBox } : {}) });
}

/** A new shared collection of `product`, for the organiser and `memberIds`, named in the person's words. */
export async function consoleCreateCollection(
  api: HttpSyncAdapter,
  server: ConsoleAt,
  input: { orgId: string; name: string; product: string; memberIds: string[]; proof: ConsoleProof },
): Promise<OrgDetail> {
  return createCollectionIn(api, await openFamily(api, server, input.orgId, input.proof), input);
}

/** The names of the collections the caller holds, opened under their keys, by id. */
export async function consoleCollectionNames(api: HttpSyncAdapter, server: ConsoleAt, input: { orgId: string; proof: ConsoleProof }): Promise<Record<string, string>> {
  const family = await openFamily(api, server, input.orgId, input.proof);
  const names: Record<string, string> = Object.create(null) as Record<string, string>;
  for (const collection of family.detail.collections) {
    const held = await openHeldCollection(family, collection.id);
    if (!held) continue;
    names[collection.id] = await openCollectionName(held.key, boxFrom<SealedBox>(collection.nameBox), { orgId: input.orgId, collectionId: collection.id, generation: held.generation });
  }
  return names;
}

/**
 * Names the caller's emergency contact: their root, sealed to the contact's
 * member key from the roster, in a box from their own. Only someone the
 * roster marks as verified: the contact's key was compared when they joined,
 * so the box goes to the person, not to a key the server chose.
 */
export async function consoleSetEmergency(
  api: HttpSyncAdapter,
  server: ConsoleAt,
  input: { orgId: string; granteeId: string; proof: ConsoleProof },
): Promise<OrgDetail> {
  const family = await openFamily(api, server, input.orgId, input.proof);
  const line = family.roster.body.members.find((entry) => entry.accountId === input.granteeId);
  if (!line || input.granteeId === family.accountId) throw new Error('The family’s list of members does not name that person. Load the family again.');
  if (!line.verified) throw new Error('Your emergency contact must be someone whose code was compared when they joined.');
  const recipientKey = await memberKeyIn(family, line.accountId);
  const box = await sealEmergencyBox(family.root, { sender: family.member, senderId: family.accountId, recipientKey, recipientId: line.accountId }, input.orgId);
  return api.setOrgEmergency(input.orgId, { grantee: input.granteeId, box: wire(box) });
}

// --- An organiser recovering a member ---------------------------------------
//
// The recovery key's public half is taken from the roster once its MAC
// checks out, and its private half opens only as from the organiser the
// roster names; a member's root opens only as from that member's key in the
// roster. The member's new browser holds nothing of the account: it trusts
// the organiser's key the server sends only because the two compared a code
// made of it, and proves the root it is handed to the server before
// anything is sealed under the next one.

/** The recovery key in use, as handed to the caller, and only the one the roster lists. */
async function openRecoveryKeyOf(family: OpenedFamily): Promise<OrgRecoveryKey> {
  const { detail, roster } = family;
  const listed = roster.body.recoveryKey;
  if (!detail.recovery.on || !listed || !detail.recovery.keyBox) throw new Error('You do not hold your family’s recovery key. Load the family again.');
  const { senderId, box } = detail.recovery.keyBox;
  return openOrgRecoveryKey(
    boxFrom<AuthBox>(box),
    { recipient: family.member, recipientId: family.accountId, senderKey: await memberKeyIn(family, senderId), senderId },
    detail.org.id,
    detail.recovery.generation,
    listed,
  );
}

function assertOrganiser(family: OpenedFamily): void {
  const line = family.roster.body.members.find((entry) => entry.accountId === family.accountId);
  if (family.detail.me.role !== 'owner' || line?.role !== 'owner') throw new Error('Only an organiser of this family can do that.');
}

/**
 * Turns recovery by an organiser on for the family: a new recovery key, its
 * public half in the roster, its private half to each organiser the roster
 * names. Each member then turns it on for themselves.
 */
export async function consoleTurnOnFamilyRecovery(api: HttpSyncAdapter, server: ConsoleAt, input: { orgId: string; proof: ConsoleProof }): Promise<OrgDetail> {
  const family = await openFamily(api, server, input.orgId, input.proof);
  assertOrganiser(family);
  const { detail, roster, orgKey } = family;
  const confirmed = new Set(detail.members.filter((entry) => entry.status === 'confirmed').map((entry) => entry.accountId));
  const organisers = roster.body.members.filter((line) => line.role === 'owner' && confirmed.has(line.accountId));
  const generation = detail.recovery.generation + 1;
  const recoveryKey = await newOrgRecoveryKey();
  const next = await makeRoster(orgKey, input.orgId, roster.generation, roster.version + 1, { ...roster.body, recoveryKey: recoveryKey.publicKey });
  const keyBoxes = [];
  for (const line of organisers) {
    const from = { sender: family.member, senderId: family.accountId, recipientKey: await memberKeyIn(family, line.accountId), recipientId: line.accountId };
    keyBoxes.push({ accountId: line.accountId, box: wire(await sealOrgRecoveryKey(recoveryKey, from, input.orgId, generation)) });
  }
  return api.turnOnOrgRecovery(input.orgId, { generation, roster: next, keyBoxes });
}

/** Turns it off for the family: the roster lists no recovery key, and every root kept for the organisers goes. */
export async function consoleTurnOffFamilyRecovery(api: HttpSyncAdapter, server: ConsoleAt, input: { orgId: string; proof: ConsoleProof }): Promise<OrgDetail> {
  const family = await openFamily(api, server, input.orgId, input.proof);
  assertOrganiser(family);
  const { roster, orgKey } = family;
  const next = await makeRoster(orgKey, input.orgId, roster.generation, roster.version + 1, { ...roster.body, recoveryKey: null });
  return api.turnOffOrgRecovery(input.orgId, { roster: next });
}

/**
 * The caller lets their family's organisers help them back in: their root,
 * sealed to the recovery key the roster lists, from their own member key.
 * Turning it off opens nothing, so the page asks the server for that.
 */
export async function consoleTurnOnMyRecovery(api: HttpSyncAdapter, server: ConsoleAt, input: { orgId: string; proof: ConsoleProof }): Promise<OrgDetail> {
  const family = await openFamily(api, server, input.orgId, input.proof);
  const listed = family.roster.body.recoveryKey;
  if (!family.detail.recovery.on || !listed) throw new Error('Recovery by an organiser is not on in your family.');
  const box = await sealOrgRecoveryBox(family.root, { member: family.member, accountId: family.accountId, recoveryKey: listed }, input.orgId);
  return api.putOrgRecoveryBox(input.orgId, { generation: family.detail.recovery.generation, box: wire(box) });
}

/** What the organiser said after comparing the codes: there is no going on without comparing. */
export type RecoveryComparison = 'match' | 'cancel';

/**
 * Helps a member back in: the code from the organiser's own member key and
 * the new browser's key, handed to `compare` to show while the two compare
 * it, by phone or side by side; on a match, the member's root, opened with
 * the recovery key as from their member key in the roster, goes to that
 * browser in a box from the organiser's member key. The member is mailed
 * when it is opened. Null when cancelled, with nothing opened.
 */
export async function consoleHelpFamilyMember(
  api: HttpSyncAdapter,
  server: ConsoleAt,
  input: { orgId: string; requestId: string; proof: ConsoleProof; compare: (code: string) => Promise<RecoveryComparison> },
): Promise<OrgDetail | null> {
  const family = await openFamily(api, server, input.orgId, input.proof);
  assertOrganiser(family);
  const request = family.detail.recovery.requests?.find((entry) => entry.id === input.requestId && entry.handedBy === null);
  if (!request) throw new Error('That request is over. Load the family again.');
  if (request.accountId === family.accountId) throw new Error('Ask another organiser of your family to help you.');
  const memberKey = await memberKeyIn(family, request.accountId);
  const parties = { orgId: input.orgId, memberId: request.accountId, requestId: request.id, organiserId: family.accountId, browserKey: request.browserKey };
  const answer = await input.compare(await orgRecoveryCode({ ...parties, organiserKey: family.member.publicKey }));
  if (answer !== 'match') return null;

  const recoveryKey = await openRecoveryKeyOf(family);
  const kept = await api.orgRecoveryBox(input.orgId, request.id);
  if (kept.accountId !== request.accountId || kept.generation !== family.detail.recovery.generation) {
    throw new Error('The server sent the key of someone else. Nothing was handed over.');
  }
  const root = await openOrgRecoveryBox(boxFrom<AuthBox>(kept.box), { recoveryKey, accountId: request.accountId, memberKey }, input.orgId);
  await api.handOverOrgRecovery(input.orgId, request.id, { box: wire(await sealRecoveryHandover(root, family.member, parties)) });
  return api.org(input.orgId);
}

/** Who can help, and the code each one's screen should show. */
export interface FamilyRecoveryCodes {
  organiserId: string;
  name: string | null;
  email: string;
  code: string;
}

/**
 * A member's request for help, as the page holds it while they wait: the
 * new browser's key stays in here, and leaves with nothing but `finish`.
 */
export interface FamilyRecoveryWait {
  orgName: string;
  expiresAt: number;
  /** The code each organiser's screen should show, made from this browser's own key. */
  codes: FamilyRecoveryCodes[];
  /**
   * Null until an organiser hands the key over; then how the account signs
   * in, which says whether `finish` takes a new password.
   */
  handedOver(): Promise<'password' | 'provider' | null>;
  /**
   * Replaces the account's root with the one handed over: a new password on
   * an account with one, the recovery key `consoleMakeRecoveryKey` made and
   * the person saved, every product's key and every family's member key
   * sealed to a new root, and a session for the page.
   */
  finish(input: { newPassword?: string; recoveryKey: string; deviceId: string; deviceName: string; kdf?: AccountKdfParams }): Promise<LoginResponse>;
}

/**
 * Asks the family's organisers for help back in, with the code mailed to the
 * address (`requestFamilyRecoveryCode` first), from a browser that holds
 * nothing of the account. On an account with a second step, `{ secondStep:
 * true }` until `secondStepCode` comes with the same emailed code: nobody is
 * asked before it.
 */
export async function consoleAskFamily(
  server: ConsoleAt,
  input: { email: string; code: string; secondStepCode?: string },
  connect: (session: LoginResponse) => HttpSyncAdapter,
): Promise<FamilyRecoveryWait | FamilyRecoveryStepRequired> {
  const browser = await newHandoverKey();
  const asked = await askFamilyRecovery(
    server.baseUrl,
    { email: input.email, code: input.code, browserKey: browser.publicKey, ...(input.secondStepCode === undefined ? {} : { secondStep: { code: input.secondStepCode } }) },
    server.fetcher,
  );
  if ('secondStep' in asked) return asked;
  const parties = (organiserId: string) => ({ orgId: asked.orgId, memberId: asked.accountId, requestId: asked.id, organiserId, browserKey: browser.publicKey });
  const codes: FamilyRecoveryCodes[] = [];
  for (const organiser of asked.organisers) {
    codes.push({
      organiserId: organiser.accountId,
      name: organiser.name,
      email: organiser.email,
      code: await orgRecoveryCode({ ...parties(organiser.accountId), organiserKey: organiser.memberKey }),
    });
  }
  const status = () => familyRecoveryStatus(server.baseUrl, asked.id, asked.ticket, server.fetcher);

  return {
    orgName: asked.orgName,
    expiresAt: asked.expiresAt,
    codes,
    handedOver: async () => {
      const { handover, keys } = await status();
      return handover && keys ? keys.method : null;
    },
    async finish(finishing) {
      const { handover, keys } = await status();
      if (!handover || !keys) throw new Error('Nobody has handed your account’s key over yet.');
      if (keys.accountId !== asked.accountId) throw new Error('The server answered for another account.');
      // Only from an organiser whose code was shown here, and as from the key it was made of.
      const organiser = asked.organisers.find((entry) => entry.accountId === handover.organiserId);
      if (!organiser) throw new Error('The key was handed over by someone this page showed no code for. Nothing was changed.');
      let root: AccountRoot;
      try {
        root = await openRecoveryHandover(boxFrom<AuthBox>(handover.box), browser, { ...parties(organiser.accountId), organiserKey: organiser.memberKey });
      } catch (error) {
        if (error instanceof DecryptionError) throw new Error('That key did not come from the organiser whose code you checked. Nothing was changed.');
        throw error;
      }
      if (root.publicKey !== keys.root.publicKey) throw new Error('The server reported an account key other than the one handed over.');

      const password = keys.method === 'password';
      if (password && finishing.newPassword === undefined) throw new Error('Choose a new password for this account.');
      const next = password ? await newPasswordKeys(finishing.newPassword!, finishing.kdf) : null;
      const accountId = keys.accountId;
      const opened = [];
      for (const entry of keys.products) {
        if (entry.rootGeneration !== keys.root.generation) continue;
        try {
          opened.push({ product: entry.product, key: await openProductBox(entry.box, root, accountId, entry.product), keyGeneration: entry.keyGeneration });
        } catch {
          throw new Error(`The key of ${entry.product} does not open with this account’s root. Nothing was changed.`);
        }
      }
      const nextRoot = await newAccountRoot();
      const memberRootBoxes = await memberKeysSealedAgain(keys.memberRootBoxes, root, nextRoot, accountId);
      const now = Date.now();
      const products = [];
      for (const { product, key, keyGeneration } of opened) {
        products.push({
          product,
          box: await sealProductBox(key, nextRoot.publicKey, accountId, product),
          pin: await sealRootPin(key, { root: nextRoot.publicKey, sheetVerifiedAt: now }, accountId, product),
          keyCheck: await deriveProductKeyCheck(product, key),
          keyGeneration,
        });
      }
      const session = await finishFamilyRecovery(
        server.baseUrl,
        asked.id,
        {
          ticket: asked.ticket,
          previousRootCheck: await deriveRootCheck(root),
          publicKey: nextRoot.publicKey,
          rootCheck: await deriveRootCheck(nextRoot),
          passwordWrap: next ? await wrapRootUnderPassword(nextRoot, next.keys, accountId) : null,
          recoveryWrap: await wrapRootUnderRecoveryKey(nextRoot, finishing.recoveryKey, accountId),
          recoveryAuthHash: await deriveRecoveryAuthHash(finishing.recoveryKey),
          products,
          memberRootBoxes,
          ...(next ? { newPassword: { authHash: next.keys.authHash, kdf: next.kdf } } : {}),
          deviceId: finishing.deviceId,
          deviceName: finishing.deviceName,
        },
        server.fetcher,
      );
      if (session.account.id !== accountId) throw new Error('The server answered for another account.');
      // Keyrook Authenticator's older builds open a wrap under the password: under the new one now.
      const legacy = next && keys.olderAuthenticator === 'active' ? opened.find((entry) => entry.product === AUTHENTICATOR)?.key : undefined;
      if (legacy) {
        await connect(session).wrapProtectedKey({
          authHash: next!.keys.authHash,
          protectedKey: await wrapDataKey(next!.keys.stretchedKey, legacy),
          keyCheck: await deriveKeyCheck(legacy),
        });
      }
      return session;
    },
  };
}

/**
 * Changing what opens the account (the key design, sections 5 and 6): the
 * password, the recovery key, and the root itself. Each one checks the root
 * it opens against what the server reports before wrapping anything new.
 */
import { generateDataKey, wrapDataKey } from '../crypto/aead.js';
import { sealProductBox } from '../keys/box.js';
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
import { recoverRoot, recoverRootReset, type HttpSyncAdapter } from '../sync/http.js';
import type { AccountKeysResponse, LoginResponse, ProviderTicket } from '../sync/protocol.js';
import { deriveRecoveryAuthHash } from '../sync/recovery.js';
import { openProductKey, type AccountServer, type OpenedProductKey, type ProductKey } from './product-key.js';

function assertStrongPassword(password: string): void {
  const problem = accountPasswordProblem(password);
  if (problem) throw new Error(problem);
}

async function heldFor(api: HttpSyncAdapter, accountId: string): Promise<AccountKeysResponse & { root: NonNullable<AccountKeysResponse['root']> }> {
  const held = await api.accountKeys();
  if (held.accountId !== accountId) throw new Error('The server answered for another account.');
  if (!held.root) throw new Error('The server says this account has no root key, but this device has seen one.');
  return held as AccountKeysResponse & { root: NonNullable<AccountKeysResponse['root']> };
}

function assertReported(root: AccountRoot, held: { root: { publicKey: string } }): void {
  if (root.publicKey !== held.root.publicKey) throw new Error('The server reported an account key other than the one that opened.');
}

async function newPasswordKeys(password: string, kdf?: AccountKdfParams) {
  assertStrongPassword(password);
  const params = kdf ?? newAccountKdfParams();
  return { kdf: params, keys: await deriveAccountKeys(password, params) };
}

/**
 * A forgotten password, with the recovery key and the code emailed to the
 * address (`requestRecoveryCode` first). The recovery key opens the root; the
 * new password wraps it; then this product's key opens as after any sign-in,
 * the recovery key counting as seen here.
 */
export async function recoverAccount(
  server: AccountServer,
  input: {
    email: string;
    recoveryKey: string;
    code: string;
    newPassword: string;
    product: string;
    deviceId: string;
    deviceName: string;
    kdf?: AccountKdfParams;
  },
  /** The product's own adapter for the new session: its token store, its fetcher. */
  connect: (session: LoginResponse) => HttpSyncAdapter,
): Promise<{ session: LoginResponse; kdf: AccountKdfParams; keys: AccountKeys; opened: OpenedProductKey }> {
  const recoveryAuthHash = await deriveRecoveryAuthHash(input.recoveryKey);
  const found = await recoverRoot(server.baseUrl, { email: input.email, recoveryAuthHash }, server.fetcher);
  const root = await openRootWithRecoveryKey(found.recoveryWrap, input.recoveryKey, found.accountId);
  const { kdf, keys } = await newPasswordKeys(input.newPassword, input.kdf);
  const session = await recoverRootReset(
    server.baseUrl,
    {
      email: input.email,
      recoveryAuthHash,
      code: input.code,
      rootCheck: await deriveRootCheck(root),
      authHash: keys.authHash,
      kdf,
      rootPasswordWrap: await wrapRootUnderPassword(root, keys, found.accountId),
      deviceId: input.deviceId,
      deviceName: input.deviceName,
    },
    server.fetcher,
  );
  if (session.account.id !== found.accountId) throw new Error('The server answered for another account.');
  const opened = await openProductKey(connect(session), {
    accountId: found.accountId,
    product: input.product,
    unlockWith: { root },
    recoveryKeyTyped: true,
  });
  return { session, kdf, keys, opened };
}

/**
 * A new password, from a device signed in with the current one. On an account
 * with a root it wraps the root; on one without, which only Keyrook
 * Authenticator uses, it wraps Authenticator's key as it always did. Every
 * other session ends; Authenticator then keeps its older builds working with
 * `keepOlderAuthenticatorWorking`.
 */
export async function changeAccountPassword(
  api: HttpSyncAdapter,
  input: {
    accountId: string;
    product: string;
    keys: AccountKeys;
    newPassword: string;
    /** Keyrook Authenticator's key, on an account without a root. */
    productKey?: ProductKey;
    kdf?: AccountKdfParams;
  },
): Promise<{ kdf: AccountKdfParams; keys: AccountKeys }> {
  const held = await api.accountKeys();
  if (held.accountId !== input.accountId) throw new Error('The server answered for another account.');
  const next = await newPasswordKeys(input.newPassword, input.kdf);
  if (held.root) {
    if (!held.root.passwordWrap) throw new Error('This account has no password to open its keys with.');
    const root = await openRootWithPassword(held.root.passwordWrap, input.keys, input.accountId);
    assertReported(root, held as { root: { publicKey: string } });
    await api.changePassword({
      currentAuthHash: input.keys.authHash,
      authHash: next.keys.authHash,
      kdf: next.kdf,
      rootPasswordWrap: await wrapRootUnderPassword(root, next.keys, input.accountId),
    });
  } else {
    if (input.product !== AUTHENTICATOR || !input.productKey) throw new Error('This account has no root key yet.');
    await api.changePassword({
      currentAuthHash: input.keys.authHash,
      authHash: next.keys.authHash,
      kdf: next.kdf,
      protectedKey: await wrapDataKey(next.keys.stretchedKey, input.productKey.key),
    });
  }
  return next;
}

/**
 * A new recovery key, which retires the last (section 5). Opened with the
 * password, or the current recovery key and a fresh provider sign-in on an
 * account without one. `keepsRecoveryKey`: the recovery key given is Keyrook
 * Authenticator's kit's, typed again so it protects every product too.
 */
export async function replaceRecoveryKey(
  api: HttpSyncAdapter,
  input: {
    productKey: ProductKey;
    with: { keys: AccountKeys } | { recoveryKey: string; reauth: ProviderTicket };
    /** The recovery key of Keyrook Authenticator's kit, to wrap the root under instead of a new one. */
    keepsRecoveryKey?: string;
  },
): Promise<{ recoveryKey: string | null; productKey: ProductKey }> {
  const { accountId, product, key } = input.productKey;
  const held = await heldFor(api, accountId);
  let root: AccountRoot;
  if ('keys' in input.with) {
    if (!held.root.passwordWrap) throw new Error('This account has no password to open its keys with.');
    root = await openRootWithPassword(held.root.passwordWrap, input.with.keys, accountId);
  } else {
    if (!held.root.recoveryWrap) throw new Error('This account has no recovery key yet.');
    root = await openRootWithRecoveryKey(held.root.recoveryWrap, input.with.recoveryKey, accountId);
  }
  assertReported(root, held);

  const sheet = input.keepsRecoveryKey ?? generateRecoveryKey();
  await api.setRootRecovery({
    recoveryWrap: await wrapRootUnderRecoveryKey(root, sheet, accountId),
    recoveryAuthHash: await deriveRecoveryAuthHash(sheet),
    rootCheck: await deriveRootCheck(root),
    ...(input.keepsRecoveryKey !== undefined ? { keepsRecoveryKey: true } : {}),
    ...('keys' in input.with ? { authHash: input.with.keys.authHash } : { reauth: input.with.reauth }),
  });

  let productKey = input.productKey;
  // This product saw the recovery key made, or typed, here: its pin says so.
  // A pin names a root; one sealed to an older root waits for confirmation.
  if (productKey.root === root.publicKey && held.box) {
    const now = Date.now();
    const updated = await api.updateBox({
      box: held.box.box,
      pin: await sealRootPin(key, { root: root.publicKey, sheetVerifiedAt: now }, accountId, product),
      keyCheck: await deriveProductKeyCheck(product, key),
      rootGeneration: held.root.generation,
      keyGeneration: productKey.keyGeneration,
    });
    productKey = { ...productKey, keyGeneration: updated.box?.keyGeneration ?? productKey.keyGeneration, sheetVerifiedAt: now };
  }
  return { recoveryKey: input.keepsRecoveryKey === undefined ? sheet : null, productKey };
}

/**
 * Replaces the account's root, from a device holding this product's key
 * (section 5): the recovery key leaked, was lost on an account without a
 * password, or the password is forgotten while this device is open. The old
 * recovery key opens nothing afterwards; other products seal to the new root
 * once the person confirms it on each.
 *
 * `newProductKey`: the recovery key leaked, so this product's key is replaced
 * too. The device keeps the old key until every record is sealed again under
 * the new one and pushed with a higher revision — in that order, or records
 * are lost (section 5).
 */
export async function replaceAccountRoot(
  api: HttpSyncAdapter,
  input: {
    productKey: ProductKey;
    method: 'password' | 'provider';
    proof:
      | { keys: AccountKeys }
      | { reauth: ProviderTicket }
      | { code: string; newPassword: string; kdf?: AccountKdfParams };
    newProductKey?: boolean;
  },
): Promise<{ productKey: ProductKey; recoveryKey: string; password?: { kdf: AccountKdfParams; keys: AccountKeys } }> {
  const { accountId, product } = input.productKey;
  const root = await newAccountRoot();
  const recoveryKey = generateRecoveryKey();
  const password = 'newPassword' in input.proof ? await newPasswordKeys(input.proof.newPassword, input.proof.kdf) : undefined;
  const wrapKeys = password?.keys ?? ('keys' in input.proof ? input.proof.keys : null);
  if (input.method === 'password' && !wrapKeys) throw new Error('A password account’s root must be wrapped under the password.');
  const key = input.newProductKey ? await generateDataKey() : input.productKey.key;
  const now = Date.now();

  const replaced = await api.rotateRoot({
    publicKey: root.publicKey,
    rootCheck: await deriveRootCheck(root),
    passwordWrap: input.method === 'password' ? await wrapRootUnderPassword(root, wrapKeys!, accountId) : null,
    recoveryWrap: await wrapRootUnderRecoveryKey(root, recoveryKey, accountId),
    recoveryAuthHash: await deriveRecoveryAuthHash(recoveryKey),
    box: await sealProductBox(key, root.publicKey, accountId, product),
    pin: await sealRootPin(key, { root: root.publicKey, sheetVerifiedAt: now }, accountId, product),
    keyCheck: await deriveProductKeyCheck(product, key),
    ...(input.newProductKey ? { previousKeyCheck: await deriveProductKeyCheck(product, input.productKey.key) } : {}),
    ...('keys' in input.proof ? { authHash: input.proof.keys.authHash } : {}),
    ...('reauth' in input.proof ? { reauth: input.proof.reauth } : {}),
    ...(password && 'code' in input.proof
      ? { code: input.proof.code, newPassword: { authHash: password.keys.authHash, kdf: password.kdf } }
      : {}),
  });
  if (replaced.accountId !== accountId || replaced.root?.publicKey !== root.publicKey) {
    throw new Error('The server answered for another account.');
  }
  return {
    productKey: {
      accountId,
      product,
      key,
      keyGeneration: replaced.box?.keyGeneration ?? input.productKey.keyGeneration,
      root: root.publicKey,
      rootGeneration: replaced.root.generation,
      sheetVerifiedAt: now,
    },
    recoveryKey,
    ...(password ? { password } : {}),
  };
}

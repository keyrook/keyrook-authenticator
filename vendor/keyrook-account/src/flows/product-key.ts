/**
 * The flows of the key design (sections 4, 5 and 10), as one product's device
 * runs them: making an account, opening this product's key with the password
 * or the recovery key, joining an account another product made, and taking a
 * new root another product made.
 *
 * Every flow checks what the server hands it against what it opened or pinned
 * itself. The root's private half is opened only inside a flow and dropped
 * before it returns; what a product keeps is a `ProductKey`.
 */
import { DecryptionError, generateDataKey, wrapDataKey } from '../crypto/aead.js';
import { openProductBox, sealProductBox } from '../keys/box.js';
import { openRootPin, sealRootPin } from '../keys/pin.js';
import { AUTHENTICATOR, assertProductName, deriveProductKeyCheck } from '../keys/product.js';
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
  assertAcceptableAccountKdf,
  deriveAccountKeys,
  newAccountKdfParams,
  type AccountKdfParams,
  type AccountKeys,
} from '../sync/account.js';
import { generateRecoveryKey } from '../sync/kit.js';
import { prelogin, providerRegister, register, SyncHttpError, type Fetcher, type HttpSyncAdapter } from '../sync/http.js';
import type { AccountKeysResponse, InitialKeys, LoginResponse, ProviderLogin, ProviderTicket, SecondStepProof } from '../sync/protocol.js';
import { deriveKeyCheck, deriveRecoveryAuthHash } from '../sync/recovery.js';

/** Where the account lives, for the calls made before there is a session. */
export interface AccountServer {
  baseUrl: string;
  /** Sends `x-keyrook-client` (`namedClient`); a browser adds the extension's origin. */
  fetcher?: Fetcher;
}

/** What one product's device holds once it has its key. Never the root's private half. */
export interface ProductKey {
  accountId: string;
  product: string;
  key: CryptoKey;
  keyGeneration: number;
  /** The root's public half this product trusts, as its pin, sealed under its own key, says. */
  root: string;
  rootGeneration: number;
  /**
   * When this product last saw for itself that the recovery key protects it:
   * it made the recovery key, or the key was typed here. Null if never; the
   * product then says the recovery key does not protect it yet (section 4).
   */
  sheetVerifiedAt: number | null;
}

/**
 * The account's keys for a password. The KDF parameters come from the server
 * before anything is authenticated, so they are checked, not trusted.
 */
export async function passwordKeys(
  server: AccountServer,
  email: string,
  password: string,
): Promise<{ kdf: AccountKdfParams; keys: AccountKeys }> {
  const kdf = await prelogin(server.baseUrl, email, server.fetcher);
  assertAcceptableAccountKdf(kdf);
  return { kdf, keys: await deriveAccountKeys(password, kdf) };
}

function assertStrongPassword(password: string): void {
  const problem = accountPasswordProblem(password);
  if (problem) throw new Error(problem);
}

function assertNotAuthenticator(product: string): void {
  assertProductName(product);
  // Keyrook Authenticator signs up without a root, as it always has: a root is
  // made only when a second product joins, so its older builds are refused as
  // little as possible (the key design, section 10).
  if (product === AUTHENTICATOR) throw new Error('Keyrook Authenticator makes an account without a root.');
}

function assertSameAccount(held: AccountKeysResponse, accountId: string): void {
  if (held.accountId !== accountId) throw new Error('The server answered for another account.');
}

/** A new root, wrapped as the account signs in, and this product's key sealed to it. */
async function initialKeys(
  accountId: string,
  product: string,
  under: { keys: AccountKeys | null; recoveryKey: string },
): Promise<{ initial: InitialKeys; productKey: ProductKey }> {
  const root = await newAccountRoot();
  const key = await generateDataKey();
  const now = Date.now();
  const initial: InitialKeys = {
    accountId,
    root: {
      publicKey: root.publicKey,
      rootCheck: await deriveRootCheck(root),
      passwordWrap: under.keys ? await wrapRootUnderPassword(root, under.keys, accountId) : null,
      recoveryWrap: await wrapRootUnderRecoveryKey(root, under.recoveryKey, accountId),
      recoveryAuthHash: await deriveRecoveryAuthHash(under.recoveryKey),
    },
    box: await sealProductBox(key, root.publicKey, accountId, product),
    // The recovery key was made here, so this product has seen it protect it.
    pin: await sealRootPin(key, { root: root.publicKey, sheetVerifiedAt: now }, accountId, product),
    keyCheck: await deriveProductKeyCheck(product, key),
  };
  return {
    initial,
    productKey: { accountId, product, key, keyGeneration: 1, root: root.publicKey, rootGeneration: 1, sheetVerifiedAt: now },
  };
}

export interface NewAccount {
  session: LoginResponse;
  productKey: ProductKey;
  /** Shown once, for the person to print or write down. Kept nowhere. */
  recoveryKey: string;
}

/** Makes an account with a password, its root and this product's key, after the emailed code. */
export async function createAccount(
  server: AccountServer,
  input: {
    email: string;
    code: string;
    password: string;
    product: string;
    deviceId: string;
    deviceName: string;
    /** Only to make tests quick; a new account otherwise takes the default. */
    kdf?: AccountKdfParams;
  },
): Promise<NewAccount> {
  assertNotAuthenticator(input.product);
  assertStrongPassword(input.password);
  const kdf = input.kdf ?? newAccountKdfParams();
  const keys = await deriveAccountKeys(input.password, kdf);
  const accountId = crypto.randomUUID();
  const recoveryKey = generateRecoveryKey();
  const { initial, productKey } = await initialKeys(accountId, input.product, { keys, recoveryKey });
  const session = await register(
    server.baseUrl,
    {
      email: input.email,
      code: input.code,
      authHash: keys.authHash,
      kdf,
      keys: initial,
      deviceId: input.deviceId,
      deviceName: input.deviceName,
    },
    server.fetcher,
  );
  if (session.account.id !== accountId) throw new Error('The server made the account under another id.');
  return { session, productKey, recoveryKey };
}

/**
 * Makes an account that signs in with Google or GitHub. With no password, the
 * recovery key is the only way back in once every device is gone, so the root
 * is wrapped under it from the start.
 */
export async function createProviderAccount(
  server: AccountServer,
  input: { signupToken: string; product: string; deviceId: string; deviceName: string },
): Promise<{ session: ProviderLogin; productKey: ProductKey; recoveryKey: string }> {
  assertNotAuthenticator(input.product);
  const accountId = crypto.randomUUID();
  const recoveryKey = generateRecoveryKey();
  const { initial, productKey } = await initialKeys(accountId, input.product, { keys: null, recoveryKey });
  const session = await providerRegister(
    server.baseUrl,
    { signupToken: input.signupToken, keys: initial, deviceId: input.deviceId, deviceName: input.deviceName },
    server.fetcher,
  );
  if (session.account.id !== accountId) throw new Error('The server made the account under another id.');
  return { session, productKey, recoveryKey };
}

export type OpenedProductKey =
  /**
   * This product's key, from its box. `rootChanged`: the root is not the one
   * this device last pinned. `mustReplace`: the recovery key leaked, and this
   * product replaces its key now (`replaceProductKey`).
   */
  | { status: 'open'; productKey: ProductKey; rootChanged: boolean; mustReplace: boolean }
  /**
   * This product had no key on the account, and now has one. `tookOtherKey`:
   * another device of this product sealed its key first, and this device must
   * seal what it holds under `productKey.key` instead of its own.
   */
  | { status: 'joined'; productKey: ProductKey; tookOtherKey: boolean }
  /**
   * The account has no root. Keyrook Authenticator goes on as before; any other
   * product tells the person and calls `createAccountRoot`.
   */
  | { status: 'no-root' }
  /**
   * This product's key is sealed to an earlier root: another product replaced
   * the root. A device of this product that holds the key confirms the new
   * one (`sealToRoot`), or approves this device.
   */
  | { status: 'awaiting-confirmation'; root: string };

/**
 * Opens this product's key after signing in: with the password's keys, or a
 * root opened with the recovery key. The root's public half is the one the
 * private half just opened, never the one the server reports; a server that
 * reports another is caught here.
 */
export async function openProductKey(
  api: HttpSyncAdapter,
  input: {
    accountId: string;
    product: string;
    unlockWith: { keys: AccountKeys } | { root: AccountRoot };
    /**
     * A key this product already holds on this device: Keyrook Authenticator's
     * vault key, sealed as its first key on an account another product made.
     */
    existingKey?: CryptoKey;
    /** The root this device last pinned, if it has been signed in before. */
    pinned?: { root: string };
    /** The recovery key was typed on this device just now. */
    recoveryKeyTyped?: boolean;
  },
): Promise<OpenedProductKey> {
  assertProductName(input.product);
  const held = await api.accountKeys();
  assertSameAccount(held, input.accountId);
  if (!held.root) {
    // A server can hide a root to make a product seal to a second one; a
    // device that has seen the root knows better (section 4).
    if (input.pinned) throw new Error('The server says this account has no root key, but this device has seen one.');
    return { status: 'no-root' };
  }
  const root = await rootFrom(held, input.accountId, input.unlockWith);
  return withRoot(api, held, root, input);
}

async function rootFrom(
  held: AccountKeysResponse,
  accountId: string,
  unlockWith: { keys: AccountKeys } | { root: AccountRoot },
): Promise<AccountRoot> {
  let root: AccountRoot;
  if ('root' in unlockWith) {
    root = unlockWith.root;
  } else {
    if (!held.root?.passwordWrap) throw new Error('This account has no password to open its keys with.');
    root = await openRootWithPassword(held.root.passwordWrap, unlockWith.keys, accountId);
  }
  if (root.publicKey !== held.root!.publicKey) {
    throw new Error('The server reported an account key other than the one that opened.');
  }
  return root;
}

async function withRoot(
  api: HttpSyncAdapter,
  held: AccountKeysResponse,
  root: AccountRoot,
  input: { accountId: string; product: string; existingKey?: CryptoKey; pinned?: { root: string }; recoveryKeyTyped?: boolean },
): Promise<OpenedProductKey> {
  const { accountId, product } = input;
  const current = held.root!;
  const typedAt = input.recoveryKeyTyped ? Date.now() : null;

  if (held.box) {
    let key: CryptoKey;
    try {
      key = await openProductBox(held.box.box, root, accountId, product);
    } catch (error) {
      // Sealed to a root this one is not. Only a device that holds the key
      // can seal it again, and only after the person confirms there.
      if (error instanceof DecryptionError) return { status: 'awaiting-confirmation', root: root.publicKey };
      throw error;
    }
    const pin = await openRootPin(key, held.box.pin, accountId, product);
    const samePin = pin.root === root.publicKey;
    // What a pin said about the recovery key was about the root it named.
    const sheetVerifiedAt = typedAt ?? (samePin ? pin.sheetVerifiedAt : null);
    let keyGeneration = held.box.keyGeneration;
    if (!samePin || sheetVerifiedAt !== pin.sheetVerifiedAt) {
      // The box opened with the root the password or recovery key just
      // opened, so that root is the one to pin.
      const updated = await api.updateBox({
        box: held.box.box,
        pin: await sealRootPin(key, { root: root.publicKey, sheetVerifiedAt }, accountId, product),
        keyCheck: await deriveProductKeyCheck(product, key),
        rootGeneration: current.generation,
        keyGeneration,
      });
      keyGeneration = updated.box?.keyGeneration ?? keyGeneration;
    }
    return {
      status: 'open',
      productKey: { accountId, product, key, keyGeneration, root: root.publicKey, rootGeneration: current.generation, sheetVerifiedAt },
      rootChanged: !samePin || (input.pinned !== undefined && input.pinned.root !== root.publicKey),
      mustReplace: held.box.mustReplace,
    };
  }

  const key = input.existingKey ?? (await generateDataKey());
  try {
    const created = await api.createBox({
      box: await sealProductBox(key, root.publicKey, accountId, product),
      pin: await sealRootPin(key, { root: root.publicKey, sheetVerifiedAt: typedAt }, accountId, product),
      keyCheck: await deriveProductKeyCheck(product, key),
      rootGeneration: current.generation,
    });
    return {
      status: 'joined',
      productKey: {
        accountId,
        product,
        key,
        keyGeneration: created.box?.keyGeneration ?? 1,
        root: root.publicKey,
        rootGeneration: current.generation,
        sheetVerifiedAt: typedAt,
      },
      tookOtherKey: false,
    };
  } catch (error) {
    if (!(error instanceof SyncHttpError) || error.status !== 409) throw error;
    // Another device of this product joined first: one key per product, and
    // it is that one (section 5).
    const again = await api.accountKeys();
    assertSameAccount(again, accountId);
    if (!again.box || again.root?.publicKey !== root.publicKey) throw error;
    const opened = await withRoot(api, again, root, { ...input, existingKey: undefined });
    return opened.status === 'open' ? { status: 'joined', productKey: opened.productKey, tookOtherKey: true } : opened;
  }
}

/**
 * Checks the recovery key typed whole on this product's screen: it must open
 * the account's root here, the root the server reports. Returns that root, for
 * `openProductKey` with `recoveryKeyTyped`, which is what records on this
 * product's own pin that the recovery key protects it. The server is told as
 * well, only so that nobody is reminded to look for it for a while.
 */
export async function checkRecoveryKey(api: HttpSyncAdapter, accountId: string, recoveryKey: string): Promise<AccountRoot> {
  const held = await api.accountKeys();
  assertSameAccount(held, accountId);
  if (!held.root?.recoveryWrap) throw new Error('This account has no recovery key yet.');
  let root: AccountRoot;
  try {
    root = await openRootWithRecoveryKey(held.root.recoveryWrap, recoveryKey, accountId);
  } catch (error) {
    if (error instanceof DecryptionError) throw new Error('That recovery key does not open this account.');
    throw error;
  }
  if (root.publicKey !== held.root.publicKey) throw new Error('The server reported an account key other than the one that opened.');
  await api.recoveryChecked({ rootRecoveryAuthHash: await deriveRecoveryAuthHash(recoveryKey) });
  return root;
}

/**
 * Gives an account without a root its root, from a product that is not its
 * first: the person was told, signed in again, and chose to (section 4). The
 * recovery key it is wrapped under is the one the account already has — typed
 * again, and checked with the server without opening the old kit's wrap — or a
 * new one, returned once.
 */
export async function createAccountRoot(
  api: HttpSyncAdapter,
  input: {
    accountId: string;
    product: string;
    /** The password's keys, on an account with a password. */
    keys?: AccountKeys;
    /** A fresh sign-in with the provider, on an account without one. */
    reauth?: ProviderTicket;
    /** On an account with a second step, beside the password or the sign-in (`secondStepProof`). */
    secondStep?: SecondStepProof;
    /** The recovery key the account already has, if the person has it. */
    recoveryKey?: string;
    existingKey?: CryptoKey;
  },
): Promise<{ opened: OpenedProductKey; recoveryKey: string | null }> {
  assertProductName(input.product);
  const root = await newAccountRoot();
  const sheet = input.recoveryKey ?? generateRecoveryKey();
  try {
    await api.createRoot({
      publicKey: root.publicKey,
      rootCheck: await deriveRootCheck(root),
      passwordWrap: input.keys ? await wrapRootUnderPassword(root, input.keys, input.accountId) : null,
      recoveryWrap: await wrapRootUnderRecoveryKey(root, sheet, input.accountId),
      recoveryAuthHash: await deriveRecoveryAuthHash(sheet),
      ...(input.recoveryKey !== undefined ? { keepsRecoveryKey: true } : {}),
      ...(input.keys ? { authHash: input.keys.authHash } : {}),
      ...(input.reauth ? { reauth: input.reauth } : {}),
      ...(input.secondStep ? { secondStep: input.secondStep } : {}),
    });
  } catch (error) {
    // Another device made the root first: open that one instead.
    if (error instanceof SyncHttpError && error.status === 409 && input.keys) {
      const opened = await openProductKey(api, {
        accountId: input.accountId,
        product: input.product,
        unlockWith: { keys: input.keys },
        ...(input.existingKey ? { existingKey: input.existingKey } : {}),
      });
      return { opened, recoveryKey: null };
    }
    throw error;
  }
  const held = await api.accountKeys();
  assertSameAccount(held, input.accountId);
  const opened = await withRoot(api, held, await rootFrom(held, input.accountId, { root }), {
    accountId: input.accountId,
    product: input.product,
    ...(input.existingKey ? { existingKey: input.existingKey } : {}),
    // Made here, or typed here and checked against the account's.
    recoveryKeyTyped: true,
  });
  return { opened, recoveryKey: input.recoveryKey === undefined ? sheet : null };
}

/**
 * The root's public half, checked with the password: after another product
 * replaced the root, typing the password here is what lets this product
 * accept the new one (section 4).
 */
export async function rootOpenedByPassword(api: HttpSyncAdapter, accountId: string, keys: AccountKeys): Promise<string> {
  const held = await api.accountKeys();
  assertSameAccount(held, accountId);
  if (!held.root) throw new Error('The server says this account has no root key, but this device has seen one.');
  return (await rootFrom(held, accountId, { keys })).publicKey;
}

/**
 * Seals this product's key to the account's current root, which the person
 * confirmed on this device: by typing the password (`rootOpenedByPassword`),
 * or by comparing `rootConfirmCode` with a device that made it. Never on the
 * word of another extension (section 4).
 */
export async function sealToRoot(api: HttpSyncAdapter, productKey: ProductKey, confirmedRoot: string): Promise<ProductKey> {
  const { accountId, product, key } = productKey;
  const held = await api.accountKeys();
  assertSameAccount(held, accountId);
  if (!held.root || held.root.publicKey !== confirmedRoot) {
    throw new Error('The account key is not the one you confirmed. Look again.');
  }
  const updated = await api.updateBox({
    box: await sealProductBox(key, confirmedRoot, accountId, product),
    pin: await sealRootPin(key, { root: confirmedRoot, sheetVerifiedAt: null }, accountId, product),
    keyCheck: await deriveProductKeyCheck(product, key),
    rootGeneration: held.root.generation,
    keyGeneration: productKey.keyGeneration,
  });
  return {
    ...productKey,
    keyGeneration: updated.box?.keyGeneration ?? productKey.keyGeneration,
    root: confirmedRoot,
    rootGeneration: held.root.generation,
    sheetVerifiedAt: null,
  };
}

/**
 * Keyrook Authenticator wraps its key under the password again, so its older
 * builds keep signing in (section 7). `retired`: they can no longer use this
 * account, because the key was replaced or the account started over.
 */
export async function keepOlderAuthenticatorWorking(
  api: HttpSyncAdapter,
  input: { keys: AccountKeys; productKey: ProductKey },
): Promise<'wrapped' | 'retired'> {
  if (input.productKey.product !== AUTHENTICATOR) throw new Error('Only Keyrook Authenticator has older builds to keep working.');
  try {
    await api.wrapProtectedKey({
      authHash: input.keys.authHash,
      protectedKey: await wrapDataKey(input.keys.stretchedKey, input.productKey.key),
      keyCheck: await deriveKeyCheck(input.productKey.key),
    });
    return 'wrapped';
  } catch (error) {
    if (error instanceof SyncHttpError && error.status === 409) return 'retired';
    throw error;
  }
}

/**
 * Replaces this product's key, after the recovery key leaked (`mustReplace`,
 * the key design's section 5): whoever read the recovery key could have opened
 * the old key, and everything sealed under it.
 *
 * Returns the new key and the previous one. The order after this matters, or
 * records are lost: keep the previous key; open every record with it, seal it
 * again under the new key and push it with a higher revision; only when every
 * record is pushed, forget the previous key. Until then, a record this device
 * pulls may still be sealed under the previous key.
 *
 * The new box is sealed to the root this product pinned, and the server
 * refuses it unless that is the account's root now.
 */
export async function replaceProductKey(
  api: HttpSyncAdapter,
  productKey: ProductKey,
): Promise<{ productKey: ProductKey; previousKey: CryptoKey }> {
  const { accountId, product } = productKey;
  assertProductName(product);
  const held = await api.accountKeys();
  assertSameAccount(held, accountId);
  if (!held.root || !held.box) throw new Error('This product has no key on this account yet.');
  // A root this product has not confirmed is not one to seal a new key to.
  if (held.root.publicKey !== productKey.root) {
    throw new Error('The account’s root key changed. Open this product’s key again before replacing it.');
  }
  const key = await generateDataKey();
  const updated = await api.replaceBox({
    box: await sealProductBox(key, productKey.root, accountId, product),
    pin: await sealRootPin(key, { root: productKey.root, sheetVerifiedAt: productKey.sheetVerifiedAt }, accountId, product),
    keyCheck: await deriveProductKeyCheck(product, key),
    previousKeyCheck: await deriveProductKeyCheck(product, productKey.key),
    keyGeneration: productKey.keyGeneration,
    rootGeneration: held.root.generation,
  });
  assertSameAccount(updated, accountId);
  return {
    productKey: {
      ...productKey,
      key,
      keyGeneration: updated.box?.keyGeneration ?? productKey.keyGeneration + 1,
      rootGeneration: held.root.generation,
    },
    previousKey: productKey.key,
  };
}

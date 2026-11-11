/**
 * Keyrook Authenticator's key on a Keyrook account, under keys per product
 * (keyrook-account's design). The vault key is this product's key: opening it
 * at sign-in, keeping 0.3 builds signing in, and replacing it when the
 * account asks — the recovery key leaked.
 *
 * What a device keeps of it is `AccountKeyState`, inside the sealed vault: the
 * root it pinned, which a server reporting another root, or none, cannot get
 * past; and, while a replacement is going up, the key it replaced.
 */
import {
  adoptDataKey,
  DecryptionError,
  deriveKeyCheck,
  deriveRecoveryAuthHash,
  isWellFormedRecoveryKey,
  openRootWithRecoveryKey,
  openArchivedKey,
  readArchivedRecords,
  recordToItem,
  exportDataKey,
  importDataKey,
  keepOlderAuthenticatorWorking,
  openProductKey,
  replaceProductKey,
  unwrapDataKey,
  updateAccount,
  SyncHttpError,
  type AccountKeys,
  type AccountKeysResponse,
  type AccountKeyState,
  type HttpSyncAdapter,
  type Keyring,
  type LoginResponse,
  type PendingStartOver,
  type ProductKey,
  type UnlockedVault,
  type VaultData,
  type VaultFile,
} from '@authx/core';
import { platform } from './platform.js';
import { adapter, noteSessionAccount, PRODUCT } from './sync.js';
import { fail } from '@authx/ui/i18n/errors.js';
import type { KeptArchive } from '@authx/ui/lib/protocol.js';

export interface OpenedAccountKey {
  /** The account's key for this product: the vault's key from now on. */
  dataKey: CryptoKey;
  /** Absent while the account has no root, as every account made before 0.4. */
  keys?: AccountKeyState;
  /** The account asks for the key to be replaced (`replaceAccountKey`). */
  mustReplace: boolean;
}

export function keyStateOf(productKey: ProductKey, previousKey?: string): AccountKeyState {
  return {
    accountId: productKey.accountId,
    root: productKey.root,
    rootGeneration: productKey.rootGeneration,
    keyGeneration: productKey.keyGeneration,
    sheetVerifiedAt: productKey.sheetVerifiedAt,
    ...(previousKey ? { previousKey } : {}),
  };
}

function productKeyOf(state: AccountKeyState, key: CryptoKey): ProductKey {
  return {
    accountId: state.accountId,
    product: PRODUCT,
    key,
    keyGeneration: state.keyGeneration,
    root: state.root,
    rootGeneration: state.rootGeneration,
    sheetVerifiedAt: state.sheetVerifiedAt,
  };
}

/**
 * Opens this product's key with the password, right after signing in and
 * before the session is kept: a sign-in that cannot reach the key leaves the
 * device as it was.
 *
 * `localKey` is this vault's own key, sealed as the product's first key on an
 * account another product made — but only when the account holds no key of
 * this product's at all. When the login brings one under the password (the
 * key every build before 0.4 uses), that is the one: sealing the vault's own
 * instead would leave every record already synced unreadable.
 */
export async function openAccountKey(
  api: HttpSyncAdapter,
  input: { session: LoginResponse; keys: AccountKeys; localKey: CryptoKey; pinned?: AccountKeyState },
): Promise<OpenedAccountKey> {
  const { session, keys } = input;
  const legacy = session.protectedKey ? await unwrapDataKey(keys.stretchedKey, session.protectedKey) : null;
  const pinned = input.pinned?.accountId === session.account.id ? input.pinned : undefined;
  const opened = await openProductKey(api, {
    accountId: session.account.id,
    product: PRODUCT,
    unlockWith: { keys },
    existingKey: legacy ?? input.localKey,
    ...(pinned ? { pinned: { root: pinned.root } } : {}),
  });

  switch (opened.status) {
    case 'no-root':
      // As before keys per product. A password account with no root always
      // has its key under the password; one without is not an answer to trust.
      if (!legacy) throw new Error('The server reported an account key other than the one that opened.');
      return { dataKey: legacy, mustReplace: false };
    case 'awaiting-confirmation':
      // Another product replaced the root. Only a device that already holds
      // this product's key can seal it to the new one, once the person there
      // confirms it.
      fail('error.keys.awaitingConfirmation');
    case 'open':
    case 'joined': {
      // A login without the key under the password is an account whose 0.3
      // builds lost it: wrapped again, they sign in again. 'retired' means
      // the account has moved past them for good, which is the server's call.
      if (!session.protectedKey) await keepOlderAuthenticatorWorking(api, { keys, productKey: opened.productKey });
      return {
        dataKey: opened.productKey.key,
        keys: keyStateOf(opened.productKey),
        mustReplace: opened.status === 'open' && opened.mustReplace,
      };
    }
  }
}

const CHECKED_AT = 'authx.keysCheckedAt';
const DUE = 'authx.keyReplaceDue';
const WAITING = 'authx.startOverWaiting';
const ADDRESS = 'authx.accountAddress';
/** How often a signed-in device asks whether its key must be replaced, a start over waits, or the address moved. */
const CHECK_EVERY_MS = 60 * 60 * 1000;

/** The last answer about a start over, for the account signed in as `email` then. */
interface Waiting {
  email: string | null;
  at: number;
  pending: PendingStartOver | null;
}

/** The account's address as the server last said it, asked while this vault had the address `of`. */
interface Address {
  at: number;
  of: string | null;
  email: string | null;
}

/** What the server holds for the account, with what it says is waiting kept for the pages. */
async function askAccount(data: VaultData): Promise<AccountKeysResponse> {
  const held = await adapter().accountKeys();
  await noteSessionAccount(held.accountId);
  // A server from before 27 October 2026 never makes a start over wait, and
  // does not say.
  const waiting: Waiting = { email: data.account.email, at: Date.now(), pending: held.pendingStartOver ?? null };
  await platform().memory.set(WAITING, waiting);
  // Nor, before migration 12, the address.
  const address: Address = { at: Date.now(), of: data.account.email, email: typeof held.email === 'string' ? held.email : null };
  await platform().memory.set(ADDRESS, address);
  return held;
}

/** An address, as far as one can be told apart from anything else a server might send: RFC 5321's length, one @, nothing invisible. */
const isAddress = (email: string) => email.length <= 254 && /^[^\s@\p{C}]+@[^\s@\p{C}]+$/u.test(email);

/**
 * The account's address, when the server says it is no longer the one this
 * vault has: it was moved on the account page (keyrook-account's U2), which
 * keeps every session. Asked at most hourly, unless `fresh`.
 *
 * Not only for showing: the KDF's parameters are asked for by address, and
 * the old one opens nothing once it moved, so a vault keeping it would have
 * the right password refused. Believing the server here gives it nothing it
 * lacks — it answers that prelogin either way — and what is not an address is
 * left alone.
 */
export async function movedAddress(data: VaultData, fresh = false): Promise<string | null> {
  const current = data.account.email;
  if (!current) return null;
  const known = (await platform().memory.get(ADDRESS)) as Address | undefined;
  // An answer given while this vault had another address may be another
  // account's: signed out, then in elsewhere, within the hour.
  const remembered = !fresh && known?.of === current && Date.now() - known.at < CHECK_EVERY_MS;
  const said = remembered ? known.email : ((await askAccount(data)).email ?? null);
  if (typeof said !== 'string' || !isAddress(said)) return null;
  // As the person typed it at sign-in, it may differ in case alone.
  return said.toLowerCase() === current.trim().toLowerCase() ? null : said;
}

/** Remembers, for this browser session, that the account asked for a new key. */
export async function markReplacementDue(due: boolean): Promise<void> {
  if (due) await platform().memory.set(DUE, true);
  else await platform().memory.remove(DUE);
}

/**
 * Whether the account asks this product for a new key. Asked at most hourly,
 * and remembered once it says yes, until the replacement is done.
 */
export async function replacementDue(data: VaultData): Promise<boolean> {
  const state = data.account.keys;
  if (!state) return false;
  if ((await platform().memory.get(DUE)) === true) return true;
  const checkedAt = (await platform().memory.get(CHECKED_AT)) as number | undefined;
  if (checkedAt !== undefined && Date.now() - checkedAt < CHECK_EVERY_MS) return false;
  const held = await askAccount(data);
  await platform().memory.set(CHECKED_AT, Date.now());
  // Another account, another root or no key of ours: not one this device
  // pinned, so not one it acts on here. Signing in again sorts it out.
  const due =
    held.accountId === state.accountId && held.root?.publicKey === state.root && held.box?.mustReplace === true;
  await markReplacementDue(due);
  return due;
}

/**
 * A start over asked for with the account's email alone, still waiting its
 * week. Whoever holds the inbox can ask for one; besides the account page, a
 * device still signed in is the only place it can be stopped, so the popup
 * asks too — at most hourly, unless `fresh`. An answer for another address
 * is never shown: the device may have signed in to another account since.
 */
export async function startOverWaiting(data: VaultData, fresh: boolean): Promise<PendingStartOver | null> {
  const known = (await platform().memory.get(WAITING)) as Waiting | undefined;
  if (!fresh && known && known.email === data.account.email && Date.now() - known.at < CHECK_EVERY_MS) {
    return known.pending;
  }
  return (await askAccount(data)).pendingStartOver ?? null;
}

/** Cancels the start over waiting. Nothing then changes on the account. */
export async function cancelStartOver(data: VaultData): Promise<void> {
  try {
    await adapter().cancelStartOver();
  } catch (error) {
    // Nothing waiting: another device cancelled it first, which is what was
    // asked here too.
    if (!(error instanceof SyncHttpError && error.status === 404)) throw error;
  }
  const waiting: Waiting = { email: data.account.email, at: Date.now(), pending: null };
  await platform().memory.set(WAITING, waiting);
}

/**
 * Replaces this product's key, after the account's recovery key leaked.
 * Everything here was pulled by the cycle that came first, so this device
 * holds every record; what follows keeps the order that loses none:
 *
 * 1. The server takes the new key, and only then is it known.
 * 2. The vault is sealed under it at once, the replaced key kept inside, so a
 *    browser closing now loses neither.
 * 3. Every record is marked to go up again, a revision higher, under the new
 *    key — the next cycle sends them, opening with the old key whatever
 *    arrives sealed under it meanwhile.
 * 4. Only when nothing is left to send is the old key dropped (`settleKeys`).
 *
 * Needs the keyring: the vault is sealed again, so a vault with a master
 * password does this when it is unlocked with it.
 */
export async function replaceAccountKey(
  unlocked: UnlockedVault,
  keyring: Keyring,
): Promise<{ file: VaultFile; dataKey: CryptoKey; data: VaultData }> {
  const state = unlocked.data.account.keys;
  if (!state) fail('error.server.noProductKey');
  const { productKey, previousKey } = await replaceProductKey(adapter(), productKeyOf(state, unlocked.dataKey));
  const data = updateAccount(
    {
      ...unlocked.data,
      // A revision above anything the server holds, so each replaces the box
      // sealed under the old key. Never sent tombstones stay unsent.
      items: unlocked.data.items.map((item) =>
        item.rev === 0 ? item : { ...item, rev: Math.max(item.rev, item.syncedRev) + 1 },
      ),
    },
    { keys: keyStateOf(productKey, await exportDataKey(previousKey)) },
  );
  await markReplacementDue(false);
  return {
    file: await adoptDataKey(unlocked.file, keyring, productKey.key, data),
    dataKey: productKey.key,
    data,
  };
}

/** The keys a cycle may still meet records sealed under. */
export async function previousKeys(data: VaultData): Promise<CryptoKey[]> {
  const previous = data.account.keys?.previousKey;
  return previous ? [await importDataKey(previous)] : [];
}

/**
 * After a cycle: once nothing is waiting to go up, every record on the server
 * is under the current key, and the replaced one is dropped for good.
 */
export function settleKeys(data: VaultData): VaultData {
  const state = data.account.keys;
  if (!state?.previousKey || data.items.some((item) => item.rev > item.syncedRev)) return data;
  const { previousKey: _dropped, ...kept } = state;
  void _dropped;
  return updateAccount(data, { keys: kept });
}

/**
 * The account's recovery key, typed here once, recorded as protecting this
 * app. Only this app can record it: the mark is in its pin, sealed under its
 * own key, which neither the server nor the account page holds. So an account
 * made on account.keyrook.com or by another app reads "not known" here until
 * the sheet is typed in this app, whatever the page shows.
 *
 * The key opens the root on this device, from the wrap the server keeps; it
 * is never sent, only the proof of it the server has held since it was made. The root must open this app's box to a key that is this
 * vault's own — a server handing over another account's wrap, or another
 * root, gets nothing recorded.
 */
export async function confirmRecoveryKey(data: VaultData, dataKey: CryptoKey, recoveryKey: string): Promise<VaultData> {
  const state = data.account.keys;
  // Without a root the recovery key is this app's own kit, made under Security.
  if (!state) fail('error.kitOnAccountPage');
  if (!isWellFormedRecoveryKey(recoveryKey)) fail('error.recoveryKeyMalformed');
  const api = adapter();
  const held = await api.accountKeys();
  if (held.accountId !== state.accountId) throw new Error('The server answered for another account.');
  if (!held.root?.recoveryWrap) fail('error.noAccountSheet');

  let root;
  try {
    root = await openRootWithRecoveryKey(held.root.recoveryWrap, recoveryKey, state.accountId);
  } catch (error) {
    if (error instanceof DecryptionError) fail('error.recoveryKeyWrong');
    throw error;
  }
  const opened = await openProductKey(api, {
    accountId: state.accountId,
    product: PRODUCT,
    unlockWith: { root },
    pinned: { root: state.root },
    recoveryKeyTyped: true,
  });
  if (opened.status !== 'open') throw new Error('The server reported an account key other than the one that opened.');
  if ((await deriveKeyCheck(opened.productKey.key)) !== (await deriveKeyCheck(dataKey))) {
    throw new Error('The server reported an account key other than the one that opened.');
  }
  // The server notes the day, only to remind people to look for the key
  // again; what counts here is the pin just written. So a failure costs a
  // reminder and nothing more — and a server from before 27 October 2026
  // has no such route at all.
  await api.recoveryChecked({ rootRecoveryAuthHash: await deriveRecoveryAuthHash(recoveryKey) }).catch(() => undefined);
  return updateAccount(data, { keys: keyStateOf(opened.productKey, state.previousKey) });
}

/** What the account kept of this app's from before it started over, if anything. */
export async function keptArchives(): Promise<KeptArchive[]> {
  return (await adapter().archives())
    .filter((archive) => archive.records > 0)
    .map((archive) => ({
      id: archive.id,
      archivedAt: archive.archivedAt,
      expiresAt: archive.expiresAt,
      records: archive.records,
      byPassword: archive.kdf !== null && Boolean(archive.root?.underPassword || archive.legacy?.underPassword),
      byRecoveryKey: Boolean(archive.root?.underRecoveryKey || archive.legacy?.underRecoveryKey),
    }));
}

/**
 * Brings back what the account kept when it started over: the records,
 * opened with this app's key of then, which only the old password or the old
 * recovery key opens. Each comes back as a change to send, since the account
 * holds none of them now; one this vault already has stays as it is here.
 * The archive itself is left to expire, or to the account page.
 */
export async function bringBack(
  data: VaultData,
  archiveId: string,
  proof: { password: string } | { recoveryKey: string },
): Promise<{ data: VaultData; brought: number }> {
  const accountId = data.account.keys?.accountId;
  if (!accountId) fail('error.server.noProductKey');
  const api = adapter();
  const archive = (await api.archives()).find((candidate) => candidate.id === archiveId);
  if (!archive) fail('error.server.archiveGone');

  let key: CryptoKey;
  try {
    key = await openArchivedKey(api, { archive, accountId, product: PRODUCT, with: proof });
  } catch (error) {
    // A password of then that is not the one says so the way the server does.
    if (error instanceof DecryptionError) fail('error.server.archiveWrongKey');
    throw error;
  }

  const held = new Set(data.items.map((item) => item.id));
  const back = [];
  for await (const page of readArchivedRecords(api, archiveId)) {
    for (const record of page) {
      if (record.kind !== 'item' || record.deleted || held.has(record.id)) continue;
      try {
        const item = await recordToItem(record, key);
        // Not on the server any more: a change to send, like one made here.
        back.push({ ...item, rev: Math.max(item.rev, 1), syncedRev: 0 });
        held.add(record.id);
      } catch (error) {
        // Kept by the same server that keeps everything else: one that will
        // not open is skipped, as in a sync.
        if (!(error instanceof DecryptionError)) throw error;
      }
    }
  }
  return { data: { ...data, items: [...data.items, ...back] }, brought: back.length };
}

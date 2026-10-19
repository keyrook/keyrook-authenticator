/**
 * The sync engine: pure functions over a `VaultData` and a `SyncAdapter`.
 *
 * No `chrome.*`, no storage, no timers — the extension supplies those. Keeping
 * merge logic here means the desktop and mobile apps inherit it, and that the
 * cases that are painful to reproduce by hand (two devices, one asleep, one
 * deleting) are ordinary unit tests.
 */
import {
  DecryptionError,
  openJson,
  openRecoveryState,
  resolveConflict,
  sealJson,
  type AccountRecoveryState,
  type RemoteRecord,
  type SyncAdapter,
} from '@keyrook/account';
import { utf8 } from '../util/bytes.js';
import type { VaultData, VaultItem } from '../vault/model.js';

/**
 * What travels inside the encrypted box.
 *
 * The bookkeeping the server needs to order changes — id, revision, tombstone,
 * timestamp — lives in the plaintext envelope, so duplicating it in here would
 * only create two copies that can disagree.
 */
type ItemContent = Omit<VaultItem, 'id' | 'rev' | 'syncedRev' | 'deletedAt' | 'updatedAt'>;

function contentOf(item: VaultItem): ItemContent {
  const { id, rev, syncedRev, deletedAt, updatedAt, ...content } = item;
  void id;
  void rev;
  void syncedRev;
  void deletedAt;
  void updatedAt;
  return content;
}

/**
 * Binds a record's ciphertext to the identity and revision it was sealed under.
 *
 * Without this the box is just "something encrypted with the account key", and
 * the server — which controls every plaintext field around it — can move one
 * account's ciphertext onto another account's record, or serve an old box back
 * under a newer revision. Neither needs the key. Both are silent.
 *
 * With it, changing `id` or `rev` in the envelope turns the record into one
 * that will not open, which is what a tamper should look like.
 */
function recordAad(id: string, rev: number): Uint8Array {
  return utf8(`authx.record:v1:${id}:${rev}`);
}

export async function itemToRecord(
  item: VaultItem,
  dataKey: CryptoKey,
  deviceId: string,
): Promise<RemoteRecord> {
  return {
    id: item.id,
    kind: 'item',
    serverRev: 0,
    rev: item.rev,
    deleted: item.deletedAt !== null,
    updatedAt: item.updatedAt,
    deviceId,
    // A tombstone carries no ciphertext: once an account is deleted, there is
    // no reason to keep shipping its secret around.
    box:
      item.deletedAt !== null
        ? null
        : await sealJson(dataKey, contentOf(item), recordAad(item.id, item.rev)),
  };
}

export async function recordToItem(
  record: RemoteRecord,
  dataKey: CryptoKey,
  previous?: VaultItem,
): Promise<VaultItem> {
  // A tombstone has nothing to decrypt. Keep whatever content we already had so
  // a restore is possible; fall back to a husk when the record is new to us.
  const content: ItemContent = record.box
    ? await openJson<ItemContent>(dataKey, record.box, recordAad(record.id, record.rev))
    : previous
      ? contentOf(previous)
      : {
          type: 'totp',
          issuer: '',
          label: '',
          secret: '',
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          counter: 0,
          note: '',
          icon: null,
          groupId: null,
          favorite: false,
          domains: [],
          createdAt: record.updatedAt,
        };

  return {
    ...content,
    id: record.id,
    updatedAt: record.updatedAt,
    deletedAt: record.deleted ? record.updatedAt : null,
    rev: record.rev,
    // Straight from the server, so by definition it is in sync.
    syncedRev: record.rev,
  };
}

export interface MergeReport {
  data: VaultData;
  applied: number;
  kept: number;
  /**
   * Records that would not open. Counted rather than thrown, because one of
   * them used to abort the whole cycle — which let a single corrupt or forged
   * record stop a vault syncing for good.
   */
  rejected: number;
  /** Accounts this merge tombstoned, so the UI can say so rather than just lose them. */
  deleted: number;
}

/**
 * Fold remote records into local data.
 *
 * A local item that has no unpushed changes always yields — there is nothing to
 * lose. Only a genuinely diverged item goes to `resolveConflict`, which prefers
 * a deletion over an edit and otherwise takes the later write.
 */
export async function mergeRecords(
  data: VaultData,
  records: RemoteRecord[],
  dataKey: CryptoKey,
  previousKeys: CryptoKey[] = [],
): Promise<MergeReport> {
  const byId = new Map(data.items.map((item) => [item.id, item]));
  let applied = 0;
  let kept = 0;
  let rejected = 0;
  let deleted = 0;

  /** Applies a remote record, counting a deletion and refusing a forgery. */
  const take = async (record: RemoteRecord, local?: VaultItem): Promise<boolean> => {
    let next = await openWith(record, [dataKey, ...previousKeys], local);
    if (next === null) {
      // A record that will not open is either corrupt or forged. Skipping it
      // keeps the rest of the vault syncing; throwing would let one bad record
      // stop everything, which is a denial of service the server can trigger
      // at will.
      rejected += 1;
      return false;
    }
    if (next.opener !== dataKey) {
      // Sealed under a key this account has since replaced: taken, and sent
      // back under the current one, a revision up so it replaces the old box.
      next = { ...next, item: { ...next.item, rev: record.rev + 1, syncedRev: record.rev } };
    }

    if (next.item.deletedAt !== null && local?.deletedAt == null) deleted += 1;
    byId.set(record.id, next.item);
    applied += 1;
    return true;
  };

  for (const record of records) {
    if (record.kind !== 'item') continue;
    const local = byId.get(record.id);

    if (!local) {
      // The deletion of an account this vault never had: nothing here to
      // remove, to keep restorable, or to tell anyone about. Taken, it was an
      // empty "Untitled" entry in Recently deleted, counted as removed on
      // another device — and restoring it sent an account with no key to
      // every device.
      if (record.deleted) continue;
      await take(record);
      continue;
    }

    const localIsDirty = local.rev > local.syncedRev;
    if (!localIsDirty) {
      // A clean local copy yields — but only to something newer. Without this
      // the server can replay an older record over a current one and roll the
      // account back to a secret that was rotated away.
      if (record.rev > local.rev) await take(record, local);
      continue;
    }

    const winner = resolveConflict(
      { updatedAt: local.updatedAt, deleted: local.deletedAt !== null },
      { updatedAt: record.updatedAt, deleted: record.deleted },
    );

    if (winner === 'remote') {
      await take(record, local);
    } else {
      // Local wins, but it must now out-rank what the server holds or the next
      // push is rejected as stale and the two sides never converge.
      byId.set(record.id, { ...local, rev: Math.max(local.rev, record.rev + 1) });
      kept += 1;
    }
  }

  return { data: { ...data, items: [...byId.values()] }, applied, kept, rejected, deleted };
}

/** The record opened with the first key that opens it, and which key that was; null if none does. */
async function openWith(
  record: RemoteRecord,
  keys: CryptoKey[],
  local?: VaultItem,
): Promise<{ item: VaultItem; opener: CryptoKey } | null> {
  for (const key of keys) {
    try {
      return { item: await recordToItem(record, key, local), opener: key };
    } catch (error) {
      if (!(error instanceof DecryptionError)) throw error;
    }
  }
  return null;
}

/** Items with local changes the server has not acknowledged. */
export function pendingItems(data: VaultData): VaultItem[] {
  return data.items.filter((item) => item.rev > item.syncedRev);
}

export interface SyncOutcome {
  data: VaultData;
  pulled: number;
  pushed: number;
  /** Diverged items where the local copy won and will be pushed again. */
  conflicts: number;
  /** Items past the account's ceiling. Kept on the device, never dropped. */
  rejectedForLimit: number;
  /** Records that would not open — corrupt, or forged by whoever served them. */
  rejectedRecords: number;
  /** Accounts a pull removed, so the UI can say so rather than silently lose them. */
  deleted: number;
  serverRev: number;
  /**
   * The server had been restored from a backup. This cycle read everything it
   * holds again and sent back what it had lost.
   */
  serverRestored: boolean;
  /**
   * A newer account recovery-kit state than this device had, for the caller to
   * install in its vault file. Its `issuedAt` is already the new floor in
   * `data.sync.recoveryAt`.
   */
  recovery?: AccountRecoveryState;
}

export interface SyncOptions {
  adapter: SyncAdapter;
  dataKey: CryptoKey;
  /**
   * Keys the account's key replaced, while records sealed under them may
   * still be on the server. What opens only with one of them is taken and
   * sent back under `dataKey`.
   */
  previousKeys?: CryptoKey[];
  /** Guards against a server that always reports `hasMore`. */
  maxPages?: number;
}

/**
 * Keeps an incoming kit state only if it is authentic and newer than anything
 * this device has seen. The server cannot forge one — it is sealed under the
 * data key — but it holds every state it was ever sent, and serving an older
 * one back would bring a retired sheet back to life.
 */
async function newerRecoveryState(
  box: RemoteRecord['box'],
  dataKey: CryptoKey,
  floor: number,
): Promise<AccountRecoveryState | 'rejected' | null> {
  if (!box) return null;
  try {
    const state = await openRecoveryState(dataKey, box);
    return state.issuedAt > floor ? state : null;
  } catch {
    return 'rejected';
  }
}

/**
 * One full cycle: pull everything new, merge it, then push what is still local.
 *
 * Pull-then-push is deliberate. Pushing first would let this device overwrite a
 * change it has not seen yet, and the conflict it would then be handed is the
 * one it just caused.
 *
 * A server restored from a backup has forgotten whatever changed after the
 * backup, and its revision counter has gone back with it. Pulling from where
 * this device left off would then skip everything written since the restore
 * below that point, and what this device sent before it would sit here marked
 * as synced while no other device could ever get it. So when the server's
 * epoch changes, the cycle starts from zero and sends back every account the
 * server holds an older copy of, or none.
 */
export async function syncOnce(data: VaultData, options: SyncOptions): Promise<SyncOutcome> {
  const { adapter, dataKey, previousKeys = [], maxPages = 100 } = options;

  let working = data;
  let serverRev = data.sync.serverRev;
  let epoch = data.sync.epoch;
  let pulled = 0;
  let conflicts = 0;
  let rejectedRecords = 0;
  let deleted = 0;
  let recovery: AccountRecoveryState | undefined;
  let recoveryFloor = data.sync.recoveryAt ?? 0;
  /** After a restore: the revision of each record the server still holds. */
  let held: Map<string, number> | null = null;

  for (let page = 0; page < maxPages; page++) {
    let result = await adapter.pull(serverRev);
    if (page === 0 && result.epoch !== undefined && result.epoch !== epoch) {
      // A device that has never synced simply learns the epoch. Otherwise the
      // server's history is not the one this device was in step with.
      if (epoch !== undefined) {
        held = new Map();
        if (serverRev !== 0) {
          serverRev = 0;
          result = await adapter.pull(0);
        }
      }
      epoch = result.epoch;
    }
    if (held) for (const record of result.records) held.set(record.id, record.rev);

    const incoming = await newerRecoveryState(result.recovery ?? null, dataKey, recoveryFloor);
    if (incoming === 'rejected') {
      // Counted with the records that would not open: the same signal, from
      // the same source, and just as unable to stop the rest of the cycle.
      rejectedRecords += 1;
    } else if (incoming) {
      recovery = incoming;
      recoveryFloor = incoming.issuedAt;
    }
    if (result.records.length > 0) {
      const merged = await mergeRecords(working, result.records, dataKey, previousKeys);
      working = merged.data;
      pulled += merged.applied;
      conflicts += merged.kept;
      rejectedRecords += merged.rejected;
      deleted += merged.deleted;
    }
    serverRev = result.serverRev;
    if (!result.hasMore) break;
  }

  if (held) {
    // What this device holds at a newer revision than the restored server
    // goes back up. A hostile server gains nothing by claiming a restore: the
    // merge above still refused to let anything older replace a local copy,
    // and what is sent is what the server was already given once.
    const restored = held;
    working = {
      ...working,
      items: working.items.map((item) =>
        (restored.get(item.id) ?? 0) < item.rev && item.syncedRev === item.rev
          ? { ...item, syncedRev: 0 }
          : item,
      ),
    };
  }

  const pending = pendingItems(working);
  let pushed = 0;
  let rejectedForLimit = 0;

  if (pending.length > 0) {
    const records = await Promise.all(
      pending.map((item) => itemToRecord(item, dataKey, working.sync.deviceId)),
    );
    const result = await adapter.push(records, serverRev);

    const acknowledged = new Map(result.accepted.map((entry) => [entry.id, entry.rev]));
    working = {
      ...working,
      items: working.items.map((item) => {
        const rev = acknowledged.get(item.id);
        return rev === undefined ? item : { ...item, syncedRev: rev };
      }),
    };
    pushed = result.accepted.length;
    rejectedForLimit = result.rejectedForLimit?.length ?? 0;

    // The server held a newer revision for these. Fold them in now rather than
    // waiting for the next cycle, so one call leaves both sides agreeing.
    if (result.conflicts.length > 0) {
      const merged = await mergeRecords(working, result.conflicts, dataKey, previousKeys);
      working = merged.data;
      pulled += merged.applied;
      conflicts += merged.kept;
      rejectedRecords += merged.rejected;
      deleted += merged.deleted;
    }
    serverRev = result.serverRev;
  }

  return {
    data: {
      ...working,
      sync: {
        ...working.sync,
        serverRev,
        lastSyncAt: Date.now(),
        recoveryAt: recoveryFloor,
        ...(epoch !== undefined ? { epoch } : {}),
      },
    },
    pulled,
    pushed,
    conflicts,
    rejectedForLimit,
    rejectedRecords,
    deleted,
    serverRev,
    serverRestored: held !== null,
    ...(recovery ? { recovery } : {}),
  };
}

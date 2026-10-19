/**
 * Sync protocol contract. v1 ships `LocalOnlyAdapter`; the SaaS backend will
 * implement the same interface, so nothing above this line changes when sync
 * arrives.
 *
 * Design constraint: the server only ever sees ciphertext. Each record carries
 * its own sealed blob plus the plaintext metadata the server needs to order and
 * deduplicate changes.
 */
import type { SealedBox } from '../crypto/aead.js';

export interface RemoteRecord {
  id: string;
  /**
   * Each product writes kinds of its own: Keyrook Authenticator `item` and
   * `group`, Passhold `passhold.*`. Every kind arrives in every pull: skip any
   * kind you do not know, never act on it.
   */
  kind: 'item' | 'group' | (string & {});
  /** Server-assigned, monotonically increasing across the whole account. */
  serverRev: number;
  /** Client revision, used to detect a lost update. */
  rev: number;
  deleted: boolean;
  updatedAt: number;
  deviceId: string;
  /** The record, sealed by the product that wrote it. Absent for tombstones. */
  box: SealedBox | null;
}

export interface PullResult {
  records: RemoteRecord[];
  serverRev: number;
  /** True when more pages remain; call `pull` again with the new `serverRev`. */
  hasMore: boolean;
  /** The account's sealed recovery-kit state, when it changed since the pull began. */
  recovery?: SealedBox;
  /**
   * Changes when the server was restored from a backup. A device that sees it
   * change pulls from zero and sends back whatever the server no longer has.
   */
  epoch?: string;
}

export interface PushResult {
  /** Records the server accepted, with their assigned `serverRev`. */
  accepted: { id: string; rev: number; serverRev: number }[];
  /** Records rejected because the server holds a newer revision. */
  conflicts: RemoteRecord[];
  serverRev: number;
  /**
   * Records refused by the account's ceiling on live accounts. They are *not*
   * deleted anywhere — the client keeps them on the device and says so. A
   * ceiling that destroyed a 2FA entry would be indefensible.
   */
  rejectedForLimit?: { id: string }[];
}

export interface SyncAdapter {
  readonly id: string;
  isAvailable(): Promise<boolean>;
  pull(sinceServerRev: number): Promise<PullResult>;
  push(records: RemoteRecord[], baseServerRev?: number): Promise<PushResult>;
}

/** No-op adapter for the local-only build. */
export class LocalOnlyAdapter implements SyncAdapter {
  readonly id = 'local';

  async isAvailable(): Promise<boolean> {
    return false;
  }

  async pull(): Promise<PullResult> {
    return { records: [], serverRev: 0, hasMore: false };
  }

  async push(): Promise<PushResult> {
    return { accepted: [], conflicts: [], serverRev: 0 };
  }
}

export type ConflictResolution = 'local' | 'remote' | 'duplicate';

/**
 * Default policy for a diverged record. Deletions win over edits so that
 * removing a compromised account on one device cannot be undone by a stale
 * edit on another; otherwise last-write-wins on `updatedAt`.
 */
export function resolveConflict(
  local: { updatedAt: number; deleted: boolean },
  remote: { updatedAt: number; deleted: boolean },
): ConflictResolution {
  if (local.deleted !== remote.deleted) return local.deleted ? 'local' : 'remote';
  if (local.updatedAt === remote.updatedAt) return 'local';
  return local.updatedAt > remote.updatedAt ? 'local' : 'remote';
}

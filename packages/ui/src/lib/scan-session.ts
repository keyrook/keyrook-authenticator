import {
  dedupeAgainst,
  importFromText,
  isMigrationUri,
  parseMigrationUri,
  type VaultItem,
} from '@authx/core';

/**
 * What a run of camera scans has done so far, and what the next frame means.
 *
 * A camera held on a QR decodes it every few frames, and a Google Authenticator
 * export with many accounts is several QR codes shown one after another. Both
 * facts turn "add what was scanned, then close" into the wrong behaviour: the
 * first stores the same accounts over and over, the second closes the scanner
 * after one code of three.
 *
 * Kept outside React so every decision here — which frames to ignore, what
 * counts as progress, when an export is complete — is tested without a camera,
 * a browser, or a vault.
 */
export interface ScanSession {
  /** Payloads already acted on, so a code still in view is read once. */
  readonly handled: ReadonlySet<string>;
  /** What this session stored, to skip it if it is shown again. */
  readonly stored: readonly VaultItem[];
  /** The multi-code export in progress, if the last code began or continued one. */
  readonly batch: BatchProgress | null;
  readonly added: number;
  readonly skipped: number;
}

export interface BatchProgress {
  readonly id: number;
  readonly size: number;
  readonly seen: ReadonlySet<number>;
}

export type ScanPlan =
  /** Already acted on; say nothing, keep scanning. */
  | { kind: 'ignore' }
  /** Not something to store. `next` remembers it so the reason is not repeated every frame. */
  | { kind: 'reject'; reason: string; next: ScanSession }
  /**
   * Store `items` — possibly none, when a code only held accounts already
   * present — then adopt `next`. `finished` says whether to stop scanning.
   */
  | { kind: 'store'; items: VaultItem[]; finished: boolean; next: ScanSession };

/**
 * The most codes an export may claim to span.
 *
 * `batchSize` is written by whoever made the QR, and anyone can make one. A
 * code claiming to be part 1 of a million would leave the scanner waiting for
 * parts that will never come; one claiming part 7 of 3 would never be counted
 * complete. Neither is dangerous, but both leave the user watching a progress
 * line that lies. Far more codes than any real export needs.
 */
const MAX_BATCH = 100;

export function startSession(): ScanSession {
  return { handled: new Set(), stored: [], batch: null, added: 0, skipped: 0 };
}

/**
 * Decide what a decoded payload means for this session. Pure: the caller does
 * the storing, and adopts `next` only once that has succeeded — otherwise a
 * refused write would be remembered as done and never retried.
 *
 * `existing` is the vault as the caller last saw it. It may lag a write this
 * session has just made, which is why `stored` is consulted as well.
 */
export function planScan(session: ScanSession, text: string, existing: readonly VaultItem[]): ScanPlan {
  if (session.handled.has(text)) return { kind: 'ignore' };

  const handled = new Set(session.handled).add(text);
  const result = importFromText(text);
  if (result.items.length === 0) {
    return {
      kind: 'reject',
      reason: result.errors[0]?.reason ?? 'That QR code is not a 2FA setup code.',
      next: { ...session, handled },
    };
  }

  const { fresh, duplicates } = dedupeAgainst([...existing, ...session.stored], result.items);
  const part = batchPart(text);

  if (!part) {
    // A single code. On its own it completes the session; in the middle of an
    // export it is simply added and the export carries on.
    if (fresh.length === 0) {
      return { kind: 'reject', reason: 'That account is already in your vault.', next: { ...session, handled } };
    }
    return {
      kind: 'store',
      items: fresh,
      finished: session.batch === null,
      next: advance(session, handled, fresh, duplicates.length, session.batch),
    };
  }

  // A new id means a new export — most likely the user backed out and began
  // again. Progress on the old one is abandoned; what it stored stays stored,
  // and the dedupe above keeps the overlap from being stored twice.
  const previous = session.batch?.id === part.id ? session.batch.seen : new Set<number>();
  const batch: BatchProgress = { id: part.id, size: part.size, seen: new Set(previous).add(part.index) };

  return {
    kind: 'store',
    items: fresh,
    finished: batch.seen.size >= batch.size,
    next: advance(session, handled, fresh, duplicates.length, batch),
  };
}

function advance(
  session: ScanSession,
  handled: ReadonlySet<string>,
  fresh: VaultItem[],
  skipped: number,
  batch: BatchProgress | null,
): ScanSession {
  return {
    handled,
    stored: [...session.stored, ...fresh],
    batch,
    added: session.added + fresh.length,
    skipped: session.skipped + skipped,
  };
}

/**
 * Where a code sits in a multi-code export, or null if it stands alone.
 *
 * A one-code export is treated as standing alone, and so is any claim this
 * cannot honour — see MAX_BATCH. Falling back to "single code" is always safe:
 * its accounts are still stored, only the progress line is withheld.
 */
function batchPart(text: string): { id: number; size: number; index: number } | null {
  if (!isMigrationUri(text)) return null;
  const { batchId, batchSize, batchIndex } = parseMigrationUri(text);

  const plausible =
    Number.isInteger(batchSize) &&
    Number.isInteger(batchIndex) &&
    batchSize > 1 &&
    batchSize <= MAX_BATCH &&
    batchIndex >= 0 &&
    batchIndex < batchSize;

  return plausible ? { id: batchId, size: batchSize, index: batchIndex } : null;
}

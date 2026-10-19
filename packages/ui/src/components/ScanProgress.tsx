import type { ScanSession } from '../lib/scan-session.js';
import { Callout } from './primitives.js';
import { useT } from '../i18n/react.js';

/**
 * Where a camera scan has got to, shown while the camera is still running.
 *
 * Two surfaces scan, and they mean different things by a scanned account.
 * Adding one stores it the moment its code is read, so it has been *added*,
 * and a repeat is one *already in your vault*. Importing collects everything
 * first and asks before storing any of it, so it has only been *found*, and a
 * repeat is one *already scanned* — saying "added" there would claim a write
 * that has not happened, and the user might close the tab believing it had.
 */
export function ScanProgress({ session, storing }: { session: ScanSession; storing: boolean }) {
  const t = useT();
  const { batch, added, skipped } = session;
  const accounts = t(storing ? 'scan.added' : 'scan.found', { count: added });
  return (
    <Callout tone="info">
      {batch
        ? t('scan.progressBatch', { seen: batch.seen.size, total: batch.size, accounts })
        : t('scan.progress', { accounts })}
      {skipped > 0 && ` ${t(storing ? 'scan.skippedVault' : 'scan.skippedScanned', { count: skipped })}`}
    </Callout>
  );
}

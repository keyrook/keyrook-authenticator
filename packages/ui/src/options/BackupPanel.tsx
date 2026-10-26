import { useRef, useState } from 'react';
import {
  FOREIGN_APP_NAMES,
  recogniseForeignBytes,
  recogniseForeignExport,
  recogniseSteamDesktop,
  readCsvExport,
  type ForeignImport,
  assertUsableBackup,
  dedupeAgainst,
  importEncryptedBackup,
  importFromText,
  isBackupFile,
  isValidBase32,
  liveItems,
  MAX_BACKUP_BYTES,
  type ProtectionMode,
  type VaultData,
  type VaultItem,
} from '@authx/core';
import type { Mutate } from '../lib/protocol.js';
import { planScan, startSession, type ScanSession } from '../lib/scan-session.js';
import { CameraScanner } from '../components/CameraScanner.js';
import { decodeQrFromFile } from '../components/qr.js';
import { CameraIcon, ChevronIcon, DownloadIcon, ImportIcon, TransferIcon } from '../components/icons.js';
import { Button, Callout, Field, Spinner, cx } from '../components/primitives.js';
import { ScanProgress } from '../components/ScanProgress.js';
import {
  AccountPicker,
  EncryptedBackup,
  MoveToAnotherApp,
  chosenItems,
  type ExportSelection,
} from './ExportSection.js';
import { PageHeader, Section, SubpageHeader } from './Section.js';
import type { MessageKey } from '../i18n/locales/en.js';
import { errorText } from '../i18n/error-text.js';
import { useT } from '../i18n/react.js';
import { localise } from '../i18n/error-text.js';
import { translate } from '../i18n/runtime.js';

type Job = 'backup' | 'import' | 'move';

const JOBS: { id: Job; Icon: typeof DownloadIcon; title: MessageKey; body: MessageKey; heading: MessageKey }[] = [
  {
    id: 'backup',
    Icon: DownloadIcon,
    title: 'backup.choice.backup.title',
    body: 'backup.choice.backup.body',
    heading: 'export.encrypted.description',
  },
  {
    id: 'import',
    Icon: ImportIcon,
    title: 'backup.choice.import.title',
    body: 'backup.choice.import.body',
    heading: 'import.description',
  },
  {
    id: 'move',
    Icon: TransferIcon,
    title: 'export.move.title',
    body: 'backup.choice.move.body',
    heading: 'export.move.description',
  },
];

/**
 * Three jobs, chosen first. This tab once opened on "What to export" — a
 * choice of accounts before any choice of what to do with them — over a
 * password form, a red warning and a box for pasting links, all at once.
 */
export function BackupPanel({
  data,
  mutate,
  protectionMode,
}: {
  data: VaultData;
  mutate: Mutate;
  protectionMode: ProtectionMode;
}) {
  const t = useT();
  // Every way out carries an account's key, and the move drew each one's QR
  // code as it rendered: an account without a key — an empty entry an older
  // build restored — blanked the page. It has nothing to take, so it is not
  // offered.
  const items = liveItems(data).filter((item) => isValidBase32(item.secret));
  const [job, setJob] = useState<Job | null>(null);
  const [selection, setSelection] = useState<ExportSelection>('all');
  const chosen = chosenItems(items, selection);
  const open = JOBS.find((entry) => entry.id === job);

  if (open) {
    return (
      <>
        <SubpageHeader title={t(open.title)} description={t(open.heading)} onBack={() => setJob(null)} />
        {open.id !== 'import' && (
          <AccountPicker items={items} groups={data.groups} chosen={chosen} onChange={setSelection} />
        )}
        {open.id === 'backup' && <EncryptedBackup chosen={chosen} data={data} />}
        {open.id === 'move' && <MoveToAnotherApp chosen={chosen} data={data} protectionMode={protectionMode} />}
        {open.id === 'import' && <ImportSection existing={data.items} mutate={mutate} />}
      </>
    );
  }

  return (
    <>
      <PageHeader title={t('nav.backup')} description={t('backup.description')} />
      <Section>
        {JOBS.map(({ id, Icon, title, body }) => (
          <button
            key={id}
            type="button"
            onClick={() => setJob(id)}
            // Named by the job alone; what it does is the description.
            aria-labelledby={`job-${id}`}
            aria-describedby={`job-${id}-body`}
            className="flex w-full items-center gap-4 border-b border-neutral-100 px-4 py-4 text-start transition-colors last:border-b-0 hover:bg-neutral-50 dark:border-neutral-800/80 dark:hover:bg-neutral-900"
          >
            <span
              className={cx(
                'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                // Readable exports are the one way out that is not encrypted.
                id === 'move'
                  ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-300'
                  : 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span id={`job-${id}`} className="block text-[14px] font-medium">
                {t(title)}
              </span>
              <span
                id={`job-${id}-body`}
                className="mt-0.5 block text-[12.5px] leading-relaxed text-neutral-600 dark:text-neutral-400"
              >
                {t(body)}
              </span>
            </span>
            <ChevronIcon className="h-4 w-4 shrink-0 text-neutral-400" />
          </button>
        ))}
      </Section>
    </>
  );
}

interface PendingImport {
  fresh: VaultItem[];
  duplicates: VaultItem[];
  errors: { line: string; reason: string }[];
  /** Something the user should know before importing, that is not an error. */
  warning?: string;
}

/** The screenshots a QR can be read from; anything else chosen here is a backup or a text file. */
const QR_IMAGE = /^image\/(png|jpeg|webp|gif|bmp)$/;

/**
 * Screenshots that hold only some of an export's codes import only some of
 * its accounts. Nothing is wrong with what was read, so it is not an error —
 * but the user should know before pressing Import, not after wondering where
 * a dozen accounts went.
 */
function incompleteExport(scanned: ScanSession): string | undefined {
  const batch = scanned.batch;
  if (!batch || batch.seen.size >= batch.size) return undefined;
  const missing = batch.size - batch.seen.size;
  return translate('import.incomplete', { count: missing, seen: batch.seen.size, total: batch.size });
}

function ImportSection({
  existing,
  mutate,
}: {
  existing: VaultItem[];
  mutate: Mutate;
}) {
  const t = useT();
  const fileInput = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [backupPassword, setBackupPassword] = useState('');
  // A file that needs a password first: one of ours, or another app's.
  const [locked, setLocked] = useState<
    { kind: 'ours'; contents: string } | { kind: 'foreign'; file: ForeignImport } | null
  >(null);
  const [pending, setPending] = useState<PendingImport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  // Read by every decoded frame, so a ref; `progress` mirrors it for rendering.
  const session = useRef<ScanSession>(startSession());
  const [progress, setProgress] = useState<ScanSession | null>(null);

  function stage(items: VaultItem[], errors: PendingImport['errors'], warning?: string) {
    const { fresh, duplicates } = dedupeAgainst(existing, items);
    setPending({ fresh, duplicates, errors, warning });
  }

  async function handleFiles(files: File[]) {
    setError(null);
    setPending(null);
    if (files.length === 0) return;

    if (files.some((file) => /\.mafile$/i.test(file.name) || file.name.toLowerCase() === 'manifest.json')) {
      if (await handleSteamDesktop(files)) return;
    }
    if (files.every((file) => QR_IMAGE.test(file.type))) {
      await handleScreenshots(files);
    } else if (files.length === 1) {
      await handleFile(files[0]!);
    } else {
      setError(t('import.oneOrScreenshots'));
    }
  }

  /**
   * Screenshots of QR codes: the way round a camera that cannot read a full
   * Google Authenticator export, on a Chrome with no native reader. A clean
   * image of a code reads where a webcam's view of it will not.
   *
   * Several at once, because an export is several codes. They go through the
   * same session as the camera, so a screenshot chosen twice, or a second
   * export overlapping the first, is counted once — and so it can tell when
   * some of an export's codes were left out.
   */
  async function handleScreenshots(files: File[]) {
    setBusy(true);
    try {
      let scanned = startSession();
      const errors: PendingImport['errors'] = [];

      for (const file of files) {
        let text: string | null;
        try {
          text = await decodeQrFromFile(file);
        } catch (cause) {
          errors.push({ line: file.name, reason: errorText(cause) });
          continue;
        }
        if (!text) {
          errors.push({ line: file.name, reason: t('import.noQrInThis') });
          continue;
        }

        const plan = planScan(scanned, text, []);
        if (plan.kind === 'ignore') continue;
        scanned = plan.next;
        if (plan.kind === 'reject') errors.push({ line: file.name, reason: localise(plan.reason) });
      }

      if (scanned.stored.length === 0 && errors.length === 0) {
        setError(t('import.noAccountsInImages'));
        return;
      }
      stage([...scanned.stored], errors, incompleteExport(scanned));
    } finally {
      setBusy(false);
    }
  }

  /**
   * Steam Desktop Authenticator's maFiles folder: one file per Steam account,
   * and, when it encrypted them, the manifest that holds what opens each — so
   * several files that make one export. False when they are not its.
   */
  async function handleSteamDesktop(files: File[]): Promise<boolean> {
    if (files.some((file) => file.size > MAX_BACKUP_BYTES)) {
      setError(t('import.tooLarge'));
      return true;
    }
    try {
      const found = recogniseSteamDesktop(
        await Promise.all(files.map(async (file) => ({ name: file.name, text: await file.text() }))),
      );
      if (!found) return false;
      if (found.needsPassword) {
        setLocked({ kind: 'foreign', file: found });
        return true;
      }
      const result = await found.read();
      if (result.items.length === 0 && result.errors.length === 0) {
        setError(t('import.noAccountsInFile'));
        return true;
      }
      stage(result.items, result.errors);
    } catch (cause) {
      setError(errorText(cause));
    }
    return true;
  }

  async function handleFile(file: File) {
    // Checked before reading: a file chosen here may have come from anyone,
    // and reading a huge one pulls the lot into memory first.
    if (file.size > MAX_BACKUP_BYTES) {
      setError(t('import.tooLarge'));
      return;
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const contents = new TextDecoder().decode(bytes);

    try {
      // andOTP's locked backup is bytes, not text.
      const lockedBytes = recogniseForeignBytes(bytes, file.name);
      if (lockedBytes) {
        setLocked({ kind: 'foreign', file: lockedBytes });
        return;
      }

      const parsed: unknown = JSON.parse(contents);
      if (isBackupFile(parsed)) {
        // Reject a malformed one now, while there is still something useful to
        // say about it — not from inside the crypto after a password is typed.
        assertUsableBackup(parsed);
        setLocked({ kind: 'ours', contents });
        return;
      }

      // Another app's export: moving here should take one file, not every
      // account added again by hand.
      const foreign = recogniseForeignExport(parsed);
      if (foreign?.needsPassword) {
        setLocked({ kind: 'foreign', file: foreign });
        return;
      }
      if (foreign) {
        const result = await foreign.read();
        if (result.items.length === 0 && result.errors.length === 0) {
          setError(t('import.noAccountsInFile'));
          return;
        }
        stage(result.items, result.errors);
        return;
      }
    } catch (cause) {
      // A JSON file that is a backup but a bad one has something worth saying;
      // anything else is treated as a list of otpauth:// URIs.
      if (cause instanceof Error && !(cause instanceof SyntaxError)) {
        setError(errorText(cause));
        return;
      }
    }

    // A password manager's spreadsheet: its two-factor column, and nothing else.
    const sheet = readCsvExport(contents);
    if (sheet) {
      if (sheet.items.length === 0 && sheet.errors.length === 0) {
        setError(t('import.noKeysInCsv'));
        return;
      }
      stage(sheet.items, sheet.errors, t('import.csvWarning'));
      return;
    }

    const result = importFromText(contents);
    if (result.items.length === 0 && result.errors.length === 0) {
      setError(t('import.noAccountsInFile'));
      return;
    }
    stage(result.items, result.errors);
  }

  async function openLockedFile() {
    if (!locked) return;
    setBusy(true);
    setError(null);
    try {
      if (locked.kind === 'ours') {
        const payload = await importEncryptedBackup(JSON.parse(locked.contents), backupPassword);
        stage(payload.items, []);
      } else {
        const result = await locked.file.read(backupPassword);
        stage(result.items, result.errors);
      }
      setLocked(null);
      setBackupPassword('');
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(false);
    }
  }

  function startScan() {
    session.current = startSession();
    setProgress(null);
    setError(null);
    setPending(null);
    setScanning(true);
  }

  /**
   * One decoded frame. Unlike adding from the Accounts tab, nothing is stored
   * here: every account scanned is collected, and when the export is complete
   * they go to the same review as a file or pasted links, where the user
   * decides. That is what lets Cancel mean cancel.
   *
   * The session is asked to dedupe only against itself — repeats of a code in
   * view, the overlap of a second export. Accounts already in the vault are
   * left in, so the review can say how many it is skipping, as it does for a
   * file.
   */
  async function scanCamera(text: string): Promise<boolean> {
    const plan = planScan(session.current, text, []);
    if (plan.kind === 'ignore') return false;

    // Collecting cannot fail, so the plan is adopted at once — unlike storing,
    // where it waits for the write.
    session.current = plan.next;
    if (plan.kind === 'reject') {
      setError(localise(plan.reason));
      return false;
    }
    setError(null);
    setProgress(plan.next);

    if (plan.finished) review(plan.next);
    return plan.finished;
  }

  /** Stop the camera and hand what was scanned to the ordinary import review. */
  function review(scanned: ScanSession) {
    setScanning(false);
    setProgress(null);
    stage([...scanned.stored], []);
  }

  function cancelScan() {
    setScanning(false);
    setProgress(null);
    setError(null);
  }

  async function confirmImport() {
    if (!pending || pending.fresh.length === 0) return;
    setBusy(true);
    try {
      await mutate({ op: 'items/add', items: pending.fresh });
      setPending(null);
      setText('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section>
      <div className="flex flex-col gap-4 p-4">
        {error && <Callout tone="danger">{error}</Callout>}

        {scanning ? (
          <div className="flex max-w-md flex-col gap-3">
            {progress && <ScanProgress session={progress} storing={false} />}
            {progress && progress.added > 0 && (
              // An export whose last code will not read should not cost the
              // user the codes that did. A way out, not the next step — the
              // next step is showing the next code — so it does not shout.
              <Button onClick={() => review(session.current)}>
                {t('import.stopAndReview', { count: progress.added })}
              </Button>
            )}
            <CameraScanner
              onDecode={scanCamera}
              onCancel={cancelScan}
              compact={progress !== null}
              withoutNativeReader={t('import.noNativeReader')}
            />
          </div>
        ) : locked ? (
          <div className="flex flex-col gap-3">
            <Callout>
              {locked.kind === 'ours'
                ? t('import.encrypted')
                : t('import.lockedFrom', { app: FOREIGN_APP_NAMES[locked.file.app] })}
            </Callout>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Field
                  label={t('import.backupPassword')}
                  type="password"
                  autoFocus
                  value={backupPassword}
                  onChange={(event) => setBackupPassword(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && void openLockedFile()}
                />
              </div>
              <Button variant="primary" disabled={busy} onClick={openLockedFile}>
                {busy ? <Spinner /> : null} {t('import.open')}
              </Button>
              <Button
                onClick={() => {
                  setLocked(null);
                  setBackupPassword('');
                }}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        ) : pending ? (
          <div className="flex flex-col gap-3">
            {pending.warning && <Callout tone="warning">{pending.warning}</Callout>}
            <Callout tone={pending.fresh.length > 0 ? 'info' : 'warning'}>
              {t('import.found', { count: pending.fresh.length })}
              {pending.duplicates.length > 0 && t('import.skipping', { count: pending.duplicates.length })}
              {pending.errors.length > 0 && t('import.unreadable', { count: pending.errors.length })}
              {t('import.foundEnd')}
            </Callout>

            {pending.fresh.length > 0 && (
              <ul className="max-h-56 overflow-y-auto rounded-xl border border-neutral-200 text-[13px] scrollarea dark:border-neutral-800">
                {pending.fresh.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between gap-4 border-b border-neutral-100 px-3 py-2 last:border-b-0 dark:border-neutral-900"
                  >
                    <span className="font-medium">{item.issuer || t('common.untitled')}</span>
                    <span className="truncate text-neutral-600 dark:text-neutral-400">{item.label}</span>
                  </li>
                ))}
              </ul>
            )}

            {pending.errors.length > 0 && (
              <details className="text-[12px] text-neutral-600 dark:text-neutral-400">
                <summary className="cursor-pointer">{t('import.showFailed')}</summary>
                <ul className="mt-2 flex flex-col gap-1">
                  {pending.errors.map((entry, index) => (
                    <li key={index}>
                      <code className="text-neutral-400">{entry.line}</code> — {localise(entry.reason)}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <div className="flex gap-2">
              <Button
                variant="primary"
                disabled={busy || pending.fresh.length === 0}
                onClick={confirmImport}
              >
                {busy ? <Spinner /> : null} {t('import.import', { count: pending.fresh.length })}
              </Button>
              <Button onClick={() => setPending(null)}>{t('common.cancel')}</Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-[12.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t('import.fromApps')}</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={startScan}>
                <CameraIcon /> {t('import.scan')}
              </Button>
              <Button disabled={busy} onClick={() => fileInput.current?.click()}>
                {busy ? <Spinner /> : null} {t('import.choose')}
              </Button>
              <input
                ref={fileInput}
                type="file"
                multiple
                accept=".authx,.json,.2fas,.aes,.maFile,.csv,.txt,text/plain,text/csv,application/json,image/png,image/jpeg,image/webp,image/gif,image/bmp"
                className="hidden"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  event.target.value = '';
                  void handleFiles(files);
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="import-paste"
                className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300"
              >
                {t('import.paste')}
              </label>
              <textarea
                id="import-paste"
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={4}
                spellCheck={false}
                placeholder="otpauth://totp/GitHub:you@example.com?secret=JBSWY3DPEHPK3PXP&issuer=GitHub"
                className="w-full rounded-xl border border-neutral-200 bg-white p-3 font-mono text-[12px] placeholder:text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900"
              />
              <div>
                <Button
                  disabled={text.trim().length === 0}
                  onClick={() => {
                    const result = importFromText(text);
                    stage(result.items, result.errors);
                  }}
                >
                  {t('import.read')}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Section>
  );
}

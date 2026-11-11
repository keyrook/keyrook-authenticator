import { useEffect, useRef, useState } from 'react';
import {
  BAD_KEY_MESSAGE,
  domainsToRecord,
  importFromText,
  itemFromUri,
  itemMatchesHost,
  matchBrand,
  parseOtpUri,
  type BrandEntry,
  type VaultItem,
} from '@authx/core';
import { send } from '../lib/protocol.js';
import { planScan, startSession, type ScanSession } from '../lib/scan-session.js';
import { CameraScanner, cameraAlreadyGranted } from '../components/CameraScanner.js';
import { ScanProgress } from '../components/ScanProgress.js';
import { decodeQrFromDataUrl, decodeQrFromFile } from '../components/qr.js';
import { ServiceField } from '../components/ServiceField.js';
import { ArrowLeftIcon, CameraIcon, ImageIcon, KeyIcon, KeyboardIcon, QrIcon } from '../components/icons.js';
import { QuickCode } from '../components/QuickCode.js';
import { Button, Callout, Field, Spinner, cx } from '../components/primitives.js';
import { errorText } from '../i18n/error-text.js';
import { useT } from '../i18n/react.js';
import { useBack } from '../lib/back.js';
import { localise } from '../i18n/error-text.js';
import { AppError } from '../i18n/errors.js';

type Mode = 'choose' | 'manual' | 'camera' | 'quick';

export function AddSheet({
  hostname,
  onAdd,
  onClose,
  camera = false,
  onCameraElsewhere,
  initialMode = 'choose',
  existing = [],
  pageScan = true,
}: {
  hostname: string | null;
  onAdd: (items: VaultItem[]) => Promise<void>;
  onClose: () => void;
  /**
   * The vault as the caller sees it, so a camera scan can skip accounts that
   * are already there. Scanning an export twice is easy to do by accident.
   */
  existing?: readonly VaultItem[];
  /**
   * This surface can ask for the camera. Chrome's permission prompt takes
   * focus, and a popup dies when it loses focus, taking the scanner and the
   * just-granted stream with it — so only a surface that lives in a tab may
   * pass true.
   */
  camera?: boolean;
  /**
   * For a surface that cannot ask: where to send the user so the camera can be
   * granted once. The grant belongs to the extension, not the page, so after
   * that this surface scans in place and never needs to send anyone again.
   */
  onCameraElsewhere?: () => void;
  initialMode?: 'choose' | 'camera';
  /**
   * Offer to read the QR on the page the extension was opened over. Only the
   * popup has such a page. Settings is itself the active tab, so the option
   * there photographed Settings and reported, every time, that it found no
   * code.
   */
  pageScan?: boolean;
}) {
  const t = useT();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  // Read synchronously by every decoded frame, so a ref; `progress` mirrors it
  // for rendering. See scan-session.ts for what it tracks and why.
  const session = useRef<ScanSession>(startSession());
  const [progress, setProgress] = useState<ScanSession | null>(null);
  const [summary, setSummary] = useState<ScanSession | null>(null);

  // Whether the camera can be opened on this surface. A tab can always ask;
  // the popup only if it was granted before, which takes a look to find out.
  const handsOff = !camera && onCameraElsewhere !== undefined;
  const [cameraHere, setCameraHere] = useState(camera);
  useEffect(() => {
    if (!handsOff) return;
    let live = true;
    void cameraAlreadyGranted().then((granted) => {
      if (live) setCameraHere(granted);
    });
    return () => {
      live = false;
    };
  }, [handsOff]);

  /**
   * A QR scanned on a page came from that page's own enrolment screen, so the
   * site is worth recording. A hand-typed key might have been pasted anywhere,
   * so only record the site when the issuer plausibly belongs to it — otherwise
   * every account added while sitting on one tab ends up suggested there.
   */
  async function commit(items: VaultItem[], source: 'qr' | 'manual') {
    if (items.length === 0) throw new AppError('add.noneFound');

    if (hostname) {
      for (const item of items) {
        if (item.domains.length > 0) continue;
        if (source === 'qr' || !item.issuer || itemMatchesHost(item, hostname)) {
          item.domains = [hostname];
        }
      }
    }

    await onAdd(items);
    onClose();
  }

  async function handleUri(uri: string) {
    const result = importFromText(uri);
    if (result.items.length === 0) {
      const reason = result.errors[0]?.reason;
      if (reason) throw new Error(reason);
      throw new AppError('error.notSetupQr');
    }
    await commit(result.items, 'qr');
  }

  async function scanPage() {
    setBusy('scan');
    setError(null);
    try {
      const { dataUrl } = await send({ type: 'tab/captureQr' });
      const decoded = await decodeQrFromDataUrl(dataUrl);
      if (!decoded) {
        throw new AppError('add.noQrOnPage');
      }
      await handleUri(decoded);
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(null);
    }
  }

  async function scanFile(file: File) {
    setBusy('file');
    setError(null);
    try {
      const decoded = await decodeQrFromFile(file);
      if (!decoded) throw new AppError('add.noQrInImage');
      await handleUri(decoded);
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(null);
    }
  }

  /**
   * One decoded frame. Resolves true when the scanner should release the
   * camera: the session is complete, or something went wrong that another
   * frame will not fix.
   *
   * Unlike the page scan, this never records the current site on what it
   * stores. The code came from a phone held up to the camera, not from the
   * page the user happens to have open.
   */
  async function scanCamera(text: string): Promise<boolean> {
    const plan = planScan(session.current, text, existing);
    if (plan.kind === 'ignore') return false;

    if (plan.kind === 'reject') {
      // The user is still holding something up, and the next thing may be right.
      session.current = plan.next;
      setError(localise(plan.reason));
      return false;
    }

    if (plan.items.length > 0) {
      try {
        await onAdd(plan.items);
      } catch (cause) {
        // Not adopting the plan leaves this payload unhandled, so the next
        // frame would try the same failing write again, several times a
        // second. Stop and say why instead.
        setError(errorText(cause));
        return true;
      }
    }

    session.current = plan.next;
    setError(null);
    setProgress(plan.next);

    if (!plan.finished) return false;
    if (plan.next.batch === null) {
      onClose();
    } else {
      setSummary(plan.next);
    }
    return true;
  }

  // Its own back button's: out of a way of adding to the list of them, then out.
  const back = () => (mode === 'choose' ? onClose() : setMode('choose'));
  useBack(true, back);

  function openCamera() {
    session.current = startSession();
    setProgress(null);
    setSummary(null);
    setError(null);
    setMode('camera');
  }

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-white animate-slide-up dark:bg-neutral-950">
      {/* On a phone, the bar every page of the app has: the way back, and where one is. */}
      <header className="flex items-center gap-2 border-b border-neutral-100 px-3 py-2.5 app:min-h-16 app:gap-1 app:border-0 app:px-2 app:py-0 dark:border-neutral-900">
        <button
          type="button"
          onClick={back}
          aria-label={t('common.back')}
          className="rounded-lg p-1.5 text-base text-neutral-600 hover:bg-neutral-100 app:grid app:place-items-center app:rounded-full app:p-0 app:text-[22px] app:text-neutral-700 dark:hover:bg-neutral-900 dark:app:text-neutral-200"
        >
          <ArrowLeftIcon />
        </button>
        <h2 className="text-[14px] font-semibold app:text-[20px]! app:font-medium">
          {mode === 'manual'
            ? t('add.title.manual')
            : mode === 'camera'
              ? t('add.title.camera')
              : mode === 'quick'
                ? t('add.title.quick')
                : t('add.title.choose')}
        </h2>
      </header>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 scrollarea">
        {error && <Callout tone="danger">{error}</Callout>}

        {mode === 'choose' ? (
          <>
            {pageScan && (
              <Choice
                icon={<QrIcon />}
                title={t('add.page.title')}
                description={t('add.page.description')}
                busy={busy === 'scan'}
                onClick={scanPage}
              />
            )}
            {(camera || handsOff) && (
              <Choice
                icon={<CameraIcon />}
                title={t('add.camera.title')}
                description={cameraHere ? t('add.camera.description') : t('add.camera.elsewhere')}
                onClick={cameraHere ? openCamera : () => onCameraElsewhere?.()}
              />
            )}
            <Choice
              icon={<ImageIcon />}
              title={t('add.upload.title')}
              description={t('add.upload.description')}
              busy={busy === 'file'}
              onClick={() => fileInput.current?.click()}
            />
            <Choice
              icon={<KeyboardIcon />}
              title={t('add.manual.title')}
              description={t('add.manual.description')}
              onClick={() => setMode('manual')}
            />
            <Choice
              icon={<KeyIcon />}
              title={t('add.quick.title')}
              description={t('add.quick.description')}
              onClick={() => setMode('quick')}
            />

            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) void scanFile(file);
              }}
            />

            <p className="kr-explain mt-2 text-center text-[11px] leading-relaxed text-neutral-400 dark:text-neutral-500">
              {t('add.fromGoogle')}
            </p>
          </>
        ) : mode === 'camera' && summary ? (
          <ExportSummary session={summary} onDone={onClose} />
        ) : mode === 'camera' ? (
          <>
            {progress && <ScanProgress session={progress} storing />}
            <CameraScanner
              onDecode={scanCamera}
              // Anything already added stays added, so once there is some,
              // "Cancel" would promise an undo that does not happen.
              cancelLabel={progress && progress.added > 0 ? t('common.done') : t('common.cancel')}
              compact={progress !== null}
              withoutNativeReader={t('add.noNativeReader')}
              // Only reachable if the camera looked granted and still would
              // not open here. Settings is a tab, and can ask again.
              fallback={
                handsOff && (
                  <Button variant="primary" onClick={() => onCameraElsewhere?.()}>
                    {t('add.openScannerInSettings')}
                  </Button>
                )
              }
              onCancel={progress && progress.added > 0 ? onClose : () => setMode('choose')}
            />
          </>
        ) : mode === 'quick' ? (
          <QuickCode onSave={(params) => commit([itemFromUri(params)], 'manual')} />
        ) : (
          <ManualForm hostname={hostname} onSubmit={(items) => commit(items, 'manual')} />
        )}
      </div>
    </div>
  );
}

function Choice({
  icon,
  title,
  description,
  busy,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  busy?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cx(
        'flex items-start gap-3 rounded-xl border border-neutral-200 p-3 text-start transition hover:border-brand-400 hover:bg-brand-50/50 disabled:opacity-60 dark:border-neutral-800 dark:hover:border-brand-500 dark:hover:bg-brand-500/5',
        // On a phone, the cards of its Settings: an icon in a tile, no outline.
        'app:items-center app:gap-4 app:rounded-[20px] app:border-0 app:bg-white app:px-4 app:py-3 app:ring-1 app:ring-neutral-200/70 dark:app:bg-neutral-900 dark:app:ring-0',
      )}
    >
      <span className="mt-0.5 shrink-0 text-lg text-brand-600 dark:text-brand-400 app:mt-0 app:grid app:h-11 app:w-11 app:place-items-center app:rounded-xl app:bg-brand-50 app:text-[24px] dark:app:bg-brand-500/15 dark:app:text-brand-300">
        {busy ? <Spinner className="h-[1em] w-[1em]" /> : icon}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[13px] font-medium text-neutral-800 dark:text-neutral-100">{title}</span>
        <span className="kr-explain text-[12px] leading-snug text-neutral-600 dark:text-neutral-400">
          {description}
        </span>
      </span>
    </button>
  );
}

function ManualForm({
  hostname,
  onSubmit,
}: {
  hostname: string | null;
  onSubmit: (items: VaultItem[]) => Promise<void>;
}) {
  const t = useT();
  // Opened on the site being set up, the answer is usually already known.
  const suggested = hostname ? matchBrand('', [hostname]) : null;

  const [issuer, setIssuer] = useState(suggested?.name ?? '');
  const [domains, setDomains] = useState<string[]>(suggested ? domainsToRecord(suggested, hostname) : []);
  const [label, setLabel] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function pick(brand: BrandEntry) {
    // Taking a suggestion is worth more than the keystrokes: the domains it
    // carries are what let the popup offer this code on the right site later.
    setDomains(domainsToRecord(brand, hostname));
  }

  const looksLikeUri = /^otpauth(-migration)?:\/\//i.test(secret.trim());

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (looksLikeUri) {
        const result = importFromText(secret.trim());
        if (result.items.length === 0) {
          const reason = result.errors[0]?.reason;
          if (reason) throw new Error(reason);
          throw new AppError('add.cannotReadUri');
        }
        await onSubmit(result.items);
        return;
      }

      const cleaned = secret.replace(/\s+/g, '').toUpperCase();
      if (!cleaned) throw new AppError('add.enterKey');
      // Checked here rather than left to the URI parser below, whose complaint
      // — 'the "secret" parameter is not valid base32' — names two things
      // nobody copying a key off a website has heard of. Naming the alphabet
      // also catches the usual slip: a 0 or 1 typed for an O or I.
      if (!/^[A-Z2-7]+=*$/.test(cleaned)) {
        throw new Error(BAD_KEY_MESSAGE);
      }
      // Round-tripping through the URI parser gives us one validation path for
      // both entry methods.
      const parsed = parseOtpUri(
        `otpauth://totp/${encodeURIComponent(issuer || 'Account')}:${encodeURIComponent(
          label || 'me',
        )}?secret=${cleaned}${issuer ? `&issuer=${encodeURIComponent(issuer)}` : ''}`,
      );
      await onSubmit([itemFromUri(parsed, domains)]);
    } catch (cause) {
      setError(errorText(cause));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3.5">
      <ServiceField
        value={issuer}
        onChange={(next) => {
          setIssuer(next);
          // Typing over a chosen service drops what it brought with it.
          setDomains([]);
        }}
        onPick={pick}
        autoFocus
        hint={
          domains.length > 0
            ? t('add.offeredOn', { domain: domains[0]! })
            : t('add.startTyping')
        }
      />
      <Field
        label={t('add.account')}
        placeholder={t('add.accountPlaceholder')}
        value={label}
        onChange={(event) => setLabel(event.target.value)}
      />
      <Field
        label={t('add.setupKey')}
        placeholder="JBSWY3DPEHPK3PXP"
        value={secret}
        onChange={(event) => setSecret(event.target.value)}
        error={error}
        hint={
          looksLikeUri
            ? t('add.linkDetected')
            : t('add.spacesFine')
        }
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
      />
      <Button type="submit" variant="primary" disabled={busy || secret.trim().length === 0}>
        {busy ? <Spinner /> : null}
        {t('add.submit')}
      </Button>
    </form>
  );
}

function ExportSummary({ session, onDone }: { session: ScanSession; onDone: () => void }) {
  const t = useT();
  const { batch, added, skipped } = session;
  return (
    <div className="flex flex-col gap-3">
      <Callout tone="info">
        {`${t('add.summary', { count: batch?.size ?? 1 })} ${t('add.summaryAdded', { count: added })}`}
        {skipped > 0 && ` ${t('add.summarySkipped', { count: skipped })}`}
      </Callout>
      <Button variant="primary" onClick={onDone}>
        {t('common.done')}
      </Button>
    </div>
  );
}

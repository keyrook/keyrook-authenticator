import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { decodeQrFromVideo, hasNativeReader } from './qr.js';
import { Button, Callout, Spinner } from './primitives.js';
import { errorText } from '../i18n/error-text.js';
import { useT } from '../i18n/react.js';
import { translate } from '../i18n/runtime.js';
import { AppError } from '../i18n/errors.js';

/**
 * Scans a QR code from a camera, for the codes that are never on this screen.
 *
 * The screenshot path reads the visible tab, which covers enrolling on a
 * website. It can never see a Google Authenticator export, because that QR is
 * on a phone. Pointing a camera at it is the only way across that does not
 * involve moving a screenshot between two machines by hand.
 *
 * This must not be rendered inside the popup. Asking for camera access moves
 * focus to Chrome's own prompt, and a popup closes when it loses focus — the
 * user would answer the prompt and find the scanner gone, along with the
 * stream it had just been granted. The options page is a real tab and survives
 * it. `AddSheet` takes a flag rather than sniffing its surroundings, so the one
 * caller that can honestly offer this is the one that does.
 */

/**
 * The pause between one read finishing and the next starting. A gap rather
 * than a fixed rate: a read costs a few milliseconds natively and far more
 * with jsQR at 1080p, and a fixed rate would queue work behind a slow one.
 */
const SCAN_GAP_MS = 100;

/**
 * Whether this extension already holds the camera.
 *
 * The permission belongs to the extension's origin, not to the page that asked
 * for it. So the popup, which cannot survive asking, can still use a camera
 * that a tab asked for earlier — and that is the difference between "scan
 * here" and "go to Settings first".
 *
 * Anything but a definite yes counts as no. Guessing yes in the popup puts the
 * user one click from a prompt that closes the popup under them; guessing no
 * only costs them a tab.
 */
export async function cameraAlreadyGranted(): Promise<boolean> {
  try {
    const status = await navigator.permissions.query({ name: 'camera' });
    return status.state === 'granted';
  } catch {
    return false;
  }
}

type Phase = 'starting' | 'scanning' | 'failed';

export function CameraScanner({
  onDecode,
  onCancel,
  cancelLabel,
  compact = false,
  fallback,
  withoutNativeReader,
  busy = false,
}: {
  /**
   * Called with each newly decoded payload. Resolve true to release the camera
   * — the caller is finished with it — or false to keep scanning. The same
   * payload arrives many times while a code stays in view; telling repeats
   * apart is the caller's job, since only it knows what has been stored.
   */
  onDecode: (text: string) => Promise<boolean>;
  onCancel: () => void;
  cancelLabel?: string;
  /**
   * Drop the how-to paragraph. The caller sets this once it is showing its own
   * progress: by then the user knows what to do, the generic advice ("every
   * account comes across at once") contradicts "code 1 of 3", and the space it
   * takes pushes the Done button out of the dialog.
   */
  compact?: boolean;
  /** Shown under the explanation when the camera could not be opened. */
  fallback?: ReactNode;
  /**
   * What to do instead, said before the user tries, when this Chrome has no
   * native QR reader — Windows and Linux. The caller writes it because only
   * the caller knows where its own image upload is.
   */
  withoutNativeReader?: ReactNode;
  busy?: boolean;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Checked after every await in the loop: a read or a store can finish after
  // the scanner has been told to stop, and must not schedule another round.
  const stopped = useRef(false);

  const t = useT();
  const [phase, setPhase] = useState<Phase>('starting');
  const [error, setError] = useState<string | null>(null);
  // Unknown until checked; the generic advice shows meanwhile, since it is
  // true either way.
  const [native, setNative] = useState<boolean | null>(null);

  useEffect(() => {
    let live = true;
    void hasNativeReader().then((found) => {
      if (live) setNative(found);
    });
    return () => {
      live = false;
    };
  }, []);

  // The callback arrives as a fresh closure on every render of the parent. If
  // the effect below depended on it, an unrelated re-render — the vault
  // broadcasting a change, say — would tear the stream down and ask for the
  // camera again mid-scan. Reading it through a ref keeps the effect tied to
  // mounting only.
  const latest = useRef(onDecode);
  useEffect(() => {
    latest.current = onDecode;
  }, [onDecode]);

  /**
   * Releasing the camera is the part that must never be skipped. An indicator
   * light still on after the user has moved away is, for a security tool,
   * worse than the feature is worth.
   */
  const stop = useCallback(() => {
    stopped.current = true;
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    for (const track of stream.current?.getTracks() ?? []) track.stop();
    stream.current = null;
    if (video.current) video.current.srcObject = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Cleared on every start, not just the first: StrictMode mounts, unmounts
    // and mounts again in development, and the unmount has already set it.
    stopped.current = false;

    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new AppError('camera.noCamera');
        }

        const opened = await navigator.mediaDevices.getUserMedia({
          video: {
            // A preference, not a demand: a laptop has only a front camera.
            facingMode: 'environment',
            // Asked for nothing, Chrome gives 640×480. A Google Authenticator
            // export of ten accounts is 117 modules a side; held as close as
            // a fixed-focus webcam stays sharp, that is under 2 px a module,
            // and no reader recovers it. 1080p gives the same code over 4.
            // `ideal`, so a 720p camera answers with 720p instead of failing.
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        // Unmounted while the permission prompt was open. Nothing will stop
        // this stream but this line.
        if (cancelled) {
          for (const track of opened.getTracks()) track.stop();
          return;
        }

        stream.current = opened;
        if (video.current) {
          video.current.srcObject = opened;
          await video.current.play().catch(() => {
            /* Autoplay policy; the frames still arrive for the canvas. */
          });
        }
        setPhase('scanning');

        // One round at a time: read, hand over what was read, then wait. Each
        // round starts only when the last has finished, so a slow read or a
        // slow store never has another stacked on top of it.
        const round = async () => {
          const element = video.current;
          const decoded = element ? await decodeQrFromVideo(element) : null;
          if (stopped.current) return;

          if (decoded && (await latest.current(decoded))) {
            // Finished usually means the caller is about to unmount us;
            // stopping here rather than in cleanup turns the light off
            // sooner, and covers the case where it is not.
            stop();
            return;
          }
          if (!stopped.current) timer.current = setTimeout(() => void round(), SCAN_GAP_MS);
        };
        void round();
      } catch (cause) {
        if (cancelled) return;
        setPhase('failed');
        setError(explain(cause));
      }
    }

    void start();

    return () => {
      cancelled = true;
      stop();
    };
    // Mount and unmount only: see `latest` above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop]);

  return (
    <div className="flex flex-col gap-3">
      {error && <Callout tone="danger">{error}</Callout>}

      {phase !== 'failed' && (
        <div className="relative overflow-hidden rounded-xl bg-neutral-900 aspect-[4/3]">
          <video
            ref={video}
            playsInline
            muted
            autoPlay
            aria-label={t('camera.preview')}
            className="h-full w-full object-cover"
          />

          {/* A frame to aim with. Nothing is cropped to it — the whole frame is
              decoded — so it only has to say "point it here". */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-40 w-40 rounded-xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
          </div>

          {(phase === 'starting' || busy) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
              <Spinner className="h-6 w-6" />
            </div>
          )}
        </div>
      )}

      {(phase === 'failed' || !compact) && (
        <p className="text-[12px] leading-snug text-neutral-600 dark:text-neutral-400">
          {phase === 'failed'
            ? t('camera.failedHint')
            : native === false && withoutNativeReader
              ? withoutNativeReader
              : t('camera.hint')}
        </p>
      )}

      {phase === 'failed' && fallback}

      <p className="text-[11px] leading-relaxed text-neutral-400 dark:text-neutral-500">
        {t('camera.privacy')}
      </p>

      <Button onClick={onCancel}>{cancelLabel ?? t('common.cancel')}</Button>
    </div>
  );
}

/**
 * Chrome's own wording for these is unhelpful ("Permission denied" could be
 * the user, the policy, or no device at all), and this is the screen where a
 * person decides the feature is broken.
 */
function explain(cause: unknown): string {
  const name = cause instanceof DOMException ? cause.name : '';

  if (name === 'NotAllowedError') {
    return translate('camera.blocked');
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return translate('camera.none');
  }
  if (name === 'NotReadableError') {
    return translate('camera.busy');
  }
  return errorText(cause);
}

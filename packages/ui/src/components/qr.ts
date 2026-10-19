import jsQR from 'jsqr';
import { AppError } from '../i18n/errors.js';

/**
 * QR decoding runs in the page context because it needs a canvas — service
 * workers have no DOM. Every entry point funnels into the same readers so the
 * screenshot, file and camera paths behave identically.
 */

/** The slice of the Shape Detection API used here. TypeScript's DOM lib does not declare it. */
interface NativeReader {
  detect(source: ImageBitmapSource): Promise<{ rawValue: string }[]>;
}
interface NativeReaderClass {
  new (options: { formats: string[] }): NativeReader;
  getSupportedFormats(): Promise<string[]>;
}

let native: Promise<NativeReader | null> | undefined;

/**
 * Chrome's own QR reader, where it has one.
 *
 * jsQR reads a clean QR of any density, but a webcam aimed at a phone does not
 * produce a clean one: the image is resampled, a screen's black is not ink's,
 * a fixed-focus lens blurs at close range, and the sensor adds noise. On
 * frames modelled that way, a Google Authenticator export of ten accounts —
 * 117 modules a side — read 0/10 with jsQR at 3 px a module and 3/10 at 6. The
 * native reader read it 10/10 from 3 px up. A single-account code was never
 * the problem, which is why a test using one passed while the real export
 * failed on the first person to try it.
 *
 * Chrome ships the native reader on macOS, ChromeOS and Android, not on
 * Windows or Linux, and only in a secure context — which an extension page
 * always is. Elsewhere jsQR remains the reader.
 */
function nativeReader(): Promise<NativeReader | null> {
  native ??= (async () => {
    const Reader = (globalThis as { BarcodeDetector?: NativeReaderClass }).BarcodeDetector;
    if (!Reader) return null;
    try {
      return (await Reader.getSupportedFormats()).includes('qr_code')
        ? new Reader({ formats: ['qr_code'] })
        : null;
    } catch {
      return null;
    }
  })();
  return native;
}

/**
 * Whether this Chrome has a native reader. Without one, a camera will not
 * read a full Google Authenticator export, and the scanner says so up front
 * rather than letting someone hold their phone up to a camera that cannot win.
 */
export async function hasNativeReader(): Promise<boolean> {
  return (await nativeReader()) !== null;
}

/** The native reader's answer, or null — for "no reader" as much as for "no code". */
async function readNatively(source: ImageBitmapSource): Promise<string | null> {
  const reader = await nativeReader();
  if (!reader) return null;
  try {
    const [found] = await reader.detect(source);
    return found?.rawValue ?? null;
  } catch {
    // A frame it will not take — a video mid-teardown, say — is not worth
    // failing the scan over; jsQR or the next frame gets a turn.
    return null;
  }
}
async function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = src;
  await image.decode();
  return image;
}

/** A region of a source, in the source's own pixels. */
interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * jsQR over one region of an `<img>` or a `<video>`. Both are
 * `CanvasImageSource`, so the pixels arrive the same way; only where the
 * natural size is read differs, which is why the region is passed in.
 */
function decodeSource(source: CanvasImageSource, region: Region, scale = 1): string | null {
  const width = Math.round(region.width * scale);
  const height = Math.round(region.height * scale);
  if (width === 0 || height === 0) return null;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(source, region.x, region.y, region.width, region.height, 0, 0, width, height);
  const { data } = context.getImageData(0, 0, width, height);

  const result = jsQR(data, width, height, { inversionAttempts: 'attemptBoth' });
  return result?.data ?? null;
}

function decodeImage(image: HTMLImageElement, scale = 1): string | null {
  const whole = { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight };
  return decodeSource(image, whole, scale);
}

export async function decodeQrFromDataUrl(dataUrl: string): Promise<string | null> {
  const image = await loadImage(dataUrl);

  // One image, read once, so there is time to try everything. jsQR after the
  // native reader is not redundant: the two miss different things. A QR
  // embedded in a full-page screenshot is often small, and a second jsQR pass
  // at 2× recovers codes its finder-pattern search misses at native size.
  return (await readNatively(image)) ?? decodeImage(image, 1) ?? decodeImage(image, 2);
}

/**
 * Raster formats only. SVG loaded into an `<img>` is rendered without scripts
 * or external references, so this is belt-and-braces rather than a hole being
 * closed — but nothing here needs SVG, and the account picture path refuses it
 * for the same reason. One rule is easier to keep than two.
 */
const QR_FORMATS = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp'];

export async function decodeQrFromFile(file: File): Promise<string | null> {
  if (!QR_FORMATS.includes(file.type)) {
    throw new AppError('image.wrongScreenshotType');
  }
  const url = URL.createObjectURL(file);
  try {
    return await decodeQrFromDataUrl(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * One frame of a live camera, decoded where it was captured.
 *
 * Unlike an image, a frame gets one reader, not every reader: the caller asks
 * again a moment later, and a fresh frame — different noise, a steadier hand —
 * rescues far more than a second opinion on a bad one. Where Chrome has a
 * native reader that is the one; running jsQR over the same frame as well
 * would cost more than it finds.
 *
 * Without one, jsQR reads the central square only. The user aims at the
 * middle, and at 1080p the whole frame is twice the pixels for the same code.
 *
 * The frame never leaves this function. It is read where it lies and dropped —
 * there is no upload path for it to take, and `connect-src 'self'` would refuse
 * one anyway.
 */
export async function decodeQrFromVideo(video: HTMLVideoElement): Promise<string | null> {
  // Before metadata arrives the size is 0, and drawing a frameless video
  // throws rather than returning nothing.
  if (video.readyState < video.HAVE_CURRENT_DATA) return null;

  if (await nativeReader()) return readNatively(video);

  const side = Math.min(video.videoWidth, video.videoHeight);
  return decodeSource(video, {
    x: Math.floor((video.videoWidth - side) / 2),
    y: Math.floor((video.videoHeight - side) / 2),
    width: side,
    height: side,
  });
}

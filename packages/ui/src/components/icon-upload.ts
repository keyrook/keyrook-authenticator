import { MAX_ICON_BYTES } from '@authx/core';
import { AppError } from '../i18n/errors.js';

/**
 * Turns a picture the user chose into something safe and small enough to live
 * inside the vault.
 *
 * Two things matter here, and neither is cosmetic:
 *
 * 1. **The original bytes are never stored.** The file is decoded and redrawn
 *    onto a canvas, and what gets saved is the canvas's output — pixels this
 *    app produced. That is what makes it safe to put in an `<img src>` later:
 *    anything script-shaped in the source cannot survive being rasterised. SVG
 *    is refused outright rather than relied on to rasterise harmlessly.
 *
 * 2. **It has to stay small.** The sync server rejects a record whose encrypted
 *    box passes 64 KB, and a rejection would surface much later as an account
 *    that quietly stops syncing. Compressing until it fits — and failing loudly
 *    if it will not — keeps that from happening.
 */
const TILE = 128;
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp'];

/** A cheap guard before decoding, so a decompression bomb never gets that far. */
const MAX_SOURCE_BYTES = 8 * 1024 * 1024;

export const ICON_ACCEPT = ACCEPTED.join(',');

export class IconTooLargeError extends AppError {
  override readonly name = 'IconTooLargeError';
  constructor() {
    super('image.wontCompress');
  }
}

async function decode(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    throw new AppError('image.unreadable');
  }
}

function encode(canvas: HTMLCanvasElement, quality: number): string {
  // WebP first: for the flat colour of most logos it is several times smaller
  // than PNG at the same apparent quality.
  const webp = canvas.toDataURL('image/webp', quality);
  if (webp.startsWith('data:image/webp')) return webp;
  return canvas.toDataURL('image/png');
}

export async function prepareIcon(file: File): Promise<string> {
  if (!ACCEPTED.includes(file.type)) {
    throw new AppError('image.wrongType');
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new AppError('image.tooBig');
  }

  const bitmap = await decode(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = TILE;
    canvas.height = TILE;
    const context = canvas.getContext('2d');
    if (!context) throw new AppError('image.cannotPrepare');

    // Contain rather than crop: a logo with its edges cut off stops being the
    // logo, and the tile has no background to fill so the gaps stay transparent.
    const scale = Math.min(TILE / bitmap.width, TILE / bitmap.height);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, (TILE - width) / 2, (TILE - height) / 2, width, height);

    for (const quality of [0.85, 0.7, 0.5, 0.35]) {
      const encoded = encode(canvas, quality);
      if (encoded.length <= MAX_ICON_BYTES) return encoded;
    }

    throw new IconTooLargeError();
  } finally {
    bitmap.close();
  }
}

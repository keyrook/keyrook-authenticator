import { useMemo } from 'react';
import encodeQR from 'qr';

/**
 * QR codes, made here. A QR service would be handed the very secret the code
 * carries — so the encoder is a bundled library, and nothing leaves the page.
 *
 * Always black on white with a four-module margin, whatever the theme: that is
 * what a phone camera reads, and a dark-mode code is one it often will not.
 */
export function qrMatrix(text: string): boolean[][] {
  return encodeQR(text, 'raw', { ecc: 'medium', border: 4 });
}

/**
 * `size` is a target, not a promise: on screen the code is drawn at the
 * nearest whole number of pixels per module. At a fraction, crisp edges round
 * some modules one pixel wider than their neighbours, and a dense code — a
 * Google Authenticator transfer of eight accounts — stops reading on a 1x
 * screen. `exact` is for paper, where the SVG prints as vectors and codes of
 * one size look like one sheet.
 */
export function QrCode({
  text,
  size = 220,
  label,
  exact = false,
}: {
  text: string;
  size?: number;
  label: string;
  exact?: boolean;
}) {
  const matrix = useMemo(() => qrMatrix(text), [text]);
  const modules = matrix.length;
  const pixels = exact ? size : Math.max(1, Math.round(size / modules)) * modules;
  const path = useMemo(() => {
    let d = '';
    matrix.forEach((row, y) =>
      row.forEach((on, x) => {
        if (on) d += `M${x} ${y}h1v1h-1z`;
      }),
    );
    return d;
  }, [matrix]);

  return (
    <svg
      viewBox={`0 0 ${modules} ${modules}`}
      width={pixels}
      height={pixels}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className="rounded-xl"
    >
      <rect width={modules} height={modules} fill="#fff" />
      <path d={path} fill="#000" />
    </svg>
  );
}

/** The same code as a PNG, for saving: sharp at any size it is printed. */
export async function qrPng(text: string, pixelsPerModule = 10): Promise<Blob> {
  const matrix = qrMatrix(text);
  const size = matrix.length * pixelsPerModule;
  const canvas = new OffscreenCanvas(size, size);
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#fff';
  context.fillRect(0, 0, size, size);
  context.fillStyle = '#000';
  matrix.forEach((row, y) =>
    row.forEach((on, x) => {
      if (on) context.fillRect(x * pixelsPerModule, y * pixelsPerModule, pixelsPerModule, pixelsPerModule);
    }),
  );
  return canvas.convertToBlob({ type: 'image/png' });
}

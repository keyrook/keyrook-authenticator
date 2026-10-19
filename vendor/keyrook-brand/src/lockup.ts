/**
 * The crow and the word together, built from the same drawings rather than
 * redrawn, so a change to either reaches every lockup.
 */
import { MARK_FULL, type Mark, type MarkPart } from './mark.ts';
import { WORDMARK } from './wordmark.ts';

interface Placement {
  mark: Mark;
  /** Where the mark's view box lands, and how large it is drawn. */
  x: number;
  y: number;
  scale: number;
}

/** Every number in an absolute M, L, C path is an x then a y. */
function movePath(d: string, move: (x: number, y: number) => [number, number]): string {
  const tokens = d.match(/[MLCZ]|-?\d*\.?\d+/g) ?? [];
  const out: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;
    if (/[MLCZ]/.test(token)) {
      out.push(token);
      continue;
    }
    const [x, y] = move(Number(token), Number(tokens[++i]));
    out.push(`${round(x)} ${round(y)}`);
  }
  return out.join(' ');
}

const round = (value: number) => Math.round(value * 100) / 100;

export function compose(placements: readonly Placement[], view: Mark['view'], halo: number): Mark {
  const parts: MarkPart[] = [];
  for (const { mark, x, y, scale } of placements) {
    const move = (px: number, py: number): [number, number] => [
      (px - mark.view[0]) * scale + x,
      (py - mark.view[1]) * scale + y,
    ];
    for (const part of mark.parts) {
      if (part.kind === 'fill' || part.kind === 'stroke') {
        const d = movePath(part.d, move);
        parts.push(part.kind === 'fill' ? { ...part, d } : { ...part, d, width: round(part.width * scale) });
      } else {
        const [cx, cy] = move(part.cx, part.cy);
        const r = round(part.r * scale);
        parts.push(
          part.kind === 'disc'
            ? { ...part, cx: round(cx), cy: round(cy), r }
            : { ...part, cx: round(cx), cy: round(cy), r, width: round(part.width * scale) },
        );
      }
    }
  }
  return { view, parts, halo };
}

/** Crow on the left, the word's x-height level with the crow's body. */
export const LOCKUP_HORIZONTAL: Mark = compose(
  [
    { mark: MARK_FULL, x: 0, y: 0, scale: 1 },
    { mark: WORDMARK, x: 96, y: 13, scale: 0.72 },
  ],
  [0, 0, 258, 86],
  3.5,
);

/** Crow above, word below: for square spaces — a splash, an avatar, a sticker. */
export const LOCKUP_STACKED: Mark = compose(
  [
    { mark: MARK_FULL, x: 32, y: 0, scale: 1.3 },
    { mark: WORDMARK, x: 13, y: 112, scale: 0.68 },
  ],
  [0, 0, 176, 172],
  3.5,
);

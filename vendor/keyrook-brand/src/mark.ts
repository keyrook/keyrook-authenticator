/**
 * The Keyrook mark: a rook — the bird — holding a key in its beak. It is the
 * brand's own, for what every Keyrook product shares — the account, emails,
 * the brand's site, a "by Keyrook". A product never wears it as its icon;
 * each has its own mark (authenticator.ts).
 * A rook is
 * also the chess piece the name suggests, and crows are known for keeping
 * what they pick up; the mark says both without spelling either.
 *
 * Drawn by hand on a 100-unit grid and kept as data so that one geometry
 * serves every product: `markSvg` writes it as SVG, `scripts/raster.mjs` as
 * PNG with no image dependencies. Paths use absolute M, L, C and Z only — the
 * rasteriser reads nothing else, and test/brand.test.ts holds them to it.
 *
 * `ink` is the crow itself: currentColor in the interface, so it follows the
 * theme, and near-black in the PNG, which carries a paper-coloured halo so it
 * still reads on a dark toolbar.
 */

import { CRAYON as CRAYONS } from './tokens.ts';

export type MarkColour = 'ink' | `#${string}`;

export type MarkPart =
  | { kind: 'fill'; d: string; colour: MarkColour }
  | { kind: 'stroke'; d: string; colour: MarkColour; width: number }
  | { kind: 'disc'; cx: number; cy: number; r: number; colour: MarkColour }
  | { kind: 'ring'; cx: number; cy: number; r: number; colour: MarkColour; width: number };

export interface Mark {
  /** [x, y, width, height]; square for the mark itself. */
  view: readonly [number, number, number, number];
  parts: readonly MarkPart[];
  /** Width of the paper outline round the whole bird where it needs one. */
  halo: number;
}

const CRAYON = {
  blue: CRAYONS.blue[500],
  red: CRAYONS.red[500],
  yellow: CRAYONS.yellow[500],
  green: CRAYONS.green[500],
} as const;

const BODY =
  'M20 66 C18 50 30 34 50 33 C58 33 63 36 66 41 L85 45 L67 50.5 C70 63 63 76 48 79 L34 80 C28 82 20 88 13 92 C18 84 20 76 20 66 Z';
const CREST = 'M47 34 C46 29 49 25.5 54 24.5 C52.5 28 53.5 31 56.5 34 Z';

/** From 32 px up: the whole bird, four crayon feathers, feet. */
export const MARK_FULL: Mark = {
  view: [9, 16, 86, 86],
  halo: 3.5,
  parts: [
    { kind: 'fill', d: BODY, colour: 'ink' },
    { kind: 'fill', d: CREST, colour: 'ink' },
    { kind: 'disc', cx: 57.5, cy: 41, r: 3.1, colour: CRAYON.yellow },
    { kind: 'stroke', d: 'M29 56 C37 52 45 53 52 58', colour: CRAYON.blue, width: 3.8 },
    { kind: 'stroke', d: 'M27 62 C35 58 43 59 50 64', colour: CRAYON.red, width: 3.8 },
    { kind: 'stroke', d: 'M26 68 C33 65 40 66 47 70', colour: CRAYON.yellow, width: 3.8 },
    { kind: 'stroke', d: 'M26 74 C32 72 38 72 44 75', colour: CRAYON.green, width: 3.8 },
    { kind: 'ring', cx: 83, cy: 53, r: 5, colour: CRAYON.yellow, width: 3.6 },
    { kind: 'stroke', d: 'M83 58 L83.4 79', colour: CRAYON.yellow, width: 3.6 },
    { kind: 'stroke', d: 'M83.2 72 L89 71.6', colour: CRAYON.yellow, width: 3.6 },
    { kind: 'stroke', d: 'M83.3 77 L88 77.4', colour: CRAYON.yellow, width: 3.6 },
    { kind: 'stroke', d: 'M40 79 L38.5 90 L34 92', colour: 'ink', width: 2.8 },
    { kind: 'stroke', d: 'M38.5 90 L42 92.5', colour: 'ink', width: 2.8 },
    { kind: 'stroke', d: 'M50 78 L50.5 90 L46 92.5', colour: 'ink', width: 2.8 },
    { kind: 'stroke', d: 'M50.5 90 L54 92', colour: 'ink', width: 2.8 },
  ],
};

/**
 * 16 and 24 px: a pixel is five units here, so the feet and four feathers
 * would only smudge. Two broad feathers keep the colour; the key grows.
 */
export const MARK_COMPACT: Mark = {
  view: [8, 14, 89, 89],
  halo: 5,
  parts: [
    { kind: 'fill', d: BODY, colour: 'ink' },
    { kind: 'fill', d: CREST, colour: 'ink' },
    { kind: 'disc', cx: 57, cy: 41.5, r: 4.8, colour: CRAYON.yellow },
    { kind: 'stroke', d: 'M28 58 C37 53 46 55 53 61', colour: CRAYON.blue, width: 6 },
    { kind: 'stroke', d: 'M26 68 C34 64 42 65 49 71', colour: CRAYON.red, width: 6 },
    { kind: 'ring', cx: 82, cy: 55, r: 6, colour: CRAYON.yellow, width: 5.5 },
    { kind: 'stroke', d: 'M82 61 L82.4 84', colour: CRAYON.yellow, width: 5.5 },
    { kind: 'stroke', d: 'M82.2 76 L89 75.6', colour: CRAYON.yellow, width: 5.5 },
  ],
};

/** The crow to use at a rendered size, in CSS or device pixels. */
export const markFor = (pixels: number): Mark => (pixels < 32 ? MARK_COMPACT : MARK_FULL);

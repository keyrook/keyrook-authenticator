/**
 * "keyrook", lettered by hand in one pen weight, lower case. It is drawn, not
 * typed: no font ships with it, so it looks the same in every product and on
 * every system, and nobody else's typeface is part of the brand.
 *
 * Strokes in the same M, L, C, Z subset as the mark, on a grid where the
 * baseline is y 60 and the x-height 30. Ends overlap a little where a pen
 * would close a letter.
 */
import type { Mark } from './mark.ts';

const PEN = 6.5;

const LETTERS = [
  // k
  'M9 10 C8.5 27 8.5 44 8 60',
  'M30 31 C23 37 16 42 9.5 47',
  'M15 43 C21 48 26 54 31.5 60.5',
  // e
  'M39.5 46 C47 45.5 54 45.5 62 45 C62 36 56.5 30 50 30 C42.5 30 38 37 38 45.5 C38 54 44 60.5 51.5 60.5 C56 60.5 59.5 58.5 62 55.5',
  // y
  'M70 31 C70.5 42 74.5 50 81.5 50 C88 50 91 43 92 31 C91.5 44 91.5 58 91 70 C90.5 78 85 82 78.5 81.5 C74 81 71 78.5 69.5 75',
  // r
  'M102 31.5 C102.5 41 102 51 102.5 60.5',
  'M102.5 43 C105 35 110.5 30.5 118.5 31.5',
  // o
  'M133 30 C141.5 30 147.5 37 147.5 45.5 C147.5 54 141.5 60.5 132.5 60.5 C123.5 60.5 117.5 53.5 117.5 45 C117.5 36.5 123.5 30 134.5 31.5',
  // o
  'M167 30 C175.5 30 181.5 37 181.5 45.5 C181.5 54 175.5 60.5 166.5 60.5 C157.5 60.5 151.5 53.5 151.5 45 C151.5 36.5 157.5 30 168.5 31.5',
  // k
  'M191 10 C190.5 27 190.5 44 190 60',
  'M212 31 C205 37 198 42 191.5 47',
  'M197 43 C203 48 208 54 213.5 60.5',
] as const;

/** The word alone. */
export const WORDMARK: Mark = {
  view: [0, 2, 222, 88],
  parts: LETTERS.map((d) => ({ kind: 'stroke', d, colour: 'ink', width: PEN })),
  halo: 4,
};

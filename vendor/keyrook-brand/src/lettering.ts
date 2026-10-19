/**
 * Keyrook's lettering: the hand of the wordmark carried on to the whole
 * lower-case alphabet, the digits and the Vietnamese marks, for display words
 * — a headline on a Keyrook site, store art, a sticker.
 *
 * It is drawn, never typed. There is no font file: `letter()` lays the
 * strokes out as a Mark, and markSvg writes it, with the words themselves as
 * its spoken title. Words a person reads in an interface stay in the system's
 * faces, in every language; lettering is for a few words at display size, in
 * the Latin alphabet and Vietnamese, and a page in any other script sets the
 * same words in its own face instead. Never for a code, an amount, a date or
 * anything copied — and never for "keyrook", which is the wordmark's alone.
 *
 * Same grid as the wordmark: ascender 10, x-height 30, baseline 60,
 * descender 82; one pen of 6.5; absolute M, L and C only, so the rasteriser
 * can draw it. Each glyph is stored in the order a hand writes it, which is
 * the order .kr-draw-in-turn draws it in.
 */
import { compose } from './lockup.ts';
import type { Mark, MarkPart } from './mark.ts';

/** The wordmark's pen. */
export const LETTERING_PEN = 6.5;

export interface Glyph {
  /** Distance to the next glyph's origin, side bearings included. */
  advance: number;
  d: string;
  /** Where a mark above sits, when not at half the advance. */
  anchor?: number;
  /** The horn of ơ and ư. */
  horn?: string;
}

const BOWL = 'M26 37 C23.5 32.5 20 30 15.5 30 C8.5 30 4 37 4 45.5 C4 54 8.5 60.5 15 60.5 C20.5 60.5 24.5 56 26 50';
const ARCH = 'C7 35 11.5 30 17.5 30 C24 30 26.5 34.5 26.5 41 C26.5 48 26.5 54 27 60.5';
const LOOP_RIGHT = 'M5.5 44 C7 35.5 12 30 18.5 30 C25.5 30 30 37 30 45.5 C30 54 25 60.5 18 60.5 C12 60.5 7.5 56.5 5.5 51';

export const GLYPHS: Readonly<Record<string, Glyph>> = {
  a: { advance: 31, anchor: 15.5, d: `${BOWL} M26.5 30.5 C26 41 26 51 27 60.5` },
  b: { advance: 34, d: `M5 10 C4.5 27 4.5 44 5 60.5 ${LOOP_RIGHT}` },
  c: { advance: 31, d: 'M27 35 C24.5 31.5 21 30 17 30 C9.5 30 4 37 4 45.5 C4 54 9.5 60.5 17 60.5 C21.5 60.5 25 58.5 27.5 55' },
  d: { advance: 31, d: `${BOWL} M26.5 10 C26 27 26 44 27 60.5` },
  đ: { advance: 35, d: `${BOWL} M26.5 10 C26 27 26 44 27 60.5 M20 19 C25 18.5 30 18.5 34 19` },
  e: { advance: 32, anchor: 16, d: 'M5.5 46 C13 45.5 20 45.5 28 45 C28 36 22.5 30 16 30 C8.5 30 4 37 4 45.5 C4 54 10 60.5 17.5 60.5 C22 60.5 25.5 58.5 28 55.5' },
  f: { advance: 23, d: 'M20 12 C17.5 10 15.5 9.5 13.5 10 C9.5 11 8.5 15 8.5 21 C8.5 34 8.5 47 8 60.5 M3.5 31 C8.5 30.5 14 30.5 19 31' },
  g: { advance: 31, d: 'M26 37 C23.5 32.5 20 30 15.5 30 C8.5 30 4 37 4 45.5 C4 54 8.5 59 14.5 59 C20 59 24 55 26 49 M26.5 30.5 C26 44 26 58 26 70 C26 78 21 82 14.5 81.5 C10 81 7 78.5 5.5 75' },
  h: { advance: 31, d: `M5 10 C4.5 27 4.5 44 4.5 60.5 M5 44 ${ARCH}` },
  i: { advance: 10, anchor: 5, d: 'M5 31.5 C5.5 41 5 51 5.5 60.5 M5 17 L5.2 17.4' },
  // Dotless: an i that carries a mark above gives up its dot, as in print.
  ı: { advance: 10, anchor: 5, d: 'M5 31.5 C5.5 41 5 51 5.5 60.5' },
  j: { advance: 15, d: 'M10 31.5 C10.5 45 10.5 58 10 70 C9.5 77 7 81 2.5 81.5 M10 17 L10.2 17.4' },
  k: { advance: 32, d: 'M6 10 C5.5 27 5.5 44 5 60 M27 31 C20 37 13 42 6.5 47 M12 43 C18 48 23 54 28.5 60.5' },
  l: { advance: 13, d: 'M5.5 10 C5 27 5 44 5.5 55 C5.5 59 7 60.5 10 60.5' },
  m: {
    advance: 41,
    d: 'M5 31.5 C5.5 41 5 51 5 60.5 M5 41 C6.5 34 9.5 30 14 30 C18.5 30 20.5 33.5 20.5 39 C20.5 46 20.5 53 21 60.5 M21 40 C22.5 34 25.5 30 30 30 C34.5 30 36.5 33.5 36.5 39 C36.5 46 36.5 53 37 60.5',
  },
  n: { advance: 31, d: `M5 31.5 C5.5 41 5 51 5 60.5 M5 42 ${ARCH}` },
  o: {
    advance: 34,
    anchor: 17,
    d: 'M17 30 C24.5 30 30 37 30 45.5 C30 54 24.5 60.5 16.5 60.5 C8.5 60.5 4 53.5 4 45 C4 36.5 9 30 18.5 31.5',
    horn: 'M27 34 C30.5 33.5 33 31 33.5 27.5',
  },
  p: { advance: 34, d: `M5 31 C5.5 48 5.5 65 5 82 ${LOOP_RIGHT}` },
  q: { advance: 31, d: `${BOWL} M26.5 30.5 C26 48 26 65 26.5 82` },
  r: { advance: 24, d: 'M5 31.5 C5.5 41 5 51 5.5 60.5 M5.5 43 C8 35 13.5 30.5 21.5 31.5' },
  s: { advance: 30, d: 'M25 35 C22.5 31.5 19 30 15 30 C9.5 30 6 33 6 37 C6 41.5 10 43.5 15 45 C21 46.5 26 48.5 26 53.5 C26 58 22 60.5 16 60.5 C11 60.5 7 58.5 4.5 55' },
  t: { advance: 23, d: 'M10 17 C10 31 9.5 44 9.5 52 C9.5 58 12 60.5 16 60.5 C17.5 60.5 19 60 20 59 M3.5 31 C9 30.5 14 30.5 19.5 31' },
  u: {
    advance: 31,
    anchor: 15.5,
    d: 'M5 31 C4.5 38 4.5 44 4.5 49 C4.5 56 7.5 60.5 14 60.5 C20 60.5 24.5 55.5 26 48 M26 31 C26.5 41 26 51 26.5 60.5',
    horn: 'M26.5 33 C30 32.5 32 30 32.5 26.5',
  },
  v: { advance: 31, d: 'M4 31 C7.5 41 11 51 15 60.5 C19 51 22.5 41 26.5 30.5' },
  w: { advance: 39, d: 'M4 31 C6.5 41 9 51 12 60.5 C14.5 52 17 44 19.5 36 C22 44 24.5 52 27 60.5 C30 51 32.5 41 35 30.5' },
  x: { advance: 30, d: 'M5 31 C11 40 17.5 50 25.5 60.5 M25 30.5 C18 40.5 11.5 50.5 4.5 60.5' },
  y: { advance: 30, anchor: 15, d: 'M4 31 C4.5 42 8.5 50 15.5 50 C22 50 25 43 26 31 C25.5 44 25.5 58 25 70 C24.5 78 19 82 12.5 81.5 C8 81 5 78.5 3.5 75' },
  z: { advance: 31, d: 'M5 31.5 C12 31 18.5 31 25.5 30.5 C18.5 40.5 11.5 50.5 4.5 60.5 C12 60 19 60 26.5 60' },
  0: { advance: 31, d: 'M15.5 14 C23 14 27.5 24 27.5 37 C27.5 50 23 60.5 15 60.5 C7.5 60.5 3.5 50 3.5 37 C3.5 23.5 8 14 17 15.5' },
  1: { advance: 22, d: 'M6 21 C9.5 19 12.5 16.5 15 14 C14.5 30 14.5 45 15 60.5' },
  2: { advance: 31, d: 'M5 22 C7 16.5 11 14 16 14 C21.5 14 25.5 18 25.5 23.5 C25.5 31 19 37 4.5 60.5 C12 60 19 60 27 60' },
  3: { advance: 31, d: 'M5.5 19.5 C8 15.5 12 14 16 14 C21.5 14 25 17.5 25 22.5 C25 28.5 20 33 13 34 C21 34 26.5 39 26.5 46.5 C26.5 54.5 21 60.5 14.5 60.5 C9.5 60.5 6 58 4 54' },
  4: { advance: 32, d: 'M20 14 C14.5 25 9.5 35 3.5 46 C11.5 45.5 20 45.5 28.5 45.5 M21.5 30 C21 40 21 50 21.5 60.5' },
  5: { advance: 31, d: 'M25 14.5 C19 14.5 13 14.5 8 15 C7.5 21 7 27 6.5 33.5 C9 31.5 12 30.5 15.5 30.5 C22.5 30.5 27 36.5 27 45 C27 54 21.5 60.5 14.5 60.5 C10 60.5 6.5 58.5 4 55' },
  6: { advance: 31, d: 'M23 15.5 C21 14.5 19 14 17 14 C8.5 14 4 24 4 40 C4 52.5 8.5 60.5 15.5 60.5 C22 60.5 26.5 55 26.5 47.5 C26.5 40 22 35 15.5 35 C10.5 35 6.5 38 4.5 42' },
  7: { advance: 30, d: 'M4 15 C11.5 14.5 19 14.5 27 14 C20.5 29 15 44 11 60.5' },
  8: {
    advance: 31,
    d: 'M15.5 14 C21.5 14 25 17.5 25 22.5 C25 28 20.5 31.5 15 34 C9 36.5 4 40 4 47 C4 55 9 60.5 15.5 60.5 C22 60.5 27 55.5 27 48 C27 41 22 37 15.5 34 C10 31.5 6 28 6 22.5 C6 17 10 14 16.5 14.5',
  },
  9: { advance: 31, d: 'M26 26 C24.5 18.5 20.5 14 15 14 C8.5 14 4.5 19.5 4.5 27 C4.5 34.5 9 39.5 15 39.5 C20 39.5 24 36.5 26 32 M26.5 22 C26.5 36 26 48 25 54 C24 58.5 21 60.5 16.5 60.5 C12.5 60.5 9.5 59 7.5 56.5' },
  '.': { advance: 10, d: 'M5 60 L5.2 60.4' },
  ',': { advance: 10, d: 'M6 59 C6 62 5 64.5 3.5 66.5' },
  '!': { advance: 11, d: 'M6 14 C6 27 5.5 39 5.5 49 M5.5 60 L5.6 60.4' },
  '?': { advance: 30, d: 'M4.5 22 C6 16.5 10.5 14 15.5 14 C21 14 25 18 25 23.5 C25 30 20.5 33 16 36 C14 37.5 13.5 40 13.5 47 M13.5 60 L13.6 60.4' },
  '-': { advance: 23, d: 'M4 46 C9 45.5 14 45.5 19 46' },
  "'": { advance: 10, d: 'M6 12 C6 15 5.5 18 5 21' },
};

const WORD_SPACE = 14;
// Room either side, so a j or a comma at the edge is not cropped.
const MARGIN = 2;
const HORN_WIDTH = 4;

type Tone = 'acute' | 'grave' | 'hook' | 'tilde';
type Hat = 'circumflex' | 'breve';

const TONES: Record<string, Tone> = { '\u0301': 'acute', '\u0300': 'grave', '\u0309': 'hook', '\u0303': 'tilde' };
const HATS: Record<string, Hat> = { '\u0302': 'circumflex', '\u0306': 'breve' };
const DOT_BELOW = '\u0323';
const HORN = '\u031B';
// Where Vietnamese puts each mark. Anything else (ñ, ŷ, ǎ) is another
// language's letter, and lettering draws only the letters it was made for.
const TAKES_TONE = 'aeiouy';
const TAKES_HAT: Record<Hat, string> = { circumflex: 'aeo', breve: 'a' };

const r = (value: number) => Math.round(value * 100) / 100;

/** A tone mark centred on cx; lifted, and moved aside where it sits on a hat. */
function tone(kind: Tone, cx: number, hat: Hat | undefined): string {
  // Over â, ê, ô the acute and hook go up to the right and the grave to the
  // left, as Vietnamese is set in print; over ă every tone sits square on top.
  const lift = hat ? 10 : 0;
  const aside = hat === 'circumflex' ? (kind === 'grave' ? -7 : kind === 'tilde' ? 0 : 7) : 0;
  const x = cx + aside;
  const y = (value: number) => r(value - lift);
  switch (kind) {
    case 'acute':
      return `M${r(x - 3)} ${y(25)} C${r(x - 1)} ${y(22)} ${r(x + 1.5)} ${y(19)} ${r(x + 4)} ${y(16)}`;
    case 'grave':
      return `M${r(x - 4)} ${y(16)} C${r(x - 1.5)} ${y(19)} ${r(x + 1)} ${y(22)} ${r(x + 3)} ${y(25)}`;
    case 'hook':
      return `M${r(x - 3.5)} ${y(18)} C${r(x - 2)} ${y(15)} ${r(x + 3.5)} ${y(15)} ${r(x + 3.5)} ${y(18.5)} C${r(x + 3.5)} ${y(21)} ${r(x + 0.5)} ${y(21.5)} ${r(x)} ${y(24.5)}`;
    case 'tilde':
      return `M${r(x - 7)} ${y(22)} C${r(x - 5)} ${y(18)} ${r(x - 2.5)} ${y(18)} ${r(x - 0.5)} ${y(20)} C${r(x + 1.5)} ${y(22)} ${r(x + 4)} ${y(22)} ${r(x + 6.5)} ${y(18.5)}`;
  }
}

function hat(kind: Hat, cx: number): string {
  return kind === 'circumflex'
    ? `M${r(cx - 7)} 25 C${r(cx - 4.5)} 22 ${r(cx - 2)} 19 ${r(cx)} 17 C${r(cx + 2)} 19 ${r(cx + 4.5)} 22 ${r(cx + 7)} 25`
    : `M${r(cx - 7)} 17 C${r(cx - 5.5)} 24 ${r(cx + 5.5)} 24 ${r(cx + 7)} 17`;
}

/** One character — a letter with whatever marks it carries — as a Mark at the origin. */
function character(char: string): Mark {
  const [base = '', ...marks] = [...char.normalize('NFD')];
  const tones = marks.filter((m) => m in TONES).map((m) => TONES[m]!);
  const hats = marks.filter((m) => m in HATS).map((m) => HATS[m]!);
  const horn = marks.includes(HORN);
  const dotBelow = marks.includes(DOT_BELOW);
  const known = marks.every((m) => m in TONES || m in HATS || m === HORN || m === DOT_BELOW);
  const above = tones.length + hats.length > 0;
  const glyph = GLYPHS[base === 'i' && above ? 'ı' : base];
  const placed =
    ((tones.length === 0 && !dotBelow) || TAKES_TONE.includes(base)) && hats.every((kind) => TAKES_HAT[kind].includes(base));
  if (!glyph || !known || !placed || tones.length > 1 || hats.length > 1 || (horn && !glyph.horn)) {
    throw new Error(`No lettering for "${char}".`);
  }
  const cx = glyph.anchor ?? glyph.advance / 2;
  const strokes = [
    glyph.d,
    ...(horn && glyph.horn ? [glyph.horn] : []),
    ...hats.map((kind) => hat(kind, cx)),
    ...tones.map((kind) => tone(kind, cx, hats[0])),
    ...(dotBelow ? [`M${r(cx)} 71 L${r(cx + 0.2)} 71.4`] : []),
  ];
  const advance = glyph.advance + (horn ? HORN_WIDTH : 0);
  return {
    view: [0, 0, advance, 90],
    halo: 0,
    parts: strokes.map((d): MarkPart => ({ kind: 'stroke', d, colour: 'ink', width: LETTERING_PEN })),
  };
}

/**
 * A few display words, lettered. Lower-cases what it is given, as the
 * wordmark is lower case. Throws on a character it has no drawing for rather
 * than drawing something else, on more than five words, and on "keyrook".
 */
export function letter(text: string): Mark {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) throw new Error('Nothing to letter.');
  if (words.length > 5) throw new Error('Lettering is for display words: five at most.');
  if (/keyrook/i.test(text)) throw new Error('"keyrook" is the wordmark, drawn on its own: use WORDMARK.');

  const placements: { mark: Mark; x: number; y: number; scale: number }[] = [];
  let x = MARGIN;
  words.forEach((word, index) => {
    if (index > 0) x += WORD_SPACE;
    for (const char of word.normalize('NFC').toLocaleLowerCase('vi')) {
      const mark = character(char);
      placements.push({ mark, x, y: 0, scale: 1 });
      x += mark.view[2];
    }
  });
  return compose(placements, [0, 0, r(x + MARGIN), 90], 4);
}

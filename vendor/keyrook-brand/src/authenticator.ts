/**
 * Keyrook Authenticator's own mark: the countdown asterisk the extension has
 * always had — eight ticks round a centre, like the dial of the 30-second
 * timer every code runs on, and like the asterisks that mask a password —
 * redrawn in Keyrook's crayons by hand.
 *
 * A product carries its own mark, never the crow: the crow is Keyrook's, and
 * speaks only where Keyrook does (the account, emails, the brand's site).
 *
 * The four crayons run blue, yellow, red, green clockwise from twelve — the
 * warm pair together, the cool pair together. Google's blue, red, yellow,
 * green is a different ring in either direction (blue, green, yellow, red is
 * theirs read backwards). That, Keyrook's hues rather than Google's, and the
 * hand-drawn line keep eight coloured ticks from reading as theirs.
 * test/brand.test.ts holds all of it.
 */
import type { Mark } from './mark.ts';
import { CRAYON as CRAYONS } from './tokens.ts';

const CRAYON = {
  blue: CRAYONS.blue[500],
  red: CRAYONS.red[500],
  yellow: CRAYONS.yellow[500],
  green: CRAYONS.green[500],
} as const;

/** From 32 px up: each tick bends a little, the way a hand pulls a crayon. */
export const AUTHENTICATOR_MARK: Mark = {
  view: [0, 0, 100, 100],
  halo: 0,
  parts: [
    { kind: 'stroke', d: 'M50.32 34.6 C48.58 26.45 48.31 18.25 49.5 10', colour: CRAYON.blue, width: 11 },
    { kind: 'stroke', d: 'M59.98 39.48 C67.36 35.03 73.56 29.3 78.58 22.3', colour: CRAYON.yellow, width: 11 },
    { kind: 'stroke', d: 'M65.3 49.79 C73.2 51.57 81.13 51.75 89.1 50.33', colour: CRAYON.red, width: 11 },
    { kind: 'stroke', d: 'M60.44 61.04 C67.47 65.67 73.6 71.28 78.83 77.88', colour: CRAYON.green, width: 11 },
    { kind: 'stroke', d: 'M50.26 64.7 C48.63 72.86 48.41 81.06 49.59 89.3', colour: CRAYON.blue, width: 11 },
    { kind: 'stroke', d: 'M38.83 60.75 C34.47 67.82 28.9 73.75 22.11 78.54', colour: CRAYON.yellow, width: 11 },
    { kind: 'stroke', d: 'M35.2 49.77 C26.91 51.5 18.57 51.71 10.2 50.38', colour: CRAYON.red, width: 11 },
    { kind: 'stroke', d: 'M38.87 39.36 C34.59 32.59 29.23 26.82 22.8 22.05', colour: CRAYON.green, width: 11 },
  ],
};

/**
 * 16 and 24 px: straighter and thicker. A bend of two units is a third of a
 * pixel here — it would only blur the tick, not make it look drawn.
 */
export const AUTHENTICATOR_MARK_COMPACT: Mark = {
  view: [0, 0, 100, 100],
  halo: 0,
  parts: [
    { kind: 'stroke', d: 'M50.35 33.1 C49.4 25.09 49.11 17.06 49.48 9', colour: CRAYON.blue, width: 12 },
    { kind: 'stroke', d: 'M61.01 38.39 C67.64 33.37 73.73 27.78 79.3 21.61', colour: CRAYON.yellow, width: 12 },
    { kind: 'stroke', d: 'M66.8 49.77 C74.55 50.68 82.31 50.87 90.1 50.34', colour: CRAYON.red, width: 12 },
    { kind: 'stroke', d: 'M61.47 62.13 C67.9 67.17 73.93 72.65 79.54 78.57', colour: CRAYON.green, width: 12 },
    { kind: 'stroke', d: 'M50.28 66.2 C49.42 74.21 49.18 82.25 49.58 90.3', colour: CRAYON.blue, width: 12 },
    { kind: 'stroke', d: 'M37.75 61.79 C32.85 68.12 27.41 73.94 21.41 79.25', colour: CRAYON.yellow, width: 12 },
    { kind: 'stroke', d: 'M33.7 49.74 C25.55 50.65 17.39 50.86 9.2 50.38', colour: CRAYON.red, width: 12 },
    { kind: 'stroke', d: 'M37.78 38.32 C33.04 32.21 27.81 26.55 22.1 21.33', colour: CRAYON.green, width: 12 },
  ],
};

/** The Authenticator mark to use at a rendered size, in CSS or device pixels. */
export const authenticatorMarkFor = (pixels: number): Mark =>
  pixels < 32 ? AUTHENTICATOR_MARK_COMPACT : AUTHENTICATOR_MARK;

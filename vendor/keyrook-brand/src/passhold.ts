/**
 * Passhold's own mark: a padlock drawn in one blue line, holding three dots —
 * the way a password field shows what it hides. The lock says what the app
 * is for at a glance, as a password manager's icon must; the dots say whose
 * hand drew it, in the remaining crayons.
 *
 * A product carries its own mark, never the crow: the crow is Keyrook's, and
 * speaks only where Keyrook does (the account, emails, the brand's site, a
 * "by Keyrook").
 *
 * Read left to right from the lock, the crayons run blue, yellow, red, green
 * — the Authenticator's order, so the two products sit together, and not
 * Google's (blue, red, yellow, green), in either direction.
 * test/brand.test.ts holds it.
 */
import type { Mark } from './mark.ts';
import { CRAYON as CRAYONS } from './tokens.ts';

const CRAYON = {
  blue: CRAYONS.blue[500],
  red: CRAYONS.red[500],
  yellow: CRAYONS.yellow[500],
  green: CRAYONS.green[500],
} as const;

/** From 32 px up: the box leans a little and the shackle is pulled by hand. */
export const PASSHOLD_MARK: Mark = {
  view: [0, 0, 100, 100],
  halo: 0,
  parts: [
    { kind: 'stroke', d: 'M33.5 42 C33 30.5 39.8 17.6 50.4 17.8 C61.2 18 67.4 30.2 66.6 42', colour: CRAYON.blue, width: 9 },
    {
      kind: 'stroke',
      d: 'M24.2 42.4 C41 41.6 59.5 41.9 76.4 42.6 C80.4 42.8 82.6 45.1 82.4 49 C82 58.5 82.1 67.6 82.6 76.4 C82.8 80.4 80.6 82.6 76.5 82.5 C59.4 81.9 41.2 82.2 23.4 82.8 C19.5 82.9 17.4 80.7 17.5 76.8 C18 66.8 17.9 57.4 17.4 48.4 C17.2 44.6 19.9 42.6 24.2 42.4',
      colour: CRAYON.blue,
      width: 9,
    },
    { kind: 'disc', cx: 33.6, cy: 62.6, r: 6.2, colour: CRAYON.yellow },
    { kind: 'disc', cx: 50, cy: 62.2, r: 6.2, colour: CRAYON.red },
    { kind: 'disc', cx: 66.4, cy: 62.7, r: 6.2, colour: CRAYON.green },
  ],
};

/**
 * 16 and 24 px: straighter and thicker, with bigger dots. A lean of a unit is
 * a sixth of a pixel here — it would only blur the box, not make it look drawn.
 */
export const PASSHOLD_MARK_COMPACT: Mark = {
  view: [0, 0, 100, 100],
  halo: 0,
  parts: [
    { kind: 'stroke', d: 'M33.5 42 C33.2 29 40 18 50 18 C60 18 66.8 29 66.5 42', colour: CRAYON.blue, width: 11 },
    {
      kind: 'stroke',
      d: 'M24 42 C41.3 41.8 58.7 41.8 76 42 C80 42 82.3 44.3 82.3 48.3 C82.2 58 82.2 67.3 82.3 76.6 C82.3 80.6 80 82.9 76 82.9 C58.7 83 41.3 83 24 82.9 C20 82.9 17.7 80.6 17.7 76.6 C17.8 67.3 17.8 58 17.7 48.3 C17.7 44.3 20 42 24 42',
      colour: CRAYON.blue,
      width: 11,
    },
    { kind: 'disc', cx: 33.5, cy: 62.5, r: 7.5, colour: CRAYON.yellow },
    { kind: 'disc', cx: 50, cy: 62.5, r: 7.5, colour: CRAYON.red },
    { kind: 'disc', cx: 66.5, cy: 62.5, r: 7.5, colour: CRAYON.green },
  ],
};

/** The Passhold mark to use at a rendered size, in CSS or device pixels. */
export const passholdMarkFor = (pixels: number): Mark => (pixels < 32 ? PASSHOLD_MARK_COMPACT : PASSHOLD_MARK);

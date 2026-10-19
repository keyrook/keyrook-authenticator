/**
 * Any Keyrook drawing as an SVG string — for the asset kit, a website's
 * <img>, an email header. No DOM: it runs in Node as well as a page.
 */
import { INK, PAPER } from './tokens.ts';
import type { Mark, MarkPart } from './mark.ts';

export interface SvgOptions {
  /** The crow's colour. currentColor follows the text it sits in. */
  ink?: string;
  /** Draw every part in this one colour: for a stamp, an engraving, a fax. */
  mono?: string;
  /** A paper outline round the drawing, so it reads on any background. */
  sticker?: boolean;
  /** Spoken name; without one the SVG is marked decorative. */
  title?: string;
  /** Pixel width; default is the view box's own. null leaves size to CSS. */
  width?: number | null;
  /** Give each line pathLength="1", so .kr-draw can draw it in. */
  drawable?: boolean;
}

const ROUND = 'stroke-linecap="round" stroke-linejoin="round"';

function element(part: MarkPart, colour: string, grow = 0, drawable = false): string {
  const length = drawable ? ' pathLength="1"' : '';
  switch (part.kind) {
    case 'fill':
      return grow
        ? `<path d="${part.d}" fill="${colour}" stroke="${colour}" stroke-width="${grow * 2}" ${ROUND}/>`
        : `<path d="${part.d}" fill="${colour}"/>`;
    case 'stroke':
      return `<path${length} d="${part.d}" fill="none" stroke="${colour}" stroke-width="${part.width + grow * 2}" ${ROUND}/>`;
    case 'disc':
      return `<circle cx="${part.cx}" cy="${part.cy}" r="${part.r + grow}" fill="${colour}"/>`;
    case 'ring':
      return grow
        ? `<circle cx="${part.cx}" cy="${part.cy}" r="${part.r + part.width / 2 + grow}" fill="${colour}"/>`
        : `<circle${length} cx="${part.cx}" cy="${part.cy}" r="${part.r}" fill="none" stroke="${colour}" stroke-width="${part.width}"/>`;
  }
}

/** Just the drawing's elements, for a <symbol> or an <svg> a page already has. */
export function markElements(mark: Mark, options: Pick<SvgOptions, 'ink' | 'mono' | 'sticker' | 'drawable'> = {}): string {
  const { ink = INK, mono, sticker = false, drawable = false } = options;
  const colourOf = (part: MarkPart) => mono ?? (part.colour === 'ink' ? ink : part.colour);
  return [
    sticker ? `<g>${mark.parts.map((part) => element(part, PAPER, mark.halo)).join('')}</g>` : '',
    ...mark.parts.map((part) => element(part, colourOf(part), 0, drawable)),
  ].join('');
}

export function markSvg(mark: Mark, options: SvgOptions = {}): string {
  const { title, width = mark.view[2] } = options;
  const size =
    width === null ? '' : ` width="${width}" height="${Math.round(((width * mark.view[3]) / mark.view[2]) * 100) / 100}"`;
  const spoken = title?.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${mark.view.join(' ')}"${size}`,
    spoken ? ` role="img" aria-label="${spoken}"><title>${spoken}</title>` : ' aria-hidden="true">',
    markElements(mark, options),
    '</svg>',
  ].join('');
}

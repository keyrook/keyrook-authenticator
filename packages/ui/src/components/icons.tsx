import type { SVGProps } from 'react';
import {
  AUTHENTICATOR_MARK,
  AUTHENTICATOR_MARK_COMPACT,
  ICONS,
  ICON_STROKE,
  type IconName,
  type MarkPart,
} from '@keyrook/brand';
import { cx } from './primitives.js';

type IconProps = SVGProps<SVGSVGElement>;

/**
 * One of Keyrook's interface icons (vendor/keyrook-brand/src/icons.ts), drawn by
 * hand in the brand's pen and stroked in the text colour around it. The app
 * draws none of its own: a new one is added to the brand, so every Keyrook
 * product gets the same drawing.
 *
 * Icons here are sized by CSS, mostly 16 to 20 px, so they take the 20 px pen.
 */
function Icon({ glyph, children, ...props }: Omit<IconProps, 'name'> & { glyph: IconName }) {
  const icon = ICONS[glyph];
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE[20]}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width="1em"
      height="1em"
      {...props}
    >
      {icon.d && <path d={icon.d} />}
      {'dots' in icon &&
        icon.dots?.map(([cx, cy, r]) => <circle key={`${cx},${cy}`} cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />)}
      {children}
    </svg>
  );
}

const icon = (glyph: IconName) => (p: IconProps) => <Icon glyph={glyph} {...p} />;

export const SearchIcon = icon('search');
export const PlusIcon = icon('plus');
export const SettingsIcon = icon('settings');
export const LockIcon = icon('lock');
export const CopyIcon = icon('copy');
export const CheckIcon = icon('check');
export const TrashIcon = icon('trash');
export const QrIcon = icon('qr');
/** Typing a setup key by hand. */
export const KeyboardIcon = icon('keyboard');
/** A screenshot of a QR code. */
export const ImageIcon = icon('image');
export const CameraIcon = icon('camera');
export const AlertIcon = icon('error');
export const RefreshIcon = icon('refresh');
export const EyeIcon = icon('eye');
export const EyeOffIcon = icon('eye-off');
/** The source code. */
export const CodeIcon = icon('code');
/** Sync: the account's cloud, which holds only sealed boxes. */
export const CloudLockIcon = icon('cloud');
export const KeyIcon = icon('key');
/** Protected, and saying so. */
export const ShieldIcon = icon('shield-check');
export const ArchiveIcon = icon('backup');
export const InfoIcon = icon('info');
/** A file to keep. */
export const DownloadIcon = icon('download');
/** Accounts brought in from elsewhere. */
export const ImportIcon = icon('import');
/** From this app to another. */
export const TransferIcon = icon('export');

/** A favourite. Filled when chosen: the one icon that takes a fill, because "on" must read at a glance. */
export const StarIcon = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Icon glyph="star" {...p} fill={filled ? 'currentColor' : 'none'} />
);

/** Back: points the way the page came from, so it flips for a language read right to left. */
export const ArrowLeftIcon = (p: IconProps) => (
  <Icon glyph="arrow-left" {...p} className={`rtl:-scale-x-100 ${p.className ?? ''}`} />
);

/** Points onward, and flips for a language read right to left. */
export const ChevronIcon = (p: IconProps) => (
  <Icon glyph="chevron-right" {...p} className={`rtl:-scale-x-100 ${p.className ?? ''}`} />
);

function MarkPartElement({ part }: { part: MarkPart }) {
  // Ink, where a drawing has any, follows the text colour so it turns paper
  // in dark mode; the crayons stay as drawn.
  const colour = part.colour === 'ink' ? 'currentColor' : part.colour;
  switch (part.kind) {
    case 'fill':
      return <path d={part.d} fill={colour} />;
    case 'stroke':
      return (
        <path d={part.d} fill="none" stroke={colour} strokeWidth={part.width} strokeLinecap="round" strokeLinejoin="round" />
      );
    case 'disc':
      return <circle cx={part.cx} cy={part.cy} r={part.r} fill={colour} />;
    case 'ring':
      return <circle cx={part.cx} cy={part.cy} r={part.r} fill="none" stroke={colour} strokeWidth={part.width} />;
  }
}

/**
 * Keyrook Authenticator's mark, the crayon asterisk — the same drawing as the
 * extension icon (vendor/keyrook-brand/src/authenticator.ts). Not the Keyrook crow:
 * that is the brand's, and this is a product of it. `compact` is the small
 * drawing, for 24 px and under; `settle` boils it in on arrival, the brand's
 * hand-drawn entrance.
 */
export function Logo({
  className = 'h-6 w-6',
  compact = false,
  settle = false,
}: {
  className?: string;
  compact?: boolean;
  settle?: boolean;
}) {
  const mark = compact ? AUTHENTICATOR_MARK_COMPACT : AUTHENTICATOR_MARK;
  return (
    <svg viewBox={mark.view.join(' ')} className={cx(className, settle && 'kr-boil')} aria-hidden="true">
      {mark.parts.map((part, index) => (
        <MarkPartElement key={index} part={part} />
      ))}
    </svg>
  );
}

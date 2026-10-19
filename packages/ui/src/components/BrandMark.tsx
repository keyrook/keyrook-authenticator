import { useMemo } from 'react';
import { isStoredIcon, matchBrand, monogramFor } from '@authx/core';
import { BRAND_ICONS, type BrandIcon } from './brand-icons.js';
import { INK, NEUTRAL } from '@keyrook/brand';
import { cx } from './primitives.js';
import { translate } from '../i18n/runtime.js';

/**
 * Relative luminance, so a glyph is never white on a near-white brand colour.
 * A handful of marks sit at one end and a few at the other; choosing the
 * foreground per brand rather than by design hunch is what keeps all of them
 * legible.
 */
function isLight(hex: string): boolean {
  const value = Number.parseInt(hex, 16);
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => {
    const scaled = channel / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]! > 0.55;
}

export interface BrandMarkProps {
  issuer: string;
  label?: string;
  domains?: readonly string[];
  /** A picture the user chose, which wins over any bundled mark. */
  icon?: string | null;
  size?: number;
  className?: string;
}

/**
 * The service's mark, or a lettered tile when no bundled set has one.
 *
 * Everything is compiled in. Nothing here fetches anything, and nothing here
 * ever should: a logo pulled at display time would tell whoever serves it
 * exactly which services the user has two-factor authentication on.
 */
export function BrandMark({
  issuer,
  label = '',
  domains = [],
  icon: custom = null,
  size = 32,
  className,
}: BrandMarkProps) {
  const mark = useMemo(() => {
    const brand = matchBrand(issuer, domains);
    const icon: BrandIcon | undefined = brand ? BRAND_ICONS[brand.slug] : undefined;
    if (brand && icon) return { kind: 'icon' as const, name: brand.name, icon };
    return { kind: 'letter' as const, monogram: monogramFor(issuer || label || '?') };
  }, [issuer, label, domains]);

  const shared = cx('shrink-0 rounded-[9px] grid place-items-center select-none', className);

  // The user's own choice wins. Safe in an `<img>` because it is a raster this
  // app produced — see prepareIcon — and `isStoredIcon` refuses anything else
  // on the way in and on the way back out of a vault.
  if (custom && isStoredIcon(custom)) {
    return (
      <span
        className={cx(shared, 'overflow-hidden ring-1 ring-neutral-200 ring-inset dark:ring-neutral-700')}
        style={{ width: size, height: size, background: '#FFFFFF' }}
      >
        <img
          src={custom}
          alt={issuer || label || translate('brand.account')}
          width={size}
          height={size}
          className="h-full w-full object-contain"
        />
      </span>
    );
  }

  if (mark.kind === 'icon') {
    const { icon } = mark;
    const glyph = Math.round(size * (icon.wide ? 0.82 : 0.58));

    // Full-colour artwork is drawn as its designers intended, on white. The
    // alternative — recolouring it to fit a tile — is how a logo stops looking
    // like the logo.
    if (icon.kind === 'color') {
      return (
        <span
          className={cx(shared, 'ring-1 ring-neutral-200 ring-inset dark:ring-neutral-700')}
          style={{ width: size, height: size, background: '#FFFFFF' }}
          role="img"
          aria-label={mark.name}
          title={mark.name}
        >
          <svg
            viewBox={icon.viewBox}
            width={glyph}
            height={glyph}
            color={INK}
            aria-hidden="true"
            // Compile-time constant from the bundled icon sets — never user
            // input, and never anything fetched at runtime.
            dangerouslySetInnerHTML={{ __html: icon.body }}
          />
        </span>
      );
    }

    const hex = icon.hex ?? NEUTRAL[600].slice(1);
    const light = isLight(hex);
    const foreground = light ? INK : NEUTRAL[0];

    // Markup drawn in `currentColor` — tinted like a single-path mark, but it
    // has to inherit rather than be filled, or nested shapes all collapse.
    if (icon.kind === 'flat') {
      return (
        <span
          className={cx(shared, light && 'ring-1 ring-neutral-200 ring-inset dark:ring-neutral-700')}
          style={{ width: size, height: size, background: `#${hex}` }}
          role="img"
          aria-label={mark.name}
          title={mark.name}
        >
          <svg
            viewBox={icon.viewBox}
            width={glyph}
            height={glyph}
            color={foreground}
            fill="currentColor"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: icon.body }}
          />
        </span>
      );
    }

    return (
      <span
        className={cx(shared, light && 'ring-1 ring-neutral-200 ring-inset dark:ring-neutral-700')}
        style={{ width: size, height: size, background: `#${hex}` }}
        role="img"
        aria-label={mark.name}
        title={mark.name}
      >
        <svg
          viewBox={icon.viewBox}
          width={glyph}
          height={glyph}
          fill={foreground}
          aria-hidden="true"
        >
          <path d={icon.body} />
        </svg>
      </span>
    );
  }

  return (
    // A service with no mark gets its first letter on a neutral tile. A
    // coloured one would be a logo the service never drew, and four crayons
    // already have jobs in this interface.
    <span
      className={cx(
        shared,
        'bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200 ring-inset dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700',
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={issuer || label || translate('brand.unknown')}
      title={issuer || label}
    >
      <span
        className="font-semibold"
        style={{ fontSize: Math.round(size * 0.44), lineHeight: 1 }}
      >
        {mark.monogram.letter}
      </span>
    </span>
  );
}

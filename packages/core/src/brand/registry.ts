/**
 * Which service an account belongs to, so the list can be scanned by eye
 * instead of read word by word.
 *
 * This resolves a *name*; it does not draw anything. Rendering lives in the UI
 * layer, which is also where the icon artwork is bundled — so the desktop and
 * mobile apps get the same matching without inheriting a web icon set.
 *
 * Nothing here touches the network, and nothing ever should. Fetching a service
 * favicon at display time — from the service, or from a favicon proxy — would
 * hand whoever answers that request a list of every place the user has
 * two-factor authentication switched on. That is a worse leak than the thing
 * this app exists to protect.
 */
import { coversHost } from '../vault/hosts.js';
import { CATALOG } from './catalog.js';
import type { BrandEntry } from './types.js';

export type { BrandEntry };

/**
 * Every service with a bundled mark.
 *
 * Generated from `scripts/brands.config.mjs`; adding one is a word in that
 * file followed by `npm run icons:brands`.
 */
export const BRANDS: readonly BrandEntry[] = CATALOG;

function normalise(value: string): string {
  return (
    value
      .toLowerCase()
      // Decompose first so accents become separate marks that can be dropped:
      // otherwise "Ngân hàng" collapses to "ngnhng" and gets a different colour
      // from "Ngan hang", which a user would reasonably call the same name.
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
  );
}

/** Built once; the popup re-renders on every tick and cannot afford a scan. */
const BY_KEY = new Map<string, BrandEntry>();
const BY_DOMAIN = new Map<string, BrandEntry>();

// Two passes on purpose. A service's own name and slug are claimed first, so
// that another service listing the same word as an alias cannot take it:
// "Claude" is Claude, even though Anthropic is also issued under that name.
for (const brand of BRANDS) {
  for (const key of [brand.slug, brand.name]) {
    const normalised = normalise(key);
    if (normalised && !BY_KEY.has(normalised)) BY_KEY.set(normalised, brand);
  }
  for (const domain of brand.domains) {
    if (!BY_DOMAIN.has(domain)) BY_DOMAIN.set(domain, brand);
  }
}

for (const brand of BRANDS) {
  for (const alias of brand.aliases) {
    const normalised = normalise(alias);
    if (normalised && !BY_KEY.has(normalised)) BY_KEY.set(normalised, brand);
  }
}

/**
 * Resolve an account to a service.
 *
 * Domains are checked first because they are stated fact — the item recorded
 * where it was added from — while an issuer string is whatever the service
 * chose to put in its QR code.
 */
export function matchBrand(issuer: string, domains: readonly string[] = []): BrandEntry | null {
  for (const domain of domains) {
    const host = domain.toLowerCase().replace(/^www\./, '');
    const exact = BY_DOMAIN.get(host);
    if (exact) return exact;

    for (const [known, brand] of BY_DOMAIN) {
      if (coversHost(known, host)) return brand;
    }
  }

  const normalised = normalise(issuer);
  if (!normalised) return null;

  const direct = BY_KEY.get(normalised);
  if (direct) return direct;

  // Issuers arrive decorated: "GitHub (work)", "Google Workspace", "AWS - prod".
  // Only keys long enough to be unambiguous may match a prefix; "x" and "ea"
  // would otherwise swallow half the alphabet.
  for (const [key, brand] of BY_KEY) {
    if (key.length >= 4 && normalised.startsWith(key)) return brand;
  }
  return null;
}

/**
 * The websites to record for an account of `brand` added while `hostname` is
 * open, so the popup offers its code there later.
 *
 * The page's own domain comes first when it is one of the service's: a Shopee
 * account set up on shopee.vn belongs to shopee.vn, not to whichever market
 * the catalogue lists first, and recording another would have the popup warn
 * on the very site the account was made on. Only catalogued domains are ever
 * returned, so a look-alike page gets nothing of its own recorded.
 */
export function domainsToRecord(brand: BrandEntry, hostname: string | null): string[] {
  // The broadest that holds the page: google.com rather than accounts.google.com,
  // so the account is offered across the service and not on one host of it.
  const page = brand.domains
    .filter((domain) => hostname !== null && coversHost(domain, hostname))
    .sort((a, b) => a.length - b.length)[0];
  const rest = brand.domains.filter((domain) => domain !== page);
  return (page ? [page, ...rest] : rest).slice(0, 2);
}

export interface BrandSuggestion {
  brand: BrandEntry;
  /** Higher is a better match. Only meaningful for ordering. */
  score: number;
}

/**
 * Suggest services as someone types a name.
 *
 * Ranked so the obvious answer comes first: an exact name, then a name that
 * starts with what was typed, then one of the service's other names, and only
 * then a match buried in the middle. Typing "git" should offer GitHub before
 * Bitbucket, even though both contain the letters.
 */
export function searchBrands(query: string, limit = 6): BrandEntry[] {
  const needle = normalise(query);
  if (needle.length === 0) return [];

  const scored: BrandSuggestion[] = [];

  for (const brand of BRANDS) {
    const name = normalise(brand.name);
    let score = 0;

    if (name === needle) {
      score = 100;
    } else if (name.startsWith(needle)) {
      // Shorter names win: "Box" beats "Bitbucket" for "b".
      score = 80 - Math.min(20, name.length - needle.length);
    } else if (brand.aliases.some((alias) => normalise(alias).startsWith(needle))) {
      score = 60;
    } else if (name.includes(needle)) {
      score = 40;
    } else if (brand.domains.some((domain) => normalise(domain).startsWith(needle))) {
      score = 30;
    } else if (brand.aliases.some((alias) => normalise(alias).includes(needle))) {
      score = 20;
    }

    // A prefix match on a widely held service beats a closer match on an
    // obscure one: "git" means GitHub far more often than Gitea.
    if (score > 0 && brand.popular) score += 15;
    if (score > 0) scored.push({ brand, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.brand.name.localeCompare(b.brand.name))
    .slice(0, limit)
    .map((entry) => entry.brand);
}

export interface Monogram {
  letter: string;
  /** 0-359. Stable for a given name, so a service keeps its colour. */
  hue: number;
}

/**
 * The fallback for anything unrecognised — and for the brands that asked not to
 * be drawn. A stable colour per name is most of the recognition value: after a
 * day or two the eye finds the right row without reading it.
 */
export function monogramFor(name: string): Monogram {
  const trimmed = name.trim();
  const letter = (trimmed.match(/[\p{L}\p{N}]/u)?.[0] ?? '?').toUpperCase();

  // FNV-1a: tiny, and spreads similar names like "Google" and "Google Cloud"
  // across the wheel instead of onto neighbouring shades.
  let hash = 0x811c9dc5;
  for (const char of normalise(trimmed) || trimmed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return { letter, hue: hash % 360 };
}

/**
 * Resolves every service in `brands.config.mjs` to a real logo and writes two
 * generated files:
 *
 *   packages/core/src/brand/catalog.ts   names, domains and aliases (no artwork,
 *                                        so the core package stays dependency-free)
 *   packages/ui/src/components/brand-icons.ts  the marks themselves
 *
 * Everything is inlined at build time. Nothing is fetched at display time: a
 * logo requested from the network would tell whoever answers it every service
 * the user has two-factor authentication on.
 *
 * Sources, in the order they are tried:
 *   simple-icons          CC0-1.0     monochrome, brand colour supplied
 *   Font Awesome Free     CC BY 4.0   monochrome, colour from the config
 *   SVG Logos             CC0-1.0     full colour
 *   CoreUI Brands         CC0-1.0     full colour
 *   token-branded         MIT         full colour, crypto
 *   cryptocurrency-color  CC0-1.0     full colour, crypto
 *
 *   node scripts/gen-brands.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import {
  ALIASES,
  DOMAIN_OVERRIDES,
  FLAT_COLOURS,
  NAMES,
  POPULAR,
  EXPLICIT_ICONS,
  FONT_AWESOME,
  NOT_A_HOMEPAGE,
  SIMPLE_ICONS,
  WORDMARKS,
} from './brands.config.mjs';

const require = createRequire(import.meta.url);
const simpleIcons = require('simple-icons');

const ICONIFY = {
  logos: require('@iconify-json/logos/icons.json'),
  cib: require('@iconify-json/cib/icons.json'),
  token: require('@iconify-json/token-branded/icons.json'),
  crypto: require('@iconify-json/cryptocurrency-color/icons.json'),
  mdi: require('@iconify-json/mdi/icons.json'),
  streamline: require('@iconify-json/streamline-logos/icons.json'),
  bxl: require('@iconify-json/bxl/icons.json'),
  devicon: require('@iconify-json/devicon/icons.json'),
  // Last resort, and last in the order below. Arcticons is CC BY-SA — the
  // obligation that carries is recorded in NOTICE.md — and its monochrome line
  // style differs from everything else, so it is only reached when no other
  // set has the service at all. Still better than a letter.
  arcticons: require('@iconify-json/arcticons/icons.json'),
};

/**
 * LobeHub's AI icon set (MIT). The only maintained source for OpenAI, Grok,
 * Midjourney and the rest — most are absent from the general brand sets, some
 * because their owners asked, most because the sets have not caught up.
 *
 * Each name ships in up to three variants; the full-colour one is preferred and
 * the flat one is the fallback. The `-text` wordmarks are ignored: they are
 * illegible at the size a list row gives them.
 */
const LOBE_DIR = resolve(import.meta.dirname, '../node_modules/@lobehub/icons-static-svg/icons');
const LOBE_FILES = new Set(readdirSync(LOBE_DIR).map((file) => file.replace(/\.svg$/, '')));

function fromLobe(slug) {
  const flatSlug = flat(slug);
  const name = [...LOBE_FILES].find((file) => flat(file) === `${flatSlug}color`)
    ?? [...LOBE_FILES].find((file) => flat(file) === flatSlug);
  if (!name) return null;

  const svg = readFileSync(resolve(LOBE_DIR, `${name}.svg`), 'utf8');
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 24 24';
  const body = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .trim();
  if (!body) return null;

  // A flat mark drawn in `currentColor` gets the tile treatment; anything with
  // its own fills is shown as drawn.
  const flatMark = !name.endsWith('-color') && !/fill="#/.test(body);
  return flatMark
    ? { kind: 'mono-markup', viewBox, body }
    : { kind: 'color', viewBox, body };
}

const FA_BRANDS = resolve(
  import.meta.dirname,
  '../node_modules/@fortawesome/fontawesome-free/svgs/brands',
);

const CATALOG_OUT = resolve(import.meta.dirname, '../packages/core/src/brand/catalog.ts');
const ICONS_OUT = resolve(import.meta.dirname, '../packages/ui/src/components/brand-icons.ts');

const flat = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const siExport = (slug) => `si${slug.charAt(0).toUpperCase()}${slug.slice(1).replace(/[^a-zA-Z0-9]/g, '')}`;

/** Index each Iconify collection by its name with separators removed. */
const iconifyIndex = Object.fromEntries(
  Object.entries(ICONIFY).map(([name, collection]) => {
    const map = new Map();
    for (const key of Object.keys(collection.icons)) {
      if (!map.has(flat(key))) map.set(flat(key), key);
    }
    return [name, map];
  }),
);

/**
 * A stable colour per name, matching the lettered tiles, so a set that ships no
 * brand colour still produces something that looks deliberate rather than grey.
 */
function tileColour(slug) {
  let hash = 0x811c9dc5;
  for (const char of flat(slug)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  const hue = hash % 360;
  const [s, l] = [0.52, 0.45];
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = (
    [
      [c, x, 0],
      [x, c, 0],
      [0, c, x],
      [0, x, c],
      [x, 0, c],
      [c, 0, x],
    ]
  )[Math.floor(hue / 60)];
  return [r, g, b]
    .map((channel) => Math.round((channel + m) * 255).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function fromIconify(collectionName, iconName) {
  const collection = ICONIFY[collectionName];
  const icon = collection?.icons[iconName];
  if (!icon) return null;

  const left = icon.left ?? collection.left ?? 0;
  const top = icon.top ?? collection.top ?? 0;
  const width = icon.width ?? collection.width ?? 24;
  const height = icon.height ?? collection.height ?? 24;

  // Arcticons draws in solid white, which vanishes on the neutral tile the
  // full-colour marks use. Strip the fills and tint it like a flat mark
  // instead, on a colour derived from the name.
  if (collectionName === 'arcticons') {
    return {
      kind: 'mono-markup',
      viewBox: `${left} ${top} ${width} ${height}`,
      body: icon.body.replace(/\s*fill="(#fff(fff)?|white)"/gi, ''),
      derivedColour: true,
    };
  }

  return {
    kind: 'color',
    viewBox: `${left} ${top} ${width} ${height}`,
    body: icon.body,
  };
}

function fromFontAwesome(slug) {
  let svg;
  try {
    svg = readFileSync(resolve(FA_BRANDS, `${slug}.svg`), 'utf8');
  } catch {
    return null;
  }
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
  // Several marks are drawn as multiple subpaths; concatenating keeps them one
  // fillable shape, which is what the monochrome renderer expects.
  const paths = [...svg.matchAll(/\sd="([^"]+)"/g)].map((match) => match[1]);
  if (!viewBox || paths.length === 0) return null;
  return { kind: 'mono', viewBox, body: paths.join(' ') };
}

/**
 * A service's other names, each kept whole. A string is refused rather than
 * split on its spaces: that once turned "proton mail" into "proton" and "mail",
 * and "mail" claimed every issuer that starts with it.
 */
function aliasList(slug, aliases) {
  if (aliases === undefined) return [];
  if (!Array.isArray(aliases) || aliases.some((alias) => typeof alias !== 'string' || !alias.trim())) {
    throw new Error(`Aliases for ${slug} must be a list of names, e.g. ['proton mail'], not ${JSON.stringify(aliases)}`);
  }
  return aliases.map((alias) => alias.trim());
}

/** The service's own website, from the icon set's source URL where usable. */
function domainFromSource(slug, source) {
  if (DOMAIN_OVERRIDES[slug]) return DOMAIN_OVERRIDES[slug];
  if (!source) return [];
  try {
    const host = new URL(source).hostname.replace(/^www\./, '');
    // The blocklist exists because press kits and repos live on other people's
    // hosts — but github.com really is GitHub's, so a host that names the brand
    // is never blocked.
    if (NOT_A_HOMEPAGE.has(host) && !flat(host).includes(flat(slug))) return [];
    // Press kits live on subdomains; the registrable name is what matches.
    const labels = host.split('.');
    const TWO_PART = new Set(['com', 'co', 'net', 'org', 'gov', 'edu', 'ac']);
    const keep =
      labels.length >= 3 && TWO_PART.has(labels[labels.length - 2]) ? 3 : 2;
    return [labels.slice(-keep).join('.')];
  } catch {
    return [];
  }
}

function resolveSlug(slug) {
  const explicit = EXPLICIT_ICONS[slug];
  if (explicit) {
    const [collection, name] = explicit.split(':');
    const icon = fromIconify(collection, name);
    if (icon) return { ...icon, title: null };
  }

  const si = simpleIcons[siExport(slug)];
  if (si) {
    return {
      kind: 'mono',
      title: si.title,
      hex: si.hex,
      viewBox: '0 0 24 24',
      body: si.path,
      source: si.source,
    };
  }

  const lobe = fromLobe(slug);
  if (lobe) return { ...lobe, title: null };

  const key = flat(slug.replace(/dot(io|com|js|org|net|sh|fm|chat)$/, ''));
  for (const collection of [
    'logos',
    'cib',
    'token',
    'crypto',
    'streamline',
    'bxl',
    'devicon',
    'mdi',
    'arcticons',
  ]) {
    const name = iconifyIndex[collection].get(flat(slug)) ?? iconifyIndex[collection].get(key);
    if (name) {
      const icon = fromIconify(collection, name);
      if (icon) return { ...icon, title: null };
    }
  }
  return null;
}

/** Turn a slug into something presentable when no set supplied a name. */
function titleFromSlug(slug) {
  return slug
    .replace(/dot(io|com|js|org|net|sh|fm|chat)$/, (match) => `.${match.slice(3)}`)
    .replace(/^\w/, (char) => char.toUpperCase());
}

const slugs = [
  ...new Set(
    SIMPLE_ICONS.split('\n')
      .filter((line) => !line.trim().startsWith('#'))
      .join(' ')
      .split(/\s+/)
      .filter(Boolean),
  ),
];

const catalog = [];
const icons = [];
const unresolved = [];

for (const slug of slugs) {
  const icon = resolveSlug(slug);
  if (!icon) {
    unresolved.push(slug);
    continue;
  }

  const title = NAMES[slug] ?? icon.title ?? titleFromSlug(slug);
  catalog.push({
    slug,
    name: title,
    domains: domainFromSource(slug, icon.source),
    aliases: aliasList(slug, ALIASES[slug]),
    wide: WORDMARKS.has(slug),
  });
  icons.push({
    slug,
    title,
    kind: icon.kind === 'mono-markup' ? 'flat' : icon.kind,
    hex:
      icon.hex ??
      (icon.kind === 'mono-markup'
        ? (FLAT_COLOURS[slug] ?? (icon.derivedColour ? tileColour(slug) : '3F3F46'))
        : null),
    viewBox: icon.viewBox,
    body: icon.body,
    wide: WORDMARKS.has(slug),
  });
}

const alreadyResolved = new Set(icons.map((icon) => icon.slug));

for (const [slug, name, domains, aliases, color] of FONT_AWESOME) {
  // A slug can appear in both lists; the richer source already won.
  if (alreadyResolved.has(slug)) continue;
  const icon = fromFontAwesome(slug);
  if (!icon) {
    unresolved.push(`${slug} (font-awesome)`);
    continue;
  }
  catalog.push({
    slug,
    name,
    domains: domains.split(' ').filter(Boolean),
    aliases: aliasList(slug, aliases),
    wide: WORDMARKS.has(slug),
  });
  icons.push({
    slug,
    title: name,
    kind: 'mono',
    hex: color,
    viewBox: icon.viewBox,
    body: icon.body,
    wide: WORDMARKS.has(slug),
  });
}

// A corporate domain several products share — alibabagroup.com, say — points
// at no single one of them, so it is worse than having no domain at all.
const domainOwners = new Map();
for (const entry of catalog) {
  for (const domain of entry.domains) {
    domainOwners.set(domain, (domainOwners.get(domain) ?? 0) + 1);
  }
}
const overrideCount = new Map();
for (const domains of Object.values(DOMAIN_OVERRIDES)) {
  for (const domain of domains) overrideCount.set(domain, (overrideCount.get(domain) ?? 0) + 1);
}

for (const entry of catalog) {
  entry.domains = entry.domains.filter((domain) => {
    if (domainOwners.get(domain) === 1) return true;
    // An explicit override wins a contested domain, but only when exactly one
    // service claims it that way — two overrides on one domain is a config
    // mistake, and keeping both would send autofill to the wrong account.
    return (DOMAIN_OVERRIDES[entry.slug] ?? []).includes(domain) && overrideCount.get(domain) === 1;
  });
}

// 3. Rank the services people actually have above the ones that merely share a
// prefix: "git" should offer GitHub before Gitea.
for (const entry of catalog) {
  if (POPULAR.has(entry.slug)) entry.popular = true;
}

catalog.sort((a, b) => a.slug.localeCompare(b.slug));
icons.sort((a, b) => a.slug.localeCompare(b.slug));

const HEADER = (what) => `/**
 * GENERATED — do not edit. Run \`npm run icons:brands\` after changing
 * scripts/brands.config.mjs.
 *
 * ${what}
 *
 * Artwork: Simple Icons (CC0-1.0), Font Awesome Free (icons CC BY 4.0), SVG
 * Logos (CC0-1.0), CoreUI Brands (CC0-1.0), token-branded (MIT) and
 * cryptocurrency-color (CC0-1.0). Trademarks belong to their owners and appear
 * only to identify the services they name. See NOTICE.md.
 */`;

writeFileSync(
  CATALOG_OUT,
  `${HEADER('Service names, websites and the other names each is issued under.')}
import type { BrandEntry } from './types.js';

export const CATALOG: readonly BrandEntry[] = ${JSON.stringify(catalog, null, 2)
    .replace(/"([a-zA-Z]+)":/g, '$1:')
    .replace(/"/g, "'")} as const;
`,
);

writeFileSync(
  ICONS_OUT,
  `${HEADER('The marks themselves.')}
export interface BrandIcon {
  title: string;
  /**
   * \`mono\`  a single path, tinted against the brand colour in \`hex\`.
   * \`flat\`  markup drawn in \`currentColor\`, also on the brand tile.
   * \`color\` the artwork as drawn, on a neutral tile.
   */
  kind: 'mono' | 'flat' | 'color';
  /** Six hex digits, no leading hash. Only on \`mono\`. */
  hex?: string;
  viewBox: string;
  /** A wordmark, which needs more of the tile than a symbol does. */
  wide?: boolean;
  /** A path for \`mono\`; SVG markup for \`flat\` and \`color\`. */
  body: string;
}

export const BRAND_ICONS: Record<string, BrandIcon> = {
${icons
  .map(
    (icon) =>
      `  ${JSON.stringify(icon.slug)}: {\n` +
      `    title: ${JSON.stringify(icon.title)},\n` +
      `    kind: ${JSON.stringify(icon.kind)},\n` +
      (icon.hex ? `    hex: ${JSON.stringify(icon.hex)},\n` : '') +
      `    viewBox: ${JSON.stringify(icon.viewBox)},\n` +
      (icon.wide ? '    wide: true,\n' : '') +
      `    body: ${JSON.stringify(icon.body)},\n` +
      `  },`,
  )
  .join('\n')}
};
`,
);

// Full-colour marks sit on a white tile, so one drawn entirely in white is
// invisible. Catch that here rather than in a screenshot nobody takes.
const invisible = icons.filter((icon) => {
  if (icon.kind !== 'color') return false;
  const fills = [...icon.body.matchAll(/fill="([^"]+)"/g)].map((match) => match[1].toLowerCase());
  const visible = fills.filter(
    (fill) => fill !== 'none' && fill !== '#fff' && fill !== '#ffffff' && fill !== 'white',
  );
  return fills.length > 0 && visible.length === 0;
});

const bytes = icons.reduce((total, icon) => total + icon.body.length, 0);
console.log(`✓ ${icons.length} services with real artwork`);
console.log(`  ${(bytes / 1024).toFixed(0)} KB of path data`);
if (invisible.length > 0) {
  console.log(`\n  ⚠ drawn only in white, invisible on the tile: ${invisible.map((i) => i.slug).join(' ')}`);
}
if (unresolved.length > 0) {
  console.log(`\n  ${unresolved.length} with no logo in any bundled set, falling back to a tile:`);
  console.log(`  ${unresolved.join(' ')}`);
}

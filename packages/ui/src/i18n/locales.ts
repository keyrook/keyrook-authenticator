/**
 * The languages the extension speaks, and how one is chosen.
 *
 * English is the source every other file translates, and the language of any
 * text a translation lacks. Adding a language is one file in `locales/`, one
 * line in each table below, and its `_locales` entry in
 * `apps/extension/scripts/store-locales.mjs` — `test/i18n.test.ts` refuses a
 * file that is missing a message, or one whose placeholders do not match the
 * English, and `apps/extension/test/store-listing.test.ts` one with no store
 * listing.
 */
import type { Dictionary } from './locales/en.js';

/**
 * In the order the picker lists them: English, then each language by its own
 * name — Latin script first, then Greek, Cyrillic, Hebrew, Arabic, the Indian
 * scripts, Thai, Ethiopic, and Chinese, Japanese and Korean last.
 */
export const LOCALES = [
  'en',
  'id',
  'ms',
  'ca',
  'cs',
  'da',
  'de',
  'et',
  'es',
  'fil',
  'fr',
  'hr',
  'it',
  'sw',
  'lv',
  'lt',
  'hu',
  'nl',
  'no',
  'pl',
  'pt-BR',
  'ro',
  'sk',
  'sl',
  'fi',
  'sv',
  'vi',
  'tr',
  'el',
  'bg',
  'ru',
  'sr',
  'uk',
  'he',
  'ar',
  'fa',
  'hi',
  'mr',
  'bn',
  'gu',
  'ta',
  'te',
  'kn',
  'ml',
  'th',
  'am',
  'ja',
  'ko',
  'zh-CN',
  'zh-TW',
] as const;
export type Locale = (typeof LOCALES)[number];

/** Each language in its own words, as the picker lists them. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  id: 'Bahasa Indonesia',
  ms: 'Bahasa Melayu',
  ca: 'Català',
  cs: 'Čeština',
  da: 'Dansk',
  de: 'Deutsch',
  et: 'Eesti',
  es: 'Español',
  fil: 'Filipino',
  fr: 'Français',
  hr: 'Hrvatski',
  it: 'Italiano',
  sw: 'Kiswahili',
  lv: 'Latviešu',
  lt: 'Lietuvių',
  hu: 'Magyar',
  nl: 'Nederlands',
  no: 'Norsk',
  pl: 'Polski',
  'pt-BR': 'Português (Brasil)',
  ro: 'Română',
  sk: 'Slovenčina',
  sl: 'Slovenščina',
  fi: 'Suomi',
  sv: 'Svenska',
  vi: 'Tiếng Việt',
  tr: 'Türkçe',
  el: 'Ελληνικά',
  bg: 'Български',
  ru: 'Русский',
  sr: 'Српски',
  uk: 'Українська',
  he: 'עברית',
  ar: 'العربية',
  fa: 'فارسی',
  hi: 'हिन्दी',
  mr: 'मराठी',
  bn: 'বাংলা',
  gu: 'ગુજરાતી',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  th: 'ไทย',
  am: 'አማርኛ',
  ja: '日本語',
  ko: '한국어',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
};

/** Read right to left: the page is laid out as a mirror, not only translated. */
export const RTL_LOCALES: ReadonlySet<Locale> = new Set<Locale>(['ar', 'he', 'fa']);

/**
 * Loaded when chosen, so a page carries one language rather than fifty.
 * English is bundled: it is the fallback, and the first paint cannot wait on it.
 */
export const LOADERS: Record<Exclude<Locale, 'en'>, () => Promise<Dictionary>> = {
  id: () => import('./locales/id.js').then((module) => module.id),
  ms: () => import('./locales/ms.js').then((module) => module.ms),
  ca: () => import('./locales/ca.js').then((module) => module.ca),
  cs: () => import('./locales/cs.js').then((module) => module.cs),
  da: () => import('./locales/da.js').then((module) => module.da),
  de: () => import('./locales/de.js').then((module) => module.de),
  et: () => import('./locales/et.js').then((module) => module.et),
  es: () => import('./locales/es.js').then((module) => module.es),
  fil: () => import('./locales/fil.js').then((module) => module.fil),
  fr: () => import('./locales/fr.js').then((module) => module.fr),
  hr: () => import('./locales/hr.js').then((module) => module.hr),
  it: () => import('./locales/it.js').then((module) => module.it),
  sw: () => import('./locales/sw.js').then((module) => module.sw),
  lv: () => import('./locales/lv.js').then((module) => module.lv),
  lt: () => import('./locales/lt.js').then((module) => module.lt),
  hu: () => import('./locales/hu.js').then((module) => module.hu),
  nl: () => import('./locales/nl.js').then((module) => module.nl),
  no: () => import('./locales/no.js').then((module) => module.no),
  pl: () => import('./locales/pl.js').then((module) => module.pl),
  'pt-BR': () => import('./locales/pt-BR.js').then((module) => module.ptBR),
  ro: () => import('./locales/ro.js').then((module) => module.ro),
  sk: () => import('./locales/sk.js').then((module) => module.sk),
  sl: () => import('./locales/sl.js').then((module) => module.sl),
  fi: () => import('./locales/fi.js').then((module) => module.fi),
  sv: () => import('./locales/sv.js').then((module) => module.sv),
  vi: () => import('./locales/vi.js').then((module) => module.vi),
  tr: () => import('./locales/tr.js').then((module) => module.tr),
  el: () => import('./locales/el.js').then((module) => module.el),
  bg: () => import('./locales/bg.js').then((module) => module.bg),
  ru: () => import('./locales/ru.js').then((module) => module.ru),
  sr: () => import('./locales/sr.js').then((module) => module.sr),
  uk: () => import('./locales/uk.js').then((module) => module.uk),
  he: () => import('./locales/he.js').then((module) => module.he),
  ar: () => import('./locales/ar.js').then((module) => module.ar),
  fa: () => import('./locales/fa.js').then((module) => module.fa),
  hi: () => import('./locales/hi.js').then((module) => module.hi),
  mr: () => import('./locales/mr.js').then((module) => module.mr),
  bn: () => import('./locales/bn.js').then((module) => module.bn),
  gu: () => import('./locales/gu.js').then((module) => module.gu),
  ta: () => import('./locales/ta.js').then((module) => module.ta),
  te: () => import('./locales/te.js').then((module) => module.te),
  kn: () => import('./locales/kn.js').then((module) => module.kn),
  ml: () => import('./locales/ml.js').then((module) => module.ml),
  th: () => import('./locales/th.js').then((module) => module.th),
  am: () => import('./locales/am.js').then((module) => module.am),
  ja: () => import('./locales/ja.js').then((module) => module.ja),
  ko: () => import('./locales/ko.js').then((module) => module.ko),
  'zh-CN': () => import('./locales/zh-CN.js').then((module) => module.zhCN),
  'zh-TW': () => import('./locales/zh-TW.js').then((module) => module.zhTW),
};

/** Tags browsers still send for a language whose code has since changed. */
const ALIASES: Record<string, string> = { iw: 'he', in: 'id', nb: 'no', nn: 'no', tl: 'fil' };

/**
 * The first of the browser's languages this extension speaks. Traditional
 * Chinese is written in Taiwan, Hong Kong and Macau, Simplified everywhere
 * else; neither is given to a reader of the other. Portuguese is written for
 * Brazil; a reader in Portugal still reads it more easily than English.
 */
export function detectLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const tag = language.toLowerCase();
    if (/^zh-(tw|hk|mo|hant)/.test(tag)) return 'zh-TW';
    if (tag === 'zh' || /^zh-(cn|sg|my|hans)/.test(tag)) return 'zh-CN';
    if (tag.startsWith('zh')) continue;
    if (tag === 'pt' || tag.startsWith('pt-')) return 'pt-BR';
    const base = tag.split('-')[0]!;
    const match = LOCALES.find((locale) => locale === (ALIASES[base] ?? base));
    if (match) return match;
  }
  return 'en';
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

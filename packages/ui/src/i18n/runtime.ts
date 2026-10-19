/**
 * The language a page is showing, and `t`, which turns a message key into its
 * text there. One per page: the popup and Settings each start it before their
 * first render, and both follow a change made in either.
 *
 * The choice lives in the host's preferences (`chrome.storage.local` in the
 * extension), outside the vault, because the screens that need it most —
 * setting up, unlocking, recovering — come before the vault opens. It says
 * nothing about anyone's accounts.
 */
import { host } from '../host.js';
import { format, type Values } from './format.js';
import { detectLocale, isLocale, LOADERS, RTL_LOCALES, type Locale } from './locales.js';
import { en, type Dictionary, type MessageKey } from './locales/en.js';

export const LANGUAGE_KEY = 'authx.language';

/** What the person chose: a language, or whatever the browser speaks. */
export type LanguagePreference = Locale | 'auto';

interface State {
  preference: LanguagePreference;
  locale: Locale;
  messages: Dictionary;
}

let state: State = { preference: 'auto', locale: 'en', messages: en };
const listeners = new Set<() => void>();

export function translate(key: MessageKey, values?: Values): string {
  // A key a translation lacks reads in English rather than as its name; the
  // tests keep that from happening in a release.
  return format(state.messages[key] ?? en[key], state.locale, values);
}

export function currentLocale(): Locale {
  return state.locale;
}

export function currentPreference(): LanguagePreference {
  return state.preference;
}

export function browserLocale(): Locale {
  return detectLocale(navigator.languages?.length ? navigator.languages : [navigator.language ?? 'en']);
}

async function messagesFor(locale: Locale): Promise<Dictionary> {
  if (locale === 'en') return en;
  try {
    return await LOADERS[locale]();
  } catch {
    return en;
  }
}

async function apply(preference: LanguagePreference): Promise<void> {
  const locale = preference === 'auto' ? browserLocale() : preference;
  const messages = await messagesFor(locale);
  state = { preference, locale, messages };
  document.documentElement.lang = locale;
  document.documentElement.dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
  for (const listener of listeners) listener();
}

async function storedPreference(): Promise<LanguagePreference> {
  try {
    const value = await host().preferences.get(LANGUAGE_KEY);
    return isLocale(value) ? value : 'auto';
  } catch {
    return 'auto';
  }
}

/** Before the first render, so nothing paints in one language and then flips. */
export async function startI18n(): Promise<void> {
  await apply(await storedPreference());
  // A change made in Settings reaches an open popup too, and the reverse.
  host().preferences.watch(LANGUAGE_KEY, (next) => void apply(isLocale(next) ? next : 'auto'));
}

export async function setLanguage(preference: LanguagePreference): Promise<void> {
  if (preference === 'auto') await host().preferences.remove(LANGUAGE_KEY);
  else await host().preferences.set(LANGUAGE_KEY, preference);
  await apply(preference);
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function snapshot(): State {
  return state;
}

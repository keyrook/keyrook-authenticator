/**
 * `useT()` for components: the same `t` as the runtime's, plus `t.rich` for a
 * message with bold, links or a value that is itself an element. Reading it
 * through context is what makes every component redraw when the language
 * changes, memoised or not.
 */
import { createContext, Fragment, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { parse, pick, type Piece, type Values } from './format.js';
import type { Locale } from './locales.js';
import type { MessageKey } from './locales/en.js';
import { en } from './locales/en.js';
import { snapshot, subscribe, translate } from './runtime.js';

type RichValues = Record<string, ReactNode>;
type Tags = Record<string, (chunk: ReactNode) => ReactNode>;

export interface Translator {
  (key: MessageKey, values?: Values): string;
  /** A message whose tags become elements and whose values may be elements. */
  rich(key: MessageKey, values?: RichValues, tags?: Tags): ReactNode;
  locale: Locale;
}

/** What a tag means when the caller does not say: emphasis, nothing more. */
const DEFAULT_TAGS: Tags = {
  b: (chunk) => <strong className="font-semibold">{chunk}</strong>,
  em: (chunk) => <em>{chunk}</em>,
  code: (chunk) => <code className="font-mono">{chunk}</code>,
};

function render(pieces: Piece[], locale: Locale, values: RichValues, tags: Tags): ReactNode[] {
  return pieces.map((piece, index) => {
    if (piece.kind === 'text') return <Fragment key={index}>{piece.text}</Fragment>;
    if (piece.kind === 'value') {
      const value = values[piece.name];
      const shown = typeof value === 'number' ? new Intl.NumberFormat(locale).format(value) : value;
      return <Fragment key={index}>{shown ?? `{${piece.name}}`}</Fragment>;
    }
    const wrap = tags[piece.tag] ?? DEFAULT_TAGS[piece.tag] ?? ((chunk: ReactNode) => chunk);
    return <Fragment key={index}>{wrap(render(piece.pieces, locale, values, tags))}</Fragment>;
  });
}

function makeTranslator(): Translator {
  const { locale, messages } = snapshot();
  const t = ((key: MessageKey, values?: Values) => translate(key, values)) as Translator;
  t.locale = locale;
  t.rich = (key, values = {}, tags = {}) => {
    const count = typeof values.count === 'number' ? values.count : undefined;
    const text = pick(messages[key] ?? en[key], locale, count === undefined ? undefined : { count });
    return render(parse(text), locale, values, tags);
  };
  return t;
}

const I18nContext = createContext<Translator>(makeTranslator());

export function I18nProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, snapshot);
  // A new translator only when the language changes, so a page re-rendering
  // for other reasons does not redraw every consumer.
  const t = useMemo(makeTranslator, [state]);
  return <I18nContext.Provider value={t}>{children}</I18nContext.Provider>;
}

export function useT(): Translator {
  return useContext(I18nContext);
}

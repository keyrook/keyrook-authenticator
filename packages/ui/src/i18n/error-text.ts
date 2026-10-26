/**
 * Any error, as text in the page's language: a key from the service worker, a
 * sentence `@authx/core` or the sync server is known to say, or — for anything
 * else — the message as it came.
 */
import type { Values } from './format.js';
import { BackgroundError } from '../lib/protocol.js';
import { AppError, knownMessage } from './errors.js';
import type { MessageKey } from './locales/en.js';
import { translate } from './runtime.js';
import { en } from './locales/en.js';

export function localise(message: string, key?: MessageKey, values?: Values): string {
  if (key) return translate(key, values);
  // An AppError that crossed as plain text — a first sync's failure, say —
  // arrives as its key.
  if (Object.hasOwn(en, message)) return translate(message as MessageKey);
  const known = knownMessage(message);
  return known ? translate(known.key, known.values) : message;
}

export function errorText(cause: unknown): string {
  if (cause instanceof AppError) return translate(cause.key, cause.values);
  if (cause instanceof BackgroundError && cause.key) return translate(cause.key, cause.values);
  return localise(cause instanceof Error ? cause.message : String(cause));
}

/** The message key an error is shown as, when it has one: what a page answers differently. */
export function errorKey(cause: unknown, message?: string): MessageKey | undefined {
  if (cause instanceof AppError) return cause.key;
  if (cause instanceof BackgroundError && cause.key) return cause.key;
  const text = message ?? (cause instanceof Error ? cause.message : String(cause));
  if (Object.hasOwn(en, text)) return text as MessageKey;
  return knownMessage(text)?.key;
}

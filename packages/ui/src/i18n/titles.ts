/**
 * An account's name for display. `@authx/core`'s `itemTitle` falls back to an
 * English word for an account with neither issuer nor name; the page says it
 * in its own language instead.
 */
import type { VaultItem } from '@authx/core';
import { translate } from './runtime.js';

export function titleOf(item: Pick<VaultItem, 'issuer' | 'label'>): string {
  return item.issuer || item.label || translate('common.untitled');
}

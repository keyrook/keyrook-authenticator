import { isVaultFile, type VaultFile } from '@authx/core';
import { fail } from '@authx/ui/i18n/errors.js';
import { platform } from './platform.js';

/**
 * Storage split, and why it matters:
 *
 * - The platform's `disk` (`chrome.storage.local` in the extension) holds the
 *   encrypted vault file. It is written to disk, so it must never contain
 *   anything readable.
 * - Its `memory` (`chrome.storage.session`) holds the unwrapped data key while
 *   unlocked. It lives in memory only, is wiped when the browser closes, and
 *   is unreachable from content scripts (TRUSTED_CONTEXTS is the default
 *   access level).
 */
const VAULT_KEY = 'authx.vault';
const SESSION_KEY = 'authx.sessionKey';
const LAST_ACTIVE_KEY = 'authx.lastActive';

export async function loadVaultFile(): Promise<VaultFile | null> {
  const value = await platform().disk.get(VAULT_KEY);
  if (!value) return null;
  if (!isVaultFile(value)) {
    fail('error.vaultCorrupt');
  }
  return value;
}

export async function saveVaultFile(file: VaultFile): Promise<void> {
  await platform().disk.set(VAULT_KEY, file);
}

export async function clearVaultFile(): Promise<void> {
  await platform().disk.remove(VAULT_KEY);
}

export async function saveSessionKey(rawKey: string): Promise<void> {
  await platform().memory.set(SESSION_KEY, rawKey);
}

export async function loadSessionKey(): Promise<string | null> {
  return ((await platform().memory.get(SESSION_KEY)) as string | undefined) ?? null;
}

export async function clearSessionKey(): Promise<void> {
  await platform().memory.remove(SESSION_KEY, LAST_ACTIVE_KEY);
}

export async function markActive(): Promise<void> {
  await platform().memory.set(LAST_ACTIVE_KEY, Date.now());
}

export async function lastActiveAt(): Promise<number | null> {
  return ((await platform().memory.get(LAST_ACTIVE_KEY)) as number | undefined) ?? null;
}

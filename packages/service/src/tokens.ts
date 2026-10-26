import type { TokenStore, Tokens } from '@authx/core';
import { platform } from './platform.js';

/**
 * Session tokens for the sync account.
 *
 * These live on the platform's disk (`chrome.storage.local` in the extension),
 * unlike the vault's data key.
 * That is a deliberate difference, not an oversight: a stolen token buys an
 * attacker ciphertext and nothing else, because decrypting any of it still
 * needs the master password. The alternative — session-only storage — would
 * mean signing in again every time the browser restarts, which trades real
 * usability for protection the encryption already provides.
 *
 * The server can revoke a token; it cannot un-leak a data key.
 */
const TOKENS_KEY = 'authx.tokens';

export const tokenStore: TokenStore = {
  async get(): Promise<Tokens | null> {
    return ((await platform().disk.get(TOKENS_KEY)) as Tokens | undefined) ?? null;
  },

  async set(tokens: Tokens): Promise<void> {
    await platform().disk.set(TOKENS_KEY, tokens);
  },

  async clear(): Promise<void> {
    await platform().disk.remove(TOKENS_KEY);
  },
};

/**
 * Which account this device's session belongs to, and when it began by this
 * device's clock: what a removal proof is checked against
 * (`checkDeviceRemovalProof`). Kept apart from the tokens, which the adapter
 * rewrites on every refresh and clears the moment the server says the session
 * is over — exactly when this is read.
 */
export interface SessionStart {
  accountId: string;
  signedInAt: number;
}

const SESSION_KEY = 'authx.session';

export const sessionStart = {
  async get(): Promise<SessionStart | null> {
    return ((await platform().disk.get(SESSION_KEY)) as SessionStart | undefined) ?? null;
  },
  async set(start: SessionStart): Promise<void> {
    await platform().disk.set(SESSION_KEY, start);
  },
};

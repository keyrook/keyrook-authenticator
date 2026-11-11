import type { FieldDetection } from '@authx/ui/lib/protocol.js';

/*
 * The Chrome side of the pages' protocol: how the service worker tells pages
 * the vault changed, who may talk to it, and what it says to the script it
 * injects. The requests and answers themselves are @authx/ui's
 * (lib/protocol.ts), which every app's pages share.
 */

/** Broadcast by the service worker after any successful write. */
export const VAULT_CHANGED = 'vault/changed' as const;
export interface VaultChangedEvent {
  type: typeof VAULT_CHANGED;
}

/** The parts of a `chrome.runtime.MessageSender` the trust decision needs. */
export interface SenderIdentity {
  id?: string | undefined;
  origin?: string | undefined;
}

/**
 * Whether a message may drive the vault.
 *
 * `id` alone is not enough. A content script carries the extension's own id, so
 * checking only that leaves the whole vault API reachable from any page the
 * script is injected into — and the script is injected into whatever page the
 * user last opened the popup on.
 *
 * The origin is the discriminator. An extension page reports the extension's
 * own origin; a content script reports the page's own origin, whatever that
 * page happens to be. Chrome's own origin is `chrome-extension://<id>`;
 * Firefox's is `moz-extension://<uuid>`, a uuid each install draws at random
 * and nothing like the id (`authenticator@keyrook.com`). So it is the origin
 * the browser gives this extension's own pages, not one built from the id.
 *
 * Not `sender.tab`: the options page is an extension page that lives in a tab,
 * so gating on that locks the settings screen out of its own vault.
 */
export function isTrustedSender(
  sender: SenderIdentity,
  runtimeId: string,
  // `getURL('')` is that origin and a slash. Not `new URL(…).origin`: a
  // scheme the URL standard does not know has the origin "null" there.
  ownOrigin: string = chrome.runtime.getURL('').replace(/\/$/, ''),
): boolean {
  return sender.id === runtimeId && sender.origin === ownOrigin;
}

export type { FieldDetection };

// --- Content-script protocol (background/popup → injected script) ------------

export type ContentRequest = { type: 'authx/detect' } | { type: 'authx/fill'; code: string };
export type ContentResponse = FieldDetection;

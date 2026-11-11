/**
 * Who the dev harness claims to be when it delivers a message.
 *
 * Kept apart from `chrome-stub.ts` only so a test can reach it: the stub
 * touches `localStorage` while it is still being imported, and the unit suite
 * runs in node with no DOM. This pair is the whole of what needs pinning.
 *
 * Development only — nothing here is part of the built extension.
 */
export const DEV_RUNTIME_ID = 'authx-dev-harness';

/**
 * The sender the stub hands to every listener: the harness's own pages, at the
 * origin they are served from. That is what a browser reports for a page of
 * the extension's own, and what `chrome.runtime.getURL('')` gives there — the
 * stub's included — so the background's check compares the two as it does in
 * a real browser.
 */
export const devSender = (pageOrigin: string) => ({ id: DEV_RUNTIME_ID, origin: pageOrigin });

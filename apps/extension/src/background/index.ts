/**
 * MV3 service worker. It runs the vault service (@authx/service) — the only
 * writer for the vault — on Chrome's storage, alarms and sign-in window, and
 * answers what only the extension can: the tab the popup was opened on, the
 * fill shortcut, a sign-in coming back to a tab, the toolbar.
 */
import { generateCode, itemForShortcutFill } from '@authx/core';
import { CRAYON, MOTION, ROLES } from '@keyrook/brand';
import { fail } from '@authx/ui/i18n/errors.js';
import { FILL_COMMAND } from '@authx/ui/lib/commands.js';
import type { FieldDetection, Request, TabContext } from '@authx/ui/lib/protocol.js';
import { installPlatform } from '@authx/service/platform.js';
import { refreshProviderOffer } from '@authx/service/provider.js';
import { finishTabSignIn, handle, onTimer, toEnvelope, unlockedData } from '@authx/service/service.js';
import { IN_FIREFOX, SYNC_API_URL, SYNC_ENABLED } from '../lib/config.js';
import { isTrustedSender } from '../lib/messaging.js';
import { chromePlatform, setLockedTitle } from '../lib/platform.js';

installPlatform(chromePlatform);

// --- The tab the popup was opened on ------------------------------------------

async function activeTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab ?? null;
}

async function tabContext(): Promise<TabContext> {
  const tab = await activeTab();
  if (!tab?.id || !tab.url) return { tabId: null, url: null, hostname: null, title: null };

  let hostname: string | null = null;
  try {
    const url = new URL(tab.url);
    // Only http(s) pages can be injected into or matched against an issuer.
    hostname = url.protocol === 'http:' || url.protocol === 'https:' ? url.hostname : null;
  } catch {
    hostname = null;
  }

  return { tabId: tab.id, url: tab.url, hostname, title: tab.title ?? null };
}

async function injectAndSend(request: { type: string; code?: string }): Promise<FieldDetection> {
  const tab = await activeTab();
  if (!tab?.id) fail('error.noActiveTab');
  if (!tab.url || !/^https?:/.test(tab.url)) {
    fail('error.autofillNotHere');
  }

  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
  } catch {
    fail('error.autofillBlocked');
  }

  // Frame 0 explicitly. `executeScript` put the script in the top frame only,
  // so an unaddressed message would be offered to every frame in the tab and
  // answered by whichever replied first.
  return (await chrome.tabs.sendMessage(tab.id, request, { frameId: 0 })) as FieldDetection;
}

// --- Request routing --------------------------------------------------------

/** The tab is the extension's to answer for; everything else is the vault service's. */
async function route(request: Request): Promise<unknown> {
  switch (request.type) {
    case 'tab/context':
      return tabContext();

    case 'tab/captureQr': {
      const tab = await activeTab();
      if (!tab?.windowId) fail('error.noActiveTab');
      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
      return { dataUrl };
    }

    case 'tab/detectFields':
      return injectAndSend({ type: 'authx/detect' });

    case 'tab/fill':
      return injectAndSend({ type: 'authx/fill', code: request.code });

    default:
      return handle(request);
  }
}

chrome.runtime.onMessage.addListener((message: Request, sender, sendResponse) => {
  // Only this extension's own pages may drive the vault. See isTrustedSender.
  if (!isTrustedSender(sender, chrome.runtime.id)) return false;

  void toEnvelope(route(message)).then(sendResponse);
  return true; // Keep the message channel open for the async response.
});

/**
 * A sign-in made in the options tab comes back as a message from the sync
 * server's return page: the manifest's `externally_connectable` lets that one
 * origin send one, and nothing else on the web. It carries what the sign-in
 * window's redirect would — worth nothing without the verifier this worker
 * kept — and an answer to a sign-in this browser is not waiting for is
 * refused without touching anything.
 */
const SYNC_ORIGIN = SYNC_ENABLED ? new URL(SYNC_API_URL).origin : null;

// Not on Firefox, which lets no web page message an extension: there the
// event is other extensions', and this one listens to none of them.
if (!IN_FIREFOX) chrome.runtime.onMessageExternal?.addListener((message: unknown, sender, sendResponse) => {
  const answer = (message as { answer?: unknown } | null)?.answer;
  const tabId = sender.tab?.id;
  if (
    !SYNC_ORIGIN ||
    sender.origin !== SYNC_ORIGIN ||
    tabId === undefined ||
    typeof answer !== 'string' ||
    answer.length > 4096
  ) {
    return false;
  }
  finishInTab(new URLSearchParams(answer), tabId).then(sendResponse, () => sendResponse(false));
  return true;
});

async function finishInTab(answer: URLSearchParams, tabId: number): Promise<boolean> {
  if (!(await finishTabSignIn(answer))) return false;
  await chrome.tabs.update(tabId, { url: chrome.runtime.getURL('options.html#account') });
  return true;
}

/**
 * Filling a code with one keystroke, on the page the person is on. The
 * shortcut grants `activeTab` for that tab, as clicking the toolbar icon does,
 * so nothing here reaches further than the popup already could.
 *
 * It fills only when exactly one account belongs to the site
 * (`itemForShortcutFill`). Anything less certain — a locked vault, autofill
 * switched off, no account or two, a page with no code field — opens the
 * popup instead, which shows what it is about to do and warns before filling
 * anywhere unexpected.
 */
async function fillFromShortcut(tab: chrome.tabs.Tab | undefined): Promise<void> {
  // Chrome 127 and later; before that the popup cannot be opened for someone.
  const choose = () => void chrome.action.openPopup?.().catch(() => undefined);
  const data = await unlockedData();
  if (!data || !data.settings.autofillEnabled || tab?.id === undefined || !tab.url) return choose();

  let hostname: string | null = null;
  try {
    const url = new URL(tab.url);
    if (url.protocol === 'https:' || url.protocol === 'http:') hostname = url.hostname;
  } catch {
    hostname = null;
  }
  const item = itemForShortcutFill(data.items, hostname);
  if (!item) return choose();

  try {
    const filled = await injectAndSend({ type: 'authx/fill', code: await generateCode(item) });
    if (!filled.found) return choose();
  } catch {
    return choose();
  }

  // Said where the eyes are not: a tick on the toolbar icon, for a moment —
  // the success crayon at the stop that holds white text, for "Copied"'s hold.
  const tabId = tab.id;
  await chrome.action.setBadgeBackgroundColor({ tabId, color: CRAYON.green[ROLES.success.light] });
  await chrome.action.setBadgeText({ tabId, text: '✓' });
  setTimeout(() => void chrome.action.setBadgeText({ tabId, text: '' }).catch(() => undefined), MOTION.hold);
}

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === FILL_COMMAND) void fillFromShortcut(tab);
});

chrome.alarms.onAlarm.addListener((alarm) => onTimer(alarm.name));

chrome.runtime.onStartup.addListener(() => {
  void setLockedTitle(true);
});

chrome.runtime.onInstalled.addListener(async (details) => {
  await setLockedTitle(true);
  // So the first sign-in card is drawn with its buttons, not without them.
  if (SYNC_ENABLED) void refreshProviderOffer().catch(() => undefined);
  if (details.reason === 'install') {
    await chrome.tabs.create({ url: chrome.runtime.getURL('options.html#welcome') });
  }
});
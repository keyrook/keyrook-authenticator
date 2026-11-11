import { host } from '../host.js';
import type { MessageKey } from './locales/en.js';

/**
 * The sentences that name where the app runs — this browser, the extension,
 * this computer, Chrome — and the same sentence said of a phone. A key not
 * here reads the same everywhere. `translate` and `t.rich` look every key up
 * here first, so a screen asks for the one sentence and gets the right one.
 */
const ON_A_PHONE = {
  'setup.device.description': 'setup.device.description.phone',
  'setup.device.footnote': 'setup.device.footnote.phone',
  'setup.password.footnote': 'setup.password.footnote.phone',
  'unrecoverable.why': 'unrecoverable.why.phone',
  'vault.empty.body': 'vault.empty.body.phone',
  'add.camera.description': 'add.camera.description.phone',
  'add.fromGoogle': 'add.fromGoogle.phone',
  'camera.noCamera': 'camera.noCamera.phone',
  'camera.blocked': 'camera.blocked.phone',
  'camera.none': 'camera.none.phone',
  'security.languageBrowser': 'security.languageBrowser.phone',
  'protect.removeWarning': 'protect.removeWarning.phone',
  'kit.device': 'kit.device.phone',
  'kit.withoutDevice': 'kit.withoutDevice.phone',
  'security.description': 'security.description.phone',
  'security.deviceKeyHint': 'security.deviceKeyHint.phone',
  'general.description': 'general.description.phone',
  'about.securityModelDescription': 'about.securityModelDescription.phone',
  'about.logos.description': 'about.logos.description.phone',
  'about.fact.access.title': 'about.fact.access.title.phone',
  'about.fact.access.body': 'about.fact.access.body.phone',
  'about.fact.keys.body': 'about.fact.keys.body.phone',
  // Sync. Every app calls an account's other devices devices; these name this one.
  'error.signOutUnsynced': 'error.signOutUnsynced.phone',
  'account.signOutNote': 'account.signOutNote.phone',
  'secondStepTip.suggest': 'secondStepTip.suggest.phone',
  'intro.benefit2': 'intro.benefit2.phone',
  'provider.finishInWindow': 'provider.finishInWindow.phone',
  'join.title': 'join.title.phone',
  'join.subtitle': 'join.subtitle.phone',
  'joinKey.subtitle': 'joinKey.subtitle.phone',
  'facts.autofill': 'facts.autofill.phone',
} as const satisfies Partial<Record<MessageKey, MessageKey>>;

/**
 * The sentences that name Chrome, said in Firefox: what it refused, where its
 * shortcuts are changed. Firefox has no QR reader of its own on any computer,
 * so its note about one is always shown.
 */
const IN_FIREFOX = {
  'error.autofillBlocked': 'error.autofillBlocked.firefox',
  'add.camera.elsewhere': 'add.camera.elsewhere.firefox',
  'add.noNativeReader': 'add.noNativeReader.firefox',
  'import.noNativeReader': 'import.noNativeReader.firefox',
  'camera.blocked': 'camera.blocked.firefox',
  'about.fact.access.body': 'about.fact.access.body.firefox',
  'about.shortcut.change': 'about.shortcut.change.firefox',
} as const satisfies Partial<Record<MessageKey, MessageKey>>;

/** The key for this sentence where the app runs now. */
export function here(key: MessageKey): MessageKey {
  const { device, browser } = host();
  const variants: Partial<Record<MessageKey, MessageKey>> | null =
    device === 'phone' ? ON_A_PHONE : browser === 'firefox' ? IN_FIREFOX : null;
  return variants?.[key] ?? key;
}

import type { PasskeySignInOptions, PasskeyUnlockKind } from '@authx/core';
import type { SettingsFragment } from './lib/deep-link.js';
import type { Envelope, PasskeyTouchSent, Request } from './lib/protocol.js';

/**
 * What the pages need from whatever runs them, and nothing more. The
 * extension's popup and Settings install one built on `chrome.*`
 * (apps/extension/src/lib/host.ts); an app on another platform brings its own,
 * and every screen here works unchanged.
 *
 * Nothing in this package reaches the platform any other way. Its tsconfig
 * has no `chrome` types, so a stray `chrome.*` does not compile — it would tie
 * every future app to the browser, and the point of the package is that it
 * does not.
 */
export interface Host {
  /**
   * Carries a request to the vault's one writer — the service worker, in the
   * extension — and brings back its answer, or undefined when nothing answered.
   * `send` in lib/protocol.ts is the typed way to call it.
   */
  request(request: Request): Promise<Envelope<unknown> | undefined>;
  /** Calls `handler` after any change to the vault, made anywhere; returns an unsubscribe. */
  onVaultChanged(handler: () => void): () => void;
  preferences: Preferences;
  /** Whether this build has a sync server. Without one, no page offers an account. */
  readonly syncEnabled: boolean;
  /**
   * Asks the person's leave to send anything to the account, where the
   * platform asks — Firefox's data consent — and says whether it was given;
   * at once, with no prompt, once it has been. Called first in the click that
   * starts a sign-in, a sign-up or a sync, before anything awaits: Firefox
   * shows its prompt only while the click is being handled. Absent: nothing to
   * ask. The vault service sends nothing without it either.
   */
  readonly allowAccountData?: (() => Promise<boolean>) | undefined;
  /** The account's page, for a server with one of its own. Absent: the official page (lib/links.ts). */
  readonly accountPageUrl?: string | undefined;
  /** The version running, as About shows it. */
  readonly version: string;
  /**
   * Opens Settings at the place a fragment names, or as it was. Any work that
   * must happen before the page goes away is started before this returns.
   */
  openSettings(fragment?: SettingsFragment): Promise<void>;
  /** Opens an address outside the app, in a new tab. */
  openUrl(url: string): Promise<void>;
  /**
   * Whether the codes screen opens over a web page, as the extension's popup
   * does: a page to fill a code into, read a QR from and put its accounts
   * first, the keyboard shortcuts that act on it — and a window too
   * short-lived to ask for the camera. An app's codes screen is a window of
   * its own, over no page, and every screen leaves all of that out.
   */
  readonly overPage: boolean;
  /**
   * What the person calls where this runs, so the words name it: "a key this
   * browser holds", or "a key this phone keeps" (i18n/device.ts).
   */
  readonly device: 'browser' | 'phone';
  /**
   * The browser, where a sentence names it or tells the person where to click
   * in it (i18n/device.ts). Absent, Chrome's words, which Edge and Opera,
   * built on the same browser, have always read.
   */
  readonly browser?: 'firefox' | undefined;
  /**
   * Hands over a file the person asked for — a backup, an export, a QR
   * picture, the recovery sheet — to wherever this platform keeps them: the
   * browser's downloads, a phone's share sheet. A webview has no downloads,
   * so an `<a download>` there does nothing at all.
   */
  saveFile(name: string, contents: Blob): Promise<void>;
  /** Prints the page as it is drawn now, through the platform's own dialog. */
  print(): void;
  /**
   * Puts text on the clipboard. Everything this app copies is a secret or
   * opens one — a code, a recovery key, a setup link, a link to shared codes —
   * so a platform that can mark a copy as sensitive marks every one: a phone
   * would otherwise show it in a preview, and offer it back from the keyboard.
   */
  copy(text: string): Promise<void>;
  /** The keyboard shortcuts as set now, by command name (lib/commands.ts). */
  shortcuts(): Promise<Record<string, string>>;
  /** Where this copy is rated. */
  storeListing(): StoreListing;
  /**
   * Signing in with one of the Keyrook account's passkeys. Absent where this
   * platform cannot ask them: a browser too old to let an app use another
   * site's passkeys, or a build whose server has no account page.
   */
  readonly accountPasskeys?: AccountPasskeys | undefined;
  /**
   * Opening the vault with a passkey of this app's own instead of the
   * password — the computer's own check of the person (Touch ID, Windows Hello
   * and its PIN) or a security key and its PIN (core's
   * vault/passkey-unlock.ts). Absent where the platform cannot make one.
   */
  readonly passkeyUnlock?: PasskeyUnlockHost | undefined;
  /**
   * A QR reader the app brings itself, read before the browser's own: a
   * phone's WebView has one only through Google Play services, which takes
   * the app down (apps/mobile). Absent, the browser's reader or jsQR.
   */
  readonly qrReader?: QrReader | undefined;
}

/** Reads the QR codes in a picture or a camera's current frame; none, an empty list. */
export interface QrReader {
  detect(source: HTMLImageElement | HTMLVideoElement): Promise<{ rawValue: string }[]>;
}

/**
 * This app's own passkeys, which never leave their authenticator — the
 * computer's, or a security key — and answer only after it has checked the
 * person. Each method throws an `AppError` the page shows: cancelled, no PRF,
 * or failed.
 */
export interface PasskeyUnlockHost {
  /**
   * Whether a passkey of this kind can be offered now. The computer says
   * whether it has a check of its own; whether a security key is at hand
   * cannot be known before one is asked for, so it always may be.
   */
  available(kind: PasskeyUnlockKind): Promise<boolean>;
  /** Makes the passkey of this kind, and asks it once for its answer to `prfInput`. */
  create(kind: PasskeyUnlockKind, prfInput: Uint8Array): Promise<{ credentialId: string; prf: Uint8Array }>;
  /** Asks the passkey `credentialId`, of this kind, for its answer to `prfInput`. */
  answer(kind: PasskeyUnlockKind, credentialId: string, prfInput: Uint8Array): Promise<Uint8Array>;
  /** Tells the platform the passkey is no longer used, where it can be told; never throws. */
  forget(credentialId: string): Promise<void>;
}

/**
 * The Keyrook account's passkeys belong to its page, account.keyrook.com, and
 * an app may ask them only with the platform's leave to use that site's.
 */
export interface AccountPasskeys {
  /** Whether that leave is already given, so a passkey can be asked with no prompt first. */
  granted(): Promise<boolean>;
  /**
   * Asks for the leave if it is not given — first, while the click that chose
   * a passkey still counts — then for a challenge with `challenge`, then the
   * passkey, with the PRF input every Keyrook app asks (`PASSKEY_PRF_INPUT`).
   * Throws an `AppError` the page shows when the person says no, cancels, or
   * the platform cannot ask.
   */
  touch(challenge: () => Promise<PasskeySignInOptions>): Promise<PasskeyTouchSent>;
}

/**
 * Small settings kept outside the vault — the language, the rating prompt —
 * because the screens that need them come before it opens. Never a secret:
 * they sit on disk as they are.
 */
export interface Preferences {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
  /** Calls `handler` with the new value when any page changes `key`; returns an unsubscribe. */
  watch(key: string, handler: (value: unknown) => void): () => void;
}

export interface StoreListing {
  /** Which store, named in the person's language by `storeName`. */
  store: 'chrome' | 'edge' | 'firefox' | 'play';
  url: string;
}

let installed: Host | null = null;

/** Once per page, before anything renders or asks the vault a question. */
export function installHost(host: Host): void {
  installed = host;
}

export function host(): Host {
  if (!installed) throw new Error('installHost() must run before any page renders.');
  return installed;
}

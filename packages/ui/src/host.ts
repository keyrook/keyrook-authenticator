import type { SettingsFragment } from './lib/deep-link.js';
import type { Envelope, Request } from './lib/protocol.js';

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
  /** The version running, as About shows it. */
  readonly version: string;
  /**
   * Opens Settings at the place a fragment names, or as it was. Any work that
   * must happen before the page goes away is started before this returns.
   */
  openSettings(fragment?: SettingsFragment): Promise<void>;
  /** Opens an address outside the app, in a new tab. */
  openUrl(url: string): Promise<void>;
  /** The keyboard shortcuts as set now, by command name (lib/commands.ts). */
  shortcuts(): Promise<Record<string, string>>;
  /** Where this copy is rated. */
  storeListing(): StoreListing;
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
  store: string;
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

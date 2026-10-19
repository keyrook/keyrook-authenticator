/**
 * What the vault service needs from whatever runs it, and nothing more. The
 * extension's service worker installs one built on `chrome.*`
 * (apps/extension/src/lib/platform.ts); an app on another platform brings its
 * own, and the service — every rule about who writes the vault, when it
 * locks, how it signs in and syncs — runs unchanged.
 *
 * Nothing in this package reaches the platform any other way. Its tsconfig has
 * no `chrome` types, so a stray `chrome.*` does not compile.
 */
export interface Platform {
  /**
   * Written to disk. Holds the sealed vault file, the account's session
   * tokens and what the server says it offers — so nothing readable: see
   * storage.ts.
   */
  disk: KeyValueStore;
  /**
   * Memory only: survives the service being stopped and started again, not
   * the browser or the app closing, and no page's script can reach it. Holds
   * the data key while a password-protected vault is open, and sign-ins under
   * way.
   */
  memory: KeyValueStore;
  /**
   * The key that opens a vault without a password. It never leaves the
   * platform's key store as bytes: in the extension it is a non-extractable
   * key in IndexedDB.
   */
  deviceKey: DeviceKeyStore;
  /**
   * Timers that outlive the service being stopped — the extension's are
   * alarms. When one fires, the platform calls `onTimer` with its name.
   */
  timers: Timers;
  /** Tells every open page the vault changed. Nobody listening is normal. */
  announceChange(): void;
  /** Shows whether the vault is locked where the app shows it: the toolbar button's tooltip. */
  showLocked(locked: boolean): Promise<void>;
  /** The sync server's origin; empty in a build without one, which turns every account feature off. */
  readonly syncApiUrl: string;
  /** Who the sync server sends a provider's sign-in back to: the extension's id. */
  readonly clientId: string;
  /**
   * This build's version, named to the server in every request. A request
   * that names none is taken for a build from before keys per product, and
   * refused what such a build could not keep up with.
   */
  readonly clientVersion: string;
  /** How this device is listed among the account's: "Chrome on Mac". */
  deviceName(): string;
  /**
   * Opens a provider's sign-in in a window of the platform's own and resolves
   * with the address it ended on; rejects when the person closes it.
   */
  signInWindow(url: string): Promise<string | undefined>;
}

export interface KeyValueStore {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  remove(...keys: string[]): Promise<void>;
}

export interface DeviceKeyStore {
  get(): Promise<CryptoKey | null>;
  getOrCreate(): Promise<CryptoKey>;
  /** Only ever called when the vault it protects is being deleted too. */
  destroy(): Promise<void>;
}

export interface Timers {
  /** Fires once, `minutes` from now, replacing any timer of the same name. */
  once(name: string, minutes: number): void;
  /** Fires every `minutes`, replacing any timer of the same name. */
  every(name: string, minutes: number): void;
  clear(name: string): Promise<void>;
}

let installed: Platform | null = null;

/** Once, before the service answers anything. */
export function installPlatform(platform: Platform): void {
  installed = platform;
}

export function platform(): Platform {
  if (!installed) throw new Error('installPlatform() must run before the vault service answers anything.');
  return installed;
}

/** Whether this build has a sync server at all. */
export const syncEnabled = (): boolean => platform().syncApiUrl.length > 0;

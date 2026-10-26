import type { KdfParams, RecoveryWrap, SealedBox } from '@keyrook/account';
import type { OtpAlgorithm, OtpType } from '../otp/types.js';

/**
 * How the data key is protected at rest.
 *
 * - `device`: wrapped by a non-extractable key the browser holds for this
 *   installation. Nothing to type, and the raw key bytes are never reachable
 *   from JavaScript — but it is not hardware-bound, so a local attacker with
 *   file access and know-how can still recover it.
 * - `passphrase`: wrapped by a key derived from a master password. Stronger,
 *   and the only mode that can back zero-knowledge sync.
 */
export type ProtectionMode = 'device' | 'passphrase';

export interface VaultProtection {
  mode: ProtectionMode;
  /** Present for `passphrase` only. */
  kdf: KdfParams | null;
  wrappedKey: SealedBox;
}

/**
 * A master-password vault's second way in: a passkey — the computer's own
 * check of the person, or a security key — (vault/passkey-unlock.ts). All of
 * it safe to read; the key inside is wrapped by one only the passkey's PRF
 * answer makes.
 */
export interface VaultPasskeyUnlock {
  /** The passkey asked for, by id: never one the authenticator picks. */
  credentialId: string;
  /** What the passkey's PRF is asked about, base64: random, one per vault. */
  prfInput: string;
  /** The data key, wrapped by the key the PRF answer makes. */
  wrappedKey: SealedBox;
  createdAt: number;
}

/**
 * Ceiling on a stored custom icon.
 *
 * The sync server refuses a record whose encrypted box exceeds 64 KB, and
 * base64 inflates ciphertext by about a third — so the whole item has to stay
 * comfortably under that. 24 KB leaves room for everything else and is far more
 * than a 128px tile needs; anything approaching it means the re-encoder failed
 * to compress and the picture should be rejected rather than silently break
 * sync later.
 */
export const MAX_ICON_BYTES = 24 * 1024;

/** Bump when the decrypted payload shape changes; see `migrateVaultData`. */
export const VAULT_SCHEMA_VERSION = 1;
/** Bump when the on-disk envelope (kdf/wrapping) changes. */
export const VAULT_FILE_VERSION = 1;

/**
 * One 2FA account.
 *
 * The sync-related fields (`rev`, `syncedRev`, `deletedAt`, `updatedAt`) are
 * present from v1 even though v1 ships local-only: retrofitting tombstones and
 * revisions onto an existing user base is the painful kind of migration.
 */
export interface VaultItem {
  id: string;
  type: OtpType;
  /** Service name, e.g. "GitHub". */
  issuer: string;
  /** Account within the service, e.g. "alice@example.com". */
  label: string;
  /** Base32. The one genuinely secret field. */
  secret: string;
  algorithm: OtpAlgorithm;
  digits: number;
  period: number;
  counter: number;
  /** Optional user note; never auto-filled anywhere. */
  note: string;
  /**
   * A picture the user chose for this account, as a `data:` URL, overriding
   * whatever mark the service would otherwise get.
   *
   * Stored inside the encrypted payload like everything else, so it syncs and
   * the server never sees it. Always a raster the app produced itself — see
   * `MAX_ICON_BYTES` and the note on re-encoding in the extension's uploader.
   */
  icon: string | null;
  groupId: string | null;
  favorite: boolean;
  /** Origins where this item should be offered for autofill, e.g. ["github.com"]. */
  domains: string[];
  createdAt: number;
  updatedAt: number;
  /** Tombstone timestamp. Non-null items are hidden but retained for sync. */
  deletedAt: number | null;
  /** Incremented on every local mutation. */
  rev: number;
  /** Highest `rev` the server has acknowledged. `rev > syncedRev` means dirty. */
  syncedRev: number;
}

export interface Group {
  id: string;
  name: string;
  color: string | null;
  order: number;
  updatedAt: number;
  deletedAt: number | null;
  rev: number;
  syncedRev: number;
}

/**
 * Only two, because only two mean anything here. A "recently used" order would
 * need a per-code timestamp written on every copy, which is either sync churn
 * or a lie about what it sorts by.
 */
export type SortMode = 'added' | 'name';
export type ThemePreference = 'system' | 'light' | 'dark';

export interface VaultSettings {
  /** Minutes of inactivity before the key is dropped. 0 disables auto-lock. */
  autoLockMinutes: number;
  /** Blur codes until the user reveals them — useful on shared screens. */
  hideCodes: boolean;
  sortBy: SortMode;
  theme: ThemePreference;
  /** Offer to fill detected OTP fields on the active tab. */
  autofillEnabled: boolean;
}

export const DEFAULT_SETTINGS: VaultSettings = {
  autoLockMinutes: 15,
  hideCodes: false,
  sortBy: 'added',
  theme: 'system',
  autofillEnabled: true,
};

/**
 * The signed-in account, which doubles as the sync endpoint. `null` email means
 * the vault is local-only and subject to the free-tier item limit.
 */
export interface AccountState {
  email: string | null;
  plan: 'local' | 'synced';
  /**
   * How the account proves who signs in. Absent on vaults signed in before
   * 0.3, which are all password accounts.
   */
  method?: 'password' | 'provider';
  /** For a provider account: which one. */
  provider?: 'google' | 'github';
  /**
   * Keyrook Authenticator's key on the account, as this device last opened it
   * (keys per product). Absent while the account has no root — every account
   * made before 0.4 — when the vault key is the account's data key as before.
   */
  keys?: AccountKeyState;
}

/**
 * What this device knows of the account's keys. The root is the one it
 * pinned: a server that later reports another, or none, is caught by it.
 */
export interface AccountKeyState {
  accountId: string;
  /** The root's public half this device trusts. */
  root: string;
  rootGeneration: number;
  keyGeneration: number;
  /** When the recovery key was last seen protecting this product, or null. */
  sheetVerifiedAt: number | null;
  /**
   * The key this one replaced, raw, while records sealed under it may still
   * be on the server: kept until every record has gone up under the new one.
   * Inside the sealed payload, like every secret here.
   */
  previousKey?: string;
}

export const DEFAULT_ACCOUNT: AccountState = {
  email: null,
  plan: 'local',
};

export interface SyncState {
  /** Stable per-installation id; the server uses it to attribute changes. */
  deviceId: string;
  /** Server revision this device has fully caught up to. */
  serverRev: number;
  lastSyncAt: number | null;
  /**
   * `issuedAt` of the newest account recovery-kit state this device has
   * applied or uploaded; 0 when the account has none that it knows of. A
   * state no newer than this is a replay and is ignored. Equal to the local
   * kit's `createdAt` exactly when that kit is also the account's.
   */
  recoveryAt?: number;
  /**
   * The server's history this device is in step with. Absent until the first
   * sync. A different value means the server was restored from a backup.
   */
  epoch?: string;
}

/** The decrypted contents of the vault. Never leaves memory unencrypted. */
export interface VaultData {
  schemaVersion: number;
  items: VaultItem[];
  groups: Group[];
  settings: VaultSettings;
  account: AccountState;
  sync: SyncState;
}

/**
 * The at-rest envelope. Everything outside `payload` and `wrappedKey` is
 * plaintext, so it must stay free of anything that identifies the user.
 */
export interface VaultFile {
  format: 'authx.vault';
  version: number;
  /** Stable id, bound into the AEAD as associated data. */
  id: string;
  protection: VaultProtection;
  /** Null until the user issues a recovery kit. */
  recovery: RecoveryWrap | null;
  /**
   * Opening with Touch ID, Windows Hello and the like. Absent or null when
   * not turned on; a file from before it says nothing.
   */
  platformUnlock?: VaultPasskeyUnlock | null;
  /** Opening with a security key and its PIN, the same way, beside it. */
  securityKeyUnlock?: VaultPasskeyUnlock | null;
  /** `VaultData`, encrypted under the data key. */
  payload: SealedBox;
  createdAt: number;
  updatedAt: number;
}

export function isVaultFile(value: unknown): value is VaultFile {
  if (typeof value !== 'object' || value === null) return false;
  const file = value as Partial<VaultFile>;
  return (
    file.format === 'authx.vault' &&
    typeof file.version === 'number' &&
    typeof file.id === 'string' &&
    typeof file.protection === 'object' &&
    file.protection !== null &&
    typeof file.payload === 'object'
  );
}

/** Display name for an item, falling back sensibly when fields are blank. */
export function itemTitle(item: Pick<VaultItem, 'issuer' | 'label'>): string {
  return item.issuer || item.label || 'Untitled';
}

export function itemSubtitle(item: Pick<VaultItem, 'issuer' | 'label'>): string {
  return item.issuer ? item.label : '';
}

/**
 * Whether a value is safe to render as an account's picture.
 *
 * Only raster data URLs the app could have produced. SVG is excluded on
 * purpose: it can carry script and external references, and nothing here needs
 * it — every stored icon has been through a canvas and come out as pixels.
 */
export function isStoredIcon(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value) &&
    value.length <= MAX_ICON_BYTES
  );
}

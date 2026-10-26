import {
  DecryptionError,
  deriveKek,
  exportDataKey,
  generateDataKey,
  importDataKey,
  type KdfParams,
  newKdfParams,
  openJson,
  sealJson,
  unwrapDataKey,
  wrapDataKey,
} from '@keyrook/account';
import { DEFAULT_OTP_PARAMS } from '../otp/types.js';
import type { ParsedOtpUri } from '../otp/uri.js';
import { utf8 } from '../util/bytes.js';
import { newId } from '../util/id.js';
import { coversHost, writtenByOthers } from './hosts.js';
import {
  DEFAULT_ACCOUNT,
  DEFAULT_SETTINGS,
  isStoredIcon,
  VAULT_FILE_VERSION,
  VAULT_SCHEMA_VERSION,
  type AccountState,
  type Group,
  type ProtectionMode,
  type VaultData,
  type VaultFile,
  type VaultItem,
  type VaultProtection,
  type VaultSettings,
} from './model.js';

export { DecryptionError, exportDataKey, importDataKey };

/**
 * Associated data binds a ciphertext to the vault it belongs to, so a payload
 * lifted from one vault cannot be spliced into another.
 */
function aad(file: Pick<VaultFile, 'id' | 'version'>): Uint8Array {
  return utf8(`authx.vault:v${file.version}:${file.id}`);
}

export interface UnlockedVault {
  file: VaultFile;
  data: VaultData;
  dataKey: CryptoKey;
}

function emptyData(deviceId: string): VaultData {
  return {
    schemaVersion: VAULT_SCHEMA_VERSION,
    items: [],
    groups: [],
    settings: { ...DEFAULT_SETTINGS },
    account: { ...DEFAULT_ACCOUNT },
    sync: { deviceId, serverRev: 0, lastSyncAt: null },
  };
}

/**
 * A key-encryption key plus the metadata describing where it came from.
 *
 * Deriving the KEK is the caller's job: passwords are handled here, while a
 * device-bound key comes from platform storage the core package must not know
 * about (IndexedDB in the extension, the OS keychain in the native apps).
 */
export interface Keyring {
  kek: CryptoKey;
  mode: ProtectionMode;
  kdf: KdfParams | null;
}

export async function passphraseKeyring(
  password: string,
  kdf: KdfParams = newKdfParams(),
): Promise<Keyring> {
  if (password.length < 8) throw new Error('Master password must be at least 8 characters.');
  return { kek: await deriveKek(password, kdf), mode: 'passphrase', kdf };
}

export function deviceKeyring(deviceKey: CryptoKey): Keyring {
  return { kek: deviceKey, mode: 'device', kdf: null };
}

/** Re-derive the KEK needed to open an existing file with a given password. */
export async function keyringForFile(file: VaultFile, password: string): Promise<Keyring> {
  if (file.protection.mode !== 'passphrase' || !file.protection.kdf) {
    throw new Error('This vault is not protected by a master password.');
  }
  return {
    kek: await deriveKek(password, file.protection.kdf),
    mode: 'passphrase',
    kdf: file.protection.kdf,
  };
}

export async function createVault(
  keyring: Keyring,
  options: { deviceId?: string } = {},
): Promise<UnlockedVault> {
  const dataKey = await generateDataKey();
  const now = Date.now();
  const skeleton = { id: newId(), version: VAULT_FILE_VERSION };
  const data = emptyData(options.deviceId ?? newId());

  const file: VaultFile = {
    format: 'authx.vault',
    version: skeleton.version,
    id: skeleton.id,
    protection: {
      mode: keyring.mode,
      kdf: keyring.kdf,
      wrappedKey: await wrapDataKey(keyring.kek, dataKey),
    },
    recovery: null,
    payload: await sealJson(dataKey, data, aad(skeleton)),
    createdAt: now,
    updatedAt: now,
  };

  return { file, data, dataKey };
}

export async function unlockVault(file: VaultFile, keyring: Keyring): Promise<UnlockedVault> {
  const dataKey = await unwrapDataKey(keyring.kek, file.protection.wrappedKey);
  return { file, dataKey, data: await readPayload(file, dataKey) };
}

/** Convenience wrapper for the master-password path. */
export async function unlockVaultWithPassword(
  file: VaultFile,
  password: string,
): Promise<UnlockedVault> {
  return unlockVault(file, await keyringForFile(file, password));
}

/** Reopen with a key already held in memory — the auto-unlock path. */
export async function readPayload(file: VaultFile, dataKey: CryptoKey): Promise<VaultData> {
  const raw = await openJson<VaultData>(dataKey, file.payload, aad(file));
  return migrateVaultData(raw);
}

/** Re-encrypt the payload. Returns a new file; the input is left untouched. */
export async function sealVault(
  file: VaultFile,
  dataKey: CryptoKey,
  data: VaultData,
): Promise<VaultFile> {
  return {
    ...file,
    payload: await sealJson(dataKey, data, aad(file)),
    updatedAt: Date.now(),
  };
}

/**
 * Re-wrap the data key under a different keyring — used to set, change or
 * remove the master password. Because only the small wrapped-key blob changes,
 * this stays instant no matter how large the vault grows.
 */
export async function rewrapVault(
  file: VaultFile,
  dataKey: CryptoKey,
  keyring: Keyring,
): Promise<VaultFile> {
  const protection: VaultProtection = {
    mode: keyring.mode,
    kdf: keyring.kdf,
    wrappedKey: await wrapDataKey(keyring.kek, dataKey),
  };
  // The data key is the same, so a passkey's way in still opens it — while
  // there is a password for it to stand in for. A device-key vault asks for
  // nothing, and keeps no second way in.
  const keep = keyring.mode === 'passphrase';
  return {
    ...file,
    protection,
    platformUnlock: keep ? (file.platformUnlock ?? null) : null,
    securityKeyUnlock: keep ? (file.securityKeyUnlock ?? null) : null,
    updatedAt: Date.now(),
  };
}

/**
 * Re-encrypt the vault under a different data key, keeping the same vault id.
 *
 * Needed when a device joins an existing account: the account already has a
 * data key, and every device has to converge on it. Re-sealing the payload is
 * the only way — unlike a password change, this genuinely rewrites everything.
 */
export async function adoptDataKey(
  file: VaultFile,
  keyring: Keyring,
  dataKey: CryptoKey,
  data: VaultData,
): Promise<VaultFile> {
  return {
    ...file,
    protection: {
      mode: keyring.mode,
      kdf: keyring.kdf,
      wrappedKey: await wrapDataKey(keyring.kek, dataKey),
    },
    // The old recovery key wrapped the old data key, so it would no longer open
    // anything. Dropping it is honest; the UI must prompt for a new one.
    recovery: null,
    // The same for a passkey's way in, of either kind: it wrapped the old key.
    // Turned on again, it wraps the new one.
    platformUnlock: null,
    securityKeyUnlock: null,
    payload: await sealJson(dataKey, data, aad(file)),
    updatedAt: Date.now(),
  };
}

export async function verifyPassword(file: VaultFile, password: string): Promise<boolean> {
  if (file.protection.mode !== 'passphrase') return false;
  try {
    const keyring = await keyringForFile(file, password);
    await unwrapDataKey(keyring.kek, file.protection.wrappedKey);
    return true;
  } catch (error) {
    if (error instanceof DecryptionError) return false;
    throw error;
  }
}

/** Forward-migrate a decrypted payload written by an older build. */
export function migrateVaultData(raw: VaultData): VaultData {
  if (raw.schemaVersion > VAULT_SCHEMA_VERSION) {
    throw new Error(
      'This vault was created by a newer version of Keyrook Authenticator. Please update before opening it.',
    );
  }
  return {
    schemaVersion: VAULT_SCHEMA_VERSION,
    items: Array.isArray(raw.items) ? raw.items.map(normalizeItem) : [],
    groups: Array.isArray(raw.groups) ? raw.groups : [],
    settings: migrateSettings(raw.settings),
    // Only the fields that still mean something. Vaults written while a free
    // tier was planned carry `grandfatheredItems`; there is no tier now. How
    // the account signs in must survive: without it a Google account, opened
    // again, was taken for one with a password.
    account: migrateAccount(raw.account),
    sync: raw.sync ?? { deviceId: newId(), serverRev: 0, lastSyncAt: null },
  };
}

function migrateAccount(raw: Partial<AccountState> | undefined): AccountState {
  const account: AccountState = {
    email: raw?.email ?? DEFAULT_ACCOUNT.email,
    plan: raw?.plan ?? DEFAULT_ACCOUNT.plan,
  };
  if (raw?.method === 'password' || raw?.method === 'provider') account.method = raw.method;
  if (raw?.provider === 'google' || raw?.provider === 'github') account.provider = raw.provider;
  const keys = raw?.keys;
  if (
    keys &&
    typeof keys.accountId === 'string' &&
    typeof keys.root === 'string' &&
    Number.isInteger(keys.rootGeneration) &&
    Number.isInteger(keys.keyGeneration) &&
    (keys.sheetVerifiedAt === null || typeof keys.sheetVerifiedAt === 'number')
  ) {
    account.keys = {
      accountId: keys.accountId,
      root: keys.root,
      rootGeneration: keys.rootGeneration,
      keyGeneration: keys.keyGeneration,
      sheetVerifiedAt: keys.sheetVerifiedAt,
      ...(typeof keys.previousKey === 'string' ? { previousKey: keys.previousKey } : {}),
    };
  }
  return account;
}

/** Sort modes were renamed; a stale value must not survive as an invalid one. */
function migrateSettings(raw: Partial<VaultSettings> | undefined): VaultSettings {
  const legacy: Record<string, VaultSettings['sortBy']> = {
    issuer: 'name',
    manual: 'added',
    recent: 'added',
  };
  const merged = { ...DEFAULT_SETTINGS, ...(raw ?? {}) };
  return { ...merged, sortBy: legacy[merged.sortBy as string] ?? merged.sortBy };
}

export function normalizeItem(item: Partial<VaultItem>): VaultItem {
  const now = Date.now();
  return {
    id: item.id ?? newId(),
    type: item.type ?? 'totp',
    issuer: item.issuer ?? '',
    label: item.label ?? '',
    secret: item.secret ?? '',
    algorithm: item.algorithm ?? DEFAULT_OTP_PARAMS.algorithm,
    digits: item.digits ?? DEFAULT_OTP_PARAMS.digits,
    period: item.period ?? DEFAULT_OTP_PARAMS.period,
    counter: item.counter ?? 0,
    note: item.note ?? '',
    // A stored icon that no longer passes validation is dropped rather than
    // rendered: the field is the one place user-supplied markup could reach the
    // DOM, and a vault can arrive from a backup or another device.
    icon: isStoredIcon(item.icon) ? item.icon : null,
    groupId: item.groupId ?? null,
    favorite: item.favorite ?? false,
    domains: item.domains ?? [],
    createdAt: item.createdAt ?? now,
    updatedAt: item.updatedAt ?? now,
    deletedAt: item.deletedAt ?? null,
    rev: item.rev ?? 1,
    syncedRev: item.syncedRev ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Mutations. All are pure: they return new data, leaving the input alone, so
// the UI layer can diff and the sync layer can compare before/after.
// ---------------------------------------------------------------------------

export function itemFromUri(parsed: ParsedOtpUri, domains: string[] = []): VaultItem {
  const now = Date.now();
  return {
    id: newId(),
    type: parsed.type,
    issuer: parsed.issuer,
    label: parsed.label,
    secret: parsed.secret,
    algorithm: parsed.algorithm,
    digits: parsed.digits,
    period: parsed.period,
    counter: parsed.counter,
    note: '',
    icon: null,
    groupId: null,
    favorite: false,
    domains,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    rev: 1,
    syncedRev: 0,
  };
}

export function addItem(data: VaultData, item: VaultItem): VaultData {
  return { ...data, items: [...data.items, item] };
}

/**
 * `updatedAt`, `rev` and `syncedRev` are excluded from the patch on purpose.
 * They are bookkeeping this function owns: it stamps the real time and bumps
 * the revision. Accepting them would let a caller pass a value that is then
 * silently overwritten — and a timestamp that quietly does nothing is the sort
 * of thing that only shows up as two devices disagreeing months later.
 */
export function updateItem(
  data: VaultData,
  id: string,
  patch: Partial<Omit<VaultItem, 'id' | 'rev' | 'createdAt' | 'updatedAt' | 'syncedRev'>>,
): VaultData {
  return {
    ...data,
    items: data.items.map((item) =>
      item.id === id ? { ...item, ...patch, updatedAt: Date.now(), rev: item.rev + 1 } : item,
    ),
  };
}

/** Soft delete: the tombstone is what lets other devices learn about the removal. */
export function deleteItem(data: VaultData, id: string): VaultData {
  return updateItem(data, id, { deletedAt: Date.now() });
}

export function restoreItem(data: VaultData, id: string): VaultData {
  return updateItem(data, id, { deletedAt: null });
}

/** Drop tombstones the server has already seen and that are older than `maxAgeMs`. */
export function purgeTombstones(data: VaultData, maxAgeMs = 90 * 24 * 60 * 60 * 1000): VaultData {
  const cutoff = Date.now() - maxAgeMs;
  return {
    ...data,
    items: data.items.filter(
      (item) => item.deletedAt === null || item.deletedAt > cutoff || item.rev > item.syncedRev,
    ),
  };
}

export function advanceHotpCounter(data: VaultData, id: string): VaultData {
  const item = data.items.find((candidate) => candidate.id === id);
  if (!item || item.type !== 'hotp') return data;
  return updateItem(data, id, { counter: item.counter + 1 });
}

export function updateSettings(data: VaultData, patch: Partial<VaultSettings>): VaultData {
  return { ...data, settings: { ...data.settings, ...patch } };
}

export function updateAccount(data: VaultData, patch: Partial<VaultData['account']>): VaultData {
  return { ...data, account: { ...data.account, ...patch } };
}

export function addGroup(data: VaultData, name: string, color: string | null = null): VaultData {
  const group: Group = {
    id: newId(),
    name: name.trim() || 'Untitled group',
    color,
    order: data.groups.length,
    updatedAt: Date.now(),
    deletedAt: null,
    rev: 1,
    syncedRev: 0,
  };
  return { ...data, groups: [...data.groups, group] };
}

export function updateGroup(
  data: VaultData,
  id: string,
  patch: Partial<Pick<Group, 'name' | 'color' | 'order' | 'deletedAt'>>,
): VaultData {
  return {
    ...data,
    groups: data.groups.map((group) =>
      group.id === id ? { ...group, ...patch, updatedAt: Date.now(), rev: group.rev + 1 } : group,
    ),
  };
}

/**
 * Remove a group. Its accounts are moved out of it, never deleted with it — a
 * click that tidies up a label must not take two-factor codes with it.
 */
export function deleteGroup(data: VaultData, id: string): VaultData {
  const withoutMembers = {
    ...data,
    items: data.items.map((item) =>
      item.groupId === id
        ? { ...item, groupId: null, updatedAt: Date.now(), rev: item.rev + 1 }
        : item,
    ),
  };
  return updateGroup(withoutMembers, id, { deletedAt: Date.now() });
}

export function moveGroup(data: VaultData, id: string, direction: -1 | 1): VaultData {
  const ordered = liveGroups(data);
  const index = ordered.findIndex((group) => group.id === id);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= ordered.length) return data;

  const reordered = [...ordered];
  [reordered[index], reordered[target]] = [reordered[target]!, reordered[index]!];

  const positions = new Map(reordered.map((group, position) => [group.id, position]));
  return {
    ...data,
    groups: data.groups.map((group) => {
      const position = positions.get(group.id);
      return position === undefined || position === group.order
        ? group
        : { ...group, order: position, updatedAt: Date.now(), rev: group.rev + 1 };
    }),
  };
}

export function liveGroups(data: VaultData): Group[] {
  return data.groups
    .filter((group) => group.deletedAt === null)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export interface ItemSection {
  /** `null` is the implicit section for accounts in no group. */
  id: string | null;
  name: string;
  color: string | null;
  items: VaultItem[];
}

/**
 * Split items into their groups, in the user's order, with everything
 * ungrouped last. Empty groups are dropped: a heading with nothing under it is
 * noise in a list read at a glance.
 */
export function sectionItems(data: VaultData, items: VaultItem[]): ItemSection[] {
  const sections: ItemSection[] = liveGroups(data).map((group) => ({
    id: group.id,
    name: group.name,
    color: group.color,
    items: [],
  }));
  const byId = new Map(sections.map((section) => [section.id, section]));
  const ungrouped: ItemSection[] = [{ id: null, name: 'Ungrouped', color: null, items: [] }];

  for (const item of items) {
    const section = item.groupId ? byId.get(item.groupId) : undefined;
    (section ?? ungrouped[0]!).items.push(item);
  }

  return [...sections, ...ungrouped].filter((section) => section.items.length > 0);
}

/** Live (non-deleted) items only — what every UI surface should render. */
export function liveItems(data: VaultData): VaultItem[] {
  return data.items.filter((item) => item.deletedAt === null);
}

/**
 * The code that signs in to this vault's own Keyrook account, when it is kept
 * here. The account page's setup link names it as the issuer Keyrook and the
 * account's address, so that is what is looked for.
 */
export function accountCodeItem(data: VaultData): VaultItem | null {
  const email = data.account.email?.trim().toLowerCase();
  if (!email) return null;
  return (
    liveItems(data).find(
      (item) => item.issuer.trim().toLowerCase() === 'keyrook' && item.label.trim().toLowerCase() === email,
    ) ?? null
  );
}

export function sortItems(items: VaultItem[], mode: VaultSettings['sortBy']): VaultItem[] {
  const sorted = [...items];

  if (mode === 'name') {
    sorted.sort((a, b) =>
      `${a.issuer} ${a.label}`.localeCompare(`${b.issuer} ${b.label}`, undefined, {
        sensitivity: 'base',
      }),
    );
  } else {
    // Order added. `createdAt` rather than array position, so an import or a
    // sync that arrives out of order still lands where the user expects.
    sorted.sort((a, b) => a.createdAt - b.createdAt);
  }

  // Favourites float to the top of whatever ordering is in force.
  return sorted.sort((a, b) => Number(b.favorite) - Number(a.favorite));
}

/**
 * Labels that act as a second-level suffix, where the name that identifies the
 * site sits one label further left: `vcb.com.vn`, `bbc.co.uk`. A full public
 * suffix list would be more correct and far heavier than this is worth.
 */
const SECOND_LEVEL_SUFFIXES = new Set([
  'com', 'co', 'net', 'org', 'gov', 'edu', 'ac', 'or', 'ne', 'in', 'go', 'mil',
]);

/** The label a person would call the site: "github", "vcb", "bbc". */
export function brandLabel(hostname: string): string {
  const labels = hostname.toLowerCase().replace(/^www\./, '').split('.').filter(Boolean);
  if (labels.length < 2) return labels[0] ?? '';

  const candidate = labels[labels.length - 2]!;
  if (labels.length >= 3 && SECOND_LEVEL_SUFFIXES.has(candidate)) {
    return labels[labels.length - 3]!;
  }
  return candidate;
}

/**
 * Whether filling this account's code into `hostname` deserves a warning.
 *
 * A code typed into a lookalike site is the mistake this app is best placed to
 * catch, because it is the one party that knows which site the account belongs
 * to. But it only knows when a domain was actually recorded: an account with
 * none says nothing about where it belongs, and a warning that fires on
 * everything is a warning nobody reads.
 *
 * Pure and separate from the UI on purpose — it is a security decision, so it
 * gets tests rather than living inside a component's `if`.
 */
export function shouldWarnBeforeFilling(item: VaultItem, hostname: string | null): boolean {
  if (!hostname) return false;
  if (item.domains.length === 0) return false;
  // Only the recorded domains count here. The issuer heuristic behind
  // `itemMatchesHost` is a convenience for ordering a list; letting a guess
  // silence a phishing warning is exactly backwards.
  return !hostUnderRecordedDomain(item, hostname);
}

/**
 * Whether `hostname` is a site the account explicitly records.
 *
 * Exact, or a subdomain of one that is not somebody else's site — no guessing.
 * This is what a security decision is allowed to rely on.
 */
export function hostUnderRecordedDomain(item: VaultItem, hostname: string): boolean {
  return item.domains.some((domain) => coversHost(domain, hostname));
}

/**
 * True when the item is plausibly for `hostname` — drives autofill suggestions.
 *
 * The issuer fallback matches a decorated *issuer* ("Google Workspace" on
 * google.com) but never a decorated *domain*. The reverse test —
 * "does the hostname contain the issuer" — is what makes `github-login.com`
 * look like GitHub, and a phishing page that gets the right account floated to
 * the top of the list is worse than one the list ignores.
 */
export function itemMatchesHost(item: VaultItem, hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, '');
  if (!host) return false;
  if (hostUnderRecordedDomain(item, hostname)) return true;
  // On someone's site at webflow.io the label is "webflow", which names the
  // platform, not the page's author: a Webflow account must not rise there.
  if (writtenByOthers(host)) return false;

  const issuer = item.issuer.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!issuer) return false;
  const brand = brandLabel(host).replace(/[^a-z0-9]/g, '');
  return brand.length > 2 && (brand === issuer || issuer.startsWith(brand));
}

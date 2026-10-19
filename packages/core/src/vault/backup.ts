import {
  deriveKek,
  generateDataKey,
  type KdfParams,
  newKdfParams,
  openJson,
  type SealedBox,
  sealJson,
  unwrapDataKey,
  wrapDataKey,
} from '@keyrook/account';
import { isMigrationUri, parseMigrationUri } from '../otp/migration.js';
import { DEFAULT_OTP_PARAMS } from '../otp/types.js';
import { buildOtpUri, parseOtpUri } from '../otp/uri.js';
import { canonicalSecret, isValidBase32 } from '../util/base32.js';
import { utf8 } from '../util/bytes.js';
import { newId } from '../util/id.js';
import type { Group, VaultItem } from './model.js';
import { itemFromUri, normalizeItem } from './vault.js';

export const BACKUP_FORMAT = 'authx.backup';
export const BACKUP_VERSION = 1;

/**
 * Bounds on a file somebody else may have written.
 *
 * A backup is the one thing a user is invited to accept from outside, and it
 * arrives before any password is typed. None of these stop a break-in; they
 * stop a file that wastes the machine instead.
 */
export const MAX_BACKUP_BYTES = 16 * 1024 * 1024;

/**
 * PBKDF2 cost the importer will agree to.
 *
 * The count comes from inside the file, so a hostile one can ask for a billion
 * rounds and the tab spends the afternoon on it. Ten million is roughly ten
 * seconds — far above the 600,000 this app writes, and low enough that a
 * malicious file is an annoyance rather than a lockup.
 */
export const MAX_BACKUP_KDF_ITERATIONS = 10_000_000;

/**
 * A portable, encrypted backup. Deliberately independent of the vault file: it
 * carries its own salt and its own password so a user can hand a backup to a
 * second device without revealing their master password.
 */
export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  version: number;
  id: string;
  app: string;
  createdAt: number;
  kdf: KdfParams;
  wrappedKey: SealedBox;
  payload: SealedBox;
}

interface BackupPayload {
  items: VaultItem[];
  groups: Group[];
}

function backupAad(id: string, version: number): Uint8Array {
  return utf8(`authx.backup:v${version}:${id}`);
}

export async function exportEncryptedBackup(
  items: VaultItem[],
  groups: Group[],
  password: string,
  appName = 'Keyrook Authenticator',
): Promise<BackupFile> {
  if (password.length < 8) throw new Error('Backup password must be at least 8 characters.');

  const id = newId();
  const kdf = newKdfParams();
  const kek = await deriveKek(password, kdf);
  const dataKey = await generateDataKey();
  const payload: BackupPayload = {
    items: items.filter((item) => item.deletedAt === null),
    groups: groups.filter((group) => group.deletedAt === null),
  };

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    id,
    app: appName,
    createdAt: Date.now(),
    kdf,
    wrappedKey: await wrapDataKey(kek, dataKey),
    payload: await sealJson(dataKey, payload, backupAad(id, BACKUP_VERSION)),
  };
}

export function isBackupFile(value: unknown): value is BackupFile {
  if (typeof value !== 'object' || value === null) return false;
  const file = value as Partial<BackupFile>;
  return file.format === BACKUP_FORMAT && typeof file.id === 'string' && !!file.payload;
}

/**
 * Checks the parts of a backup that are read *before* any password is typed.
 *
 * Everything here is attacker-chosen: the file may have been mailed to the
 * user by anyone. Validating it up front means a malformed one produces a
 * message rather than a hang or a crash deep in the crypto.
 */
export function assertUsableBackup(file: BackupFile): void {
  if (!isBackupFile(file)) throw new Error('This file is not a Keyrook Authenticator backup.');
  if (file.version > BACKUP_VERSION) {
    throw new Error('This backup was made by a newer version of the app.');
  }
  if (file.kdf?.algorithm !== 'PBKDF2-SHA256') {
    throw new Error('This backup uses an encryption method this version does not know.');
  }
  if (
    !Number.isInteger(file.kdf.iterations) ||
    file.kdf.iterations < 100_000 ||
    file.kdf.iterations > MAX_BACKUP_KDF_ITERATIONS
  ) {
    throw new Error('This backup asks for an unreasonable amount of work to open. Ignoring it.');
  }
  if (typeof file.kdf.salt !== 'string' || file.kdf.salt.length > 512) {
    throw new Error('This backup is malformed.');
  }
  if (typeof file.payload?.ct !== 'string' || typeof file.wrappedKey?.ct !== 'string') {
    throw new Error('This backup is malformed.');
  }
}

export async function importEncryptedBackup(
  file: BackupFile,
  password: string,
): Promise<BackupPayload> {
  assertUsableBackup(file);
  const kek = await deriveKek(password, file.kdf);
  const dataKey = await unwrapDataKey(kek, file.wrappedKey);
  const payload = await openJson<BackupPayload>(dataKey, file.payload, backupAad(file.id, file.version));

  // The decrypted contents came out of somebody else's file. Being encrypted
  // says who wrote it, not that what they wrote is well formed.
  return {
    items: sanitiseImportedItems(Array.isArray(payload?.items) ? payload.items : []),
    groups: Array.isArray(payload?.groups) ? payload.groups : [],
  };
}

/**
 * Brings imported accounts up to the shape the rest of the app assumes.
 *
 * `itemFromUri` already produces clean items, but a decrypted backup is raw
 * JSON: fields may be missing, wrong types, or values the OTP code will throw
 * on later. Anything unusable is dropped here rather than becoming an account
 * that shows six dashes forever.
 *
 * Sync bookkeeping is reset too — an import is a local change this device has
 * never pushed, whatever the file claimed.
 */
export function sanitiseImportedItems(incoming: readonly Partial<VaultItem>[]): VaultItem[] {
  const seen = new Set<string>();
  const clean: VaultItem[] = [];

  for (const raw of incoming) {
    if (!raw || typeof raw !== 'object') continue;

    const item = normalizeItem(raw);
    // A secret that will not decode is an account that can never produce a
    // code. Better to say it was skipped than to store a dud.
    if (!isValidBase32(item.secret)) continue;
    if (item.digits < 6 || item.digits > 10) item.digits = DEFAULT_OTP_PARAMS.digits;
    if (!Number.isFinite(item.period) || item.period <= 0) item.period = DEFAULT_OTP_PARAMS.period;
    if (!Number.isInteger(item.counter) || item.counter < 0) item.counter = 0;

    // Two items sharing an id break every lookup that keys on it.
    if (seen.has(item.id)) item.id = newId();
    seen.add(item.id);

    clean.push({ ...item, deletedAt: null, rev: 1, syncedRev: 0 });
  }

  return clean;
}

/**
 * Plain-text export as `otpauth://` URIs — the universal interchange format,
 * readable by Aegis, 2FAS, Raivo and the rest. Unencrypted by construction;
 * callers must warn the user before writing this to disk.
 */
export function exportPlainUris(items: VaultItem[]): string {
  return exportable(items)
    .map((item) => buildOtpUri(item))
    .join('\n');
}

/**
 * The live accounts another app can take: every format carries the key, and
 * an account without one — an empty entry an older build restored — has
 * nothing to carry. Left in, it threw and took the whole export with it.
 */
function exportable(items: VaultItem[]): VaultItem[] {
  return items.filter((item) => item.deletedAt === null && isValidBase32(item.secret));
}

/**
 * Aegis's plain vault format — the file interchange most authenticators read:
 * Aegis itself, 2FAS, Ente, Proton Authenticator and others import it. Groups
 * go with it, so a move keeps its headings. Unencrypted, like the text export.
 *
 * Aegis identifies entries and groups by UUID; fresh ones are minted for the
 * file, since nothing on the other side refers back to ours.
 */
export function exportAegisJson(items: VaultItem[], groups: Group[]): string {
  const live = exportable(items);
  const groupUuid = new Map(
    groups
      .filter((group) => group.deletedAt === null && live.some((item) => item.groupId === group.id))
      .map((group) => [group.id, { uuid: crypto.randomUUID(), name: group.name }]),
  );
  const entries = live.map((item) => ({
    type: item.type,
    uuid: crypto.randomUUID(),
    name: item.label,
    issuer: item.issuer,
    note: item.note,
    favorite: item.favorite,
    icon: null,
    info:
      item.type === 'hotp'
        ? { secret: canonicalSecret(item.secret), algo: item.algorithm, digits: item.digits, counter: item.counter }
        : { secret: canonicalSecret(item.secret), algo: item.algorithm, digits: item.digits, period: item.period },
    groups: item.groupId && groupUuid.has(item.groupId) ? [groupUuid.get(item.groupId)!.uuid] : [],
  }));
  return JSON.stringify(
    {
      version: 1,
      header: { slots: null, params: null },
      db: { version: 3, entries, groups: [...groupUuid.values()] },
    },
    null,
    2,
  );
}

/**
 * Bitwarden's unencrypted export: each account a login whose `totp` is its
 * setup link, ready for the password manager's "Bitwarden (json)" import.
 * Groups become folders, and the sites an account fills on become the login's
 * URIs, so Bitwarden offers the code in the same places this extension did.
 * Unencrypted, like the other readable exports.
 */
export function exportBitwardenJson(items: VaultItem[], groups: Group[]): string {
  const live = exportable(items);
  const folderId = new Map(
    groups
      .filter((group) => group.deletedAt === null && live.some((item) => item.groupId === group.id))
      .map((group) => [group.id, { id: crypto.randomUUID(), name: group.name }]),
  );
  const entries = live.map((item) => ({
    id: crypto.randomUUID(),
    organizationId: null,
    folderId: (item.groupId && folderId.get(item.groupId)?.id) ?? null,
    type: 1,
    reprompt: 0,
    name: item.issuer || item.label || 'Account',
    notes: item.note || null,
    favorite: item.favorite,
    login: {
      fido2Credentials: [],
      uris: item.domains.map((domain) => ({ match: null, uri: `https://${domain}` })),
      username: item.label || null,
      password: null,
      totp: buildOtpUri(item),
    },
    collectionIds: null,
    creationDate: new Date(item.createdAt).toISOString(),
    revisionDate: new Date(item.updatedAt).toISOString(),
    deletedDate: null,
  }));
  return JSON.stringify({ encrypted: false, folders: [...folderId.values()], items: entries }, null, 2);
}

export interface ImportResult {
  items: VaultItem[];
  /** One entry per line that could not be read, with the reason. */
  errors: { line: string; reason: string }[];
}

/**
 * Import from pasted text. Accepts `otpauth://` URIs one per line and Google
 * Authenticator's `otpauth-migration://` export payloads, mixed freely.
 */
export function importFromText(text: string): ImportResult {
  const items: VaultItem[] = [];
  const errors: ImportResult['errors'] = [];

  if (text.length > MAX_BACKUP_BYTES) {
    return { items, errors: [{ line: '', reason: 'That file is too large to read.' }] };
  }

  for (const rawLine of text.split(/[\r\n]+/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    try {
      if (isMigrationUri(line)) {
        for (const parsed of parseMigrationUri(line).items) items.push(itemFromUri(parsed));
      } else {
        items.push(itemFromUri(parseOtpUri(line)));
      }
    } catch (error) {
      errors.push({
        line: line.length > 60 ? `${line.slice(0, 60)}…` : line,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { items, errors };
}

/** Skip entries already present, comparing by secret + account rather than id. */
export function dedupeAgainst(existing: VaultItem[], incoming: VaultItem[]): {
  fresh: VaultItem[];
  duplicates: VaultItem[];
} {
  const seen = new Set(
    existing
      .filter((item) => item.deletedAt === null)
      .map((item) => `${item.secret}|${item.issuer.toLowerCase()}|${item.label.toLowerCase()}`),
  );

  const fresh: VaultItem[] = [];
  const duplicates: VaultItem[] = [];
  for (const item of incoming) {
    const key = `${item.secret}|${item.issuer.toLowerCase()}|${item.label.toLowerCase()}`;
    if (seen.has(key)) {
      duplicates.push(item);
    } else {
      seen.add(key);
      fresh.push(item);
    }
  }
  return { fresh, duplicates };
}

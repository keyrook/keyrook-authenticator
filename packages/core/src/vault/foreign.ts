/**
 * Reading what other authenticator apps export, so moving here takes one file
 * rather than every account added again by hand. The formats are each app's
 * own; the test files are the ones Aegis keeps for its importers (GPL-3.0),
 * which hold the same accounts in every format.
 *
 * Everything here is untrusted input, encrypted or not — being locked with a
 * password says who wrote a file, not that it is well formed. Key-derivation
 * settings that come from the file are bounded before anything runs, every
 * entry goes through the same checks as a pasted otpauth:// link, and an entry
 * that cannot become a working account is listed as skipped, with the reason.
 */
import { DecryptionError } from '@keyrook/account';
import { scrypt } from '../crypto/scrypt.js';
import { base32Encode, isValidBase32 } from '../util/base32.js';
import { concatBytes, fromBase64, fromHex, fromUtf8, utf8 } from '../util/bytes.js';
import { DEFAULT_OTP_PARAMS, type OtpAlgorithm } from '../otp/types.js';
import { asSteamGuard, isSteamIssuer, parseOtpUri, parseSteamLink, type ParsedOtpUri } from '../otp/uri.js';
import { MAX_BACKUP_KDF_ITERATIONS, type ImportResult } from './backup.js';
import { itemFromUri } from './vault.js';

export type ForeignApp =
  | 'aegis'
  | '2fas'
  | 'andotp'
  | 'bitwarden'
  | 'freeotp'
  | 'proton'
  | 'ente'
  | 'authenticator'
  | 'steamdesktop';

/** Each app as its own users know it. Product names, so never translated. */
export const FOREIGN_APP_NAMES: Record<ForeignApp, string> = {
  aegis: 'Aegis',
  '2fas': '2FAS',
  andotp: 'andOTP',
  bitwarden: 'Bitwarden',
  freeotp: 'FreeOTP+',
  proton: 'Proton Authenticator',
  ente: 'Ente Auth',
  authenticator: 'Authenticator (authenticator.cc)',
  steamdesktop: 'Steam Desktop Authenticator',
};

/** A file from another app, recognised and ready to read. */
export interface ForeignImport {
  app: ForeignApp;
  /** Locked with a password set in that app, which `read` needs. */
  needsPassword: boolean;
  /** Throws `DecryptionError` for a wrong password. */
  read(password?: string): Promise<ImportResult>;
}

// --- Bounds on what a file may ask of this device ---------------------------

/** Aegis's own default is N = 2^15, r = 8, p = 1: 32 MiB, about a second. */
const MAX_SCRYPT_BYTES = 256 * 1024 * 1024;
const MAX_SCRYPT_P = 16;

const tooCostly = (): never => {
  throw new Error('This backup asks for an unreasonable amount of work to open. Ignoring it.');
};

const lockedBeyondUs = (): never => {
  throw new Error(
    'This export is locked with a password Keyrook Authenticator cannot open. Export it again without a password.',
  );
};

// --- Turning one entry into an account ---------------------------------------

export interface EntryFields {
  type: unknown;
  /** Base32, or bytes to be encoded as base32. */
  secret: unknown;
  issuer?: unknown;
  label?: unknown;
  algorithm?: unknown;
  digits?: unknown;
  period?: unknown;
  counter?: unknown;
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

function algorithmOf(value: unknown): OtpAlgorithm {
  if (value === undefined || value === null || value === '') return DEFAULT_OTP_PARAMS.algorithm;
  const name = String(value).toUpperCase().replace(/^HMAC/, '').replace('-', '');
  if (name === 'SHA1' || name === 'SHA256' || name === 'SHA512') return name;
  throw new Error(`Unsupported algorithm: ${String(value)}`);
}

function wholeNumber(value: unknown, fallback: number, field: string, min: number, max: number): number {
  if (value === undefined || value === null || value === '') return fallback;
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(number) || number < min || number > max) throw new Error(`Invalid ${field}: ${String(value)}`);
  return number;
}

/** One entry from another app's export as an otpauth:// link would give it, checked the same way. */
export function parsedFrom(fields: EntryFields): ParsedOtpUri {
  const type = text(fields.type).toLowerCase();
  if (type !== 'totp' && type !== 'hotp' && type !== 'steam') throw new Error(`Unsupported OTP type: ${type || 'none'}`);

  const secret =
    fields.secret instanceof Uint8Array
      ? base32Encode(fields.secret)
      : text(fields.secret).replace(/[\s-]/g, '').replace(/=+$/, '').toUpperCase();
  if (!secret) throw new Error('Secret is empty');
  if (!isValidBase32(secret)) throw new Error('The "secret" parameter is not valid base32');

  // Before the checks on digits: Steam Guard's five would not pass them, and
  // whatever the file says of its settings, they are Steam's.
  if (type === 'steam' || (type === 'totp' && isSteamIssuer(text(fields.issuer)))) {
    return asSteamGuard({ ...DEFAULT_OTP_PARAMS, secret, issuer: text(fields.issuer), label: text(fields.label) });
  }

  return {
    type,
    secret,
    algorithm: algorithmOf(fields.algorithm),
    digits: wholeNumber(fields.digits, DEFAULT_OTP_PARAMS.digits, 'digits', 6, 10),
    period: wholeNumber(fields.period, DEFAULT_OTP_PARAMS.period, 'period', 1, 86_400),
    counter: wholeNumber(fields.counter, 0, 'counter', 0, Number.MAX_SAFE_INTEGER),
    issuer: text(fields.issuer),
    label: text(fields.label),
  };
}

/** An entry, and the sites it was saved for — where the code is offered and may be filled. */
export type ReadEntry = ParsedOtpUri & { domains?: string[] };

/** Every entry, each read on its own: one bad one costs only itself. */
export function collect<T>(
  entries: readonly T[],
  read: (entry: T) => ReadEntry,
  name: (entry: T) => string,
): ImportResult {
  const result: ImportResult = { items: [], errors: [] };
  for (const entry of entries) {
    try {
      const parsed = read(entry);
      result.items.push(itemFromUri(parsed, parsed.domains ?? []));
    } catch (error) {
      const line = name(entry) || '—';
      result.errors.push({
        line: line.length > 60 ? `${line.slice(0, 60)}…` : line,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return result;
}

const record = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

export const nameOf = (issuer: unknown, label: unknown) => [text(issuer), text(label)].filter(Boolean).join(': ');

/**
 * The site a password manager saved a login for, as the one domain an account
 * records — so its code is offered there, and the fill shortcut may use it.
 * Only a web address counts; anything else records nothing.
 */
export function siteOf(address: string): string[] {
  const value = address.trim().split(/[\s,]+/)[0] ?? '';
  if (!value) return [];
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return [];
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    return host.includes('.') ? [host] : [];
  } catch {
    return [];
  }
}

// --- Decryption ---------------------------------------------------------------

async function aesGcm(key: Uint8Array, nonce: Uint8Array, sealed: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey('raw', key as BufferSource, 'AES-GCM', false, ['decrypt']);
  try {
    return new Uint8Array(
      await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce as BufferSource }, cryptoKey, sealed as BufferSource),
    );
  } catch {
    throw new DecryptionError('That password does not open this file.');
  }
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number, hash: 'SHA-1' | 'SHA-256'): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', utf8(password) as BufferSource, 'PBKDF2', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash, salt: salt as BufferSource, iterations }, key, 256));
}

function parseJson(bytes: Uint8Array): unknown {
  try {
    return JSON.parse(fromUtf8(bytes));
  } catch {
    throw new Error('This backup is malformed.');
  }
}

// --- Aegis ---------------------------------------------------------------------

interface AegisSlot {
  type?: unknown;
  key?: unknown;
  key_params?: { nonce?: unknown; tag?: unknown };
  n?: unknown;
  r?: unknown;
  p?: unknown;
  salt?: unknown;
}

function readAegisEntries(db: unknown): ImportResult {
  const entries = record(db).entries;
  if (!Array.isArray(entries)) throw new Error('This backup is malformed.');
  return collect(
    entries.map(record),
    (entry) => {
      const info = record(entry.info);
      return parsedFrom({
        type: entry.type,
        secret: info.secret,
        issuer: entry.issuer,
        label: entry.name,
        algorithm: info.algo,
        digits: info.digits,
        period: info.period,
        counter: info.counter,
      });
    },
    (entry) => nameOf(entry.issuer, entry.name),
  );
}

async function openAegis(file: Record<string, unknown>, password: string): Promise<ImportResult> {
  const header = record(file.header);
  const params = record(header.params);
  const slots = (Array.isArray(header.slots) ? header.slots : []) as AegisSlot[];
  // Type 1 is a password; the others are a phone's fingerprint and raw keys.
  const passwordSlots = slots.filter((slot) => slot.type === 1);
  if (passwordSlots.length === 0) lockedBeyondUs();

  let masterKey: Uint8Array | null = null;
  for (const slot of passwordSlots) {
    const n = Number(slot.n);
    const r = Number(slot.r);
    const p = Number(slot.p);
    if (![n, r, p].every(Number.isInteger) || n < 2 || r < 1 || p < 1) throw new Error('This backup is malformed.');
    if (p > MAX_SCRYPT_P || 128 * r * n > MAX_SCRYPT_BYTES) tooCostly();
    const derived = await scrypt(utf8(password), fromHex(String(slot.salt ?? '')), { n, r, p, length: 32 });
    try {
      masterKey = await aesGcm(
        derived,
        fromHex(String(slot.key_params?.nonce ?? '')),
        concatBytes(fromHex(String(slot.key ?? '')), fromHex(String(slot.key_params?.tag ?? ''))),
      );
      break;
    } catch (error) {
      if (!(error instanceof DecryptionError)) throw error;
    }
  }
  if (!masterKey) throw new DecryptionError('That password does not open this file.');

  const db = await aesGcm(
    masterKey,
    fromHex(String(params.nonce ?? '')),
    concatBytes(fromBase64(String(file.db)), fromHex(String(params.tag ?? ''))),
  );
  return readAegisEntries(parseJson(db));
}

// --- 2FAS ------------------------------------------------------------------------

const TWOFAS_ITERATIONS = 10_000;

function readTwoFasServices(services: unknown): ImportResult {
  if (!Array.isArray(services)) throw new Error('This backup is malformed.');
  return collect(
    services.map(record),
    (service) => {
      const otp = record(service.otp);
      return parsedFrom({
        type: otp.tokenType ?? 'TOTP',
        secret: service.secret,
        // The name someone gave the service in 2FAS, as Aegis reads it.
        issuer: text(service.name) || otp.issuer,
        label: otp.account,
        algorithm: otp.algorithm,
        digits: otp.digits,
        period: otp.period,
        counter: otp.counter,
      });
    },
    (service) => nameOf(service.name, record(service.otp).account),
  );
}

async function openTwoFas(sealed: string, password: string): Promise<ImportResult> {
  const [data, salt, iv] = sealed.split(':');
  if (!data || !salt || !iv) throw new Error('This backup is malformed.');
  const key = await pbkdf2(password, fromBase64(salt), TWOFAS_ITERATIONS, 'SHA-256');
  return readTwoFasServices(parseJson(await aesGcm(key, fromBase64(iv), fromBase64(data))));
}

// --- andOTP --------------------------------------------------------------------------

function readAndOtp(entries: unknown): ImportResult {
  if (!Array.isArray(entries)) throw new Error('This backup is malformed.');
  return collect(
    entries.map(record),
    (entry) => {
      // Older andOTP files wrote "Issuer - account" into the label alone.
      let issuer = text(entry.issuer);
      let label = text(entry.label);
      if (!('issuer' in entry)) {
        const parts = label.split(' - ');
        if (parts.length > 1) [issuer, label] = [parts[0]!, parts.slice(1).join(' - ')];
      }
      return parsedFrom({
        type: entry.type,
        secret: entry.secret,
        issuer,
        label,
        algorithm: entry.algorithm,
        digits: entry.digits,
        period: entry.period,
        counter: entry.counter,
      });
    },
    (entry) => nameOf(entry.issuer, entry.label),
  );
}

/** andOTP's encrypted file: iterations, salt, nonce, then the sealed JSON. */
async function openAndOtp(bytes: Uint8Array, password: string): Promise<ImportResult> {
  const iterations = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, false);
  const key = await pbkdf2(password, bytes.slice(4, 16), iterations, 'SHA-1');
  return readAndOtp(parseJson(await aesGcm(key, bytes.slice(16, 28), bytes.slice(28))));
}

// --- Plain formats ---------------------------------------------------------------

function readBitwarden(items: unknown[]): ImportResult {
  const withCodes = items.map(record).filter((item) => text(record(item.login).totp));
  return collect(
    withCodes,
    (item) => {
      const login = record(item.login);
      const totp = text(login.totp);
      const firstUri = Array.isArray(login.uris) ? text(record(login.uris[0]).uri) : '';
      const domains = siteOf(firstUri);
      if (/^steam:\/\//i.test(totp)) {
        return { ...parseSteamLink(totp), issuer: text(item.name), label: text(login.username), domains };
      }
      if (/^otpauth:\/\//i.test(totp)) {
        const parsed = parseOtpUri(totp);
        return {
          ...parsed,
          issuer: parsed.issuer || text(item.name),
          label: parsed.label || text(login.username),
          domains,
        };
      }
      // Bitwarden also keeps a bare key, with everything else at its default.
      return { ...parsedFrom({ type: 'totp', secret: totp, issuer: item.name, label: login.username }), domains };
    },
    (item) => nameOf(item.name, record(item.login).username),
  );
}

function readFreeOtp(tokens: unknown[]): ImportResult {
  return collect(
    tokens.map(record),
    (token) => {
      const bytes = Array.isArray(token.secret) ? Uint8Array.from(token.secret as number[], (byte) => byte & 0xff) : null;
      if (!bytes) throw new Error('Secret is empty');
      const type = text(token.type).toLowerCase();
      return parsedFrom({
        // FreeOTP+ keeps Steam Guard as a TOTP issued by "Steam", which
        // parsedFrom reads as Steam's.
        type,
        secret: bytes,
        issuer: token.issuerExt,
        label: token.label,
        algorithm: token.algo,
        digits: token.digits,
        period: token.period,
        // FreeOTP keeps the counter of the code it last showed, and steps it
        // before showing the next. Taken as it is, the first code here would
        // be one the service has already accepted, and refuses.
        counter: typeof token.counter === 'number' ? token.counter + 1 : 0,
      });
    },
    (token) => nameOf(token.issuerExt, token.label),
  );
}

function readProton(entries: unknown[]): ImportResult {
  return collect(
    entries.map(record),
    (entry) => {
      const uri = text(record(entry.content).uri);
      if (/^steam:\/\//i.test(uri)) {
        return { ...parseSteamLink(uri), issuer: 'Steam', label: text(record(entry.content).name) };
      }
      const parsed = parseOtpUri(uri);
      return { ...parsed, label: parsed.label || text(record(entry.content).name) };
    },
    (entry) => text(record(entry.content).name),
  );
}

function readAuthenticatorExtension(data: Record<string, unknown>): ImportResult {
  const entries = Object.values(data)
    .map(record)
    .filter((entry) => typeof entry.secret === 'string' && typeof entry.type === 'string');
  return collect(
    entries,
    (entry) => {
      const type = text(entry.type).toLowerCase();
      // "hex" and "hhex" are TOTP and HOTP with the key written in hex.
      const hex = type === 'hex' || type === 'hhex';
      if (type === 'battle') throw new Error(`Unsupported OTP type: ${type}`);
      return parsedFrom({
        type: hex ? (type === 'hex' ? 'totp' : 'hotp') : type,
        secret: hex ? fromHex(text(entry.secret)) : entry.secret,
        issuer: entry.issuer,
        label: entry.account,
        algorithm: entry.algorithm,
        digits: entry.digits,
        period: entry.period,
        counter: entry.counter,
      });
    },
    (entry) => nameOf(entry.issuer, entry.account),
  );
}

// --- Steam Desktop Authenticator ----------------------------------------------------

/**
 * Its maFiles folder: one `.maFile` per Steam account, and `manifest.json`
 * listing them. Both are needed when it encrypts the accounts with its
 * passkey, since each file's salt and IV are in the manifest, not the file.
 */
const steamFolder = () =>
  new Error(
    'Choose every file in Steam Desktop Authenticator’s maFiles folder together: manifest.json and the .maFile files beside it.',
  );

/** Its own: PBKDF2-SHA1 (.NET's Rfc2898DeriveBytes), 50,000 rounds, into AES-256-CBC. Nothing in a file sets it. */
const SDA_ITERATIONS = 50_000;

/** A file the person chose, read as text. */
export interface NamedText {
  name: string;
  text: string;
}

const isMaFileName = (name: string) => /\.mafile$/i.test(name);

function isSteamManifest(value: unknown): value is { encrypted: boolean; entries: unknown[] } {
  const manifest = record(value);
  return typeof manifest.encrypted === 'boolean' && Array.isArray(manifest.entries) && 'first_run' in manifest;
}

/** A maFile as JSON, or null when it is not — encrypted, or not a maFile at all. */
function maFileJson(text: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(text);
    return typeof record(parsed).shared_secret === 'string' ? record(parsed) : null;
  } catch {
    return null;
  }
}

/**
 * One Steam account: its Steam Guard key, and the name it signs in with.
 * The file holds more — the key that confirms trades, the revocation code,
 * a signed-in session — and none of it is read: only what makes the code.
 */
function readMaFile(account: Record<string, unknown>): ParsedOtpUri {
  let key: Uint8Array;
  try {
    key = fromBase64(text(account.shared_secret));
  } catch {
    throw new Error('This backup is malformed.');
  }
  if (key.length === 0) throw new Error('Secret is empty');
  return parsedFrom({ type: 'steam', secret: key, issuer: 'Steam', label: account.account_name });
}

const readMaFiles = (accounts: { name: string; account: Record<string, unknown> }[]) =>
  collect(
    accounts,
    ({ account }) => readMaFile(account),
    ({ name, account }) => text(account.account_name) || name,
  );

async function openMaFile(passkey: string, salt: string, iv: string, sealed: string): Promise<Record<string, unknown>> {
  let key: CryptoKey;
  let bytes: { iv: Uint8Array; sealed: Uint8Array };
  try {
    bytes = { iv: fromBase64(iv), sealed: fromBase64(sealed) };
    key = await crypto.subtle.importKey(
      'raw',
      (await pbkdf2(passkey, fromBase64(salt), SDA_ITERATIONS, 'SHA-1')) as BufferSource,
      'AES-CBC',
      false,
      ['decrypt'],
    );
  } catch {
    throw new Error('This backup is malformed.');
  }
  let plain: Uint8Array;
  try {
    plain = new Uint8Array(
      await crypto.subtle.decrypt({ name: 'AES-CBC', iv: bytes.iv as BufferSource }, key, bytes.sealed as BufferSource),
    );
  } catch {
    throw new DecryptionError('That password does not open this file.');
  }
  // CBC has no tag: a wrong passkey now and then leaves padding that looks
  // right, and then it is the text that is not a maFile.
  const account = maFileJson(fromUtf8(plain));
  if (!account) throw new DecryptionError('That password does not open this file.');
  return account;
}

/**
 * Steam Desktop Authenticator's files, if these are some: one or more
 * `.maFile`s, with its `manifest.json` when it encrypted them. Null when none
 * of the files is one of its. Throws for a set it cannot open as chosen —
 * encrypted files without the manifest, or the manifest alone — naming what
 * to choose instead.
 */
export function recogniseSteamDesktop(files: readonly NamedText[]): ForeignImport | null {
  const maFiles = files.filter((file) => isMaFileName(file.name));
  const manifestFile = files.find((file) => file.name.toLowerCase() === 'manifest.json');
  let manifest: { encrypted: boolean; entries: unknown[] } | null = null;
  try {
    const parsed: unknown = manifestFile ? JSON.parse(manifestFile.text) : null;
    if (isSteamManifest(parsed)) manifest = parsed;
  } catch {
    // Some other manifest.json: not Steam Desktop Authenticator's.
  }

  if (maFiles.length === 0) {
    if (manifest) throw steamFolder();
    return null;
  }

  // Each as JSON, or null while it is still encrypted.
  const parsed = maFiles.map((file) => ({ name: file.name, account: maFileJson(file.text) }));
  if (parsed.every((file) => file.account)) {
    return plain('steamdesktop', () => readMaFiles(parsed as { name: string; account: Record<string, unknown> }[]));
  }
  if (!manifest?.encrypted) throw steamFolder();

  const entries = manifest.entries.map(record);
  return locked('steamdesktop', async (passkey) => {
    const accounts: { name: string; account: Record<string, unknown> }[] = [];
    const missing: ImportResult['errors'] = [];
    for (const file of parsed) {
      if (file.account) {
        accounts.push({ name: file.name, account: file.account });
        continue;
      }
      const entry = entries.find((candidate) => text(candidate.filename) === file.name);
      if (!entry) {
        missing.push({ line: file.name, reason: steamFolder().message });
        continue;
      }
      const sealed = maFiles.find((candidate) => candidate.name === file.name)!.text.trim();
      accounts.push({
        name: file.name,
        account: await openMaFile(passkey, text(entry.encryption_salt), text(entry.encryption_iv), sealed),
      });
    }
    const result = readMaFiles(accounts);
    return { items: result.items, errors: [...missing, ...result.errors] };
  });
}

// --- Recognising a file ----------------------------------------------------------

const plain = (app: ForeignApp, read: () => ImportResult): ForeignImport => ({
  app,
  needsPassword: false,
  read: async () => read(),
});

const locked = (app: ForeignApp, open: (password: string) => Promise<ImportResult>): ForeignImport => ({
  app,
  needsPassword: true,
  read: async (password) => open(password ?? ''),
});

/**
 * Another app's JSON export, if this is one. Null for anything else — an
 * otpauth:// list, our own backup, a file that is none of these. Throws for a
 * file it recognises but cannot open: one locked with Argon2, which none of
 * this app's code implements, is better refused by name than misread.
 */
export function recogniseForeignExport(parsed: unknown): ForeignImport | null {
  if (Array.isArray(parsed)) {
    const first = record(parsed[0]);
    if ('secret' in first && 'type' in first && ('label' in first || 'issuer' in first)) {
      return plain('andotp', () => readAndOtp(parsed));
    }
    return null;
  }

  const file = record(parsed);

  if (file.version === 1 && 'header' in file && 'db' in file) {
    if (typeof file.db === 'string') return locked('aegis', (password) => openAegis(file, password));
    return plain('aegis', () => readAegisEntries(file.db));
  }

  if (Array.isArray(file.services) && typeof file.schemaVersion === 'number') {
    if (typeof file.servicesEncrypted === 'string') {
      const sealed = file.servicesEncrypted;
      return locked('2fas', (password) => openTwoFas(sealed, password));
    }
    return plain('2fas', () => readTwoFasServices(file.services));
  }

  if (Array.isArray(file.items) && 'encrypted' in file) {
    if (file.encrypted === true) lockedBeyondUs();
    const items = file.items;
    return plain('bitwarden', () => readBitwarden(items));
  }

  if (Array.isArray(file.tokens) && Array.isArray(file.tokenOrder)) {
    const tokens = file.tokens;
    return plain('freeotp', () => readFreeOtp(tokens));
  }

  if (Array.isArray(file.entries) && 'version' in file && file.entries.some((entry) => 'content' in record(entry))) {
    const entries = file.entries;
    return plain('proton', () => readProton(entries));
  }
  // Proton's and Ente's locked exports use Argon2.
  if (typeof file.content === 'string' && typeof file.salt === 'string' && 'version' in file) lockedBeyondUs();
  if ('kdfParams' in file && 'encryptedData' in file) lockedBeyondUs();

  // Steam Desktop Authenticator's, one file at a time: a maFile as it is
  // written unencrypted, or the manifest, which holds no account.
  if (typeof file.shared_secret === 'string' && 'account_name' in file) {
    return plain('steamdesktop', () => readMaFiles([{ name: '', account: file }]));
  }
  if (isSteamManifest(file)) throw steamFolder();

  const values = Object.values(file).map(record);
  if (values.some((value) => value.dataType === 'Key' || value.dataType === 'EncOTPStorage' || value.encrypted === true)) {
    lockedBeyondUs();
  }
  if (values.length > 0 && values.every((value) => typeof value.secret === 'string' && typeof value.hash === 'string')) {
    return plain('authenticator', () => readAuthenticatorExtension(file));
  }

  return null;
}

/**
 * andOTP's encrypted backup, which is bytes rather than JSON — recognised by
 * its name, `.json.aes`, and a header that holds a sane iteration count.
 */
export function recogniseForeignBytes(bytes: Uint8Array, fileName: string): ForeignImport | null {
  if (!/\.aes$/i.test(fileName) || bytes.length < 4 + 12 + 12 + 16 + 2) return null;
  const iterations = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, false);
  if (iterations < 1) return null;
  if (iterations > MAX_BACKUP_KDF_ITERATIONS) tooCostly();
  return locked('andotp', (password) => openAndOtp(bytes, password));
}

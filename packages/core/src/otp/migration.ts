/**
 * Decoder for `otpauth-migration://offline?data=...` — the QR code Google
 * Authenticator produces from "Transfer accounts → Export accounts".
 *
 * The payload is a protobuf message. Rather than pull in a protobuf runtime
 * (extra bundle weight and one more dependency to audit for a store review),
 * we read the handful of wire-format fields this one message uses.
 */
import { base32Decode, base32Encode } from '../util/base32.js';
import { fromBase64, fromUtf8, toBase64, utf8 } from '../util/bytes.js';
import type { OtpAlgorithm, OtpType } from './types.js';
import { asSteamGuard, isSteamIssuer, type ParsedOtpUri } from './uri.js';

const WIRE_VARINT = 0;
const WIRE_64BIT = 1;
const WIRE_LENGTH_DELIMITED = 2;
const WIRE_32BIT = 5;

class ProtoReader {
  private offset = 0;

  constructor(private readonly buf: Uint8Array) {}

  get done(): boolean {
    return this.offset >= this.buf.length;
  }

  varint(): number {
    let result = 0;
    let shift = 0;
    while (true) {
      if (this.done) throw new Error('Truncated varint');
      const byte = this.buf[this.offset++]!;
      result += (byte & 0x7f) * 2 ** shift;
      if ((byte & 0x80) === 0) return result;
      shift += 7;
      if (shift > 63) throw new Error('Varint too long');
    }
  }

  bytes(): Uint8Array {
    const length = this.varint();
    if (this.offset + length > this.buf.length) throw new Error('Truncated length-delimited field');
    const slice = this.buf.subarray(this.offset, this.offset + length);
    this.offset += length;
    return slice;
  }

  /** Advance past a field we do not care about. */
  skip(wireType: number): void {
    switch (wireType) {
      case WIRE_VARINT:
        this.varint();
        return;
      case WIRE_64BIT:
        this.offset += 8;
        return;
      case WIRE_LENGTH_DELIMITED:
        this.bytes();
        return;
      case WIRE_32BIT:
        this.offset += 4;
        return;
      default:
        throw new Error(`Unsupported protobuf wire type: ${wireType}`);
    }
  }

  tag(): { field: number; wireType: number } {
    const key = this.varint();
    return { field: key >>> 3, wireType: key & 0x07 };
  }
}

const ALGORITHM_BY_ENUM: Record<number, OtpAlgorithm> = { 1: 'SHA1', 2: 'SHA256', 3: 'SHA512' };
const DIGITS_BY_ENUM: Record<number, number> = { 1: 6, 2: 8 };
const TYPE_BY_ENUM: Record<number, OtpType> = { 1: 'hotp', 2: 'totp' };

export interface MigrationPayload {
  items: ParsedOtpUri[];
  /** Google splits large exports across several QR codes. */
  batchSize: number;
  batchIndex: number;
  /**
   * Shared by every QR of one export and different for the next. Without it a
   * code from a second export — the user backed out and started again — would
   * be counted as progress on the first, and the scan would call itself done
   * with accounts still missing. Only ever compared for equality.
   */
  batchId: number;
}

function parseOtpParameters(bytes: Uint8Array): ParsedOtpUri | null {
  const reader = new ProtoReader(bytes);
  let secret: Uint8Array | null = null;
  let label = '';
  let issuer = '';
  let algorithm: OtpAlgorithm = 'SHA1';
  let digits = 6;
  let type: OtpType = 'totp';
  let counter = 0;

  while (!reader.done) {
    const { field, wireType } = reader.tag();
    switch (field) {
      case 1:
        secret = reader.bytes();
        break;
      case 2:
        label = fromUtf8(reader.bytes());
        break;
      case 3:
        issuer = fromUtf8(reader.bytes());
        break;
      case 4:
        algorithm = ALGORITHM_BY_ENUM[reader.varint()] ?? 'SHA1';
        break;
      case 5:
        digits = DIGITS_BY_ENUM[reader.varint()] ?? 6;
        break;
      case 6:
        type = TYPE_BY_ENUM[reader.varint()] ?? 'totp';
        break;
      case 7:
        counter = reader.varint();
        break;
      default:
        reader.skip(wireType);
    }
  }

  // MD5 and other unsupported algorithms come back as null so the caller can
  // report how many entries were skipped instead of importing a broken item.
  if (!secret || secret.length === 0) return null;

  // The label often still carries "Issuer:Account" even when issuer is set.
  const separator = label.indexOf(':');
  if (separator !== -1) {
    if (!issuer) issuer = label.slice(0, separator).trim();
    label = label.slice(separator + 1).trim();
  }

  const parsed: ParsedOtpUri = {
    type,
    secret: base32Encode(secret),
    algorithm,
    digits,
    period: 30,
    counter,
    issuer,
    label,
  };
  // Google's format has no Steam Guard, so a Steam account in it was kept as
  // six digits that Steam never took. See isSteamIssuer.
  return type === 'totp' && isSteamIssuer(issuer) ? asSteamGuard(parsed) : parsed;
}

export function isMigrationUri(uri: string): boolean {
  return /^otpauth-migration:\/\//i.test(uri.trim());
}

export function parseMigrationUri(uri: string): MigrationPayload {
  const trimmed = uri.trim();
  if (!isMigrationUri(trimmed)) throw new Error('Not an otpauth-migration:// URI');

  const dataParam = new URL(trimmed).searchParams.get('data');
  if (!dataParam) throw new Error('Migration URI is missing the "data" parameter');

  const reader = new ProtoReader(fromBase64(dataParam));
  const items: ParsedOtpUri[] = [];
  let batchSize = 1;
  let batchIndex = 0;
  let batchId = 0;

  while (!reader.done) {
    const { field, wireType } = reader.tag();
    switch (field) {
      case 1: {
        const parsed = parseOtpParameters(reader.bytes());
        if (parsed) items.push(parsed);
        break;
      }
      case 3:
        batchSize = reader.varint();
        break;
      case 4:
        batchIndex = reader.varint();
        break;
      case 5:
        batchId = reader.varint();
        break;
      default:
        reader.skip(wireType);
    }
  }

  return { items, batchSize, batchIndex, batchId };
}

// --- Encoding: the other direction -------------------------------------------

/** What an export to Google Authenticator needs of an account. */
export type MigrationSource = Pick<
  ParsedOtpUri,
  'type' | 'secret' | 'algorithm' | 'digits' | 'period' | 'counter' | 'issuer' | 'label'
>;

export interface MigrationExport<T extends MigrationSource> {
  /** One `otpauth-migration://` URI per QR code, to be scanned in order. */
  uris: string[];
  /**
   * Accounts the format cannot carry, and why. Google's payload has no field
   * for the period and only enumerates six or eight digits; sending one of
   * these anyway would import an account that produces the wrong codes.
   */
  skipped: { item: T; reason: string }[];
}

const ENUM_BY_ALGORITHM: Record<OtpAlgorithm, number> = { SHA1: 1, SHA256: 2, SHA512: 3 };
const ENUM_BY_DIGITS: Record<number, number> = { 6: 1, 8: 2 };

class ProtoWriter {
  private readonly out: number[] = [];

  private varint(value: number): void {
    let rest = value;
    while (rest > 0x7f) {
      this.out.push((rest % 128) | 0x80);
      rest = Math.floor(rest / 128);
    }
    this.out.push(rest);
  }

  number(field: number, value: number): this {
    this.varint((field << 3) | WIRE_VARINT);
    this.varint(value);
    return this;
  }

  bytes(field: number, value: Uint8Array): this {
    this.varint((field << 3) | WIRE_LENGTH_DELIMITED);
    this.varint(value.length);
    for (const byte of value) this.out.push(byte);
    return this;
  }

  done(): Uint8Array {
    return Uint8Array.from(this.out);
  }
}

/**
 * Google Authenticator's "Transfer accounts" codes, made here: each URI is
 * one QR its "Import accounts" scanner reads, and the importers of Aegis,
 * 2FAS, Ente and Proton Authenticator read the same format.
 *
 * Batches stay small because a QR code's capacity is not the limit that
 * matters: a phone camera has to read it off a laptop screen, and a dense code
 * fails there long before it runs out of room.
 */
export function encodeMigrationUris<T extends MigrationSource>(
  items: readonly T[],
  { batchSize = 8, batchId = randomBatchId() }: { batchSize?: number; batchId?: number } = {},
): MigrationExport<T> {
  const skipped: MigrationExport<T>['skipped'] = [];
  const carried = items.filter((item) => {
    if (item.type === 'steam') {
      skipped.push({ item, reason: 'Google Authenticator cannot make Steam Guard codes.' });
      return false;
    }
    if (item.type === 'totp' && item.period !== 30) {
      skipped.push({ item, reason: `Google Authenticator only keeps 30-second codes; this one uses ${item.period}.` });
      return false;
    }
    if (ENUM_BY_DIGITS[item.digits] === undefined) {
      skipped.push({ item, reason: `Google Authenticator only keeps 6- or 8-digit codes; this one has ${item.digits}.` });
      return false;
    }
    return true;
  });

  const batches = Math.max(1, Math.ceil(carried.length / batchSize));
  const uris: string[] = [];
  for (let index = 0; index < batches && carried.length > 0; index++) {
    const payload = new ProtoWriter();
    for (const item of carried.slice(index * batchSize, (index + 1) * batchSize)) {
      const parameters = new ProtoWriter()
        .bytes(1, base32Decode(item.secret))
        .bytes(2, utf8(item.label || item.issuer))
        .bytes(3, utf8(item.issuer))
        .number(4, ENUM_BY_ALGORITHM[item.algorithm])
        .number(5, ENUM_BY_DIGITS[item.digits]!)
        .number(6, item.type === 'hotp' ? 1 : 2);
      if (item.type === 'hotp') parameters.number(7, item.counter);
      payload.bytes(1, parameters.done());
    }
    payload.number(2, 1).number(3, batches).number(4, index).number(5, batchId);
    uris.push(`otpauth-migration://offline?data=${encodeURIComponent(toBase64(payload.done()))}`);
  }
  return { uris, skipped };
}

/** Distinct per export, so a scanner never mixes two exports' codes. */
function randomBatchId(): number {
  const [value] = crypto.getRandomValues(new Uint32Array(1));
  return value! & 0x7fffffff;
}

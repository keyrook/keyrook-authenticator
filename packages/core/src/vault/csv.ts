/**
 * Two-factor keys out of a password manager's CSV export: Apple Passwords,
 * 1Password, Bitwarden, KeePassXC, Proton Pass, LastPass, Dashlane and the
 * rest each write a spreadsheet with a column for the code — an otpauth:// link
 * or a bare key — beside the passwords.
 *
 * Only that column is read. The passwords sit in the same rows, in the clear,
 * and are never looked at, kept or passed on; a row with no key is someone's
 * password, not a two-factor account, and is left out without a word.
 */
import { parseOtpUri, parseSteamLink } from '../otp/uri.js';
import type { ImportResult } from './backup.js';
import { collect, nameOf, parsedFrom, siteOf, type ReadEntry } from './foreign.js';

/** Column names, compared with case, spaces and punctuation taken out. */
const key = (header: string) => header.toLowerCase().replace(/[^a-z0-9]/g, '');

const CODE_COLUMNS = ['otpauth', 'totp', 'logintotp', 'otp', 'otpsecret', 'otpurl', 'onetimepassword', 'totpsecret', 'twofactorsecret', 'mfa', '2fa'];
const NAME_COLUMNS = ['title', 'name', 'issuer', 'service'];
const USER_COLUMNS = ['username', 'loginusername', 'login', 'email', 'user', 'account'];
const SITE_COLUMNS = ['url', 'loginuri', 'website', 'uri', 'urls', 'web', 'site'];

/**
 * RFC 4180: fields in double quotes may hold commas, newlines and doubled
 * quotes. Excel in much of Europe separates with semicolons instead, so the
 * separator is whichever of the two the first line uses more of.
 */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^﻿/, '');
  const firstLine = text.slice(0, text.search(/\r?\n|$/));
  const separator = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i]!;
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field === '') {
      quoted = true;
    } else if (char === separator) {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ''));
}

const column = (headers: string[], names: readonly string[]) => headers.findIndex((header) => names.includes(header));

/**
 * The two-factor accounts in a CSV export, or null when this is not one — no
 * header names a code column, and no cell holds an otpauth:// link — so the
 * caller can read it as a plain list of links instead.
 */
export function readCsvExport(text: string): ImportResult | null {
  const rows = parseCsv(text);
  if (rows.length < 2) return null;
  const headers = rows[0]!.map(key);
  const code = column(headers, CODE_COLUMNS);
  const hasLinks = rows.some((cells) => cells.some((cell) => /^\s*otpauth:\/\//i.test(cell)));
  // A list of links, one per line, is not a spreadsheet just because a label
  // holds a comma: a code column, or more than one column, is what makes it one.
  if (code === -1 && !(hasLinks && rows[0]!.length > 1)) return null;

  const name = column(headers, NAME_COLUMNS);
  const user = column(headers, USER_COLUMNS);
  const site = column(headers, SITE_COLUMNS);
  const cell = (cells: string[], index: number) => (index >= 0 ? (cells[index] ?? '').trim() : '');

  // Only rows that carry a key: everything else is a password, not an account.
  const withKeys = rows.slice(1).filter((cells) => {
    if (cell(cells, code)) return true;
    return cells.some((value) => /^\s*otpauth:\/\//i.test(value));
  });

  return collect(
    withKeys,
    (cells): ReadEntry => {
      const title = cell(cells, name);
      const account = cell(cells, user);
      const domains = siteOf(cell(cells, site));
      const link = cells.find((value) => /^\s*otpauth:\/\//i.test(value))?.trim();
      if (link) {
        const parsed = parseOtpUri(link);
        return { ...parsed, issuer: parsed.issuer || title, label: parsed.label || account, domains };
      }
      const value = cell(cells, code);
      if (/^steam:\/\//i.test(value)) return { ...parseSteamLink(value), issuer: title, label: account, domains };
      // A bare key: everything else at the defaults nearly every service uses.
      return { ...parsedFrom({ type: 'totp', secret: value, issuer: title, label: account }), domains };
    },
    (cells) => nameOf(cell(cells, name), cell(cells, user)),
  );
}

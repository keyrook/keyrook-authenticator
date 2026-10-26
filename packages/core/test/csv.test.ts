import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseCsv, readCsvExport } from '../src/vault/csv.js';

/**
 * Password managers' CSV exports: each keeps the code in a column of its own
 * beside the passwords. The headers are the ones each app writes; Bitwarden's
 * file is the one Aegis tests its own importer with.
 */
const GITHUB = 'otpauth://totp/GitHub:octocat?secret=JBSWY3DPEHPK3PXP&issuer=GitHub';
const GOOGLE = 'otpauth://totp/Google:me%40gmail.com?secret=MZXW6YTBOIQWY3DPEB3W64TMMQ&issuer=Google';

describe('a password manager’s CSV', () => {
  it('reads Apple Passwords, keeps the site, and leaves passwords-only rows out without a word', () => {
    const csv = [
      'Title,URL,Username,Password,Notes,OTPAuth',
      `github.com (octocat),https://github.com/login,octocat,hunter2,,${GITHUB}`,
      'bank.example (me),https://bank.example,me,s3cret,"a note, with a comma",',
      `"Google, personal",https://accounts.google.com,me@gmail.com,pw,"two\nlines",${GOOGLE}`,
    ].join('\n');
    const result = readCsvExport(csv)!;
    expect(result.errors).toEqual([]);
    // The passwords in the same rows are not in anything it hands back.
    expect(JSON.stringify(result)).not.toMatch(/hunter2|s3cret/);
    expect(result.items.map((item) => [item.issuer, item.label, item.domains])).toEqual([
      ['GitHub', 'octocat', ['github.com']],
      ['Google', 'me@gmail.com', ['accounts.google.com']],
    ]);
  });

  it('reads 1Password, KeePassXC and Proton Pass, whose columns are named their own way', () => {
    for (const csv of [
      `Title,Url,Username,Password,OTPAuth,Favorite,Archived,Tags,Notes\nGitHub,https://github.com,octocat,pw,${GITHUB},false,false,,`,
      `"Group","Title","Username","Password","URL","Notes","TOTP","Icon","Last Modified","Created"\n"Root","GitHub","octocat","pw","https://github.com","","${GITHUB}","0","",""`,
      `type,name,url,email,username,password,note,totp,createTime,modifyTime,vault\nlogin,GitHub,https://github.com,,octocat,pw,,${GITHUB},1,1,Personal`,
    ]) {
      const result = readCsvExport(csv)!;
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({ issuer: 'GitHub', label: 'octocat', secret: 'JBSWY3DPEHPK3PXP', domains: ['github.com'] });
    }
  });

  it('takes a bare key, as LastPass and Dashlane keep it, under the login’s own name', () => {
    const lastpass = readCsvExport('url,username,password,totp,extra,name,grouping,fav\nhttps://github.com,octocat,pw,jbsw y3dp ehpk 3pxp,,GitHub,,0')!;
    expect(lastpass.items[0]).toMatchObject({ issuer: 'GitHub', label: 'octocat', secret: 'JBSWY3DPEHPK3PXP', type: 'totp', digits: 6, period: 30 });

    const dashlane = readCsvExport('username,username2,username3,title,password,note,url,category,otpSecret\noctocat,,,GitHub,pw,,github.com,,JBSWY3DPEHPK3PXP')!;
    expect(dashlane.items[0]).toMatchObject({ issuer: 'GitHub', domains: ['github.com'] });
  });

  it('reads Bitwarden’s own CSV, its Steam Guard code included', () => {
    const file = readFileSync(resolve(import.meta.dirname, 'fixtures/foreign/bitwarden.csv'), 'utf8');
    const result = readCsvExport(file)!;
    expect(result.items.map((item) => item.issuer)).toEqual(['Deno', 'SPDX', 'Airbnb', 'Test 4']);
    expect(result.items[3]).toMatchObject({ type: 'steam', secret: 'JRZCL47CMXVOQMNPZR2F7J4RGI', digits: 5 });
    expect(result.errors).toEqual([]);
  });

  it('reads a semicolon-separated sheet, as European Excel saves one, with a byte-order mark', () => {
    const result = readCsvExport(`﻿Title;Username;OTPAuth\r\nGitHub;octocat;${GITHUB}\r\n`)!;
    expect(result.items[0]).toMatchObject({ issuer: 'GitHub', label: 'octocat' });
  });

  it('lists a key that cannot work as skipped, rather than an account that shows no code', () => {
    const result = readCsvExport('name,username,totp\nBroken,me,not a key!\nGitHub,octocat,JBSWY3DPEHPK3PXP')!;
    expect(result.items).toHaveLength(1);
    expect(result.errors).toEqual([{ line: 'Broken: me', reason: 'The "secret" parameter is not valid base32' }]);
  });

  it('leaves a list of links, and any other text, to be read as what it is', () => {
    expect(readCsvExport(`${GITHUB}\n${GOOGLE}`)).toBeNull();
    expect(readCsvExport('otpauth://totp/Doe, John?secret=JBSWY3DPEHPK3PXP\n')).toBeNull();
    expect(readCsvExport('just some text, with a comma\nand another line')).toBeNull();
    expect(readCsvExport('Title,Username,Password\nbank,me,pw')).toBeNull();
  });

  it('parses quoted fields, doubled quotes and newlines inside them', () => {
    expect(parseCsv('a,"b ""quoted"", here","multi\nline"\n1,2,3')).toEqual([
      ['a', 'b "quoted", here', 'multi\nline'],
      ['1', '2', '3'],
    ]);
  });
});

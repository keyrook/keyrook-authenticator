import { beforeAll, describe, expect, it } from 'vitest';
import { newKdfParams, scorePassword } from '@keyrook/account';
import { DecryptionError } from '@keyrook/account';
import {
  accountCodeItem,
  addItem,
  brandLabel,
  createVault,
  deleteItem,
  deviceKeyring,
  itemFromUri,
  itemMatchesHost,
  liveItems,
  passphraseKeyring,
  purgeTombstones,
  readPayload,
  restoreItem,
  rewrapVault,
  sealVault,
  shouldWarnBeforeFilling,
  sortItems,
  unlockVault,
  unlockVaultWithPassword,
  updateAccount,
  updateItem,
  updateSettings,
  verifyPassword,
  type UnlockedVault,
} from '../src/vault/vault.js';
import { parseOtpUri } from '../src/otp/uri.js';
import type { VaultItem } from '../src/vault/model.js';

const PASSWORD = 'correct horse battery staple';
// The lowest iteration count the KDF will accept, to keep the suite quick.
const FAST_KDF = () => newKdfParams(100_000);

const passwordVault = (password = PASSWORD) =>
  passphraseKeyring(password, FAST_KDF()).then((keyring) => createVault(keyring));

/** Mirrors the extension's device key: non-extractable, wrap/unwrap only. */
async function deviceKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
    'wrapKey',
    'unwrapKey',
  ]);
}

function sampleItem(issuer: string, label: string, domains: string[] = []): VaultItem {
  return itemFromUri(
    parseOtpUri(`otpauth://totp/${issuer}:${label}?secret=JBSWY3DPEHPK3PXP&issuer=${issuer}`),
    domains,
  );
}

describe('vault lifecycle', () => {
  let vault: UnlockedVault;

  beforeAll(async () => {
    vault = await passwordVault();
  });

  it('starts empty with default settings', () => {
    expect(vault.data.items).toHaveLength(0);
    expect(vault.data.settings.autoLockMinutes).toBe(15);
    expect(vault.data.sync.serverRev).toBe(0);
  });

  it('refuses a password shorter than 8 characters', async () => {
    await expect(passphraseKeyring('short', FAST_KDF())).rejects.toThrow(/at least 8/);
  });

  it('records how the vault is protected', () => {
    expect(vault.file.protection.mode).toBe('passphrase');
    expect(vault.file.protection.kdf).not.toBeNull();
  });

  it('stores nothing readable in the envelope', () => {
    const serialized = JSON.stringify(vault.file);
    expect(serialized).not.toContain('JBSWY3DPEHPK3PXP');
    expect(serialized).not.toContain(PASSWORD);
  });

  it('round-trips items through seal and unlock', async () => {
    const withItems = addItem(vault.data, sampleItem('GitHub', 'octocat'));
    const sealed = await sealVault(vault.file, vault.dataKey, withItems);

    const reopened = await unlockVaultWithPassword(sealed, PASSWORD);
    expect(liveItems(reopened.data)).toHaveLength(1);
    expect(reopened.data.items[0]!.secret).toBe('JBSWY3DPEHPK3PXP');
  });

  it('rejects the wrong password', async () => {
    await expect(unlockVaultWithPassword(vault.file, 'not the password')).rejects.toBeInstanceOf(
      DecryptionError,
    );
    expect(await verifyPassword(vault.file, PASSWORD)).toBe(true);
    expect(await verifyPassword(vault.file, 'nope')).toBe(false);
  });

  it('reopens with the in-memory data key alone', async () => {
    const data = await readPayload(vault.file, vault.dataKey);
    expect(data.schemaVersion).toBe(vault.data.schemaVersion);
  });

  it('changes the master password without touching the payload', async () => {
    const rotated = await rewrapVault(
      vault.file,
      vault.dataKey,
      await passphraseKeyring('a brand new secret', FAST_KDF()),
    );

    await expect(unlockVaultWithPassword(rotated, PASSWORD)).rejects.toBeInstanceOf(
      DecryptionError,
    );
    const reopened = await unlockVaultWithPassword(rotated, 'a brand new secret');
    expect(reopened.data.schemaVersion).toBe(vault.data.schemaVersion);
    // The ciphertext is untouched; only the wrapped key changed.
    expect(rotated.payload).toEqual(vault.file.payload);
    expect(rotated.protection.wrappedKey).not.toEqual(vault.file.protection.wrappedKey);
  });

  it('will not decrypt a payload lifted from another vault', async () => {
    const other = await passwordVault();
    const spliced = { ...vault.file, payload: other.file.payload };
    await expect(unlockVaultWithPassword(spliced, PASSWORD)).rejects.toBeInstanceOf(
      DecryptionError,
    );
  });
});

describe('the account, opened again', () => {
  it('keeps how it signs in and the keys this device pinned, and drops what is malformed', async () => {
    const vault = await passwordVault();
    const keys = { accountId: 'acc-1', root: 'root-public', rootGeneration: 2, keyGeneration: 3, sheetVerifiedAt: null };
    const signedIn = updateAccount(vault.data, { email: 'a@example.com', plan: 'synced', method: 'provider', provider: 'google', keys });
    const sealed = await sealVault(vault.file, vault.dataKey, signedIn);
    // Before this was kept, a Google account opened again was taken for one
    // with a password, and asked for a password it never had.
    expect((await readPayload(sealed, vault.dataKey)).account).toEqual(signedIn.account);

    const forged = updateAccount(vault.data, {
      method: 'magic' as never,
      provider: 'myspace' as never,
      keys: { ...keys, keyGeneration: 'three' as never },
    });
    const opened = (await readPayload(await sealVault(vault.file, vault.dataKey, forged), vault.dataKey)).account;
    expect(opened.method).toBeUndefined();
    expect(opened.provider).toBeUndefined();
    expect(opened.keys).toBeUndefined();
  });
});

describe('device protection', () => {
  it('opens with the device key and nothing else', async () => {
    const key = await deviceKey();
    const vault = await createVault(deviceKeyring(key));

    expect(vault.file.protection.mode).toBe('device');
    expect(vault.file.protection.kdf).toBeNull();

    const item = sampleItem('Figma', 'designer');
    const sealed = await sealVault(vault.file, vault.dataKey, addItem(vault.data, item));

    const reopened = await unlockVault(sealed, deviceKeyring(key));
    expect(liveItems(reopened.data)).toHaveLength(1);

    // A different device key is simply the wrong key.
    await expect(unlockVault(sealed, deviceKeyring(await deviceKey()))).rejects.toBeInstanceOf(
      DecryptionError,
    );
  });

  it('reports no password to verify against', async () => {
    const vault = await createVault(deviceKeyring(await deviceKey()));
    expect(await verifyPassword(vault.file, 'anything')).toBe(false);
  });

  it('upgrades from device to password protection in place', async () => {
    const key = await deviceKey();
    const vault = await createVault(deviceKeyring(key));
    const withItem = addItem(vault.data, sampleItem('Notion', 'me'));
    const sealed = await sealVault(vault.file, vault.dataKey, withItem);

    const upgraded = await rewrapVault(
      sealed,
      vault.dataKey,
      await passphraseKeyring(PASSWORD, FAST_KDF()),
    );

    expect(upgraded.protection.mode).toBe('passphrase');
    expect(upgraded.payload).toEqual(sealed.payload);
    await expect(unlockVault(upgraded, deviceKeyring(key))).rejects.toBeInstanceOf(DecryptionError);
    expect(liveItems((await unlockVaultWithPassword(upgraded, PASSWORD)).data)).toHaveLength(1);
  });

  it('downgrades from password to device protection in place', async () => {
    const vault = await passwordVault();
    const key = await deviceKey();

    const downgraded = await rewrapVault(vault.file, vault.dataKey, deviceKeyring(key));
    expect(downgraded.protection.mode).toBe('device');
    await expect(unlockVaultWithPassword(downgraded, PASSWORD)).rejects.toThrow(
      /not protected by a master password/,
    );
    expect((await unlockVault(downgraded, deviceKeyring(key))).data.schemaVersion).toBe(1);
  });
});

describe('mutations', () => {
  it('bumps rev and updatedAt on every edit', async () => {
    const { data } = await passwordVault();
    const item = sampleItem('GitLab', 'dev');
    const withItem = addItem(data, item);

    const edited = updateItem(withItem, item.id, { issuer: 'GitLab Inc' });
    const stored = edited.items[0]!;
    expect(stored.issuer).toBe('GitLab Inc');
    expect(stored.rev).toBe(item.rev + 1);
    expect(stored.syncedRev).toBe(0);
  });

  it('deletes by tombstone so the removal can be synced', async () => {
    const { data } = await passwordVault();
    const item = sampleItem('Dropbox', 'me');
    const deleted = deleteItem(addItem(data, item), item.id);

    expect(deleted.items).toHaveLength(1);
    expect(deleted.items[0]!.deletedAt).not.toBeNull();
    expect(liveItems(deleted)).toHaveLength(0);

    expect(liveItems(restoreItem(deleted, item.id))).toHaveLength(1);
  });

  it('keeps tombstones that have not been pushed yet', async () => {
    const { data } = await passwordVault();
    const item = sampleItem('Old', 'account');
    const deleted = deleteItem(addItem(data, item), item.id);

    // Unsynced: retained regardless of age.
    expect(purgeTombstones(deleted, 0).items).toHaveLength(1);

    const synced = {
      ...deleted,
      items: deleted.items.map((entry) => ({ ...entry, syncedRev: entry.rev })),
    };
    expect(purgeTombstones(synced, 0).items).toHaveLength(0);
  });

  it('merges settings rather than replacing them', async () => {
    const { data } = await passwordVault();
    const updated = updateSettings(data, { autoLockMinutes: 1 });
    expect(updated.settings.autoLockMinutes).toBe(1);
    expect(updated.settings.theme).toBe('system');
  });
});

describe('the account’s own code', () => {
  it('is found by the setup link the account page shows, and only for this account', async () => {
    const { data } = await passwordVault();
    const signedIn = updateAccount(data, { email: 'Minh@Example.com', plan: 'synced' });
    // The server's link: otpauth://totp/Keyrook%3Aminh%40example.com?...&issuer=Keyrook
    const own = itemFromUri(
      parseOtpUri('otpauth://totp/Keyrook%3Aminh%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=Keyrook&digits=6&period=30'),
    );
    const other = sampleItem('Keyrook', 'someone.else@example.com');
    expect(accountCodeItem(addItem(signedIn, other))).toBeNull();
    const withOwn = addItem(addItem(signedIn, other), own);
    expect(accountCodeItem(withOwn)?.id).toBe(own.id);
    // Deleted is not kept; signed out has no account to have a code for.
    expect(accountCodeItem(deleteItem(withOwn, own.id))).toBeNull();
    expect(accountCodeItem(updateAccount(withOwn, { email: null, plan: 'local' }))).toBeNull();
  });
});

describe('sorting and host matching', () => {
  it('floats favourites above the chosen ordering', () => {
    const a = { ...sampleItem('Zoom', 'a'), favorite: true };
    const b = sampleItem('Apple', 'b');
    const sorted = sortItems([b, a], 'name');
    expect(sorted.map((item) => item.issuer)).toEqual(['Zoom', 'Apple']);
  });

  it('matches an explicit domain, including subdomains', () => {
    const item = sampleItem('GitHub', 'octocat', ['github.com']);
    expect(itemMatchesHost(item, 'github.com')).toBe(true);
    expect(itemMatchesHost(item, 'www.github.com')).toBe(true);
    expect(itemMatchesHost(item, 'gist.github.com')).toBe(true);
    expect(itemMatchesHost(item, 'gitlab.com')).toBe(false);
  });

  it('falls back to the issuer name when no domain is set', () => {
    const item = sampleItem('Dropbox', 'me');
    expect(itemMatchesHost(item, 'www.dropbox.com')).toBe(true);
    expect(itemMatchesHost(item, 'example.com')).toBe(false);
  });

  it('allows a decorated issuer but never a decorated domain', () => {
    // "Google Workspace" on google.com is the same account; github-login.com is
    // not GitHub, and floating the right account to the top of the list on a
    // phishing page is worse than ignoring the page entirely.
    expect(itemMatchesHost(sampleItem('Google Workspace', 'me'), 'accounts.google.com')).toBe(true);
    expect(itemMatchesHost(sampleItem('GitHub', 'me'), 'github-login.com')).toBe(false);
    expect(itemMatchesHost(sampleItem('GitHub', 'me'), 'mygithub.net')).toBe(false);
    expect(itemMatchesHost(sampleItem('Dropbox', 'me'), 'dropbox-secure.com')).toBe(false);
  });

  it('does not match on a two-letter registrable name', () => {
    const item = sampleItem('X', 'me');
    expect(itemMatchesHost(item, 'ox.com')).toBe(false);
  });

  it('reads the brand label past a two-part suffix', () => {
    expect(brandLabel('github.com')).toBe('github');
    expect(brandLabel('www.github.com')).toBe('github');
    expect(brandLabel('gist.github.com')).toBe('github');
    expect(brandLabel('vcb.com.vn')).toBe('vcb');
    expect(brandLabel('online.vcb.com.vn')).toBe('vcb');
    expect(brandLabel('bbc.co.uk')).toBe('bbc');
    expect(brandLabel('localhost')).toBe('localhost');
  });

  it('matches a Vietnamese bank on its .com.vn domain', () => {
    // Before the brand-label fix this compared the issuer against "com".
    expect(itemMatchesHost(sampleItem('Vietcombank', 'me'), 'vcb.com.vn')).toBe(false);
    expect(itemMatchesHost(sampleItem('VCB', 'me'), 'vcb.com.vn')).toBe(true);
    expect(itemMatchesHost(sampleItem('Momo', 'me'), 'vcb.com.vn')).toBe(false);
  });

  it('no longer lets every .com.vn site match every issuer', () => {
    expect(itemMatchesHost(sampleItem('Comcast', 'me'), 'tiki.com.vn')).toBe(false);
  });
});

describe('scorePassword', () => {
  it('ranks a long passphrase above a short one', () => {
    expect(scorePassword('correct horse battery staple').score).toBeGreaterThan(
      scorePassword('abc12345').score,
    );
  });

  it('caps digit-only passwords', () => {
    expect(scorePassword('1234567890123456').score).toBeLessThanOrEqual(1);
  });
});

describe('an account that recorded a domain other people publish under', () => {
  // What picking these services recorded before October 2026, kept by every
  // account added then: the catalogue's fix does not reach saved accounts.
  const webflow = sampleItem('Webflow', 'me', ['webflow.io']);
  const squarespace = sampleItem('Squarespace', 'me', ['squarespace.com']);

  it('is warned about on someone’s site there', () => {
    expect(shouldWarnBeforeFilling(webflow, 'webflow-login.webflow.io')).toBe(true);
    expect(shouldWarnBeforeFilling(squarespace, 'squarespace-login.squarespace.com')).toBe(true);
  });

  it('is still at home on the operator’s own sign-in', () => {
    expect(shouldWarnBeforeFilling(squarespace, 'login.squarespace.com')).toBe(false);
  });

  it('does not rise to the top of the list there', () => {
    expect(itemMatchesHost(webflow, 'webflow-login.webflow.io')).toBe(false);
    expect(itemMatchesHost(squarespace, 'squarespace-login.squarespace.com')).toBe(false);
    expect(itemMatchesHost(squarespace, 'login.squarespace.com')).toBe(true);
  });

  it('is not floated by the platform’s name standing in for the page’s author', () => {
    // On someone's Webflow site the label is "webflow"; on github.vercel.app
    // it would be "github" if the suffix were set aside. Neither is the author.
    expect(itemMatchesHost(sampleItem('Webflow', 'me'), 'webflow-login.webflow.io')).toBe(false);
    expect(itemMatchesHost(sampleItem('GitHub', 'me'), 'github.vercel.app')).toBe(false);
    expect(itemMatchesHost(sampleItem('Vercel', 'me'), 'vercel-login.vercel.app')).toBe(false);
  });
});

describe('warning before a code is filled', () => {
  const github = sampleItem('GitHub', 'octocat', ['github.com']);

  it('says nothing on the site the account is for', () => {
    expect(shouldWarnBeforeFilling(github, 'github.com')).toBe(false);
    expect(shouldWarnBeforeFilling(github, 'www.github.com')).toBe(false);
    expect(shouldWarnBeforeFilling(github, 'gist.github.com')).toBe(false);
  });

  it('warns on a lookalike', () => {
    // The mistake this app is best placed to catch: it is the one party that
    // knows which site the account belongs to.
    expect(shouldWarnBeforeFilling(github, 'githab.com')).toBe(true);
    expect(shouldWarnBeforeFilling(github, 'github.com.evil.example')).toBe(true);
    expect(shouldWarnBeforeFilling(github, 'github-login.com')).toBe(true);
  });

  it('stays quiet when it does not actually know', () => {
    // An account with no recorded domain says nothing about where it belongs,
    // and a warning that fires on everything is a warning nobody reads.
    const anonymous = sampleItem('Internal tool', 'me');
    expect(shouldWarnBeforeFilling(anonymous, 'anything.example')).toBe(false);
    // No hostname at all — a chrome:// page, or the popup opened on its own.
    expect(shouldWarnBeforeFilling(github, null)).toBe(false);
    expect(shouldWarnBeforeFilling(github, '')).toBe(false);
  });

  it('accepts any of several recorded domains', () => {
    const many = sampleItem('Example', 'me', ['example.com', 'example.co.uk']);
    expect(shouldWarnBeforeFilling(many, 'example.co.uk')).toBe(false);
    expect(shouldWarnBeforeFilling(many, 'login.example.com')).toBe(false);
    expect(shouldWarnBeforeFilling(many, 'example.org')).toBe(true);
  });
});

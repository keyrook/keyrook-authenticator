import { describe, expect, it } from 'vitest';
import { newKdfParams } from '@keyrook/account';
import { parseOtpUri } from '../src/otp/uri.js';
import {
  addGroup,
  addItem,
  createVault,
  deleteGroup,
  itemFromUri,
  liveGroups,
  liveItems,
  moveGroup,
  passphraseKeyring,
  readPayload,
  sealVault,
  sectionItems,
  sortItems,
  updateGroup,
  updateItem,
} from '../src/vault/vault.js';
import type { VaultData, VaultItem } from '../src/vault/model.js';

const PASSWORD = 'correct horse battery staple';
const emptyVault = () =>
  passphraseKeyring(PASSWORD, newKdfParams(100_000)).then((keyring) => createVault(keyring));

function item(issuer: string, createdAt: number): VaultItem {
  return {
    ...itemFromUri(parseOtpUri(`otpauth://totp/${issuer}:me?secret=JBSWY3DPEHPK3PXP&issuer=${issuer}`)),
    createdAt,
  };
}

function withItems(data: VaultData, ...entries: VaultItem[]): VaultData {
  return entries.reduce((acc, entry) => addItem(acc, entry), data);
}

describe('ordering', () => {
  const zulip = item('Zulip', 1_000);
  const apple = item('Apple', 2_000);
  const monzo = item('Monzo', 3_000);

  it('defaults to the order they were added', async () => {
    const { data } = await emptyVault();
    expect(data.settings.sortBy).toBe('added');
    expect(sortItems([monzo, zulip, apple], 'added').map((entry) => entry.issuer)).toEqual([
      'Zulip',
      'Apple',
      'Monzo',
    ]);
  });

  it('sorts by name when asked', () => {
    expect(sortItems([monzo, zulip, apple], 'name').map((entry) => entry.issuer)).toEqual([
      'Apple',
      'Monzo',
      'Zulip',
    ]);
  });

  it('uses the creation time, not the array position', () => {
    // An import or a sync can deliver items in any order; the user's sense of
    // "the one I added first" is about when, not about where it landed.
    const shuffled = [monzo, apple, zulip];
    expect(sortItems(shuffled, 'added')[0]!.issuer).toBe('Zulip');
  });

  it('floats favourites to the top of either ordering', () => {
    const starred = { ...monzo, favorite: true };
    expect(sortItems([zulip, apple, starred], 'added')[0]!.issuer).toBe('Monzo');
    expect(sortItems([zulip, apple, starred], 'name')[0]!.issuer).toBe('Monzo');
  });

  it('carries an older sort setting forward instead of leaving it invalid', async () => {
    const vault = await emptyVault();
    for (const [legacy, expected] of [
      ['issuer', 'name'],
      ['manual', 'added'],
      ['recent', 'added'],
    ] as const) {
      const stale = { ...vault.data, settings: { ...vault.data.settings, sortBy: legacy as never } };
      const sealed = await sealVault(vault.file, vault.dataKey, stale);
      const reopened = await readPayload(sealed, vault.dataKey);
      expect(reopened.settings.sortBy, legacy).toBe(expected);
    }
  });
});

describe('groups', () => {
  it('adds them in the order they were created', async () => {
    const { data } = await emptyVault();
    const withGroups = addGroup(addGroup(data, 'Work'), 'Personal');
    expect(liveGroups(withGroups).map((group) => group.name)).toEqual(['Work', 'Personal']);
  });

  it('will not accept a blank name', async () => {
    const { data } = await emptyVault();
    expect(liveGroups(addGroup(data, '   '))[0]!.name).toBe('Untitled group');
  });

  it('renames without touching membership', async () => {
    const { data } = await emptyVault();
    const withGroup = addGroup(data, 'Work');
    const group = liveGroups(withGroup)[0]!;
    const populated = addItem(withGroup, { ...item('GitHub', 1), groupId: group.id });

    const renamed = updateGroup(populated, group.id, { name: 'Employer' });
    expect(liveGroups(renamed)[0]!.name).toBe('Employer');
    expect(liveItems(renamed)[0]!.groupId).toBe(group.id);
  });

  it('moves up and down, and stops at the ends', async () => {
    const { data } = await emptyVault();
    let working = addGroup(addGroup(addGroup(data, 'A'), 'B'), 'C');
    const [a, b] = liveGroups(working);

    working = moveGroup(working, b!.id, -1);
    expect(liveGroups(working).map((group) => group.name)).toEqual(['B', 'A', 'C']);

    // Already at the top: nothing to do, and nothing changes.
    const unchanged = moveGroup(working, b!.id, -1);
    expect(unchanged).toBe(working);
    expect(moveGroup(working, a!.id, 1).groups).not.toBe(working.groups);
  });

  it('removing a group keeps its accounts', async () => {
    const { data } = await emptyVault();
    const withGroup = addGroup(data, 'Work');
    const group = liveGroups(withGroup)[0]!;
    const populated = withItems(
      withGroup,
      { ...item('GitHub', 1), groupId: group.id },
      { ...item('Fastmail', 2), groupId: group.id },
    );

    const removed = deleteGroup(populated, group.id);

    // A click that tidies up a label must not take two-factor codes with it.
    expect(liveGroups(removed)).toHaveLength(0);
    expect(liveItems(removed)).toHaveLength(2);
    expect(liveItems(removed).every((entry) => entry.groupId === null)).toBe(true);
  });

  it('marks moved accounts as changed so the removal reaches other devices', async () => {
    const { data } = await emptyVault();
    const withGroup = addGroup(data, 'Work');
    const group = liveGroups(withGroup)[0]!;
    const synced = {
      ...addItem(withGroup, { ...item('GitHub', 1), groupId: group.id }),
    };
    synced.items = synced.items.map((entry) => ({ ...entry, syncedRev: entry.rev }));

    const removed = deleteGroup(synced, group.id);
    const moved = removed.items[0]!;
    expect(moved.rev).toBeGreaterThan(moved.syncedRev);
  });
});

describe('sections', () => {
  async function vaultWithGroups() {
    const { data } = await emptyVault();
    let working = addGroup(addGroup(data, 'Work'), 'Personal');
    const [work, personal] = liveGroups(working);
    working = withItems(
      working,
      { ...item('GitHub', 1), groupId: work!.id },
      { ...item('Monzo', 2), groupId: personal!.id },
      item('Loose', 3),
    );
    return { data: working, work: work!, personal: personal! };
  }

  it('keeps the user order and puts ungrouped last', async () => {
    const { data } = await vaultWithGroups();
    const sections = sectionItems(data, liveItems(data));
    expect(sections.map((section) => section.name)).toEqual(['Work', 'Personal', 'Ungrouped']);
    expect(sections[2]!.id).toBeNull();
  });

  it('follows a reorder', async () => {
    const { data, personal } = await vaultWithGroups();
    const reordered = moveGroup(data, personal.id, -1);
    expect(sectionItems(reordered, liveItems(reordered)).map((s) => s.name)).toEqual([
      'Personal',
      'Work',
      'Ungrouped',
    ]);
  });

  it('drops empty groups, because a heading over nothing is noise', async () => {
    const { data, work } = await vaultWithGroups();
    const emptied = updateItem(data, liveItems(data).find((i) => i.groupId === work.id)!.id, {
      groupId: null,
    });
    expect(sectionItems(emptied, liveItems(emptied)).map((s) => s.name)).toEqual([
      'Personal',
      'Ungrouped',
    ]);
  });

  it('puts an account whose group was deleted back with the ungrouped', async () => {
    const { data, work } = await vaultWithGroups();
    const removed = deleteGroup(data, work.id);
    const sections = sectionItems(removed, liveItems(removed));
    expect(sections.find((section) => section.id === null)!.items).toHaveLength(2);
  });

  it('returns one section when nothing is grouped', async () => {
    const { data } = await emptyVault();
    const flat = withItems(data, item('A', 1), item('B', 2));
    expect(sectionItems(flat, liveItems(flat))).toHaveLength(1);
  });
});

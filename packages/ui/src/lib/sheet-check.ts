/**
 * Checking that a new recovery key was saved: the person types two of its
 * groups back from what they saved. A checkbox let people go on with a key
 * they never kept, and they found out the day they forgot their password;
 * here it is found out while the key can still be shown again. The account
 * page asks the same way (keyrook-account, apps/console/src/confirm.ts).
 */

/** The key's groups of four, however it was written. */
const groupsOf = (key: string): string[] => key.replace(/[\s-]/g, '').toUpperCase().match(/.{1,4}/g) ?? [];

/** Read the way a key is read when it is used: any case, any spacing, and O, I or L for 0 and 1. */
const normalise = (typed: string): string =>
  typed.toUpperCase().replace(/[\s-]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');

const randomBelow = (n: number): number => crypto.getRandomValues(new Uint32Array(1))[0]! % n;

/** Two different groups of the key to ask for, counted from 1, in order. */
export function pickGroups(key: string, random: (n: number) => number = randomBelow): [number, number] {
  const count = groupsOf(key).length;
  if (count < 2) throw new Error('A recovery key has more than one group.');
  const first = random(count);
  let second = random(count - 1);
  if (second >= first) second += 1;
  return [Math.min(first, second) + 1, Math.max(first, second) + 1];
}

/** Whether what was typed is the key's group at `position`, counted from 1. */
export function groupMatches(key: string, position: number, typed: string): boolean {
  const group = groupsOf(key)[position - 1];
  return group !== undefined && normalise(typed) === group;
}

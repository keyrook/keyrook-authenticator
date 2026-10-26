import { describe, expect, it } from 'vitest';
import { groupMatches, pickGroups } from '../src/lib/sheet-check.js';

const KEY = 'A1B2-C3D4-E5F6-G7H8-J9K0-M1N2-P3Q4-R5S6';

describe('checking a saved recovery key', () => {
  it('asks for two different groups, in order, from every place in the key', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 400; i += 1) {
      const [first, second] = pickGroups(KEY);
      expect(first).toBeLessThan(second);
      expect(first).toBeGreaterThanOrEqual(1);
      expect(second).toBeLessThanOrEqual(8);
      seen.add(first).add(second);
    }
    expect([...seen].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('takes a group as it would be read when used, and nothing else', () => {
    expect(groupMatches(KEY, 1, 'a1b2')).toBe(true);
    expect(groupMatches(KEY, 6, ' m1n2 ')).toBe(true);
    // O for 0, I or L for 1: the slips a hand-copied sheet makes.
    expect(groupMatches(KEY, 5, 'J9KO')).toBe(true);
    expect(groupMatches(KEY, 6, 'MIN2')).toBe(true);
    expect(groupMatches(KEY, 6, 'MLN2')).toBe(true);
    // The right group in the wrong place is not the group asked for.
    expect(groupMatches(KEY, 2, 'A1B2')).toBe(false);
    expect(groupMatches(KEY, 1, 'A1B')).toBe(false);
    expect(groupMatches(KEY, 9, 'A1B2')).toBe(false);
    expect(groupMatches(KEY, 1, '')).toBe(false);
  });
});

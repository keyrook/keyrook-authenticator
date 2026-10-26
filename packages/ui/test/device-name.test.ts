import { describe, expect, it } from 'vitest';
import { asName } from '../src/lib/device-name.js';

describe('a device name someone else chose', () => {
  it('is kept as it was named', () => {
    expect(asName('Passhold · Mac')).toBe('Passhold · Mac');
    expect(asName('Chrome trên Windows')).toBe('Chrome trên Windows');
  });

  it('cannot reorder the sentence around it or hide anything in it', () => {
    // Right-to-left override: "Mac" would read as the reverse of what was sent.
    expect(asName('‮cam no emorhC')).toBe('cam no emorhC');
    expect(asName('Chrome⁦ on⁩ Mac​')).toBe('Chrome on Mac');
    expect(asName('Chrome\non\tMac\u0000')).toBe('Chrome on Mac');
  });

  it('cannot become a message of its own', () => {
    const named = asName(`Keyrook support: ${'call us now '.repeat(10)}`);
    expect(Array.from(named)).toHaveLength(48);
    expect(named.endsWith('…')).toBe(true);
    // Cut between characters, never inside one.
    expect(asName('😀'.repeat(60))).toBe(`${'😀'.repeat(47)}…`);
  });
});

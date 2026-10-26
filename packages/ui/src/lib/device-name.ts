/**
 * The name the asking device gave itself — whoever asked chose it, so it is
 * shown only as a name, in quotes: nothing that reorders the sentence around
 * it or hides in it (controls, direction marks, zero-width characters), and
 * not long enough to become a message of its own.
 */
export function asName(name: string): string {
  // Line breaks and tabs become spaces before the rest of the controls go,
  // so "Chrome\non Mac" does not run together.
  const plain = Array.from(
    name
      .replace(/\s/g, ' ')
      .replace(/[\p{Cc}\p{Cf}]/gu, '')
      .replace(/ {2,}/g, ' ')
      .trim(),
  );
  return plain.length > 48 ? `${plain.slice(0, 47).join('')}…` : plain.join('');
}

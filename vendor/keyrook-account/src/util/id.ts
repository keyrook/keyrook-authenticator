import { toHex } from './bytes.js';

/** Stable, collision-resistant id for vault items and devices. */
export function newId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return toHex(crypto.getRandomValues(new Uint8Array(16)));
}

export function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

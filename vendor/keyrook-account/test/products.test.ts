import { describe, expect, it } from 'vitest';
import { assertProductName, AUTHENTICATOR, familyProducts, PASSHOLD, productNameOf, PRODUCTS } from '../src/index.js';

/**
 * The list a person's view of the products comes from. A name here goes into
 * keys and labels the moment a product uses it, so each is held to what the
 * labels take; and nothing here may decide which key opens what.
 */
describe('the products', () => {
  it('are named as keys and labels take, each once', () => {
    for (const { id } of PRODUCTS) expect(() => assertProductName(id)).not.toThrow();
    expect(new Set(PRODUCTS.map(({ id }) => id)).size).toBe(PRODUCTS.length);
  });

  it('never include the account page, which holds no key', () => {
    expect(PRODUCTS.map(({ id }) => id)).not.toContain('console');
    expect(PRODUCTS.map(({ id }) => id)).not.toContain('root');
  });

  it('name a person’s apps in their own spelling, and keep a name this build does not know', () => {
    expect(productNameOf(AUTHENTICATOR)).toBe('Keyrook Authenticator');
    expect(productNameOf(PASSHOLD)).toBe('Passhold');
    expect(productNameOf('keyrook-send')).toBe('keyrook-send');
  });

  it('start a new family on a product that shares', () => {
    expect(familyProducts[0]).toBe(PASSHOLD);
    expect(familyProducts).not.toContain(AUTHENTICATOR);
  });
});

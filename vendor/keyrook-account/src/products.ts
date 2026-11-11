/**
 * The Keyrook products a person can meet, in one place: a new product is one
 * line here, and the rest of what it needs is on the server and in its code.
 *
 * This is what people read and what the page offers. It decides nothing about
 * a key: each product names itself with a constant in its own code
 * (keys/product.ts), and no product believes a name it was sent.
 */
import { AUTHENTICATOR, PASSHOLD } from './keys/product.js';

export interface Product {
  /** The fixed name its keys are bound to, and its records' prefix. */
  id: string;
  /** How it is named to a person, in its own spelling. */
  name: string;
  /** Whether a family shares collections of it. */
  family?: boolean;
}

export const PRODUCTS: readonly Product[] = [
  { id: AUTHENTICATOR, name: 'Keyrook Authenticator' },
  { id: PASSHOLD, name: 'Passhold', family: true },
];

/** A product's name for a person; one this build does not know keeps the name it was given. */
export const productNameOf = (id: string): string => PRODUCTS.find((product) => product.id === id)?.name ?? id;

/** The products a family shares collections of, the first of them the one a new family starts with. */
export const familyProducts: readonly string[] = PRODUCTS.filter((product) => product.family).map((product) => product.id);

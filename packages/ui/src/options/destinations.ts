/**
 * Where people move their accounts, and the quickest honest way to get them
 * there. The question a person has is "how do I get these into Microsoft
 * Authenticator", not "which of four formats is that" — so the page asks for
 * the app and answers with the one method that works best for it.
 *
 * "All at once" only where the app really imports in bulk. Microsoft
 * Authenticator, Authy, Apple's Passwords and 1Password import nothing from
 * other authenticators; for them the fastest way is one setup code after
 * another, and the page says so rather than offering a file they cannot open.
 *
 * The steps name the option to pick in each app, which is stable, rather than
 * every menu on the way to it, which is not.
 */

import type { MessageKey } from '../i18n/locales/en.js';

export type Method = 'transfer' | 'one-by-one' | 'aegis' | 'bitwarden' | 'text';

export interface Destination {
  id: string;
  name: string;
  /** Matched against the compiled-in marks, as an account's issuer would be. */
  brand: string;
  /** Everything in one go — a few codes, or one file — rather than account by account. */
  allAtOnce: boolean;
  /** Best first. */
  methods: Method[];
  /** What to do in that app, as a message key. */
  steps: MessageKey;
}

export const DESTINATIONS: Destination[] = [
  {
    id: 'google',
    name: 'Google Authenticator',
    brand: 'Google',
    allAtOnce: true,
    methods: ['transfer'],
    steps: 'dest.google.steps',
  },
  {
    id: 'microsoft',
    name: 'Microsoft Authenticator',
    brand: 'Microsoft',
    allAtOnce: false,
    methods: ['one-by-one'],
    steps: 'dest.microsoft.steps',
  },
  {
    id: 'apple',
    name: 'Apple Passwords',
    brand: 'Apple',
    allAtOnce: false,
    methods: ['one-by-one'],
    steps: 'dest.apple.steps',
  },
  {
    id: 'authy',
    name: 'Authy',
    brand: 'Authy',
    allAtOnce: false,
    methods: ['one-by-one'],
    steps: 'dest.authy.steps',
  },
  {
    id: '1password',
    name: '1Password',
    brand: '1Password',
    allAtOnce: false,
    methods: ['one-by-one'],
    steps: 'dest.1password.steps',
  },
  {
    id: 'bitwarden',
    name: 'Bitwarden',
    brand: 'Bitwarden',
    allAtOnce: true,
    methods: ['bitwarden', 'transfer'],
    steps: 'dest.bitwarden.steps',
  },
  {
    id: 'proton',
    name: 'Proton Authenticator',
    brand: 'Proton',
    allAtOnce: true,
    methods: ['transfer', 'aegis'],
    steps: 'dest.proton.steps',
  },
  {
    id: 'ente',
    name: 'Ente Auth',
    brand: 'Ente',
    allAtOnce: true,
    methods: ['transfer', 'text'],
    steps: 'dest.ente.steps',
  },
  {
    id: 'aegis',
    name: 'Aegis',
    brand: 'Aegis Authenticator',
    allAtOnce: true,
    methods: ['aegis', 'transfer'],
    steps: 'dest.aegis.steps',
  },
  {
    id: '2fas',
    name: '2FAS',
    brand: '2FAS',
    allAtOnce: true,
    methods: ['transfer', 'aegis'],
    steps: 'dest.2fas.steps',
  },
  {
    id: 'other',
    // Shown as `dest.other.name`, in the page's language.
    name: 'Another app',
    brand: '',
    allAtOnce: false,
    methods: ['one-by-one', 'transfer', 'text'],
    steps: 'dest.other.steps',
  },
];

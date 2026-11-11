import { describe, expect, it } from 'vitest';
import { isTrustedSender } from '../src/lib/messaging.js';

const ME = 'abcdefghijklmnopabcdefghijklmnop';
const MY_ORIGIN = `chrome-extension://${ME}`;

describe('who may drive the vault', () => {
  it('accepts this extension’s own pages', () => {
    // Popup and options both report the extension's origin, whether they are a
    // browser-action popup or a tab.
    expect(isTrustedSender({ id: ME, origin: MY_ORIGIN }, ME, MY_ORIGIN)).toBe(true);
  });

  it('refuses a content script, which carries the same id', () => {
    // This is the case the id check alone misses, and it is the whole reason
    // the origin is checked: the script is injected into whatever page the user
    // last opened the popup on.
    expect(isTrustedSender({ id: ME, origin: 'https://example.com' }, ME, MY_ORIGIN)).toBe(false);
    expect(isTrustedSender({ id: ME, origin: 'http://localhost:3000' }, ME, MY_ORIGIN)).toBe(false);
    expect(isTrustedSender({ id: ME, origin: 'null' }, ME, MY_ORIGIN)).toBe(false);
  });

  it('refuses another extension', () => {
    const other = 'ponmlkjihgfedcbaponmlkjihgfedcba';
    expect(isTrustedSender({ id: other, origin: `chrome-extension://${other}` }, ME, MY_ORIGIN)).toBe(false);
    // Right origin string, wrong id — and the reverse.
    expect(isTrustedSender({ id: other, origin: MY_ORIGIN }, ME, MY_ORIGIN)).toBe(false);
    expect(isTrustedSender({ id: ME, origin: `chrome-extension://${other}` }, ME, MY_ORIGIN)).toBe(false);
  });

  it('refuses a sender that reports nothing', () => {
    expect(isTrustedSender({}, ME, MY_ORIGIN)).toBe(false);
    expect(isTrustedSender({ id: ME }, ME, MY_ORIGIN)).toBe(false);
    expect(isTrustedSender({ origin: MY_ORIGIN }, ME, MY_ORIGIN)).toBe(false);
  });

  it('is not fooled by an origin that merely starts the same', () => {
    expect(isTrustedSender({ id: ME, origin: `${MY_ORIGIN}.evil.example` }, ME, MY_ORIGIN)).toBe(false);
    expect(isTrustedSender({ id: ME, origin: `https://chrome-extension://${ME}` }, ME, MY_ORIGIN)).toBe(false);
  });
});

describe('who may drive the vault, on Firefox', () => {
  // Firefox's pages are moz-extension://<a uuid each install draws>, nothing
  // like the add-on's id — so the origin is the one the browser gave this
  // install, never one built from the id.
  const ID = 'authenticator@keyrook.com';
  const OWN = 'moz-extension://5f0c2e7a-3b1d-4c9e-8a6f-2d4b7e9c1a03';

  it('accepts this extension’s pages, at the origin this install drew', () => {
    expect(isTrustedSender({ id: ID, origin: OWN }, ID, OWN)).toBe(true);
  });

  it('refuses a content script, which carries the same id from the page’s origin', () => {
    expect(isTrustedSender({ id: ID, origin: 'https://example.com' }, ID, OWN)).toBe(false);
  });

  it('refuses another extension, another install, and the Chrome origin the id would make', () => {
    expect(isTrustedSender({ id: 'other@example.com', origin: OWN }, ID, OWN)).toBe(false);
    expect(isTrustedSender({ id: ID, origin: 'moz-extension://00000000-0000-4000-8000-000000000000' }, ID, OWN)).toBe(false);
    expect(isTrustedSender({ id: ID, origin: `chrome-extension://${ID}` }, ID, OWN)).toBe(false);
    expect(isTrustedSender({ id: ID, origin: `moz-extension://${ID}` }, ID, OWN)).toBe(false);
  });

  it('refuses a sender that reports no origin', () => {
    expect(isTrustedSender({ id: ID }, ID, OWN)).toBe(false);
  });
});

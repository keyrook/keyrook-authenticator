import { describe, expect, it } from 'vitest';
import { type Host, installHost } from '../src/host.js';
import { accountPageUrl } from '../src/lib/links.js';

/** Only what a link reads: nothing here runs a page. */
const withPage = (accountPageUrl?: string) => installHost({ accountPageUrl } as Host);

describe('the account page’s links', () => {
  it('go to the official page when the app says nothing', () => {
    withPage();
    expect(accountPageUrl()).toBe('https://account.keyrook.com');
    expect(accountPageUrl('recovery')).toBe('https://account.keyrook.com/#recovery');
  });

  it('follow a build whose server has a page of its own, in every view', () => {
    withPage('https://account-staging.keyrook.com');
    expect(accountPageUrl()).toBe('https://account-staging.keyrook.com');
    for (const view of ['devices', 'signin', 'recovery', 'passkeys', 'profile', 'data', 'activity'] as const) {
      expect(accountPageUrl(view)).toBe(`https://account-staging.keyrook.com/#${view}`);
    }
  });
});

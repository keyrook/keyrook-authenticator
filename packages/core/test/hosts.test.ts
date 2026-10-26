import { describe, expect, it } from 'vitest';
import { coversHost, PUBLISHED_SUFFIXES, writtenByOthers } from '../src/vault/hosts.js';

/**
 * Each case is a page that would like to count as a service's own and be
 * filled with its code.
 */
describe('how far a domain reaches', () => {
  it('covers itself and the hosts a service spreads its sign-in across', () => {
    expect(coversHost('github.com', 'github.com')).toBe(true);
    expect(coversHost('github.com', 'www.github.com')).toBe(true);
    expect(coversHost('github.com', 'gist.github.com')).toBe(true);
    expect(coversHost('www.github.com', 'github.com')).toBe(true);
    expect(coversHost('GitHub.com', 'GIST.github.com.')).toBe(true);
  });

  it('does not reach a look-alike', () => {
    expect(coversHost('github.com', 'github.com.evil.example')).toBe(false);
    expect(coversHost('github.com', 'notgithub.com')).toBe(false);
    expect(coversHost('github.com', '')).toBe(false);
    expect(coversHost('', 'github.com')).toBe(false);
  });

  it('stops where every name beneath is somebody else’s site', () => {
    // Domains the catalogue once handed out, which accounts still record.
    expect(coversHost('webflow.io', 'paypal-login.webflow.io')).toBe(false);
    expect(coversHost('railway.app', 'login.up.railway.app')).toBe(false);
    expect(coversHost('linode.com', 'li123-45.members.linode.com')).toBe(false);
    expect(coversHost('tumblr.com', 'sign-in.tumblr.com')).toBe(false);
    expect(coversHost('wpengine.com', 'sign-in.wpengine.com')).toBe(false);
    expect(coversHost('typeform.com', 'verify.typeform.com')).toBe(false);
    expect(coversHost('frontify.com', 'algolia.frontify.com')).toBe(false);
    // However deep the page sits under that person's name.
    expect(coversHost('squarespace.com', 'a.b.sign-in.squarespace.com')).toBe(false);
  });

  it('still covers the hosts the operator keeps for itself', () => {
    expect(coversHost('squarespace.com', 'squarespace.com')).toBe(true);
    expect(coversHost('squarespace.com', 'login.squarespace.com')).toBe(true);
    expect(coversHost('squarespace.com', 'account.squarespace.com')).toBe(true);
    expect(coversHost('wpengine.com', 'identity.wpengine.com')).toBe(true);
    expect(coversHost('typeform.com', 'admin.typeform.com')).toBe(true);
    expect(coversHost('linode.com', 'login.linode.com')).toBe(true);
    // Tumblr signs in on www.tumblr.com, which is tumblr.com without "www.".
    expect(coversHost('tumblr.com', 'www.tumblr.com')).toBe(true);
  });

  it('covers one person’s site when that is what was recorded', () => {
    // Someone's own app, with two-step sign-in of its own.
    expect(coversHost('my-app.vercel.app', 'my-app.vercel.app')).toBe(true);
    expect(coversHost('my-app.vercel.app', 'api.my-app.vercel.app')).toBe(true);
    expect(coversHost('my-app.vercel.app', 'their-app.vercel.app')).toBe(false);
    expect(coversHost('li123-45.members.linode.com', 'li123-45.members.linode.com')).toBe(true);
  });
});

describe('a page somebody else wrote', () => {
  it('is any name under a suffix but the operator’s own', () => {
    expect(writtenByOthers('github-login.webflow.io')).toBe(true);
    expect(writtenByOthers('github.vercel.app')).toBe(true);
    expect(writtenByOthers('www.someone.squarespace.com')).toBe(true);
    expect(writtenByOthers('login.squarespace.com')).toBe(false);
    expect(writtenByOthers('www.tumblr.com')).toBe(false);
    expect(writtenByOthers('github.com')).toBe(false);
    expect(writtenByOthers('vercel.app')).toBe(false);
  });

  it('is someone’s site under every suffix in the list', () => {
    for (const suffix of PUBLISHED_SUFFIXES) {
      expect(writtenByOthers(`zz-someone.${suffix}`), suffix).toBe(true);
      expect(coversHost(suffix, `zz-someone.${suffix}`), suffix).toBe(false);
    }
  });
});

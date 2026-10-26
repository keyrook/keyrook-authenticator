import { describe, expect, it } from 'vitest';
import { itemForShortcutFill } from '../src/vault/autofill.js';
import { itemFromUri } from '../src/vault/vault.js';
import { parseOtpUri } from '../src/otp/uri.js';

const account = (issuer: string, domains: string[] = [], type: 'totp' | 'hotp' = 'totp') =>
  itemFromUri(
    parseOtpUri(`otpauth://${type}/${encodeURIComponent(issuer)}:me?secret=JBSWY3DPEHPK3PXP&issuer=${encodeURIComponent(issuer)}${type === 'hotp' ? '&counter=0' : ''}`),
    domains,
  );

/**
 * A shortcut fills with nobody looking at the page, so each case here is a
 * page that would like a code it should not get.
 */
describe('the account a shortcut may fill', () => {
  it('fills the one account recorded for the site, on the site and its subdomains', () => {
    const github = account('GitHub', ['github.com']);
    expect(itemForShortcutFill([github], 'github.com')).toBe(github);
    expect(itemForShortcutFill([github], 'www.github.com')).toBe(github);
    expect(itemForShortcutFill([github], 'gist.github.com')).toBe(github);
  });

  it('knows a well-known service’s own domains when the account records none', () => {
    const google = account('Google');
    expect(itemForShortcutFill([google], 'accounts.google.com')).toBe(google);
  });

  it('gives nothing to a look-alike, however the page names itself', () => {
    const github = account('GitHub', ['github.com']);
    expect(itemForShortcutFill([github], 'github.com.evil.example')).toBeNull();
    expect(itemForShortcutFill([github], 'github-login.example')).toBeNull();
    expect(itemForShortcutFill([github], 'notgithub.com')).toBeNull();
    // The issuer guess that orders the popup's list does not count here.
    const custom = account('Acmecorp');
    expect(itemForShortcutFill([custom], 'acmecorp.evil.example')).toBeNull();
  });

  it('lets a person choose when two accounts belong to the site, or none does', () => {
    const work = account('GitHub', ['github.com']);
    const home = account('GitHub', ['github.com']);
    expect(itemForShortcutFill([work, home], 'github.com')).toBeNull();
    expect(itemForShortcutFill([work], 'gitlab.com')).toBeNull();
    expect(itemForShortcutFill([work], null)).toBeNull();
  });

  it('fills Steam Guard on Steam’s sign-in pages, which the catalogue knows', () => {
    const steam = itemFromUri(parseOtpUri('otpauth://steam/Steam:gaben?secret=JBSWY3DPEHPK3PXP&issuer=Steam'));
    expect(itemForShortcutFill([steam], 'store.steampowered.com')).toBe(steam);
    expect(itemForShortcutFill([steam], 'steamcommunity.com')).toBe(steam);
  });

  it('fills where a service really signs in, not only on its best-known site', () => {
    const work = account('Microsoft');
    expect(itemForShortcutFill([work], 'login.microsoftonline.com')).toBe(work);
    const nord = account('Nord Account');
    expect(itemForShortcutFill([nord], 'my.nordaccount.com')).toBe(nord);
    const shopee = account('Shopee');
    expect(itemForShortcutFill([shopee], 'shopee.vn')).toBe(shopee);
  });

  it('gives nothing to a page a service’s own users published on its hosting', () => {
    const vercel = account('Vercel');
    expect(itemForShortcutFill([vercel], 'vercel.com')).toBe(vercel);
    expect(itemForShortcutFill([vercel], 'vercel-login.vercel.app')).toBeNull();
    const notion = account('Notion');
    expect(itemForShortcutFill([notion], 'app.notion.com')).toBe(notion);
    expect(itemForShortcutFill([notion], 'notion-login.notion.site')).toBeNull();
  });

  it('gives nothing to a site a customer runs under the service’s own domain', () => {
    // Each of these pages is written by someone else, who can mark a field as
    // a one-time code.
    const squarespace = account('Squarespace');
    expect(itemForShortcutFill([squarespace], 'login.squarespace.com')).toBe(squarespace);
    expect(itemForShortcutFill([squarespace], 'squarespace-login.squarespace.com')).toBeNull();
    expect(itemForShortcutFill([account('Webflow')], 'webflow-login.webflow.io')).toBeNull();
    expect(itemForShortcutFill([account('Railway')], 'railway-login.up.railway.app')).toBeNull();
    expect(itemForShortcutFill([account('WP Engine')], 'wpengine-login.wpengine.com')).toBeNull();
    expect(itemForShortcutFill([account('Linode')], 'li123-45.members.linode.com')).toBeNull();
    expect(itemForShortcutFill([account('Tumblr')], 'tumblr-login.tumblr.com')).toBeNull();
    expect(itemForShortcutFill([account('Algolia')], 'algolia.frontify.com')).toBeNull();
  });

  it('gives nothing there to an account that recorded the whole platform', () => {
    // Recorded before October 2026, when the catalogue held these, and kept.
    const webflow = account('Webflow', ['webflow.io']);
    expect(itemForShortcutFill([webflow], 'webflow-login.webflow.io')).toBeNull();
    const tumblr = account('Tumblr', ['www.tumblr.com']);
    expect(itemForShortcutFill([tumblr], 'tumblr-login.tumblr.com')).toBeNull();
    expect(itemForShortcutFill([tumblr], 'www.tumblr.com')).toBe(tumblr);
    const squarespace = account('Squarespace', ['squarespace.com']);
    expect(itemForShortcutFill([squarespace], 'squarespace-login.squarespace.com')).toBeNull();
    expect(itemForShortcutFill([squarespace], 'login.squarespace.com')).toBe(squarespace);
    const linode = account('Linode', ['linode.com']);
    expect(itemForShortcutFill([linode], 'li123-45.members.linode.com')).toBeNull();
    expect(itemForShortcutFill([linode], 'login.linode.com')).toBe(linode);
  });

  it('fills one person’s own app on a platform, where it was recorded', () => {
    const app = account('My app', ['my-app.vercel.app']);
    expect(itemForShortcutFill([app], 'my-app.vercel.app')).toBe(app);
    expect(itemForShortcutFill([app], 'their-app.vercel.app')).toBeNull();
  });

  it('keeps an account whose name only starts like a service off that service’s pages', () => {
    // "open" and "chat" were once OpenAI's other names; with OpenAI's domains
    // catalogued they would have filled these two on chatgpt.com.
    expect(itemForShortcutFill([account('OpenTable')], 'chatgpt.com')).toBeNull();
    expect(itemForShortcutFill([account('Chatwork')], 'chatgpt.com')).toBeNull();
    // A word cut out of a longer name did the same: "mail" out of "proton
    // mail", "cloud" out of "akamai connected cloud".
    expect(itemForShortcutFill([account('Mail.ru')], 'account.proton.me')).toBeNull();
    expect(itemForShortcutFill([account('CloudAMQP')], 'cloud.linode.com')).toBeNull();
  });

  it('leaves a counter-based code, and a deleted account, to the popup', () => {
    expect(itemForShortcutFill([account('GitHub', ['github.com'], 'hotp')], 'github.com')).toBeNull();
    const gone = { ...account('GitHub', ['github.com']), deletedAt: 1 };
    expect(itemForShortcutFill([gone], 'github.com')).toBeNull();
  });

  it('keeps an account to the sites it records, even when its service is well known', () => {
    // Recorded on a company's own sign-in page: Google's domains are not its.
    const sso = account('Google', ['sso.example.com']);
    expect(itemForShortcutFill([sso], 'accounts.google.com')).toBeNull();
    expect(itemForShortcutFill([sso], 'sso.example.com')).toBe(sso);
  });
});

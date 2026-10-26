import { describe, expect, it } from 'vitest';
import { BRANDS, domainsToRecord, matchBrand, monogramFor, searchBrands } from '../src/brand/registry.js';
import { PUBLISHED_SUFFIXES } from '../src/vault/hosts.js';

describe('matching an account to a service', () => {
  it('matches the service name as written', () => {
    expect(matchBrand('GitHub')?.slug).toBe('github');
    expect(matchBrand('github')?.slug).toBe('github');
    expect(matchBrand('  GitHub  ')?.slug).toBe('github');
  });

  it('matches punctuation and spacing however the issuer wrote it', () => {
    expect(matchBrand('Fly.io')?.slug).toBe('flydotio');
    expect(matchBrand('1Password')?.slug).toBe('1password');
    expect(matchBrand('Battle.net')?.slug).toBe('battledotnet');
    expect(matchBrand('Cash App')?.slug).toBe('cashapp');
  });

  it('matches the other names a service is issued under', () => {
    expect(matchBrand('Gmail')?.slug).toBe('google');
    expect(matchBrand('Twitter')?.slug).toBe('x');
    expect(matchBrand('Blizzard')?.slug).toBe('battledotnet');
    expect(matchBrand('ProtonMail')?.slug).toBe('proton');
    expect(matchBrand('Amazon Web Services')?.slug).toBe('aws');
  });

  it('prefers the recorded domain over the issuer string', () => {
    // The domain is where the account was actually added from; the issuer is
    // whatever the service chose to put in its QR code.
    expect(matchBrand('My work login', ['github.com'])?.slug).toBe('github');
    expect(matchBrand('', ['gist.github.com'])?.slug).toBe('github');
    expect(matchBrand('', ['www.dropbox.com'])?.slug).toBe('dropbox');
  });

  it('reads through the decoration issuers add', () => {
    expect(matchBrand('GitHub (work)')?.slug).toBe('github');
    expect(matchBrand('Cloudflare - production')?.slug).toBe('cloudflare');
    expect(matchBrand('Shopify Partners')?.slug).toBe('shopify');
  });

  it('does not let a short name swallow unrelated services', () => {
    // "X", "EA", "VK" and friends must match exactly or not at all, or every
    // account starting with those letters gets the wrong mark.
    expect(matchBrand('X')?.slug).toBe('x');
    expect(matchBrand('Xero')).toBeNull();
    expect(matchBrand('EA')?.slug).toBe('ea');
    expect(matchBrand('Easyjet')).toBeNull();
    expect(matchBrand('VK')?.slug).toBe('vk');
    expect(matchBrand('Vklopnik')).toBeNull();
  });

  it('returns nothing rather than guessing', () => {
    expect(matchBrand('Some Internal Tool')).toBeNull();
    expect(matchBrand('')).toBeNull();
    expect(matchBrand('', ['intranet.example.com'])).toBeNull();
  });
});

describe('the lettered fallback', () => {
  it('takes the first letter, upper case', () => {
    expect(monogramFor('Fastmail').letter).toBe('F');
    expect(monogramFor('  zulip').letter).toBe('Z');
    expect(monogramFor('1Password').letter).toBe('1');
  });

  it('skips leading punctuation and handles non-Latin names', () => {
    expect(monogramFor('*** internal').letter).toBe('I');
    expect(monogramFor('Ngân hàng').letter).toBe('N');
    expect(monogramFor('日本の銀行').letter).toBe('日');
    expect(monogramFor('').letter).toBe('?');
    expect(monogramFor('🔐').letter).toBe('?');
  });

  it('gives a name the same colour every time', () => {
    expect(monogramFor('Fastmail').hue).toBe(monogramFor('Fastmail').hue);
    // Recognition comes from the colour being stable, so casing and spacing
    // must not move it.
    expect(monogramFor('fastmail').hue).toBe(monogramFor('Fast mail').hue);
  });

  it('ignores accents, so one name is one colour', () => {
    // Vietnamese account names are routinely written both ways.
    expect(monogramFor('Ngân hàng').hue).toBe(monogramFor('Ngan hang').hue);
    expect(monogramFor('Café').hue).toBe(monogramFor('Cafe').hue);
  });

  it('spreads names across the whole wheel instead of clustering', () => {
    // Two names landing near each other is ordinary — 360 hues and a handful of
    // accounts collide by birthday maths, and the row's text carries the name
    // anyway. What would be a real failure is every tile coming out the same
    // family of colours.
    const quadrants = new Set(BRANDS.map((brand) => Math.floor(monogramFor(brand.name).hue / 90)));
    expect(quadrants.size).toBe(4);

    // With hundreds of services and 360 hues, repeats are arithmetic rather
    // than a flaw — what would be a real failure is the hash favouring one
    // stretch of the wheel. Over half distinct is what an even spread gives.
    const hues = BRANDS.map((brand) => monogramFor(brand.name).hue);
    expect(new Set(hues).size).toBeGreaterThan(hues.length * 0.5);
  });

  it('stays inside the colour wheel', () => {
    for (const brand of BRANDS) {
      const { hue } = monogramFor(brand.name);
      expect(hue).toBeGreaterThanOrEqual(0);
      expect(hue).toBeLessThan(360);
    }
  });
});

describe('the registry itself', () => {
  it('has no duplicate slugs', () => {
    const slugs = BRANDS.map((brand) => brand.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('resolves every entry by its own name', () => {
    for (const brand of BRANDS) {
      expect(matchBrand(brand.name)?.slug, `by name: ${brand.name}`).toBe(brand.slug);
    }
  });

  it('lets no two services claim the same website', () => {
    // A domain that resolves to the wrong service is worse than no domain:
    // autofill would then offer the wrong code on that site.
    const owners = new Map<string, string>();
    for (const brand of BRANDS) {
      for (const domain of brand.domains) {
        expect(owners.get(domain), `${domain} claimed twice`).toBeUndefined();
        owners.set(domain, brand.slug);
      }
    }
  });

  it('resolves every entry by each of its websites', () => {
    for (const brand of BRANDS) {
      for (const domain of brand.domains) {
        expect(matchBrand('', [domain])?.slug, `by domain: ${domain}`).toBe(brand.slug);
      }
    }
  });

  it('gives every Font Awesome entry a colour, since that set ships none', () => {
    for (const brand of BRANDS) {
      if (brand.source === 'font-awesome') {
        expect(brand.color, brand.slug).toMatch(/^[0-9A-F]{6}$/i);
      }
    }
  });
});

/**
 * Pinned from real sign-in pages: phish-check's evaluation of 23 October 2026
 * opened each one and compared the address it was served from with these
 * domains. A catalogued domain also decides where a shortcut fills a code with
 * nobody looking, so each one is a site the service owns and signs in on.
 */
describe('the sites services sign in on', () => {
  const service = (host: string) => matchBrand('', [host])?.slug ?? null;

  it('knows the address each sign-in page is actually served from', () => {
    expect(service('wise.com')).toBe('wise');
    expect(service('app.notion.com')).toBe('notion');
    expect(service('www.notion.so')).toBe('notion');
    expect(service('vk.ru')).toBe('vk');
    expect(service('id.vk.ru')).toBe('vk');
    expect(service('vk.com')).toBe('vk');
    expect(service('login.live.com')).toBe('microsoft');
    expect(service('login.microsoftonline.com')).toBe('microsoft');
    expect(service('claude.ai')).toBe('claude');
    expect(service('platform.claude.com')).toBe('claude');
    expect(service('my.nordaccount.com')).toBe('nordvpn');
    expect(service('www.facebook.com')).toBe('facebook');
    expect(service('www.instagram.com')).toBe('instagram');
    expect(service('chatgpt.com')).toBe('openai');
    expect(service('platform.openai.com')).toBe('openai');
    expect(service('auth.openai.com')).toBe('openai');
    expect(service('id.atlassian.com')).toBe('atlassian');
    expect(service('www.figma.com')).toBe('figma');
    expect(service('vercel.com')).toBe('vercel');
    expect(service('www.canva.com')).toBe('canva');
  });

  it('knows Shopee in every market it runs, and only those', () => {
    const markets = [
      'shopee.vn', 'shopee.co.id', 'shopee.co.th', 'shopee.com.ar', 'shopee.com.br',
      'shopee.com.mx', 'shopee.com.my', 'shopee.ph', 'shopee.sg', 'shopee.tw',
    ];
    for (const market of markets) expect(service(market), market).toBe('shopee');
    // Markets Shopee has left. A country domain nobody renews is anybody's.
    for (const gone of ['shopee.com.co', 'shopee.cl', 'shopee.pl', 'shopee.es', 'shopee.fr', 'shopee.in']) {
      expect(service(gone), gone).toBeNull();
    }
  });

  it('gives nothing to a site of the brand’s where nobody signs in', () => {
    // Wise's design system, which the icon set took for Wise's website.
    expect(service('wise.design')).toBeNull();
  });

  it('never claims the hosts where a service’s users publish their own pages', () => {
    for (const host of [
      'wise-login.vercel.app',
      'sign-in.notion.site',
      'sign-in.figma.site',
      'sign-in.my.canva.site',
      'sign-in.atlassian.net',
    ]) {
      expect(service(host), host).toBeNull();
    }
  });

  it('gives a name that only starts like OpenAI nothing of OpenAI’s', () => {
    expect(matchBrand('Chat GPT')?.slug).toBe('openai');
    expect(matchBrand('Open AI')?.slug).toBe('openai');
    expect(matchBrand('OpenTable')).toBeNull();
    expect(matchBrand('Chatwork')).toBeNull();
  });

  it('takes a Nord Account for NordVPN, whose codes it holds', () => {
    expect(matchBrand('Nord Account')?.slug).toBe('nordvpn');
    expect(matchBrand('Nordstrom')).toBeNull();
  });
});

/**
 * A catalogued domain covers every host under it, and a page there can mark a
 * field as a one-time code. So no service may own a host where someone else
 * writes the page.
 */
describe('hosts where someone other than the service publishes', () => {
  const service = (host: string) => matchBrand('', [host])?.slug ?? null;

  it('belong to no service: the hosting anyone can sign up for', () => {
    for (const host of [
      'login.github.io',
      'login.vercel.app',
      'login.netlify.app',
      'login.herokuapp.com',
      'login.pages.dev',
      'login.workers.dev',
      'login.fly.dev',
      'login.onrender.com',
      'login.web.app',
      'login.firebaseapp.com',
      'login.appspot.com',
      'login.azurewebsites.net',
      'login.blogspot.com',
      'login.wixsite.com',
      'login.myshopify.com',
      'login.notion.site',
      'login.figma.site',
      'login.my.canva.site',
      'login.framer.website',
      'login.glitch.me',
      'login.repl.co',
      'login.csb.app',
      'login.hf.space',
      'login.gitlab.io',
      // The ones the catalogue held until 24 October 2026.
      'login.webflow.io',
      'login.up.railway.app',
      'login.js.org',
      'li123-45.members.linode.com',
      'login.app.render.com',
      'login.pro.typeform.com',
      'login.eu.platform.sh',
    ]) {
      expect(service(host), host).toBeNull();
    }
  });

  it('belong to no service: a name under any suffix the matcher knows others publish under', () => {
    for (const suffix of PUBLISHED_SUFFIXES) {
      expect(service(`zz-someone.${suffix}`), suffix).toBeNull();
    }
  });

  it('reach only the sign-in host where customers’ sites share the service’s domain', () => {
    // A Squarespace site's built-in address, a WP Engine install's, and a
    // Tumblr blog, whose theme runs its owner's script.
    expect(service('login.squarespace.com')).toBe('squarespace');
    expect(service('my-site.squarespace.com')).toBeNull();
    expect(service('identity.wpengine.com')).toBe('wpengine');
    expect(service('my-install.wpengine.com')).toBeNull();
    expect(service('login.linode.com')).toBe('linode');
    expect(service('dashboard.render.com')).toBe('render');
    expect(service('admin.typeform.com')).toBe('typeform');
    expect(service('auth.api.platform.sh')).toBe('platformdotsh');
    expect(service('my-blog.tumblr.com')).toBeNull();
  });

  it('belong to no service: another company’s', () => {
    // Brand portals, a press-release host and a logo site the icon sets took
    // for these services' websites.
    for (const host of ['algolia.frontify.com', 'tripadvisor.mediaroom.com', 'cryptologos.cc', 'visualbook.pro']) {
      expect(service(host), host).toBeNull();
    }
    expect(service('dashboard.algolia.com')).toBe('algolia');
    expect(service('www.tripadvisor.com')).toBe('tripadvisor');
    expect(service('trezor.io')).toBe('trezor');
  });

  it('knows where the rest sign in, not their design, press or old sites', () => {
    expect(service('webflow.com')).toBe('webflow');
    expect(service('railway.com')).toBe('railway');
    expect(service('medium.com')).toBe('medium');
    expect(service('app.klarna.com')).toBe('klarna');
    expect(service('web.wechat.com')).toBe('wechat');
    expect(service('porkbun.com')).toBe('porkbun');
    expect(service('account.deezer.com')).toBe('deezer');
    expect(service('accounts.kakao.com')).toBe('kakao');
    expect(service('old.reddit.com')).toBe('reddit');
    expect(service('sso.godaddy.com')).toBe('godaddy');
    expect(service('replit.com')).toBe('replit');
    expect(service('login.bigcommerce.com')).toBe('bigcommerce');
    for (const host of [
      'medium.design', 'klarna.design', 'wechat.design', 'porkbun.design', 'deezerbrand.com',
      'primer.style', 'kakaocorp.com', 'redditinc.com', 'godaddy.net', 'repl.it', 'bigcommerce.co.uk',
    ]) {
      expect(service(host), host).toBeNull();
    }
  });
});

describe('other names of several words', () => {
  it('keeps each one whole', () => {
    expect(matchBrand('Electronic Arts')?.slug).toBe('ea');
    expect(matchBrand('Amazon Web Services')?.slug).toBe('aws');
    expect(matchBrand('Akamai Connected Cloud')?.slug).toBe('linode');
    expect(matchBrand('Ant Group')?.slug).toBe('alipay');
    expect(matchBrand('Internet Archive')?.slug).toBe('archivedotorg');
    expect(matchBrand('Uber Eats')?.slug).toBe('ubereats');
    expect(matchBrand('Proton Mail')?.slug).toBe('proton');
    expect(matchBrand('Apple ID')?.slug).toBe('apple');
  });

  it('lends none of its words to a service that merely starts with one', () => {
    // Each of these was once a word cut out of another service's name, and an
    // account that records no website is filled on that service's domains.
    expect(matchBrand('Mail.ru')).toBeNull();
    expect(matchBrand('Account Manager')).toBeNull();
    expect(matchBrand('CloudAMQP')).toBeNull();
    expect(matchBrand('Connected Health')).toBeNull();
    expect(matchBrand('ArtStation')).toBeNull();
    expect(matchBrand('Services Portal')).toBeNull();
    expect(matchBrand('Group Office')).toBeNull();
    expect(matchBrand('Archive Server')).toBeNull();
  });
});

describe('the websites an account added on a page records', () => {
  const brand = (slug: string) => BRANDS.find((entry) => entry.slug === slug)!;

  it('records the page’s own domain first when it is one of the service’s', () => {
    expect(domainsToRecord(brand('shopee'), 'shopee.vn')).toEqual(['shopee.vn', 'shopee.com']);
    expect(domainsToRecord(brand('microsoft'), 'login.microsoftonline.com')).toEqual([
      'microsoftonline.com',
      'microsoft.com',
    ]);
    expect(domainsToRecord(brand('vk'), 'vk.com')).toEqual(['vk.com', 'vk.ru']);
    expect(domainsToRecord(brand('notion'), 'www.notion.so')).toEqual(['notion.so', 'notion.com']);
  });

  it('takes the broadest of the service’s domains that holds the page', () => {
    expect(domainsToRecord(brand('google'), 'accounts.google.com')).toEqual(['google.com', 'accounts.google.com']);
  });

  it('records the service’s first two when no page of it is open', () => {
    expect(domainsToRecord(brand('microsoft'), null)).toEqual(['microsoft.com', 'live.com']);
    expect(domainsToRecord(brand('shopee'), 'github.com')).toEqual(['shopee.com', 'shopee.co.id']);
  });

  it('never records a look-alike page, only the service’s own domains', () => {
    for (const host of ['shopee.vn.evil.example', 'shopee-vn.example', 'evilshopee.vn', 'xn--shope-vn.example']) {
      const recorded = domainsToRecord(brand('shopee'), host);
      expect(recorded, host).toEqual(['shopee.com', 'shopee.co.id']);
    }
  });
});

describe('suggesting services as the user types', () => {
  const names = (query: string) => searchBrands(query).map((brand) => brand.name);

  it('offers nothing until something is typed', () => {
    expect(searchBrands('')).toEqual([]);
    expect(searchBrands('   ')).toEqual([]);
  });

  it('puts the obvious answer first', () => {
    expect(names('git')[0]).toBe('GitHub');
    expect(names('goo')[0]).toBe('Google');
    expect(names('drop')[0]).toBe('Dropbox');
    expect(names('cloud')[0]).toBe('Cloudflare');
  });

  it('prefers an exact name over a longer one that starts the same', () => {
    expect(names('box')[0]).toBe('Box');
    expect(names('square')[0]).toBe('Square');
    expect(names('proton')[0]).toBe('Proton');
  });

  it('finds a service under the other names it is issued as', () => {
    expect(names('gmail')).toContain('Google');
    expect(names('twitter')).toContain('X');
    expect(names('blizzard')).toContain('Battle.net');
    expect(names('outlook')).toContain('Microsoft');
  });

  it('ignores spacing, case and punctuation', () => {
    expect(names('1 password')).toContain('1Password');
    expect(names('FLY.IO')).toContain('Fly.io');
    expect(names('cash app')).toContain('Cash App');
  });

  it('matches on the domain when that is what someone typed', () => {
    expect(names('github.com')).toContain('GitHub');
    expect(names('npmjs')).toContain('npm');
  });

  it('offers several when the query is genuinely ambiguous', () => {
    const git = names('git');
    expect(git).toContain('GitHub');
    expect(git).toContain('GitLab');
  });

  it('returns nothing for a name no service has', () => {
    expect(searchBrands('zzzinternaltool')).toEqual([]);
  });

  it('respects the limit', () => {
    expect(searchBrands('a', 3)).toHaveLength(3);
  });
});

describe('AI services', () => {
  it('recognises the ones people actually have accounts with', () => {
    expect(matchBrand('OpenAI')?.slug).toBe('openai');
    // ChatGPT is OpenAI's mark, so it resolves there rather than to a tile.
    expect(matchBrand('ChatGPT')?.slug).toBe('openai');
    expect(matchBrand('Claude')?.slug).toBe('claude');
    expect(matchBrand('Anthropic')?.slug).toBe('anthropic');
    expect(matchBrand('Google Gemini')?.slug).toBe('googlegemini');
    expect(matchBrand('Perplexity')?.slug).toBe('perplexity');
    expect(matchBrand('Midjourney')?.slug).toBe('midjourney');
    expect(matchBrand('Cursor')?.slug).toBe('cursor');
    expect(matchBrand('Hugging Face')?.slug).toBe('huggingface');
  });

  it('suggests them while typing', () => {
    const names = (query: string) => searchBrands(query).map((brand) => brand.name);
    expect(names('chatg')).toContain('OpenAI');
    expect(names('open')).toContain('OpenAI');
    expect(names('clau')).toContain('Claude');
    expect(names('gpt')).toContain('OpenAI');
  });
});

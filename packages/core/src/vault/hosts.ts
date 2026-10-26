/**
 * How far a domain reaches: the one rule every site match uses — the fill
 * shortcut, the warning before a fill, the popup's ordering and the service a
 * site belongs to.
 *
 * A domain covers itself and every host under it, because that is how a service
 * spreads its sign-in: github.com covers gist.github.com. Except where somebody
 * else writes the page. Under webflow.io every name is another person's Webflow
 * site; under squarespace.com every name but Squarespace's own is a customer's.
 * A page there can mark any field as a one-time code, so a domain at or above
 * such a suffix stops at it: an account that records squarespace.com is filled
 * on login.squarespace.com and nowhere else beneath it.
 *
 * This holds for domains an account already recorded too, which a catalogue fix
 * never reaches: a Webflow account added before October 2026 recorded
 * webflow.io, and keeps it.
 *
 * A name under a suffix is still somebody's site, and an account recorded on
 * my-app.vercel.app covers my-app.vercel.app.
 */

/**
 * Suffixes under which each name is somebody else's site, with the names
 * directly under it that the operator keeps for itself.
 *
 * The public suffix list's private section (publicsuffix.org) is where a
 * company declares that its customers get names under its domain, and most of
 * these come from it. squarespace.com, wpengine.com, tumblr.com, typeform.com,
 * frontify.com and mediaroom.com it does not list; each one's own documentation
 * or pages show its customers' sites there. A suffix missing here is only as
 * open as it was before this list existed, so add from that section freely.
 */
const PUBLISHED: ReadonlyMap<string, ReadonlySet<string>> = new Map(
  Object.entries({
    // Hosts the catalogue once pointed into.
    'webflow.io': [],
    'up.railway.app': [],
    'js.org': [],
    'members.linode.com': [],
    'nodebalancer.linode.com': [],
    'app.render.com': [],
    'onrender.com': [],
    'pro.typeform.com': [],
    // A Plus account's forms are at <name>.typeform.com; Typeform signs in at
    // admin.typeform.com.
    'typeform.com': ['admin'],
    'eu.platform.sh': [],
    'us.platform.sh': [],
    'ent.platform.sh': [],
    'platformsh.site': [],
    // Every site's built-in address; Squarespace signs in at
    // login.squarespace.com, and account.squarespace.com sends there.
    'squarespace.com': ['login', 'account'],
    // An install's address before it has a domain of its own.
    'wpengine.com': ['my', 'identity'],
    'wpenginepowered.com': [],
    // Each blog runs its owner's theme script. Tumblr signs in on
    // www.tumblr.com, which is tumblr.com once "www." is set aside.
    'tumblr.com': [],
    // Brand portals and press rooms, run for each customer.
    'frontify.com': [],
    'mediaroom.com': [],
    // Hosting anyone can sign up for.
    'github.io': [],
    'gitlab.io': [],
    'codeberg.page': [],
    'vercel.app': [],
    'netlify.app': [],
    'herokuapp.com': [],
    'pages.dev': [],
    'workers.dev': [],
    'trycloudflare.com': [],
    'fly.dev': [],
    'web.app': [],
    'firebaseapp.com': [],
    'appspot.com': [],
    'azurewebsites.net': [],
    'cloudfront.net': [],
    'deno.dev': [],
    'blogspot.com': [],
    'wixsite.com': [],
    'myshopify.com': [],
    'square.site': [],
    'carrd.co': [],
    'notion.site': [],
    'figma.site': [],
    'my.canva.site': [],
    'framer.website': [],
    'framer.app': [],
    'bubbleapps.io': [],
    'repl.co': [],
    'replit.app': [],
    'replit.dev': [],
    'csb.app': [],
    'hf.space': [],
    'streamlit.app': [],
    'gitbook.io': [],
    'readthedocs.io': [],
    'surge.sh': [],
    'ngrok.app': [],
    'ngrok-free.app': [],
    'ngrok.io': [],
  }).map(([suffix, own]) => [suffix, new Set(own)]),
);

/** Every suffix above, for the tests that try one name under each. */
export const PUBLISHED_SUFFIXES: readonly string[] = [...PUBLISHED.keys()];

function bare(host: string): string {
  return host.trim().toLowerCase().replace(/\.$/, '').replace(/^www\./, '');
}

/**
 * Whether `host` is somebody else's site under a suffix that sits at or below
 * `floor` — the part of the name a domain of that length would reach through.
 */
function othersSiteWithin(host: string, floor: string): boolean {
  const labels = host.split('.');
  for (let index = 1; index < labels.length; index++) {
    const suffix = labels.slice(index).join('.');
    if (suffix.length < floor.length) break;
    const own = PUBLISHED.get(suffix);
    if (own && !own.has(labels[index - 1]!)) return true;
  }
  return false;
}

/**
 * Whether a page on `hostname` belongs to `domain`: the domain itself, or a
 * host under it that is not somebody else's site.
 */
export function coversHost(domain: string, hostname: string): boolean {
  const known = bare(domain);
  const host = bare(hostname);
  if (!known || !host) return false;
  if (host === known) return true;
  return host.endsWith(`.${known}`) && !othersSiteWithin(host, known);
}

/**
 * Whether `hostname` is somebody else's site under one of the suffixes, so
 * that the name of the platform it is on says nothing about who wrote it.
 */
export function writtenByOthers(hostname: string): boolean {
  return othersSiteWithin(bare(hostname), '');
}

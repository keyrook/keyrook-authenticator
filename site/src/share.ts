/**
 * The share page's one script, bundled into the page by scripts/render-site.mjs.
 * It reads the codes from the address — after the #, which never reaches a
 * server — and shows the one for this moment by the clock. The reading and
 * its bounds are @authx/core's, the same that made the link.
 *
 * When the link ends, the codes are dropped from memory and from the address
 * bar, so a tab left open does not keep them in its history.
 */
import { formatCode } from '../../packages/core/src/otp/totp.js';
import { readSharedCodes, sharedCodeAt, type SharedCodes } from '../../packages/core/src/otp/share.js';

const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const account = element<HTMLParagraphElement>('account');
const status = element<HTMLParagraphElement>('status');
const result = element<HTMLDivElement>('result');
const code = element<HTMLButtonElement>('code');
const next = element<HTMLSpanElement>('next');
const nextLine = element<HTMLParagraphElement>('next-line');
const until = element<HTMLParagraphElement>('until');
const buttons = element<HTMLDivElement>('buttons');
const copy = element<HTMLButtonElement>('copy');
const ring = element<HTMLElement>('ring');
const arc = ring.querySelector<SVGCircleElement>('.left')!;
const seconds = ring.querySelector<SVGTextElement>('text')!;
const CIRCUMFERENCE = 2 * Math.PI * 12;

let shared: SharedCodes | null = null;
let current = '';
let ticking = 0;

/** Plain words for a person; the page has no other language than English yet. */
function say(text: string, ended = false) {
  status.textContent = text;
  status.hidden = false;
  status.classList.toggle('ended', ended);
}

function clock(at: number) {
  return new Date(at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function end(text: string) {
  shared = null;
  current = '';
  result.hidden = true;
  until.hidden = true;
  buttons.hidden = true;
  say(text, true);
  clearInterval(ticking);
  // Out of the address bar, and out of what Back would bring back.
  history.replaceState(null, '', location.pathname);
}

function show() {
  if (!shared) return;
  const now = sharedCodeAt(shared, Date.now());
  if (now.state === 'ended') {
    end('This link has ended, and its codes are gone. Ask whoever sent it for a new one if you still need a code.');
    return;
  }
  if (now.state === 'early') {
    result.hidden = true;
    buttons.hidden = true;
    say(`This link starts in ${Math.ceil(now.startsIn)} seconds. If that seems wrong, check the time on this device.`);
    return;
  }
  status.hidden = true;
  result.hidden = false;
  buttons.hidden = false;
  if (now.code !== current) {
    current = now.code;
    code.textContent = formatCode(now.code);
    copy.textContent = 'Copy';
  }
  nextLine.hidden = now.next === null;
  next.textContent = now.next ? formatCode(now.next) : '';
  arc.setAttribute('stroke-dashoffset', String(CIRCUMFERENCE * (1 - now.remaining / shared.period)));
  seconds.textContent = String(Math.ceil(now.remaining));
  ring.classList.toggle('urgent', now.remaining <= 8);
  const minutes = Math.round((now.endsAt - Date.now()) / 60_000);
  const left = minutes < 1 ? 'in under a minute' : `in ${minutes} minute${minutes === 1 ? '' : 's'}`;
  until.textContent = `This link ends at ${clock(now.endsAt)}, ${left}.`;
  until.hidden = false;
}

async function copyCode() {
  if (!current) return;
  await navigator.clipboard.writeText(current);
  copy.textContent = 'Copied';
}

// Another link pasted over this one is a page of its own: without this the
// old codes would stay on screen under the new address.
addEventListener('hashchange', () => {
  if (location.hash) location.reload();
});
code.addEventListener('click', () => void copyCode());
copy.addEventListener('click', () => void copyCode());

try {
  shared = readSharedCodes(location.hash);
  // textContent, never markup: the name came with the link, from anyone.
  account.textContent = [shared.issuer, shared.label].filter(Boolean).join(' · ');
  account.hidden = !account.textContent;
  show();
  ticking = window.setInterval(show, 250);
} catch (cause) {
  say(cause instanceof Error ? cause.message : 'This link is damaged.', true);
}

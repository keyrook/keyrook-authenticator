/**
 * The code page's one script, bundled into the page by scripts/render-site.mjs.
 * The arithmetic is @authx/core's — the extension's own — so a key gives the
 * same code here as in the app.
 *
 * The key stays in the text box. Nothing here stores it, and the page's
 * Content Security Policy leaves no way to send it: no connections at all.
 */
import { QUICK_DEFAULTS, readQuickInput, type QuickSettings } from '../../packages/core/src/otp/quick.js';
import { formatCode, generateCode, totpWindow } from '../../packages/core/src/otp/totp.js';
import { isTimeBased, type OtpAlgorithm } from '../../packages/core/src/otp/types.js';

const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const key = element<HTMLTextAreaElement>('key');
const error = element<HTMLParagraphElement>('error');
const settingsLine = element<HTMLParagraphElement>('settings-line');
const settingsText = element<HTMLSpanElement>('settings-text');
const settingsPanel = element<HTMLDivElement>('settings');
const digits = element<HTMLSelectElement>('digits');
const period = element<HTMLSelectElement>('period');
const algorithm = element<HTMLSelectElement>('algorithm');
const account = element<HTMLParagraphElement>('account');
const result = element<HTMLDivElement>('result');
const code = element<HTMLButtonElement>('code');
const next = element<HTMLSpanElement>('next');
const nextLine = element<HTMLParagraphElement>('next-line');
const ring = element<HTMLElement>('ring');
const arc = ring.querySelector<SVGCircleElement>('.left')!;
const seconds = ring.querySelector<SVGTextElement>('text')!;
const copy = element<HTMLButtonElement>('copy');
const CIRCUMFERENCE = 2 * Math.PI * 12;

let settings: QuickSettings = { ...QUICK_DEFAULTS };
let shown = '';
let current = '';

function describe(value: QuickSettings) {
  return `${value.digits} digits · every ${value.period} s · ${value.algorithm.replace('SHA', 'SHA-')}`;
}

async function refresh() {
  const read = readQuickInput(key.value, settings);
  error.hidden = read.kind !== 'error';
  error.textContent = read.kind === 'error' ? read.message : '';
  const fromLink = read.kind === 'ok' && read.fromLink;
  settingsLine.hidden = fromLink;
  settingsPanel.hidden = fromLink || settingsPanel.dataset.open !== 'true';

  if (read.kind !== 'ok') {
    result.hidden = true;
    account.hidden = true;
    shown = '';
    current = '';
    return;
  }

  const params = read.params;
  account.hidden = !(fromLink && (params.issuer || params.label));
  account.textContent = [params.issuer, params.label].filter(Boolean).join(' · ');

  const now = Date.now();
  const window_ = isTimeBased(params.type) ? totpWindow(params.period, now) : null;
  ring.hidden = !window_;
  nextLine.hidden = !window_;
  if (window_) {
    arc.setAttribute('stroke-dashoffset', String(CIRCUMFERENCE * window_.progress));
    seconds.textContent = String(Math.ceil(window_.remaining));
    ring.classList.toggle('urgent', window_.remaining <= 8);
  }

  // Only when something it depends on changed: four times a second otherwise.
  const recipe = JSON.stringify([params, window_?.counter ?? 0]);
  if (recipe === shown) return;
  shown = recipe;
  const [now_, after] = await Promise.all([
    generateCode(params, now),
    window_ ? generateCode(params, now + params.period * 1000) : Promise.resolve(''),
  ]);
  if (shown !== recipe) return;
  current = now_;
  code.textContent = formatCode(now_);
  next.textContent = formatCode(after);
  copy.textContent = 'Copy';
  result.hidden = false;
}

function readSettings() {
  settings = {
    digits: Number(digits.value),
    period: Number(period.value),
    algorithm: algorithm.value as OtpAlgorithm,
  };
  settingsText.textContent = describe(settings);
  void refresh();
}

async function copyCode() {
  if (!current) return;
  await navigator.clipboard.writeText(current);
  copy.textContent = 'Copied';
}

key.addEventListener('input', () => void refresh());
for (const select of [digits, period, algorithm]) select.addEventListener('change', readSettings);
element<HTMLButtonElement>('change').addEventListener('click', () => {
  settingsPanel.dataset.open = 'true';
  settingsPanel.hidden = false;
});
element<HTMLButtonElement>('clear').addEventListener('click', () => {
  key.value = '';
  key.focus();
  void refresh();
});
code.addEventListener('click', () => void copyCode());
copy.addEventListener('click', () => void copyCode());
// Leaving the page forgets the key, including the copy a browser keeps to
// refill the box when someone comes back with the Back button.
addEventListener('pagehide', () => {
  key.value = '';
});

settingsText.textContent = describe(settings);
void refresh();
setInterval(() => void refresh(), 250);

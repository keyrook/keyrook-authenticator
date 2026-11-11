/**
 * Mozilla's own linter on the Firefox build: what addons.mozilla.org runs on
 * every upload, run here first. Run against `apps/extension/dist-firefox`
 * after `npm run zip:firefox -w @authx/extension`.
 *
 * No error may pass, and no warning but the ones below, each known and said
 * why. A new warning is a decision to make on purpose — fixed, or added here
 * with its reason, for the reviewer notes too — not something that slips in.
 */
import { resolve } from 'node:path';
import linter from 'addons-linter';

const dir = resolve(process.argv[2] ?? 'apps/extension/dist-firefox');

const KNOWN = [
  {
    // React DOM's own support for dangerouslySetInnerHTML, in the library
    // chunk. The one use of it here is the service marks compiled in from the
    // icon sets (BrandMark.tsx), never anything a person or a server wrote.
    code: 'UNSAFE_VAR_ASSIGNMENT',
    file: /^chunks\/vendor-[\w-]+\.js$/,
    most: 2,
  },
  {
    // The build is for Firefox on a computer (docs/firefox.md, D5); Firefox
    // for Android is not ticked on the listing.
    code: 'KEY_FIREFOX_ANDROID_UNSUPPORTED_BY_MIN_VERSION',
    file: /^manifest\.json$/,
    most: 1,
  },
];

const instance = linter.createInstance({
  config: {
    _: [dir],
    logLevel: 'fatal',
    stack: false,
    pretty: false,
    warningsAsErrors: false,
    metadata: false,
    output: 'none',
    boring: false,
    selfHosted: false,
  },
  runAsBinary: false,
});
const { errors, warnings, notices } = await instance.run();

const seen = new Map();
const unexpected = warnings.filter((warning) => {
  const known = KNOWN.find((entry) => entry.code === warning.code && entry.file.test(warning.file ?? ''));
  if (!known) return true;
  seen.set(known, (seen.get(known) ?? 0) + 1);
  return seen.get(known) > known.most;
});

const line = (message) => `  - ${message.code} ${message.file ?? ''}${message.line ? `:${message.line}` : ''} — ${message.message}`;
for (const notice of notices) console.log(`note ${line(notice).trim()}`);
if (errors.length > 0 || unexpected.length > 0) {
  console.error(`✗ ${dir} would not pass addons.mozilla.org as it is:`);
  for (const error of errors) console.error(line(error));
  for (const warning of unexpected) console.error(line(warning));
  process.exit(1);
}
console.log(`✓ addons-linter: no errors, ${warnings.length} known warning${warnings.length === 1 ? '' : 's'}, ${notices.length} notices`);

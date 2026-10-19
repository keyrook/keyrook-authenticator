/**
 * Writes the extension icons.
 *
 *   node scripts/gen-icons.mjs <out dir>
 *
 * The icon is Keyrook Authenticator's own mark, the crayon asterisk — never
 * the Keyrook crow, which is the brand's. It is drawn in the brand kit
 * (keyrook-brand, copied into vendor/keyrook-brand by `npm run brand`), which
 * renders each product's toolbar and store icons: the compact drawing below
 * 32 px, and at 128 px the mark 96 px across with 16 px clear round it, as the
 * Chrome Web Store asks. This only copies them where the extension wants them.
 */
import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const KIT = resolve(import.meta.dirname, '../vendor/keyrook-brand/assets');
const outDir = resolve(process.cwd(), process.argv[2] ?? 'icons');
mkdirSync(outDir, { recursive: true });

for (const size of [16, 32, 48, 128]) {
  const file = resolve(outDir, `icon-${size}.png`);
  copyFileSync(resolve(KIT, `authenticator-icon-${size}.png`), file);
  console.log(`✓ ${file}`);
}

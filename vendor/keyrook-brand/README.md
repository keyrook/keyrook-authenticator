# @keyrook/brand

Keyrook's identity, for every Keyrook product: the crow, the hand-lettered
wordmark, the colours, the motions, and each product's own mark. Open
`guide.html` for the brand book.

The crow is the brand's, never a product's icon: it marks only what Keyrook
itself speaks for — the account, emails, the brand's site, a "by Keyrook".

| | |
| --- | --- |
| `src/tokens.ts` | Colours, roles, type scale, lines, space, height, motion — the source of truth |
| `src/mark.ts` | The crow — Keyrook's own mark — full and compact |
| `src/authenticator.ts` | Keyrook Authenticator's mark, the crayon asterisk |
| `src/passhold.ts` | Passhold's mark, the padlock holding three dots |
| `src/wordmark.ts`, `src/lockup.ts` | "keyrook", and the crow with it |
| `src/svg.ts` | Any of them as an SVG string, no DOM |
| `src/icons.ts` | The interface icons, drawn in the same hand; `iconSvg(name)` |
| `src/lettering.ts` | The wordmark's hand as an alphabet, for display words; `letter(text)` |
| `brand.css` | The tokens as `--kr-*`, the type scale, `.kr-icon`, and every motion as a class |
| `assets/` | The logo kit, SVG and PNG; each product's toolbar icons (`*-icon-16…128.png`); `icons/` and `keyrook-icons.svg`, the interface icons |
| `guide.html` | What each piece is for, and what not to do |

`brand.css`, `assets/` and `guide.html` are generated:

```bash
npm run render     # node scripts/render-brand.mjs
npm run check      # fails if anything generated is stale (CI)
npm test
```

Change `src/`, never the generated files.

## Who uses it

Every Keyrook product copies this kit into its own `vendor/keyrook-brand`
with its own `npm run brand`, which also writes `FROM` — the commit it came
from — and `npm run brand:check` there fails when the copy differs from this
repository:

- `../authenticator-x` — Keyrook Authenticator, the extension and its pages
- `../passhold` — Passhold, the password manager
- `../keyrook.com` — Keyrook's own site

A copy is never edited. A new look is a change here, a render, a commit, and
a sync in each product.

The code is GPL-3.0-or-later like the rest of this tree. The Keyrook name and
the crow identify Keyrook's own products; a fork should carry its own.

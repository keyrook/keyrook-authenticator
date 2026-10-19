# Third-party notices

## Brand artwork

The mark shown beside each account is compiled into the extension. Nothing is
fetched at display time — requesting a logo from the network would tell whoever
answers it which services the user has two-factor authentication on, which is a
worse leak than the secrets this app exists to protect.

519 services have a real mark. Sources are tried in this order, so the most
consistent artwork wins and the rest fill the gaps:

| Source | Licence |
| --- | --- |
| [Simple Icons](https://simpleicons.org) | CC0 1.0 |
| [LobeHub Icons](https://github.com/lobehub/lobe-icons) | MIT |
| [SVG Logos](https://github.com/gilbarbara/logos) | CC0 1.0 |
| [CoreUI Brands](https://github.com/coreui/coreui-icons) | CC0 1.0 |
| [token-branded](https://github.com/0xa3k5/web3icons) | MIT |
| [cryptocurrency-color](https://github.com/spothq/cryptocurrency-icons) | CC0 1.0 |
| [Streamline Logos](https://www.streamlinehq.com) | CC BY 4.0 |
| [Boxicons Logos](https://boxicons.com) | MIT |
| [Devicon](https://devicon.dev) | MIT |
| [Material Design Icons](https://pictogrammers.com/library/mdi/) | Apache 2.0 |
| [Arcticons](https://arcticons.onnno.nl) | **CC BY-SA 4.0** |
| [Font Awesome Free](https://fontawesome.com) | icons CC BY 4.0 |

### Attribution obligations

Three of these require more than a mention:

- **Font Awesome Free** — icons © Fonticons, Inc., CC BY 4.0.
  <https://fontawesome.com/license/free>
- **Streamline Logos** — CC BY 4.0, attribution required.
- **Arcticons** — CC BY-SA 4.0. Attribution is required, and the ShareAlike term
  applies: the Arcticons-derived entries in
  `packages/ui/src/components/brand-icons.ts` remain under CC BY-SA 4.0, and anyone
  redistributing modified versions of *those icons* must do so under the same
  licence. It does not reach the rest of the extension, which is a separate
  work. Arcticons is tried last and is only reached for services no other set
  carries.

## Trademarks

All product names, logos and brands are property of their respective owners.
They appear here solely to identify the service an account belongs to —
nominative use — and imply no affiliation with or endorsement by those
companies.

Nothing here is a hand-drawn imitation of a mark. A service that none of the
bundled sets carries is shown as a lettered tile instead.

## Software

Dependencies and their licences are recorded in `package-lock.json`. The
generator that resolves services to artwork is `scripts/gen-brands.mjs`; the
list it works from is `scripts/brands.config.mjs`.

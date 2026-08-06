# ChipIn

Mobile-first coordination for direct Bahamian fundraising. ChipIn records donor reports and
campaign-host receipt attestations; it does not collect, hold, move, settle, or recover funds.

## Current slice

- SvelteKit 2 and Svelte 5 with TypeScript
- Campaign-page prototype using fictional data
- Brand tokens and signature trust/progress components
- Gated transfer portal: copy-paste receiving details, local bank/wallet picker, and
  rail-aware settlement windows (fictional account values only)
- Hosts list every account they can receive on; donors pick the one at their own bank,
  turning a 2-5 day interbank wait into a usually-same-day transfer
- Append-only attestation ledger: hosts record partial receipts, add later deposits against the
  same report, and correct or withdraw an amount with a reason the donor sees — nothing is
  edited or deleted in place
- Client-side screenshot reading that pre-fills the donor report form and uploads nothing
- Stage 0 bank/channel test protocol and product review
- No backend, real receiving-account data, or transfer-reference assumptions yet

Bank marks render `<id>.svg` files from `static/banks/` (see the README there), falling back to
original monogram tiles for any channel without a file. The commercial-bank logos currently in
that folder are the institutions' trademarks, shown beside receiving-account details — written
permission from each bank should be in hand before any public deploy, and the Stage 0
bank-testing conversations are the natural moment to ask.

## Source documents

| Document                           | Path                                                                       |
| ---------------------------------- | -------------------------------------------------------------------------- |
| Project master v1.2 (editable)     | [docs/chipin-master-v1.2.md](docs/chipin-master-v1.2.md)                   |
| Project master v1.2 (archival PDF) | [chipin-master-v1.2.md.pdf](chipin-master-v1.2.md.pdf)                     |
| DESIGN.md v1.0 (editable)          | [chipin-brand/DESIGN.md](chipin-brand/DESIGN.md)                           |
| DESIGN.md v1.0 (archival PDF)      | [Chip In Design Markdown.md.pdf](Chip%20In%20Design%20Markdown.md.pdf)     |
| Product review                     | [docs/PRODUCT-REVIEW.md](docs/PRODUCT-REVIEW.md)                           |
| Stage 0 bank matrix                | [docs/stage-0/BANK-CHANNEL-MATRIX.md](docs/stage-0/BANK-CHANNEL-MATRIX.md) |
| Stage 0 state machines             | [docs/stage-0/STATE-MACHINES.md](docs/stage-0/STATE-MACHINES.md)           |
| Stage 0 threat model               | [docs/stage-0/THREAT-MODEL.md](docs/stage-0/THREAT-MODEL.md)               |
| Stage 0 data categories            | [docs/stage-0/DATA-CATEGORIES.md](docs/stage-0/DATA-CATEGORIES.md)         |

Locked SVG/PWA brand assets belong in `chipin-brand/` when supplied. The app currently uses a
temporary CSS wordmark.

## Local development

```sh
npm install
npm run dev
```

Quality checks:

```sh
npm run check
npm run lint
npm test
npm run build
```

The OCR engine is copied out of `node_modules` into `static/ocr/` (gitignored) by
`npm run sync:ocr`, which `predev` and `prebuild` run automatically. It is served from ChipIn's
own origin rather than a public CDN so no third party sees that a donor is scanning a receipt.

Campaign imagery follows the same rule and for the same reason. It lives in `static/photos/`
(see the README there), not on an image CDN: a hotlinked cover tells whoever serves it the IP
of everyone reading that campaign. The files are generated illustrations rather than stock
photographs — `npm run make:photos` writes them, and the output is committed, so a normal build
never runs the generator.

## Putting the prototype on a phone

`npm run build` writes a static site to `build/` — plain files, no server, because the prototype
has no server side. Host it anywhere:

- **GitHub Pages** — set Settings → Pages → Source to "GitHub Actions", then run the
  **Deploy prototype to GitHub Pages** workflow from the Actions tab. It is manual on purpose:
  publishing to the open internet should be a deliberate act, not a side effect of a push.
- **Netlify / Vercel / any static host** — drag `build/` in, or point the host at
  `npm run build` with a publish directory of `build`.

A project site served from a subpath needs `BASE_PATH` set at build time (the Pages workflow
does this): `BASE_PATH=/chipin npm run build`. Leave it unset for root-hosted deploys, which is
what a custom domain is.

## Putting the prototype on a custom domain

Deployed on **Vercel** from the connected GitHub repo. `vercel.json` carries three things, and
since Vercel rejects any key it does not recognise — including a `"//"` comment key — the
reasoning for them lives here instead of in the file:

- `outputDirectory: build`. Vercel's SvelteKit preset looks for `adapter-vercel` output under
  `.vercel/output` and falls back to `public/`; adapter-static writes to `build/`. Without this
  the build succeeds and the deploy fails with "No Output Directory named public".
- A catch-all rewrite to `/index.html`, because campaign slugs and donor status tokens are
  created in the browser and cannot be prerendered.
- The response headers: `private, no-store` on the app shell, `no-referrer` so a slug or status
  token does not follow the visitor onward, and long caching for fingerprinted assets and the
  OCR engine.

The `source` patterns use negative lookaheads (`/((?!_app/|ocr/).*)`) rather than relying on
which matching rule Vercel applies last, so asset paths keep their own caching regardless.

Both `outputDirectory` and the rewrite come out when the dynamic phase swaps in `adapter-vercel`,
and the headers move into `hooks.server.ts` where they can vary per response.

Vercel ignores `static/_headers` and `static/_redirects` — those are Cloudflare Pages and Netlify
conventions. They stay in the tree so this build still deploys correctly on either without
edits; the two files and `vercel.json` say the same thing in three dialects. GitHub Pages reads
neither and cannot set response headers at all, which is why it is the wrong host for anything
past this prototype.

The domain is `chipin242.com`, registered at Cloudflare. To attach it: Vercel project → Settings
→ Domains → add `chipin242.com`, then create the record Vercel shows you in the Cloudflare
dashboard (Cloudflare stays registrar and DNS; Vercel serves). Set that record to **DNS only**,
not proxied — Vercel issues its own certificate, and Cloudflare's orange-cloud proxy in front of
it causes redirect loops.

Deployment protection is `ssoProtection: all_except_custom_domains`, so every `*.vercel.app` URL
needs a Vercel login while `chipin242.com` serves publicly. Preview URLs are therefore not
shareable outside the team, which is the right default for a prototype.

Verify after the domain resolves — a deep link is what breaks on a misconfigured static host, and
headers are easy to get wrong silently:

```sh
curl -sI https://chipin242.com/discover | head -1           # expect HTTP/2 200, not 404
curl -sI https://chipin242.com/ | grep -i cache-control     # expect private, no-store
curl -s  https://chipin242.com/robots.txt                   # expect Disallow: /
```

The prototype is `Disallow: /` in `robots.txt` on purpose: the campaigns and receiving accounts
on it are invented, and an indexed fake campaign soliciting bank transfers is indistinguishable
from a real one to anyone arriving from a search. Open it up at launch, not before.

Swap `@sveltejs/adapter-static` for a server adapter when real routes arrive. `_headers` covers
the static case, but per-response control over what carries receiving details — and the reveal-step
rate limiting in the threat model — needs a server.

## Where prototype data lives

Campaigns, reports, support notes, and updates are stored in the visitor's own `localStorage`.
There is no server, no account, and no sync between devices. A donor status link opens in any
tab on the same device; it will not open on a different phone. Clearing site data clears
everything.

## Build gates

- Do not add real receiving-account details until the disclosure threat-model decision is closed.
  The transfer portal implements the Option B shape with fictional values only; the decision,
  `Cache-Control: private, no-store`, and reveal-step rate limiting are all still outstanding.
- Do not label anything read from a donor screenshot as verified, confirmed, or matched. Screenshot
  extraction pre-fills the report form and carries no verification weight — a screenshot is trivially
  forged and ChipIn never contacts a bank.
- Do not add server-side storage of transfer proofs without re-entering the full T5 upload controls.
  Today's screenshot reading is client-side only and uploads nothing.
- Settlement windows in `src/lib/prototype/banks.ts` are placeholders. Confirm each with real
  transfers before presenting them to pilot users as expectations.
- Do not generate ChipIn transfer references until the bank/channel evidence matrix supports them.
- Do not freeze the Supabase schema until lifecycle, timer, matching, and retention decisions close.
- Replace the temporary CSS wordmark when the locked SVG/PWA brand asset package is supplied.
- Do not reintroduce third-party image, font, or script hosts. Every asset the browser fetches
  comes from this origin, so no one outside ChipIn learns which campaign a visitor is reading.

See [docs/PRODUCT-REVIEW.md](docs/PRODUCT-REVIEW.md) and
[docs/stage-0/BANK-CHANNEL-MATRIX.md](docs/stage-0/BANK-CHANNEL-MATRIX.md).

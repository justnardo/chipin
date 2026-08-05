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

Deployed on **Vercel** from the connected GitHub repo. `vercel.json` carries the pieces Vercel
needs: `outputDirectory` (adapter-static writes to `build/`, not the `.vercel/output` the
SvelteKit preset expects), a catch-all rewrite so browser-created slugs and tokens resolve, and
the response headers.

Vercel ignores `static/_headers` and `static/_redirects` — those are Cloudflare Pages and Netlify
conventions. They stay in the tree so this build still deploys correctly on either without
edits; the two files and `vercel.json` say the same thing in three dialects. GitHub Pages reads
neither and cannot set response headers at all, which is why it is the wrong host for anything
past this prototype.

To attach the domain: Vercel project → Settings → Domains → add it, then create the record it
shows you in the Cloudflare dashboard (Cloudflare stays the registrar and DNS; Vercel serves).
Set the DNS record to **DNS only**, not proxied — Vercel issues its own certificate, and
Cloudflare's orange-cloud proxy in front of it causes redirect loops.

Verify after the first deploy — a deep link is the thing that breaks on a misconfigured static
host, and headers are easy to get wrong silently:

```sh
curl -sI https://<your-domain>/discover | head -1              # expect HTTP/2 200, not 404
curl -sI https://<your-domain>/ | grep -i cache-control        # expect private, no-store
curl -s  https://<your-domain>/robots.txt                      # expect Disallow: /
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

See [docs/PRODUCT-REVIEW.md](docs/PRODUCT-REVIEW.md) and
[docs/stage-0/BANK-CHANNEL-MATRIX.md](docs/stage-0/BANK-CHANNEL-MATRIX.md).

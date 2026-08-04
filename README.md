# ChipIn

Mobile-first coordination for direct Bahamian fundraising. ChipIn records donor reports and
campaign-host receipt attestations; it does not collect, hold, move, settle, or recover funds.

## Current slice

- SvelteKit 2 and Svelte 5 with TypeScript
- Campaign-page prototype using fictional data
- Brand tokens and signature trust/progress components
- Gated transfer portal: copy-paste receiving details, local bank/wallet picker, and
  rail-aware settlement windows (fictional account values only)
- Client-side screenshot reading that pre-fills the donor report form and uploads nothing
- Stage 0 bank/channel test protocol and product review
- No backend, real receiving-account data, or transfer-reference assumptions yet

Bank marks are original monogram tiles, not reproductions of any institution's logo. ChipIn has
no relationship with these banks; a real logo beside receiving-account details would imply an
endorsement that does not exist. Do not swap them for real logos without written permission.

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

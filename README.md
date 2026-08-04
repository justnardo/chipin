# ChipIn

Mobile-first coordination for direct Bahamian fundraising. ChipIn records donor reports and
campaign-host receipt attestations; it does not collect, hold, move, settle, or recover funds.

## Current slice

- SvelteKit 2 and Svelte 5 with TypeScript
- Campaign-page prototype using fictional data
- Brand tokens and signature trust/progress components
- Stage 0 bank/channel test protocol and product review
- No backend, receiving-account data, or transfer-reference assumptions yet

## Source documents

| Document | Path |
| -------- | ---- |
| Project master v1.2 (editable) | [docs/chipin-master-v1.2.md](docs/chipin-master-v1.2.md) |
| Project master v1.2 (archival PDF) | [chipin-master-v1.2.md.pdf](chipin-master-v1.2.md.pdf) |
| DESIGN.md v1.0 (editable) | [chipin-brand/DESIGN.md](chipin-brand/DESIGN.md) |
| DESIGN.md v1.0 (archival PDF) | [Chip In Design Markdown.md.pdf](Chip%20In%20Design%20Markdown.md.pdf) |
| Product review | [docs/PRODUCT-REVIEW.md](docs/PRODUCT-REVIEW.md) |
| Stage 0 bank matrix | [docs/stage-0/BANK-CHANNEL-MATRIX.md](docs/stage-0/BANK-CHANNEL-MATRIX.md) |
| Stage 0 state machines | [docs/stage-0/STATE-MACHINES.md](docs/stage-0/STATE-MACHINES.md) |
| Stage 0 threat model | [docs/stage-0/THREAT-MODEL.md](docs/stage-0/THREAT-MODEL.md) |
| Stage 0 data categories | [docs/stage-0/DATA-CATEGORIES.md](docs/stage-0/DATA-CATEGORIES.md) |

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

## Build gates

- Do not add real receiving-account details until the disclosure threat-model decision is closed.
- Do not generate ChipIn transfer references until the bank/channel evidence matrix supports them.
- Do not freeze the Supabase schema until lifecycle, timer, matching, and retention decisions close.
- Replace the temporary CSS wordmark when the locked SVG/PWA brand asset package is supplied.

See [docs/PRODUCT-REVIEW.md](docs/PRODUCT-REVIEW.md) and
[docs/stage-0/BANK-CHANNEL-MATRIX.md](docs/stage-0/BANK-CHANNEL-MATRIX.md).

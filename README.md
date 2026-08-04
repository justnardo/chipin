# ChipIn

Mobile-first coordination for direct Bahamian fundraising. ChipIn records donor reports and
campaign-host receipt attestations; it does not collect, hold, move, settle, or recover funds.

## Current slice

- SvelteKit 2 and Svelte 5 with TypeScript
- Campaign-page prototype using fictional data
- Brand tokens and signature trust/progress components
- Stage 0 bank/channel test protocol and product review
- No backend, receiving-account data, or transfer-reference assumptions yet

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

See `docs/PRODUCT-REVIEW.md` and `docs/stage-0/BANK-CHANNEL-MATRIX.md`.

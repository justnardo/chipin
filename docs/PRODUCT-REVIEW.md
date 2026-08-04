# ChipIn v1.2 Product Review

Reviewed August 3, 2026 against the project master document and DESIGN.md v1.0.

## Findings

### High: The matching model is incomplete

The master document requires one-to-many and many-to-one matching, but its core model only names
`pledges` and `transfer_reports`. A `transfer_matches` allocation relation is required so each
allocation can carry an amount and append-only correction history. Do not encode a single
`pledge_id` on `transfer_reports` as the final model.

### High: Bank-detail rendering conflicts with the open threat decision

DESIGN.md requires a no-JavaScript campaign page that server-renders bank details, while the master
document correctly leaves receiving-account disclosure open. Server rendering increases cache,
scraping, preview, and referrer exposure. The current slice renders no bank information; the threat
model must decide the disclosure surface first.

### High: Schema and sensitive backend work remain gated

Bank reference behavior, exact lifecycles and timers, retention, deletion, and legal authority are
not closed. UI foundations and fictional-data prototypes can proceed, but production tables,
uploads, and donor status links should not.

### Medium: The delivered brand package is missing from the workspace

DESIGN.md lists final SVG, PNG, ICO, and PWA assets, but only the Markdown document is available.
The app uses a temporary accessible CSS wordmark. It must be replaced with the locked SVG assets;
the temporary mark is not a new brand master.

### Medium: Analytics needs an explicit event and privacy specification

The requested funnel metrics need event definitions, bot treatment, low-volume suppression, and a
retention decision before instrumentation. No analytics SDK is included in the first slice.

## Closed decisions

- Product Principle 7, proportional operations, was approved by the owner on August 3, 2026.
- All personal campaigns remain free. Organizations may later pay only for optional tools.

## Safe first slice

The first implementation is a server-rendered, responsive campaign-page prototype using clearly
fictional data. It establishes design tokens, the Progress Coin-Bar, status chips, precise review
labels, disclosure language, and accessibility foundations without storing personal or financial
data.

## Next decision sequence

1. Run the bank/channel matrix and choose reference plus fallback behavior.
2. Approve exact state transitions, matching allocations, and unresolved-report timers.
3. Complete the data-flow threat model and legal/privacy consultation.
4. Define data categories, retention, deletion, and status-link lifecycle.
5. Only then freeze and implement the Supabase schema and RLS policies.

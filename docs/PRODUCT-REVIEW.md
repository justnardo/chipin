# ChipIn v1.2 Product Review

Reviewed August 3, 2026 against the project master document and DESIGN.md v1.0.
Stage 0 decision-pack update: August 3, 2026.

Canonical sources:

- [docs/chipin-master-v1.2.md](chipin-master-v1.2.md) (editable) / `chipin-master-v1.2.md.pdf`
- [chipin-brand/DESIGN.md](../chipin-brand/DESIGN.md) (editable) / `Chip In Design Markdown.md.pdf`

## Findings

### High: The matching model is incomplete

The master document requires one-to-many and many-to-one matching, but its core model only names
`pledges` and `transfer_reports`. A `transfer_matches` allocation relation is required so each
allocation can carry an amount and append-only correction history. Do not encode a single
`pledge_id` on `transfer_reports` as the final model.

**Update:** Drafted in [stage-0/STATE-MACHINES.md](stage-0/STATE-MACHINES.md). Owner approval
still required before schema freeze.

### High: Bank-detail rendering conflicts with the open threat decision

DESIGN.md requires a no-JavaScript campaign page that server-renders bank details, while the master
document correctly leaves receiving-account disclosure open. Server rendering increases cache,
scraping, preview, and referrer exposure. The current slice renders no bank information; the threat
model must decide the disclosure surface first.

**Update:** Options A/B/C and a proposed pilot default (Option B) are in
[stage-0/THREAT-MODEL.md](stage-0/THREAT-MODEL.md). Disclosure decision still open.

### High: Schema and sensitive backend work remain gated

Bank reference behavior, exact lifecycles and timers, retention, deletion, and legal authority are
not closed. UI foundations and fictional-data prototypes can proceed, but production tables,
uploads, and donor status links should not.

**Update:** Lifecycles/timers drafted; retention matrix drafted with legal placeholders. Gates
remain closed until owner + counsel sign-off and bank evidence lands.

### Medium: The delivered brand package is missing from the workspace

DESIGN.md lists final SVG, PNG, ICO, and PWA assets, but only the Markdown document is available.
The app uses a temporary accessible CSS wordmark. It must be replaced with the locked SVG assets;
the temporary mark is not a new brand master.

**Update:** `chipin-brand/DESIGN.md` imported; asset manifest noted in
[chipin-brand/README.md](../chipin-brand/README.md). SVG/PWA files still not in repo.

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

## Master §13 deliverable status

| # | Deliverable | Status |
| - | ----------- | ------ |
| 1 | DESIGN.md brand foundation | Delivered v1.0 (editable copy in `chipin-brand/DESIGN.md`; SVG package still missing) |
| 2 | Bank/channel evidence matrix | Active critical path --- [stage-0/BANK-CHANNEL-MATRIX.md](stage-0/BANK-CHANNEL-MATRIX.md); all rows Not tested |
| 3 | State-machine specification | Draft for approval --- [stage-0/STATE-MACHINES.md](stage-0/STATE-MACHINES.md) |
| 4 | Ops playbook (review/moderation/AUP) | Not started (pilot-scale; Principle 7) |
| 5 | Data-category / privacy / retention matrix | Draft with legal placeholders --- [stage-0/DATA-CATEGORIES.md](stage-0/DATA-CATEGORIES.md) |
| 6 | Threat model + security release checklist | Draft for approval --- [stage-0/THREAT-MODEL.md](stage-0/THREAT-MODEL.md) |
| 7 | Supabase schema + tested RLS | Blocked until schema-blocking decisions close |
| 8 | Controlled-pilot plan | Not started |

## Next decision sequence

1. Run the bank/channel matrix and choose reference plus fallback behavior.
2. Approve exact state transitions, matching allocations, and unresolved-report timers.
3. Complete the data-flow threat model decision (disclosure) and legal/privacy consultation.
4. Fill retention/deletion/status-link lifecycle cells marked legal consultation required.
5. Only then freeze and implement the Supabase schema and RLS policies.

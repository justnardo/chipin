# Bank and Channel Evidence Matrix

Status: active Stage 0 protocol --- critical path. Use only consenting account holders and
minimum-value live tests. Do not record credentials, full account numbers, screenshots with
unrelated transactions, or other customers' information in this repository.

Parent: [Project Master Document v1.2](../chipin-master-v1.2.md) §9 Stage 0, §12.1, §13.2.

## Decision this evidence must support

For each tested path, choose one outcome:

- `reference_supported`: a contribution-level ChipIn code survives predictably and is visible to
  the recipient for the tested path.
- `fallback_required`: matching uses amount, sender-selected date window, bank-generated reference,
  and an audited host decision. A ChipIn code may assist but is never required.
- `channel_unsupported`: the path cannot support a reliable and safe pilot workflow.

The product must always retain an approved fallback. A code must never be presented as proof of
settlement. Do not freeze ChipIn reference format until enough high-confidence rows exist.

## How to run one test (checklist)

Use a fresh copy of the per-test record table below for every attempt.

1. **Prepare**
   - [ ] Confirm both account holders consented to a minimum-value test.
   - [ ] Assign a test ID with no name or account number (example pattern: `BCM-2026-001`).
   - [ ] Note sender bank, recipient bank, channel, and timezone.
   - [ ] Decide memo string: baseline uppercase ASCII such as `CHP7K4M` only if an editable memo
         exists. Never put personal data in the memo.
2. **Send**
   - [ ] Send the smallest permitted amount.
   - [ ] Record exactly what the sender sees after submission (confirmation, bank reference, memo).
3. **Receive**
   - [ ] After settlement, recipient transcribes list-view and detail-view text exactly.
   - [ ] Redact unrelated transactions before storing evidence outside the repo.
4. **Repeat**
   - [ ] Run a second identical baseline to check consistency.
   - [ ] Only after baseline success, optionally probe punctuation or length limits.
5. **Close the row**
   - [ ] Set confidence (low / medium / high) and reviewer initials.
   - [ ] Update the coverage tracker status and Test IDs column.
   - [ ] Never infer an untested channel from another channel at the same bank.

Evidence files stay in a private location. This repository holds redacted conclusions only.

## Safe test protocol (summary)

1. Assign a test ID that contains no name or account number.
2. Record sender bank, recipient bank, channel, and test time.
3. Send the smallest permitted amount between accounts whose holders consented to testing.
4. If an editable memo exists, test uppercase ASCII such as `CHP7K4M`; never put personal data in it.
5. Record exactly what the sender sees after submission.
6. After settlement, have the recipient transcribe exactly what appears in transaction list and
   detail views. Redact unrelated information before attaching evidence.
7. Repeat once to check consistency. Test punctuation and length only after the baseline works.
8. Record confidence and reviewer. Never infer an untested channel from another channel at the same
   bank.

## Coverage tracker

Priority for first pass: same-bank mobile for each major bank. Add rows for web, branch,
scheduled, standing-order, and each interbank direction. Treat opposite directions as separate
paths.

| Sender bank         | Recipient bank      | Channel | Direction | Status     | Outcome | Test IDs | Confidence |
| ------------------- | ------------------- | ------- | --------- | ---------- | ------- | -------- | ---------- |
| RBC                 | RBC                 | Mobile  | Same-bank | Not tested |         |          |            |
| Scotiabank          | Scotiabank          | Mobile  | Same-bank | Not tested |         |          |            |
| CIBC FirstCaribbean | CIBC FirstCaribbean | Mobile  | Same-bank | Not tested |         |          |            |
| Commonwealth Bank   | Commonwealth Bank   | Mobile  | Same-bank | Not tested |         |          |            |
| Fidelity Bank       | Fidelity Bank       | Mobile  | Same-bank | Not tested |         |          |            |
| Bank of The Bahamas | Bank of The Bahamas | Mobile  | Same-bank | Not tested |         |          |            |

Status values: `Not tested` · `In progress` · `Complete`.  
Outcome values: `reference_supported` · `fallback_required` · `channel_unsupported` (set only when Complete).

## Per-test record

Copy this table for each Test ID (keep filled copies outside the repo if they contain sensitive
transcripts; paste redacted summaries back here if useful).

| Field                                         | Observation                                                   |
| --------------------------------------------- | ------------------------------------------------------------- |
| Test ID                                       |                                                               |
| Date/time and timezone                        |                                                               |
| Sender bank                                   |                                                               |
| Recipient bank                                |                                                               |
| Channel                                       | Mobile / web / branch / scheduled / standing order            |
| Same-bank or interbank                        |                                                               |
| Editable memo available                       | Yes / no                                                      |
| Memo entered                                  |                                                               |
| Input character/length rules                  |                                                               |
| Sender confirmation display                   |                                                               |
| Bank-generated reference shown to sender      |                                                               |
| Recipient list-view display                   |                                                               |
| Recipient detail-view display                 |                                                               |
| Memo survived exactly                         | Yes / no; describe case, spacing, or truncation changes       |
| Bank-generated reference visible to recipient |                                                               |
| Pending and settled timestamps                |                                                               |
| Evidence location                             | Private location only; do not commit sensitive evidence       |
| Repeated result                               |                                                               |
| Path outcome                                  | reference_supported / fallback_required / channel_unsupported |
| Confidence                                    | Low / medium / high                                           |
| Reviewer                                      |                                                               |
| Notes                                         |                                                               |

## Decision log

Record product-level conclusions here after evidence review. Leave rows empty until real tests
exist --- do not invent results.

| Date | Scope                                                            | Decision | Evidence (Test IDs) | Owner |
| ---- | ---------------------------------------------------------------- | -------- | ------------------- | ----- |
|      | Same-bank mobile (which banks?)                                  |          |                     |       |
|      | ChipIn code format / level / collision / expiry / reuse          |          |                     |       |
|      | Pilot fallback matching rules (amount + date + bank ref + audit) |          |                     |       |
|      | Channels excluded from pilot                                     |          |                     |       |

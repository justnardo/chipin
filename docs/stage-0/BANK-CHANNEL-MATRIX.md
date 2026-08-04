# Bank and Channel Evidence Matrix

Status: active Stage 0 protocol. Use only consenting account holders and minimum-value live tests.
Do not record credentials, full account numbers, screenshots with unrelated transactions, or other
customers' information in this repository.

## Decision this evidence must support

Choose one of these outcomes:

- `reference_supported`: a contribution-level ChipIn code survives predictably and is visible to
  the recipient for the tested path.
- `fallback_required`: matching uses amount, sender-selected date window, bank-generated reference,
  and an audited host decision. A ChipIn code may assist but is never required.
- `channel_unsupported`: the path cannot support a reliable and safe pilot workflow.

The product must always retain an approved fallback. A code must never be presented as proof of
settlement.

## Safe test protocol

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

| Sender bank         | Recipient bank      | Channel | Direction | Status     | Test IDs |
| ------------------- | ------------------- | ------- | --------- | ---------- | -------- |
| RBC                 | RBC                 | Mobile  | Same-bank | Not tested |          |
| Scotiabank          | Scotiabank          | Mobile  | Same-bank | Not tested |          |
| CIBC FirstCaribbean | CIBC FirstCaribbean | Mobile  | Same-bank | Not tested |          |
| Commonwealth Bank   | Commonwealth Bank   | Mobile  | Same-bank | Not tested |          |
| Fidelity Bank       | Fidelity Bank       | Mobile  | Same-bank | Not tested |          |
| Bank of The Bahamas | Bank of The Bahamas | Mobile  | Same-bank | Not tested |          |

Add rows for web, branch, scheduled, standing-order, and each available interbank direction. Treat
opposite directions as separate paths.

## Per-test record

| Field                                         | Observation                                             |
| --------------------------------------------- | ------------------------------------------------------- |
| Test ID                                       |                                                         |
| Date/time and timezone                        |                                                         |
| Sender bank                                   |                                                         |
| Recipient bank                                |                                                         |
| Channel                                       | Mobile / web / branch / scheduled / standing order      |
| Same-bank or interbank                        |                                                         |
| Editable memo available                       | Yes / no                                                |
| Memo entered                                  |                                                         |
| Input character/length rules                  |                                                         |
| Sender confirmation display                   |                                                         |
| Bank-generated reference shown to sender      |                                                         |
| Recipient list-view display                   |                                                         |
| Recipient detail-view display                 |                                                         |
| Memo survived exactly                         | Yes / no; describe case, spacing, or truncation changes |
| Bank-generated reference visible to recipient |                                                         |
| Pending and settled timestamps                |                                                         |
| Evidence location                             | Private location only; do not commit sensitive evidence |
| Repeated result                               |                                                         |
| Confidence                                    | Low / medium / high                                     |
| Reviewer                                      |                                                         |
| Notes                                         |                                                         |

## Decision log

| Date | Scope | Decision | Evidence | Owner |
| ---- | ----- | -------- | -------- | ----- |
|      |       |          |          |       |

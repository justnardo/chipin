# State Machines Working Draft

Status: schema-blocking draft for owner approval. Event semantics below are proposed; bank-code
behavior remains open until the bank/channel evidence matrix is reviewed. Timer values marked
**PROPOSED** need explicit owner sign-off before schema freeze.

Parent: [Project Master Document v1.2](../chipin-master-v1.2.md) §3.2, §3.3, §12.2–12.3.

## Shared rules

- Current statuses are projections of append-only events, not the system of record.
- Every command has an idempotency key and records actor, authority, prior status, new status,
  timestamp, reason, and evidence references.
- Corrections append compensating events. They never edit or delete prior events.
- Public totals are the sum of active host-attested allocation amounts, less voiding allocations.
- Money values use integer cents and one campaign currency. V1 currency is BSD.
- Matching uses a `transfer_matches` allocation relation (see below). Do not encode a single
  `pledge_id` on `transfer_reports` as the final model.
- ChipIn codes, if Stage 0 supports them, assist matching only. They are never proof of settlement.
  An approved fallback matching path always remains available.

## Pledge

| From   | To        | Actor              | Conditions and effect                                                  |
| ------ | --------- | ------------------ | ---------------------------------------------------------------------- |
| none   | active    | donor              | Valid campaign and amount; no public-total effect                      |
| active | cancelled | donor or moderator | Reason required after a transfer report exists; no public-total effect |
| active | expired   | system             | Campaign or pledge deadline passes; no public-total effect             |

Pledge status does not prove or deny a transfer. A pledge with allocations keeps its own lifecycle.
Cancelling or expiring a pledge does not void active host-attested allocations; voiding is a
separate transfer-report / match action.

## Transfer report

| From                                                       | To                      | Actor                 | Conditions and public-total effect                                                 |
| ---------------------------------------------------------- | ----------------------- | --------------------- | ---------------------------------------------------------------------------------- |
| none                                                       | submitted               | donor                 | Reported amount and channel metadata supplied; no effect                           |
| submitted                                                  | clarification_requested | host or moderator     | Question required; no effect                                                       |
| clarification_requested                                    | submitted               | donor                 | Clarification response recorded; no effect                                         |
| submitted / clarification_requested                        | marked_received         | host                  | Actual amount and attestation required; add active allocations                     |
| submitted / clarification_requested                        | partially_matched       | host                  | Actual allocated amount and unmatched amount required; add active allocations only |
| submitted / clarification_requested                        | marked_not_found        | host                  | Reason required; no effect                                                         |
| submitted / clarification_requested / partially_matched    | closed_unresolved       | moderator or system   | Timer or case outcome required; remove no previously attested amount               |
| marked_received / partially_matched                        | confirmation_voided     | host or administrator | Step-up auth and reason required; subtract voided active allocations               |
| marked_not_found / closed_unresolved / confirmation_voided | submitted               | moderator             | Explicit reopen reason and notification required; no direct effect                 |

`confirmation_voided` changes ChipIn's displayed record only. It does not reverse an external bank
transfer. Any later receipt mark creates a new attestation and allocation event.

### Reopen rules

- Only moderators (or administrators) may reopen `marked_not_found`, `closed_unresolved`, or
  `confirmation_voided` back to `submitted`.
- Reopen requires reason, notification to host and donor status-link holder, and a new idempotency
  key. Prior events remain visible.
- Reopen does not restore previously voided allocations. A new `marked_received` or
  `partially_matched` creates fresh allocation events.

### Void / correction semantics

- Voiding subtracts the voided active allocation amounts from the public total via compensating
  match rows (`status = voided`), never by editing prior rows.
- Host void requires step-up authentication. Administrator void requires reason and audit note.
- Amount corrections after attestation: void the incorrect allocation set, then create a new
  attestation with corrected allocations (two commands, linked by `correction_of` event id).

## `transfer_matches` allocation relation

Required for one-to-many and many-to-one matching. Each row allocates a portion of a transfer
report to a pledge (or to an unmatched bucket).

| Field                | Notes                                                                |
| -------------------- | -------------------------------------------------------------------- |
| `id`                 | Stable allocation id                                                 |
| `transfer_report_id` | Parent report                                                        |
| `pledge_id`          | Nullable when amount is intentionally unmatched                      |
| `amount_cents`       | Positive integer; sum of active rows for a report <= attested amount |
| `status`             | `active` \| `voided`                                                 |
| `created_event_id`   | Append-only event that created the row                               |
| `voided_event_id`    | Set when status becomes `voided`                                     |
| `matching_method`    | `chipin_code` \| `bank_reference` \| `amount_date` \| `manual_audit` |
| `matcher_actor`      | Host or moderator who attested the allocation                        |

Rules:

- A single pledge may receive allocations from many transfer reports.
- A single transfer report may allocate to many pledges, provided amounts sum correctly.
- Public campaign total = sum of `amount_cents` where `status = active` for reports on that
  campaign.
- Fallback matching (when codes are unreliable) still creates `transfer_matches` rows; the method
  field records `amount_date`, `bank_reference`, or `manual_audit`.
- Partial receipt: host sets attested amount; active allocations cover the matched portion; the
  report status is `partially_matched` until remaining amount is matched, closed, or voided.

## Moderation case

| From                                                  | To             | Actor                            | Conditions                                                        |
| ----------------------------------------------------- | -------------- | -------------------------------- | ----------------------------------------------------------------- |
| none                                                  | open           | donor, host, reporter, or system | Category, subject, and initial reason required                    |
| open                                                  | assigned       | moderator                        | Owner and response deadline recorded                              |
| assigned                                              | awaiting_donor | moderator                        | Request and due date sent                                         |
| assigned                                              | awaiting_host  | moderator                        | Request and due date sent                                         |
| assigned / awaiting_donor / awaiting_host             | escalated      | moderator                        | Escalation reason and owner required                              |
| assigned / awaiting_donor / awaiting_host / escalated | resolved       | moderator                        | Resolution code, notes, and resulting commands required           |
| open / assigned                                       | dismissed      | moderator                        | Dismissal reason and appeal instructions required                 |
| resolved / dismissed                                  | open           | moderator or administrator       | Appeal or new evidence required; prior resolution remains visible |

Donors may open a moderation case for an unresolved transfer report only after
`moderation_eligible_at` has passed (see timers).

## Campaign

| From                                               | To           | Actor                      | Conditions                                                                            |
| -------------------------------------------------- | ------------ | -------------------------- | ------------------------------------------------------------------------------------- |
| none                                               | draft        | host                       | Host account exists                                                                   |
| draft                                              | submitted    | host                       | Required campaign and authority fields complete                                       |
| submitted                                          | under_review | reviewer                   | Assignment and checklist version recorded                                             |
| under_review                                       | active       | reviewer                   | Required review decisions approved                                                    |
| under_review                                       | rejected     | reviewer                   | Reason and appeal path supplied                                                       |
| active                                             | paused       | host, moderator, or system | Reason; contributions disabled when risk requires it                                  |
| paused                                             | active       | reviewer or moderator      | Re-review or pause condition resolved                                                 |
| draft / submitted / under_review / active / paused | withdrawn    | host                       | Reason; external transfers are unaffected                                             |
| active                                             | goal_met     | system                     | Active attested total reaches goal; host may keep or stop intake per campaign setting |
| active / paused                                    | expired      | system                     | Published expiry reached                                                              |
| goal_met / expired / withdrawn                     | closed       | host or moderator          | Final status note and unresolved-case check required                                  |

Material receiving-account changes force `active -> paused`, host reauthentication, notifications,
version history, and re-review before reactivation.

## Timers (PROPOSED --- owner approval required)

The schema should store explicit timestamps per transfer report so policy can vary by tested
channel without rewriting history:

| Field                    | Meaning                                                               |
| ------------------------ | --------------------------------------------------------------------- |
| `next_action_at`         | Next reminder or system nudge                                         |
| `moderation_eligible_at` | Earliest time donor may open a dispute/moderation case                |
| `close_after`            | Earliest time system/moderator may move report to `closed_unresolved` |

### Proposed default intervals (Bahamas business days, Mon–Fri excluding public holidays)

| Milestone                    | Proposed interval                            | Notes                                             |
| ---------------------------- | -------------------------------------------- | ------------------------------------------------- |
| First host reminder          | 2 business days after `submitted`            | Sets `next_action_at`                             |
| Second host reminder         | 5 business days after `submitted`            | Updates `next_action_at`                          |
| Donor moderation eligibility | 7 business days after `submitted`            | Sets `moderation_eligible_at`                     |
| Auto-close eligible          | 15 business days after `submitted`           | Sets `close_after`; moderator or system may close |
| Clarification pause          | Timers pause while `clarification_requested` | Resume when donor returns to `submitted`          |
| Campaign paused              | Timers pause for that campaign's reports     | Resume on reactivation                            |

These values are **not frozen**. Stage 0 must approve or amend them after bank-channel settlement
timing evidence is reviewed. Per-channel overrides may be stored as policy version ids on the
report without mutating past events.

## Notifications (draft)

| Trigger                        | Audience            | Channel (pilot)      |
| ------------------------------ | ------------------- | -------------------- |
| Report submitted               | Host                | Email / in-app       |
| Reminder at `next_action_at`   | Host                | Email / WhatsApp ops |
| Clarification requested        | Donor status-link   | Status-link message  |
| Marked received / not found    | Donor status-link   | Status-link message  |
| Moderation eligibility reached | Donor status-link   | Status-link message  |
| Case assigned / resolved       | Parties + moderator | Email / in-app       |
| Receiving-account change pause | Host + reviewers    | Email / in-app       |

## Owner approval checklist

Before schema freeze, owner signs off on:

1. Transition tables above (actors, conditions, public-total effects).
2. `transfer_matches` fields and matching-method enum.
3. Reopen and void/correction semantics.
4. Timer intervals and pause behavior (or amended values).
5. Interaction with bank reference vs fallback decision from the evidence matrix.

| Date | Decision | Owner | Notes |
| ---- | -------- | ----- | ----- |
|      |          |       |       |

# State Machines Working Draft

Status: schema-blocking draft. This records the proposed event semantics; timer values and bank-code
behavior remain open until Stage 0 evidence is reviewed.

## Shared rules

- Current statuses are projections of append-only events, not the system of record.
- Every command has an idempotency key and records actor, authority, prior status, new status,
  timestamp, reason, and evidence references.
- Corrections append compensating events. They never edit or delete prior events.
- Public totals are the sum of active host-attested allocation amounts, less voiding allocations.
- Money values use integer cents and one campaign currency. V1 currency is BSD.
- A `transfer_matches` relation allocates amounts between pledges and transfer reports, supporting
  both one-to-many and many-to-one matching.

## Pledge

| From   | To        | Actor              | Conditions and effect                                                  |
| ------ | --------- | ------------------ | ---------------------------------------------------------------------- |
| none   | active    | donor              | Valid campaign and amount; no public-total effect                      |
| active | cancelled | donor or moderator | Reason required after a transfer report exists; no public-total effect |
| active | expired   | system             | Campaign or pledge deadline passes; no public-total effect             |

Pledge status does not prove or deny a transfer. A pledge with allocations keeps its own lifecycle.

## Transfer report

| From                                                       | To                      | Actor                 | Conditions and public-total effect                                                 |
| ---------------------------------------------------------- | ----------------------- | --------------------- | ---------------------------------------------------------------------------------- |
| none                                                       | submitted               | donor                 | Reported amount and channel metadata supplied; no effect                           |
| submitted                                                  | clarification_requested | host or moderator     | Question required; no effect                                                       |
| submitted / clarification_requested                        | marked_received         | host                  | Actual amount and attestation required; add active allocations                     |
| submitted / clarification_requested                        | partially_matched       | host                  | Actual allocated amount and unmatched amount required; add active allocations only |
| submitted / clarification_requested                        | marked_not_found        | host                  | Reason required; no effect                                                         |
| submitted / clarification_requested / partially_matched    | closed_unresolved       | moderator or system   | Timer or case outcome required; remove no previously attested amount               |
| marked_received / partially_matched                        | confirmation_voided     | host or administrator | Step-up auth and reason required; subtract voided active allocations               |
| marked_not_found / closed_unresolved / confirmation_voided | submitted               | moderator             | Explicit reopen reason and notification required; no direct effect                 |

`confirmation_voided` changes ChipIn's displayed record only. It does not reverse an external bank
transfer. Any later receipt mark creates a new attestation and allocation event.

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

## Timer decision still required

The schema should store explicit `next_action_at`, `moderation_eligible_at`, and `close_after` values
per report so policy can vary by tested channel without rewriting history. Stage 0 must approve the
business-day intervals and pause behavior before schema freeze.

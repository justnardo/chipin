# Data Categories, Authority, Retention, and Deletion

Status: Stage 0 draft. Retention periods and lawful bases are **legal consultation required**
(master §5.3 pragmatic path). Do not invent final retention numbers during implementation.
Parent: [Project Master Document v1.2](../chipin-master-v1.2.md) §5.1, §5.3, §12.8.

## How to use this document

1. Confirm categories and storage locations with engineering.
2. Obtain written Bahamian attorney responses on controller role, Data Protection Act duties,
   payment-services boundary for the no-custody model, and any Traceline Bahamas Ltd.
   registration needs.
3. Fill every `TBD --- legal` cell before schema freeze and pilot intake.
4. Health-information domains may remain open until Phase 1B preparation, but must be logged
   as open risks if deferred.

## Roles (draft)

| Role | Description |
| ---- | ----------- |
| Controller | Traceline Bahamas Ltd. operating ChipIn (confirm with counsel) |
| Host | Campaign owner; responsible for story/consent and receiving-account authority |
| Donor (Tier 0) | No-account contributor using status link + minimum contact |
| Beneficiary | Person or cause described; may differ from host |
| Guardian | Required when beneficiary is a minor (rules TBD --- legal) |
| Organization representative | Authorized actor for org campaigns |
| Reviewer / moderator / admin | Privileged operators under least privilege + MFA |

## Category matrix

| ID | Category | Examples | Public? | Authority / purpose (draft) | Retention | Deletion / export | Legal hold |
| -- | -------- | -------- | ------- | --------------------------- | --------- | ----------------- | ---------- |
| C1 | Public campaign content | Title, story, photo, goal, host display name, review labels, attested total | Yes | Host publication rights; ChipIn display for coordination | TBD --- legal; keep while campaign public + archive policy | Takedown/appeal path; cache purge process TBD | Suspend takedown while hold active |
| C2 | Receiving-account details | Bank name, account name, account number / alias | **Open threat decision** --- not on public GET until decided | Host authority over account; purpose = enable out-of-platform transfer | TBD --- legal | Hide control; version history on change | Yes |
| C3 | Host identity / KYC | Phone, government ID images, selfie/OTP evidence | No | Host verification; fraud prevention | TBD --- legal | Access limited to reviewers; export/erasure TBD --- legal | Yes |
| C4 | Organization evidence | Registration docs, authority letters | No | Org campaign authority | TBD --- legal | Same as C3 | Yes |
| C5 | Pledge records | Amount, campaign id, status, timestamps | No (aggregates may be public later only if approved) | Operate contribution flow | TBD --- legal | Donor correction via status link within policy | Yes if disputed |
| C6 | Transfer reports | Reported amount, channel metadata, bank-generated reference, ChipIn code | No | Reconciliation coordination | TBD --- legal | Compensating events, not silent edits | Yes |
| C7 | Transfer matches | Allocation rows, method, void status | No | Public-total integrity | Align with C6 | Void via compensating row | Yes |
| C8 | Transfer proofs | Uploaded screenshots/PDFs | No | Host/moderator matching aid | TBD --- legal; prefer short retention | Hard delete from storage + unlink; metadata strip on ingest | Yes |
| C9 | Donor contact + status links | Email/phone, token hash, expiry, revoke state | No | Follow-up, clarification, disputes | TBD --- legal; link TTL separate from record retention | Revoke link immediately on request; contact erasure TBD --- legal | Yes |
| C10 | Contribution / review events | Append-only audit trail | No | Accountability, dispute integrity | TBD --- legal; may outlive source records under lawful basis | Compensating events; true erase may be restricted --- legal | Yes |
| C11 | Moderation cases | Reports, disputes, notes, resolutions | No | Safety and abuse response | TBD --- legal | Party export rules TBD --- legal | Yes |
| C12 | Verification & review decisions | Checklist results, rejection reasons, conflicts | No | Campaign gatekeeping | TBD --- legal | Appeal path retains prior decision visibility | Yes |
| C13 | Notifications logs | Reminder delivery metadata | No | Operations | TBD --- legal; short operational window preferred | Delete with contact or sooner | Rare |
| C14 | Analytics events | Page views, funnel counts | Aggregate only | Product improvement; privacy-preserving | TBD --- legal; needs event spec before SDK | No raw PII in analytics; low-volume suppression | N/A |
| C15 | Blood / medical request data | Blood type, facility, urgency | Phase 1B only | Deferred; open risk until counsel + institution agreements | Phase 1B gate | Phase 1B gate | Phase 1B |

## Status-link lifecycle (ties to C9)

Draft product requirements (exact numbers TBD --- legal/ops):

- High-entropy, revocable capability URL for donor-facing report state.
- Expiry and rotation; warn that forwarding shares access.
- Recovery path without forcing a full account --- design before build.
- On revoke: link fails closed; underlying report remains for host/moderator per retention policy.
- On donor erasure request: counsel defines whether report/audit rows are anonymized, retained
  under another basis, or deleted.

## Consent and publication

- Host must have authority to publish beneficiary story/images; capture attestation at submit.
- Minors: guardian rules TBD --- legal before allowing such campaigns in pilot.
- Medical/emergency defaults (when in scope): display name, hospital location, no diagnosis.
- Organization marks: representative attests rights to use them.
- Never publish government IDs, unredacted proofs, reviewer notes, or home addresses.

## Backup, cache, and subprocessors

| Surface | Requirement |
| ------- | ----------- |
| Database backups | Retention and restore tested before pilot; RPO/RTO TBD --- ops |
| Object storage versions | Align deletion with proof/KYC policy; legal hold suspends purge |
| CDN / OG caches | Purge procedure for takedown and bank-detail hide |
| Email / WhatsApp ops | Minimize PII in message bodies; subprocessors listed TBD |
| Hosting / Supabase | Data location and cross-border transfer notes TBD --- legal |

## Pragmatic Stage 0 legal consult checklist

Ask counsel for written answers on:

1. Does the no-custody attestation model stay clear of payment-services regulation?
2. Data Protection Act obligations for ChipIn as controller (or corrected role).
3. Registration or licensing required to operate under Traceline Bahamas Ltd.
4. Acceptable retention ranges for C3–C11 (or principles to set them).
5. Donor erasure vs audit integrity tension for append-only events.
6. Domains deferred to Phase 1B (health information) --- confirm deferral is acceptable.

Log residual open risks explicitly; do not block Stage 0 bank testing on Phase 1B health topics.

## Decision log

| Date | Topic | Decision | Owner |
| ---- | ----- | -------- | ----- |
|      | Controller / processor role |  |  |
|      | Retention ranges C1–C14 |  |  |
|      | Status-link TTL + recovery |  |  |
|      | Donor erasure vs audit retention |  |  |

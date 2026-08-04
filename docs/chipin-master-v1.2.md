# ChipIn --- Project Master Document

> Canonical editable copy imported from `chipin-master-v1.2.md.pdf` (archival PDF at repo root).
> Version 1.2 --- brand locked, Stage 0 ready.
> Owner: Lanardo "Nardo" Gibson --- First Glance Bahamas / Traceline Bahamas Ltd.
> Status: Pre-build validation (Stage 0). Domain: chipin242.com (primary); chipin.bs (secondary redirect).

---

ChipIn --- Project Master Document
Version: 1.2 --- brand locked, Stage 0 ready Owner: Lanardo "Nardo" Gibson --- First Glance
Bahamas / Traceline Bahamas Ltd. Status: Pre-build validation (Stage 0) --- brand and design
foundation complete Domain: chipin242.com (primary) - chipin.bs (secondary redirect)
Version 1.2 changes

- Section 6 rewritten: brand identity is locked and delivered; the coin motif is approved
  language; DESIGN.md v1.0 is the authoritative design reference. All required logo
  variants (including monochrome) now exist.
- Added Product Principle 7 (proportional operations) --- scales V1 governance
  requirements to pilot caps. Approved by the owner on August 3, 2026.
- Section 12 open decisions re-sequenced into schema-blocking vs pilot-closeable.
- Section 13 updated: DESIGN.md marked delivered; bank/channel evidence matrix
  promoted to the top of the queue as the active critical path.
- Free-platform policy (§8.6 / decision 12.4) is closed --- all personal campaigns remain
  free; organizations may later pay only for optional tools.
  Version 1.1 decisions (carried forward, approved)
- V1/public launch = monetary fundraising; blood coordination is a separate gated pilot.
- Reporting, disputes, moderation, document security, and access controls are V1 scope.
- Donor tips deferred until a compliant collection method exists.
- Status is pre-build validation until bank-reference, staffing, privacy, and moderation
  gates close.
- Volunteer, event, blood, and payment modules sequence after the monetary pilot.

1. Vision
   ChipIn is a Bahamian mutual-aid and fundraising platform built around how Bahamians already
   help one another: bank transfers, WhatsApp sharing, cookouts, community organizations, and
   urgent blood-donation callouts.
   It replaces scattered flyers and social posts with structured campaign pages, application-
   recorded pledge and host-attestation history, clear verification labels, and privacy-conscious
   sharing. At launch, ChipIn does not collect, hold, or transfer donor funds. Donors send money
   directly to campaign hosts through existing local banking channels, and ChipIn records what
   donors report and what hosts mark as received.
   One-liner: ChipIn formalizes the way Bahamians already help each other.

What ChipIn actually is: an audit trail for money that moves outside the platform. Donor
reports what was sent; host attests what was received; every action is append-only. ChipIn's
value is coordination and honesty, not custody.
Product principles

1. Local first: Design around Bahamian banking, community, and mobile-sharing habits.
2. Trust before growth: Verified hosts, auditable actions, visible campaign status, and
   prompt moderation are launch requirements.
3. Host-attested receipts only: Public fundraising totals increase only when a host marks
   a reported transfer as received. ChipIn does not independently verify bank settlement or
   how funds are used.
4. Privacy by default: Collect and display the minimum information needed for trust and
   coordination.
5. Crisis campaigns stay free: Medical and emergency campaigns will not pay platform
   fees.
6. Start narrow: Prove the monetary contribution loop before expanding into additional
   coordination modules.
7. Proportional operations (approved August 3, 2026): All operational, staffing, and
   governance requirements in this document scale to the published pilot caps. A capped
   invite-only pilot may satisfy review-operations, support, and monitoring requirements
   with a single named reviewer, defined response windows, and hard intake limits.
   Enterprise-grade controls phase in with volume; they are exit criteria for expansion, not
   entry criteria for the pilot.
8. The Problem

- International fundraising platforms add processing fees, currency friction, payout delays,
  and foreign eligibility constraints.
- Local fundraisers circulate as WhatsApp or Facebook flyers containing bank details but
  provide no structured progress tracking, verification, or dispute trail.
- Donors cannot easily tell whether a campaign is current, verified, funded, or resolved.
- Hosts manually reconcile transfers and answer repeated questions, creating significant
  work as campaigns grow.
- Blood requests spread rapidly but may continue circulating after they are fulfilled or
  expired.
- In a small country, unnecessary medical, identity, or location details can expose a
  person even when their name is withheld.

The opportunity
ChipIn's starting hypothesis is not generic crowdfunding. It is a local coordination layer around
direct bank transfers and community sharing: a campaign page, a bank-compatible reference if
validation supports it, a QR link, a donor-reported transfer, a host receipt attestation, and an
application audit trail. 3. V1 and Pilot Scope
V1/public launch is Phase 1A monetary fundraising only. Phase 1B blood coordination is a
separate conditional pilot and is not implied by "launch." A general monetary campaign may
fund a cookout or medical need, but specialized ticket, plate, inventory, clinical, or fulfillment
workflows are excluded from V1.
3.1 Phase 1A --- Monetary Fundraising MVP
Phase 1A includes:

- Mobile-first campaign pages with title, story, goal, host identity, review labels, sharing
  controls, and host-attested progress.
- No-account donor flow for pledging and reporting a bank transfer.
- Transfer references only if Stage 0 validates bank/channel compatibility, uniqueness,
  and recipient visibility; otherwise use the approved fallback matching flow.
- QR links for WhatsApp flyers and printed material.
- Host dashboard for reviewing reported transfers, recording actual amounts received, and
  viewing an audit history.
- Host verification, risk-based campaign review, reporting, disputes, and minimum
  moderation tooling.
- Notifications or reminders for unresolved reported transfers.
- Privacy-preserving basic analytics with defined metrics, bot handling, retention, and low-
  volume suppression: page views, pledge count, reported transfers, host-attested total,
  and conversion rate.
  3.2 Contribution and Reconciliation Flow

1. A donor opens a campaign and enters a pledge amount.
2. If Stage 0 bank testing supports it, ChipIn generates a short transfer reference and
   always provides a documented fallback matching path.
3. The donor completes the transfer outside ChipIn.
4. The donor reports the transfer, entering the amount sent and bank-generated reference
   and optionally attaching proof.
5. The host compares the report with their bank activity.
6. The host marks the actual amount received, marks it not found, or requests clarification.

7. Only amounts marked received by the host are added to the public total, labeled
   "marked received by the campaign host."
8. Every action appends an actor, timestamp, prior status, new status, and reason;
   corrections create compensating events rather than erasing history.
   Pledges, transfer reconciliation, and disputes are separate lifecycles:

- Pledge: active | cancelled | expired
- Transfer report: submitted | clarification_requested |
  marked_received | marked_not_found | partially_matched |
  closed_unresolved | confirmation_voided
- Moderation case: open | assigned | awaiting_donor | awaiting_host |
  escalated | resolved | dismissed
  The state-machine specification must define transition actors, timeouts, notifications, evidence,
  public-total effects, reopening, idempotency, and whether one pledge can map to multiple
  transfers before schema freeze. "Confirmation voided" changes ChipIn's displayed record; it
  does not reverse an external bank transfer.
  3.3 Required Edge-Case Rules
- Partial or different amount: The host records the actual amount received, not the
  original pledge; the remaining unmatched amount keeps an explicit status.
- Missing or incorrect reference: The host can manually match a report using the
  approved fallback evidence, with the action recorded in the audit trail.
- Host does not respond: The donor receives reminders and can open a moderation
  case after a defined waiting period.
- False or mistaken receipt mark: A host or administrator can void it with a required
  reason; the original event remains in history.
- High-volume campaigns: Hosts can search and filter reports. Any multi-select workflow
  requires an explicit amount and attestation for every row, reauthentication above risk
  thresholds, and pilot evidence that it does not enable rubber-stamping.
- Public progress: The progress bar uses host-marked receipts only. V1 does not
  expose pending monetary totals publicly; pilot testing may revisit this.
- Suspicious activity: Risk signals include rapid or large receipt marks, repeated
  references or evidence, large amount mismatches, reused contact details, and receipt
  marks without corresponding donor reports. Rate limits and anti-automation controls
  protect the no-account flow.
  3.4 Phase 1B --- Blood Donation Pilot
  Blood coordination follows the monetary MVP and launches only after its operational and
  information requirements are met.

The pilot includes:

- Blood-request pages with blood type, listed hospital or blood-bank location, official
  contact instructions, urgency window, source, and last-updated time.
- Institution-sourced blood-bank directory information with hours, phone numbers,
  revalidation interval, stale-data suppression, and a named owner responsible for keeping
  it current.
- QR and WhatsApp sharing.
- Automatic expiry, controlled extension, fulfillment, and visibly resolved states so stale
  linked pages do not appear active; copied screenshots and flyer text cannot be remotely
  withdrawn.
- Privacy-first templates that omit diagnosis, home address, government identifiers, and
  unnecessary patient details.
- Requester or authorized-representative attestation, including guardian handling for
  minors.
- A clear statement that ChipIn coordinates information and does not provide medical
  advice or guarantee donor eligibility, compatibility, availability, facility acceptance, or
  clinical outcome; donors must follow official facility screening and instructions.
- An urgent review path that is available only when staffing, escalation, creation, approval,
  update, extension, fulfillment, and withdrawal procedures are defined.
  3.5 Deferred Until After the MVP
  The following are part of the product vision but not launch scope:
- Volunteer scheduling and slot management.
- Event, cookout, ticket, or plate-sale workflows.
- Donor profiles and giving history.
- Card or diaspora payments.
- Multi-currency support.
- Escrow, custody, or automated bank reconciliation.
- In-product donor tips without a defined collection rail.
- Direct account-to-account payment integrations.
- Independent bank-settlement verification, automated bank feeds, or bank reconciliation.
- Refunds, chargebacks, transfer recovery, escrow, donor protection, tax-deductible
  receipts, or funds-use verification.
- Cash/offline contribution tracking, recurring contributions, stored balances, wallets, or
  multi-beneficiary transfers.
- Public pending monetary totals, donor profiles/histories, or native mobile applications.
- Medical donor eligibility, compatibility, or clinical screening.

4. Trust, Verification, and Moderation
   Fraud and poor dispute handling are the largest reputational risks. Trust controls must ship with
   Phase 1A rather than being deferred as growth features. Under Principle 7, their scale matches
   pilot caps.
   4.1 Verification Tiers
   Tier Applies to Requirements
   Tier 0 --- Donor Anyone pledging or reporting No account required; a
   a transfer status-link design with
   specified entropy, expiry,
   revocation, forwarding, and
   recovery behavior; minimum
   contact information for follow-
   up.
   Tier 1 --- General host Personal, school, funeral, Phone OTP, government ID,
   cookout, and community bank-account relationship
   fundraising check, first-campaign review.
   Tier 2 --- Medical bills, blood requests, Tier 1 plus relevant
   Medical/emergency host and disaster relief supporting documentation
   and manual review.
   Organization Churches, NGOs, schools, Authorized representative,
   clubs, and businesses organization evidence, and
   documented authority over
   the receiving account.
   A strict personal-name match will not work for every legitimate campaign. Treasurer accounts,
   organizations, and "Friends of..." accounts require an alternate evidence-and-review path.
   A lower-friction path for small community fundraisers may be tested during the pilot, but its
   monetary cap, sponsor/vouch requirement, and abuse controls must be approved before
   launch.
   4.2 Review Operations
   Before the V1 controlled pilot, ChipIn must define (at pilot scale, per Principle 7):

- Named reviewer(s), backup coverage, operating hours, and a published support
  channel. Pilot-scale example: owner reviews within 48 hours; WhatsApp support
  channel; intake pauses automatically at the pilot campaign cap.

- Expected campaign, document, report, and dispute volume plus handling-time
  assumptions.
- Numeric intake caps, maximum queue ages, reviewer-utilization limits, and pause/stop
  conditions.
- A published review checklist and rejection/appeal reasons.
- Campaign-risk review triggers, including tier, amount, category, complaints, identity or
  receiving-account changes, expired evidence, suspicious contributions, and material
  story edits; first-campaign review alone is insufficient.
- Conflict-of-interest rules and reviewer recusal. (Quality-check programs, formal training,
  and access recertification phase in with additional reviewers --- expansion exit criteria.)
- A decision log for every manual review.
- Escalation rules for suspicious campaigns, privacy concerns, and legal requests.
  Blood-specific urgent coverage is a Phase 1B gate. Targets should be set only after staffing and
  pilot caps are confirmed. The product must not promise 24/7 service without 24/7 coverage.
  4.3 Reports and Disputes
- Every campaign page includes a visible report action.
- Donors can dispute a reported transfer that remains unresolved beyond the defined
  waiting period.
- Reports and disputes enter one moderation queue with priority, owner, status, evidence,
  timestamps, and resolution notes.
- Administrators can pause a campaign, hide public bank details, suspend new
  contributions, void a host receipt-attestation record, or close a campaign.
- ChipIn cannot recover or reverse an external bank transfer. This limitation must be
  clearly disclosed.
- Use narrow, dated labels such as Host identity reviewed, Receiving-account
  relationship reviewed, Organization authority reviewed, and Supporting document
  reviewed. Each label states what was not established and expires or is revoked after
  relevant material changes; never use a generic badge that implies ChipIn guarantees
  the campaign, each transfer, or use of funds.

5. Privacy, Security, and Data Governance
   Government IDs, bank details, transfer proofs, and medical letters are sensitive launch data.
   Their protection is a Phase 1 requirement.
   5.1 Data-Minimization Rules

- Separate public campaign content from private verification and moderation records.
- Treat receiving-account disclosure as a threat-model decision: click-to-reveal alone does
  not prevent scraping, screenshots, caching, or referrer leakage.

- Never publish government IDs, medical documents, diagnoses, home addresses,
  reviewer notes, or unredacted transfer proof.
- Default medical and blood pages to first name or approved display name, hospital
  location rather than home location, and no diagnosis; review rare blood type, location,
  and time combinations for re-identification risk.
- Define beneficiary authorization, guardian rules for minors, and consent when a host
  uploads another person's story, image, identity, or medical document.
- Give hosts clear redaction guidance before upload and strip sensitive file metadata
  where feasible.
- Collect only the contact information required to operate the contribution and dispute flow;
  specify verification, status-link lifecycle, donor edit rights, anti-automation controls, and
  retention for no-account donors.
  5.2 Technical Controls
- Complete a threat model and data-flow inventory before implementation approval.
- Store verification documents and transfer proofs in private storage buckets.
- Enforce and independently test Supabase Row Level Security on every table and
  storage object; tightly restrict privileged service credentials.
- Use short-lived, revocable, high-entropy access links for authorized reviewers.
- Require MFA and least-privilege roles for reviewers, moderators, and administrators,
  with approval, emergency revocation, and periodic access review.
- Reauthenticate and notify hosts for receiving-account changes; pause and re-review
  high-risk material changes.
- Validate MIME type and file size, reject active content, scan uploads for malware, and
  strip metadata where feasible.
- Protect sessions and forms against common web abuse; apply CSP, CSRF defenses,
  rate limits, dependency scanning, secrets rotation, and log redaction.
- Separate production and test data; never copy sensitive production documents into test
  environments.
- Log access to sensitive documents and all review/moderation actions with append-only
  permissions, compensating corrections, and tamper-evidence appropriate to the risk.
- Encrypt data in transit and use the platform's supported encryption at rest.
- Define and test backup, restoration, deletion, breach-response, account-recovery, RPO,
  and RTO procedures before the pilot.
  5.3 Governance Requirements
  Before launch, obtain qualified guidance on applicable Bahamian data-protection, fundraising,
  banking, health-information, and record-retention obligations.
  Pragmatic Stage 0 path (per Principle 7): one consultation with a qualified Bahamian attorney
  covering (a) whether the no-custody model stays clear of payment-services regulation, (b) Data
  Protection Act obligations for ChipIn as controller, and (c) any registration required to operate
  under Traceline Bahamas Ltd. Obtain written responses; log remaining domains (health-

information handling in particular) as documented open risks to be closed before Phase 1B,
which is when they first apply.
Document:

- ChipIn's controller/processor role, lawful purpose, and consent or other authority for
  each data category.
- Host, beneficiary, patient, guardian, and organization-representative authority and
  responsibilities.
- Publication rights for stories, images, documents, and organization marks.
- Retention periods for approved, rejected, abandoned, expired, disputed, and legally held
  records, including backups and social/search caches.
- User access, correction, export, deletion, takedown, and appeal procedures.
- Who may review medical and identity documents.
- Vendor, subprocessor, hosting, data-location, and cross-border-transfer responsibilities.
- Incident notification and regulator/contact procedures.
  Retention periods remain an open legal and operational decision; they must not be invented
  during implementation.

6. Brand and Experience
   Status: LOCKED --- delivered. Authoritative reference: DESIGN.md v1.0 (in chipin-
   brand/).
   Identity

- Name: ChipIn --- camel case, one word. Never "Chip In," "CHIPIN," or "Chipin."
- Wordmark: Dark "Chip" (#0C1B1A), aquamarine "In" (#05A39B), and a gold circular
  tittle (#F2B01E) over the i. The tittle is the coin --- the chip you drop in. This motif is
  approved and central to the brand story.
- Cultural positioning: Bahamian pride is carried by the flag aquamarine-and-gold
  palette, never by clichéd iconography.
- Tone: Warm, communal, direct, and trustworthy; neighborly rather than institutional.
  Plain-language status labels are a trust control.
- Logo variants (complete, vector, locked): primary, reversed, monochrome ink,
  monochrome paper, standalone icon (light and dark tiles), and favicon/PWA set. Clear-
  space, minimum-size, contrast, and misuse rules are defined in DESIGN.md. All type
  converted to outlines --- no font dependency. Artwork © Traceline Bahamas Ltd.;
  trademark registration is an open pre-marketing action.

Design principles

- Mobile-first for WhatsApp-shared links; campaign-page performance budget for slow
  connections (<= 200 KB excl. photo, LCP < 2.5 s on throttled 3G).
- 48 px minimum touch targets.
- Plain language and visible status labels; confirmed, pending, disputed, expired, fulfilled,
  and paused states distinguishable by text and icon --- never color alone.
- Optimized WhatsApp/social previews; auto-generated per-campaign OG images.
- Printable flyer export (A5) using the monochrome mark, designed for cheap black-and-
  white printers.
- Svelte scoped CSS + design-token custom properties; no utility framework. Token set,
  typography (Bricolage Grotesque display / Public Sans body / Space Grotesk
  references), spacing, status colors, signature components (including the Progress Coin-
  Bar and Attestation Row), motion rules, and the WCAG 2.1 AA test matrix are specified
  in DESIGN.md.

7. Technical Architecture
   Layer Choice Notes
   Framework SvelteKit Shared team expertise and
   server-rendered campaign
   pages.
   Backend/DB Supabase Auth, Postgres, private
   storage, RLS, and audit data.
   Styling Scoped CSS + custom Token system per
   properties DESIGN.md §6. No utility
   framework.
   Maps Leaflet Blood-bank locator after
   verified data sources exist.
   Hosting Vercel or equivalent PWA-capable; final choice
   must support security and
   data-governance
   requirements.
   Payments None at launch ChipIn does not collect, hold,
   or move funds.

Core Data Model
Before schema freeze, specify the campaign lifecycle (draft | submitted |
under_review | active | paused | rejected | withdrawn | goal_met |
expired | closed) and a material-change matrix. Receiving-account, beneficiary,
ownership, goal, and major-purpose changes require version history and risk-based re-review;
receiving-account changes also require reauthentication, notifications, and a temporary pause.

- users --- hosts, optional donors, reviewers, moderators, and administrators.
- organizations --- legal/display identity and authorized representatives.
- campaigns --- type, owner, goal, status, tier, verification state, expiry, and visibility.
- pledges --- intended amount, current state, donor status token, and retention metadata.
- transfer_reports --- reported amount, bank-generated reference, optional ChipIn
  code, matching status, and reconciliation result.
- contribution_events --- append-only event history with compensating correction
  events and tamper-evidence requirements.
- transfer_proofs --- private attachments and access metadata.
- verifications --- verification type, status, reviewer, timestamps, and private
  document links.
- review_decisions --- checklist results, reasons, conflicts, and appeal status.
- moderation_cases --- reports, disputes, assignments, evidence, priority, and
  resolution.
- blood_requests --- blood type, listed location, source, urgency, last validated time,
  expiry, and resolution.
- blood_locations --- hours, contact information, source, owner, and last verified time.
- notifications --- reconciliation reminders, review updates, disputes, and expiry
  notices.
  The schema must define access policies and deletion behavior alongside the tables, not after
  implementation.

8. Sustainability
   ChipIn will not depend on unproven day-one tips to fund operations.
1. Funded pilot runway: Before public intake, approve a budget, committed funding
   source, pilot duration, post-pilot decision period, contingency, and safe-wind-down plan
   covering review, moderation, support, legal, security, OTP/email, storage, insurance,
   retention, and incident obligations --- sized to pilot caps per Principle 7.

1. Corporate sponsorships: Banks, insurers, telecommunications companies, and other
   aligned organizations may sponsor the service without controlling campaign review or
   outcomes.
1. Government and NGO partnerships: Explore blood-donation and civic-service
   partnerships after the pilot demonstrates reliable operations.
1. Organizational tier: Churches, NGOs, schools, and businesses may later pay for
   optional recurring campaign management and reporting tools.
1. Optional platform support: Introduce donor tips only as a separate future product after
   resolving the collection rail, merchant identity, fees, accounting, tax, receipts, refunds,
   chargebacks, support, fund separation, consent, and regulatory requirements.
1. Free-use policy --- LOCKED: All personal campaigns remain free of platform fees.
   Organizations may later pay only for optional campaign-management and reporting
   tools. This policy was approved by the owner on August 3, 2026.
   Sponsorship and government sales cycles may be long, so neither should be treated as
   immediate launch revenue.
1. Rollout Plan and Exit Criteria
   Stage 0 --- Pre-Build Validation (ACTIVE)
   Complete before freezing the schema:

- Bank/channel evidence matrix (critical path --- empirical, start first): cover major
  banks (RBC, Scotiabank, CIBC FirstCaribbean, Commonwealth, Fidelity, Bank of The
  Bahamas); same-bank and interbank paths; mobile, web, branch, scheduled, and
  standing-order transfers; editable memo availability; character rules; truncation/case
  conversion; recipient visibility; settlement timing; and bank-generated references. Small
  live transfers between real accounts; record what the recipient actually sees. Both
  outcomes are already handled: memos survive → ChipIn references; memos unreliable
  → approved fallback matching (amount + date range + bank reference + audited manual
  match).
- Decide whether ChipIn codes are contribution-level identifiers and QR links are
  campaign-level; define collision scope, expiry, reuse, and fallbacks. ChipIn codes cannot
  be the sole reconciliation method.
- Validate flows for partial transfers, one-to-many/many-to-one matching, name
  mismatches, organizations, disputes, and correction events.
- Obtain qualified legal guidance per §5.3 (pragmatic Stage 0 path).
- Confirm reviewer staffing, hours, escalation, and service targets at pilot scale.
- Recruit known churches, NGOs, schools, or community organizers for a controlled pilot.
- Identify reliable owners and sources for blood-bank information (Phase 1B preparation
  only; not a Stage 0 blocker).

Phase 1A --- Monetary MVP and Controlled Pilot
Build and pilot:

- Host authentication and verification.
- Campaign creation and review.
- Campaign pages and WhatsApp-ready sharing.
- Validated reference/fallback matching and QR generation.
- Pledge, transfer-reporting, host receipt-attestation, correction, dispute, and audit flows.
- Host dashboard.
- Moderation queue and campaign controls.
- Private document storage and access logging.
  Exit criteria: Before intake, publish numeric pilot caps and thresholds for maximum queue age,
  unresolved-case rate, host-attestation latency, reviewer utilization, and automatic intake pause.
  Before expansion, meet those thresholds; independently test RLS and storage policies;
  complete the defined threat-model test scope; and have no known unresolved severity-1 or
  severity-2 privacy/security findings within that assessed scope.
  Phase 1B --- Blood Pilot
  Launch only when:
- Named institutions or official sources authorize or validate directory data and use of their
  names, with source timestamps and revalidation intervals.
- Request creation, approval, update, extension, fulfillment, withdrawal, unreachable-
  requester, guardian, and consent procedures are defined.
- Auto-expiry, stale-data suppression, and resolved states work.
- Privacy templates, re-identification review, and medical disclaimers are approved.
- Urgent review staffing, official facility instructions, escalation, and incorrect-information
  response are operational.
- Health-information legal guidance (deferred from Stage 0) is obtained.
  Phase 2 --- Community Coordination
- Volunteer coordination.
- Event and cookout workflows.
- Improved notifications.
- Organization management.
  Phase 3 --- Growth and Sustainability
- Donor accounts and giving history.
- Sponsor portal.
- Premium organizational tools.
- Expanded partnerships.

Phase 4 --- Payments Evolution
Explore direct account-to-account or other payment integrations only after legal, licensing,
security, reconciliation, refund, and dispute requirements are understood. 10. Success Measures
Monetary MVP

- Campaign review turnaround by tier and campaign risk.
- Percentage of reported transfers marked received by hosts.
- Median time from transfer report to host receipt attestation.
- Percentage of reports marked not found, partially matched, disputed, expired, corrected,
  or voided.
- Host workload per 100 transfer reports.
- Campaign-page-to-pledge and pledge-to-host-attested conversion.
- Report rate and moderation resolution time.
- Badge/label comprehension and rate of users who incorrectly believe ChipIn verified
  settlement or use of funds.
- Number and severity of privacy, security, or access-control incidents.
  Blood Pilot
- Percentage of requests reviewed within the staffed urgent target.
- Percentage of requests updated, fulfilled, or expired on time.
- Stale-request rate.
- Accuracy and freshness of blood-bank directory data.
- Donor response actions without publication of unnecessary patient information.
  Targets should be set from pilot baselines rather than guessed before real usage.

11. Risks and Mitigations
    Risk Mitigation
    Fraudulent or misleading campaigns Tiered host verification, risk-based campaign
    review, precise labels, reports, audit history,
    and campaign pause controls.

Risk Mitigation
Hosts mark fake reports received to inflate Require donor-originated records; rate limits
totals and anti-automation;
duplicate/contact/evidence signals; risk-based
reauthentication; precise public labels;
compensating void events; campaign review.
Hosts fail to reconcile real transfers Reminders, defined waiting period,
moderation cases, review queue, and visible
unresolved status.
High-volume reconciliation burden Search and filters; explicit amount/attestation
per row; pilot workload measurement; no
unsafe mass confirmation.
Review queue becomes a bottleneck Pilot-scale staffing with hard intake caps
(Principle 7), urgent escalation, conflict rules,
and controlled pilot volume.
Sensitive data exposure Data minimization, private storage, RLS, least
privilege, access logs, retention rules, and
incident procedures.
Stale blood requests cause confusion Automatic expiry, last-updated labels, named
data owner, and fulfilled/resolved states.
Verification blocks legitimate community Organization and authorized-representative
hosts paths; pilot a capped community-vouch path
before adoption.
Trust deficit at launch Use a capped pilot with an intentional mix of
organization and personal campaigns, partner
due diligence, sponsor/reviewer
independence, label-comprehension tests,
aggregate incident reporting, and published
pilot limitations.
Governance overhead stalls the project Principle 7: proportional operations;
enterprise controls are expansion gates, not
pilot gates.
Revenue arrives later than expected Define runway before launch; treat
sponsorship, government partnerships, and
tips as later-stage revenue.

Risk Mitigation
Users assume ChipIn protects or transfers Repeated disclosure that transfers occur
funds outside ChipIn, totals are host-attested, and
ChipIn does not offer settlement verification,
escrow, refunds, chargebacks, recovery,
donor protection, or funds-use verification. 12. Open Decisions Before Build
Schema-blocking (must close before schema freeze):

1. Does the bank/channel evidence matrix support ChipIn references, and what are their
   format, level, collision, expiry, reuse, and fallback rules?
2. What are the exact pledge, transfer-report, moderation-case, and campaign transitions,
   actors, timers, evidence, reopening, and public-total effects?
3. How long should a transfer report remain unresolved before reminders, moderation
   eligibility, and closure?
   Closed owner decisions:

- Proportional operations is approved as Product Principle 7 for the controlled pilot
  (August 3, 2026).
- All personal campaigns remain free; organizations may later pay only for optional tools
  (August 3, 2026).
  Pilot-closeable (may close during Phase 1A with pilot evidence): 5. What evidence and re-
  review rules apply to joint, caregiver, treasurer, organization, trading-name, and other receiving-
  account relationships? 6. Should a capped, community-vouched verification path exist, and
  what are its limits and abuse controls? 7. Who reviews campaigns, during what hours, under
  what intake caps, and against which numeric service and stop thresholds? (Pilot-scale answer
  required before intake; enterprise answer before expansion.) 8. What are the approved
  authority, retention, deletion, backup, legal-hold, ownership, and cache rules for every data
  category? 9. What committed runway covers the pilot, decision period, contingency, and safe
  wind-down? 10. Which accessibility, threat-model, privacy, RLS/storage, upload-security,
  account-change, and incident checks are mandatory release gates? 11. What campaign
  categories and content are prohibited or restricted, and what are the takedown, appeal, age,
  beneficiary-authorization, legal-request, tax, and receipt policies?
  Phase 1B-blocking (defer until blood pilot preparation): 12. Which hospitals or blood banks
  will authorize or validate directory data, disclaimers, use of names, and request procedures?

13. Next Deliverables
1. DESIGN.md with brand foundation, tokens, components, and accessibility matrix ---
   DELIVERED v1.0 (flow wireframes for transfer, attestation, dispute, and blood-request
   screens remain working-draft items within it).
1. Bank/channel evidence matrix --- ACTIVE, critical path. Test protocol, live transfer
   testing across bank pairs and channels, findings, and the reference-vs-fallback decision.
1. Pledge, transfer-reconciliation, moderation-case, and campaign state-machine
   specification.
1. Review, moderation, acceptable-use, takedown, and material-change operations
   playbook (pilot-scale per Principle 7).
1. Data-category matrix and privacy, authority, retention, deletion, consent, ownership,
   audit, and document-access policy reviewed per §5.3 pragmatic path.
1. Threat model and testable security release checklist.
1. Supabase schema with independently tested RLS, private storage policies, event
   history, correction, and deletion behavior.
1. Controlled-pilot plan with campaign mix, partners, reviewer independence, staffing,
   committed runway, numeric success thresholds, and stop/wind-down conditions.
1. Position in the FGB Pipeline
   ChipIn remains part of the broader First Glance Bahamas civic-infrastructure portfolio alongside
   LightWatch 242 and VAULT. Shared expertise and components may reduce delivery cost, but
   each product retains separate privacy, security, operational, and regulatory requirements. Build-
   in-public activity must never expose campaign, verification, banking, medical, moderation, or
   incident data.
   ChipIn is in Stage 0 validation with its brand and design foundation complete. The central
   hypothesis remains clear: make direct local giving easier to share and reconcile while accurately
   representing that ChipIn records donor reports and host attestations without taking custody of,
   settling, recovering, or independently verifying the money.
   ChipIn Project Master Document v1.2 - First Glance Bahamas / Traceline Bahamas Ltd. - The
   coin is the chip you drop in.

# Threat Model and Security Release Checklist

Status: Stage 0 draft for owner and legal review. Not an implementation approval.
Parent: [Project Master Document v1.2](../chipin-master-v1.2.md) §5.1–5.2, §12.10; DESIGN.md
no-JS campaign-page notes.

## Scope

In scope for Phase 1A monetary pilot:

- Public campaign pages and sharing previews
- No-account donor pledge and transfer-report flows
- Host authentication, verification uploads, and attestation dashboard
- Reviewer/moderator access to private documents and queues
- Donor status links
- Private storage of transfer proofs and identity documents

Out of scope until later phases: blood/medical directory data, payment rails, native apps,
automated bank feeds.

## Assets

| Asset                         | Sensitivity | Notes                                      |
| ----------------------------- | ----------- | ------------------------------------------ |
| Receiving-account details     | High        | Disclosure surface is an open decision     |
| Government IDs / KYC docs     | High        | Private storage only                       |
| Transfer proofs               | High        | May contain unrelated account activity     |
| Donor contact + status links  | High        | Capability URLs; forwarding risk           |
| Host auth sessions            | High        | MFA for privileged roles                   |
| Reviewer notes / cases        | High        | Never public                               |
| Public campaign story/photo   | Medium      | Consent and redaction guidance             |
| Host-attested totals          | Medium      | Integrity and label-comprehension risk     |
| Analytics aggregates          | Low–medium  | Needs event/privacy spec before SDK        |

## Actors

- Anonymous visitor / WhatsApp recipient
- No-account donor (status-link holder)
- Campaign host
- Reviewer / moderator / administrator
- Curious scraper / preview crawler
- Malicious reporter or fake-host applicant
- Compromised host session
- Insider with elevated credentials
- Cloud operator / subprocessor

## Data-flow inventory (draft)

```text
Visitor -> Campaign page (public) -> optional pledge/report forms
Donor -> Transfer outside ChipIn (bank) -> Transfer report + optional proof upload
Host -> Bank statement (outside) -> Attestation decisions in host dashboard
Host/Org -> Verification docs -> Private storage -> Reviewer short-lived access
Donor status-link -> Report status / clarification response
Moderator -> Moderation case queue -> Campaign pause / void / hide-bank controls
System -> Reminders and timer transitions -> Email / ops WhatsApp
```

ChipIn never receives bank credentials or initiates transfers. Custody boundary must stay
visible in UI copy and threat assumptions.

## Trust boundaries

1. **Public internet ↔ app edge** (Vercel or equivalent): caching, previews, CSP, rate limits.
2. **App ↔ Supabase Auth / Postgres / Storage**: RLS, service-role confinement, signed URLs.
3. **Host browser ↔ bank apps**: out of ChipIn control; attestation is claim, not settlement proof.
4. **Status-link holder ↔ donor contact channel**: links may be forwarded; design for revocation.
5. **Reviewer workstation ↔ private documents**: access logging, short-lived links, MFA.

## Open decision: receiving-account disclosure

Master document leaves disclosure open. DESIGN.md mentions no-JS server-rendered bank details.
Those conflict until resolved.

| Option | Summary | Main risks | Mitigations if chosen |
| ------ | ------- | ---------- | --------------------- |
| A. No public bank details | Instructions only; host shares details out-of-band or after authenticated step | Friction; hosts paste details into WhatsApp anyway | Clear host guidance; campaign still coordinates reports |
| B. Authenticated / gated reveal | Details after donor starts contribute flow (session or one-time gate) | Determined scrapers; screenshots; referrer leaks on bank links | No prefetch of full details on public GET; cache `private`; strip referrers; rate limit |
| C. Full public SSR of bank details | Lowest friction; matches many flyer habits | Cache, OG scrapers, search, bulk harvest, long-lived exposure | Strongest anti-abuse still cannot stop screenshots; pause/hide control mandatory |

**Working recommendation for pilot (PROPOSED, not approved):** Option B --- do not put full
receiving-account details on the anonymous public campaign GET or in OG/WhatsApp previews.
Serve details only after an intentional contribute step with `Cache-Control: private, no-store`.
Keep administrator "hide public bank details" as an emergency control for any residual surface.
Current prototype correctly renders no bank information until this decision closes.

## Key threats and controls

| ID | Threat | Impact | Proposed controls |
| -- | ------ | ------ | ----------------- |
| T1 | Scraping or caching of receiving accounts | Targeted fraud / harassment | Disclosure Option B; private cache; hide control; no bank data in OG images |
| T2 | Status-link guessing or forwarding | Donor PII / report takeover | High-entropy tokens; expiry; revoke on request; bind minimal contact; rate limit |
| T3 | Fake host / misleading campaign | Donor loss outside platform | Tiered verification; precise labels; report action; pause controls |
| T4 | Host rubber-stamps fake receipts | Inflated public totals | Donor-originated reports only; per-row amount; step-up auth; void events; risk signals |
| T5 | Malicious upload (malware, active content) | Reviewer compromise | MIME/size checks; reject active content; malware scan; metadata strip; private bucket |
| T6 | RLS misconfiguration | Cross-tenant document or PII leak | Independent RLS tests per table/object before pilot |
| T7 | Service-role key exposure | Full data breach | Least privilege; secrets rotation; no service role in client |
| T8 | Referrer leakage to third parties | Account numbers in logs | `Referrer-Policy`; no outbound bank deep-links carrying secrets in query |
| T9 | Preview bots indexing private paths | Accidental publication | Robots rules; auth on private routes; signed URLs only |
| T10 | Users believe ChipIn holds or verifies funds | Reputational / regulatory | Repeated disclosure; label copy tests; no "verified payment" language |
| T11 | Insider misuse of ID/medical docs | Severe privacy harm | MFA; access logs; need-to-know roles; emergency revocation |
| T12 | Campaign photo/story re-identifies beneficiary | Privacy harm | Redaction guidance; medical defaults; review checklist |

## Status-link lifecycle (draft requirements)

- Entropy and length sufficient against online guessing at pilot rate limits.
- Expiry and rotation policy (exact TTL: legal/ops decision; see data categories).
- Donor can revoke; moderator can revoke on abuse.
- Forwarding warning in UI: anyone with the link can view that report's donor-facing state.
- Recovery path without creating a full account --- design before build; do not ship dead ends.
- Anti-automation on pledge/report creation: rate limits, bot treatment, duplicate signals.

## Upload and proof handling

- Private buckets only; never public ACLs.
- Validate MIME and size; reject executables and active HTML.
- Strip EXIF/metadata where feasible; warn hosts to redact unrelated transactions before upload.
- Access via short-lived signed URLs for authorized reviewers/hosts only.
- Append-only access log for sensitive objects.

## Security release checklist (testable)

Mandatory before controlled-pilot intake (master §12.10; refine with pilot caps):

- [ ] Threat-model disclosure decision recorded in decision log below
- [ ] No receiving-account details on anonymous public campaign responses unless Option C approved
- [ ] OG/WhatsApp preview fixtures contain no bank details or ID documents
- [ ] RLS policies written and independently tested for every table and storage path
- [ ] Service-role credentials absent from client bundles
- [ ] MFA enforced for reviewer, moderator, and administrator roles
- [ ] Status-link create/revoke/expiry tests pass
- [ ] Upload MIME/size/malware/metadata controls tested
- [ ] CSP, CSRF defenses, and form rate limits enabled on auth and report routes
- [ ] Receiving-account change forces pause, reauth, notify, re-review
- [ ] Backup, restore, and deletion drills documented with RPO/RTO targets
- [ ] Incident contact path and log-redaction verified
- [ ] Accessibility gates from DESIGN.md §9 still pass on pledge → report → attest path
- [ ] Label-comprehension check: users do not interpret host attestation as ChipIn settlement guarantee

## Decision log

| Date | Topic | Decision | Owner |
| ---- | ----- | -------- | ----- |
|      | Receiving-account disclosure (A/B/C) |  |  |
|      | Status-link TTL / recovery |  |  |
|      | Release-checklist amendments |  |  |

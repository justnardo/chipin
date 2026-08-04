# ChipIn --- DESIGN.md

> Canonical editable copy imported from `Chip In Design Markdown.md.pdf` (archival PDF at repo root).
> Version 1.0 --- locked brand foundation, working design system.
> Authoritative brand reference. SVG/PWA assets belong in `chipin-brand/` when supplied.
> Parent: [Project Master Document v1.2](../docs/chipin-master-v1.2.md).

---

ChipIn --- DESIGN.md
Version: 1.0 --- locked brand foundation, working design system Owner: Lanardo "Nardo"
Gibson --- First Glance Bahamas / Traceline Bahamas Ltd. Parent document: ChipIn Project
Master Document v1.1 (Section 6 + Next Deliverable 6) Status: Brand identity LOCKED.
Component and flow specs working draft --- refine during Phase 1A build.
1. Brand Foundation
1.1 The idea in one line
The gold dot over the i is a coin --- the chip you drop in.
Every visual decision serves that single move. The wordmark is quiet, geometric, and confident
so the one gesture --- the coin --- carries the meaning. Nothing else in the identity competes
with it.
1.2 Naming and story
- Name: ChipIn --- always camel case, one word. Never "Chip In," "CHIPIN," or "Chipin."
- Meaning: "Chippin' in" is what Bahamians already say when everybody puts something
toward the cookout, the funeral, the hospital bill. The brand formalizes the phrase the
same way the product formalizes the behavior.
- Cultural positioning: Bahamian pride lives in the color (flag aquamarine + gold), never
in clichéd iconography. No conch shells, no palm trees, no flags, no hands-cradling-
people. The restraint is the sophistication.
1.3 Tone of voice
Warm, communal, direct, trustworthy. Neighborly --- never institutional, never charity-brochure.
Say Don't say
"Chip in for Grammy's surgery" "Donate to this campaign"
"Marked received by the host" "Verified" / "Confirmed by ChipIn"
"This fundraiser is paused while we look into "This campaign has been flagged for review"
a report"

Say Don't say
"You're all set --- the host can see your "Transaction submitted successfully"
report"
Plain language is a trust control, not a style preference. If a status label needs a tooltip to be
understood, rewrite the label.
2. Logo System
2.1 Variants (all final, all vector)
File Use
chipin-logo.svg / .png Primary wordmark --- light backgrounds
chipin-logo-reversed.svg / .png Dark backgrounds (paper letters, bright-aqua
"In")
chipin-logo-mono-ink.svg Single-color contexts: print, stamps,
engraving, sponsor/legal docs
chipin-logo-mono-paper.svg Single-color on dark
chipin-icon.svg App icon / small-size mark --- aquamarine tile,
paper i, gold coin
chipin-icon-dark.svg Ink-tile icon variant
favicon.ico + chipin-icon- Browser + PWA manifest sizes
512/192/32.png
All type is converted to outlines --- zero font dependency in logo files. Source of truth is the
SVG set; PNGs are exports, never masters.
2.2 Construction notes
- Typeface base: Bricolage Grotesque wght 700, −0.03 em tracking, camel-case two-
tone (Chip ink / In aquamarine).
- The coin is a perfect circle centered on the i stem, sitting just above x-height where a
tittle naturally lives.

- Mono exception: in single-color variants the coin is lifted slightly higher and trimmed
~5% smaller so it separates cleanly from the stem without color contrast. This is
intentional --- do not "fix" mono to match the color geometry.
2.3 Usage rules
- Clear space: keep a margin equal to the coin's diameter on all sides of the wordmark;
half the tile width around the icon.
- Minimum sizes: wordmark ≥ 96 px wide on screen / 25 mm in print. Below that, use the
icon. Icon holds to 16 px.
- Backgrounds: primary on Warm Paper or white; reversed on Ink or Aquamarine. Never
place the wordmark on photography without a solid underlay panel.
- Never: stretch, rotate, add shadows/gradients/outlines, recolor outside the approved
palette, separate the coin from the wordmark as a floating decoration, or pair the
wordmark with any secondary icon.
- The coin-over-i (icon) is the only sanctioned standalone mark.
2.4 Ownership
Artwork © Traceline Bahamas Ltd. Register "ChipIn" wordmark + icon as trademarks in The
Bahamas before public launch marketing (open action --- see master doc §12.12 policies item).
3. Color
3.1 Core palette (locked)
Token Hex Role
--ink #0C1B1A Primary text, "Chip," dark
surfaces
--aqua #05A39B Brand color --- "In," primary
actions, links. Flag
aquamarine.
--gold #F2B01E The coin. Accent only ---
progress fills, key highlights.
Never body text.
--aqua-bright #14BEB2 Aqua on dark surfaces
(contrast-corrected)

Token Hex Role
--paper #FBF7EE Default page background ---
warm, never clinical white
3.2 Extended system palette
Token Hex Role
--paper-2 #F1E9D9 Cards, wells, alternate rows
--line #E2D8C4 Borders, dividers
--ink-60 #5A6B69 Secondary text on paper
--ink-40 #8C9997 Placeholder / disabled text
--gold-deep #D9971A Gold hover / pressed
--aqua-deep #047C76 Aqua hover / pressed
--aqua-tint #E3F4F2 Aqua wash backgrounds (info
panels, selected states)
--gold-tint #FBEECD Gold wash backgrounds
(pending states)
3.3 Status colors
Statuses must be distinguishable by text + icon, never color alone (master doc §6). Color
reinforces; it never carries.
Status Token Hex Icon direction
Marked received --status- #1E7A4A check-circle
received
Pending / reported --status-pending #B07A10 clock
Clarification --status-clarify #8A5A00 chat-question
requested
Not found / disputed --status-dispute #B3382C alert-triangle

Status Token Hex Icon direction
Paused --status-paused #5A6B69 pause-circle
Expired / closed --status-closed #8C9997 archive
Fulfilled / goal met --status- #05A39B flag-check
fulfilled
3.4 Accessibility pairs (WCAG 2.1 AA)
- Body text: --ink on --paper --- passes AAA.
- --aqua on --paper passes AA for large text and UI components only; body-size
aqua text uses --aqua-deep.
- On --ink surfaces use --paper text and --aqua-bright accents.
- --gold never carries text at any size --- decorative and data-fill only.
- Every status color above was chosen to pass AA at label size on --paper; re-verify any
new pairing with a contrast checker before shipping.
4. Typography
4.1 Faces
Role Face Weights Notes
Display / headings / Bricolage 600, 700 The brand voice. Also
numbers Grotesque used for BSD $
amounts and
progress figures --- its
slightly warm
geometry keeps
money human.
Body / UI Public Sans 400, 500, 600 Clear, neutral,
excellent at small
sizes on cheap
Android screens.

Role Face Weights Notes
Code-like Space Grotesk 500 Transfer references,
(references, transfer campaign codes,
codes) audit timestamps.
Tabular,
unambiguous glyphs.
Self-host via Fontsource; subset latin. font-display: swap. Total font budget <= 120 KB
woff2.
4.2 Scale (1.250 ratio, rem-based)
Token Size Use
--text-xs 0.75rem Timestamps, metadata
--text-sm 0.875rem Labels, captions, table cells
--text-base 1rem (16px) Body --- never smaller for
paragraphs
--text-lg 1.25rem Card titles, section leads
--text-xl 1.563rem Page titles (mobile)
--text-2xl 1.953rem Page titles (desktop),
campaign headline
--text-3xl 2.441rem Hero, big totals
Line-height: 1.5 body, 1.15 display. Campaign stories: max-width 65ch.
5. Spacing, Layout, Radius, Elevation
5.1 Space scale --- never freelance values
--space-1 4px - --space-2 8px - --space-3 12px - --space-4 16px - --space-5 24px -
--space-6 32px - --space-7 48px - --space-8 64px - --space-9 96px

5.2 Layout
- Mobile-first; single column to 640 px. Content max-width 720 px (campaign pages) /
1080 px (dashboard).
- Page gutter: --space-4 mobile, --space-6 up.
- Touch targets ≥ 48 px in both dimensions --- hard rule, from the master doc.
5.3 Radius
--radius-sm 6px (inputs, chips) - --radius-md 12px (cards, buttons) - --radius-lg 20px
(modals, hero panels) - --radius-full (avatars, the coin)
5.4 Elevation
Flat by default --- borders (--line) do the separating work. Exactly two shadows exist:
- --shadow-raise: 0 2px 8px rgba(12,27,26,.08) --- cards on hover,
dropdowns
- --shadow-modal: 0 12px 40px rgba(12,27,26,.18) --- dialogs only
Banned: glassmorphism, gradient buttons, parallax, decorative blur. (House rule, non-
negotiable.)
6. Design Tokens --- drop-in app.css block
:root {
/* color --- core */
--ink:#0C1B1A; --aqua:#05A39B; --gold:#F2B01E;
--aqua-bright:#14BEB2; --paper:#FBF7EE;
/* color --- system */
--paper-2:#F1E9D9; --line:#E2D8C4;
--ink-60:#5A6B69; --ink-40:#8C9997;
--gold-deep:#D9971A; --aqua-deep:#047C76;
--aqua-tint:#E3F4F2; --gold-tint:#FBEECD;

/* color --- status */
--status-received:#1E7A4A; --status-pending:#B07A10;
--status-clarify:#8A5A00; --status-dispute:#B3382C;
--status-paused:#5A6B69; --status-closed:#8C9997;
--status-fulfilled:#05A39B;
/* type */
--font-display:"Bricolage Grotesque",system-ui,sans-serif;
--font-body:"Public Sans",system-ui,sans-serif;
--font-mono:"Space Grotesk",ui-monospace,monospace;
--text-xs:.75rem; --text-sm:.875rem; --text-base:1rem;
--text-lg:1.25rem; --text-xl:1.563rem; --text-2xl:1.953rem; --text-3xl:2.441rem;
/* space */
--space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px;
--space-5:24px; --space-6:32px; --space-7:48px; --space-8:64px; --space-9:96px;
/* radius */
--radius-sm:6px; --radius-md:12px; --radius-lg:20px; --radius-full:999px;
/* elevation */
--shadow-raise:0 2px 8px rgba(12,27,26,.08);
--shadow-modal:0 12px 40px rgba(12,27,26,.18);
/* motion */
--ease:cubic-bezier(.2,.7,.3,1); --dur-fast:120ms; --dur-base:200ms; --dur-slow:320ms;
}

Component styles live in each Svelte component's scoped <style> block and reference tokens
only. Global CSS contains: reset, tokens, base typography, and <= 10 hand-picked utilities
(.visually-hidden, .stack, .cluster, etc.). No utility framework.
7. Signature Components
These five components carry the product's personality. Everything else is quiet.
7.1 The Progress Coin-Bar
The campaign progress bar is the brand moment. Track in --paper-2; fill in --gold; the
leading edge of the fill is a gold circle --- the coin itself, mid-drop. Label reads: "$X marked
received by the host of $Y goal" --- the exact attestation language from the master doc, never
shortened to "raised."
7.2 Status Chip
Pill, --radius-full, icon + text always. Tint background, dark status-color text. Chips are the
visible spine of the trust system --- same component from campaign card to audit log so users
learn it once.
7.3 Campaign Card
Photo (4:3, solid underlay), title (--text-lg display), host line with review labels, coin-bar,
status chip. Border --line, radius --radius-md, raise shadow on hover only. No badges
implying ChipIn guarantees anything --- labels use the master doc's narrow dated wording.
7.4 Transfer Reference Panel
The moment a donor gets their reference/QR. Reference set in --font-mono at --text-xl,
letter-spaced, in a --gold-tint well with copy button and QR. Beneath it, the per-bank
instruction accordion (from Stage 0 findings). This screen must survive a screenshot --- it will be
forwarded on WhatsApp constantly, so it carries the wordmark and the campaign short-link.
7.5 Attestation Row (host dashboard)
One reported transfer = one row: donor-reported amount, date, reference, evidence indicator →
host action cluster (Mark received (amount) - Not found - Ask for clarification). Every action
requires the amount field; the row's whole history expands inline (append-only, compensating
events visible). No bulk "confirm all" --- per master doc §3.3.

8. Motion
- CSS-only. Durations/easing from tokens. Nothing exceeds --dur-slow.
- Sanctioned moments: coin drop-in on page load (the tittle settles, 320 ms, once),
progress-bar fill on first view, chip state cross-fade, accordion expand.
- Everything honors prefers-reduced-motion: reduce → transitions to opacity-only
or none.
- No looping animation anywhere. This is a platform people visit while grieving; the
interface stays calm.
9. Accessibility Targets & Test Matrix
Target: WCAG 2.1 AA across the pilot surface.
Check Gate
Contrast (per §3.4 pairs) Every new color pairing verified before merge
Touch targets ≥ 48 px Component review
Status = text + icon, never color alone Component review
Full keyboard path: pledge → report → attest Pre-pilot manual test
Screen reader labels on all status chips, coin- Pre-pilot manual test
bar (announces attested total), reference
panel
Forms: visible labels, error text linked via Component review
aria-describedby
prefers-reduced-motion respected Component review
No-JS fallback: campaign pages render Pre-pilot manual test
content + bank details server-side; pledge
flow degrades to instructions + contact path
Test devices: low-end Android (Chrome), Pre-pilot manual test
iPhone Safari, desktop Chrome/Firefox;
throttled 3G pass on campaign page

Performance budget: campaign page <= 200 KB transferred (excl. campaign photo), LCP < 2.5 s
on throttled 3G. Lightweight pages are an equity feature --- cheap phones and patchy data are
the real Bahamian mobile context.
10. Social & Sharing Surfaces
- OG image: auto-generated per campaign --- Warm Paper ground, campaign title in
display face, coin-bar snapshot, wordmark bottom-right. 1200×630. Regenerated when
attested total changes materially.
- WhatsApp preview is the primary distribution surface --- test every template there first,
not on Twitter/FB.
- QR codes: ink on paper, coin-over-i icon centered at <= 20% area, error correction H.
Printable flyer export (A5) ships in Phase 1A --- hosts will print these for church notice
boards; design for a cheap black-and-white printer (mono logo variant exists for exactly
this).
- Campaign short-links: chipin242.com/c/{code} --- code in Space Grotesk on all
printed material.
11. File Manifest
chipin-brand/
├── DESIGN.md ← this document
├── chipin-logo.svg / .png ← primary wordmark
├── chipin-logo-reversed.svg / .png
├── chipin-logo-mono-ink.svg ← single-color (print/stamps/legal)
├── chipin-logo-mono-paper.svg
├── chipin-icon.svg ← standalone mark (aqua tile)
├── chipin-icon-dark.svg
├── chipin-icon-512/192/32.png ← PWA manifest set
├── favicon.ico ← 16/32/48 multi-size

└── chipin-matched-set.png ← reference sheet
12. Drop-in replacement for Master Document §6
Replace the current "Brand and Experience" section body with the following; it
resolves the "coin" hedge and binds the master doc to this DESIGN.md.
Identity
- Name: ChipIn --- camel case, one word.
- Wordmark: Dark "Chip" (#0C1B1A), aquamarine "In" (#05A39B), and a gold circular
tittle (#F2B01E) over the i. The tittle is the coin --- the chip you drop in. This motif is
approved and central to the brand story.
- Tone: Warm, communal, direct, trustworthy; neighborly rather than institutional.
- Logo variants (complete, vector, locked): primary, reversed, monochrome ink,
monochrome paper, standalone icon (light + dark tiles), favicon/PWA set. Clear-space,
minimum-size, contrast, and usage rules are defined in DESIGN.md. Artwork ©
Traceline Bahamas Ltd.; trademark registration pending.
Design principles
- Mobile-first for WhatsApp-shared links; performance budget for slow connections.
- 48 px minimum touch targets.
- Plain language; visible status labels distinguishable by text and icon, never color alone.
- Optimized WhatsApp/social previews; printable flyer exports use the monochrome mark.
- Svelte scoped CSS + design tokens; no utility framework.
- Full color, typography, spacing, component, motion, and accessibility specifications: see
DESIGN.md v1.0 (authoritative).
ChipIn design system v1.0 - First Glance Bahamas - The coin is the chip you drop in.

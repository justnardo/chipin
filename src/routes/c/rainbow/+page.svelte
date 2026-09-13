<script lang="ts">
	import { resolve } from '$app/paths';
	import BrandMark from '$lib/components/BrandMark.svelte';
	import ProgressCoinBar from '$lib/components/ProgressCoinBar.svelte';
	import ReviewLabel from '$lib/components/ReviewLabel.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import Button from '$lib/components/Button.svelte';
	import StatusChip from '$lib/components/StatusChip.svelte';
	import StickyChipInBar from '$lib/components/StickyChipInBar.svelte';
	import SupportWall from '$lib/components/SupportWall.svelte';
	import UpdateFeed from '$lib/components/UpdateFeed.svelte';
	import {
		PHOTO_BAND,
		PROTOTYPE_PHOTO_DISCLOSURE,
		photoAlt,
		photoSrc
	} from '$lib/prototype/photos';

	const campaign = {
		title: 'Reopen the Rainbow Community Centre',
		host: 'Rainbow Community Centre',
		location: 'Nassau, The Bahamas',
		received: 5240,
		goal: 8000,
		supporters: 47,
		daysLeft: 18
	};

	const recentChips = [
		{ name: 'Keisha M.', amount: 100, when: '2 hours ago' },
		{ name: 'Anonymous', amount: 50, when: 'Yesterday' },
		{ name: 'Marcus T.', amount: 200, when: 'Yesterday' },
		{ name: 'The Rolle family', amount: 75, when: '2 days ago' },
		{ name: 'Anonymous', amount: 25, when: '3 days ago' }
	];

	let shareNote = $state('');

	async function shareCampaign() {
		const url =
			typeof window !== 'undefined' ? window.location.href : 'https://chipin242.com/c/rainbow';
		const text = `${campaign.title} — chip in on ChipIn`;
		try {
			if (navigator.share) {
				await navigator.share({ title: campaign.title, text, url });
				shareNote = 'Thanks for sharing.';
				return;
			}
		} catch {
			/* fall through to clipboard */
		}
		try {
			await navigator.clipboard.writeText(url);
			shareNote = 'Campaign link copied — paste it in WhatsApp.';
		} catch {
			shareNote = 'Copy this link: ' + url;
		}
	}

	function shareWhatsApp() {
		const url =
			typeof window !== 'undefined' ? window.location.href : 'https://chipin242.com/c/rainbow';
		const text = encodeURIComponent(`${campaign.title}\nChip in here: ${url}`);
		window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
	}
</script>

<svelte:head>
	<title>{campaign.title} | ChipIn prototype</title>
	<meta
		name="description"
		content="A fictional ChipIn campaign prototype demonstrating transparent, host-attested fundraising progress."
	/>
</svelte:head>

<div class="prototype-banner">
	<strong>Product prototype</strong>
	<span>This is a fictional campaign. No money can be sent.</span>
</div>

<SiteHeader
	links={[
		{ label: 'How it works', href: '#how-it-works' },
		{ label: 'Trust & safety', href: '#trust' }
	]}
/>

<main>
	<figure class="campaign-cover shell">
		<img
			src={photoSrc('friends', 'wide')}
			alt={photoAlt('friends')}
			width={PHOTO_BAND.width}
			height={PHOTO_BAND.height}
			fetchpriority="high"
		/>
		<figcaption class="disclosure">{PROTOTYPE_PHOTO_DISCLOSURE}</figcaption>
	</figure>
	<section class="campaign-hero shell" aria-labelledby="campaign-title">
		<div class="campaign-intro">
			<div class="meta">
				<StatusChip label="Active campaign" tone="active" />
				<span>Community</span>
			</div>
			<h1 id="campaign-title">{campaign.title}</h1>
			<p class="standfirst">
				Help a neighbourhood meeting place replace storm-damaged equipment and welcome its youth
				programme back through the doors.
			</p>
			<div class="host-byline">
				<span class="host-monogram" aria-hidden="true">RC</span>
				<p>
					Hosted by <strong>{campaign.host}</strong><br />
					<span>{campaign.location}</span>
				</p>
			</div>
		</div>

		<aside class="contribution-card" aria-label="Campaign progress">
			<p class="amount-label">Marked received</p>
			<p class="amount">BSD ${campaign.received.toLocaleString('en-BS')}</p>
			<ProgressCoinBar received={campaign.received} goal={campaign.goal} />
			<div class="stat-row">
				<div>
					<strong>{campaign.supporters}</strong>
					<span>chipped in</span>
				</div>
				<div>
					<strong>{campaign.daysLeft}</strong>
					<span>days left</span>
				</div>
				<div>
					<strong>{Math.round((campaign.received / campaign.goal) * 100)}%</strong>
					<span>of goal</span>
				</div>
			</div>
			<a class="primary-action" href={resolve('/c/[slug]/chip-in', { slug: 'rainbow' })}
				>Chip in now</a
			>
			<div class="share-row">
				<button class="share-action" type="button" onclick={shareCampaign}>Share</button>
				<button class="share-action" type="button" onclick={shareWhatsApp}>WhatsApp</button>
			</div>
			{#if shareNote}
				<p class="card-note" role="status">{shareNote}</p>
			{/if}
			<p class="card-note">
				Money goes to the host by bank transfer — not through ChipIn. Progress only counts what the
				host marks received.
			</p>
			<a class="host-proto" href={resolve('/c/[slug]/host', { slug: 'rainbow' })}
				>Host tools (prototype)</a
			>
		</aside>
	</section>

	<div class="content-grid shell">
		<article class="campaign-story">
			<section aria-labelledby="story-heading">
				<p class="eyebrow">Their story</p>
				<h2 id="story-heading">A room that keeps the neighbourhood moving</h2>
				<p>
					For more than a decade, the fictional Rainbow Community Centre has offered homework help,
					weekend workshops, and a safe place for young people to gather. After heavy rain damaged
					tables, storage, and electrical equipment, the centre needs the community's help to
					reopen.
				</p>
				<p>
					Every contribution will go directly to the campaign host through an existing local banking
					channel. ChipIn will not collect or move the money.
				</p>
			</section>

			<section class="use-of-funds" aria-labelledby="funds-heading">
				<p class="eyebrow">The goal</p>
				<h2 id="funds-heading">What the BSD $8,000 will cover</h2>
				<ul>
					<li><span>Replacement tables and chairs</span><strong>$3,200</strong></li>
					<li><span>Electrical inspection and repairs</span><strong>$2,300</strong></li>
					<li><span>Programme supplies and secure storage</span><strong>$2,500</strong></li>
				</ul>
			</section>

			<UpdateFeed campaignSlug="rainbow" />

			<section class="activity" aria-labelledby="activity-heading">
				<p class="eyebrow">Recent chips</p>
				<h2 id="activity-heading">People are already helping</h2>
				<ul class="activity-list">
					{#each recentChips as chip (chip.name + chip.when)}
						<li>
							<span class="avatar" aria-hidden="true">{chip.name.slice(0, 1)}</span>
							<div>
								<strong>{chip.name}</strong>
								<span>chipped in BSD ${chip.amount}</span>
							</div>
							<time>{chip.when}</time>
						</li>
					{/each}
				</ul>
				<p class="activity-note">
					Names shown here are fictional for the prototype. Live ChipIn can keep donors anonymous.
				</p>
			</section>

			<SupportWall campaignSlug="rainbow" />

			<section class="process" id="how-it-works" aria-labelledby="process-heading">
				<p class="eyebrow">How it works</p>
				<h2 id="process-heading">Familiar fundraising. Local bank transfers.</h2>
				<ol>
					<li>
						<span>01</span>
						<div>
							<strong>Chip in</strong>
							<p>Choose an amount — like donating on a familiar fundraiser page.</p>
						</div>
					</li>
					<li>
						<span>02</span>
						<div>
							<strong>Send with your bank</strong>
							<p>Transfer goes straight to the host. ChipIn never takes the money.</p>
						</div>
					</li>
					<li>
						<span>03</span>
						<div>
							<strong>Host marks it received</strong>
							<p>Only then does the public total move — honest progress, not guesswork.</p>
						</div>
					</li>
				</ol>
			</section>
		</article>

		<aside class="side-stack">
			<section class="trust-panel" id="trust" aria-labelledby="trust-heading">
				<p class="eyebrow">Checked by ChipIn</p>
				<h2 id="trust-heading">What we reviewed</h2>
				<div class="review-list">
					<ReviewLabel label="Host identity reviewed" date="July 28, 2026" />
					<ReviewLabel label="Organization authority reviewed" date="July 28, 2026" />
					<ReviewLabel label="Receiving-account relationship reviewed" date="July 28, 2026" />
				</div>
				<p class="trust-limit">
					These labels do not mean ChipIn verified each bank transfer or how funds are used. ChipIn
					cannot reverse or recover an external transfer.
				</p>
				<a href="#report">See what each review means</a>
			</section>

			<section class="words-panel" aria-labelledby="words-heading">
				<p class="eyebrow">Words matter</p>
				<h2 id="words-heading">Not “donate to ChipIn”</h2>
				<p>
					You chip in for the campaign. The host receives the transfer. ChipIn keeps the shared page
					and the record — the GoFundMe-style home for Bahamian giving, without taking custody of
					the money.
				</p>
			</section>
		</aside>
	</div>

	<section class="next-steps band-dark on-dark" id="next-steps" aria-labelledby="next-heading">
		<div class="shell">
			<BrandMark tone="onDark" />
			<p class="eyebrow">Start your own</p>
			<h2 id="next-heading">Ready to put a fundraiser online?</h2>
			<p>
				ChipIn is building the GoFundMe-style page Bahamians already need — shareable, mobile-first,
				with progress the host can stand behind. Campaign creation opens after pilot review gates.
			</p>
			<div class="next-actions">
				<Button href={resolve('/c/[slug]/chip-in', { slug: 'rainbow' })}>Chip in to this one</Button
				>
				<Button variant="secondary" href={resolve('/start')}>Start your campaign</Button>
			</div>
		</div>
	</section>
</main>

<section class="report band" id="report">
	<div class="shell report-inner">
		<BrandMark compact />
		<p>
			ChipIn records donor reports and host attestations. It does not collect, hold, or move funds.
		</p>
		<a href="mailto:support@chipin242.com?subject=Campaign%20report">Report this campaign</a>
	</div>
</section>

<SiteFooter stickyBarClearance />

<StickyChipInBar
	href={resolve('/c/[slug]/chip-in', { slug: 'rainbow' })}
	receivedLabel={`BSD $${campaign.received.toLocaleString('en-BS')} marked received`}
/>

<style>
	.prototype-banner {
		display: flex;
		flex-wrap: wrap;
		min-height: 40px;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		background: var(--gold-tint);
		font-size: var(--text-sm);
		text-align: center;
	}
	.prototype-banner strong {
		font-family: var(--font-display);
	}
	main {
		overflow: hidden;
	}
	.campaign-cover {
		margin-block: var(--space-5) 0;
	}
	.campaign-cover img {
		width: 100%;
		/* The band crop's own ratio. It was 16/7 against a 1400x665 file, which
		   quietly shaved 8% off the scene. */
		aspect-ratio: 1400 / 665;
		border-radius: var(--radius-lg);
		object-fit: cover;
	}
	.campaign-cover figcaption {
		max-width: 92ch;
		margin-top: var(--space-2);
	}
	.campaign-hero {
		display: grid;
		padding-block: var(--space-7);
		gap: var(--space-7);
	}
	.campaign-intro {
		max-width: 750px;
	}
	/* A chip and a place name, not an eyebrow: keeps sentence case for the chip. */
	.meta {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		color: var(--ink-60);
		font-size: var(--text-sm);
		font-weight: 600;
	}
	h1 {
		max-width: 12ch;
		margin: var(--space-5) 0;
	}
	.standfirst {
		max-width: 59ch;
		margin-bottom: var(--space-6);
		color: var(--ink-60);
		font-size: var(--text-lg);
	}
	.host-byline {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}
	.host-byline p {
		margin: 0;
		font-size: var(--text-sm);
	}
	.host-byline span:not(.host-monogram) {
		color: var(--ink-60);
	}
	.host-monogram {
		display: grid;
		width: 48px;
		height: 48px;
		place-items: center;
		border-radius: 50%;
		color: var(--paper);
		background: var(--ink);
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 700;
	}
	.contribution-card {
		align-self: end;
		padding: var(--space-6);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		background: var(--surface);
		box-shadow: var(--shadow-raise);
	}
	.amount-label {
		margin-bottom: var(--space-1);
		color: var(--ink-60);
		font-size: var(--text-sm);
		font-weight: 600;
	}
	.amount {
		margin-bottom: var(--space-5);
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 700;
		letter-spacing: -0.03em;
	}
	.stat-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-3);
		margin: var(--space-5) 0;
		padding: var(--space-4) 0;
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
		text-align: center;
	}
	.stat-row strong {
		display: block;
		color: var(--ink);
		font-family: var(--font-display);
		font-size: var(--text-lg);
	}
	.stat-row span {
		color: var(--ink-60);
		font-size: var(--text-xs);
	}
	.primary-action,
	.share-action {
		display: grid;
		width: 100%;
		min-height: 52px;
		place-items: center;
		border-radius: var(--radius-md);
		font-weight: 700;
	}
	.primary-action {
		color: white;
		background: var(--aqua-deep);
		text-decoration: none;
		transition:
			background var(--dur-fast) var(--ease),
			transform var(--dur-fast) var(--ease);
	}
	.primary-action:hover {
		background: var(--ink);
		transform: translateY(-1px);
	}
	.share-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
		margin-top: var(--space-3);
	}
	.share-action {
		border: 1px solid var(--line);
		color: var(--ink);
		background: transparent;
		cursor: pointer;
	}
	.host-proto {
		/* A standalone link, not one inside a sentence, so it owes a full tap
		   target even though its label is set at the smallest size. */
		display: grid;
		min-height: var(--control-md);
		margin-top: var(--space-2);
		place-items: center;
		color: var(--ink-60);
		font-size: var(--text-xs);
		font-weight: 600;
		text-align: center;
	}
	.card-note {
		margin: var(--space-4) 0 0;
		color: var(--ink-60);
		font-size: var(--text-xs);
		text-align: center;
	}
	.content-grid {
		display: grid;
		padding: 0 var(--space-4) var(--space-9);
		gap: var(--space-8);
	}
	.campaign-story {
		max-width: 72ch;
	}
	.campaign-story section + section {
		margin-top: var(--space-8);
		padding-top: var(--space-7);
		border-top: 1px solid var(--line);
	}
	.campaign-story section > p:not(.eyebrow) {
		font-size: var(--text-lg);
	}
	.use-of-funds ul,
	.process ol {
		padding: 0;
		margin: 0;
		list-style: none;
	}
	.use-of-funds li {
		display: flex;
		justify-content: space-between;
		gap: var(--space-5);
		padding: var(--space-4) 0;
		border-bottom: 1px solid var(--line);
	}
	.use-of-funds strong {
		font-family: var(--font-mono);
	}
	.process li {
		display: grid;
		padding: var(--space-4) 0;
		gap: var(--space-4);
		grid-template-columns: 40px 1fr;
		border-bottom: 1px solid var(--line);
	}
	.process li > span {
		color: var(--aqua-deep);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
	}
	.process strong {
		font-family: var(--font-display);
		font-size: var(--text-lg);
	}
	.process li p {
		margin: var(--space-1) 0 0;
		color: var(--ink-60);
		font-size: var(--text-base) !important;
	}
	.side-stack {
		display: grid;
		gap: var(--space-5);
		align-self: start;
	}
	.trust-panel,
	.words-panel {
		padding: var(--space-6);
		border-radius: var(--radius-lg);
	}
	.trust-panel {
		background: var(--aqua-tint);
	}
	.words-panel {
		background: var(--paper-2);
	}
	.trust-panel h2,
	.words-panel h2 {
		font-size: var(--text-xl);
	}
	.words-panel p:not(.eyebrow) {
		margin: 0;
		color: var(--ink-60);
		font-size: var(--text-sm);
	}
	.review-list {
		display: grid;
		gap: var(--space-5);
	}
	.trust-limit {
		margin: var(--space-6) 0 var(--space-4);
		padding-top: var(--space-5);
		border-top: 1px solid #bddbd7;
		color: var(--ink-60);
		font-size: var(--text-sm);
	}
	.trust-panel a {
		/* An inline box ignores min-height, so this read 48px in the stylesheet
		   and measured 16px in the browser. */
		display: inline-flex;
		min-height: var(--control-md);
		align-items: center;
		font-size: var(--text-sm);
		font-weight: 700;
	}
	.activity-list {
		padding: 0;
		margin: 0;
		list-style: none;
	}
	.activity-list li {
		display: grid;
		grid-template-columns: 40px 1fr auto;
		gap: var(--space-3);
		align-items: center;
		padding: var(--space-3) 0;
		border-bottom: 1px solid var(--line);
	}
	.avatar {
		display: grid;
		width: 40px;
		height: 40px;
		place-items: center;
		border-radius: 50%;
		color: var(--paper);
		background: var(--aqua-deep);
		font-family: var(--font-display);
		font-weight: 700;
	}
	.activity-list strong {
		display: block;
	}
	.activity-list span {
		color: var(--ink-60);
		font-size: var(--text-sm);
	}
	.activity-list time {
		color: var(--ink-60);
		font-size: var(--text-xs);
		white-space: nowrap;
	}
	.activity-note {
		margin: var(--space-4) 0 0;
		color: var(--ink-60);
		font-size: var(--text-sm);
	}
	.next-steps {
		padding-block: var(--space-8);
		text-align: center;
	}
	.next-steps :global(.brand) {
		margin-bottom: var(--space-7);
	}
	.next-steps h2 {
		max-width: 16ch;
		margin-inline: auto;
		font-size: var(--text-3xl);
	}
	.next-steps p {
		max-width: 60ch;
		margin-inline: auto;
	}
	.next-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-3);
		margin-top: var(--space-6);
	}
	.report {
		padding-block: var(--space-6);
	}
	.report-inner {
		display: grid;
		align-items: center;
		gap: var(--space-3);
	}
	.report-inner p {
		max-width: 65ch;
		margin: 0;
		color: var(--ink-60);
		font-size: var(--text-sm);
	}
	.report-inner a {
		display: inline-flex;
		min-height: var(--control-md);
		align-items: center;
		width: fit-content;
	}
	@media (min-width: 720px) {
		.campaign-hero {
			padding-block: var(--space-9) var(--space-8);
			grid-template-columns: minmax(0, 1.65fr) minmax(300px, 0.75fr);
		}
		.content-grid {
			grid-template-columns: minmax(0, 2fr) minmax(280px, 0.8fr);
		}
		.report-inner {
			grid-template-columns: auto 1fr auto;
		}
	}
	@media (max-width: 480px) {
		.prototype-banner {
			align-items: flex-start;
			flex-direction: column;
			gap: 0;
		}
		.campaign-hero {
			padding-top: var(--space-6);
		}
		.use-of-funds li {
			align-items: flex-start;
			flex-direction: column;
			gap: var(--space-2);
		}
	}
</style>

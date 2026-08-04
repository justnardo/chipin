<script lang="ts">
	import { resolve } from '$app/paths';
	import BrandMark from '$lib/components/BrandMark.svelte';
	import ProgressCoinBar from '$lib/components/ProgressCoinBar.svelte';
	import ReviewLabel from '$lib/components/ReviewLabel.svelte';
	import StatusChip from '$lib/components/StatusChip.svelte';

	const campaign = {
		title: 'Reopen the Rainbow Community Centre',
		host: 'Rainbow Community Centre',
		location: 'Nassau, The Bahamas',
		received: 5240,
		goal: 8000,
		supporters: 47
	};
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

<header class="site-header">
	<a class="brand-link" href={resolve('/')} aria-label="ChipIn home"><BrandMark /></a>
	<nav aria-label="Primary navigation">
		<a href="#how-it-works">How it works</a>
		<a href="#trust">Trust & safety</a>
	</nav>
	<a class="host-link" href="#next-steps">
		<span class="wide-label">Start a campaign</span><span class="narrow-label">Start</span>
	</a>
</header>

<main>
	<figure class="campaign-cover">
		<img
			src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=85"
			alt="Friends gathered together outdoors"
			width="1600"
			height="760"
			fetchpriority="high"
		/>
		<figcaption>Prototype campaign photography</figcaption>
	</figure>
	<section class="campaign-hero" aria-labelledby="campaign-title">
		<div class="campaign-intro">
			<div class="eyebrow">
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
			<div class="supporter-count">
				<strong>{campaign.supporters}</strong>
				<span>people reported chipping in</span>
			</div>
			<a class="primary-action" href={resolve('/c/rainbow/chip-in')}>Chip in</a>
			<a class="share-action host-proto" href={resolve('/c/rainbow/host')}>Host view</a>
			<button class="share-action" type="button" disabled aria-describedby="prototype-note">
				Share campaign
			</button>
			<p class="card-note" id="prototype-note">
				Prototype only. Chip-in and host attestation use fictional browser-session data — no money
				moves and no bank details are shown.
			</p>
		</aside>
	</section>

	<div class="content-grid">
		<article class="campaign-story">
			<section aria-labelledby="story-heading">
				<p class="section-kicker">Their story</p>
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
				<p class="section-kicker">The goal</p>
				<h2 id="funds-heading">What the BSD $8,000 will cover</h2>
				<ul>
					<li><span>Replacement tables and chairs</span><strong>$3,200</strong></li>
					<li><span>Electrical inspection and repairs</span><strong>$2,300</strong></li>
					<li><span>Programme supplies and secure storage</span><strong>$2,500</strong></li>
				</ul>
			</section>

			<section class="process" id="how-it-works" aria-labelledby="process-heading">
				<p class="section-kicker">How it works</p>
				<h2 id="process-heading">A clear record, not a payment service</h2>
				<ol>
					<li>
						<span>01</span>
						<div>
							<strong>You pledge</strong>
							<p>Tell the host what you plan to send.</p>
						</div>
					</li>
					<li>
						<span>02</span>
						<div>
							<strong>You transfer outside ChipIn</strong>
							<p>Use your existing local banking channel.</p>
						</div>
					</li>
					<li>
						<span>03</span>
						<div>
							<strong>The host marks what arrived</strong>
							<p>Only host-marked receipts count toward public progress.</p>
						</div>
					</li>
				</ol>
			</section>
		</article>

		<aside class="trust-panel" id="trust" aria-labelledby="trust-heading">
			<p class="section-kicker">Checked by ChipIn</p>
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
		</aside>
	</div>

	<section class="next-steps" id="next-steps" aria-labelledby="next-heading">
		<BrandMark compact />
		<p class="section-kicker">Try the prototype</p>
		<h2 id="next-heading">Pledge, report, and host-mark — with fictional data.</h2>
		<p>
			Walk the contribute flow, then open the host view in this browser to mark a report received.
			Live ChipIn codes and receiving-account disclosure still wait on Stage 0 decisions.
		</p>
		<div class="next-actions">
			<a class="next-primary" href={resolve('/c/rainbow/chip-in')}>Start chip-in flow</a>
			<a class="next-secondary" href={resolve('/c/rainbow/host')}>Open host view</a>
		</div>
	</section>
</main>

<footer id="report">
	<BrandMark compact />
	<p>
		ChipIn records donor reports and host attestations. It does not collect, hold, or move funds.
	</p>
	<a href="mailto:support@chipin242.com?subject=Campaign%20report">Report this campaign</a>
</footer>

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
	.site-header {
		display: grid;
		max-width: 1200px;
		min-height: 84px;
		align-items: center;
		margin: 0 auto;
		padding: var(--space-4);
		grid-template-columns: 1fr auto;
		border-bottom: 1px solid var(--line);
	}
	.brand-link {
		width: fit-content;
		color: inherit;
		text-decoration: none;
	}
	.narrow-label {
		display: none;
	}
	nav {
		display: none;
		gap: var(--space-6);
	}
	nav a,
	.host-link {
		min-height: 48px;
		align-content: center;
		color: var(--ink);
		font-size: var(--text-sm);
		font-weight: 600;
		text-decoration: none;
	}
	.host-link {
		padding-inline: var(--space-4);
		border: 1px solid var(--ink);
		border-radius: var(--radius-full);
	}
	main {
		overflow: hidden;
	}
	.campaign-cover {
		position: relative;
		max-width: 1200px;
		aspect-ratio: 16 / 7;
		margin: var(--space-5) auto 0;
		padding-inline: var(--space-4);
	}
	.campaign-cover img {
		width: 100%;
		height: 100%;
		border-radius: var(--radius-lg);
		object-fit: cover;
	}
	.campaign-cover figcaption {
		position: absolute;
		right: var(--space-6);
		bottom: var(--space-3);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		color: var(--paper);
		background: rgb(12 27 26 / 72%);
		font-size: var(--text-xs);
	}
	.campaign-hero {
		display: grid;
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--space-7) var(--space-4);
		gap: var(--space-7);
	}
	.campaign-intro {
		max-width: 750px;
	}
	.eyebrow {
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
		font-size: var(--text-3xl);
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
		border-top: 6px solid var(--gold);
		border-radius: var(--radius-md);
		background: #fffdf8;
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
	.supporter-count {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		margin: var(--space-5) 0;
		color: var(--ink-60);
		font-size: var(--text-sm);
	}
	.supporter-count strong {
		color: var(--ink);
		font-family: var(--font-display);
		font-size: var(--text-xl);
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
	.share-action {
		margin-top: var(--space-3);
		border: 1px solid var(--line);
		color: var(--ink-40);
		background: transparent;
	}
	.share-action.host-proto {
		color: var(--ink);
		text-decoration: none;
	}
	.share-action:disabled {
		cursor: not-allowed;
	}
	.card-note {
		margin: var(--space-4) 0 0;
		color: var(--ink-60);
		font-size: var(--text-xs);
		text-align: center;
	}
	.content-grid {
		display: grid;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--space-4) var(--space-9);
		gap: var(--space-8);
	}
	.campaign-story {
		max-width: 720px;
	}
	.campaign-story section + section {
		margin-top: var(--space-8);
		padding-top: var(--space-7);
		border-top: 1px solid var(--line);
	}
	.section-kicker {
		margin-bottom: var(--space-3);
		color: var(--aqua-deep);
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	h2 {
		margin-bottom: var(--space-5);
		font-size: var(--text-2xl);
	}
	.campaign-story section > p:not(.section-kicker) {
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
	.trust-panel {
		align-self: start;
		padding: var(--space-6);
		border-radius: var(--radius-lg);
		background: var(--aqua-tint);
	}
	.trust-panel h2 {
		font-size: var(--text-xl);
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
		min-height: 48px;
		align-content: center;
		font-size: var(--text-sm);
		font-weight: 700;
	}
	.next-steps {
		padding: var(--space-8) var(--space-4);
		color: var(--paper);
		background: var(--ink);
		text-align: center;
	}
	.next-steps :global(.brand) {
		margin-bottom: var(--space-7);
		filter: grayscale(1) brightness(0) invert(1);
	}
	.next-steps .section-kicker {
		color: var(--aqua-bright);
	}
	.next-steps h2 {
		max-width: 16ch;
		margin-inline: auto;
		font-size: var(--text-3xl);
	}
	.next-steps > p {
		max-width: 60ch;
		margin: 0 auto;
		color: #c8d0cf;
	}
	.next-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-3);
		margin-top: var(--space-6);
	}
	.next-primary,
	.next-secondary {
		display: inline-grid;
		min-height: 52px;
		min-width: 180px;
		place-items: center;
		padding: 0 var(--space-5);
		border-radius: var(--radius-md);
		font-weight: 700;
		text-decoration: none;
	}
	.next-primary {
		color: var(--ink);
		background: var(--gold);
	}
	.next-secondary {
		border: 1px solid #5a6b69;
		color: var(--paper);
	}
	footer {
		display: grid;
		max-width: 1200px;
		align-items: center;
		margin: 0 auto;
		padding: var(--space-7) var(--space-4);
		gap: var(--space-4);
		font-size: var(--text-sm);
	}
	footer p {
		max-width: 65ch;
		margin: 0;
		color: var(--ink-60);
	}
	@media (min-width: 760px) {
		.site-header {
			grid-template-columns: 1fr auto 1fr;
			padding-inline: var(--space-6);
		}
		nav {
			display: flex;
		}
		.host-link {
			justify-self: end;
		}
		.campaign-hero {
			padding: var(--space-9) var(--space-6) var(--space-8);
			grid-template-columns: minmax(0, 1.65fr) minmax(300px, 0.75fr);
		}
		.campaign-cover {
			padding-inline: var(--space-6);
		}
		.content-grid {
			padding-inline: var(--space-6);
			grid-template-columns: minmax(0, 2fr) minmax(280px, 0.8fr);
		}
		footer {
			padding-inline: var(--space-6);
			grid-template-columns: auto 1fr auto;
		}
	}
	@media (max-width: 480px) {
		.prototype-banner {
			align-items: flex-start;
			flex-direction: column;
			gap: 0;
		}
		.site-header {
			min-height: 76px;
		}
		.host-link {
			min-width: 64px;
			padding-inline: var(--space-3);
			text-align: center;
		}
		.wide-label {
			display: none;
		}
		.narrow-label {
			display: inline;
		}
		.campaign-hero {
			padding-top: var(--space-6);
		}
		.campaign-cover {
			aspect-ratio: 4 / 3;
			margin-top: var(--space-3);
		}
		.use-of-funds li {
			align-items: flex-start;
			flex-direction: column;
			gap: var(--space-2);
		}
	}
</style>

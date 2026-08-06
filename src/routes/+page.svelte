<script lang="ts">
	import { resolve } from '$app/paths';
	import BrandMark from '$lib/components/BrandMark.svelte';
	import CampaignCard from '$lib/components/CampaignCard.svelte';
	import { photoAlt, photoSrc } from '$lib/prototype/photos';
	import SiteHeader from '$lib/components/SiteHeader.svelte';

	const featuredCampaigns = [
		{
			title: 'Reopen the Rainbow Community Centre',
			category: 'Community',
			location: 'Nassau',
			image: photoSrc('friends'),
			imageAlt: photoAlt('friends'),
			received: 5240,
			goal: 8000,
			href: resolve('/c/rainbow')
		},
		{
			title: 'A fresh start for the Bain Town reading room',
			category: 'Education',
			location: 'New Providence',
			image: photoSrc('reading'),
			imageAlt: photoAlt('reading'),
			received: 3180,
			goal: 6000
		},
		{
			title: 'Restock the neighbourhood food cupboard',
			category: 'Emergency',
			location: 'Grand Bahama',
			image: photoSrc('food'),
			imageAlt: photoAlt('food'),
			received: 7325,
			goal: 10000
		}
	];
</script>

<svelte:head>
	<title>ChipIn | Everybody puts something in</title>
	<meta
		name="description"
		content="ChipIn gives Bahamian fundraisers a clear home for direct local giving, sharing, and host-attested progress."
	/>
</svelte:head>

<SiteHeader
	links={[
		{ label: 'How it works', href: '#how-it-works' },
		{ label: 'Trust & safety', href: '#trust' }
	]}
/>

<main>
	<section class="hero" aria-labelledby="hero-heading">
		<div class="hero-copy">
			<p class="eyebrow">Made for the way The Bahamas helps</p>
			<h1 id="hero-heading">Everybody puts <em>something</em> in.</h1>
			<p class="hero-lead">
				Give a fundraiser one clear home. Share it anywhere. Let every contribution move directly to
				the people you know.
			</p>
			<div class="hero-actions">
				<a class="primary-action" href={resolve('/discover')}>Browse campaigns</a>
				<a class="text-action" href={resolve('/start')}
					>Start a campaign <span aria-hidden="true">→</span></a
				>
			</div>
		</div>

		<div
			class="photo-story"
			aria-label="Prototype illustrations standing in for campaign photography"
		>
			<figure class="photo photo-one">
				<img
					src={photoSrc('friends')}
					alt={photoAlt('friends')}
					width="900"
					height="1100"
					fetchpriority="high"
				/>
			</figure>
			<figure class="photo photo-two">
				<img src={photoSrc('children')} alt={photoAlt('children')} width="700" height="900" />
			</figure>
			<div class="photo-caption">
				<span class="caption-number">242</span>
				<p>One link for the whole community.</p>
			</div>
		</div>
	</section>

	<section class="proof-strip" aria-label="ChipIn commitments">
		<div><strong>Direct</strong><span>Money stays between donor and host</span></div>
		<div><strong>Free</strong><span>No platform fees for personal campaigns</span></div>
		<div><strong>Clear</strong><span>Progress comes from host-marked receipts</span></div>
	</section>

	<section class="campaigns" id="campaigns" aria-labelledby="campaigns-heading">
		<div class="section-heading">
			<div>
				<p class="eyebrow">See what neighbours are building</p>
				<h2 id="campaigns-heading">A reason to chip in is never far away.</h2>
			</div>
			<p>Prototype campaigns show how local causes can be easier to understand and share.</p>
		</div>
		<div class="campaign-grid">
			{#each featuredCampaigns as campaign (campaign.title)}
				<CampaignCard {...campaign} />
			{/each}
		</div>
		<p class="prototype-note">Fictional campaign content and prototype photography.</p>
	</section>

	<section class="how" id="how-it-works" aria-labelledby="how-heading">
		<div class="how-image">
			<img
				src={photoSrc('gathering')}
				alt={photoAlt('gathering')}
				loading="lazy"
				width="1000"
				height="1200"
			/>
			<p>
				<strong>The community moves the money.</strong> ChipIn makes the record easier to follow.
			</p>
		</div>
		<div class="how-copy">
			<p class="eyebrow">Straightforward by design</p>
			<h2 id="how-heading">From WhatsApp share to a clearer thank you.</h2>
			<ol>
				<li>
					<span>01</span>
					<div>
						<h3>Tell the story once</h3>
						<p>
							Create a focused campaign page with the goal, host, and review labels in plain
							language.
						</p>
					</div>
				</li>
				<li>
					<span>02</span>
					<div>
						<h3>Share it everywhere</h3>
						<p>Send one mobile-ready link through WhatsApp, social posts, or a printed QR flyer.</p>
					</div>
				</li>
				<li>
					<span>03</span>
					<div>
						<h3>Keep the progress honest</h3>
						<p>
							Donors report what they sent. Hosts mark what they received. The history remains
							visible.
						</p>
					</div>
				</li>
			</ol>
		</div>
	</section>

	<section class="trust" id="trust" aria-labelledby="trust-heading">
		<div class="trust-copy">
			<p class="eyebrow">Trust before growth</p>
			<h2 id="trust-heading">A clearer page does not make a risky promise.</h2>
			<p>
				ChipIn reviews specific facts about a host or campaign and labels exactly what was checked.
				It never calls an outside bank transfer verified, protected, or recoverable.
			</p>
			<a href={resolve('/c/rainbow')}
				>See the campaign trust pattern <span aria-hidden="true">→</span></a
			>
		</div>
		<div class="trust-image">
			<img
				src={photoSrc('table')}
				alt={photoAlt('table')}
				loading="lazy"
				width="900"
				height="700"
			/>
		</div>
	</section>

	<section class="start" id="start" aria-labelledby="start-heading">
		<p class="eyebrow">The first chip starts the circle</p>
		<h2 id="start-heading">Give your fundraiser a home people can trust.</h2>
		<p>
			Build a shareable campaign page now in the prototype. Live intake and review still wait on
			pilot gates — this lets you feel the GoFundMe-style flow today.
		</p>
		<a class="primary-action" href={resolve('/start')}>Start a campaign</a>
	</section>
</main>

<footer>
	<BrandMark />
	<p>
		ChipIn records donor reports and host attestations. It does not collect, hold, or move funds.
	</p>
	<div class="footer-links">
		<a href="#trust">Trust & safety</a>
		<a href="mailto:hello@chipin242.com">Contact</a>
	</div>
	<small
		>Illustrations are placeholders served from this site. Final imagery will be locally
		commissioned.</small
	>
</footer>

<style>
	.hero {
		display: grid;
		max-width: 1240px;
		min-height: 720px;
		align-items: center;
		margin: 0 auto;
		padding: var(--space-6) var(--space-4) var(--space-8);
		gap: var(--space-8);
	}
	.hero-copy {
		position: relative;
		z-index: 2;
		min-width: 0;
	}
	.eyebrow {
		margin-bottom: var(--space-4);
		color: var(--aqua-deep);
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	h1 {
		max-width: 10ch;
		margin-bottom: var(--space-5);
		font-size: clamp(3.5rem, 9vw, 7.5rem);
		line-height: 0.88;
		letter-spacing: -0.065em;
	}
	h1 em {
		color: var(--aqua-deep);
		font-style: normal;
	}
	.hero-lead {
		max-width: 55ch;
		margin-bottom: var(--space-6);
		color: var(--ink-60);
		font-size: var(--text-lg);
	}
	.hero-actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-4);
	}
	.primary-action {
		display: inline-grid;
		min-height: 54px;
		place-items: center;
		padding: var(--space-3) var(--space-5);
		border-radius: var(--radius-md);
		color: white;
		background: var(--aqua-deep);
		font-weight: 700;
		text-decoration: none;
		transition:
			background var(--dur-fast) var(--ease),
			transform var(--dur-fast) var(--ease);
	}
	.primary-action:hover {
		background: var(--ink);
		transform: translateY(-2px);
	}
	.text-action {
		min-height: 48px;
		align-content: center;
		color: var(--ink);
		font-weight: 700;
		text-decoration: none;
	}
	.photo-story {
		position: relative;
		min-height: 520px;
	}
	.photo {
		position: absolute;
		margin: 0;
		border: 6px solid var(--paper);
		background: var(--paper-2);
		overflow: hidden;
	}
	.photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.photo-one {
		inset: 0 18% 8% 0;
		border-radius: 120px 20px 120px 20px;
	}
	.photo-two {
		right: 0;
		bottom: 0;
		width: 42%;
		height: 55%;
		border-radius: 20px 80px 20px 80px;
	}
	.photo-caption {
		position: absolute;
		top: 4%;
		right: 0;
		display: grid;
		width: 150px;
		height: 150px;
		place-content: center;
		padding: var(--space-4);
		border-radius: 50%;
		color: var(--ink);
		background: var(--gold);
		text-align: center;
		transform: rotate(4deg);
	}
	.photo-caption p {
		margin: 0;
		font-size: var(--text-xs);
		font-weight: 700;
		line-height: 1.2;
	}
	.caption-number {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 700;
		line-height: 1;
	}
	.proof-strip {
		display: grid;
		max-width: 1240px;
		margin: 0 auto var(--space-9);
		padding: var(--space-6) var(--space-4);
		border-block: 1px solid var(--line);
		gap: var(--space-5);
	}
	.proof-strip div {
		display: grid;
		gap: var(--space-1);
	}
	.proof-strip strong {
		font-family: var(--font-display);
		font-size: var(--text-xl);
	}
	.proof-strip span {
		color: var(--ink-60);
		font-size: var(--text-sm);
	}
	.campaigns {
		max-width: 1240px;
		margin: 0 auto;
		padding: var(--space-8) var(--space-4) var(--space-9);
	}
	.section-heading {
		display: grid;
		margin-bottom: var(--space-7);
		gap: var(--space-5);
	}
	h2 {
		margin-bottom: var(--space-5);
		font-size: clamp(2.2rem, 5vw, 4.5rem);
	}
	.section-heading h2 {
		max-width: 14ch;
		margin: 0;
	}
	.section-heading > p {
		max-width: 46ch;
		align-self: end;
		margin: 0;
		color: var(--ink-60);
	}
	.campaign-grid {
		display: grid;
		gap: var(--space-5);
	}
	.prototype-note {
		margin-top: var(--space-4);
		color: var(--ink-60);
		font-size: var(--text-xs);
	}
	.how {
		display: grid;
		max-width: 1240px;
		margin: 0 auto;
		padding: var(--space-9) var(--space-4);
		gap: var(--space-8);
	}
	.how-image {
		position: relative;
		min-height: 560px;
		border-radius: 140px 20px 20px 20px;
		background: var(--paper-2);
		overflow: hidden;
	}
	.how-image img {
		width: 100%;
		height: 100%;
		min-height: 560px;
		object-fit: cover;
	}
	.how-image > p {
		position: absolute;
		right: var(--space-5);
		bottom: var(--space-5);
		left: var(--space-5);
		margin: 0;
		padding: var(--space-5);
		border-radius: var(--radius-md);
		background: rgb(251 247 238 / 92%);
		backdrop-filter: blur(8px);
	}
	.how-image strong {
		display: block;
		font-family: var(--font-display);
		font-size: var(--text-lg);
	}
	.how-copy {
		align-self: center;
	}
	.how-copy h2 {
		max-width: 11ch;
	}
	.how ol {
		padding: 0;
		margin: var(--space-7) 0 0;
		list-style: none;
	}
	.how li {
		display: grid;
		padding: var(--space-5) 0;
		gap: var(--space-4);
		grid-template-columns: 44px 1fr;
		border-top: 1px solid var(--line);
	}
	.how li > span {
		color: var(--aqua-deep);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
	}
	.how h3 {
		margin-bottom: var(--space-2);
		font-size: var(--text-lg);
	}
	.how li p {
		max-width: 50ch;
		margin: 0;
		color: var(--ink-60);
	}
	.trust {
		display: grid;
		color: var(--paper);
		background: var(--ink);
	}
	.trust-copy {
		align-self: center;
		padding: var(--space-8) var(--space-4);
	}
	.trust .eyebrow {
		color: var(--aqua-bright);
	}
	.trust h2 {
		max-width: 12ch;
	}
	.trust-copy > p:not(.eyebrow) {
		max-width: 58ch;
		color: #c8d0cf;
		font-size: var(--text-lg);
	}
	.trust a {
		display: inline-block;
		min-height: 48px;
		margin-top: var(--space-4);
		align-content: center;
		color: var(--aqua-bright);
		font-weight: 700;
	}
	.trust-image {
		min-height: 420px;
	}
	.trust-image img {
		width: 100%;
		height: 100%;
		max-height: 700px;
		object-fit: cover;
	}
	.start {
		padding: var(--space-9) var(--space-4);
		background: var(--gold-tint);
		text-align: center;
	}
	.start h2 {
		max-width: 16ch;
		margin-inline: auto;
	}
	.start > p:not(.eyebrow) {
		max-width: 52ch;
		margin: 0 auto var(--space-6);
		color: var(--ink-60);
	}
	footer {
		display: grid;
		max-width: 1240px;
		margin: 0 auto;
		padding: var(--space-8) var(--space-4);
		gap: var(--space-5);
	}
	footer > p {
		max-width: 65ch;
		margin: 0;
		color: var(--ink-60);
	}
	.footer-links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-5);
	}
	.footer-links a {
		min-height: 48px;
		align-content: center;
		font-weight: 600;
	}
	footer small {
		color: var(--ink-40);
	}
	@media (min-width: 760px) {
		.hero {
			padding-inline: var(--space-6);
			grid-template-columns: minmax(0, 1fr) minmax(420px, 0.9fr);
		}
		.proof-strip {
			padding-inline: var(--space-6);
			grid-template-columns: repeat(3, 1fr);
		}
		.proof-strip div + div {
			padding-left: var(--space-6);
			border-left: 1px solid var(--line);
		}
		.campaigns,
		.how {
			padding-inline: var(--space-6);
		}
		.section-heading {
			grid-template-columns: 1.5fr 0.7fr;
		}
		.campaign-grid {
			grid-template-columns: repeat(3, 1fr);
		}
		.how {
			grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
		}
		.trust {
			grid-template-columns: 1fr 1fr;
		}
		.trust-copy {
			padding: var(--space-9) max(var(--space-6), calc((100vw - 1240px) / 2));
			padding-right: var(--space-8);
		}
		footer {
			padding-inline: var(--space-6);
			grid-template-columns: auto 1fr auto;
		}
		footer small {
			grid-column: 1/-1;
		}
	}
	@media (max-width: 759px) {
		.hero {
			padding-top: var(--space-7);
		}
		.photo-story {
			min-height: 430px;
		}
		.photo-caption {
			width: 118px;
			height: 118px;
		}
		.how {
			padding-top: var(--space-8);
		}
	}
	@media (max-width: 420px) {
		h1 {
			font-size: 3.25rem;
		}
		.hero-actions {
			align-items: flex-start;
			flex-direction: column;
		}
		.photo-story {
			min-height: 360px;
		}
		.photo-one {
			right: 10%;
		}
		.photo-two {
			width: 48%;
			height: 48%;
		}
		.photo-caption {
			top: -4%;
			width: 104px;
			height: 104px;
		}
		.caption-number {
			font-size: var(--text-xl);
		}
	}
</style>

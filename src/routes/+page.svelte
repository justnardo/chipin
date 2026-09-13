<script lang="ts">
	/**
	 * The home page, in the mockup's order: header, photo hero, proof strip,
	 * campaigns, how it works, moments, trust, questions, the start CTA, and
	 * what is happening right now.
	 *
	 * Two things differ from the mockup on purpose.
	 *
	 * The hero. The mockup ran the photograph the full viewport height and laid a
	 * veil across the whole frame — 28% ink at the top, 82% at the bottom — then
	 * set a 6.4rem headline over the painted two-thirds. The picture stopped
	 * reading as a photograph. Here the photo is a capped full-bleed band and the
	 * copy sits on an opaque panel that overlaps its lower edge, so the type has
	 * its own surface and the photograph is untouched everywhere else.
	 *
	 * The content. Every card, island, goal, and progress figure comes from
	 * `PROTOTYPE_CATALOGUE` rather than from strings copied out of the mockup, and
	 * the island filter is built from the islands that actually have a campaign.
	 */
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import CampaignCard from '$lib/components/CampaignCard.svelte';
	import FaqAccordion from '$lib/components/FaqAccordion.svelte';
	import FilmTrack from '$lib/components/FilmTrack.svelte';
	import FilterPills from '$lib/components/FilterPills.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import {
		CAMPAIGN_ISLANDS,
		PROTOTYPE_CATALOGUE,
		campaignIsland,
		islandsPresent,
		type CampaignIsland,
		type CatalogueEntry
	} from '$lib/prototype/campaigns';
	import { PROTOTYPE_PHOTO_DISCLOSURE, photoAlt, photoSize, photoSrc } from '$lib/prototype/photos';

	type Filter = 'all' | CampaignIsland;

	const islands = islandsPresent(PROTOTYPE_CATALOGUE);

	let islandFilter = $state<Filter>('all');

	const islandOptions: readonly { value: Filter; label: string; count: number }[] = [
		{ value: 'all', label: 'All islands', count: PROTOTYPE_CATALOGUE.length },
		...islands.map((id) => ({
			value: id,
			label: CAMPAIGN_ISLANDS[id],
			count: PROTOTYPE_CATALOGUE.filter((entry) => campaignIsland(entry) === id).length
		}))
	];

	const shown = $derived(
		PROTOTYPE_CATALOGUE.filter(
			(entry) => islandFilter === 'all' || campaignIsland(entry) === islandFilter
		)
	);

	/**
	 * Only one catalogue entry has a page behind it. Linking the others would
	 * point at a route that does not exist, so the link is tied to the flag
	 * rather than assumed from the slug.
	 */
	function hrefFor(entry: CatalogueEntry): string | undefined {
		return entry.hasPage ? resolve('/c/rainbow') : undefined;
	}

	const heroPicture = photoSize('friends', 'full');

	const moments = (
		[
			{ id: 'friends', caption: 'The first chip in' },
			{ id: 'plates', caption: 'Sunday dinner' },
			{ id: 'kitchen', caption: 'Everyone brings something' },
			{ id: 'reading', caption: 'After school' },
			{ id: 'produce', caption: 'Market morning' },
			{ id: 'table', caption: 'The long table' }
		] as const
	).map(({ id, caption }) => ({
		src: photoSrc(id),
		alt: photoAlt(id),
		caption
	}));

	const steps = [
		{
			title: 'Tell the story once',
			body: 'Create one focused campaign page with the goal, the host, and the review labels written in plain language.'
		},
		{
			title: 'Share it everywhere',
			body: 'Send a single mobile-ready link through WhatsApp, a social post, or a printed QR flyer.'
		},
		{
			title: 'Keep the progress honest',
			body: 'Donors report what they sent. Hosts mark what arrived. The two sit side by side instead of being merged into one number.'
		}
	];

	const facts = [
		{
			title: 'Progress is a report, not a receipt',
			body: 'Each figure traces back to whoever entered it, and the page says who that was. ChipIn does not upgrade a host-marked total into a bank confirmation, because it cannot see inside the banks.'
		},
		{
			title: 'ChipIn never holds the money',
			body: 'There is no ChipIn balance and nothing to withdraw. Money moves between the donor and the host directly, through the account details the host provides.'
		}
	];

	const faqs = [
		{
			id: 'holds',
			question: 'Does ChipIn hold my money?',
			answer:
				'No. ChipIn never holds, moves, or insures funds. You send money directly to the host through your own bank or wallet, exactly as you would without ChipIn. That means there is no protection to lose — and none to promise.'
		},
		{
			id: 'attested',
			question: 'What does "host attested" mean?',
			answer:
				'It means the host marked that a payment arrived. It is the host’s own record, shown beside the donor’s report. ChipIn does not call that a bank confirmation, a match, or a verified transfer, because it is none of those things.'
		},
		{
			id: 'cost',
			question: 'What does it cost?',
			answer:
				'Nothing for personal campaigns in this prototype. ChipIn is not a payment processor, so there is no per-transaction fee taken out of a gift. What it costs to run a live version is still open, and will be published before intake opens.'
		},
		{
			id: 'islands',
			question: 'Which islands does ChipIn cover?',
			answer:
				'Any of them. A host on any island can start a campaign — the filter above only lists the islands that happen to have one right now, so an empty pill never sends you to a dead end.'
		},
		{
			id: 'real',
			question: 'Is any of this real?',
			answer:
				'No. Every campaign, host, and figure on this site is fictional prototype content, and the photographs are illustrative rather than pictures of these campaigns. Nothing here is a live fundraiser, and no money can be sent to any of it.'
		}
	];

	/**
	 * Example activity, drawn from the same catalogue so the rows cannot drift
	 * from the campaigns they describe. Fictional in every part — the section
	 * says so above the list rather than below it.
	 */
	const activity = [
		{ entry: PROTOTYPE_CATALOGUE[1], act: 'Donor report added', amount: '$150' },
		{ entry: PROTOTYPE_CATALOGUE[2], act: 'Host attested a receipt', amount: '$300' },
		{ entry: PROTOTYPE_CATALOGUE[5], act: 'Campaign created', amount: '$75' }
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
	overHero
	links={[
		{ label: 'Campaigns', href: '#campaigns' },
		{ label: 'How it works', href: '#how' },
		{ label: 'Trust', href: '#trust' }
	]}
/>

<main>
	<!--
		The hero band is capped rather than set to 100svh. Three reasons, in order
		of how much they matter: the photograph is 1400px wide, so a taller band
		throws away more of the picture than it adds; a band that ends lets the
		copy sit on its own surface instead of on top of the image; and a capped
		height means the proof strip is still findable without scrolling past a
		view-height of type.
	-->
	<section class="hero" aria-labelledby="hero-heading">
		<div class="hero-photo">
			<img
				src={photoSrc('friends', 'full')}
				alt={photoAlt('friends')}
				width={heroPicture.width}
				height={heroPicture.height}
				fetchpriority="high"
				decoding="async"
			/>
		</div>

		<div class="hero-copy shell">
			<div class="hero-panel">
				<p class="eyebrow">Made for the way The Bahamas helps</p>
				<h1 id="hero-heading">Everybody puts <em>something</em> in.</h1>
				<p class="hero-lead">
					Give a fundraiser one clear home. Share it anywhere. Let every contribution move directly
					to the people you know.
				</p>
				<div class="hero-actions">
					<Button href={resolve('/discover')}>Browse campaigns</Button>
					<Button variant="secondary" href={resolve('/start')}>Start a campaign</Button>
				</div>
				<p class="disclosure hero-disclosure">{PROTOTYPE_PHOTO_DISCLOSURE}</p>
			</div>
		</div>
	</section>

	<section class="proof" aria-label="What ChipIn commits to">
		<div class="shell proof-inner">
			<div><strong>Direct</strong><span>Money stays between donor and host</span></div>
			<div><strong>Free</strong><span>No platform fees for personal campaigns</span></div>
			<div><strong>Clear</strong><span>Progress comes from host-marked receipts</span></div>
		</div>
	</section>

	<section class="section shell" id="campaigns" aria-labelledby="campaigns-heading">
		<div class="section-head">
			<div>
				<p class="eyebrow">See what neighbours are building</p>
				<h2 id="campaigns-heading">A reason to chip in is never far away.</h2>
			</div>
			<p>
				Six prototype campaigns from across The Bahamas. Filter by island to see what is happening
				where you are, and what each host has marked received so far.
			</p>
		</div>

		<FilterPills
			options={islandOptions}
			value={islandFilter}
			label="Filter campaigns by island"
			onchange={(next) => (islandFilter = next)}
		/>

		<div class="card-grid campaigns-grid">
			{#each shown as campaign (campaign.slug)}
				<CampaignCard
					title={campaign.title}
					category={campaign.category}
					location={campaign.location}
					image={campaign.coverImage}
					imageAlt={campaign.coverAlt}
					received={campaign.attestedCents}
					goal={campaign.goalCents}
					href={hrefFor(campaign)}
				/>
			{/each}
		</div>

		{#if shown.length === 0}
			<p class="empty">No prototype campaign is filed under that island yet.</p>
		{/if}

		<p class="disclosure campaigns-note">
			Prototype campaigns. Hosts, goals, and totals are fictional examples, and a host-marked total
			is not a bank confirmation.
		</p>
	</section>

	<section class="section shell" id="how" aria-labelledby="how-heading">
		<div class="how">
			<div class="how-image">
				<img
					src={photoSrc('gathering')}
					alt={photoAlt('gathering')}
					width="935"
					height="935"
					loading="lazy"
				/>
				<p class="how-caption">
					<strong>The community moves the money.</strong> ChipIn keeps the record straight.
				</p>
			</div>

			<div class="how-copy">
				<p class="eyebrow">Straightforward by design</p>
				<h2 id="how-heading">From WhatsApp share to a clearer thank you.</h2>
				<ol>
					{#each steps as step, index (step.title)}
						<li>
							<span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
							<div>
								<h3>{step.title}</h3>
								<p>{step.body}</p>
							</div>
						</li>
					{/each}
				</ol>
			</div>
		</div>
	</section>

	<section class="band section" id="moments" aria-labelledby="moments-heading">
		<div class="shell">
			<div class="section-head">
				<div>
					<p class="eyebrow">Moments</p>
					<h2 id="moments-heading">What a chip in actually looks like.</h2>
				</div>
				<p>
					Scenes from the kinds of gatherings these campaigns exist for. Scroll or drag sideways.
				</p>
			</div>

			<FilmTrack items={moments} label="Scenes of community gatherings" />

			<p class="disclosure">
				Illustrative scenes, not photographs of these campaigns. Prototype photography — see the
				attribution in the footer.
			</p>
		</div>
	</section>

	<section class="band-dark section" id="trust" aria-labelledby="trust-heading">
		<div class="shell trust">
			<div>
				<p class="eyebrow">Trust before growth</p>
				<h2 id="trust-heading">A clearer page does not make a risky promise.</h2>
				<p class="trust-lede">
					ChipIn reviews specific facts about a host or a campaign and labels exactly what was
					checked. It never calls an outside bank transfer verified, protected, or recoverable.
				</p>
				<p><a href={resolve('/c/rainbow')}>See the campaign trust pattern →</a></p>

				<div class="facts">
					{#each facts as fact (fact.title)}
						<article>
							<h3>{fact.title}</h3>
							<p>{fact.body}</p>
						</article>
					{/each}
				</div>
			</div>

			<div class="trust-image">
				<img
					src={photoSrc('plates')}
					alt={photoAlt('plates')}
					width="935"
					height="935"
					loading="lazy"
				/>
			</div>
		</div>
	</section>

	<section class="section shell" id="faq" aria-labelledby="faq-heading">
		<div class="faq-grid">
			<div>
				<p class="eyebrow">Questions</p>
				<h2 id="faq-heading">The honest answers, including the awkward ones.</h2>
			</div>
			<FaqAccordion items={faqs} label="Frequently asked questions" />
		</div>
	</section>

	<section class="start-band" aria-labelledby="start-heading">
		<div class="shell start-inner">
			<p class="eyebrow">The first chip starts the circle</p>
			<h2 id="start-heading">Give your fundraiser a home people can trust.</h2>
			<p class="start-lede">
				Build a shareable campaign page now in the prototype. Live intake and review still wait on
				pilot gates — this lets you feel the flow today.
			</p>
			<Button href={resolve('/start')}>Start a campaign</Button>
		</div>
	</section>

	<section class="band section-tight" id="happening" aria-labelledby="happening-heading">
		<div class="shell">
			<div class="section-head">
				<div>
					<p class="eyebrow">Prototype activity</p>
					<h2 id="happening-heading">What is happening across the islands.</h2>
				</div>
				<p class="disclosure happening-note">
					Fictional examples of the activity stream. These are not real contributions, and nothing
					here is verified or matched.
				</p>
			</div>

			<ul class="live-list">
				{#each activity as row (row.entry.slug)}
					<li class="live-row">
						<img
							src={row.entry.coverImage}
							alt=""
							width="935"
							height="935"
							loading="lazy"
							aria-hidden="true"
						/>
						<div>
							<h3>{row.entry.title}</h3>
							<p>{CAMPAIGN_ISLANDS[campaignIsland(row.entry)]} · {row.act}</p>
						</div>
						<span class="money live-amt">{row.amount}</span>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<section class="band-dark start-cta" aria-label="Start a campaign">
		<div class="shell start-cta-inner">
			<p class="start-cta-line">Somebody always knows somebody who can help.</p>
			<Button variant="on-dark" href={resolve('/start')}>Start a campaign</Button>
		</div>
	</section>
</main>

<SiteFooter />

<style>
	/*
	 * ---- Hero ----------------------------------------------------------------
	 *
	 * The band height is set in CSS pixels rather than in viewport heights on
	 * purpose. `svh` on a tall phone produced a 700px-tall window onto a 935px
	 * photograph, which is a 1.3x crop of an image that can only be upscaled to
	 * fill it. Capping the band by width keeps the crop close to what the camera
	 * saw: at 390px wide the band is 280px, at 1440px it is 560px, so the same
	 * 3:2 scene reads at roughly its own proportions on both.
	 */
	.hero {
		--hero-band: clamp(260px, 40svh, 340px);
		margin-bottom: var(--space-6);
	}

	.hero-photo {
		position: relative;
		height: var(--hero-band);
		background: var(--paper-2);
		overflow: hidden;
	}

	.hero-photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* Biased above centre: the table and the glasses are the bottom third of
		   this frame, and the faces are what must survive the crop. */
		object-position: center 32%;
	}

	/*
	 * The copy panel overlaps the band instead of sitting on a veil across it.
	 * Nothing is painted over the photograph to make the type legible — the
	 * panel is opaque --surface, so the ink on it measures 17.5:1 and the lead
	 * paragraph 5.2:1, and the only part of the picture behind it is the corner
	 * the panel covers.
	 */
	.hero-copy {
		position: relative;
		z-index: 1;
		margin-top: calc(-1 * var(--space-6));
	}

	.hero-panel {
		max-width: 40rem;
		padding: var(--space-6) var(--space-5) var(--space-5);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		background: var(--surface);
		box-shadow: var(--shadow-lg);
	}

	h1 {
		margin-bottom: var(--space-4);
		font-size: var(--text-hero);
		line-height: 1.02;
		letter-spacing: -0.035em;
		max-width: 16ch;
	}

	h1 em {
		color: var(--aqua-deep);
		font-style: normal;
	}

	.hero-lead {
		max-width: 46ch;
		margin-bottom: var(--space-5);
		color: var(--ink-60);
		font-size: var(--text-md);
	}

	.hero-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.hero-disclosure {
		margin-top: var(--space-5);
		padding-top: var(--space-4);
		border-top: 1px solid var(--line);
	}

	/* ---- Proof strip ------------------------------------------------------- */
	.proof {
		border-block: 1px solid var(--line);
		background: var(--surface);
	}

	.proof-inner {
		display: grid;
		gap: var(--space-4);
		padding-block: var(--space-5);
	}

	.proof-inner div {
		display: grid;
		gap: 2px;
	}

	.proof-inner strong {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		letter-spacing: -0.02em;
	}

	.proof-inner span {
		color: var(--ink-60);
		font-size: var(--text-sm);
	}

	/* ---- Campaigns --------------------------------------------------------- */
	.campaigns-grid {
		margin-top: var(--space-6);
	}

	.empty {
		margin-top: var(--space-6);
		color: var(--ink-60);
	}

	.campaigns-note {
		max-width: 62ch;
		margin-top: var(--space-5);
	}

	/* ---- How it works ------------------------------------------------------ */
	.how {
		display: grid;
		gap: var(--space-6);
	}

	.how-image {
		position: relative;
		overflow: hidden;
		/*
		 * The mockup's 120px/20px corner. Kept as a shape because it is the one
		 * place the visual language bends, but pulled onto the token scale and
		 * paired with the same radius on the other corners so it reads as a
		 * deliberate curve rather than a mis-set border-radius.
		 */
		border-radius: 80px var(--radius-lg) var(--radius-lg) var(--radius-lg);
	}

	.how-image img {
		display: block;
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		object-position: center 38%;
	}

	.how-caption {
		position: absolute;
		inset-inline: var(--space-3);
		bottom: var(--space-3);
		margin: 0;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		background: rgb(251 247 238 / 94%);
		font-size: var(--text-sm);
	}

	.how-caption strong {
		font-family: var(--font-display);
	}

	.how-copy h2 {
		max-width: 20ch;
	}

	.how-copy ol {
		margin: var(--space-6) 0 0;
		padding: 0;
		list-style: none;
	}

	.how-copy li {
		display: grid;
		grid-template-columns: 44px minmax(0, 1fr);
		gap: var(--space-4);
		padding-block: var(--space-5);
		border-top: 1px solid var(--line);
	}

	.how-copy li:last-child {
		border-bottom: 1px solid var(--line);
	}

	.how-copy li span {
		color: var(--aqua-deep);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 700;
	}

	.how-copy li h3 {
		margin-bottom: var(--space-2);
	}

	.how-copy li p {
		max-width: 50ch;
		margin: 0;
		color: var(--ink-60);
	}

	/* ---- Trust ------------------------------------------------------------- */
	.trust {
		display: grid;
		gap: var(--space-6);
	}

	.trust h2 {
		max-width: 20ch;
	}

	.trust-lede {
		max-width: 52ch;
		font-size: var(--text-md);
	}

	.trust a {
		font-weight: 700;
	}

	.facts {
		display: grid;
		gap: var(--space-4);
		margin-top: var(--space-6);
	}

	.facts article {
		padding: var(--space-4);
		border: 1px solid rgb(251 247 238 / 14%);
		border-radius: var(--radius-md);
	}

	.facts h3 {
		margin-bottom: var(--space-2);
		font-size: var(--text-base);
	}

	.facts p {
		margin: 0;
		font-size: var(--text-sm);
	}

	.trust-image {
		overflow: hidden;
		border-radius: var(--radius-lg);
	}

	.trust-image img {
		display: block;
		width: 100%;
		height: 100%;
		max-height: 640px;
		aspect-ratio: 4 / 3;
		object-fit: cover;
	}

	/* ---- Questions --------------------------------------------------------- */
	.faq-grid {
		display: grid;
		gap: var(--space-6);
	}

	.faq-grid h2 {
		max-width: 22ch;
	}

	/* ---- Start CTA --------------------------------------------------------- */
	.start-band {
		background: var(--gold-tint);
	}

	.start-inner {
		display: grid;
		justify-items: center;
		max-width: 46rem;
		padding-block: var(--space-9);
		text-align: center;
	}

	.start-inner h2 {
		max-width: 18ch;
		font-size: var(--text-3xl);
	}

	.start-lede {
		max-width: 52ch;
		margin-bottom: var(--space-5);
		color: var(--ink-60);
		font-size: var(--text-md);
	}

	/* ---- What is happening ------------------------------------------------- */
	.happening-note {
		max-width: 44ch;
	}

	.live-list {
		display: grid;
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.live-row {
		display: grid;
		grid-template-columns: 72px minmax(0, 1fr) auto;
		gap: var(--space-3);
		align-items: center;
		padding: var(--space-3);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		background: var(--surface);
	}

	.live-row img {
		width: 72px;
		height: 72px;
		border-radius: var(--radius-sm);
		object-fit: cover;
	}

	.live-row h3 {
		margin-bottom: 2px;
		font-size: var(--text-base);
	}

	.live-row p {
		margin: 0;
		color: var(--ink-60);
		font-size: var(--text-xs);
	}

	.live-amt {
		font-family: var(--font-display);
		font-size: var(--text-md);
		font-weight: 700;
		white-space: nowrap;
	}

	.start-cta-inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		padding-block: var(--space-6);
	}

	.start-cta-line {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
	}

	/* ---- Wider viewports --------------------------------------------------- */
	@media (min-width: 720px) {
		.hero {
			--hero-band: clamp(320px, 50svh, 470px);
			margin-bottom: var(--space-8);
		}

		.hero-copy {
			margin-top: calc(-1 * var(--space-8));
		}

		.hero-panel {
			padding: var(--space-7) var(--space-7) var(--space-6);
		}

		.hero-actions {
			flex-direction: row;
			align-items: center;
		}

		.proof-inner {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			padding-block: var(--space-6);
		}

		.facts {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.faq-grid {
			grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
			gap: var(--space-7);
		}

		.live-list {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (min-width: 1000px) {
		.hero {
			--hero-band: clamp(400px, 56svh, 620px);
		}

		.hero-copy {
			margin-top: calc(-1 * var(--space-9));
		}

		.how {
			grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
			align-items: center;
			gap: var(--space-8);
		}

		.trust {
			grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
			align-items: center;
			gap: var(--space-8);
		}
	}
</style>

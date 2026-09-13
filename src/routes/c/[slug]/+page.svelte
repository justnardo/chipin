<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import ProgressCoinBar from '$lib/components/ProgressCoinBar.svelte';
	import StatusChip from '$lib/components/StatusChip.svelte';
	import StickyChipInBar from '$lib/components/StickyChipInBar.svelte';
	import SupportWall from '$lib/components/SupportWall.svelte';
	import UpdateFeed from '$lib/components/UpdateFeed.svelte';
	import {
		coverBand,
		formatGoal,
		getCampaign,
		type PrototypeCampaign
	} from '$lib/prototype/campaigns';
	import { PHOTO_BAND, PROTOTYPE_PHOTO_DISCLOSURE } from '$lib/prototype/photos';
	import { campaignAttestedCents, loadReports } from '$lib/prototype/reports';
	import Button from '$lib/components/Button.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	let campaign = $state<PrototypeCampaign | null>(null);
	let loaded = $state(false);
	let shareNote = $state('');
	let receivedCents = $state(0);
	let supporters = $state(0);

	const slug = $derived(page.params.slug ?? '');

	$effect(() => {
		if (!browser) return;
		// Resolve into a local first: reading `campaign` back here would make this effect
		// depend on state it writes, and it would re-run until Svelte bails out.
		const found = getCampaign(slug);
		campaign = found;
		if (found) {
			const reports = loadReports(found.slug);
			receivedCents = campaignAttestedCents(reports);
			supporters = reports.length;
		}
		loaded = true;
	});

	async function shareCampaign() {
		if (!campaign) return;
		const url = window.location.href;
		const text = `${campaign.title} — chip in on ChipIn`;
		try {
			if (navigator.share) {
				await navigator.share({ title: campaign.title, text, url });
				shareNote = 'Thanks for sharing.';
				return;
			}
		} catch {
			/* clipboard fallback */
		}
		try {
			await navigator.clipboard.writeText(url);
			shareNote = 'Campaign link copied — paste it in WhatsApp.';
		} catch {
			shareNote = 'Copy this link: ' + url;
		}
	}

	function shareWhatsApp() {
		if (!campaign) return;
		const url = window.location.href;
		const text = encodeURIComponent(`${campaign.title}\nChip in here: ${url}`);
		window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
	}
</script>

<svelte:head>
	<title>{campaign?.title ?? 'Campaign'} | ChipIn</title>
	<meta
		name="description"
		content="A ChipIn campaign page prototype. Shareable like a familiar fundraiser, with transfers outside ChipIn."
	/>
</svelte:head>

<div class="prototype-banner">
	<strong>Your campaign page</strong>
	<span
		>Saved in this browser on this device. Links work in any tab here, but not on another phone.</span
	>
</div>

<SiteHeader />

<main class="shell">
	{#if !loaded}
		<p class="lede">Loading…</p>
	{:else if !campaign}
		<section class="missing">
			<h1>Campaign not found</h1>
			<p>This prototype page may be from another device or browser.</p>
			<Button href={resolve('/start')}>Start a campaign</Button>
		</section>
	{:else}
		<figure class="cover">
			<img
				src={coverBand(campaign)}
				alt={campaign.coverAlt}
				width={PHOTO_BAND.width}
				height={PHOTO_BAND.height}
			/>
			<figcaption>{PROTOTYPE_PHOTO_DISCLOSURE}</figcaption>
		</figure>

		<section class="hero">
			<div class="intro">
				<div class="meta">
					<StatusChip label={campaign.category} tone="active" />
					<span>{campaign.location}</span>
				</div>
				<h1>{campaign.title}</h1>
				<div class="host-byline">
					<span class="monogram" aria-hidden="true">{campaign.hostName.slice(0, 1)}</span>
					<p>
						Hosted by <strong>{campaign.hostName}</strong><br />
						<span>{campaign.location}</span>
					</p>
				</div>
				<article class="story">
					<p class="eyebrow">Their story</p>
					<p>{campaign.story}</p>
				</article>
				<UpdateFeed campaignSlug={campaign.slug} />
				<SupportWall campaignSlug={campaign.slug} />
			</div>

			<aside class="card accent">
				<p class="amount-label">Marked received</p>
				<p class="amount">{formatGoal(receivedCents)}</p>
				<ProgressCoinBar received={receivedCents / 100} goal={campaign.goalCents / 100} />
				<div class="stat-row">
					<div>
						<strong>{supporters}</strong>
						<span>chipped in</span>
					</div>
					<div>
						<strong>{formatGoal(campaign.goalCents)}</strong>
						<span>goal</span>
					</div>
					<div>
						<strong
							>{campaign.goalCents
								? Math.min(100, Math.round((receivedCents / campaign.goalCents) * 100))
								: 0}%</strong
						>
						<span>of goal</span>
					</div>
				</div>
				<Button full href={resolve('/c/[slug]/chip-in', { slug: campaign.slug })}>
					Chip in now
				</Button>
				<div class="share-row">
					<Button variant="secondary" size="md" full onclick={shareCampaign}>Share</Button>
					<Button variant="secondary" size="md" full onclick={shareWhatsApp}>WhatsApp</Button>
				</div>
				{#if shareNote}
					<p class="note" role="status">{shareNote}</p>
				{/if}
				<p class="note">Money goes to the host by bank transfer — not through ChipIn.</p>
				<a class="host-link" href={resolve('/c/[slug]/host', { slug: campaign.slug })}>Host tools</a
				>
			</aside>
		</section>

		<StickyChipInBar
			href={resolve('/c/[slug]/chip-in', { slug: campaign.slug })}
			receivedLabel={`${formatGoal(receivedCents)} marked received`}
		/>
	{/if}
</main>

<SiteFooter />

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
		padding-block: var(--space-6) var(--space-9);
	}

	@media (max-width: 760px) {
		main {
			padding-bottom: calc(var(--space-9) + 4rem + env(safe-area-inset-bottom));
		}
	}

	.cover {
		margin: 0;
	}

	.cover img {
		display: block;
		width: 100%;
		/* The band crop's own ratio. It was 16/7 against a 1400x665 file, which
		   quietly shaved 8% off the scene for no reason. */
		aspect-ratio: 1400 / 665;
		border-radius: var(--radius-lg);
		object-fit: cover;
	}

	.cover figcaption {
		margin-top: var(--space-2);
		color: var(--ink-60);
		font-size: var(--text-xs);
		line-height: 1.45;
	}

	.hero {
		display: grid;
		gap: var(--space-7);
		margin-top: var(--space-6);
	}

	/* A chip and a place name, not an eyebrow: it keeps the sentence-case
	   treatment the chip needs rather than the uppercase eyebrow type. */
	.meta {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		color: var(--ink-60);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	h1 {
		margin: var(--space-4) 0;
	}

	.host-byline {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-6);
	}

	.host-byline p {
		margin: 0;
		font-size: var(--text-sm);
	}

	.host-byline span:not(.monogram) {
		color: var(--ink-60);
	}

	.monogram {
		display: grid;
		width: 48px;
		height: 48px;
		place-items: center;
		border-radius: 50%;
		color: var(--paper);
		background: var(--ink);
		font-family: var(--font-display);
		font-weight: 700;
	}

	.story p:last-child {
		max-width: 60ch;
		color: var(--ink-60);
		font-size: var(--text-lg);
	}

	.amount-label {
		margin: 0 0 var(--space-1);
		color: var(--ink-60);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.amount {
		margin: 0 0 var(--space-4);
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 700;
	}

	.stat-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-2);
		margin: var(--space-5) 0;
		padding: var(--space-4) 0;
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
		text-align: center;
	}

	.stat-row strong {
		display: block;
		font-family: var(--font-display);
		font-size: var(--text-sm);
	}

	.stat-row span {
		color: var(--ink-60);
		font-size: var(--text-xs);
	}

	.share-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
		margin-top: var(--space-3);
	}

	.note {
		margin: var(--space-4) 0 0;
		color: var(--ink-60);
		font-size: var(--text-xs);
		text-align: center;
	}

	.host-link {
		display: block;
		margin-top: var(--space-4);
		color: var(--ink-60);
		font-size: var(--text-xs);
		font-weight: 600;
		text-align: center;
	}

	.missing {
		max-width: 40rem;
		padding: var(--space-8) 0;
	}

	.lede {
		color: var(--ink-60);
	}

	@media (min-width: 1000px) {
		.hero {
			grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.8fr);
		}
	}
</style>

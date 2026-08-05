<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import BrandMark from '$lib/components/BrandMark.svelte';
	import ProgressCoinBar from '$lib/components/ProgressCoinBar.svelte';
	import StatusChip from '$lib/components/StatusChip.svelte';
	import StickyChipInBar from '$lib/components/StickyChipInBar.svelte';
	import SupportWall from '$lib/components/SupportWall.svelte';
	import UpdateFeed from '$lib/components/UpdateFeed.svelte';
	import { formatGoal, getCampaign, type PrototypeCampaign } from '$lib/prototype/campaigns';
	import { campaignAttestedCents, loadReports } from '$lib/prototype/reports';

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

<header class="site-header">
	<a class="brand-link" href={resolve('/')} aria-label="ChipIn home"><BrandMark /></a>
	<a class="header-action" href={resolve('/start')}>Start another</a>
</header>

<main>
	{#if !loaded}
		<p class="lede">Loading…</p>
	{:else if !campaign}
		<section class="missing">
			<h1>Campaign not found</h1>
			<p>This prototype page may be from another device or browser.</p>
			<a class="primary" href={resolve('/start')}>Start a campaign</a>
		</section>
	{:else}
		<figure class="cover">
			<img src={campaign.coverImage} alt={campaign.coverAlt} width="1600" height="760" />
		</figure>

		<section class="hero">
			<div class="intro">
				<div class="eyebrow">
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
					<p class="kicker">Their story</p>
					<p>{campaign.story}</p>
				</article>
				<UpdateFeed campaignSlug={campaign.slug} />
				<SupportWall campaignSlug={campaign.slug} />
			</div>

			<aside class="card">
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
				<a class="primary" href={resolve('/c/[slug]/chip-in', { slug: campaign.slug })}>
					Chip in now
				</a>
				<div class="share-row">
					<button type="button" class="ghost" onclick={shareCampaign}>Share</button>
					<button type="button" class="ghost" onclick={shareWhatsApp}>WhatsApp</button>
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
		display: flex;
		max-width: 1100px;
		min-height: 76px;
		align-items: center;
		justify-content: space-between;
		margin: 0 auto;
		padding: var(--space-4);
		border-bottom: 1px solid var(--line);
	}

	.brand-link,
	.header-action {
		color: inherit;
		font-weight: 600;
		text-decoration: none;
	}

	.header-action {
		min-height: 48px;
		padding: 0 var(--space-4);
		border: 1px solid var(--ink);
		border-radius: var(--radius-full);
		align-content: center;
		font-size: var(--text-sm);
	}

	main {
		max-width: 1100px;
		margin: 0 auto;
		padding: var(--space-5) var(--space-4) var(--space-9);
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
		width: 100%;
		aspect-ratio: 16 / 7;
		border-radius: var(--radius-lg);
		object-fit: cover;
	}

	.hero {
		display: grid;
		gap: var(--space-7);
		margin-top: var(--space-6);
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
		margin: var(--space-4) 0;
		font-size: var(--text-2xl);
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

	.kicker {
		margin: 0 0 var(--space-3);
		color: var(--aqua-deep);
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.story p:last-child {
		max-width: 60ch;
		color: var(--ink-60);
		font-size: var(--text-lg);
	}

	.card {
		padding: var(--space-6);
		border: 1px solid var(--line);
		border-top: 6px solid var(--gold);
		border-radius: var(--radius-md);
		background: #fffdf8;
		box-shadow: var(--shadow-raise);
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

	.primary,
	.ghost {
		display: grid;
		width: 100%;
		min-height: 52px;
		place-items: center;
		border-radius: var(--radius-md);
		font-weight: 700;
		text-decoration: none;
		cursor: pointer;
	}

	.primary {
		border: 0;
		color: white;
		background: var(--aqua-deep);
	}

	.share-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
		margin-top: var(--space-3);
	}

	.ghost {
		border: 1px solid var(--line);
		color: var(--ink);
		background: transparent;
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

	@media (min-width: 860px) {
		.hero {
			grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.8fr);
		}
	}
</style>

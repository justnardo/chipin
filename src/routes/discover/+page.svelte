<script lang="ts">
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import CampaignCard from '$lib/components/CampaignCard.svelte';
	import FilterPills from '$lib/components/FilterPills.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import {
		PROTOTYPE_CATALOGUE,
		listSessionCampaigns,
		type PrototypeCampaign
	} from '$lib/prototype/campaigns';
	import { PROTOTYPE_PHOTO_DISCLOSURE } from '$lib/prototype/photos';
	import { campaignAttestedCents, loadReports } from '$lib/prototype/reports';

	/**
	 * The grid is the catalogue, not a second copy of it. This page used to
	 * declare three cards of its own, which meant the same fictional fundraiser
	 * had one title and one total here and another set on the home page — and a
	 * card that only this page knew about would still be advertised in the
	 * footer's island column.
	 */
	const featured = PROTOTYPE_CATALOGUE.map((entry) => ({
		slug: entry.slug,
		title: entry.title,
		category: entry.category,
		location: entry.location,
		image: entry.coverImage,
		imageAlt: entry.coverAlt,
		received: entry.attestedCents / 100,
		goal: entry.goalCents / 100,
		// Only Rainbow resolves to a route; the rest are preview cards, so they
		// deliberately get no link rather than a link to nowhere.
		href: entry.hasPage ? resolve('/c/[slug]', { slug: entry.slug }) : undefined
	}));

	const categoryNames = [...new Set(featured.map((c) => c.category))].sort();
	const categoryOptions = [
		{ value: 'All', label: 'All campaigns', count: featured.length },
		...categoryNames.map((category) => ({
			value: category,
			label: category,
			count: featured.filter((c) => c.category === category).length
		}))
	];

	let activeCategory = $state('All');

	const filtered = $derived(
		activeCategory === 'All' ? featured : featured.filter((c) => c.category === activeCategory)
	);

	let mine = $state<Array<PrototypeCampaign & { received: number; goal: number; href: string }>>(
		[]
	);

	$effect(() => {
		if (!browser) return;
		mine = listSessionCampaigns().map((campaign) => {
			const reports = loadReports(campaign.slug);
			const received = campaignAttestedCents(reports) / 100;
			return {
				...campaign,
				received,
				goal: campaign.goalCents / 100,
				// Must go through resolve(): a bare `/c/<slug>` ignores paths.base and
				// 404s on any subpath-hosted deploy.
				href: resolve('/c/[slug]', { slug: campaign.slug })
			};
		});
	});
</script>

<svelte:head>
	<title>Discover campaigns | ChipIn</title>
	<meta
		name="description"
		content="Browse ChipIn fundraisers — a familiar campaign discovery experience for Bahamian giving."
	/>
</svelte:head>

<SiteHeader />

<main>
	<section class="page-head">
		<div class="shell">
			<p class="eyebrow">Discover</p>
			<h1>Find a reason to chip in</h1>
			<p class="lede">
				Browse open campaigns like you would on a familiar fundraising site — then send money
				directly to the host.
			</p>
			<div class="actions">
				<Button href={resolve('/start')}>Start a campaign</Button>
				<Button variant="secondary" href="#featured">See featured</Button>
			</div>
			<!--
				Above the cards on purpose. Every card below carries a photograph, and
				the disclosure is what stops a picture of a preschool being read as
				evidence for the fundraiser printed under it.
			-->
			<p class="disclosure">{PROTOTYPE_PHOTO_DISCLOSURE}</p>
		</div>
	</section>

	{#if mine.length > 0}
		<section class="shell section section-tight" aria-labelledby="mine-heading">
			<div class="section-head">
				<div>
					<p class="eyebrow">In this browser</p>
					<h2 id="mine-heading">Your prototype campaigns</h2>
				</div>
				<p>Saved only on this device session until we add real accounts.</p>
			</div>
			<div class="card-grid">
				{#each mine as campaign (campaign.slug)}
					<CampaignCard
						title={campaign.title}
						category={campaign.category}
						location={campaign.location}
						image={campaign.coverImage}
						imageAlt={campaign.coverAlt}
						received={campaign.received}
						goal={campaign.goal}
						href={campaign.href}
					/>
				{/each}
			</div>
		</section>
	{/if}

	<section class="shell section" id="featured" aria-labelledby="featured-heading">
		<div class="section-head">
			<div>
				<p class="eyebrow">Featured</p>
				<h2 id="featured-heading">Campaigns to explore</h2>
			</div>
			<p>Rainbow is the full interactive demo. The rest preview the discovery layout.</p>
		</div>

		<div class="filter-row">
			<FilterPills
				options={categoryOptions}
				value={activeCategory}
				label="Filter campaigns by category"
				onchange={(next) => (activeCategory = next)}
			/>
			<p class="showing" role="status">
				Showing {filtered.length} of {featured.length}
			</p>
		</div>

		{#if filtered.length === 0}
			<div class="empty">
				<p>No campaigns in this category yet.</p>
			</div>
		{:else}
			<div class="card-grid">
				{#each filtered as campaign (campaign.slug)}
					<CampaignCard {...campaign} />
				{/each}
			</div>
		{/if}
	</section>
</main>

<SiteFooter />

<style>
	.page-head {
		border-bottom: 1px solid var(--line);
		background: var(--paper-2);
		padding-block: var(--space-8) var(--space-7);
	}

	h1 {
		max-width: 16ch;
		margin: 0 0 var(--space-4);
		font-size: var(--text-4xl);
	}

	.lede {
		max-width: 52ch;
		margin: 0;
		color: var(--ink-60);
		font-size: var(--text-lg);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-top: var(--space-6);
	}

	.disclosure {
		max-width: 78ch;
		margin-top: var(--space-6);
		padding-top: var(--space-4);
		border-top: 1px solid var(--line);
	}

	.filter-row {
		display: grid;
		gap: var(--space-3);
		margin-bottom: var(--space-6);
	}

	.showing {
		margin: 0;
		color: var(--ink-60);
		font-size: var(--text-sm);
		font-variant-numeric: tabular-nums;
	}

	.empty {
		padding: var(--space-7) var(--space-6);
		border: 1px dashed var(--border);
		border-radius: var(--radius-md);
		text-align: center;
	}

	.empty p {
		margin: 0;
		color: var(--ink-60);
	}

	@media (min-width: 720px) {
		.filter-row {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: center;
		}

		.showing {
			justify-self: end;
		}
	}
</style>

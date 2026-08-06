<script lang="ts">
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import CampaignCard from '$lib/components/CampaignCard.svelte';
	import {
		listSessionCampaigns,
		RAINBOW_CAMPAIGN,
		type PrototypeCampaign
	} from '$lib/prototype/campaigns';
	import { campaignAttestedCents, loadReports } from '$lib/prototype/reports';

	const featured = [
		{
			title: RAINBOW_CAMPAIGN.title,
			category: RAINBOW_CAMPAIGN.category,
			location: 'Nassau',
			image: RAINBOW_CAMPAIGN.coverImage,
			imageAlt: RAINBOW_CAMPAIGN.coverAlt,
			received: 5240,
			goal: 8000,
			href: resolve('/c/rainbow')
		},
		{
			title: 'A fresh start for the Bain Town reading room',
			category: 'Education',
			location: 'New Providence',
			image:
				'https://images.unsplash.com/photo-1504159506876-f8338247a14a?auto=format&fit=crop&w=900&q=82',
			imageAlt: 'Child reading a book in a bright room',
			received: 3180,
			goal: 6000
		},
		{
			title: 'Restock the neighbourhood food cupboard',
			category: 'Emergency',
			location: 'Grand Bahama',
			image:
				'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=900&q=82',
			imageAlt: 'Volunteers preparing boxes of food',
			received: 7325,
			goal: 10000
		}
	];

	const categories = ['All', ...new Set(featured.map((c) => c.category))];

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
	<section class="hero">
		<p class="kicker">Discover</p>
		<h1>Find a reason to chip in</h1>
		<p class="lede">
			Browse open campaigns like you would on a familiar fundraising site — then send money directly
			to the host.
		</p>
		<div class="actions">
			<a class="primary" href={resolve('/start')}>Start a campaign</a>
			<a class="ghost" href="#featured">See featured</a>
		</div>
	</section>

	{#if mine.length > 0}
		<section class="block" aria-labelledby="mine-heading">
			<div class="heading">
				<div>
					<p class="kicker">In this browser</p>
					<h2 id="mine-heading">Your prototype campaigns</h2>
				</div>
				<p>Saved only on this device session until we add real accounts.</p>
			</div>
			<div class="grid mine-grid">
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

	<section class="block" id="featured" aria-labelledby="featured-heading">
		<div class="heading">
			<div>
				<p class="kicker">Featured</p>
				<h2 id="featured-heading">Campaigns to explore</h2>
			</div>
			<p>Rainbow is the full interactive demo. Other cards preview discovery layout.</p>
		</div>
		<div class="filters" role="tablist" aria-label="Filter by category">
			{#each categories as category (category)}
				<button
					type="button"
					class:active={activeCategory === category}
					onclick={() => (activeCategory = category)}
				>
					{category}
				</button>
			{/each}
		</div>
		{#if filtered.length === 0}
			<div class="empty">
				<p>No featured campaigns in this category yet.</p>
			</div>
		{:else}
			<div class="grid">
				{#each filtered as campaign (campaign.title)}
					<CampaignCard {...campaign} />
				{/each}
			</div>
		{/if}
	</section>
</main>

<style>
	main {
		max-width: 1240px;
		margin: 0 auto;
		padding: var(--space-7) var(--space-4) var(--space-9);
	}

	.hero {
		max-width: 40rem;
		margin-bottom: var(--space-8);
	}

	.kicker {
		margin: 0 0 var(--space-2);
		color: var(--aqua-deep);
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	h1 {
		margin: 0 0 var(--space-4);
		font-size: var(--text-3xl);
	}

	.lede,
	.heading > p {
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

	.block + .block {
		margin-top: var(--space-9);
		padding-top: var(--space-8);
		border-top: 1px solid var(--line);
	}

	.heading {
		display: grid;
		gap: var(--space-3);
		margin-bottom: var(--space-6);
	}

	h2 {
		margin: 0;
		font-size: var(--text-2xl);
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-6);
	}

	.filters button {
		min-height: 44px;
		padding: 0 var(--space-4);
		border: 1px solid var(--line);
		border-radius: var(--radius-full);
		color: var(--ink-60);
		background: transparent;
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
	}

	.filters button.active {
		border-color: var(--aqua-deep);
		color: white;
		background: var(--aqua-deep);
	}

	.empty {
		padding: var(--space-6);
		border: 1px dashed var(--line);
		border-radius: var(--radius-md);
		text-align: center;
	}

	.empty p {
		margin: 0;
		color: var(--ink-60);
	}

	.grid {
		display: grid;
		gap: var(--space-5);
	}

	@media (max-width: 719px) {
		.mine-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (min-width: 720px) {
		.grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.heading {
			grid-template-columns: 1fr 1fr;
			align-items: end;
		}
	}
</style>

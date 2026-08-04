<script lang="ts">
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import BrandMark from '$lib/components/BrandMark.svelte';
	import CampaignCard from '$lib/components/CampaignCard.svelte';
	import {
		listSessionCampaigns,
		RAINBOW_CAMPAIGN,
		type PrototypeCampaign
	} from '$lib/prototype/campaigns';
	import { loadReports } from '$lib/prototype/reports';

	const featured = [
		{
			title: RAINBOW_CAMPAIGN.title,
			category: RAINBOW_CAMPAIGN.category,
			location: 'Nassau',
			image: RAINBOW_CAMPAIGN.coverImage,
			imageAlt: RAINBOW_CAMPAIGN.coverAlt,
			received: 5240,
			goal: 8000,
			href: '/c/rainbow'
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

	let mine = $state<
		Array<PrototypeCampaign & { received: number; goal: number; href: string }>
	>([]);

	$effect(() => {
		if (!browser) return;
		mine = listSessionCampaigns().map((campaign) => {
			const reports = loadReports(campaign.slug);
			const received =
				reports
					.filter((r) => r.status === 'marked_received' && r.attestedCents !== null)
					.reduce((sum, r) => sum + (r.attestedCents ?? 0), 0) / 100;
			return {
				...campaign,
				received,
				goal: campaign.goalCents / 100,
				href: `/c/${campaign.slug}`
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

<header class="site-header">
	<a class="brand-link" href={resolve('/')} aria-label="ChipIn home"><BrandMark /></a>
	<nav aria-label="Primary navigation">
		<a href={resolve('/discover')} aria-current="page">Discover</a>
		<a href={resolve('/start')}>Start a campaign</a>
	</nav>
	<a class="header-action" href={resolve('/start')}>Start</a>
</header>

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
			<div class="grid">
				{#each mine as campaign}
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
		<div class="grid">
			{#each featured as campaign}
				<CampaignCard {...campaign} />
			{/each}
		</div>
	</section>
</main>

<style>
	.site-header {
		display: grid;
		max-width: 1240px;
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

	nav {
		display: none;
		gap: var(--space-6);
	}

	nav a,
	.header-action {
		min-height: 48px;
		align-content: center;
		color: var(--ink);
		font-size: var(--text-sm);
		font-weight: 600;
		text-decoration: none;
	}

	.header-action {
		justify-self: end;
		padding: 0 var(--space-4);
		border: 1px solid var(--ink);
		border-radius: var(--radius-full);
	}

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

	.primary,
	.ghost {
		display: inline-grid;
		min-height: 52px;
		min-width: 160px;
		place-items: center;
		padding: 0 var(--space-5);
		border-radius: var(--radius-md);
		font-weight: 700;
		text-decoration: none;
	}

	.primary {
		color: white;
		background: var(--aqua-deep);
	}

	.ghost {
		border: 1px solid var(--line);
		color: var(--ink);
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

	.grid {
		display: grid;
		gap: var(--space-5);
	}

	@media (min-width: 720px) {
		.site-header {
			grid-template-columns: 1fr auto 1fr;
		}

		nav {
			display: flex;
		}

		.grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.heading {
			grid-template-columns: 1fr 1fr;
			align-items: end;
		}
	}
</style>

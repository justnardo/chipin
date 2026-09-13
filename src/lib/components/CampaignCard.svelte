<script lang="ts">
	import ProgressCoinBar from './ProgressCoinBar.svelte';
	import StatusChip from './StatusChip.svelte';

	let {
		title,
		category,
		location,
		image,
		imageAlt,
		received,
		goal,
		href
	}: {
		title: string;
		category: string;
		location: string;
		image: string;
		imageAlt: string;
		received: number;
		goal: number;
		href?: string;
	} = $props();

	// href arrives already resolved by the caller; see discover/+page.svelte.
</script>

<article class="card flush">
	<div class="image-wrap">
		<!--
			The square source keeps the whole height of the original scene; the 4:3
			window trims a quarter of it, and `object-position` decides which quarter.
			These two attributes are the source's nominal dimensions — the wrapper's
			aspect-ratio is what actually reserves the space, so there is no shift.
		-->
		<img src={image} alt={imageAlt} loading="lazy" width="935" height="935" />
		<StatusChip label={category} tone="active" />
	</div>
	<div class="body">
		<p class="location">{location}</p>
		<h3>
			{#if href}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolved by the caller -->
				<a {href}>{title}</a>
			{:else}
				{title}
			{/if}
		</h3>
		<ProgressCoinBar {received} {goal} />
	</div>
</article>

<style>
	.card {
		display: flex;
		height: 100%;
		min-width: 0;
		flex-direction: column;
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		background: var(--surface);
		overflow: hidden;
		transition:
			transform var(--dur-fast) var(--ease),
			box-shadow var(--dur-fast) var(--ease);
	}

	.card:hover {
		box-shadow: var(--shadow-raise);
		transform: translateY(-3px);
	}

	.image-wrap {
		position: relative;
		/*
		 * 4:3 rather than the mockup's 3:2. The supplied sources are 3:2, and a 3:2
		 * window on the square crop would throw away a third of the scene height —
		 * exactly where the faces are. 4:3 keeps three quarters of it and still
		 * reads as a wide card.
		 */
		aspect-ratio: 4 / 3;
		background: var(--paper-2);
		overflow: hidden;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* Biased above centre: people sit in the upper two-thirds of these scenes
		   and tables and pavement fill the bottom of the frame. */
		object-position: center 42%;
		transition: transform 320ms var(--ease);
	}

	.card:hover img {
		transform: scale(1.025);
	}

	.image-wrap :global(.chip) {
		position: absolute;
		top: var(--space-3);
		left: var(--space-3);
		border: 1px solid rgb(255 255 255 / 65%);
		box-shadow: 0 1px 4px rgb(12 27 26 / 14%);
	}

	.body {
		display: flex;
		flex: 1;
		flex-direction: column;
		padding: var(--space-5);
	}

	.location {
		margin-bottom: var(--space-2);
		color: var(--ink-60);
		font-size: var(--text-xs);
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	h3 {
		margin-bottom: var(--space-6);
		font-size: var(--text-lg);
	}

	h3 a {
		color: inherit;
		text-decoration: none;
	}

	h3 a::after {
		position: absolute;
		content: '';
		inset: 0;
	}

	.card:has(h3 a) {
		position: relative;
	}

	.body :global(.progress) {
		margin-top: auto;
	}
</style>

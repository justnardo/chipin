<script lang="ts">
	import { resolve } from '$app/paths';
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

	const resolvedHref = $derived(
		href === '/c/rainbow' ? resolve('/c/rainbow') : href
	);
</script>

<article class="card">
	<div class="image-wrap">
		<img src={image} alt={imageAlt} loading="lazy" width="720" height="480" />
		<StatusChip label={category} tone="active" />
	</div>
	<div class="body">
		<p class="location">{location}</p>
		<h3>
			{#if resolvedHref}
				<a href={resolvedHref}>{title}</a>
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
		background: #fffdf8;
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
		aspect-ratio: 3 / 2;
		background: var(--paper-2);
		overflow: hidden;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 320ms var(--ease);
	}

	.card:hover img {
		transform: scale(1.025);
	}

	.image-wrap :global(.chip) {
		position: absolute;
		bottom: var(--space-3);
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

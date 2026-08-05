<script lang="ts">
	import { base } from '$app/paths';
	import type { BankChannel } from '$lib/prototype/banks';

	let {
		bank,
		size = 'md'
	}: {
		bank: BankChannel;
		size?: 'sm' | 'md';
	} = $props();

	/**
	 * Real logos are a drop-in: put `<bank.id>.svg` (e.g. rbc.svg, sanddollar.svg)
	 * in static/banks/ and it renders here automatically; any channel without a
	 * file shows the original monogram tile instead. The files there are the
	 * institutions' trademarks, shown beside "send your money to this account" —
	 * written permission belongs with them (see static/banks/README.md).
	 */
	// Keyed to the src, not a boolean: Svelte reuses component instances inside
	// keyed-by-index each blocks, so a plain flag set by one bank's 404 would
	// stick to the next bank rendered by the same instance.
	let failedSrc = $state('');
	const logoSrc = $derived(`${base}/banks/${bank.id}.svg`);
</script>

{#if failedSrc !== logoSrc}
	<img
		class="mark-img {size}"
		src={logoSrc}
		alt=""
		aria-hidden="true"
		loading="lazy"
		onerror={() => (failedSrc = logoSrc)}
	/>
{:else}
	<span class="mark {size}" style="--tint: {bank.tint}; --ink: {bank.ink};" aria-hidden="true">
		{bank.monogram}
	</span>
{/if}

<style>
	.mark,
	.mark-img {
		flex-shrink: 0;
		border-radius: var(--radius-sm);
	}

	.mark {
		display: inline-grid;
		place-items: center;
		background: var(--tint);
		color: var(--ink);
		font-weight: 800;
		letter-spacing: 0.02em;
		line-height: 1;
	}

	.mark-img {
		object-fit: contain;
		background: #fff;
		border: 1px solid var(--line);
		/* Breathing room so wordmark-shaped logos don't touch the tile edges. */
		padding: 3px;
		box-sizing: border-box;
	}

	.mark-img.sm {
		padding: 2px;
	}

	.mark.md,
	.mark-img.md {
		width: 44px;
		height: 44px;
	}

	.mark.md {
		font-size: 12px;
	}

	.mark.sm,
	.mark-img.sm {
		width: 32px;
		height: 32px;
	}

	.mark.sm {
		font-size: 10px;
	}
</style>

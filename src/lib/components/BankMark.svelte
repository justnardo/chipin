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
	 * in static/banks/ and it renders here automatically; until that file exists
	 * the original monogram tile shows instead. The repo ships no logo artwork —
	 * these are the institutions' trademarks, and they appear beside "send your
	 * money to this account", so the owner supplies the files (ideally with the
	 * bank's written permission — see static/banks/README.md).
	 */
	let logoFailed = $state(false);
	const logoSrc = $derived(`${base}/banks/${bank.id}.svg`);
</script>

{#if !logoFailed}
	<img
		class="mark-img {size}"
		src={logoSrc}
		alt=""
		aria-hidden="true"
		loading="lazy"
		onerror={() => (logoFailed = true)}
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

<script lang="ts">
	let { compact = false }: { compact?: boolean } = $props();
</script>

<span class:compact class="brand" aria-label="ChipIn">
	<span>Ch</span><span class="coin-letter">i</span><span>p</span><span class="aqua">In</span>
</span>

<style>
	.brand {
		display: inline-flex;
		align-items: baseline;
		color: var(--ink);
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 700;
		line-height: 1;
		letter-spacing: -0.06em;
	}

	.brand.compact {
		font-size: 1.25rem;
	}

	.aqua {
		color: var(--aqua);
	}

	.coin-letter {
		position: relative;
	}

	.coin-letter::after {
		position: absolute;
		top: -0.08em;
		left: 50%;
		width: 0.22em;
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--gold);
		content: '';
		transform: translate(-35%, -25%);
	}
</style>

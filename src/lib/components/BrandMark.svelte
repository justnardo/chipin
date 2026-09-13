<script lang="ts">
	/**
	 * The wordmark. `tone="onDark"` flips it for the ink panels and the
	 * transparent header over the hero, where ink on ink is invisible. The aqua
	 * shifts a step brighter there too: --aqua on --ink is 3.4:1, under the 4.5:1
	 * the 22px/28px letters need.
	 */
	let { compact = false, tone = 'default' }: { compact?: boolean; tone?: 'default' | 'onDark' } =
		$props();
</script>

<span class:compact class="brand" class:on-dark={tone === 'onDark'} aria-label="ChipIn">
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

	.brand.on-dark {
		color: var(--paper);
	}

	/*
	 * --aqua on a light page is 2.92:1. Left as the mockup has it: this is the
	 * brand name set in the brand's own lettering, which WCAG 1.4.3 exempts from
	 * contrast, and the wordmark is explicitly temporary until real brand assets
	 * land (README). Darkening it would be a brand decision, not a legibility fix.
	 */
	.aqua {
		color: var(--aqua);
	}

	.on-dark .aqua {
		color: var(--aqua-bright);
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

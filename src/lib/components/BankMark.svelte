<script lang="ts">
	import { base } from '$app/paths';
	import type { BankChannel } from '$lib/prototype/banks';

	let {
		bank,
		size = 'md'
	}: {
		bank: BankChannel;
		size?: 'sm' | 'md' | 'lg';
	} = $props();

	/**
	 * One chip construction for all eleven channels: the mark knocked out in
	 * white on the institution's colour.
	 *
	 * Before this, the six channels with real artwork rendered the whole lockup
	 * as an <img> on a white plate, and the five without rendered a saturated
	 * monogram. Two figure/ground polarities, two colour logics, side by side —
	 * and because the lockups are 4:1 wordmarks fitted into a square, the real
	 * logos came out at a 3.6px cap height. They were illegible AND they made
	 * the grid look like two unrelated systems, so the genuine artwork read
	 * worse than the placeholder monograms it replaced.
	 *
	 * The fix is to show the emblem rather than the wordmark. Each emblem is
	 * near-square, so it survives 32px. `bank.emblem` is the window on to it,
	 * measured by scripts/measure_bank_emblems.mjs; the source files are single
	 * colour, so a CSS mask can crop and recolour in one step without touching
	 * them.
	 *
	 * NOTE this knocks a trademark out in flat white, which is a modification of
	 * the mark and a different permission ask from reproducing it faithfully.
	 * It is the best available treatment for monochrome autotraces of 4:1
	 * lockups. Drop a square icon variant in official colour into static/banks/
	 * and the honest move is to render it as-is — see static/banks/README.md.
	 */
	const win = $derived(bank.emblem);

	/**
	 * Crop maths. To make a source window fill the element: scale the image by
	 * 100/window, then position so the window's edge lands on the element's.
	 * The window is geometrically square but its percentages differ per axis,
	 * because these canvases are 3:2 — scaling each axis separately is what
	 * cancels that out and keeps the emblem undistorted.
	 */
	const maskSize = $derived(win ? `${(100 / win.w) * 100}% ${(100 / win.h) * 100}%` : '');
	const maskPos = $derived(
		win
			? `${win.w < 100 ? (win.x / (100 - win.w)) * 100 : 0}% ` +
					`${win.h < 100 ? (win.y / (100 - win.h)) * 100 : 0}%`
			: ''
	);

	// Keyed to the src, not a boolean: Svelte reuses component instances inside
	// keyed-by-index each blocks, so a plain flag set by one bank's missing file
	// would stick to the next bank rendered by the same instance.
	let failedSrc = $state('');
	const logoSrc = $derived(`${base}/banks/${bank.id}.svg`);
	const useEmblem = $derived(Boolean(win) && failedSrc !== logoSrc);
</script>

<!--
	A mask cannot report a 404, so a probe <img> confirms the file is really
	there and flips to the monogram if it is not. Zero-sized and aria-hidden;
	it never paints.
-->
{#if win}
	<img
		class="probe"
		src={logoSrc}
		alt=""
		aria-hidden="true"
		onerror={() => (failedSrc = logoSrc)}
	/>
{/if}

<span
	class="chip {size}"
	class:emblem={useEmblem}
	style="--tint: {bank.tint}; --ink: {bank.ink};{useEmblem
		? ` --mask: url('${logoSrc}'); --mask-size: ${maskSize}; --mask-pos: ${maskPos};`
		: ''}"
	aria-hidden="true"
>
	{#if !useEmblem}{bank.monogram}{/if}
</span>

<style>
	.probe {
		position: absolute;
		width: 0;
		height: 0;
		opacity: 0;
	}

	.chip {
		display: inline-grid;
		flex-shrink: 0;
		place-items: center;
		border-radius: var(--radius-sm);
		background: var(--tint);
		color: var(--ink);
		font-weight: 800;
		letter-spacing: 0.02em;
		line-height: 1;
	}

	/*
	 * The emblem is painted by masking the chip's own foreground colour, so the
	 * knockout is always --ink on --tint and can never come out black-on-black
	 * the way the raw <img> did.
	 */
	.chip.emblem::after {
		content: '';
		width: 100%;
		height: 100%;
		background: var(--ink);
		mask-image: var(--mask);
		mask-size: var(--mask-size);
		mask-position: var(--mask-pos);
		mask-repeat: no-repeat;
	}

	.chip.sm {
		width: 32px;
		height: 32px;
		font-size: 10px;
	}

	.chip.md {
		width: 44px;
		height: 44px;
		font-size: 12px;
	}

	.chip.lg {
		width: 56px;
		height: 56px;
		font-size: 15px;
	}

	/* The emblem needs clear space the letterforms do not. */
	.chip.emblem.sm {
		padding: 5px;
	}

	.chip.emblem.md {
		padding: 7px;
	}

	.chip.emblem.lg {
		padding: 9px;
	}
</style>

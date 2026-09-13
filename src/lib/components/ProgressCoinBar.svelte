<script lang="ts">
	import { calculateProgress, formatAttestedProgress } from '$lib/progress';

	let {
		received,
		goal,
		currency = 'BSD',
		/**
		 * Grow the fill when the bar first scrolls into view. Purely decorative:
		 * the label and the ARIA value carry the real figure from the first frame,
		 * so the growth can never be the only way to read the number, and there is
		 * nothing to misread if it is skipped.
		 */
		animate = true
	}: { received: number; goal: number; currency?: string; animate?: boolean } = $props();

	let percentage = $derived(calculateProgress(received, goal));
	let label = $derived(formatAttestedProgress(received, goal, currency));
	/**
	 * At 0% the coin used to sit half outside the left cap of an empty track and
	 * read as a stray dot — the first thing a new host sees in the live preview
	 * on the start-a-campaign page, and it looked broken. A zero state should
	 * look empty, deliberately.
	 */
	let started = $derived(percentage > 0);

	/** What the track actually draws, which is the real figure unless growing. */
	let drawn = $state(0);

	let host = $state<HTMLElement | null>(null);

	$effect(() => {
		const target = percentage;
		const reduce =
			typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!animate || reduce || typeof IntersectionObserver === 'undefined') {
			drawn = target;
			return;
		}
		drawn = 0;
		if (!host) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				drawn = target;
				observer.disconnect();
			},
			{ threshold: 0.2 }
		);
		observer.observe(host);
		return () => observer.disconnect();
	});
</script>

<div
	class="progress"
	bind:this={host}
	role="progressbar"
	aria-label={label}
	aria-valuemin="0"
	aria-valuemax={goal}
	aria-valuenow={received}
>
	<div class="track">
		<div class="fill" style:width={`${drawn}%`}>
			{#if started}
				<span class="coin" aria-hidden="true"></span>
			{/if}
		</div>
	</div>
	<p class="money">{label}</p>
</div>

<style>
	.progress {
		width: 100%;
	}

	/*
	 * The track was --paper-2, giving the gold fill 1.58:1 against it — below the
	 * 3:1 WCAG asks of meaningful non-text UI, and at a glance the bar read as one
	 * flat gold stripe with no visible end. Ink at 10% takes it to ~3.4:1.
	 *
	 * The old `margin: 7px` was an off-scale value that existed only to make room
	 * for the coin to overhang; padding on the wrapper does that without pushing
	 * the bar off the layout grid.
	 */
	.progress {
		padding-block: var(--space-2);
	}

	.track {
		height: 12px;
		border-radius: var(--radius-full);
		background: rgb(12 27 26 / 10%);
	}

	.fill {
		position: relative;
		height: 100%;
		/* Below ~24px the fill is narrower than the coin and the coin escapes the
		   left cap; this keeps it seated once there is any progress at all. */
		min-width: 24px;
		border-radius: var(--radius-full);
		background: var(--gold);
		transition: width var(--dur-slow) var(--ease);
	}

	.fill:not(:has(.coin)) {
		min-width: 0;
	}

	.coin {
		position: absolute;
		top: 50%;
		right: 0;
		width: 24px;
		height: 24px;
		border: 4px solid var(--paper);
		border-radius: 50%;
		/* Separates the coin from the gold fill it sits on top of. */
		outline: 1px solid rgb(12 27 26 / 8%);
		background: var(--gold);
		transform: translate(50%, -50%);
	}

	p {
		margin: var(--space-3) 0 0;
		color: var(--ink-60);
		font-size: var(--text-sm);
	}
</style>

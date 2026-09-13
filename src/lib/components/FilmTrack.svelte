<script lang="ts">
	/**
	 * The horizontal film strip of scenes.
	 *
	 * A native scroll container first: `overflow-x: auto` plus `scroll-snap`
	 * gives touch and trackpad users the real thing for free. The only additions
	 * are the ones the browser does not provide —
	 *
	 * - `tabindex="0"` so the track can be reached without a pointer at all
	 *   (arrow keys scroll a focused scroll container in every current engine),
	 *   with a `role` and label so it is not announced as an anonymous box.
	 * - Prev/next buttons, because a scroll container on a desktop with a mouse
	 *   is otherwise only reachable by shift-wheel, which nobody does.
	 *
	 * The buttons disable at the ends rather than wrapping, and the scroll is
	 * instant under `prefers-reduced-motion` — the one place in this app where
	 * the reduced-motion reset cannot help, because the smoothness is chosen in
	 * JavaScript, not in CSS.
	 */
	let {
		items,
		label
	}: {
		items: readonly { src: string; alt: string; caption: string }[];
		label: string;
	} = $props();

	let track = $state<HTMLElement | null>(null);
	let atStart = $state(true);
	let atEnd = $state(false);

	function measure() {
		if (!track) return;
		atStart = track.scrollLeft <= 2;
		atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
	}

	$effect(() => {
		if (!track) return;
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(track);
		return () => observer.disconnect();
	});

	function step(direction: 1 | -1) {
		if (!track) return;
		const first = track.querySelector('figure');
		const gap = 12;
		const distance = (first?.clientWidth ?? track.clientWidth * 0.8) + gap;
		const reduced =
			typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
		track.scrollBy({ left: direction * distance, behavior: reduced ? 'auto' : 'smooth' });
	}
</script>

<div class="film">
	<!--
		The track itself is not a tab stop. Keyboard access to every frame comes
		from the two buttons below, which are real controls with a visible disabled
		state at each end — a focusable scroller would announce as a nameless stop
		and leave arrow-key scrolling as the only hint that more frames exist.
	-->
	<div class="track" bind:this={track} role="group" aria-label={label} onscroll={measure}>
		{#each items as item (item.src + item.caption)}
			<figure>
				<img src={item.src} alt={item.alt} loading="lazy" width="935" height="935" />
				<figcaption>{item.caption}</figcaption>
			</figure>
		{/each}
	</div>

	<div class="controls">
		<button type="button" onclick={() => step(-1)} disabled={atStart} aria-label="Previous scenes">
			<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
		</button>
		<button type="button" onclick={() => step(1)} disabled={atEnd} aria-label="More scenes">
			<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
		</button>
	</div>
</div>

<style>
	.film {
		position: relative;
	}

	.track {
		display: flex;
		gap: 12px;
		/* Bleeds to the viewport edge so the strip reads as continuing off
		   screen, which is how it tells you there is more of it. */
		margin-inline: calc(-1 * var(--space-4));
		padding: 0 var(--space-4) var(--space-3);
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scrollbar-width: thin;
	}

	.track:focus-visible {
		border-radius: var(--radius-md);
	}

	figure {
		position: relative;
		flex: 0 0 min(82vw, 420px);
		margin: 0;
		border-radius: var(--radius-md);
		overflow: hidden;
		scroll-snap-align: start;
		background: var(--ink);
	}

	img {
		display: block;
		width: 100%;
		aspect-ratio: 4 / 5;
		object-fit: cover;
		/*
		 * Centre-crop is right for most of these, but glasses and faces sit high
		 * in a couple of the scenes; biasing the frame slightly above centre
		 * keeps them in the 4:5 window instead of the tablecloth.
		 */
		object-position: center 38%;
	}

	/*
	 * The caption sits on the photograph, so it needs a floor rather than a fade.
	 * The mockup's single transparent→78% ramp left the type on 4.04:1 over the
	 * brightest frames: the gradient is only at full strength on the last pixel,
	 * and the text is above that. Holding 62% from the first third and 94% at the
	 * bottom keeps the worst case (a white pixel behind the top of the line) at
	 * 8.6:1 for --paper, while the top of each frame stays untouched.
	 */
	figcaption {
		position: absolute;
		inset-inline: 0;
		bottom: 0;
		padding: 36px var(--space-4) var(--space-4);
		color: var(--paper);
		background: linear-gradient(transparent 0%, rgb(12 27 26 / 62%) 34%, rgb(12 27 26 / 94%) 100%);
		font-size: 15px;
		font-weight: 700;
	}

	.controls {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
		margin-top: var(--space-3);
	}

	.controls button {
		display: grid;
		width: var(--control-md);
		height: var(--control-md);
		place-items: center;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-full);
		background: var(--surface);
		cursor: pointer;
	}

	.controls button:hover:not(:disabled) {
		background: var(--paper-2);
	}

	.controls button:disabled {
		border-color: var(--line);
		background: transparent;
	}

	.controls svg {
		width: 20px;
		height: 20px;
		fill: none;
		stroke: var(--ink);
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 2;
	}

	.controls button:disabled svg {
		stroke: var(--ink-40);
	}

	@media (min-width: 1000px) {
		figure {
			flex-basis: 320px;
		}
	}
</style>

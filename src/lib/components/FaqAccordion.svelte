<script lang="ts">
	/**
	 * The FAQ, one answer open at a time.
	 *
	 * The mockup animates this with `<details>`-less divs, inline `hidden`, and a
	 * glyph swap. Two things had to change to survive a keyboard and a screen
	 * reader: each question is a real `<button>` inside its own heading (so the
	 * document still has a heading outline and the control is not a bare div),
	 * and the panel is genuinely removed with `hidden` rather than being clipped
	 * to zero height while still announcing its text.
	 *
	 * One open at a time because these answers are short and alongside each other;
	 * leaving every panel open turns a five-question list into a wall.
	 */
	let {
		items,
		label
	}: {
		items: readonly { id: string; question: string; answer: string }[];
		label: string;
	} = $props();

	/*
	 * The first panel opens on load so the list does not read as a row of
	 * unanswered headings.
	 */
	// svelte-ignore state_referenced_locally
	let open = $state<string | null>(items[0]?.id ?? null);

	function toggle(id: string) {
		open = open === id ? null : id;
	}
</script>

<div class="faq" role="group" aria-label={label}>
	{#each items as item (item.id)}
		<div class="item">
			<h3>
				<button
					type="button"
					aria-expanded={open === item.id}
					aria-controls={`faq-${item.id}`}
					onclick={() => toggle(item.id)}
				>
					{item.question}
					<span class="glyph" aria-hidden="true">{open === item.id ? '−' : '+'}</span>
				</button>
			</h3>
			<div class="answer" id={`faq-${item.id}`} hidden={open !== item.id}>
				<p>{item.answer}</p>
			</div>
		</div>
	{/each}
</div>

<style>
	.item {
		border-top: 1px solid var(--line);
	}

	.item:last-child {
		border-bottom: 1px solid var(--line);
	}

	h3 {
		margin: 0;
		font-size: inherit;
	}

	button {
		display: flex;
		width: 100%;
		min-height: 64px;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		padding: var(--space-3) 0;
		border: 0;
		color: var(--ink);
		background: none;
		font-family: var(--font-display);
		font-size: 1.15rem;
		font-weight: 700;
		text-align: left;
		cursor: pointer;
	}

	button:hover {
		color: var(--aqua-deep);
	}

	.glyph {
		color: var(--aqua-deep);
		font-size: 1.4rem;
		line-height: 1;
	}

	.answer {
		max-width: 62ch;
		padding-bottom: var(--space-4);
	}

	.answer p {
		margin: 0;
		color: var(--ink-60);
	}
</style>

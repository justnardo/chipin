<script lang="ts">
	import BankMark from '$lib/components/BankMark.svelte';
	import { BANK_CHANNELS, type BankChannel } from '$lib/prototype/banks';

	/**
	 * The one bank picker.
	 *
	 * Three surfaces asked "which bank?" in three different ways. The host's
	 * receiving-account step and the donor's sender step shared a stylesheet but
	 * not their semantics — one was a native radio group (one tab stop, arrow
	 * keys), the other eleven `aria-pressed` buttons (eleven tab stops) that
	 * silently cleared the selection on a second tap. Same skin, different
	 * keyboard model, different failure modes.
	 *
	 * They also shared `auto-fill minmax(104px, 1fr)`, which spends extra width
	 * on more columns rather than wider tiles: measured column counts ran
	 * 2 → 6 → 3 → 4 across the breakpoints, so the narrowest tiles in the whole
	 * responsive range were at 768px and desktop wrapped labels worse than
	 * mobile did.
	 *
	 * One component, one radiogroup, explicit columns. Surfaces differ by how
	 * much room the choice deserves, not by geometry:
	 *
	 *   list    — one per row, full institution name, 44px mark. For the host's
	 *             receiving account: the highest-consequence choice in the
	 *             product, and the one screen where slow and unambiguous wins.
	 *   compact — two columns, short name, 32px mark. For advisory choices.
	 */
	let {
		value = $bindable(''),
		channels = BANK_CHANNELS,
		variant = 'compact',
		labelledBy,
		allowNone = false,
		noneLabel = 'Prefer not to say'
	}: {
		value?: string;
		channels?: BankChannel[];
		variant?: 'list' | 'compact';
		labelledBy?: string;
		/**
		 * Offer an explicit opt-out. The sender picker needs one — it used to be
		 * reachable only by tapping your own bank a second time, which read as a
		 * misfire and wiped the settlement estimate with no explanation.
		 */
		allowNone?: boolean;
		noneLabel?: string;
	} = $props();

	/** Banks, then the credit union, then wallets, then Other — a stable order
	    that groups like with like without spending 90px on three headers. */
	const KIND_ORDER = { bank: 0, 'credit-union': 1, wallet: 2 } as const;
	const ordered = $derived(
		[...channels].sort((a, b) => {
			if (a.id === 'other') return 1;
			if (b.id === 'other') return -1;
			return KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
		})
	);

	const KIND_LABEL = { bank: 'Bank', 'credit-union': 'Credit union', wallet: 'Wallet' } as const;
</script>

<div
	class="picker {variant}"
	role="radiogroup"
	aria-labelledby={labelledBy}
	aria-required={!allowNone}
>
	{#each ordered as bank (bank.id)}
		<label class="option" class:checked={value === bank.id}>
			<input type="radio" name="bank-{labelledBy ?? 'picker'}" value={bank.id} bind:group={value} />
			<BankMark {bank} size={variant === 'list' ? 'md' : 'sm'} />
			<span class="text">
				<span class="name">{variant === 'list' ? bank.name : bank.shortName}</span>
				{#if variant === 'list'}
					<span class="kind">{KIND_LABEL[bank.kind]}</span>
				{/if}
			</span>
			<svg class="tick" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9" /></svg>
		</label>
	{/each}

	{#if allowNone}
		<label class="option none" class:checked={value === ''}>
			<input type="radio" name="bank-{labelledBy ?? 'picker'}" value="" bind:group={value} />
			<span class="text"><span class="name">{noneLabel}</span></span>
			<svg class="tick" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9" /></svg>
		</label>
	{/if}
</div>

<!--
	The app carried no user-facing affiliation notice at all — the only "no
	relationship" wording lived in a source comment and a README, which is
	nowhere a donor can read it. See THREAT-MODEL T13.
-->
<p class="affiliation">
	ChipIn is not affiliated with, endorsed by, or connected to any of these institutions. Bank names
	and logos are the property of their owners.
</p>

<style>
	.picker.compact {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-2);
	}

	/* Explicit counts, not auto-fill: extra width should widen tiles so labels
	   fit, never add a column that makes them narrower. */
	@media (min-width: 560px) {
		.picker.compact {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (min-width: 900px) {
		.picker.compact {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	.picker.list {
		display: grid;
		overflow: hidden;
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
	}

	.option {
		display: grid;
		align-items: center;
		gap: var(--space-3);
		cursor: pointer;
		font-weight: 700;
		grid-template-columns: auto minmax(0, 1fr) auto;
	}

	.compact .option {
		min-height: var(--control-lg);
		padding: var(--space-2);
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
		background: var(--paper);
		font-size: var(--text-xs);
	}

	.list .option {
		min-height: 64px;
		padding: var(--space-3) var(--space-4);
		background: var(--surface);
		font-size: var(--text-sm);
	}

	.list .option + .option {
		border-top: 1px solid var(--line);
	}

	.option input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
	}

	.text {
		display: grid;
		min-width: 0;
		gap: 1px;
	}

	/*
	 * `overflow-wrap: anywhere` was breaking labels mid-word — none of these
	 * names contain a space, so any two-line render was necessarily a break
	 * like "Commonweal/th". Truncate instead; the full name is in the title.
	 */
	.name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.kind {
		color: var(--ink-60);
		font-size: var(--text-xs);
		font-weight: 400;
	}

	/*
	 * Selected state was a 1px border swap on an identical background — the
	 * only cue, among eleven identical tiles. Fill, rule, and a tick now, so it
	 * does not rest on hairline contrast alone.
	 */
	.option.checked {
		border-color: var(--aqua-deep);
		background: var(--aqua-tint);
	}

	.list .option.checked {
		box-shadow: inset 3px 0 0 var(--aqua-deep);
	}

	.option:hover:not(.checked) {
		background: var(--paper-2);
	}

	.option:focus-within {
		outline: 2px solid var(--aqua-deep);
		outline-offset: -2px;
	}

	.tick {
		width: 20px;
		height: 20px;
		fill: none;
		stroke: var(--aqua-deep);
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 2.5;
		visibility: hidden;
	}

	.option.checked .tick {
		visibility: visible;
	}

	.affiliation {
		margin: var(--space-2) 0 0;
		color: var(--ink-60);
		font-size: var(--text-xs);
	}

	/* The opt-out has no mark, so keep its label in the same column as the rest. */
	.none {
		grid-template-columns: minmax(0, 1fr) auto;
		color: var(--ink-60);
		font-weight: 600;
	}
</style>

<script lang="ts">
	/**
	 * "When did you send it?"
	 *
	 * This was a bare <input type="date">, which is three problems at once: it
	 * renders differently on every platform, it exposes ISO format nobody chose,
	 * and it asks the wrong question. Someone reporting a bank transfer sent it
	 * today or yesterday in almost every case — making them open an OS date wheel
	 * to find today is friction on the one screen that must not have any.
	 *
	 * Quick-picks first, native picker behind "Another day". Deliberately still
	 * the native picker: it is accessible, localised, and free, and building a
	 * custom calendar would be worse on both counts for a low-bandwidth audience.
	 */
	let { value = $bindable(''), id = 'transfer-date' }: { value?: string; id?: string } = $props();

	function isoDay(offsetDays: number): string {
		const now = new Date();
		// Day arithmetic in the constructor rather than setDate, so the instance is
		// never mutated (the constructor normalises an out-of-range day for us).
		const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offsetDays);
		// Built by hand rather than toISOString(): that converts to UTC and rolls
		// the date backwards for anyone west of Greenwich, which is all of the
		// Bahamas — "today" would read as yesterday for most of the evening.
		const month = `${d.getMonth() + 1}`.padStart(2, '0');
		const day = `${d.getDate()}`.padStart(2, '0');
		return `${d.getFullYear()}-${month}-${day}`;
	}

	const today = $derived(isoDay(0));
	const yesterday = $derived(isoDay(1));
	const isOther = $derived(value !== today && value !== yesterday);

	let showPicker = $state(false);

	/** Human-readable echo, so the donor can confirm without decoding an ISO string. */
	const readable = $derived.by(() => {
		if (!value) return '';
		const d = new Date(`${value}T00:00:00`);
		if (Number.isNaN(d.getTime())) return '';
		return new Intl.DateTimeFormat('en-BS', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(d);
	});

	function pick(next: string) {
		value = next;
		showPicker = false;
	}
</script>

<fieldset class="field">
	<legend>Date sent</legend>

	<div class="options" role="group" aria-label="Date sent">
		<button
			type="button"
			class="option"
			class:selected={value === today}
			aria-pressed={value === today}
			onclick={() => pick(today)}
		>
			Today
		</button>
		<button
			type="button"
			class="option"
			class:selected={value === yesterday}
			aria-pressed={value === yesterday}
			onclick={() => pick(yesterday)}
		>
			Yesterday
		</button>
		<button
			type="button"
			class="option"
			class:selected={isOther && value !== ''}
			aria-pressed={showPicker || (isOther && value !== '')}
			onclick={() => (showPicker = !showPicker)}
		>
			Another day
		</button>
	</div>

	{#if showPicker || (isOther && value !== '')}
		<label class="picker">
			<span class="visually-hidden">Choose the date you sent the transfer</span>
			<!-- max=today: you cannot have already sent a transfer in the future.
			     The old field was unbounded and accepted 2031. -->
			<input {id} type="date" bind:value max={today} />
		</label>
	{/if}

	{#if readable}
		<p class="echo" aria-live="polite">{readable}</p>
	{/if}
</fieldset>

<style>
	.field {
		min-width: 0;
		margin: 0;
		padding: 0;
		border: 0;
	}

	legend {
		padding: 0;
		margin-bottom: var(--space-2);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.options {
		display: grid;
		gap: var(--space-2);
		grid-template-columns: repeat(3, 1fr);
	}

	.option {
		min-height: var(--control-lg);
		padding: 0 var(--space-2);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--surface);
		color: var(--ink);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition:
			border-color var(--dur-fast) var(--ease),
			background-color var(--dur-fast) var(--ease);
	}

	.option:hover {
		border-color: var(--border-strong);
		background: var(--paper-2);
	}

	/* Matches the amount chips one step earlier in the same flow — a real 2px
	   border rather than the inset box-shadow trick that was compensating for
	   the border not being 2px to begin with. */
	.option.selected {
		border: 2px solid var(--aqua-deep);
		background: var(--aqua-tint);
		color: var(--aqua-deep);
	}

	.picker {
		display: block;
		margin-top: var(--space-3);
	}

	.picker input {
		width: 100%;
		min-height: var(--control-lg);
		appearance: none;
	}

	.echo {
		margin: var(--space-2) 0 0;
		color: var(--ink-60);
		font-size: var(--text-sm);
	}
</style>

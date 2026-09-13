<script lang="ts" generics="T extends string">
	/**
	 * The filter row the mockup puts above a campaign grid.
	 *
	 * Pills are toggle buttons rather than tabs: "All islands" is a superset, not
	 * a sibling, and pressing the active pill again should not be the only way to
	 * get back. `aria-pressed` says exactly that, and every pill stays reachable
	 * in one Tab press instead of the two-step move a tablist needs.
	 *
	 * The options are passed in rather than declared here because they come from
	 * the data being filtered — a pill for an island with nothing in it is a dead
	 * end, so callers build the list from what they are about to show.
	 */
	let {
		options,
		value,
		label,
		onchange
	}: {
		options: readonly { value: T; label: string; count?: number }[];
		value: T;
		label: string;
		onchange: (next: T) => void;
	} = $props();
</script>

<div class="pills" role="group" aria-label={label}>
	{#each options as option (option.value)}
		<button
			type="button"
			class="pill"
			aria-pressed={option.value === value}
			onclick={() => onchange(option.value)}
		>
			{option.label}
			{#if option.count !== undefined}
				<span class="count">{option.count}</span>
			{/if}
		</button>
	{/each}
</div>

<style>
	.pills {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.pill {
		display: inline-flex;
		min-height: 40px;
		align-items: center;
		gap: var(--space-2);
		padding: 0 var(--space-4);
		border: 1px solid var(--border);
		border-radius: var(--radius-full);
		color: var(--ink);
		background: var(--surface);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color var(--dur-fast) var(--ease),
			border-color var(--dur-fast) var(--ease);
	}

	.pill:hover {
		border-color: var(--ink-60);
		background: var(--paper-2);
	}

	.pill[aria-pressed='true'] {
		border-color: var(--aqua-deep);
		color: var(--aqua-deep);
		background: var(--aqua-tint);
	}

	.count {
		color: var(--ink-60);
		font-size: var(--text-xs);
		font-variant-numeric: tabular-nums;
	}

	.pill[aria-pressed='true'] .count {
		color: var(--aqua-deep);
	}
</style>

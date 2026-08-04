<script lang="ts">
	type Tone = 'active' | 'received' | 'pending' | 'paused' | 'disputed' | 'closed';

	let { label, tone }: { label: string; tone: Tone } = $props();
</script>

<span class="chip {tone}">
	<svg viewBox="0 0 16 16" aria-hidden="true">
		{#if tone === 'active' || tone === 'received'}
			<path d="m3.2 8.2 3 3L12.8 4.8" />
		{:else if tone === 'pending'}
			<circle cx="8" cy="8" r="5.5" />
			<path d="M8 4.8v3.5l2.2 1.4" />
		{:else if tone === 'paused'}
			<circle cx="8" cy="8" r="5.5" />
			<path d="M6.4 5.6v4.8M9.6 5.6v4.8" />
		{:else if tone === 'disputed'}
			<path d="M8 2.2 14 13H2L8 2.2Z" />
			<path d="M8 6v3.2M8 11.2v.1" />
		{:else}
			<path d="M3 5h10v8H3V5Zm1-2h8v2H4V3Z" />
		{/if}
	</svg>
	{label}
</span>

<style>
	.chip {
		display: inline-flex;
		min-height: 32px;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	svg {
		width: 16px;
		height: 16px;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.7;
	}

	.active,
	.received {
		color: var(--status-received);
		background: #e4f1e9;
	}

	.pending {
		color: var(--status-pending);
		background: var(--gold-tint);
	}

	.paused,
	.closed {
		color: var(--status-paused);
		background: var(--paper-2);
	}

	.disputed {
		color: var(--status-dispute);
		background: #f9e6e2;
	}
</style>

<script lang="ts">
	let { label, date }: { label: string; date: string } = $props();
</script>

<div class="review-label">
	<svg viewBox="0 0 20 20" aria-hidden="true">
		<path d="m5.2 10.2 3 3 6.6-6.6" />
	</svg>
	<div>
		<strong>{label}</strong>
		<span>Reviewed {date}</span>
	</div>
</div>

<style>
	.review-label {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
	}

	svg {
		width: 24px;
		height: 24px;
		flex: 0 0 auto;
		border-radius: 50%;
		background: var(--aqua-tint);
		fill: none;
		stroke: var(--aqua-deep);
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.8;
	}

	strong,
	span {
		display: block;
	}

	strong {
		font-size: var(--text-sm);
	}

	span {
		margin-top: 2px;
		color: var(--ink-60);
		font-size: var(--text-xs);
	}
</style>

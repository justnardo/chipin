<script lang="ts">
	import { calculateProgress, formatAttestedProgress } from '$lib/progress';

	let {
		received,
		goal,
		currency = 'BSD'
	}: { received: number; goal: number; currency?: string } = $props();

	let percentage = $derived(calculateProgress(received, goal));
	let label = $derived(formatAttestedProgress(received, goal, currency));
</script>

<div
	class="progress"
	role="progressbar"
	aria-label={label}
	aria-valuemin="0"
	aria-valuemax={goal}
	aria-valuenow={received}
>
	<div class="track">
		<div class="fill" style:width={`${percentage}%`}>
			<span class="coin" aria-hidden="true"></span>
		</div>
	</div>
	<p>{label}</p>
</div>

<style>
	.progress {
		width: 100%;
	}

	.track {
		height: 10px;
		margin: 7px;
		border-radius: var(--radius-full);
		background: var(--paper-2);
	}

	.fill {
		position: relative;
		height: 100%;
		min-width: 0;
		border-radius: var(--radius-full);
		background: var(--gold);
		transition: width 320ms var(--ease);
	}

	.coin {
		position: absolute;
		top: 50%;
		right: 0;
		width: 24px;
		height: 24px;
		border: 4px solid var(--paper);
		border-radius: 50%;
		background: var(--gold);
		transform: translate(50%, -50%);
	}

	p {
		margin: var(--space-3) 0 0;
		color: var(--ink-60);
		font-size: var(--text-sm);
	}
</style>

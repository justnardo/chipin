<script lang="ts">
	let {
		href,
		label = 'Chip in now',
		receivedLabel
	}: {
		href: string;
		label?: string;
		receivedLabel: string;
	} = $props();
</script>

<div class="sticky" role="region" aria-label="Quick chip in">
	<div class="inner">
		<p>{receivedLabel}</p>
		<a href={href}>{label}</a>
	</div>
</div>

<style>
	.sticky {
		display: none;
	}

	@media (max-width: 760px) {
		.sticky {
			position: fixed;
			right: 0;
			bottom: 0;
			left: 0;
			z-index: 40;
			display: block;
			padding: var(--space-3) var(--space-4) calc(var(--space-3) + env(safe-area-inset-bottom));
			border-top: 1px solid var(--line);
			background: rgb(251 247 238 / 94%);
			backdrop-filter: blur(10px);
			box-shadow: 0 -8px 24px rgb(12 27 26 / 10%);
		}

		.inner {
			display: grid;
			max-width: 720px;
			margin: 0 auto;
			gap: var(--space-3);
			grid-template-columns: 1fr auto;
			align-items: center;
		}

		p {
			margin: 0;
			color: var(--ink-60);
			font-size: var(--text-sm);
			font-weight: 600;
		}

		a {
			display: grid;
			min-width: 140px;
			min-height: 48px;
			place-items: center;
			padding: 0 var(--space-4);
			border-radius: var(--radius-md);
			color: white;
			background: var(--aqua-deep);
			font-weight: 700;
			text-decoration: none;
		}
	}
</style>

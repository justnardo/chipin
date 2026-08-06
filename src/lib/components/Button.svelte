<script lang="ts">
	/**
	 * The one button.
	 *
	 * Before this, `.primary` was declared in seven files and `.ghost` in nine,
	 * at four different heights (44/48/52/54) and three different box models —
	 * some `display: grid; width: 100%`, some shrink-wrapped `inline-grid`. The
	 * same action looked like a different control depending on which page you
	 * were on, which is most of why the app read as unfinished.
	 *
	 * Renders an <a> when `href` is set and a <button> otherwise, because half
	 * the duplicates were links dressed as buttons and they never matched the
	 * real ones.
	 */
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'on-dark';
	type Size = 'sm' | 'md' | 'lg';

	let {
		variant = 'primary',
		size = 'lg',
		full = false,
		href = undefined,
		type = 'button',
		disabled = false,
		onclick = undefined,
		children,
		...rest
	}: {
		variant?: Variant;
		size?: Size;
		full?: boolean;
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		onclick?: (event: MouseEvent) => void;
		children: Snippet;
		[key: string]: unknown;
	} = $props();
</script>

{#if href}
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- callers resolve their own hrefs -->
	<a class="btn {variant} {size}" class:full {href} {...rest}>
		{@render children()}
	</a>
{:else}
	<button class="btn {variant} {size}" class:full {type} {disabled} {onclick} {...rest}>
		{@render children()}
	</button>
{/if}

<style>
	.btn {
		display: inline-grid;
		place-items: center;
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		font-family: var(--font-body);
		font-weight: 700;
		line-height: 1;
		text-align: center;
		text-decoration: none;
		cursor: pointer;
		transition:
			background-color var(--dur-fast) var(--ease),
			border-color var(--dur-fast) var(--ease),
			box-shadow var(--dur-fast) var(--ease),
			transform var(--dur-fast) var(--ease);
	}

	.full {
		width: 100%;
	}

	.sm {
		min-height: var(--control-sm);
		padding: 0 var(--space-3);
		font-size: var(--text-sm);
	}

	.md {
		min-height: var(--control-md);
		padding: 0 var(--space-4);
		font-size: var(--text-sm);
	}

	.lg {
		min-height: var(--control-lg);
		padding: 0 var(--space-5);
		font-size: var(--text-base);
	}

	.primary {
		color: white;
		background: var(--aqua-deep);
	}

	.primary:hover:not(:disabled) {
		background: #036b66;
		box-shadow: var(--shadow-sm);
	}

	.secondary {
		border-color: var(--border-strong);
		color: var(--ink);
		background: var(--surface);
	}

	.secondary:hover:not(:disabled) {
		border-color: var(--ink-60);
		background: var(--paper-2);
	}

	.ghost {
		color: var(--aqua-deep);
		background: transparent;
	}

	.ghost:hover:not(:disabled) {
		background: var(--aqua-tint);
	}

	.danger {
		border-color: #e8c4bd;
		color: var(--status-dispute);
		background: var(--dispute-tint);
	}

	.danger:hover:not(:disabled) {
		background: #f4d8d3;
	}

	/* Aqua-deep on --ink is 2.7:1 and unusable; gold on ink is 9.27:1, the
	   strongest pairing in the palette. */
	.on-dark {
		color: var(--ink);
		background: var(--gold);
	}

	.on-dark:hover:not(:disabled) {
		background: var(--gold-deep);
	}

	.btn:active:not(:disabled) {
		transform: translateY(1px);
		box-shadow: none;
	}

	.btn:disabled {
		border-color: transparent;
		color: var(--ink-40);
		background: var(--paper-2);
		box-shadow: none;
		cursor: not-allowed;
	}
</style>

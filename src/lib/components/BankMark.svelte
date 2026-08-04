<script lang="ts">
	import type { BankChannel } from '$lib/prototype/banks';

	let {
		bank,
		size = 'md'
	}: {
		bank: BankChannel;
		size?: 'sm' | 'md';
	} = $props();
</script>

<!--
	Original monogram tile, not a reproduction of the institution's logo.
	ChipIn has no relationship with these banks; a real logo beside receiving-account
	details would imply an endorsement that does not exist.
-->
<span class="mark {size}" style="--tint: {bank.tint}; --ink: {bank.ink};" aria-hidden="true">
	{bank.monogram}
</span>

<style>
	.mark {
		display: inline-grid;
		place-items: center;
		flex-shrink: 0;
		border-radius: var(--radius-sm);
		background: var(--tint);
		color: var(--ink);
		font-weight: 800;
		letter-spacing: 0.02em;
		line-height: 1;
	}

	.mark.md {
		width: 44px;
		height: 44px;
		font-size: 12px;
	}

	.mark.sm {
		width: 32px;
		height: 32px;
		font-size: 10px;
	}
</style>

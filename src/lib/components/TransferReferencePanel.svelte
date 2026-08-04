<script lang="ts">
	import BrandMark from '$lib/components/BrandMark.svelte';

	let {
		reference = 'CHP7K4M',
		campaignTitle,
		campaignHref,
		preview = true
	}: {
		reference?: string;
		campaignTitle: string;
		campaignHref: string;
		preview?: boolean;
	} = $props();

	let copied = $state(false);

	async function copyReference() {
		try {
			await navigator.clipboard.writeText(reference);
			copied = true;
			window.setTimeout(() => {
				copied = false;
			}, 1800);
		} catch {
			copied = false;
		}
	}
</script>

<section class="panel" aria-labelledby="ref-heading">
	<div class="panel-top">
		<BrandMark compact />
		{#if preview}
			<p class="preview-tag">Prototype preview — ChipIn codes are not live yet</p>
		{/if}
	</div>

	<p class="kicker">Your transfer note</p>
	<h2 id="ref-heading">{campaignTitle}</h2>

	<div class="ref-well">
		<p class="ref-label">Suggested memo (if your bank allows one)</p>
		<p class="ref-code" aria-live="polite">{reference}</p>
		<button type="button" class="copy-btn" onclick={copyReference}>
			{copied ? 'Copied' : 'Copy memo'}
		</button>
	</div>

	<div class="qr-block" aria-hidden="true">
		<svg viewBox="0 0 88 88" role="presentation">
			<rect width="88" height="88" fill="#FBF7EE" />
			<rect x="6" y="6" width="24" height="24" fill="#0C1B1A" />
			<rect x="10" y="10" width="16" height="16" fill="#FBF7EE" />
			<rect x="14" y="14" width="8" height="8" fill="#0C1B1A" />
			<rect x="58" y="6" width="24" height="24" fill="#0C1B1A" />
			<rect x="62" y="10" width="16" height="16" fill="#FBF7EE" />
			<rect x="66" y="14" width="8" height="8" fill="#0C1B1A" />
			<rect x="6" y="58" width="24" height="24" fill="#0C1B1A" />
			<rect x="10" y="62" width="16" height="16" fill="#FBF7EE" />
			<rect x="14" y="66" width="8" height="8" fill="#0C1B1A" />
			<rect x="38" y="38" width="8" height="8" fill="#F2B01E" />
			<rect x="50" y="38" width="6" height="6" fill="#0C1B1A" />
			<rect x="38" y="50" width="6" height="6" fill="#0C1B1A" />
			<rect x="58" y="50" width="10" height="6" fill="#0C1B1A" />
			<rect x="50" y="62" width="6" height="14" fill="#0C1B1A" />
			<rect x="66" y="66" width="10" height="10" fill="#0C1B1A" />
			<rect x="38" y="10" width="6" height="14" fill="#0C1B1A" />
			<rect x="10" y="38" width="14" height="6" fill="#0C1B1A" />
		</svg>
		<p>Campaign link for sharing</p>
		<code>{campaignHref}</code>
	</div>

	<details class="accordion">
		<summary>If your bank will not keep a memo</summary>
		<p>
			Use ChipIn's fallback match instead: send the transfer outside ChipIn, then report the amount,
			the date you sent it, and any bank-generated reference you see. The host matches from their
			bank activity. A memo is helpful, never required as proof of settlement.
		</p>
	</details>
</section>

<style>
	.panel {
		padding: var(--space-6);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		background: #fffdf8;
		box-shadow: var(--shadow-raise);
	}

	.panel-top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		margin-bottom: var(--space-5);
	}

	.preview-tag {
		margin: 0;
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		color: var(--status-pending);
		background: var(--gold-tint);
		font-size: var(--text-xs);
		font-weight: 700;
	}

	.kicker {
		margin: 0 0 var(--space-2);
		color: var(--aqua-deep);
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	h2 {
		margin: 0 0 var(--space-5);
		font-size: var(--text-xl);
	}

	.ref-well {
		padding: var(--space-5);
		border-radius: var(--radius-md);
		background: var(--gold-tint);
		text-align: center;
	}

	.ref-label {
		margin: 0 0 var(--space-2);
		color: var(--ink-60);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.ref-code {
		margin: 0 0 var(--space-4);
		font-family: var(--font-mono);
		font-size: var(--text-xl);
		font-weight: 700;
		letter-spacing: 0.18em;
	}

	.copy-btn {
		min-height: 48px;
		padding: 0 var(--space-5);
		border: 1px solid var(--ink);
		border-radius: var(--radius-md);
		color: var(--ink);
		background: var(--paper);
		font-weight: 700;
		cursor: pointer;
	}

	.qr-block {
		display: grid;
		justify-items: center;
		margin-top: var(--space-5);
		padding-top: var(--space-5);
		border-top: 1px solid var(--line);
		gap: var(--space-2);
		text-align: center;
	}

	.qr-block svg {
		width: 88px;
		height: 88px;
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
	}

	.qr-block p {
		margin: 0;
		color: var(--ink-60);
		font-size: var(--text-sm);
	}

	.qr-block code {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
	}

	.accordion {
		margin-top: var(--space-5);
		border-top: 1px solid var(--line);
		padding-top: var(--space-4);
	}

	.accordion summary {
		min-height: 48px;
		align-content: center;
		font-weight: 700;
		cursor: pointer;
	}

	.accordion p {
		margin: var(--space-2) 0 0;
		color: var(--ink-60);
		font-size: var(--text-sm);
	}
</style>

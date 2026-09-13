<script lang="ts">
	import BankPicker from '$lib/components/BankPicker.svelte';
	import { getBank, UNKNOWN_CHANNEL, resolveRail, settlementWindow } from '$lib/prototype/banks';
	import type { ReceivingAccount } from '$lib/prototype/campaigns';
	import { formatBsd } from '$lib/prototype/reports';

	let {
		receiving,
		hostName,
		amountCents,
		memo = '',
		senderBankId = $bindable('')
	}: {
		receiving: ReceivingAccount;
		hostName: string;
		amountCents: number;
		memo?: string;
		senderBankId?: string;
	} = $props();

	/**
	 * An unknown channel must never borrow a real institution's identity. This
	 * used to fall back to `BANK_CHANNELS[BANK_CHANNELS.length - 1]`, correct
	 * only because 'other' happens to sit last and nothing pinned it there —
	 * append one channel and every stale bankId would have rendered under that
	 * bank's name, colour and mark, directly beside a live account number.
	 */
	const recipientBank = $derived(getBank(receiving.bankId) ?? UNKNOWN_CHANNEL);
	const senderBank = $derived(senderBankId ? getBank(senderBankId) : null);
	const rail = $derived(senderBankId ? resolveRail(senderBankId, receiving.bankId) : null);
	const window_ = $derived(rail ? settlementWindow(rail) : null);

	let copiedField = $state('');
	let senderOpen = $state(false);
	let revealed = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	type Field = { key: string; label: string; value: string; sensitive: boolean; mono: boolean };

	const fields = $derived<Field[]>(
		[
			{
				key: 'accountName',
				label: 'Account name',
				value: receiving.accountName,
				sensitive: false,
				mono: false
			},
			{
				key: 'accountNumber',
				label: 'Account number',
				value: receiving.accountNumber,
				sensitive: true,
				mono: true
			},
			{ key: 'branch', label: 'Branch', value: receiving.branch, sensitive: false, mono: false },
			{
				key: 'handle',
				label: 'Wallet handle',
				value: receiving.handle,
				sensitive: true,
				mono: true
			},
			{
				key: 'amount',
				label: 'Amount to send',
				value: (amountCents / 100).toFixed(2),
				sensitive: false,
				mono: true
			},
			{
				key: 'memo',
				label: recipientBank.memoFieldLabel
					? `${recipientBank.memoFieldLabel} (if your bank has one)`
					: 'Memo (if your bank has one)',
				value: memo,
				sensitive: false,
				mono: true
			}
		].filter((f) => f.value.trim().length > 0)
	);

	/**
	 * Names whatever is actually masked, so the toggle never offers to reveal an
	 * account number on a wallet campaign that only has a handle.
	 */
	const sensitiveNoun = $derived.by(() => {
		const masked = fields.filter((f) => f.sensitive);
		if (masked.length === 0) return '';
		if (masked.length > 1) return 'transfer details';
		return masked[0].key === 'handle' ? 'wallet handle' : 'account number';
	});

	function mask(value: string): string {
		const trimmed = value.trim();
		if (trimmed.length <= 4) return trimmed;
		const tail = trimmed.slice(-4);
		return `•••• •••• ${tail}`;
	}

	async function copy(field: Field) {
		try {
			await navigator.clipboard.writeText(field.value.trim());
			copiedField = field.key;
			clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copiedField = ''), 1800);
		} catch {
			// Clipboard can be blocked; the value stays selectable on screen.
			copiedField = '';
		}
	}
</script>

<section class="portal" aria-labelledby="portal-heading">
	<!--
		No bank mark here, deliberately. A logo standing alone above "Send to", an
		account number and a Copy button is structurally what a bank-impersonation
		page looks like — and this product's defence against fake hosts depends on
		donors distrusting exactly that composition. The mark also identified
		nothing: `recipientBank.name` already names the institution in words on the
		next line. Marks live in the pickers, where they label one option among all
		its competitors. See THREAT-MODEL T14.
	-->
	<header class="head">
		<div>
			<p class="eyebrow">Send to</p>
			<h2 id="portal-heading">{hostName}</h2>
			<p class="bank-name">{recipientBank.name}</p>
		</div>
	</header>

	<p class="custody-note">
		<strong>ChipIn does not move, hold, or receive this money.</strong> You send it with your own bank,
		straight to the host.
	</p>

	<p class="gate-note">
		These details are shown because you started a contribution. They are not on the public campaign
		page and are not in link previews.
	</p>

	<ol class="fields">
		{#each fields as field (field.key)}
			<li>
				<div class="field-text">
					<span class="field-label">{field.label}</span>
					<span class="field-value" class:mono={field.mono}>
						{field.sensitive && !revealed ? mask(field.value) : field.value}
					</span>
				</div>
				<button
					type="button"
					class="copy"
					class:copied={copiedField === field.key}
					onclick={() => copy(field)}
				>
					{copiedField === field.key ? 'Copied' : 'Copy'}
					<span class="sr-only">{field.label}</span>
				</button>
			</li>
		{/each}
	</ol>

	{#if sensitiveNoun}
		<button type="button" class="reveal" onclick={() => (revealed = !revealed)}>
			{revealed ? `Hide ${sensitiveNoun}` : `Show full ${sensitiveNoun}`}
		</button>
	{/if}

	<div class="sender">
		<p class="sender-label" id="sender-label">Which bank are you sending from?</p>
		<p class="sender-hint">
			This only sets your expectations for how long the transfer takes. ChipIn never connects to
			your bank.
		</p>
		<details class="sender-disclosure" bind:open={senderOpen}>
			<summary>
				<span class="summary-label">{senderBank ? senderBank.name : 'Choose your bank'}</span>
				<span class="summary-action">{senderOpen ? 'Close' : 'Change'}</span>
			</summary>
			<BankPicker
				bind:value={senderBankId}
				labelledBy="sender-label"
				allowNone
				noneLabel="I'd rather not say"
			/>
		</details>
	</div>

	{#if window_ && senderBank}
		<div class="window" role="status">
			<p class="window-label">{window_.label}</p>
			<p>{window_.donorGuidance}</p>
			{#if rail === 'ach'}
				<p class="window-note">
					Sending {formatBsd(amountCents)} from {senderBank.shortName} to {recipientBank.shortName}
					is a transfer between two institutions, so it settles on the local clearing cycle.
				</p>
			{/if}
		</div>
	{/if}

	<details class="accordion">
		<summary>What ChipIn does and does not do here</summary>
		<ul>
			<li>ChipIn cannot see your bank account or confirm that a transfer settled.</li>
			<li>The host checks their own statement and marks what actually arrived.</li>
			<li>If these details look wrong, stop and report the campaign instead of sending.</li>
		</ul>
	</details>
</section>

<style>
	.portal {
		padding: var(--space-6);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		background: var(--surface);
		box-shadow: var(--shadow-raise);
	}

	.head {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	h2 {
		margin: 0;
		font-size: var(--text-lg);
	}

	.bank-name {
		margin: 0;
		color: var(--ink-60);
		font-size: var(--text-sm);
	}

	/*
	 * Visible without interaction, deliberately. This was only inside the
	 * collapsed accordion at the bottom of the panel — below a bank mark, an
	 * account number and a Copy button, and below the fold on a phone. The one
	 * sentence that distinguishes this page from a scam should not need a tap.
	 */
	.custody-note {
		margin: 0 0 var(--space-4);
		padding: var(--space-3) var(--space-4);
		border-left: 3px solid var(--aqua-deep);
		border-radius: var(--radius-sm);
		background: var(--aqua-tint);
		font-size: var(--text-sm);
	}

	.gate-note {
		margin: var(--space-4) 0 0;
		padding: var(--space-3);
		border-radius: var(--radius-sm);
		background: var(--gold-tint);
		color: var(--ink-60);
		font-size: var(--text-sm);
	}

	.fields {
		margin: var(--space-5) 0 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: var(--space-2);
	}

	.fields li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3);
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
		background: var(--paper);
	}

	.field-text {
		display: grid;
		gap: 2px;
		min-width: 0;
	}

	.field-label {
		color: var(--ink-60);
		font-size: var(--text-xs);
		font-weight: 600;
	}

	.field-value {
		overflow-wrap: anywhere;
		font-weight: 700;
	}

	.field-value.mono {
		font-family: var(--font-mono);
		letter-spacing: 0.04em;
	}

	.copy {
		flex-shrink: 0;
		min-height: 44px;
		padding: 0 var(--space-4);
		border: 1px solid var(--ink);
		border-radius: var(--radius-sm);
		background: var(--paper);
		color: var(--ink);
		font-weight: 700;
		cursor: pointer;
	}

	.copy.copied {
		border-color: var(--status-received, var(--aqua-deep));
		color: var(--status-received, var(--aqua-deep));
	}

	.reveal {
		margin-top: var(--space-3);
		min-height: 44px;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--aqua-deep);
		font-size: var(--text-sm);
		font-weight: 700;
		text-decoration: underline;
		text-underline-offset: 0.2em;
		cursor: pointer;
	}

	.sender-disclosure {
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		background: var(--surface);
	}

	.sender-disclosure summary {
		display: flex;
		min-height: var(--control-lg);
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		cursor: pointer;
		font-size: var(--text-sm);
		font-weight: 700;
		list-style: none;
	}

	.sender-disclosure summary::-webkit-details-marker {
		display: none;
	}

	.summary-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.summary-action {
		flex-shrink: 0;
		color: var(--aqua-deep);
		font-weight: 700;
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.sender-disclosure[open] summary {
		border-bottom: 1px solid var(--line);
	}

	.sender-disclosure :global(.picker) {
		padding: var(--space-3);
	}

	.sender {
		margin-top: var(--space-6);
		padding-top: var(--space-5);
		border-top: 1px solid var(--line);
	}

	.sender-label {
		margin: 0 0 var(--space-1);
		font-weight: 700;
	}

	.sender-hint {
		margin: 0 0 var(--space-4);
		color: var(--ink-60);
		font-size: var(--text-sm);
	}

	.window {
		margin-top: var(--space-5);
		padding: var(--space-4);
		border-radius: var(--radius-sm);
		background: var(--gold-tint);
	}

	.window p {
		margin: 0;
		color: var(--ink-60);
		font-size: var(--text-sm);
	}

	.window-label {
		margin-bottom: var(--space-1) !important;
		color: var(--ink) !important;
		font-weight: 700;
	}

	.window-note {
		margin-top: var(--space-2) !important;
	}

	.accordion {
		margin-top: var(--space-5);
		padding-top: var(--space-4);
		border-top: 1px solid var(--line);
	}

	.accordion summary {
		min-height: 44px;
		align-content: center;
		font-weight: 700;
		cursor: pointer;
	}

	.accordion ul {
		margin: var(--space-2) 0 0;
		padding-left: var(--space-5);
		color: var(--ink-60);
		font-size: var(--text-sm);
	}

	.accordion li + li {
		margin-top: var(--space-1);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>

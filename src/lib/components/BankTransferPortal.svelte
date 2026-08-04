<script lang="ts">
	import BankMark from '$lib/components/BankMark.svelte';
	import {
		BANK_CHANNELS,
		getBank,
		resolveRail,
		settlementWindow,
		type BankChannel
	} from '$lib/prototype/banks';
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

	const recipientBank = $derived(
		getBank(receiving.bankId) ?? BANK_CHANNELS[BANK_CHANNELS.length - 1]
	);
	const senderBank = $derived(senderBankId ? getBank(senderBankId) : null);
	const rail = $derived(senderBankId ? resolveRail(senderBankId, receiving.bankId) : null);
	const window_ = $derived(rail ? settlementWindow(rail) : null);

	let copiedField = $state('');
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

	function pickSender(bank: BankChannel) {
		senderBankId = senderBankId === bank.id ? '' : bank.id;
	}
</script>

<section class="portal" aria-labelledby="portal-heading">
	<header class="head">
		<BankMark bank={recipientBank} />
		<div>
			<p class="kicker">Send to</p>
			<h2 id="portal-heading">{hostName}</h2>
			<p class="bank-name">{recipientBank.name}</p>
		</div>
	</header>

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

	{#if fields.some((f) => f.sensitive)}
		<button type="button" class="reveal" onclick={() => (revealed = !revealed)}>
			{revealed ? 'Hide account number' : 'Show full account number'}
		</button>
	{/if}

	<div class="sender">
		<p class="sender-label" id="sender-label">Which bank are you sending from?</p>
		<p class="sender-hint">
			This only sets your expectations for how long the transfer takes. ChipIn never connects to
			your bank.
		</p>
		<div class="bank-grid" role="group" aria-labelledby="sender-label">
			{#each BANK_CHANNELS as bank (bank.id)}
				<button
					type="button"
					class="bank-option"
					class:selected={senderBankId === bank.id}
					aria-pressed={senderBankId === bank.id}
					onclick={() => pickSender(bank)}
				>
					<BankMark {bank} size="sm" />
					<span>{bank.shortName}</span>
				</button>
			{/each}
		</div>
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
			<li>ChipIn does not move, hold, or receive this money. You send it with your own bank.</li>
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
		background: #fffdf8;
		box-shadow: var(--shadow-raise);
	}

	.head {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.kicker {
		margin: 0;
		color: var(--aqua-deep);
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
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

	.bank-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
		gap: var(--space-2);
	}

	.bank-option {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-height: 52px;
		padding: var(--space-2);
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
		background: var(--paper);
		color: var(--ink);
		font-size: var(--text-xs);
		font-weight: 700;
		text-align: left;
		cursor: pointer;
	}

	.bank-option.selected {
		border-color: var(--ink);
		box-shadow: inset 0 0 0 1px var(--ink);
	}

	.bank-option span {
		overflow-wrap: anywhere;
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

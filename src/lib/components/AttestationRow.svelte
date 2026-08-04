<script lang="ts">
	import BankMark from '$lib/components/BankMark.svelte';
	import StatusChip from '$lib/components/StatusChip.svelte';
	import { getBank, isOverdue, resolveRail, settlementWindow } from '$lib/prototype/banks';
	import { formatBsd, type PrototypeReport, type ReportStatus } from '$lib/prototype/reports';

	let {
		report,
		statusHref,
		recipientBankId = 'other',
		onattest
	}: {
		report: PrototypeReport;
		statusHref: string;
		recipientBankId?: string;
		onattest: (payload: {
			status: Extract<
				ReportStatus,
				'marked_received' | 'marked_not_found' | 'clarification_requested'
			>;
			attestedCents?: number;
			clarificationQuestion?: string;
		}) => void;
	} = $props();

	// Defaults to the reported amount, but the host overwrites it with what actually arrived.
	let amountInput = $derived((report.reportedCents / 100).toFixed(2));
	let questionInput = $state('');
	let error = $state('');
	let openHistory = $state(false);

	const tone = $derived(
		report.status === 'marked_received'
			? 'received'
			: report.status === 'marked_not_found'
				? 'disputed'
				: report.status === 'clarification_requested'
					? 'paused'
					: 'pending'
	);

	const statusLabel = $derived(
		report.status === 'marked_received'
			? 'Marked received by host'
			: report.status === 'marked_not_found'
				? 'Not found'
				: report.status === 'clarification_requested'
					? 'Clarification requested'
					: 'Reported — waiting on host'
	);

	const senderBank = $derived(report.senderBankId ? getBank(report.senderBankId) : null);
	const rail = $derived(
		report.senderBankId ? resolveRail(report.senderBankId, recipientBankId) : null
	);
	const window_ = $derived(rail ? settlementWindow(rail) : null);

	/**
	 * Whether the expected settlement window has passed. Until it has, "not found"
	 * usually means "not arrived yet" rather than "did not happen" — which is the
	 * single most common way a host wrongly rejects a real transfer.
	 */
	const stillSettling = $derived.by(() => {
		if (!rail || !report.transferDate) return false;
		const sent = new Date(`${report.transferDate}T00:00:00`);
		if (Number.isNaN(sent.getTime())) return false;
		return !isOverdue(rail, sent, new Date());
	});

	function parseAmount(): number | null {
		const cleaned = amountInput.replace(/[^0-9.]/g, '');
		const num = Number(cleaned);
		if (!Number.isFinite(num) || num <= 0) return null;
		return Math.round(num * 100);
	}

	function markReceived() {
		const cents = parseAmount();
		if (cents === null) {
			error = 'Enter the actual amount received.';
			return;
		}
		error = '';
		onattest({ status: 'marked_received', attestedCents: cents });
	}

	function markNotFound() {
		error = '';
		onattest({ status: 'marked_not_found' });
	}

	function askClarification() {
		if (!questionInput.trim()) {
			error = 'Write a short question for the donor.';
			return;
		}
		error = '';
		onattest({
			status: 'clarification_requested',
			clarificationQuestion: questionInput.trim()
		});
	}
</script>

<article class="row">
	<header class="row-head">
		<div>
			<p class="amount">{formatBsd(report.reportedCents)} reported</p>
			<p class="meta">
				Transfer date {report.transferDate}
				{#if report.bankReference}
					· Bank ref {report.bankReference}
				{/if}
			</p>
			{#if senderBank}
				<p class="meta sender">
					<BankMark bank={senderBank} size="sm" />
					<span>Donor says they sent from {senderBank.name}</span>
				</p>
			{/if}
		</div>
		<StatusChip label={statusLabel} {tone} />
	</header>

	{#if report.source === 'screenshot'}
		<p class="provenance">
			<strong>Donor-entered, pre-filled from a screenshot.</strong>
			ChipIn read these figures from an image on the donor's device. It did not contact any bank and has
			not verified this transfer. Check your own statement before marking anything received.
			{#if report.editedFields.length > 0}
				The donor edited {report.editedFields.length} of the pre-filled
				{report.editedFields.length === 1 ? 'field' : 'fields'} before submitting.
			{/if}
		</p>
	{/if}

	{#if stillSettling && window_ && report.status === 'submitted'}
		<p class="settling" role="status">
			<strong>{window_.label}.</strong>
			{window_.hostGuidance}
		</p>
	{/if}

	{#if report.status === 'submitted' || report.status === 'clarification_requested'}
		<div class="actions">
			<label>
				<span>Actual amount received</span>
				<input type="text" inputmode="decimal" bind:value={amountInput} />
			</label>
			<div class="action-cluster">
				<button type="button" class="primary" onclick={markReceived}>Mark received</button>
				<button type="button" class="ghost" onclick={markNotFound}>Not found</button>
			</div>
			<label>
				<span>Ask for clarification</span>
				<input type="text" bind:value={questionInput} placeholder="What should the donor check?" />
			</label>
			<button type="button" class="ghost" onclick={askClarification}>Send question</button>
			{#if report.status === 'clarification_requested'}
				<p class="result">
					Waiting on donor reply.
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolved by the parent route -->
					<a href={statusHref}>Open donor status link</a>
				</p>
			{/if}
			{#if report.clarificationReply && report.status === 'submitted'}
				<p class="result">Donor replied: {report.clarificationReply}</p>
			{/if}
			{#if error}
				<p class="error" role="alert">{error}</p>
			{/if}
		</div>
	{:else if report.status === 'marked_received' && report.attestedCents !== null}
		<p class="result">
			Host marked {formatBsd(report.attestedCents)} received. This updates ChipIn's record only — it does
			not reverse a bank transfer.
		</p>
	{:else if report.status === 'marked_not_found'}
		<p class="result">Host could not find this transfer in their bank activity.</p>
	{/if}

	<button type="button" class="history-toggle" onclick={() => (openHistory = !openHistory)}>
		{openHistory ? 'Hide history' : 'Show history'}
	</button>
	{#if openHistory}
		<ul class="history">
			<li>Reported {formatBsd(report.reportedCents)} · {report.createdAt.slice(0, 10)}</li>
			<li>Status: {report.status} · updated {report.updatedAt.slice(0, 10)}</li>
			{#if report.clarificationQuestion}
				<li>Question: {report.clarificationQuestion}</li>
			{/if}
			{#if report.clarificationReply}
				<li>Donor reply: {report.clarificationReply}</li>
			{/if}
			{#if report.attestedCents !== null}
				<li>Attested amount: {formatBsd(report.attestedCents)}</li>
			{/if}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolved by the parent route -->
			<li><a href={statusHref}>Donor status link</a></li>
		</ul>
	{/if}
</article>

<style>
	.row {
		padding: var(--space-5);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		background: #fffdf8;
	}

	.row-head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.amount {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
	}

	.meta,
	.result {
		margin: var(--space-2) 0 0;
		color: var(--ink-60);
		font-size: var(--text-sm);
	}

	.meta.sender {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.provenance,
	.settling {
		margin: var(--space-4) 0 0;
		padding: var(--space-3);
		border-radius: var(--radius-sm);
		color: var(--ink-60);
		font-size: var(--text-sm);
	}

	.provenance {
		background: var(--gold-tint);
	}

	.settling {
		border: 1px solid var(--line);
		background: var(--paper);
	}

	.actions {
		display: grid;
		gap: var(--space-3);
		margin-top: var(--space-5);
		padding-top: var(--space-5);
		border-top: 1px solid var(--line);
	}

	label {
		display: grid;
		gap: var(--space-2);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	input {
		min-height: 48px;
		padding: 0 var(--space-3);
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
		background: var(--paper);
	}

	.action-cluster {
		display: grid;
		gap: var(--space-3);
		grid-template-columns: 1fr 1fr;
	}

	button {
		min-height: 48px;
		border-radius: var(--radius-md);
		font-weight: 700;
		cursor: pointer;
	}

	.primary {
		border: 0;
		color: white;
		background: var(--aqua-deep);
	}

	.ghost {
		border: 1px solid var(--line);
		color: var(--ink);
		background: transparent;
	}

	.error {
		margin: 0;
		color: var(--status-dispute);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.history-toggle {
		margin-top: var(--space-4);
		border: 0;
		color: var(--aqua-deep);
		background: transparent;
		font-size: var(--text-sm);
		text-align: left;
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.history {
		margin: var(--space-3) 0 0;
		padding-left: var(--space-5);
		color: var(--ink-60);
		font-size: var(--text-sm);
	}

	@media (max-width: 520px) {
		.action-cluster {
			grid-template-columns: 1fr;
		}
	}
</style>

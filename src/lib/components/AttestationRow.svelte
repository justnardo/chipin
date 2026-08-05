<script lang="ts">
	import { untrack } from 'svelte';
	import BankMark from '$lib/components/BankMark.svelte';
	import StatusChip from '$lib/components/StatusChip.svelte';
	import { getBank, isOverdue, resolveRail, settlementWindow } from '$lib/prototype/banks';
	import {
		activeAllocations,
		formatBsd,
		ledger,
		matchedCents,
		matchingMethodLabel,
		overMatchedCents,
		unmatchedCents,
		type Allocation,
		type HostAction,
		type MatchingMethod,
		type PrototypeReport
	} from '$lib/prototype/reports';

	let {
		report,
		statusHref,
		recipientBankId = 'other',
		onattest
	}: {
		report: PrototypeReport;
		statusHref: string;
		recipientBankId?: string;
		/** Returns an error message when the command was refused, or '' on success. */
		onattest: (action: HostAction) => string;
	} = $props();

	const matched = $derived(matchedCents(report));
	const unmatched = $derived(unmatchedCents(report));
	const overMatched = $derived(overMatchedCents(report));
	const rows = $derived(ledger(report));
	const active = $derived(activeAllocations(report));

	/**
	 * Defaults to whatever the host has not accounted for yet, so recording the
	 * second half of a split deposit is one tap rather than mental arithmetic. On a
	 * fresh report that is the whole reported amount already.
	 *
	 * Blank once nothing is outstanding. Re-offering the full figure there would put
	 * a duplicate of the entire transfer one tap away, and every tap of it inflates
	 * the public total — the one number this ledger exists to keep honest.
	 *
	 * Derived, not `$state`: it has to resettle after each command (record $120 of
	 * $200 and the field should offer the remaining $80). Typing does not touch the
	 * report, so nothing overwrites the host mid-entry.
	 */
	let amountInput = $derived(unmatched > 0 ? (unmatched / 100).toFixed(2) : '');
	/**
	 * Only the initial value is wanted: this is the host's editable choice from here
	 * on, and each row is keyed to one report, so re-deriving it would overwrite what
	 * they picked.
	 */
	let method = $state<MatchingMethod>(
		untrack(() => (report.bankReference ? 'bank_reference' : 'amount_date'))
	);
	let questionInput = $state('');
	let error = $state('');

	/** Which ledger row has its correction/void form open, if any. */
	let editing = $state<{ allocationId: string; mode: 'correct' | 'void' } | null>(null);
	let editAmount = $state('');
	let editReason = $state('');
	/**
	 * Scoped to the row being corrected, seeded from that row. Reusing the form's
	 * dropdown would relabel an old entry with whatever method the host last picked
	 * for a different one — a correction should not silently rewrite how the original
	 * was matched, though the host can say so if re-checking is what changed it.
	 */
	let editMethod = $state<MatchingMethod>('manual_audit');
	let editError = $state('');

	const tone = $derived(
		report.status === 'marked_received'
			? 'received'
			: report.status === 'marked_not_found' || report.status === 'confirmation_voided'
				? 'disputed'
				: report.status === 'clarification_requested' || report.status === 'partially_matched'
					? 'paused'
					: 'pending'
	);

	const statusLabel = $derived(
		report.status === 'marked_received'
			? 'Marked received by host'
			: report.status === 'partially_matched'
				? 'Partly matched'
				: report.status === 'marked_not_found'
					? 'Not found'
					: report.status === 'confirmation_voided'
						? 'Confirmation withdrawn'
						: report.status === 'clarification_requested'
							? 'Clarification requested'
							: 'Reported — waiting on host'
	);

	const senderBank = $derived(report.senderBankId ? getBank(report.senderBankId) : null);
	/**
	 * Which of the host's accounts the donor targeted — tells the host which
	 * statement to reconcile against when they receive at more than one place.
	 * Display uses only what the REPORT states; the `recipientBankId` prop falls
	 * back to the host's first account for legacy reports, which is fine for
	 * settlement-window guidance but must not be shown as a donor claim.
	 */
	const statedRecipient = $derived(report.recipientBankId ? getBank(report.recipientBankId) : null);
	/** Whichever bank we can name for the meta line's mark. */
	const metaBank = $derived(senderBank ?? statedRecipient);
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

	/** "Not found" and open questions only make sense while nothing is counted. */
	const canDeclare = $derived(matched === 0);

	function parse(value: string): number | null {
		const cleaned = value.replace(/[^0-9.]/g, '');
		const num = Number(cleaned);
		if (!cleaned || !Number.isFinite(num) || num <= 0) return null;
		return Math.round(num * 100);
	}

	function recordMatch() {
		const cents = parse(amountInput);
		if (cents === null) {
			error = 'Enter the amount that actually reached your account.';
			return;
		}
		error = onattest({ kind: 'record', amountCents: cents, method });
	}

	function notFound() {
		error = onattest({ kind: 'not_found' });
	}

	function askClarification() {
		if (!questionInput.trim()) {
			error = 'Write a short question for the donor.';
			return;
		}
		error = onattest({ kind: 'clarify', question: questionInput.trim() });
		if (!error) questionInput = '';
	}

	function openEdit(row: Allocation, mode: 'correct' | 'void') {
		editing = { allocationId: row.id, mode };
		editAmount = (row.amountCents / 100).toFixed(2);
		editMethod = row.method;
		editReason = '';
		editError = '';
	}

	function closeEdit() {
		editing = null;
		editError = '';
	}

	function submitEdit() {
		if (!editing) return;
		const reason = editReason.trim();
		if (!reason) {
			editError = 'Say why the record is changing. The donor sees this.';
			return;
		}
		if (editing.mode === 'void') {
			editError = onattest({ kind: 'void', allocationId: editing.allocationId, reason });
		} else {
			const cents = parse(editAmount);
			if (cents === null) {
				editError = 'Enter the corrected amount.';
				return;
			}
			editError = onattest({
				kind: 'correct',
				allocationId: editing.allocationId,
				amountCents: cents,
				reason,
				method: editMethod
			});
		}
		if (!editError) closeEdit();
	}
</script>

{#snippet methodOptions()}
	<option value="bank_reference">Bank reference</option>
	<option value="amount_date">Amount and date</option>
	<option value="manual_audit">Checked my statement by hand</option>
{/snippet}

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
			{#if metaBank}
				<p class="meta sender">
					<BankMark bank={metaBank} size="sm" />
					<span>
						{#if senderBank && statedRecipient}
							Donor says they sent from {senderBank.name} to your {statedRecipient.shortName} account{#if report.recipientTail}
								&nbsp;··{report.recipientTail}{/if}
						{:else if senderBank}
							Donor says they sent from {senderBank.name}
						{:else if statedRecipient}
							Sent to your {statedRecipient.shortName} account{#if report.recipientTail}
								&nbsp;··{report.recipientTail}{/if}
						{/if}
					</span>
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

	{#if matched > 0}
		<p class="tally" class:partial={unmatched > 0}>
			<strong>{formatBsd(matched)}</strong> of {formatBsd(report.reportedCents)} recorded received.
			{#if unmatched > 0}
				{formatBsd(unmatched)} of what the donor reported is still unaccounted for. Only the
				{formatBsd(matched)} counts toward public progress.
			{:else if overMatched > 0}
				That is {formatBsd(overMatched)} more than the donor reported — worth checking before you leave
				it.
			{:else}
				This transfer is fully accounted for.
			{/if}
		</p>
	{/if}

	{#if rows.length > 0}
		<section class="ledger" aria-label="Amounts recorded against this report">
			<h3>Recorded amounts</h3>
			<ul>
				{#each rows as row (row.id)}
					<li class:voided={row.status === 'voided'}>
						<div class="ledger-head">
							<p class="ledger-amount">
								{formatBsd(row.amountCents)}
								{#if row.status === 'voided'}<span class="tag">withdrawn</span>{/if}
							</p>
							<p class="ledger-meta">
								{matchingMethodLabel(row.method)} · {row.createdAt.slice(0, 10)}
							</p>
						</div>
						{#if row.correctionOf}
							<p class="ledger-note">Replaces an earlier entry.</p>
						{/if}
						{#if row.note}
							<p class="ledger-note">{row.note}</p>
						{/if}
						{#if row.status === 'voided' && row.voidReason}
							<p class="ledger-note">Withdrawn: {row.voidReason}</p>
						{:else if row.status === 'active'}
							{#if editing?.allocationId === row.id}
								<div class="edit">
									{#if editing.mode === 'correct'}
										<label>
											<span>Corrected amount</span>
											<input type="text" inputmode="decimal" bind:value={editAmount} />
										</label>
										<label>
											<span>How did you match it?</span>
											<select bind:value={editMethod}>
												{@render methodOptions()}
											</select>
										</label>
									{/if}
									<label>
										<span>Reason (shown to the donor)</span>
										<input
											type="text"
											bind:value={editReason}
											placeholder={editing.mode === 'void'
												? 'Why is this amount no longer counted?'
												: 'Why is the amount changing?'}
										/>
									</label>
									{#if editError}
										<p class="error" role="alert">{editError}</p>
									{/if}
									<div class="action-cluster">
										<button type="button" class="primary" onclick={submitEdit}>
											{editing.mode === 'void' ? 'Withdraw amount' : 'Save correction'}
										</button>
										<button type="button" class="ghost" onclick={closeEdit}>Cancel</button>
									</div>
								</div>
							{:else}
								<div class="ledger-actions">
									<button type="button" class="linkish" onclick={() => openEdit(row, 'correct')}>
										Correct amount
									</button>
									<button
										type="button"
										class="linkish danger"
										onclick={() => openEdit(row, 'void')}
									>
										Withdraw
									</button>
								</div>
							{/if}
						{/if}
					</li>
				{/each}
			</ul>
			<p class="ledger-foot">
				Entries are never edited or deleted. A correction withdraws one amount and adds another, so
				the donor can still see what they were told.
			</p>
		</section>
	{/if}

	{#if !editing}
		<div class="actions">
			<label>
				<span>{matched > 0 ? 'Record another amount' : 'Actual amount received'}</span>
				<input type="text" inputmode="decimal" bind:value={amountInput} />
			</label>
			<label>
				<span>How did you match it?</span>
				<select bind:value={method}>
					{@render methodOptions()}
				</select>
			</label>
			<div class="action-cluster">
				<button type="button" class="primary" onclick={recordMatch}>
					{matched > 0 ? 'Add to record' : 'Mark received'}
				</button>
				{#if canDeclare}
					<button type="button" class="ghost" onclick={notFound}>Not found</button>
				{/if}
			</div>
			<p class="hint">
				Record what actually arrived. Less than the donor reported is fine — the rest stays visibly
				unmatched instead of quietly counting.
			</p>

			{#if canDeclare}
				<label>
					<span>Ask for clarification</span>
					<input
						type="text"
						bind:value={questionInput}
						placeholder="What should the donor check?"
					/>
				</label>
				<button type="button" class="ghost" onclick={askClarification}>Send question</button>
			{/if}

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
			{#if report.status === 'marked_not_found'}
				<p class="result">
					You marked this not found. Recording an amount above replaces that if it turns up.
				</p>
			{/if}
			{#if report.status === 'confirmation_voided'}
				<p class="result">
					Every amount recorded here has been withdrawn, so this report counts for nothing right
					now. ChipIn changed its own record only — it cannot reverse a bank transfer.
				</p>
			{/if}
			{#if error}
				<p class="error" role="alert">{error}</p>
			{/if}
		</div>
	{/if}

	<details class="history">
		<summary>Show report history</summary>
		<ul>
			<li>Reported {formatBsd(report.reportedCents)} · {report.createdAt.slice(0, 10)}</li>
			<li>Status: {report.status} · updated {report.updatedAt.slice(0, 10)}</li>
			{#if report.clarificationQuestion}
				<li>Question: {report.clarificationQuestion}</li>
			{/if}
			{#if report.clarificationReply}
				<li>Donor reply: {report.clarificationReply}</li>
			{/if}
			<li>
				{active.length} active
				{active.length === 1 ? 'entry' : 'entries'} totalling {formatBsd(matched)}
			</li>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolved by the parent route -->
			<li><a href={statusHref}>Donor status link</a></li>
		</ul>
	</details>
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
	.result,
	.hint {
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
	.settling,
	.tally {
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

	.tally {
		border: 1px solid var(--line);
		background: #e4f1e9;
		color: var(--ink);
	}

	.tally.partial {
		background: var(--gold-tint);
	}

	.tally strong {
		font-family: var(--font-display);
	}

	.ledger {
		margin-top: var(--space-5);
		padding-top: var(--space-5);
		border-top: 1px solid var(--line);
	}

	.ledger h3 {
		margin: 0 0 var(--space-3);
		font-size: var(--text-sm);
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.ledger ul {
		display: grid;
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.ledger li {
		padding: var(--space-3);
		border: 1px solid var(--line);
		border-left: 4px solid var(--aqua-deep);
		border-radius: var(--radius-sm);
		background: var(--paper);
	}

	.ledger li.voided {
		border-left-color: var(--ink-60);
		opacity: 0.72;
	}

	.ledger-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.ledger-amount {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 700;
	}

	.voided .ledger-amount {
		text-decoration: line-through;
	}

	.tag {
		margin-left: var(--space-2);
		padding: 0 var(--space-2);
		border-radius: var(--radius-full);
		background: var(--line);
		font-family: var(--font-body);
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: 0.04em;
		text-decoration: none;
		text-transform: uppercase;
	}

	.ledger-meta,
	.ledger-note,
	.ledger-foot {
		margin: var(--space-1) 0 0;
		color: var(--ink-60);
		font-size: var(--text-xs);
	}

	.ledger-foot {
		margin-top: var(--space-3);
	}

	.ledger-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		margin-top: var(--space-2);
	}

	.edit {
		display: grid;
		gap: var(--space-3);
		margin-top: var(--space-3);
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

	input,
	select {
		min-height: 48px;
		padding: 0 var(--space-3);
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
		background: var(--paper);
		font-size: var(--text-base);
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

	.linkish {
		min-height: 44px;
		border: 0;
		color: var(--aqua-deep);
		background: transparent;
		font-size: var(--text-sm);
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.linkish.danger {
		color: var(--status-dispute);
	}

	.error {
		margin: 0;
		color: var(--status-dispute);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.history {
		margin-top: var(--space-4);
		font-size: var(--text-sm);
	}

	.history summary {
		min-height: 44px;
		align-content: center;
		color: var(--aqua-deep);
		font-weight: 600;
		cursor: pointer;
	}

	.history ul {
		margin: var(--space-2) 0 0;
		padding-left: var(--space-5);
		color: var(--ink-60);
	}

	@media (max-width: 520px) {
		.action-cluster {
			grid-template-columns: 1fr;
		}
	}
</style>

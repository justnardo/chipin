<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import BankTransferPortal from '$lib/components/BankTransferPortal.svelte';
	import BrandMark from '$lib/components/BrandMark.svelte';
	import ReceiptScanner from '$lib/components/ReceiptScanner.svelte';
	import StatusChip from '$lib/components/StatusChip.svelte';
	import { getBank, resolveRail, settlementWindow } from '$lib/prototype/banks';
	import { getCampaign, type PrototypeCampaign } from '$lib/prototype/campaigns';
	import { screenshotContributed, type ExtractedReceipt } from '$lib/prototype/receipt';
	import { addReport, dollarsToCents, formatBsd, type ReportSource } from '$lib/prototype/reports';

	type Step = 'pledge' | 'transfer' | 'report' | 'done';

	let campaign = $state<PrototypeCampaign | null>(null);
	let step = $state<Step>('pledge');
	const suggestedAmounts = [25, 50, 100, 200];

	let pledgeInput = $state('50');
	let reportInput = $state('50');
	let transferDate = $state(new Date().toISOString().slice(0, 10));
	let bankReference = $state('');
	let contact = $state('');
	let error = $state('');
	let pledgeCents = $state(5000);
	let submittedId = $state('');
	let statusHref = $state('');
	let selectedSuggestion = $state<number | 'custom'>(50);
	let senderBankId = $state('');
	let reportSource = $state<ReportSource>('manual');
	/** Values the screenshot supplied, so we can tell what the donor then changed. */
	let prefilled = $state<Record<string, string>>({});

	const senderBank = $derived(senderBankId ? getBank(senderBankId) : null);
	const rail = $derived(
		campaign && senderBankId ? resolveRail(senderBankId, campaign.receiving.bankId) : null
	);
	const window_ = $derived(rail ? settlementWindow(rail) : null);

	/** Fields the donor edited after the scanner filled them in. */
	const editedFields = $derived(
		Object.entries(prefilled)
			.filter(([key, value]) => {
				if (key === 'reportInput') return reportInput.trim() !== value;
				if (key === 'transferDate') return transferDate !== value;
				if (key === 'bankReference') return bankReference.trim() !== value;
				return false;
			})
			.map(([key]) => key)
	);

	function applyExtraction(receipt: ExtractedReceipt) {
		const next: Record<string, string> = {};

		if (receipt.amountCents) {
			reportInput = (receipt.amountCents.value / 100).toFixed(2);
			next.reportInput = reportInput;
		}
		if (receipt.transferDate) {
			transferDate = receipt.transferDate.value;
			next.transferDate = transferDate;
		}
		if (receipt.reference) {
			bankReference = receipt.reference.value;
			next.bankReference = bankReference;
		}
		// Decide provenance BEFORE adopting the bank, so "did the image tell us this?"
		// is answered against what the donor had already chosen.
		const contributed = screenshotContributed(receipt, Boolean(senderBankId));

		if (receipt.bankId && !senderBankId) {
			senderBankId = receipt.bankId.value;
		}

		prefilled = next;
		if (contributed) reportSource = 'screenshot';
	}

	const slug = $derived(page.params.slug ?? '');
	const campaignHref = $derived(
		campaign ? resolve('/c/[slug]', { slug: campaign.slug }) : resolve('/')
	);

	$effect(() => {
		if (!browser) return;
		void slug;
		campaign = getCampaign(slug);
	});

	function pickAmount(amount: number) {
		selectedSuggestion = amount;
		pledgeInput = String(amount);
		error = '';
	}

	function pickCustom() {
		selectedSuggestion = 'custom';
	}

	function goTransfer(event: Event) {
		event.preventDefault();
		const cents = dollarsToCents(pledgeInput);
		if (cents === null) {
			error = 'Enter a pledge amount greater than zero.';
			return;
		}
		error = '';
		pledgeCents = cents;
		reportInput = (cents / 100).toFixed(2);
		step = 'transfer';
	}

	function goReport() {
		error = '';
		step = 'report';
	}

	function submitReport(event: Event) {
		event.preventDefault();
		if (!campaign) return;
		const cents = dollarsToCents(reportInput);
		if (cents === null) {
			error = 'Enter the amount you sent.';
			return;
		}
		if (!transferDate) {
			error = 'Choose the date you sent the transfer.';
			return;
		}
		error = '';
		const report = addReport({
			campaignSlug: campaign.slug,
			pledgeCents,
			reportedCents: cents,
			transferDate,
			bankReference: bankReference.trim(),
			senderBankId,
			source: reportSource,
			editedFields
		});
		submittedId = report.id;
		statusHref = resolve('/c/[slug]/status/[token]', {
			slug: campaign.slug,
			token: report.statusToken
		});
		step = 'done';
	}
</script>

<svelte:head>
	<title>Chip in | {campaign?.title ?? 'Campaign'}</title>
	<meta
		name="description"
		content="Prototype ChipIn contribution flow using fictional data. No money moves through ChipIn."
	/>
</svelte:head>

<div class="prototype-banner">
	<strong>Product prototype</strong>
	<span>Fictional flow only. No money can be sent through ChipIn.</span>
</div>

<header class="site-header">
	<a class="brand-link" href={resolve('/')} aria-label="ChipIn home"><BrandMark /></a>
	<a class="back" href={campaignHref}>Back to campaign</a>
</header>

<main>
	{#if !campaign}
		<section class="card">
			<h2>Campaign not found</h2>
			<p>Start a campaign in this browser, then chip in from that page.</p>
			<a class="primary" href={resolve('/start')}>Start a campaign</a>
		</section>
	{:else}
		<p class="kicker">Chip in</p>
		<h1>{campaign.title}</h1>
		<p class="lede">
			Hosted by {campaign.hostName}. You send money outside ChipIn. ChipIn only records what you
			report and what the host marks received.
		</p>

		<ol class="steps" aria-label="Contribution steps">
			<li class:current={step === 'pledge'} class:done={step !== 'pledge'}>1. Pledge</li>
			<li class:current={step === 'transfer'} class:done={step === 'report' || step === 'done'}>
				2. Transfer
			</li>
			<li class:current={step === 'report'} class:done={step === 'done'}>3. Report</li>
			<li class:current={step === 'done'}>4. Done</li>
		</ol>

		{#if step === 'pledge'}
			<form class="card" onsubmit={goTransfer}>
				<h2>Choose an amount</h2>
				<p>
					Same familiar first step as other fundraisers — then you send it with your own bank.
					ChipIn does not charge your card.
				</p>
				<div class="amount-grid" role="group" aria-label="Suggested amounts">
					{#each suggestedAmounts as amount (amount)}
						<button
							type="button"
							class="amount-chip"
							class:selected={selectedSuggestion === amount}
							onclick={() => pickAmount(amount)}
						>
							${amount}
						</button>
					{/each}
					<button
						type="button"
						class="amount-chip"
						class:selected={selectedSuggestion === 'custom'}
						onclick={pickCustom}
					>
						Other
					</button>
				</div>
				<label>
					<span>Amount (BSD)</span>
					<input
						type="text"
						inputmode="decimal"
						bind:value={pledgeInput}
						oninput={() => (selectedSuggestion = 'custom')}
						required
					/>
				</label>
				{#if error}
					<p class="error" role="alert">{error}</p>
				{/if}
				<button type="submit" class="primary">Continue to transfer steps</button>
			</form>
		{:else if step === 'transfer'}
			<section class="stack">
				<div class="card">
					<StatusChip label="Send outside ChipIn" tone="pending" />
					<h2>Transfer {formatBsd(pledgeCents)} with your bank</h2>
					<p>
						Copy the details below into your own banking app or wallet. ChipIn does not collect,
						hold, or move this money — you are sending it directly to the host.
					</p>
				</div>

				{#if campaign.receiving.accountNumber || campaign.receiving.handle}
					<BankTransferPortal
						receiving={campaign.receiving}
						hostName={campaign.hostName}
						amountCents={pledgeCents}
						bind:senderBankId
					/>
				{:else}
					<div class="card">
						<h2>This host has not added transfer details yet</h2>
						<p>
							Ask the host to add their receiving details to the campaign, then come back. You can
							still record a transfer you have already sent.
						</p>
					</div>
				{/if}

				<div class="card">
					<h2>When you have sent it</h2>
					<ul>
						<li>Save the confirmation screen — you can upload it on the next step.</li>
						<li>Save any bank-generated reference you see after sending.</li>
						{#if window_}
							<li>{window_.donorGuidance}</li>
						{/if}
					</ul>
					<button type="button" class="primary" onclick={goReport}
						>I have sent it — report now</button
					>
				</div>
			</section>
		{:else if step === 'report'}
			<section class="stack">
				<ReceiptScanner onextract={applyExtraction} />

				<form class="card" onsubmit={submitReport}>
					<h2>Report what you sent</h2>
					<p>The host will compare this with their own bank statement.</p>

					{#if reportSource === 'screenshot'}
						<p class="prefill-note" role="status">
							Some fields were filled in from your screenshot. Check each one — ChipIn read them
							from an image and has not confirmed anything with a bank.
						</p>
					{/if}

					<label>
						<span>Amount sent (BSD)</span>
						<input type="text" inputmode="decimal" bind:value={reportInput} required />
					</label>
					<label>
						<span>Date sent</span>
						<input type="date" bind:value={transferDate} required />
					</label>
					<label>
						<span>Bank-generated reference (optional)</span>
						<input type="text" bind:value={bankReference} placeholder="If your bank showed one" />
					</label>
					<label>
						<span>Contact for follow-up (optional in prototype)</span>
						<input type="text" bind:value={contact} placeholder="Email or mobile" />
					</label>
					{#if error}
						<p class="error" role="alert">{error}</p>
					{/if}
					<button type="submit" class="primary">Submit report</button>
				</form>
			</section>
		{:else}
			<section class="card done">
				<StatusChip label="Reported — waiting on host" tone="pending" />
				<h2>You're all set — the host can see your report</h2>
				<p>
					Report <code>{submittedId}</code> for {formatBsd(
						dollarsToCents(reportInput) ?? pledgeCents
					)}. Public progress only moves when the host marks what arrived.
				</p>
				{#if window_ && senderBank}
					<p class="status-note">
						<strong>{window_.label}.</strong>
						{window_.donorGuidance} The host will not see it on their statement before then, so give them
						that time before following up.
					</p>
				{/if}
				<p class="status-note">
					Keep your private status link. In a live product this would be emailed or texted; here it
					stays in this browser on this device.
				</p>
				<div class="done-actions">
					{#if statusHref}
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- statusHref comes from resolve() -->
						<a class="primary" href={statusHref}>Open your status link</a>
					{/if}
					<a class="ghost" href={resolve('/c/[slug]/host', { slug: campaign.slug })}>
						Open host view (prototype)
					</a>
					<a class="ghost" href={campaignHref}>Back to campaign</a>
				</div>
			</section>
		{/if}
	{/if}
</main>

<style>
	.prototype-banner {
		display: flex;
		flex-wrap: wrap;
		min-height: 40px;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		background: var(--gold-tint);
		font-size: var(--text-sm);
		text-align: center;
	}

	.prototype-banner strong {
		font-family: var(--font-display);
	}

	.site-header {
		display: flex;
		max-width: 720px;
		min-height: 76px;
		align-items: center;
		justify-content: space-between;
		margin: 0 auto;
		padding: var(--space-4);
		border-bottom: 1px solid var(--line);
	}

	.brand-link,
	.back {
		color: inherit;
		text-decoration: none;
		font-weight: 600;
	}

	.back {
		min-height: 48px;
		align-content: center;
		font-size: var(--text-sm);
	}

	main {
		max-width: 720px;
		margin: 0 auto;
		padding: var(--space-7) var(--space-4) var(--space-9);
	}

	.kicker {
		margin: 0 0 var(--space-2);
		color: var(--aqua-deep);
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	h1 {
		margin: 0 0 var(--space-4);
		font-size: var(--text-2xl);
	}

	.lede {
		max-width: 54ch;
		margin: 0 0 var(--space-6);
		color: var(--ink-60);
		font-size: var(--text-lg);
	}

	.steps {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--space-2);
		padding: 0;
		margin: 0 0 var(--space-6);
		list-style: none;
		font-size: var(--text-xs);
		font-weight: 700;
	}

	.steps li {
		padding: var(--space-2);
		border-radius: var(--radius-sm);
		color: var(--ink-40);
		background: var(--paper-2);
		text-align: center;
	}

	.steps li.current {
		color: var(--ink);
		background: var(--gold-tint);
	}

	.steps li.done {
		color: var(--status-received);
		background: #e4f1e9;
	}

	.stack {
		display: grid;
		gap: var(--space-5);
	}

	.prefill-note {
		margin: 0 0 var(--space-4);
		padding: var(--space-3);
		border-radius: var(--radius-sm);
		background: var(--gold-tint);
		color: var(--ink-60);
		font-size: var(--text-sm);
	}

	.card {
		padding: var(--space-6);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		background: #fffdf8;
		box-shadow: var(--shadow-raise);
	}

	.card h2 {
		margin: var(--space-4) 0 var(--space-3);
		font-size: var(--text-xl);
	}

	.card > p,
	.card li {
		color: var(--ink-60);
	}

	.card ul {
		padding-left: var(--space-5);
		margin: 0 0 var(--space-5);
	}

	.amount-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-3);
		margin: var(--space-5) 0;
	}

	.amount-chip {
		min-height: 52px;
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		color: var(--ink);
		background: var(--paper);
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
		cursor: pointer;
	}

	.amount-chip.selected {
		border-color: var(--aqua-deep);
		color: var(--aqua-deep);
		background: var(--aqua-tint);
		box-shadow: inset 0 0 0 1px var(--aqua-deep);
	}

	label {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
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

	.primary,
	.ghost {
		display: grid;
		width: 100%;
		min-height: 52px;
		place-items: center;
		border-radius: var(--radius-md);
		font-weight: 700;
		text-decoration: none;
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
		margin: 0 0 var(--space-4);
		color: var(--status-dispute);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.done-actions {
		display: grid;
		gap: var(--space-3);
		margin-top: var(--space-5);
	}

	.status-note {
		margin: var(--space-4) 0 0;
		color: var(--ink-60);
		font-size: var(--text-sm);
	}

	.done code {
		font-family: var(--font-mono);
	}

	@media (max-width: 520px) {
		.steps {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>

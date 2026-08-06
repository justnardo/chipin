<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Field from '$lib/components/Field.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import StatusChip from '$lib/components/StatusChip.svelte';
	import { getCampaign } from '$lib/prototype/campaigns';
	import {
		donorStatusLabel,
		donorStatusTone,
		formatBsd,
		formatDay,
		getReportByToken,
		ledger,
		matchedCents,
		matchingMethodLabel,
		replyToClarification,
		revokeStatusLink,
		unmatchedCents,
		type PrototypeReport
	} from '$lib/prototype/reports';

	const campaignMeta = $derived(getCampaign(page.params.slug ?? ''));

	let report = $state<PrototypeReport | null>(null);
	let loaded = $state(false);
	let reply = $state('');
	let error = $state('');
	let notice = $state('');
	let copied = $state(false);
	let confirmingRevoke = $state(false);

	const token = $derived(page.params.token ?? '');

	function refresh() {
		report = token ? getReportByToken(token) : null;
		loaded = true;
	}

	$effect(() => {
		if (!browser) return;
		void token;
		refresh();
	});

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(window.location.href);
			copied = true;
			window.setTimeout(() => {
				copied = false;
			}, 1600);
		} catch {
			copied = false;
		}
	}

	function submitReply(event: Event) {
		event.preventDefault();
		if (!token) return;
		const updated = replyToClarification(token, reply);
		if (!updated) {
			error = 'Write a short reply so the host can keep matching.';
			return;
		}
		error = '';
		notice = 'Reply sent. Your report is waiting on the host again.';
		reply = '';
		report = updated;
	}

	function revoke() {
		if (!token) return;
		const updated = revokeStatusLink(token);
		report = updated;
		confirmingRevoke = false;
		notice = 'This status link no longer opens the report.';
	}
</script>

<svelte:head>
	<title>Your report status | ChipIn prototype</title>
	<meta
		name="description"
		content="Prototype donor status link for a ChipIn transfer report. Session-only fictional data."
	/>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="prototype-banner">
	<strong>Donor status link</strong>
	<span>Prototype only. Anyone using this browser can open this link and view the report.</span>
</div>

<SiteHeader showStartAction={false} />

<main>
	{#if !loaded}
		<p class="lede">Loading report…</p>
	{:else if !report}
		<section class="card">
			<StatusChip label="Link not found" tone="disputed" />
			<h1>We could not open this status link</h1>
			<p>
				It may be from another device or browser, or the report was never created here. Run the
				chip-in prototype again to get a fresh link.
			</p>
			<a
				class="primary"
				href={campaignMeta
					? resolve('/c/[slug]/chip-in', { slug: campaignMeta.slug })
					: resolve('/start')}
			>
				Start chip-in flow
			</a>
		</section>
	{:else if report.revoked}
		<section class="card">
			<StatusChip label="Link revoked" tone="closed" />
			<h1>This status link was turned off</h1>
			<p>The report still exists for the host, but this link no longer shows it.</p>
			<a
				class="ghost"
				href={campaignMeta ? resolve('/c/[slug]', { slug: campaignMeta.slug }) : resolve('/')}
			>
				Back to campaign
			</a>
		</section>
	{:else}
		<p class="kicker">Your transfer report</p>
		<h1>{campaignMeta?.title ?? 'Your campaign'}</h1>
		<p class="lede">
			Hosted by {campaignMeta?.hostName ?? 'the campaign host'}. ChipIn records reports and host
			marks — it does not move money.
		</p>

		<section class="card">
			<div class="status-row">
				<StatusChip label={donorStatusLabel(report.status)} tone={donorStatusTone(report.status)} />
				<button type="button" class="linkish" onclick={copyLink}>
					{copied ? 'Link copied' : 'Copy this link'}
				</button>
			</div>

			<dl class="facts">
				<div>
					<dt>Amount you reported</dt>
					<dd>{formatBsd(report.reportedCents)}</dd>
				</div>
				<div>
					<dt>Date sent</dt>
					<dd>{formatDay(report.transferDate)}</dd>
				</div>
				{#if report.bankReference}
					<div>
						<dt>Bank reference</dt>
						<dd>{report.bankReference}</dd>
					</div>
				{/if}
				{#if matchedCents(report) > 0}
					<div>
						<dt>Marked received by host</dt>
						<dd>{formatBsd(matchedCents(report))}</dd>
					</div>
					{#if unmatchedCents(report) > 0}
						<div>
							<dt>Not yet matched</dt>
							<dd>{formatBsd(unmatchedCents(report))}</dd>
						</div>
					{/if}
				{/if}
			</dl>

			{#if ledger(report).length > 0}
				<section class="ledger" aria-labelledby="ledger-heading">
					<h2 id="ledger-heading">What the host recorded</h2>
					<ul>
						{#each ledger(report) as row (row.id)}
							<li class:voided={row.status === 'voided'}>
								<p class="row-amount">
									{formatBsd(row.amountCents)}
									{#if row.status === 'voided'}<span class="tag">withdrawn</span>{/if}
								</p>
								<p class="row-meta">
									{matchingMethodLabel(row.method)} · {formatDay(row.createdAt)}
								</p>
								{#if row.status === 'voided' && row.voidReason}
									<p class="row-meta">Host's reason: {row.voidReason}</p>
								{/if}
							</li>
						{/each}
					</ul>
					<p class="row-meta">
						Withdrawn entries stay visible on purpose. If the host changes an amount, you can still
						see what you were told before and why it changed.
					</p>
				</section>
			{/if}

			{#if report.status === 'clarification_requested'}
				<form class="clarify" onsubmit={submitReply}>
					<h2>The host asked a question</h2>
					<blockquote>{report.clarificationQuestion}</blockquote>
					<Field label="Your reply">
						<textarea bind:value={reply} rows="4" placeholder="Add the detail the host needs"
						></textarea>
					</Field>
					{#if error}
						<p class="error" role="alert">{error}</p>
					{/if}
					<button type="submit" class="primary">Send reply</button>
				</form>
			{:else if report.status === 'marked_received'}
				<p class="outcome">
					The host marked this transfer received. That updates ChipIn's public total for the
					campaign. It does not mean ChipIn verified the bank settlement or how funds are used.
				</p>
			{:else if report.status === 'partially_matched'}
				<p class="outcome">
					The host has found {formatBsd(matchedCents(report))} of the {formatBsd(
						report.reportedCents
					)} you reported. Only that part counts toward the campaign total. The rest is not marked missing
					— the host has not accounted for it yet, and more may still be recorded.
				</p>
			{:else if report.status === 'confirmation_voided'}
				<p class="outcome">
					The host withdrew the amount they had recorded against this report, with the reason shown
					above, so it no longer counts toward the campaign total. This changes ChipIn's record only
					— it does not reverse a bank transfer either way.
				</p>
			{:else if report.status === 'marked_not_found'}
				<p class="outcome">
					The host could not find this transfer. If you still sent it, open a new report from the
					campaign or wait for moderation options in a later build.
				</p>
			{:else}
				<p class="outcome">
					You're all set for now — the host can see your report. Public progress moves only when
					they mark what arrived.
				</p>
				{#if report.clarificationReply}
					<p class="outcome subtle">Your last reply: {report.clarificationReply}</p>
				{/if}
			{/if}

			{#if notice}
				<p class="notice" role="status">{notice}</p>
			{/if}

			<div class="footer-actions">
				<a
					class="primary"
					href={campaignMeta ? resolve('/c/[slug]', { slug: campaignMeta.slug }) : resolve('/')}
				>
					View campaign
				</a>
			</div>

			<!--
				Revoking destroys the donor's only record of what they sent, and it used
				to sit as a same-weight pink button beside two navigation links — the
				loudest control on the page, where the primary action belongs. Demoted
				to a text-weight link behind a confirm, below a rule.
			-->
			<div class="danger-zone">
				{#if confirmingRevoke}
					<p class="confirm-copy">
						Turn this link off? You will not be able to open this report again from this link, and
						this is the only record you have of what you sent.
					</p>
					<div class="confirm-actions">
						<button type="button" class="danger" onclick={revoke}>Yes, turn it off</button>
						<button type="button" class="ghost" onclick={() => (confirmingRevoke = false)}>
							Keep the link
						</button>
					</div>
				{:else}
					<button type="button" class="revoke-link" onclick={() => (confirmingRevoke = true)}>
						Revoke this link
					</button>
				{/if}
			</div>

			<p class="warn">
				Forwarding warning: anyone with this link can view this report's donor-facing status in this
				prototype session.
			</p>
		</section>
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

	.lede,
	.outcome {
		margin: 0 0 var(--space-5);
		color: var(--ink-60);
		font-size: var(--text-lg);
	}

	.outcome.subtle {
		font-size: var(--text-sm);
	}

	.status-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		margin-bottom: var(--space-5);
	}

	.linkish {
		min-height: 48px;
		border: 0;
		color: var(--aqua-deep);
		background: transparent;
		font-size: var(--text-sm);
		font-weight: 700;
		text-decoration: underline;
		text-underline-offset: 0.2em;
		cursor: pointer;
	}

	.facts {
		display: grid;
		gap: var(--space-4);
		margin: 0 0 var(--space-5);
		padding: 0 0 var(--space-5);
		border-bottom: 1px solid var(--line);
	}

	.facts div {
		display: grid;
		gap: var(--space-1);
	}

	dt {
		color: var(--ink-60);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	dd {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
	}

	.ledger {
		margin: 0 0 var(--space-5);
		padding: 0 0 var(--space-5);
		border-bottom: 1px solid var(--line);
	}

	.ledger h2 {
		margin: 0 0 var(--space-3);
		font-size: var(--text-sm);
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.ledger ul {
		display: grid;
		gap: var(--space-3);
		margin: 0 0 var(--space-3);
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

	.row-amount {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 700;
	}

	.voided .row-amount {
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

	.row-meta {
		margin: var(--space-1) 0 0;
		color: var(--ink-60);
		font-size: var(--text-xs);
	}

	.clarify {
		display: grid;
		gap: var(--space-4);
	}

	.clarify h2 {
		margin: 0;
		font-size: var(--text-xl);
	}

	blockquote {
		margin: 0;
		padding: var(--space-4);
		border-left: 4px solid var(--gold);
		background: var(--gold-tint);
		color: var(--ink);
	}

	textarea {
		resize: vertical;
	}

	.footer-actions {
		display: grid;
		gap: var(--space-3);
		margin-top: var(--space-5);
	}

	.danger-zone {
		margin-top: var(--space-6);
		padding-top: var(--space-5);
		border-top: 1px solid var(--line);
	}

	.revoke-link {
		min-height: var(--control-md);
		padding: 0;
		border: 0;
		color: var(--status-dispute);
		background: transparent;
		font-size: var(--text-sm);
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 0.2em;
		cursor: pointer;
	}

	.confirm-copy {
		margin: 0 0 var(--space-4);
		color: var(--ink-60);
		font-size: var(--text-sm);
	}

	.confirm-actions {
		display: grid;
		gap: var(--space-3);
	}

	.error {
		margin: 0 0 var(--space-3);
		color: var(--status-dispute);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.notice {
		margin: var(--space-4) 0 0;
		padding: var(--space-3);
		border-radius: var(--radius-sm);
		color: var(--status-received);
		background: #e4f1e9;
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.warn {
		margin: var(--space-5) 0 0;
		color: var(--ink-60);
		font-size: var(--text-xs);
	}
</style>

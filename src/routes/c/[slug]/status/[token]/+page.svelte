<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import BrandMark from '$lib/components/BrandMark.svelte';
	import StatusChip from '$lib/components/StatusChip.svelte';
	import { getCampaign } from '$lib/prototype/campaigns';
	import {
		donorStatusLabel,
		donorStatusTone,
		formatBsd,
		getReportByToken,
		replyToClarification,
		revokeStatusLink,
		type PrototypeReport
	} from '$lib/prototype/reports';

	const campaignMeta = $derived(getCampaign(page.params.slug ?? ''));

	let report = $state<PrototypeReport | null>(null);
	let loaded = $state(false);
	let reply = $state('');
	let error = $state('');
	let notice = $state('');
	let copied = $state(false);

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
	<span>Prototype only. Anyone with this link can view this report in this browser session.</span>
</div>

<header class="site-header">
	<a class="brand-link" href={resolve('/')} aria-label="ChipIn home"><BrandMark /></a>
	<a
		class="back"
		href={campaignMeta
			? resolve('/c/[slug]', { slug: campaignMeta.slug })
			: resolve('/')}
	>
		Campaign
	</a>
</header>

<main>
	{#if !loaded}
		<p class="lede">Loading report…</p>
	{:else if !report}
		<section class="card">
			<StatusChip label="Link not found" tone="disputed" />
			<h1>We could not open this status link</h1>
			<p>
				It may be from another browser session, or the report was never created here. Run the chip-in
				prototype again to get a fresh link.
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
				href={campaignMeta
					? resolve('/c/[slug]', { slug: campaignMeta.slug })
					: resolve('/')}
			>
				Back to campaign
			</a>
		</section>
	{:else}
		<p class="kicker">Your transfer report</p>
		<h1>{campaignMeta?.title ?? 'Your campaign'}</h1>
		<p class="lede">
			Hosted by {campaignMeta?.hostName ?? 'the campaign host'}. ChipIn records reports and host marks
			— it does not move money.
		</p>

		<section class="card">
			<div class="status-row">
				<StatusChip
					label={donorStatusLabel(report.status)}
					tone={donorStatusTone(report.status)}
				/>
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
					<dd>{report.transferDate}</dd>
				</div>
				{#if report.bankReference}
					<div>
						<dt>Bank reference</dt>
						<dd>{report.bankReference}</dd>
					</div>
				{/if}
				{#if report.attestedCents !== null && report.status === 'marked_received'}
					<div>
						<dt>Marked received by host</dt>
						<dd>{formatBsd(report.attestedCents)}</dd>
					</div>
				{/if}
			</dl>

			{#if report.status === 'clarification_requested'}
				<form class="clarify" onsubmit={submitReply}>
					<h2>The host asked a question</h2>
					<blockquote>{report.clarificationQuestion}</blockquote>
					<label>
						<span>Your reply</span>
						<textarea bind:value={reply} rows="4" placeholder="Add the detail the host needs"></textarea>
					</label>
					{#if error}
						<p class="error" role="alert">{error}</p>
					{/if}
					<button type="submit" class="primary">Send reply</button>
				</form>
			{:else if report.status === 'marked_received'}
				<p class="outcome">
					The host marked this transfer received. That updates ChipIn's public total for the campaign. It
					does not mean ChipIn verified the bank settlement or how funds are used.
				</p>
			{:else if report.status === 'marked_not_found'}
				<p class="outcome">
					The host could not find this transfer. If you still sent it, open a new report from the campaign
					or wait for moderation options in a later build.
				</p>
			{:else}
				<p class="outcome">
					You're all set for now — the host can see your report. Public progress moves only when they mark
					what arrived.
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
					class="ghost"
					href={campaignMeta
						? resolve('/c/[slug]', { slug: campaignMeta.slug })
						: resolve('/')}
				>
					View campaign
				</a>
				<a
					class="ghost"
					href={campaignMeta
						? resolve('/c/[slug]/host', { slug: campaignMeta.slug })
						: resolve('/')}
				>
					Open host view
				</a>
				<button type="button" class="danger" onclick={revoke}>Revoke this link</button>
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
		font-weight: 600;
		text-decoration: none;
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

	.lede,
	.outcome {
		margin: 0 0 var(--space-5);
		color: var(--ink-60);
		font-size: var(--text-lg);
	}

	.outcome.subtle {
		font-size: var(--text-sm);
	}

	.card {
		padding: var(--space-6);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		background: #fffdf8;
		box-shadow: var(--shadow-raise);
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

	.clarify h2 {
		margin: 0 0 var(--space-3);
		font-size: var(--text-xl);
	}

	blockquote {
		margin: 0 0 var(--space-4);
		padding: var(--space-4);
		border-left: 4px solid var(--gold);
		background: var(--gold-tint);
		color: var(--ink);
	}

	label {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	textarea {
		padding: var(--space-3);
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
		background: var(--paper);
		resize: vertical;
	}

	.primary,
	.ghost,
	.danger {
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

	.danger {
		border: 1px solid #e2b4ad;
		color: var(--status-dispute);
		background: #f9e6e2;
	}

	.footer-actions {
		display: grid;
		gap: var(--space-3);
		margin-top: var(--space-5);
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

<script lang="ts">
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import AttestationRow from '$lib/components/AttestationRow.svelte';
	import BrandMark from '$lib/components/BrandMark.svelte';
	import ProgressCoinBar from '$lib/components/ProgressCoinBar.svelte';
	import {
		formatBsd,
		loadReports,
		updateReport,
		type PrototypeReport,
		type ReportStatus
	} from '$lib/prototype/reports';

	const campaign = {
		slug: 'rainbow',
		title: 'Reopen the Rainbow Community Centre',
		goalCents: 800_000,
		baselineReceivedCents: 524_000
	};

	let reports = $state<PrototypeReport[]>([]);

	$effect(() => {
		if (!browser) return;
		reports = loadReports(campaign.slug);
	});

	const attestedExtra = $derived(
		reports
			.filter((r) => r.status === 'marked_received' && r.attestedCents !== null)
			.reduce((sum, r) => sum + (r.attestedCents ?? 0), 0)
	);

	const receivedCents = $derived(campaign.baselineReceivedCents + attestedExtra);
	const pendingCount = $derived(
		reports.filter((r) => r.status === 'submitted' || r.status === 'clarification_requested').length
	);

	function handleAttest(
		id: string,
		payload: {
			status: Extract<
				ReportStatus,
				'marked_received' | 'marked_not_found' | 'clarification_requested'
			>;
			attestedCents?: number;
			clarificationQuestion?: string;
		}
	) {
		updateReport(id, {
			status: payload.status,
			attestedCents: payload.attestedCents ?? null,
			clarificationQuestion: payload.clarificationQuestion ?? ''
		});
		reports = loadReports(campaign.slug);
	}
</script>

<svelte:head>
	<title>Host dashboard | {campaign.title}</title>
	<meta
		name="description"
		content="Prototype ChipIn host attestation view using fictional browser-session reports."
	/>
</svelte:head>

<div class="prototype-banner">
	<strong>Host prototype</strong>
	<span>Reports live in this browser session only. Nothing is saved to a server.</span>
</div>

<header class="site-header">
	<a class="brand-link" href={resolve('/')} aria-label="ChipIn home"><BrandMark /></a>
	<nav>
		<a href={resolve('/c/rainbow')}>Campaign</a>
		<a href={resolve('/c/rainbow/chip-in')}>Chip-in flow</a>
	</nav>
</header>

<main>
	<p class="kicker">Host dashboard</p>
	<h1>{campaign.title}</h1>
	<p class="lede">
		Mark what actually arrived in your bank. Only amounts you mark received count toward public
		progress. ChipIn cannot reverse an external transfer.
	</p>

	<section class="summary" aria-label="Progress summary">
		<div>
			<p class="amount-label">Marked received</p>
			<p class="amount">{formatBsd(receivedCents)}</p>
			<ProgressCoinBar received={receivedCents / 100} goal={campaign.goalCents / 100} />
		</div>
		<p class="pending">
			<strong>{pendingCount}</strong>
			<span>report{pendingCount === 1 ? '' : 's'} waiting on you</span>
		</p>
	</section>

	<section aria-labelledby="inbox-heading">
		<h2 id="inbox-heading">Reported transfers</h2>
		{#if reports.length === 0}
			<div class="empty">
				<p>No reports in this browser session yet.</p>
				<a class="primary" href={resolve('/c/rainbow/chip-in')}>Run the chip-in prototype</a>
			</div>
		{:else}
			<div class="list">
				{#each reports as report (report.id)}
					<AttestationRow
						{report}
						onattest={(payload) => handleAttest(report.id, payload)}
					/>
				{/each}
			</div>
		{/if}
	</section>
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
		background: var(--aqua-tint);
		font-size: var(--text-sm);
		text-align: center;
	}

	.prototype-banner strong {
		font-family: var(--font-display);
	}

	.site-header {
		display: flex;
		max-width: 800px;
		min-height: 76px;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		margin: 0 auto;
		padding: var(--space-4);
		border-bottom: 1px solid var(--line);
	}

	.brand-link {
		color: inherit;
		text-decoration: none;
	}

	nav {
		display: flex;
		gap: var(--space-4);
	}

	nav a {
		min-height: 48px;
		align-content: center;
		color: var(--ink);
		font-size: var(--text-sm);
		font-weight: 600;
		text-decoration: none;
	}

	main {
		max-width: 800px;
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
		max-width: 58ch;
		margin: 0 0 var(--space-6);
		color: var(--ink-60);
		font-size: var(--text-lg);
	}

	.summary {
		display: grid;
		gap: var(--space-5);
		margin-bottom: var(--space-8);
		padding: var(--space-6);
		border: 1px solid var(--line);
		border-top: 6px solid var(--gold);
		border-radius: var(--radius-md);
		background: #fffdf8;
	}

	.amount-label {
		margin: 0 0 var(--space-1);
		color: var(--ink-60);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.amount {
		margin: 0 0 var(--space-4);
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 700;
	}

	.pending {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		margin: 0;
		color: var(--ink-60);
		font-size: var(--text-sm);
	}

	.pending strong {
		color: var(--ink);
		font-family: var(--font-display);
		font-size: var(--text-xl);
	}

	h2 {
		margin: 0 0 var(--space-4);
		font-size: var(--text-xl);
	}

	.list {
		display: grid;
		gap: var(--space-4);
	}

	.empty {
		padding: var(--space-6);
		border: 1px dashed var(--line);
		border-radius: var(--radius-md);
		text-align: center;
	}

	.empty p {
		margin: 0 0 var(--space-4);
		color: var(--ink-60);
	}

	.primary {
		display: inline-grid;
		min-height: 52px;
		place-items: center;
		padding: 0 var(--space-5);
		border-radius: var(--radius-md);
		color: white;
		background: var(--aqua-deep);
		font-weight: 700;
		text-decoration: none;
	}
</style>

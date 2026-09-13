<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import AttestationRow from '$lib/components/AttestationRow.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import ProgressCoinBar from '$lib/components/ProgressCoinBar.svelte';
	import SupportWall from '$lib/components/SupportWall.svelte';
	import UpdateFeed from '$lib/components/UpdateFeed.svelte';
	import { getCampaign, type PrototypeCampaign } from '$lib/prototype/campaigns';
	import {
		applyHostAction,
		campaignAttestedCents,
		formatBsd,
		loadReports,
		unmatchedCents,
		type HostAction,
		type PrototypeReport
	} from '$lib/prototype/reports';

	let campaign = $state<PrototypeCampaign | null>(null);
	let reports = $state<PrototypeReport[]>([]);

	const slug = $derived(page.params.slug ?? '');

	$effect(() => {
		if (!browser) return;
		// Resolve into a local first: reading `campaign` back here would make this effect
		// depend on state it writes, and it would re-run until Svelte bails out.
		const found = getCampaign(slug);
		campaign = found;
		reports = found ? loadReports(found.slug) : [];
	});

	const baselineReceivedCents = $derived(campaign?.slug === 'rainbow' ? 524_000 : 0);

	const receivedCents = $derived(baselineReceivedCents + campaignAttestedCents(reports));
	const pendingCount = $derived(
		reports.filter((r) => r.status === 'submitted' || r.status === 'clarification_requested').length
	);

	/** Money a donor reported that the host has not accounted for either way. */
	const unaccountedCents = $derived(
		reports
			.filter((r) => r.status !== 'marked_not_found')
			.reduce((sum, r) => sum + unmatchedCents(r), 0)
	);

	/** Why the store refused a command, in the host's language. */
	function refusalMessage(action: HostAction): string {
		switch (action.kind) {
			case 'not_found':
				return 'Withdraw the amounts recorded below first — this report still counts money toward the total.';
			case 'void':
			case 'correct':
				return 'That entry has already been withdrawn.';
			case 'record':
				return 'Enter an amount greater than zero.';
			case 'clarify':
				return 'Write a short question for the donor.';
		}
	}

	function handleAction(id: string, action: HostAction): string {
		if (!campaign) return 'Campaign not found in this browser.';
		const updated = applyHostAction(id, action);
		if (!updated) return refusalMessage(action);
		reports = loadReports(campaign.slug);
		return '';
	}
</script>

<svelte:head>
	<title>Host dashboard | {campaign?.title ?? 'Campaign'}</title>
	<meta
		name="description"
		content="Prototype ChipIn host attestation view using fictional browser-session reports."
	/>
</svelte:head>

<div class="prototype-banner">
	<strong>Host prototype</strong>
	<span>Reports live in this browser on this device. Nothing is saved to a server.</span>
</div>

<SiteHeader
	links={campaign
		? [
				{ label: 'Campaign', href: resolve('/c/[slug]', { slug: campaign.slug }) },
				{ label: 'Chip-in flow', href: resolve('/c/[slug]/chip-in', { slug: campaign.slug }) }
			]
		: []}
	showStartAction={false}
/>

<main class="shell">
	{#if !campaign}
		<section class="empty">
			<p>Campaign not found in this browser.</p>
			<a class="primary" href={resolve('/start')}>Start a campaign</a>
		</section>
	{:else}
		<p class="eyebrow">Host dashboard</p>
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
			{#if unaccountedCents > 0}
				<p class="pending money">
					<strong>{formatBsd(unaccountedCents)}</strong>
					<span>reported but not yet accounted for either way</span>
				</p>
			{/if}
		</section>

		<section aria-labelledby="inbox-heading">
			<h2 id="inbox-heading">Reported transfers</h2>
			{#if reports.length === 0}
				<div class="empty">
					<p>No reports in this browser yet.</p>
					<a class="primary" href={resolve('/c/[slug]/chip-in', { slug: campaign.slug })}
						>Run the chip-in prototype</a
					>
				</div>
			{:else}
				<div class="list">
					{#each reports as report (report.id)}
						<AttestationRow
							{report}
							recipientBankId={report.recipientBankId ||
								campaign.receivingAccounts[0]?.bankId ||
								'other'}
							statusHref={resolve('/c/[slug]/status/[token]', {
								slug: campaign.slug,
								token: report.statusToken
							})}
							onattest={(action) => handleAction(report.id, action)}
						/>
					{/each}
				</div>
			{/if}
		</section>

		<UpdateFeed campaignSlug={campaign.slug} isHost />
		<SupportWall campaignSlug={campaign.slug} isHost />
	{/if}
</main>

<SiteFooter />

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

	main {
		max-width: 800px;
		margin-inline: auto;
		padding-block: var(--space-7) var(--space-9);
	}

	h1 {
		margin: 0 0 var(--space-4);
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
		border-radius: var(--radius-md);
		background: var(--surface);
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

	/* A currency amount is several words wide; at display size it breaks mid-figure. */
	.pending.money strong {
		font-size: var(--text-lg);
		white-space: nowrap;
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
</style>

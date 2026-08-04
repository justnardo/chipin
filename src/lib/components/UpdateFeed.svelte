<script lang="ts">
	import { browser } from '$app/environment';
	import {
		addUpdate,
		formatUpdateDate,
		loadUpdates,
		RAINBOW_UPDATE_SEED,
		type CampaignUpdate
	} from '$lib/prototype/updates';

	let {
		campaignSlug,
		isHost = false
	}: {
		campaignSlug: string;
		isHost?: boolean;
	} = $props();

	let updates = $state<CampaignUpdate[]>([]);
	let title = $state('');
	let body = $state('');
	let error = $state('');
	let notice = $state('');
	let formOpen = $state(false);

	function refresh() {
		const stored = loadUpdates(campaignSlug);
		if (campaignSlug === 'rainbow') {
			const seeds = RAINBOW_UPDATE_SEED.filter((seed) => !stored.some((u) => u.id === seed.id));
			updates = [...stored, ...seeds];
			return;
		}
		updates = stored;
	}

	$effect(() => {
		if (!browser) return;
		void campaignSlug;
		refresh();
	});

	function submit(event: Event) {
		event.preventDefault();
		if (title.trim().length < 4 || body.trim().length < 12) {
			error = 'Give the update a short title and a sentence or two.';
			return;
		}
		error = '';
		addUpdate({ campaignSlug, title: title.trim(), body: body.trim() });
		title = '';
		body = '';
		formOpen = false;
		notice = 'Update posted to the campaign.';
		refresh();
	}
</script>

<section class="updates" aria-labelledby="updates-heading">
	<p class="kicker">Updates</p>
	<h2 id="updates-heading">From the organiser</h2>

	{#if isHost}
		{#if formOpen}
			<form class="compose" onsubmit={submit}>
				<label>
					<span>Update title</span>
					<input type="text" bind:value={title} placeholder="Chairs arrived" required />
				</label>
				<label>
					<span>What happened?</span>
					<textarea bind:value={body} rows="4" required></textarea>
				</label>
				{#if error}
					<p class="error" role="alert">{error}</p>
				{/if}
				<div class="compose-actions">
					<button type="submit">Post update</button>
					<button type="button" class="ghost" onclick={() => (formOpen = false)}>Cancel</button>
				</div>
			</form>
		{:else}
			<button type="button" class="new-update" onclick={() => (formOpen = true)}>
				Post an update
			</button>
		{/if}
	{/if}

	{#if notice}
		<p class="notice" role="status">{notice}</p>
	{/if}

	{#if updates.length === 0}
		<p class="empty">No updates yet.</p>
	{:else}
		<ul class="update-list">
			{#each updates as update (update.id)}
				<li>
					<p class="update-date">{formatUpdateDate(update.createdAt)}</p>
					<h3>{update.title}</h3>
					<p>{update.body}</p>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.updates {
		margin-top: var(--space-8);
		padding-top: var(--space-7);
		border-top: 1px solid var(--line);
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
		margin: 0 0 var(--space-4);
		font-size: var(--text-2xl);
	}

	.update-list {
		padding: 0;
		margin: 0;
		list-style: none;
	}

	.update-list li {
		padding: var(--space-4) 0;
		border-bottom: 1px solid var(--line);
	}

	.update-date {
		margin: 0 0 var(--space-1);
		color: var(--ink-60);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.update-list h3 {
		margin: 0 0 var(--space-2);
		font-size: var(--text-lg);
	}

	.update-list p:last-child {
		margin: 0;
		color: var(--ink-60);
	}

	.new-update {
		min-height: 48px;
		margin-bottom: var(--space-4);
		padding: 0 var(--space-5);
		border: 1px solid var(--aqua-deep);
		border-radius: var(--radius-md);
		color: var(--aqua-deep);
		background: transparent;
		font-weight: 700;
		cursor: pointer;
	}

	.compose {
		display: grid;
		gap: var(--space-3);
		margin-bottom: var(--space-5);
		padding: var(--space-5);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		background: #fffdf8;
	}

	label {
		display: grid;
		gap: var(--space-2);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	input,
	textarea {
		min-height: 48px;
		padding: var(--space-3);
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
		background: var(--paper);
		font: inherit;
		font-weight: 400;
	}

	textarea {
		min-height: 110px;
		resize: vertical;
	}

	.compose-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
	}

	.compose-actions button {
		min-height: 52px;
		border: 0;
		border-radius: var(--radius-md);
		font-weight: 700;
		cursor: pointer;
	}

	.compose-actions button[type='submit'] {
		color: white;
		background: var(--aqua-deep);
	}

	.compose-actions .ghost {
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

	.notice {
		margin: 0 0 var(--space-3);
		color: var(--status-received);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.empty {
		margin: 0;
		color: var(--ink-60);
	}
</style>

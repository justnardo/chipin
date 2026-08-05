<script lang="ts">
	import { browser } from '$app/environment';
	import {
		addHostReply,
		addSupport,
		loadSupport,
		RAINBOW_SUPPORT_SEED,
		type SupportMessage
	} from '$lib/prototype/support';

	let {
		campaignSlug,
		isHost = false
	}: {
		campaignSlug: string;
		isHost?: boolean;
	} = $props();

	let messages = $state<SupportMessage[]>([]);
	let name = $state('');
	let message = $state('');
	let error = $state('');
	let notice = $state('');
	let replyDrafts = $state<Record<string, string>>({});
	let openReply = $state<string | null>(null);

	function refresh() {
		const stored = loadSupport(campaignSlug);
		if (campaignSlug === 'rainbow') {
			const seeds = RAINBOW_SUPPORT_SEED.filter((seed) => !stored.some((s) => s.id === seed.id));
			messages = [...stored, ...seeds];
			return;
		}
		messages = stored;
	}

	$effect(() => {
		if (!browser) return;
		void campaignSlug;
		refresh();
	});

	function submit(event: Event) {
		event.preventDefault();
		if (message.trim().length < 8) {
			error = 'Write a short note of support.';
			return;
		}
		error = '';
		addSupport({
			campaignSlug,
			name: name.trim() || 'Anonymous',
			message: message.trim()
		});
		name = '';
		message = '';
		notice = 'Thank you — your words are on the wall.';
		refresh();
	}

	function submitReply(id: string) {
		const draft = (replyDrafts[id] ?? '').trim();
		if (draft.length < 4) return;
		addHostReply(id, draft);
		replyDrafts = { ...replyDrafts, [id]: '' };
		openReply = null;
		refresh();
	}
</script>

<section class="wall" aria-labelledby="support-heading">
	<p class="kicker">Words of support</p>
	<h2 id="support-heading">Encourage the host</h2>
	<p class="lede">
		Leave a public note — like a GoFundMe comment — without ChipIn taking any money.
	</p>

	<form class="form" onsubmit={submit}>
		<label>
			<span>Name (optional)</span>
			<input type="text" bind:value={name} placeholder="Anonymous" />
		</label>
		<label>
			<span>Your message</span>
			<textarea bind:value={message} rows="3" placeholder="We're with you." required></textarea>
		</label>
		{#if error}
			<p class="error" role="alert">{error}</p>
		{/if}
		{#if notice}
			<p class="notice" role="status">{notice}</p>
		{/if}
		<button type="submit">Post support</button>
	</form>

	<ul class="list">
		{#each messages as entry (entry.id)}
			<li>
				<div class="avatar" aria-hidden="true">{entry.name.slice(0, 1)}</div>
				<div class="thread">
					<p class="meta">
						<strong>{entry.name}</strong>
					</p>
					<p class="body">{entry.message}</p>

					{#each entry.replies as reply (reply.id)}
						<div class="reply">
							<p class="meta host">
								<strong>Host reply</strong>
								<span>· thank-you note</span>
							</p>
							<p class="body">{reply.message}</p>
						</div>
					{/each}

					{#if isHost}
						{#if openReply === entry.id}
							<div class="reply-form">
								<label>
									<span>Thank-you reply</span>
									<textarea bind:value={replyDrafts[entry.id]} rows="2" required></textarea>
								</label>
								<div class="reply-actions">
									<button type="button" class="small" onclick={() => submitReply(entry.id)}>
										Post reply
									</button>
									<button type="button" class="small ghost" onclick={() => (openReply = null)}>
										Cancel
									</button>
								</div>
							</div>
						{:else}
							<button type="button" class="reply-toggle" onclick={() => (openReply = entry.id)}>
								Reply
							</button>
						{/if}
					{/if}
				</div>
			</li>
		{/each}
	</ul>
</section>

<style>
	.wall {
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
		margin: 0 0 var(--space-3);
		font-size: var(--text-2xl);
	}

	.lede {
		margin: 0 0 var(--space-5);
		color: var(--ink-60);
	}

	.form {
		display: grid;
		gap: var(--space-3);
		margin-bottom: var(--space-6);
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
		min-height: 96px;
		resize: vertical;
	}

	button {
		min-height: 52px;
		border: 0;
		border-radius: var(--radius-md);
		color: white;
		background: var(--aqua-deep);
		font-weight: 700;
		cursor: pointer;
	}

	.error {
		margin: 0;
		color: var(--status-dispute);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.notice {
		margin: 0;
		color: var(--status-received);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.list {
		padding: 0;
		margin: 0;
		list-style: none;
	}

	.list > li {
		display: grid;
		grid-template-columns: 40px 1fr;
		gap: var(--space-3);
		padding: var(--space-4) 0;
		border-bottom: 1px solid var(--line);
	}

	.avatar {
		display: grid;
		width: 40px;
		height: 40px;
		place-items: center;
		border-radius: 50%;
		color: var(--paper);
		background: var(--ink);
		font-family: var(--font-display);
		font-weight: 700;
	}

	.thread {
		min-width: 0;
	}

	.meta {
		margin: 0 0 var(--space-1);
		font-size: var(--text-sm);
	}

	.meta span {
		color: var(--ink-60);
		font-weight: 400;
	}

	.meta.host strong {
		color: var(--aqua-deep);
	}

	.body {
		margin: 0;
		color: var(--ink-60);
	}

	.reply {
		margin-top: var(--space-3);
		padding-left: var(--space-4);
		border-left: 2px solid var(--line);
	}

	.reply-toggle {
		min-height: 40px;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--aqua-deep);
		font-size: var(--text-sm);
		font-weight: 700;
		text-align: left;
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.reply-form {
		display: grid;
		gap: var(--space-3);
		margin-top: var(--space-3);
		padding-top: var(--space-3);
		border-top: 1px dashed var(--line);
	}

	.reply-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
	}

	button.small {
		min-height: 44px;
		font-size: var(--text-sm);
	}

	button.small.ghost {
		border: 1px solid var(--line);
		color: var(--ink);
		background: transparent;
	}
</style>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import BrandMark from '$lib/components/BrandMark.svelte';
	import ProgressCoinBar from '$lib/components/ProgressCoinBar.svelte';
	import StatusChip from '$lib/components/StatusChip.svelte';
	import {
		COVER_PRESETS,
		dollarsToGoalCents,
		formatGoal,
		saveCampaign,
		type CampaignCategory
	} from '$lib/prototype/campaigns';

	const categories: CampaignCategory[] = [
		'Community',
		'Medical',
		'Education',
		'Funeral',
		'Emergency',
		'Other'
	];

	type Step = 'basics' | 'story' | 'preview';

	let step = $state<Step>('basics');
	let title = $state('');
	let hostName = $state('');
	let location = $state('Nassau, The Bahamas');
	let category = $state<CampaignCategory>('Community');
	let story = $state('');
	let goalInput = $state('5000');
	let coverId = $state<(typeof COVER_PRESETS)[number]['id']>('friends');
	let error = $state('');
	let publishing = $state(false);

	const cover = $derived(COVER_PRESETS.find((c) => c.id === coverId) ?? COVER_PRESETS[0]);
	const goalCents = $derived(dollarsToGoalCents(goalInput));

	function goStory(event: Event) {
		event.preventDefault();
		if (title.trim().length < 8) {
			error = 'Give your campaign a clear title (at least a short sentence).';
			return;
		}
		if (hostName.trim().length < 2) {
			error = 'Add the host or organiser name.';
			return;
		}
		error = '';
		step = 'story';
	}

	function goPreview(event: Event) {
		event.preventDefault();
		if (story.trim().length < 40) {
			error = 'Tell a bit more of the story so people know why to chip in.';
			return;
		}
		if (goalCents === null) {
			error = 'Set a goal of at least BSD $100.';
			return;
		}
		error = '';
		step = 'preview';
	}

	async function publish() {
		if (goalCents === null) return;
		publishing = true;
		const campaign = saveCampaign({
			title: title.trim(),
			hostName: hostName.trim(),
			location: location.trim() || 'The Bahamas',
			category,
			story: story.trim(),
			goalCents,
			coverImage: cover.image,
			coverAlt: cover.alt
		});
		await goto(resolve('/c/[slug]', { slug: campaign.slug }));
	}
</script>

<svelte:head>
	<title>Start a campaign | ChipIn</title>
	<meta
		name="description"
		content="Create a ChipIn campaign page prototype — shareable like GoFundMe, with money still moving by local bank transfer."
	/>
</svelte:head>

<div class="prototype-banner">
	<strong>Start a campaign</strong>
	<span>Prototype pages stay in this browser. No review queue or real money yet.</span>
</div>

<header class="site-header">
	<a class="brand-link" href={resolve('/')} aria-label="ChipIn home"><BrandMark /></a>
	<a class="back" href={resolve('/')}>Back home</a>
</header>

<main>
	<p class="kicker">New fundraiser</p>
	<h1>Put your campaign on ChipIn</h1>
	<p class="lede">
		Build the page people will share on WhatsApp. Contributors send money to you directly — ChipIn
		keeps the story, progress, and record.
	</p>

	<ol class="steps" aria-label="Create steps">
		<li class:current={step === 'basics'} class:done={step !== 'basics'}>1. Basics</li>
		<li class:current={step === 'story'} class:done={step === 'preview'}>2. Story</li>
		<li class:current={step === 'preview'}>3. Preview</li>
	</ol>

	<div class="layout">
		{#if step === 'basics'}
			<form class="card" onsubmit={goStory}>
				<h2>Who is this for?</h2>
				<label>
					<span>Campaign title</span>
					<input type="text" bind:value={title} placeholder="Help reopen the youth centre" required />
				</label>
				<label>
					<span>Host / organiser name</span>
					<input type="text" bind:value={hostName} placeholder="Your name or organisation" required />
				</label>
				<label>
					<span>Location</span>
					<input type="text" bind:value={location} placeholder="Nassau, The Bahamas" />
				</label>
				<label>
					<span>Category</span>
					<select bind:value={category}>
						{#each categories as item}
							<option value={item}>{item}</option>
						{/each}
					</select>
				</label>
				{#if error}
					<p class="error" role="alert">{error}</p>
				{/if}
				<button type="submit" class="primary">Continue</button>
			</form>
		{:else if step === 'story'}
			<form class="card" onsubmit={goPreview}>
				<h2>Tell the story</h2>
				<label>
					<span>Why are you raising money?</span>
					<textarea
						bind:value={story}
						rows="7"
						placeholder="Share what happened, what the money is for, and how people can help."
						required
					></textarea>
				</label>
				<label>
					<span>Goal (BSD)</span>
					<input type="text" inputmode="decimal" bind:value={goalInput} required />
				</label>
				<fieldset>
					<legend>Cover photo</legend>
					<div class="covers">
						{#each COVER_PRESETS as preset}
							<label class="cover-option">
								<input type="radio" name="cover" value={preset.id} bind:group={coverId} />
								<img src={preset.image} alt={preset.alt} width="160" height="100" />
							</label>
						{/each}
					</div>
				</fieldset>
				{#if error}
					<p class="error" role="alert">{error}</p>
				{/if}
				<div class="row-actions">
					<button type="button" class="ghost" onclick={() => (step = 'basics')}>Back</button>
					<button type="submit" class="primary">Preview page</button>
				</div>
			</form>
		{:else}
			<section class="card">
				<h2>Looking good?</h2>
				<p>
					Publish a prototype page in this browser. You can share the link locally; it is not on a
					public server yet.
				</p>
				<div class="row-actions">
					<button type="button" class="ghost" onclick={() => (step = 'story')}>Edit story</button>
					<button type="button" class="primary" onclick={publish} disabled={publishing}>
						{publishing ? 'Publishing…' : 'Publish campaign page'}
					</button>
				</div>
			</section>
		{/if}

		<aside class="preview" aria-label="Live preview">
			<p class="preview-label">Live preview</p>
			<article class="preview-card">
				<img src={cover.image} alt={cover.alt} width="640" height="360" />
				<div class="preview-body">
					<StatusChip label={category} tone="active" />
					<h3>{title.trim() || 'Your campaign title'}</h3>
					<p class="host">
						Hosted by <strong>{hostName.trim() || 'Your name'}</strong>
						· {location.trim() || 'The Bahamas'}
					</p>
					<p class="amount">{goalCents ? formatGoal(goalCents) : 'BSD $0'} goal</p>
					<ProgressCoinBar received={0} goal={goalCents ? goalCents / 100 : 1} />
					<p class="story-preview">
						{story.trim() || 'Your story will show here as you write it.'}
					</p>
					<span class="fake-cta">Chip in now</span>
				</div>
			</article>
		</aside>
	</div>
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
		max-width: 1100px;
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
		max-width: 1100px;
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

	.steps {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
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

	.layout {
		display: grid;
		gap: var(--space-6);
	}

	.card,
	.preview-card {
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		background: #fffdf8;
		box-shadow: var(--shadow-raise);
	}

	.card {
		padding: var(--space-6);
	}

	.card h2 {
		margin: 0 0 var(--space-4);
		font-size: var(--text-xl);
	}

	label,
	fieldset {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
		border: 0;
		padding: 0;
		font-size: var(--text-sm);
		font-weight: 600;
	}

	input,
	select,
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
		min-height: 160px;
		resize: vertical;
	}

	.covers {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-3);
	}

	.cover-option {
		position: relative;
		margin: 0;
		cursor: pointer;
	}

	.cover-option input {
		position: absolute;
		inset: 0;
		opacity: 0;
	}

	.cover-option img {
		width: 100%;
		aspect-ratio: 16 / 10;
		border: 2px solid var(--line);
		border-radius: var(--radius-sm);
		object-fit: cover;
	}

	.cover-option:has(input:checked) img {
		border-color: var(--aqua-deep);
		box-shadow: 0 0 0 2px var(--aqua-tint);
	}

	.row-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
	}

	.primary,
	.ghost {
		display: grid;
		min-height: 52px;
		place-items: center;
		border-radius: var(--radius-md);
		font-weight: 700;
		cursor: pointer;
	}

	.primary {
		border: 0;
		color: white;
		background: var(--aqua-deep);
	}

	.primary:disabled {
		opacity: 0.7;
		cursor: wait;
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

	.preview-label {
		margin: 0 0 var(--space-3);
		color: var(--ink-60);
		font-size: var(--text-sm);
		font-weight: 700;
	}

	.preview-card {
		overflow: hidden;
	}

	.preview-card img {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
	}

	.preview-body {
		padding: var(--space-5);
	}

	.preview-body h3 {
		margin: var(--space-3) 0;
		font-size: var(--text-xl);
	}

	.host,
	.story-preview {
		color: var(--ink-60);
		font-size: var(--text-sm);
	}

	.amount {
		margin: var(--space-4) 0 var(--space-2);
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
	}

	.fake-cta {
		display: grid;
		min-height: 48px;
		margin-top: var(--space-4);
		place-items: center;
		border-radius: var(--radius-md);
		color: white;
		background: var(--aqua-deep);
		font-weight: 700;
	}

	@media (min-width: 900px) {
		.layout {
			grid-template-columns: minmax(0, 1fr) minmax(280px, 0.9fr);
			align-items: start;
		}

		.preview {
			position: sticky;
			top: var(--space-4);
		}
	}
</style>

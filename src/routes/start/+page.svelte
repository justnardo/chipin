<script lang="ts">
	import { resolve } from '$app/paths';
	import BankMark from '$lib/components/BankMark.svelte';
	import BankPicker from '$lib/components/BankPicker.svelte';
	import Field from '$lib/components/Field.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import ProgressCoinBar from '$lib/components/ProgressCoinBar.svelte';
	import StatusChip from '$lib/components/StatusChip.svelte';
	import { getBank } from '$lib/prototype/banks';
	import {
		COVER_PRESETS,
		dollarsToGoalCents,
		formatGoal,
		saveCampaign,
		type CampaignCategory,
		type PrototypeCampaign,
		type ReceivingAccount
	} from '$lib/prototype/campaigns';
	import { PROTOTYPE_PHOTO_DISCLOSURE } from '$lib/prototype/photos';

	const categories: CampaignCategory[] = [
		'Community',
		'Medical',
		'Education',
		'Funeral',
		'Emergency',
		'Other'
	];

	type Step = 'basics' | 'story' | 'banking' | 'preview' | 'done';

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
	let published = $state<PrototypeCampaign | null>(null);
	let shareNote = $state('');

	// Hosts routinely receive on more than one channel; each saved account becomes
	// an option the donor can pick, and picking the bank they already use turns an
	// interbank wait into a same-day transfer. The form below edits one candidate
	// account; `accounts` is the list already saved.
	let accounts = $state<ReceivingAccount[]>([]);
	// Deliberately empty. This was defaulted to 'bob', so a host who scrolled
	// past the picker published Bank of The Bahamas as the account strangers
	// wire money to — the single most consequential field in the product,
	// pre-answered and wearing the same selected ring as a real choice.
	let receivingBankId = $state('');
	let accountName = $state('');
	let accountNumber = $state('');
	let branch = $state('');
	let handle = $state('');

	const receivingBank = $derived(getBank(receivingBankId));
	const isWallet = $derived(receivingBank?.kind === 'wallet');
	const formEmpty = $derived(
		!receivingBankId &&
			!accountName.trim() &&
			!accountNumber.trim() &&
			!handle.trim() &&
			!branch.trim()
	);

	/** Validate the in-progress form; returns the account or an error message. */
	function readAccountForm(): ReceivingAccount | string {
		if (!receivingBankId) {
			return 'Choose the bank or wallet this account is held at.';
		}
		if (accountName.trim().length < 2) {
			return 'Add the account name exactly as your bank shows it.';
		}
		if (isWallet) {
			if (handle.trim().length < 4) {
				return 'Add the wallet handle or number donors should send to.';
			}
		} else if (accountNumber.replace(/\D/g, '').length < 6) {
			return 'Add the account number donors should send to.';
		}
		return {
			bankId: receivingBankId,
			accountName: accountName.trim(),
			accountNumber: isWallet ? '' : accountNumber.trim(),
			branch: branch.trim(),
			handle: isWallet ? handle.trim() : ''
		};
	}

	function clearAccountForm() {
		receivingBankId = '';
		accountName = '';
		accountNumber = '';
		branch = '';
		handle = '';
	}

	function addAccount() {
		const result = readAccountForm();
		if (typeof result === 'string') {
			error = result;
			return;
		}
		error = '';
		accounts = [...accounts, result];
		clearAccountForm();
	}

	function removeAccount(index: number) {
		accounts = accounts.filter((_, i) => i !== index);
	}

	const cover = $derived(COVER_PRESETS.find((c) => c.id === coverId) ?? COVER_PRESETS[0]);
	const goalCents = $derived(dollarsToGoalCents(goalInput));
	const publishedHref = $derived(published ? resolve('/c/[slug]', { slug: published.slug }) : '');

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
		step = 'banking';
	}

	function goPreview2(event: Event) {
		event.preventDefault();
		// A half-filled form on Continue is almost always "I typed my details and
		// didn't press Save" — fold it in rather than losing it or nagging.
		if (!formEmpty) {
			const result = readAccountForm();
			if (typeof result === 'string') {
				error = result;
				return;
			}
			accounts = [...accounts, result];
			clearAccountForm();
		}
		if (accounts.length === 0) {
			error = 'Add at least one account or wallet donors can send to.';
			return;
		}
		error = '';
		step = 'preview';
	}

	function publish() {
		if (goalCents === null) return;
		publishing = true;
		published = saveCampaign({
			title: title.trim(),
			hostName: hostName.trim(),
			location: location.trim() || 'The Bahamas',
			category,
			story: story.trim(),
			goalCents,
			coverImage: cover.image,
			coverImageWide: cover.imageWide,
			coverAlt: cover.alt,
			receivingAccounts: accounts
		});
		publishing = false;
		step = 'done';
	}

	async function sharePublished() {
		if (!published || !publishedHref) return;
		const url = `${window.location.origin}${publishedHref}`;
		const text = `${published.title} — chip in on ChipIn`;
		try {
			if (navigator.share) {
				await navigator.share({ title: published.title, text, url });
				shareNote = 'Shared — thank you.';
				return;
			}
		} catch {
			/* clipboard fallback */
		}
		try {
			await navigator.clipboard.writeText(url);
			shareNote = 'Link copied — paste it in WhatsApp.';
		} catch {
			shareNote = url;
		}
	}

	function shareWhatsApp() {
		if (!published || !publishedHref) return;
		const url = `${window.location.origin}${publishedHref}`;
		const text = encodeURIComponent(`${published.title}\nChip in here: ${url}`);
		window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
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

<SiteHeader />

<main class="shell">
	<p class="eyebrow">New fundraiser</p>
	<h1>Put your campaign on ChipIn</h1>
	<p class="lede">
		Build the page people will share on WhatsApp. Contributors send money to you directly — ChipIn
		keeps the story, progress, and record.
	</p>

	<ol class="steps" aria-label="Create steps">
		<li class:current={step === 'basics'} class:done={step !== 'basics'}>1. Basics</li>
		<li
			class:current={step === 'story'}
			class:done={step === 'banking' || step === 'preview' || step === 'done'}
		>
			2. Story
		</li>
		<li class:current={step === 'banking'} class:done={step === 'preview' || step === 'done'}>
			3. Transfer details
		</li>
		<li class:current={step === 'preview'} class:done={step === 'done'}>4. Preview</li>
		<li class:current={step === 'done'}>5. Share</li>
	</ol>

	<div class="layout">
		{#if step === 'basics'}
			<form class="card" onsubmit={goStory}>
				<h2>Who is this for?</h2>
				<Field label="Campaign title">
					<input
						type="text"
						bind:value={title}
						placeholder="Help reopen the youth centre"
						required
					/>
				</Field>
				<Field label="Host / organiser name">
					<input
						type="text"
						bind:value={hostName}
						placeholder="Your name or organisation"
						required
					/>
				</Field>
				<Field label="Location">
					<input type="text" bind:value={location} placeholder="Nassau, The Bahamas" />
				</Field>
				<Field label="Category">
					<select bind:value={category}>
						{#each categories as item (item)}
							<option value={item}>{item}</option>
						{/each}
					</select>
				</Field>
				{#if error}
					<p class="error" role="alert">{error}</p>
				{/if}
				<button type="submit" class="primary">Continue</button>
			</form>
		{:else if step === 'story'}
			<form class="card" onsubmit={goPreview}>
				<h2>Tell the story</h2>
				<Field label="Why are you raising money?">
					<textarea
						bind:value={story}
						rows="7"
						placeholder="Share what happened, what the money is for, and how people can help."
						required></textarea>
				</Field>
				<Field label="Goal (BSD)">
					<input type="text" inputmode="decimal" bind:value={goalInput} required />
				</Field>
				<fieldset>
					<legend>Cover photo</legend>
					<div class="covers">
						{#each COVER_PRESETS as preset (preset.id)}
							<label class="cover-option">
								<input type="radio" name="cover" value={preset.id} bind:group={coverId} />
								<img src={preset.image} alt={preset.alt} width="160" height="100" />
							</label>
						{/each}
					</div>
					<!--
						Carried here as well as beside the preview: below 1000px the
						preview stacks after the whole form, so from this picker the
						footer and the preview are both far below the fold. The covers
						are eight real photographs, so the notice rides with them.
					-->
					<p class="disclosure">{PROTOTYPE_PHOTO_DISCLOSURE}</p>
				</fieldset>
				{#if error}
					<p class="error" role="alert">{error}</p>
				{/if}
				<div class="row-actions">
					<button type="button" class="ghost" onclick={() => (step = 'basics')}>Back</button>
					<button type="submit" class="primary">Continue</button>
				</div>
			</form>
		{:else if step === 'banking'}
			<!--
				novalidate: the account fields carry `required`, but once the host has
				saved an account the form is legitimately empty — native constraint
				validation would block "Preview page" before goPreview2 could see the
				saved list. readAccountForm() does the real validation with better
				messages either way.
			-->
			<form class="card" novalidate onsubmit={goPreview2}>
				<h2>Where should donors send money?</h2>
				<p class="step-lede">
					Donors see these details only after they start chipping in — never on your public campaign
					page, and never in a WhatsApp link preview. ChipIn never touches this money; donors send
					it straight to you. Add every account you can receive on — when a donor banks where you
					do, their transfer usually lands the same day instead of taking days.
				</p>

				{#if accounts.length > 0}
					<ul class="account-list" aria-label="Accounts donors can send to">
						{#each accounts as account, index (index)}
							{@const bank = getBank(account.bankId)}
							<li>
								{#if bank}
									<BankMark {bank} size="sm" />
								{/if}
								<div class="account-text">
									<strong>{bank?.shortName ?? account.bankId}</strong>
									<span>{account.accountName} · {account.handle || account.accountNumber}</span>
								</div>
								<button type="button" class="remove" onclick={() => removeAccount(index)}>
									Remove
								</button>
							</li>
						{/each}
					</ul>
				{/if}

				<fieldset>
					<legend id="receiving-bank-label">Your bank or wallet</legend>
					<BankPicker
						bind:value={receivingBankId}
						variant="list"
						labelledBy="receiving-bank-label"
					/>
				</fieldset>

				<Field label="Account name">
					<input
						type="text"
						bind:value={accountName}
						placeholder="Exactly as your bank shows it"
						required
					/>
				</Field>

				{#if isWallet}
					<Field label="Wallet handle or number">
						<input type="text" bind:value={handle} placeholder="What donors send to" required />
					</Field>
				{:else}
					<Field label="Account number">
						<input type="text" inputmode="numeric" bind:value={accountNumber} required />
					</Field>
					<Field label="Branch (optional)">
						<input type="text" bind:value={branch} placeholder="Where the account is held" />
					</Field>
				{/if}

				<button type="button" class="add-account" onclick={addAccount}>
					Save this account · add another
				</button>

				<p class="gate-warning">
					<strong>Prototype only.</strong> Use fictional details. This build stores campaigns in your
					browser and has no server, no encryption at rest, and no access controls. Do not enter a real
					account number until the disclosure decision in the threat model is closed.
				</p>

				{#if error}
					<p class="error" role="alert">{error}</p>
				{/if}
				<div class="row-actions">
					<button type="button" class="ghost" onclick={() => (step = 'story')}>Back</button>
					<button type="submit" class="primary">Preview page</button>
				</div>
			</form>
		{:else if step === 'preview'}
			<section class="card">
				<h2>Looking good?</h2>
				<p>
					Publish a prototype page in this browser. You can share the link locally; it is not on a
					public server yet.
				</p>
				<div class="row-actions">
					<button type="button" class="ghost" onclick={() => (step = 'banking')}
						>Edit details</button
					>
					<button type="button" class="primary" onclick={publish} disabled={publishing}>
						{publishing ? 'Publishing…' : 'Publish campaign page'}
					</button>
				</div>
			</section>
		{:else if published}
			<section class="card done-card">
				<StatusChip label="Campaign published" tone="received" />
				<h2>Your page is ready — share it</h2>
				<p>
					Same instinct as GoFundMe: get the link into WhatsApp. This prototype link works in this
					browser on this device.
				</p>
				<code class="share-url">{publishedHref}</code>
				<div class="row-actions">
					<button type="button" class="primary" onclick={sharePublished}>Copy / share link</button>
					<button type="button" class="ghost" onclick={shareWhatsApp}>WhatsApp</button>
				</div>
				{#if shareNote}
					<p class="share-note" role="status">{shareNote}</p>
				{/if}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- publishedHref comes from resolve() -->
				<a class="open-page" href={publishedHref}>Open your campaign page</a>
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
			<p class="disclosure">{PROTOTYPE_PHOTO_DISCLOSURE}</p>
		</aside>
	</div>
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
		background: var(--gold-tint);
		font-size: var(--text-sm);
		text-align: center;
	}

	.prototype-banner strong {
		font-family: var(--font-display);
	}

	/* .shell supplies the gutters; the cap keeps the two-column flow from
	   stretching into a wall of form on a wide monitor. */
	main {
		max-width: 1100px;
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

	.done-card h2 {
		margin-top: var(--space-4);
	}

	.share-url {
		display: block;
		margin: var(--space-4) 0;
		padding: var(--space-3);
		border-radius: var(--radius-sm);
		background: var(--gold-tint);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		word-break: break-all;
	}

	.share-note {
		margin: var(--space-3) 0 0;
		color: var(--status-received);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.open-page {
		display: grid;
		min-height: 52px;
		margin-top: var(--space-4);
		place-items: center;
		border-radius: var(--radius-md);
		color: var(--ink);
		background: var(--paper-2);
		font-weight: 700;
		text-decoration: none;
	}

	.steps li {
		padding: var(--space-2);
		border-radius: var(--radius-sm);
		color: var(--ink-60);
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

	.preview-card {
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		background: var(--surface);
		box-shadow: var(--shadow-raise);
	}

	/* Each step is a form, so the card spaces its own fields rather than every
	   field carrying a trailing margin. */
	form.card {
		display: grid;
		gap: var(--space-4);
		align-content: start;
	}

	.card h2 {
		margin: 0;
	}

	fieldset {
		display: grid;
		gap: var(--space-2);
		border: 0;
		padding: 0;
		font-size: var(--text-sm);
		font-weight: 600;
	}

	/* `fieldset` is deliberately bold for its legend, but the disclosure under
	   the covers is fine print and must match the footer's weight. */
	fieldset .disclosure {
		margin-top: var(--space-1);
		font-weight: 400;
	}

	textarea {
		min-height: 160px;
		resize: vertical;
	}

	.step-lede {
		margin: 0 0 var(--space-4);
		color: var(--ink-60);
		font-size: var(--text-sm);
	}

	.account-list {
		display: grid;
		gap: var(--space-2);
		margin: 0 0 var(--space-2);
		padding: 0;
		list-style: none;
	}

	.account-list li {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
		background: var(--paper);
	}

	.account-text {
		display: grid;
		gap: 2px;
		min-width: 0;
		font-size: var(--text-sm);
	}

	.account-text span {
		color: var(--ink-60);
		overflow-wrap: anywhere;
	}

	.remove {
		margin-left: auto;
		min-height: 40px;
		padding: 0 var(--space-3);
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--ink-60);
		font-size: var(--text-xs);
		font-weight: 700;
		cursor: pointer;
	}

	.add-account {
		min-height: 48px;
		border: 1px dashed var(--ink);
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--ink);
		font-size: var(--text-sm);
		font-weight: 700;
		cursor: pointer;
	}

	.gate-warning {
		margin: var(--space-2) 0 0;
		padding: var(--space-3);
		border-radius: var(--radius-sm);
		background: var(--gold-tint);
		color: var(--ink-60);
		font-size: var(--text-sm);
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

	/* The disclosure sits below the card, so it needs the same gap the label
	   takes above it. */
	.preview .disclosure {
		margin-top: var(--space-3);
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

	@media (min-width: 1000px) {
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

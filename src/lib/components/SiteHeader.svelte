<script lang="ts">
	/**
	 * One sticky header for every route.
	 *
	 * Previously each route declared its own `.site-header` — six different
	 * heights (88/84/76) and three different max-widths — and all of them
	 * scrolled away. On a campaign page 7,000px tall that left a reader with no
	 * navigation at all, and on mobile `nav { display: none }` meant Discover and
	 * the trust anchors were simply unreachable.
	 *
	 * Condenses rather than hides on scroll: these are long reading pages, and a
	 * bar that vanishes while you read someone's fundraiser is worse than one
	 * that stays put.
	 */
	import { resolve } from '$app/paths';
	import BrandMark from '$lib/components/BrandMark.svelte';
	import Button from '$lib/components/Button.svelte';
	import type { Snippet } from 'svelte';

	let {
		/** Extra route-specific links, e.g. the campaign/host cross-links. */
		links = [],
		/** Slot rendered at the right of the condensed bar, e.g. a chip-in CTA. */
		trailing = undefined,
		showStartAction = true,
		/**
		 * True only on a route whose first section is a photograph the header is
		 * meant to sit on. Passed in explicitly rather than sniffed from the URL:
		 * "this page starts with a hero" is a property of the page, and a
		 * pathname list in here would go stale the moment a route is added.
		 */
		overHero = false
	}: {
		links?: Array<{ label: string; href: string }>;
		trailing?: Snippet;
		showStartAction?: boolean;
		overHero?: boolean;
	} = $props();

	let scrolled = $state(false);
	let menuOpen = $state(false);
	/** 1px probe above the header; cheaper than a scroll listener and no thrash. */
	let sentinel = $state<HTMLElement | null>(null);
	let sheet = $state<HTMLElement | null>(null);
	let toggle = $state<HTMLButtonElement | null>(null);

	/**
	 * Over a hero the bar overlays the photograph instead of pushing it down, so
	 * the picture starts at the top of the page. The negative margin is applied
	 * for as long as the route has a hero rather than only while transparent —
	 * switching it on scroll would yank the whole page up 72px under the reader.
	 */
	let overlay = $derived(overHero);
	let transparent = $derived(overHero && !scrolled);

	$effect(() => {
		if (!sentinel) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				scrolled = !entry.isIntersecting;
			},
			{ threshold: 0 }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});

	/**
	 * The sheet covers the page, so the page behind it must not scroll — on a
	 * phone, dragging the visible sheet scrolled the campaign underneath it.
	 */
	$effect(() => {
		if (!menuOpen) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previous;
		};
	});

	/**
	 * The sheet is a scrimmed panel, not a modal dialog: the page stays visible
	 * behind the backdrop, so focus is moved in on open but deliberately not
	 * trapped — Escape and the still-visible toggle both close it. Moving focus
	 * in is what makes the five links reachable without tabbing past the whole
	 * page first; the ring is visible because app.css styles :focus-visible.
	 */
	$effect(() => {
		if (!menuOpen) return;
		sheet?.querySelector<HTMLElement>('a')?.focus();
	});

	// A route change while the sheet is open would otherwise leave it covering
	// the new page.
	function close() {
		menuOpen = false;
	}

	/** Escape closes and hands focus back to the control that opened the sheet. */
	function onKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || !menuOpen) return;
		close();
		toggle?.focus();
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div bind:this={sentinel} aria-hidden="true" class="sentinel"></div>

<header
	class="site-header"
	class:on-dark={transparent}
	class:overlay
	data-scrolled={scrolled}
	data-transparent={transparent}
>
	<div class="bar">
		<a class="brand-link" href={resolve('/')} aria-label="ChipIn home" onclick={close}>
			<span class="brand-scale"><BrandMark tone={transparent ? 'onDark' : 'default'} /></span>
		</a>

		<nav class="desktop-nav" aria-label="Primary">
			<a href={resolve('/discover')}>Discover</a>
			{#each links as link (link.href)}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- caller resolves -->
				<a href={link.href}>{link.label}</a>
			{/each}
		</nav>

		<div class="actions">
			{#if trailing}{@render trailing()}{/if}
			{#if showStartAction}
				<span class="desktop-only">
					<Button href={resolve('/start')} size="sm" variant="secondary">Start a campaign</Button>
				</span>
			{/if}
			<button
				class="menu-toggle"
				type="button"
				bind:this={toggle}
				aria-expanded={menuOpen}
				aria-controls="nav-sheet"
				onclick={() => (menuOpen = !menuOpen)}
			>
				<span class="visually-hidden">{menuOpen ? 'Close menu' : 'Open menu'}</span>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					{#if menuOpen}
						<path d="M6 6l12 12M18 6L6 18" />
					{:else}
						<path d="M4 7h16M4 12h16M4 17h16" />
					{/if}
				</svg>
			</button>
		</div>
	</div>
</header>

{#if menuOpen}
	<!-- A sheet rather than a dropdown: there are two audiences here, donor and
	     host, and a dropdown cannot hold both without becoming a list of lists. -->
	<div
		class="sheet-backdrop"
		role="button"
		tabindex="-1"
		aria-label="Close menu"
		onclick={close}
		onkeydown={(e) => e.key === 'Enter' && close()}
	></div>
	<div class="sheet" id="nav-sheet" bind:this={sheet}>
		<nav aria-label="All pages">
			<a href={resolve('/discover')} onclick={close}>Discover campaigns</a>
			<a href={resolve('/start')} onclick={close}>Start a campaign</a>
			{#each links as link (link.href)}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- caller resolves -->
				<a href={link.href} onclick={close}>{link.label}</a>
			{/each}
		</nav>
	</div>
{/if}

<style>
	.sentinel {
		height: 1px;
	}

	.site-header {
		position: sticky;
		z-index: 50;
		top: 0;
		border-bottom: 1px solid transparent;
		background: rgb(251 247 238 / 0%);
		transition:
			background var(--dur-slow) var(--ease),
			border-color var(--dur-slow) var(--ease),
			box-shadow var(--dur-slow) var(--ease);
	}

	.site-header[data-scrolled='true'] {
		border-bottom-color: var(--line);
		background: rgb(251 247 238 / 94%);
		box-shadow: var(--shadow-sm);
		backdrop-filter: blur(12px) saturate(1.1);
	}

	/*
	 * Over a hero the bar sits on the photograph rather than beside it.
	 *
	 * The mockup painted a scrim across the whole hero to make white text legible
	 * anywhere on it. That is the reason the hero read as a painted-over picture:
	 * the veil had to be strong enough for the worst pixel behind the type, so it
	 * was strong everywhere. Confining the scrim to the 72px the bar occupies
	 * means it only has to carry the bar — and the numbers stop being a guess.
	 *
	 * Ink at 72% over the lightest pixel these photographs contain (#ffffff)
	 * leaves 6.4:1 for paper (#fbf7ee) text and 5.9:1 for --aqua-bright. Nothing
	 * below the bar is tinted at all.
	 */
	.site-header[data-transparent='true'] {
		border-bottom-color: rgb(251 247 238 / 14%);
		background: rgb(12 27 26 / 72%);
		backdrop-filter: blur(10px) saturate(1.1);
	}

	/* Out of the flow so the hero photograph starts at the top of the page. */
	.site-header.overlay {
		margin-bottom: calc(-1 * var(--nav-height));
	}

	.bar {
		display: flex;
		max-width: 1240px;
		height: var(--nav-height);
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		margin: 0 auto;
		padding: 0 var(--space-4);
		transition: height var(--dur-slow) var(--ease);
	}

	.site-header[data-scrolled='true'] .bar {
		height: var(--nav-height-condensed);
	}

	.brand-link {
		display: inline-flex;
		min-height: var(--control-md);
		align-items: center;
		color: inherit;
		text-decoration: none;
	}

	/* The condense scales the wordmark, not the link: a transform shrinks the
	   hit box too, and scaling a 30px mark took the only route home on mobile
	   down to 26px of tappable area. */
	.brand-scale {
		display: inline-flex;
		transform-origin: left center;
		transition: transform var(--dur-slow) var(--ease);
	}

	.site-header[data-scrolled='true'] .brand-scale {
		transform: scale(0.85);
	}

	.desktop-nav {
		display: none;
		gap: var(--space-5);
	}

	.desktop-nav a {
		/* WCAG 2.5.8 floor. At --text-sm the line box alone is 21px, which is
		   under it even for a mouse. */
		display: inline-flex;
		min-height: var(--control-sm);
		align-items: center;
		color: var(--ink);
		font-size: var(--text-sm);
		font-weight: 600;
		text-decoration: none;
	}

	.desktop-nav a:hover {
		color: var(--aqua-deep);
		text-decoration: underline;
		text-decoration-thickness: 2px;
	}

	/* On the hero the bar is ink, so the links flip with it. */
	.site-header[data-transparent='true'] .desktop-nav a {
		color: var(--paper);
	}

	.site-header[data-transparent='true'] .desktop-nav a:hover {
		color: var(--aqua-bright);
	}

	.site-header[data-transparent='true'] .menu-toggle {
		border-color: rgb(251 247 238 / 45%);
		background: rgb(251 247 238 / 12%);
	}

	.site-header[data-transparent='true'] .menu-toggle:hover {
		background: rgb(251 247 238 / 22%);
	}

	.site-header[data-transparent='true'] .menu-toggle svg {
		stroke: var(--paper);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.desktop-only {
		display: none;
	}

	.menu-toggle {
		display: grid;
		width: var(--control-md);
		height: var(--control-md);
		place-items: center;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-md);
		background: var(--surface);
		cursor: pointer;
		transition: background-color var(--dur-fast) var(--ease);
	}

	.menu-toggle:hover {
		background: var(--paper-2);
	}

	.menu-toggle svg {
		width: 20px;
		height: 20px;
		fill: none;
		stroke: var(--ink);
		stroke-linecap: round;
		stroke-width: 2;
	}

	.sheet-backdrop {
		position: fixed;
		z-index: 60;
		inset: 0;
		border: 0;
		background: rgb(12 27 26 / 32%);
	}

	.sheet {
		position: fixed;
		z-index: 61;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(320px, 86vw);
		padding: var(--space-7) var(--space-5);
		border-left: 1px solid var(--border);
		background: var(--surface);
		box-shadow: var(--shadow-lg);
	}

	.sheet nav {
		display: grid;
		gap: var(--space-2);
		margin-top: var(--space-6);
	}

	.sheet a {
		min-height: var(--control-lg);
		align-content: center;
		padding: 0 var(--space-3);
		border-radius: var(--radius-md);
		color: var(--ink);
		font-size: var(--text-md);
		font-weight: 600;
		text-decoration: none;
	}

	.sheet a:hover {
		background: var(--aqua-tint);
	}

	/*
	 * 1000px, matching `.card-grid` and `.section-head`. It was 900, which put the
	 * app two breakpoints deep: a nav that collapsed at 900 sitting above a grid
	 * that went 3-up at 1000 meant a 940px window got a stacked card grid and a
	 * full horizontal nav, which is the one combination neither was designed for.
	 */
	@media (min-width: 1000px) {
		.desktop-nav,
		.desktop-only {
			display: flex;
		}

		.menu-toggle {
			display: none;
		}
	}
</style>

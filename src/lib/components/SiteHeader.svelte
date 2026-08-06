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
		showStartAction = true
	}: {
		links?: Array<{ label: string; href: string }>;
		trailing?: Snippet;
		showStartAction?: boolean;
	} = $props();

	let scrolled = $state(false);
	let menuOpen = $state(false);
	/** 1px probe above the header; cheaper than a scroll listener and no thrash. */
	let sentinel = $state<HTMLElement | null>(null);

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

	// A route change while the sheet is open would otherwise leave it covering
	// the new page.
	function close() {
		menuOpen = false;
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') close();
	}}
/>

<div bind:this={sentinel} aria-hidden="true" class="sentinel"></div>

<header class="site-header" data-scrolled={scrolled}>
	<div class="bar">
		<a class="brand-link" href={resolve('/')} aria-label="ChipIn home" onclick={close}>
			<span class="brand-scale"><BrandMark /></span>
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
	<div class="sheet" id="nav-sheet">
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

	@media (min-width: 900px) {
		.desktop-nav,
		.desktop-only {
			display: flex;
		}

		.menu-toggle {
			display: none;
		}
	}
</style>

<script lang="ts">
	/**
	 * One footer for every route.
	 *
	 * Eight routes previously carried eight different footers — some a single
	 * line of muted text, some three columns, one of them with a hardcoded year.
	 * The mockup's footer is a four-column panel on ink, and the panel is where
	 * the photography disclosure and the artwork attribution live, so it has to
	 * be the same object everywhere rather than something each route reinvents.
	 *
	 * The island column is built from the campaigns actually in the catalogue
	 * (`islandsPresent`), not from a list typed here: a footer advertising an
	 * island with nothing on it is an invitation to a dead end.
	 */
	import { resolve } from '$app/paths';
	import BrandMark from './BrandMark.svelte';
	import { CAMPAIGN_ISLANDS, PROTOTYPE_CATALOGUE, islandsPresent } from '$lib/prototype/campaigns';
	import { PROTOTYPE_PHOTO_DISCLOSURE } from '$lib/prototype/photos';

	const islands = islandsPresent(PROTOTYPE_CATALOGUE);
</script>

<footer class="site-footer band-dark on-dark">
	<div class="shell">
		<div class="main">
			<div class="brand-col">
				<BrandMark tone="onDark" />
				<p>
					Pooled giving for Bahamian communities: neighbours chip in what they can, and the host
					confirms what arrived.
				</p>
			</div>

			<div class="col">
				<h2>Donors</h2>
				<a href={resolve('/discover')}>Discover campaigns</a>
				<a href={resolve('/#how')}>How ChipIn works</a>
				<a href={resolve('/#trust')}>Trust &amp; safety</a>
				<a href={resolve('/#faq')}>Questions</a>
			</div>

			<div class="col">
				<h2>Hosts</h2>
				<a href={resolve('/start')}>Start a campaign</a>
				<a href={resolve('/c/rainbow')}>A campaign page</a>
				<a href={resolve('/c/rainbow/host')}>Host tools</a>
				<a href="mailto:hello@chipin242.com">Contact us</a>
			</div>

			<div class="col">
				<h2>Where we work</h2>
				<ul class="island-line">
					{#each islands as island (island)}
						<li>{CAMPAIGN_ISLANDS[island]}</li>
					{/each}
				</ul>
				<p class="note">Nassau, The Bahamas · chipin242.com</p>
			</div>
		</div>

		<div class="legal">
			<p class="disclosure">{PROTOTYPE_PHOTO_DISCLOSURE}</p>
			<p class="artwork">Artwork © Traceline Bahamas Ltd.</p>
		</div>
	</div>
</footer>

<style>
	.site-footer {
		padding-block: var(--space-8) var(--space-6);
	}

	.main {
		display: grid;
		gap: var(--space-7);
	}

	.brand-col p {
		max-width: 36ch;
		margin: var(--space-4) 0 0;
		color: #c8d0cf;
		font-size: var(--text-sm);
	}

	.col {
		display: grid;
		align-content: start;
		gap: var(--space-2);
	}

	.col h2 {
		margin: 0 0 var(--space-2);
		color: var(--aqua-bright);
		font-family: var(--font-body);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.col a {
		display: inline-flex;
		min-height: 36px;
		align-items: center;
		color: #c8d0cf;
		font-size: var(--text-sm);
		text-decoration: none;
	}

	.col a:hover {
		color: var(--paper);
		text-decoration: underline;
	}

	.island-line {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		padding: 0;
		margin: 0;
		list-style: none;
	}

	.island-line li {
		padding: var(--space-1) var(--space-3);
		border: 1px solid rgb(251 247 238 / 18%);
		border-radius: var(--radius-full);
		font-size: 11px;
		font-weight: 600;
	}

	.note {
		margin: var(--space-3) 0 0;
		color: var(--ink-40);
		font-size: var(--text-xs);
	}

	.legal {
		display: grid;
		gap: var(--space-2);
		margin-top: var(--space-7);
		padding-top: var(--space-4);
		border-top: 1px solid rgb(251 247 238 / 12%);
	}

	.disclosure {
		max-width: 92ch;
	}

	.artwork {
		margin: 0;
		color: var(--ink-40);
		font-size: var(--text-xs);
	}

	@media (min-width: 720px) {
		.main {
			grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
		}

		.legal {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: baseline;
		}
	}
</style>

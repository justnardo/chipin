/** Client-only campaign drafts for the Stage 0 / GoFundMe-style prototype. */

import { photoAlt, photoSrc } from './photos';
import { readList, writeList } from './storage';

export type CampaignCategory =
	'Community' | 'Medical' | 'Education' | 'Funeral' | 'Emergency' | 'Other';

/**
 * Where a campaign is. Separate from `location`, which is host-typed free text
 * ("Eight Mile Rock · Grand Bahama") and not something a filter can be built
 * on. The island list is what the discover filter is made of.
 *
 * `other` exists for a real reason rather than as a catch-all: drafts saved
 * before this field existed have no island, and inventing one for them would
 * file a stranger's fundraiser under a place they never named. They stay
 * visible under "All islands" and under "Other islands", and a filter pill for
 * that bucket only appears when something actually lands in it.
 */
export const CAMPAIGN_ISLANDS = {
	np: 'New Providence',
	gb: 'Grand Bahama',
	abaco: 'Abaco',
	eleuthera: 'Eleuthera',
	exuma: 'Exuma',
	other: 'Other islands'
} as const;

export type CampaignIsland = keyof typeof CAMPAIGN_ISLANDS;

/** The island a campaign files under, defaulting drafts to the honest bucket. */
export function campaignIsland(campaign: PrototypeCampaign): CampaignIsland {
	return campaign.island ?? 'other';
}

/**
 * Where a host asks donors to send money.
 *
 * BUILD GATE (README): real receiving-account details must not ship until the
 * disclosure decision in docs/stage-0/THREAT-MODEL.md is recorded. Every value
 * carried here is fictional prototype data, and the portal that renders it is
 * reachable only from inside the contribute flow — never from a public campaign
 * GET or a link preview. That is Option B from the threat model.
 */
export type ReceivingAccount = {
	bankId: string;
	accountName: string;
	accountNumber: string;
	/** Branch or transit, where the channel uses one. */
	branch: string;
	/** Wallet handle or phone number, for wallet channels. */
	handle: string;
};

export type PrototypeCampaign = {
	slug: string;
	title: string;
	story: string;
	goalCents: number;
	category: CampaignCategory;
	location: string;
	/**
	 * Optional because every draft stored under `chipin.prototype.campaigns.v1`
	 * predates it. Read it through `campaignIsland()`, never directly, so those
	 * drafts keep working instead of vanishing from a filtered grid.
	 */
	island?: CampaignIsland;
	hostName: string;
	coverImage: string;
	/**
	 * The same scene composed for the campaign band. Cards crop the square
	 * happily; the band does not. Optional because drafts saved before this
	 * existed have only `coverImage` — callers fall back to it.
	 */
	coverImageWide?: string;
	coverAlt: string;
	createdAt: string;
	source: 'builtin' | 'session';
	/**
	 * Every channel the host can receive on, in the order they added them.
	 * Hosts routinely hold accounts at more than one institution; letting the
	 * donor pick the one where THEY bank turns an interbank transfer (2-5
	 * business days) into a same-bank one (usually same day). The donor-facing
	 * picker only appears when there is more than one usable entry.
	 */
	receivingAccounts: ReceivingAccount[];
};

/**
 * Last few characters of wherever money is sent, e.g. "5678" from an account
 * number or "0142" from a wallet handle. A host can hold two accounts at the
 * same institution (chequing + savings), so a bank id alone cannot tell them
 * which statement a report belongs to — the tail can, without carrying the
 * full number anywhere it does not need to be.
 */
export function accountTail(account: ReceivingAccount): string {
	const target = (account.accountNumber.trim() || account.handle.trim()).replace(/\s+/g, '');
	return target.slice(-4);
}

/** An account is usable in the portal only if it has somewhere to send money. */
export function usableAccounts(campaign: PrototypeCampaign): ReceivingAccount[] {
	return campaign.receivingAccounts.filter(
		(a) => a.accountNumber.trim().length > 0 || a.handle.trim().length > 0
	);
}

const STORAGE_KEY = 'chipin.prototype.campaigns.v1';

export const COVER_PRESETS = (
	['friends', 'reading', 'gathering', 'food', 'table', 'kitchen'] as const
).map((id) => ({
	id,
	image: photoSrc(id),
	imageWide: photoSrc(id, 'wide'),
	alt: photoAlt(id)
}));

/** The band image for a campaign, falling back to the square for older drafts. */
export function coverBand(campaign: PrototypeCampaign): string {
	return campaign.coverImageWide ?? campaign.coverImage;
}

export const RAINBOW_CAMPAIGN: PrototypeCampaign = {
	slug: 'rainbow',
	title: 'Reopen the Rainbow Community Centre',
	story:
		'For more than a decade, the Rainbow Community Centre has offered homework help, weekend workshops, and a safe place for young people to gather. After heavy rain damaged tables, storage, and electrical equipment, the centre needs the community to help reopen.',
	goalCents: 800_000,
	category: 'Community',
	location: 'Nassau, The Bahamas',
	island: 'np',
	hostName: 'Rainbow Community Centre',
	coverImage: COVER_PRESETS[0].image,
	coverImageWide: COVER_PRESETS[0].imageWide,
	coverAlt: COVER_PRESETS[0].alt,
	createdAt: '2026-07-22T12:00:00.000Z',
	source: 'builtin',
	// Fictional. Not real accounts at any institution. Two channels on purpose,
	// so the donor-side account picker is exercised by the flagship demo.
	receivingAccounts: [
		{
			bankId: 'bob',
			accountName: 'Rainbow Community Centre (DEMO)',
			accountNumber: '0000 1234 5678',
			branch: 'Demo Branch — Nassau',
			handle: ''
		},
		{
			bankId: 'sanddollar',
			accountName: 'Rainbow Community Centre (DEMO)',
			accountNumber: '',
			branch: '',
			handle: 'rainbow-centre-demo'
		}
	]
};

/**
 * The campaigns the prototype shows in its grids.
 *
 * These exist so the home and discover pages render from the model rather than
 * from strings pasted out of a mockup — every card's title, island, category,
 * cover, goal and progress comes from here, and the discover filter is built
 * from the islands actually present in this list rather than from a fixed
 * label. Only Rainbow resolves to a route; the rest are preview cards.
 *
 * `attestedCents` is a fictional prototype figure standing in for what a host
 * would have marked received. It is NOT attested, NOT verified, and NOT
 * matched — nothing screenshot-derived may be labelled that way (build gate),
 * and nothing here is screenshot-derived in the first place.
 */
export type CatalogueEntry = PrototypeCampaign & {
	attestedCents: number;
	/** True only when the slug resolves to a real route in this app. */
	hasPage: boolean;
};

export const PROTOTYPE_CATALOGUE: readonly CatalogueEntry[] = [
	{ ...RAINBOW_CAMPAIGN, attestedCents: 524_000, hasPage: true },
	{
		slug: 'bain-town-reading-room',
		title: 'A reading room for Bain Town',
		story:
			'Thirty children share one bookshelf. The reading room needs shelving, a rug, and a set of books at each level so the after-school group can keep meeting through the summer.',
		goalCents: 600_000,
		category: 'Education',
		location: 'Bain Town · New Providence',
		island: 'np',
		hostName: 'Bain Town Youth Group',
		coverImage: photoSrc('reading'),
		coverImageWide: photoSrc('reading', 'wide'),
		coverAlt: photoAlt('reading'),
		createdAt: '2026-06-30T10:00:00.000Z',
		source: 'builtin',
		receivingAccounts: [],
		attestedCents: 318_000,
		hasPage: false
	},
	{
		slug: 'eight-mile-rock-food-cupboard',
		title: 'Restock the Eight Mile Rock food cupboard',
		story:
			'The cupboard ran dry in the second week of the month. Restocking it covers tinned goods, rice, and flour for the families who come every Thursday.',
		goalCents: 400_000,
		category: 'Emergency',
		location: 'Eight Mile Rock · Grand Bahama',
		island: 'gb',
		hostName: 'Eight Mile Rock Community Cupboard',
		coverImage: photoSrc('food'),
		coverImageWide: photoSrc('food', 'wide'),
		coverAlt: photoAlt('food'),
		createdAt: '2026-07-04T09:00:00.000Z',
		source: 'builtin',
		receivingAccounts: [],
		attestedCents: 293_000,
		hasPage: false
	},
	{
		slug: 'st-agnes-hall',
		title: 'Repair the St. Agnes hall roof',
		story:
			'Two rooms in the parish hall are unusable after the last storm. The roof repair lets the lunch programme move back indoors before the next one.',
		goalCents: 600_000,
		category: 'Community',
		location: 'Nassau · New Providence',
		island: 'np',
		hostName: 'St. Agnes Parish Hall',
		coverImage: photoSrc('table'),
		coverImageWide: photoSrc('table', 'wide'),
		coverAlt: photoAlt('table'),
		createdAt: '2026-05-18T14:00:00.000Z',
		source: 'builtin',
		receivingAccounts: [],
		attestedCents: 315_000,
		hasPage: false
	},
	{
		slug: 'marsh-harbour-netball',
		title: 'Netball kits for Marsh Harbour',
		story:
			'The under-16 side has been borrowing kit from the senior team. New bibs, balls, and a set of goal posts let them play on their own court again.',
		goalCents: 500_000,
		category: 'Education',
		location: 'Marsh Harbour · Abaco',
		island: 'abaco',
		hostName: 'Marsh Harbour Netball Club',
		coverImage: photoSrc('gathering'),
		coverImageWide: photoSrc('gathering', 'wide'),
		coverAlt: photoAlt('gathering'),
		createdAt: '2026-06-11T16:30:00.000Z',
		source: 'builtin',
		receivingAccounts: [],
		attestedCents: 210_000,
		hasPage: false
	},
	{
		slug: 'fox-hill-kitchen',
		title: 'Fit out the Fox Hill community kitchen',
		story:
			'The Sunday cooking group has a working stove and no counters. Fitting out the kitchen means they can cook for the whole street without washing up in the yard.',
		goalCents: 350_000,
		category: 'Community',
		location: 'Fox Hill · New Providence',
		island: 'np',
		hostName: 'Fox Hill Cooking Group',
		coverImage: photoSrc('kitchen'),
		coverImageWide: photoSrc('kitchen', 'wide'),
		coverAlt: photoAlt('kitchen'),
		createdAt: '2026-07-15T11:15:00.000Z',
		source: 'builtin',
		receivingAccounts: [],
		attestedCents: 259_000,
		hasPage: false
	}
];

/**
 * The islands present in a set of campaigns, in the canonical island order.
 * A filter pill for a place with nothing in it is a dead end, so the filter is
 * built from the data it filters.
 */
export function islandsPresent(campaigns: readonly PrototypeCampaign[]): CampaignIsland[] {
	const present = new Set(campaigns.map(campaignIsland));
	return (Object.keys(CAMPAIGN_ISLANDS) as CampaignIsland[]).filter((id) => present.has(id));
}

/**
 * The catalogue as the grid pages render it — the same entries, with their money
 * converted out of cents once, here, instead of once per page.
 *
 * Home and discover each mapped this list by hand into the shape a card wants,
 * and that duplication is how one of them came to hand raw cents to the progress
 * bar. They share the mapping now, so the two surfaces cannot disagree about
 * what a campaign has raised.
 */
export type CatalogueCard = CatalogueEntry & { received: number; goal: number };

export function catalogueCards(): CatalogueCard[] {
	return PROTOTYPE_CATALOGUE.map((entry) => ({
		...entry,
		received: toCurrencyUnits(entry.attestedCents),
		goal: toCurrencyUnits(entry.goalCents)
	}));
}

/** Goal progress, clamped to 0-100 so a wild draft cannot overfill a bar. */
export function progressPercent(receivedCents: number, goalCents: number): number {
	if (goalCents <= 0) return 0;
	return Math.min(100, Math.max(0, (receivedCents / goalCents) * 100));
}

export const EMPTY_RECEIVING: ReceivingAccount = {
	bankId: 'other',
	accountName: '',
	accountNumber: '',
	branch: '',
	handle: ''
};

/** Shape of records written by older builds, kept only for migration. */
type StoredCampaign = PrototypeCampaign & { receiving?: ReceivingAccount };

/**
 * A draft's cover, with the retired illustration set swapped out.
 *
 * Drafts saved before the photography change point at files that no longer
 * exist. Handing the browser a 404 would leave the host looking at the one
 * thing a fundraiser cannot afford to show — a broken picture — so the cover
 * falls back to a preset, chosen from the slug so it is stable across reloads
 * rather than shuffling every render.
 */
function normaliseCover(campaign: PrototypeCampaign): PrototypeCampaign {
	if (!campaign.coverImage.endsWith('.svg')) return campaign;
	let hash = 0;
	for (const char of campaign.slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
	const preset = COVER_PRESETS[hash % COVER_PRESETS.length];
	return { ...campaign, coverImage: preset.image, coverImageWide: preset.imageWide };
}

function loadSessionCampaigns(): PrototypeCampaign[] {
	// Three generations of stored data must not break the portal: campaigns saved
	// before receiving details existed, campaigns saved when there was a single
	// `receiving` object rather than a list, and campaigns saved against the
	// retired illustration covers.
	return readList<StoredCampaign>(STORAGE_KEY).map(({ receiving, ...c }) =>
		normaliseCover({
			...c,
			receivingAccounts: (c.receivingAccounts ?? (receiving ? [receiving] : [])).map((a) => ({
				...EMPTY_RECEIVING,
				...a
			}))
		})
	);
}

function saveSessionCampaigns(campaigns: PrototypeCampaign[]) {
	writeList(STORAGE_KEY, campaigns);
}

export function slugifyTitle(title: string): string {
	const base = title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 40);
	const suffix = Math.random().toString(36).slice(2, 6);
	return `${base || 'campaign'}-${suffix}`;
}

export function getCampaign(slug: string): PrototypeCampaign | null {
	if (slug === RAINBOW_CAMPAIGN.slug) return RAINBOW_CAMPAIGN;
	return loadSessionCampaigns().find((c) => c.slug === slug) ?? null;
}

export function listSessionCampaigns(): PrototypeCampaign[] {
	return loadSessionCampaigns().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveCampaign(
	input: Omit<PrototypeCampaign, 'slug' | 'createdAt' | 'source' | 'receivingAccounts'> & {
		slug?: string;
		receivingAccounts?: ReceivingAccount[];
	}
): PrototypeCampaign {
	const campaign: PrototypeCampaign = {
		...input,
		receivingAccounts: input.receivingAccounts ?? [],
		slug: input.slug || slugifyTitle(input.title),
		createdAt: new Date().toISOString(),
		source: 'session'
	};
	const all = loadSessionCampaigns().filter((c) => c.slug !== campaign.slug);
	all.push(campaign);
	saveSessionCampaigns(all);
	return campaign;
}

/**
 * Cents to whole currency units, at the boundary where money is displayed.
 *
 * Every amount in the prototype is held in cents, but the progress bar and
 * `formatAttestedProgress` in `$lib/progress` speak whole currency units. That
 * conversion was written out by hand wherever the two met, and the home page's
 * grid forgot it: the card read "$524,000 marked received by the campaign host
 * of $800,000 goal" for a campaign whose own page said $5,240 of $8,000. A
 * hundredfold error is not obviously wrong on a fictional fundraiser, which is
 * why it survived — so the division has one name and one test rather than six
 * call sites each having to remember.
 */
export function toCurrencyUnits(cents: number): number {
	return cents / 100;
}

export function formatGoal(cents: number): string {
	return `BSD $${toCurrencyUnits(cents).toLocaleString('en-BS', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	})}`;
}

export function dollarsToGoalCents(value: string): number | null {
	const cleaned = value.replace(/[^0-9.]/g, '');
	if (!cleaned) return null;
	const num = Number(cleaned);
	if (!Number.isFinite(num) || num < 100) return null;
	return Math.round(num * 100);
}

/** Client-only campaign drafts for the Stage 0 / GoFundMe-style prototype. */

import { readList, writeList } from './storage';

export type CampaignCategory =
	'Community' | 'Medical' | 'Education' | 'Funeral' | 'Emergency' | 'Other';

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
	hostName: string;
	coverImage: string;
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

export const COVER_PRESETS = [
	{
		id: 'friends',
		image:
			'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=85',
		alt: 'Friends gathered together outdoors'
	},
	{
		id: 'reading',
		image:
			'https://images.unsplash.com/photo-1504159506876-f8338247a14a?auto=format&fit=crop&w=1600&q=85',
		alt: 'Child reading a book in a bright room'
	},
	{
		id: 'food',
		image:
			'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1600&q=85',
		alt: 'Volunteers preparing boxes of food'
	},
	{
		id: 'table',
		image:
			'https://images.unsplash.com/photo-1559024094-4a1e4495c3c1?auto=format&fit=crop&w=1600&q=85',
		alt: 'Neighbours working together at a community table'
	}
] as const;

export const RAINBOW_CAMPAIGN: PrototypeCampaign = {
	slug: 'rainbow',
	title: 'Reopen the Rainbow Community Centre',
	story:
		'For more than a decade, the Rainbow Community Centre has offered homework help, weekend workshops, and a safe place for young people to gather. After heavy rain damaged tables, storage, and electrical equipment, the centre needs the community to help reopen.',
	goalCents: 800_000,
	category: 'Community',
	location: 'Nassau, The Bahamas',
	hostName: 'Rainbow Community Centre',
	coverImage: COVER_PRESETS[0].image,
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

export const EMPTY_RECEIVING: ReceivingAccount = {
	bankId: 'other',
	accountName: '',
	accountNumber: '',
	branch: '',
	handle: ''
};

/** Shape of records written by older builds, kept only for migration. */
type StoredCampaign = PrototypeCampaign & { receiving?: ReceivingAccount };

function loadSessionCampaigns(): PrototypeCampaign[] {
	// Two generations of stored data must not break the portal: campaigns saved
	// before receiving details existed, and campaigns saved when there was a
	// single `receiving` object rather than a list.
	return readList<StoredCampaign>(STORAGE_KEY).map(({ receiving, ...c }) => ({
		...c,
		receivingAccounts: (c.receivingAccounts ?? (receiving ? [receiving] : [])).map((a) => ({
			...EMPTY_RECEIVING,
			...a
		}))
	}));
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

export function formatGoal(cents: number): string {
	return `BSD $${(cents / 100).toLocaleString('en-BS', {
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

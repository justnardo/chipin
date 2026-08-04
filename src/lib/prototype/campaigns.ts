/** Client-only campaign drafts for the Stage 0 / GoFundMe-style prototype. */

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
	receiving: ReceivingAccount;
};

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
	// Fictional. Not a real account at any institution.
	receiving: {
		bankId: 'bob',
		accountName: 'Rainbow Community Centre (DEMO)',
		accountNumber: '0000 1234 5678',
		branch: 'Demo Branch — Nassau',
		handle: ''
	}
};

export const EMPTY_RECEIVING: ReceivingAccount = {
	bankId: 'other',
	accountName: '',
	accountNumber: '',
	branch: '',
	handle: ''
};

function canUseStorage(): boolean {
	return typeof sessionStorage !== 'undefined';
}

function loadSessionCampaigns(): PrototypeCampaign[] {
	if (!canUseStorage()) return [];
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		// Campaigns stored before receiving details existed must not break the portal.
		return (JSON.parse(raw) as PrototypeCampaign[]).map((c) => ({
			...c,
			receiving: { ...EMPTY_RECEIVING, ...(c.receiving ?? {}) }
		}));
	} catch {
		return [];
	}
}

function saveSessionCampaigns(campaigns: PrototypeCampaign[]) {
	if (!canUseStorage()) return;
	sessionStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
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
	input: Omit<PrototypeCampaign, 'slug' | 'createdAt' | 'source' | 'receiving'> & {
		slug?: string;
		receiving?: ReceivingAccount;
	}
): PrototypeCampaign {
	const campaign: PrototypeCampaign = {
		...input,
		receiving: input.receiving ?? { ...EMPTY_RECEIVING },
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

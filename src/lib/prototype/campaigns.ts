/** Client-only campaign drafts for the Stage 0 / GoFundMe-style prototype. */

export type CampaignCategory =
	| 'Community'
	| 'Medical'
	| 'Education'
	| 'Funeral'
	| 'Emergency'
	| 'Other';

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
	source: 'builtin'
};

function canUseStorage(): boolean {
	return typeof sessionStorage !== 'undefined';
}

function loadSessionCampaigns(): PrototypeCampaign[] {
	if (!canUseStorage()) return [];
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as PrototypeCampaign[]) : [];
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
	input: Omit<PrototypeCampaign, 'slug' | 'createdAt' | 'source'> & { slug?: string }
): PrototypeCampaign {
	const campaign: PrototypeCampaign = {
		...input,
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

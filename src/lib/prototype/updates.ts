/** Client-only organizer updates for the GoFundMe-style campaign feed. */

export type CampaignUpdate = {
	id: string;
	campaignSlug: string;
	title: string;
	body: string;
	createdAt: string;
};

const STORAGE_KEY = 'chipin.prototype.updates.v1';

function canUseStorage(): boolean {
	return typeof sessionStorage !== 'undefined';
}

function loadAll(): CampaignUpdate[] {
	if (!canUseStorage()) return [];
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as CampaignUpdate[]) : [];
	} catch {
		return [];
	}
}

function saveAll(updates: CampaignUpdate[]) {
	if (!canUseStorage()) return;
	sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
}

export function loadUpdates(campaignSlug: string): CampaignUpdate[] {
	return loadAll()
		.filter((u) => u.campaignSlug === campaignSlug)
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addUpdate(input: {
	campaignSlug: string;
	title: string;
	body: string;
}): CampaignUpdate {
	const entry: CampaignUpdate = {
		id: `upd_${Math.random().toString(36).slice(2, 10)}`,
		campaignSlug: input.campaignSlug,
		title: input.title.trim(),
		body: input.body.trim(),
		createdAt: new Date().toISOString()
	};
	const all = loadAll();
	all.push(entry);
	saveAll(all);
	return entry;
}

export function formatUpdateDate(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return date.toLocaleDateString('en-BS', {
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});
}

export const RAINBOW_UPDATE_SEED: CampaignUpdate[] = [
	{
		id: 'seed_upd_1',
		campaignSlug: 'rainbow',
		title: 'Electrician booked for next week',
		body: 'Thank you — we scheduled the inspection. Chairs are ordered; we still need help with storage and programme supplies.',
		createdAt: '2026-07-30T14:00:00.000Z'
	},
	{
		id: 'seed_upd_2',
		campaignSlug: 'rainbow',
		title: 'Campaign launched',
		body: 'We are raising what it takes to reopen safely. Every chip-in goes straight to our centre account; ChipIn just helps us keep the record clear.',
		createdAt: '2026-07-22T11:00:00.000Z'
	}
];

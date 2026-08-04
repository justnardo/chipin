/** Client-only words of support for the GoFundMe-style campaign wall. */

export type SupportMessage = {
	id: string;
	campaignSlug: string;
	name: string;
	message: string;
	amountCents: number | null;
	createdAt: string;
};

const STORAGE_KEY = 'chipin.prototype.support.v1';

function canUseStorage(): boolean {
	return typeof sessionStorage !== 'undefined';
}

function loadAll(): SupportMessage[] {
	if (!canUseStorage()) return [];
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as SupportMessage[]) : [];
	} catch {
		return [];
	}
}

function saveAll(messages: SupportMessage[]) {
	if (!canUseStorage()) return;
	sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function loadSupport(campaignSlug: string): SupportMessage[] {
	return loadAll()
		.filter((m) => m.campaignSlug === campaignSlug)
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addSupport(input: {
	campaignSlug: string;
	name: string;
	message: string;
	amountCents?: number | null;
}): SupportMessage {
	const entry: SupportMessage = {
		id: `sup_${Math.random().toString(36).slice(2, 10)}`,
		campaignSlug: input.campaignSlug,
		name: input.name.trim() || 'Anonymous',
		message: input.message.trim(),
		amountCents: input.amountCents ?? null,
		createdAt: new Date().toISOString()
	};
	const all = loadAll();
	all.push(entry);
	saveAll(all);
	return entry;
}

export const RAINBOW_SUPPORT_SEED: SupportMessage[] = [
	{
		id: 'seed_1',
		campaignSlug: 'rainbow',
		name: 'Keisha M.',
		message: 'The centre meant everything to my nephew. Glad to chip in.',
		amountCents: 10000,
		createdAt: '2026-07-30T14:00:00.000Z'
	},
	{
		id: 'seed_2',
		campaignSlug: 'rainbow',
		name: 'Anonymous',
		message: 'Praying the doors open again soon. One love.',
		amountCents: 5000,
		createdAt: '2026-07-29T18:00:00.000Z'
	},
	{
		id: 'seed_3',
		campaignSlug: 'rainbow',
		name: 'Marcus T.',
		message: 'For the homework club — keep going.',
		amountCents: 20000,
		createdAt: '2026-07-28T11:00:00.000Z'
	}
];

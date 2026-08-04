/** Client-only words of support for the GoFundMe-style campaign wall. */

export type SupportReply = {
	id: string;
	message: string;
	createdAt: string;
};

export type SupportMessage = {
	id: string;
	campaignSlug: string;
	name: string;
	message: string;
	amountCents: number | null;
	createdAt: string;
	replies: SupportReply[];
};

const STORAGE_KEY = 'chipin.prototype.support.v1';

function canUseStorage(): boolean {
	return typeof sessionStorage !== 'undefined';
}

function normalize(entry: Partial<SupportMessage> & Pick<SupportMessage, 'id' | 'campaignSlug'>): SupportMessage {
	return {
		id: entry.id,
		campaignSlug: entry.campaignSlug,
		name: entry.name ?? 'Anonymous',
		message: entry.message ?? '',
		amountCents: entry.amountCents ?? null,
		createdAt: entry.createdAt ?? new Date().toISOString(),
		replies: entry.replies ?? []
	};
}

function loadAll(): SupportMessage[] {
	if (!canUseStorage()) return [];
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as SupportMessage[]).map((m) => normalize(m)) : [];
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
	const entry = normalize({
		id: `sup_${Math.random().toString(36).slice(2, 10)}`,
		campaignSlug: input.campaignSlug,
		name: input.name.trim() || 'Anonymous',
		message: input.message.trim(),
		amountCents: input.amountCents ?? null,
		createdAt: new Date().toISOString(),
		replies: []
	});
	const all = loadAll();
	all.push(entry);
	saveAll(all);
	return entry;
}

export function addHostReply(id: string, message: string): SupportMessage | null {
	const all = loadAll();
	const index = all.findIndex((m) => m.id === id);
	if (index < 0) return null;
	const reply: SupportReply = {
		id: `rep_${Math.random().toString(36).slice(2, 10)}`,
		message: message.trim(),
		createdAt: new Date().toISOString()
	};
	const updated = normalize({
		...all[index],
		replies: [...(all[index].replies ?? []), reply]
	});
	all[index] = updated;
	saveAll(all);
	return updated;
}

export const RAINBOW_SUPPORT_SEED: SupportMessage[] = [
	{
		id: 'seed_1',
		campaignSlug: 'rainbow',
		name: 'Keisha M.',
		message: 'The centre meant everything to my nephew. Glad to chip in.',
		amountCents: 10000,
		createdAt: '2026-07-30T14:00:00.000Z',
		replies: [
			{
				id: 'seed_1_r1',
				message: 'Thank you, Keisha — he will have his table back.',
				createdAt: '2026-07-30T16:00:00.000Z'
			}
		]
	},
	{
		id: 'seed_2',
		campaignSlug: 'rainbow',
		name: 'Anonymous',
		message: 'Praying the doors open again soon. One love.',
		amountCents: 5000,
		createdAt: '2026-07-29T18:00:00.000Z',
		replies: []
	},
	{
		id: 'seed_3',
		campaignSlug: 'rainbow',
		name: 'Marcus T.',
		message: 'For the homework club — keep going.',
		amountCents: 20000,
		createdAt: '2026-07-28T11:00:00.000Z',
		replies: []
	}
];

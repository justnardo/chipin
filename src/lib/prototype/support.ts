/** Client-only words of support for the GoFundMe-style campaign wall. */

import { prototypeId, readList, writeList } from './storage';

export type SupportReply = {
	id: string;
	message: string;
	createdAt: string;
};

/**
 * A public note of encouragement. Deliberately carries NO amount.
 *
 * The wall used to render "chipped in BSD $100" beside a self-typed name. Nothing
 * backed that number: the author was anonymous, no transfer report was linked, and
 * no host had attested anything. It contradicted Product Principle 3 on the same
 * page that states public totals move only on host attestation, and it was the
 * cheapest way to fake momentum on a campaign. Amounts belong to the attested
 * total and nowhere else.
 */
export type SupportMessage = {
	id: string;
	campaignSlug: string;
	name: string;
	message: string;
	createdAt: string;
	replies: SupportReply[];
};

const STORAGE_KEY = 'chipin.prototype.support.v1';

function normalize(
	entry: Partial<SupportMessage> & Pick<SupportMessage, 'id' | 'campaignSlug'>
): SupportMessage {
	return {
		id: entry.id,
		campaignSlug: entry.campaignSlug,
		name: entry.name ?? 'Anonymous',
		message: entry.message ?? '',
		createdAt: entry.createdAt ?? new Date().toISOString(),
		replies: entry.replies ?? []
	};
}

function loadAll(): SupportMessage[] {
	// normalize() also strips the amount off anything stored before it was removed.
	return readList<SupportMessage>(STORAGE_KEY).map((m) => normalize(m));
}

function saveAll(messages: SupportMessage[]) {
	writeList(STORAGE_KEY, messages);
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
}): SupportMessage {
	const entry = normalize({
		id: prototypeId('sup'),
		campaignSlug: input.campaignSlug,
		name: input.name.trim() || 'Anonymous',
		message: input.message.trim(),
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
		id: prototypeId('rep'),
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
		createdAt: '2026-07-29T18:00:00.000Z',
		replies: []
	},
	{
		id: 'seed_3',
		campaignSlug: 'rainbow',
		name: 'Marcus T.',
		message: 'For the homework club — keep going.',
		createdAt: '2026-07-28T11:00:00.000Z',
		replies: []
	}
];

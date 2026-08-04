/**
 * Bahamian banking channels for the transfer portal.
 *
 * Marks are ORIGINAL monogram tiles in each institution's recognisable brand colour.
 * They are deliberately NOT reproductions of any bank's logo: ChipIn has no relationship
 * with these institutions, and showing a real logo beside receiving-account details
 * implies an endorsement that does not exist. See docs/stage-0/THREAT-MODEL.md T10.
 */

export type SettlementRail = 'internal' | 'ach' | 'wire' | 'wallet';

export type BankChannel = {
	id: string;
	name: string;
	shortName: string;
	monogram: string;
	/** Recognisable brand colour, used for the tile only. */
	tint: string;
	ink: string;
	kind: 'bank' | 'wallet' | 'credit-union';
	/** Field label this channel actually shows the sender, if any. */
	memoFieldLabel: string | null;
	notes: string;
};

export const BANK_CHANNELS: BankChannel[] = [
	{
		id: 'rbc',
		name: 'RBC Royal Bank (Bahamas)',
		shortName: 'RBC',
		monogram: 'RBC',
		tint: '#00539B',
		ink: '#FFFFFF',
		kind: 'bank',
		memoFieldLabel: 'Reason / memo',
		notes: 'Online banking transfers to other local banks clear through the local ACH.'
	},
	{
		id: 'cibc',
		name: 'CIBC Caribbean',
		shortName: 'CIBC',
		monogram: 'CIBC',
		tint: '#8B1A1A',
		ink: '#FFFFFF',
		kind: 'bank',
		memoFieldLabel: 'Payment details',
		notes: 'Formerly CIBC FirstCaribbean. Memo length varies by channel.'
	},
	{
		id: 'scotia',
		name: 'Scotiabank (Bahamas)',
		shortName: 'Scotiabank',
		monogram: 'SB',
		tint: '#C8102E',
		ink: '#FFFFFF',
		kind: 'bank',
		memoFieldLabel: 'Description',
		notes: 'Description field is commonly truncated on the recipient statement.'
	},
	{
		id: 'fidelity',
		name: 'Fidelity Bank (Bahamas)',
		shortName: 'Fidelity',
		monogram: 'FB',
		tint: '#00693E',
		ink: '#FFFFFF',
		kind: 'bank',
		memoFieldLabel: 'Narrative',
		notes: 'Local institution. Confirm memo visibility during Stage 0 testing.'
	},
	{
		id: 'bob',
		name: 'Bank of The Bahamas',
		shortName: 'BOB',
		monogram: 'BOB',
		tint: '#0B4EA2',
		ink: '#FFFFFF',
		kind: 'bank',
		memoFieldLabel: 'Reference',
		notes: 'Majority government-owned. Widely used for local salary accounts.'
	},
	{
		id: 'commonwealth',
		name: 'Commonwealth Bank',
		shortName: 'Commonwealth',
		monogram: 'CB',
		tint: '#00707F',
		ink: '#FFFFFF',
		kind: 'bank',
		memoFieldLabel: 'Memo',
		notes: 'Bahamian-owned retail bank.'
	},
	{
		id: 'tscu',
		name: 'Teachers & Salaried Workers Co-op Credit Union',
		shortName: 'TSWCCU',
		monogram: 'CU',
		tint: '#4A3B8C',
		ink: '#FFFFFF',
		kind: 'credit-union',
		memoFieldLabel: 'Memo',
		notes: 'Credit union transfers may settle on a different cycle than bank ACH.'
	},
	{
		id: 'sanddollar',
		name: 'SandDollar',
		shortName: 'SandDollar',
		monogram: 'SD',
		tint: '#C8892A',
		ink: '#FFFFFF',
		kind: 'wallet',
		memoFieldLabel: 'Note',
		notes: 'Central Bank digital currency. Near-instant settlement.'
	},
	{
		id: 'kanoo',
		name: 'Kanoo',
		shortName: 'Kanoo',
		monogram: 'KN',
		tint: '#E04E39',
		ink: '#FFFFFF',
		kind: 'wallet',
		memoFieldLabel: 'Note',
		notes: 'Mobile wallet. Near-instant settlement between Kanoo users.'
	},
	{
		id: 'omni',
		name: 'Omni Financial',
		shortName: 'Omni',
		monogram: 'OM',
		tint: '#1F6F8B',
		ink: '#FFFFFF',
		kind: 'wallet',
		memoFieldLabel: 'Note',
		notes: 'Mobile wallet and money services provider.'
	},
	{
		id: 'other',
		name: 'Another bank or wallet',
		shortName: 'Other',
		monogram: '••',
		tint: '#5A6B68',
		ink: '#FFFFFF',
		kind: 'bank',
		memoFieldLabel: 'Memo',
		notes: 'Use whatever memo or description field your channel provides.'
	}
];

export function getBank(id: string): BankChannel | null {
	return BANK_CHANNELS.find((b) => b.id === id) ?? null;
}

/**
 * Which rail a transfer takes, given the sender's and recipient's institutions.
 * This decides the settlement window the donor and host are told to expect.
 */
export function resolveRail(senderId: string, recipientId: string): SettlementRail {
	const sender = getBank(senderId);
	const recipient = getBank(recipientId);
	if (!sender || !recipient) return 'ach';
	if (sender.kind === 'wallet' && recipient.kind === 'wallet') {
		return sender.id === recipient.id ? 'wallet' : 'ach';
	}
	if (sender.id === recipient.id && sender.id !== 'other') return 'internal';
	return 'ach';
}

export type SettlementWindow = {
	rail: SettlementRail;
	label: string;
	hostGuidance: string;
	donorGuidance: string;
};

/**
 * Expected settlement windows.
 *
 * PLACEHOLDER VALUES. These are the windows to confirm with real transfers in
 * docs/stage-0/BANK-CHANNEL-MATRIX.md. Do not present them as guarantees to
 * pilot users until that matrix has evidence behind it.
 */
export function settlementWindow(rail: SettlementRail): SettlementWindow {
	switch (rail) {
		case 'internal':
			return {
				rail,
				label: 'Same bank — usually same day',
				hostGuidance:
					'Same-bank transfers usually appear the same day. If nothing shows by the next business day, ask the donor to check the reference.',
				donorGuidance: 'Same-bank transfers usually show up on the host’s side the same day.'
			};
		case 'wallet':
			return {
				rail,
				label: 'Same wallet — usually within minutes',
				hostGuidance:
					'Wallet-to-wallet transfers usually appear within minutes. If nothing shows within the hour, ask the donor to check the recipient handle.',
				donorGuidance: 'Wallet transfers usually arrive within minutes.'
			};
		case 'wire':
			return {
				rail,
				label: 'Wire — 1 to 3 business days',
				hostGuidance: 'Allow 1 to 3 business days before treating a wire as missing.',
				donorGuidance: 'Wires typically take 1 to 3 business days to land.'
			};
		default:
			return {
				rail: 'ach',
				label: 'Between banks — 2 to 5 business days',
				hostGuidance:
					'Wait 2 to 5 business days for your statement to reflect this before marking it not found. Weekends and public holidays do not count.',
				donorGuidance:
					'Transfers between different local banks usually take 2 to 5 business days to appear on the host’s statement.'
			};
	}
}

/**
 * Business days between two dates, excluding weekends.
 * Public holidays are NOT handled — that needs a Bahamian holiday calendar before pilot.
 */
export function businessDaysBetween(from: Date, to: Date): number {
	if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
	if (to <= from) return 0;
	let days = 0;
	const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
	const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
	while (cursor < end) {
		cursor.setDate(cursor.getDate() + 1);
		const day = cursor.getDay();
		if (day !== 0 && day !== 6) days += 1;
	}
	return days;
}

/** True once a transfer has been outstanding longer than its expected window. */
export function isOverdue(rail: SettlementRail, sentAt: Date, now: Date): boolean {
	const elapsed = businessDaysBetween(sentAt, now);
	switch (rail) {
		case 'internal':
			return elapsed > 1;
		case 'wallet':
			return elapsed > 1;
		case 'wire':
			return elapsed > 3;
		default:
			return elapsed > 5;
	}
}

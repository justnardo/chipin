/**
 * Bahamian banking channels for the transfer portal.
 *
 * MARKS. Six channels have real trademarked artwork in static/banks/; the rest
 * fall back to an original monogram. Both render the same way — the mark
 * knocked out in white on a chip of the institution's colour — so a row of
 * eleven reads as one system instead of six washed-out logo plates beside five
 * saturated tiles.
 *
 * This file used to claim the marks were "deliberately NOT reproductions of any
 * bank's logo". That stopped being true when the artwork landed, and a comment
 * asserting a control that is not operating is worse than no comment. The real
 * policy, and the reasoning, is in docs/stage-0/THREAT-MODEL.md T13/T14:
 *
 *   Marks appear where they label one option among all its competitors — the
 *   bank pickers. They do NOT appear standing alone above an instruction to
 *   send money, because a real bank logo above an account number and a Copy
 *   button is structurally what a bank-impersonation page looks like, and this
 *   product's own defence against fake hosts depends on donors distrusting
 *   exactly that pattern. The receiving panel names the bank in words instead.
 *
 * Written permission is still outstanding for all six. See static/banks/README.md.
 *
 * TINTS are unverified approximations of each institution's brand colour, not
 * values checked against a brand book — nobody has confirmed them, and Stage 0
 * is where to ask. They were spread apart in CIELAB after measurement showed
 * the originals were perceptually duplicates: RBC and BOB sat at dE 8.9 and
 * Commonwealth and Omni at dE 9.7, with nine of eleven inside a 14-point
 * lightness band, which is why the picker read as one colour. Every pair is now
 * at least dE 23, and Commonwealth has moved off ChipIn's own aqua.
 */

export type SettlementRail = 'internal' | 'ach' | 'wire' | 'wallet';

export type BankChannel = {
	id: string;
	name: string;
	shortName: string;
	monogram: string;
	/** Approximate brand colour. Unverified — see the note at the top of this file. */
	tint: string;
	ink: string;
	/**
	 * Window on to the emblem inside this channel's lockup in static/banks/, as
	 * percentages of the source canvas. The files are autotraces of bitmaps —
	 * 4:1 wordmarks that render at a 3.6px cap height in a 32px tile — so the
	 * mark shown is the emblem alone, which is near-square and survives.
	 * Measured by scripts/measure_bank_emblems.mjs. Absent = monogram fallback.
	 */
	emblem?: { x: number; y: number; w: number; h: number };
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
		tint: '#0051A5',
		ink: '#FFFFFF',
		emblem: { x: 0.0, y: 18.82, w: 37.14, h: 55.71 },
		kind: 'bank',
		memoFieldLabel: 'Reason / memo',
		notes: 'Online banking transfers to other local banks clear through the local ACH.'
	},
	{
		id: 'cibc',
		name: 'CIBC Caribbean',
		shortName: 'CIBC',
		monogram: 'CIBC',
		tint: '#A11C2C',
		ink: '#FFFFFF',
		emblem: { x: 67.64, y: 28.19, w: 26.14, h: 39.21 },
		kind: 'bank',
		memoFieldLabel: 'Payment details',
		notes: 'Formerly CIBC FirstCaribbean. Memo length varies by channel.'
	},
	{
		id: 'scotia',
		name: 'Scotiabank (Bahamas)',
		shortName: 'Scotiabank',
		monogram: 'SB',
		tint: '#E11B31',
		ink: '#FFFFFF',
		emblem: { x: 11.51, y: 36.05, w: 14.36, h: 21.55 },
		kind: 'bank',
		memoFieldLabel: 'Description',
		notes: 'Description field is commonly truncated on the recipient statement.'
	},
	{
		id: 'fidelity',
		name: 'Fidelity Bank (Bahamas)',
		shortName: 'Fidelity',
		monogram: 'FB',
		tint: '#1D7A3A',
		ink: '#FFFFFF',
		emblem: { x: 8.28, y: 30.18, w: 21.74, h: 32.61 },
		kind: 'bank',
		memoFieldLabel: 'Narrative',
		notes: 'Local institution. Confirm memo visibility during Stage 0 testing.'
	},
	{
		id: 'bob',
		name: 'Bank of The Bahamas',
		shortName: 'BOB',
		monogram: 'BOB',
		tint: '#0A2C5E',
		ink: '#FFFFFF',
		emblem: { x: 13.72, y: 29.27, w: 14.5, h: 14.5 },
		kind: 'bank',
		memoFieldLabel: 'Reference',
		notes: 'Majority government-owned. Widely used for local salary accounts.'
	},
	{
		id: 'commonwealth',
		name: 'Commonwealth Bank',
		shortName: 'Commonwealth',
		monogram: 'CB',
		tint: '#00565E',
		ink: '#FFFFFF',
		emblem: { x: 24.84, y: 2.03, w: 48.59, h: 72.88 },
		kind: 'bank',
		memoFieldLabel: 'Memo',
		notes: 'Bahamian-owned retail bank.'
	},
	{
		id: 'tscu',
		name: 'Teachers & Salaried Workers Co-op Credit Union',
		shortName: 'TSWCCU',
		monogram: 'CU',
		tint: '#6B4FC0',
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
		tint: '#D99A22',
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
		tint: '#E8613C',
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
		tint: '#3E8FA8',
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
		tint: '#6E7D7A',
		ink: '#FFFFFF',
		kind: 'bank',
		memoFieldLabel: 'Memo',
		notes: 'Use whatever memo or description field your channel provides.'
	}
];

/**
 * Where an unrecognised bank id lands. Resolved by id so callers never depend
 * on array order — see the fallback note in BankTransferPortal.
 */
export const UNKNOWN_CHANNEL: BankChannel = BANK_CHANNELS.find((b) => b.id === 'other')!;

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

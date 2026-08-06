import { describe, expect, it } from 'vitest';
import {
	BANK_CHANNELS,
	UNKNOWN_CHANNEL,
	businessDaysBetween,
	getBank,
	isOverdue,
	resolveRail,
	settlementWindow
} from './banks';

describe('bank registry', () => {
	it('exposes the main local channels', () => {
		const ids = BANK_CHANNELS.map((b) => b.id);
		expect(ids).toContain('rbc');
		expect(ids).toContain('cibc');
		expect(ids).toContain('scotia');
		expect(ids).toContain('fidelity');
		expect(ids).toContain('bob');
	});

	it('uses unique ids', () => {
		const ids = BANK_CHANNELS.map((b) => b.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('looks a channel up by id', () => {
		expect(getBank('bob')?.shortName).toBe('BOB');
		expect(getBank('nope')).toBeNull();
	});
});

describe('resolveRail', () => {
	it('treats same-bank transfers as internal', () => {
		expect(resolveRail('rbc', 'rbc')).toBe('internal');
	});

	it('treats cross-bank transfers as ACH', () => {
		expect(resolveRail('rbc', 'scotia')).toBe('ach');
	});

	it('treats same-wallet transfers as wallet', () => {
		expect(resolveRail('kanoo', 'kanoo')).toBe('wallet');
	});

	it('does not treat two different wallets as instant', () => {
		expect(resolveRail('kanoo', 'omni')).toBe('ach');
	});

	it('does not collapse two unknown channels into an internal transfer', () => {
		expect(resolveRail('other', 'other')).toBe('ach');
	});
});

describe('settlementWindow', () => {
	it('gives the 2-5 business day guidance for interbank transfers', () => {
		const window = settlementWindow('ach');
		expect(window.hostGuidance).toContain('2 to 5 business days');
	});

	it('does not tell hosts to wait days for a same-bank transfer', () => {
		expect(settlementWindow('internal').hostGuidance).not.toContain('2 to 5');
	});
});

describe('businessDaysBetween', () => {
	it('excludes the weekend', () => {
		// Friday 7 Aug 2026 -> Monday 10 Aug 2026 is one business day.
		expect(businessDaysBetween(new Date('2026-08-07'), new Date('2026-08-10'))).toBe(1);
	});

	it('counts consecutive weekdays', () => {
		expect(businessDaysBetween(new Date('2026-08-03'), new Date('2026-08-06'))).toBe(3);
	});

	it('returns zero when the dates are reversed', () => {
		expect(businessDaysBetween(new Date('2026-08-10'), new Date('2026-08-03'))).toBe(0);
	});
});

describe('isOverdue', () => {
	it('is not overdue inside the interbank window', () => {
		expect(isOverdue('ach', new Date('2026-08-03'), new Date('2026-08-06'))).toBe(false);
	});

	it('is overdue past five business days', () => {
		expect(isOverdue('ach', new Date('2026-08-03'), new Date('2026-08-11'))).toBe(true);
	});

	it('flags a same-bank transfer much sooner', () => {
		expect(isOverdue('internal', new Date('2026-08-03'), new Date('2026-08-05'))).toBe(true);
	});
});

describe('UNKNOWN_CHANNEL', () => {
	it('resolves by id, not array position', () => {
		// BankTransferPortal used to reach for BANK_CHANNELS[length - 1]. That was
		// only correct while 'other' sat last: appending a channel would have made
		// every unrecognised account render under a real bank's name and colours,
		// beside a live account number, with nothing to catch it.
		expect(UNKNOWN_CHANNEL.id).toBe('other');
		expect(getBank('a-bank-that-does-not-exist')).toBeNull();
	});
});

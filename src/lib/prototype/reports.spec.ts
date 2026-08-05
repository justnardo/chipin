import { beforeEach, describe, expect, it } from 'vitest';
import {
	addReport,
	campaignAttestedCents,
	correctMatch,
	dollarsToCents,
	donorStatusLabel,
	donorStatusTone,
	ledger,
	loadReports,
	markNotFound,
	matchedCents,
	recordMatch,
	requestClarification,
	statusPath,
	unmatchedCents,
	voidMatch,
	type PrototypeReport
} from './reports';

const V2_KEY = 'chipin.prototype.reports.v2';

function newReport(reportedCents = 20_000): PrototypeReport {
	return addReport({
		campaignSlug: 'rainbow',
		pledgeCents: reportedCents,
		reportedCents,
		transferDate: '2026-08-01',
		bankReference: 'REF-1'
	});
}

describe('prototype reports helpers', () => {
	it('parses dollar amounts to cents', () => {
		expect(dollarsToCents('50')).toBe(5000);
		expect(dollarsToCents('12.34')).toBe(1234);
		expect(dollarsToCents('0')).toBeNull();
	});

	it('builds a status path from campaign slug and token', () => {
		expect(statusPath('rainbow', 'abc123')).toBe('/c/rainbow/status/abc123');
	});

	it('uses plain-language donor status labels', () => {
		expect(donorStatusLabel('clarification_requested')).toBe('Host asked a question');
		expect(donorStatusLabel('marked_received')).toBe('Marked received by the host');
		expect(donorStatusLabel('confirmation_voided')).toBe('Host withdrew an earlier confirmation');
	});

	it('does not dress a partial match up as received', () => {
		expect(donorStatusTone('partially_matched')).not.toBe('received');
		expect(donorStatusTone('confirmation_voided')).toBe('disputed');
	});
});

describe('attestation ledger', () => {
	beforeEach(() => localStorage.clear());

	it('holds a report short of the reported amount as partially matched', () => {
		const report = newReport(20_000);
		const updated = recordMatch(report.id, { amountCents: 12_000, method: 'amount_date' });

		expect(updated?.status).toBe('partially_matched');
		expect(matchedCents(updated!)).toBe(12_000);
		expect(unmatchedCents(updated!)).toBe(8_000);
	});

	it('flips to received once later deposits cover the reported amount', () => {
		const report = newReport(20_000);
		recordMatch(report.id, { amountCents: 12_000, method: 'amount_date' });
		const updated = recordMatch(report.id, { amountCents: 8_000, method: 'bank_reference' });

		expect(updated?.status).toBe('marked_received');
		expect(unmatchedCents(updated!)).toBe(0);
		expect(updated?.allocations).toHaveLength(2);
	});

	it('keeps the voided row and stops counting it', () => {
		const report = newReport(20_000);
		const matched = recordMatch(report.id, { amountCents: 20_000, method: 'bank_reference' });
		const allocationId = matched!.allocations[0].id;

		const voided = voidMatch(report.id, allocationId, 'Deposit was reversed by the bank.');

		expect(voided?.status).toBe('confirmation_voided');
		expect(matchedCents(voided!)).toBe(0);
		// The record of what the donor was told still exists.
		expect(voided?.allocations).toHaveLength(1);
		expect(voided?.allocations[0].voidReason).toBe('Deposit was reversed by the bank.');
	});

	it('refuses to void without a reason', () => {
		const report = newReport();
		const matched = recordMatch(report.id, { amountCents: 20_000, method: 'bank_reference' });

		expect(voidMatch(report.id, matched!.allocations[0].id, '   ')).toBeNull();
		expect(matchedCents(loadReports('rainbow')[0])).toBe(20_000);
	});

	it('corrects an amount by appending, not editing', () => {
		const report = newReport(20_000);
		const matched = recordMatch(report.id, { amountCents: 20_000, method: 'amount_date' });
		const original = matched!.allocations[0];

		const corrected = correctMatch(report.id, original.id, {
			amountCents: 18_000,
			reason: 'Bank fee came off the deposit.'
		});

		expect(matchedCents(corrected!)).toBe(18_000);
		expect(corrected?.status).toBe('partially_matched');

		const rows = ledger(corrected!);
		expect(rows).toHaveLength(2);
		expect(rows[0].id).toBe(original.id);
		expect(rows[0].status).toBe('voided');
		expect(rows[1].correctionOf).toBe(original.id);
		expect(rows[1].amountCents).toBe(18_000);
	});

	it('keeps the corrected row on the method it was originally matched by', () => {
		const report = newReport(20_000);
		const matched = recordMatch(report.id, { amountCents: 20_000, method: 'bank_reference' });

		const corrected = correctMatch(report.id, matched!.allocations[0].id, {
			amountCents: 18_000,
			reason: 'Bank fee came off the deposit.'
		});

		expect(ledger(corrected!)[1].method).toBe('bank_reference');
	});

	it('lets the host say a correction came from re-checking the statement', () => {
		const report = newReport(20_000);
		const matched = recordMatch(report.id, { amountCents: 20_000, method: 'bank_reference' });

		const corrected = correctMatch(report.id, matched!.allocations[0].id, {
			amountCents: 18_000,
			reason: 'Found the real figure on the statement.',
			method: 'manual_audit'
		});

		expect(ledger(corrected!)[1].method).toBe('manual_audit');
	});

	it('will not correct a row that is already voided', () => {
		const report = newReport();
		const matched = recordMatch(report.id, { amountCents: 20_000, method: 'amount_date' });
		const allocationId = matched!.allocations[0].id;
		voidMatch(report.id, allocationId, 'Wrong report.');

		expect(
			correctMatch(report.id, allocationId, { amountCents: 5_000, reason: 'Second thoughts.' })
		).toBeNull();
	});

	it('blocks "not found" while amounts are still counted', () => {
		const report = newReport();
		const matched = recordMatch(report.id, { amountCents: 20_000, method: 'bank_reference' });

		expect(markNotFound(report.id)).toBeNull();

		voidMatch(report.id, matched!.allocations[0].id, 'Matched to the wrong donor.');
		expect(markNotFound(report.id)?.status).toBe('marked_not_found');
	});

	it('lets an open question outrank a withdrawn amount', () => {
		const report = newReport();
		const matched = recordMatch(report.id, { amountCents: 20_000, method: 'amount_date' });
		voidMatch(report.id, matched!.allocations[0].id, 'Cannot tell which donor this was.');

		expect(requestClarification(report.id, 'Which account did you send from?')?.status).toBe(
			'clarification_requested'
		);
	});

	it('counts only active allocations toward the campaign total', () => {
		const kept = newReport(20_000);
		const pulled = newReport(5_000);
		recordMatch(kept.id, { amountCents: 15_000, method: 'amount_date' });
		const short = recordMatch(pulled.id, { amountCents: 5_000, method: 'amount_date' });
		voidMatch(pulled.id, short!.allocations[0].id, 'Duplicate of another report.');

		expect(campaignAttestedCents(loadReports('rainbow'))).toBe(15_000);
	});

	it('carries pre-ledger reports forward instead of zeroing their total', () => {
		localStorage.setItem(
			V2_KEY,
			JSON.stringify([
				{
					id: 'rpt_old',
					campaignSlug: 'rainbow',
					statusToken: 'token-old',
					reportedCents: 10_000,
					attestedCents: 10_000,
					status: 'marked_received',
					createdAt: '2026-07-01T00:00:00.000Z',
					updatedAt: '2026-07-02T00:00:00.000Z'
				}
			])
		);

		const [migrated] = loadReports('rainbow');

		expect(migrated.status).toBe('marked_received');
		expect(matchedCents(migrated)).toBe(10_000);
		expect(migrated.allocations).toHaveLength(1);
	});
});

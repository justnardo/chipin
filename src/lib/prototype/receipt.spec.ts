import { describe, expect, it } from 'vitest';
import {
	extractAmount,
	extractBank,
	extractDate,
	extractReceipt,
	extractReference,
	extractionSummary,
	screenshotContributed,
	toLines
} from './receipt';

const RBC_SCREENSHOT = `
RBC Royal Bank
Transfer Successful
Amount  BSD $150.00
To  Rainbow Community Centre
From  Chequing ****4821
Available balance  BSD $2,340.11
Date  12 August 2026
Reference No: RB884213PQ
`;

describe('toLines', () => {
	it('drops blank lines and collapses whitespace', () => {
		expect(toLines('  a  b \n\n  c \n')).toEqual(['a b', 'c']);
	});
});

describe('extractAmount', () => {
	it('prefers a labelled currency amount over an unlabelled one', () => {
		const found = extractAmount(toLines(RBC_SCREENSHOT));
		expect(found?.value).toBe(15000);
	});

	it('does not mistake the available balance for the amount sent', () => {
		const found = extractAmount(['Available balance BSD $2,340.11']);
		// It may still be picked up as a weak candidate, but never with high confidence.
		expect(found === null || found.confidence < 0.5).toBe(true);
	});

	it('reads a bare decimal amount when no currency symbol is present', () => {
		const found = extractAmount(['Total 75.50']);
		expect(found?.value).toBe(7550);
	});

	it('handles thousands separators', () => {
		const found = extractAmount(['Amount BSD $1,250.00']);
		expect(found?.value).toBe(125000);
	});

	it('returns null when there is no number at all', () => {
		expect(extractAmount(['Transfer successful', 'Thank you'])).toBeNull();
	});
});

describe('extractDate', () => {
	it('reads a written month', () => {
		expect(extractDate(['Date 12 August 2026'])?.value).toBe('2026-08-12');
	});

	it('reads a month-first written date', () => {
		expect(extractDate(['Aug 3, 2026'])?.value).toBe('2026-08-03');
	});

	it('reads an ISO date with high confidence', () => {
		const found = extractDate(['Posted 2026-08-12']);
		expect(found?.value).toBe('2026-08-12');
		expect(found?.confidence).toBeGreaterThan(0.8);
	});

	it('prefers day-first for ambiguous slash dates but flags low confidence', () => {
		const found = extractDate(['08/12/2026 transfer']);
		expect(found?.value).toBe('2026-12-08');
		expect(found?.confidence).toBeLessThan(0.6);
	});

	it('falls back to month-first when day-first is impossible', () => {
		expect(extractDate(['12/25/2026'])?.value).toBe('2026-12-25');
	});

	it('rejects an impossible date', () => {
		expect(extractDate(['45/45/2026'])).toBeNull();
	});
});

describe('extractReference', () => {
	it('reads a labelled reference number', () => {
		expect(extractReference(['Reference No: RB884213PQ'])?.value).toBe('RB884213PQ');
	});

	it('reads a confirmation number', () => {
		expect(extractReference(['Confirmation # 44821903'])?.value).toBe('44821903');
	});

	it('ignores an unlabelled token', () => {
		expect(extractReference(['RB884213PQ'])).toBeNull();
	});

	it('ignores a reference that is too short to be real', () => {
		expect(extractReference(['Ref: 12'])).toBeNull();
	});
});

describe('extractBank', () => {
	it('recognises RBC', () => {
		expect(extractBank(['RBC Royal Bank'])?.value).toBe('rbc');
	});

	it('recognises Scotiabank across spellings', () => {
		expect(extractBank(['Scotia Bank'])?.value).toBe('scotia');
		expect(extractBank(['Scotiabank Bahamas'])?.value).toBe('scotia');
	});

	it('recognises CIBC under its former name', () => {
		expect(extractBank(['FirstCaribbean International'])?.value).toBe('cibc');
	});

	it('recognises Bank of The Bahamas', () => {
		expect(extractBank(['Bank of The Bahamas Limited'])?.value).toBe('bob');
	});

	it('recognises a wallet', () => {
		expect(extractBank(['Kanoo payment sent'])?.value).toBe('kanoo');
	});

	it('returns null for an unrelated screenshot', () => {
		expect(extractBank(['Grocery list', 'milk'])).toBeNull();
	});
});

describe('extractReceipt', () => {
	it('pulls every field out of a realistic transfer screenshot', () => {
		const receipt = extractReceipt(RBC_SCREENSHOT);
		expect(receipt.amountCents?.value).toBe(15000);
		expect(receipt.transferDate?.value).toBe('2026-08-12');
		expect(receipt.reference?.value).toBe('RB884213PQ');
		expect(receipt.bankId?.value).toBe('rbc');
	});

	it('degrades to nulls rather than guessing on an unrelated image', () => {
		const receipt = extractReceipt('a photo of a beach\nsunset');
		expect(receipt.amountCents).toBeNull();
		expect(receipt.reference).toBeNull();
		expect(receipt.bankId).toBeNull();
	});
});

describe('screenshotContributed', () => {
	it('flags a report when the screenshot supplied form fields', () => {
		expect(screenshotContributed(extractReceipt(RBC_SCREENSHOT), false)).toBe(true);
	});

	it('flags a report when the bank was the only thing recognised', () => {
		// The host still receives an OCR-derived claim, so it must carry the warning.
		const receipt = extractReceipt('Scotiabank\nTransfer complete');
		expect(receipt.amountCents).toBeNull();
		expect(receipt.bankId?.value).toBe('scotia');
		expect(screenshotContributed(receipt, false)).toBe(true);
	});

	it('does not flag a bank-only read when the donor had already chosen their bank', () => {
		const receipt = extractReceipt('Scotiabank\nTransfer complete');
		expect(screenshotContributed(receipt, true)).toBe(false);
	});

	it('still flags field extraction even when the donor chose their own bank', () => {
		expect(screenshotContributed(extractReceipt(RBC_SCREENSHOT), true)).toBe(true);
	});

	it('does not flag an unreadable image', () => {
		expect(screenshotContributed(extractReceipt('a photo of a beach'), false)).toBe(false);
	});
});

describe('extractionSummary', () => {
	it('counts the fields that were found', () => {
		const summary = extractionSummary(extractReceipt(RBC_SCREENSHOT));
		expect(summary.found).toBe(4);
		expect(summary.total).toBe(4);
	});

	it('flags a thin read as weak so the UI asks for a manual check', () => {
		const summary = extractionSummary(extractReceipt('Amount $20.00'));
		expect(summary.weak).toBe(true);
	});
});

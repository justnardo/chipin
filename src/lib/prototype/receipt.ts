/**
 * Screenshot field extraction for the transfer report form.
 *
 * IMPORTANT — read before changing anything here.
 *
 * This module PRE-FILLS a form. It does not confirm, verify, validate, or approve
 * anything, and no output of this module may ever be labelled as confirmation.
 *
 * A banking screenshot is trivially forgeable — any phone can edit one in seconds.
 * If ChipIn told a host "confirmed" on the strength of an image, ChipIn would be
 * asserting a financial fact it cannot know, which breaks Product Principle 3
 * (host-attested receipts only) and hands fraudsters a green tick that is more
 * persuasive than the plain claim it replaced. Extraction saves the donor typing.
 * The host still reconciles against their own statement. That is the whole design.
 *
 * Extraction runs entirely in the donor's browser. The image is never uploaded and
 * never stored — see THREAT-MODEL.md T5 and the "transfer proofs" asset row.
 */

import { BANK_CHANNELS } from './banks';

export type ExtractedField<T> = {
	value: T;
	/** Raw text the value came from, shown to the donor so they can check it. */
	source: string;
	/** 0–1. Drives how loudly the UI asks the donor to double-check, nothing else. */
	confidence: number;
};

export type ExtractedReceipt = {
	amountCents: ExtractedField<number> | null;
	transferDate: ExtractedField<string> | null;
	reference: ExtractedField<string> | null;
	bankId: ExtractedField<string> | null;
	/** Every line we read, kept client-side only for the "what did you read?" panel. */
	lines: string[];
};

const MONTHS: Record<string, number> = {
	jan: 1,
	january: 1,
	feb: 2,
	february: 2,
	mar: 3,
	march: 3,
	apr: 4,
	april: 4,
	may: 5,
	jun: 6,
	june: 6,
	jul: 7,
	july: 7,
	aug: 8,
	august: 8,
	sep: 9,
	sept: 9,
	september: 9,
	oct: 10,
	october: 10,
	nov: 11,
	november: 11,
	dec: 12,
	december: 12
};

/** Labels that sit next to the number a donor actually sent. */
const AMOUNT_LABELS = /(amount|total|you sent|sent|transfer(red)?|payment|debit|value)\b/i;

/** Labels that sit next to something that is NOT the transfer amount. */
const AMOUNT_ANTI_LABELS = /(balance|available|current|ledger|limit|fee|charge|rate|remaining)\b/i;

const REFERENCE_LABELS =
	/(reference|ref(?:erence)?\s*(?:no|number|#)?|confirmation|conf(?:irmation)?\s*(?:no|number|#)?|transaction\s*(?:id|no|number|#)?|txn|receipt\s*(?:no|number|#)?|trace)\b/i;

function toCents(raw: string): number | null {
	const cleaned = raw.replace(/[^0-9.]/g, '');
	if (!cleaned) return null;
	// Reject things like "1.2.3" that are dates misread as amounts.
	if ((cleaned.match(/\./g) ?? []).length > 1) return null;
	const num = Number(cleaned);
	if (!Number.isFinite(num) || num <= 0) return null;
	return Math.round(num * 100);
}

function pad(n: number): string {
	return String(n).padStart(2, '0');
}

function isoDate(year: number, month: number, day: number): string | null {
	if (month < 1 || month > 12 || day < 1 || day > 31) return null;
	if (year < 2000 || year > 2100) return null;
	const date = new Date(Date.UTC(year, month - 1, day));
	if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
	return `${year}-${pad(month)}-${pad(day)}`;
}

export function extractAmount(lines: string[]): ExtractedField<number> | null {
	let best: ExtractedField<number> | null = null;

	for (const line of lines) {
		// Skip lines that are clearly a balance rather than the transfer amount.
		if (AMOUNT_ANTI_LABELS.test(line) && !AMOUNT_LABELS.test(line)) continue;

		const matches = line.matchAll(
			/(?:BSD|B\$|USD|US\$|\$)\s?([0-9][0-9,]*(?:\.[0-9]{1,2})?)|([0-9][0-9,]*\.[0-9]{2})\b/gi
		);

		for (const match of matches) {
			const raw = match[1] ?? match[2];
			if (!raw) continue;
			const cents = toCents(raw);
			if (cents === null) continue;

			const labelled = AMOUNT_LABELS.test(line);
			const hasCurrency = Boolean(match[1]);
			// A labelled, currency-marked number is what we want most.
			let confidence = 0.4;
			if (hasCurrency) confidence += 0.25;
			if (labelled) confidence += 0.3;
			if (AMOUNT_ANTI_LABELS.test(line)) confidence -= 0.35;

			confidence = Math.max(0.05, Math.min(1, confidence));

			if (!best || confidence > best.confidence) {
				best = { value: cents, source: line.trim(), confidence };
			}
		}
	}

	return best;
}

export function extractDate(lines: string[]): ExtractedField<string> | null {
	for (const line of lines) {
		// 12 August 2026 / Aug 12, 2026
		const named = line.match(
			/\b(\d{1,2})\s+([A-Za-z]{3,9})\.?\s+(\d{4})\b|\b([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})\b/
		);
		if (named) {
			const day = Number(named[1] ?? named[5]);
			const monthName = (named[2] ?? named[4] ?? '').toLowerCase();
			const year = Number(named[3] ?? named[6]);
			const month = MONTHS[monthName];
			if (month) {
				const iso = isoDate(year, month, day);
				if (iso) return { value: iso, source: line.trim(), confidence: 0.85 };
			}
		}

		// 2026-08-12
		const iso = line.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
		if (iso) {
			const value = isoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
			if (value) return { value, source: line.trim(), confidence: 0.9 };
		}

		// 12/08/2026 — ambiguous day/month order, so confidence stays low on purpose.
		const slash = line.match(/\b(\d{1,2})[/.](\d{1,2})[/.](\d{2,4})\b/);
		if (slash) {
			const a = Number(slash[1]);
			const b = Number(slash[2]);
			let year = Number(slash[3]);
			if (year < 100) year += 2000;
			// Prefer DD/MM (local convention); fall back to MM/DD when impossible.
			const value = isoDate(year, b, a) ?? isoDate(year, a, b);
			if (value) return { value, source: line.trim(), confidence: 0.5 };
		}
	}

	return null;
}

export function extractReference(lines: string[]): ExtractedField<string> | null {
	for (const line of lines) {
		if (!REFERENCE_LABELS.test(line)) continue;
		// Take the token after the label, allowing an optional separator.
		const match = line.match(
			/(?:reference|ref|confirmation|conf|transaction|txn|receipt|trace)\s*(?:no\.?|number|id|#)?\s*[:#-]?\s*([A-Z0-9][A-Z0-9-]{3,})/i
		);
		if (match?.[1]) {
			const value = match[1].replace(/[^A-Z0-9-]/gi, '').toUpperCase();
			if (value.length >= 4) {
				return { value, source: line.trim(), confidence: 0.75 };
			}
		}
	}
	return null;
}

export function extractBank(lines: string[]): ExtractedField<string> | null {
	const haystack = lines.join(' \n ').toLowerCase();

	const aliases: Array<[string, RegExp]> = [
		['rbc', /\brbc\b|royal bank/],
		['cibc', /\bcibc\b|firstcaribbean|first caribbean/],
		['scotia', /scotia\s*bank|\bscotia\b|nova scotia/],
		['fidelity', /fidelity\s*bank|\bfidelity\b/],
		['bob', /bank of the bahamas|\bbob\b/],
		['commonwealth', /commonwealth\s*bank/],
		['tscu', /teachers|salaried workers|credit union/],
		['sanddollar', /sand\s*dollar/],
		['kanoo', /\bkanoo\b/],
		['omni', /\bomni\b/]
	];

	for (const [id, pattern] of aliases) {
		const match = haystack.match(pattern);
		if (match) {
			const bank = BANK_CHANNELS.find((b) => b.id === id);
			if (bank) {
				return { value: id, source: match[0], confidence: 0.8 };
			}
		}
	}

	return null;
}

/** Split raw OCR output into trimmed, non-empty lines. */
export function toLines(rawText: string): string[] {
	return rawText
		.split(/\r?\n/)
		.map((line) => line.replace(/\s+/g, ' ').trim())
		.filter((line) => line.length > 0);
}

/**
 * Read candidate fields out of OCR text.
 * Every field is a suggestion for the donor to confirm — never a verified value.
 */
export function extractReceipt(rawText: string): ExtractedReceipt {
	const lines = toLines(rawText);
	return {
		amountCents: extractAmount(lines),
		transferDate: extractDate(lines),
		reference: extractReference(lines),
		bankId: extractBank(lines),
		lines
	};
}

/**
 * Whether the screenshot actually contributed anything to this report.
 *
 * Drives the `screenshot` provenance the host sees. Recognising only the sending bank
 * still counts: that is an OCR-derived claim reaching the host, and it must carry the
 * same "ChipIn read this from an image" warning as an OCR-derived amount. It does not
 * count when the donor had already chosen their bank, because then nothing the host
 * sees came from the image.
 */
export function screenshotContributed(
	receipt: ExtractedReceipt,
	senderAlreadyChosen: boolean
): boolean {
	if (receipt.amountCents || receipt.transferDate || receipt.reference) return true;
	return Boolean(receipt.bankId) && !senderAlreadyChosen;
}

/** How much of the form we managed to fill, for the donor-facing summary line. */
export function extractionSummary(receipt: ExtractedReceipt): {
	found: number;
	total: number;
	weak: boolean;
} {
	const fields = [receipt.amountCents, receipt.transferDate, receipt.reference, receipt.bankId];
	const present = fields.filter((f) => f !== null);
	const weak = present.some((f) => (f?.confidence ?? 0) < 0.6);
	return { found: present.length, total: fields.length, weak: weak || present.length < 2 };
}

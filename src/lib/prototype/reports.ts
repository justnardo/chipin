/** Client-only fictional transfer reports for the Stage 0 UI prototype. */

import { prototypeId, readList, writeList } from './storage';

export type ReportStatus =
	| 'submitted'
	| 'clarification_requested'
	| 'marked_received'
	| 'marked_not_found'
	| 'partially_matched';

/**
 * How the donor produced the figures on a report.
 *
 * 'screenshot' means fields were pre-filled by reading an image on the donor's own
 * device and then confirmed by the donor. It carries NO verification weight — a
 * screenshot is trivially forged, and ChipIn never contacted a bank. The host must
 * reconcile against their own statement either way. This exists so the host knows
 * what they are looking at, not so ChipIn can vouch for it.
 */
export type ReportSource = 'manual' | 'screenshot';

export type PrototypeReport = {
	id: string;
	campaignSlug: string;
	statusToken: string;
	pledgeCents: number;
	reportedCents: number;
	attestedCents: number | null;
	transferDate: string;
	bankReference: string;
	note: string;
	status: ReportStatus;
	clarificationQuestion: string;
	clarificationReply: string;
	revoked: boolean;
	/** Which bank or wallet the donor says they sent from. */
	senderBankId: string;
	/**
	 * Which of the host's receiving accounts the donor said they sent to.
	 * Hosts can list several; the settlement window the host is shown depends on
	 * the sender/recipient pair, so guessing "the first account" would give wrong
	 * wait-time guidance whenever the donor picked another one.
	 */
	recipientBankId: string;
	/** Last-4 of the targeted account/handle; disambiguates same-bank accounts. */
	recipientTail: string;
	source: ReportSource;
	/** Fields the donor edited after the screenshot filled them in. */
	editedFields: string[];
	createdAt: string;
	updatedAt: string;
};

const STORAGE_KEY = 'chipin.prototype.reports.v2';
const LEGACY_KEY = 'chipin.prototype.reports.v1';

function createToken(): string {
	const bytes = new Uint8Array(18);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function normalize(
	report: Partial<PrototypeReport> & Pick<PrototypeReport, 'id' | 'campaignSlug'>
): PrototypeReport {
	return {
		id: report.id,
		campaignSlug: report.campaignSlug,
		statusToken: report.statusToken || createToken(),
		pledgeCents: report.pledgeCents ?? 0,
		reportedCents: report.reportedCents ?? 0,
		attestedCents: report.attestedCents ?? null,
		transferDate: report.transferDate ?? '',
		bankReference: report.bankReference ?? '',
		note: report.note ?? '',
		status: report.status ?? 'submitted',
		clarificationQuestion: report.clarificationQuestion ?? '',
		clarificationReply: report.clarificationReply ?? '',
		revoked: report.revoked ?? false,
		senderBankId: report.senderBankId ?? '',
		recipientBankId: report.recipientBankId ?? '',
		recipientTail: report.recipientTail ?? '',
		source: report.source ?? 'manual',
		editedFields: report.editedFields ?? [],
		createdAt: report.createdAt ?? new Date().toISOString(),
		updatedAt: report.updatedAt ?? new Date().toISOString()
	};
}

function saveAll(reports: PrototypeReport[]) {
	writeList(STORAGE_KEY, reports);
}

function loadAll(): PrototypeReport[] {
	const current = readList<PrototypeReport>(STORAGE_KEY);
	if (current.length > 0) return current.map((r) => normalize(r));

	const legacy = readList<PrototypeReport>(LEGACY_KEY);
	if (legacy.length === 0) return [];
	const migrated = legacy.map((r) => normalize(r));
	saveAll(migrated);
	writeList(LEGACY_KEY, []);
	return migrated;
}

export function loadReports(campaignSlug: string): PrototypeReport[] {
	return loadAll()
		.filter((r) => r.campaignSlug === campaignSlug)
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getReportByToken(token: string): PrototypeReport | null {
	if (!token) return null;
	return loadAll().find((r) => r.statusToken === token) ?? null;
}

export function addReport(
	input: Omit<
		PrototypeReport,
		| 'id'
		| 'statusToken'
		| 'status'
		| 'attestedCents'
		| 'clarificationQuestion'
		| 'clarificationReply'
		| 'revoked'
		| 'createdAt'
		| 'updatedAt'
		| 'note'
		| 'senderBankId'
		| 'recipientBankId'
		| 'recipientTail'
		| 'source'
		| 'editedFields'
	> & {
		note?: string;
		senderBankId?: string;
		recipientBankId?: string;
		recipientTail?: string;
		source?: ReportSource;
		editedFields?: string[];
	}
): PrototypeReport {
	const now = new Date().toISOString();
	const report = normalize({
		...input,
		note: input.note ?? '',
		senderBankId: input.senderBankId ?? '',
		recipientBankId: input.recipientBankId ?? '',
		recipientTail: input.recipientTail ?? '',
		source: input.source ?? 'manual',
		editedFields: input.editedFields ?? [],
		id: prototypeId('rpt'),
		statusToken: createToken(),
		status: 'submitted',
		attestedCents: null,
		clarificationQuestion: '',
		clarificationReply: '',
		revoked: false,
		createdAt: now,
		updatedAt: now
	});
	const all = loadAll();
	all.push(report);
	saveAll(all);
	return report;
}

export function updateReport(
	id: string,
	patch: Partial<
		Pick<
			PrototypeReport,
			| 'status'
			| 'attestedCents'
			| 'clarificationQuestion'
			| 'clarificationReply'
			| 'note'
			| 'revoked'
			| 'bankReference'
			| 'reportedCents'
			| 'transferDate'
		>
	>
): PrototypeReport | null {
	const all = loadAll();
	const index = all.findIndex((r) => r.id === id);
	if (index < 0) return null;
	const updated = normalize({
		...all[index],
		...patch,
		updatedAt: new Date().toISOString()
	});
	all[index] = updated;
	saveAll(all);
	return updated;
}

export function replyToClarification(token: string, reply: string): PrototypeReport | null {
	const report = getReportByToken(token);
	if (!report || report.revoked) return null;
	if (report.status !== 'clarification_requested') return null;
	const trimmed = reply.trim();
	if (!trimmed) return null;
	return updateReport(report.id, {
		status: 'submitted',
		clarificationReply: trimmed
	});
}

export function revokeStatusLink(token: string): PrototypeReport | null {
	const report = getReportByToken(token);
	if (!report) return null;
	return updateReport(report.id, { revoked: true });
}

export function statusPath(campaignSlug: string, token: string): string {
	return `/c/${campaignSlug}/status/${token}`;
}

export function formatBsd(cents: number): string {
	return `BSD $${(cents / 100).toLocaleString('en-BS', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	})}`;
}

export function dollarsToCents(value: string): number | null {
	const cleaned = value.replace(/[^0-9.]/g, '');
	if (!cleaned) return null;
	const num = Number(cleaned);
	if (!Number.isFinite(num) || num <= 0) return null;
	return Math.round(num * 100);
}

export function donorStatusLabel(status: ReportStatus): string {
	switch (status) {
		case 'marked_received':
			return 'Marked received by the host';
		case 'marked_not_found':
			return 'Host could not find this transfer';
		case 'clarification_requested':
			return 'Host asked a question';
		case 'partially_matched':
			return 'Partially matched by the host';
		default:
			return 'Reported — waiting on host';
	}
}

export function donorStatusTone(
	status: ReportStatus
): 'received' | 'disputed' | 'paused' | 'pending' {
	switch (status) {
		case 'marked_received':
			return 'received';
		case 'marked_not_found':
			return 'disputed';
		case 'clarification_requested':
			return 'paused';
		default:
			return 'pending';
	}
}

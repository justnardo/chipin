/** Client-only fictional transfer reports for the Stage 0 UI prototype. */

import { prototypeId, readList, writeList } from './storage';

export type ReportStatus =
	| 'submitted'
	| 'clarification_requested'
	| 'marked_received'
	| 'marked_not_found'
	| 'partially_matched'
	| 'confirmation_voided';

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

/**
 * How the host decided this money belongs to this report. Recorded per allocation
 * because a host reconciling six weeks later cannot otherwise tell an amount they
 * matched on a bank reference from one they matched by eyeballing a date.
 * `chipin_code` is deliberately absent: the build gate in the README forbids
 * generating ChipIn references until the bank/channel matrix supports them.
 */
export type MatchingMethod = 'bank_reference' | 'amount_date' | 'manual_audit';

/**
 * One host-attested slice of a transfer report — the prototype's stand-in for the
 * `transfer_matches` relation in docs/stage-0/STATE-MACHINES.md.
 *
 * Money does not arrive in tidy one-to-one lumps. A donor promises $200 and sends
 * it as two deposits; a host finds $180 of a reported $200 and never sees the rest.
 * A single `attestedCents` number on the report cannot hold either case, and worse,
 * correcting it overwrites what the host previously told the donor — which is
 * exactly the record ChipIn exists to keep.
 *
 * So allocations are append-only. Nothing here is edited or removed after the fact:
 * a correction voids one row and appends another that points back at it.
 */
export type Allocation = {
	id: string;
	amountCents: number;
	status: 'active' | 'voided';
	method: MatchingMethod;
	/** Optional host note about what they matched against. */
	note: string;
	/** Why the row was voided. Required to void — a silent reversal is not a record. */
	voidReason: string;
	/** The allocation this one replaces, when it came from a correction. */
	correctionOf: string | null;
	createdAt: string;
	voidedAt: string | null;
};

export type PrototypeReport = {
	id: string;
	campaignSlug: string;
	statusToken: string;
	pledgeCents: number;
	reportedCents: number;
	/**
	 * Append-only host attestations. Public progress counts the active rows only;
	 * see `matchedCents`. Never mutate a row in place — use `voidMatch` /
	 * `correctMatch`, which append compensating history.
	 */
	allocations: Allocation[];
	transferDate: string;
	bankReference: string;
	note: string;
	/**
	 * How the host can reach the donor if a transfer needs sorting out. Optional,
	 * and shown to the host only. The field existed on the report form long
	 * before this, bound to an input and then dropped on submit — someone typed
	 * their phone number believing it had been recorded and it went nowhere.
	 */
	contact: string;
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

const STORAGE_KEY = 'chipin.prototype.reports.v3';
/** Pre-ledger shapes, read once and migrated forward. */
const LEGACY_KEYS = ['chipin.prototype.reports.v2', 'chipin.prototype.reports.v1'];

/** How a report looked before allocations existed. */
type LegacyReport = Partial<PrototypeReport> &
	Pick<PrototypeReport, 'id' | 'campaignSlug'> & { attestedCents?: number | null };

function createToken(): string {
	const bytes = new Uint8Array(18);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function normalizeAllocation(raw: Partial<Allocation>): Allocation {
	const now = new Date().toISOString();
	return {
		id: raw.id ?? prototypeId('alc'),
		amountCents: raw.amountCents ?? 0,
		status: raw.status === 'voided' ? 'voided' : 'active',
		method: raw.method ?? 'manual_audit',
		note: raw.note ?? '',
		voidReason: raw.voidReason ?? '',
		correctionOf: raw.correctionOf ?? null,
		createdAt: raw.createdAt ?? now,
		voidedAt: raw.voidedAt ?? null
	};
}

/**
 * Reports saved before this build carried a single `attestedCents`. Turn it into
 * the one allocation it always meant, so a demo already in progress keeps its
 * totals instead of silently dropping back to zero received.
 */
function migrateAttestedCents(raw: LegacyReport): Allocation[] {
	if (Array.isArray(raw.allocations) && raw.allocations.length > 0) {
		return raw.allocations.map((a) => normalizeAllocation(a));
	}
	const attested = raw.attestedCents ?? null;
	if (attested === null || attested <= 0) return [];
	return [
		normalizeAllocation({
			amountCents: attested,
			method: 'manual_audit',
			note: 'Recorded before ChipIn kept an allocation ledger.',
			createdAt: raw.updatedAt ?? raw.createdAt
		})
	];
}

function normalize(report: LegacyReport): PrototypeReport {
	const allocations = migrateAttestedCents(report);
	const base: PrototypeReport = {
		id: report.id,
		campaignSlug: report.campaignSlug,
		statusToken: report.statusToken || createToken(),
		pledgeCents: report.pledgeCents ?? 0,
		reportedCents: report.reportedCents ?? 0,
		allocations,
		transferDate: report.transferDate ?? '',
		bankReference: report.bankReference ?? '',
		note: report.note ?? '',
		contact: report.contact ?? '',
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
	return { ...base, status: projectStatus(base) };
}

/**
 * Attested status is a projection of the ledger, never a field the UI sets by hand.
 * Keeping it derived is what stops the displayed status and the amounts underneath
 * it from drifting apart — the failure that makes an audit trail worthless.
 */
function projectStatus(report: PrototypeReport): ReportStatus {
	const matched = matchedCents(report);
	if (matched > 0) {
		return matched >= report.reportedCents ? 'marked_received' : 'partially_matched';
	}
	// Nothing active. Anything the host has since declared outright wins — an open
	// question or an explicit "not found" is newer news than a withdrawn amount.
	const declared = report.status;
	if (declared === 'clarification_requested' || declared === 'marked_not_found') return declared;
	// Otherwise a report that once had allocations has had its confirmation withdrawn.
	if (report.allocations.length > 0) return 'confirmation_voided';
	return 'submitted';
}

function saveAll(reports: PrototypeReport[]) {
	writeList(STORAGE_KEY, reports);
}

function loadAll(): PrototypeReport[] {
	const current = readList<LegacyReport>(STORAGE_KEY);
	if (current.length > 0) return current.map((r) => normalize(r));

	for (const key of LEGACY_KEYS) {
		const legacy = readList<LegacyReport>(key);
		if (legacy.length === 0) continue;
		const migrated = legacy.map((r) => normalize(r));
		saveAll(migrated);
		writeList(key, []);
		return migrated;
	}
	return [];
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
		| 'allocations'
		| 'clarificationQuestion'
		| 'clarificationReply'
		| 'revoked'
		| 'createdAt'
		| 'updatedAt'
		| 'note'
		| 'contact'
		| 'senderBankId'
		| 'recipientBankId'
		| 'recipientTail'
		| 'source'
		| 'editedFields'
	> & {
		note?: string;
		contact?: string;
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
		contact: input.contact ?? '',
		senderBankId: input.senderBankId ?? '',
		recipientBankId: input.recipientBankId ?? '',
		recipientTail: input.recipientTail ?? '',
		source: input.source ?? 'manual',
		editedFields: input.editedFields ?? [],
		id: prototypeId('rpt'),
		statusToken: createToken(),
		status: 'submitted',
		allocations: [],
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

/**
 * Write a report through a transform, re-projecting status from the ledger.
 * Every mutation funnels through here so no caller can leave a status behind that
 * its allocations do not support.
 */
function mutate(
	id: string,
	change: (report: PrototypeReport) => PrototypeReport | null
): PrototypeReport | null {
	const all = loadAll();
	const index = all.findIndex((r) => r.id === id);
	if (index < 0) return null;
	const changed = change(all[index]);
	if (!changed) return null;
	const updated: PrototypeReport = {
		...changed,
		status: projectStatus(changed),
		updatedAt: new Date().toISOString()
	};
	all[index] = updated;
	saveAll(all);
	return updated;
}

export function updateReport(
	id: string,
	patch: Partial<
		Pick<
			PrototypeReport,
			| 'status'
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
	return mutate(id, (report) => ({ ...report, ...patch }));
}

/** Sum of the allocations that currently count — the only number public totals use. */
export function matchedCents(report: PrototypeReport): number {
	return report.allocations
		.filter((a) => a.status === 'active')
		.reduce((sum, a) => sum + a.amountCents, 0);
}

/** What the donor says they sent that the host has not accounted for yet. */
export function unmatchedCents(report: PrototypeReport): number {
	return Math.max(0, report.reportedCents - matchedCents(report));
}

/**
 * Host recorded more than the donor reported. Not an error to block — the donor may
 * have mistyped, or two transfers may have landed against one report — but the host
 * should see it rather than wonder why progress jumped.
 */
export function overMatchedCents(report: PrototypeReport): number {
	return Math.max(0, matchedCents(report) - report.reportedCents);
}

/** Public progress for a campaign: active allocations across all its reports. */
export function campaignAttestedCents(reports: PrototypeReport[]): number {
	return reports.reduce((sum, report) => sum + matchedCents(report), 0);
}

/** Ledger rows in the order they happened, oldest first. */
export function ledger(report: PrototypeReport): Allocation[] {
	return [...report.allocations].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function activeAllocations(report: PrototypeReport): Allocation[] {
	return ledger(report).filter((a) => a.status === 'active');
}

/** Record money the host actually found. Appends; never replaces an earlier row. */
export function recordMatch(
	id: string,
	input: { amountCents: number; method: MatchingMethod; note?: string; correctionOf?: string }
): PrototypeReport | null {
	if (!Number.isFinite(input.amountCents) || input.amountCents <= 0) return null;
	return mutate(id, (report) => ({
		...report,
		allocations: [
			...report.allocations,
			normalizeAllocation({
				amountCents: Math.round(input.amountCents),
				method: input.method,
				note: input.note?.trim() ?? '',
				correctionOf: input.correctionOf ?? null
			})
		]
	}));
}

/**
 * Withdraw an amount from ChipIn's record. This changes what ChipIn displays and
 * nothing else — the bank transfer it described, if it happened, already happened.
 * A reason is required: the donor was told this money arrived, and gets told it no
 * longer counts.
 */
export function voidMatch(
	id: string,
	allocationId: string,
	reason: string
): PrototypeReport | null {
	const trimmed = reason.trim();
	if (!trimmed) return null;
	return mutate(id, (report) => {
		const target = report.allocations.find((a) => a.id === allocationId);
		if (!target || target.status === 'voided') return null;
		return {
			...report,
			allocations: report.allocations.map((a) =>
				a.id === allocationId
					? { ...a, status: 'voided', voidReason: trimmed, voidedAt: new Date().toISOString() }
					: a
			)
		};
	});
}

/**
 * Fix an amount that was recorded wrong: void the old row, append a new one linked
 * back to it. Two events, not an edit, so the donor can still see what they were
 * originally told and why it changed.
 */
export function correctMatch(
	id: string,
	allocationId: string,
	input: { amountCents: number; reason: string; method?: MatchingMethod }
): PrototypeReport | null {
	if (!Number.isFinite(input.amountCents) || input.amountCents <= 0) return null;
	const reason = input.reason.trim();
	if (!reason) return null;

	const before = loadAll().find((r) => r.id === id);
	const target = before?.allocations.find((a) => a.id === allocationId);
	if (!target || target.status === 'voided') return null;

	if (!voidMatch(id, allocationId, reason)) return null;
	return recordMatch(id, {
		amountCents: input.amountCents,
		method: input.method ?? target.method,
		note: `Correction of an earlier ${formatBsd(target.amountCents)} entry: ${reason}`,
		correctionOf: allocationId
	});
}

/**
 * Host could not find the transfer. Refused while amounts are still counted for it:
 * "not found" beside money on the public total is a contradiction, so the host has
 * to void those rows — with a reason — first.
 */
export function markNotFound(id: string): PrototypeReport | null {
	return mutate(id, (report) =>
		matchedCents(report) > 0 ? null : { ...report, status: 'marked_not_found' }
	);
}

export function requestClarification(id: string, question: string): PrototypeReport | null {
	const trimmed = question.trim();
	if (!trimmed) return null;
	return mutate(id, (report) => ({
		...report,
		status: 'clarification_requested',
		clarificationQuestion: trimmed
	}));
}

/** Everything a host can do to a report, as one value the attestation row emits. */
export type HostAction =
	| { kind: 'record'; amountCents: number; method: MatchingMethod }
	| { kind: 'void'; allocationId: string; reason: string }
	| {
			kind: 'correct';
			allocationId: string;
			amountCents: number;
			reason: string;
			method: MatchingMethod;
	  }
	| { kind: 'not_found' }
	| { kind: 'clarify'; question: string };

/** Returns null when the command was refused — the caller shows why, nothing is written. */
export function applyHostAction(id: string, action: HostAction): PrototypeReport | null {
	switch (action.kind) {
		case 'record':
			return recordMatch(id, action);
		case 'void':
			return voidMatch(id, action.allocationId, action.reason);
		case 'correct':
			return correctMatch(id, action.allocationId, action);
		case 'not_found':
			return markNotFound(id);
		case 'clarify':
			return requestClarification(id, action.question);
	}
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

/**
 * Dates for people. Raw ISO strings were being shown to end users in four
 * places, including as a 20px bold headline value on the donor status page —
 * nobody reads a date as "2026-08-01".
 */
export function formatDay(iso: string): string {
	if (!iso) return '';
	const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
	if (Number.isNaN(d.getTime())) return iso;
	return new Intl.DateTimeFormat('en-BS', {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	}).format(d);
}

export function matchingMethodLabel(method: MatchingMethod): string {
	switch (method) {
		case 'bank_reference':
			return 'Matched on bank reference';
		case 'amount_date':
			return 'Matched on amount and date';
		default:
			return 'Matched by manual check';
	}
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
		case 'confirmation_voided':
			return 'Host withdrew an earlier confirmation';
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
		case 'confirmation_voided':
			return 'disputed';
		case 'clarification_requested':
		case 'partially_matched':
			return 'paused';
		default:
			return 'pending';
	}
}

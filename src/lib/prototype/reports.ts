/** Client-only fictional transfer reports for the Stage 0 UI prototype. */

export type ReportStatus =
	| 'submitted'
	| 'clarification_requested'
	| 'marked_received'
	| 'marked_not_found'
	| 'partially_matched';

export type PrototypeReport = {
	id: string;
	campaignSlug: string;
	pledgeCents: number;
	reportedCents: number;
	attestedCents: number | null;
	transferDate: string;
	bankReference: string;
	note: string;
	status: ReportStatus;
	clarificationQuestion: string;
	createdAt: string;
	updatedAt: string;
};

const STORAGE_KEY = 'chipin.prototype.reports.v1';

function canUseStorage(): boolean {
	return typeof sessionStorage !== 'undefined';
}

export function loadReports(campaignSlug: string): PrototypeReport[] {
	if (!canUseStorage()) return [];
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const all = JSON.parse(raw) as PrototypeReport[];
		return all
			.filter((r) => r.campaignSlug === campaignSlug)
			.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	} catch {
		return [];
	}
}

function saveAll(reports: PrototypeReport[]) {
	if (!canUseStorage()) return;
	sessionStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

function loadAll(): PrototypeReport[] {
	if (!canUseStorage()) return [];
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as PrototypeReport[]) : [];
	} catch {
		return [];
	}
}

export function addReport(
	input: Omit<
		PrototypeReport,
		'id' | 'status' | 'attestedCents' | 'clarificationQuestion' | 'createdAt' | 'updatedAt' | 'note'
	> & { note?: string }
): PrototypeReport {
	const now = new Date().toISOString();
	const report: PrototypeReport = {
		...input,
		note: input.note ?? '',
		id: `rpt_${Math.random().toString(36).slice(2, 10)}`,
		status: 'submitted',
		attestedCents: null,
		clarificationQuestion: '',
		createdAt: now,
		updatedAt: now
	};
	const all = loadAll();
	all.push(report);
	saveAll(all);
	return report;
}

export function updateReport(
	id: string,
	patch: Partial<Pick<PrototypeReport, 'status' | 'attestedCents' | 'clarificationQuestion' | 'note'>>
): PrototypeReport | null {
	const all = loadAll();
	const index = all.findIndex((r) => r.id === id);
	if (index < 0) return null;
	const updated: PrototypeReport = {
		...all[index],
		...patch,
		updatedAt: new Date().toISOString()
	};
	all[index] = updated;
	saveAll(all);
	return updated;
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

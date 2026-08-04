export function calculateProgress(received: number, goal: number): number {
	if (!Number.isFinite(received) || !Number.isFinite(goal) || goal <= 0) return 0;

	return Math.min(100, Math.max(0, (received / goal) * 100));
}

export function formatAttestedProgress(received: number, goal: number, currency = 'BSD'): string {
	const formatter = new Intl.NumberFormat('en-BS', {
		style: 'currency',
		currency,
		maximumFractionDigits: 0
	});

	return `${formatter.format(received)} marked received by the campaign host of ${formatter.format(goal)} goal`;
}

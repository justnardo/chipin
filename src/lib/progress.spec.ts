import { describe, expect, it } from 'vitest';
import { calculateProgress, formatAttestedProgress } from './progress';

describe('calculateProgress', () => {
	it('calculates progress without exceeding the visual bounds', () => {
		expect(calculateProgress(25, 100)).toBe(25);
		expect(calculateProgress(125, 100)).toBe(100);
		expect(calculateProgress(-10, 100)).toBe(0);
	});

	it('returns zero for an invalid goal', () => {
		expect(calculateProgress(10, 0)).toBe(0);
	});
});

describe('formatAttestedProgress', () => {
	it('uses the required host-attestation language', () => {
		expect(formatAttestedProgress(5240, 8000)).toContain('marked received by the campaign host');
	});
});

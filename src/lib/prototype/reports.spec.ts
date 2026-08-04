import { describe, expect, it } from 'vitest';
import { dollarsToCents, donorStatusLabel, statusPath } from './reports';

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
	});
});

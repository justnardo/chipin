import { beforeEach, describe, expect, it } from 'vitest';
import { addUpdate, formatUpdateDate, loadUpdates } from './updates';

const slug = 'test-campaign';

describe('prototype organizer updates', () => {
	beforeEach(() => localStorage.clear());

	it('adds and loads updates for the campaign', () => {
		const first = addUpdate({ campaignSlug: slug, title: 'Launched', body: 'We are live.' });
		const second = addUpdate({ campaignSlug: slug, title: 'Week one', body: 'Chairs ordered.' });
		const list = loadUpdates(slug);
		expect(list.map((u) => u.id).sort()).toEqual([first.id, second.id].sort());
	});

	it('scopes updates to the campaign slug', () => {
		addUpdate({ campaignSlug: slug, title: 'Mine', body: 'Only for this campaign.' });
		expect(loadUpdates('other-campaign')).toEqual([]);
	});

	it('formats an ISO date into a readable label', () => {
		expect(formatUpdateDate('2026-07-30T14:00:00.000Z')).toMatch(/July|30/);
	});
});

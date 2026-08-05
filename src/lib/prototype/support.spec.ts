import { beforeEach, describe, expect, it } from 'vitest';
import { addHostReply, addSupport, loadSupport } from './support';

const slug = 'test-campaign';

function clearSession() {
	localStorage.clear();
}

describe('prototype support wall', () => {
	beforeEach(clearSession);

	it('adds a support message and loads it for the campaign', () => {
		addSupport({ campaignSlug: slug, name: 'Nadia', message: 'You have my vote.' });
		const list = loadSupport(slug);
		expect(list).toHaveLength(1);
		expect(list[0].name).toBe('Nadia');
		expect(list[0].replies).toEqual([]);
	});

	it('falls back to Anonymous when name is blank', () => {
		addSupport({ campaignSlug: slug, name: '  ', message: 'Rooting for you all.' });
		expect(loadSupport(slug)[0].name).toBe('Anonymous');
	});

	it('adds a host reply to an existing message', () => {
		const entry = addSupport({ campaignSlug: slug, name: 'Omar', message: 'Keep going strong.' });
		const updated = addHostReply(entry.id, 'Thank you so much!');
		expect(updated?.replies).toHaveLength(1);
		expect(loadSupport(slug)[0].replies[0].message).toBe('Thank you so much!');
	});

	it('returns null when replying to an unknown message', () => {
		expect(addHostReply('missing', 'hello')).toBeNull();
	});
});

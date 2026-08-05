import { beforeEach, describe, expect, it } from 'vitest';
import {
	getCampaign,
	listSessionCampaigns,
	RAINBOW_CAMPAIGN,
	saveCampaign,
	usableAccounts
} from './campaigns';

const STORAGE_KEY = 'chipin.prototype.campaigns.v1';

const BASE = {
	title: 'Test campaign for storage checks',
	hostName: 'Test Host',
	location: 'Nassau',
	category: 'Community' as const,
	story: 'A story long enough for the prototype.',
	goalCents: 50_000,
	coverImage: 'cover.jpg',
	coverAlt: 'cover'
};

describe('campaign receiving accounts', () => {
	beforeEach(() => localStorage.clear());

	it('saves and reloads a campaign with several accounts', () => {
		const saved = saveCampaign({
			...BASE,
			receivingAccounts: [
				{ bankId: 'bob', accountName: 'Host', accountNumber: '000123456', branch: '', handle: '' },
				{ bankId: 'kanoo', accountName: 'Host', accountNumber: '', branch: '', handle: 'host-242' }
			]
		});
		const loaded = getCampaign(saved.slug);
		expect(loaded?.receivingAccounts).toHaveLength(2);
		expect(loaded?.receivingAccounts[1].handle).toBe('host-242');
	});

	it('migrates a legacy single `receiving` object into the list', () => {
		// Written by builds before receivingAccounts existed.
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify([
				{
					...BASE,
					slug: 'legacy-campaign',
					createdAt: '2026-08-01T00:00:00.000Z',
					source: 'session',
					receiving: {
						bankId: 'scotia',
						accountName: 'Legacy Host',
						accountNumber: '111222333',
						branch: '',
						handle: ''
					}
				}
			])
		);
		const loaded = getCampaign('legacy-campaign');
		expect(loaded?.receivingAccounts).toHaveLength(1);
		expect(loaded?.receivingAccounts[0].bankId).toBe('scotia');
	});

	it('gives a campaign stored with no receiving details an empty list, not a crash', () => {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify([
				{ ...BASE, slug: 'bare-campaign', createdAt: '2026-08-01T00:00:00.000Z', source: 'session' }
			])
		);
		expect(getCampaign('bare-campaign')?.receivingAccounts).toEqual([]);
		expect(listSessionCampaigns()).toHaveLength(1);
	});

	it('counts only accounts with somewhere to send money as usable', () => {
		const saved = saveCampaign({
			...BASE,
			receivingAccounts: [
				{ bankId: 'bob', accountName: 'Host', accountNumber: '000123456', branch: '', handle: '' },
				{ bankId: 'rbc', accountName: 'Host', accountNumber: '', branch: '', handle: '' }
			]
		});
		expect(usableAccounts(saved)).toHaveLength(1);
	});

	it('keeps the rainbow demo exercising the account picker', () => {
		// The flagship demo must keep >1 usable account or the donor-side picker
		// silently stops being demonstrated anywhere.
		expect(usableAccounts(RAINBOW_CAMPAIGN).length).toBeGreaterThan(1);
	});
});

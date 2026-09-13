import { beforeEach, describe, expect, it } from 'vitest';
import { formatAttestedProgress } from '../progress';
import {
	accountTail,
	catalogueCards,
	getCampaign,
	listSessionCampaigns,
	PROTOTYPE_CATALOGUE,
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

	it('derives a disambiguating tail from account number or handle', () => {
		expect(
			accountTail({
				bankId: 'bob',
				accountName: 'x',
				accountNumber: '0000 1234 5678',
				branch: '',
				handle: ''
			})
		).toBe('5678');
		expect(
			accountTail({
				bankId: 'kanoo',
				accountName: 'x',
				accountNumber: '',
				branch: '',
				handle: '242-555-0142'
			})
		).toBe('0142');
		expect(
			accountTail({ bankId: 'other', accountName: 'x', accountNumber: '', branch: '', handle: '' })
		).toBe('');
	});

	it('keeps the rainbow demo exercising the account picker', () => {
		// The flagship demo must keep >1 usable account or the donor-side picker
		// silently stops being demonstrated anywhere.
		expect(usableAccounts(RAINBOW_CAMPAIGN).length).toBeGreaterThan(1);
	});
});

describe('catalogue money units', () => {
	// The home grid was once handed `attestedCents`/`goalCents` directly and
	// printed every figure a hundred times too large — Rainbow read "$524,000
	// marked received ... of $800,000 goal" while discover read "$5,240 ...
	// $8,000". `catalogueCards` is now the one place where cents become the currency
	// units the formatters expect, so this guards the boundary rather than the
	// call site.
	it('converts cents to currency units exactly once for every card', () => {
		const cards = catalogueCards();
		expect(cards).toHaveLength(PROTOTYPE_CATALOGUE.length);

		for (const card of cards) {
			expect(card.received * 100).toBe(card.attestedCents);
			expect(card.goal * 100).toBe(card.goalCents);
		}
	});

	it('renders Rainbow at $5,240 of $8,000, not a hundred times that', () => {
		const rainbow = catalogueCards().find((card) => card.slug === 'rainbow');
		if (!rainbow) throw new Error('Rainbow is missing from the prototype catalogue');

		const line = formatAttestedProgress(rainbow.received, rainbow.goal);
		expect(line).toContain('5,240 marked received by the campaign host of');
		expect(line).toContain('8,000 goal');
		expect(line).not.toContain('524,000');
		expect(line).not.toContain('800,000');
	});
});

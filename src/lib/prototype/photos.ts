import { base } from '$app/paths';

/**
 * The prototype's stand-in imagery, served from ChipIn's own origin.
 *
 * These were six Unsplash URLs hotlinked straight from the visitor's browser.
 * That handed images.unsplash.com the IP and user agent of every person who
 * opened a campaign page, plus — through the referrer — which campaign they
 * were reading. It is the same leak the OCR engine was pulled in-origin to
 * avoid, and it undercut that decision on the pages that matter most.
 *
 * The files are generated illustrations, not photographs, written by
 * `npm run make:photos`. The footer has always said the final imagery will be
 * locally commissioned; until it is, an obvious illustration is a more honest
 * placeholder for a fictional campaign than a real photograph of real people
 * who never agreed to appear on a fundraiser.
 *
 * The alt text says "Illustration of" on purpose. A donor deciding whether a
 * campaign is real should not be told, by a screen reader, that they are
 * looking at a photograph of the thing being raised for.
 */
export const PROTOTYPE_PHOTOS = {
	friends: 'Illustration of friends gathered together outdoors',
	reading: 'Illustration of a child reading a book',
	food: 'Illustration of volunteers packing boxes of food',
	table: 'Illustration of neighbours working together at a community table',
	gathering: 'Illustration of community volunteers standing together',
	children: 'Illustration of children standing together'
} as const;

export type PrototypePhotoId = keyof typeof PROTOTYPE_PHOTOS;

/**
 * Two aspects per scene. `object-fit: cover` crops rather than fits, and the
 * campaign cover is a 1600x760 band — cropping the square into it leaves a
 * strip of floating heads with the bodies gone. Ask for 'wide' there.
 *
 * Same `${base}/…` shape as the bank marks, so a subpath deploy still resolves.
 */
export function photoSrc(id: PrototypePhotoId, aspect: 'square' | 'wide' = 'square'): string {
	return `${base}/photos/${id}${aspect === 'wide' ? '-wide' : ''}.svg`;
}

export function photoAlt(id: PrototypePhotoId): string {
	return PROTOTYPE_PHOTOS[id];
}

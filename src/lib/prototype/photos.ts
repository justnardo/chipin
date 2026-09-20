import { base } from '$app/paths';

/**
 * The prototype's photography, served from ChipIn's own origin.
 *
 * These were six Unsplash URLs hotlinked straight from the visitor's browser.
 * That handed images.unsplash.com the IP and user agent of every person who
 * opened a campaign page, plus — through the referrer — which campaign they
 * were reading. It is the same leak the OCR engine was pulled in-origin to
 * avoid, and it undercut that decision on the pages that matter most. Every
 * byte below comes from this origin.
 *
 * The scenes used to be generated illustrations, on the reasoning that a real
 * photograph of real people on an invented fundraiser is a picture doing work
 * it was never licensed or consented to do. That decision was re-made
 * deliberately: the prototype now ships real photographs, and the honest
 * placeholder problem is discharged by disclosure rather than by abstraction.
 * `PROTOTYPE_PHOTO_DISCLOSURE` has to be visible on any page that shows one —
 * see the site footer and the campaign prototype banner. It is a build gate, not
 * a nicety, and it is what lets the alt text describe the picture plainly.
 *
 * The alt text used to read "Illustration of …". It no longer does, because
 * that prefix only worked while the picture was self-evidently not a
 * photograph. A screen reader must not be told that a picture of children
 * outside a preschool is evidence of the fundraiser beside it; the disclosure
 * is what prevents that now, so it must never be buried below the fold or
 * hidden behind a summary.
 */
export const PROTOTYPE_PHOTOS = {
	friends: 'Friends raising glasses over a shared meal',
	reading: 'Teachers and young children together outside a preschool',
	gathering: 'A crowd gathered under string lights in the evening',
	food: 'Bread and tinned goods beside a donation box on a table',
	table: 'Neighbours sharing a long meal at an outdoor table',
	kitchen: 'A family cooking together in a home kitchen',
	plates: 'Plates of food shared across a table, seen from above',
	produce: 'Crates of fresh vegetables stacked at a market stall'
} as const;

export type PrototypePhotoId = keyof typeof PROTOTYPE_PHOTOS;

/**
 * Rendered wherever a photograph is. Plain, unlinked, and not behind a tap.
 *
 * The mockup's footer attribution named a specific source for the one scene
 * that was a real photograph of real children. That provenance arrived inside
 * the mockup, nobody here has verified it, and it is therefore not carried into
 * the text below.
 *
 * Dropping it was not enough on its own. The first replacement denied the
 * images were of "the community it serves", which is the same species of claim
 * inverted — negative provenance is no more knowable than positive provenance.
 * The site makes that concrete: the reading room campaign in `campaigns.ts` is
 * set in Bain Town, New Providence and carries the preschool photograph, so a
 * sentence denying the picture was of that community asserted something we
 * cannot check and that is plausibly false. The named source was not worth
 * keeping either: identifying a real source lends the picture weight as
 * evidence of the campaign beside it, which is the opposite of what this notice
 * is for.
 *
 * So the notice asserts evidentiary status instead of origin, which the
 * campaigns being fictional makes verifiably true: a fictional campaign cannot
 * have photographic evidence, and these images were not commissioned for it.
 * That second clause sets up the sentence after it, where the final imagery is
 * commissioned locally and with consent from ChipIn's origin — both kept word
 * for word. The artwork line that followed the attribution in the mockup stays
 * a separate line in `SiteFooter`, because it credits the illustrated mark, not
 * the photography.
 *
 * The closing sentence is our own: the mockup covered the pictures, not the
 * campaigns, and a reader who gets only the photographic half can still believe
 * the fundraiser beside it is real.
 */
export const PROTOTYPE_PHOTO_DISCLOSURE =
	'Prototype photography: illustrative images, not evidence of this campaign and not commissioned for it. Final imagery will be commissioned locally, with consent, and served from ChipIn’s origin. Prototype campaigns, hosts, and totals are fictional.';

/**
 * Three roles per scene, because `object-fit: cover` crops rather than fits and
 * the slots disagree about shape.
 *
 * - `full`   the supplied 1400px original. Full-bleed and hero slots, and the
 *            only role wide enough for a near-full-viewport hero without
 *            upscaling.
 * - `square` centre crop to the short edge — the 4:3 cards, the 4:5 film frames,
 *            and the small rows.
 * - `wide`   centre crop to the 1400x665 campaign band. Cropping a square into
 *            that band leaves a strip of floating heads with the bodies gone,
 *            so the band gets its own file.
 *
 * Nothing is upscaled anywhere: the sources are 1400px wide, so the band is
 * 1400 wide and the hero is capped below that in CSS.
 */
export type PhotoAspect = 'square' | 'wide' | 'full';

/**
 * Source heights, so `width`/`height` can be truthful and a slot reserves the
 * right box before the bytes land. They differ by a pixel or two because the
 * supplied files do; the square is cut to the short edge, so it is square by
 * construction rather than by rounding.
 */
const SOURCE_HEIGHT: Record<PrototypePhotoId, number> = {
	friends: 935,
	reading: 933,
	gathering: 935,
	food: 934,
	table: 934,
	kitchen: 935,
	plates: 934,
	produce: 1050
};

const SOURCE_WIDTH = 1400;

/**
 * The `wide` role's intrinsic size, exported so markup can declare it instead of
 * guessing. Two pages carried `width="1600" height="760"` from the retired
 * SVG set, which no file has ever been.
 */
export const PHOTO_BAND = { width: SOURCE_WIDTH, height: 665 } as const;

/**
 * Same `${base}/…` shape as the bank marks, so a subpath deploy still resolves.
 */
export function photoSrc(id: PrototypePhotoId, aspect: PhotoAspect = 'square'): string {
	const suffix = aspect === 'full' ? '' : `-${aspect}`;
	return `${base}/photos/${id}${suffix}.jpg`;
}

export function photoAlt(id: PrototypePhotoId): string {
	return PROTOTYPE_PHOTOS[id];
}

/** Intrinsic size of a role, for markup that must not shift while loading. */
export function photoSize(
	id: PrototypePhotoId,
	aspect: PhotoAspect = 'square'
): { width: number; height: number } {
	if (aspect === 'wide') return { ...PHOTO_BAND };
	if (aspect === 'full') return { width: SOURCE_WIDTH, height: SOURCE_HEIGHT[id] };
	return { width: SOURCE_HEIGHT[id], height: SOURCE_HEIGHT[id] };
}

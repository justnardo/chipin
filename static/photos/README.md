# Prototype photography

Every image the prototype shows is served from here, from ChipIn's own origin.
Nothing on any page loads a picture from a third party.

That is deliberate and it is the same reasoning as `static/ocr/`. These files
used to be six Unsplash URLs hotlinked straight from the visitor's browser,
which handed `images.unsplash.com` the IP and user agent of everyone who opened
a campaign page, and — through the referrer — which campaign they were reading.
A donor looking at a fundraiser is telling you something about themselves; there
is no reason to tell a CDN as well.

## These are photographs, and what that costs us

They started as generated illustrations. The argument for that was: a real
photograph of real people sitting on an invented fundraiser asking for bank
transfers is a picture doing work it was never licensed, or consented, to do.

That trade was re-made deliberately, and the cost is paid in disclosure rather
than in abstraction. `PROTOTYPE_PHOTO_DISCLOSURE` in
`src/lib/prototype/photos.ts` must be visible on any page that shows one of
these files — the footer carries it, and campaign pages carry it above the fold.
It cannot be collapsed, hidden behind a `details` element, or pushed below the
fold.

That disclosure is why the alt text no longer begins "Illustration of". The
prefix existed so a screen reader would not tell a donor they were looking at a
photograph of the thing being raised for. With the prefix gone, the disclosure
is the only thing preventing that reading, which is why it is a build gate in
the root README rather than a nicety.

Attribution, as it appears in the footer:

> Prototype photography: Nassau preschool children via Wikimedia Commons; other
> scenes are illustrative. Final imagery will be commissioned locally, with
> consent, and served from ChipIn's origin. Artwork © Traceline Bahamas Ltd.

## The scenes

| id          | Source file | Scene                                                     |
| ----------- | ----------- | --------------------------------------------------------- |
| `friends`   | `img0`      | Friends raising glasses over a shared meal                 |
| `reading`   | `img1`      | Teachers and young children together outside a preschool   |
| `gathering` | `img2`      | A crowd gathered under string lights in the evening        |
| `food`      | `img3`      | Bread and tinned goods beside a donation box on a table    |
| `table`     | `img4`      | Neighbours sharing a long meal at an outdoor table         |
| `kitchen`   | `img6`      | A family cooking together in a home kitchen                |
| `plates`    | `img9`      | Plates of food shared across a table, seen from above      |
| `produce`   | `img12`     | Crates of fresh vegetables stacked at a market stall       |

A ninth id, `children`, was retired. Its only real use was the home hero
collage, which the full-bleed hero replaced.

## Three roles per scene

`object-fit: cover` crops rather than fits, and the slots disagree about shape,
so each scene ships three files:

| Role              | Size                          | Used for                                |
| ----------------- | ----------------------------- | --------------------------------------- |
| `<id>.jpg`        | the original, 1400 wide       | full-bleed hero, band fallback          |
| `<id>-square.jpg` | 935x935 (1050 for `produce`)  | 4:3 cards, 4:5 film frames, small rows  |
| `<id>-wide.jpg`   | 1400x665                      | campaign cover bands                    |

Ask for them with `photoSrc(id, 'full' | 'square' | 'wide')`; the default is
`'square'`. `photoSize(id, aspect)` returns the intrinsic size for `width` and
`height` attributes, so a slot reserves the right box before the bytes land.

Nothing is upscaled anywhere. The sources are 1400px wide, which is why the
hero caps its height instead of running the full viewport: at 1440px a
full-height hero is already a 1.4x upscale and reads soft.

## How to swap or add a scene

1. Put the original at `static/photos/<id>.jpg`. Do not upscale it; a source
   wider than 1400 is welcome, a narrower one will show.
2. Centre-crop two derivatives next to it: `<id>-square.jpg` to the short edge,
   and `<id>-wide.jpg` to 1400x665. Centre crop, never a top-anchored one — a
   top crop is how you behead everyone in the frame. Pillow is enough:
   `Image.open(src).crop(box)`, JPEG, `quality=86`, `optimize=True`,
   `progressive=True`, `subsampling=0`. The outputs are committed; there is no
   generator script in the repo, because a build should never re-frame an image
   a human has already looked at.
3. Add the id, its alt text, and its source height to `PROTOTYPE_PHOTOS` and
   `SOURCE_HEIGHT` in `src/lib/prototype/photos.ts`.
4. Add it to `COVER_PRESETS` in `src/lib/prototype/campaigns.ts` if a host
   should be able to pick it as a campaign cover.
5. Look at every slot it lands in — 4:3 card, 4:5 film frame, wide band — and
   set `object-position` per slot if the centre crop cuts a subject. Cropping is
   free to get wrong and expensive to notice, so check the phone width too.

Keep the files here rather than on a CDN. The whole point is that the bytes come
from this origin.

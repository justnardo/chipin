# Prototype imagery drop-in

Every image the prototype shows is served from here, from ChipIn's own origin.
Nothing on any page loads a picture from a third party.

That is deliberate and it is the same reasoning as `static/ocr/`. These files
used to be six Unsplash URLs hotlinked straight from the visitor's browser,
which handed `images.unsplash.com` the IP and user agent of everyone who opened
a campaign page, and — through the referrer — which campaign they were reading.
A donor looking at a fundraiser is telling you something about themselves; there
is no reason to tell a CDN as well.

| Scene       | Used for                                            |
| ----------- | --------------------------------------------------- |
| `friends`   | Rainbow campaign cover, hero collage, cover preset  |
| `reading`   | Reading-room campaign, cover preset                 |
| `food`      | Food-cupboard campaign, cover preset                |
| `table`     | Trust section, cover preset                         |
| `gathering` | How-it-works section                                |
| `children`  | Hero collage                                        |

Each scene ships twice. `<scene>.svg` is square and covers the 4:3 cards and the
900x1100 portrait frames; `<scene>-wide.svg` is 1600x760 for the campaign band.
Both exist because every slot uses `object-fit: cover`, which crops rather than
fits — cropping the square into the band leaves a strip of floating heads with
the bodies gone. Ask for the band with `photoSrc(id, 'wide')`.

The ids and alt text live in `src/lib/prototype/photos.ts`; the art is written
by `npm run make:photos` (`scripts/make_prototype_photos.mjs`). Output is
committed, so a normal build never runs the generator.

## Replacing these with real photography

These are illustrations, not photographs, and the alt text says so. That is the
right placeholder for a fictional campaign: a real photograph of real people
sitting on an invented fundraiser asking for bank transfers is a picture doing
work it was never licensed — or consented — to do.

To swap in the commissioned photography, drop files at the same paths with the
same ids (`friends.jpg` and `friends-wide.jpg`, and so on), update the extension
and alt text in `photos.ts`, and delete the generator. Keep them here rather than
on a CDN; the whole point is that the bytes come from this origin. Deliver each
scene twice — one near-square crop and one 1600x760 band — rather than letting
the browser crop one file into both.

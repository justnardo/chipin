/**
 * Generates the prototype's stand-in photography into `static/photos/`.
 *
 * The prototype used to hotlink six Unsplash photos straight from the
 * visitor's browser. That is the same leak the OCR engine was pulled
 * in-origin to avoid: every person who opens a campaign page hands
 * images.unsplash.com their IP, their user agent, and — through the referrer —
 * which campaign they were reading. Self-hosting the bytes is the whole fix.
 *
 * Real photographs cannot be committed here, and the footer has always said
 * the final imagery will be locally commissioned. So these are honest
 * placeholders in the brand palette rather than stock photos: enough shape and
 * warmth that a card reads as a card, obviously not a real photograph of a
 * real Bahamian family. They swap out file-for-file when the commissioned
 * photography lands — same paths, same alt text.
 *
 * Run with `npm run make:photos`. The output is committed, so a normal build
 * never needs this.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../static/photos');

const INK = '#0c1b1a';
const PAPER = '#fbf7ee';

/**
 * Each scene gets its own palette so a row of three cards does not read as one
 * repeated tile, and its own figure arrangement so the alt text is not lying
 * about what is in the frame.
 */
const SCENES = [
	{
		id: 'friends',
		sky: ['#f7d98a', '#f2b01e'],
		ground: '#047c76',
		accent: '#14beb2',
		figures: [
			[0.24, 0.62, 1],
			[0.4, 0.56, 1.14],
			[0.58, 0.6, 1.06],
			[0.74, 0.65, 0.92]
		]
	},
	{
		id: 'reading',
		sky: ['#d8f0ed', '#7fd6cf'],
		ground: '#047c76',
		accent: '#f2b01e',
		figures: [[0.5, 0.58, 1.5]],
		book: true
	},
	{
		id: 'food',
		sky: ['#fbeecd', '#f0c995'],
		ground: '#d9971a',
		accent: '#047c76',
		figures: [
			[0.3, 0.6, 1.1],
			[0.7, 0.6, 1.1]
		],
		crates: true
	},
	{
		id: 'table',
		sky: ['#e3f4f2', '#9fdcd6'],
		ground: '#047c76',
		accent: '#f2b01e',
		figures: [
			[0.22, 0.52, 0.95],
			[0.42, 0.49, 0.95],
			[0.6, 0.49, 0.95],
			[0.8, 0.52, 0.95]
		],
		table: true
	},
	{
		id: 'gathering',
		sky: ['#f2b01e', '#d9971a'],
		ground: '#047c76',
		accent: '#fbf7ee',
		figures: [
			[0.18, 0.66, 0.9],
			[0.34, 0.58, 1.12],
			[0.52, 0.62, 1.02],
			[0.68, 0.55, 1.18],
			[0.85, 0.64, 0.94]
		]
	},
	{
		id: 'children',
		sky: ['#7fd6cf', '#047c76'],
		ground: '#f2b01e',
		accent: '#fbf7ee',
		figures: [
			[0.3, 0.68, 0.78],
			[0.5, 0.64, 0.86],
			[0.7, 0.68, 0.78]
		]
	}
];

/*
 * Two aspects per scene, because `object-fit: cover` crops rather than fits and
 * the slots are far apart. The square covers the 4:3 cards and the 900x1100
 * portrait frames — worst case about 1.3x either way. The campaign cover is a
 * 1600x760 band, and cropping a square into that trims two thirds of the height:
 * you get a strip of floating heads with their bodies cut off. So covers get
 * their own file, with the figures composed for the band.
 */
const ASPECTS = {
	square: { w: 1200, h: 1200, suffix: '' },
	wide: { w: 1600, h: 760, suffix: '-wide' }
};

/**
 * A person: head plus a shoulder arc. Deliberately unfaced.
 *
 * Sized off the short edge so a figure keeps its proportions in both aspects
 * instead of stretching into the band.
 */
function figure(cx, baseline, scale, fill, W, H) {
	const unit = Math.min(W, H);
	const x = cx * W;
	const y = baseline * H;
	const r = unit * 0.043 * scale;
	const bodyW = unit * 0.125 * scale;
	const bodyH = unit * 0.192 * scale;
	return `
		<g fill="${fill}">
			<circle cx="${x.toFixed(1)}" cy="${(y - bodyH * 0.72).toFixed(1)}" r="${r.toFixed(1)}" />
			<path d="M ${(x - bodyW / 2).toFixed(1)} ${(y + bodyH * 0.4).toFixed(1)}
			         a ${(bodyW / 2).toFixed(1)} ${(bodyH * 0.62).toFixed(1)} 0 0 1 ${bodyW.toFixed(1)} 0 Z" />
		</g>`;
}

function scene({ id, sky, ground, accent, figures, book, crates, table }, { w: W, h: H, suffix }) {
	const horizon = H * 0.68;
	const people = figures
		.map(([cx, baseline, scale], i) => figure(cx, baseline, scale, i % 2 ? accent : ground, W, H))
		.join('');

	// Props draw over the figures, so an open book reads as held rather than worn.
	const props = [
		table
			? `<rect x="${W * 0.08}" y="${H * 0.585}" width="${W * 0.84}" height="30" rx="15" fill="${accent}" />`
			: '',
		crates
			? [0, 1, 2, 3]
					.map((i) => {
						const col = i % 2;
						const row = i < 2 ? 0 : 1;
						return `<rect x="${W * (0.4 + col * 0.11)}" y="${H * (0.68 - row * 0.11)}" width="${W * 0.095}" height="${H * 0.1}" rx="10" fill="${accent}" />
			<rect x="${W * (0.4 + col * 0.11)}" y="${H * (0.72 - row * 0.11)}" width="${W * 0.095}" height="9" fill="${PAPER}" opacity="0.55" />`;
					})
					.join('')
			: ''
	].join('');

	// An open book: two leaves meeting at a spine, held at chest height.
	const held = book
		? `<g fill="${accent}">
			<path d="M ${W * 0.5} ${H * 0.66} L ${W * 0.33} ${H * 0.615} L ${W * 0.33} ${H * 0.72} L ${W * 0.5} ${H * 0.755} Z" />
			<path d="M ${W * 0.5} ${H * 0.66} L ${W * 0.67} ${H * 0.615} L ${W * 0.67} ${H * 0.72} L ${W * 0.5} ${H * 0.755} Z" />
		</g>
		<path d="M ${W * 0.5} ${H * 0.66} L ${W * 0.5} ${H * 0.755}" stroke="${INK}" stroke-opacity="0.25" stroke-width="4" />`
		: '';

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="presentation">
	<defs>
		<linearGradient id="sky-${id}${suffix}" x1="0" y1="0" x2="0.2" y2="1">
			<stop offset="0" stop-color="${sky[0]}" />
			<stop offset="1" stop-color="${sky[1]}" />
		</linearGradient>
	</defs>
	<rect width="${W}" height="${H}" fill="${PAPER}" />
	<rect width="${W}" height="${H}" fill="url(#sky-${id}${suffix})" />
	<circle cx="${W * 0.78}" cy="${H * 0.22}" r="${H * 0.15}" fill="${PAPER}" opacity="0.35" />
	<path d="M 0 ${horizon} Q ${W * 0.3} ${horizon - 70} ${W * 0.55} ${horizon - 10}
	         T ${W} ${horizon - 40} L ${W} ${H} L 0 ${H} Z" fill="${ground}" opacity="0.18" />
	${props}
	${people}
	${held}
	<path d="M 0 ${H * 0.9} Q ${W * 0.5} ${H * 0.82} ${W} ${H * 0.9} L ${W} ${H} L 0 ${H} Z" fill="${INK}" opacity="0.08" />
</svg>
`;
}

mkdirSync(OUT, { recursive: true });
let written = 0;
for (const s of SCENES) {
	for (const aspect of Object.values(ASPECTS)) {
		writeFileSync(resolve(OUT, `${s.id}${aspect.suffix}.svg`), scene(s, aspect));
		written += 1;
	}
}
console.log(`[photos] wrote ${written} files to static/photos/`);

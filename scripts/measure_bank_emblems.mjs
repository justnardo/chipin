/**
 * Measures where the emblem sits inside each traced bank lockup.
 *
 * The six files in static/banks/ are potrace autotraces of bitmaps: pure black,
 * horizontal or stacked lockups (emblem + wordmark) on a canvas much larger
 * than the ink. Rendered whole in a 32px tile the wordmark lands at a 3.6px cap
 * height — below what a display can resolve, which is why the real logos read
 * worse than the monogram tiles they were meant to replace.
 *
 * The emblem alone is roughly square, so it survives a small tile. This walks
 * every <path>, measures its box, and reports a square mask window around the
 * emblem. BankMark uses that window to crop and knock the emblem out in white.
 *
 * Emblem paths are declared rather than inferred. Horizontal gap-clustering
 * finds them in cibc/rbc/scotia but fails on the stacked lockups (bob and
 * commonwealth stack emblem over wordmark, so there is no horizontal gap) and
 * on fidelity, whose gap is 3.5% of ink width — under any threshold that does
 * not also split wordmarks. Three of six is not a rule, so the indices below
 * were read off the per-path dump and are pinned here. They only change if the
 * artwork does, which is the point.
 *
 * Run with `npm run measure:banks`, then paste the windows into banks.ts.
 *
 * Needs a Chromium build. `npx playwright install chromium` fetches one; where
 * that download is blocked but a build already exists, point at it instead:
 * `CHROMIUM_PATH=/path/to/chrome npm run measure:banks`.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const BANKS = resolve(dirname(fileURLToPath(import.meta.url)), '../static/banks');

/**
 * Path indices forming the emblem, per file, read off a per-path box dump.
 *
 * Explicit lists rather than ranges: potrace emits paths in trace order, which
 * follows neither reading order nor grouping. Scotiabank's S-globe is fourteen
 * non-contiguous paths interleaved with the wordmark's, so any range would take
 * half the wordmark with it.
 */
const EMBLEM_PATHS = {
	// "|●" bar and roundel, left of the BOB letterforms.
	bob: [0, 1, 2, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 16],
	// "CB" ligature, stacked above the COMMONWEALTH BANK caps.
	commonwealth: [0, 1, 2],
	// Circular device, left of the FIDELITY serif wordmark.
	fidelity: [0],
	// Diamond, to the right of the CIBC wordmark.
	cibc: [0],
	// Lion-and-globe shield, left of the two-line Royal Bank wordmark.
	rbc: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
	// S-globe, left of the Scotiabank wordmark.
	scotia: [0, 4, 5, 7, 14, 15, 16, 18, 19, 20, 21, 22, 23, 24]
};

// Honour an existing build rather than hardcoding a path — this script used
// to import Playwright from an absolute /opt path, which only ran on one
// machine. Unset, Playwright resolves its own download as normal.
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();

for (const [id, indices] of Object.entries(EMBLEM_PATHS)) {
	const svg = readFileSync(resolve(BANKS, `${id}.svg`), 'utf8');
	await page.setContent(`<div id="host">${svg}</div>`);

	const { canvas, box } = await page.evaluate((keep) => {
		const s = document.querySelector('#host svg');
		const root = s.getBoundingClientRect();
		const paths = [...s.querySelectorAll('path')];
		const picked = paths
			.map((el, i) => ({ i, r: el.getBoundingClientRect() }))
			.filter(({ i, r }) => r.width > 1 && r.height > 1 && keep.includes(i));
		const x = Math.min(...picked.map((p) => p.r.x - root.x));
		const y = Math.min(...picked.map((p) => p.r.y - root.y));
		const w = Math.max(...picked.map((p) => p.r.x - root.x + p.r.width)) - x;
		const h = Math.max(...picked.map((p) => p.r.y - root.y + p.r.height)) - y;
		return { canvas: { w: root.width, h: root.height }, box: { x, y, w, h } };
	}, indices);

	// A square window keeps the emblem undistorted whatever the tile aspect.
	// 1.12 leaves a little clear space so the mark does not touch the chip edge.
	const side = Math.max(box.w, box.h) * 1.12;
	// Clamp rather than centre when the emblem sits near a canvas edge — RBC's
	// shield is taller than wide and starts 62px in, so a centred square window
	// would run off the left of the canvas and crop the shield.
	const left = Math.max(0, Math.min(box.x + box.w / 2 - side / 2, canvas.w - side));
	const top = Math.max(0, Math.min(box.y + box.h / 2 - side / 2, canvas.h - side));
	const pct = (v, total) => +((v / total) * 100).toFixed(2);

	console.log(
		`${id.padEnd(13)} emblem ${String(Math.round(box.w)).padStart(4)}x${String(Math.round(box.h)).padStart(4)} ` +
			`ar ${(box.w / box.h).toFixed(2)}  →  window: ` +
			`${pct(left, canvas.w)}% ${pct(top, canvas.h)}% ${pct(side, canvas.w)}% ${pct(side, canvas.h)}%`
	);
}

await browser.close();

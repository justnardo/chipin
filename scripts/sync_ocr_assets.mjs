/**
 * Copy the OCR engine into static/ocr so it is served from ChipIn's own origin.
 *
 * tesseract.js defaults to fetching its worker, WASM core, and language model from a
 * public CDN at runtime. That is wrong here for three reasons:
 *
 *   1. It tells a third party that a donor is scanning a bank receipt, right at the
 *      moment they are handling financial data (THREAT-MODEL.md T8).
 *   2. It needs a CSP wide enough to run third-party script, which the security
 *      release checklist does not allow.
 *   3. It breaks the flow entirely whenever that CDN is unreachable.
 *
 * Assets land in static/ocr/ (gitignored) and are refreshed on install, dev, and build,
 * so they always match the installed package versions.
 */

import { copyFile, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'static', 'ocr');

/**
 * tesseract.js probes the browser's WASM capabilities and picks one of these at runtime:
 * relaxed SIMD, plain SIMD, or neither. All three must be present or the flow dies on
 * whichever device happens to prefer the missing one. Only the LSTM builds are needed —
 * the legacy engine is another ~14 MB we never call.
 */
const CORE_FILES = [
	'tesseract-core-relaxedsimd-lstm.wasm',
	'tesseract-core-relaxedsimd-lstm.wasm.js',
	'tesseract-core-simd-lstm.wasm',
	'tesseract-core-simd-lstm.wasm.js',
	'tesseract-core-lstm.wasm',
	'tesseract-core-lstm.wasm.js'
];

async function copyInto(from, to, label) {
	if (!existsSync(from)) {
		throw new Error(`Missing ${label} at ${from}. Run npm install first.`);
	}
	await copyFile(from, to);
	const { size } = await stat(to);
	return size;
}

async function main() {
	await rm(out, { recursive: true, force: true });
	await mkdir(out, { recursive: true });

	let total = 0;

	total += await copyInto(
		join(root, 'node_modules', 'tesseract.js', 'dist', 'worker.min.js'),
		join(out, 'worker.min.js'),
		'tesseract.js worker'
	);

	for (const file of CORE_FILES) {
		total += await copyInto(
			join(root, 'node_modules', 'tesseract.js-core', file),
			join(out, file),
			`tesseract core ${file}`
		);
	}

	// The "best_int" model is roughly a quarter the size of the full one and is accurate
	// enough for the large, high-contrast text on a banking confirmation screen. Mobile
	// data is expensive locally; do not swap this for the full model without a reason.
	total += await copyInto(
		join(root, 'node_modules', '@tesseract.js-data', 'eng', '4.0.0_best_int', 'eng.traineddata.gz'),
		join(out, 'eng.traineddata.gz'),
		'English language model'
	);

	const files = await readdir(out);
	console.log(
		`[ocr] ${files.length} files -> static/ocr (${(total / 1024 / 1024).toFixed(1)} MB on disk, served lazily)`
	);
}

main().catch((error) => {
	console.error(`[ocr] ${error.message}`);
	process.exit(1);
});

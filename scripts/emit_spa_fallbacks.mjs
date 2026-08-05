/**
 * Emit every SPA fallback filename the common static hosts look for.
 *
 * Static hosts disagree about which file catches an unknown path, and getting it
 * wrong only shows up once deployed:
 *
 *   - GitHub Pages serves `404.html`. It has no concept of a catch-all rewrite,
 *     so `200.html` alone means every deep link — /c/<slug>, /c/<slug>/status/<token>,
 *     the entire prototype past the home page — returns a 404 page.
 *   - Netlify, Surge, and friends use `200.html`.
 *
 * Both are the same SvelteKit shell, so shipping both costs one small file and
 * removes a host-specific footgun. adapter-static writes whichever is configured
 * as `fallback`; this copies it to the others.
 *
 * Also writes `.nojekyll`. Pages' Actions-based deploys do not run Jekyll, but a
 * branch-based deploy would, and Jekyll drops directories beginning with an
 * underscore — which would silently delete SvelteKit's entire `_app/` bundle.
 */

import { copyFile, writeFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const buildDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'build');
const FALLBACKS = ['200.html', '404.html', 'index.html'];

async function exists(path) {
	try {
		await access(path);
		return true;
	} catch {
		return false;
	}
}

async function main() {
	const source = (
		await Promise.all(
			FALLBACKS.map(async (name) => ((await exists(join(buildDir, name))) ? name : null))
		)
	).find(Boolean);

	if (!source) {
		throw new Error(`No SPA shell in build/. Looked for: ${FALLBACKS.join(', ')}`);
	}

	const written = [source];
	for (const name of FALLBACKS) {
		if (name === source) continue;
		if (await exists(join(buildDir, name))) continue;
		await copyFile(join(buildDir, source), join(buildDir, name));
		written.push(name);
	}

	await writeFile(join(buildDir, '.nojekyll'), '');
	console.log(`[spa] shell ${source} -> ${written.join(', ')} (+ .nojekyll)`);
}

main().catch((error) => {
	console.error(`[spa] ${error.message}`);
	process.exit(1);
});

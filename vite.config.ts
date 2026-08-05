import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';

/**
 * Read BASE_PATH for subpath hosting, failing loudly on a malformed value.
 * A base without a leading slash produces a build whose asset URLs are all subtly
 * wrong — the kind of breakage that only shows up once it is already deployed.
 */
function resolveBasePath(): '' | `/${string}` {
	const raw = (process.env.BASE_PATH ?? '').trim();
	if (raw === '' || raw === '/') return '';
	if (!raw.startsWith('/')) {
		throw new Error(`BASE_PATH must start with "/" — got ${JSON.stringify(raw)}`);
	}
	// A trailing slash doubles up against every path SvelteKit appends.
	return raw.replace(/\/+$/, '') as `/${string}`;
}

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			/**
			 * Static output, because this prototype has no server side at all — every
			 * campaign, report, and support note lives in the visitor's own browser.
			 * adapter-auto could not detect a target, so `npm run build` produced
			 * nothing deployable and there was no way to open this on a phone.
			 *
			 * `fallback` puts the app in SPA mode so /c/<slug> and /c/<slug>/status/<token>
			 * resolve on the client — those slugs and tokens are created in the browser
			 * and cannot be prerendered.
			 *
			 * Deliberately NOT a host-specific adapter: build/ is a plain folder of files
			 * that works on GitHub Pages, Netlify, Vercel, or any static host, so the
			 * pilot is not tied to one vendor before that decision needs making. Swap for
			 * a server adapter when real routes arrive — the disclosure decision needs
			 * `Cache-Control: private, no-store`, which static hosting cannot provide.
			 */
			adapter: adapter({ fallback: '200.html' }),

			/**
			 * GitHub Pages serves a project site from /<repo>, not from the root. Without
			 * this every absolute path — including the OCR engine at /ocr/* — 404s there.
			 * Empty by default so root-hosted deploys (Netlify, Vercel, a custom domain)
			 * and `npm run dev` are unaffected; the Pages workflow sets BASE_PATH.
			 */
			paths: { base: resolveBasePath() }
		})
	],
	test: {
		expect: { requireAssertions: true },
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});

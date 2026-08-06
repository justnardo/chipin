<script lang="ts">
	import { base } from '$app/paths';
	import { getBank } from '$lib/prototype/banks';
	import { extractReceipt, extractionSummary, type ExtractedReceipt } from '$lib/prototype/receipt';
	import { formatBsd } from '$lib/prototype/reports';

	let {
		onextract
	}: {
		onextract: (receipt: ExtractedReceipt) => void;
	} = $props();

	type Phase = 'idle' | 'reading' | 'done' | 'error';

	let phase = $state<Phase>('idle');
	let progress = $state(0);
	let receipt = $state<ExtractedReceipt | null>(null);
	let errorMessage = $state('');
	let showLines = $state(false);

	const MAX_BYTES = 8 * 1024 * 1024;
	const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp'];

	const summary = $derived(receipt ? extractionSummary(receipt) : null);

	async function handleFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		if (!ACCEPTED.includes(file.type)) {
			phase = 'error';
			errorMessage = 'Please choose a PNG, JPG, or WebP screenshot.';
			return;
		}
		if (file.size > MAX_BYTES) {
			phase = 'error';
			errorMessage = 'That image is larger than 8 MB. Try a screenshot rather than a photo.';
			return;
		}

		phase = 'reading';
		progress = 0;
		errorMessage = '';
		receipt = null;

		let url = '';
		// Held outside the try so a failed recognition still tears the worker down. Each
		// worker holds a WASM heap; leaking one per retry exhausts a low-end phone fast.
		let worker: {
			recognize: (i: string) => Promise<{ data: { text: string } }>;
			terminate: () => Promise<unknown>;
		} | null = null;

		try {
			// Loaded on demand so the OCR engine never lands in the main bundle.
			const { createWorker } = await import('tesseract.js');
			// Served from ChipIn's own origin, not a public CDN — see scripts/sync_ocr_assets.mjs.
			// `base` keeps these correct when the site is hosted under a subpath.
			worker = await createWorker('eng', undefined, {
				workerPath: `${base}/ocr/worker.min.js`,
				corePath: `${base}/ocr`,
				langPath: `${base}/ocr`,
				logger: (m: { status: string; progress: number }) => {
					if (m.status === 'recognizing text') progress = Math.round(m.progress * 100);
				}
			});

			url = URL.createObjectURL(file);
			const result = await worker.recognize(url);

			const parsed = extractReceipt(result.data.text);
			receipt = parsed;
			phase = 'done';
			onextract(parsed);
		} catch {
			phase = 'error';
			errorMessage = 'Could not read that image. Fill the form in yourself instead.';
		} finally {
			if (worker) {
				// Never let a teardown failure mask the outcome above.
				await worker.terminate().catch(() => {});
			}
			// The image is released immediately; it is never uploaded or stored.
			if (url) URL.revokeObjectURL(url);
			input.value = '';
		}
	}

	function reset() {
		phase = 'idle';
		receipt = null;
		progress = 0;
		errorMessage = '';
		showLines = false;
	}
</script>

<section class="scanner" aria-labelledby="scanner-heading">
	<h3 id="scanner-heading">Save yourself the typing</h3>
	<p class="lede">
		Upload your bank's confirmation screenshot and ChipIn will fill in the form below. You still
		check every field before you submit.
	</p>

	<p class="privacy">
		<strong>Your screenshot stays on your phone.</strong> It is read here in your browser and never uploaded
		to ChipIn or stored anywhere. Crop out your balance and any other transactions first.
	</p>

	{#if phase === 'idle' || phase === 'error'}
		<label class="drop">
			<input type="file" accept="image/png,image/jpeg,image/webp" onchange={handleFile} />
			<span class="drop-title">Choose a screenshot</span>
			<span class="drop-hint">PNG, JPG, or WebP — up to 8 MB</span>
		</label>
		{#if phase === 'error'}
			<p class="error" role="alert">{errorMessage}</p>
		{/if}
	{/if}

	{#if phase === 'reading'}
		<div class="reading" role="status">
			<p>Reading your screenshot…</p>
			<div class="bar"><div class="bar-fill" style="width: {Math.max(progress, 4)}%"></div></div>
			<p class="reading-note">This happens on your device, so it can take a few seconds.</p>
		</div>
	{/if}

	{#if phase === 'done' && receipt && summary}
		<div class="result" role="status">
			<p class="result-head">
				{#if summary.found === 0}
					Nothing readable found — please fill the form in yourself.
				{:else}
					Filled in {summary.found} of {summary.total} fields from your screenshot.
				{/if}
			</p>

			<ul class="read-fields">
				{#if receipt.amountCents}
					<li>
						<span>Amount</span>
						<strong>{formatBsd(receipt.amountCents.value)}</strong>
					</li>
				{/if}
				{#if receipt.transferDate}
					<li>
						<span>Date</span>
						<strong>{receipt.transferDate.value}</strong>
					</li>
				{/if}
				{#if receipt.reference}
					<li>
						<span>Reference</span>
						<strong>{receipt.reference.value}</strong>
					</li>
				{/if}
				{#if receipt.bankId}
					<li>
						<span>Bank</span>
						<strong>{getBank(receipt.bankId.value)?.shortName ?? receipt.bankId.value}</strong>
					</li>
				{/if}
			</ul>

			<p class="check">
				<strong>Check these against your screenshot before submitting.</strong> ChipIn read them from
				an image — it has not confirmed anything with your bank, and it cannot.
			</p>

			{#if summary.weak && summary.found > 0}
				<p class="weak">Some fields were hard to read. Please look at them closely.</p>
			{/if}

			<div class="result-actions">
				<button type="button" class="ghost" onclick={reset}>Try another screenshot</button>
				{#if receipt.lines.length > 0}
					<button type="button" class="ghost" onclick={() => (showLines = !showLines)}>
						{showLines ? 'Hide' : 'Show'} what ChipIn read
					</button>
				{/if}
			</div>

			{#if showLines}
				<pre class="lines">{receipt.lines.join('\n')}</pre>
			{/if}
		</div>
	{/if}
</section>

<style>
	.scanner {
		padding: var(--space-5);
		border: 1px dashed var(--line);
		border-radius: var(--radius-md);
		background: var(--paper);
	}

	h3 {
		margin: 0 0 var(--space-2);
		font-size: var(--text-lg);
	}

	.lede {
		margin: 0 0 var(--space-3);
		color: var(--ink-60);
		font-size: var(--text-sm);
	}

	.privacy {
		margin: 0 0 var(--space-4);
		padding: var(--space-3);
		border-radius: var(--radius-sm);
		background: var(--gold-tint);
		color: var(--ink-60);
		font-size: var(--text-sm);
	}

	.drop {
		display: grid;
		place-items: center;
		gap: var(--space-1);
		min-height: 96px;
		padding: var(--space-4);
		border: 1px solid var(--ink);
		border-radius: var(--radius-sm);
		background: var(--surface);
		cursor: pointer;
		text-align: center;
	}

	.drop input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
	}

	.drop:focus-within {
		outline: 2px solid var(--aqua-deep);
		outline-offset: 2px;
	}

	.drop-title {
		font-weight: 700;
	}

	.drop-hint {
		color: var(--ink-60);
		font-size: var(--text-xs);
	}

	.reading p {
		margin: 0;
		font-size: var(--text-sm);
	}

	.reading-note {
		margin-top: var(--space-2) !important;
		color: var(--ink-60);
	}

	.bar {
		height: 8px;
		margin: var(--space-3) 0;
		border-radius: var(--radius-full);
		background: var(--line);
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		background: var(--aqua-deep);
		transition: width 200ms ease;
	}

	.result-head {
		margin: 0 0 var(--space-3);
		font-weight: 700;
	}

	.read-fields {
		margin: 0 0 var(--space-3);
		padding: 0;
		list-style: none;
		display: grid;
		gap: var(--space-1);
	}

	.read-fields li {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		background: var(--surface);
		font-size: var(--text-sm);
	}

	.read-fields span {
		color: var(--ink-60);
	}

	.check {
		margin: 0;
		color: var(--ink-60);
		font-size: var(--text-sm);
	}

	.weak {
		margin: var(--space-2) 0 0;
		color: var(--status-pending);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.error {
		margin: var(--space-3) 0 0;
		color: var(--status-disputed, #b3261e);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.result-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-top: var(--space-4);
	}

	.lines {
		margin: var(--space-3) 0 0;
		padding: var(--space-3);
		border-radius: var(--radius-sm);
		background: var(--surface);
		color: var(--ink-60);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		white-space: pre-wrap;
		overflow-x: auto;
	}
</style>

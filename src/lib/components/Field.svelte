<script lang="ts">
	/**
	 * A labelled form control.
	 *
	 * The label/control/hint shape was written out by hand in eight files, each
	 * with its own copy of the styling — see the `.field` block in app.css for
	 * what that drift cost. This carries the same spec for new markup, the way
	 * Button.svelte does for actions.
	 *
	 * The control itself is a child rather than a prop: these fields hold text
	 * inputs, selects, textareas, and a date picker with its own component, and
	 * a `type` prop wide enough to cover all of them would be a worse API than
	 * just writing the <input>.
	 */
	import type { Snippet } from 'svelte';

	let {
		label,
		hint = undefined,
		children
	}: {
		label: string;
		/** Fine print under the control. Inside the <label>, so it is announced with it. */
		hint?: string;
		children: Snippet;
	} = $props();
</script>

<label class="field">
	<span>{label}</span>
	{@render children()}
	{#if hint}<small>{hint}</small>{/if}
</label>

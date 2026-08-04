<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>ChipIn | Neighbours helping neighbours</title>
	<meta name="theme-color" content="#FBF7EE" />
</svelte:head>

{@render children()}

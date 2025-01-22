<script lang="ts">
	import { Board } from '@tools/game-board/board.svelte';
	import { getPixiContext } from '@tools/pixi/pixi-context.svelte';

	let pixi = getPixiContext();
	let pageRef: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (!pageRef || !pixi.app) return;
		let board = new Board(pixi.app, pageRef);
		pageRef.setAttribute('tabindex', '0');
		pageRef.focus();
		pageRef.addEventListener('keydown', board!.handleKeyDown);
		pageRef.addEventListener('keyup', board!.handleKeyUp);
	});
</script>

<div bind:this={pageRef} class="canvas"></div>

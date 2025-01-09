<script lang="ts">
	import '@style/global.scss';

	import { PreloaderContext, setPreloaderContext } from '$lib/context/loader/loader.svelte';
	import { variables } from '@tools/styles/variables';
	import { Application } from 'pixi.js';
	import { onMount } from 'svelte';
	import { PixiContext, setPixiContext } from '@tools/pixi/pixi-context.svelte';

	const { children } = $props();

	const preloaderContext = new PreloaderContext();
	const pixiContext = new PixiContext();
	setPixiContext(pixiContext);
	setPreloaderContext(preloaderContext);

	const loadApp = async () => {
		preloaderContext.register({
			load: async () => {
				const application = new Application();
				globalThis.__PIXI_APP__ = application;

				await application.init({
					background: variables.color.white,
					resizeTo: window
					// backgroundAlpha: 0
					// autoDensity: false
				});

				pixiContext.app = application;

				return application;
			},
			id: 'pixi'
		});

		await preloaderContext.loadAll();
	};

	onMount(() => {
		loadApp();
	});
</script>

{@render children()}

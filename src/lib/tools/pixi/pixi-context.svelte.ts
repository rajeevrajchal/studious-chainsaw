import type { Application } from 'pixi.js';
import { getContext, setContext } from 'svelte';

export function setPixiContext(context: PixiContext) {
	setContext('pixi', context);
}

export function getPixiContext() {
	const context = getContext<PixiContext | undefined>('pixi');

	if (!context) {
		throw new Error('PixiContext is not set');
	}

	return context;
}

export class PixiContext {
	public app: Application | undefined = $state();

	constructor() {}
}

import { getContext, setContext } from 'svelte';

export function setPreloaderContext(context: PreloaderContext) {
	setContext('loader', context);
}

export function getPreloaderContext() {
	const context = getContext<PreloaderContext | undefined>('loader');

	if (!context) {
		throw new Error('LoaderContext is not set');
	}

	return context;
}

export interface ILoadItem {
	id: string;
	load: () => Promise<any>;
}

export class PreloaderContext {
	private _items: ILoadItem[] = [];
	private _idToData: Map<string, any> = new Map();

	public wasLoaded: boolean = $state(false);

	constructor() {}

	public register(item: ILoadItem): void {
		this._items.push(item);
	}

	public get items(): ILoadItem[] {
		return this._items;
	}

	public setData(id: string, data: any): void {
		this._idToData.set(id, data);
	}

	public getData(id: string): any {
		return this._idToData.get(id)!;
	}

	public loadAll = async (): Promise<void> => {
		console.log('');
		console.log(`Loading ${this._items.length}`);

		for (const item of this._items) {
			console.log(`load: ${item.id}`);
			const data = await item.load();

			this.setData(item.id, data);
		}

		console.log('all done');
		console.log('');

		this.wasLoaded = true;
	};
}

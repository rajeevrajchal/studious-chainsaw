import { Assets, Container, Sprite } from 'pixi.js';

const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

type Position = { x: number; y: number };

export class Bunny {
	private container: Container;
	private anchor: number = 0.5;
	private position: Position = { x: 0, y: 0 };
	character: Sprite | undefined = $state();

	constructor(container: Container, anchor: number, position: Position) {
		this.anchor = anchor;
		this.position = position;
		this.container = container;

		this.init();
	}

	init() {
		this.character = Sprite.from(texture);
		this.character.anchor.set(this.anchor);
		this.character.position.set(this.position.x, this.position.y);
		this.container.addChild(this.character);
	}

	remove() {
		if (!this.character) return;
		this.container.removeChild(this.character);
	}
}

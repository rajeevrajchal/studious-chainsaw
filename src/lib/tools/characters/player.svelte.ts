import { Assets, Container, Sprite } from 'pixi.js';

export type Position = { x: number; y: number };
export enum PlayerType {
	NPC = 'npc',
	PLAYER = 'player'
}

export const texture = {
	npc: await Assets.load('https://pixijs.com/assets/bunny.png'),
	player: await Assets.load('/run-man.png')
};

export class Player {
	container: Container;
	private anchor: number = 0.5;
	private position: Position = { x: 0, y: 0 };
	character?: Sprite; // Remove $state() here
	private type: PlayerType = PlayerType.NPC;
	private dimenstion: { width: number; height: number } = { width: 0, height: 0 };

	constructor(
		container: Container,
		anchor: number,
		position: Position,
		type: PlayerType,
		dimenstion?: {
			width: number;
			height: number;
		}
	) {
		this.anchor = anchor;
		this.position = position;
		this.container = container;
		this.type = type;
		this.dimenstion = dimenstion || { width: 0, height: 0 };
		this.init();
	}

	init = () => {
		console.log('hello world');
		if (this.character) {
			this.remove();
		}
		this.character = Sprite.from(texture[this.type]);
		this.character.anchor.set(this.anchor);
		this.character.position.set(this.position.x, this.position.y);
		this.character.width = this.dimenstion.width;
		this.character.height = this.dimenstion.height;
		this.container.addChild(this.character);
	};

	move = (pos: { x: number; y: number }) => {
		if (!this.character) return;
		this.character.x = pos.x;
		this.character.y = pos.y;
	};

	remove = () => {
		if (!this.character) return;
		this.container.removeChild(this.character);
		this.character = undefined;
	};
}

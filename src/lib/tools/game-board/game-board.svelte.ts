import { Player, PlayerType } from '@tools/characters/player.svelte';
import { Container, type Application, type Sprite } from 'pixi.js';

let obstacleGap = 50;

export class GameBoard {
	level: number = $state(1);
	speed: number = $state(1);
	totalObstacle: number = $state(10);
	isGameActive: boolean = $state(false);

	player: Player | undefined = $state();

	private app: Application | undefined = $state();
	private page: HTMLElement | undefined = $state();
	private horizontal: number = $state(0);
	private keySet: {
		[key: number]: boolean;
	} = $state({});
	private obstacles: Sprite[] = $state([]);

	constructor(app: Application, page: HTMLElement) {
		this.app = app;
		this.page = page;
		this.init();
	}

	private createBoard = async () => {
		if (!this.app) return;
		const container = new Container();
		const playerPosition = {
			x: this.app.screen.width / 2,
			y: this.app.screen.height - 50
		};
		this.player = new Player(container, 0.5, playerPosition, PlayerType.PLAYER, {
			width: 50,
			height: 50
		});
		this.app.stage.addChild(container);
		this.page?.appendChild(this.app.canvas);
		console.log('ticket');
		this.app.ticker.add(this.playGame);
	};

	private getRandomPosition = (gap: number = obstacleGap) => {
		if (!this.app) return;
		return {
			x: gap + Math.random() * (this.app.screen.width - 2 * gap),
			y: gap + Math.random() * (this.app.screen.height - 2 * gap)
		};
	};

	private generateObstacle = (app: Application) => {};

	public playGame = () => {
		if (!this.app || !this.player || !this.isGameActive) return;
		let point: {
			x: number;
			y: number;
		} = {
			x: this.player?.character?.position.x || 0,
			y: this.player?.character?.position.y || 0
		};
		if (this.keySet[38]) {
			if (Math.abs(this.app.stage.y) >= this.app.screen.height - 100) return;
			point.y -= this.speed;
		}
		if (this.keySet[40]) {
			point.y += this.speed;
		}
		if (this.keySet[37]) {
			point.x -= 2;
		}
		if (this.keySet[39]) {
			point.x += 2;
		}
	};

	public handleKeyDown = (e: KeyboardEvent) => {
		console.log('jjj');
		this.keySet[e.keyCode] = true;
	};

	public handleKeyUp = (e: KeyboardEvent) => {
		delete this.keySet[e.keyCode];
	};

	private init = () => {
		if (!this.app) return;
		this.createBoard();
	};
}

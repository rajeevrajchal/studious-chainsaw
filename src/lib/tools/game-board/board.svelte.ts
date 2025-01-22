import { Player, PlayerType } from '@tools/characters/player.svelte';
import { Container, Sprite, type Application } from 'pixi.js';

const BASE_HORIZONTAL_SPEED = 2;
const BASE_VERTICAL_SPEED = 0.5;
const OBSTACLE_GAP = 50;
const NUM_OBSTACLES = 10;

export class Board {
	private level: number = $state(1);
	private keySet: { [key: number]: boolean } = $state({});
	private verticalSpeed: number = $state(BASE_VERTICAL_SPEED);

	private app: Application | undefined;
	private page: HTMLElement | undefined;

	player: Player | undefined = $state();

	constructor(app: Application, page: HTMLElement) {
		this.app = app;
		this.page = page;
		this.scafold();
	}

	private scafold = () => {
		if (!this.app || !this.page) return;
		const container = new Container();
		this.player = new Player(
			container,
			0.5,
			{
				x: this.app.screen.width / 2,
				y: this.app.screen.height - 20
			},
			PlayerType.PLAYER,
			{
				width: 50,
				height: 50
			}
		);
		this.app.stage.addChild(container);
		this.app.ticker.add(this.gameLoop);
		this.page.appendChild(this.app.canvas);
	};

	private checkCollision = (newPoint: { x: number; y: number }, obstacles: Sprite[]): boolean => {
		const radius = 20; //radius of collistion on sprite size;

		return obstacles.some((obstacle) => {
			const dx = newPoint.x - obstacle.x;
			const dy = newPoint.y - obstacle.y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			return distance < radius * 2;
		});
	};

	private checkWinCondition = () => {
		return this.player!.character!.y <= 20;
	};

	private resetGame = () => {
		if (!this.player || !this.app) return;
		this.player.character!.x = this.app!.screen.width / 2;
		this.player.character!.y = this.app!.screen.height - 20;

		//setup obstacles

		//reset game
		if (!this.app.ticker.started) {
			this.app.ticker.stop();
			this.app.ticker.remove(this.gameLoop);
		}

		this.app.ticker.add(this.gameLoop);
	};

	private gameLoop = () => {
		if (!this.app || !this.player) return;

		const isWin = this.checkWinCondition();
		if (isWin) {
			alert('You won! Level ' + this.level + ' completed!');
			this.level++;
			this.verticalSpeed += 0.1;
			this.resetGame();
			return;
		}

		const point = { x: this.player!.character!.x, y: this.player!.character!.y };
		const isCollide = this.checkCollision(point, []);
		if (isCollide) {
			alert('Game Over! You collided with an obstacle on level ' + this.level);
			this.level = 1;
			this.verticalSpeed = BASE_VERTICAL_SPEED;
			this.resetGame();
			return;
		}

		// Calculate speed based on level, but don't accumulate

		if (this.keySet[37]) point.x -= BASE_HORIZONTAL_SPEED; // Left
		if (this.keySet[39]) point.x += BASE_HORIZONTAL_SPEED; // Right
		point.y -= this.verticalSpeed; // Up
		if (this.keySet[40]) point.y += this.verticalSpeed; // Down
		this.player.move(point);
	};

	private getRandomPosition = (gap: number = OBSTACLE_GAP) => {
		if (!this.app) return;
		return {
			x: gap + Math.random() * (this.app.screen.width - 2 * gap),
			y: gap + Math.random() * (this.app.screen.height - 2 * gap)
		};
	};

	private generateObstacles = () => {
		let position = [];
	};

	handleKeyDown = (e: KeyboardEvent) => {
		this.keySet[e.keyCode] = true;
	};

	handleKeyUp = (e: KeyboardEvent) => {
		delete this.keySet[e.keyCode];
	};
}

<script lang="ts">
	import { getPixiContext, type PixiContext } from '@tools/pixi/pixi-context.svelte';
	import { Assets, Sprite } from 'pixi.js';

	let pixi: PixiContext = getPixiContext();
	let level = $state(1);
	let speed = $state(1);
	let pageRef: HTMLDivElement | undefined = $state();
	let keySet: { [key: number]: boolean } = $state({});
	let playerBunny: Sprite | undefined = $state();
	let obstacleBunnies: Sprite[] = $state([]);
	let isGameActive: boolean = $state(true);

	const NUM_BUNNIES = 5; // Change this number to add more bunnies

	const handleKeyDown = (e: KeyboardEvent) => {
		keySet[e.keyCode] = true;
	};

	const handleKeyUp = (e: KeyboardEvent) => {
		delete keySet[e.keyCode];
	};

	const getRandomPosition = (app: any, padding = 50) => {
		return {
			x: padding + Math.random() * (app.screen.width - 2 * padding),
			y: padding + Math.random() * (app.screen.height - 2 * padding)
		};
	};

	const generateAdaptiveBunnyPositions = (
		app: any,
		count: any,
		level: number,
		baseSpacing = 100
	) => {
		// Reduce spacing as level increases, but never below minimum safe distance
		const minSpacing = Math.max(60, baseSpacing - level * 20);

		// Increase number of bunnies with level, if desired
		const adjustedCount = count + Math.floor(level / 3);

		// Calculate "danger zone" that gets larger with level
		const dangerZone = {
			x: app.screen.width / 2,
			y: app.screen.height / 2,
			radius: Math.min(app.screen.width / 2, 100 + level * 30)
		};

		const positions: any = [];
		const padding = 50;

		for (let i = 0; i < adjustedCount; i++) {
			let newPosition: any;
			let attempts = 0;
			const maxAttempts = 50;

			do {
				// Higher chance of spawning in danger zone as level increases
				const useCenter = Math.random() < level * 0.1;

				if (useCenter) {
					// Generate position within danger zone
					const angle = Math.random() * Math.PI * 2;
					const distance = Math.random() * dangerZone.radius;
					newPosition = {
						x: dangerZone.x + Math.cos(angle) * distance,
						y: dangerZone.y + Math.sin(angle) * distance
					};
				} else {
					newPosition = getRandomPosition(app, padding);
				}

				attempts++;

				// Check if this position is valid
				const isFarEnough = positions.every((pos: any) => {
					const dx = newPosition.x - pos.x;
					const dy = newPosition.y - pos.y;
					const distance = Math.sqrt(dx * dx + dy * dy);
					return distance >= minSpacing;
				});

				// Ensure position is within screen bounds
				const isInBounds =
					newPosition.x >= padding &&
					newPosition.x <= app.screen.width - padding &&
					newPosition.y >= padding &&
					newPosition.y <= app.screen.height - padding;

				if ((isFarEnough && isInBounds) || attempts >= maxAttempts) {
					positions.push(newPosition);
					break;
				}
			} while (attempts < maxAttempts);
		}

		return positions;
	};

	const resetGame = () => {
		if (!pixi.app || !playerBunny) return;

		// Reset player bunny position
		playerBunny.x = pixi.app.screen.width / 2;
		playerBunny.y = pixi.app.screen.height - 50;

		// Generate new positions for obstacle bunnies
		const positions = generateAdaptiveBunnyPositions(pixi.app, NUM_BUNNIES, level);

		// Update positions of all obstacle bunnies
		obstacleBunnies.forEach((bunny, index) => {
			if (positions[index]) {
				bunny.x = positions[index].x;
				bunny.y = positions[index].y;
			}
		});

		// Clear key states
		keySet = {};

		// Restart game
		isGameActive = true;

		// Re-add ticker if it was removed
		if (!pixi.app.ticker.started) {
			pixi.app.ticker.start();
		}
		pixi.app.ticker.add(ticketAction);
	};

	const createBunnies = async () => {
		if (!pixi.app) return;
		const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

		// Create player bunny
		playerBunny = Sprite.from(texture);
		playerBunny.anchor.set(0.5);
		playerBunny.x = pixi.app.screen.width / 2;
		playerBunny.y = pixi.app.screen.height - 50;
		pixi.app.stage.addChild(playerBunny);

		// Generate initial positions for obstacles
		const initialPositions = generateAdaptiveBunnyPositions(pixi.app, NUM_BUNNIES, level);

		// Create obstacle bunnies
		obstacleBunnies = Array.from({ length: NUM_BUNNIES }, (_, index) => {
			const bunny = Sprite.from(texture);
			bunny.anchor.set(0.5);

			// Set initial position
			if (initialPositions[index]) {
				bunny.x = initialPositions[index].x;
				bunny.y = initialPositions[index].y;
			}

			if (!pixi.app) return [] as any;
			pixi.app.stage.addChild(bunny);
			return bunny;
		});
	};

	const createUI = async () => {
		if (!pixi.app) return;
		await createBunnies();
		pixi.app.ticker.add(ticketAction);
	};

	const checkCollision = (newPoint: { x: number; y: number }, obstacles: Sprite[]): boolean => {
		const radius = 20; // Adjust this value based on your sprite size

		// Check collision with each obstacle
		return obstacles.some((obstacle) => {
			const dx = newPoint.x - obstacle.x;
			const dy = newPoint.y - obstacle.y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			return distance < radius * 2;
		});
	};

	const ticketAction = () => {
		if (!pixi.app || !playerBunny || !isGameActive) return;

		const newPoint = { x: playerBunny.x, y: playerBunny.y };

		if (playerBunny.y <= 0) {
			alert('You won! Level ' + level + ' completed!');
			level = level + 1;
			resetGame();
			return;
		}

		// Movement speed increases with level
		const moveSpeed = level + speed; // Cap speed at 8 to keep it playable

		if (keySet[38]) {
			// Up arrow
			if (Math.abs(pixi.app.stage.y) >= pixi.app.screen.height - 100) return;
			newPoint.y -= moveSpeed;
		}
		if (keySet[40]) {
			// Down arrow
			newPoint.y += moveSpeed;
		}
		if (keySet[37]) {
			// Left arrow
			newPoint.x -= moveSpeed;
		}
		if (keySet[39]) {
			// Right arrow
			newPoint.x += moveSpeed;
		}

		// Check collision with any obstacle bunny
		if (checkCollision(newPoint, obstacleBunnies)) {
			isGameActive = false;
			alert('Game Over! You collided with an obstacle on level ' + level);
			level = 1;
			resetGame();
			return;
		}

		playerBunny.x = newPoint.x;
		playerBunny.y = newPoint.y;
	};

	$effect(() => {
		if (!pixi.app || !pageRef) return;
		pageRef.setAttribute('tabindex', '0');
		pageRef.focus();
		pageRef.appendChild(pixi.app.canvas);
		pageRef.addEventListener('keydown', handleKeyDown);
		pageRef.addEventListener('keyup', handleKeyUp);
		createUI();

		return () => {
			pageRef?.removeEventListener('keydown', handleKeyDown);
			pageRef?.removeEventListener('keyup', handleKeyUp);
		};
	});
</script>

<div bind:this={pageRef} class="canvas"></div>

<style>
	.canvas {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		outline: none; /* Remove focus outline when focused */
	}
</style>

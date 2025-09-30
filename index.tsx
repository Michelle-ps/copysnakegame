/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Game constants
const BOARD_SIZE = 20;
const TILE_SIZE = 20;
const INITIAL_SPEED = 200; // ms per update
const SPEED_INCREMENT = 5; // ms faster per food eaten

// DOM elements
const board = document.getElementById('game-board') as HTMLCanvasElement;
const ctx = board.getContext('2d')!;
const scoreEl = document.getElementById('score')!;
const highScoreEl = document.getElementById('high-score')!;
const startButton = document.getElementById('start-button')!;
const gameOverScreen = document.getElementById('game-over-screen')!;
const playAgainButton = document.getElementById('play-again-button')!;
const finalScoreEl = document.getElementById('final-score')!;

// Game state
let snake: {x: number; y: number}[] = [];
let food: {x: number; y: number};
let direction: {x: number; y: number};
let nextDirection: {x: number; y: number};
let score: number;
let highScore: number = Number(localStorage.getItem('snakeHighScore')) || 0;
let speed: number;
let gameInterval: number;
let isGameOver: boolean;

function init() {
  // Reset game state
  snake = [{x: 10, y: 10}];
  direction = {x: 0, y: 0};
  nextDirection = {x: 0, y: 0};
  score = 0;
  speed = INITIAL_SPEED;
  isGameOver = false;

  // Update UI
  scoreEl.textContent = score.toString();
  highScoreEl.textContent = highScore.toString();
  gameOverScreen.classList.add('hidden');
  startButton.classList.add('hidden');
  board.classList.remove('hidden');

  generateFood();
  startGameLoop();
}

function startGameLoop() {
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = window.setInterval(() => {
    if (!isGameOver) {
      update();
    }
  }, speed);
}

function update() {
  // Change direction if a new one is set
  if (
    (nextDirection.x !== 0 || nextDirection.y !== 0) &&
    (snake.length === 1 ||
      (nextDirection.x !== -direction.x && nextDirection.y !== -direction.y))
  ) {
    direction = nextDirection;
  }

  // Only move the snake if a direction is set
  if (direction.x !== 0 || direction.y !== 0) {
    // Move snake
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    snake.unshift(head);

    // Check for collision
    if (
      head.x < 0 ||
      head.x >= BOARD_SIZE ||
      head.y < 0 ||
      head.y >= BOARD_SIZE ||
      checkSelfCollision()
    ) {
      gameOver();
      return;
    }

    // Check for food
    if (head.x === food.x && head.y === food.y) {
      score++;
      scoreEl.textContent = score.toString();
      generateFood();
      // Increase speed
      speed = Math.max(50, speed - SPEED_INCREMENT);
      startGameLoop(); // Restart interval with new speed
    } else {
      snake.pop();
    }
  }

  draw();
}

function draw() {
  // Clear board
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, board.width, board.height);

  // Draw snake
  ctx.fillStyle = '#4CAF50';
  snake.forEach(segment => {
    ctx.fillRect(
      segment.x * TILE_SIZE,
      segment.y * TILE_SIZE,
      TILE_SIZE - 2,
      TILE_SIZE - 2
    );
  });

  // Draw food
  ctx.fillStyle = '#F44336';
  ctx.fillRect(
    food.x * TILE_SIZE,
    food.y * TILE_SIZE,
    TILE_SIZE - 2,
    TILE_SIZE - 2
  );
}

function generateFood() {
  while (true) {
    food = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
    // Ensure food doesn't spawn on the snake
    if (!snake.some(segment => segment.x === food.x && segment.y === food.y)) {
      break;
    }
  }
}

function checkSelfCollision() {
  const [head, ...body] = snake;
  return body.some(segment => segment.x === head.x && segment.y === head.y);
}

function gameOver() {
  isGameOver = true;
  clearInterval(gameInterval);
  board.classList.add('hidden');
  gameOverScreen.classList.remove('hidden');
  finalScoreEl.textContent = score.toString();
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore.toString());
    highScoreEl.textContent = highScore.toString();
  }
}

function handleKeyPress(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowUp':
      if (direction.y === 0) nextDirection = {x: 0, y: -1};
      break;
    case 'ArrowDown':
      if (direction.y === 0) nextDirection = {x: 0, y: 1};
      break;
    case 'ArrowLeft':
      if (direction.x === 0) nextDirection = {x: -1, y: 0};
      break;
    case 'ArrowRight':
      if (direction.x === 0) nextDirection = {x: 1, y: 0};
      break;
  }
}

// Event Listeners
document.addEventListener('keydown', handleKeyPress);
startButton.addEventListener('click', init);
playAgainButton.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    startButton.classList.remove('hidden');
    board.classList.remove('hidden');
    showInitialScreen();
});

// Initial draw
function showInitialScreen() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, board.width, board.height);
    highScoreEl.textContent = highScore.toString();
}

showInitialScreen();
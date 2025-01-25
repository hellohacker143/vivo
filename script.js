const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const pointer = document.getElementById("pointer");
const scoreDisplay = document.getElementById("score");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const snake = [{ x: 150, y: 150 }]; // Initial snake position
const snakeSize = 20;
const snakeSpeed = 5;
let snakeHeadX = snake[0].x;
let snakeHeadY = snake[0].y;
let food = { x: 300, y: 300 };
let score = 0;

// Initialize MediaPipe Hands
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.8,
  minTrackingConfidence: 0.8,
});

// Initialize Camera
const videoElement = document.getElementById("webcam");

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 1280,
  height: 720,
});
camera.start();

// Spawn new food
function spawnFood() {
  food.x = Math.random() * (canvas.width - snakeSize);
  food.y = Math.random() * (canvas.height - snakeSize);
}

// Draw Snake
function drawSnake() {
  ctx.fillStyle = "green";
  snake.forEach(segment => {
    ctx.fillRect(segment.x, segment.y, snakeSize, snakeSize);
  });
}

// Draw Food
function drawFood() {
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, snakeSize, snakeSize);
}

// Check if Snake Eats Food
function checkFoodCollision() {
  if (
    Math.abs(snakeHeadX - food.x) < snakeSize &&
    Math.abs(snakeHeadY - food.y) < snakeSize
  ) {
    score += 10;
    snake.push({ x: food.x, y: food.y }); // Add new segment to snake
    spawnFood();
  }
}

// Check Collision with Edges
function checkEdgeCollision() {
  if (
    snakeHeadX < 0 ||
    snakeHeadY < 0 ||
    snakeHeadX > canvas.width - snakeSize ||
    snakeHeadY > canvas.height - snakeSize
  ) {
    alert("Game Over! Your Score: " + score);
    document.location.reload();
  }
}

// Update Snake Position
function updateSnake() {
  const newHead = { x: snakeHeadX, y: snakeHeadY };
  snake.unshift(newHead); // Add new head
  snake.pop(); // Remove tail
}

// Hand Tracking
hands.onResults((results) => {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    const pointerX = landmarks[8].x * canvas.width;
    const pointerY = landmarks[8].y * canvas.height;

    pointer.style.left = `${pointerX}px`;
    pointer.style.top = `${pointerY}px`;

    // Smoothly move the snake towards the pointer
    snakeHeadX += (pointerX - snakeHeadX) * 0.2;
    snakeHeadY += (pointerY - snakeHeadY) * 0.2;
  }
});

// Game Loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSnake();
  drawFood();
  checkFoodCollision();
  checkEdgeCollision();
  updateSnake();
  scoreDisplay.textContent = `Score: ${score}`;
  requestAnimationFrame(gameLoop);
}

spawnFood();
gameLoop();

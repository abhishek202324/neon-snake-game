const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const uiLayer = document.getElementById('ui-layer');
const startBtn = document.getElementById('start-btn');
const gameMessage = document.getElementById('game-message');
const glowText = document.querySelector('.glow-text');

// Game constants
const gridSize = 20;
const tileCount = canvas.width / gridSize;
const gameSpeed = 100; // ms per frame

// Colors
const snakeColor = '#39ff14'; // neon green
const headColor = '#ffffff';
const foodColor = '#ff3131'; // neon red

// Game state
let snake = [];
let food = { x: 10, y: 10 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('neonSnakeHighScore') || 0;
let gameLoop;
let isGameOver = false;
let isStarted = false;

// Initialize
highScoreElement.textContent = highScore;

function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
    ];
    dx = 0;
    dy = -1; // Start moving up
    score = 0;
    scoreElement.textContent = score;
    isGameOver = false;
    isStarted = true;
    placeFood();
    
    // reset UI visuals
    glowText.textContent = 'NEON SNAKE';
    glowText.style.textShadow = '0 0 5px #fff, 0 0 10px #fff, 0 0 20px #39ff14, 0 0 40px #39ff14, 0 0 80px #39ff14';
    
    uiLayer.classList.remove('visible');
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, gameSpeed);
}

function update() {
    if (isGameOver) return;
    
    // Calculate new head position
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // Check collisions
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || checkSelfCollision(head)) {
        gameOver();
        return;
    }
    
    // Move snake
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('neonSnakeHighScore', highScore);
        }
        placeFood();
    } else {
        snake.pop(); // Remove tail if no food eaten
    }
    
    draw();
}

function checkSelfCollision(head) {
    // Don't check the very last tail segment as it will move forward
    for (let i = 0; i < snake.length - 1; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }
    return false;
}

function placeFood() {
    let validPos = false;
    while (!validPos) {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
        
        validPos = true;
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                validPos = false;
                break;
            }
        }
    }
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines (subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for(let i = 0; i <= canvas.width; i+=gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    // Draw Food with Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = foodColor;
    ctx.fillStyle = foodColor;
    // Make food slightly smaller than grid for aesthetics
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow
    
    // Draw Snake
    for (let i = 0; i < snake.length; i++) {
        const isHead = i === 0;
        
        // Add glow only to head and every 3rd segment to save performance
        if (isHead || i % 3 === 0) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = snakeColor;
        } else {
            ctx.shadowBlur = 0;
        }
        
        ctx.fillStyle = isHead ? headColor : snakeColor;
        
        // Slightly round rectangles
        ctx.fillRect(
            snake[i].x * gridSize + 1,
            snake[i].y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    }
    ctx.shadowBlur = 0;
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    
    // Screen shake
    document.documentElement.classList.add('shake');
    setTimeout(() => {
        document.documentElement.classList.remove('shake');
    }, 400);
    
    // Update UI
    glowText.textContent = 'GAME OVER';
    glowText.style.textShadow = `0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ff00ff, 0 0 40px #ff00ff`;
    gameMessage.textContent = `Final Score: ${score}`;
    startBtn.textContent = 'PLAY AGAIN';
    startBtn.style.borderColor = '#ff00ff';
    startBtn.style.color = '#ff00ff';
    startBtn.style.boxShadow = '0 0 10px rgba(255, 0, 255, 0.3), inset 0 0 10px rgba(255, 0, 255, 0.3)';
    
    uiLayer.classList.add('visible');
}

// Controls
document.addEventListener('keydown', (e) => {
    // Prevent scrolling with arrows/space
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
    
    if (!isStarted || isGameOver) {
        if (e.code === 'Space') {
            initGame();
        }
        return;
    }
    
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;
    
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (!goingDown) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (!goingUp) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (!goingRight) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (!goingLeft) { dx = 1; dy = 0; }
            break;
    }
});

startBtn.addEventListener('click', initGame);

// Touch Controls for Mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, {passive: true});

document.addEventListener('touchend', (e) => {
    if (!isStarted || isGameOver) {
        // Only start if they clicked the game area
        if (e.target === canvas || e.target === uiLayer || e.target === document.body) {
             initGame();
        }
        return;
    }
    
    let touchEndX = e.changedTouches[0].screenX;
    let touchEndY = e.changedTouches[0].screenY;
    
    let diffX = touchEndX - touchStartX;
    let diffY = touchEndY - touchStartY;
    
    // Require a minimum swipe distance to avoid tiny accidental touches
    if (Math.abs(diffX) < 20 && Math.abs(diffY) < 20) return;
    
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0 && !goingLeft) { dx = 1; dy = 0; }
        else if (diffX < 0 && !goingRight) { dx = -1; dy = 0; }
    } else {
        if (diffY > 0 && !goingUp) { dx = 0; dy = 1; }
        else if (diffY < 0 && !goingDown) { dx = 0; dy = -1; }
    }
});

// Initial draw
draw();

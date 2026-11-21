const player = document.getElementById("player");
const area = document.getElementById("game-area");
const obstacles = document.getElementById("obstacles");
const overlay = document.getElementById("overlay");
const scoreText = document.getElementById("score");
const startButton = document.getElementById("start");
const restartButton = document.getElementById("restart");

let running = false;
let jumping = false;
let score = 0;
let speed = 4;
let obstacleTimer;
let animationFrame;
let playerBottom = 42;
let velocity = 0;
let lastTime = 0;

function jump() {
    if (!running || jumping) return;
    jumping = true;
    velocity = 12;
}

function createObstacle() {
    if (!running) return;
    const obstacle = document.createElement("div");
    obstacle.className = "obstacle";
    obstacle.style.left = area.clientWidth + "px";
    obstacles.appendChild(obstacle);
}

function endGame() {
    running = false;
    cancelAnimationFrame(animationFrame);
    clearInterval(obstacleTimer);
    overlay.style.display = "flex";
    overlay.querySelector("h2").textContent = "KONIEC GRY!";
    overlay.querySelector("p").textContent = "Twój wynik: " + score;
    startButton.textContent = "ZAGRAJ PONOWNIE";
}

function update(time) {
    if (!running) return;

    const delta = Math.min((time - lastTime) / 16.67 || 1, 2);
    lastTime = time;

    if (jumping) {
        playerBottom += velocity * delta;
        velocity -= 0.65 * delta;

        if (playerBottom <= 42) {
            playerBottom = 42;
            jumping = false;
            velocity = 0;
        }
        player.style.bottom = playerBottom + "px";
    }

    const playerRect = player.getBoundingClientRect();

    obstacles.querySelectorAll(".obstacle").forEach(obstacle => {
        let x = parseFloat(obstacle.style.left);
        x -= speed * delta;
        obstacle.style.left = x + "px";

        const rect = obstacle.getBoundingClientRect();
        const hit = playerRect.right > rect.left + 5 &&
                    playerRect.left < rect.right - 5 &&
                    playerRect.bottom > rect.top + 5;

        if (hit) endGame();

        if (x < -40) {
            obstacle.remove();
            score++;
            scoreText.textContent = score;
            speed = Math.min(4 + score * 0.12, 9);
        }
    });

    animationFrame = requestAnimationFrame(update);
}

function startGame() {
    cancelAnimationFrame(animationFrame);
    clearInterval(obstacleTimer);
    obstacles.innerHTML = "";
    score = 0;
    speed = 4;
    playerBottom = 42;
    velocity = 0;
    jumping = false;
    running = true;
    lastTime = performance.now();

    scoreText.textContent = "0";
    player.style.bottom = "42px";
    overlay.style.display = "none";

    obstacleTimer = setInterval(createObstacle, 1450);
    animationFrame = requestAnimationFrame(update);
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

document.addEventListener("keydown", event => {
    if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        if (!running) startGame();
        else jump();
    }
});

area.addEventListener("pointerdown", event => {
    if (event.target.closest("button")) return;
    if (!running) startGame();
    else jump();
});

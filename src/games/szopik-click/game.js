const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const bestEl = document.getElementById("best");
const arena = document.getElementById("arena");
const target = document.getElementById("target");
const message = document.getElementById("message");
const start = document.getElementById("start");

let score = 0;
let time = 30;
let timer = null;
let playing = false;

let best = Number(localStorage.getItem("szopik-click-best") || 0);
bestEl.textContent = best;

function moveTarget() {
    const maxX = arena.clientWidth - target.offsetWidth;
    const maxY = arena.clientHeight - target.offsetHeight;
    target.style.left = Math.random() * Math.max(0,maxX) + "px";
    target.style.top = Math.random() * Math.max(0,maxY) + "px";
}

function finishGame() {
    playing = false;
    clearInterval(timer);
    target.hidden = true;
    message.hidden = false;
    message.textContent = `Koniec gry! Twój wynik: ${score} punktów`;
    start.textContent = "ZAGRAJ PONOWNIE";
}

start.addEventListener("click", () => {
    if (playing) return;
    score = 0;
    time = 30;
    playing = true;
    scoreEl.textContent = score;
    timeEl.textContent = time;
    message.hidden = true;
    target.hidden = false;
    start.textContent = "GRA W TOKU...";
    moveTarget();

    clearInterval(timer);
    timer = setInterval(() => {
        time--;
        timeEl.textContent = time;
        if (time <= 0) finishGame();
    },1000);
});

target.addEventListener("click", () => {
    if (!playing) return;
    score++;
    scoreEl.textContent = score;
    if (score > best) {
        best = score;
        bestEl.textContent = best;
        localStorage.setItem("szopik-click-best",best);
    }
    moveTarget();
});

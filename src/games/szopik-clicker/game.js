let score = 0;
let best = Number(localStorage.getItem("szopik-clicker-best") || 0);

const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");
const hint = document.getElementById("hint");

function refresh() {
  scoreElement.textContent = score;
  bestElement.textContent = best;
}

document.getElementById("raccoon").addEventListener("click", () => {
  score++;
  if (score > best) {
    best = score;
    localStorage.setItem("szopik-clicker-best", String(best));
  }
  hint.textContent = score % 10 === 0 ? "Ale klikanie! Szopik jest zadowolony!" : "Zdobywasz kolejną łapkę!";
  refresh();
});

document.getElementById("reset").addEventListener("click", () => {
  score = 0;
  hint.textContent = "Wynik wyzerowany. Zaczynamy od nowa!";
  refresh();
});

refresh();

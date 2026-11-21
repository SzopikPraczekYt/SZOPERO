const button = document.querySelector("#play");
const message = document.querySelector("#message");
let clicks = 0;

button.addEventListener("click", () => {
  clicks++;
  message.textContent = `Kliknięcia: ${clicks} — SZOPERO działa!`;
});

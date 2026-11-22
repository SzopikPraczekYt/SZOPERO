const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

menuToggle.addEventListener("click", () => {
  nav.classList.toggle("open");
  menuToggle.textContent = nav.classList.contains("open") ? "✕" : "☰";
});

nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.textContent = "☰";
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

// Zamykanie górnego bannera
const warningClose = document.getElementById("warning-close");
const warningBanner = document.getElementById("warning-banner");

if (warningClose && warningBanner) {
    warningClose.addEventListener("click", () => {
        warningBanner.remove();
    });
}

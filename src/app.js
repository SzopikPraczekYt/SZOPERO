const navButtons = document.querySelectorAll(".nav");
const pages = document.querySelectorAll(".page");
const pageTitle = document.getElementById("page-title");

const titles = {
  home: "Strona główna",
  games: "Moje gry",
  updates: "Aktualizacje",
  about: "O projekcie"
};

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    const page = button.dataset.page;
    navButtons.forEach(item => item.classList.remove("active"));
    pages.forEach(item => item.classList.remove("active-page"));
    button.classList.add("active");
    document.getElementById(page).classList.add("active-page");
    pageTitle.textContent = titles[page];
  });
});

document.querySelectorAll("[data-launch]").forEach(button => {
  button.addEventListener("click", () => {
    window.szopero.openGame(button.dataset.launch);
  });
});

(async () => {
  const version = await window.szopero.getVersion();
  document.getElementById("version").textContent = `Wersja ${version}`;
})();

document.getElementById("check-updates").addEventListener("click", async () => {
  const result = document.getElementById("update-result");
  result.textContent = "Sprawdzanie aktualizacji...";
  const update = await window.szopero.checkUpdates();

  if (update.available) {
    result.textContent = `Dostępna aktualizacja: ${update.latest}`;
    if (update.url) window.szopero.openLink(update.url);
  } else {
    result.textContent = update.error || "Masz najnowszą wersję SZOPERO.";
  }
});

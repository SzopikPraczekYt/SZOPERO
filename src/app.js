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

const updateResult = document.getElementById("update-result");
const checkButton = document.getElementById("check-updates");

function showUpdateStatus(data) {
  if (data.status === "checking") {
    updateResult.textContent = "Sprawdzanie aktualizacji...";
  } else if (data.status === "available") {
    updateResult.textContent = `Dostępna wersja ${data.version}. Pobieranie...`;
  } else if (data.status === "downloading") {
    updateResult.textContent = `Pobieranie aktualizacji: ${data.percent}%`;
  } else if (data.status === "downloaded") {
    updateResult.textContent = `Wersja ${data.version} jest gotowa do instalacji.`;
    let installButton = document.getElementById("install-update");
    if (!installButton) {
      installButton = document.createElement("button");
      installButton.id = "install-update";
      installButton.textContent = "Zainstaluj aktualizację";
      checkButton.insertAdjacentElement("afterend", installButton);
    }
    installButton.onclick = () => window.szopero.installUpdate();
  } else if (data.status === "not-available") {
    updateResult.textContent = "Masz najnowszą wersję SZOPERO.";
  } else if (data.status === "error") {
    updateResult.textContent = "Błąd aktualizacji: " + data.message;
  }
}

window.szopero.onUpdateStatus(showUpdateStatus);

checkButton.addEventListener("click", async () => {
  updateResult.textContent = "Uruchamianie sprawdzania aktualizacji...";
  const result = await window.szopero.checkUpdates();
  if (!result.started) {
    updateResult.textContent = result.error || "Nie udało się sprawdzić aktualizacji.";
  }
});

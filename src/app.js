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
  try {
    const version = await window.szopero.getVersion();
    document.getElementById("version").textContent = `Wersja ${version}`;
  } catch (error) {
    console.error("Nie udało się pobrać wersji:", error);
  }
})();

const updateResult = document.getElementById("update-result");
const checkButton = document.getElementById("check-updates");

function showUpdateStatus(data) {
  if (!data || !data.status) return;

  if (data.status === "checking") {
    updateResult.textContent = "Sprawdzanie aktualizacji...";
  } else if (data.status === "available") {
    updateResult.textContent = `Dostępna wersja ${data.version}. Pobieranie...`;
  } else if (data.status === "downloading") {
    updateResult.textContent = `Pobieranie aktualizacji: ${Math.round(data.percent || 0)}%`;
  } else if (data.status === "downloaded") {
    updateResult.textContent = `Wersja ${data.version} jest gotowa do instalacji.`;
    let installButton = document.getElementById("install-update");
    if (!installButton) {
      installButton = document.createElement("button");
      installButton.id = "install-update";
      installButton.className = "primary";
      installButton.textContent = "Zainstaluj aktualizację";
      checkButton.insertAdjacentElement("afterend", installButton);
    }
    installButton.onclick = () => window.szopero.installUpdate();
  } else if (data.status === "not-available") {
    updateResult.textContent = "Masz najnowszą wersję SZOPERO.";
  } else if (data.status === "error") {
    updateResult.textContent = "Błąd aktualizacji: " + (data.message || "Nieznany błąd");
  }
}

window.szopero.onUpdateStatus(showUpdateStatus);

checkButton.addEventListener("click", async () => {
  checkButton.disabled = true;
  updateResult.textContent = "Sprawdzanie aktualizacji...";
  try {
    const result = await window.szopero.checkUpdates();
    if (!result.started) {
      updateResult.textContent = result.error || "Nie udało się sprawdzić aktualizacji.";
    }
  } catch (error) {
    updateResult.textContent = "Błąd: " + error.message;
  } finally {
    checkButton.disabled = false;
  }
});

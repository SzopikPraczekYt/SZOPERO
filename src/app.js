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

document.addEventListener("click", event => {
  const button = event.target.closest("[data-launch]");
  if (button) window.szopero.openGame(button.dataset.launch);
});

async function loadGames() {
  const container = document.getElementById("games-list");
  if (!container) return;

  try {
    const response = await fetch("games/games.json");
    if (!response.ok) throw new Error("Nie udało się pobrać biblioteki.");

    const games = await response.json();

    function renderGames(search = "", category = "Wszystkie") {
      const filtered = games.filter(game => {
        const matchesSearch =
          game.name.toLowerCase().includes(search.toLowerCase()) ||
          game.description.toLowerCase().includes(search.toLowerCase());

        const matchesCategory =
          category === "Wszystkie" || game.category === category;

        return matchesSearch && matchesCategory;
      });

      container.innerHTML = "";

      if (!filtered.length) {
        container.innerHTML = '<p class="empty-games">Nie znaleziono gier.</p>';
        return;
      }

      filtered.forEach(game => {
        const card = document.createElement("article");
        card.className = "game-card";

        const art = document.createElement("div");
        art.className = `game-art ${game.color || ""}`;
        if (game.image) {
          const cover = document.createElement("img");
          cover.src = game.image;
          cover.alt = game.name;
          cover.className = "game-cover";
          cover.onerror = () => {
            art.textContent = game.icon || "🎮";
          };
          art.appendChild(cover);
        } else {
          art.textContent = game.icon || "🎮";
        }

        const info = document.createElement("div");
        info.className = "game-info";

        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = game.category;

        const name = document.createElement("h3");
        name.textContent = game.name;

        const description = document.createElement("p");
        description.textContent = game.description;

        info.append(tag, name, description);

        if (game.path) {
          const play = document.createElement("button");
          play.className = "small-primary";
          play.textContent = "Uruchom grę";
          play.dataset.launch = game.id;
          info.append(play);
        } else {
          const soon = document.createElement("span");
          soon.className = "game-soon";
          soon.textContent = "Wkrótce";
          info.append(soon);
        }

        card.append(art, info);
        container.append(card);
      });
    }

    const searchInput = document.getElementById("game-search");
    const categorySelect = document.getElementById("game-category");

    const categories = ["Wszystkie", ...new Set(games.map(game => game.category))];
    categorySelect.innerHTML = "";

    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.append(option);
    });

    searchInput.addEventListener("input", () => {
      renderGames(searchInput.value, categorySelect.value);
    });

    categorySelect.addEventListener("change", () => {
      renderGames(searchInput.value, categorySelect.value);
    });

    renderGames();
  } catch (error) {
    container.textContent = "Nie udało się wczytać biblioteki gier: " + error.message;
  }
}

loadGames();

(async () => {
  try {
    const version = await window.szopero.getVersion();
    document.getElementById("version").textContent = `Wersja ${version}`;
    document.getElementById("updates-version").textContent = version;
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




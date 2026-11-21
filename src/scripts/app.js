const games = [
    {
        id: "geometry-dash",
        name: "Geometry Dash",
        description: "Zręcznościowa gra z przeskakiwaniem przeszkód.",
        category: "Zręcznościowa",
        icon: "🔷",
        path: "src/games/geometry-dash/index.html"
    },
    {
        id: "szopik-click",
        name: "Szopik Click",
        description: "Klikaj i zdobywaj punkty w prostej minigrze.",
        category: "Zręcznościowa",
        icon: "🦝",
        path: "src/games/szopik-click/index.html"
    },
    {
        id: "demo",
        name: "Gra demonstracyjna",
        description: "Sprawdź przykładową grę w SZOPERO.",
        category: "Demonstracyjna",
        icon: "🎮",
        path: "src/games/demo/index.html"
    }
];

const favorites = new Set();

const pageNames = {
    home: "Strona główna",
    games: "Gry",
    favorites: "Ulubione",
    about: "O projekcie",
    player: "Rozgrywka"
};

function showPage(name) {
    document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
    document.getElementById(name)?.classList.add("active");

    document.querySelectorAll(".nav").forEach(button => {
        button.classList.toggle("active", button.dataset.page === name);
    });

    document.getElementById("page-title").textContent = pageNames[name] || "SZOPERO";
}

function renderGames(list, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    list.forEach(game => {
        const card = document.createElement("article");
        card.className = "game-card";

        const cover = document.createElement("div");
        cover.className = "game-cover";
        cover.textContent = game.icon;

        const content = document.createElement("div");
        content.className = "game-content";

        const title = document.createElement("h3");
        title.textContent = game.name;

        const description = document.createElement("p");
        description.textContent = game.description;

        const actions = document.createElement("div");
        actions.className = "card-actions";

        const play = document.createElement("button");
        play.className = "play-button";
        play.textContent = "Graj";
        play.addEventListener("click", () => launchGame(game));

        const favorite = document.createElement("button");
        favorite.className = "favorite-button" + (favorites.has(game.id) ? " selected" : "");
        favorite.textContent = favorites.has(game.id) ? "♥" : "♡";
        favorite.title = "Dodaj do ulubionych";
        favorite.addEventListener("click", () => {
            favorites.has(game.id) ? favorites.delete(game.id) : favorites.add(game.id);
            refreshGames();
        });

        actions.append(play, favorite);
        content.append(title, description, actions);
        card.append(cover, content);
        container.append(card);
    });
}

function refreshGames() {
    renderGames(games, "home-grid");

    const query = document.getElementById("search").value.trim().toLowerCase();
    const filtered = games.filter(game =>
        game.name.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query)
    );

    renderGames(filtered, "games-grid");
    renderGames(games.filter(game => favorites.has(game.id)), "favorites-grid");

    document.getElementById("games-empty").hidden = filtered.length !== 0;
    document.getElementById("favorites-empty").hidden = favorites.size !== 0;
}

function launchGame(game) {
    document.getElementById("player-title").textContent = game.name;
    document.getElementById("game-frame").src = game.path;
    showPage("player");
}

document.querySelectorAll(".nav").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.page));
});

document.querySelectorAll("[data-open]").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.open));
});

document.getElementById("search").addEventListener("input", refreshGames);

document.getElementById("back").addEventListener("click", () => {
    document.getElementById("game-frame").src = "about:blank";
    showPage("games");
});

refreshGames();


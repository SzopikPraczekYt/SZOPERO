const {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  dialog
} = require("electron");

const path = require("path");
const fs = require("fs");
const https = require("https");
const { autoUpdater } = require("electron-updater");

let launcher;
let updatePromptOpen = false;

const pendingNotesFile = path.join(
  app.getPath("userData"),
  "pending-release-notes.json"
);

const welcomeFile = path.join(
  app.getPath("userData"),
  "welcome-2.0.0-shown.json"
);

const games = {
  clicker: {
    name: "Szopik Klikacz",
    file: path.join(__dirname, "src", "games", "szopik-clicker", "index.html")
  },
  "geometry-dash": {
    name: "Geometry Dash Lite",
    file: path.join(__dirname, "src", "games", "geometry-dash", "index.html")
  },
  "szopik-breaker": {
    name: "Szopik Breaker",
    file: path.join(__dirname, "src", "games", "szopik-breaker", "index.html")
  }
};

function createLauncher(show = true) {
  launcher = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 900,
    minHeight: 600,
    title: `SZOPERO - Launcher | ${app.getVersion()}`,
    icon: path.join(__dirname, "assets", "icons", "logo.ico"),
    backgroundColor: "#f5f7fb",
    show,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  return launcher.loadFile(path.join(__dirname, "src", "index.html"));
}

function openGame(id) {
  const game = games[id];
  if (!game) return;

  const loading = new BrowserWindow({
    width: 720,
    height: 420,
    icon: path.join(__dirname, "assets", "icons", "logo.ico"),
    frame: false,
    resizable: false,
    center: true,
    backgroundColor: "#ffffff",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      sandbox: true
    }
  });

  const gameWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 700,
    minHeight: 500,
    title: game.name,
    icon: path.join(__dirname, "assets", "icons", "logo.ico"),
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#101525",
    webPreferences: {
      preload: path.join(__dirname, "game-start-preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  let loadingReady = false;
  let startReady = false;
  let progress = 0;
  let interval;

  function updateProgress(value) {
    progress = value;

    if (loadingReady && !loading.isDestroyed()) {
      loading.webContents.executeJavaScript(
        `window.setProgress(${progress})`
      ).catch(() => {});
    }

    if (progress >= 100 && loadingReady && startReady) {
      clearInterval(interval);

      if (!loading.isDestroyed()) loading.close();
      if (!gameWindow.isDestroyed()) gameWindow.show();
    }
  }

  loading.webContents.once("did-finish-load", () => {
    loadingReady = true;
    updateProgress(progress);
  });

  gameWindow.webContents.once("did-finish-load", () => {
    startReady = true;
    updateProgress(progress);
  });

  gameWindow.on("closed", () => {
    clearInterval(interval);
    if (!loading.isDestroyed()) loading.close();
  });

  loading.on("closed", () => {
    clearInterval(interval);
  });

  loading.loadFile(path.join(__dirname, "src", "loading.html"), { query: { id } });

  gameWindow.loadFile(
    path.join(__dirname, "src", "game-start.html"),
    { query: { id } }
  );

  const loadingSteps = [
    { value: 5, delay: 900 },
    { value: 12, delay: 850 },
    { value: 20, delay: 900 },
    { value: 29, delay: 850 },
    { value: 38, delay: 900 },
    { value: 48, delay: 850 },
    { value: 58, delay: 900 },
    { value: 68, delay: 850 },
    { value: 78, delay: 900 },
    { value: 88, delay: 850 },
    { value: 96, delay: 900 },
    { value: 100, delay: 850 }
  ];

  let step = 0;

  function nextLoadingStep() {
    if (step >= loadingSteps.length) return;

    const current = loadingSteps[step++];
    updateProgress(current.value);

    if (current.value < 100) {
      interval = setTimeout(nextLoadingStep, current.delay);
    }
  }

  nextLoadingStep();
}

ipcMain.handle("start-game", (event, id) => {
  const game = games[id];
  const gameWindow = BrowserWindow.fromWebContents(event.sender);

  if (!game || !gameWindow) return false;

  if (game.url) {
    gameWindow.loadURL(game.url);
  } else {
    gameWindow.loadFile(game.file).then(() => {
      gameWindow.focus();
      gameWindow.webContents.focus();
    });
  }

  return true;
});

ipcMain.handle("open-game", (_event, id) => {
  openGame(id);
  return true;
});

ipcMain.handle("get-version", () => app.getVersion());

function sendUpdateStatus(data) {
  BrowserWindow.getAllWindows().forEach((win) => {
    if (!win.isDestroyed()) {
      win.webContents.send("update-status", data);
    }
  });
}


function fetchLatestRelease() {
  return new Promise((resolve, reject) => {
    const request = https.get(
      "https://api.github.com/repos/SzopikPraczekYt/SZOPERO/releases/latest",
      {
        headers: {
          "User-Agent": "SZOPERO",
          "Accept": "application/vnd.github+json"
        }
      },
      (response) => {
        let body = "";

        response.on("data", chunk => body += chunk);

        response.on("end", () => {
          try {
            if (response.statusCode !== 200) {
              reject(new Error("GitHub zwrócił błąd: " + response.statusCode));
              return;
            }

            const release = JSON.parse(body);

            resolve({
              version: release.tag_name.replace(/^v/, ""),
              name: release.name || "",
              notes: release.body || "",
              url: release.html_url
            });
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    request.on("error", reject);
    request.setTimeout(10000, () => {
      request.destroy(new Error("Przekroczono czas połączenia z GitHubem."));
    });
  });
}

ipcMain.handle("get-latest-release", async () => {
  return await fetchLatestRelease();
});

function getReleaseNotes(info) {
  const notes = info.releaseNotes;

  if (typeof notes === "string") {
    return notes;
  }

  if (Array.isArray(notes)) {
    return notes.map((item) => {
      if (typeof item === "string") return item;
      return item.note || "";
    }).filter(Boolean).join("\n\n");
  }

  return "";
}

function savePendingNotes(info) {
  const data = {
    version: info.version,
    notes: getReleaseNotes(info)
  };

  fs.mkdirSync(path.dirname(pendingNotesFile), { recursive: true });
  fs.writeFileSync(
    pendingNotesFile,
    JSON.stringify(data, null, 2),
    "utf8"
  );
}

async function showWelcomeModal() {
  if (app.getVersion() !== "2.0.0") return;
  if (fs.existsSync(welcomeFile)) return;

  await dialog.showMessageBox(launcher, {
    type: "info",
    title: "Witaj w SZOPERO 2.0.0!",
    message: "SZOPERO 2.0.0 jest już gotowe!",
    detail: "Witaj w nowej wersji launchera SzopikPraczekYT.\n\nOdkrywaj gry, korzystaj z nowych funkcji i sprawdzaj kolejne aktualizacje. Miłego korzystania!",
    buttons: ["Zaczynamy!"],
    defaultId: 0,
    noLink: true
  });

  fs.mkdirSync(path.dirname(welcomeFile), { recursive: true });
  fs.writeFileSync(
    welcomeFile,
    JSON.stringify({ version: "2.0.0", shown: true }, null, 2),
    "utf8"
  );
}
async function showPendingReleaseNotes() {
  if (!fs.existsSync(pendingNotesFile)) return;

  try {
    const data = JSON.parse(
      fs.readFileSync(pendingNotesFile, "utf8")
    );

    if (data.version !== app.getVersion()) return;

    await dialog.showMessageBox(launcher, {
      type: "info",
      title: `Co nowego w SZOPERO ${data.version}?`,
      message: `SZOPERO zostało zaktualizowane do wersji ${data.version}!`,
      detail: data.notes || "Szczegóły tego wydania nie są dostępne.",
      buttons: ["Super!"],
      defaultId: 0
    });

    if (fs.existsSync(pendingNotesFile)) {
      fs.unlinkSync(pendingNotesFile);
    }
  } catch (error) {
    console.error("Nie udało się wyświetlić informacji o wydaniu:", error);
  }
}

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

autoUpdater.on("checking-for-update", () => {
  sendUpdateStatus({ status: "checking" });
});

autoUpdater.on("update-available", async (info) => {
  sendUpdateStatus({
    status: "available",
    version: info.version
  });

  if (updatePromptOpen) return;
  updatePromptOpen = true;

  try {
    const result = await dialog.showMessageBox(launcher, {
      type: "info",
      title: "Dostępna aktualizacja SZOPERO",
      message: `Dostępna jest nowa wersja SZOPERO ${info.version}.`,
      detail: "Czy chcesz teraz pobrać aktualizację?",
      buttons: [
        "Aktualizuj teraz",
        "Przypomnij następnym razem"
      ],
      defaultId: 0,
      cancelId: 1,
      noLink: true
    });

    if (result.response === 0) {
      sendUpdateStatus({ status: "downloading", percent: 0 });
      await autoUpdater.downloadUpdate();
    } else {
      sendUpdateStatus({ status: "deferred" });
    }
  } catch (error) {
    sendUpdateStatus({
      status: "error",
      message: error.message
    });
  } finally {
    updatePromptOpen = false;
  }
});

autoUpdater.on("download-progress", (progress) => {
  sendUpdateStatus({
    status: "downloading",
    percent: Math.round(progress.percent)
  });
});

autoUpdater.on("update-downloaded", (info) => {
  try {
    savePendingNotes(info);
  } catch (error) {
    console.error("Nie udało się zapisać informacji o wydaniu:", error);
  }

  sendUpdateStatus({
    status: "downloaded",
    version: info.version
  });
});

autoUpdater.on("update-not-available", () => {
  sendUpdateStatus({ status: "not-available" });
});

autoUpdater.on("error", (error) => {
  sendUpdateStatus({
    status: "error",
    message: error.message
  });
});

function updaterSupported() {
  if (!app.isPackaged) return false;

  if (process.env.PORTABLE_EXECUTABLE_FILE) {
    return false;
  }

  return true;
}

ipcMain.handle("check-updates", async () => {
  if (!app.isPackaged) {
    return {
      started: false,
      error: "Aktualizacje sprawdzisz w zainstalowanej wersji SZOPERO."
    };
  }

  if (!updaterSupported()) {
    return {
      started: false,
      error: "Automatyczne aktualizacje wymagają wersji instalacyjnej SZOPERO."
    };
  }

  try {
    await autoUpdater.checkForUpdates();
    return { started: true };
  } catch (error) {
    return {
      started: false,
      error: error.message
    };
  }
});

ipcMain.handle("install-update", () => {
  autoUpdater.quitAndInstall();
  return true;
});

ipcMain.handle("open-link", (_event, url) => {
  if (typeof url === "string" && url.startsWith("https://")) {
    shell.openExternal(url);
  }
});

async function showStartupScreen() {
  const splash = new BrowserWindow({
    width: 470,
    height: 340,
    frame: false,
    resizable: false,
    center: true,
    show: false,
    backgroundColor: "#f5f7fb",
    icon: path.join(__dirname, "assets", "icons", "logo.ico"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  await splash.loadFile(path.join(__dirname, "src", "startup.html"));
  splash.show();

  const progress = (value, message) => {
    if (!splash.isDestroyed()) {
      splash.webContents.executeJavaScript(
        `window.setStartupProgress(${value}, ${JSON.stringify(message)})`
      ).catch(() => {});
    }
  };

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  progress(10, "Przygotowujemy aplikację...");
  await wait(900);

  progress(30, "Uruchamiamy moduły SZOPERO...");
  await wait(900);

  progress(55, "Tworzymy okno aplikacji...");
  await createLauncher(false);

  progress(80, "Wczytujemy bibliotekę...");
  await wait(1200);

  progress(100, "SZOPERO jest gotowe!");
  await wait(1100);

  launcher.show();
  splash.close();
}

app.whenReady().then(async () => {
  await showStartupScreen();

  await showWelcomeModal();
  await showPendingReleaseNotes();

  if (updaterSupported()) {
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch((error) => {
        console.error("Błąd sprawdzania aktualizacji:", error);
      });
    }, 5000);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createLauncher();
  }
});









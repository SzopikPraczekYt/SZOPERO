const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

let launcher;

const games = {
  clicker: {
    name: "Szopik Klikacz",
    file: path.join(__dirname, "src", "games", "szopik-clicker", "index.html")
  },
  "geometry-dash": {
    name: "Geometry Dash Lite",
    file: path.join(__dirname, "src", "games", "geometry-dash", "index.html")
  }
};

function createLauncher() {
  launcher = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 900,
    minHeight: 600,
    title: "SZOPERO",
    backgroundColor: "#f5f7fb",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  launcher.loadFile(path.join(__dirname, "src", "index.html"));
}

function openGame(id) {
  const game = games[id];
  if (!game) return;

  const loading = new BrowserWindow({
    width: 420,
    height: 230,
    icon: path.join(__dirname, 'assets', 'icons', 'logo.png'),
    icon: path.join(__dirname, 'assets', 'icons', 'logo.png'),
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
    icon: path.join(__dirname, 'assets', 'icons', 'logo.png'),
    icon: path.join(__dirname, 'assets', 'icons', 'logo.png'),
    minWidth: 700,
    minHeight: 500,
    title: "SZOPERO",
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

  loading.loadFile(path.join(__dirname, "src", "loading.html"));

  gameWindow.loadFile(
    path.join(__dirname, "src", "game-start.html"),
    { query: { id } }
  );

  interval = setInterval(() => {
    if (progress < 100) {
      updateProgress(Math.min(100, progress + 4));
    }
  }, 100);
}

ipcMain.handle("start-game", (event, id) => {
  const game = games[id];
  const gameWindow = BrowserWindow.fromWebContents(event.sender);

  if (!game || !gameWindow) return false;

  if (game.url) {
    gameWindow.loadURL(game.url);
  } else {
    gameWindow.loadFile(game.file);
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

autoUpdater.on("checking-for-update", () => {
  sendUpdateStatus({ status: "checking" });
});

autoUpdater.on("update-available", (info) => {
  sendUpdateStatus({ status: "available", version: info.version });
});

autoUpdater.on("download-progress", (progress) => {
  sendUpdateStatus({
    status: "downloading",
    percent: Math.round(progress.percent)
  });
});

autoUpdater.on("update-downloaded", (info) => {
  sendUpdateStatus({ status: "downloaded", version: info.version });
});

autoUpdater.on("update-not-available", () => {
  sendUpdateStatus({ status: "not-available" });
});

autoUpdater.on("error", (error) => {
  sendUpdateStatus({ status: "error", message: error.message });
});

ipcMain.handle("check-updates", async () => {
  if (!app.isPackaged) {
    return { started: false, error: "Aktualizacje sprawdzisz w zainstalowanej wersji SZOPERO." };
  }

  try {
    await autoUpdater.checkForUpdates();
    return { started: true };
  } catch (error) {
    return { started: false, error: error.message };
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

app.whenReady().then(() => {
  createLauncher();
  if (app.isPackaged) {
    setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 5000);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createLauncher();
});







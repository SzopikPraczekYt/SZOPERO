const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("szopero", {
  openGame: (id) => ipcRenderer.invoke("open-game", id),
  getVersion: () => ipcRenderer.invoke("get-version"),
  getLatestRelease: () => ipcRenderer.invoke("get-latest-release"),
  checkUpdates: () => ipcRenderer.invoke("check-updates"),
  installUpdate: () => ipcRenderer.invoke("install-update"),
  onUpdateStatus: (callback) => {
    ipcRenderer.on("update-status", (_event, data) => callback(data));
  },
  openLink: (url) => ipcRenderer.invoke("open-link", url)
});


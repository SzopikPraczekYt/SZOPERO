const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("szopero", {
  openGame: (id) => ipcRenderer.invoke("open-game", id),
  getVersion: () => ipcRenderer.invoke("get-version"),
  checkUpdates: () => ipcRenderer.invoke("check-updates"),
  openLink: (url) => ipcRenderer.invoke("open-link", url)
});

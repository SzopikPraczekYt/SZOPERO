const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("gameLauncher", {
    startGame: (id) => ipcRenderer.invoke("start-game", id)
});

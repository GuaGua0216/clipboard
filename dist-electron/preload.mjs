"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // 2. 我們定義一個*特定的*函式，叫做 onClipboardUpdate
  //    (這個函式是給 React 介面呼叫的)
  onClipboardUpdate: (callback) => {
    electron.ipcRenderer.on("clipboard-updated", callback);
    return () => electron.ipcRenderer.removeListener("clipboard-updated", callback);
  }
  // (你原本的 'ipcRenderer' 物件 現在整個被移除了，變得更安全！)
});

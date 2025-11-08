import { ipcRenderer, contextBridge, IpcRendererEvent } from 'electron'

// 1. 我們不再暴露整個 'ipcRenderer'，而是暴露一個 'electronAPI'
contextBridge.exposeInMainWorld('electronAPI', {
  
  // 2. 我們定義一個*特定的*函式，叫做 onClipboardUpdate
  //    (這個函式是給 React 介面呼叫的)
  onClipboardUpdate: (callback: (event: IpcRendererEvent, value: string) => void) => {
    
    // 3. 在內部，我們*寫死*它只能監聽 'clipboard-updated' 這個頻道
    //    (這就是 'main.ts' 正在發送的頻道名稱)
    ipcRenderer.on('clipboard-updated', callback);
    
    // 4. 我們回傳一個「取消函式」
    //    這樣 React 就可以在元件移除時，取消監聽，避免記憶體洩漏
    return () => ipcRenderer.removeListener('clipboard-updated', callback);
  }

  // (你原本的 'ipcRenderer' 物件 現在整個被移除了，變得更安全！)
})

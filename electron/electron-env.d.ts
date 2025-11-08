/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  // ipcRenderer: import('electron').IpcRenderer
  // 新的:
  electronAPI: {
    // 讓 TypeScript 知道 onClipboardUpdate 函式的型別
    onClipboardUpdate: (
      callback: (event: import('electron').IpcRendererEvent, value: string) => void
    ) => () => void; // ⇐ 這個函式會回傳一個「取消函式」，這樣 React 就可以在元件移除時，取消監聽，避免記憶體洩漏
  }
}

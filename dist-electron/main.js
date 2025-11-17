import { app as t, BrowserWindow as l, clipboard as s } from "electron";
import { fileURLToPath as p } from "node:url";
import o from "node:path";
const c = o.dirname(p(import.meta.url));
process.env.APP_ROOT = o.join(c, "..");
const r = process.env.VITE_DEV_SERVER_URL, m = o.join(process.env.APP_ROOT, "dist-electron"), d = o.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = r ? o.join(process.env.APP_ROOT, "public") : d;
let e;
function a() {
  e = new l({
    icon: o.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: o.join(c, "preload.mjs")
    }
  }), e.setMenu(null), e.webContents.on("did-finish-load", () => {
    console.log("Renderer 載入完成，開始監聽剪貼簿...");
    let i = s.readText();
    setInterval(() => {
      const n = s.readText();
      n !== i && n.trim() !== "" && (i = n, console.log("偵測到剪貼簿變化:", n), e == null || e.webContents.send("clipboard-updated", n));
    }, 1e3);
  }), r ? e.loadURL(r) : e.loadFile(o.join(d, "index.html"));
}
t.on("window-all-closed", () => {
  process.platform !== "darwin" && (t.quit(), e = null);
});
t.on("activate", () => {
  l.getAllWindows().length === 0 && a();
});
t.whenReady().then(a);
export {
  m as MAIN_DIST,
  d as RENDERER_DIST,
  r as VITE_DEV_SERVER_URL
};

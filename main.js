const { app, BrowserWindow } = require('electron');

// 建立應用程式視窗的函式
function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  });

  // 讓視窗載入 index.html 這個檔案
  win.loadFile('index.html');
}

// 當 Electron 準備好時，就呼叫 createWindow 來顯示視窗
app.whenReady().then(createWindow);

// 處理 macOS 的特殊情況
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
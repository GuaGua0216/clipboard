import { useState, useEffect } from 'react' // ⇐ 1. 匯入 useEffect
import './App.css'
import Login from './components/login'
import ClipboardList from './components/ClipboardList'
//import tailwindcss from '@tailwindcss/vite' // <-- 這行通常在 vite.config.ts，放在這可能無效

// 2. 匯入 Firebase 的 auth 和相關函式
import { auth } from './firebase/firebaseConfig' // ⇐ 確保路徑正確
import { onAuthStateChanged, signOut, User } from 'firebase/auth'

// 註解掉你舊的 Page type 和 NavBar，因為我們現在用 isLoggedIn 來控制
// type Page = 'home' | 'login'
// ... (NavBar 和 Home 的註解) ...


function App() {
  // 3. 我們需要兩個 state
  // isLoggedIn: 使用者是否登入
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  // isLoading: 是否還在向 Firebase 確認登入狀態
  const [isLoading, setIsLoading] = useState(true) 
  
  // 4. (可選) 儲存使用者資訊
  const [user, setUser] = useState<User | null>(null);

  // 5. App 啟動時，設定 Firebase 監聽器
  useEffect(() => {
    // onAuthStateChanged 會回傳一個 "unsubscribe" 函式
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // --- 使用者已登入 ---
        setIsLoggedIn(true);
        setUser(user); // (可選) 儲存 user 物件
        console.log("監聽器：使用者已登入", user.email);
      } else {
        // --- 使用者已登出 ---
        setIsLoggedIn(false);
        setUser(null);
        console.log("監聽器：使用者已登出");
      }
      // 無論登入或登出，都代表檢查完畢
      setIsLoading(false);
    });

    // 在組件卸載 (unmount) 時，取消監聽
    return () => unsubscribe();
    
  }, []); // 空依賴陣列 [] 表示這個 effect 只在 App 首次載入時執行一次


  // 6. 建立登出函式，並傳給 ClipboardList
  const handleLogout = () => {
    signOut(auth).catch((error) => {
      console.error("登出失敗:", error);
    });
    // 呼叫 signOut 後，上面的 onAuthStateChanged 會自動被觸發
    // 並將 isLoggedIn 設為 false
  }

  // 7. 渲染邏輯
  
  // (A) 如果還在檢查登入狀態，顯示「載入中...」
  if (isLoading) {
    return (
      <div id="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>載入中...</h2>
      </div>
    )
  }

  // (B) 檢查完畢，根據 isLoggedIn 顯示 登入頁 或 主頁
  return (
    <div id="app-container"> 
      {!isLoggedIn ? (
        // (C) 未登入：顯示 Login
        <Login onLoginSuccess={() => setIsLoggedIn(true)} /> 
      ) : (
        // (D) 已登入：顯示 ClipboardList，並傳入登出函式
        <ClipboardList {...({ onLogout: handleLogout } as any)} /> 
      )}
    </div>
  )
}

export default App
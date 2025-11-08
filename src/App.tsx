import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/login'
import ClipboardList from './components/ClipboardList'
import { auth } from './firebase/firebaseConfig'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'

function App() {
  // 1. 移除 isLoggedIn state，我們只需要這兩個
  const [isLoading, setIsLoading] = useState(true) 
  const [user, setUser] = useState<User | null>(null);

  // 2. onAuthStateChanged 是唯一的狀態來源
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // --- 使用者已登入 ---
        setUser(user); // ⇐ 只設定 user
        console.log("監聽器：使用者已登入", user.email);
      } else {
        // --- 使用者已登出 ---
        setUser(null); // ⇐ 只設定 user
        console.log("監聽器：使用者已登出");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
    
  }, []); // ⇐ 空依賴陣列，只執行一次


  // 3. 登出函式 (保持不變)
  const handleLogout = () => {
    signOut(auth).catch((error) => {
      console.error("登出失敗:", error);
    });
    // 呼叫 signOut 後, 上面的 onAuthStateChanged 會自動觸發並將 user 設為 null
  }

  // 4. 渲染邏輯
  
  // (A) 如果還在檢查登入狀態 (App 剛啟動)，顯示「載入中...」
  if (isLoading) {
    return (
      <div id="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>載入中...</h2>
      </div>
    )
  }

  // (B) 檢查完畢，根據 user 是否存在來顯示
  return (
    <div id="app-container"> 
      {/* ⭐️ 關鍵修改：
        如果 user state 不是 null (代表已登入)，就顯示 ClipboardList
        如果 user state 是 null (代表未登入)，就顯示 Login
      */}
      {user ? (
        // (C) 已登入：user 物件必定存在，直接傳下去
        <ClipboardList onLogout={handleLogout} user={user} />
      ) : (
        // (D) 未登入：顯示 Login (移除 onLoginSuccess)
        <Login /> 
      )}
    </div>
  )
}

export default App
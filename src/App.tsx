import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/login'
import ClipboardList from './components/ClipboardList'
import { auth } from './firebase/firebaseConfig'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'

function App() {
  // 3. 我們需要兩個 state
  // isLoggedIn: 使用者是否登入
  // const [isLoggedIn, setIsLoggedIn] = useState(false)
  // isLoading: 是否還在向 Firebase 確認登入狀態
  const [isLoading, setIsLoading] = useState(true) 
  
  // 4. (可選) 儲存使用者資訊
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false); // (保留你的深色模式)

  // --- 2. 你的深色模式切換 (保留) ---
  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  
  // (⭐️ 新增：讓深色模式持久化，並更新 <html> 標籤)
  useEffect(() => {
    // 檢查 localStorage 中儲存的偏好
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialMode = savedMode !== null ? (savedMode === 'true') : prefersDark;
    
    setIsDarkMode(initialMode);
  }, []); // 僅在 App 啟動時檢查一次

  // 當 isDarkMode 狀態改變時，更新 class 和 localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);


  // --- 3. Firebase 監聽器 (修改) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // --- 使用者已登入 ---
        // setIsLoggedIn(true);
        setUser(user); // (可選) 儲存 user 物件
        console.log("監聽器：使用者已登入", user.email);
      } else {
        // --- 使用者已登出 ---
        // setIsLoggedIn(false);
        setUser(null);
        console.log("監聽器：使用者已登出");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []); 

  // --- 4. 登出函式 (保留) ---
  const handleLogout = () => {
    signOut(auth).catch((error) => {
      console.error("登出失敗:", error);
    });
  }

  // --- 5. 渲染邏輯 (合併) ---
  
  // (⭐️ 修正：統一管理背景色)
  const backgroundClass = isDarkMode ? 'bg-gray-700' : 'bg-blue-200';

  // (A) 載入中 (保留你的版本，並修正 class)
  if (isLoading) {
    return (
      <div id="app-container"
        // (⭐️ 修正：使用 w-full h-full 並套用統一背景)
        className={`w-full h-full flex flex-col ${backgroundClass} transition-colors duration-300`}
      >
        <button
          className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-full shadow px-3 py-2 text-lg"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <div className="w-full h-full flex items-center justify-center"> {/* 簡化 */}
          <svg className="animate-spin h-10 w-10 text-blue-400 dark:text-yellow-300 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">載入中...</h2>
        </div>
      </div>
    )
  }

  // (B) 載入完成 (保留你的深色模式，但修改渲染邏輯)
  return (
    <div id="app-container"
      // (⭐️ 修正：使用 w-full h-full 並套用統一背景)
      className={`w-full h-full flex flex-col ${backgroundClass} transition-colors duration-300`}
    >
      <button
        className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-full shadow px-3 py-2 text-lg"
        onClick={toggleDarkMode}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
      <div className="w-full h-full flex flex-col">
        {!user ? ( // (A)
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* <Login onLoginSuccess={() => setIsLoggedIn(true)} /> */}
            <Login isDarkMode={isDarkMode} /> {/* (B) */}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* <ClipboardList {...({ onLogout: handleLogout } as any)} /> */}
            {/* <ClipboardList user={user} onLogout={handleLogout} /> (C) */}
            <ClipboardList user={user} onLogout={handleLogout} isDarkMode={isDarkMode} />
            {/* 將 `user` prop 傳給 <ClipboardList> */}
          </div>
        )}
      </div>
    </div>
  )
}

export default App

import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/electron-vite.animate.svg'
import './App.css'
import Login from './components/login'
import ClipboardList from './components/ClipboardList'
import tailwindcss from '@tailwindcss/vite'

type Page = 'home' | 'login'

// function NavBar({ current, onNavigate }: { current: Page; onNavigate: (p: Page) => void }) {
//   return (
//     <header className="navbar">
//       <div className="brand" onClick={() => onNavigate('home')}>MyWebApp</div>
//       <nav className="nav-links">
//         <a href="#" className={current === 'home' ? 'active' : ''} onClick={e => {e.preventDefault(); onNavigate('home')}}>首頁</a>
//         <a href="#" className={current === 'login' ? 'active' : ''} onClick={e => {e.preventDefault(); onNavigate('login')}}>登入</a>
//       </nav>
//     </header>
//   )
// }

// function Home() {
//   return (
//     <div className="page home">
//       <div className="logo-row">
//         <img src={viteLogo} className="logo" alt="Vite logo" />
//         <img src={reactLogo} className="logo react" alt="React logo" />
//       </div>
//       <h1>歡迎來到首頁</h1>
//       <p className="lead">這是一個簡潔美觀的網頁式App範例。</p>
//     </div>
//   )
// }



function App() {
  // 1. 使用 useState 管理登入狀態，初始為 false (未登入)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  return (
    <div id="app-container"> 
      {/* 2. 條件渲染：如果 isLoggedIn 是 false，顯示 Login */}
      {!isLoggedIn ? (
        // 3. 將 setIsLoggedIn(true) 作為回呼傳遞給 Login 元件
        <Login onLoginSuccess={() => setIsLoggedIn(true)} /> 
      ) : (
        // 4. 如果 isLoggedIn 是 true，顯示 ClipboardList
        <ClipboardList /> 
      )}
    </div>
  )
}

export default App

import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/electron-vite.animate.svg'
import './App.css'
import { Login } from './components/login'

type Page = 'home' | 'login'

function NavBar({ current, onNavigate }: { current: Page; onNavigate: (p: Page) => void }) {
  return (
    <header className="navbar">
      <div className="brand" onClick={() => onNavigate('home')}>MyWebApp</div>
      <nav className="nav-links">
        <a href="#" className={current === 'home' ? 'active' : ''} onClick={e => {e.preventDefault(); onNavigate('home')}}>首頁</a>
        <a href="#" className={current === 'login' ? 'active' : ''} onClick={e => {e.preventDefault(); onNavigate('login')}}>登入</a>
      </nav>
    </header>
  )
}

function Home() {
  return (
    <div className="page home">
      <div className="logo-row">
        <img src={viteLogo} className="logo" alt="Vite logo" />
        <img src={reactLogo} className="logo react" alt="React logo" />
      </div>
      <h1>歡迎來到首頁</h1>
      <p className="lead">這是一個簡潔美觀的網頁式App範例。</p>
    </div>
  )
}



function App() {
  const [page, setPage] = useState<Page>('home')
  return (
    <div id="app-root">
      <NavBar current={page} onNavigate={setPage} />
      <main className="container">
        {page === 'home' && <Home />}
        {page === 'login' && <Login />}
      </main>
      <footer className="site-footer">© {new Date().getFullYear()} MyWebApp</footer>
    </div>
  )
}

export default App

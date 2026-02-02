import { Routes, Route, NavLink } from 'react-router-dom'
import { useEffect } from 'react'
import './App.css'
import Dashboard from './pages/Dashboard'
import Practice from './pages/Practice'
import VocabularyPractice from './pages/VocabularyPractice'
import { useThemeStore } from './store/themeStore'

function App() {
  const { theme, toggleTheme } = useThemeStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="app">
      <header className="app-header">
        <h1>C1 Examiner</h1>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/vocabulary">Vocabulary</NavLink>
          <NavLink to="/practice">Practice</NavLink>
        </nav>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          <span className="theme-toggle-track">
            <span className="theme-toggle-thumb" />
          </span>
          <span className="theme-toggle-label">{theme === 'light' ? '☀️' : '🌙'}</span>
        </button>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route index element={<Dashboard />} />
          <Route path="/vocabulary" element={<VocabularyPractice />} />
          <Route path="/practice" element={<Practice />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

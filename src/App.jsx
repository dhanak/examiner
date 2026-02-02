import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Dashboard from './pages/Dashboard'
import Practice from './pages/Practice'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>C1 Examiner</h1>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/practice">Practice</Link>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/practice" element={<Practice />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

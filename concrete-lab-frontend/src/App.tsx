import React, { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Registration from './pages/Registration'
import Profile from './pages/Profile'
import Favorites from './pages/Favorites'
import Cart from './pages/Cart'
import Tests from './pages/Tests'
import TestDetail from './pages/TestDetail'
import TestEdit from './pages/TestEdit'
import AuthModal from './components/AuthModal'
import { clearSession, loadStoredUser, User } from './api/auth'

const App: React.FC = () => {
  const location = useLocation()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const isFullWidthPage = location.pathname === '/' || location.pathname === '/services'

  // Восстановить сессию после обновления страницы
  useEffect(() => {
    setUser(loadStoredUser())
  }, [])

  const handleLogout = () => {
    clearSession()
    setUser(null)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f8fa] text-slate-900">
      <Header
        user={user}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className={isFullWidthPage ? 'flex-grow' : 'site-container flex-grow py-8'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services userRole={user?.role} />} />
          <Route
            path="/tests"
            element={<Tests user={user} onLoginClick={() => setIsAuthModalOpen(true)} />}
          />
          <Route
            path="/tests/:id/edit"
            element={<TestEdit user={user} onLoginClick={() => setIsAuthModalOpen(true)} />}
          />
          <Route
            path="/tests/:id"
            element={<TestDetail user={user} onLoginClick={() => setIsAuthModalOpen(true)} />}
          />
          <Route path="/registration" element={<Registration onAuth={setUser} />} />
          <Route
            path="/profile"
            element={
              <Profile
                user={user}
                onLogout={handleLogout}
                onUserUpdate={setUser}
              />
            }
          />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </main>

      <Footer />

      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={(userData) => {
            setUser(userData)
            setIsAuthModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

export default App

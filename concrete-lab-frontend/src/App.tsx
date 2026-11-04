import React, { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import axios from 'axios'
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
import ContactRequests from './pages/ContactRequests'
import Frost from './pages/Frost'
import FrostDetail from './pages/FrostDetail'
import AuthModal from './components/AuthModal'
import { AUTH_EXPIRED_EVENT, clearSession, fetchMe, getToken, loadStoredUser, saveUser, User } from './api/auth'

const App: React.FC = () => {
  const location = useLocation()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authNotice, setAuthNotice] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const isFullWidthPage = location.pathname === '/' || location.pathname === '/services'

  const openLogin = (notice = '') => {
    setAuthNotice(notice)
    setIsAuthModalOpen(true)
  }

  // Восстановить сессию после обновления страницы. Просроченный токен сразу сбрасываем.
  useEffect(() => {
    const token = getToken()
    const stored = loadStoredUser()
    if (!token || !stored) {
      if (token || localStorage.getItem('user')) {
        clearSession()
        openLogin('Сессия истекла. Войдите снова.')
      }
      setUser(null)
      return
    }
    setUser(stored)
    fetchMe()
      .then((me) => {
        saveUser(me)
        setUser(me)
      })
      .catch((err: unknown) => {
        if (!axios.isAxiosError(err) || err.response?.status === 401) {
          setUser(null)
        }
      })
  }, [])

  useEffect(() => {
    const onExpired = () => {
      setUser(null)
      openLogin('Сессия истекла. Войдите снова.')
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired)
  }, [])

  const handleLogout = () => {
    clearSession()
    setUser(null)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f8fa] text-slate-900">
      <Header
        user={user}
        onLoginClick={() => openLogin()}
        onLogout={handleLogout}
      />

      <main className={isFullWidthPage ? 'flex-grow' : 'site-container flex-grow py-8'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services userRole={user?.role} />} />
          <Route
            path="/tests"
            element={<Tests user={user} onLoginClick={() => openLogin()} />}
          />
          <Route
            path="/tests/:id/edit"
            element={<TestEdit user={user} onLoginClick={() => openLogin()} />}
          />
          <Route
            path="/tests/:id"
            element={<TestDetail user={user} onLoginClick={() => openLogin()} />}
          />
          <Route
            path="/frost"
            element={<Frost user={user} onLoginClick={() => openLogin()} />}
          />
          <Route
            path="/frost/:id"
            element={<FrostDetail user={user} onLoginClick={() => openLogin()} />}
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
          <Route
            path="/contact-requests"
            element={
              <ContactRequests
                user={user}
                onLoginClick={openLogin}
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
          notice={authNotice}
          onClose={() => {
            setAuthNotice('')
            setIsAuthModalOpen(false)
          }}
          onLogin={(userData) => {
            setAuthNotice('')
            setUser(userData)
            setIsAuthModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

export default App

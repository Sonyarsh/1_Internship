import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Registration from './pages/Registration'
import Profile from './pages/Profile'
import Favorites from './pages/Favorites'
import Cart from './pages/Cart'
import AuthModal from './components/AuthModal'

const App: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; role: 'user' | 'admin' } | null>(null)

  const toggleAuthModal = () => setIsAuthModalOpen(!isAuthModalOpen)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header 
        user={user} 
        onLoginClick={toggleAuthModal} 
        onLogout={() => setUser(null)}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services userRole={user?.role} />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </main>

      <Footer />

      {isAuthModalOpen && (
        <AuthModal 
          onClose={toggleAuthModal} 
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

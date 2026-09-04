import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, User, Heart, LogOut } from 'lucide-react'
import type { User as AuthUser } from '../api/auth'

interface HeaderProps {
  user: AuthUser | null
  onLoginClick: () => void
  onLogout: () => void
}

const Header: React.FC<HeaderProps> = ({ user, onLoginClick, onLogout }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">B</div>
          <span className="hidden md:inline">БетонЛаб</span>
        </Link>

        <nav className="hidden md:flex space-x-6">
          <Link to="/about" className="hover:text-primary transition-colors">О нас</Link>
          <Link to="/services" className="hover:text-primary transition-colors">Услуги</Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link to="/favorites" className="p-2 hover:bg-gray-100 rounded-full relative" title="Избранное">
            <Heart size={20} />
          </Link>
          <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full relative" title="Корзина">
            <ShoppingCart size={20} />
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4 border-l pl-4 ml-2">
              <Link to="/profile" className="flex items-center gap-2 hover:text-primary">
                <User size={20} />
                <span className="text-sm font-medium">{user.name}</span>
              </Link>
              <button 
                onClick={onLogout}
                className="p-2 hover:bg-red-50 text-red-600 rounded-full"
                title="Выйти"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={onLoginClick}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Войти
              </button>
              <Link 
                to="/registration"
                className="hidden sm:block text-primary hover:underline px-2 py-2"
              >
                Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

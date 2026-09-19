import React from 'react'
import { Link } from 'react-router-dom'
import { FlaskConical, LogOut, Phone, User } from 'lucide-react'
import type { User as AuthUser } from '../api/auth'

interface HeaderProps {
  user: AuthUser | null
  onLoginClick: () => void
  onLogout: () => void
}

const Header: React.FC<HeaderProps> = ({ user, onLoginClick, onLogout }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="site-container flex min-h-[76px] items-center justify-between gap-5">
        <Link to="/" className="flex shrink-0 items-center gap-3 text-navy">
          <span className="relative grid h-11 w-11 place-items-center bg-primary text-white">
            <FlaskConical size={23} />
            <i className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent ring-2 ring-white" />
          </span>
          <span className="leading-none">
            <strong className="block text-xl font-black uppercase tracking-tight">БетонЛаб</strong>
            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-primary">
              испытательная лаборатория
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-bold text-navy lg:flex">
          <Link to="/services" className="transition-colors hover:text-primary">Услуги</Link>
          <Link to="/tests" className="transition-colors hover:text-primary">Испытания</Link>
          <Link to="/about" className="transition-colors hover:text-primary">О лаборатории</Link>
          <a href="#contacts" className="transition-colors hover:text-primary">Контакты</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="tel:+375447778899"
            className="hidden items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark md:flex"
          >
            <Phone size={15} /> Позвонить
          </a>
          {user ? (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-md px-2 py-2 text-navy transition hover:bg-primary-light"
              >
                <User size={18} />
                <span className="hidden text-sm font-bold sm:inline">{user.name}</span>
              </Link>
              <button
                onClick={onLogout}
                className="rounded-md p-2 text-red-600 transition hover:bg-red-50"
                title="Выйти"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onLoginClick}
                className="rounded-md border border-primary px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary-light"
              >
                Войти
              </button>
              <Link
                to="/registration"
                className="hidden rounded-md bg-navy px-4 py-2 text-sm font-bold text-white transition hover:bg-primary sm:block"
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

import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FlaskConical, LogOut, Menu, Phone, User, X } from 'lucide-react'
import type { User as AuthUser } from '../api/auth'

interface HeaderProps {
  user: AuthUser | null
  onLoginClick: () => void
  onLogout: () => void
}

const Header: React.FC<HeaderProps> = ({ user, onLoginClick, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // Закрывать меню при смене страницы
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.hash])

  // Не прокручивать фон, пока открыто меню
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  const navLinkClass =
    'block rounded-md px-3 py-2.5 text-sm font-bold text-navy transition hover:bg-primary-light hover:text-primary lg:inline lg:rounded-none lg:bg-transparent lg:px-0 lg:py-0'

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="site-container flex min-h-[76px] items-center justify-between gap-5">
        <Link to="/" className="flex shrink-0 items-center gap-3 text-navy" onClick={closeMenu}>
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
          <Link to="/services" className="transition-colors hover:text-primary">
            Услуги
          </Link>
          <Link to="/tests" className="transition-colors hover:text-primary">
            Испытания
          </Link>
          <Link to="/about" className="transition-colors hover:text-primary">
            О лаборатории
          </Link>
          <Link to="/#contacts" className="transition-colors hover:text-primary">
            Контакты
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="transition-colors hover:text-primary">
              Админ
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="tel:+375447778899"
            title="Позвонить в лабораторию"
            className="hidden items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark md:flex"
          >
            <Phone size={15} />
            <span>+375 44 777-88-99</span>
          </a>
          {user ? (
            <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 sm:flex">
              <Link
                to={user.role === 'admin' ? '/admin' : '/profile'}
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
            <div className="hidden items-center gap-2 sm:flex">
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

          <button
            type="button"
            className="rounded-md p-2 text-navy transition hover:bg-primary-light lg:hidden"
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <div className="site-container space-y-1 py-4">
            <Link to="/services" className={navLinkClass} onClick={closeMenu}>
              Услуги
            </Link>
            <Link to="/tests" className={navLinkClass} onClick={closeMenu}>
              Испытания
            </Link>
            <Link to="/about" className={navLinkClass} onClick={closeMenu}>
              О лаборатории
            </Link>
            <Link to="/#contacts" className={navLinkClass} onClick={closeMenu}>
              Контакты
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className={navLinkClass} onClick={closeMenu}>
                Админ
              </Link>
            )}

            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
              <a
                href="tel:+375447778899"
                className="flex items-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-bold text-white"
                onClick={closeMenu}
              >
                <Phone size={16} /> +375 44 777-88-99
              </a>

              {user ? (
                <>
                  <Link
                    to={user.role === 'admin' ? '/admin' : '/profile'}
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-bold text-navy hover:bg-primary-light"
                    onClick={closeMenu}
                  >
                    <User size={16} /> {user.name} · профиль
                  </Link>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50"
                    onClick={() => {
                      closeMenu()
                      onLogout()
                    }}
                  >
                    <LogOut size={16} /> Выйти
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="w-full rounded-md border border-primary px-3 py-2.5 text-sm font-bold text-primary"
                    onClick={() => {
                      closeMenu()
                      onLoginClick()
                    }}
                  >
                    Войти
                  </button>
                  <Link
                    to="/registration"
                    className="block rounded-md bg-navy px-3 py-2.5 text-center text-sm font-bold text-white"
                    onClick={closeMenu}
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header

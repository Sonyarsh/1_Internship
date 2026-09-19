import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FlaskConical, LockKeyhole, X } from 'lucide-react'
import { loginUser, saveSession, User } from '../api/auth'
import axios from 'axios'

interface AuthModalProps {
  onClose: () => void
  onLogin: (user: User) => void
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await loginUser({ email, password })
      saveSession(result.access_token, result.user)
      onLogin(result.user)
      navigate('/profile')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError('Нет связи с API. Запустите python main.py и проверьте порт 8080.')
        } else {
          const detail = err.response.data?.detail
          if (typeof detail === 'string') {
            setError(detail)
          } else if (Array.isArray(detail)) {
            setError(detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join('; ') || 'Ошибка данных')
          } else {
            setError(`Ошибка входа (${err.response.status})`)
          }
        }
      } else {
        setError('Не удалось войти. Проверьте, что API запущен.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden border-t-4 border-primary bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-2 text-slate-500 transition hover:bg-slate-100"
          aria-label="Закрыть"
        >
          <X size={21} />
        </button>

        <div className="p-8 sm:p-10">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center bg-primary text-white">
              <FlaskConical size={22} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">БетонЛаб</p>
              <h2 className="text-2xl font-black text-navy">Вход в кабинет</h2>
            </div>
          </div>
          <p className="mb-7 mt-4 text-sm leading-relaxed text-slate-500">
            Авторизуйтесь, чтобы открыть свои испытания и протоколы.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="lab-label">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="lab-input"
                placeholder="example@mail.com"
              />
            </div>
            <div>
              <label className="lab-label">Пароль</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="lab-input"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="lab-button-primary mt-4 w-full gap-2"
            >
              <LockKeyhole size={17} />
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <p className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
            Нет аккаунта?{' '}
            <Link to="/registration" onClick={onClose} className="text-primary hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthModal

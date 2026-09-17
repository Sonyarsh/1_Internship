import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full text-gray-500"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Авторизация</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="example@mail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors mt-4 disabled:opacity-60"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
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

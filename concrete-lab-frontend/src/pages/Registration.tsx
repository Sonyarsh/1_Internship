import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CheckCircle2, FlaskConical } from 'lucide-react'
import { loginUser, registerUser, saveSession, User } from '../api/auth'

interface RegistrationProps {
  onAuth: (user: User) => void
}

const Registration: React.FC<RegistrationProps> = ({ onAuth }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }
    if (formData.password.length < 6) {
      setError('Пароль должен быть не короче 6 символов')
      return
    }

    setLoading(true)
    try {
      // 1) Создать пользователя
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      // 2) Сразу войти, чтобы получить токен
      const result = await loginUser({
        email: formData.email,
        password: formData.password,
      })
      saveSession(result.access_token, result.user)
      onAuth(result.user)
      navigate('/profile')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail
        setError(typeof detail === 'string' ? detail : 'Ошибка регистрации')
      } else {
        setError('Не удалось зарегистрироваться. Проверьте, что API запущен.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden bg-white shadow-[0_18px_50px_rgba(0,52,80,.12)] md:grid-cols-[.85fr_1.15fr]">
      <aside className="bg-navy p-8 text-white sm:p-10">
        <span className="grid h-12 w-12 place-items-center bg-primary">
          <FlaskConical size={25} />
        </span>
        <p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-sky-300">Личный кабинет</p>
        <h1 className="mt-3 text-3xl font-black">Создайте аккаунт БетонЛаб</h1>
        <p className="mt-4 leading-relaxed text-slate-300">
          Сохраняйте испытания и работайте только со своими протоколами.
        </p>
        <ul className="mt-8 space-y-4 text-sm text-slate-200">
          {['Защищённый доступ', 'История испытаний', 'Расчёт показателей'].map((item) => (
            <li key={item} className="flex items-center gap-3">
              <CheckCircle2 className="text-sky-300" size={18} /> {item}
            </li>
          ))}
        </ul>
      </aside>

      <div className="p-8 sm:p-10">
        <span className="section-eyebrow">Регистрация</span>
        <h2 className="mt-2 text-3xl font-black text-navy">Новый пользователь</h2>
        <p className="mt-2 text-sm text-slate-500">Все поля обязательны для заполнения.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="pt-4">
            <label className="lab-label">Имя</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="lab-input"
              placeholder="Введите ваше имя"
              required
            />
          </div>
          <div>
            <label className="lab-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="lab-input"
              placeholder="example@mail.com"
              required
            />
          </div>
          <div>
            <label className="lab-label">Пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="lab-input"
              placeholder="минимум 6 символов"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="lab-label">Подтвердите пароль</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="lab-input"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && <p className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="lab-button-primary w-full"
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Уже есть аккаунт? Вернитесь на главную и нажмите «Войти».
        </p>
        <Link to="/" className="mt-3 block text-center text-sm font-bold text-primary hover:underline">
          ← На главную
        </Link>
      </div>
    </div>
  )
}

export default Registration

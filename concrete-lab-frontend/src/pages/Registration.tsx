import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CheckCircle2, FlaskConical } from 'lucide-react'
import { loginUser, registerUser, saveSession, User } from '../api/auth'
import { COUNTRY_CODES, findCountry } from '../phone'
import PasswordInput from '../components/PasswordInput'

interface RegistrationProps {
  onAuth: (user: User) => void
}

const blockClipboard = (e: React.ClipboardEvent | React.DragEvent) => {
  e.preventDefault()
}

const Registration: React.FC<RegistrationProps> = ({ onAuth }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+375',
    phoneLocal: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedCountry = findCountry(formData.countryCode)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'phoneLocal') {
      // только цифры
      setFormData({ ...formData, phoneLocal: value.replace(/\D/g, '') })
      return
    }
    setFormData({ ...formData, [name]: value })
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
    if (formData.phoneLocal.length < 7) {
      setError('Введите номер телефона без кода страны')
      return
    }

    const phone = `${formData.countryCode}${formData.phoneLocal}`

    setLoading(true)
    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        phone,
        password: formData.password,
      })
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
        if (typeof detail === 'string') {
          setError(detail)
        } else if (Array.isArray(detail)) {
          setError(
            detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join('; ') ||
              'Ошибка регистрации'
          )
        } else {
          setError('Ошибка регистрации')
        }
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
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
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
            <label className="lab-label">Телефон</label>
            <div className="flex gap-2">
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className="lab-input w-[9.5rem] shrink-0"
                aria-label="Код страны"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                name="phoneLocal"
                value={formData.phoneLocal}
                onChange={handleChange}
                className="lab-input min-w-0 flex-1"
                placeholder={selectedCountry.placeholder}
                inputMode="numeric"
                required
                minLength={7}
                maxLength={selectedCountry.digits + 2}
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Выберите страну (по умолчанию BY +375) и введите номер без кода.
            </p>
          </div>
          <div>
            <label className="lab-label">Пароль</label>
            <PasswordInput
              name="password"
              value={formData.password}
              onChange={(value) => setFormData((prev) => ({ ...prev, password: value }))}
              onCopy={blockClipboard}
              onCut={blockClipboard}
              placeholder="минимум 6 символов"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="lab-label">Подтвердите пароль</label>
            <PasswordInput
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, confirmPassword: value }))
              }
              onPaste={blockClipboard}
              onDrop={blockClipboard}
              onCopy={blockClipboard}
              onCut={blockClipboard}
              placeholder="введите пароль ещё раз вручную"
              required
              minLength={6}
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-slate-400">
              Вставку пароля сюда отключили — наберите повторно с клавиатуры.
            </p>
          </div>

          {error && (
            <p className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="lab-button-primary w-full">
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

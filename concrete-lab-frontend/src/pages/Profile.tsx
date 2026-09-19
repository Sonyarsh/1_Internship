import React, { useEffect, useState } from 'react'
import { User, Settings, LogOut, Package } from 'lucide-react'
import axios from 'axios'
import {
  changePassword,
  getToken,
  saveSession,
  saveUser,
  updateProfile,
  type User as AuthUser,
} from '../api/auth'

interface ProfileProps {
  user: AuthUser | null
  onLogout: () => void
  onUserUpdate: (user: AuthUser) => void
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onUserUpdate }) => {
  const [name, setName] = useState(user?.name ?? '')
  const [nameMsg, setNameMsg] = useState('')
  const [nameError, setNameError] = useState('')
  const [nameLoading, setNameLoading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passMsg, setPassMsg] = useState('')
  const [passError, setPassError] = useState('')
  const [passLoading, setPassLoading] = useState(false)

  useEffect(() => {
    if (user) setName(user.name)
  }, [user])

  if (!user) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <span className="section-eyebrow">Личный кабинет</span>
        <h2 className="mt-2 text-3xl font-black text-navy">Требуется авторизация</h2>
        <p className="mt-4 text-slate-600">Чтобы просмотреть профиль, необходимо войти в систему.</p>
      </div>
    )
  }

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameMsg('')
    setNameError('')
    setNameLoading(true)
    try {
      const updated = await updateProfile(name.trim())
      const token = getToken()
      if (token) saveSession(token, updated)
      else saveUser(updated)
      onUserUpdate(updated)
      setNameMsg('Имя сохранено')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail
        setNameError(typeof detail === 'string' ? detail : 'Не удалось сохранить имя')
      } else {
        setNameError('Ошибка сети')
      }
    } finally {
      setNameLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassMsg('')
    setPassError('')
    if (newPassword !== confirmPassword) {
      setPassError('Новые пароли не совпадают')
      return
    }
    if (newPassword.length < 6) {
      setPassError('Новый пароль не короче 6 символов')
      return
    }
    setPassLoading(true)
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      setPassMsg('Пароль изменён')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail
        setPassError(typeof detail === 'string' ? detail : 'Не удалось сменить пароль')
      } else {
        setPassError('Ошибка сети')
      }
    } finally {
      setPassLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl py-8 md:py-12">
      <div className="mb-9">
        <span className="section-eyebrow">Личный кабинет</span>
        <h1 className="section-title">Профиль пользователя</h1>
      </div>
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="h-fit w-full bg-navy p-4 text-white md:w-64">
          <button className="flex w-full items-center gap-3 border-l-4 border-sky-300 bg-white/10 px-4 py-3 font-bold">
            <User size={20} /> Личные данные
          </button>
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center gap-3 px-4 py-3 font-medium text-slate-400"
          >
            <Package size={20} /> Мои заказы
          </button>
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center gap-3 px-4 py-3 font-medium text-slate-400"
          >
            <Settings size={20} /> Настройки
          </button>
          <div className="mt-4 border-t border-white/10 pt-4">
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 px-4 py-3 font-medium text-red-300 transition hover:bg-white/10"
            >
              <LogOut size={20} /> Выйти
            </button>
          </div>
        </aside>

        <div className="flex-grow space-y-8">
          <div className="lab-card">
            <h2 className="mb-6 text-2xl font-black text-navy">Личные данные</h2>

            <div className="mb-6 flex items-center gap-6 border-b border-slate-100 pb-6">
              <div className="grid h-20 w-20 place-items-center bg-primary text-2xl font-black text-white">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-navy">{user.name}</h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-primary">
                  {user.role}
                </p>
              </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="bg-[#f3f7f9] p-4">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
                <p className="font-semibold text-navy">{user.email}</p>
                <p className="mt-1 text-xs text-slate-400">Email менять нельзя</p>
              </div>
              <div className="bg-[#f3f7f9] p-4">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">ID пользователя</label>
                <p className="font-semibold text-navy">{user.id}</p>
              </div>
            </div>

            <form onSubmit={handleSaveName} className="space-y-4 max-w-md">
              <label className="block text-sm">
                <span className="lab-label">Имя</span>
                <input
                  type="text"
                  required
                  minLength={1}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="lab-input"
                />
              </label>
              {nameError && <p className="text-sm text-red-600">{nameError}</p>}
              {nameMsg && <p className="text-sm text-green-700">{nameMsg}</p>}
              <button
                type="submit"
                disabled={nameLoading}
                className="lab-button-primary"
              >
                {nameLoading ? 'Сохранение...' : 'Сохранить имя'}
              </button>
            </form>
          </div>

          <div className="lab-card">
            <h2 className="mb-2 text-2xl font-black text-navy">Безопасность</h2>
            <p className="mb-6 text-sm text-slate-500">Для смены пароля подтвердите текущий пароль.</p>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <label className="block text-sm">
                <span className="lab-label">Текущий пароль</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="lab-input"
                />
              </label>
              <label className="block text-sm">
                <span className="lab-label">Новый пароль</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="lab-input"
                />
              </label>
              <label className="block text-sm">
                <span className="lab-label">Повтор нового пароля</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="lab-input"
                />
              </label>
              {passError && <p className="text-sm text-red-600">{passError}</p>}
              {passMsg && <p className="text-sm text-green-700">{passMsg}</p>}
              <button
                type="submit"
                disabled={passLoading}
                className="inline-flex items-center justify-center rounded-md bg-navy px-6 py-3 font-bold text-white transition hover:bg-primary disabled:opacity-60"
              >
                {passLoading ? 'Сохранение...' : 'Сменить пароль'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

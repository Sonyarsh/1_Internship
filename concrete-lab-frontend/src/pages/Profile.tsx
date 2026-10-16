import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Settings, LogOut, Package, FlaskConical } from 'lucide-react'
import axios from 'axios'
import {
  changePassword,
  getToken,
  saveSession,
  saveUser,
  type User as AuthUser,
  updateProfile,
} from '../api/auth'
import { fetchRecords, type ConcreteStrengthRecord } from '../api/concrete'

type Tab = 'profile' | 'orders' | 'settings'

interface ProfileProps {
  user: AuthUser | null
  onLogout: () => void
  onUserUpdate: (user: AuthUser) => void
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onUserUpdate }) => {
  const [tab, setTab] = useState<Tab>('profile')

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

  const [orders, setOrders] = useState<ConcreteStrengthRecord[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')

  useEffect(() => {
    if (user) setName(user.name)
  }, [user])

  useEffect(() => {
    if (!user || tab !== 'orders') return
    let cancelled = false
    ;(async () => {
      setOrdersLoading(true)
      setOrdersError('')
      try {
        const data = await fetchRecords()
        if (!cancelled) setOrders(data)
      } catch (err) {
        if (!cancelled) {
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            setOrdersError('Сессия истекла — войдите снова')
          } else {
            setOrdersError('Не удалось загрузить заказы')
          }
        }
      } finally {
        if (!cancelled) setOrdersLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, tab])

  if (!user) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <span className="section-eyebrow">Личный кабинет</span>
        <h2 className="mt-2 text-3xl font-black text-navy">Требуется авторизация</h2>
        <p className="mt-4 text-slate-600">Чтобы просмотреть профиль, необходимо войти в систему.</p>
      </div>
    )
  }

  const navBtn = (id: Tab, icon: React.ReactNode, label: string) => {
    const active = tab === id
    return (
      <button
        type="button"
        onClick={() => setTab(id)}
        className={
          active
            ? 'flex w-full items-center gap-3 border-l-4 border-sky-300 bg-white/10 px-4 py-3 font-bold'
            : 'flex w-full items-center gap-3 px-4 py-3 font-medium text-slate-300 transition hover:bg-white/10 hover:text-white'
        }
      >
        {icon} {label}
      </button>
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
          {navBtn('profile', <User size={20} />, 'Личные данные')}
          {navBtn('orders', <Package size={20} />, 'Мои заказы')}
          {navBtn('settings', <Settings size={20} />, 'Настройки')}
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
          {tab === 'profile' && (
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
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Email
                  </label>
                  <p className="font-semibold text-navy">{user.email}</p>
                  <p className="mt-1 text-xs text-slate-400">Email менять нельзя</p>
                </div>
                <div className="bg-[#f3f7f9] p-4">
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    ID пользователя
                  </label>
                  <p className="font-semibold text-navy">{user.id}</p>
                </div>
              </div>

              <form onSubmit={handleSaveName} className="max-w-md space-y-4">
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
                <button type="submit" disabled={nameLoading} className="lab-button-primary">
                  {nameLoading ? 'Сохранение...' : 'Сохранить имя'}
                </button>
              </form>
            </div>
          )}

          {tab === 'orders' && (
            <div className="lab-card">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-navy">Мои заказы</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Протоколы испытаний, привязанные к вашему аккаунту.
                  </p>
                </div>
                <Link to="/tests" className="lab-button-primary gap-2">
                  <FlaskConical size={17} /> Новое испытание
                </Link>
              </div>

              {ordersLoading && <p className="text-sm text-slate-500">Загрузка...</p>}
              {ordersError && (
                <p className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {ordersError}
                </p>
              )}

              {!ordersLoading && !ordersError && orders.length === 0 && (
                <div className="border border-dashed border-slate-200 bg-[#f3f7f9] px-6 py-12 text-center">
                  <Package className="mx-auto text-slate-300" size={40} />
                  <p className="mt-4 font-semibold text-navy">Заказов пока нет</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Создайте протокол на странице «Испытания».
                  </p>
                </div>
              )}

              {!ordersLoading && orders.length > 0 && (
                <div className="overflow-x-auto border-t-4 border-primary">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-navy text-white">
                      <tr>
                        <th className="px-4 py-3 font-bold">ID</th>
                        <th className="px-4 py-3 font-bold">Заявитель</th>
                        <th className="px-4 py-3 font-bold">Класс</th>
                        <th className="px-4 py-3 font-bold">Партия</th>
                        <th className="px-4 py-3 font-bold">fc</th>
                        <th className="px-4 py-3 font-bold" />
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((r) => (
                        <tr key={r.id} className="border-t border-slate-100 hover:bg-primary-light">
                          <td className="px-4 py-3 font-semibold text-navy">{r.id}</td>
                          <td className="px-4 py-3">{r.applicant_info}</td>
                          <td className="px-4 py-3">{r.concrete_class}</td>
                          <td className="px-4 py-3">
                            {r.batch_N}/{r.sample_N}/{r.series_N}
                          </td>
                          <td className="px-4 py-3">
                            {r.fc_cube_batch_i_sample_j_series_k?.toFixed(2) ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              to={`/tests/${r.id}`}
                              className="font-bold text-primary hover:underline"
                            >
                              Открыть
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="bg-[#f3f7f9] px-4 py-3 text-xs text-slate-500">
                    Записей: {orders.length}
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === 'settings' && (
            <div className="lab-card">
              <h2 className="mb-2 text-2xl font-black text-navy">Настройки</h2>
              <p className="mb-6 text-sm text-slate-500">
                Смена пароля. Для подтверждения введите текущий пароль.
              </p>
              <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
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
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile

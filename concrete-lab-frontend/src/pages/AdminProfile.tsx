import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  ClipboardList,
  FlaskConical,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Phone,
  Settings,
  Shield,
  Users,
} from 'lucide-react'
import {
  changePassword,
  getToken,
  saveSession,
  saveUser,
  updateProfile,
  type User as AuthUser,
} from '../api/auth'
import {
  AdminSummary,
  deleteAdminUser,
  fetchAdminSummary,
  fetchAdminUsers,
  updateUserRole,
} from '../api/admin'
import { ContactRequest, fetchContactRequests } from '../api/contact'
import {
  fetchAllServiceOrders,
  ORDER_STATUS_LABEL,
  OrderStatus,
  PAYMENT_STATUS_LABEL,
  PaymentStatus,
  ServiceOrder,
  updateServiceOrder,
} from '../api/serviceOrders'
import { COUNTRY_CODES, findCountry, splitPhone } from '../phone'
import PasswordInput from '../components/PasswordInput'

type Tab = 'dashboard' | 'users' | 'orders' | 'messages' | 'account' | 'settings'

interface AdminProfileProps {
  user: AuthUser | null
  onLogout: () => void
  onUserUpdate: (user: AuthUser) => void
  onLoginClick: () => void
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

const AdminProfile: React.FC<AdminProfileProps> = ({
  user,
  onLogout,
  onUserUpdate,
  onLoginClick,
}) => {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [users, setUsers] = useState<AuthUser[]>([])
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [messages, setMessages] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [roleSaving, setRoleSaving] = useState<number | null>(null)
  const [orderSaving, setOrderSaving] = useState<number | null>(null)

  const initialPhone = splitPhone(user?.phone)
  const [name, setName] = useState(user?.name ?? '')
  const [countryCode, setCountryCode] = useState(initialPhone.code)
  const [phoneLocal, setPhoneLocal] = useState(initialPhone.local)
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
    if (!user) return
    const parsed = splitPhone(user.phone)
    setName(user.name)
    setCountryCode(parsed.code)
    setPhoneLocal(parsed.local)
  }, [user])

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const [s, o, m] = await Promise.all([
        fetchAdminSummary(),
        fetchAllServiceOrders(),
        fetchContactRequests(),
      ])
      setSummary(s)
      setOrders(o)
      setMessages(m)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError('Нужна роль администратора')
      } else setError('Не удалось загрузить панель')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    try {
      setUsers(await fetchAdminUsers())
    } catch {
      setError('Не удалось загрузить пользователей')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    if (tab === 'dashboard' || tab === 'orders' || tab === 'messages') {
      loadDashboard()
    } else if (tab === 'users') {
      loadUsers()
    }
  }, [user, tab])

  const patchOrder = async (
    id: number,
    patch: { status?: OrderStatus; payment_status?: PaymentStatus }
  ) => {
    setOrderSaving(id)
    try {
      const updated = await updateServiceOrder(id, patch)
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
      const s = await fetchAdminSummary()
      setSummary(s)
    } catch {
      setError('Не удалось обновить заказ')
    } finally {
      setOrderSaving(null)
    }
  }

  const patchRole = async (id: number, role: 'user' | 'admin') => {
    setRoleSaving(id)
    setError('')
    try {
      const updated = await updateUserRole(id, role)
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
    } catch (err) {
      if (axios.isAxiosError(err) && typeof err.response?.data?.detail === 'string') {
        setError(err.response.data.detail)
      } else setError('Не удалось изменить роль')
    } finally {
      setRoleSaving(null)
    }
  }

  const removeUser = async (id: number, email: string) => {
    if (id === user?.id) {
      setError('Нельзя удалить самого себя')
      return
    }
    if (!window.confirm(`Удалить пользователя ${email}? Протоколы останутся без автора.`)) {
      return
    }
    setRoleSaving(id)
    setError('')
    try {
      await deleteAdminUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      const s = await fetchAdminSummary()
      setSummary(s)
    } catch (err) {
      if (axios.isAxiosError(err) && typeof err.response?.data?.detail === 'string') {
        setError(err.response.data.detail)
      } else setError('Не удалось удалить пользователя')
    } finally {
      setRoleSaving(null)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameMsg('')
    setNameError('')
    const digits = phoneLocal.replace(/\D/g, '')
    if (digits.length > 0 && digits.length < 7) {
      setNameError('Введите номер телефона без кода страны или очистите поле')
      return
    }
    setNameLoading(true)
    try {
      const updated = await updateProfile({
        name: name.trim(),
        phone: digits ? `${countryCode}${digits}` : null,
      })
      const token = getToken()
      if (token) saveSession(token, updated)
      else saveUser(updated)
      onUserUpdate(updated)
      setNameMsg('Сохранено')
    } catch {
      setNameError('Не удалось сохранить')
    } finally {
      setNameLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassMsg('')
    setPassError('')
    if (newPassword !== confirmPassword) {
      setPassError('Пароли не совпадают')
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
      if (axios.isAxiosError(err) && typeof err.response?.data?.detail === 'string') {
        setPassError(err.response.data.detail)
      } else setPassError('Не удалось сменить пароль')
    } finally {
      setPassLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <span className="section-eyebrow">Админ</span>
        <h2 className="mt-2 text-3xl font-black text-navy">Нужен вход</h2>
        <button type="button" onClick={onLoginClick} className="lab-button-primary mt-6">
          Войти
        </button>
      </div>
    )
  }

  if (user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <span className="section-eyebrow">Админ</span>
        <h2 className="mt-2 text-3xl font-black text-navy">Нет доступа</h2>
        <p className="mt-4 text-slate-600">Этот кабинет только для роли admin.</p>
        <Link to="/profile" className="lab-button-primary mt-6 inline-flex">
          В обычный профиль
        </Link>
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

  const selectedCountry = findCountry(countryCode)
  const protocolsTotal =
    (summary?.protocols_compression ?? 0) +
    (summary?.protocols_frost ?? 0) +
    (summary?.protocols_waterproof ?? 0) +
    (summary?.protocols_core ?? 0)

  return (
    <div className="mx-auto max-w-6xl py-8 md:py-12">
      <div className="mb-9">
        <span className="section-eyebrow">Администрирование</span>
        <h1 className="section-title">Профиль администратора</h1>
        <p className="mt-2 text-slate-600">
          {user.name} · управление заявками, пользователями и статусами оплаты
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="h-fit w-full bg-navy p-4 text-white lg:w-64">
          {navBtn('dashboard', <LayoutDashboard size={20} />, 'Панель')}
          {navBtn('orders', <ClipboardList size={20} />, 'Заказы услуг')}
          {navBtn('messages', <Inbox size={20} />, 'Сообщения')}
          {navBtn('users', <Users size={20} />, 'Пользователи')}
          {navBtn('account', <Shield size={20} />, 'Аккаунт')}
          {navBtn('settings', <Settings size={20} />, 'Пароль')}
          <Link
            to="/tests"
            className="mt-2 flex w-full items-center gap-3 px-4 py-3 font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <FlaskConical size={20} /> Испытания
          </Link>
          <div className="mt-4 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 px-4 py-3 font-medium text-red-300 transition hover:bg-white/10"
            >
              <LogOut size={20} /> Выйти
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-grow space-y-6">
          {error && (
            <p className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {loading && !summary && tab === 'dashboard' && (
            <p className="text-slate-500">Загрузка...</p>
          )}

          {tab === 'dashboard' && summary && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Пользователи', summary.users_total, `админов: ${summary.admins_total}`],
                  ['Заказы услуг', summary.service_orders_total, `новых: ${summary.service_orders_new}`],
                  ['Не оплачено', summary.service_orders_unpaid, 'ждут счёта / оплаты'],
                  ['Протоколы', protocolsTotal, 'все виды испытаний'],
                ].map(([title, value, hint]) => (
                  <div key={String(title)} className="border-t-4 border-primary bg-white p-5 shadow-[0_12px_35px_rgba(0,52,80,.08)]">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {title}
                    </p>
                    <p className="mt-2 text-3xl font-black text-navy">{value}</p>
                    <p className="mt-1 text-sm text-slate-500">{hint}</p>
                  </div>
                ))}
              </div>

              <div className="lab-card">
                <h2 className="text-xl font-black text-navy">Протоколы по типам</h2>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    ['Сжатие (кубы)', summary.protocols_compression],
                    ['Морозостойкость', summary.protocols_frost],
                    ['Водонепроницаемость', summary.protocols_waterproof],
                    ['Сжатие в конструкциях', summary.protocols_core],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="bg-[#f3f7f9] px-4 py-3">
                      <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {label}
                      </dt>
                      <dd className="mt-1 text-lg font-bold text-navy">{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-sm text-slate-500">
                  Сообщений с главной: <strong>{summary.contact_requests}</strong>
                </p>
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-navy">Заказы услуг</h2>
              {orders.length === 0 ? (
                <p className="text-slate-500">Заказов пока нет.</p>
              ) : (
                orders.map((o) => (
                  <article key={o.id} className="lab-card space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-extrabold text-navy">{o.service_title}</p>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          №{o.id} · {formatDate(o.created_at)} · {o.price_label} × {o.quantity}
                        </p>
                      </div>
                      <span className="rounded-md bg-primary-light px-3 py-1 text-xs font-bold text-primary">
                        {ORDER_STATUS_LABEL[o.status]} · {PAYMENT_STATUS_LABEL[o.payment_status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="font-semibold text-navy">{o.name}</span>
                      <a href={`mailto:${o.email}`} className="inline-flex items-center gap-1 text-primary">
                        <Mail size={14} /> {o.email}
                      </a>
                      {o.phone && (
                        <a href={`tel:${o.phone}`} className="inline-flex items-center gap-1 text-navy">
                          <Phone size={14} /> {o.phone}
                        </a>
                      )}
                    </div>
                    {o.message && <p className="text-sm text-slate-600">{o.message}</p>}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-sm">
                        <span className="lab-label">Статус</span>
                        <select
                          className="lab-input"
                          disabled={orderSaving === o.id}
                          value={o.status}
                          onChange={(e) =>
                            patchOrder(o.id, { status: e.target.value as OrderStatus })
                          }
                        >
                          {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((k) => (
                            <option key={k} value={k}>
                              {ORDER_STATUS_LABEL[k]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-sm">
                        <span className="lab-label">Оплата</span>
                        <select
                          className="lab-input"
                          disabled={orderSaving === o.id}
                          value={o.payment_status}
                          onChange={(e) =>
                            patchOrder(o.id, {
                              payment_status: e.target.value as PaymentStatus,
                            })
                          }
                        >
                          {(Object.keys(PAYMENT_STATUS_LABEL) as PaymentStatus[]).map((k) => (
                            <option key={k} value={k}>
                              {PAYMENT_STATUS_LABEL[k]}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}

          {tab === 'messages' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-navy">Сообщения с сайта</h2>
              {messages.length === 0 ? (
                <p className="text-slate-500">Сообщений пока нет.</p>
              ) : (
                messages.map((item) => (
                  <article key={item.id} className="lab-card">
                    <div className="flex flex-wrap justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <p className="text-lg font-extrabold text-navy">{item.name}</p>
                        <p className="text-xs text-slate-400">
                          №{item.id} · {formatDate(item.created_at)}
                        </p>
                      </div>
                      {item.service_type && (
                        <span className="rounded-md bg-primary-light px-3 py-1 text-xs font-bold text-primary">
                          {item.service_type}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm">
                      <a href={`mailto:${item.email}`} className="text-primary font-semibold">
                        {item.email}
                      </a>
                      {item.phone && <span className="text-navy">{item.phone}</span>}
                    </div>
                    <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">{item.message}</p>
                  </article>
                ))
              )}
            </div>
          )}

          {tab === 'users' && (
            <div className="lab-card">
              <h2 className="mb-4 text-2xl font-black text-navy">Пользователи</h2>
              <div className="overflow-x-auto border-t-4 border-primary">
                <table className="w-full text-left text-sm">
                  <thead className="bg-navy text-white">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Имя</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Роль</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-semibold text-navy">{u.id}</td>
                        <td className="px-4 py-3">{u.name}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">
                          <select
                            className="lab-input py-2"
                            disabled={roleSaving === u.id}
                            value={u.role === 'admin' ? 'admin' : 'user'}
                            onChange={(e) =>
                              patchRole(u.id, e.target.value as 'user' | 'admin')
                            }
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            disabled={roleSaving === u.id || u.id === user.id}
                            onClick={() => removeUser(u.id, u.email)}
                            className="text-sm font-bold text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Удалить
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'account' && (
            <div className="lab-card space-y-6">
              <h2 className="text-2xl font-black text-navy">Аккаунт администратора</h2>
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center bg-primary text-xl font-black text-white">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-extrabold text-navy">{user.name}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">admin</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
              <form onSubmit={handleSaveProfile} className="max-w-md space-y-4">
                <label className="block text-sm">
                  <span className="lab-label">Имя</span>
                  <input
                    className="lab-input"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <div className="block text-sm">
                  <span className="lab-label">Телефон</span>
                  <div className="flex gap-2">
                    <select
                      className="lab-input w-36"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <input
                      className="lab-input"
                      value={phoneLocal}
                      onChange={(e) => setPhoneLocal(e.target.value)}
                      placeholder="29 123-45-67"
                      maxLength={(selectedCountry?.digits ?? 9) + 2}
                    />
                  </div>
                </div>
                {nameError && <p className="text-sm text-red-600">{nameError}</p>}
                {nameMsg && <p className="text-sm text-green-700">{nameMsg}</p>}
                <button type="submit" disabled={nameLoading} className="lab-button-primary">
                  {nameLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </form>
            </div>
          )}

          {tab === 'settings' && (
            <div className="lab-card">
              <h2 className="mb-6 text-2xl font-black text-navy">Смена пароля</h2>
              <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                <label className="block text-sm">
                  <span className="lab-label">Текущий пароль</span>
                  <PasswordInput
                    required
                    minLength={6}
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    autoComplete="current-password"
                  />
                </label>
                <label className="block text-sm">
                  <span className="lab-label">Новый пароль</span>
                  <PasswordInput
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={setNewPassword}
                    autoComplete="new-password"
                  />
                </label>
                <label className="block text-sm">
                  <span className="lab-label">Повтор нового пароля</span>
                  <PasswordInput
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    autoComplete="new-password"
                  />
                </label>
                {passError && <p className="text-sm text-red-600">{passError}</p>}
                {passMsg && <p className="text-sm text-green-700">{passMsg}</p>}
                <button type="submit" disabled={passLoading} className="lab-button-primary">
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

export default AdminProfile

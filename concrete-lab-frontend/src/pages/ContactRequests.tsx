import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Inbox, Mail, Phone, RefreshCw } from 'lucide-react'
import { User } from '../api/auth'
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

interface ContactRequestsProps {
  user: User | null
  onLoginClick: () => void
}

type AdminTab = 'service' | 'contact'

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

const ContactRequests: React.FC<ContactRequestsProps> = ({ user, onLoginClick }) => {
  const [tab, setTab] = useState<AdminTab>('service')
  const [contacts, setContacts] = useState<ContactRequest[]>([])
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState<number | null>(null)

  const load = async () => {
    if (!user || user.role !== 'admin') return
    setLoading(true)
    setError('')
    try {
      const [c, o] = await Promise.all([fetchContactRequests(), fetchAllServiceOrders()])
      setContacts(c)
      setOrders(o)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) setError('Сессия истекла — войдите снова')
        else if (err.response?.status === 403) setError('Доступ только для администратора')
        else setError('Не удалось загрузить заявки')
      } else setError('Ошибка сети')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  const patchOrder = async (
    id: number,
    patch: { status?: OrderStatus; payment_status?: PaymentStatus }
  ) => {
    setSavingId(id)
    setError('')
    try {
      const updated = await updateServiceOrder(id, patch)
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
    } catch {
      setError('Не удалось обновить статус')
    } finally {
      setSavingId(null)
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <span className="section-eyebrow">Заявки</span>
        <h2 className="mt-2 text-3xl font-black text-navy">Требуется вход</h2>
        <p className="mt-4 text-slate-600">Войдите как администратор, чтобы видеть заявки с сайта.</p>
        <button type="button" onClick={onLoginClick} className="lab-button-primary mt-6">
          Войти
        </button>
      </div>
    )
  }

  if (user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <span className="section-eyebrow">Заявки</span>
        <h2 className="mt-2 text-3xl font-black text-navy">Нет доступа</h2>
        <p className="mt-4 text-slate-600">
          Раздел доступен только пользователям с ролью <strong>admin</strong>.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="section-eyebrow">Администрирование</span>
          <h1 className="mt-2 text-3xl font-black text-navy">Заявки</h1>
          <p className="mt-2 text-slate-600">
            Заказы услуг по прайсу и сообщения из формы на главной.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="lab-button-secondary inline-flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Обновить
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab('service')}
          className={
            tab === 'service'
              ? 'rounded-md bg-navy px-4 py-2 text-sm font-bold text-white'
              : 'rounded-md bg-slate-100 px-4 py-2 text-sm font-bold text-navy'
          }
        >
          Заказы услуг ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('contact')}
          className={
            tab === 'contact'
              ? 'rounded-md bg-navy px-4 py-2 text-sm font-bold text-white'
              : 'rounded-md bg-slate-100 px-4 py-2 text-sm font-bold text-navy'
          }
        >
          Контакты ({contacts.length})
        </button>
      </div>

      {error && (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      {tab === 'service' && (
        <>
          {loading && orders.length === 0 ? (
            <p className="mt-10 text-slate-500">Загрузка…</p>
          ) : orders.length === 0 ? (
            <div className="lab-card mt-10 flex flex-col items-center py-14 text-center">
              <Inbox className="text-slate-300" size={40} />
              <p className="mt-4 font-bold text-navy">Заказов услуг пока нет</p>
              <p className="mt-1 text-sm text-slate-500">Оформите тестовый заказ на странице «Услуги».</p>
            </div>
          ) : (
            <ul className="mt-8 space-y-4">
              {orders.map((o) => (
                <li key={o.id} className="lab-card space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <p className="text-lg font-extrabold text-navy">{o.service_title}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        №{o.id} · {formatDate(o.created_at)} · {o.price_label} × {o.quantity}
                      </p>
                    </div>
                    <span className="rounded-md bg-primary-light px-3 py-1 text-xs font-bold text-primary">
                      {ORDER_STATUS_LABEL[o.status]} · {PAYMENT_STATUS_LABEL[o.payment_status]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <span className="font-semibold text-navy">{o.name}</span>
                    <a
                      href={`mailto:${o.email}`}
                      className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                    >
                      <Mail size={14} /> {o.email}
                    </a>
                    {o.phone && (
                      <a
                        href={`tel:${o.phone}`}
                        className="inline-flex items-center gap-1.5 font-semibold text-navy hover:underline"
                      >
                        <Phone size={14} /> {o.phone}
                      </a>
                    )}
                  </div>
                  {o.message && (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                      {o.message}
                    </p>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-sm">
                      <span className="lab-label">Статус заявки</span>
                      <select
                        className="lab-input"
                        disabled={savingId === o.id}
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
                        disabled={savingId === o.id}
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
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {tab === 'contact' && (
        <>
          {loading && contacts.length === 0 ? (
            <p className="mt-10 text-slate-500">Загрузка…</p>
          ) : contacts.length === 0 ? (
            <div className="lab-card mt-10 flex flex-col items-center py-14 text-center">
              <Inbox className="text-slate-300" size={40} />
              <p className="mt-4 font-bold text-navy">Сообщений пока нет</p>
              <p className="mt-1 text-sm text-slate-500">Форма «Свяжитесь с нами» на главной.</p>
            </div>
          ) : (
            <ul className="mt-8 space-y-4">
              {contacts.map((item) => (
                <li key={item.id} className="lab-card">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <p className="text-lg font-extrabold text-navy">{item.name}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        №{item.id} · {formatDate(item.created_at)}
                      </p>
                    </div>
                    {item.service_type && (
                      <span className="rounded-md bg-primary-light px-3 py-1 text-xs font-bold text-primary">
                        {item.service_type}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                    <a
                      href={`mailto:${item.email}`}
                      className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                    >
                      <Mail size={14} /> {item.email}
                    </a>
                    {item.phone && (
                      <a
                        href={`tel:${item.phone}`}
                        className="inline-flex items-center gap-1.5 font-semibold text-navy hover:underline"
                      >
                        <Phone size={14} /> {item.phone}
                      </a>
                    )}
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {item.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

export default ContactRequests

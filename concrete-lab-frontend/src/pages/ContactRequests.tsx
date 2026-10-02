import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Inbox, Mail, Phone, RefreshCw } from 'lucide-react'
import { User } from '../api/auth'
import { ContactRequest, fetchContactRequests } from '../api/contact'

interface ContactRequestsProps {
  user: User | null
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

const ContactRequests: React.FC<ContactRequestsProps> = ({ user, onLoginClick }) => {
  const [items, setItems] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    if (!user || user.role !== 'admin') return
    setLoading(true)
    setError('')
    try {
      const data = await fetchContactRequests()
      setItems(data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Сессия истекла — войдите снова')
        } else if (err.response?.status === 403) {
          setError('Доступ только для администратора')
        } else {
          setError('Не удалось загрузить заявки')
        }
      } else {
        setError('Ошибка сети')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

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
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="section-eyebrow">Администрирование</span>
          <h1 className="mt-2 text-3xl font-black text-navy">Заявки с сайта</h1>
          <p className="mt-2 text-slate-600">Сообщения из формы «Свяжитесь с нами» на главной.</p>
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

      {error && (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-accent">
          {error}
        </p>
      )}

      {loading && items.length === 0 ? (
        <p className="mt-10 text-slate-500">Загрузка…</p>
      ) : items.length === 0 ? (
        <div className="lab-card mt-10 flex flex-col items-center py-14 text-center">
          <Inbox className="text-slate-300" size={40} />
          <p className="mt-4 font-bold text-navy">Заявок пока нет</p>
          <p className="mt-1 text-sm text-slate-500">Отправьте тестовую форму на главной странице.</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {items.map((item) => (
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
                <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
                  <Mail size={14} /> {item.email}
                </a>
                {item.phone && (
                  <a href={`tel:${item.phone}`} className="inline-flex items-center gap-1.5 font-semibold text-navy hover:underline">
                    <Phone size={14} /> {item.phone}
                  </a>
                )}
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{item.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ContactRequests

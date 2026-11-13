import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { X } from 'lucide-react'
import { createServiceOrder, ServiceKey } from '../api/serviceOrders'
import { User } from '../api/auth'

export type OrderServiceInfo = {
  key: ServiceKey
  title: string
  price: string
  norm: string
}

type Props = {
  service: OrderServiceInfo
  user: User | null
  onClose: () => void
  onCreated?: () => void
}

const OrderServiceModal: React.FC<Props> = ({ service, user, onClose, onCreated }) => {
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [quantity, setQuantity] = useState('1')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [doneId, setDoneId] = useState<number | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const created = await createServiceOrder({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        service_key: service.key,
        quantity: Number(quantity) || 1,
        message: message.trim() || null,
      })
      setDoneId(created.id)
      onCreated?.()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail
        if (typeof detail === 'string') setError(detail)
        else setError('Не удалось оформить заказ')
      } else setError('Не удалось оформить заказ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg border-t-4 border-primary bg-white p-6 shadow-[0_20px_50px_rgba(0,52,80,.25)] sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-navy"
          aria-label="Закрыть"
        >
          <X size={22} />
        </button>

        {doneId ? (
          <div className="space-y-4 py-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Заявка принята</p>
            <h2 className="text-2xl font-black text-navy">Заказ №{doneId}</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              «{service.title}» — {service.price}. Онлайн-оплаты пока нет: лаборатория свяжется
              и согласует счёт. Статус смотрите в профиле → «Мои заявки».
            </p>
            <button type="button" onClick={onClose} className="lab-button-primary">
              Закрыть
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">{service.norm}</p>
              <h2 className="mt-1 text-2xl font-black text-navy">Заказать услугу</h2>
              <p className="mt-2 text-sm text-slate-600">
                {service.title} · <span className="font-bold text-navy">{service.price}</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Это заявка, не мгновенная оплата. После оформления с вами свяжутся.
              </p>
            </div>

            <label className="block text-sm">
              <span className="lab-label">Имя</span>
              <input className="lab-input" required value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="block text-sm">
              <span className="lab-label">Email</span>
              <input
                className="lab-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="lab-label">Телефон</span>
              <input className="lab-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label className="block text-sm">
              <span className="lab-label">Количество (серий / комплектов)</span>
              <input
                className="lab-input"
                type="number"
                min={1}
                max={50}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="lab-label">Комментарий</span>
              <textarea
                className="lab-input min-h-[90px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Класс бетона, объект, сроки…"
              />
            </label>

            {error && (
              <p className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}

            <button type="submit" disabled={loading} className="lab-button-primary w-full">
              {loading ? 'Отправка...' : 'Оформить заказ'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default OrderServiceModal

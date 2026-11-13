import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { User } from '../api/auth'
import {
  linkProtocolOrder,
  orderAllowsSend,
  ProtocolKind,
} from '../api/notify'
import {
  fetchAllServiceOrders,
  fetchMyServiceOrders,
  ORDER_STATUS_LABEL,
  OrderStatus,
  PAYMENT_STATUS_LABEL,
  PaymentStatus,
  ServiceOrder,
} from '../api/serviceOrders'

const KIND_TO_KEY: Record<ProtocolKind, string> = {
  compression: 'compression',
  frost: 'frost',
  waterproof: 'waterproof',
  core: 'core',
}

type Props = {
  kind: ProtocolKind
  protocolId: number
  serviceOrderId?: number | null
  user: User
  onChange: (next: {
    service_order_id: number | null
    can_send: boolean
    order_status?: string | null
    order_payment_status?: string | null
  }) => void
}

const ProtocolOrderLink: React.FC<Props> = ({
  kind,
  protocolId,
  serviceOrderId,
  user,
  onChange,
}) => {
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [selected, setSelected] = useState(serviceOrderId ? String(serviceOrderId) : '')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    setSelected(serviceOrderId ? String(serviceOrderId) : '')
  }, [serviceOrderId])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const data =
          user.role === 'admin'
            ? await fetchAllServiceOrders()
            : await fetchMyServiceOrders()
        if (cancelled) return
        setOrders(data)
        const linked = data.find((o) => o.id === serviceOrderId)
        onChange({
          service_order_id: serviceOrderId ?? null,
          can_send: orderAllowsSend(linked?.status, linked?.payment_status),
          order_status: linked?.status,
          order_payment_status: linked?.payment_status,
        })
      } catch {
        if (!cancelled) setError('Не удалось загрузить заявки')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- только при смене пользователя / id заявки
  }, [user.role, serviceOrderId])

  const filtered = useMemo(
    () => orders.filter((o) => o.service_key === KIND_TO_KEY[kind]),
    [orders, kind]
  )

  const linked = filtered.find((o) => o.id === Number(selected)) ||
    orders.find((o) => o.id === serviceOrderId)

  const save = async () => {
    setSaving(true)
    setError('')
    setMsg('')
    try {
      const res = await linkProtocolOrder({
        kind,
        protocol_id: protocolId,
        service_order_id: selected ? Number(selected) : null,
      })
      onChange({
        service_order_id: res.service_order_id,
        can_send: res.can_send,
        order_status: res.order_status,
        order_payment_status: res.order_payment_status,
      })
      setMsg(
        res.can_send
          ? 'Заявка привязана — отправка результатов разрешена'
          : res.service_order_id
            ? 'Заявка привязана. Отправка откроется, когда админ поставит «Выполнена» и «Оплачено»'
            : 'Связь с заявкой снята'
      )
    } catch (err) {
      if (axios.isAxiosError(err) && typeof err.response?.data?.detail === 'string') {
        setError(err.response.data.detail)
      } else setError('Не удалось сохранить связь')
    } finally {
      setSaving(false)
    }
  }

  const canSend = orderAllowsSend(linked?.status, linked?.payment_status)

  return (
    <div className="space-y-4 border-t border-slate-100 pt-6">
      <div>
        <h2 className="text-lg font-black text-navy">Связь с заявкой</h2>
        <p className="mt-1 text-sm text-slate-500">
          Протокол привязывается к заказу услуги. Отправка на почту/Telegram — только когда
          заявка <strong>выполнена</strong> и <strong>оплачена</strong> (ставит админ).
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Загрузка заявок...</p>
      ) : (
        <label className="block text-sm">
          <span className="lab-label">Заявка на эту услугу</span>
          <select
            className="lab-input"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">— не привязана —</option>
            {filtered.map((o) => (
              <option key={o.id} value={o.id}>
                №{o.id} · {o.name} · {o.price_label} ·{' '}
                {ORDER_STATUS_LABEL[o.status as OrderStatus] ?? o.status} /{' '}
                {PAYMENT_STATUS_LABEL[o.payment_status as PaymentStatus] ?? o.payment_status}
              </option>
            ))}
          </select>
          {filtered.length === 0 && (
            <span className="mt-1 block text-xs text-slate-400">
              Нет заявок этого типа.{' '}
              <Link to="/services" className="text-primary hover:underline">
                Оформить на «Услуги»
              </Link>
            </span>
          )}
        </label>
      )}

      {linked && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="bg-[#f3f7f9] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Заявка</p>
            <p className="mt-1 font-semibold text-navy">№{linked.id}</p>
          </div>
          <div className="bg-[#f3f7f9] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Работа</p>
            <p className="mt-1 font-semibold text-navy">
              {ORDER_STATUS_LABEL[linked.status as OrderStatus] ?? linked.status}
            </p>
          </div>
          <div className="bg-[#f3f7f9] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Оплата</p>
            <p className="mt-1 font-semibold text-navy">
              {PAYMENT_STATUS_LABEL[linked.payment_status as PaymentStatus] ??
                linked.payment_status}
            </p>
          </div>
        </div>
      )}

      {canSend ? (
        <p className="border-l-4 border-green-600 bg-green-50 px-4 py-3 text-sm text-green-800">
          Заявка выполнена и оплачена — можно отправлять результаты.
        </p>
      ) : (
        <p className="border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Отправка закрыта, пока заявка не в статусах «Выполнена» + «Оплачено».
          {user.role === 'admin' ? ' Измените статусы в кабинете админа → Заказы услуг.' : ''}
        </p>
      )}

      {error && (
        <p className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      {msg && (
        <p className="border-l-4 border-green-600 bg-green-50 px-4 py-3 text-sm text-green-800">{msg}</p>
      )}

      <button type="button" disabled={saving || loading} onClick={save} className="lab-button-secondary">
        {saving ? 'Сохранение...' : 'Сохранить связь с заявкой'}
      </button>
    </div>
  )
}

export default ProtocolOrderLink

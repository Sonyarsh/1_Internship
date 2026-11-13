import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { deleteFrostTest, fetchFrostTest, FrostRecord } from '../api/frost'
import { User } from '../api/auth'
import SendResults from '../components/SendResults'
import ProtocolOrderLink from '../components/ProtocolOrderLink'

interface FrostDetailProps {
  user: User | null
  onLoginClick: () => void
}

const METHOD_TITLE: Record<string, string> = {
  basic1: 'Первый базовый',
  basic2: 'Второй базовый',
  accel2: 'Второй ускоренный',
  accel3: 'Третий ускоренный',
}

const FrostDetail: React.FC<FrostDetailProps> = ({ user, onLoginClick }) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [record, setRecord] = useState<FrostRecord | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [canSend, setCanSend] = useState(false)

  useEffect(() => {
    if (!user || !id) {
      setLoading(false)
      return
    }
    fetchFrostTest(Number(id))
      .then(setRecord)
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 404) setError('Протокол не найден')
        else setError('Не удалось загрузить протокол')
      })
      .finally(() => setLoading(false))
  }, [user, id])

  const handleDelete = async () => {
    if (!record || !window.confirm(`Удалить протокол #${record.id}?`)) return
    try {
      await deleteFrostTest(record.id)
      navigate('/tests/frost')
    } catch {
      setError('Не удалось удалить протокол')
    }
  }

  if (!user) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-3xl font-black text-navy">Нужен вход в систему</h2>
        <button onClick={onLoginClick} className="lab-button-primary mt-6">Войти</button>
      </div>
    )
  }
  if (loading) return <p className="py-12 text-slate-500">Загрузка...</p>
  if (error && !record) return <p className="py-12 text-red-600">{error}</p>
  if (!record) return null

  const rows: [string, string][] = [
    ['Метод', METHOD_TITLE[record.method] || record.method],
    ['Среда', record.exposure === 'water' ? 'Вода' : '5 % раствор NaCl'],
    ['Образец', `куб ${record.sample_size_mm} мм`],
    ['Циклы', String(record.cycles_done)],
    ['Заявленная марка', `F${record.mark_group || ''}${record.project_mark}`],
    ['Xср контрольных, МПа', fmt(record.x_cp_control)],
    ['Xср основных, МПа', fmt(record.x_cp_main)],
    ['σ контрольных, МПа', fmt(record.sigma_control)],
    ['σ основных, МПа', fmt(record.sigma_main)],
    ['Вариация контрольных, %', fmt(record.v_control_pct)],
    ['Вариация основных, %', fmt(record.v_main_pct)],
    ['Xmin контрольных, МПа', fmt(record.x_min_control)],
    ['0,9 Xmin контрольных, МПа', fmt(record.limit_09)],
    ['Xmin основных, МПа', fmt(record.x_min_main)],
    ['Потеря массы, %', fmt(record.mass_loss_pct)],
  ]
  if (record.strength_drop_pct != null) {
    rows.push(['Снижение средней прочности, %', fmt(record.strength_drop_pct)])
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <Link to="/tests/frost" className="text-sm font-bold text-primary hover:underline">← К протоколам</Link>
      <div>
        <span className="section-eyebrow">ГОСТ 10060-2012</span>
        <h1 className="section-title">Протокол #{record.id}</h1>
        <p className="mt-2 text-slate-600">{record.applicant_info} · {record.product_id} · {record.concrete_class}</p>
      </div>
      <p className={`border-l-4 px-4 py-3 text-sm ${record.project_mark_met ? 'border-green-600 bg-green-50 text-green-800' : 'border-amber-500 bg-amber-50 text-amber-900'}`}>
        {record.conclusion}
      </p>
      <div className="lab-card space-y-6">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</dt>
              <dd className="font-semibold text-navy">{value}</dd>
            </div>
          ))}
        </dl>
        <ProtocolOrderLink
          kind="frost"
          protocolId={record.id}
          serviceOrderId={record.service_order_id}
          user={user}
          onChange={({ service_order_id, can_send }) => {
            setRecord({ ...record, service_order_id })
            setCanSend(can_send)
          }}
        />
        <SendResults
          kind="frost"
          protocolId={record.id}
          defaultEmail={user.email}
          canSend={canSend}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="button" onClick={handleDelete} className="text-sm font-bold text-red-600 hover:underline">
        Удалить протокол
      </button>
    </div>
  )
}

function fmt(value: number | null | undefined) {
  return value == null ? '—' : String(value)
}

export default FrostDetail

import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteWaterproofTest, fetchWaterproofTest, WaterproofRecord } from '../api/waterproof'
import { User } from '../api/auth'
import SendResults from '../components/SendResults'

interface WaterproofDetailProps {
  user: User | null
  onLoginClick: () => void
}

const WaterproofDetail: React.FC<WaterproofDetailProps> = ({ user, onLoginClick }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState<WaterproofRecord | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user || !id) return
    setLoading(true)
    fetchWaterproofTest(Number(id))
      .then(setRecord)
      .catch(() => setError('Протокол не найден'))
      .finally(() => setLoading(false))
  }, [user, id])

  const handleDelete = async () => {
    if (!record) return
    if (!window.confirm(`Удалить протокол #${record.id}?`)) return
    setDeleting(true)
    try {
      await deleteWaterproofTest(record.id)
      navigate('/tests/waterproof')
    } catch {
      setError('Не удалось удалить')
      setDeleting(false)
    }
  }

  if (!user) {
    return (
      <div className="py-20 text-center">
        <h2 className="mb-4 text-3xl font-black text-navy">Нужен вход</h2>
        <button onClick={onLoginClick} className="lab-button-primary">
          Войти
        </button>
      </div>
    )
  }

  if (loading) return <p className="py-12 text-slate-500">Загрузка...</p>
  if (error && !record) {
    return (
      <div className="space-y-4 py-12">
        <p className="text-red-600">{error}</p>
        <Link to="/tests/waterproof" className="font-bold text-primary hover:underline">
          ← К протоколам
        </Link>
      </div>
    )
  }
  if (!record) return null

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <Link to="/tests/waterproof" className="text-sm font-bold text-primary hover:underline">
        ← К протоколам
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="section-eyebrow">ГОСТ 12730.5-2018 · п. 4</span>
          <h1 className="section-title">Протокол водонепроницаемости #{record.id}</h1>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-md border border-red-600 px-5 py-3 font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          {deleting ? 'Удаление...' : 'Удалить'}
        </button>
      </div>

      <div className="lab-card space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Info label="Заявитель" value={record.applicant_info} />
          <Info label="Изготовитель" value={record.manufacturer_info} />
          <Info label="Продукция" value={record.product_id} />
          <Info label="Класс бетона" value={record.concrete_class} />
          <Info label="ТНПА метода" value={record.tnpa} />
          <Info label="Общие требования" value={record.general_tnpa} />
          <Info
            label="Режим"
            value={
              record.mode === 'check_project'
                ? 'Контроль проектной марки (п. 4.3.3)'
                : 'Определение марки (п. 4.3.2)'
            }
          />
          <Info label="Высота образца, мм" value={String(record.sample_height_mm)} />
          <Info label="Выдержка ступени, ч" value={String(record.hold_hours ?? '—')} />
          <Info label="Проектная марка" value={record.project_mark || '—'} />
        </div>

        <div>
          <h2 className="mb-3 text-lg font-black text-navy">
            Образцы: диаметр торца и давление без фильтрации
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {record.sample_dry_pressures_mpa.map((p, i) => (
              <div key={i} className="bg-[#f3f7f9] px-4 py-3">
                <p className="text-xs font-bold uppercase text-slate-500">Образец {i + 1}</p>
                <p className="mt-1 text-sm text-slate-600">
                  Диаметр:{' '}
                  <span className="font-semibold text-navy">
                    {Number(record.sample_diameters_mm?.[i] ?? 0).toFixed(1)} мм
                  </span>
                </p>
                <p className="text-lg font-extrabold text-navy">{Number(p).toFixed(1)} МПа</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <Info
            label="Водонепроницаемость серии"
            value={
              record.series_pressure_mpa != null
                ? `${record.series_pressure_mpa.toFixed(1)} МПа`
                : '—'
            }
            highlight
          />
          <Info label="Марка W" value={record.achieved_mark || 'не установлена'} highlight />
          <Info
            label="Образцов без фильтрации на давлении серии"
            value={String(record.samples_ok_at_series ?? '—')}
          />
          <Info
            label="Соответствие заявленной марке"
            value={
              record.project_mark_met == null
                ? '—'
                : record.project_mark_met
                  ? 'Да'
                  : 'Нет'
            }
          />
        </div>

        {record.conclusion && (
          <p className="border-l-4 border-primary bg-primary-light px-4 py-3 text-sm text-navy">
            {record.conclusion}
          </p>
        )}
        <SendResults
          kind="waterproof"
          protocolId={record.id}
          defaultEmail={user.email}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}

function Info({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className={highlight ? 'border-l-4 border-primary bg-primary-light px-4 py-3' : 'bg-[#f3f7f9] px-4 py-3'}>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-navy">{value}</p>
    </div>
  )
}

export default WaterproofDetail

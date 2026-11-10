import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CoreRecord, deleteCoreTest, fetchCoreTest } from '../api/core'
import { User } from '../api/auth'
import SendResults from '../components/SendResults'

interface CoreDetailProps {
  user: User | null
  onLoginClick: () => void
}

const CoreDetail: React.FC<CoreDetailProps> = ({ user, onLoginClick }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState<CoreRecord | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user || !id) return
    setLoading(true)
    fetchCoreTest(Number(id))
      .then(setRecord)
      .catch(() => setError('Протокол не найден'))
      .finally(() => setLoading(false))
  }, [user, id])

  const handleDelete = async () => {
    if (!record) return
    if (!window.confirm(`Удалить протокол #${record.id}?`)) return
    setDeleting(true)
    try {
      await deleteCoreTest(record.id)
      navigate('/tests/core')
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
        <Link to="/tests/core" className="font-bold text-primary hover:underline">
          ← К протоколам
        </Link>
      </div>
    )
  }
  if (!record) return null

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <Link to="/tests/core" className="text-sm font-bold text-primary hover:underline">
        ← К протоколам
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="section-eyebrow">ГОСТ 28570-2019</span>
          <h1 className="section-title">Протокол #{record.id}</h1>
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
          <Info label="Лаборатория" value={record.manufacturer_info} />
          <Info label="Продукция" value={record.product_id} />
          <Info label="Конструкция" value={record.structure_name} />
          <Info label="Класс бетона" value={record.concrete_class} />
          <Info label="ТНПА" value={record.tnpa} />
          <Info label="Отбор проб" value={record.sampling_note || '—'} />
        </div>

        <div>
          <h2 className="mb-3 text-lg font-black text-navy">Образцы</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-3 py-2">№</th>
                  <th className="px-3 py-2">Форма</th>
                  <th className="px-3 py-2">Размеры</th>
                  <th className="px-3 py-2">F, кН</th>
                  <th className="px-3 py-2">α</th>
                  <th className="px-3 py-2">η₁</th>
                  <th className="px-3 py-2">Rобр</th>
                  <th className="px-3 py-2">R, МПа</th>
                </tr>
              </thead>
              <tbody>
                {record.samples.map((s, i) => {
                  const res = record.sample_results?.[i]
                  const size =
                    s.shape === 'cube'
                      ? `a=${s.edge_mm ?? res?.edge_mm ?? '—'} мм`
                      : `d=${s.diameter_mm ?? res?.diameter_mm ?? '—'}, h=${s.height_mm ?? res?.height_mm ?? '—'} мм`
                  return (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-3 py-2">{s.label || i + 1}</td>
                      <td className="px-3 py-2">{s.shape === 'cube' ? 'Куб' : 'Цилиндр'}</td>
                      <td className="px-3 py-2">{size}</td>
                      <td className="px-3 py-2">{s.force_kn}</td>
                      <td className="px-3 py-2">{res?.alpha ?? '—'}</td>
                      <td className="px-3 py-2">{res?.eta1 ?? '—'}</td>
                      <td className="px-3 py-2">{res?.r_obr_mpa ?? '—'}</td>
                      <td className="px-3 py-2 font-bold">{res?.r_mpa ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-l-4 border-primary bg-primary-light px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Средняя прочность серии (п. 9.3)
          </p>
          <p className="text-2xl font-black text-navy">
            {record.series_strength_mpa ?? '—'} МПа
          </p>
          {record.conclusion && (
            <p className="mt-2 text-sm text-navy">{record.conclusion}</p>
          )}
        </div>
        <SendResults kind="core" protocolId={record.id} defaultEmail={user.email} />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#f3f7f9] px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-navy">{value}</p>
    </div>
  )
}

export default CoreDetail

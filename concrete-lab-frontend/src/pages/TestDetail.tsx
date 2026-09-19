import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { deleteRecord, fetchRecord, ConcreteStrengthRecord } from '../api/concrete'
import { User } from '../api/auth'

interface TestDetailProps {
  user: User | null
  onLoginClick: () => void
}

const TestDetail: React.FC<TestDetailProps> = ({ user, onLoginClick }) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [record, setRecord] = useState<ConcreteStrengthRecord | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user || !id) {
      setLoading(false)
      return
    }
    const load = async () => {
      setError('')
      setLoading(true)
      try {
        const data = await fetchRecord(Number(id))
        setRecord(data)
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError('Запись не найдена или принадлежит другому пользователю')
        } else {
          setError('Не удалось загрузить запись')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, id])

  const handleDelete = async () => {
    if (!record) return
    if (!window.confirm(`Удалить запись #${record.id}?`)) return
    setDeleting(true)
    setError('')
    try {
      await deleteRecord(record.id)
      navigate('/tests')
    } catch {
      setError('Не удалось удалить запись')
      setDeleting(false)
    }
  }

  if (!user) {
    return (
      <div className="py-20 text-center">
        <span className="section-eyebrow">Протокол</span>
        <h2 className="mb-4 mt-2 text-3xl font-black text-navy">Нужен вход в систему</h2>
        <button
          onClick={onLoginClick}
          className="lab-button-primary"
        >
          Войти
        </button>
      </div>
    )
  }

  if (loading) {
    return <p className="text-gray-500 py-12">Загрузка...</p>
  }

  if (error && !record) {
    return (
      <div className="py-12 space-y-4">
        <p className="text-red-600">{error}</p>
        <Link to="/tests" className="text-primary hover:underline">
          ← К списку испытаний
        </Link>
      </div>
    )
  }

  if (!record) return null

  const fmt = (v: number | null | undefined) =>
    v === null || v === undefined ? '—' : Number(v).toFixed(2)

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to="/tests" className="text-sm font-bold text-primary hover:underline">
            ← К списку
          </Link>
          <span className="section-eyebrow mt-5">Результат испытания</span>
          <h1 className="section-title">Протокол #{record.id}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/tests/${record.id}/edit`}
            className="lab-button-primary"
          >
            Редактировать
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center rounded-md border border-red-600 px-5 py-3 font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          >
            {deleting ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="lab-card space-y-10">
        <section>
          <h2 className="mb-5 border-b border-slate-200 pb-3 text-xl font-black text-navy">
            <span className="mr-3 text-primary">01</span>Об объекте
          </h2>
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <Item label="Заявитель" value={record.applicant_info} />
            <Item label="Изготовитель" value={record.manufacturer_info} />
            <Item label="Продукция" value={record.product_id} />
            <Item label="ТНПА" value={record.tnpa} />
            <Item label="Класс" value={record.concrete_class} />
            <Item
              label="Партия / проба / серия"
              value={`${record.batch_N} / ${record.sample_N} / ${record.series_N}`}
            />
            <Item label="Дефекты" value={record.visual_inspection_defects || '—'} />
          </dl>
        </section>

        <section>
          <h2 className="mb-5 border-b border-slate-200 pb-3 text-xl font-black text-navy">
            <span className="mr-3 text-primary">02</span>Расчётные результаты
          </h2>
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <Item label="a ср., мм" value={fmt(record.a_avg)} />
            <Item label="b ср., мм" value={fmt(record.b_avg)} />
            <Item label="h ср., мм" value={fmt(record.h_avg)} />
            <Item label="Площадь A" value={fmt(record.working_area_a)} />
            <Item label="Объём V" value={fmt(record.volume_v)} />
            <Item label="Плотность" value={fmt(record.density_avg)} />
            <Item
              label="fc (прочность)"
              value={fmt(record.fc_cube_batch_i_sample_j_series_k)}
              highlight
            />
            <Item label="Сила F" value={String(record.max_force_f)} />
          </dl>
        </section>

        <section>
          <h2 className="mb-5 border-b border-slate-200 pb-3 text-xl font-black text-navy">
            <span className="mr-3 text-primary">03</span>После испытания
          </h2>
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <Item label="Осмотр" value={record.visual_inspection_broken || '—'} />
            <Item label="Схема разрушения" value={record.destruction_scheme || '—'} />
          </dl>
        </section>
      </div>
    </div>
  )
}

function Item({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className={highlight ? 'sm:col-span-2 border-l-4 border-primary bg-primary-light px-5 py-4' : 'bg-[#f3f7f9] px-4 py-3'}>
      <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className={`mt-1 font-semibold text-navy ${highlight ? 'text-2xl text-primary' : ''}`}>{value}</dd>
    </div>
  )
}

export default TestDetail

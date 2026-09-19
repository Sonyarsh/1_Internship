import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import {
  fetchRecord,
  recordToForm,
  updateRecord,
  ConcreteStrengthCreate,
} from '../api/concrete'
import { User } from '../api/auth'

interface TestEditProps {
  user: User | null
  onLoginClick: () => void
}

const emptyForm: ConcreteStrengthCreate = {
  applicant_info: '',
  manufacturer_info: '',
  product_id: '',
  tnpa: '',
  concrete_class: '',
  fck_cyl: 0,
  fck_cube: 0,
  batch_N: 1,
  sample_N: 1,
  series_N: 1,
  visual_inspection_defects: '',
  a1_geometry: 100,
  a2_geometry: 100,
  a3_geometry: 100,
  a4_geometry: 100,
  b1_geometry: 100,
  b2_geometry: 100,
  b3_geometry: 100,
  b4_geometry: 100,
  h1_geometry: 100,
  h2_geometry: 100,
  h3_geometry: 100,
  h4_geometry: 100,
  mass_m: 2.4,
  o1: 0.1,
  base_b1: 100,
  o2: 0.1,
  o3: 0.1,
  base_b2: 100,
  loading_speed: 0.6,
  loading_time: 60,
  max_force_f: 300,
  scale_factor_alpha: 1.0,
  visual_inspection_broken: '',
  destruction_scheme: '',
}

const TestEdit: React.FC<TestEditProps> = ({ user, onLoginClick }) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form, setForm] = useState<ConcreteStrengthCreate>(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
        setForm(recordToForm(data))
      } catch {
        setError('Не удалось загрузить запись')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, id])

  const setField = (name: keyof ConcreteStrengthCreate, value: string) => {
    const numericKeys: (keyof ConcreteStrengthCreate)[] = [
      'fck_cyl', 'fck_cube', 'batch_N', 'sample_N', 'series_N',
      'a1_geometry', 'a2_geometry', 'a3_geometry', 'a4_geometry',
      'b1_geometry', 'b2_geometry', 'b3_geometry', 'b4_geometry',
      'h1_geometry', 'h2_geometry', 'h3_geometry', 'h4_geometry',
      'mass_m', 'o1', 'base_b1', 'o2', 'o3', 'base_b2',
      'loading_speed', 'loading_time', 'max_force_f', 'scale_factor_alpha',
    ]
    if (numericKeys.includes(name)) {
      const num = value === '' ? 0 : Number(value)
      const rounded =
        name === 'scale_factor_alpha' ? Math.round(num * 100) / 100 : num
      setForm({ ...form, [name]: rounded })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setError('')
    setSaving(true)
    try {
      await updateRecord(Number(id), form)
      navigate(`/tests/${id}`)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail
        if (typeof detail === 'string') setError(detail)
        else if (Array.isArray(detail)) {
          setError(detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join('; '))
        } else setError(`Ошибка сохранения (${err.response?.status})`)
      } else {
        setError('Ошибка сети')
      }
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="py-20 text-center">
        <span className="section-eyebrow">Испытания</span>
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

  if (error && form.applicant_info === '' && form.product_id === '') {
    return (
      <div className="py-12 space-y-4">
        <p className="text-red-600">{error}</p>
        <Link to="/tests" className="text-primary hover:underline">
          ← К списку
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-8">
      <div>
        <Link to={`/tests/${id}`} className="text-sm font-bold text-primary hover:underline">
          ← К протоколу
        </Link>
        <span className="section-eyebrow mt-5">Изменение данных</span>
        <h1 className="section-title">Редактирование протокола #{id}</h1>
      </div>

      <form onSubmit={handleSubmit} className="lab-card space-y-8">
        <section className="space-y-4 border-b border-slate-200 pb-8">
          <h2 className="text-xl font-black text-navy"><span className="mr-3 text-primary">01</span>Об объекте</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Заявитель" value={form.applicant_info} onChange={(v) => setField('applicant_info', v)} required />
            <Field label="Изготовитель" value={form.manufacturer_info} onChange={(v) => setField('manufacturer_info', v)} required />
            <Field label="Идентификация продукции" value={form.product_id} onChange={(v) => setField('product_id', v)} required />
            <Field label="ТНПА" value={form.tnpa} onChange={(v) => setField('tnpa', v)} required />
            <Field label="Класс бетона" value={form.concrete_class} onChange={(v) => setField('concrete_class', v)} required />
            <Field label="Дефекты" value={form.visual_inspection_defects || ''} onChange={(v) => setField('visual_inspection_defects', v)} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Field label="fck cyl" type="number" value={String(form.fck_cyl)} onChange={(v) => setField('fck_cyl', v)} required />
            <Field label="fck cube" type="number" value={String(form.fck_cube)} onChange={(v) => setField('fck_cube', v)} required />
            <Field label="Партия N" type="number" value={String(form.batch_N)} onChange={(v) => setField('batch_N', v)} required />
            <Field label="Проба N" type="number" value={String(form.sample_N)} onChange={(v) => setField('sample_N', v)} required />
            <Field label="Серия N" type="number" value={String(form.series_N)} onChange={(v) => setField('series_N', v)} required />
          </div>
        </section>

        <section className="space-y-4 border-b border-slate-200 pb-8">
          <h2 className="text-xl font-black text-navy"><span className="mr-3 text-primary">02</span>Геометрия и масса</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['a1', 'a2', 'a3', 'a4', 'b1', 'b2', 'b3', 'b4', 'h1', 'h2', 'h3', 'h4'] as const).map((k, i) => (
              <Field
                key={k}
                label={k}
                type="number"
                value={String(form[`${k}_geometry` as keyof ConcreteStrengthCreate])}
                onChange={(v) => setField(`${k}_geometry` as keyof ConcreteStrengthCreate, v)}
                required
              />
            ))}
          </div>
          <Field label="Масса m" type="number" value={String(form.mass_m)} onChange={(v) => setField('mass_m', v)} required />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-navy"><span className="mr-3 text-primary">03</span>Измерения и нагружение</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="О1" type="number" value={String(form.o1)} onChange={(v) => setField('o1', v)} required />
            <Field label="База B1" type="number" value={String(form.base_b1)} onChange={(v) => setField('base_b1', v)} required />
            <Field label="О2" type="number" value={String(form.o2)} onChange={(v) => setField('o2', v)} required />
            <Field label="О3" type="number" value={String(form.o3)} onChange={(v) => setField('o3', v)} required />
            <Field label="База B2" type="number" value={String(form.base_b2)} onChange={(v) => setField('base_b2', v)} required />
            <Field label="Скорость v" type="number" value={String(form.loading_speed)} onChange={(v) => setField('loading_speed', v)} required />
            <Field label="Время T" type="number" value={String(form.loading_time)} onChange={(v) => setField('loading_time', v)} required />
            <Field label="Сила F" type="number" value={String(form.max_force_f)} onChange={(v) => setField('max_force_f', v)} required />
            <Field
              label="Коэф. α"
              type="number"
              step="0.01"
              value={Number(form.scale_factor_alpha).toFixed(2)}
              onChange={(v) => setField('scale_factor_alpha', v)}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Осмотр после разрушения" value={form.visual_inspection_broken || ''} onChange={(v) => setField('visual_inspection_broken', v)} />
            <Field label="Схема разрушения" value={form.destruction_scheme || ''} onChange={(v) => setField('destruction_scheme', v)} />
          </div>
        </section>

        {error && <p className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="lab-button-primary"
          >
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
          <Link
            to={`/tests/${id}`}
            className="lab-button-secondary"
          >
            Отмена
          </Link>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  step = 'any',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  step?: string
}) {
  return (
    <label className="block text-sm">
      <span className="lab-label">{label}</span>
      <input
        type={type}
        step={step}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="lab-input"
      />
    </label>
  )
}

export default TestEdit

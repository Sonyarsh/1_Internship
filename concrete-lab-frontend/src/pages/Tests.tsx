import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  createRecord,
  fetchRecords,
  ConcreteStrengthCreate,
  ConcreteStrengthRecord,
} from '../api/concrete'
import { User } from '../api/auth'

interface TestsProps {
  user: User | null
  onLoginClick: () => void
}

const defaultForm: ConcreteStrengthCreate = {
  applicant_info: '',
  manufacturer_info: '',
  product_id: '',
  tnpa: 'СТБ 1544',
  concrete_class: 'C25/30',
  fck_cyl: 25,
  fck_cube: 30,
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

const Tests: React.FC<TestsProps> = ({ user, onLoginClick }) => {
  const [form, setForm] = useState<ConcreteStrengthCreate>(defaultForm)
  const [records, setRecords] = useState<ConcreteStrengthRecord[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const loadRecords = async () => {
    if (!user) return
    try {
      const data = await fetchRecords()
      setRecords(data)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Сессия истекла — войдите снова')
      }
    }
  }

  useEffect(() => {
    loadRecords()
  }, [user])

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
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const created = await createRecord(form)
      setSuccess(
        `Запись #${created.id} сохранена. fc = ${created.fc_cube_batch_i_sample_j_series_k?.toFixed(2) ?? '—'}`
      )
      setForm({ ...defaultForm })
      await loadRecords()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError('Нет связи с API. Запустите python main.py')
        } else {
          const detail = err.response.data?.detail
          if (typeof detail === 'string') {
            setError(detail)
          } else if (Array.isArray(detail)) {
            setError(
              detail
                .map((d: { loc?: unknown[]; msg?: string }) =>
                  `${Array.isArray(d.loc) ? d.loc.join('.') : ''}: ${d.msg || ''}`
                )
                .join('; ') || `Ошибка ${err.response.status}`
            )
          } else {
            setError(`Не удалось сохранить (код ${err.response.status})`)
          }
        }
      } else {
        setError('Ошибка сети. Проверьте, что API запущен.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <span className="section-eyebrow">Испытания</span>
        <h2 className="mt-2 text-3xl font-black text-navy">Нужен вход в систему</h2>
        <p className="mb-6 mt-4 text-slate-600">
          Записи испытаний доступны только авторизованным пользователям.
        </p>
        <button
          onClick={onLoginClick}
          className="lab-button-primary"
        >
          Войти
        </button>
        <p className="mt-4 text-sm text-slate-500">
          Нет аккаунта? <Link to="/registration" className="text-primary hover:underline">Регистрация</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 py-8">
      <div>
        <span className="section-eyebrow">Новый протокол</span>
        <h1 className="section-title">Испытание бетона на сжатие</h1>
        <p className="mt-3 text-slate-600">
          Заполните протокол. Средние размеры и прочность fc посчитает сервер.
        </p>
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
            <Field label="Дефекты (визуально)" value={form.visual_inspection_defects || ''} onChange={(v) => setField('visual_inspection_defects', v)} />
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
          <h2 className="text-xl font-black text-navy"><span className="mr-3 text-primary">02</span>Геометрия образца (мм)</h2>
          <p className="text-sm text-slate-500">По умолчанию куб 100×100×100 — можно менять.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['a1', 'a2', 'a3', 'a4'] as const).map((k, i) => (
              <Field key={k} label={`a${i + 1}`} type="number" value={String(form[`${k}_geometry` as keyof ConcreteStrengthCreate])} onChange={(v) => setField(`${k}_geometry` as keyof ConcreteStrengthCreate, v)} required />
            ))}
            {(['b1', 'b2', 'b3', 'b4'] as const).map((k, i) => (
              <Field key={k} label={`b${i + 1}`} type="number" value={String(form[`${k}_geometry` as keyof ConcreteStrengthCreate])} onChange={(v) => setField(`${k}_geometry` as keyof ConcreteStrengthCreate, v)} required />
            ))}
            {(['h1', 'h2', 'h3', 'h4'] as const).map((k, i) => (
              <Field key={k} label={`h${i + 1}`} type="number" value={String(form[`${k}_geometry` as keyof ConcreteStrengthCreate])} onChange={(v) => setField(`${k}_geometry` as keyof ConcreteStrengthCreate, v)} required />
            ))}
          </div>
          <Field label="Масса m, кг" type="number" value={String(form.mass_m)} onChange={(v) => setField('mass_m', v)} required />
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
        {success && <p className="border-l-4 border-green-600 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="lab-button-primary"
        >
          {loading ? 'Сохранение...' : 'Сохранить испытание'}
        </button>
      </form>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Архив</span>
            <h2 className="mt-1 text-2xl font-black text-navy">Мои протоколы</h2>
          </div>
          <span className="text-sm text-slate-500">Записей: {records.length}</span>
        </div>
        {records.length === 0 ? (
          <p className="text-gray-500">Пока нет сохранённых испытаний.</p>
        ) : (
          <div className="overflow-x-auto border-t-4 border-primary bg-white shadow-[0_12px_35px_rgba(0,52,80,.08)]">
            <table className="w-full text-sm text-left">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Заявитель</th>
                  <th className="px-4 py-3">Класс</th>
                  <th className="px-4 py-3">Партия</th>
                  <th className="px-4 py-3">fc</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 transition hover:bg-primary-light">
                    <td className="px-4 py-3">{r.id}</td>
                    <td className="px-4 py-3">{r.applicant_info}</td>
                    <td className="px-4 py-3">{r.concrete_class}</td>
                    <td className="px-4 py-3">{r.batch_N}/{r.sample_N}/{r.series_N}</td>
                    <td className="px-4 py-3 font-semibold">
                      {r.fc_cube_batch_i_sample_j_series_k?.toFixed(2) ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/tests/${r.id}`}
                        className="font-bold text-primary hover:underline"
                      >
                        Открыть
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
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

export default Tests

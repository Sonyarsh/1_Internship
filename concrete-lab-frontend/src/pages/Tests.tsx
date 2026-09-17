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
  scale_factor_alpha: 1,
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
      setForm({ ...form, [name]: value === '' ? 0 : Number(value) })
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
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Нужен вход в систему</h2>
        <p className="text-gray-600 mb-6">
          Записи испытаний доступны только авторизованным пользователям.
        </p>
        <button
          onClick={onLoginClick}
          className="bg-primary text-white px-6 py-3 rounded-xl font-semibold"
        >
          Войти
        </button>
        <p className="mt-4 text-sm text-gray-500">
          Нет аккаунта? <Link to="/registration" className="text-primary hover:underline">Регистрация</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-2">Испытания на сжатие</h1>
        <p className="text-gray-600">
          Заполните протокол. Средние размеры и прочность fc посчитает сервер.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-3xl p-8 space-y-8 shadow-sm">
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Об объекте</h2>
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

        <section className="space-y-4">
          <h2 className="text-xl font-bold">Геометрия образца (мм)</h2>
          <p className="text-sm text-gray-500">По умолчанию куб 100×100×100 — можно менять.</p>
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
          <h2 className="text-xl font-bold">Измерения и нагружение</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="О1" type="number" value={String(form.o1)} onChange={(v) => setField('o1', v)} required />
            <Field label="База B1" type="number" value={String(form.base_b1)} onChange={(v) => setField('base_b1', v)} required />
            <Field label="О2" type="number" value={String(form.o2)} onChange={(v) => setField('o2', v)} required />
            <Field label="О3" type="number" value={String(form.o3)} onChange={(v) => setField('o3', v)} required />
            <Field label="База B2" type="number" value={String(form.base_b2)} onChange={(v) => setField('base_b2', v)} required />
            <Field label="Скорость v" type="number" value={String(form.loading_speed)} onChange={(v) => setField('loading_speed', v)} required />
            <Field label="Время T" type="number" value={String(form.loading_time)} onChange={(v) => setField('loading_time', v)} required />
            <Field label="Сила F" type="number" value={String(form.max_force_f)} onChange={(v) => setField('max_force_f', v)} required />
            <Field label="Коэф. α" type="number" value={String(form.scale_factor_alpha)} onChange={(v) => setField('scale_factor_alpha', v)} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Осмотр после разрушения" value={form.visual_inspection_broken || ''} onChange={(v) => setField('visual_inspection_broken', v)} />
            <Field label="Схема разрушения" value={form.destruction_scheme || ''} onChange={(v) => setField('destruction_scheme', v)} />
          </div>
        </section>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-700 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark disabled:opacity-60"
        >
          {loading ? 'Сохранение...' : 'Сохранить испытание'}
        </button>
      </form>

      <section>
        <h2 className="text-2xl font-bold mb-4">Мои записи</h2>
        {records.length === 0 ? (
          <p className="text-gray-500">Пока нет сохранённых испытаний.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Заявитель</th>
                  <th className="px-4 py-3">Класс</th>
                  <th className="px-4 py-3">Партия</th>
                  <th className="px-4 py-3">fc</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{r.id}</td>
                    <td className="px-4 py-3">{r.applicant_info}</td>
                    <td className="px-4 py-3">{r.concrete_class}</td>
                    <td className="px-4 py-3">{r.batch_N}/{r.sample_N}/{r.series_N}</td>
                    <td className="px-4 py-3 font-semibold">
                      {r.fc_cube_batch_i_sample_j_series_k?.toFixed(2) ?? '—'}
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
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <label className="block text-sm">
      <span className="text-gray-600 mb-1 block">{label}</span>
      <input
        type={type}
        step="any"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
      />
    </label>
  )
}

export default Tests

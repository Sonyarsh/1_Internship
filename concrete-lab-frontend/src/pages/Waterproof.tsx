import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  createWaterproofTest,
  fetchWaterproofCatalog,
  fetchWaterproofTests,
  SampleHeight,
  WaterproofCatalog,
  WaterproofMode,
  WaterproofRecord,
} from '../api/waterproof'
import { User } from '../api/auth'

interface WaterproofProps {
  user: User | null
  onLoginClick: () => void
}

const STEPS = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0]

const Waterproof: React.FC<WaterproofProps> = ({ user, onLoginClick }) => {
  const [catalog, setCatalog] = useState<WaterproofCatalog | null>(null)
  const [records, setRecords] = useState<WaterproofRecord[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const [applicant, setApplicant] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [product, setProduct] = useState('')
  const [concreteClass, setConcreteClass] = useState('C25/30')
  const [mode, setMode] = useState<WaterproofMode>('determine_mark')
  const [height, setHeight] = useState<SampleHeight>(150)
  const [projectMark, setProjectMark] = useState('W6')
  const [diameters, setDiameters] = useState<string[]>(Array(6).fill('150'))
  const [pressures, setPressures] = useState<string[]>(Array(6).fill('0.6'))

  const holdHours = catalog?.hold_hours?.[String(height)] ?? 16

  const marks = useMemo(
    () => catalog?.marks ?? [],
    [catalog]
  )

  useEffect(() => {
    if (!user) return
    fetchWaterproofCatalog()
      .then(setCatalog)
      .catch(() => setError('Не удалось загрузить справочник ГОСТ 12730.5'))
    fetchWaterproofTests()
      .then(setRecords)
      .catch(() => undefined)
  }, [user])

  const setPressure = (index: number, value: string) => {
    const next = [...pressures]
    next[index] = value
    setPressures(next)
  }

  const fillExample = () => {
    setApplicant('ООО «Заказчик»')
    setManufacturer('РУП «Завод ЖБИ»')
    setProduct('Бетон гидротехнический')
    setConcreteClass('C25/30')
    setMode('determine_mark')
    setHeight(150)
    setProjectMark('W6')
    setDiameters(['152', '148', '151', '150', '149', '153'])
    // 4 образца выдержали 0,6 МПа → серия W6
    setPressures(['0.4', '0.6', '0.6', '0.8', '0.6', '0.4'])
  }

  const setDiameter = (index: number, value: string) => {
    const next = [...diameters]
    next[index] = value
    setDiameters(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const sample_diameters_mm = diameters.map((d) => Number(d))
      const sample_dry_pressures_mpa = pressures.map((p) => Number(p))
      if (sample_diameters_mm.some((d) => Number.isNaN(d) || d < 130)) {
        setError('Диаметр открытого торца каждого образца ≥ 130 мм (п. 4.2.3)')
        setLoading(false)
        return
      }
      const created = await createWaterproofTest({
        applicant_info: applicant,
        manufacturer_info: manufacturer,
        product_id: product,
        tnpa: 'ГОСТ 12730.5-2018',
        general_tnpa: 'ГОСТ 12730.0-2020',
        concrete_class: concreteClass,
        mode,
        sample_height_mm: height,
        project_mark: projectMark || null,
        sample_diameters_mm,
        sample_dry_pressures_mpa,
      })
      setSuccess(
        `Протокол #${created.id}: ${created.achieved_mark ?? 'марка не установлена'}. ${created.conclusion ?? ''}`
      )
      setRecords(await fetchWaterproofTests())
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail
        if (typeof detail === 'string') setError(detail)
        else if (Array.isArray(detail)) {
          setError(detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join('; '))
        } else if (!err.response) setError('Нет связи с API')
        else setError(`Ошибка ${err.response.status}`)
      } else setError('Нет связи с API')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <span className="section-eyebrow">ГОСТ 12730.5-2018</span>
        <h2 className="mt-2 text-3xl font-black text-navy">Нужен вход в систему</h2>
        <p className="mb-6 mt-4 text-slate-600">
          Протоколы водонепроницаемости хранятся в вашем кабинете.
        </p>
        <button onClick={onLoginClick} className="lab-button-primary">
          Войти
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 py-8">
      <div>
        <Link to="/tests" className="text-sm font-bold text-primary hover:underline">
          ← Все испытания
        </Link>
        <span className="section-eyebrow mt-5">ГОСТ 12730.5-2018 · п. 4</span>
        <h1 className="section-title">Водонепроницаемость — мокрое пятно</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Базовый метод по ГОСТ 12730.5-2018 (общие требования — ГОСТ 12730.0-2020). Серия из
          6 образцов: давление воды снизу ступенями по 0,2 МПа. Марка W — максимальное
          давление, при котором фильтрации нет не менее чем на четырёх образцах.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="lab-card space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-black text-navy">Протокол</h2>
          <button
            type="button"
            onClick={fillExample}
            className="text-sm font-bold text-primary hover:underline"
          >
            Подставить пример
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Заявитель" value={applicant} onChange={setApplicant} required />
          <Field label="Изготовитель" value={manufacturer} onChange={setManufacturer} required />
          <Field label="Продукция" value={product} onChange={setProduct} required />
          <Field label="Класс бетона" value={concreteClass} onChange={setConcreteClass} required />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="lab-label">Режим (п. 4.3)</span>
            <select
              className="lab-input"
              value={mode}
              onChange={(e) => setMode(e.target.value as WaterproofMode)}
            >
              {(catalog?.modes ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
              {!catalog && (
                <>
                  <option value="determine_mark">Определение марки (п. 4.3.2)</option>
                  <option value="check_project">Контроль проектной марки (п. 4.3.3)</option>
                </>
              )}
            </select>
          </label>
          <label className="block text-sm">
            <span className="lab-label">Высота образца, мм (табл. 2)</span>
            <select
              className="lab-input"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value) as SampleHeight)}
            >
              <option value={150}>150 — выдержка {catalog?.hold_hours?.['150'] ?? 16} ч</option>
              <option value={100}>100 — выдержка {catalog?.hold_hours?.['100'] ?? 12} ч</option>
              <option value={50}>50 — выдержка {catalog?.hold_hours?.['50'] ?? 6} ч</option>
              <option value={30}>30 — выдержка {catalog?.hold_hours?.['30'] ?? 4} ч</option>
            </select>
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="lab-label">
              {mode === 'check_project' ? 'Проектная марка *' : 'Заявленная марка (необяз.)'}
            </span>
            <select
              className="lab-input"
              value={projectMark}
              onChange={(e) => setProjectMark(e.target.value)}
              required={mode === 'check_project'}
            >
              {mode !== 'check_project' && <option value="">Не указана</option>}
              {marks.map((item) => (
                <option key={item.mark} value={item.mark}>
                  {item.mark} ({item.pressure_mpa.toFixed(1)} МПа)
                </option>
              ))}
              {marks.length === 0 &&
                ['W2', 'W4', 'W6', 'W8', 'W10', 'W12', 'W14', 'W16', 'W18', 'W20'].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
            </select>
          </label>
        </div>

        <p className="text-sm text-slate-500">
          Выдержка на каждой ступени при высоте {height} мм: <strong>{holdHours} ч</strong>.
          Для каждого образца укажите диаметр открытого торца (≥130 мм, п. 4.2.3) и максимальное
          давление без фильтрации (п. 4.4.1), МПа. Если пятно появилось уже на 0,2 МПа — давление 0.
        </p>

        <div className="space-y-3">
          {pressures.map((value, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-3 rounded-md border border-slate-100 bg-[#f8fafb] p-3 sm:grid-cols-[auto_1fr_1fr] sm:items-end"
            >
              <p className="text-sm font-extrabold text-navy sm:pb-2">Образец {index + 1}</p>
              <label className="block text-sm">
                <span className="lab-label">Диаметр открытого торца, мм</span>
                <input
                  className="lab-input"
                  type="number"
                  min={130}
                  step={0.1}
                  value={diameters[index]}
                  onChange={(e) => setDiameter(index, e.target.value)}
                  required
                />
              </label>
              <label className="block text-sm">
                <span className="lab-label">Давление без фильтрации, МПа</span>
                <select
                  className="lab-input"
                  value={value}
                  onChange={(e) => setPressure(index, e.target.value)}
                  required
                >
                  {STEPS.map((step) => (
                    <option key={step} value={String(step)}>
                      {step === 0 ? '0 (фильтрация на 0,2)' : step.toFixed(1)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>

        {error && (
          <p className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {success && (
          <p className="border-l-4 border-green-600 bg-green-50 px-4 py-3 text-sm text-green-800">
            {success}
          </p>
        )}
        <button type="submit" disabled={loading} className="lab-button-primary">
          {loading ? 'Расчёт...' : 'Рассчитать и сохранить'}
        </button>
      </form>

      <section>
        <h2 className="mb-4 text-2xl font-black text-navy">Мои протоколы</h2>
        {records.length === 0 ? (
          <p className="text-slate-500">Пока нет сохранённых испытаний на водонепроницаемость.</p>
        ) : (
          <div className="overflow-x-auto border-t-4 border-primary bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Продукция</th>
                  <th className="px-4 py-3">Серия, МПа</th>
                  <th className="px-4 py-3">Марка</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{record.id}</td>
                    <td className="px-4 py-3">{record.product_id}</td>
                    <td className="px-4 py-3">
                      {record.series_pressure_mpa?.toFixed(1) ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {record.achieved_mark || 'не установлена'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/tests/waterproof/${record.id}`}
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
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <label className="block text-sm">
      <span className="lab-label">{label}</span>
      <input
        className="lab-input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  )
}

export default Waterproof

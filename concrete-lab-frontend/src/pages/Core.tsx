import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  CoreRecord,
  CoreSampleInput,
  CoreShape,
  createCoreTest,
  fetchCoreTests,
} from '../api/core'
import { User } from '../api/auth'

interface CoreProps {
  user: User | null
  onLoginClick: () => void
}

type SampleForm = {
  shape: CoreShape
  force_kn: string
  edge_mm: string
  diameter_mm: string
  height_mm: string
  label: string
}

const emptySample = (): SampleForm => ({
  shape: 'cylinder',
  force_kn: '450',
  edge_mm: '150',
  diameter_mm: '100',
  height_mm: '100',
  label: '',
})

const Core: React.FC<CoreProps> = ({ user, onLoginClick }) => {
  const [records, setRecords] = useState<CoreRecord[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const [applicant, setApplicant] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [product, setProduct] = useState('')
  const [structure, setStructure] = useState('')
  const [concreteClass, setConcreteClass] = useState('C25/30')
  const [samplingNote, setSamplingNote] = useState('')
  const [samples, setSamples] = useState<SampleForm[]>([emptySample(), emptySample(), emptySample()])

  useEffect(() => {
    if (!user) return
    fetchCoreTests().then(setRecords).catch(() => undefined)
  }, [user])

  const updateSample = (index: number, patch: Partial<SampleForm>) => {
    setSamples((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  const addSample = () => setSamples((prev) => [...prev, emptySample()])
  const removeSample = (index: number) => {
    if (samples.length <= 1) return
    setSamples((prev) => prev.filter((_, i) => i !== index))
  }

  const fillExample = () => {
    setApplicant('ООО «Заказчик»')
    setManufacturer('Лаборатория БетонЛаб')
    setProduct('Бетон конструкции')
    setStructure('Колонна К-1, отм. +3.000')
    setConcreteClass('C25/30')
    setSamplingNote('Керны выбурены алмазной коронкой, выдержаны в лаборатории')
    setSamples([
      {
        shape: 'cylinder',
        force_kn: '420',
        edge_mm: '150',
        diameter_mm: '100',
        height_mm: '100',
        label: 'Керн 1',
      },
      {
        shape: 'cylinder',
        force_kn: '435',
        edge_mm: '150',
        diameter_mm: '98',
        height_mm: '102',
        label: 'Керн 2',
      },
      {
        shape: 'cube',
        force_kn: '510',
        edge_mm: '100',
        diameter_mm: '100',
        height_mm: '100',
        label: 'Куб из выпилки',
      },
    ])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const payloadSamples: CoreSampleInput[] = samples.map((s) => {
        if (s.shape === 'cube') {
          return {
            shape: 'cube',
            force_kn: Number(s.force_kn),
            edge_mm: Number(s.edge_mm),
            label: s.label || null,
          }
        }
        return {
          shape: 'cylinder',
          force_kn: Number(s.force_kn),
          diameter_mm: Number(s.diameter_mm),
          height_mm: Number(s.height_mm),
          label: s.label || null,
        }
      })
      const created = await createCoreTest({
        applicant_info: applicant,
        manufacturer_info: manufacturer,
        product_id: product,
        structure_name: structure,
        tnpa: 'ГОСТ 28570-2019',
        concrete_class: concreteClass,
        sampling_note: samplingNote || null,
        samples: payloadSamples,
      })
      setSuccess(
        `Протокол #${created.id}: средняя прочность серии ${created.series_strength_mpa} МПа`
      )
      setRecords(await fetchCoreTests())
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
        <span className="section-eyebrow">ГОСТ 28570-2019</span>
        <h2 className="mt-2 text-3xl font-black text-navy">Нужен вход в систему</h2>
        <p className="mb-6 mt-4 text-slate-600">
          Протоколы прочности по образцам из конструкций — в личном кабинете.
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
        <span className="section-eyebrow mt-5">ГОСТ 28570-2019</span>
        <h1 className="section-title">Испытание на сжатие в конструкциях</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Прочность по кернам и выпилкам из изделий/конструкций. Расчёт: R = (F/A)·α·η₁ с
          приведением к базовому кубу 150 мм. Отдельно от лабораторных кубов по ГОСТ 10180.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="lab-card space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-black text-navy">Протокол</h2>
          <button type="button" onClick={fillExample} className="text-sm font-bold text-primary hover:underline">
            Подставить пример
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Заявитель" value={applicant} onChange={setApplicant} required />
          <Field label="Организация / лаборатория" value={manufacturer} onChange={setManufacturer} required />
          <Field label="Продукция / объект контроля" value={product} onChange={setProduct} required />
          <Field label="Конструкция (место отбора)" value={structure} onChange={setStructure} required />
          <Field label="Класс бетона" value={concreteClass} onChange={setConcreteClass} required />
          <Field label="Примечание по отбору проб" value={samplingNote} onChange={setSamplingNote} />
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-black text-navy">Образцы</h3>
            <button type="button" onClick={addSample} className="text-sm font-bold text-primary hover:underline">
              + Добавить образец
            </button>
          </div>

          {samples.map((s, index) => (
            <div key={index} className="space-y-3 rounded-md border border-slate-100 bg-[#f8fafb] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-extrabold text-navy">Образец {index + 1}</p>
                {samples.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSample(index)}
                    className="text-sm font-bold text-red-600 hover:underline"
                  >
                    Удалить
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block text-sm">
                  <span className="lab-label">Форма</span>
                  <select
                    className="lab-input"
                    value={s.shape}
                    onChange={(e) => updateSample(index, { shape: e.target.value as CoreShape })}
                  >
                    <option value="cylinder">Цилиндр (керн)</option>
                    <option value="cube">Куб</option>
                  </select>
                </label>
                <Field
                  label="Метка / номер"
                  value={s.label}
                  onChange={(v) => updateSample(index, { label: v })}
                />
                <Field
                  label="Разрушающее усилие F, кН"
                  value={s.force_kn}
                  onChange={(v) => updateSample(index, { force_kn: v })}
                  type="number"
                  required
                />
                {s.shape === 'cube' ? (
                  <Field
                    label="Ребро куба a, мм"
                    value={s.edge_mm}
                    onChange={(v) => updateSample(index, { edge_mm: v })}
                    type="number"
                    required
                  />
                ) : (
                  <>
                    <Field
                      label="Диаметр d, мм"
                      value={s.diameter_mm}
                      onChange={(v) => updateSample(index, { diameter_mm: v })}
                      type="number"
                      required
                    />
                    <Field
                      label="Высота h, мм"
                      value={s.height_mm}
                      onChange={(v) => updateSample(index, { height_mm: v })}
                      type="number"
                      required
                    />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
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
          <p className="text-slate-500">Пока нет протоколов по ГОСТ 28570.</p>
        ) : (
          <div className="overflow-x-auto border-t-4 border-primary bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Конструкция</th>
                  <th className="px-4 py-3">Образцов</th>
                  <th className="px-4 py-3">Rср, МПа</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{r.id}</td>
                    <td className="px-4 py-3">{r.structure_name}</td>
                    <td className="px-4 py-3">{r.samples_count ?? r.samples.length}</td>
                    <td className="px-4 py-3 font-semibold">{r.series_strength_mpa ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/tests/core/${r.id}`}
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
        step={type === 'number' ? 'any' : undefined}
      />
    </label>
  )
}

export default Core

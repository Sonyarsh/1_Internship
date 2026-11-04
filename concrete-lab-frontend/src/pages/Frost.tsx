import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  createFrostTest,
  fetchFrostCatalog,
  fetchFrostTests,
  FrostExposure,
  FrostInput,
  FrostMethod,
  FrostMethodInfo,
  FrostRecord,
} from '../api/frost'
import { User } from '../api/auth'

interface FrostProps {
  user: User | null
  onLoginClick: () => void
}

const emptySix = () => ['', '', '', '', '', '']

const Frost: React.FC<FrostProps> = ({ user, onLoginClick }) => {
  const [methods, setMethods] = useState<FrostMethodInfo[]>([])
  const [records, setRecords] = useState<FrostRecord[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const [applicant, setApplicant] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [product, setProduct] = useState('')
  const [concreteClass, setConcreteClass] = useState('B25')
  const [method, setMethod] = useState<FrostMethod>('basic1')
  const [exposure, setExposure] = useState<FrostExposure>('water')
  const [lightweight, setLightweight] = useState(false)
  const [size, setSize] = useState<100 | 150>(100)
  const [projectMark, setProjectMark] = useState(100)
  const [cycles, setCycles] = useState('100')
  const [freezeTemp, setFreezeTemp] = useState('-18')
  const [freezeHours, setFreezeHours] = useState('2.5')
  const [thawTemp, setThawTemp] = useState('20')
  const [thawHours, setThawHours] = useState('2')
  const [control, setControl] = useState(emptySix)
  const [main, setMain] = useState(emptySix)
  const [massBefore, setMassBefore] = useState(emptySix)
  const [massAfter, setMassAfter] = useState(emptySix)
  const [cracks, setCracks] = useState(false)
  const [chips, setChips] = useState(false)
  const [edgeScaling, setEdgeScaling] = useState(false)
  const [surfaceScaling, setSurfaceScaling] = useState(false)
  const [decorative, setDecorative] = useState(false)
  const [densitySpread, setDensitySpread] = useState('')

  const current = methods.find((item) => item.id === method)
  const exposureOptions = current ? (Object.keys(current.exposures) as FrostExposure[]) : []
  const marks = current?.exposures[exposure] ?? []

  useEffect(() => {
    if (!user) return
    fetchFrostCatalog()
      .then((data) => {
        setMethods(data.methods)
      })
      .catch(() => setError('Не удалось загрузить методы ГОСТ 10060-2012'))
    fetchFrostTests()
      .then(setRecords)
      .catch(() => setError('Не удалось загрузить протоколы'))
  }, [user])

  useEffect(() => {
    if (!current) return
    if (!current.exposures[exposure]) {
      const next = Object.keys(current.exposures)[0] as FrostExposure
      setExposure(next)
    }
  }, [current, exposure])

  const selectedMark = useMemo(
    () => marks.find((item) => item.mark === projectMark) ?? marks[0],
    [marks, projectMark],
  )

  useEffect(() => {
    if (selectedMark && selectedMark.mark !== projectMark) setProjectMark(selectedMark.mark)
  }, [selectedMark, projectMark])

  const regimeHint = method === 'accel3'
    ? `Замораживание в растворе NaCl до минус 50…55 °C, выдержка не менее 2,5 ч. Оттаивание при (20±2) °C не менее ${size === 100 ? '2,5' : '3,5'} ч.`
    : `Замораживание на воздухе при минус (18±2) °C не менее ${size === 100 ? '2,5' : '3,5'} ч. Оттаивание ${size === 100 ? '(2±0,5)' : '(3±0,5)'} ч при (20±2) °C.`

  const fillExample = () => {
    setMethod('accel3')
    setExposure('mineralized')
    setSize(100)
    setProjectMark(300)
    setCycles('37')
    setFreezeTemp('-50')
    setFreezeHours('2.5')
    setThawTemp('20')
    setThawHours('2.5')
    setConcreteClass('B30')
    setControl(['40.5', '42.0', '42.8', '41.6', '39.0', '43.7'])
    setMain(['40.5', '43.7', '42.9', '41.6', '42.8', '40.1'])
    setMassBefore(Array(6).fill('2400'))
    setMassAfter(Array(6).fill('2380'))
    setCracks(false)
    setChips(false)
    setEdgeScaling(false)
    setSurfaceScaling(false)
    setDecorative(false)
    setDensitySpread('10')
    setApplicant((value) => value || 'Лаборатория')
    setManufacturer((value) => value || 'Учебный замес')
    setProduct((value) => value || 'Куб 100 мм')
  }

  const parseSix = (values: string[], title: string) => {
    const numbers = values.map((value) => Number(value.replace(',', '.')))
    if (numbers.some((value) => !Number.isFinite(value) || value <= 0)) {
      throw new Error(`${title}: заполните 6 положительных чисел`)
    }
    return numbers
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    let payload: FrostInput
    try {
      payload = {
        applicant_info: applicant.trim(),
        manufacturer_info: manufacturer.trim(),
        product_id: product.trim(),
        tnpa: 'ГОСТ 10060-2012',
        concrete_class: concreteClass.trim(),
        method,
        exposure,
        lightweight,
        sample_size_mm: size,
        project_mark: projectMark,
        cycles_done: Number(cycles),
        freeze_temp_c: Number(freezeTemp),
        freeze_hours: Number(freezeHours),
        thaw_temp_c: Number(thawTemp),
        thaw_hours: Number(thawHours),
        control_strengths: parseSix(control, 'Контрольные образцы'),
        main_strengths: parseSix(main, 'Основные образцы'),
        mass_before_g: parseSix(massBefore, 'Масса до циклов'),
        mass_after_g: parseSix(massAfter, 'Масса после циклов'),
        cracks,
        chips,
        edge_scaling: edgeScaling,
        surface_scaling: surfaceScaling,
        decorative_surface: decorative,
        density_spread_kg_m3: densitySpread === '' ? null : Number(densitySpread),
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Проверьте числа в форме')
      return
    }
    setLoading(true)
    try {
      const created = await createFrostTest(payload)
      setSuccess(created.conclusion || 'Протокол сохранён')
      setRecords(await fetchFrostTests())
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail
        if (typeof detail === 'string') setError(detail)
        else if (Array.isArray(detail)) {
          setError(detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join('; ') || 'Ошибка данных')
        } else setError('Не удалось сохранить протокол')
      } else setError('Нет связи с API')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <span className="section-eyebrow">ГОСТ 10060-2012</span>
        <h2 className="mt-2 text-3xl font-black text-navy">Нужен вход в систему</h2>
        <p className="mb-6 mt-4 text-slate-600">Протоколы морозостойкости хранятся в вашем кабинете.</p>
        <button onClick={onLoginClick} className="lab-button-primary">Войти</button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 py-8">
      <div>
        <span className="section-eyebrow">ГОСТ 10060-2012</span>
        <h1 className="section-title">Морозостойкость бетона</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Марку F1 или F2 ставят по числу циклов, которое серия выдержала: нижняя граница
          прочности основных образцов не ниже 0,9 границы контрольных, потеря массы не больше 2 %,
          вариация в серии не выше 9 %, без трещин, сколов и шелушения рёбер.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="lab-card space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-black text-navy">Протокол</h2>
          <button type="button" onClick={fillExample} className="text-sm font-bold text-primary hover:underline">
            Подставить пример приложения Д
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
            <span className="lab-label">Метод</span>
            <select className="lab-input" value={method} onChange={(e) => setMethod(e.target.value as FrostMethod)}>
              {methods.map((item) => (
                <option key={item.id} value={item.id}>{item.title}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="lab-label">Среда</span>
            <select
              className="lab-input"
              value={exposure}
              onChange={(e) => setExposure(e.target.value as FrostExposure)}
              disabled={exposureOptions.length < 2}
            >
              {exposureOptions.map((item) => (
                <option key={item} value={item}>
                  {item === 'water' ? 'Вода, марка F1' : '5 % NaCl, марка F2'}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="lab-label">Ребро куба, мм</span>
            <select className="lab-input" value={size} onChange={(e) => setSize(Number(e.target.value) as 100 | 150)}>
              <option value={100}>100</option>
              <option value={150}>150</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="lab-label">Заявленная марка</span>
            <select className="lab-input" value={projectMark} onChange={(e) => setProjectMark(Number(e.target.value))}>
              {marks.map((item) => (
                <option key={item.mark} value={item.mark}>
                  {item.label} — {item.final} циклов
                  {item.intermediate ? ` (промежуточно ${item.intermediate})` : ''}
                </option>
              ))}
            </select>
          </label>
          <Field label="Выполнено циклов" value={cycles} onChange={setCycles} type="number" required />
          <Field label="Отклонение плотности от средней, кг/м³" value={densitySpread} onChange={setDensitySpread} type="number" />
        </div>
        {current && <p className="text-sm text-slate-500">{current.note}</p>}
        {method === 'basic1' && (
          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" checked={lightweight} onChange={(e) => setLightweight(e.target.checked)} />
            Лёгкий бетон марки F50 и ниже: критерий — снижение средней прочности не больше 15 %
          </label>
        )}

        <section className="space-y-3">
          <h3 className="font-black text-navy">Режим цикла</h3>
          <p className="text-sm text-slate-500">{regimeHint}</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Field label="Замораживание, °C" value={freezeTemp} onChange={setFreezeTemp} type="number" required />
            <Field label="Выдержка, ч" value={freezeHours} onChange={setFreezeHours} type="number" required />
            <Field label="Оттаивание, °C" value={thawTemp} onChange={setThawTemp} type="number" required />
            <Field label="Оттаивание, ч" value={thawHours} onChange={setThawHours} type="number" required />
          </div>
        </section>

        <Series title="Контрольные образцы, прочность, МПа" values={control} onChange={setControl} />
        <Series title="Основные образцы после циклов, прочность, МПа" values={main} onChange={setMain} />
        <Series title="Масса основных до циклов, г" values={massBefore} onChange={setMassBefore} />
        <Series title="Масса основных после циклов, г" values={massAfter} onChange={setMassAfter} />

        <div className="grid gap-2 text-sm text-navy sm:grid-cols-2">
          <Check label="Трещины" checked={cracks} onChange={setCracks} />
          <Check label="Сколы" checked={chips} onChange={setChips} />
          <Check label="Шелушение рёбер" checked={edgeScaling} onChange={setEdgeScaling} />
          <Check label="Шелушение поверхности" checked={surfaceScaling} onChange={setSurfaceScaling} />
          <Check label="К бетону есть требования по декоративности" checked={decorative} onChange={setDecorative} />
        </div>

        {error && <p className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {success && <p className="border-l-4 border-green-600 bg-green-50 px-4 py-3 text-sm text-green-800">{success}</p>}
        <button type="submit" disabled={loading} className="lab-button-primary">
          {loading ? 'Расчёт...' : 'Рассчитать и сохранить'}
        </button>
      </form>

      <section>
        <h2 className="mb-4 text-2xl font-black text-navy">Мои протоколы</h2>
        {records.length === 0 ? (
          <p className="text-slate-500">Пока нет сохранённых испытаний на морозостойкость.</p>
        ) : (
          <div className="overflow-x-auto border-t-4 border-primary bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Продукция</th>
                  <th className="px-4 py-3">Циклы</th>
                  <th className="px-4 py-3">Марка</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{record.id}</td>
                    <td className="px-4 py-3">{record.product_id}</td>
                    <td className="px-4 py-3">{record.cycles_done}</td>
                    <td className="px-4 py-3 font-semibold">{record.achieved_mark || 'не подтверждена'}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/frost/${record.id}`} className="font-bold text-primary hover:underline">Открыть</Link>
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
  label, value, onChange, type = 'text', required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <label className="block text-sm">
      <span className="lab-label">{label}</span>
      <input
        className="lab-input"
        type={type}
        step="any"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function Series({ title, values, onChange }: { title: string; values: string[]; onChange: (next: string[]) => void }) {
  return (
    <section>
      <h3 className="mb-2 font-black text-navy">{title}</h3>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
        {values.map((value, index) => (
          <input
            key={index}
            className="lab-input"
            inputMode="decimal"
            required
            placeholder={`${index + 1}`}
            value={value}
            onChange={(e) => {
              const next = [...values]
              next[index] = e.target.value
              onChange(next)
            }}
          />
        ))}
      </div>
    </section>
  )
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

export default Frost

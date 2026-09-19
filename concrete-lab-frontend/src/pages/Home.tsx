import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FlaskConical,
  Gauge,
  Microscope,
  ShieldCheck,
} from 'lucide-react'
import { createContactRequest } from '../api/contact'

const SERVICE_OPTIONS = [
  'Испытания прочности',
  'Лабораторный контроль',
  'Контроль конструкций',
  'Протоколы испытаний',
  'Другое',
]

const Home: React.FC = () => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)

  const services = [
    {
      icon: Gauge,
      title: 'Испытания прочности',
      text: 'Определяем прочность бетона на сжатие по контрольным образцам-кубам.',
    },
    {
      icon: Microscope,
      title: 'Лабораторный контроль',
      text: 'Исследуем свойства бетонных смесей и готовых железобетонных изделий.',
    },
    {
      icon: Building2,
      title: 'Контроль конструкций',
      text: 'Проводим обследование бетона непосредственно на строительном объекте.',
    },
    {
      icon: ClipboardCheck,
      title: 'Протоколы испытаний',
      text: 'Фиксируем результаты, расчёты и историю испытаний в личном кабинете.',
    },
  ]

  const steps = [
    ['01', 'Заявка', 'Уточняем объект, вид испытания и необходимые нормативы.'],
    ['02', 'Отбор образцов', 'Принимаем образцы или организуем выезд специалиста.'],
    ['03', 'Испытание', 'Проводим измерения на поверенном оборудовании.'],
    ['04', 'Протокол', 'Выдаём документированные результаты и расчёты.'],
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormSuccess(false)
    setSending(true)
    try {
      await createContactRequest({
        name,
        phone: phone || undefined,
        email,
        service_type: serviceType || undefined,
        message,
      })
      setFormSuccess(true)
      setName('')
      setPhone('')
      setEmail('')
      setServiceType('')
      setMessage('')
    } catch {
      setFormError('Не удалось отправить заявку. Проверьте поля и что API запущен.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <section className="relative min-h-[610px] overflow-hidden bg-navy">
        <img
          src="https://cdn1.tenchat.ru/static/vbc-gostinder/2025-01-28/compressed/5e42afb4-1073-4e43-b5a7-fc9d63562a53.jpeg?width=720&height=720&fmt=webp"
          alt="Лабораторные испытания бетона"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,42,67,.96)_0%,rgba(0,61,93,.82)_46%,rgba(0,61,93,.18)_100%)]" />

        <div className="site-container relative flex min-h-[610px] items-center py-20">
          <div className="max-w-2xl text-white">
            <span className="section-eyebrow">Испытательная лаборатория · Минск</span>
            <h1 className="mt-2 text-4xl font-black leading-[1.08] sm:text-5xl lg:text-6xl">
              Испытываем. Проверяем. Документируем.
            </h1>
            <p className="mt-6 text-xl font-semibold leading-relaxed text-sky-100">
              Испытания бетона и контроль качества строительных материалов
              по требованиям ГОСТ и СТБ.
            </p>
            <p className="mt-3 max-w-xl leading-relaxed text-slate-200">
              От образца до официального протокола — точные измерения,
              прозрачные расчёты и хранение результатов в личном кабинете.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-7 py-3.5 font-bold text-white shadow-lg transition hover:bg-sky-600"
              >
                Наши услуги <ArrowRight size={18} />
              </Link>
              <Link
                to="/tests"
                className="inline-flex items-center justify-center rounded-md border border-white/50 bg-white/5 px-7 py-3.5 font-bold text-white backdrop-blur transition hover:bg-white/15"
              >
                Перейти к испытаниям
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="site-container grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {[
            ['ГОСТ / СТБ', 'методики испытаний'],
            ['Поверенное', 'оборудование'],
            ['Цифровой', 'учёт протоколов'],
            ['Минск', 'лаборатория'],
          ].map(([title, text]) => (
            <div key={title}>
              <p className="text-lg font-black text-navy">{title}</p>
              <p className="text-sm text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="site-container">
          <div className="max-w-2xl">
            <p className="section-eyebrow">Услуги</p>
            <h2 className="section-title">Испытания бетона и лабораторный контроль</h2>
            <p className="mt-3 text-slate-600">
              Четыре взаимосвязанных направления — от приёмки образца до сохранённого
              протокола с расчётными показателями.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map(({ icon: Icon, title, text }) => (
              <article key={title} className="border border-slate-200 bg-white p-6">
                <Icon className="text-primary" size={28} />
                <h3 className="mt-4 text-lg font-extrabold text-navy">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
                <Link to="/services" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">
                  Подробнее <ArrowRight size={14} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="site-container grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="section-eyebrow">Подход</p>
            <h2 className="section-title">Результаты, на которые можно опереться</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              БетонЛаб объединяет лабораторную практику и цифровой учёт. Пользователь
              видит свои испытания, расчёты и историю изменений.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                ['Работа по стандартам', 'Методики испытаний соответствуют требованиям ГОСТ и СТБ.'],
                ['Поверенное оборудование', 'Измерения выполняются с контролем исходных параметров.'],
                ['Прозрачные расчёты', 'Расчётные показатели формируются автоматически на сервере.'],
                ['Личный кабинет', 'Доступ к собственным протоколам защищён авторизацией.'],
              ].map(([title, text]) => (
                <li key={title} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={20} />
                  <div>
                    <h3 className="font-bold text-navy">{title}</h3>
                    <p className="text-sm text-slate-600">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: ShieldCheck, title: 'Контроль качества' },
              { icon: FlaskConical, title: 'Лабораторные испытания' },
              { icon: ClipboardCheck, title: 'Документирование' },
              { icon: Gauge, title: 'Точные измерения' },
            ].map(({ icon: Icon, title }) => (
              <div key={title} className="border border-slate-200 bg-slate-50 p-6">
                <Icon className="text-primary" size={26} />
                <p className="mt-3 font-extrabold text-navy">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy py-16 text-white">
        <div className="site-container">
          <p className="text-sm font-bold uppercase tracking-widest text-sky-200">Процесс</p>
          <h2 className="mt-2 text-3xl font-black">Четыре шага до результата</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([num, title, text]) => (
              <div key={num} className="border border-white/15 bg-white/5 p-6">
                <p className="text-3xl font-black text-primary">{num}</p>
                <h3 className="mt-3 text-lg font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contacts" className="bg-primary py-16 text-white">
        <div className="site-container grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-sky-100">Свяжитесь с нами</p>
            <h2 className="mt-2 text-3xl font-black">Есть образец или задача по испытанию?</h2>
            <p className="mt-3 text-sky-100">
              Оставьте заявку — обсудим требования и подберём подходящий вид контроля.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="tel:+375447778899"
                className="rounded-md bg-white px-6 py-3 font-bold text-primary transition hover:bg-sky-50"
              >
                +375 44 777 88 99
              </a>
              <a
                href="mailto:betonlab@gmail.com"
                className="rounded-md border border-white/60 px-6 py-3 font-bold text-white transition hover:bg-white/10"
              >
                betonlab@gmail.com
              </a>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-md bg-white p-6 text-slate-800 shadow-lg"
          >
            <h3 className="text-lg font-extrabold text-navy">Заявка на испытание</h3>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="contact-name">
                Имя *
              </label>
              <input
                id="contact-name"
                className="lab-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                placeholder="Как к вам обращаться"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="contact-phone">
                  Телефон
                </label>
                <input
                  id="contact-phone"
                  className="lab-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+375 …"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="contact-email">
                  Email *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className="lab-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="contact-service">
                Вид услуги
              </label>
              <select
                id="contact-service"
                className="lab-input"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
              >
                <option value="">Не выбрано</option>
                {SERVICE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="contact-message">
                Сообщение *
              </label>
              <textarea
                id="contact-message"
                className="lab-input min-h-[110px] resize-y"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                minLength={5}
                placeholder="Кратко опишите задачу или объект"
              />
            </div>
            {formError && <p className="text-sm font-semibold text-accent">{formError}</p>}
            {formSuccess && (
              <p className="text-sm font-semibold text-emerald-700">
                Заявка отправлена. Мы свяжемся с вами.
              </p>
            )}
            <button type="submit" className="lab-button-primary w-full sm:w-auto" disabled={sending}>
              {sending ? 'Отправка…' : 'Отправить заявку'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

export default Home

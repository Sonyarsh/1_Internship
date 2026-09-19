import React from 'react'
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

const Home: React.FC = () => {
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

      <section className="bg-navy text-white">
        <div className="site-container grid grid-cols-2 divide-x divide-white/10 py-7 md:grid-cols-4">
          {[
            ['ГОСТ', 'нормативные методы'],
            ['СТБ', 'контроль соответствия'],
            ['24/7', 'доступ к протоколам'],
            ['100%', 'прослеживаемость данных'],
          ].map(([value, label]) => (
            <div key={value} className="px-4 py-3 text-center">
              <div className="text-2xl font-black tracking-wide">{value}</div>
              <div className="mt-1 text-xs text-sky-200">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="site-container py-20 md:py-28">
        <div className="max-w-3xl">
          <span className="section-eyebrow">Компетенции</span>
          <h2 className="section-title">Испытания бетона и лабораторный контроль</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Четыре взаимосвязанных направления — от приёмки образца до
            сохранённого протокола с расчётными показателями.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {services.map(({ icon: Icon, title, text }, index) => (
            <article
              key={title}
              className="group border-t-4 border-primary bg-white p-8 shadow-[0_12px_35px_rgba(0,52,80,.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,52,80,.14)]"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center bg-primary-light text-primary">
                  <Icon size={25} />
                </span>
                <span className="text-sm font-black text-slate-300">0{index + 1}</span>
              </div>
              <h3 className="mt-6 text-xl font-extrabold text-navy">{title}</h3>
              <p className="mt-3 leading-relaxed text-slate-600">{text}</p>
              <Link
                to={index === 0 || index === 3 ? '/tests' : '/services'}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary"
              >
                Подробнее <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#eaf2f5] py-20 md:py-24">
        <div className="site-container grid items-center gap-12 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <span className="section-eyebrow">Почему мы</span>
            <h2 className="section-title">Результаты, на которые можно опереться</h2>
            <p className="mt-5 leading-relaxed text-slate-600">
              БетонЛаб объединяет лабораторную практику и цифровой учёт.
              Пользователь видит свои испытания, расчёты и историю изменений.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [ShieldCheck, 'Работа по стандартам', 'Методики испытаний соответствуют требованиям ГОСТ и СТБ.'],
              [FlaskConical, 'Поверенное оборудование', 'Измерения выполняются с контролем исходных параметров.'],
              [CheckCircle2, 'Прозрачные расчёты', 'Расчётные показатели формируются автоматически на сервере.'],
              [ClipboardCheck, 'Личный кабинет', 'Доступ к собственным протоколам защищён авторизацией.'],
            ].map(([Icon, title, text]) => {
              const FeatureIcon = Icon as typeof ShieldCheck
              return (
                <div key={String(title)} className="bg-white p-6">
                  <FeatureIcon className="text-primary" size={25} />
                  <h3 className="mt-4 font-extrabold text-navy">{String(title)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{String(text)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="site-container py-20 md:py-28">
        <div className="text-center">
          <span className="section-eyebrow">Порядок работы</span>
          <h2 className="section-title">Четыре шага до результата</h2>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden bg-slate-200 md:grid-cols-4">
          {steps.map(([number, title, text]) => (
            <div key={number} className="bg-white p-7">
              <span className="text-3xl font-black text-primary">{number}</span>
              <h3 className="mt-5 text-lg font-extrabold text-navy">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contacts" className="bg-primary py-16 text-white">
        <div className="site-container flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-sky-100">Свяжитесь с нами</p>
            <h2 className="mt-2 text-3xl font-black">Есть образец или задача по испытанию?</h2>
            <p className="mt-3 text-sky-100">Обсудим требования и подберём подходящий вид контроля.</p>
          </div>
          <div className="flex flex-wrap gap-3">
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
              Написать
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

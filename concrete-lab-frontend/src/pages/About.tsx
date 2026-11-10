import React from 'react'
import {
  Award,
  CheckCircle2,
  Download,
  FileBadge,
  FlaskConical,
  Gauge,
  ShieldCheck,
  Users,
} from 'lucide-react'

/** Положите реальный PDF сюда: concrete-lab-frontend/public/docs/accreditation.pdf */
const ACCREDITATION_PDF = '/docs/accreditation.pdf'

const About: React.FC = () => {
  return (
    <div className="py-8 md:py-14">
      <section className="overflow-hidden bg-navy text-white">
        <div className="grid lg:grid-cols-[1.05fr_.95fr]">
          <div className="p-8 sm:p-12 lg:p-16">
            <span className="section-eyebrow">О лаборатории</span>
            <h1 className="mt-2 text-4xl font-black leading-tight md:text-5xl">
              Точность измерений — основа безопасного строительства
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-sky-100">
              БетонЛаб — испытательная лаборатория, специализирующаяся на
              контроле прочности бетона и документировании результатов.
            </p>
          </div>
          <div className="min-h-[320px] bg-[linear-gradient(rgba(0,61,93,.35),rgba(0,61,93,.35)),url('https://cdn1.tenchat.ru/static/vbc-gostinder/2025-01-28/compressed/5e42afb4-1073-4e43-b5a7-fc9d63562a53.jpeg?width=720&height=720&fmt=webp')] bg-cover bg-center" />
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <span className="section-eyebrow">Наша миссия</span>
            <h2 className="section-title">Давать точные данные для обоснованных решений</h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-slate-600">
            <p>
              Мы помогаем оценить качество бетонных образцов и конструкций,
              фиксируя исходные параметры, ход испытания и расчётные результаты.
            </p>
            <p>
              Цифровой учёт обеспечивает прослеживаемость: каждый пользователь
              работает со своими протоколами и может открыть историю испытаний
              в личном кабинете.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16 md:py-20">
        <div className="mb-10 max-w-2xl">
          <span className="section-eyebrow">Документы</span>
          <h2 className="section-title">Аккредитация лаборатории</h2>
          <p className="mt-3 text-slate-600">
            Лаборатория подтверждает компетентность в области испытаний бетона.
            Ниже — сведения об аттестате и ссылка на электронный документ.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-stretch">
          <article className="relative overflow-hidden border-2 border-navy/15 bg-[#f8fbfd] p-8 sm:p-10">
            <div className="pointer-events-none absolute inset-3 border border-primary/25" />
            <div className="relative space-y-6 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center bg-navy text-white">
                <Award size={28} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Аттестат аккредитации
                </p>
                <h3 className="mt-2 text-2xl font-black text-navy sm:text-3xl">
                  BY/112 02.01.0000
                </h3>
              </div>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-600">
                Испытательная лаборатория «БетонЛаб» аккредитована на проведение
                испытаний бетона: прочность на сжатие, морозостойкость,
                водонепроницаемость, образцы из конструкций.
              </p>
              <dl className="mx-auto grid max-w-lg gap-3 text-left sm:grid-cols-2">
                {[
                  ['Область', 'Испытания бетона и ЖБИ'],
                  ['Статус', 'Действует'],
                  ['Выдан', '01.01.2025'],
                  ['Действует до', '01.01.2030'],
                ].map(([label, value]) => (
                  <div key={label} className="border border-slate-200 bg-white px-4 py-3">
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {label}
                    </dt>
                    <dd className="mt-1 font-semibold text-navy">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-slate-400">
                Учебный макет для проекта. Замените номер и даты на реальные.
              </p>
            </div>
          </article>

          <div className="flex flex-col justify-between gap-6 bg-navy p-8 text-white sm:p-10">
            <div>
              <FileBadge className="text-sky-300" size={32} />
              <h3 className="mt-5 text-xl font-black">Электронный документ</h3>
              <p className="mt-3 text-sm leading-relaxed text-sky-100">
                Электронная копия аттестата доступна для просмотра и скачивания.
                При необходимости замените файл{' '}
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-sky-50">
                  public/docs/accreditation.pdf
                </code>
                .
              </p>
              <ul className="mt-5 space-y-2 text-sm text-sky-100">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-sky-300" size={16} />
                  ГОСТ 10180, 10060, 12730.5, 28570
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-sky-300" size={16} />
                  Протоколы с расчётом в личном кабинете
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-sky-300" size={16} />
                  Прослеживаемость результатов
                </li>
              </ul>
            </div>
            <a
              href={ACCREDITATION_PDF}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white px-6 py-3 font-bold text-navy transition hover:bg-sky-100"
            >
              <Download size={18} />
              Открыть сертификат (PDF)
            </a>
          </div>
        </div>
      </section>

      <section className="bg-[#eaf2f5] px-6 py-14 sm:px-10">
        <h2 className="text-2xl font-black text-navy">Наши принципы работы</h2>
        <div className="mt-9 grid gap-5 sm:grid-cols-2">
          {[
            [Gauge, 'Контроль параметров', 'Проверяем исходные измерения до выполнения расчётов.'],
            [FlaskConical, 'Лабораторная практика', 'Используем понятную последовательность проведения испытания.'],
            [ShieldCheck, 'Защита данных', 'JWT-авторизация ограничивает доступ к пользовательским протоколам.'],
            [Users, 'Ответственность', 'Результаты сохраняются вместе с автором и доступны для повторной проверки.'],
          ].map(([Icon, title, text]) => {
            const CardIcon = Icon as typeof Gauge
            return (
              <article key={String(title)} className="bg-white p-6">
                <CardIcon className="text-primary" size={27} />
                <h3 className="mt-4 text-lg font-extrabold text-navy">{String(title)}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{String(text)}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="py-16">
        <h2 className="section-title">Почему выбирают БетонЛаб</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            'Испытания по требованиям ГОСТ и СТБ',
            'Автоматический расчёт итоговых показателей',
            'Личный кабинет и защищённый доступ',
            'Редактирование и архив собственных протоколов',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 border border-slate-200 bg-white p-5 font-semibold text-navy">
              <CheckCircle2 className="shrink-0 text-primary" size={21} />
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default About

import React from 'react'
import { CheckCircle2, FlaskConical, Gauge, ShieldCheck, Users } from 'lucide-react'

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

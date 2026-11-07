import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Droplets, Gauge, Snowflake, Waves } from 'lucide-react'

const items = [
  {
    title: 'Испытание на сжатие',
    description: 'Прочность бетона по контрольным образцам-кубам. Протокол с расчётом fc.',
    to: '/tests/compression',
    icon: Gauge,
    available: true,
  },
  {
    title: 'Морозостойкость',
    description: 'Марка F1 или F2 по ГОСТ 10060-2012: циклы, прочность серии и потеря массы.',
    to: '/tests/frost',
    icon: Snowflake,
    available: true,
  },
  {
    title: 'Водонепроницаемость',
    description:
      'Метод мокрого пятна по ГОСТ 12730.5-2018 п. 4: ступени давления и марка W.',
    to: '/tests/waterproof',
    icon: Droplets,
    available: true,
  },
  {
    title: 'Неразрушающий контроль',
    description: 'Прочность в конструкциях методами ударного импульса или ультразвука.',
    to: null,
    icon: Waves,
    available: false,
  },
]

const TestsHub: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl py-8 md:py-12">
      <div className="mb-10">
        <span className="section-eyebrow">Рабочий раздел</span>
        <h1 className="section-title">Испытания</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Здесь ведут протоколы. Прайс и описание для заказчиков — в разделе «Услуги».
          Сжатие, морозостойкость и водонепроницаемость доступны сейчас; НК — позже.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon
          const card = (
            <article
              className={`flex h-full flex-col border-t-4 bg-white p-7 shadow-[0_12px_35px_rgba(0,52,80,.08)] ${
                item.available
                  ? 'border-primary transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,52,80,.12)]'
                  : 'border-slate-200 opacity-75'
              }`}
            >
              <span className="grid h-11 w-11 place-items-center bg-primary-light text-primary">
                <Icon size={22} />
              </span>
              <h2 className="mt-5 text-xl font-extrabold text-navy">{item.title}</h2>
              <p className="mt-2 flex-grow text-sm leading-relaxed text-slate-600">
                {item.description}
              </p>
              <div className="mt-6 border-t border-slate-100 pt-4">
                {item.available ? (
                  <span className="inline-flex items-center gap-2 font-bold text-primary">
                    Открыть <ArrowRight size={16} />
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-slate-400">Скоро доступно</span>
                )}
              </div>
            </article>
          )

          return item.to ? (
            <Link key={item.title} to={item.to} className="block">
              {card}
            </Link>
          ) : (
            <div key={item.title}>{card}</div>
          )
        })}
      </div>
    </div>
  )
}

export default TestsHub

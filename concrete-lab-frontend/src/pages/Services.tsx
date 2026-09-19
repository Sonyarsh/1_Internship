import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Droplets, Gauge, Snowflake, Waves } from 'lucide-react'

interface ServicesProps {
  userRole?: string
}

const Services: React.FC<ServicesProps> = ({ userRole }) => {
  const services = [
    {
      id: 1,
      icon: Gauge,
      title: 'Испытание на сжатие',
      description: 'Определение фактического класса прочности бетона по контрольным образцам-кубам.',
      price: 'от 50 BYN',
      to: '/tests',
    },
    {
      id: 2,
      icon: Snowflake,
      title: 'Морозостойкость',
      description: 'Определение способности бетона сохранять свои свойства при многократном замораживании и оттаивании.',
      price: 'от 120 BYN',
    },
    {
      id: 3,
      icon: Droplets,
      title: 'Водонепроницаемость',
      description: 'Определение способности бетона не пропускать воду под давлением.',
      price: 'от 100 BYN',
    },
    {
      id: 4,
      icon: Waves,
      title: 'Неразрушающий контроль',
      description: 'Определение прочности бетона в конструкциях методами ударного импульса или ультразвука.',
      price: 'от 80 BYN',
    },
  ]

  return (
    <div>
      <section className="bg-navy py-20 text-white">
        <div className="site-container">
          <span className="section-eyebrow">Компетенции</span>
          <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-5xl">
            Испытания бетона и строительных материалов
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-sky-100">
            Проводим лабораторные испытания, фиксируем исходные данные
            и выдаём протоколы с расчётными результатами.
          </p>
          {userRole === 'admin' && (
            <button className="mt-6 rounded-md bg-white px-4 py-2 font-bold text-navy">
              Добавить услугу
            </button>
          )}
        </div>
      </section>

      <div className="site-container py-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <article
                key={service.id}
                className="group flex min-h-[300px] flex-col border-t-4 border-primary bg-white p-8 shadow-[0_12px_35px_rgba(0,52,80,.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,52,80,.14)]"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center bg-primary-light text-primary">
                    <Icon size={25} />
                  </span>
                  <span className="font-black text-slate-300">0{index + 1}</span>
                </div>
                <h2 className="mt-6 text-2xl font-extrabold text-navy">{service.title}</h2>
                <p className="mt-3 flex-grow leading-relaxed text-slate-600">{service.description}</p>
                <div className="mt-7 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                  <span className="font-extrabold text-navy">{service.price}</span>
                  {service.to ? (
                    <Link
                      to={service.to}
                      className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-bold text-white transition hover:bg-primary-dark"
                    >
                      Начать <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-slate-400">Скоро доступно</span>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Services

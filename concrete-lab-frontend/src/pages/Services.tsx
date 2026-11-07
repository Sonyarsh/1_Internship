import React from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Droplets, Gauge, Phone, Snowflake, Waves } from 'lucide-react'

interface ServicesProps {
  userRole?: string
}

const services = [
  {
    id: 1,
    icon: Gauge,
    title: 'Испытание на сжатие',
    description:
      'Определение фактического класса прочности бетона по контрольным образцам-кубам.',
    price: 'от 50 BYN',
    norm: 'ГОСТ 10180',
  },
  {
    id: 2,
    icon: Snowflake,
    title: 'Морозостойкость',
    description:
      'Марка F1 или F2: циклы замораживания–оттаивания, прочность серии и потеря массы.',
    price: 'от 120 BYN',
    norm: 'ГОСТ 10060-2012',
  },
  {
    id: 3,
    icon: Droplets,
    title: 'Водонепроницаемость',
    description: 'Определение способности бетона не пропускать воду под давлением.',
    price: 'от 100 BYN',
    norm: 'по запросу',
  },
  {
    id: 4,
    icon: Waves,
    title: 'Неразрушающий контроль',
    description:
      'Прочность бетона в конструкциях методами ударного импульса или ультразвука.',
    price: 'от 80 BYN',
    norm: 'по запросу',
  },
]

const Services: React.FC<ServicesProps> = ({ userRole }) => {
  return (
    <div>
      <section className="bg-navy py-20 text-white">
        <div className="site-container">
          <span className="section-eyebrow text-sky-300">Для заказчиков</span>
          <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-5xl">
            Услуги лаборатории
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-sky-100">
            Прайс и перечень работ. Оформление заявки — через контакты.
            Ведение протоколов сотрудниками — в разделе «Испытания».
          </p>
          {userRole === 'admin' && (
            <button className="mt-6 rounded-md bg-white px-4 py-2 font-bold text-navy">
              Добавить услугу
            </button>
          )}
        </div>
      </section>

      <div className="site-container py-16 md:py-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <article
                key={service.id}
                className="flex min-h-[280px] flex-col border-t-4 border-primary bg-white p-8 shadow-[0_12px_35px_rgba(0,52,80,.08)]"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center bg-primary-light text-primary">
                    <Icon size={25} />
                  </span>
                  <span className="font-black text-slate-300">0{index + 1}</span>
                </div>
                <h2 className="mt-6 text-2xl font-extrabold text-navy">{service.title}</h2>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-primary">
                  {service.norm}
                </p>
                <p className="mt-3 flex-grow leading-relaxed text-slate-600">
                  {service.description}
                </p>
                <div className="mt-7 border-t border-slate-100 pt-5">
                  <span className="text-xl font-extrabold text-navy">{service.price}</span>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-14 grid gap-4 border border-slate-200 bg-[#f3f7f9] p-8 md:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-navy">
              <Phone size={20} className="text-primary" /> Заказать испытание
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Оставьте контакты — лаборатория свяжется и согласует сроки.
            </p>
            <Link
              to="/#contacts"
              className="mt-5 inline-flex rounded-md bg-navy px-5 py-2.5 font-bold text-white transition hover:bg-primary"
            >
              К контактам
            </Link>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-navy">
              <ClipboardList size={20} className="text-primary" /> Работать с протоколами
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Вход в цифровые журналы сжатия и морозостойкости — для авторизованных
              пользователей.
            </p>
            <Link
              to="/tests"
              className="mt-5 inline-flex rounded-md bg-primary px-5 py-2.5 font-bold text-white transition hover:bg-primary-dark"
            >
              Открыть испытания
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Services

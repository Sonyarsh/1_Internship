import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Cylinder, Droplets, Gauge, Phone, Snowflake } from 'lucide-react'
import { User } from '../api/auth'
import { ServiceKey } from '../api/serviceOrders'
import OrderServiceModal, { OrderServiceInfo } from '../components/OrderServiceModal'

interface ServicesProps {
  user: User | null
}

const services: (OrderServiceInfo & { id: number; description: string; icon: typeof Gauge })[] = [
  {
    id: 1,
    key: 'compression',
    icon: Gauge,
    title: 'Испытание на сжатие',
    description:
      'Определение фактического класса прочности бетона по контрольным образцам-кубам.',
    price: 'от 50 BYN',
    norm: 'ГОСТ 10180',
  },
  {
    id: 2,
    key: 'frost',
    icon: Snowflake,
    title: 'Морозостойкость',
    description:
      'Марка F1 или F2: циклы замораживания–оттаивания, прочность серии и потеря массы.',
    price: 'от 120 BYN',
    norm: 'ГОСТ 10060-2012',
  },
  {
    id: 3,
    key: 'waterproof',
    icon: Droplets,
    title: 'Водонепроницаемость',
    description:
      'Метод мокрого пятна (ГОСТ 12730.5-2018 п. 4): марка W по давлению без фильтрации.',
    price: 'от 100 BYN',
    norm: 'ГОСТ 12730.5-2018',
  },
  {
    id: 4,
    key: 'core' as ServiceKey,
    icon: Cylinder,
    title: 'Испытание на сжатие в конструкциях',
    description:
      'Прочность по образцам, отобранным из изделий и конструкций (керны, выпилки).',
    price: 'от 90 BYN',
    norm: 'ГОСТ 28570-2019',
  },
]

const Services: React.FC<ServicesProps> = ({ user }) => {
  const [orderService, setOrderService] = useState<OrderServiceInfo | null>(null)

  return (
    <div>
      <section className="bg-navy py-20 text-white">
        <div className="site-container">
          <span className="section-eyebrow text-sky-300">Для заказчиков</span>
          <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-5xl">
            Услуги лаборатории
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-sky-100">
            Прайс и заказ испытания заявкой. Онлайн-оплаты пока нет — после заявки
            лаборатория свяжется и выставит счёт. Протоколы ведут в разделе «Испытания».
          </p>
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
                <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                  <span className="text-xl font-extrabold text-navy">{service.price}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setOrderService({
                        key: service.key,
                        title: service.title,
                        price: service.price,
                        norm: service.norm,
                      })
                    }
                    className="rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark"
                  >
                    Заказать
                  </button>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-14 grid gap-4 border border-slate-200 bg-[#f3f7f9] p-8 md:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-navy">
              <Phone size={20} className="text-primary" /> Как это работает
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Выбираете услугу → оформляете заявку → лаборатория подтверждает и согласовывает
              оплату вне сайта. Статус заявки — в профиле.
            </p>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-navy">
              <ClipboardList size={20} className="text-primary" /> Работать с протоколами
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Цифровые журналы испытаний — для авторизованных пользователей лаборатории.
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

      {orderService && (
        <OrderServiceModal
          service={orderService}
          user={user}
          onClose={() => setOrderService(null)}
        />
      )}
    </div>
  )
}

export default Services

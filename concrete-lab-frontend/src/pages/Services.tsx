import React from 'react'

interface ServicesProps {
  userRole?: string
}

const Services: React.FC<ServicesProps> = ({ userRole }) => {
  const services = [
    {
      id: 1,
      title: 'Испытание на сжатие',
      description: 'Определение фактического класса прочности бетона по контрольным образцам-кубам.',
      price: 'от 50 BYN'
    },
    {
      id: 2,
      title: 'Морозостойкость',
      description: 'Определение способности бетона сохранять свои свойства при многократном замораживании и оттаивании.',
      price: 'от 120 BYN'
    },
    {
      id: 3,
      title: 'Водонепроницаемость',
      description: 'Определение способности бетона не пропускать воду под давлением.',
      price: 'от 100 BYN'
    },
    {
      id: 4,
      title: 'Неразрушающий контроль',
      description: 'Определение прочности бетона в конструкциях методами ударного импульса или ультразвука.',
      price: 'от 80 BYN'
    }
  ]

  return (
    <div className="py-12">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold">Наши услуги</h1>
        {userRole === 'admin' && (
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Добавить услугу
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <div key={service.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-xl font-bold mb-4">{service.title}</h3>
            <p className="text-gray-600 mb-6 flex-grow">{service.description}</p>
            <div className="flex justify-between items-center mt-auto">
              <span className="text-primary font-bold text-lg">{service.price}</span>
              <button className="bg-primary text-white px-6 py-2 rounded-xl hover:bg-primary-dark transition-colors">
                Заказать
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Services

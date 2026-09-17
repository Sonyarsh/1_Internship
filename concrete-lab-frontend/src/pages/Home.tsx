import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle } from 'lucide-react'

const Home: React.FC = () => {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center text-center overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-blue-900 bg-opacity-60 z-10"></div>
        <img 
          src="https://cdn1.tenchat.ru/static/vbc-gostinder/2025-01-28/compressed/5e42afb4-1073-4e43-b5a7-fc9d63562a53.jpeg?width=720&height=720&fmt=webp" 
          alt="Concrete Testing" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 max-w-3xl px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Испытательная лаборатория бетона
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Гарантируем точность результатов и долговечность ваших конструкций. 
            Соответствие ГОСТ и СТБ.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/services" 
              className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
            >
              Наши услуги <ArrowRight size={20} />
            </Link>
            <Link 
              to="/about" 
              className="bg-white text-primary px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all"
            >
              Подробнее о нас
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'Аккредитация', desc: 'Наша лаборатория полностью аккредитована в соответствии с государственными стандартами.' },
          { title: 'Точность', desc: 'Используем только современное поверенное оборудование высокой точности.' },
          { title: 'Сроки', desc: 'Проводим испытания в кратчайшие сроки с выдачей официальных протоколов.' }
        ].map((feature, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <CheckCircle className="text-primary mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Services Preview */}
      <section className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Направления деятельности</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Мы предлагаем широкий спектр услуг по испытанию бетонных смесей и готовых конструкций.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-blue-50 rounded-2xl">
            <h4 className="text-xl font-bold mb-4 text-blue-900">Испытания</h4>
            <ul className="space-y-2 text-blue-800">
              <li>• Прочность на сжатие</li>
              <li>• Прочность на растяжение при изгибе</li>
              <li>• Морозостойкость</li>
              <li>• Водонепроницаемость</li>
            </ul>
          </div>
          <div className="p-6 bg-green-50 rounded-2xl">
            <h4 className="text-xl font-bold mb-4 text-green-900">Контроль соответствия</h4>
            <ul className="space-y-2 text-green-800">
              <li>• По СТБ 2674-2025</li>
              <li>• По ГОСТ 18105-2018</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

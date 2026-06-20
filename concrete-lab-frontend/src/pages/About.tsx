import React from 'react'

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">О нашей лаборатории</h1>
      
      <div className="prose prose-blue lg:prose-xl">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Наша лаборатория — это современный научно-исследовательский центр, специализирующийся на комплексных испытаниях бетона и железобетонных конструкций. Мы работаем на рынке строительных экспертиз уже более 10 лет, обеспечивая высокое качество и надежность строительных объектов.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-primary">Наша миссия</h2>
        <p className="text-gray-700 mb-8">
          Обеспечение безопасности и долговечности зданий и сооружений путем предоставления точных и независимых данных о качестве строительных материалов.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-3">Современное оборудование</h3>
            <p className="text-gray-600">
              Мы используем автоматизированные прессы и климатические камеры последнего поколения для максимально точных результатов.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-3">Квалифицированный персонал</h3>
            <p className="text-gray-600">
              Все наши сотрудники имеют профильное образование и регулярно проходят курсы повышения квалификации.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-primary">Наши преимущества</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Аккредитация в соответствии с национальными стандартами</li>
          <li>Оперативный выезд на объект заказчика</li>
          <li>Гибкая система ценообразования</li>
          <li>Официальные протоколы испытаний, имеющие юридическую силу</li>
        </ul>
      </div>
    </div>
  )
}

export default About

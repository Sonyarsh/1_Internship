import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">БетонЛаб</h3>
            <p className="text-gray-400">
              Профессиональные испытания бетона и контроль качества строительных материалов.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Навигация</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/about" className="hover:text-white transition-colors">О нас</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">Услуги</a></li>
              <li><a href="/registration" className="hover:text-white transition-colors">Регистрация</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Контакты</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Адрес: г. Минск, ул. Строителей, 10</li>
              <li>Телефон: +375 (29) 112-21-12</li>
              <li>Email: info@concretelab.by</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Испытательная лаборатория бетона. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

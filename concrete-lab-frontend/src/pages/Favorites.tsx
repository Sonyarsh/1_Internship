import React from 'react'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

const Favorites: React.FC = () => {
  return (
    <div className="py-12">
      <h1 className="text-4xl font-bold mb-12">Избранное</h1>
      
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
        <Heart size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-400 mb-2">Список пуст</h2>
        <p className="text-gray-500 mb-8 text-center max-w-sm">
          Добавляйте услуги в избранное, чтобы быстро находить их и заказывать повторно.
        </p>
        <Link 
          to="/services" 
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors"
        >
          Перейти к услугам
        </Link>
      </div>
    </div>
  )
}

export default Favorites

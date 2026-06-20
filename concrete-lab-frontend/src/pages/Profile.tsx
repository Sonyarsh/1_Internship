import React from 'react'
import { User, Settings, LogOut, Package } from 'lucide-react'

interface ProfileProps {
  user: { name: string; role: 'user' | 'admin' } | null
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Пожалуйста, войдите в систему</h2>
        <p className="text-gray-600">Чтобы просмотреть профиль, необходимо авторизоваться.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-xl font-medium">
            <User size={20} /> Личные данные
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">
            <Package size={20} /> Мои заказы
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">
            <Settings size={20} /> Настройки
          </button>
          <div className="pt-4 mt-4 border-t border-gray-100">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors">
              <LogOut size={20} /> Выйти
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold mb-8">Личные данные</h1>
          
          <div className="space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b border-gray-50">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{user.name}</h3>
                <p className="text-gray-500 uppercase text-xs font-bold tracking-wider">{user.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email</label>
                <p className="font-medium">example@mail.com</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Телефон</label>
                <p className="font-medium">+375 (29) 000-00-00</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Компания</label>
                <p className="font-medium">ОАО "Белстрой"</p>
              </div>
            </div>

            <div className="pt-6">
              <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                Редактировать
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

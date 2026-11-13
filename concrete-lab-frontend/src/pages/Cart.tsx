import React from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, ShoppingBag } from 'lucide-react'

/** Корзина как витрина больше не нужна: заказ идёт заявкой с прайса. */
const Cart: React.FC = () => {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <span className="section-eyebrow">Заказ услуг</span>
      <h1 className="mt-2 text-3xl font-black text-navy">Оформление через прайс</h1>
      <p className="mt-4 text-slate-600">
        Отдельная корзина не используется. Выберите услугу в прайсе и нажмите «Заказать» —
        заявка уйдёт в лабораторию. Онлайн-оплаты пока нет.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/services" className="lab-button-primary inline-flex items-center gap-2">
          <ShoppingBag size={18} /> К услугам
        </Link>
        <Link to="/profile" className="lab-button-secondary inline-flex items-center gap-2">
          <ClipboardList size={18} /> Мои заявки / протоколы
        </Link>
      </div>
    </div>
  )
}

export default Cart

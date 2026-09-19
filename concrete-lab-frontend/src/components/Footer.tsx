import React from 'react'
import { Link } from 'react-router-dom'
import { FlaskConical, Mail, MapPin, Phone } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer id="contacts" className="bg-navy text-white">
      <div className="site-container py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_.7fr_1.1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center bg-primary text-white">
                <FlaskConical size={23} />
              </span>
              <span>
                <strong className="block text-xl font-black uppercase">БетонЛаб</strong>
                <span className="text-[9px] uppercase tracking-[.2em] text-sky-200">
                  испытательная лаборатория
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm leading-relaxed text-slate-300">
              Профессиональные испытания бетона и цифровой контроль
              результатов по требованиям ГОСТ и СТБ.
            </p>
          </div>
          <div>
            <h3 className="font-extrabold">Навигация</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              <li><Link to="/services" className="transition hover:text-white">Услуги</Link></li>
              <li><Link to="/tests" className="transition hover:text-white">Испытания</Link></li>
              <li><Link to="/about" className="transition hover:text-white">О лаборатории</Link></li>
              <li><Link to="/profile" className="transition hover:text-white">Личный кабинет</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-extrabold">Контакты</h3>
            <ul className="mt-5 space-y-4 text-sm text-slate-300">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 shrink-0 text-sky-300" size={18} />
                <span>220004, г. Минск,<br />ул. Строителей, 28</span>
              </li>
              <li>
                <a href="tel:+375447778899" className="flex items-center gap-3 transition hover:text-white">
                  <Phone className="text-sky-300" size={18} /> +375 44 777 88 99
                </a>
              </li>
              <li>
                <a href="mailto:betonlab@gmail.com" className="flex items-center gap-3 transition hover:text-white">
                  <Mail className="text-sky-300" size={18} /> betonlab@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-7 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} БетонЛаб. Все права защищены.</p>
          <p>Испытания бетона · Минск</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

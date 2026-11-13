import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type PasswordInputProps = {
  value: string
  onChange: (value: string) => void
  id?: string
  name?: string
  placeholder?: string
  required?: boolean
  minLength?: number
  autoComplete?: string
  disabled?: boolean
  className?: string
  onCopy?: React.ClipboardEventHandler<HTMLInputElement>
  onCut?: React.ClipboardEventHandler<HTMLInputElement>
  onPaste?: React.ClipboardEventHandler<HTMLInputElement>
  onDrop?: React.DragEventHandler<HTMLInputElement>
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  id,
  name,
  placeholder,
  required,
  minLength,
  autoComplete,
  disabled,
  className = 'lab-input',
  onCopy,
  onCut,
  onPaste,
  onDrop,
}) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`${className} pr-12`}
        onCopy={onCopy}
        onCut={onCut}
        onPaste={onPaste}
        onDrop={onDrop}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:text-navy"
        aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
        tabIndex={-1}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

export default PasswordInput

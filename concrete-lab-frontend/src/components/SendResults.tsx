import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Mail, Send, MessageCircle } from 'lucide-react'
import {
  fetchNotifyStatus,
  ProtocolKind,
  sendProtocolResults,
  type NotifyConfig,
} from '../api/notify'

type SendResultsProps = {
  kind: ProtocolKind
  protocolId: number
  defaultEmail?: string
}

const SendResults: React.FC<SendResultsProps> = ({
  kind,
  protocolId,
  defaultEmail = '',
}) => {
  const [emailOn, setEmailOn] = useState(true)
  const [tgOn, setTgOn] = useState(true)
  const [email, setEmail] = useState(defaultEmail)
  const [chatId, setChatId] = useState('')
  const [config, setConfig] = useState<NotifyConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setEmail(defaultEmail)
  }, [defaultEmail])

  useEffect(() => {
    fetchNotifyStatus()
      .then((cfg) => {
        setConfig(cfg)
        if (cfg.default_telegram_chat_id) {
          setChatId(cfg.default_telegram_chat_id)
        }
      })
      .catch(() => undefined)
  }, [])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!emailOn && !tgOn) {
      setError('Включите хотя бы один канал: почту или Telegram')
      return
    }
    setLoading(true)
    try {
      const result = await sendProtocolResults({
        kind,
        protocol_id: protocolId,
        send_email: emailOn,
        send_telegram: tgOn,
        email: emailOn ? email || null : null,
        telegram_chat_id: tgOn ? chatId || null : null,
      })
      const lines = result.channels.map(
        (c) => `${c.ok ? '✓' : '✗'} ${c.channel}: ${c.detail}`
      )
      if (result.any_ok) {
        setSuccess(lines.join('\n'))
      } else {
        setError(lines.join('\n') || 'Не удалось отправить')
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail
        if (typeof detail === 'string') setError(detail)
        else setError('Ошибка отправки')
      } else setError('Ошибка отправки')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSend} className="space-y-4 border-t border-slate-100 pt-6">
      <div>
        <h2 className="text-lg font-black text-navy">Отправить результаты</h2>
        <p className="mt-1 text-sm text-slate-500">
          Краткий протокол на email и/или в Telegram-бот.
          {config?.dry_run
            ? ' Сейчас включён учебный режим: сообщения пишутся в notifications.log на сервере.'
            : null}
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-navy">
          <input
            type="checkbox"
            checked={emailOn}
            onChange={(e) => setEmailOn(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          <Mail size={16} className="text-primary" /> Email
        </label>
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-navy">
          <input
            type="checkbox"
            checked={tgOn}
            onChange={(e) => setTgOn(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          <MessageCircle size={16} className="text-primary" /> Telegram
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {emailOn && (
          <label className="block text-sm">
            <span className="lab-label">Email получателя</span>
            <input
              type="email"
              className="lab-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={emailOn}
              placeholder="name@mail.com"
            />
          </label>
        )}
        {tgOn && (
          <label className="block text-sm">
            <span className="lab-label">Telegram chat id</span>
            <input
              className="lab-input"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="например 123456789"
            />
            <span className="mt-1 block text-xs text-slate-400">
              Напишите боту /start и узнайте свой chat id (можно через @userinfobot).
            </span>
          </label>
        )}
      </div>

      {error && (
        <p className="whitespace-pre-line border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="whitespace-pre-line border-l-4 border-green-600 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </p>
      )}

      <button type="submit" disabled={loading} className="lab-button-primary gap-2">
        <Send size={16} />
        {loading ? 'Отправка...' : 'Отправить результаты'}
      </button>
    </form>
  )
}

export default SendResults

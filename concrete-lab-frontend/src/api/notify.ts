import api, { getToken } from './auth'

export type ProtocolKind = 'compression' | 'frost' | 'waterproof' | 'core'

export type NotifySendPayload = {
  kind: ProtocolKind
  protocol_id: number
  send_email: boolean
  send_telegram: boolean
  email?: string | null
  telegram_chat_id?: string | null
}

export type ChannelStatus = {
  channel: string
  ok: boolean
  detail: string
}

export type NotifySendResult = {
  subject: string
  channels: ChannelStatus[]
  any_ok: boolean
}

export type NotifyConfig = {
  dry_run: boolean
  email_configured: boolean
  telegram_configured: boolean
  default_telegram_chat_id?: string | null
  smtp_host?: string | null
  smtp_from?: string | null
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` }
}

export async function fetchNotifyStatus(): Promise<NotifyConfig> {
  const { data } = await api.get<NotifyConfig>('/notify/status', { headers: authHeaders() })
  return data
}

export async function sendProtocolResults(
  payload: NotifySendPayload
): Promise<NotifySendResult> {
  const { data } = await api.post<NotifySendResult>('/notify/send', payload, {
    headers: authHeaders(),
  })
  return data
}

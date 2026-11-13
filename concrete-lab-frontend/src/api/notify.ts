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

export type ProtocolLinkPayload = {
  kind: ProtocolKind
  protocol_id: number
  service_order_id?: number | null
}

export type ProtocolLinkResult = {
  kind: ProtocolKind
  protocol_id: number
  service_order_id: number | null
  order_status?: string | null
  order_payment_status?: string | null
  order_title?: string | null
  can_send: boolean
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

export async function linkProtocolOrder(
  payload: ProtocolLinkPayload
): Promise<ProtocolLinkResult> {
  const { data } = await api.patch<ProtocolLinkResult>('/notify/link-order', payload, {
    headers: authHeaders(),
  })
  return data
}

export function orderAllowsSend(
  orderStatus?: string | null,
  paymentStatus?: string | null
): boolean {
  return orderStatus === 'completed' && paymentStatus === 'paid'
}

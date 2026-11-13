import api, { getToken } from './auth'

export type ServiceKey = 'compression' | 'frost' | 'waterproof' | 'core'
export type OrderStatus = 'new' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'invoiced' | 'paid'

export type ServiceCatalogItem = {
  key: ServiceKey
  title: string
  price_label: string
  price_from_byn: number
  norm: string
}

export type ServiceOrderCreate = {
  name: string
  phone?: string | null
  email: string
  service_key: ServiceKey
  quantity?: number
  message?: string | null
}

export type ServiceOrder = {
  id: number
  user_id?: number | null
  name: string
  phone?: string | null
  email: string
  service_key: string
  service_title: string
  price_label: string
  price_from_byn: number
  quantity: number
  message?: string | null
  status: OrderStatus
  payment_status: PaymentStatus
  created_at: string
  updated_at: string
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchServiceCatalog(): Promise<ServiceCatalogItem[]> {
  const { data } = await api.get<ServiceCatalogItem[]>('/service_orders/catalog')
  return data
}

export async function createServiceOrder(
  payload: ServiceOrderCreate
): Promise<ServiceOrder> {
  const { data } = await api.post<ServiceOrder>('/service_orders/', payload, {
    headers: authHeaders(),
  })
  return data
}

export async function fetchMyServiceOrders(): Promise<ServiceOrder[]> {
  const { data } = await api.get<ServiceOrder[]>('/service_orders/mine', {
    headers: authHeaders(),
  })
  return data
}

export async function fetchAllServiceOrders(): Promise<ServiceOrder[]> {
  const { data } = await api.get<ServiceOrder[]>('/service_orders/', {
    headers: authHeaders(),
  })
  return data
}

export async function updateServiceOrder(
  id: number,
  patch: { status?: OrderStatus; payment_status?: PaymentStatus }
): Promise<ServiceOrder> {
  const { data } = await api.patch<ServiceOrder>(`/service_orders/${id}`, patch, {
    headers: authHeaders(),
  })
  return data
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'Новая',
  confirmed: 'Подтверждена',
  in_progress: 'В работе',
  completed: 'Выполнена',
  cancelled: 'Отменена',
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: 'Не оплачено',
  invoiced: 'Выставлен счёт',
  paid: 'Оплачено',
}

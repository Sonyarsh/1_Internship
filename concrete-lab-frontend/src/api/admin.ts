import api, { getToken, User } from './auth'

export type AdminSummary = {
  users_total: number
  admins_total: number
  contact_requests: number
  service_orders_total: number
  service_orders_new: number
  service_orders_unpaid: number
  protocols_compression: number
  protocols_frost: number
  protocols_waterproof: number
  protocols_core: number
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` }
}

export async function fetchAdminSummary(): Promise<AdminSummary> {
  const { data } = await api.get<AdminSummary>('/admin/summary', {
    headers: authHeaders(),
  })
  return data
}

export async function fetchAdminUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/admin/users', { headers: authHeaders() })
  return data
}

export async function updateUserRole(
  userId: number,
  role: 'user' | 'admin'
): Promise<User> {
  const { data } = await api.patch<User>(
    `/admin/users/${userId}/role`,
    { role },
    { headers: authHeaders() }
  )
  return data
}

export async function deleteAdminUser(userId: number): Promise<void> {
  await api.delete(`/admin/users/${userId}`, { headers: authHeaders() })
}

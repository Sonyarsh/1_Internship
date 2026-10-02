import axios from 'axios'
import { getToken } from './auth'

const api = axios.create({
  baseURL: '/api',
})

export type ContactRequestCreate = {
  name: string
  phone?: string
  email: string
  service_type?: string
  message: string
}

export type ContactRequest = ContactRequestCreate & {
  id: number
  created_at: string
}

export async function createContactRequest(
  payload: ContactRequestCreate,
): Promise<ContactRequest> {
  const { data } = await api.post<ContactRequest>('/contact_requests/', payload)
  return data
}

export async function fetchContactRequests(): Promise<ContactRequest[]> {
  const token = getToken()
  const { data } = await api.get<ContactRequest[]>('/contact_requests/', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

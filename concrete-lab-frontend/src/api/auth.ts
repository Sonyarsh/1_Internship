import axios from 'axios'

// Через proxy Vite (/api → http://127.0.0.1:8080) — меньше проблем с CORS
const api = axios.create({
  baseURL: '/api',
})

export type User = {
  id: number
  name: string
  email: string
  phone?: string | null
  role: 'user' | 'admin' | string
}

export type TokenResponse = {
  access_token: string
  token_type: string
  user: User
}

const TOKEN_KEY = 'access_token'
const USER_KEY = 'user'

export const AUTH_EXPIRED_EVENT = 'auth:expired'

function requestHadAuth(headers: { get?: (name: string) => unknown; Authorization?: unknown; authorization?: unknown } | undefined) {
  if (!headers) return false
  const fromGetter = typeof headers.get === 'function' ? headers.get('Authorization') : undefined
  const value = fromGetter ?? headers.Authorization ?? headers.authorization
  return typeof value === 'string' && value.toLowerCase().startsWith('bearer ')
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && requestHadAuth(error.config?.headers)) {
      clearSession()
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    }
    return Promise.reject(error)
  },
)

export function saveSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true
  const part = token.split('.')[1]
  if (!part) return true
  try {
    const padded = part.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
    const payload = JSON.parse(json) as { exp?: number }
    if (typeof payload.exp !== 'number') return false
    return payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

export function loadStoredUser(): User | null {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token || isTokenExpired(token)) return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export async function registerUser(data: {
  name: string
  email: string
  phone: string
  password: string
}): Promise<User> {
  const { data: user } = await api.post<User>('/auth/register', data)
  return user
}

export async function loginUser(data: {
  email: string
  password: string
}): Promise<TokenResponse> {
  const { data: result } = await api.post<TokenResponse>('/auth/login', data)
  return result
}

export function saveUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export async function fetchMe(): Promise<User> {
  const token = getToken()
  const { data } = await api.get<User>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

export async function updateProfile(payload: {
  name: string
  phone?: string | null
}): Promise<User> {
  const token = getToken()
  const { data } = await api.patch<User>('/auth/me', payload, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

export async function changePassword(data: {
  current_password: string
  new_password: string
}): Promise<void> {
  const token = getToken()
  await api.post('/auth/change-password', data, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export default api

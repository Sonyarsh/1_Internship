import axios from 'axios'

// Через proxy Vite (/api → http://127.0.0.1:8080) — меньше проблем с CORS
const api = axios.create({
  baseURL: '/api',
})

export type User = {
  id: number
  name: string
  email: string
  role: 'user' | 'admin' | string
}

export type TokenResponse = {
  access_token: string
  token_type: string
  user: User
}

const TOKEN_KEY = 'access_token'
const USER_KEY = 'user'

export function saveSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function loadStoredUser(): User | null {
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

export async function fetchMe(): Promise<User> {
  const token = getToken()
  const { data } = await api.get<User>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

export default api

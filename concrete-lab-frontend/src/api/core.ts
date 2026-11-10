import api, { getToken } from './auth'

export type CoreShape = 'cube' | 'cylinder'

export type CoreSampleInput = {
  shape: CoreShape
  force_kn: number
  edge_mm?: number | null
  diameter_mm?: number | null
  height_mm?: number | null
  label?: string | null
}

export type CoreSampleResult = {
  area_mm2: number
  alpha: number
  eta1: number
  hd_ratio?: number | null
  r_obr_mpa: number
  r_mpa: number
  edge_mm?: number | null
  diameter_mm?: number | null
  height_mm?: number | null
}

export type CoreInput = {
  applicant_info: string
  manufacturer_info: string
  product_id: string
  structure_name: string
  tnpa: string
  concrete_class: string
  sampling_note?: string | null
  samples: CoreSampleInput[]
}

export type CoreRecord = CoreInput & {
  id: number
  user_id?: number | null
  sample_results?: CoreSampleResult[] | null
  series_strength_mpa?: number | null
  samples_count?: number | null
  conclusion?: string | null
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` }
}

export async function createCoreTest(payload: CoreInput): Promise<CoreRecord> {
  const { data } = await api.post<CoreRecord>('/core_strength/', payload, {
    headers: authHeaders(),
  })
  return data
}

export async function fetchCoreTests(): Promise<CoreRecord[]> {
  const { data } = await api.get<CoreRecord[]>('/core_strength/', {
    headers: authHeaders(),
  })
  return data
}

export async function fetchCoreTest(id: number): Promise<CoreRecord> {
  const { data } = await api.get<CoreRecord>(`/core_strength/${id}`, {
    headers: authHeaders(),
  })
  return data
}

export async function deleteCoreTest(id: number): Promise<void> {
  await api.delete(`/core_strength/${id}`, { headers: authHeaders() })
}

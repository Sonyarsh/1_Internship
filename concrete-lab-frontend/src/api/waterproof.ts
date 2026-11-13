import api, { getToken } from './auth'

export type WaterproofMode = 'determine_mark' | 'check_project'
export type SampleHeight = 150 | 100 | 50 | 30

export type WaterproofCatalog = {
  method: string
  title: string
  tnpa: string
  general: string
  note: string
  hold_hours: Record<string, number>
  pressure_steps_mpa: number[]
  marks: { pressure_mpa: number; mark: string }[]
  modes: { id: WaterproofMode; title: string; description: string }[]
}

export type WaterproofInput = {
  applicant_info: string
  manufacturer_info: string
  product_id: string
  tnpa: string
  general_tnpa: string
  concrete_class: string
  mode: WaterproofMode
  sample_height_mm: SampleHeight
  project_mark: string | null
  sample_diameters_mm: number[]
  sample_dry_pressures_mpa: number[]
}

export type WaterproofRecord = WaterproofInput & {
  id: number
  user_id?: number | null
  hold_hours?: number | null
  series_pressure_mpa?: number | null
  achieved_mark?: string | null
  project_mark_met?: boolean | null
  samples_ok_at_series?: number | null
  conclusion?: string | null
  work_status?: string | null
  payment_status?: string | null
  service_order_id?: number | null
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` }
}

export async function fetchWaterproofCatalog(): Promise<WaterproofCatalog> {
  const { data } = await api.get<WaterproofCatalog>('/waterproof/catalog', {
    headers: authHeaders(),
  })
  return data
}

export async function fetchWaterproofTests(): Promise<WaterproofRecord[]> {
  const { data } = await api.get<WaterproofRecord[]>('/waterproof/', {
    headers: authHeaders(),
  })
  return data
}

export async function fetchWaterproofTest(id: number): Promise<WaterproofRecord> {
  const { data } = await api.get<WaterproofRecord>(`/waterproof/${id}`, {
    headers: authHeaders(),
  })
  return data
}

export async function createWaterproofTest(
  payload: WaterproofInput
): Promise<WaterproofRecord> {
  const { data } = await api.post<WaterproofRecord>('/waterproof/', payload, {
    headers: authHeaders(),
  })
  return data
}

export async function deleteWaterproofTest(id: number): Promise<void> {
  await api.delete(`/waterproof/${id}`, { headers: authHeaders() })
}

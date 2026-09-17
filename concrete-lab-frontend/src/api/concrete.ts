import api from './auth'
import { getToken } from './auth'

export type ConcreteStrengthCreate = {
  applicant_info: string
  manufacturer_info: string
  product_id: string
  tnpa: string
  concrete_class: string
  fck_cyl: number
  fck_cube: number
  batch_N: number
  sample_N: number
  series_N: number
  visual_inspection_defects?: string | null
  a1_geometry: number
  a2_geometry: number
  a3_geometry: number
  a4_geometry: number
  b1_geometry: number
  b2_geometry: number
  b3_geometry: number
  b4_geometry: number
  h1_geometry: number
  h2_geometry: number
  h3_geometry: number
  h4_geometry: number
  mass_m: number
  o1: number
  base_b1: number
  o2: number
  o3: number
  base_b2: number
  loading_speed: number
  loading_time: number
  max_force_f: number
  scale_factor_alpha: number
  visual_inspection_broken?: string | null
  destruction_scheme?: string | null
}

export type ConcreteStrengthRecord = ConcreteStrengthCreate & {
  id: number
  a_avg?: number | null
  b_avg?: number | null
  h_avg?: number | null
  volume_v?: number | null
  density_avg?: number | null
  working_area_a?: number | null
  fc_cube_batch_i_sample_j_series_k?: number | null
}

function authHeaders() {
  const token = getToken()
  return { Authorization: `Bearer ${token}` }
}

export async function fetchRecords(): Promise<ConcreteStrengthRecord[]> {
  const { data } = await api.get<ConcreteStrengthRecord[]>('/concrete_strength/', {
    headers: authHeaders(),
  })
  return data
}

export async function createRecord(
  payload: ConcreteStrengthCreate
): Promise<ConcreteStrengthRecord> {
  const { data } = await api.post<ConcreteStrengthRecord>('/concrete_strength/', payload, {
    headers: authHeaders(),
  })
  return data
}

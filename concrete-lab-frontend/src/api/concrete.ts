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
  user_id?: number | null
  a_avg?: number | null
  b_avg?: number | null
  h_avg?: number | null
  volume_v?: number | null
  density_avg?: number | null
  working_area_a?: number | null
  constant_c1?: number | null
  flatness_deviation?: number | null
  concavity_convexity?: number | null
  constant_c2?: number | null
  perpendicularity_deviation?: number | null
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

export async function fetchRecord(id: number): Promise<ConcreteStrengthRecord> {
  const { data } = await api.get<ConcreteStrengthRecord>(`/concrete_strength/${id}`, {
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

export async function updateRecord(
  id: number,
  payload: ConcreteStrengthCreate
): Promise<ConcreteStrengthRecord> {
  const { data } = await api.patch<ConcreteStrengthRecord>(
    `/concrete_strength/${id}`,
    payload,
    { headers: authHeaders() }
  )
  return data
}

export async function deleteRecord(id: number): Promise<void> {
  await api.delete(`/concrete_strength/${id}`, {
    headers: authHeaders(),
  })
}

export function recordToForm(r: ConcreteStrengthRecord): ConcreteStrengthCreate {
  return {
    applicant_info: r.applicant_info,
    manufacturer_info: r.manufacturer_info,
    product_id: r.product_id,
    tnpa: r.tnpa,
    concrete_class: r.concrete_class,
    fck_cyl: r.fck_cyl,
    fck_cube: r.fck_cube,
    batch_N: r.batch_N,
    sample_N: r.sample_N,
    series_N: r.series_N,
    visual_inspection_defects: r.visual_inspection_defects ?? '',
    a1_geometry: r.a1_geometry,
    a2_geometry: r.a2_geometry,
    a3_geometry: r.a3_geometry,
    a4_geometry: r.a4_geometry,
    b1_geometry: r.b1_geometry,
    b2_geometry: r.b2_geometry,
    b3_geometry: r.b3_geometry,
    b4_geometry: r.b4_geometry,
    h1_geometry: r.h1_geometry,
    h2_geometry: r.h2_geometry,
    h3_geometry: r.h3_geometry,
    h4_geometry: r.h4_geometry,
    mass_m: r.mass_m,
    o1: r.o1,
    base_b1: r.base_b1,
    o2: r.o2,
    o3: r.o3,
    base_b2: r.base_b2,
    loading_speed: r.loading_speed,
    loading_time: r.loading_time,
    max_force_f: r.max_force_f,
    scale_factor_alpha: Math.round(Number(r.scale_factor_alpha) * 100) / 100,
    visual_inspection_broken: r.visual_inspection_broken ?? '',
    destruction_scheme: r.destruction_scheme ?? '',
  }
}

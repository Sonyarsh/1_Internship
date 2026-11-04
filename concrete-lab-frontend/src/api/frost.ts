import api, { getToken } from './auth'

export type FrostMethod = 'basic1' | 'basic2' | 'accel2' | 'accel3'
export type FrostExposure = 'water' | 'mineralized'

export type FrostMark = {
  mark: number
  intermediate: number | null
  final: number
  label: string
}

export type FrostMethodInfo = {
  id: FrostMethod
  title: string
  group: string | null
  note: string
  medium: string
  exposures: Record<string, FrostMark[]>
}

export type FrostCatalog = {
  methods: FrostMethodInfo[]
}

export type FrostInput = {
  applicant_info: string
  manufacturer_info: string
  product_id: string
  tnpa: string
  concrete_class: string
  method: FrostMethod
  exposure: FrostExposure
  lightweight: boolean
  sample_size_mm: 100 | 150
  project_mark: number
  cycles_done: number
  freeze_temp_c: number
  freeze_hours: number
  thaw_temp_c: number
  thaw_hours: number
  control_strengths: number[]
  main_strengths: number[]
  mass_before_g: number[]
  mass_after_g: number[]
  cracks: boolean
  chips: boolean
  edge_scaling: boolean
  surface_scaling: boolean
  decorative_surface: boolean
  density_spread_kg_m3: number | null
}

export type FrostRecord = FrostInput & {
  id: number
  user_id?: number | null
  mark_group?: string | null
  x_cp_control?: number | null
  x_cp_main?: number | null
  sigma_control?: number | null
  sigma_main?: number | null
  v_control_pct?: number | null
  v_main_pct?: number | null
  x_min_control?: number | null
  x_min_main?: number | null
  limit_09?: number | null
  strength_drop_pct?: number | null
  mass_loss_pct?: number | null
  series_valid?: boolean | null
  strength_ok?: boolean | null
  mass_ok?: boolean | null
  defects_ok?: boolean | null
  regime_ok?: boolean | null
  achieved_mark?: string | null
  project_mark_met?: boolean | null
  conclusion?: string | null
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` }
}

export async function fetchFrostCatalog(): Promise<FrostCatalog> {
  const { data } = await api.get<FrostCatalog>('/frost_resistance/catalog', { headers: authHeaders() })
  return data
}

export async function fetchFrostTests(): Promise<FrostRecord[]> {
  const { data } = await api.get<FrostRecord[]>('/frost_resistance/', { headers: authHeaders() })
  return data
}

export async function fetchFrostTest(id: number): Promise<FrostRecord> {
  const { data } = await api.get<FrostRecord>(`/frost_resistance/${id}`, { headers: authHeaders() })
  return data
}

export async function createFrostTest(payload: FrostInput): Promise<FrostRecord> {
  const { data } = await api.post<FrostRecord>('/frost_resistance/', payload, { headers: authHeaders() })
  return data
}

export async function deleteFrostTest(id: number): Promise<void> {
  await api.delete(`/frost_resistance/${id}`, { headers: authHeaders() })
}

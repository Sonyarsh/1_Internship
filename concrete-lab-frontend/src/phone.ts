/** Код страны и ожидаемая длина национального номера. */
export const COUNTRY_CODES = [
  { code: '+375', label: 'BY +375', digits: 9, placeholder: '29 123-45-67' },
  { code: '+7', label: 'RU +7', digits: 10, placeholder: '900 123-45-67' },
  { code: '+380', label: 'UA +380', digits: 9, placeholder: '50 123-45-67' },
  { code: '+370', label: 'LT +370', digits: 8, placeholder: '612 34567' },
  { code: '+371', label: 'LV +371', digits: 8, placeholder: '2123 4567' },
  { code: '+48', label: 'PL +48', digits: 9, placeholder: '500 123 456' },
] as const

export function findCountry(code: string) {
  return COUNTRY_CODES.find((c) => c.code === code) ?? COUNTRY_CODES[0]
}

/** Разбирает сохранённый номер вида +375291234567 на код страны и цифры. */
export function splitPhone(phone: string | null | undefined): { code: string; local: string } {
  const raw = (phone || '').replace(/[\s\-()]/g, '')
  const byLength = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length)
  for (const country of byLength) {
    if (raw.startsWith(country.code)) {
      return {
        code: country.code,
        local: raw.slice(country.code.length).replace(/\D/g, ''),
      }
    }
  }
  return { code: COUNTRY_CODES[0].code, local: raw.replace(/\D/g, '') }
}

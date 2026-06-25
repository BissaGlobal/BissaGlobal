export const DRC_PROVINCES = [
  'Kinshasa', 'Kongo Central', 'Kwango', 'Kwilu', 'Mai-Ndombe', 'Kasaï', 'Kasaï Central', 'Kasaï Oriental',
  'Lomami', 'Sankuru', 'Maniema', 'Nord-Kivu', 'Sud-Kivu', 'Ituri', 'Haut-Uélé', 'Bas-Uélé', 'Tshopo',
  'Mongala', 'Nord-Ubangi', 'Sud-Ubangi', 'Équateur', 'Tshuapa', 'Tanganyika', 'Haut-Lomami', 'Lualaba', 'Haut-Katanga',
]

export function slugify(s) {
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function provinceFromSlug(slug) {
  return DRC_PROVINCES.find((p) => slugify(p) === slug) || null
}

export async function fetchHotelsByProvince(province) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || ''
  try {
    const res = await fetch(base + '/api/hotels?province=' + encodeURIComponent(province), { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (e) { return [] }
}

export const CITIES = [
  { city: 'Kinshasa', country: 'RD Congo' },
  { city: 'Goma', country: 'RD Congo' },
  { city: 'Lubumbashi', country: 'RD Congo' },
  { city: 'Bukavu', country: 'RD Congo' },
  { city: 'Kisangani', country: 'RD Congo' },
  { city: 'Matadi', country: 'RD Congo' },
  { city: 'Brazzaville', country: 'Congo' },
  { city: 'Dakar', country: 'Sénégal' },
  { city: 'Abidjan', country: "Côte d'Ivoire" },
  { city: 'Nairobi', country: 'Kenya' },
  { city: 'Kigali', country: 'Rwanda' },
]

export function slugify(s) {
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
export function cityFromSlug(slug) {
  const found = CITIES.find((c) => slugify(c.city) === slug)
  return found || null
}
export async function fetchHotelsByCity(city) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || ''
  try {
    const res = await fetch(base + '/api/hotels?city=' + encodeURIComponent(city), { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (e) { return [] }
}

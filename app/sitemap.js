import { DRC_PROVINCES, slugify as pslug } from './rdc/provinces'
import { CITIES, slugify as cslug } from './ville/cities'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://yabisohotels.com'

export default function sitemap() {
  const now = new Date()
  const home = [{ url: SITE + '/', lastModified: now, changeFrequency: 'daily', priority: 1 }]
  const provinces = DRC_PROVINCES.map((p) => ({ url: SITE + '/rdc/' + pslug(p), lastModified: now, changeFrequency: 'weekly', priority: 0.8 }))
  const cities = CITIES.map((c) => ({ url: SITE + '/ville/' + cslug(c.city), lastModified: now, changeFrequency: 'weekly', priority: 0.8 }))
  return [...home, ...provinces, ...cities]
}

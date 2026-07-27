import Link from 'next/link'

const BASE = process.env.NEXT_PUBLIC_BASE_URL || ''

async function fetchTenant(slug) {
  try {
    const res = await fetch(`${BASE}/api/tenant/${encodeURIComponent(slug)}`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch (e) { return null }
}

const AMENITY_LABELS = {
  wifi: 'WiFi gratuit', pool: 'Piscine', restaurant: 'Restaurant', parking: 'Parking',
  ac: 'Climatisation', spa: 'Spa', gym: 'Salle de sport', bar: 'Bar', shuttle: 'Navette', breakfast: 'Petit-déjeuner',
}

const fmtCDF = (n) => (n || 0).toLocaleString('fr-FR') + ' FC'
function usd(cdf, rates, fee) {
  const r = (rates && rates.USD) || 2850
  return '$' + Math.round((cdf / r) * (1 + (fee || 0))).toLocaleString('fr-FR')
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const data = await fetchTenant(slug)
  if (!data || !data.hotel) return { title: 'Hôtel introuvable' }
  const h = data.hotel
  const b = h.branding || {}
  return {
    title: `${h.name} — Réservation en ligne`,
    description: b.tagline || h.description || `Réservez votre séjour à ${h.name}, ${h.city}.`,
    openGraph: { title: h.name, description: b.tagline || h.description || '', images: h.images || [] },
  }
}

export default async function TenantSite({ params }) {
  const { slug } = await params
  const data = await fetchTenant(slug)

  if (!data || !data.hotel) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-700 p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Site introuvable</h1>
        <p className="text-slate-500 mb-6">Ce site d'hôtel n'existe pas ou n'est plus disponible.</p>
        <Link href="/" className="underline text-blue-700">Retour à YABISO HOTELS</Link>
      </main>
    )
  }

  const h = data.hotel
  const b = h.branding || {}
  const rates = data.rates || {}
  const fee = data.fee || 0
  const primary = b.primaryColor || '#0A1F5C'
  const secondary = b.secondaryColor || '#F5A623'
  const hero = b.heroImage || (h.images && h.images[0]) || ''
  const rooms = Array.isArray(h.rooms) ? h.rooms : []
  const minPrice = rooms.length ? Math.min(...rooms.map((r) => r.priceCDF || 0)) : h.priceCDF || 0
  const bookUrl = `${BASE}/?hotel=${h.id}`
  const reviews = data.reviews || []

  return (
    <div className="min-h-screen bg-white text-slate-800" style={{ fontFamily: b.font ? `${b.font}, sans-serif` : 'Inter, sans-serif' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b" style={{ background: '#ffffff' }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {b.logo ? (
              <img src={b.logo} alt={h.name} className="h-9 w-auto object-contain" />
            ) : (
              <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: primary }}>
                {(h.name || 'H').charAt(0)}
              </div>
            )}
            <span className="font-bold text-lg" style={{ color: primary }}>{h.name}</span>
          </div>
          <a href={bookUrl} className="rounded-md px-5 h-10 inline-flex items-center font-semibold text-white text-sm" style={{ background: secondary }}>
            Réserver
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative" style={{ background: `linear-gradient(135deg, ${primary} 0%, ${primary}dd 100%)` }}>
        {hero && <div className="absolute inset-0 opacity-30"><img src={hero} alt="" className="w-full h-full object-cover" /></div>}
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 text-white">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold mb-4" style={{ background: secondary, color: '#1a1a1a' }}>
            {h.city}{h.country ? `, ${h.country}` : ''}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold max-w-3xl leading-tight">{b.tagline || h.name}</h1>
          <p className="mt-4 text-white/85 max-w-2xl">{h.description}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href={bookUrl} className="rounded-md px-8 h-12 inline-flex items-center font-bold text-white" style={{ background: secondary, color: '#1a1a1a' }}>
              Réserver maintenant
            </a>
            <div className="text-white/90">
              <span className="text-sm">À partir de</span>{' '}
              <span className="text-2xl font-bold">{usd(minPrice, rates, fee)}</span>
              <span className="text-sm text-white/70"> / nuit</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {Array.isArray(h.images) && h.images.length > 1 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {h.images.slice(0, 8).map((img, i) => (
              <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                <img src={img} alt={`${h.name} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Amenities */}
      {Array.isArray(h.amenities) && h.amenities.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: primary }}>Équipements &amp; services</h2>
          <div className="flex flex-wrap gap-3">
            {h.amenities.map((a) => (
              <span key={a} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm" style={{ borderColor: `${primary}30` }}>
                <span className="w-2 h-2 rounded-full" style={{ background: secondary }} />
                {AMENITY_LABELS[a] || a}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Rooms */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6" style={{ color: primary }}>Nos chambres</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {rooms.map((r) => (
            <div key={r.id || r.name} className="rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] bg-slate-100">
                <img src={(h.images && h.images[0]) || hero} alt={r.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg" style={{ color: primary }}>{r.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{r.beds} · {r.capacity} personne(s)</p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-xl font-bold" style={{ color: primary }}>{usd(r.priceCDF, rates, fee)}</div>
                    <div className="text-xs text-slate-400">{fmtCDF(r.priceCDF)} / nuit</div>
                  </div>
                  <a href={bookUrl} className="rounded-md px-4 h-10 inline-flex items-center font-semibold text-white text-sm" style={{ background: secondary, color: '#1a1a1a' }}>
                    Réserver
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="bg-slate-50 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6" style={{ color: primary }}>Avis clients</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {reviews.slice(0, 6).map((rv) => (
                <div key={rv.id} className="rounded-xl bg-white border p-5">
                  <div className="flex items-center gap-1 mb-2" style={{ color: secondary }}>
                    {'★'.repeat(Math.round(rv.rating || 0))}
                  </div>
                  <p className="text-sm text-slate-600">{rv.comment}</p>
                  <p className="text-xs text-slate-400 mt-3 font-medium">— {rv.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact & policies */}
      <section className="max-w-6xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: primary }}>Contact</h2>
          <ul className="space-y-2 text-slate-600">
            {b.contactAddress && <li><strong>Adresse :</strong> {b.contactAddress}</li>}
            {b.contactPhone && <li><strong>Téléphone :</strong> {b.contactPhone}</li>}
            {b.contactEmail && <li><strong>Email :</strong> {b.contactEmail}</li>}
            {!b.contactAddress && !b.contactPhone && !b.contactEmail && <li>{h.city}, {h.country}</li>}
          </ul>
        </div>
        {b.policies && (
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: primary }}>Politiques</h2>
            <p className="text-slate-600 whitespace-pre-line">{b.policies}</p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="py-12" style={{ background: primary }}>
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Prêt à réserver votre séjour ?</h2>
          <p className="text-white/80 mb-6">Réservation simple, rapide et sécurisée.</p>
          <a href={bookUrl} className="rounded-md px-8 h-12 inline-flex items-center font-bold" style={{ background: secondary, color: '#1a1a1a' }}>
            Réserver maintenant
          </a>
        </div>
      </section>

      {/* Footer / powered by */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <span>© {new Date().getFullYear()} {h.name}. Tous droits réservés.</span>
          {b.poweredBy !== false && (
            <Link href="/" className="inline-flex items-center gap-1.5 hover:text-slate-700">
              Propulsé par <span className="font-bold" style={{ color: '#0A1F5C' }}>YABISO <span style={{ color: '#F5A623' }}>HOTELS</span></span>
            </Link>
          )}
        </div>
      </footer>
    </div>
  )
}

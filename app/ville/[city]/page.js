import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CITIES, slugify, cityFromSlug, fetchHotelsByCity } from '../cities'

export async function generateMetadata({ params }) {
  const { city: slug } = await params
  const c = cityFromSlug(slug)
  if (!c) return { title: 'Ville introuvable | YABISO HOTELS' }
  return {
    title: 'Hôtels à ' + c.city + ' (' + c.country + ') | YABISO HOTELS',
    description: 'Réservez les meilleurs hôtels et hébergements vérifiés à ' + c.city + ', ' + c.country + '. Photos réelles, avis, paiement sécurisé (Mobile Money, Visa, PayPal) avec YABISO HOTELS.',
    alternates: { canonical: '/ville/' + slug },
  }
}

export default async function CityPage({ params }) {
  const { city: slug } = await params
  const c = cityFromSlug(slug)
  if (!c) notFound()
  const hotels = await fetchHotelsByCity(c.city)
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <nav style={{ marginBottom: 20, fontSize: 14 }}>
        <Link href="/" style={{ color: '#0057B8', textDecoration: 'none', fontWeight: 600 }}>YABISO HOTELS</Link>
        <span style={{ color: '#999' }}> / </span>
        <Link href="/ville" style={{ color: '#0057B8', textDecoration: 'none' }}>Villes</Link>
        <span style={{ color: '#999' }}> / {c.city}</span>
      </nav>
      <h1 style={{ fontSize: 34, fontWeight: 800, margin: '0 0 8px' }}>Hôtels à {c.city}</h1>
      <p style={{ color: '#555', fontSize: 17, marginBottom: 28 }}>{hotels.length} hébergement(s) vérifié(s) à {c.city}, {c.country}. Réservez avec paiement sécurisé multi-devises.</p>
      {hotels.length === 0 ? (
        <p style={{ color: '#777' }}>Aucun hébergement listé pour le moment. <Link href="/" style={{ color: '#0057B8' }}>Rechercher →</Link></p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
          {hotels.map((h) => (
            <article key={h.id} style={{ border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
              <img src={h.images && h.images[0]} alt={'Hôtel ' + h.name + ' à ' + c.city} style={{ width: '100%', height: 160, objectFit: 'cover', background: '#f1f5f9' }} />
              <div style={{ padding: 14 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px' }}>{h.name}</h2>
                <div style={{ color: '#555', fontSize: 13 }}>{h.city}, {h.country}</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>⭐ {h.rating || '—'} · {h.reviewCount || 0} avis</div>
                <div style={{ color: '#0057B8', fontWeight: 800, marginTop: 8 }}>{(h.priceCDF || 0).toLocaleString('fr-FR')} FC <span style={{ color: '#777', fontWeight: 400, fontSize: 12 }}>/ nuit</span></div>
                <Link href="/" style={{ display: 'inline-block', marginTop: 10, padding: '8px 14px', background: '#0057B8', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Réserver →</Link>
              </div>
            </article>
          ))}
        </div>
      )}
      <section style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>Autres villes</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {CITIES.filter((x) => x.city !== c.city).map((x) => (
            <Link key={x.city} href={'/ville/' + slugify(x.city)} style={{ fontSize: 13, color: '#0057B8', textDecoration: 'none', border: '1px solid #e5e7eb', borderRadius: 999, padding: '4px 12px' }}>{x.city}</Link>
          ))}
        </div>
      </section>
      <p style={{ marginTop: 40, color: '#777' }}>YABISO HOTELS — AFRICA BOOKS WITH CONFIDENCE.</p>
    </main>
  )
}

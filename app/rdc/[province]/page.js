import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DRC_PROVINCES, slugify, provinceFromSlug, fetchHotelsByProvince } from '../provinces'

export async function generateMetadata({ params }) {
  const { province: slug } = await params
  const province = provinceFromSlug(slug)
  if (!province) return { title: 'Province introuvable | YABISO HOTELS' }
  return {
    title: 'Hôtels à ' + province + ' (RDC) | YABISO HOTELS',
    description: 'Réservez des hôtels et hébergements vérifiés dans la province de ' + province + ', République démocratique du Congo. Photos, avis, paiement sécurisé multi-devises avec YABISO HOTELS.',
    alternates: { canonical: '/rdc/' + slug },
  }
}

export default async function ProvincePage({ params }) {
  const { province: slug } = await params
  const province = provinceFromSlug(slug)
  if (!province) notFound()
  const hotels = await fetchHotelsByProvince(province)

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <nav style={{ marginBottom: 20, fontSize: 14 }}>
        <Link href="/" style={{ color: '#0A1F5C', textDecoration: 'none', fontWeight: 600 }}>YABISO HOTELS</Link>
        <span style={{ color: '#999' }}> / </span>
        <Link href="/rdc" style={{ color: '#0A1F5C', textDecoration: 'none' }}>RDC</Link>
        <span style={{ color: '#999' }}> / {province}</span>
      </nav>
      <h1 style={{ fontSize: 34, fontWeight: 800, margin: '0 0 8px' }}>Hôtels à {province}</h1>
      <p style={{ color: '#555', fontSize: 17, marginBottom: 28 }}>{hotels.length} hébergement(s) vérifié(s) et disponibles dans la province de {province} (RDC).</p>

      {hotels.length === 0 ? (
        <p style={{ color: '#777' }}>Aucun hébergement listé pour le moment. <Link href="/" style={{ color: '#0A1F5C' }}>Rechercher d’autres destinations →</Link></p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
          {hotels.map((h) => (
            <article key={h.id} style={{ border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
              <img src={h.images && h.images[0]} alt={h.name} style={{ width: '100%', height: 160, objectFit: 'cover', background: '#f1f5f9' }} />
              <div style={{ padding: 14 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px' }}>{h.name}</h2>
                <div style={{ color: '#555', fontSize: 13 }}>{h.city}, {h.country}</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>⭐ {h.rating || '—'} · {h.reviewCount || 0} avis</div>
                <div style={{ color: '#0A1F5C', fontWeight: 800, marginTop: 8 }}>{(h.priceCDF || 0).toLocaleString('fr-FR')} FC <span style={{ color: '#777', fontWeight: 400, fontSize: 12 }}>/ nuit</span></div>
                <Link href="/" style={{ display: 'inline-block', marginTop: 10, padding: '8px 14px', background: '#0A1F5C', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Réserver →</Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <section style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>Autres provinces de la RDC</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {DRC_PROVINCES.filter((p) => p !== province).map((p) => (
            <Link key={p} href={'/rdc/' + slugify(p)} style={{ fontSize: 13, color: '#0A1F5C', textDecoration: 'none', border: '1px solid #e5e7eb', borderRadius: 999, padding: '4px 12px' }}>{p}</Link>
          ))}
        </div>
      </section>
      <p style={{ marginTop: 40, color: '#777' }}>YABISO HOTELS — Powered by BissaGlobal Services.</p>
    </main>
  )
}

import Link from 'next/link'
import { CITIES, slugify } from './cities'

export const metadata = {
  title: 'Hôtels par ville en Afrique | YABISO HOTELS',
  description: 'Réservez des hôtels vérifiés par ville : Kinshasa, Goma, Lubumbashi, Dakar, Abidjan, Brazzaville, Nairobi, Kigali. Paiement sécurisé multi-devises avec YABISO HOTELS.',
  alternates: { canonical: '/ville' },
}

export default function CitiesIndex() {
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <nav style={{ marginBottom: 24 }}><Link href="/" style={{ color: '#0A1F5C', textDecoration: 'none', fontWeight: 600 }}>← YABISO HOTELS</Link></nav>
      <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 8px' }}>Hôtels par ville</h1>
      <p style={{ color: '#555', fontSize: 18, marginBottom: 28 }}>Trouvez votre hébergement dans les grandes villes d’Afrique subsaharienne.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
        {CITIES.map((c) => (
          <Link key={c.city} href={'/ville/' + slugify(c.city)} style={{ display: 'block', padding: '16px 18px', border: '1px solid #e5e7eb', borderRadius: 12, textDecoration: 'none', color: '#0f172a', background: '#fff', fontWeight: 600 }}>
            {c.city}<div style={{ color: '#0A1F5C', fontSize: 13, fontWeight: 500, marginTop: 4 }}>{c.country} →</div>
          </Link>
        ))}
      </div>
      <p style={{ marginTop: 40, color: '#777' }}>YABISO HOTELS — Powered by BissaGlobal Services.</p>
    </main>
  )
}

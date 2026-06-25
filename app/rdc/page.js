import Link from 'next/link'
import { DRC_PROVINCES, slugify } from './provinces'

export const metadata = {
  title: 'Hôtels en RDC — 26 Provinces | YABISO HOTELS',
  description: 'Réservez des hôtels vérifiés dans les 26 provinces de la République démocratique du Congo : Kinshasa, Nord-Kivu, Sud-Kivu, Haut-Katanga, Kongo Central, Tshopo, Équateur, Lualaba et plus. Paiement sécurisé multi-devises.',
  alternates: { canonical: '/rdc' },
}

export default function ProvincesIndex() {
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <nav style={{ marginBottom: 24 }}>
        <Link href="/" style={{ color: '#0057B8', textDecoration: 'none', fontWeight: 600 }}>← YABISO HOTELS</Link>
      </nav>
      <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 8px' }}>Hôtels en République démocratique du Congo</h1>
      <p style={{ color: '#555', fontSize: 18, marginBottom: 28 }}>Explorez les hôtels, appartements et hébergements vérifiés dans les <strong>26 provinces</strong> de la RDC.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
        {DRC_PROVINCES.map((p) => (
          <Link key={p} href={'/rdc/' + slugify(p)} style={{ display: 'block', padding: '16px 18px', border: '1px solid #e5e7eb', borderRadius: 12, textDecoration: 'none', color: '#0f172a', background: '#fff', fontWeight: 600 }}>
            {p}
            <div style={{ color: '#0057B8', fontSize: 13, fontWeight: 500, marginTop: 4 }}>Voir les hôtels →</div>
          </Link>
        ))}
      </div>
      <p style={{ marginTop: 40, color: '#777' }}>YABISO HOTELS — Powered by BissaGlobal Services. AFRICA BOOKS WITH CONFIDENCE.</p>
    </main>
  )
}

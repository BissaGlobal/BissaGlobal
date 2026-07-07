export default function manifest() {
  return {
    name: 'YABISO HOTELS — Voyage en Afrique',
    short_name: 'YABISO',
    description: "Réservez hôtels, appartements, excursions, transferts, taxis et location de voitures partout en Afrique.",
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#0057B8',
    lang: 'fr',
    categories: ['travel', 'lifestyle', 'business'],
    icons: [
      { src: '/api/pwa/icon-192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/api/pwa/icon-512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/api/pwa/icon-512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}

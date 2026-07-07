import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://yabisohotels.com'

export const metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'YABISO HOTELS — Réservez hôtels, appartements & services de voyage en Afrique',
    template: '%s | YABISO HOTELS',
  },
  description: "Réservez des hôtels, appartements et maisons de vacances vérifiés à travers l'Afrique subsaharienne (RDC, Congo-Brazzaville et plus). Excursions, transferts aéroport, taxis et location de voitures. Paiement multi-devises. Powered by BissaGlobal Services.",
  keywords: ['hôtels Afrique', 'réservation hôtel RDC', 'hôtels Kinshasa', 'hôtels Brazzaville', 'hôtels Congo', 'appartements Afrique', 'excursions Afrique', 'transfert aéroport', 'location voiture Congo', 'YABISO', 'réservation voyage Afrique subsaharienne'],
  applicationName: 'YABISO HOTELS',
  authors: [{ name: 'YABISO HOTELS' }],
  manifest: '/manifest.webmanifest',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE,
    siteName: 'YABISO HOTELS',
    title: 'YABISO HOTELS — Le voyage en Afrique, simplifié',
    description: "Hôtels, appartements, excursions, transferts, taxis et location de voitures partout en Afrique subsaharienne.",
    images: [{ url: '/api/pwa/icon-512', width: 512, height: 512, alt: 'YABISO HOTELS' }],
  },
  twitter: {
    card: 'summary',
    title: 'YABISO HOTELS — Le voyage en Afrique, simplifié',
    description: 'Hôtels, appartements et services de voyage partout en Afrique.',
    images: ['/api/pwa/icon-512'],
  },
  icons: { icon: '/api/pwa/icon-192', shortcut: '/api/pwa/icon-192', apple: '/api/pwa/icon-192' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'YABISO' },
}

export const viewport = {
  themeColor: '#0057B8',
  width: 'device-width',
  initialScale: 1,
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': SITE + '/#organization',
      name: 'YABISO HOTELS',
      url: SITE,
      logo: SITE + '/api/pwa/icon-512',
      description: "Marketplace panafricaine de réservation d'hôtels et de services de voyage.",
    },
    {
      '@type': 'WebSite',
      '@id': SITE + '/#website',
      url: SITE,
      name: 'YABISO HOTELS',
      inLanguage: 'fr',
      publisher: { '@id': SITE + '/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: SITE + '/?q={search_term_string}' },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script dangerouslySetInnerHTML={{__html:'if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").catch(function(){})})}'}} />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}


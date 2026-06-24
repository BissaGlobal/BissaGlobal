'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  Wifi, Waves, Utensils, Car, Snowflake, Sparkles, Dumbbell, Wine, Plane, Coffee,
  Star, MapPin, Search, Heart, Moon, Sun, Check, ShieldCheck, Phone, Calendar as CalIcon,
  Users, Globe, ArrowRight, BadgeCheck, CheckCircle2, CreditCard, Building2, Quote, Menu, X,
} from 'lucide-react'

/* ----------------------------- i18n ----------------------------- */
const T = {
  fr: {
    nav_home: 'Accueil', nav_destinations: 'Destinations', nav_partner: 'Devenir partenaire', nav_help: 'Aide',
    hero_title: 'Réservez votre hôtel partout en Afrique',
    hero_sub: 'Trouvez des hôtels, appartements et hébergements vérifiés avec paiement sécurisé.',
    f_dest: 'Destination', f_dest_ph: 'Ville, province ou hôtel', f_in: 'Arrivée', f_out: 'Départ', f_guests: 'Voyageurs', search: 'Rechercher',
    featured: 'Hôtels en vedette', featured_sub: 'Une sélection vérifiée par nos agents YABISO',
    trending: 'Destinations tendances', trending_sub: "Explorez l'Afrique subsaharienne", lastminute: 'Offres de dernière minute',
    reviews_title: 'Ils ont voyagé avec YABISO', partner_title: 'Vous êtes hôtelier ?', partner_sub: 'Rejoignez le plus grand marketplace hôtelier panafricain et boostez vos réservations.',
    partner_cta: 'Devenir partenaire', view_all: 'Voir tout', per_night: '/ nuit', guests_n: 'voyageurs',
    book_now: 'Réserver', see_details: 'Voir les détails', verified: 'Vérifié par YABISO',
    amenities: 'Équipements', description: 'Description', location: 'Localisation', rooms: 'Chambres disponibles',
    reviews: 'Avis', similar: 'Hébergements similaires', whatsapp: 'Contacter sur WhatsApp', select_room: 'Choisir',
    results_for: 'Résultats pour', results: 'hébergements trouvés', no_results: 'Aucun hébergement trouvé. Essayez une autre recherche.',
    filters: 'Filtres', all_types: 'Tous les types', sort: 'Trier', back: 'Retour',
    booking_title: 'Finaliser votre réservation', your_stay: 'Votre séjour', nights: 'nuit(s)',
    your_info: 'Vos informations', full_name: 'Nom complet', email: 'Email', phone: 'Téléphone',
    payment: 'Paiement', payment_method: 'Méthode de paiement', price_summary: 'Récapitulatif du prix',
    subtotal: 'Sous-total', conv_fee: 'Frais de conversion', exchange_rate: 'Taux de change', total: 'Total à payer',
    pay_now: 'Payer et réserver', secure: 'Paiement 100% sécurisé via YABISO', processing: 'Traitement...',
    conf_title: 'Réservation confirmée !', conf_sub: 'Votre paiement a été reçu. Référence de réservation :',
    conf_email: 'Une confirmation a été envoyée par email et SMS.', conf_process: 'Suivi de votre réservation',
    back_home: "Retour à l'accueil", how_title: 'Comment ça marche', cancel: 'Annuler',
    types: { hotel: 'Hôtel', apartment: 'Appartement', villa: 'Villa', resort: 'Resort', lodge: 'Lodge', guesthouse: "Maison d'hôtes", residence: 'Résidence' },
    nights_label: 'nuits', guest_one: 'voyageur',
  },
  en: {
    nav_home: 'Home', nav_destinations: 'Destinations', nav_partner: 'Become a partner', nav_help: 'Help',
    hero_title: 'Book your hotel anywhere in Africa',
    hero_sub: 'Find verified hotels, apartments and stays with secure payment.',
    f_dest: 'Destination', f_dest_ph: 'City, province or hotel', f_in: 'Check-in', f_out: 'Check-out', f_guests: 'Guests', search: 'Search',
    featured: 'Featured hotels', featured_sub: 'A selection verified by our YABISO agents',
    trending: 'Trending destinations', trending_sub: 'Explore Sub-Saharan Africa', lastminute: 'Last minute deals',
    reviews_title: 'They travelled with YABISO', partner_title: 'Are you a hotelier?', partner_sub: 'Join the largest pan-African hotel marketplace and boost your bookings.',
    partner_cta: 'Become a partner', view_all: 'View all', per_night: '/ night', guests_n: 'guests',
    book_now: 'Book', see_details: 'See details', verified: 'Verified by YABISO',
    amenities: 'Amenities', description: 'Description', location: 'Location', rooms: 'Available rooms',
    reviews: 'Reviews', similar: 'Similar stays', whatsapp: 'Contact on WhatsApp', select_room: 'Select',
    results_for: 'Results for', results: 'stays found', no_results: 'No stays found. Try another search.',
    filters: 'Filters', all_types: 'All types', sort: 'Sort', back: 'Back',
    booking_title: 'Complete your booking', your_stay: 'Your stay', nights: 'night(s)',
    your_info: 'Your information', full_name: 'Full name', email: 'Email', phone: 'Phone',
    payment: 'Payment', payment_method: 'Payment method', price_summary: 'Price summary',
    subtotal: 'Subtotal', conv_fee: 'Conversion fee', exchange_rate: 'Exchange rate', total: 'Total to pay',
    pay_now: 'Pay and book', secure: '100% secure payment via YABISO', processing: 'Processing...',
    conf_title: 'Booking confirmed!', conf_sub: 'Your payment has been received. Booking reference:',
    conf_email: 'A confirmation has been sent by email and SMS.', conf_process: 'Track your booking',
    back_home: 'Back to home', how_title: 'How it works', cancel: 'Cancel',
    types: { hotel: 'Hotel', apartment: 'Apartment', villa: 'Villa', resort: 'Resort', lodge: 'Lodge', guesthouse: 'Guest house', residence: 'Residence' },
    nights_label: 'nights', guest_one: 'guest',
  },
}

const AMENITIES = {
  wifi: { icon: Wifi, fr: 'WiFi gratuit', en: 'Free WiFi' },
  pool: { icon: Waves, fr: 'Piscine', en: 'Swimming pool' },
  restaurant: { icon: Utensils, fr: 'Restaurant', en: 'Restaurant' },
  parking: { icon: Car, fr: 'Parking', en: 'Parking' },
  ac: { icon: Snowflake, fr: 'Climatisation', en: 'Air conditioning' },
  spa: { icon: Sparkles, fr: 'Spa', en: 'Spa' },
  gym: { icon: Dumbbell, fr: 'Salle de sport', en: 'Fitness center' },
  bar: { icon: Wine, fr: 'Bar', en: 'Bar' },
  shuttle: { icon: Plane, fr: 'Navette aéroport', en: 'Airport shuttle' },
  breakfast: { icon: Coffee, fr: 'Petit-déjeuner', en: 'Breakfast' },
}

const CURRENCIES = ['CDF', 'USD', 'EUR', 'GBP']
const SYMBOLS = { CDF: 'FC', USD: '$', EUR: '€', GBP: '£' }
const PAYMENTS = [
  { id: 'visa', label: 'Visa' }, { id: 'mastercard', label: 'Mastercard' }, { id: 'stripe', label: 'Stripe' },
  { id: 'paypal', label: 'PayPal' }, { id: 'orange', label: 'Orange Money' }, { id: 'airtel', label: 'Airtel Money' },
  { id: 'mpesa', label: 'M-Pesa' }, { id: 'bank', label: 'Bank Transfer' }, { id: 'hotel', label: 'Pay at Hotel' },
]
const STATUS_FLOW = [
  { key: 'pending_payment', fr: 'Paiement en attente', en: 'Pending payment' },
  { key: 'payment_received', fr: 'Paiement reçu', en: 'Payment received' },
  { key: 'awaiting_hotel_confirmation', fr: "En attente de l'hôtel", en: 'Awaiting hotel confirmation' },
  { key: 'confirmed_by_hotel', fr: "Confirmé par l'hôtel", en: 'Confirmed by hotel' },
  { key: 'customer_notified', fr: 'Client notifié', en: 'Customer notified' },
  { key: 'checkin_confirmed', fr: 'Check-in confirmé', en: 'Check-in confirmed' },
  { key: 'awaiting_payout', fr: 'Versement hôtel en attente', en: 'Awaiting hotel payout' },
  { key: 'hotel_paid', fr: 'Hôtel payé', en: 'Hotel paid' },
]

function fmtDateInput(d) { return d.toISOString().split('T')[0] }

/* =============================== APP =============================== */
function App() {
  const [lang, setLang] = useState('fr')
  const [currency, setCurrency] = useState('USD')
  const [dark, setDark] = useState(false)
  const [view, setView] = useState('home')
  const [hotels, setHotels] = useState([])
  const [rates, setRates] = useState({ USD: 2850, EUR: 3080, GBP: 3600 })
  const [fee, setFee] = useState(0.07)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [draft, setDraft] = useState(null)
  const [result, setResult] = useState(null)

  const today = new Date()
  const [search, setSearch] = useState({
    q: '', type: '', checkIn: fmtDateInput(new Date(today.getTime() + 86400000)),
    checkOut: fmtDateInput(new Date(today.getTime() + 3 * 86400000)), guests: 2,
  })

  const t = useCallback((k) => T[lang][k], [lang])
  const typeLabel = useCallback((ty) => T[lang].types[ty] || ty, [lang])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const loadHotels = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v))
      const r = await fetch('/api/hotels?' + qs.toString())
      setHotels(await r.json())
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        await fetch('/api/seed')
        const sr = await fetch('/api/settings/rates'); const s = await sr.json()
        if (s.rates) setRates(s.rates); if (typeof s.fee === 'number') setFee(s.fee)
        await loadHotels()
      } catch (e) { console.error(e) }
    })()
  }, [loadHotels])

  const priceIn = useCallback((cdf) => {
    if (currency === 'CDF') return Math.round(cdf)
    const r = rates[currency] || 1
    return Math.round((cdf / r) * (1 + fee))
  }, [currency, rates, fee])

  const fmt = useCallback((cdf) => {
    const v = priceIn(cdf)
    if (currency === 'CDF') return v.toLocaleString('fr-FR') + ' FC'
    return SYMBOLS[currency] + v.toLocaleString('fr-FR')
  }, [priceIn, currency])

  const goto = (v) => { setView(v); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const openHotel = async (id) => {
    goto('hotel')
    setSelected(null)
    try { const r = await fetch('/api/hotels/' + id); setSelected(await r.json()) } catch (e) { console.error(e) }
  }

  const doSearch = async () => {
    await loadHotels({ q: search.q, type: search.type, guests: search.guests })
    goto('search')
  }

  const toggleFav = (id) => {
    setFavorites((f) => f.includes(id) ? f.filter((x) => x !== id) : [...f, id])
  }

  const startBooking = (hotel, room) => {
    setDraft({ hotel, room, checkIn: search.checkIn, checkOut: search.checkOut, guests: search.guests })
    goto('booking')
  }

  /* ----------------------------- Header ----------------------------- */
  const Header = () => (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between gap-4">
        <button onClick={() => { goto('home'); loadHotels() }} className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-extrabold">Y</div>
          <div className="text-left leading-none">
            <div className="text-lg font-extrabold tracking-tight">YABISO<span className="text-[#F4B400]"> HOTELS</span></div>
            <div className="text-[10px] text-muted-foreground hidden sm:block">Powered by BissaGlobal Services</div>
          </div>
        </button>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <button onClick={() => { goto('home'); loadHotels() }} className="hover:text-primary transition">{t('nav_home')}</button>
          <button onClick={() => goto('search')} className="hover:text-primary transition">{t('nav_destinations')}</button>
          <button onClick={() => goto('partner')} className="hover:text-primary transition">{t('nav_partner')}</button>
        </nav>

        <div className="flex items-center gap-2">
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="h-9 w-[78px]"><SelectValue /></SelectTrigger>
            <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <div className="flex rounded-md border text-xs font-semibold overflow-hidden">
            {['fr', 'en'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-2.5 py-1.5 ${lang === l ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{l.toUpperCase()}</button>
            ))}
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setDark((d) => !d)}>
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  )

  /* ----------------------------- Search bar ----------------------------- */
  const SearchBar = ({ compact }) => (
    <div className={`bg-card text-card-foreground rounded-2xl shadow-xl border p-3 grid grid-cols-1 md:grid-cols-12 gap-2 ${compact ? '' : 'md:p-4'}`}>
      <div className="md:col-span-4 flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-muted-foreground px-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{t('f_dest')}</label>
        <Input value={search.q} onChange={(e) => setSearch({ ...search, q: e.target.value })} placeholder={t('f_dest_ph')} className="h-11" onKeyDown={(e) => e.key === 'Enter' && doSearch()} />
      </div>
      <div className="md:col-span-2 flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-muted-foreground px-1 flex items-center gap-1"><CalIcon className="h-3 w-3" />{t('f_in')}</label>
        <Input type="date" value={search.checkIn} onChange={(e) => setSearch({ ...search, checkIn: e.target.value })} className="h-11" />
      </div>
      <div className="md:col-span-2 flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-muted-foreground px-1 flex items-center gap-1"><CalIcon className="h-3 w-3" />{t('f_out')}</label>
        <Input type="date" value={search.checkOut} onChange={(e) => setSearch({ ...search, checkOut: e.target.value })} className="h-11" />
      </div>
      <div className="md:col-span-2 flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-muted-foreground px-1 flex items-center gap-1"><Users className="h-3 w-3" />{t('f_guests')}</label>
        <Select value={String(search.guests)} onValueChange={(v) => setSearch({ ...search, guests: parseInt(v) })}>
          <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
          <SelectContent>{[1, 2, 3, 4, 5, 6].map((n) => <SelectItem key={n} value={String(n)}>{n} {n === 1 ? t('guest_one') : t('guests_n')}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="md:col-span-2 flex items-end">
        <Button onClick={doSearch} className="h-11 w-full font-semibold gap-2"><Search className="h-4 w-4" />{t('search')}</Button>
      </div>
    </div>
  )

  /* ----------------------------- Hotel card ----------------------------- */
  const HotelCard = ({ h }) => (
    <Card className="group overflow-hidden border hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => openHotel(h.id)}>
      <div className="relative h-52 overflow-hidden">
        <img src={h.images[0]} alt={h.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-background/90 text-foreground hover:bg-background/90 border">{typeLabel(h.type)}</Badge>
          {h.verified && <Badge className="bg-[#0057B8] text-white gap-1 hover:bg-[#0057B8]"><BadgeCheck className="h-3 w-3" />{t('verified')}</Badge>}
        </div>
        <button onClick={(e) => { e.stopPropagation(); toggleFav(h.id) }} className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/90 grid place-items-center hover:scale-110 transition">
          <Heart className={`h-4 w-4 ${favorites.includes(h.id) ? 'fill-[#CE1126] text-[#CE1126]' : 'text-foreground'}`} />
        </button>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold leading-tight line-clamp-1">{h.name}</h3>
          <div className="flex items-center gap-1 text-sm font-semibold shrink-0"><Star className="h-3.5 w-3.5 fill-[#F4B400] text-[#F4B400]" />{h.rating}</div>
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3.5 w-3.5" />{h.city}, {h.country}</p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="text-lg font-extrabold text-primary">{fmt(h.priceCDF)}</div>
            <div className="text-[11px] text-muted-foreground">{t('per_night')} · {h.reviewCount} {t('reviews').toLowerCase()}</div>
          </div>
          <Button size="sm" variant="secondary" className="gap-1">{t('see_details')}<ArrowRight className="h-3.5 w-3.5" /></Button>
        </div>
      </CardContent>
    </Card>
  )

  /* ----------------------------- HOME ----------------------------- */
  const [destinations, setDestinations] = useState([])
  useEffect(() => { fetch('/api/destinations').then((r) => r.json()).then(setDestinations).catch(() => {}) }, [])

  const featured = useMemo(() => hotels.filter((h) => h.featured).slice(0, 8), [hotels])
  const reviewsHome = useMemo(() => [
    { author: 'Jean-Marc K.', city: 'Kinshasa', rating: 5, fr: 'Réservation simple et paiement sécurisé. Mon hôtel à Kinshasa était parfait !', en: 'Easy booking and secure payment. My hotel in Kinshasa was perfect!' },
    { author: 'Aïcha D.', city: 'Dakar', rating: 5, fr: 'YABISO a vérifié l\'hôtel avant ma venue. Je voyage en confiance.', en: 'YABISO verified the hotel before my stay. I travel with confidence.' },
    { author: 'Patrick M.', city: 'Goma', rating: 4, fr: 'Service client réactif sur WhatsApp. Très pratique pour la diaspora.', en: 'Responsive customer support on WhatsApp. Great for the diaspora.' },
  ], [])

  const Home = () => (
    <main>
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1779617442298-d912b57a841c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwyfHxBZnJpY2FuJTIwaG90ZWwlMjByZXNvcnR8ZW58MHx8fHwxNzgyMzM3MDgyfDA&ixlib=rb-4.1.0&q=85" alt="Afrique" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a2a52]/90 via-[#0057B8]/70 to-[#0057B8]/30" />
        </div>
        <div className="relative container py-20 md:py-28">
          <Badge className="bg-[#F4B400] text-black hover:bg-[#F4B400] mb-4 font-semibold">Réservez • Séjournez • Découvrez l'Afrique</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white max-w-3xl leading-tight drop-shadow">{t('hero_title')}</h1>
          <p className="mt-4 text-lg text-white/90 max-w-2xl">{t('hero_sub')}</p>
          <div className="mt-8 max-w-5xl"><SearchBar /></div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[#F4B400]" />Hôtels vérifiés</span>
            <span className="flex items-center gap-1.5"><CreditCard className="h-4 w-4 text-[#F4B400]" />Paiement sécurisé multi-devises</span>
            <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-[#F4B400]" />Toute l'Afrique subsaharienne</span>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold">{t('featured')}</h2>
            <p className="text-muted-foreground">{t('featured_sub')}</p>
          </div>
          <Button variant="ghost" className="gap-1 hidden sm:flex" onClick={() => { loadHotels(); goto('search') }}>{t('view_all')}<ArrowRight className="h-4 w-4" /></Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((h) => <HotelCard key={h.id} h={h} />)}
        </div>
      </section>

      {/* Destinations */}
      <section className="bg-muted/40 py-14">
        <div className="container">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold">{t('trending')}</h2>
            <p className="text-muted-foreground">{t('trending_sub')}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {destinations.slice(0, 8).map((d) => (
              <button key={d.city} onClick={() => { setSearch({ ...search, q: d.city }); loadHotels({ q: d.city }); goto('search') }}
                className="group relative h-44 rounded-xl overflow-hidden text-left">
                <img src={d.image} alt={d.city} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 p-4 text-white">
                  <div className="font-bold text-lg">{d.city}</div>
                  <div className="text-xs text-white/80">{d.province} · {d.count} {d.count > 1 ? 'hébergements' : 'hébergement'}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container py-14">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-10">{t('how_title')}</h2>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { icon: Search, fr: 'Recherchez', en: 'Search', d_fr: 'Trouvez l\'hébergement idéal parmi nos hôtels vérifiés.', d_en: 'Find the ideal stay among our verified hotels.' },
            { icon: CreditCard, fr: 'Payez en sécurité', en: 'Pay securely', d_fr: 'Réglez YABISO dans votre devise. Visa, Mobile Money, PayPal...', d_en: 'Pay YABISO in your currency. Visa, Mobile Money, PayPal...' },
            { icon: ShieldCheck, fr: 'Nous confirmons', en: 'We confirm', d_fr: 'YABISO contacte l\'hôtel et confirme votre réservation.', d_en: 'YABISO contacts the hotel and confirms your booking.' },
            { icon: CheckCircle2, fr: 'Séjournez', en: 'Stay', d_fr: 'Présentez votre référence et profitez de votre séjour.', d_en: 'Show your reference and enjoy your stay.' },
          ].map((s, i) => (
            <Card key={i} className="text-center p-6 border">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 text-primary grid place-items-center"><s.icon className="h-6 w-6" /></div>
              <div className="font-bold">{i + 1}. {lang === 'fr' ? s.fr : s.en}</div>
              <p className="text-sm text-muted-foreground mt-2">{lang === 'fr' ? s.d_fr : s.d_en}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-muted/40 py-14">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-8 text-center">{t('reviews_title')}</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {reviewsHome.map((r, i) => (
              <Card key={i} className="p-6 border">
                <Quote className="h-7 w-7 text-[#F4B400]" />
                <p className="mt-3 text-sm">{lang === 'fr' ? r.fr : r.en}</p>
                <div className="mt-4 flex items-center gap-3">
                  <Avatar><AvatarFallback className="bg-primary text-primary-foreground">{r.author[0]}</AvatarFallback></Avatar>
                  <div>
                    <div className="font-semibold text-sm">{r.author}</div>
                    <div className="text-xs text-muted-foreground">{r.city}</div>
                  </div>
                  <div className="ml-auto flex">{Array.from({ length: r.rating }).map((_, k) => <Star key={k} className="h-3.5 w-3.5 fill-[#F4B400] text-[#F4B400]" />)}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partner CTA */}
      <section className="container py-16">
        <div className="rounded-2xl bg-gradient-to-r from-[#0057B8] to-[#003a7a] text-white p-10 md:p-14 text-center">
          <h2 className="text-3xl font-extrabold">{t('partner_title')}</h2>
          <p className="mt-3 max-w-2xl mx-auto text-white/90">{t('partner_sub')}</p>
          <Button onClick={() => goto('partner')} className="mt-6 bg-[#F4B400] text-black hover:bg-[#d99f00] font-semibold gap-2">{t('partner_cta')}<ArrowRight className="h-4 w-4" /></Button>
        </div>
      </section>
    </main>
  )

  /* ----------------------------- SEARCH ----------------------------- */
  const SearchView = () => (
    <main className="container py-8">
      <div className="mb-6"><SearchBar compact /></div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h2 className="text-xl font-bold">{hotels.length} {t('results')}{search.q ? ` · ${search.q}` : ''}</h2>
        <div className="ml-auto">
          <Select value={search.type || 'all'} onValueChange={(v) => { const ty = v === 'all' ? '' : v; setSearch({ ...search, type: ty }); loadHotels({ q: search.q, type: ty, guests: search.guests }) }}>
            <SelectTrigger className="h-9 w-[180px]"><SelectValue placeholder={t('all_types')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_types')}</SelectItem>
              {Object.keys(T[lang].types).map((k) => <SelectItem key={k} value={k}>{typeLabel(k)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-80 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : hotels.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">{t('no_results')}</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{hotels.map((h) => <HotelCard key={h.id} h={h} />)}</div>
      )}
    </main>
  )

  /* ----------------------------- HOTEL DETAIL ----------------------------- */
  const [activeImg, setActiveImg] = useState(0)
  useEffect(() => { setActiveImg(0) }, [selected?.id])

  const HotelView = () => {
    if (!selected) return <div className="container py-20 text-center text-muted-foreground">...</div>
    const h = selected
    const similar = hotels.filter((x) => x.id !== h.id && (x.country === h.country || x.type === h.type)).slice(0, 3)
    const wa = `https://wa.me/243990000000?text=${encodeURIComponent('Bonjour YABISO, je suis intéressé par ' + h.name + ' à ' + h.city)}`
    return (
      <main className="container py-8">
        <button onClick={() => goto('search')} className="text-sm text-muted-foreground hover:text-primary mb-4 flex items-center gap-1"><ArrowRight className="h-3.5 w-3.5 rotate-180" />{t('back')}</button>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-extrabold">{h.name}</h1>
              {h.verified && <Badge className="bg-[#0057B8] text-white gap-1 hover:bg-[#0057B8]"><BadgeCheck className="h-3 w-3" />{t('verified')}</Badge>}
            </div>
            <p className="text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-4 w-4" />{h.city}, {h.province}, {h.country}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg bg-primary/10 text-primary px-3 py-2 font-bold"><Star className="h-4 w-4 fill-[#F4B400] text-[#F4B400]" />{h.rating} <span className="text-xs font-normal text-muted-foreground">({h.reviewCount})</span></div>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid gap-3 md:grid-cols-3 mb-8">
          <div className="md:col-span-2 h-72 md:h-[420px] rounded-xl overflow-hidden">
            <img src={h.images[activeImg]} alt={h.name} className="h-full w-full object-cover" />
          </div>
          <div className="grid grid-cols-3 md:grid-cols-1 gap-3">
            {h.images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)} className={`h-24 md:h-[132px] rounded-xl overflow-hidden border-2 ${activeImg === i ? 'border-primary' : 'border-transparent'}`}>
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-2">{t('description')}</h2>
              <p className="text-muted-foreground leading-relaxed">{lang === 'fr' ? h.description : h.descriptionEn}</p>
            </section>
            <section>
              <h2 className="text-xl font-bold mb-3">{t('amenities')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {h.amenities.map((a) => { const m = AMENITIES[a]; if (!m) return null; const Ic = m.icon; return (
                  <div key={a} className="flex items-center gap-2 text-sm"><Ic className="h-4 w-4 text-primary" />{m[lang]}</div>
                ) })}
              </div>
            </section>
            <section>
              <h2 className="text-xl font-bold mb-3">{t('location')}</h2>
              <div className="rounded-xl overflow-hidden border h-64">
                <iframe title="map" width="100%" height="100%" loading="lazy" src={`https://maps.google.com/maps?q=${h.lat},${h.lng}&z=13&output=embed`} />
              </div>
            </section>
            <section>
              <h2 className="text-xl font-bold mb-3">{t('reviews')} ({h.reviews?.length || 0})</h2>
              <div className="space-y-4">
                {(h.reviews || []).map((r) => (
                  <Card key={r.id} className="p-4 border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary text-primary-foreground text-sm">{r.author[0]}</AvatarFallback></Avatar>
                      <div className="font-semibold text-sm">{r.author}</div>
                      <div className="ml-auto flex">{Array.from({ length: r.rating }).map((_, k) => <Star key={k} className="h-3.5 w-3.5 fill-[#F4B400] text-[#F4B400]" />)}</div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{r.comment}</p>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-5 border sticky top-20">
              <h2 className="text-lg font-bold mb-1">{t('rooms')}</h2>
              <div className="space-y-3 mt-3">
                {h.rooms.map((r) => (
                  <div key={r.id} className="rounded-xl border p-3">
                    <div className="font-semibold">{lang === 'fr' ? r.name : r.nameEn}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{r.capacity}</span>
                      <span>{lang === 'fr' ? r.beds : r.bedsEn}</span>
                    </div>
                    <div className="flex items-end justify-between mt-3">
                      <div>
                        <div className="text-lg font-extrabold text-primary">{fmt(r.priceCDF)}</div>
                        <div className="text-[11px] text-muted-foreground">{t('per_night')}</div>
                      </div>
                      <Button size="sm" onClick={() => startBooking(h, r)}>{t('select_room')}</Button>
                    </div>
                  </div>
                ))}
              </div>
              <a href={wa} target="_blank" rel="noreferrer" className="mt-4 block">
                <Button variant="outline" className="w-full gap-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"><Phone className="h-4 w-4" />{t('whatsapp')}</Button>
              </a>
            </Card>
          </div>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold mb-4">{t('similar')}</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{similar.map((s) => <HotelCard key={s.id} h={s} />)}</div>
          </section>
        )}
      </main>
    )
  }

  /* ----------------------------- BOOKING ----------------------------- */
  const BookingView = () => {
    const [cust, setCust] = useState({ name: '', email: '', phone: '' })
    const [pm, setPm] = useState('visa')
    const [busy, setBusy] = useState(false)
    if (!draft) { goto('home'); return null }
    const { hotel, room } = draft
    const nights = Math.max(1, Math.round((new Date(draft.checkOut) - new Date(draft.checkIn)) / 86400000))
    const subtotalCDF = room.priceCDF * nights
    const totalDisplay = priceIn(subtotalCDF)
    const baseConverted = currency === 'CDF' ? subtotalCDF : Math.round((subtotalCDF / rates[currency]))
    const feeAmount = currency === 'CDF' ? 0 : totalDisplay - baseConverted

    const submit = async () => {
      if (!cust.name || !cust.email) { toast.error(lang === 'fr' ? 'Veuillez remplir votre nom et email.' : 'Please fill in your name and email.'); return }
      setBusy(true)
      try {
        const r = await fetch('/api/bookings', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hotelId: hotel.id, roomId: room.id, checkIn: draft.checkIn, checkOut: draft.checkOut, guests: draft.guests, currency, customer: cust, paymentMethod: pm }),
        })
        const data = await r.json()
        if (data.error) throw new Error(data.error)
        setResult(data)
        goto('confirmation')
        toast.success(lang === 'fr' ? 'Paiement reçu !' : 'Payment received!')
      } catch (e) { toast.error(String(e.message || e)) } finally { setBusy(false) }
    }

    return (
      <main className="container py-8 max-w-5xl">
        <button onClick={() => goto('hotel')} className="text-sm text-muted-foreground hover:text-primary mb-4 flex items-center gap-1"><ArrowRight className="h-3.5 w-3.5 rotate-180" />{t('back')}</button>
        <h1 className="text-2xl md:text-3xl font-extrabold mb-6">{t('booking_title')}</h1>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5 border">
              <h2 className="font-bold mb-3">{t('your_info')}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2"><label className="text-sm font-medium">{t('full_name')}</label><Input value={cust.name} onChange={(e) => setCust({ ...cust, name: e.target.value })} className="mt-1" /></div>
                <div><label className="text-sm font-medium">{t('email')}</label><Input type="email" value={cust.email} onChange={(e) => setCust({ ...cust, email: e.target.value })} className="mt-1" /></div>
                <div><label className="text-sm font-medium">{t('phone')}</label><Input value={cust.phone} onChange={(e) => setCust({ ...cust, phone: e.target.value })} className="mt-1" placeholder="+243..." /></div>
              </div>
            </Card>
            <Card className="p-5 border">
              <h2 className="font-bold mb-3">{t('payment_method')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PAYMENTS.map((p) => (
                  <button key={p.id} onClick={() => setPm(p.id)} className={`rounded-lg border p-3 text-sm font-medium text-left transition ${pm === p.id ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:bg-muted'}`}>
                    <CreditCard className="h-4 w-4 mb-1 text-primary" />{p.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" />{t('secure')}</p>
            </Card>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="p-5 border sticky top-20">
              <div className="flex gap-3">
                <img src={hotel.images[0]} alt="" className="h-16 w-16 rounded-lg object-cover" />
                <div>
                  <div className="font-bold text-sm leading-tight">{hotel.name}</div>
                  <div className="text-xs text-muted-foreground">{lang === 'fr' ? room.name : room.nameEn}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{hotel.city}</div>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{t('f_in')}</span><span className="font-medium">{draft.checkIn}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('f_out')}</span><span className="font-medium">{draft.checkOut}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('f_guests')}</span><span className="font-medium">{draft.guests}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{nights} {t('nights_label')} × {fmt(room.priceCDF)}</span><span className="font-medium">{fmt(subtotalCDF)}</span></div>
              </div>
              <Separator className="my-4" />
              {currency !== 'CDF' && (
                <div className="space-y-1.5 text-xs text-muted-foreground mb-2">
                  <div className="flex justify-between"><span>{t('exchange_rate')}</span><span>1 {currency} = {rates[currency].toLocaleString('fr-FR')} FC</span></div>
                  <div className="flex justify-between"><span>{t('conv_fee')} ({Math.round(fee * 100)}%)</span><span>{SYMBOLS[currency]}{feeAmount.toLocaleString('fr-FR')}</span></div>
                </div>
              )}
              <div className="flex justify-between items-end">
                <span className="font-bold">{t('total')}</span>
                <span className="text-2xl font-extrabold text-primary">{fmt(subtotalCDF)}</span>
              </div>
              <Button onClick={submit} disabled={busy} className="w-full mt-4 h-11 font-semibold gap-2">{busy ? t('processing') : <><CreditCard className="h-4 w-4" />{t('pay_now')}</>}</Button>
            </Card>
          </div>
        </div>
      </main>
    )
  }

  /* ----------------------------- CONFIRMATION ----------------------------- */
  const ConfirmationView = () => {
    if (!result) { goto('home'); return null }
    const currentIdx = STATUS_FLOW.findIndex((s) => s.key === result.status)
    return (
      <main className="container py-12 max-w-3xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-950 grid place-items-center mb-4"><CheckCircle2 className="h-9 w-9 text-green-600" /></div>
          <h1 className="text-2xl md:text-3xl font-extrabold">{t('conf_title')}</h1>
          <p className="text-muted-foreground mt-2">{t('conf_sub')}</p>
          <div className="mt-3 inline-block rounded-xl bg-primary/10 text-primary px-6 py-3 text-2xl font-extrabold tracking-wider">{result.reference}</div>
          <p className="text-sm text-muted-foreground mt-3">{t('conf_email')}</p>
        </div>

        <Card className="p-5 border mt-8">
          <div className="flex gap-4 items-center">
            <img src={result.hotelImage} alt="" className="h-20 w-20 rounded-lg object-cover" />
            <div className="flex-1">
              <div className="font-bold">{result.hotelName}</div>
              <div className="text-sm text-muted-foreground">{result.roomName} · {result.hotelCity}</div>
              <div className="text-sm text-muted-foreground">{result.checkIn} → {result.checkOut} · {result.nights} {t('nights_label')} · {result.guests} {t('f_guests').toLowerCase()}</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-extrabold text-primary">{SYMBOLS[result.currency]}{result.totalDisplay.toLocaleString('fr-FR')}{result.currency === 'CDF' ? ' FC' : ''}</div>
              <Badge className="mt-1 bg-green-600 hover:bg-green-600">{STATUS_FLOW[currentIdx]?.[lang]}</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6 border mt-6">
          <h2 className="font-bold mb-4">{t('conf_process')}</h2>
          <ol className="space-y-4">
            {STATUS_FLOW.map((s, i) => {
              const done = i <= currentIdx
              return (
                <li key={s.key} className="flex items-center gap-3">
                  <div className={`h-7 w-7 rounded-full grid place-items-center shrink-0 ${done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {done ? <Check className="h-4 w-4" /> : <span className="text-xs">{i + 1}</span>}
                  </div>
                  <span className={`text-sm ${done ? 'font-semibold' : 'text-muted-foreground'}`}>{s[lang]}</span>
                  {i === currentIdx && <Badge variant="outline" className="ml-auto text-xs">{lang === 'fr' ? 'Actuel' : 'Current'}</Badge>}
                </li>
              )
            })}
          </ol>
        </Card>

        <div className="text-center mt-8">
          <Button variant="outline" onClick={() => { goto('home'); loadHotels() }}>{t('back_home')}</Button>
        </div>
      </main>
    )
  }

  /* ----------------------------- PARTNER ----------------------------- */
  const PartnerView = () => (
    <main className="container py-12 max-w-4xl">
      <div className="text-center mb-10">
        <Badge className="bg-[#F4B400] text-black hover:bg-[#F4B400] mb-3">YABISO Partners</Badge>
        <h1 className="text-3xl md:text-4xl font-extrabold">{t('partner_title')}</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">{t('partner_sub')}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3 mb-10">
        {[
          { fr: 'Onboarding & photos pro', en: 'Onboarding & pro photos', icon: Building2 },
          { fr: 'Vérification par nos agents terrain', en: 'Verification by our field agents', icon: ShieldCheck },
          { fr: 'Marketing & diaspora', en: 'Marketing & diaspora', icon: Globe },
        ].map((c, i) => (
          <Card key={i} className="p-6 border text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary/10 text-primary grid place-items-center"><c.icon className="h-6 w-6" /></div>
            <div className="font-semibold">{lang === 'fr' ? c.fr : c.en}</div>
          </Card>
        ))}
      </div>
      <Card className="p-6 border">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder={t('full_name')} />
          <Input placeholder={lang === 'fr' ? "Nom de l'établissement" : 'Property name'} />
          <Input placeholder={t('email')} />
          <Input placeholder={t('phone')} />
        </div>
        <Button className="mt-4 gap-2" onClick={() => toast.success(lang === 'fr' ? 'Merci ! Un agent YABISO vous contactera.' : 'Thank you! A YABISO agent will contact you.')}>{t('partner_cta')}<ArrowRight className="h-4 w-4" /></Button>
      </Card>
    </main>
  )

  /* ----------------------------- Footer ----------------------------- */
  const Footer = () => (
    <footer className="border-t bg-muted/30 mt-10">
      <div className="container py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="text-lg font-extrabold">YABISO<span className="text-[#F4B400]"> HOTELS</span></div>
          <p className="text-sm text-muted-foreground mt-2">Réservez • Séjournez • Découvrez l'Afrique</p>
          <p className="text-xs text-muted-foreground mt-3">Powered by BissaGlobal Services</p>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm">YABISO</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><button onClick={() => goto('partner')} className="hover:text-primary">{t('nav_partner')}</button></li>
            <li><button onClick={() => goto('search')} className="hover:text-primary">{t('nav_destinations')}</button></li>
            <li><span className="opacity-60">YABISO Flights · Taxi · Tours (bientôt)</span></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm">RD Congo · 26 Provinces</div>
          <p className="text-sm text-muted-foreground">Kinshasa, Nord-Kivu, Sud-Kivu, Haut-Katanga, Kongo Central, Tshopo, Équateur, Lualaba, Kasaï...</p>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm">Support</div>
          <a href="https://wa.me/243990000000" target="_blank" rel="noreferrer"><Button variant="outline" size="sm" className="gap-2 border-green-500 text-green-600"><Phone className="h-4 w-4" />WhatsApp</Button></a>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} YABISO HOTELS — AFRICA BOOKS WITH CONFIDENCE.</div>
    </footer>
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      {view === 'home' && <Home />}
      {view === 'search' && <SearchView />}
      {view === 'hotel' && <HotelView />}
      {view === 'booking' && <BookingView />}
      {view === 'confirmation' && <ConfirmationView />}
      {view === 'partner' && <PartnerView />}
      <Footer />
    </div>
  )
}

export default App

'use client'

import { LOGO_LIGHT, LOGO_DARK } from './brandLogos'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import {
  Wifi, Waves, Utensils, Car, Snowflake, Sparkles, Dumbbell, Wine, Plane, Coffee,
  Star, MapPin, Search, Heart, Moon, Sun, Check, ShieldCheck, Phone, Calendar as CalIcon,
  Users, Globe, ArrowRight, BadgeCheck, CheckCircle2, CreditCard, Building2, Quote, Menu, X,
  Plus, Trash2, Camera, Locate, ClipboardList, LayoutDashboard, LogOut, Activity, Image as ImageIcon, Loader2, UserCog,
  User, LogIn, Shield, Settings as SettingsIcon, BarChart3, Wallet, CalendarCheck, Gift, Megaphone, PartyPopper,
  Home, BedDouble, Compass, Bus, KeyRound, Volume2, VolumeX, Briefcase, ExternalLink,
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

const CURRENCIES = ['CDF', 'USD', 'EUR', 'GBP', 'XAF']
const SYMBOLS = { CDF: 'FC', USD: '$', EUR: '€', GBP: '£', XAF: 'FCFA' }

const STAY_CATS = [
  { key: '', icon: Sparkles, fr: 'Tous', en: 'All' },
  { key: 'hotel', icon: Building2, fr: 'Hôtels', en: 'Hotels' },
  { key: 'apartment', icon: Home, fr: 'Appartements', en: 'Apartments' },
  { key: 'vacation_home', icon: KeyRound, fr: 'Maisons de vacances', en: 'Vacation homes' },
  { key: 'short_stay', icon: BedDouble, fr: 'Courte durée', en: 'Short stays' },
]
const SERVICE_VERTICALS = [
  { type: 'excursion', icon: Compass, fr: 'Excursions', en: 'Tours' },
  { type: 'transfer', icon: Bus, fr: 'Transferts aéroport', en: 'Airport transfers' },
  { type: 'taxi', icon: Car, fr: 'Taxis', en: 'Taxis' },
  { type: 'car_rental', icon: KeyRound, fr: 'Location de voitures', en: 'Car rental' },
]
const SERVICES_SOON = [
  { icon: Plane, fr: 'Vols', en: 'Flights' },
  { icon: ShieldCheck, fr: 'Assurances voyage', en: 'Travel insurance' },
]
const CAT_LABELS = {
  fr: { hotel: 'Hôtel', apartment: 'Appartement', vacation_home: 'Maison de vacances', short_stay: 'Courte durée' },
  en: { hotel: 'Hotel', apartment: 'Apartment', vacation_home: 'Vacation home', short_stay: 'Short stay' },
}
const AD_VIDEOS = [
  'https://customer-assets.emergentagent.com/job_yabiso-hotels/artifacts/j3b804du_GENERATE_VIDEO.mp4',
  'https://customer-assets.emergentagent.com/job_yabiso-hotels/artifacts/q8cme1qk_Create_a_premium_second_cin.mp4',
  'https://customer-assets.emergentagent.com/job_yabiso-hotels/artifacts/e7kn0lpx_PROMPT_GEMINI_VEO_Cr%C3%A9er_une_vi.mp4',
  'https://customer-assets.emergentagent.com/job_yabiso-hotels/artifacts/l0h6gidp_mp4.mp4',
]
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

/* ----------------------------- Agent module data ----------------------------- */
const DRC_PROVINCES = [
  'Kinshasa', 'Kongo Central', 'Kwango', 'Kwilu', 'Mai-Ndombe', 'Kasaï', 'Kasaï Central', 'Kasaï Oriental',
  'Lomami', 'Sankuru', 'Maniema', 'Nord-Kivu', 'Sud-Kivu', 'Ituri', 'Haut-Uélé', 'Bas-Uélé', 'Tshopo',
  'Mongala', 'Nord-Ubangi', 'Sud-Ubangi', 'Équateur', 'Tshuapa', 'Tanganyika', 'Haut-Lomami', 'Lualaba', 'Haut-Katanga',
]
const REGIONS = ['Afrique Centrale', "Afrique de l'Est", "Afrique de l'Ouest", 'Afrique Australe', 'Îles Africaines']
const TYPE_KEYS = ['hotel', 'apartment', 'villa', 'resort', 'lodge', 'guesthouse', 'residence']

const AT = {
  fr: {
    space: 'Espace Agent YABISO', login_sub: 'Connectez-vous pour gérer vos propriétés sur le terrain.',
    name: 'Nom complet', email: 'Email', zone: 'Zone', login: 'Accéder à mon espace',
    welcome: 'Bonjour', logout: 'Déconnexion', overview: "Vue d'ensemble", my_props: 'Mes propriétés',
    add_prop: 'Ajouter une propriété', activity: "Rapports d'activité",
    s_props: 'Propriétés', s_verified: 'Vérifiées', s_rooms: 'Chambres', s_acts: 'Activités',
    no_props: "Aucune propriété pour le moment. Ajoutez votre première propriété !",
    verified: 'Vérifié par YABISO', not_verified: 'Non vérifié', verify_gps: 'Vérifier (GPS)',
    add_room: 'Ajouter une chambre', room_name: 'Nom de la chambre', price_cdf: 'Prix / nuit (CDF)',
    capacity: 'Capacité', beds: 'Lits', save: 'Enregistrer', cancel: 'Annuler',
    prop_name: "Nom de l'établissement", type: 'Type', country: 'Pays', province: 'Province / Région', city: 'Ville',
    region_zone: 'Zone Afrique', description: 'Description', amenities: 'Équipements',
    gps: 'Localisation GPS', capture_gps: 'Capturer ma position GPS', lat: 'Latitude', lng: 'Longitude',
    photos: 'Photos', upload: 'Télécharger des photos', add_url: 'Ajouter par URL', rooms: 'Chambres',
    add_room_row: 'Ajouter une chambre', create: 'Créer la propriété', creating: 'Création...',
    no_acts: 'Aucune activité enregistrée.', verified_done: 'Propriété vérifiée !',
    created_done: 'Propriété créée avec succès !', back_site: 'Retour au site',
    import_tab: 'Importer (Google)', import_title: 'Importer de vrais hôtels via Google Places',
    import_sub: 'Récupérez automatiquement les hôtels publics de la RDC avec photos et adresses réelles.',
    import_btn: 'Importer depuis Google', importing: 'Import en cours...', max_results: 'Nombre max',
    quick: 'Import rapide — grandes villes RDC', go_site: 'Voir sur le site',
    imported_label: 'importés', updated_label: 'mis à jour', fetched_label: 'trouvés',
  },
  en: {
    space: 'YABISO Agent Space', login_sub: 'Log in to manage your properties in the field.',
    name: 'Full name', email: 'Email', zone: 'Zone', login: 'Enter my space',
    welcome: 'Hello', logout: 'Logout', overview: 'Overview', my_props: 'My properties',
    add_prop: 'Add a property', activity: 'Field activity reports',
    s_props: 'Properties', s_verified: 'Verified', s_rooms: 'Rooms', s_acts: 'Activities',
    no_props: 'No property yet. Add your first property!',
    verified: 'Verified by YABISO', not_verified: 'Not verified', verify_gps: 'Verify (GPS)',
    add_room: 'Add a room', room_name: 'Room name', price_cdf: 'Price / night (CDF)',
    capacity: 'Capacity', beds: 'Beds', save: 'Save', cancel: 'Cancel',
    prop_name: 'Property name', type: 'Type', country: 'Country', province: 'Province / Region', city: 'City',
    region_zone: 'Africa zone', description: 'Description', amenities: 'Amenities',
    gps: 'GPS location', capture_gps: 'Capture my GPS position', lat: 'Latitude', lng: 'Longitude',
    photos: 'Photos', upload: 'Upload photos', add_url: 'Add by URL', rooms: 'Rooms',
    add_room_row: 'Add a room', create: 'Create property', creating: 'Creating...',
    no_acts: 'No activity recorded.', verified_done: 'Property verified!',
    created_done: 'Property created successfully!', back_site: 'Back to site',
    import_tab: 'Import (Google)', import_title: 'Import real hotels via Google Places',
    import_sub: 'Automatically fetch public DRC hotels with real photos and addresses.',
    import_btn: 'Import from Google', importing: 'Importing...', max_results: 'Max results',
    quick: 'Quick import — major DRC cities', go_site: 'View on site',
    imported_label: 'imported', updated_label: 'updated', fetched_label: 'found',
  },
}

const ACT_LABEL = {
  agent_registered: { fr: 'Inscription agent', en: 'Agent registered', icon: UserCog },
  property_created: { fr: 'Propriété créée', en: 'Property created', icon: Plus },
  property_verified: { fr: 'Propriété vérifiée', en: 'Property verified', icon: ShieldCheck },
  property_updated: { fr: 'Propriété mise à jour', en: 'Property updated', icon: Building2 },
}

function resizeImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const max = 1000
        let { width, height } = img
        if (width > max) { height = Math.round(height * (max / width)); width = max }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}
const fmtCDF = (n) => (n || 0).toLocaleString('fr-FR') + ' FC'

/* ----------------------------- Agent Module ----------------------------- */
function AgentModule({ lang, onBack }) {
  const at = (k) => AT[lang][k]
  const typeLabel = (ty) => T[lang].types[ty] || ty
  const [agent, setAgent] = useState(null)
  const [tab, setTab] = useState('overview')
  const [loginForm, setLoginForm] = useState({ name: '', email: '', zone: 'Kinshasa' })
  const [busy, setBusy] = useState(false)
  const [stats, setStats] = useState({ properties: 0, verified: 0, rooms: 0, activities: 0 })
  const [props, setProps] = useState([])
  const [acts, setActs] = useState([])

  useEffect(() => {
    try { const s = localStorage.getItem('yabiso_agent'); if (s) setAgent(JSON.parse(s)) } catch (e) {}
  }, [])

  const refresh = useCallback(async (id) => {
    try {
      const [s, h, a] = await Promise.all([
        fetch('/api/agents/' + id + '/stats').then((r) => r.json()),
        fetch('/api/agents/' + id + '/hotels').then((r) => r.json()),
        fetch('/api/agents/' + id + '/activities').then((r) => r.json()),
      ])
      setStats(s); setProps(Array.isArray(h) ? h : []); setActs(Array.isArray(a) ? a : [])
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => { if (agent) refresh(agent.id) }, [agent, refresh])

  const doLogin = async () => {
    if (!loginForm.name || !loginForm.email) { toast.error(lang === 'fr' ? 'Nom et email requis' : 'Name and email required'); return }
    setBusy(true)
    try {
      const r = await fetch('/api/agents/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) })
      const a = await r.json()
      if (a.error) throw new Error(a.error)
      setAgent(a); localStorage.setItem('yabiso_agent', JSON.stringify(a))
    } catch (e) { toast.error(String(e.message || e)) } finally { setBusy(false) }
  }
  const logout = () => { localStorage.removeItem('yabiso_agent'); setAgent(null) }

  const verifyProp = (h) => {
    const send = (lat, lng) => {
      fetch('/api/hotels/' + h.id + '/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ agentId: agent.id, lat, lng }) })
        .then((r) => r.json()).then(() => { toast.success(at('verified_done')); refresh(agent.id) })
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => send(pos.coords.latitude, pos.coords.longitude),
        () => { toast.message(lang === 'fr' ? 'GPS indisponible, vérification avec coordonnées connues' : 'GPS unavailable, verifying with known coords'); send(h.lat, h.lng) },
        { timeout: 8000 }
      )
    } else { send(h.lat, h.lng) }
  }

  /* ---- Login screen ---- */
  if (!agent) {
    return (
      <main className="container py-16 max-w-md">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-primary mb-6 flex items-center gap-1"><ArrowRight className="h-3.5 w-3.5 rotate-180" />{at('back_site')}</button>
        <Card className="p-8 border">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-primary text-primary-foreground grid place-items-center"><UserCog className="h-7 w-7" /></div>
            <h1 className="text-2xl font-extrabold">{at('space')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{at('login_sub')}</p>
          </div>
          <div className="space-y-3">
            <div><Label>{at('name')}</Label><Input value={loginForm.name} onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })} className="mt-1" /></div>
            <div><Label>{at('email')}</Label><Input type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="mt-1" /></div>
            <div><Label>{at('zone')}</Label>
              <Select value={loginForm.zone} onValueChange={(v) => setLoginForm({ ...loginForm, zone: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">{DRC_PROVINCES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={doLogin} disabled={busy} className="w-full h-11 font-semibold gap-2">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCog className="h-4 w-4" />}{at('login')}</Button>
          </div>
        </Card>
      </main>
    )
  }

  /* ---- Dashboard ---- */
  return (
    <main className="container py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2"><LayoutDashboard className="h-7 w-7 text-primary" />{at('space')}</h1>
          <p className="text-muted-foreground text-sm">{at('welcome')} {agent.name} · {agent.code} · {agent.zone}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack} className="gap-1"><Globe className="h-4 w-4" />{at('back_site')}</Button>
          <Button variant="outline" onClick={logout} className="gap-1"><LogOut className="h-4 w-4" />{at('logout')}</Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="overview" className="gap-1"><LayoutDashboard className="h-4 w-4" />{at('overview')}</TabsTrigger>
          <TabsTrigger value="properties" className="gap-1"><Building2 className="h-4 w-4" />{at('my_props')}</TabsTrigger>
          <TabsTrigger value="add" className="gap-1"><Plus className="h-4 w-4" />{at('add_prop')}</TabsTrigger>
          <TabsTrigger value="import" className="gap-1"><Globe className="h-4 w-4" />{at('import_tab')}</TabsTrigger>
          <TabsTrigger value="activity" className="gap-1"><ClipboardList className="h-4 w-4" />{at('activity')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { l: at('s_props'), v: stats.properties, i: Building2 },
              { l: at('s_verified'), v: stats.verified, i: ShieldCheck },
              { l: at('s_rooms'), v: stats.rooms, i: LayoutDashboard },
              { l: at('s_acts'), v: stats.activities, i: Activity },
            ].map((c, i) => (
              <Card key={i} className="p-5 border">
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-extrabold text-primary">{c.v}</div>
                  <c.i className="h-8 w-8 text-primary/30" />
                </div>
                <div className="text-sm text-muted-foreground mt-1">{c.l}</div>
              </Card>
            ))}
          </div>
          <Card className="p-6 border mt-6">
            <h3 className="font-bold mb-2">YABISO Field Agent</h3>
            <p className="text-sm text-muted-foreground">{lang === 'fr' ? "En tant qu'agent terrain, vous visitez les hôtels, prenez les photos, vérifiez la localisation GPS et créez les comptes. Les propriétés vérifiées reçoivent le badge \u00ab Vérifié par YABISO \u00bb." : 'As a field agent, you visit hotels, take photos, verify GPS location and create accounts. Verified properties receive the "Verified by YABISO" badge.'}</p>
          </Card>
        </TabsContent>

        <TabsContent value="properties">
          {props.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">{at('no_props')}</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {props.map((h) => <AgentPropertyCard key={h.id} h={h} lang={lang} at={at} typeLabel={typeLabel} onVerify={() => verifyProp(h)} onRoomAdded={() => refresh(agent.id)} agentId={agent.id} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add">
          <AddPropertyForm lang={lang} at={at} typeLabel={typeLabel} agentId={agent.id} onCreated={() => { toast.success(at('created_done')); refresh(agent.id); setTab('properties') }} />
        </TabsContent>

        <TabsContent value="import">
          <ImportPanel lang={lang} at={at} agentId={agent.id} onImported={() => refresh(agent.id)} />
        </TabsContent>

        <TabsContent value="activity">
          {acts.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">{at('no_acts')}</div>
          ) : (
            <div className="space-y-3">
              {acts.map((a) => { const meta = ACT_LABEL[a.type] || { fr: a.type, en: a.type, icon: Activity }; const Ic = meta.icon; return (
                <Card key={a.id} className="p-4 border flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0"><Ic className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{a.detail}</div>
                    <div className="text-xs text-muted-foreground">{meta[lang]} · {new Date(a.createdAt).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB')}</div>
                  </div>
                  {a.meta && a.meta.lat ? <Badge variant="outline" className="gap-1 text-xs"><MapPin className="h-3 w-3" />{Number(a.meta.lat).toFixed(3)}, {Number(a.meta.lng).toFixed(3)}</Badge> : null}
                </Card>
              ) })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}

/* ---- Agent property card (with add-room) ---- */
function AgentPropertyCard({ h, lang, at, typeLabel, onVerify, onRoomAdded, agentId }) {
  const [open, setOpen] = useState(false)
  const [room, setRoom] = useState({ name: '', priceCDF: '', capacity: 2, beds: '' })
  const [busy, setBusy] = useState(false)
  const addRoom = async () => {
    if (!room.name || !room.priceCDF) { toast.error(lang === 'fr' ? 'Nom et prix requis' : 'Name and price required'); return }
    setBusy(true)
    try {
      const rooms = [...(h.rooms || []), { name: room.name, priceCDF: parseInt(room.priceCDF), capacity: parseInt(room.capacity) || 2, beds: room.beds || '1 lit double' }]
      await fetch('/api/hotels/' + h.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rooms, agentId }) })
      setRoom({ name: '', priceCDF: '', capacity: 2, beds: '' }); setOpen(false); onRoomAdded()
      toast.success(lang === 'fr' ? 'Chambre ajoutée' : 'Room added')
    } catch (e) { toast.error(String(e)) } finally { setBusy(false) }
  }
  return (
    <Card className="border overflow-hidden">
      <div className="flex">
        <img src={h.images[0]} alt="" className="h-32 w-32 object-cover shrink-0" />
        <div className="p-4 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-bold leading-tight">{h.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{h.city}, {h.province}</div>
            </div>
            {h.verified
              ? <Badge className="bg-[#0057B8] text-white gap-1 hover:bg-[#0057B8] shrink-0"><BadgeCheck className="h-3 w-3" />{at('verified')}</Badge>
              : <Badge variant="outline" className="shrink-0 text-muted-foreground">{at('not_verified')}</Badge>}
          </div>
          <div className="text-xs text-muted-foreground mt-2">{typeLabel(h.type)} · {h.rooms?.length || 0} {at('rooms').toLowerCase()} · {fmtCDF(h.priceCDF)}</div>
          <div className="flex gap-2 mt-3">
            {!h.verified && <Button size="sm" className="gap-1 h-8" onClick={onVerify}><Locate className="h-3.5 w-3.5" />{at('verify_gps')}</Button>}
            <Button size="sm" variant="outline" className="gap-1 h-8" onClick={() => setOpen((o) => !o)}><Plus className="h-3.5 w-3.5" />{at('add_room')}</Button>
          </div>
        </div>
      </div>
      {open && (
        <div className="border-t p-4 bg-muted/30 grid gap-2 sm:grid-cols-2">
          <Input placeholder={at('room_name')} value={room.name} onChange={(e) => setRoom({ ...room, name: e.target.value })} />
          <Input type="number" placeholder={at('price_cdf')} value={room.priceCDF} onChange={(e) => setRoom({ ...room, priceCDF: e.target.value })} />
          <Input type="number" placeholder={at('capacity')} value={room.capacity} onChange={(e) => setRoom({ ...room, capacity: e.target.value })} />
          <Input placeholder={at('beds')} value={room.beds} onChange={(e) => setRoom({ ...room, beds: e.target.value })} />
          <div className="sm:col-span-2 flex gap-2">
            <Button size="sm" onClick={addRoom} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : at('save')}</Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>{at('cancel')}</Button>
          </div>
        </div>
      )}
    </Card>
  )
}

/* ---- Add property form ---- */
function AddPropertyForm({ lang, at, typeLabel, agentId, onCreated }) {
  const [f, setF] = useState({ name: '', type: 'hotel', country: 'RD Congo', province: 'Kinshasa', city: '', region: 'Afrique Centrale', description: '' })
  const [amenities, setAmenities] = useState([])
  const [rooms, setRooms] = useState([{ name: 'Chambre Standard', priceCDF: '120000', capacity: 2, beds: '1 lit double' }])
  const [images, setImages] = useState([])
  const [urlInput, setUrlInput] = useState('')
  const [coords, setCoords] = useState({ lat: '', lng: '' })
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)

  const toggleAm = (k) => setAmenities((a) => a.includes(k) ? a.filter((x) => x !== k) : [...a, k])
  const captureGps = () => {
    if (!navigator.geolocation) { toast.error('GPS indisponible'); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }); toast.success(lang === 'fr' ? 'Position capturée' : 'Position captured') },
      () => toast.error(lang === 'fr' ? "Impossible d'obtenir la position. Saisissez manuellement." : 'Unable to get position. Enter manually.'),
      { timeout: 8000 }
    )
  }
  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 6)
    if (!files.length) return
    setUploading(true)
    try { const data = await Promise.all(files.map(resizeImage)); setImages((im) => [...im, ...data]) } catch (err) { toast.error(String(err)) } finally { setUploading(false) }
  }
  const addUrl = () => { if (urlInput.trim()) { setImages((im) => [...im, urlInput.trim()]); setUrlInput('') } }
  const setRoom = (i, key, val) => setRooms((rs) => rs.map((r, idx) => idx === i ? { ...r, [key]: val } : r))
  const addRoomRow = () => setRooms((rs) => [...rs, { name: '', priceCDF: '', capacity: 2, beds: '' }])
  const rmRoom = (i) => setRooms((rs) => rs.filter((_, idx) => idx !== i))

  const submit = async () => {
    if (!f.name || !f.city) { toast.error(lang === 'fr' ? "Nom et ville requis" : 'Name and city required'); return }
    setBusy(true)
    try {
      const body = { ...f, agentId, amenities, images, lat: coords.lat, lng: coords.lng, rooms: rooms.map((r) => ({ ...r, priceCDF: parseInt(r.priceCDF) || 0 })) }
      const r = await fetch('/api/hotels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await r.json()
      if (data.error) throw new Error(data.error)
      setF({ name: '', type: 'hotel', country: 'RD Congo', province: 'Kinshasa', city: '', region: 'Afrique Centrale', description: '' })
      setAmenities([]); setImages([]); setCoords({ lat: '', lng: '' }); setRooms([{ name: 'Chambre Standard', priceCDF: '120000', capacity: 2, beds: '1 lit double' }])
      onCreated()
    } catch (e) { toast.error(String(e.message || e)) } finally { setBusy(false) }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-5 border">
          <h3 className="font-bold mb-3">{at('add_prop')}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>{at('prop_name')}</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="mt-1" /></div>
            <div><Label>{at('type')}</Label>
              <Select value={f.type} onValueChange={(v) => setF({ ...f, type: v })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{TYPE_KEYS.map((k) => <SelectItem key={k} value={k}>{typeLabel(k)}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><Label>{at('region_zone')}</Label>
              <Select value={f.region} onValueChange={(v) => setF({ ...f, region: v })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{REGIONS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><Label>{at('country')}</Label><Input value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} className="mt-1" /></div>
            <div><Label>{at('province')}</Label>
              {f.country === 'RD Congo'
                ? <Select value={f.province} onValueChange={(v) => setF({ ...f, province: v })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent className="max-h-60">{DRC_PROVINCES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
                : <Input value={f.province} onChange={(e) => setF({ ...f, province: e.target.value })} className="mt-1" />}
            </div>
            <div className="sm:col-span-2"><Label>{at('city')}</Label><Input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} className="mt-1" /></div>
            <div className="sm:col-span-2"><Label>{at('description')}</Label><Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="mt-1" rows={3} /></div>
          </div>
        </Card>

        <Card className="p-5 border">
          <h3 className="font-bold mb-3">{at('amenities')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(AMENITIES).map(([k, m]) => (
              <label key={k} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={amenities.includes(k)} onCheckedChange={() => toggleAm(k)} />
                <m.icon className="h-4 w-4 text-primary" />{m[lang]}
              </label>
            ))}
          </div>
        </Card>

        <Card className="p-5 border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">{at('rooms')}</h3>
            <Button size="sm" variant="outline" onClick={addRoomRow} className="gap-1"><Plus className="h-3.5 w-3.5" />{at('add_room_row')}</Button>
          </div>
          <div className="space-y-3">
            {rooms.map((r, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-12 items-end border rounded-lg p-3">
                <div className="sm:col-span-4"><Label className="text-xs">{at('room_name')}</Label><Input value={r.name} onChange={(e) => setRoom(i, 'name', e.target.value)} className="mt-1 h-9" /></div>
                <div className="sm:col-span-3"><Label className="text-xs">{at('price_cdf')}</Label><Input type="number" value={r.priceCDF} onChange={(e) => setRoom(i, 'priceCDF', e.target.value)} className="mt-1 h-9" /></div>
                <div className="sm:col-span-2"><Label className="text-xs">{at('capacity')}</Label><Input type="number" value={r.capacity} onChange={(e) => setRoom(i, 'capacity', e.target.value)} className="mt-1 h-9" /></div>
                <div className="sm:col-span-2"><Label className="text-xs">{at('beds')}</Label><Input value={r.beds} onChange={(e) => setRoom(i, 'beds', e.target.value)} className="mt-1 h-9" /></div>
                <div className="sm:col-span-1">{rooms.length > 1 && <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => rmRoom(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card className="p-5 border">
          <h3 className="font-bold mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{at('gps')}</h3>
          <Button variant="outline" className="w-full gap-2 mb-3" onClick={captureGps}><Locate className="h-4 w-4" />{at('capture_gps')}</Button>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">{at('lat')}</Label><Input value={coords.lat} onChange={(e) => setCoords({ ...coords, lat: e.target.value })} className="mt-1 h-9" /></div>
            <div><Label className="text-xs">{at('lng')}</Label><Input value={coords.lng} onChange={(e) => setCoords({ ...coords, lng: e.target.value })} className="mt-1 h-9" /></div>
          </div>
        </Card>

        <Card className="p-5 border">
          <h3 className="font-bold mb-3 flex items-center gap-2"><Camera className="h-4 w-4 text-primary" />{at('photos')}</h3>
          <label className="block">
            <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/40 transition">
              {uploading ? <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" /> : <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground" />}
              <div className="text-sm text-muted-foreground mt-1">{at('upload')}</div>
            </div>
            <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
          </label>
          <div className="flex gap-2 mt-3">
            <Input placeholder="https://..." value={urlInput} onChange={(e) => setUrlInput(e.target.value)} className="h-9" />
            <Button size="sm" variant="outline" onClick={addUrl}>{at('add_url')}</Button>
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {images.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} alt="" className="h-16 w-full object-cover rounded" />
                  <button onClick={() => setImages((im) => im.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/60 text-white grid place-items-center opacity-0 group-hover:opacity-100"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Button onClick={submit} disabled={busy} className="w-full h-11 font-semibold gap-2">{busy ? <><Loader2 className="h-4 w-4 animate-spin" />{at('creating')}</> : <><Plus className="h-4 w-4" />{at('create')}</>}</Button>
      </div>
    </div>
  )
}

/* ---- Import real hotels (Google Places) ---- */
const DRC_QUICK = [
  { city: 'Kinshasa', province: 'Kinshasa' }, { city: 'Goma', province: 'Nord-Kivu' },
  { city: 'Lubumbashi', province: 'Haut-Katanga' }, { city: 'Bukavu', province: 'Sud-Kivu' },
  { city: 'Kisangani', province: 'Tshopo' }, { city: 'Matadi', province: 'Kongo Central' },
]
function ImportPanel({ lang, at, agentId, onImported }) {
  const [country, setCountry] = useState('RD Congo')
  const [province, setProvince] = useState('Kinshasa')
  const [city, setCity] = useState('Kinshasa')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [result, setResult] = useState(null)

  const runImport = async (c, p) => {
    const cityName = (c || city).trim()
    if (!cityName) { toast.error(lang === 'fr' ? 'Ville requise' : 'City required'); return null }
    const body = { city: cityName, province: p || province, country, region: country === 'RD Congo' ? 'Afrique Centrale' : '', agentId, max: 20 }
    const r = await fetch('/api/import/hotels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await r.json()
    if (data.error) throw new Error(data.error)
    return data
  }

  const doSingle = async () => {
    setBusy(true); setResult(null); setProgress('')
    try {
      const data = await runImport()
      setResult(data); onImported()
      toast.success(lang === 'fr' ? `${data.imported} importés, ${data.updated} mis à jour` : `${data.imported} imported, ${data.updated} updated`)
    } catch (e) { toast.error(String(e.message || e)) } finally { setBusy(false) }
  }

  const doQuick = async () => {
    setBusy(true); setResult(null)
    let totalImp = 0, totalUpd = 0, all = []
    try {
      for (const q of DRC_QUICK) {
        setProgress(q.city + '...')
        const data = await runImport(q.city, q.province)
        totalImp += data.imported; totalUpd += data.updated; all = all.concat(data.hotels || [])
      }
      setResult({ city: 'RDC', fetched: all.length, imported: totalImp, updated: totalUpd, hotels: all })
      onImported()
      toast.success(lang === 'fr' ? `${totalImp} importés au total` : `${totalImp} imported in total`)
    } catch (e) { toast.error(String(e.message || e)) } finally { setBusy(false); setProgress('') }
  }

  return (
    <div className="space-y-6">
      <Card className="p-5 border">
        <h3 className="font-bold flex items-center gap-2"><Globe className="h-5 w-5 text-primary" />{at('import_title')}</h3>
        <p className="text-sm text-muted-foreground mt-1">{at('import_sub')}</p>
        <div className="grid gap-3 sm:grid-cols-3 mt-4">
          <div><Label>{lang === 'fr' ? 'Pays' : 'Country'}</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1" /></div>
          <div><Label>{lang === 'fr' ? 'Province' : 'Province'}</Label>
            {country === 'RD Congo'
              ? <Select value={province} onValueChange={setProvince}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent className="max-h-60">{DRC_PROVINCES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
              : <Input value={province} onChange={(e) => setProvince(e.target.value)} className="mt-1" />}
          </div>
          <div><Label>{lang === 'fr' ? 'Ville' : 'City'}</Label><Input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1" /></div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button onClick={doSingle} disabled={busy} className="gap-2">{busy && !progress ? <><Loader2 className="h-4 w-4 animate-spin" />{at('importing')}</> : <><Globe className="h-4 w-4" />{at('import_btn')}</>}</Button>
          <Button onClick={doQuick} disabled={busy} variant="outline" className="gap-2">{busy && progress ? <><Loader2 className="h-4 w-4 animate-spin" />{progress}</> : <><Sparkles className="h-4 w-4" />{at('quick')}</>}</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">{lang === 'fr' ? 'Données réelles via Google Places (nom, adresse, GPS, note, photos). Les prix sont estimés et modifiables.' : 'Real data via Google Places (name, address, GPS, rating, photos). Prices are estimated and editable.'}</p>
      </Card>

      {result && (
        <Card className="p-5 border">
          <div className="flex flex-wrap gap-4 mb-4">
            <Badge className="bg-primary text-primary-foreground">{result.imported} {at('imported_label')}</Badge>
            <Badge variant="secondary">{result.updated} {at('updated_label')}</Badge>
            <Badge variant="outline">{result.fetched} {at('fetched_label')}</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(result.hotels || []).slice(0, 24).map((h, i) => (
              <div key={h.id || i} className="rounded-xl border overflow-hidden">
                <img src={h.images[0]} alt={h.name} className="h-32 w-full object-cover bg-muted" loading="lazy" />
                <div className="p-3">
                  <div className="font-semibold text-sm leading-tight line-clamp-1">{h.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{h.address}</div>
                  <div className="flex items-center gap-1 text-xs mt-1"><Star className="h-3 w-3 fill-[#F4B400] text-[#F4B400]" />{h.rating || '—'} · {h.reviewCount || 0} avis</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

/* ---- Auth dialog (login/register) ---- */
function AuthDialog({ open, onOpenChange, lang, onSuccess }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    if (!form.email || !form.password || (mode === 'register' && !form.name)) { toast.error(lang === 'fr' ? 'Champs requis manquants' : 'Missing required fields'); return }
    setBusy(true)
    try {
      const r = await fetch('/api/auth/' + mode, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await r.json()
      if (data.error) throw new Error(data.error)
      onSuccess(data)
      setForm({ name: '', email: '', password: '' })
    } catch (e) { toast.error(String(e.message || e)) } finally { setBusy(false) }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-extrabold">Y</div>{mode === 'login' ? (lang === 'fr' ? 'Connexion' : 'Sign in') : (lang === 'fr' ? 'Créer un compte' : 'Create account')}</DialogTitle>
        </DialogHeader>
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="login">{lang === 'fr' ? 'Connexion' : 'Login'}</TabsTrigger>
            <TabsTrigger value="register">{lang === 'fr' ? 'Inscription' : 'Register'}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="space-y-3">
          {mode === 'register' && <div><Label>{lang === 'fr' ? 'Nom complet' : 'Full name'}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>}
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" onKeyDown={(e) => e.key === 'Enter' && submit()} /></div>
          <div><Label>{lang === 'fr' ? 'Mot de passe' : 'Password'}</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1" onKeyDown={(e) => e.key === 'Enter' && submit()} /></div>
          <Button onClick={submit} disabled={busy} className="w-full h-11 font-semibold gap-2">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}{mode === 'login' ? (lang === 'fr' ? 'Se connecter' : 'Sign in') : (lang === 'fr' ? 'Créer mon compte' : 'Create account')}</Button>
          <p className="text-xs text-muted-foreground text-center">{lang === 'fr' ? 'Astuce admin : admin@yabiso.com / yabiso2025' : 'Admin tip: admin@yabiso.com / yabiso2025'}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ---- Add review form ---- */
function AddReviewForm({ lang, hotelId, user, onDone }) {
  const [rating, setRating] = useState(5)
  const [author, setAuthor] = useState(user ? user.name : '')
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    if (!author || !comment) { toast.error(lang === 'fr' ? 'Nom et commentaire requis' : 'Name and comment required'); return }
    setBusy(true)
    try {
      const r = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hotelId, author, rating, comment }) })
      const d = await r.json(); if (d.error) throw new Error(d.error)
      setComment(''); toast.success(lang === 'fr' ? 'Merci pour votre avis !' : 'Thanks for your review!'); onDone()
    } catch (e) { toast.error(String(e.message || e)) } finally { setBusy(false) }
  }
  return (
    <Card className="p-4 border bg-muted/30">
      <div className="font-semibold text-sm mb-2">{lang === 'fr' ? 'Laisser un avis' : 'Leave a review'}</div>
      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)}><Star className={`h-5 w-5 ${n <= rating ? 'fill-[#F4B400] text-[#F4B400]' : 'text-muted-foreground'}`} /></button>
        ))}
      </div>
      {!user && <Input placeholder={lang === 'fr' ? 'Votre nom' : 'Your name'} value={author} onChange={(e) => setAuthor(e.target.value)} className="mb-2" />}
      <Textarea placeholder={lang === 'fr' ? 'Partagez votre expérience...' : 'Share your experience...'} value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
      <Button size="sm" className="mt-2 gap-1" onClick={submit} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{lang === 'fr' ? 'Publier' : 'Publish'}</Button>
    </Card>
  )
}

/* ---- Account view (favorites + my bookings) ---- */
function AccountView({ lang, user, token, bookings, hotels, favorites, fmt, onOpenHotel, onLogin, onRefresh }) {
  const cancelBooking = async (b) => {
    if (!confirm(lang === 'fr' ? 'Annuler cette réservation ?' : 'Cancel this booking?')) return
    try {
      const r = await fetch('/api/bookings/' + b.reference + '/cancel', { method: 'POST', headers: { Authorization: 'Bearer ' + token } })
      const d = await r.json(); if (d.error) throw new Error(d.error)
      toast.success(d.status === 'refunded' ? (lang === 'fr' ? 'Annulée — remboursement en cours' : 'Cancelled — refund in progress') : (lang === 'fr' ? 'Réservation annulée' : 'Booking cancelled'))
      onRefresh && onRefresh()
    } catch (e) { toast.error(String(e.message || e)) }
  }
  if (!user) {
    return <main className="container py-20 text-center"><p className="text-muted-foreground mb-4">{lang === 'fr' ? 'Connectez-vous pour voir votre compte.' : 'Sign in to view your account.'}</p><Button onClick={onLogin} className="gap-2"><LogIn className="h-4 w-4" />{lang === 'fr' ? 'Connexion' : 'Sign in'}</Button></main>
  }
  const favHotels = hotels.filter((h) => (favorites || []).includes(h.id))
  return (
    <main className="container py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-1">{lang === 'fr' ? 'Mon compte' : 'My account'}</h1>
      <p className="text-muted-foreground mb-6">{user.name} · {user.email}</p>
      <Tabs defaultValue="bookings">
        <TabsList className="mb-5">
          <TabsTrigger value="bookings" className="gap-1"><CalendarCheck className="h-4 w-4" />{lang === 'fr' ? 'Mes réservations' : 'My bookings'}</TabsTrigger>
          <TabsTrigger value="favs" className="gap-1"><Heart className="h-4 w-4" />{lang === 'fr' ? 'Favoris' : 'Favorites'}</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings">
          {(!bookings || bookings.length === 0) ? <div className="py-16 text-center text-muted-foreground">{lang === 'fr' ? 'Aucune réservation.' : 'No bookings yet.'}</div> : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <Card key={b.id} className="p-4 border flex items-center gap-4">
                  <img src={b.hotelImage} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="font-bold">{b.hotelName}</div>
                    <div className="text-sm text-muted-foreground">{b.roomName} · {b.checkIn} → {b.checkOut} · {b.nights} {lang === 'fr' ? 'nuits' : 'nights'}</div>
                    <div className="text-xs font-mono mt-0.5">{b.reference}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-primary">{SYMBOLS[b.currency]}{(b.totalDisplay || 0).toLocaleString('fr-FR')}{b.currency === 'CDF' ? ' FC' : ''}</div>
                    <Badge variant="secondary" className="mt-1 text-xs">{b.status}</Badge>
                    {!['cancelled', 'refunded', 'checkin_confirmed', 'hotel_paid'].includes(b.status) && (
                      <div><Button size="sm" variant="ghost" className="mt-1 h-7 text-destructive hover:text-destructive" onClick={() => cancelBooking(b)}>{lang === 'fr' ? 'Annuler' : 'Cancel'}</Button></div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="favs">
          {favHotels.length === 0 ? <div className="py-16 text-center text-muted-foreground">{lang === 'fr' ? 'Aucun favori.' : 'No favorites yet.'}</div> : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {favHotels.map((h) => (
                <Card key={h.id} className="border overflow-hidden cursor-pointer" onClick={() => onOpenHotel(h.id)}>
                  <img src={h.images[0]} alt="" className="h-36 w-full object-cover" />
                  <div className="p-3"><div className="font-semibold line-clamp-1">{h.name}</div><div className="text-xs text-muted-foreground">{h.city}</div><div className="text-primary font-bold mt-1">{fmt(h.priceCDF)}</div></div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}

/* ---- Admin dashboard ---- */
const ADMIN_STATUSES = ['pending_payment', 'payment_received', 'awaiting_hotel_confirmation', 'confirmed_by_hotel', 'customer_notified', 'checkin_confirmed', 'awaiting_payout', 'hotel_paid', 'cancelled', 'refunded']
function AdminDashboard({ lang, token, onBack }) {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [hotels, setHotels] = useState([])
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  const [agents, setAgents] = useState([])
  const [serviceReqs, setServiceReqs] = useState([])
  const [settings, setSettings] = useState({ rates: { USD: 2850, EUR: 3080, GBP: 3600, XAF: 4.7 }, fee: 0.07, commission: 0.3 })
  const H = { headers: { Authorization: 'Bearer ' + token } }
  const aFetch = (u, opts = {}) => fetch(u, { ...opts, headers: { ...(opts.headers || {}), Authorization: 'Bearer ' + token } })

  const refresh = useCallback(() => {
    aFetch('/api/admin/stats').then((r) => r.json()).then(setStats).catch(() => {})
    fetch('/api/hotels').then((r) => r.json()).then((d) => setHotels(Array.isArray(d) ? d : [])).catch(() => {})
    aFetch('/api/admin/bookings').then((r) => r.json()).then((d) => setBookings(Array.isArray(d) ? d : [])).catch(() => {})
    aFetch('/api/admin/users').then((r) => r.json()).then((d) => setUsers(Array.isArray(d) ? d : [])).catch(() => {})
    aFetch('/api/admin/agents').then((r) => r.json()).then((d) => setAgents(Array.isArray(d) ? d : [])).catch(() => {})
    aFetch('/api/service-requests').then((r) => r.json()).then((d) => setServiceReqs(Array.isArray(d) ? d : [])).catch(() => {})
    fetch('/api/settings/rates').then((r) => r.json()).then((s) => { if (s.rates) setSettings(s) }).catch(() => {})
  }, [token])
  useEffect(() => { refresh() }, [refresh])

  const setBookingStatus = (b, status) => aFetch('/api/admin/bookings/' + b.id + '/status', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(() => { toast.success('Statut mis à jour'); refresh() })
  const verifyPayment = (b, action) => aFetch('/api/admin/bookings/' + b.id + '/payment', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) }).then(() => { toast.success(action === 'approve' ? 'Paiement approuvé' : 'Paiement rejeté'); refresh() })
  const toggleFeature = (h) => aFetch('/api/admin/hotels/' + h.id + '/feature', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ featured: !h.featured }) }).then(() => refresh())
  const delHotel = (h) => { if (!confirm('Supprimer ' + h.name + ' ?')) return; aFetch('/api/admin/hotels/' + h.id, { method: 'DELETE' }).then(() => { toast.success('Supprimé'); refresh() }) }
  const setRole = (u, role) => aFetch('/api/admin/users/' + u.id + '/role', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) }).then(() => refresh())
  const delUser = (u) => { if (!confirm('Supprimer ' + u.email + ' ?')) return; aFetch('/api/admin/users/' + u.id, { method: 'DELETE' }).then(() => refresh()) }
  const saveSettings = () => fetch('/api/settings/rates', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ rates: settings.rates, fee: parseFloat(settings.fee), commission: parseFloat(settings.commission) }) }).then((r) => r.json()).then((s) => { if (s.rates) setSettings(s); toast.success(lang === 'fr' ? 'Paramètres enregistrés' : 'Settings saved') })
  const setSvcReqStatus = (req, status) => aFetch('/api/service-requests/' + req.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(() => { toast.success(lang === 'fr' ? 'Statut mis à jour' : 'Status updated'); refresh() })
  const svcTypeLbl = (t) => ({ excursion: lang === 'fr' ? 'Excursion' : 'Tour', transfer: lang === 'fr' ? 'Transfert' : 'Transfer', taxi: 'Taxi', car_rental: lang === 'fr' ? 'Location voiture' : 'Car rental' }[t] || t)
  const svcStatusBadge = (s) => ({ pending: 'bg-amber-100 text-amber-800', confirmed: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-700', completed: 'bg-blue-100 text-blue-800' }[s] || 'bg-muted text-foreground')

  if (!token) return <main className="container py-20 text-center text-muted-foreground">Admin only.</main>

  return (
    <main className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2"><Shield className="h-7 w-7 text-primary" />Admin YABISO</h1>
        <Button variant="outline" onClick={onBack} className="gap-1"><Globe className="h-4 w-4" />{lang === 'fr' ? 'Site' : 'Site'}</Button>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="overview" className="gap-1"><BarChart3 className="h-4 w-4" />{lang === 'fr' ? 'Vue d\'ensemble' : 'Overview'}</TabsTrigger>
          <TabsTrigger value="hotels" className="gap-1"><Building2 className="h-4 w-4" />Hôtels</TabsTrigger>
          <TabsTrigger value="bookings" className="gap-1"><CalendarCheck className="h-4 w-4" />{lang === 'fr' ? 'Réservations' : 'Bookings'}</TabsTrigger>
          <TabsTrigger value="payments" className="gap-1"><Wallet className="h-4 w-4" />{lang === 'fr' ? 'Paiements' : 'Payments'}</TabsTrigger>
          <TabsTrigger value="users" className="gap-1"><Users className="h-4 w-4" />{lang === 'fr' ? 'Utilisateurs' : 'Users'}</TabsTrigger>
          <TabsTrigger value="agents" className="gap-1"><UserCog className="h-4 w-4" />Agents</TabsTrigger>
          <TabsTrigger value="servicereqs" className="gap-1"><Compass className="h-4 w-4" />{lang === 'fr' ? 'Demandes services' : 'Service requests'}{serviceReqs.filter((r) => r.status === 'pending').length > 0 && <span className="ml-1 text-[10px] font-bold bg-amber-400 text-black rounded-full px-1.5">{serviceReqs.filter((r) => r.status === 'pending').length}</span>}</TabsTrigger>
          <TabsTrigger value="settings" className="gap-1"><SettingsIcon className="h-4 w-4" />{lang === 'fr' ? 'Paramètres' : 'Settings'}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {stats && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { l: lang === 'fr' ? 'Utilisateurs' : 'Users', v: stats.users, i: Users },
                { l: 'Hôtels', v: stats.hotels, i: Building2 },
                { l: lang === 'fr' ? 'Vérifiés' : 'Verified', v: stats.verifiedHotels, i: ShieldCheck },
                { l: lang === 'fr' ? 'Importés Google' : 'Google imports', v: stats.importedHotels, i: Globe },
                { l: lang === 'fr' ? 'Réservations' : 'Bookings', v: stats.bookings, i: CalendarCheck },
                { l: 'Agents', v: stats.agents, i: UserCog },
                { l: lang === 'fr' ? 'Revenu (CDF)' : 'Revenue (CDF)', v: fmtCDF(stats.revenueCDF), i: Wallet },
                { l: lang === 'fr' ? 'Commission (CDF)' : 'Commission (CDF)', v: fmtCDF(stats.commissionCDF), i: BarChart3 },
              ].map((c, i) => (
                <Card key={i} className="p-5 border">
                  <div className="flex items-center justify-between"><div className="text-2xl font-extrabold text-primary">{c.v}</div><c.i className="h-7 w-7 text-primary/30" /></div>
                  <div className="text-sm text-muted-foreground mt-1">{c.l}</div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="hotels">
          <div className="space-y-2">
            {hotels.map((h) => (
              <Card key={h.id} className="p-3 border flex items-center gap-3">
                <img src={h.images[0]} alt="" className="h-12 w-12 rounded object-cover" />
                <div className="flex-1 min-w-0"><div className="font-semibold truncate">{h.name}</div><div className="text-xs text-muted-foreground">{h.city} · {fmtCDF(h.priceCDF)} {h.source === 'google_places' ? '· Google' : ''}</div></div>
                {h.verified && <Badge className="bg-[#0057B8] text-white hover:bg-[#0057B8] text-xs gap-1"><BadgeCheck className="h-3 w-3" />Vérifié</Badge>}
                <Button size="sm" variant={h.featured ? 'default' : 'outline'} onClick={() => toggleFeature(h)} className="gap-1"><Star className="h-3.5 w-3.5" />{h.featured ? 'Vedette' : 'Mettre'}</Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => delHotel(h)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <div className="space-y-2">
            {bookings.length === 0 && <div className="py-10 text-center text-muted-foreground">Aucune réservation.</div>}
            {bookings.map((b) => (
              <Card key={b.id} className="p-3 border flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]"><div className="font-semibold">{b.hotelName} <span className="font-mono text-xs text-muted-foreground">({b.reference})</span></div><div className="text-xs text-muted-foreground">{b.customer?.name} · {b.customer?.email} · {b.checkIn}→{b.checkOut}</div></div>
                <div className="font-bold text-primary">{SYMBOLS[b.currency]}{(b.totalDisplay || 0).toLocaleString('fr-FR')}{b.currency === 'CDF' ? ' FC' : ''}</div>
                <Select value={b.status} onValueChange={(v) => setBookingStatus(b, v)}>
                  <SelectTrigger className="h-8 w-[210px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{ADMIN_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="space-y-3">
            {bookings.filter((b) => b.payment).length === 0 && <div className="py-10 text-center text-muted-foreground">{lang === 'fr' ? 'Aucun paiement.' : 'No payments.'}</div>}
            {bookings.filter((b) => b.payment).map((b) => {
              const p = b.payment || {}
              const color = p.status === 'approved' ? 'bg-green-600' : p.status === 'rejected' ? 'bg-destructive' : 'bg-[#F4B400] text-black'
              return (
                <Card key={b.id} className="p-4 border">
                  <div className="flex flex-wrap items-start gap-4">
                    {p.proofImage ? <img src={p.proofImage} alt="preuve" className="h-20 w-20 rounded object-cover border" /> : <div className="h-20 w-20 rounded bg-muted grid place-items-center text-xs text-muted-foreground">{lang === 'fr' ? 'Pas de reçu' : 'No proof'}</div>}
                    <div className="flex-1 min-w-[200px]">
                      <div className="font-semibold">{b.hotelName} <span className="font-mono text-xs text-muted-foreground">({b.reference})</span></div>
                      <div className="text-sm text-muted-foreground">{b.customer?.name} · {b.customer?.email}</div>
                      <div className="text-sm mt-1">{lang === 'fr' ? 'Méthode' : 'Method'}: <strong className="uppercase">{p.method}</strong> · Tx: <span className="font-mono">{p.txId || '—'}</span> · Tél: {p.payerPhone || '—'}</div>
                      <div className="font-bold text-primary mt-1">{SYMBOLS[b.currency]}{(b.totalDisplay || 0).toLocaleString('fr-FR')}{b.currency === 'CDF' ? ' FC' : ''}</div>
                    </div>
                    <div className="text-right">
                      <Badge className={color + ' hover:' + color}>{p.status}</Badge>
                      {p.status === 'pending' && (
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1" onClick={() => verifyPayment(b, 'approve')}><Check className="h-3.5 w-3.5" />{lang === 'fr' ? 'Approuver' : 'Approve'}</Button>
                          <Button size="sm" variant="destructive" className="gap-1" onClick={() => verifyPayment(b, 'reject')}><X className="h-3.5 w-3.5" />{lang === 'fr' ? 'Rejeter' : 'Reject'}</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="space-y-2">
            {users.map((u) => (
              <Card key={u.id} className="p-3 border flex items-center gap-3">
                <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary text-primary-foreground text-sm">{(u.name || 'U')[0].toUpperCase()}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0"><div className="font-semibold truncate">{u.name}</div><div className="text-xs text-muted-foreground truncate">{u.email}</div></div>
                <Select value={u.role} onValueChange={(v) => setRole(u, v)}><SelectTrigger className="h-8 w-[110px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="user">user</SelectItem><SelectItem value="admin">admin</SelectItem></SelectContent></Select>
                {u.email !== 'admin@yabiso.com' && <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => delUser(u)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="agents">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((a) => (
              <Card key={a.id} className="p-4 border">
                <div className="font-semibold">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.email}</div>
                <div className="text-xs mt-1">{a.code} · {a.zone}</div>
              </Card>
            ))}
            {agents.length === 0 && <div className="py-10 text-center text-muted-foreground col-span-full">Aucun agent.</div>}
          </div>
        </TabsContent>

        <TabsContent value="servicereqs">
          <div className="space-y-3">
            {serviceReqs.length === 0 && <div className="py-10 text-center text-muted-foreground">{lang === 'fr' ? 'Aucune demande de service pour le moment.' : 'No service requests yet.'}</div>}
            {serviceReqs.map((r) => (
              <Card key={r.id} className="p-4 border">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold">{r.serviceName}</span>
                      <Badge variant="secondary" className="text-[10px]">{svcTypeLbl(r.serviceType)}</Badge>
                      <Badge className={`text-[10px] border-0 ${svcStatusBadge(r.status)}`}>{r.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{r.reference} · {r.city}, {r.country}</div>
                    <div className="text-sm mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1">
                      <span><span className="text-muted-foreground">{lang === 'fr' ? 'Client : ' : 'Customer: '}</span>{r.customer?.name}</span>
                      <span><span className="text-muted-foreground">Email : </span>{r.customer?.email}</span>
                      <span><span className="text-muted-foreground">Tél : </span>{r.customer?.phone || '-'}</span>
                      <span><span className="text-muted-foreground">Date : </span>{r.date || '-'}</span>
                      <span><span className="text-muted-foreground">{lang === 'fr' ? 'Quantité : ' : 'Qty: '}</span>{r.quantity}</span>
                      <span className="font-semibold text-primary">{SYMBOLS[r.currency]}{(r.totalDisplay || 0).toLocaleString('fr-FR')}{r.currency === 'CDF' ? ' FC' : ''}</span>
                    </div>
                    {r.notes && <div className="text-xs text-muted-foreground mt-1 italic">"{r.notes}"</div>}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {r.status !== 'confirmed' && <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700" onClick={() => setSvcReqStatus(r, 'confirmed')}><CheckCircle2 className="h-3.5 w-3.5" />{lang === 'fr' ? 'Confirmer' : 'Confirm'}</Button>}
                    {r.status !== 'completed' && r.status === 'confirmed' && <Button size="sm" variant="outline" className="gap-1" onClick={() => setSvcReqStatus(r, 'completed')}><BadgeCheck className="h-3.5 w-3.5" />{lang === 'fr' ? 'Terminé' : 'Complete'}</Button>}
                    {r.status !== 'cancelled' && <Button size="sm" variant="outline" className="gap-1 text-red-600 hover:text-red-700" onClick={() => setSvcReqStatus(r, 'cancelled')}><X className="h-3.5 w-3.5" />{lang === 'fr' ? 'Annuler' : 'Cancel'}</Button>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>


        <TabsContent value="settings">
          <Card className="p-5 border max-w-lg">
            <h3 className="font-bold mb-3">{lang === 'fr' ? 'Taux de change (CDF par unité)' : 'Exchange rates (CDF per unit)'}</h3>
            <div className="grid grid-cols-3 gap-3">
              {['USD', 'EUR', 'GBP', 'XAF'].map((c) => (
                <div key={c}><Label>{c}</Label><Input type="number" value={settings.rates[c]} onChange={(e) => setSettings({ ...settings, rates: { ...settings.rates, [c]: parseFloat(e.target.value) || 0 } })} className="mt-1" /></div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><Label>{lang === 'fr' ? 'Frais de conversion (0-0.10)' : 'Conversion fee (0-0.10)'}</Label><Input type="number" step="0.01" value={settings.fee} onChange={(e) => setSettings({ ...settings, fee: e.target.value })} className="mt-1" /></div>
              <div><Label>{lang === 'fr' ? 'Commission (0-0.50)' : 'Commission (0-0.50)'}</Label><Input type="number" step="0.01" value={settings.commission} onChange={(e) => setSettings({ ...settings, commission: e.target.value })} className="mt-1" /></div>
            </div>
            <Button onClick={saveSettings} className="mt-4 gap-2"><Check className="h-4 w-4" />{lang === 'fr' ? 'Enregistrer' : 'Save'}</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}

/* ---- Hotel Owner dashboard ---- */
function OwnerHotelForm({ lang, token, onCreated }) {
  const [f, setF] = useState({ name: '', type: 'hotel', country: 'RD Congo', province: 'Kinshasa', city: '', description: '' })
  const [rooms, setRooms] = useState([{ name: 'Chambre Standard', priceCDF: '120000', capacity: 2, beds: '1 lit double' }])
  const [images, setImages] = useState([])
  const [amenities, setAmenities] = useState(['wifi', 'parking'])
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const onFiles = async (e) => { const files = Array.from(e.target.files || []).slice(0, 5); if (!files.length) return; setUploading(true); try { const d = await Promise.all(files.map(resizeImage)); setImages((im) => [...im, ...d]) } finally { setUploading(false) } }
  const setRoom = (i, k, v) => setRooms((rs) => rs.map((r, idx) => idx === i ? { ...r, [k]: v } : r))
  const submit = async () => {
    if (!f.name || !f.city) { toast.error(lang === 'fr' ? 'Nom et ville requis' : 'Name and city required'); return }
    setBusy(true)
    try {
      const r = await fetch('/api/owner/hotels', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ ...f, amenities, images, rooms: rooms.map((x) => ({ ...x, priceCDF: parseInt(x.priceCDF) || 0 })) }) })
      const d = await r.json(); if (d.error) throw new Error(d.error)
      setF({ name: '', type: 'hotel', country: 'RD Congo', province: 'Kinshasa', city: '', description: '' }); setRooms([{ name: 'Chambre Standard', priceCDF: '120000', capacity: 2, beds: '1 lit double' }]); setImages([])
      toast.success(lang === 'fr' ? 'Hôtel ajouté !' : 'Hotel added!'); onCreated()
    } catch (e) { toast.error(String(e.message || e)) } finally { setBusy(false) }
  }
  return (
    <Card className="p-5 border">
      <h3 className="font-bold mb-3">{lang === 'fr' ? 'Ajouter mon hôtel' : 'Add my hotel'}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2"><Label>{lang === 'fr' ? "Nom de l'établissement" : 'Property name'}</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="mt-1" /></div>
        <div><Label>Type</Label><Select value={f.type} onValueChange={(v) => setF({ ...f, type: v })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{TYPE_KEYS.map((k) => <SelectItem key={k} value={k}>{T[lang].types[k]}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>{lang === 'fr' ? 'Pays' : 'Country'}</Label><Input value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} className="mt-1" /></div>
        <div><Label>Province</Label>{f.country === 'RD Congo' ? <Select value={f.province} onValueChange={(v) => setF({ ...f, province: v })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent className="max-h-60">{DRC_PROVINCES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select> : <Input value={f.province} onChange={(e) => setF({ ...f, province: e.target.value })} className="mt-1" />}</div>
        <div><Label>{lang === 'fr' ? 'Ville' : 'City'}</Label><Input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} className="mt-1" /></div>
        <div className="sm:col-span-2"><Label>Description</Label><Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="mt-1" rows={2} /></div>
      </div>
      <div className="mt-3">
        <Label className="text-sm">{lang === 'fr' ? 'Équipements' : 'Amenities'}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
          {Object.entries(AMENITIES).map(([k, m]) => (
            <label key={k} className="flex items-center gap-2 text-sm cursor-pointer"><Checkbox checked={amenities.includes(k)} onCheckedChange={() => setAmenities((a) => a.includes(k) ? a.filter((x) => x !== k) : [...a, k])} /><m.icon className="h-4 w-4 text-primary" />{m[lang]}</label>
          ))}
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between"><Label className="text-sm">{lang === 'fr' ? 'Chambres' : 'Rooms'}</Label><Button size="sm" variant="outline" onClick={() => setRooms((rs) => [...rs, { name: '', priceCDF: '', capacity: 2, beds: '' }])} className="gap-1"><Plus className="h-3.5 w-3.5" /></Button></div>
        {rooms.map((r, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 mt-2 items-center">
            <Input className="col-span-5 h-9" placeholder={lang === 'fr' ? 'Nom' : 'Name'} value={r.name} onChange={(e) => setRoom(i, 'name', e.target.value)} />
            <Input className="col-span-4 h-9" type="number" placeholder="Prix CDF" value={r.priceCDF} onChange={(e) => setRoom(i, 'priceCDF', e.target.value)} />
            <Input className="col-span-2 h-9" type="number" placeholder="Cap." value={r.capacity} onChange={(e) => setRoom(i, 'capacity', e.target.value)} />
            <div className="col-span-1">{rooms.length > 1 && <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setRooms((rs) => rs.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4 text-destructive" /></Button>}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <label className="cursor-pointer"><div className="border-2 border-dashed rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted/40 flex items-center gap-2">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}{lang === 'fr' ? 'Photos' : 'Photos'}</div><input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} /></label>
        {images.map((src, i) => <img key={i} src={src} alt="" className="h-10 w-10 rounded object-cover" />)}
      </div>
      <Button onClick={submit} disabled={busy} className="mt-4 gap-2">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{lang === 'fr' ? "Créer l'hôtel" : 'Create hotel'}</Button>
    </Card>
  )
}

function OwnerDashboard({ lang, token, user, onBack }) {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState({ properties: 0, rooms: 0, bookings: 0, pending: 0, payoutCDF: 0, revenueCDF: 0 })
  const [hotels, setHotels] = useState([])
  const [bookings, setBookings] = useState([])
  const aFetch = (u, opts = {}) => fetch(u, { ...opts, headers: { ...(opts.headers || {}), Authorization: 'Bearer ' + token } })
  const refresh = useCallback(() => {
    aFetch('/api/owner/stats').then((r) => r.json()).then(setStats).catch(() => {})
    aFetch('/api/owner/hotels').then((r) => r.json()).then((d) => setHotels(Array.isArray(d) ? d : [])).catch(() => {})
    aFetch('/api/owner/bookings').then((r) => r.json()).then((d) => setBookings(Array.isArray(d) ? d : [])).catch(() => {})
  }, [token])
  useEffect(() => { refresh() }, [refresh])
  const toggleActive = (h) => aFetch('/api/owner/hotels/' + h.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !(h.active !== false) }) }).then(() => { toast.success(lang === 'fr' ? 'Mis à jour' : 'Updated'); refresh() })

  if (!token) return <main className="container py-20 text-center"><p className="text-muted-foreground mb-3">{lang === 'fr' ? 'Connectez-vous pour accéder à votre espace hôtelier.' : 'Sign in to access your hotel space.'}</p><Button onClick={onBack}>{lang === 'fr' ? 'Retour' : 'Back'}</Button></main>

  return (
    <main className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2"><Building2 className="h-7 w-7 text-primary" />{lang === 'fr' ? 'Espace Hôtelier' : 'Hotel Owner'}</h1><p className="text-muted-foreground text-sm">{user?.name} · {user?.email}</p></div>
        <Button variant="outline" onClick={onBack} className="gap-1"><Globe className="h-4 w-4" />{lang === 'fr' ? 'Site' : 'Site'}</Button>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="overview" className="gap-1"><BarChart3 className="h-4 w-4" />{lang === 'fr' ? "Vue d'ensemble" : 'Overview'}</TabsTrigger>
          <TabsTrigger value="hotels" className="gap-1"><Building2 className="h-4 w-4" />{lang === 'fr' ? 'Mes hôtels' : 'My hotels'}</TabsTrigger>
          <TabsTrigger value="add" className="gap-1"><Plus className="h-4 w-4" />{lang === 'fr' ? 'Ajouter' : 'Add'}</TabsTrigger>
          <TabsTrigger value="bookings" className="gap-1"><CalendarCheck className="h-4 w-4" />{lang === 'fr' ? 'Réservations' : 'Bookings'}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { l: lang === 'fr' ? 'Mes hôtels' : 'My hotels', v: stats.properties, i: Building2 },
              { l: lang === 'fr' ? 'Chambres' : 'Rooms', v: stats.rooms, i: LayoutDashboard },
              { l: lang === 'fr' ? 'Réservations' : 'Bookings', v: stats.bookings, i: CalendarCheck },
              { l: lang === 'fr' ? 'En cours' : 'In progress', v: stats.pending, i: Activity },
              { l: lang === 'fr' ? 'Mes revenus nets (CDF)' : 'My net payout (CDF)', v: fmtCDF(stats.payoutCDF), i: Wallet },
              { l: lang === 'fr' ? 'Volume total (CDF)' : 'Total volume (CDF)', v: fmtCDF(stats.revenueCDF), i: BarChart3 },
            ].map((c, i) => (
              <Card key={i} className="p-5 border"><div className="flex items-center justify-between"><div className="text-2xl font-extrabold text-primary">{c.v}</div><c.i className="h-7 w-7 text-primary/30" /></div><div className="text-sm text-muted-foreground mt-1">{c.l}</div></Card>
            ))}
          </div>
          <Card className="p-5 border mt-6 text-sm text-muted-foreground">{lang === 'fr' ? 'YABISO reverse vos paiements après confirmation du check-in (commission déduite). Ajoutez vos hôtels et gérez vos chambres et tarifs en CDF.' : 'YABISO releases your payout after check-in confirmation (commission deducted). Add your hotels and manage rooms and prices in CDF.'}</Card>
        </TabsContent>

        <TabsContent value="hotels">
          {hotels.length === 0 ? <div className="py-16 text-center text-muted-foreground">{lang === 'fr' ? "Aucun hôtel. Ajoutez votre premier établissement dans l'onglet Ajouter." : 'No hotels yet. Add your first one in the Add tab.'}</div> : (
            <div className="space-y-3">
              {hotels.map((h) => (
                <Card key={h.id} className="p-4 border">
                  <div className="flex items-center gap-4">
                    <img src={h.images[0]} alt="" className="h-16 w-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{h.name}</div>
                      <div className="text-xs text-muted-foreground">{h.city}, {h.province} · {h.rooms?.length || 0} {lang === 'fr' ? 'chambres' : 'rooms'} · {fmtCDF(h.priceCDF)}</div>
                      <div className="flex gap-2 mt-1">{h.verified ? <Badge className="bg-[#0057B8] text-white hover:bg-[#0057B8] text-xs gap-1"><BadgeCheck className="h-3 w-3" />{lang === 'fr' ? 'Vérifié' : 'Verified'}</Badge> : <Badge variant="outline" className="text-xs text-muted-foreground">{lang === 'fr' ? 'En attente de vérification' : 'Pending verification'}</Badge>}<Badge variant={h.active !== false ? 'secondary' : 'outline'} className="text-xs">{h.active !== false ? (lang === 'fr' ? 'Actif' : 'Active') : (lang === 'fr' ? 'Inactif' : 'Inactive')}</Badge></div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => toggleActive(h)}>{h.active !== false ? (lang === 'fr' ? 'Désactiver' : 'Deactivate') : (lang === 'fr' ? 'Activer' : 'Activate')}</Button>
                  </div>
                  <div className="mt-3 grid sm:grid-cols-3 gap-2">
                    {(h.rooms || []).map((r) => (
                      <div key={r.id} className="rounded-lg border p-2 text-xs"><div className="font-semibold">{r.name}</div><div className="text-muted-foreground">{fmtCDF(r.priceCDF)} · {r.capacity} pers.</div></div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add">
          <OwnerHotelForm lang={lang} token={token} onCreated={() => { refresh(); setTab('hotels') }} />
        </TabsContent>

        <TabsContent value="bookings">
          {bookings.length === 0 ? <div className="py-16 text-center text-muted-foreground">{lang === 'fr' ? 'Aucune réservation.' : 'No bookings.'}</div> : (
            <div className="space-y-2">
              {bookings.map((b) => (
                <Card key={b.id} className="p-3 border flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[200px]"><div className="font-semibold">{b.hotelName} <span className="font-mono text-xs text-muted-foreground">({b.reference})</span></div><div className="text-xs text-muted-foreground">{b.customer?.name} · {b.checkIn}→{b.checkOut} · {b.nights} {lang === 'fr' ? 'nuits' : 'nights'}</div></div>
                  <div className="text-right"><div className="font-bold text-primary">{lang === 'fr' ? 'Votre part' : 'Your payout'}: {fmtCDF(b.payoutCDF)}</div><Badge variant="secondary" className="text-xs mt-1">{b.status}</Badge></div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}

/* ---- Promo announcement bar (2 months free) ---- */
function AnnouncementBar({ lang, onPartner }) {
  const [open, setOpen] = useState(true)
  useEffect(() => { try { if (localStorage.getItem('yabiso_promo_off') === '1') setOpen(false) } catch (e) {} }, [])
  if (!open) return null
  const close = () => { setOpen(false); try { localStorage.setItem('yabiso_promo_off', '1') } catch (e) {} }
  return (
    <div className="relative bg-gradient-to-r from-[#CE1126] via-[#0057B8] to-[#0057B8] text-white">
      <div className="container flex items-center justify-center gap-3 py-2 text-sm font-medium text-center">
        <PartyPopper className="h-4 w-4 text-[#F4B400] shrink-0" />
        <span className="truncate sm:whitespace-normal">
          <strong className="text-[#F4B400]">{lang === 'fr' ? '2 MOIS GRATUITS' : '2 MONTHS FREE'}</strong>
          {lang === 'fr' ? " — 0% de commission pour les nouveaux hôtels partenaires !" : ' — 0% commission for new partner hotels!'}
        </span>
        <button onClick={onPartner} className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#F4B400] text-black font-semibold px-3 py-1 text-xs hover:bg-[#d99f00] transition shrink-0">
          {lang === 'fr' ? "J'en profite" : 'Claim offer'}<ArrowRight className="h-3 w-3" />
        </button>
      </div>
      <button onClick={close} className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 grid place-items-center rounded-full hover:bg-white/20"><X className="h-3.5 w-3.5" /></button>
    </div>
  )
}

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
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [myBookings, setMyBookings] = useState([])

  const today = new Date()
  const [search, setSearch] = useState({
    q: '', type: '', checkIn: fmtDateInput(new Date(today.getTime() + 86400000)),
    checkOut: fmtDateInput(new Date(today.getTime() + 3 * 86400000)), guests: 2,
  })
  const [sugOpen, setSugOpen] = useState(false)
  const [category, setCategory] = useState('')
  const [serviceType, setServiceType] = useState('excursion')
  const [services, setServices] = useState([])
  const [svcModal, setSvcModal] = useState(null)
  const [svcForm, setSvcForm] = useState({ name: '', email: '', phone: '', date: '', quantity: 1, notes: '' })
  const [svcResult, setSvcResult] = useState(null)
  const [svcSubmitting, setSvcSubmitting] = useState(false)
  const [adOpen, setAdOpen] = useState(false)
  const [adIndex, setAdIndex] = useState(0)
  const [adMuted, setAdMuted] = useState(true)
  const adCounter = useRef(0)
  const adHideTimer = useRef(null)
  const adUnmuteTimer = useRef(null)
  const adVideoRef = useRef(null)
  useEffect(() => {
    const showAd = () => {
      setAdIndex(adCounter.current % AD_VIDEOS.length)
      adCounter.current += 1
      setAdMuted(true)
      setAdOpen(true)
      if (adHideTimer.current) clearTimeout(adHideTimer.current)
      if (adUnmuteTimer.current) clearTimeout(adUnmuteTimer.current)
      adUnmuteTimer.current = setTimeout(() => setAdMuted(false), 5000) // auto-unmute after 5s
      adHideTimer.current = setTimeout(() => setAdOpen(false), 65000) // 5s muted + 60s with sound
    }
    const first = setTimeout(showAd, 20000) // first ad ~20s after arrival
    const interval = setInterval(showAd, 300000) // then every 5 minutes
    return () => { clearTimeout(first); clearInterval(interval); if (adHideTimer.current) clearTimeout(adHideTimer.current); if (adUnmuteTimer.current) clearTimeout(adUnmuteTimer.current) }
  }, [])
  // Try to keep the ad playing; auto-unmute after 5s, but if the browser blocks
  // sound autoplay, revert to muted so the video keeps playing silently.
  useEffect(() => {
    const v = adVideoRef.current
    if (!adOpen || !v) return
    const p = v.play?.()
    if (p && typeof p.catch === 'function') {
      p.catch(() => { if (!v.muted) setAdMuted(true) })
    }
  }, [adMuted, adOpen, adIndex])

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

  const doSearch = async (q) => {
    const query = typeof q === 'string' ? q : search.q
    setSugOpen(false)
    await loadHotels({ q: query, type: search.type, guests: search.guests, category })
    goto('search')
  }

  const pickDest = (d) => {
    setSearch((s) => ({ ...s, q: d.city }))
    setSugOpen(false)
    doSearch(d.city)
  }

  const pickCategory = (key) => { setCategory(key); loadHotels({ category: key }); goto('search') }

  const loadServices = async (type) => {
    try { const r = await fetch('/api/services?type=' + type); setServices(await r.json()) } catch { setServices([]) }
  }
  const openServices = (type) => { setServiceType(type); loadServices(type); goto('services') }
  const openSvcRequest = (svc) => {
    setSvcResult(null)
    setSvcForm({ name: user?.name || '', email: user?.email || '', phone: '', date: '', quantity: 1, notes: '' })
    setSvcModal(svc)
  }
  const submitSvcRequest = async () => {
    if (!svcForm.name || !svcForm.email) { toast.error(lang === 'fr' ? 'Nom et email requis' : 'Name and email required'); return }
    setSvcSubmitting(true)
    try {
      const r = await fetch('/api/service-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serviceId: svcModal.id, date: svcForm.date, quantity: svcForm.quantity, currency, customer: { name: svcForm.name, email: svcForm.email, phone: svcForm.phone }, notes: svcForm.notes }) })
      const d = await r.json()
      if (r.ok) { setSvcResult(d); toast.success(lang === 'fr' ? 'Demande envoyée !' : 'Request sent!') }
      else toast.error(d.error || 'Error')
    } catch { toast.error('Network error') }
    setSvcSubmitting(false)
  }

  const ServiceTabs = ({ light }) => (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      {STAY_CATS.map((c) => {
        const active = category === c.key
        const Icon = c.icon
        return (
          <button key={c.key || 'all'} onClick={() => pickCategory(c.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap text-sm font-medium transition shrink-0 ${active ? 'bg-primary text-primary-foreground border-primary shadow' : light ? 'bg-white/15 text-white border-white/30 hover:bg-white/25 backdrop-blur' : 'bg-card text-foreground border-border hover:bg-accent'}`}>
            <Icon className="h-4 w-4" />{lang === 'fr' ? c.fr : c.en}
          </button>
        )
      })}
      <div className={`w-px shrink-0 mx-1 ${light ? 'bg-white/30' : 'bg-border'}`} />
      {SERVICE_VERTICALS.map((s) => {
        const Icon = s.icon
        const active = view === 'services' && serviceType === s.type
        return (
          <button key={s.type} onClick={() => openServices(s.type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap text-sm font-medium transition shrink-0 ${active ? 'bg-primary text-primary-foreground border-primary shadow' : light ? 'bg-white/15 text-white border-white/30 hover:bg-white/25 backdrop-blur' : 'bg-card text-foreground border-border hover:bg-accent'}`}>
            <Icon className="h-4 w-4" />{lang === 'fr' ? s.fr : s.en}
          </button>
        )
      })}
      <div className={`w-px shrink-0 mx-1 ${light ? 'bg-white/30' : 'bg-border'}`} />
      {SERVICES_SOON.map((s) => {
        const Icon = s.icon
        return (
          <button key={s.fr} onClick={() => toast.info((lang === 'fr' ? s.fr : s.en) + (lang === 'fr' ? ' — Bientôt disponible sur YABISO' : ' — Coming soon on YABISO'))}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap text-sm font-medium transition shrink-0 ${light ? 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20 backdrop-blur' : 'bg-muted/40 text-muted-foreground border-border hover:bg-accent'}`}>
            <Icon className="h-4 w-4" />{lang === 'fr' ? s.fr : s.en}
            <span className="text-[9px] uppercase font-bold bg-amber-400 text-black rounded px-1 py-0.5 leading-none">{lang === 'fr' ? 'Bientôt' : 'Soon'}</span>
          </button>
        )
      })}
    </div>
  )


  const toggleFav = (id) => {
    if (user && token) {
      fetch('/api/auth/favorites', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ hotelId: id }) })
        .then((r) => r.json()).then((d) => { if (d.favorites) setFavorites(d.favorites) }).catch(() => {})
    } else {
      setFavorites((f) => f.includes(id) ? f.filter((x) => x !== id) : [...f, id])
    }
  }

  // Auth: load from localStorage on mount
  useEffect(() => {
    try {
      const t = localStorage.getItem('yabiso_token'); const u = localStorage.getItem('yabiso_user')
      if (t && u) { setToken(t); const usr = JSON.parse(u); setUser(usr); setFavorites(usr.favorites || []) }
    } catch (e) {}
  }, [])

  const onAuthSuccess = (data) => {
    setUser(data.user); setToken(data.token); setFavorites(data.user.favorites || [])
    localStorage.setItem('yabiso_token', data.token); localStorage.setItem('yabiso_user', JSON.stringify(data.user))
    setAuthOpen(false)
    toast.success(lang === 'fr' ? 'Connexion réussie !' : 'Signed in!')
  }
  const logout = () => {
    setUser(null); setToken(null); setFavorites([]); setMyBookings([])
    localStorage.removeItem('yabiso_token'); localStorage.removeItem('yabiso_user')
    goto('home')
  }
  const loadMyBookings = useCallback(() => {
    if (!token) return
    fetch('/api/auth/bookings', { headers: { Authorization: 'Bearer ' + token } }).then((r) => r.json()).then((d) => setMyBookings(Array.isArray(d) ? d : [])).catch(() => {})
  }, [token])

  const startBooking = (hotel, room) => {
    setDraft({ hotel, room, checkIn: search.checkIn, checkOut: search.checkOut, guests: search.guests })
    goto('booking')
  }

  /* ----------------------------- Header ----------------------------- */
  const Header = () => (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between gap-4">
        <button onClick={() => { goto('home'); loadHotels() }} className="flex items-center shrink-0">
          <img src={LOGO_LIGHT} alt="YABISO HOTELS — par BissaGlobal Services" className="h-12 w-auto object-contain block dark:hidden" />
          <img src={LOGO_DARK} alt="YABISO HOTELS — par BissaGlobal Services" className="h-12 w-auto object-contain hidden dark:block" />
        </button>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <button onClick={() => { goto('home'); loadHotels() }} className="hover:text-primary transition">{t('nav_home')}</button>
          <button onClick={() => goto('search')} className="hover:text-primary transition">{t('nav_destinations')}</button>
          <button onClick={() => openServices('excursion')} className="hover:text-primary transition flex items-center gap-1"><Compass className="h-4 w-4" />Services</button>
          <button onClick={() => goto('partner')} className="hover:text-primary transition">{t('nav_partner')}</button>
          <button onClick={() => goto('agent')} className="hover:text-primary transition flex items-center gap-1"><UserCog className="h-4 w-4" />Espace Agent</button>
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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground text-sm">{(user.name || 'U')[0].toUpperCase()}</AvatarFallback></Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate">{user.name}<div className="text-xs font-normal text-muted-foreground truncate">{user.email}</div></DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { goto('account'); loadMyBookings() }}><CalendarCheck className="h-4 w-4 mr-2" />{lang === 'fr' ? 'Mes réservations' : 'My bookings'}</DropdownMenuItem>
                {user.role === 'admin' && <DropdownMenuItem onClick={() => goto('admin')}><Shield className="h-4 w-4 mr-2" />Admin</DropdownMenuItem>}
                <DropdownMenuItem onClick={() => goto('owner')}><Building2 className="h-4 w-4 mr-2" />{lang === 'fr' ? 'Espace Hôtelier' : 'Hotel space'}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => goto('agent')}><UserCog className="h-4 w-4 mr-2" />Espace Agent</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}><LogOut className="h-4 w-4 mr-2" />{lang === 'fr' ? 'Déconnexion' : 'Logout'}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" className="gap-1 hidden sm:flex" onClick={() => setAuthOpen(true)}><LogIn className="h-4 w-4" />{lang === 'fr' ? 'Connexion' : 'Sign in'}</Button>
          )}
        </div>
      </div>
    </header>
  )

  /* ----------------------------- Search bar ----------------------------- */
  const SearchBar = ({ compact }) => (
    <div className={`bg-card text-card-foreground rounded-2xl shadow-xl border p-3 grid grid-cols-1 md:grid-cols-12 gap-2 ${compact ? '' : 'md:p-4'}`}>
      <div className="md:col-span-4 flex flex-col gap-1 relative">
        <label className="text-[11px] font-semibold text-muted-foreground px-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{t('f_dest')}</label>
        <Input
          value={search.q}
          onChange={(e) => { setSearch({ ...search, q: e.target.value }); setSugOpen(true) }}
          onFocus={() => setSugOpen(true)}
          onBlur={() => setTimeout(() => setSugOpen(false), 150)}
          placeholder={t('f_dest_ph')}
          className="h-11"
          autoComplete="off"
          onKeyDown={(e) => { if (e.key === 'Enter') { setSugOpen(false); doSearch() } }}
        />
        {sugOpen && destSuggestions.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover text-popover-foreground border rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto text-left">
            {destSuggestions.map((d, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); pickDest(d) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition border-b last:border-b-0"
              >
                <div className="h-9 w-9 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                  {d.image ? <img src={d.image} alt="" className="h-full w-full object-cover" /> : <MapPin className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-sm font-semibold truncate">{d.city}</div>
                  <div className="text-xs text-muted-foreground truncate">{d.province ? d.province + ', ' : ''}{d.country}</div>
                </div>
                <span className="ml-auto text-[11px] text-muted-foreground whitespace-nowrap">{d.count} {lang === 'fr' ? 'hôtels' : 'hotels'}</span>
              </button>
            ))}
          </div>
        )}
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
          {h.category && CAT_LABELS[lang][h.category] && <Badge className="bg-[#F4B400] text-black hover:bg-[#F4B400] border-0 font-semibold">{CAT_LABELS[lang][h.category]}</Badge>}
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

  const destSuggestions = useMemo(() => {
    const q = (search.q || '').trim().toLowerCase()
    if (!q || !Array.isArray(destinations)) return []
    const seen = new Set()
    const out = []
    for (const d of destinations) {
      const hay = `${d.city || ''} ${d.province || ''} ${d.country || ''} ${d.region || ''}`.toLowerCase()
      if (hay.includes(q)) {
        const key = `${d.city}|${d.country}`
        if (!seen.has(key)) { seen.add(key); out.push(d) }
      }
    }
    return out.slice(0, 7)
  }, [search.q, destinations])

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
          <div className="mt-6 max-w-5xl">{ServiceTabs({ light: true })}</div>
          <div className="mt-4 max-w-5xl">{SearchBar({})}</div>
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

      {/* Promo banner: 2 months free */}
      <section className="container py-6">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[#0057B8] via-[#0057B8] to-[#003a7a] text-white p-8 md:p-10">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#F4B400]/20 blur-2xl" />
          <div className="absolute right-6 top-6 hidden md:block"><Gift className="h-24 w-24 text-[#F4B400]/30" /></div>
          <Badge className="bg-[#F4B400] text-black hover:bg-[#F4B400] font-bold mb-3 gap-1"><PartyPopper className="h-3.5 w-3.5" />{lang === 'fr' ? 'Offre de lancement' : 'Launch offer'}</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold max-w-2xl">
            {lang === 'fr' ? 'Hôteliers : ' : 'Hoteliers: '}
            <span className="text-[#F4B400]">{lang === 'fr' ? '2 mois gratuits' : '2 months free'}</span>
            {lang === 'fr' ? ' — 0% de commission' : ' — 0% commission'}
          </h2>
          <p className="mt-3 max-w-xl text-white/90">{lang === 'fr' ? "Inscrivez votre établissement aujourd'hui et ne payez aucune commission pendant 2 mois. Photographie professionnelle, vérification et marketing diaspora inclus." : 'List your property today and pay zero commission for 2 months. Professional photography, verification and diaspora marketing included.'}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => goto('partner')} className="bg-[#F4B400] text-black hover:bg-[#d99f00] font-semibold gap-2">{lang === 'fr' ? "J'inscris mon hôtel" : 'List my hotel'}<ArrowRight className="h-4 w-4" /></Button>
            <a href="https://wa.me/243990000000?text=YABISO%202%20mois%20gratuits" target="_blank" rel="noreferrer"><Button variant="outline" className="gap-2 border-white/40 text-white bg-white/10 hover:bg-white/20"><Phone className="h-4 w-4" />WhatsApp</Button></a>
          </div>
          <div className="mt-4 text-xs text-white/70">{lang === 'fr' ? "Offre limitée aux nouveaux partenaires. Conditions appliquées par YABISO HOTELS." : 'Limited to new partners. Terms apply by YABISO HOTELS.'}</div>
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


  /* ----------------------------- SERVICES (Phase 2) ----------------------------- */
  const svcTypeLabel = (type) => {
    const v = SERVICE_VERTICALS.find((s) => s.type === type)
    return v ? (lang === 'fr' ? v.fr : v.en) : type
  }
  const ServicesView = () => (
    <main className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold">{lang === 'fr' ? 'Services de voyage YABISO' : 'YABISO Travel Services'}</h1>
        <p className="text-muted-foreground mt-1">{lang === 'fr' ? 'Excursions, transferts, taxis et location de voitures partout en Afrique.' : 'Excursions, transfers, taxis and car rental across Africa.'}</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: 'none' }}>
        {SERVICE_VERTICALS.map((s) => {
          const Icon = s.icon
          const active = serviceType === s.type
          return (
            <button key={s.type} onClick={() => openServices(s.type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap text-sm font-medium transition shrink-0 ${active ? 'bg-primary text-primary-foreground border-primary shadow' : 'bg-card text-foreground border-border hover:bg-accent'}`}>
              <Icon className="h-4 w-4" />{lang === 'fr' ? s.fr : s.en}
            </button>
          )
        })}
      </div>
      {services.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">{lang === 'fr' ? 'Aucun service disponible pour le moment.' : 'No service available yet.'}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <Card key={s.id} className="overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <img src={s.image} alt={s.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                <Badge className="absolute top-3 left-3 bg-[#F4B400] text-black hover:bg-[#F4B400] font-semibold">{svcTypeLabel(s.type)}</Badge>
              </div>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-bold leading-tight">{lang === 'fr' ? s.name : (s.nameEn || s.name)}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{s.city}, {s.country}</div>
                <p className="text-sm text-muted-foreground line-clamp-2">{lang === 'fr' ? s.description : (s.descriptionEn || s.description)}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarCheck className="h-3.5 w-3.5" />{lang === 'fr' ? s.meta : (s.metaEn || s.meta)}</div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="text-lg font-extrabold text-primary">{fmt(s.priceCDF)}</div>
                    <div className="text-[11px] text-muted-foreground">{lang === 'fr' ? s.unit : (s.unitEn || s.unit)}</div>
                  </div>
                  <Button onClick={() => openSvcRequest(s)} className="gap-1">{lang === 'fr' ? 'Réserver' : 'Book'}</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )

  /* ----------------------------- SEARCH ----------------------------- */
  const SearchView = () => (
    <main className="container py-8">
      <div className="mb-6">{SearchBar({ compact: true })}</div>
      <div className="mb-5">{ServiceTabs({})}</div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h2 className="text-xl font-bold">{hotels.length} {t('results')}{search.q ? ` · ${search.q}` : ''}</h2>
        <div className="ml-auto">
          <Select value={search.type || 'all'} onValueChange={(v) => { const ty = v === 'all' ? '' : v; setSearch({ ...search, type: ty }); loadHotels({ q: search.q, type: ty, guests: search.guests, category }) }}>
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
              <div className="mb-4"><AddReviewForm lang={lang} hotelId={h.id} user={user} onDone={() => openHotel(h.id)} /></div>
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
              <a href={`https://wa.me/243990000000?text=${encodeURIComponent('YABISO - Je souhaite reserver : ' + h.name + ' (' + h.city + ')')}`} target="_blank" rel="noreferrer" className="mt-2 block">
                <Button className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"><Phone className="h-4 w-4" />{lang === 'fr' ? 'Réserver via WhatsApp' : 'Book via WhatsApp'}</Button>
              </a>
              <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground flex gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{lang === 'fr' ? "Annulation gratuite jusqu'à 48h avant l'arrivée. Remboursement intégral si l'hôtel ne confirme pas la disponibilité." : 'Free cancellation up to 48h before check-in. Full refund if the hotel cannot confirm availability.'}</span>
              </div>
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
    const [pm, setPm] = useState('orange')
    const [busy, setBusy] = useState(false)
    const [proof, setProof] = useState({ payerPhone: '', txId: '', proofImage: '' })
    const [uploading, setUploading] = useState(false)
    if (!draft) { goto('home'); return null }
    const { hotel, room } = draft
    const nights = Math.max(1, Math.round((new Date(draft.checkOut) - new Date(draft.checkIn)) / 86400000))
    const subtotalCDF = room.priceCDF * nights
    const totalDisplay = priceIn(subtotalCDF)
    const baseConverted = currency === 'CDF' ? subtotalCDF : Math.round((subtotalCDF / rates[currency]))
    const feeAmount = currency === 'CDF' ? 0 : totalDisplay - baseConverted
    const isInstant = ['visa', 'mastercard', 'stripe', 'paypal'].includes(pm)
    const isMobile = ['orange', 'airtel', 'mpesa'].includes(pm)
    const needsProof = isMobile || pm === 'bank'

    const onProofFile = async (e) => {
      const f = (e.target.files || [])[0]; if (!f) return
      setUploading(true)
      try { const d = await resizeImage(f); setProof((p) => ({ ...p, proofImage: d })) } catch (err) { toast.error(String(err)) } finally { setUploading(false) }
    }

    const submit = async () => {
      if (!cust.name || !cust.email) { toast.error(lang === 'fr' ? 'Veuillez remplir votre nom et email.' : 'Please fill in your name and email.'); return }
      if (needsProof && !proof.txId && !proof.proofImage) { toast.error(lang === 'fr' ? "Saisissez l'ID de transaction ou ajoutez une capture du paiement." : 'Enter the transaction ID or upload a payment screenshot.'); return }
      setBusy(true)
      try {
        const payment = (needsProof || pm === 'hotel') ? { payerPhone: proof.payerPhone || cust.phone, txId: proof.txId, proofImage: proof.proofImage } : undefined
        const r = await fetch('/api/bookings', {
          method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
          body: JSON.stringify({ hotelId: hotel.id, roomId: room.id, checkIn: draft.checkIn, checkOut: draft.checkOut, guests: draft.guests, currency, customer: cust, paymentMethod: pm, payment }),
        })
        const data = await r.json()
        if (data.error) throw new Error(data.error)
        setResult(data)
        goto('confirmation')
        toast.success(isInstant ? (lang === 'fr' ? 'Paiement reçu !' : 'Payment received!') : (lang === 'fr' ? 'Paiement soumis — en attente de vérification' : 'Payment submitted — pending verification'))
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

              {needsProof && (
                <div className="mt-4 rounded-lg border bg-muted/30 p-4 space-y-3">
                  <div className="text-sm font-semibold flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" />{isMobile ? (lang === 'fr' ? 'Paiement Mobile Money' : 'Mobile Money payment') : (lang === 'fr' ? 'Virement bancaire' : 'Bank transfer')}</div>
                  <p className="text-xs text-muted-foreground">{lang === 'fr' ? 'Envoyez le montant au compte YABISO ci-dessous, puis renseignez les détails de la transaction. YABISO vérifiera et confirmera votre paiement.' : 'Send the amount to the YABISO account below, then provide the transaction details. YABISO will verify and confirm your payment.'}</p>
                  <div className="rounded-md bg-background border p-2 text-xs font-mono">{isMobile ? 'YABISO ' + pm.toUpperCase() + ' : +243 99 000 0000 (BissaGlobal Services)' : 'YABISO HOTELS — RAWBANK — Compte: 0123-4567-8901 (BissaGlobal Services)'}</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div><Label className="text-xs">{isMobile ? (lang === 'fr' ? 'Numéro payeur' : 'Payer phone') : 'IBAN / Réf.'}</Label><Input value={proof.payerPhone} onChange={(e) => setProof({ ...proof, payerPhone: e.target.value })} placeholder={isMobile ? '+243...' : 'Réf. virement'} className="mt-1" /></div>
                    <div><Label className="text-xs">{lang === 'fr' ? 'ID de transaction' : 'Transaction ID'}</Label><Input value={proof.txId} onChange={(e) => setProof({ ...proof, txId: e.target.value })} placeholder="ex: ABC123456" className="mt-1" /></div>
                  </div>
                  <div>
                    <Label className="text-xs">{lang === 'fr' ? 'Capture du paiement (optionnel)' : 'Payment screenshot (optional)'}</Label>
                    <label className="mt-1 flex items-center gap-3 cursor-pointer">
                      <div className="border-2 border-dashed rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted/40 flex items-center gap-2">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}{lang === 'fr' ? 'Téléverser' : 'Upload'}</div>
                      {proof.proofImage && <img src={proof.proofImage} alt="" className="h-12 w-12 rounded object-cover border" />}
                      <input type="file" accept="image/*" className="hidden" onChange={onProofFile} />
                    </label>
                  </div>
                </div>
              )}
              {pm === 'hotel' && (
                <div className="mt-4 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">{lang === 'fr' ? 'Vous paierez directement à l\'hôtel à votre arrivée. YABISO confirmera la disponibilité avant votre séjour.' : 'You will pay directly at the hotel on arrival. YABISO will confirm availability before your stay.'}</div>
              )}

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
              <Button onClick={submit} disabled={busy} className="w-full mt-4 h-11 font-semibold gap-2">{busy ? t('processing') : <><CreditCard className="h-4 w-4" />{isInstant ? t('pay_now') : (lang === 'fr' ? 'Soumettre le paiement' : 'Submit payment')}</>}</Button>
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
    const pay = result.payment || {}
    const pending = pay.status === 'pending'
    const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=' + encodeURIComponent('YABISO-' + result.reference)
    return (
      <main className="container py-12 max-w-3xl">
        <div className="text-center">
          <div className={`mx-auto h-16 w-16 rounded-full grid place-items-center mb-4 ${pending ? 'bg-[#F4B400]/20' : 'bg-green-100 dark:bg-green-950'}`}>{pending ? <Wallet className="h-9 w-9 text-[#F4B400]" /> : <CheckCircle2 className="h-9 w-9 text-green-600" />}</div>
          <h1 className="text-2xl md:text-3xl font-extrabold">{pending ? (lang === 'fr' ? 'Réservation enregistrée !' : 'Booking recorded!') : t('conf_title')}</h1>
          <p className="text-muted-foreground mt-2">{pending ? (lang === 'fr' ? 'Votre paiement est en cours de vérification par YABISO. Référence :' : 'Your payment is being verified by YABISO. Reference:') : t('conf_sub')}</p>
          <div className="mt-3 inline-block rounded-xl bg-primary/10 text-primary px-6 py-3 text-2xl font-extrabold tracking-wider">{result.reference}</div>
          <p className="text-sm text-muted-foreground mt-3">{t('conf_email')}</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          <Card className="p-4 border flex flex-col items-center justify-center text-center">
            <img src={qrUrl} alt="QR" className="h-32 w-32" />
            <div className="text-xs text-muted-foreground mt-2">{lang === 'fr' ? 'Présentez ce QR à l\'arrivée' : 'Show this QR at check-in'}</div>
          </Card>
          <Card className="p-5 border sm:col-span-2">
            <div className="flex gap-4 items-center">
              <img src={result.hotelImage} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="font-bold">{result.hotelName}</div>
                <div className="text-sm text-muted-foreground">{result.roomName} · {result.hotelCity}</div>
                <div className="text-sm text-muted-foreground">{result.checkIn} → {result.checkOut} · {result.nights} {t('nights_label')}</div>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">{lang === 'fr' ? 'Paiement' : 'Payment'} · {(pay.method || '').toUpperCase()}</div>
                <Badge className={`mt-1 ${pay.status === 'approved' ? 'bg-green-600 hover:bg-green-600' : pay.status === 'rejected' ? 'bg-destructive hover:bg-destructive' : 'bg-[#F4B400] text-black hover:bg-[#F4B400]'}`}>{pay.status === 'approved' ? (lang === 'fr' ? 'Approuvé' : 'Approved') : pay.status === 'rejected' ? (lang === 'fr' ? 'Rejeté' : 'Rejected') : (lang === 'fr' ? 'En attente de vérification' : 'Pending verification')}</Badge>
              </div>
              <div className="text-xl font-extrabold text-primary">{SYMBOLS[result.currency]}{result.totalDisplay.toLocaleString('fr-FR')}{result.currency === 'CDF' ? ' FC' : ''}</div>
            </div>
          </Card>
        </div>

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

        <div className="text-center mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={() => goto('invoice')} className="gap-2"><ClipboardList className="h-4 w-4" />{lang === 'fr' ? 'Voir / Imprimer la facture' : 'View / Print invoice'}</Button>
          <Button variant="outline" onClick={() => { goto('home'); loadHotels() }}>{t('back_home')}</Button>
        </div>
      </main>
    )
  }

  /* ----------------------------- INVOICE ----------------------------- */
  const InvoiceView = () => {
    if (!result) { goto('home'); return null }
    const r = result
    const sym = SYMBOLS[r.currency]
    const amt = (n) => sym + (n || 0).toLocaleString('fr-FR') + (r.currency === 'CDF' ? ' FC' : '')
    return (
      <main className="container py-8 max-w-3xl">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <button onClick={() => goto('confirmation')} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"><ArrowRight className="h-3.5 w-3.5 rotate-180" />{t('back')}</button>
          <Button onClick={() => window.print()} className="gap-2"><ClipboardList className="h-4 w-4" />{lang === 'fr' ? 'Imprimer' : 'Print'}</Button>
        </div>
        <Card className="p-8 border" id="invoice">
          <div className="flex justify-between items-start border-b pb-4 mb-4">
            <div>
              <div className="text-2xl font-extrabold">YABISO<span className="text-[#F4B400]"> HOTELS</span></div>
              <div className="text-xs text-muted-foreground">Powered by BissaGlobal Services</div>
            </div>
            <div className="text-right text-sm">
              <div className="font-bold">{lang === 'fr' ? 'FACTURE' : 'INVOICE'}</div>
              <div className="font-mono">{r.reference}</div>
              <div className="text-muted-foreground">{new Date(r.createdAt || Date.now()).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <div className="font-semibold mb-1">{lang === 'fr' ? 'Client' : 'Customer'}</div>
              <div>{r.customer?.name}</div>
              <div className="text-muted-foreground">{r.customer?.email}</div>
              <div className="text-muted-foreground">{r.customer?.phone}</div>
            </div>
            <div className="sm:text-right">
              <div className="font-semibold mb-1">{lang === 'fr' ? 'Hébergement' : 'Stay'}</div>
              <div>{r.hotelName}</div>
              <div className="text-muted-foreground">{r.roomName} · {r.hotelCity}</div>
              <div className="text-muted-foreground">{r.checkIn} → {r.checkOut} ({r.nights} {t('nights_label')})</div>
            </div>
          </div>
          <table className="w-full text-sm border-t">
            <tbody>
              <tr className="border-b"><td className="py-2">{r.roomName} × {r.nights} {t('nights_label')}</td><td className="py-2 text-right">{amt(r.totalDisplay)}</td></tr>
              {r.currency !== 'CDF' && <tr className="border-b text-xs text-muted-foreground"><td className="py-2">{t('exchange_rate')}: 1 {r.currency} = {(r.rateUsed || 0).toLocaleString('fr-FR')} FC · {t('conv_fee')} {Math.round((r.conversionFee || 0) * 100)}%</td><td></td></tr>}
              <tr className="font-extrabold text-lg"><td className="py-3">{t('total')}</td><td className="py-3 text-right text-primary">{amt(r.totalDisplay)}</td></tr>
            </tbody>
          </table>
          <div className="mt-4 text-xs text-muted-foreground">
            <div>{lang === 'fr' ? 'Paiement' : 'Payment'}: {(r.payment?.method || '').toUpperCase()} — {r.payment?.status}</div>
            <div className="mt-2">{r.cancellationPolicy}</div>
          </div>
          <div className="mt-6 text-center text-xs text-muted-foreground border-t pt-4">YABISO HOTELS — AFRICA BOOKS WITH CONFIDENCE — support@yabiso.com · +243 99 000 0000</div>
        </Card>
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
      <div className="mb-10 rounded-2xl border-2 border-[#F4B400] bg-[#F4B400]/10 p-6 text-center">
        <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-extrabold"><Gift className="h-7 w-7 text-[#F4B400]" />{lang === 'fr' ? '2 MOIS GRATUITS' : '2 MONTHS FREE'} <span className="text-primary">· 0% {lang === 'fr' ? 'commission' : 'commission'}</span></div>
        <p className="text-muted-foreground mt-2">{lang === 'fr' ? "Pour tout nouvel hôtel inscrit dès maintenant. Aucune commission prélevée pendant vos 2 premiers mois." : 'For every new hotel listed now. No commission charged during your first 2 months.'}</p>
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
  const EcosystemBanner = () => (
    <section className="container py-10">
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-[#0057B8] via-[#0a4aa0] to-[#052a63] text-white shadow-xl">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-[#F4B400]/20 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[#E4002B]/20 blur-2xl" />
        <div className="relative p-6 sm:p-10 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider bg-white/10 border border-white/20 rounded-full px-3 py-1 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-[#F4B400]" />{lang === 'fr' ? 'Écosystème BissaGlobal Services' : 'BissaGlobal Services Ecosystem'}
            </div>
            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold leading-tight">
              {lang === 'fr' ? 'Un écosystème complet pour l\u2019Afrique' : 'A complete ecosystem for Africa'}
            </h2>
            <p className="mt-3 text-white/80 max-w-md text-sm sm:text-base">
              {lang === 'fr'
                ? 'YABISO fait partie de la famille BissaGlobal Services : voyage, emploi et bien plus, au service des talents et voyageurs africains.'
                : 'YABISO is part of the BissaGlobal Services family: travel, jobs and more, serving African talents and travelers.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm backdrop-blur">
                <Building2 className="h-4 w-4 text-[#F4B400]" />YABISO Hotels
                <span className="text-[10px] bg-[#F4B400] text-black font-bold rounded px-1.5 py-0.5">{lang === 'fr' ? 'Vous êtes ici' : 'You are here'}</span>
              </span>
            </div>
          </div>
          <div className="rounded-2xl bg-white text-foreground p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#0057B8] to-[#E4002B] flex items-center justify-center text-white shrink-0">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <div className="font-extrabold text-lg leading-none">YABISO <span className="text-[#0057B8]">Boulot</span></div>
                <div className="text-xs text-muted-foreground mt-1">{lang === 'fr' ? 'Emploi & Recrutement en RDC' : 'Jobs & Recruitment in DRC'}</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {lang === 'fr'
                ? 'Trouvez le bon emploi et construisez votre avenir : offres d\u2019emploi, CV professionnel par IA, formations et recrutement pour les entreprises.'
                : 'Find the right job and build your future: job offers, AI-powered CV, training and recruitment for companies.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(lang === 'fr'
                ? ['Offres d\u2019emploi', 'CV par IA', 'Formations', 'Recrutement RH']
                : ['Job offers', 'AI CV', 'Training', 'HR recruitment']
              ).map((tag) => (
                <span key={tag} className="text-[11px] font-medium bg-muted text-foreground rounded-full px-2.5 py-1">{tag}</span>
              ))}
            </div>
            <a href="https://yabisoboulot.com" target="_blank" rel="noreferrer" className="mt-5 block">
              <Button className="w-full gap-2 bg-[#0057B8] hover:bg-[#004a9e] text-white">
                {lang === 'fr' ? 'Découvrir YABISO Boulot' : 'Discover YABISO Boulot'}<ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  )

  const Footer = () => (
    <footer className="border-t bg-muted/30 mt-10">
      <div className="container py-12 grid gap-8 md:grid-cols-4">
        <div>
          <img src={LOGO_LIGHT} alt="YABISO HOTELS" className="h-16 w-auto object-contain block dark:hidden" />
          <img src={LOGO_DARK} alt="YABISO HOTELS" className="h-16 w-auto object-contain hidden dark:block" />
          <p className="text-sm text-muted-foreground mt-2">Réservez • Séjournez • Découvrez l'Afrique</p>
          <p className="text-xs text-muted-foreground mt-3">Powered by BissaGlobal Services</p>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm">YABISO</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><button onClick={() => goto('partner')} className="hover:text-primary">{t('nav_partner')}</button></li>
            <li><button onClick={() => goto('search')} className="hover:text-primary">{t('nav_destinations')}</button></li>
            <li><a href="/ville" className="hover:text-primary">Hôtels par ville</a></li>
            <li><a href="/rdc" className="hover:text-primary">Hôtels RDC (provinces)</a></li>
            <li><button onClick={() => openServices('excursion')} className="hover:text-primary">{lang === 'fr' ? 'Services (Excursions, Taxis, Transferts, Voitures)' : 'Services (Tours, Taxis, Transfers, Cars)'}</button></li>
            <li><a href="https://yabisoboulot.com" target="_blank" rel="noreferrer" className="hover:text-primary inline-flex items-center gap-1">YABISO Boulot — {lang === 'fr' ? 'Emploi' : 'Jobs'}<ExternalLink className="h-3 w-3" /></a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm">RD Congo · 26 Provinces</div>
          <p className="text-sm text-muted-foreground">Kinshasa, Nord-Kivu, Sud-Kivu, Haut-Katanga, Kongo Central, Tshopo, Équateur, Lualaba, Kasaï...</p>
          <a href="/rdc" className="text-sm text-primary hover:underline mt-2 inline-block">Toutes les provinces →</a>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm">Support</div>
          <a href="https://wa.me/243990000000" target="_blank" rel="noreferrer"><Button variant="outline" size="sm" className="gap-2 border-green-500 text-green-600"><Phone className="h-4 w-4" />WhatsApp</Button></a>
        </div>
      </div>
      <div className="border-t py-5 text-center text-xs text-muted-foreground space-y-1">
        <div><strong className="text-foreground">BissaGlobal Services SARL</strong> — {lang === 'fr' ? 'société enregistrée à Kinshasa (RDC)' : 'company registered in Kinshasa (DRC)'}</div>
        <div>RCCM : CD/KNG/RCCM/23-B-02683 · {lang === 'fr' ? 'N° Impôt' : 'Tax ID'} : A232757OT · {lang === 'fr' ? 'Télécommunications & médias numériques' : 'Telecommunications & digital media'}</div>
        <div className="pt-1">© {new Date().getFullYear()} YABISO HOTELS — AFRICA BOOKS WITH CONFIDENCE.</div>
      </div>
    </footer>
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnnouncementBar lang={lang} onPartner={() => goto('partner')} />
      <Header />
      {view === 'home' && Home()}
      {view === 'search' && SearchView()}
      {view === 'services' && ServicesView()}
      {view === 'hotel' && <HotelView />}
      {view === 'booking' && <BookingView />}
      {view === 'confirmation' && <ConfirmationView />}
      {view === 'invoice' && <InvoiceView />}
      {view === 'partner' && <PartnerView />}
      {view === 'agent' && <AgentModule lang={lang} onBack={() => { goto('home'); loadHotels() }} />}
      {view === 'account' && <AccountView lang={lang} user={user} token={token} bookings={myBookings} hotels={hotels} favorites={favorites} fmt={fmt} onOpenHotel={openHotel} onLogin={() => setAuthOpen(true)} onRefresh={loadMyBookings} />}
      {view === 'admin' && <AdminDashboard lang={lang} token={token} onBack={() => goto('home')} />}
      {view === 'owner' && <OwnerDashboard lang={lang} token={token} user={user} onBack={() => goto('home')} />}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} lang={lang} onSuccess={onAuthSuccess} />
      <Dialog open={!!svcModal} onOpenChange={(o) => { if (!o) { setSvcModal(null); setSvcResult(null) } }}>
        <DialogContent className="max-w-md">
          {svcResult ? (
            <div className="text-center py-4">
              <div className="mx-auto h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-3"><CalendarCheck className="h-7 w-7 text-green-600" /></div>
              <DialogHeader><DialogTitle className="text-center">{lang === 'fr' ? 'Demande envoyée !' : 'Request sent!'}</DialogTitle></DialogHeader>
              <p className="text-sm text-muted-foreground mt-2">{lang === 'fr' ? 'Votre référence' : 'Your reference'}</p>
              <p className="text-xl font-extrabold text-primary tracking-wide">{svcResult.reference}</p>
              <p className="text-sm text-muted-foreground mt-3">{lang === 'fr' ? 'Notre équipe vous contactera par email pour confirmer.' : 'Our team will contact you by email to confirm.'}</p>
              <div className="mt-4 text-sm"><span className="text-muted-foreground">{lang === 'fr' ? 'Montant estimé : ' : 'Estimated amount: '}</span><strong>{SYMBOLS[svcResult.currency]}{(svcResult.totalDisplay || 0).toLocaleString('fr-FR')}{svcResult.currency === 'CDF' ? ' FC' : ''}</strong></div>
              <Button className="w-full mt-5" onClick={() => { setSvcModal(null); setSvcResult(null) }}>{lang === 'fr' ? 'Fermer' : 'Close'}</Button>
            </div>
          ) : svcModal ? (
            <div>
              <DialogHeader><DialogTitle>{lang === 'fr' ? 'Réserver : ' : 'Book: '}{lang === 'fr' ? svcModal.name : (svcModal.nameEn || svcModal.name)}</DialogTitle></DialogHeader>
              <div className="flex items-center gap-3 my-3 p-2 rounded-lg bg-muted/50">
                <img src={svcModal.image} alt="" className="h-12 w-12 rounded object-cover" />
                <div className="text-sm"><div className="font-semibold">{fmt(svcModal.priceCDF)} <span className="text-xs text-muted-foreground font-normal">{lang === 'fr' ? svcModal.unit : (svcModal.unitEn || svcModal.unit)}</span></div><div className="text-xs text-muted-foreground">{svcModal.city}, {svcModal.country}</div></div>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>{lang === 'fr' ? 'Nom complet' : 'Full name'}</Label><Input value={svcForm.name} onChange={(e) => setSvcForm({ ...svcForm, name: e.target.value })} className="mt-1" /></div>
                  <div><Label>{lang === 'fr' ? 'Téléphone' : 'Phone'}</Label><Input value={svcForm.phone} onChange={(e) => setSvcForm({ ...svcForm, phone: e.target.value })} className="mt-1" /></div>
                </div>
                <div><Label>Email</Label><Input type="email" value={svcForm.email} onChange={(e) => setSvcForm({ ...svcForm, email: e.target.value })} className="mt-1" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>{lang === 'fr' ? 'Date souhaitée' : 'Preferred date'}</Label><Input type="date" value={svcForm.date} onChange={(e) => setSvcForm({ ...svcForm, date: e.target.value })} className="mt-1" /></div>
                  <div><Label>{lang === 'fr' ? 'Quantité' : 'Quantity'}</Label><Input type="number" min={1} value={svcForm.quantity} onChange={(e) => setSvcForm({ ...svcForm, quantity: Math.max(1, parseInt(e.target.value || 1)) })} className="mt-1" /></div>
                </div>
                <div><Label>{lang === 'fr' ? 'Notes (optionnel)' : 'Notes (optional)'}</Label><Textarea value={svcForm.notes} onChange={(e) => setSvcForm({ ...svcForm, notes: e.target.value })} className="mt-1" rows={2} /></div>
                <div className="flex items-center justify-between pt-1">
                  <div className="text-sm text-muted-foreground">{lang === 'fr' ? 'Total estimé' : 'Estimated total'}</div>
                  <div className="text-lg font-extrabold text-primary">{fmt(svcModal.priceCDF * (svcForm.quantity || 1))}</div>
                </div>
                <Button className="w-full" disabled={svcSubmitting} onClick={submitSvcRequest}>{svcSubmitting ? '...' : (lang === 'fr' ? 'Envoyer la demande' : 'Send request')}</Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      {adOpen && AD_VIDEOS[adIndex] && (
        <div className="fixed bottom-4 right-4 z-[70] w-[290px] sm:w-[340px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
            <span className="text-[10px] font-bold bg-amber-400 text-black px-1.5 py-0.5 rounded">{lang === 'fr' ? 'PUBLICITÉ' : 'AD'}</span>
            <img src={LOGO_DARK} alt="YABISO" className="h-4 w-auto opacity-90" />
          </div>
          <button onClick={() => { if (adHideTimer.current) clearTimeout(adHideTimer.current); setAdOpen(false) }} aria-label="Fermer"
            className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition">
            <X className="h-4 w-4" />
          </button>
          <video key={adIndex} ref={adVideoRef} src={AD_VIDEOS[adIndex]} autoPlay loop muted={adMuted} playsInline preload="auto"
            className="w-full h-auto block max-h-[420px] object-cover bg-black" />
          <div className="absolute bottom-2 right-2 z-10 flex gap-2">
            <button onClick={() => setAdMuted((m) => !m)}
              className="flex items-center gap-1 text-xs font-medium bg-black/60 text-white px-2.5 py-1.5 rounded-full hover:bg-black/80 transition">
              {adMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              {adMuted ? (lang === 'fr' ? 'Activer le son' : 'Unmute') : (lang === 'fr' ? 'Muet' : 'Mute')}
            </button>
          </div>
          <button onClick={() => { if (adHideTimer.current) clearTimeout(adHideTimer.current); setAdOpen(false); goto('search') }}
            className="absolute bottom-2 left-2 z-10 text-xs font-semibold bg-primary text-primary-foreground px-2.5 py-1.5 rounded-full hover:opacity-90 transition">
            {lang === 'fr' ? 'Réserver' : 'Book now'}
          </button>
        </div>
      )}
      {EcosystemBanner()}
      <Footer />
    </div>
  )
}

export default App

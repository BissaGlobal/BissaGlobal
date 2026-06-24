'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
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
import { toast } from 'sonner'
import {
  Wifi, Waves, Utensils, Car, Snowflake, Sparkles, Dumbbell, Wine, Plane, Coffee,
  Star, MapPin, Search, Heart, Moon, Sun, Check, ShieldCheck, Phone, Calendar as CalIcon,
  Users, Globe, ArrowRight, BadgeCheck, CheckCircle2, CreditCard, Building2, Quote, Menu, X,
  Plus, Trash2, Camera, Locate, ClipboardList, LayoutDashboard, LogOut, Activity, Image as ImageIcon, Loader2, UserCog,
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
      {view === 'agent' && <AgentModule lang={lang} onBack={() => { goto('home'); loadHotels() }} />}
      <Footer />
    </div>
  )
}

export default App

import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import IMPORTED_HOTELS from './importedHotels.json'
import { ICON_192, ICON_512 } from '../../pwaIcons'
import { LOGO_B64, BANNER_B64 } from '../../brandAssets'
import { galleryFor } from '../../hotelImages'

// ---------------- Auth helpers (simple JWT-like HMAC) ----------------
const AUTH_SECRET = process.env.AUTH_SECRET || crypto.randomBytes(32).toString('hex')
function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(body).digest('base64url')
  return body + '.' + sig
}
function verifyToken(token) {
  if (!token) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(body).digest('base64url')
  if (sig !== expected) return null
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (p.exp && Date.now() > p.exp) return null
    return p
  } catch (e) { return null }
}
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(String(pw), salt, 100000, 64, 'sha512').toString('hex')
  return salt + ':' + hash
}
function verifyPassword(pw, stored) {
  if (!stored || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  const h = crypto.pbkdf2Sync(String(pw), salt, 100000, 64, 'sha512').toString('hex')
  return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(hash))
}
function publicUser(u) {
  if (!u) return null
  const { _id, passwordHash, ...rest } = u
  return rest
}
async function getAuthUser(db, request) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '').trim()
  const p = verifyToken(token)
  if (!p) return null
  const u = await db.collection('users').findOne({ id: p.id })
  return u || null
}

// ---------------- Email notifications (Resend) ----------------
import { Resend } from 'resend'
const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const RESEND_FROM = process.env.RESEND_FROM || 'YABISO HOTELS <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bissa@bgsrdc.om'
const resendClient = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

function emailLayout(title, bodyHtml) {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
  <body style="margin:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <div style="max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#1e3a8a;border-radius:12px 12px 0 0;padding:20px 24px;text-align:center;">
        <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:1px;">YABISO <span style="color:#fbbf24;">HOTELS</span></h1>
      </div>
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:28px 24px;">
        <h2 style="margin:0 0 16px;color:#1e3a8a;font-size:18px;">${title}</h2>
        ${bodyHtml}
      </div>
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:18px;">© ${new Date().getFullYear()} YABISO HOTELS — Réservation d'hôtels en Afrique subsaharienne</p>
    </div>
  </body></html>`
}

async function sendEmailSafe({ to, subject, html }) {
  if (!resendClient) { console.warn('[email] RESEND_API_KEY manquant, email non envoyé:', subject); return { skipped: true } }
  try {
    const recipients = Array.isArray(to) ? to : [to]
    const { data, error } = await resendClient.emails.send({ from: RESEND_FROM, to: recipients, subject, html })
    if (error) { console.error('[email] Erreur Resend:', subject, JSON.stringify(error)); return { error } }
    return { data }
  } catch (e) {
    console.error('[email] Exception envoi:', subject, e?.message || e)
    return { error: e?.message || 'send failed' }
  }
}

// Fire-and-forget so the API response is never blocked or broken by email issues
async function notifyRegistration(user) {
  const adminHtml = emailLayout('Nouvelle inscription utilisateur', `
    <p>Un nouvel utilisateur vient de créer un compte sur YABISO HOTELS :</p>
    <table style="width:100%;border-collapse:collapse;margin-top:8px;">
      <tr><td style="padding:6px 0;color:#6b7280;">Nom</td><td style="padding:6px 0;font-weight:bold;">${user.name || '-'}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;font-weight:bold;">${user.email || '-'}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;">${new Date().toLocaleString('fr-FR')}</td></tr>
    </table>`)
  const clientHtml = emailLayout(`Bienvenue ${user.name || ''} !`, `
    <p>Merci de vous être inscrit sur <strong>YABISO HOTELS</strong>, votre marketplace de réservation d'hôtels en Afrique subsaharienne.</p>
    <p>Votre compte a été créé avec succès avec l'adresse <strong>${user.email}</strong>.</p>
    <p>Vous pouvez dès à présent rechercher et réserver les meilleurs hôtels.</p>
    <p style="margin-top:20px;">À très bientôt,<br/>L'équipe YABISO HOTELS</p>`)
  await Promise.all([
    sendEmailSafe({ to: ADMIN_EMAIL, subject: 'Nouvelle inscription — ' + (user.name || user.email), html: adminHtml }),
    user.email ? sendEmailSafe({ to: user.email, subject: 'Bienvenue sur YABISO HOTELS', html: clientHtml }) : Promise.resolve(),
  ])
}

async function notifyBooking(booking) {
  const fmt = (d) => { try { return new Date(d).toLocaleDateString('fr-FR') } catch { return d } }
  const c = booking.customer || {}
  const details = `
    <table style="width:100%;border-collapse:collapse;margin-top:8px;">
      <tr><td style="padding:6px 0;color:#6b7280;">Référence</td><td style="padding:6px 0;font-weight:bold;">${booking.reference}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Hôtel</td><td style="padding:6px 0;font-weight:bold;">${booking.hotelName || '-'}${booking.hotelCity ? ' — ' + booking.hotelCity : ''}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Chambre</td><td style="padding:6px 0;">${booking.roomName || '-'}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Arrivée</td><td style="padding:6px 0;">${fmt(booking.checkIn)}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Départ</td><td style="padding:6px 0;">${fmt(booking.checkOut)}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Nuits</td><td style="padding:6px 0;">${booking.nights}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Voyageurs</td><td style="padding:6px 0;">${booking.guests}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Montant</td><td style="padding:6px 0;font-weight:bold;color:#1e3a8a;">${booking.totalDisplay} ${booking.currency}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Paiement</td><td style="padding:6px 0;">${booking.paymentMethod} (${booking.status})</td></tr>
    </table>`
  const adminHtml = emailLayout('Nouvelle réservation reçue', `
    <p>Une nouvelle réservation vient d'être enregistrée :</p>
    ${details}
    <p style="margin-top:12px;color:#6b7280;">Client : <strong>${c.name || '-'}</strong> — ${c.email || '-'} — ${c.phone || '-'}</p>`)
  const clientHtml = emailLayout(`Confirmation de réservation — ${booking.reference}`, `
    <p>Bonjour ${c.name || ''},</p>
    <p>Nous avons bien reçu votre demande de réservation sur <strong>YABISO HOTELS</strong>. Voici le récapitulatif :</p>
    ${details}
    <p style="margin-top:12px;">${booking.cancellationPolicy || ''}</p>
    <p style="margin-top:16px;">Merci de votre confiance,<br/>L'équipe YABISO HOTELS</p>`)
  await Promise.all([
    sendEmailSafe({ to: ADMIN_EMAIL, subject: 'Nouvelle réservation — ' + booking.reference, html: adminHtml }),
    c.email ? sendEmailSafe({ to: c.email, subject: 'Confirmation de votre réservation YABISO ' + booking.reference, html: clientHtml }) : Promise.resolve(),
  ])
}

async function notifyServiceRequest(req) {
  const c = req.customer || {}
  const details = `
    <table style="width:100%;border-collapse:collapse;margin-top:8px;">
      <tr><td style="padding:6px 0;color:#6b7280;">Référence</td><td style="padding:6px 0;font-weight:bold;">${req.reference}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;font-weight:bold;">${req.serviceName || '-'}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Ville</td><td style="padding:6px 0;">${req.city || '-'}, ${req.country || ''}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;">${req.date || '-'}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Quantité</td><td style="padding:6px 0;">${req.quantity || 1}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Montant estimé</td><td style="padding:6px 0;font-weight:bold;color:#1e3a8a;">${req.totalDisplay} ${req.currency}</td></tr>
    </table>`
  const adminHtml = emailLayout('Nouvelle demande de service', `
    <p>Une nouvelle demande de service vient d'être reçue :</p>${details}
    <p style="margin-top:12px;color:#6b7280;">Client : <strong>${c.name || '-'}</strong> — ${c.email || '-'} — ${c.phone || '-'}</p>
    ${req.notes ? `<p style="margin-top:8px;color:#6b7280;">Note : ${req.notes}</p>` : ''}`)
  const clientHtml = emailLayout(`Demande reçue — ${req.reference}`, `
    <p>Bonjour ${c.name || ''},</p>
    <p>Nous avons bien reçu votre demande pour <strong>${req.serviceName}</strong> sur YABISO. Notre équipe vous contactera pour confirmer.</p>
    ${details}
    <p style="margin-top:16px;">Merci de votre confiance,<br/>L'équipe YABISO</p>`)
  await Promise.all([
    sendEmailSafe({ to: ADMIN_EMAIL, subject: 'Nouvelle demande de service — ' + req.reference, html: adminHtml }),
    c.email ? sendEmailSafe({ to: c.email, subject: 'Votre demande YABISO ' + req.reference, html: clientHtml }) : Promise.resolve(),
  ])
}


async function ensureAdmin(db) {
  const existing = await db.collection('users').findOne({ email: 'admin@yabiso.com' })
  if (!existing) {
    await db.collection('users').insertOne({
      id: uuidv4(), name: 'YABISO Admin', email: 'admin@yabiso.com',
      passwordHash: hashPassword('yabiso2025'), role: 'admin', favorites: [], createdAt: new Date(),
    })
  }
}

// ---------------- MongoDB ----------------
let client
let db
let connecting

async function connectToMongo() {
  if (db) return db
  if (!connecting) {
    connecting = (async () => {
      client = new MongoClient(process.env.MONGO_URL)
      await client.connect()
      db = client.db(process.env.DB_NAME)
      return db
    })()
  }
  return connecting
}

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// ---------------- Exchange rates ----------------
// Rates = how many CDF per 1 unit of foreign currency (configurable)
const DEFAULT_RATES = { USD: 2850, EUR: 3080, GBP: 3600, XAF: 4.7 }
const DEFAULT_FEE = 0.07 // 7% markup on foreign currency payments
const DEFAULT_COMMISSION = 0.3 // 30% YABISO commission
const ONLINE_MARKUP = 1.2 // +20% markup applied to hotels imported online (Google Places)

const IMG = {
  ex1: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=900&q=80',
  ex2: 'https://images.unsplash.com/photo-1577971132997-c10be9372519?auto=format&fit=crop&w=900&q=80',
  ex3: 'https://images.pexels.com/photos/5574045/pexels-photo-5574045.jpeg?auto=compress&cs=tinysrgb&w=900',
  ex4: 'https://images.pexels.com/photos/14074141/pexels-photo-14074141.jpeg?auto=compress&cs=tinysrgb&w=900',
  tr1: 'https://images.unsplash.com/photo-1495150434753-f8ceb319e9dc?auto=format&fit=crop&w=900&q=80',
  tr2: 'https://images.unsplash.com/photo-1769000480434-94113189f154?auto=format&fit=crop&w=900&q=80',
  tr3: 'https://images.pexels.com/photos/15511266/pexels-photo-15511266.jpeg?auto=compress&cs=tinysrgb&w=900',
  tr4: 'https://images.unsplash.com/photo-1647206826104-6df8ef5fc59f?auto=format&fit=crop&w=900&q=80',
  tx1: 'https://images.unsplash.com/photo-1628947733273-cdae71c9bfd3?auto=format&fit=crop&w=900&q=80',
  tx2: 'https://images.unsplash.com/photo-1613638377394-281765460baa?auto=format&fit=crop&w=900&q=80',
  tx3: 'https://images.pexels.com/photos/13918522/pexels-photo-13918522.jpeg?auto=compress&cs=tinysrgb&w=900',
  tx4: 'https://images.pexels.com/photos/11171626/pexels-photo-11171626.jpeg?auto=compress&cs=tinysrgb&w=900',
  cr1: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
  cr2: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=900&q=80',
  cr3: 'https://images.unsplash.com/photo-1622893288761-823ba60f17a6?auto=format&fit=crop&w=900&q=80',
  cr4: 'https://images.pexels.com/photos/36548466/pexels-photo-36548466.jpeg?auto=compress&cs=tinysrgb&w=900',
}
const SAMPLE_SERVICES = [
  // Excursions
  { key: 'exc-kin-fleuve', type: 'excursion', name: 'Croisière sur le fleuve Congo', nameEn: 'Congo River Cruise', city: 'Kinshasa', province: 'Kinshasa', country: 'RD Congo', priceCDF: 65000, unit: 'par personne', unitEn: 'per person', meta: '3 heures', metaEn: '3 hours', image: IMG.ex1, description: "Croisière guidée au coucher du soleil sur le majestueux fleuve Congo, avec boissons de bienvenue.", descriptionEn: 'Guided sunset cruise on the majestic Congo River, with welcome drinks.' },
  { key: 'exc-kin-zongo', type: 'excursion', name: 'Excursion aux Chutes de Zongo', nameEn: 'Zongo Falls Day Trip', city: 'Kinshasa', province: 'Kongo Central', country: 'RD Congo', priceCDF: 95000, unit: 'par personne', unitEn: 'per person', meta: 'Journée complète', metaEn: 'Full day', image: IMG.ex2, description: "Journée nature aux impressionnantes chutes de Zongo : transport, guide et déjeuner inclus.", descriptionEn: 'Full nature day at the impressive Zongo Falls: transport, guide and lunch included.' },
  { key: 'exc-bzv-rapides', type: 'excursion', name: 'Visite des Rapides de Brazzaville', nameEn: 'Brazzaville Rapids Tour', city: 'Brazzaville', province: 'Brazzaville', country: 'Congo-Brazzaville', priceCDF: 55000, unit: 'par personne', unitEn: 'per person', meta: '4 heures', metaEn: '4 hours', image: IMG.ex3, description: "Découverte des célèbres rapides du fleuve Congo et du marché artisanal de Brazzaville.", descriptionEn: 'Discover the famous Congo River rapids and the Brazzaville craft market.' },
  { key: 'exc-goma-nyiragongo', type: 'excursion', name: 'Randonnée du volcan Nyiragongo', nameEn: 'Nyiragongo Volcano Trek', city: 'Goma', province: 'Nord-Kivu', country: 'RD Congo', priceCDF: 180000, unit: 'par personne', unitEn: 'per person', meta: '2 jours', metaEn: '2 days', image: IMG.ex4, description: "Trek guidé jusqu'au cratère du Nyiragongo et nuit au sommet face au lac de lave.", descriptionEn: 'Guided trek to the Nyiragongo crater and overnight at the summit facing the lava lake.' },
  // Transferts aéroport
  { key: 'tr-kin-ndjili', type: 'transfer', name: "Transfert Aéroport N'Djili ↔ Kinshasa", nameEn: "N'Djili Airport ↔ Kinshasa Transfer", city: 'Kinshasa', province: 'Kinshasa', country: 'RD Congo', priceCDF: 45000, unit: 'par trajet', unitEn: 'per trip', meta: "Jusqu'à 4 pers.", metaEn: 'Up to 4 pax', image: IMG.tr1, description: "Transfert privé climatisé entre l'aéroport international de N'Djili et votre hôtel.", descriptionEn: "Private air-conditioned transfer between N'Djili International Airport and your hotel." },
  { key: 'tr-bzv-maya', type: 'transfer', name: 'Transfert Aéroport Maya-Maya ↔ Brazzaville', nameEn: 'Maya-Maya Airport ↔ Brazzaville Transfer', city: 'Brazzaville', province: 'Brazzaville', country: 'Congo-Brazzaville', priceCDF: 40000, unit: 'par trajet', unitEn: 'per trip', meta: "Jusqu'à 4 pers.", metaEn: 'Up to 4 pax', image: IMG.tr2, description: "Navette privée entre l'aéroport Maya-Maya et le centre de Brazzaville.", descriptionEn: 'Private shuttle between Maya-Maya Airport and downtown Brazzaville.' },
  { key: 'tr-goma', type: 'transfer', name: 'Transfert Aéroport de Goma ↔ Hôtels', nameEn: 'Goma Airport ↔ Hotels Transfer', city: 'Goma', province: 'Nord-Kivu', country: 'RD Congo', priceCDF: 35000, unit: 'par trajet', unitEn: 'per trip', meta: "Jusqu'à 4 pers.", metaEn: 'Up to 4 pax', image: IMG.tr3, description: "Transfert sécurisé entre l'aéroport de Goma et votre hébergement.", descriptionEn: 'Secure transfer between Goma Airport and your accommodation.' },
  { key: 'tr-pnr', type: 'transfer', name: 'Transfert Aéroport Pointe-Noire ↔ Ville', nameEn: 'Pointe-Noire Airport ↔ City Transfer', city: 'Pointe-Noire', province: 'Pointe-Noire', country: 'Congo-Brazzaville', priceCDF: 42000, unit: 'par trajet', unitEn: 'per trip', meta: "Jusqu'à 4 pers.", metaEn: 'Up to 4 pax', image: IMG.tr4, description: "Navette privée entre l'aéroport Agostinho-Neto et le centre de Pointe-Noire.", descriptionEn: 'Private shuttle between Agostinho-Neto Airport and downtown Pointe-Noire.' },
  // Taxis
  { key: 'tx-kin', type: 'taxi', name: 'Taxi privé en ville - Kinshasa', nameEn: 'Private City Taxi - Kinshasa', city: 'Kinshasa', province: 'Kinshasa', country: 'RD Congo', priceCDF: 18000, unit: 'par course', unitEn: 'per ride', meta: "Jusqu'à 4 pers.", metaEn: 'Up to 4 pax', image: IMG.tx1, description: "Course en taxi privé climatisé à travers Kinshasa, chauffeur professionnel.", descriptionEn: 'Private air-conditioned taxi ride across Kinshasa with a professional driver.' },
  { key: 'tx-bzv', type: 'taxi', name: 'Taxi privé - Brazzaville', nameEn: 'Private Taxi - Brazzaville', city: 'Brazzaville', province: 'Brazzaville', country: 'Congo-Brazzaville', priceCDF: 16000, unit: 'par course', unitEn: 'per ride', meta: "Jusqu'à 4 pers.", metaEn: 'Up to 4 pax', image: IMG.tx2, description: "Déplacements en taxi privé dans Brazzaville et ses environs.", descriptionEn: 'Private taxi rides in Brazzaville and surroundings.' },
  { key: 'tx-lub', type: 'taxi', name: 'VTC chauffeur journée - Lubumbashi', nameEn: 'Chauffeur Day Hire - Lubumbashi', city: 'Lubumbashi', province: 'Haut-Katanga', country: 'RD Congo', priceCDF: 120000, unit: 'par jour', unitEn: 'per day', meta: 'Chauffeur dédié', metaEn: 'Dedicated driver', image: IMG.tx3, description: "Véhicule avec chauffeur à votre disposition toute la journée à Lubumbashi.", descriptionEn: 'Vehicle with driver at your disposal all day in Lubumbashi.' },
  { key: 'tx-goma', type: 'taxi', name: 'Taxi sécurisé - Goma', nameEn: 'Secure Taxi - Goma', city: 'Goma', province: 'Nord-Kivu', country: 'RD Congo', priceCDF: 12000, unit: 'par course', unitEn: 'per ride', meta: "Jusqu'à 4 pers.", metaEn: 'Up to 4 pax', image: IMG.tx4, description: "Service de taxi privé sécurisé pour vos déplacements à Goma.", descriptionEn: 'Secure private taxi service for getting around Goma.' },
  // Location de voitures
  { key: 'cr-kin-lc', type: 'car_rental', name: 'Toyota Land Cruiser + chauffeur - Kinshasa', nameEn: 'Toyota Land Cruiser + driver - Kinshasa', city: 'Kinshasa', province: 'Kinshasa', country: 'RD Congo', priceCDF: 150000, unit: 'par jour', unitEn: 'per day', meta: '7 places · chauffeur', metaEn: '7 seats · driver', image: IMG.cr1, description: "4x4 robuste avec chauffeur expérimenté, idéal pour la ville et les pistes.", descriptionEn: 'Rugged 4x4 with experienced driver, ideal for city and off-road.' },
  { key: 'cr-bzv-berline', type: 'car_rental', name: 'Berline climatisée - Brazzaville', nameEn: 'Air-conditioned Sedan - Brazzaville', city: 'Brazzaville', province: 'Brazzaville', country: 'Congo-Brazzaville', priceCDF: 90000, unit: 'par jour', unitEn: 'per day', meta: '4 places', metaEn: '4 seats', image: IMG.cr2, description: "Berline confortable et climatisée, avec ou sans chauffeur.", descriptionEn: 'Comfortable air-conditioned sedan, with or without driver.' },
  { key: 'cr-goma-4x4', type: 'car_rental', name: 'SUV 4x4 tout-terrain - Goma', nameEn: 'Off-road 4x4 SUV - Goma', city: 'Goma', province: 'Nord-Kivu', country: 'RD Congo', priceCDF: 130000, unit: 'par jour', unitEn: 'per day', meta: '5 places', metaEn: '5 seats', image: IMG.cr3, description: "SUV 4x4 parfait pour les routes du Nord-Kivu et excursions nature.", descriptionEn: 'Perfect 4x4 SUV for North Kivu roads and nature trips.' },
  { key: 'cr-pnr-suv', type: 'car_rental', name: 'SUV familial - Pointe-Noire', nameEn: 'Family SUV - Pointe-Noire', city: 'Pointe-Noire', province: 'Pointe-Noire', country: 'Congo-Brazzaville', priceCDF: 110000, unit: 'par jour', unitEn: 'per day', meta: '7 places', metaEn: '7 seats', image: IMG.cr4, description: "Grand SUV familial spacieux, idéal pour explorer la côte.", descriptionEn: 'Spacious family SUV, ideal for exploring the coast.' },
]

async function getSettings(db) {
  let s = await db.collection('settings').findOne({ id: 'global' })
  if (!s) {
    s = { id: 'global', rates: DEFAULT_RATES, fee: DEFAULT_FEE, commission: DEFAULT_COMMISSION, updatedAt: new Date() }
    await db.collection('settings').insertOne(s)
  }
  if (typeof s.commission !== 'number') s.commission = DEFAULT_COMMISSION
  s.rates = { ...DEFAULT_RATES, ...(s.rates || {}) }
  const { _id, ...rest } = s
  return rest
}

// ---------------- Seed data ----------------
const HIMG = [
  'https://images.unsplash.com/photo-1779216175784-a67b6da108bb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwzfHxBZnJpY2FuJTIwaG90ZWwlMjByZXNvcnR8ZW58MHx8fHwxNzgyMzM3MDgyfDA&ixlib=rb-4.1.0&q=85',
  'https://images.pexels.com/photos/38048431/pexels-photo-38048431.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  'https://images.pexels.com/photos/33243028/pexels-photo-33243028.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  'https://images.unsplash.com/photo-1779617442298-d912b57a841c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwyfHxBZnJpY2FuJTIwaG90ZWwlMjByZXNvcnR8ZW58MHx8fHwxNzgyMzM3MDgyfDA&ixlib=rb-4.1.0&q=85',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTF8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBsb2RnZXxlbnwwfHx8fDE3ODIzMzcwODJ8MA&ixlib=rb-4.1.0&q=85',
  'https://images.unsplash.com/photo-1607712617949-8c993d290809?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTF8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBsb2RnZXxlbnwwfHx8fDE3ODIzMzcwODJ8MA&ixlib=rb-4.1.0&q=85',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHwyfHxob3RlbCUyMHJvb218ZW58MHx8fHwxNzgyMzM3MDgyfDA&ixlib=rb-4.1.0&q=85',
  'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHw0fHxob3RlbCUyMHJvb218ZW58MHx8fHwxNzgyMzM3MDgyfDA&ixlib=rb-4.1.0&q=85',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHwzfHxob3RlbCUyMHJvb218ZW58MHx8fHwxNzgyMzM3MDgyfDA&ixlib=rb-4.1.0&q=85'
]

function rooms(base) {
  return [
    { id: uuidv4(), name: 'Chambre Standard', nameEn: 'Standard Room', priceCDF: base, capacity: 2, beds: '1 lit double', bedsEn: '1 double bed' },
    { id: uuidv4(), name: 'Chambre Deluxe', nameEn: 'Deluxe Room', priceCDF: Math.round(base * 1.5), capacity: 3, beds: '1 lit king + 1 canapé', bedsEn: '1 king + 1 sofa' },
    { id: uuidv4(), name: 'Suite Exécutive', nameEn: 'Executive Suite', priceCDF: Math.round(base * 2.4), capacity: 4, beds: '2 lits queen', bedsEn: '2 queen beds' }
  ]
}

const AM = ['wifi', 'pool', 'restaurant', 'parking', 'ac', 'spa', 'gym', 'bar', 'shuttle', 'breakfast']

function buildHotels() {
  const list = [
    ['Pullman Kinshasa Grand Hôtel', 'hotel', 'Kinshasa', 'Kinshasa', 'RD Congo', 'Afrique Centrale', 280000, true, true, -4.4419, 15.2663, [3,1,8], 'Hôtel 5 étoiles au cœur de Kinshasa avec vue sur le fleuve Congo, piscine et restaurant gastronomique.', 'A 5-star hotel in the heart of Kinshasa with views over the Congo River, pool and fine dining.'],
    ['Résidence Lac Kivu', 'apartment', 'Bukavu', 'Sud-Kivu', 'RD Congo', 'Afrique Centrale', 150000, true, false, -2.5083, 28.8608, [4,6,7], 'Appartements meublés modernes surplombant le magnifique lac Kivu, idéal pour les longs séjours.', 'Modern furnished apartments overlooking beautiful Lake Kivu, ideal for long stays.'],
    ['Goma Serena Lodge', 'lodge', 'Goma', 'Nord-Kivu', 'RD Congo', 'Afrique Centrale', 210000, true, true, -1.6792, 29.2228, [0,5,1], 'Lodge paisible aux portes du parc des Virunga, parfait pour les amoureux de la nature.', 'A peaceful lodge at the gateway to Virunga Park, perfect for nature lovers.'],
    ['Lubumbashi Business Hotel', 'hotel', 'Lubumbashi', 'Haut-Katanga', 'RD Congo', 'Afrique Centrale', 175000, true, false, -11.6876, 27.5026, [6,7,8], 'Hôtel d affaires moderne au centre de Lubumbashi, salles de conférence et WiFi haut débit.', 'Modern business hotel in central Lubumbashi with conference rooms and high-speed WiFi.'],
    ['Villa Émeraude Matadi', 'villa', 'Matadi', 'Kongo Central', 'RD Congo', 'Afrique Centrale', 130000, false, false, -5.8167, 13.4500, [4,1,8], 'Villa privée avec piscine et jardin tropical, à quelques minutes du port de Matadi.', 'Private villa with pool and tropical garden, minutes from the port of Matadi.'],
    ['Kananga Guest House', 'guesthouse', 'Kananga', 'Kasaï Central', 'RD Congo', 'Afrique Centrale', 85000, false, false, -5.8960, 22.4166, [5,6,7], 'Maison d hôtes chaleureuse et abordable au centre de Kananga, petit-déjeuner inclus.', 'Warm and affordable guest house in central Kananga, breakfast included.'],
    ['Mbandaka Riverside Lodge', 'lodge', 'Mbandaka', 'Équateur', 'RD Congo', 'Afrique Centrale', 95000, false, false, 0.0487, 18.2603, [0,1,5], 'Lodge en bordure du fleuve Congo, ambiance équatoriale et excursions en pirogue.', 'Riverside lodge on the Congo River with equatorial vibes and canoe excursions.'],
    ['Kisangani Falls Resort', 'resort', 'Kisangani', 'Tshopo', 'RD Congo', 'Afrique Centrale', 190000, true, true, 0.5153, 25.1910, [1,8,3], 'Resort près des célèbres chutes Wagenia, piscine, spa et cuisine locale.', 'Resort near the famous Wagenia Falls with pool, spa and local cuisine.'],
    ['Bukavu Panorama Suites', 'residence', 'Bukavu', 'Sud-Kivu', 'RD Congo', 'Afrique Centrale', 140000, true, false, -2.5000, 28.8500, [7,6,4], 'Résidence de standing avec vue panoramique sur le lac Kivu et les collines verdoyantes.', 'Upscale residence with panoramic views of Lake Kivu and green hills.'],
    ['Kolwezi Mining Inn', 'hotel', 'Kolwezi', 'Lualaba', 'RD Congo', 'Afrique Centrale', 120000, false, false, -10.7167, 25.4667, [6,8,7], 'Hôtel pratique pour les professionnels du secteur minier, navette et restaurant 24h.', 'Convenient hotel for mining professionals with shuttle and 24h restaurant.'],
    ['Radisson Blu Nairobi', 'hotel', 'Nairobi', 'Nairobi County', 'Kenya', 'Afrique de l Est', 320000, true, true, -1.2921, 36.8219, [3,8,6], 'Hôtel international élégant au cœur de Nairobi, idéal pour affaires et safaris.', 'Elegant international hotel in central Nairobi, ideal for business and safaris.'],
    ['Zanzibar Beach Villas', 'villa', 'Zanzibar', 'Zanzibar', 'Tanzanie', 'Afrique de l Est', 350000, true, true, -6.1659, 39.2026, [2,1,4], 'Villas de plage les pieds dans le sable blanc de Zanzibar, océan turquoise.', 'Beach villas on the white sand of Zanzibar with turquoise ocean.'],
    ['Kigali Hills Boutique', 'hotel', 'Kigali', 'Kigali', 'Rwanda', 'Afrique de l Est', 230000, true, false, -1.9706, 30.1044, [0,5,7], 'Hôtel boutique sur les collines de Kigali, design contemporain et service raffiné.', 'Boutique hotel on the hills of Kigali with contemporary design and refined service.'],
    ['Dakar Ocean Resort', 'resort', 'Dakar', 'Dakar', 'Sénégal', 'Afrique de l Ouest', 300000, true, true, 14.7167, -17.4677, [1,3,2], 'Resort en bord d océan à Dakar, plages privées, piscine à débordement et spa.', 'Oceanfront resort in Dakar with private beaches, infinity pool and spa.'],
    ['Accra City Apartments', 'apartment', 'Accra', 'Greater Accra', 'Ghana', 'Afrique de l Ouest', 220000, true, false, 5.6037, -0.1870, [7,6,4], 'Appartements modernes au centre d Accra, proche des affaires et de la vie nocturne.', 'Modern apartments in central Accra, close to business and nightlife.'],
    ['Cape Town Safari Lodge', 'lodge', 'Le Cap', 'Western Cape', 'Afrique du Sud', 'Afrique Australe', 380000, true, true, -33.9249, 18.4241, [0,5,1], 'Lodge de luxe entre montagne de la Table et réserves animalières.', 'Luxury lodge between Table Mountain and wildlife reserves.'],
    ['Maurice Lagoon Residence', 'residence', 'Grand Baie', 'Rivière du Rempart', 'Maurice', 'Îles Africaines', 360000, true, true, -20.0136, 57.5800, [2,4,1], 'Résidence face au lagon de Grand Baie, plages de rêve et activités nautiques.', 'Residence facing the Grand Baie lagoon with dream beaches and water sports.']
  ]
  return list.map((h) => {
    const base = h[6]
    const imgs = h[11].map((i) => HIMG[i])
    const amCount = 5 + Math.floor(Math.random() * 5)
    const amenities = AM.slice(0, amCount)
    return {
      id: uuidv4(),
      name: h[0], type: h[1], city: h[2], province: h[3], country: h[4], region: h[5],
      priceCDF: base, verified: h[7], featured: h[8], lat: h[9], lng: h[10],
      images: imgs, description: h[12], descriptionEn: h[13],
      amenities, rooms: rooms(base),
      rating: Math.round((4.1 + Math.random() * 0.8) * 10) / 10,
      reviewCount: 20 + Math.floor(Math.random() * 280)
    }
  })
}

const REVIEW_POOL = [
  ['Jean-Marc K.', 5, 'Séjour exceptionnel, personnel très accueillant et chambre impeccable.'],
  ['Aïcha D.', 4, 'Très bon rapport qualité-prix, emplacement idéal. Je recommande.'],
  ['Patrick M.', 5, 'Vue magnifique et petit-déjeuner copieux. Je reviendrai sans hésiter.'],
  ['Grace N.', 4, 'Propre, confortable et bien situé. Le WiFi pourrait être plus rapide.'],
  ['Olivier T.', 5, 'Service au top, réservation via YABISO très simple et sécurisée.'],
  ['Fatou S.', 5, 'Cadre paradisiaque, équipe aux petits soins. Parfait pour les vacances.']
]

async function migrateFeatureCongo(db) {
  try {
    const flag = await db.collection('settings').findOne({ id: 'migrations' })
    if (flag && flag.featureCongo) return
    await db.collection('hotels').updateMany({ country: { $regex: 'congo', $options: 'i' } }, { $set: { featured: true } })
    await db.collection('settings').updateOne({ id: 'migrations' }, { $set: { id: 'migrations', featureCongo: true } }, { upsert: true })
  } catch (e) { console.error('[migrate] featureCongo failed', e?.message || e) }
}

async function assignCategoriesV1(db) {
  try {
    const flag = await db.collection('settings').findOne({ id: 'migrations' })
    if (flag && flag.assignCategoriesV1) return
    const hotels = await db.collection('hotels').find({ category: { $exists: false } }).toArray()
    for (const h of hotels) {
      await db.collection('hotels').updateOne({ id: h.id }, { $set: { category: categoryFromType(h.type) } })
    }
    await db.collection('settings').updateOne({ id: 'migrations' }, { $set: { id: 'migrations', assignCategoriesV1: true } }, { upsert: true })
    if (hotels.length) console.log('[migrate] assignCategoriesV1 set category on', hotels.length, 'hotels')
  } catch (e) { console.error('[migrate] assignCategoriesV1 failed', e?.message || e) }
}

async function seedImportedHotels(db) {
  try {
    const flag = await db.collection('settings').findOne({ id: 'migrations' })
    if (flag && flag.importedHotelsV1) return
    let inserted = 0
    for (const h of (IMPORTED_HOTELS || [])) {
      if (!h || !h.externalId) continue
      const exists = await db.collection('hotels').findOne({ externalId: h.externalId })
      if (!exists) {
        await db.collection('hotels').insertOne({
          ...h,
          id: h.id || uuidv4(),
          category: h.category || categoryFromType(h.type),
          featured: /congo/i.test(h.country || '') ? true : !!h.featured,
          createdAt: h.createdAt ? new Date(h.createdAt) : new Date(),
        })
        inserted++
      }
    }
    await db.collection('settings').updateOne({ id: 'migrations' }, { $set: { id: 'migrations', importedHotelsV1: true } }, { upsert: true })
    console.log('[migrate] seedImportedHotels inserted', inserted)
  } catch (e) { console.error('[migrate] seedImportedHotels failed', e?.message || e) }
}

async function seedServicesV1(db) {
  try {
    const flag = await db.collection('settings').findOne({ id: 'migrations' })
    if (flag && flag.seedServicesV1) return
    let inserted = 0
    for (const s of SAMPLE_SERVICES) {
      const exists = await db.collection('services').findOne({ key: s.key })
      if (!exists) { await db.collection('services').insertOne({ id: uuidv4(), ...s, featured: true, createdAt: new Date() }); inserted++ }
    }
    await db.collection('settings').updateOne({ id: 'migrations' }, { $set: { id: 'migrations', seedServicesV1: true } }, { upsert: true })
    if (inserted) console.log('[migrate] seedServicesV1 inserted', inserted, 'services')
  } catch (e) { console.error('[migrate] seedServicesV1 failed', e?.message || e) }
}

async function seed(db) {
  const count = await db.collection('hotels').countDocuments()
  if (count > 0) {
    await migrateFeatureCongo(db)
    await seedImportedHotels(db)
    await assignCategoriesV1(db)
    await seedServicesV1(db)
    await assignSlugBrandingV1(db)
    await assignRealImagesV3(db)
    return { seeded: false, hotels: await db.collection('hotels').countDocuments() }
  }
  const hotels = buildHotels()
  await db.collection('hotels').insertMany(hotels.map((h) => ({ ...h })))
  const reviews = []
  for (const h of hotels) {
    const n = 2 + Math.floor(Math.random() * 3)
    for (let i = 0; i < n; i++) {
      const r = REVIEW_POOL[(i + h.name.length) % REVIEW_POOL.length]
      reviews.push({ id: uuidv4(), hotelId: h.id, author: r[0], rating: r[1], comment: r[2], createdAt: new Date(Date.now() - Math.random() * 1e10) })
    }
  }
  await db.collection('reviews').insertMany(reviews)
  await getSettings(db)
  await seedImportedHotels(db)
  await assignSlugBrandingV1(db)
  await assignRealImagesV3(db)
  return { seeded: true, hotels: hotels.length, reviews: reviews.length }
}

const clean = (arr) => arr.map(({ _id, ...rest }) => rest)

// ---------------- Booking helpers ----------------
function priceIn(cdf, cur, rates, fee) {
  if (cur === 'CDF') return Math.round(cdf)
  const r = rates[cur] || 1
  return Math.round((cdf / r) * (1 + fee))
}
function genRef() {
  const s = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i++) out += s[Math.floor(Math.random() * s.length)]
  return 'YBS-' + out
}
function genCode(prefix) {
  const s = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 4; i++) out += s[Math.floor(Math.random() * s.length)]
  return prefix + '-' + out
}
async function logActivity(db, agentId, type, detail, meta = {}) {
  await db.collection('activities').insertOne({ id: uuidv4(), agentId, type, detail, meta, createdAt: new Date() })
}
function slugify(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
async function uniqueSlug(db, base, excludeId) {
  let slug = base || 'hotel'
  let i = 1
  // ensure uniqueness across hotels
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const found = await db.collection('hotels').findOne({ slug })
    if (!found || found.id === excludeId) return slug
    i++
    slug = `${base}-${i}`
  }
}
function defaultBranding(hotel = {}) {
  return {
    logo: '',
    primaryColor: '#0A1F5C',
    secondaryColor: '#F5A623',
    accentColor: '#F5A623',
    font: 'Inter',
    tagline: hotel.name ? `Bienvenue à ${hotel.name}` : 'Réservez votre séjour',
    heroImage: (hotel.images && hotel.images[0]) || '',
    contactPhone: '',
    contactEmail: '',
    contactAddress: [hotel.city, hotel.country].filter(Boolean).join(', '),
    policies: '',
    poweredBy: true,
  }
}
function sanitizeBranding(input = {}, current = {}) {
  const base = { ...defaultBranding(), ...current }
  const out = { ...base }
  const strFields = ['logo', 'font', 'tagline', 'heroImage', 'contactPhone', 'contactEmail', 'contactAddress', 'policies']
  for (const f of strFields) if (typeof input[f] === 'string') out[f] = input[f].slice(0, 20000)
  const colorFields = ['primaryColor', 'secondaryColor', 'accentColor']
  for (const f of colorFields) if (typeof input[f] === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(input[f])) out[f] = input[f]
  if (typeof input.poweredBy === 'boolean') out.poweredBy = input.poweredBy
  return out
}
async function assignSlugBrandingV1(db) {
  try {
    const flag = await db.collection('settings').findOne({ id: 'migrations' })
    if (flag && flag.assignSlugBrandingV1) return
    const hotels = await db.collection('hotels').find({ $or: [{ slug: { $exists: false } }, { branding: { $exists: false } }] }).toArray()
    for (const h of hotels) {
      const set = {}
      if (!h.slug) set.slug = await uniqueSlug(db, slugify(`${h.name}-${h.city}`) || slugify(h.name) || 'hotel', h.id)
      if (!h.branding) set.branding = defaultBranding(h)
      if (h.tenantId === undefined) set.tenantId = h.ownerId || null
      if (Object.keys(set).length) await db.collection('hotels').updateOne({ id: h.id }, { $set: set })
    }
    await db.collection('settings').updateOne({ id: 'migrations' }, { $set: { id: 'migrations', assignSlugBrandingV1: true } }, { upsert: true })
    if (hotels.length) console.log('[migrate] assignSlugBrandingV1 set slug/branding on', hotels.length, 'hotels')
  } catch (e) { console.error('[migrate] assignSlugBrandingV1 failed', e?.message || e) }
}
async function assignRealImagesV3(db) {
  try {
    const flag = await db.collection('settings').findOne({ id: 'migrations' })
    if (flag && flag.assignRealImagesV3) return
    const hotels = await db.collection('hotels').find({ $or: [
      { images: { $elemMatch: { $regex: '/api/hotel-photo' } } },
      { images: { $elemMatch: { $eq: null } } },
    ] }).toArray()
    for (const h of hotels) {
      const g = galleryFor(h)
      const set = { images: g }
      if (h.branding) set['branding.heroImage'] = g[0]
      await db.collection('hotels').updateOne({ id: h.id }, { $set: set })
    }
    await db.collection('settings').updateOne({ id: 'migrations' }, { $set: { id: 'migrations', assignRealImagesV3: true } }, { upsert: true })
    if (hotels.length) console.log('[migrate] assignRealImagesV3 fixed images on', hotels.length, 'imported hotels')
  } catch (e) { console.error('[migrate] assignRealImagesV3 failed', e?.message || e) }
}
function normRooms(rooms, fallbackBase) {
  let list = Array.isArray(rooms) ? rooms.filter((r) => r && r.name) : []
  if (list.length === 0) {
    list = [{ name: 'Chambre Standard', nameEn: 'Standard Room', priceCDF: fallbackBase || 100000, capacity: 2, beds: '1 lit double', bedsEn: '1 double bed' }]
  }
  return list.map((r) => ({
    id: r.id || uuidv4(),
    name: r.name, nameEn: r.nameEn || r.name,
    priceCDF: Math.max(1, parseInt(r.priceCDF) || fallbackBase || 100000),
    capacity: parseInt(r.capacity) || 2,
    beds: r.beds || '1 lit double', bedsEn: r.bedsEn || r.beds || '1 double bed',
  }))
}

// ---------------- Google Places (import real hotels) ----------------
async function googleTextSearch(query, maxResultCount = 20) {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) throw new Error('GOOGLE_MAPS_API_KEY not configured')
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.photos,places.primaryType,places.types',
    },
    body: JSON.stringify({ textQuery: query, maxResultCount, languageCode: 'fr' }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error('Google Places error ' + res.status + ': ' + text)
  }
  const json = await res.json()
  return json.places || []
}

function mapGoogleType(types = [], primary = '') {
  const all = [primary, ...(types || [])].join(' ').toLowerCase()
  if (all.includes('resort')) return 'resort'
  if (all.includes('apartment') || all.includes('apart')) return 'apartment'
  if (all.includes('guest')) return 'guesthouse'
  if (all.includes('lodge') || all.includes('campground')) return 'lodge'
  if (all.includes('bed_and_breakfast') || all.includes('bnb')) return 'guesthouse'
  return 'hotel'
}

// Map an accommodation type to one of the unified categories
function categoryFromType(type = '') {
  const t = (type || '').toLowerCase()
  if (t.includes('apart') || t.includes('residence') || t.includes('studio')) return 'apartment'
  if (t.includes('villa') || t.includes('lodge') || t.includes('cottage') || t.includes('chalet') || t.includes('maison')) return 'vacation_home'
  if (t.includes('guest') || t.includes('bnb') || t.includes('bed_and_breakfast') || t.includes('hostel') || t.includes('chambre')) return 'short_stay'
  return 'hotel'
}

function priceTierFromRating(rating) {
  if (rating >= 4.6) return 280000
  if (rating >= 4.2) return 200000
  if (rating >= 3.8) return 150000
  return 110000
}

function googlePhotoUrls(photos = []) {
  // Store proxy URLs so the API key is never exposed to the browser
  return (photos || []).slice(0, 6).map((p) => '/api/hotel-photo?name=' + encodeURIComponent(p.name) + '&w=1000')
}

// Enrich amenities from Google Place Details (New)
async function getPlaceAmenities(placeId) {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key || !placeId) return null
  try {
    const res = await fetch('https://places.googleapis.com/v1/places/' + placeId, {
      headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'servesBreakfast,servesLunch,servesDinner,servesBeer,servesWine,servesCocktails,parkingOptions,restroom,goodForChildren',
      },
    })
    if (!res.ok) return null
    const d = await res.json()
    const am = new Set(['wifi', 'ac'])
    if (d.servesBreakfast) am.add('breakfast')
    if (d.servesLunch || d.servesDinner) am.add('restaurant')
    if (d.servesBeer || d.servesWine || d.servesCocktails) am.add('bar')
    if (d.parkingOptions && Object.values(d.parkingOptions).some((v) => v === true)) am.add('parking')
    return Array.from(am)
  } catch (e) { return null }
}

// ---------------- Router ----------------
async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    // Photo proxy (no DB needed) - keeps the Google API key server-side
    if (path[0] === 'hotel-photo' && method === 'GET') {
      const sp = new URL(request.url).searchParams
      const name = sp.get('name')
      const w = parseInt(sp.get('w') || '1000')
      const key = process.env.GOOGLE_MAPS_API_KEY
      if (!name || !key) return new NextResponse('Missing photo name or key', { status: 400 })
      const url = 'https://places.googleapis.com/v1/' + name + '/media?maxWidthPx=' + w + '&key=' + key
      const photoRes = await fetch(url)
      if (!photoRes.ok) return new NextResponse('Photo error', { status: 502 })
      const buf = Buffer.from(await photoRes.arrayBuffer())
      return new NextResponse(buf, { status: 200, headers: { 'Content-Type': photoRes.headers.get('content-type') || 'image/jpeg', 'Cache-Control': 'public, max-age=604800' } })
    }

    // ---------------- Brand assets (logo + banner) served via /api to bypass /public 404 in prod ----------------
    if (path[0] === 'brand' && method === 'GET') {
      const isBanner = path[1] === 'banner'
      const b64 = isBanner ? BANNER_B64 : LOGO_B64
      const buf = Buffer.from(b64, 'base64')
      return handleCORS(new Response(buf, { headers: { 'Content-Type': isBanner ? 'image/jpeg' : 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' } }))
    }

    const db = await connectToMongo()

    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: 'YABISO HOTELS API' }))
    }

    // Seed
    if (route === '/seed' && (method === 'GET' || method === 'POST')) {
      const res = await seed(db)
      await ensureAdmin(db)
      return handleCORS(NextResponse.json(res))
    }

    // Settings / rates
    if (route === '/settings/rates' && method === 'GET') {
      const s = await getSettings(db)
      return handleCORS(NextResponse.json(s))
    }
    if (route === '/settings/rates' && method === 'PUT') {
      const body = await request.json()
      const current = await getSettings(db)
      const updated = {
        rates: { ...current.rates, ...(body.rates || {}) },
        fee: typeof body.fee === 'number' ? Math.min(0.1, Math.max(0, body.fee)) : current.fee,
        commission: typeof body.commission === 'number' ? Math.min(0.5, Math.max(0, body.commission)) : current.commission,
        updatedAt: new Date()
      }
      await db.collection('settings').updateOne({ id: 'global' }, { $set: updated })
      return handleCORS(NextResponse.json({ id: 'global', ...updated }))
    }

    // ---------------- Auth ----------------
    if (route === '/auth/register' && method === 'POST') {
      await ensureAdmin(db)
      const body = await request.json()
      const { name, email, password } = body
      if (!name || !email || !password) return handleCORS(NextResponse.json({ error: 'name, email and password are required' }, { status: 400 }))
      const existing = await db.collection('users').findOne({ email: email.toLowerCase() })
      if (existing) return handleCORS(NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 }))
      const user = { id: uuidv4(), name, email: email.toLowerCase(), passwordHash: hashPassword(password), role: 'user', favorites: [], createdAt: new Date() }
      await db.collection('users').insertOne({ ...user })
      notifyRegistration(user).catch((e) => console.error('[email] notifyRegistration failed', e?.message || e))
      const token = signToken({ id: user.id, role: user.role, exp: Date.now() + 30 * 86400000 })
      return handleCORS(NextResponse.json({ user: publicUser(user), token }))
    }
    if (route === '/auth/login' && method === 'POST') {
      await ensureAdmin(db)
      const body = await request.json()
      const { email, password } = body
      if (!email || !password) return handleCORS(NextResponse.json({ error: 'email and password are required' }, { status: 400 }))
      const user = await db.collection('users').findOne({ email: String(email).toLowerCase() })
      if (!user || !verifyPassword(password, user.passwordHash)) return handleCORS(NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 }))
      const token = signToken({ id: user.id, role: user.role, exp: Date.now() + 30 * 86400000 })
      return handleCORS(NextResponse.json({ user: publicUser(user), token }))
    }
    if (route === '/auth/me' && method === 'GET') {
      const u = await getAuthUser(db, request)
      if (!u) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      return handleCORS(NextResponse.json(publicUser(u)))
    }
    if (route === '/auth/favorites' && method === 'PUT') {
      const u = await getAuthUser(db, request)
      if (!u) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const body = await request.json()
      const hotelId = body.hotelId
      const favs = new Set(u.favorites || [])
      if (favs.has(hotelId)) favs.delete(hotelId); else favs.add(hotelId)
      const favorites = Array.from(favs)
      await db.collection('users').updateOne({ id: u.id }, { $set: { favorites } })
      return handleCORS(NextResponse.json({ favorites }))
    }
    if (route === '/auth/bookings' && method === 'GET') {
      const u = await getAuthUser(db, request)
      if (!u) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const bookings = await db.collection('bookings').find({ $or: [{ userId: u.id }, { 'customer.email': u.email }] }).sort({ createdAt: -1 }).toArray()
      return handleCORS(NextResponse.json(clean(bookings)))
    }

    // ---------------- Admin (require admin role) ----------------
    if (path[0] === 'admin') {
      const u = await getAuthUser(db, request)
      if (!u || u.role !== 'admin') return handleCORS(NextResponse.json({ error: 'Forbidden - admin only' }, { status: 403 }))

      if (route === '/admin/stats' && method === 'GET') {
        const [users, hotels, bookings, agents] = await Promise.all([
          db.collection('users').countDocuments(),
          db.collection('hotels').find({}).toArray(),
          db.collection('bookings').find({}).toArray(),
          db.collection('agents').countDocuments(),
        ])
        const revenueCDF = bookings.reduce((n, b) => n + (b.totalCDF || 0), 0)
        const commissionCDF = bookings.reduce((n, b) => n + (b.commissionCDF || 0), 0)
        const byStatus = {}
        for (const b of bookings) byStatus[b.status] = (byStatus[b.status] || 0) + 1
        return handleCORS(NextResponse.json({
          users, agents, hotels: hotels.length, verifiedHotels: hotels.filter((h) => h.verified).length,
          importedHotels: hotels.filter((h) => h.source === 'google_places').length,
          bookings: bookings.length, revenueCDF, commissionCDF, byStatus,
        }))
      }
      if (route === '/admin/users' && method === 'GET') {
        const users = await db.collection('users').find({}).sort({ createdAt: -1 }).toArray()
        return handleCORS(NextResponse.json(users.map(publicUser)))
      }
      if (path[1] === 'users' && path[2] && path[3] === 'role' && method === 'PUT') {
        const body = await request.json()
        const role = body.role === 'admin' ? 'admin' : 'user'
        await db.collection('users').updateOne({ id: path[2] }, { $set: { role } })
        return handleCORS(NextResponse.json({ id: path[2], role }))
      }
      if (path[1] === 'users' && path[2] && !path[3] && method === 'DELETE') {
        await db.collection('users').deleteOne({ id: path[2] })
        return handleCORS(NextResponse.json({ deleted: true }))
      }
      if (route === '/admin/bookings' && method === 'GET') {
        const bookings = await db.collection('bookings').find({}).sort({ createdAt: -1 }).toArray()
        return handleCORS(NextResponse.json(clean(bookings)))
      }
      if (path[1] === 'bookings' && path[2] && path[3] === 'status' && method === 'PUT') {
        const body = await request.json()
        const status = body.status
        await db.collection('bookings').updateOne({ id: path[2] }, { $set: { status }, $push: { statusHistory: { key: status, at: new Date() } } })
        const updated = await db.collection('bookings').findOne({ id: path[2] })
        return handleCORS(NextResponse.json(updated ? (({ _id, ...r }) => r)(updated) : { error: 'not found' }))
      }
      if (path[1] === 'bookings' && path[2] && path[3] === 'payment' && method === 'PUT') {
        const body = await request.json()
        const action = body.action
        const b = await db.collection('bookings').findOne({ id: path[2] })
        if (!b) return handleCORS(NextResponse.json({ error: 'not found' }, { status: 404 }))
        if (action === 'approve') {
          await db.collection('bookings').updateOne({ id: path[2] }, {
            $set: { 'payment.status': 'approved', 'payment.verifiedBy': u.id, 'payment.verifiedAt': new Date(), status: 'payment_received' },
            $push: { statusHistory: { key: 'payment_received', at: new Date() } },
          })
        } else if (action === 'reject') {
          await db.collection('bookings').updateOne({ id: path[2] }, {
            $set: { 'payment.status': 'rejected', 'payment.verifiedBy': u.id, 'payment.verifiedAt': new Date(), status: 'pending_payment' },
          })
        }
        const updated = await db.collection('bookings').findOne({ id: path[2] })
        return handleCORS(NextResponse.json((({ _id, ...r }) => r)(updated)))
      }
      if (route === '/admin/agents' && method === 'GET') {
        const agents = await db.collection('agents').find({}).sort({ createdAt: -1 }).toArray()
        return handleCORS(NextResponse.json(clean(agents)))
      }
      if (path[1] === 'hotels' && path[2] && path[3] === 'feature' && method === 'PUT') {
        const body = await request.json()
        await db.collection('hotels').updateOne({ id: path[2] }, { $set: { featured: !!body.featured } })
        return handleCORS(NextResponse.json({ id: path[2], featured: !!body.featured }))
      }
      if (path[1] === 'hotels' && path[2] && !path[3] && method === 'DELETE') {
        await db.collection('hotels').deleteOne({ id: path[2] })
        return handleCORS(NextResponse.json({ deleted: true }))
      }
      return handleCORS(NextResponse.json({ error: 'Unknown admin route' }, { status: 404 }))
    }

    // ---------------- Hotel Owner (any authenticated user) ----------------
    if (path[0] === 'owner') {
      const u = await getAuthUser(db, request)
      if (!u) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

      if (route === '/owner/hotels' && method === 'GET') {
        const hotels = await db.collection('hotels').find({ ownerId: u.id }).sort({ createdAt: -1 }).toArray()
        return handleCORS(NextResponse.json(clean(hotels)))
      }
      if (route === '/owner/hotels' && method === 'POST') {
        const body = await request.json()
        if (!body.name || !body.city || !body.province || !body.country) {
          return handleCORS(NextResponse.json({ error: 'name, city, province, country are required' }, { status: 400 }))
        }
        const rms = normRooms(body.rooms, parseInt(body.priceCDF))
        const minPrice = Math.min(...rms.map((r) => r.priceCDF))
        const images = Array.isArray(body.images) && body.images.length ? body.images : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=srgb&fm=jpg&q=85&w=900']
        const hid = uuidv4()
        const slug = await uniqueSlug(db, slugify(`${body.name}-${body.city}`) || slugify(body.name) || 'hotel', hid)
        const hotel = {
          id: hid, name: body.name, type: body.type || 'hotel', city: body.city, province: body.province, country: body.country,
          region: body.region || 'Afrique Centrale', priceCDF: minPrice, verified: false, featured: false, active: true,
          lat: parseFloat(body.lat) || 0, lng: parseFloat(body.lng) || 0,
          images, description: body.description || '', descriptionEn: body.descriptionEn || body.description || '',
          amenities: Array.isArray(body.amenities) ? body.amenities : [], rooms: rms,
          rating: 0, reviewCount: 0, ownerId: u.id, tenantId: u.id, ownerName: u.name,
          slug, branding: sanitizeBranding(body.branding || {}, defaultBranding({ name: body.name, city: body.city, country: body.country, images })),
          createdAt: new Date(),
        }
        await db.collection('hotels').insertOne({ ...hotel })
        return handleCORS(NextResponse.json(hotel))
      }
      if (path[1] === 'hotels' && path[2] && path[3] === 'branding' && method === 'PUT') {
        const hotel = await db.collection('hotels').findOne({ id: path[2] })
        if (!hotel || hotel.ownerId !== u.id) return handleCORS(NextResponse.json({ error: 'Not found or not owner' }, { status: 404 }))
        const body = await request.json()
        const upd = {}
        upd.branding = sanitizeBranding(body.branding || body || {}, { ...defaultBranding(hotel), ...(hotel.branding || {}) })
        // optional slug change (keep unique)
        if (typeof body.slug === 'string' && body.slug.trim()) {
          const desired = slugify(body.slug)
          if (desired && desired !== hotel.slug) upd.slug = await uniqueSlug(db, desired, hotel.id)
        }
        await db.collection('hotels').updateOne({ id: path[2] }, { $set: upd })
        const updated = await db.collection('hotels').findOne({ id: path[2] })
        return handleCORS(NextResponse.json((({ _id, ...r }) => r)(updated)))
      }
      if (path[1] === 'hotels' && path[2] && method === 'PUT') {
        const hotel = await db.collection('hotels').findOne({ id: path[2] })
        if (!hotel || hotel.ownerId !== u.id) return handleCORS(NextResponse.json({ error: 'Not found or not owner' }, { status: 404 }))
        const body = await request.json()
        const upd = {}
        for (const f of ['name', 'type', 'city', 'province', 'country', 'region', 'description', 'descriptionEn']) if (typeof body[f] === 'string') upd[f] = body[f]
        if (typeof body.active === 'boolean') upd.active = body.active
        if (Array.isArray(body.amenities)) upd.amenities = body.amenities
        if (Array.isArray(body.images) && body.images.length) upd.images = body.images
        if (Array.isArray(body.rooms)) { upd.rooms = normRooms(body.rooms, hotel.priceCDF); upd.priceCDF = Math.min(...upd.rooms.map((r) => r.priceCDF)) }
        await db.collection('hotels').updateOne({ id: path[2] }, { $set: upd })
        const updated = await db.collection('hotels').findOne({ id: path[2] })
        return handleCORS(NextResponse.json((({ _id, ...r }) => r)(updated)))
      }
      if (route === '/owner/bookings' && method === 'GET') {
        const myHotels = await db.collection('hotels').find({ ownerId: u.id }).toArray()
        const ids = myHotels.map((h) => h.id)
        const bookings = await db.collection('bookings').find({ hotelId: { $in: ids } }).sort({ createdAt: -1 }).toArray()
        return handleCORS(NextResponse.json(clean(bookings)))
      }
      if (route === '/owner/stats' && method === 'GET') {
        const myHotels = await db.collection('hotels').find({ ownerId: u.id }).toArray()
        const ids = myHotels.map((h) => h.id)
        const bookings = await db.collection('bookings').find({ hotelId: { $in: ids } }).toArray()
        const rooms = myHotels.reduce((n, h) => n + (h.rooms ? h.rooms.length : 0), 0)
        const payoutCDF = bookings.reduce((n, b) => n + (b.payoutCDF || 0), 0)
        const revenueCDF = bookings.reduce((n, b) => n + (b.totalCDF || 0), 0)
        const pending = bookings.filter((b) => b.status !== 'cancelled' && b.status !== 'hotel_paid').length
        return handleCORS(NextResponse.json({ properties: myHotels.length, rooms, bookings: bookings.length, pending, payoutCDF, revenueCDF }))
      }
      return handleCORS(NextResponse.json({ error: 'Unknown owner route' }, { status: 404 }))
    }

    // Destinations (group by province/city)
    if (route === '/destinations' && method === 'GET') {
      const hotels = await db.collection('hotels').find({}).toArray()
      const map = {}
      for (const h of hotels) {
        const key = `${h.city}|${h.province}|${h.country}`
        if (!map[key]) map[key] = { city: h.city, province: h.province, country: h.country, region: h.region, count: 0, image: h.images[0] }
        map[key].count++
      }
      return handleCORS(NextResponse.json(Object.values(map).sort((a, b) => b.count - a.count)))
    }

    // Hotels list with filters
    if (route === '/hotels' && method === 'GET') {
      const sp = new URL(request.url).searchParams
      const q = (sp.get('q') || '').toLowerCase().trim()
      const type = sp.get('type') || ''
      const province = sp.get('province') || ''
      const country = sp.get('country') || ''
      const featured = sp.get('featured')
      const guests = parseInt(sp.get('guests') || '0')
      let hotels = await db.collection('hotels').find({}).toArray()
      if (q) hotels = hotels.filter((h) => [h.name, h.city, h.province, h.country, h.region].join(' ').toLowerCase().includes(q))
      if (type) hotels = hotels.filter((h) => h.type === type)
      if (province) hotels = hotels.filter((h) => h.province === province)
      const city = sp.get('city') || ''
      if (city) hotels = hotels.filter((h) => (h.city || '').toLowerCase().includes(city.toLowerCase()))
      if (country) hotels = hotels.filter((h) => h.country === country)
      if (featured === 'true') hotels = hotels.filter((h) => h.featured)
      const category = sp.get('category') || ''
      if (category) hotels = hotels.filter((h) => (h.category || categoryFromType(h.type)) === category)
      if (guests) hotels = hotels.filter((h) => h.rooms.some((r) => r.capacity >= guests))
      return handleCORS(NextResponse.json(clean(hotels)))
    }

    // ---------------- White-label tenant microsite (public) ----------------
    if (path[0] === 'tenant' && path[1] && method === 'GET') {
      const hotel = await db.collection('hotels').findOne({ slug: path[1] })
      if (!hotel || hotel.active === false) return handleCORS(NextResponse.json({ error: 'Site introuvable' }, { status: 404 }))
      const reviews = await db.collection('reviews').find({ hotelId: hotel.id }).sort({ createdAt: -1 }).limit(20).toArray()
      const settings = await getSettings(db)
      const { _id, ownerId, tenantId, agentId, ...rest } = hotel
      const branding = { ...defaultBranding(hotel), ...(hotel.branding || {}) }
      return handleCORS(NextResponse.json({ hotel: { ...rest, branding }, reviews: clean(reviews), rates: settings.rates, fee: settings.fee }))
    }

    // Single hotel
    if (path[0] === 'hotels' && path[1] && method === 'GET') {
      const hotel = await db.collection('hotels').findOne({ id: path[1] })
      if (!hotel) return handleCORS(NextResponse.json({ error: 'Hotel not found' }, { status: 404 }))
      const reviews = await db.collection('reviews').find({ hotelId: path[1] }).sort({ createdAt: -1 }).toArray()
      const { _id, ...rest } = hotel
      return handleCORS(NextResponse.json({ ...rest, reviews: clean(reviews) }))
    }

    // ---------------- PWA icons (served via /api to work in production) ----------------
    if (path[0] === 'pwa' && method === 'GET') {
      const b64 = path[1] === 'icon-512' ? ICON_512 : ICON_192
      const buf = Buffer.from(b64, 'base64')
      return handleCORS(new Response(buf, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' } }))
    }

    // ---------------- Services (Phase 2: excursions, transfers, taxis, car rental) ----------------
    if (route === '/services' && method === 'GET') {
      const sp = new URL(request.url).searchParams
      const stype = sp.get('type') || ''
      const city = (sp.get('city') || '').toLowerCase()
      const country = sp.get('country') || ''
      let services = await db.collection('services').find({}).toArray()
      if (stype) services = services.filter((s) => s.type === stype)
      if (city) services = services.filter((s) => (s.city || '').toLowerCase().includes(city))
      if (country) services = services.filter((s) => s.country === country)
      return handleCORS(NextResponse.json(clean(services)))
    }
    if (path[0] === 'services' && path[1] && method === 'GET') {
      const svc = await db.collection('services').findOne({ id: path[1] })
      if (!svc) return handleCORS(NextResponse.json({ error: 'Service not found' }, { status: 404 }))
      const { _id, ...rest } = svc
      return handleCORS(NextResponse.json(rest))
    }
    if (route === '/service-requests' && method === 'POST') {
      const body = await request.json()
      const svc = await db.collection('services').findOne({ id: body.serviceId })
      if (!svc) return handleCORS(NextResponse.json({ error: 'Service introuvable' }, { status: 404 }))
      const c = body.customer || {}
      if (!c.name || !c.email) return handleCORS(NextResponse.json({ error: 'Nom et email du client requis' }, { status: 400 }))
      const quantity = Math.max(1, parseInt(body.quantity || 1))
      const currency = body.currency || 'CDF'
      const settings = await getSettings(db)
      const totalCDF = svc.priceCDF * quantity
      let totalDisplay = Math.round(totalCDF)
      if (currency !== 'CDF') { const r = (settings.rates || {})[currency] || 1; totalDisplay = Math.round((totalCDF / r) * (1 + (settings.fee || 0))) }
      const reqDoc = {
        id: uuidv4(), reference: 'SRV-' + genCode('').replace('-', '') + Math.floor(Math.random() * 90 + 10),
        serviceId: svc.id, serviceType: svc.type, serviceName: svc.name, city: svc.city, country: svc.country,
        date: body.date || '', quantity, notes: body.notes || '',
        customer: { name: c.name, email: c.email, phone: c.phone || '' },
        priceCDF: svc.priceCDF, totalCDF, currency, totalDisplay,
        status: 'pending', statusHistory: [{ key: 'pending', at: new Date() }], createdAt: new Date(),
      }
      await db.collection('service_requests').insertOne({ ...reqDoc })
      notifyServiceRequest(reqDoc).catch((e) => console.error('[email] notifyServiceRequest failed', e?.message || e))
      return handleCORS(NextResponse.json(reqDoc))
    }
    if (route === '/service-requests' && method === 'GET') {
      const u = await getAuthUser(db, request)
      if (!u || u.role !== 'admin') return handleCORS(NextResponse.json({ error: 'Forbidden' }, { status: 403 }))
      const reqs = await db.collection('service_requests').find({}).sort({ createdAt: -1 }).toArray()
      return handleCORS(NextResponse.json(clean(reqs)))
    }
    if (path[0] === 'service-requests' && path[1] && method === 'PUT') {
      const u = await getAuthUser(db, request)
      if (!u || u.role !== 'admin') return handleCORS(NextResponse.json({ error: 'Forbidden' }, { status: 403 }))
      const body = await request.json()
      const allowed = ['pending', 'confirmed', 'cancelled', 'completed']
      const status = allowed.includes(body.status) ? body.status : 'pending'
      await db.collection('service_requests').updateOne({ id: path[1] }, { $set: { status }, $push: { statusHistory: { key: status, at: new Date() } } })
      const updated = await db.collection('service_requests').findOne({ id: path[1] })
      if (!updated) return handleCORS(NextResponse.json({ error: 'Not found' }, { status: 404 }))
      const { _id, ...rest } = updated
      return handleCORS(NextResponse.json(rest))
    }

    // Reviews
    if (route === '/reviews' && method === 'GET') {
      const sp = new URL(request.url).searchParams
      const hotelId = sp.get('hotelId')
      const filter = hotelId ? { hotelId } : {}
      const reviews = await db.collection('reviews').find(filter).sort({ createdAt: -1 }).toArray()
      return handleCORS(NextResponse.json(clean(reviews)))
    }
    if (route === '/reviews' && method === 'POST') {
      const body = await request.json()
      if (!body.hotelId || !body.author || !body.rating) {
        return handleCORS(NextResponse.json({ error: 'hotelId, author and rating are required' }, { status: 400 }))
      }
      const review = { id: uuidv4(), hotelId: body.hotelId, author: body.author, rating: Math.max(1, Math.min(5, body.rating)), comment: body.comment || '', createdAt: new Date() }
      await db.collection('reviews').insertOne({ ...review })
      return handleCORS(NextResponse.json(review))
    }

    // ---------------- Agents ----------------
    if (route === '/agents/login' && method === 'POST') {
      const body = await request.json()
      if (!body.email || !body.name) return handleCORS(NextResponse.json({ error: 'name and email are required' }, { status: 400 }))
      let agent = await db.collection('agents').findOne({ email: body.email.toLowerCase() })
      if (!agent) {
        agent = { id: uuidv4(), name: body.name, email: body.email.toLowerCase(), code: genCode('AG'), zone: body.zone || 'Kinshasa', createdAt: new Date() }
        await db.collection('agents').insertOne({ ...agent })
        await logActivity(db, agent.id, 'agent_registered', `Agent ${agent.name} enregistré`, { zone: agent.zone })
      }
      const { _id, ...rest } = agent
      return handleCORS(NextResponse.json(rest))
    }
    if (path[0] === 'agents' && path[1] && path[2] === 'hotels' && method === 'GET') {
      const hotels = await db.collection('hotels').find({ agentId: path[1] }).sort({ createdAt: -1 }).toArray()
      return handleCORS(NextResponse.json(clean(hotels)))
    }
    if (path[0] === 'agents' && path[1] && path[2] === 'activities' && method === 'GET') {
      const acts = await db.collection('activities').find({ agentId: path[1] }).sort({ createdAt: -1 }).limit(100).toArray()
      return handleCORS(NextResponse.json(clean(acts)))
    }
    if (path[0] === 'agents' && path[1] && path[2] === 'stats' && method === 'GET') {
      const hotels = await db.collection('hotels').find({ agentId: path[1] }).toArray()
      const activities = await db.collection('activities').countDocuments({ agentId: path[1] })
      const rooms = hotels.reduce((n, h) => n + (h.rooms ? h.rooms.length : 0), 0)
      return handleCORS(NextResponse.json({ properties: hotels.length, verified: hotels.filter((h) => h.verified).length, rooms, activities }))
    }
    if (path[0] === 'agents' && path[1] && !path[2] && method === 'GET') {
      const agent = await db.collection('agents').findOne({ id: path[1] })
      if (!agent) return handleCORS(NextResponse.json({ error: 'Agent not found' }, { status: 404 }))
      const { _id, ...rest } = agent
      return handleCORS(NextResponse.json(rest))
    }

    // ---------------- Property management (agents) ----------------
    if (route === '/hotels' && method === 'POST') {
      const body = await request.json()
      if (!body.name || !body.city || !body.province || !body.country || !body.agentId) {
        return handleCORS(NextResponse.json({ error: 'name, city, province, country and agentId are required' }, { status: 400 }))
      }
      const rooms = normRooms(body.rooms, parseInt(body.priceCDF))
      const minPrice = Math.min(...rooms.map((r) => r.priceCDF))
      const images = Array.isArray(body.images) && body.images.length ? body.images : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=srgb&fm=jpg&q=85&w=900']
      const hotel = {
        id: uuidv4(),
        name: body.name, type: body.type || 'hotel', city: body.city, province: body.province, country: body.country,
        region: body.region || 'Afrique Centrale',
        priceCDF: minPrice, verified: false, featured: false,
        lat: parseFloat(body.lat) || 0, lng: parseFloat(body.lng) || 0,
        images, description: body.description || '', descriptionEn: body.descriptionEn || body.description || '',
        amenities: Array.isArray(body.amenities) ? body.amenities : [], rooms,
        rating: 0, reviewCount: 0,
        agentId: body.agentId, createdAt: new Date(),
      }
      await db.collection('hotels').insertOne({ ...hotel })
      await logActivity(db, body.agentId, 'property_created', `Propriété ajoutée : ${hotel.name} (${hotel.city})`, { hotelId: hotel.id })
      return handleCORS(NextResponse.json(hotel))
    }
    if (path[0] === 'hotels' && path[1] && path[2] === 'verify' && method === 'POST') {
      const body = await request.json()
      const hotel = await db.collection('hotels').findOne({ id: path[1] })
      if (!hotel) return handleCORS(NextResponse.json({ error: 'Hotel not found' }, { status: 404 }))
      const verification = { agentId: body.agentId || hotel.agentId, lat: parseFloat(body.lat) || hotel.lat, lng: parseFloat(body.lng) || hotel.lng, at: new Date() }
      await db.collection('hotels').updateOne({ id: path[1] }, { $set: { verified: true, verification, lat: verification.lat, lng: verification.lng } })
      await logActivity(db, verification.agentId, 'property_verified', `Propriété vérifiée (GPS) : ${hotel.name}`, { hotelId: hotel.id, lat: verification.lat, lng: verification.lng })
      const updated = await db.collection('hotels').findOne({ id: path[1] })
      const { _id, ...rest } = updated
      return handleCORS(NextResponse.json(rest))
    }
    if (path[0] === 'hotels' && path[1] && !path[2] && method === 'PUT') {
      const body = await request.json()
      const hotel = await db.collection('hotels').findOne({ id: path[1] })
      if (!hotel) return handleCORS(NextResponse.json({ error: 'Hotel not found' }, { status: 404 }))
      const upd = {}
      for (const f of ['name', 'type', 'city', 'province', 'country', 'region', 'description', 'descriptionEn']) {
        if (typeof body[f] === 'string') upd[f] = body[f]
      }
      if (Array.isArray(body.amenities)) upd.amenities = body.amenities
      if (Array.isArray(body.images) && body.images.length) upd.images = body.images
      if (Array.isArray(body.rooms)) { upd.rooms = normRooms(body.rooms, hotel.priceCDF); upd.priceCDF = Math.min(...upd.rooms.map((r) => r.priceCDF)) }
      await db.collection('hotels').updateOne({ id: path[1] }, { $set: upd })
      await logActivity(db, body.agentId || hotel.agentId, 'property_updated', `Propriété mise à jour : ${hotel.name}`, { hotelId: hotel.id })
      const updated = await db.collection('hotels').findOne({ id: path[1] })
      const { _id, ...rest } = updated
      return handleCORS(NextResponse.json(rest))
    }

    // ---------------- Import real hotels from Google Places ----------------
    if (route === '/import/hotels' && method === 'POST') {
      const body = await request.json()
      const city = (body.city || '').trim()
      if (!city) return handleCORS(NextResponse.json({ error: 'city is required' }, { status: 400 }))
      const country = body.country || 'RD Congo'
      const province = body.province || city
      const region = body.region || 'Afrique Centrale'
      const agentId = body.agentId || null
      const googleCountry = country === 'RD Congo' ? 'Democratic Republic of Congo'
        : /brazzaville|r[ée]publique du congo|congo-?brazza/i.test(country) ? 'Republic of the Congo'
        : country
      let places
      try {
        places = await googleTextSearch('hotels and lodging in ' + city + ', ' + googleCountry, body.max || 20)
      } catch (e) {
        return handleCORS(NextResponse.json({ error: String(e.message || e) }, { status: 502 }))
      }
      let imported = 0, updated = 0
      const out = []
      for (const p of places) {
        const name = p.displayName && p.displayName.text
        if (!name) continue
        const externalId = p.id
        const rating = typeof p.rating === 'number' ? Math.round(p.rating * 10) / 10 : 0
        const base = Math.round(priceTierFromRating(rating) * ONLINE_MARKUP) // +20% online markup for imported hotels
        let images = googlePhotoUrls(p.photos)
        if (images.length === 0) images = ['https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=srgb&fm=jpg&q=85&w=900']
        const addr = p.formattedAddress || city
        const gType = mapGoogleType(p.types, p.primaryType)
        const docBase = {
          name, type: gType, category: categoryFromType(gType), city, province, country, region,
          address: addr, lat: (p.location && p.location.latitude) || 0, lng: (p.location && p.location.longitude) || 0,
          images, rating, reviewCount: p.userRatingCount || 0,
          source: 'google_places', externalId,
          description: name + ' situé à ' + addr + '. Hébergement vérifié et importé depuis Google.',
          descriptionEn: name + ' located at ' + addr + '. Accommodation imported from Google.',
        }
        const existing = await db.collection('hotels').findOne({ externalId })
        if (existing) {
          await db.collection('hotels').updateOne({ externalId }, { $set: { ...docBase, priceCDF: existing.priceCDF, rooms: existing.rooms } })
          updated++
          const { _id, ...rest } = existing
          out.push({ ...rest, ...docBase })
        } else {
          const enriched = await getPlaceAmenities(externalId)
          const amenities = enriched && enriched.length ? enriched : ['wifi', 'parking', 'restaurant', 'ac']
          const hotel = { id: uuidv4(), ...docBase, priceCDF: base, verified: false, featured: /congo/i.test(country), amenities, rooms: rooms(base), agentId, createdAt: new Date() }
          await db.collection('hotels').insertOne({ ...hotel })
          imported++
          out.push(hotel)
        }
      }
      if (agentId) await logActivity(db, agentId, 'property_created', 'Import Google Places : ' + imported + ' hôtel(s), ' + updated + ' mis à jour à ' + city, { city, imported, updated })
      return handleCORS(NextResponse.json({ city, fetched: places.length, imported, updated, hotels: out }))
    }

    // Create booking
    if (route === '/bookings' && method === 'POST') {
      const body = await request.json()
      const { hotelId, roomId, checkIn, checkOut, guests, currency = 'CDF', customer = {}, paymentMethod = 'card' } = body
      if (!hotelId || !roomId || !checkIn || !checkOut || !customer.name || !customer.email) {
        return handleCORS(NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 }))
      }
      const hotel = await db.collection('hotels').findOne({ id: hotelId })
      if (!hotel) return handleCORS(NextResponse.json({ error: 'Hotel not found' }, { status: 404 }))
      const room = hotel.rooms.find((r) => r.id === roomId)
      if (!room) return handleCORS(NextResponse.json({ error: 'Room not found' }, { status: 404 }))
      const ci = new Date(checkIn)
      const co = new Date(checkOut)
      let nights = Math.round((co - ci) / 86400000)
      if (!nights || nights < 1) nights = 1
      const settings = await getSettings(db)
      const totalCDF = room.priceCDF * nights
      const commissionRate = typeof settings.commission === 'number' ? settings.commission : 0.3
      const commissionCDF = Math.round(totalCDF * commissionRate)
      const payoutCDF = totalCDF - commissionCDF
      const totalDisplay = priceIn(totalCDF, currency, settings.rates, settings.fee)
      const rateUsed = currency === 'CDF' ? 1 : settings.rates[currency]
      const authU = await getAuthUser(db, request)
      const pm = paymentMethod || 'card'
      const instantMethods = ['visa', 'mastercard', 'stripe', 'paypal', 'card']
      const isInstant = instantMethods.includes(pm)
      const proof = body.payment || {}
      const payment = {
        method: pm,
        status: isInstant ? 'approved' : 'pending',
        txId: proof.txId || '',
        payerPhone: proof.payerPhone || customer.phone || '',
        proofImage: proof.proofImage || '',
        submittedAt: new Date(),
        verifiedBy: null,
        verifiedAt: isInstant ? new Date() : null,
      }
      const bookingStatus = isInstant ? 'payment_received' : 'pending_payment'
      const statusHistory = isInstant
        ? [{ key: 'pending_payment', at: new Date() }, { key: 'payment_received', at: new Date() }]
        : [{ key: 'pending_payment', at: new Date() }]
      const booking = {
        id: uuidv4(),
        reference: genRef(),
        userId: authU ? authU.id : null,
        hotelId, hotelName: hotel.name, hotelCity: hotel.city, hotelImage: hotel.images[0],
        roomId, roomName: room.name,
        checkIn, checkOut, nights, guests: guests || 1,
        currency, rateUsed, conversionFee: currency === 'CDF' ? 0 : settings.fee,
        totalCDF, totalDisplay, commissionCDF, payoutCDF,
        customer, paymentMethod: pm, payment,
        cancellationPolicy: 'Annulation gratuite jusqu\u00e0 48h avant l\u2019arriv\u00e9e. Remboursement int\u00e9gral si l\u2019h\u00f4tel ne confirme pas la disponibilit\u00e9.',
        status: bookingStatus,
        statusHistory,
        createdAt: new Date()
      }
      await db.collection('bookings').insertOne({ ...booking })
      notifyBooking(booking).catch((e) => console.error('[email] notifyBooking failed', e?.message || e))
      return handleCORS(NextResponse.json(booking))
    }

    // Cancel booking (customer - must own it)
    if (path[0] === 'bookings' && path[1] && path[2] === 'cancel' && method === 'POST') {
      const u = await getAuthUser(db, request)
      if (!u) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const b = await db.collection('bookings').findOne({ reference: path[1] })
      if (!b) return handleCORS(NextResponse.json({ error: 'Booking not found' }, { status: 404 }))
      if (b.userId !== u.id && (b.customer && b.customer.email) !== u.email) return handleCORS(NextResponse.json({ error: 'Forbidden' }, { status: 403 }))
      if (['checkin_confirmed', 'hotel_paid', 'cancelled', 'refunded'].includes(b.status)) {
        return handleCORS(NextResponse.json({ error: 'Cette réservation ne peut plus être annulée' }, { status: 400 }))
      }
      const wasPaid = b.payment && b.payment.status === 'approved'
      const newStatus = wasPaid ? 'refunded' : 'cancelled'
      await db.collection('bookings').updateOne({ reference: path[1] }, { $set: { status: newStatus }, $push: { statusHistory: { key: newStatus, at: new Date() } } })
      const updated = await db.collection('bookings').findOne({ reference: path[1] })
      return handleCORS(NextResponse.json((({ _id, ...r }) => r)(updated)))
    }

    // Get booking by reference
    if (path[0] === 'bookings' && path[1] && method === 'GET') {
      const booking = await db.collection('bookings').findOne({ reference: path[1] })
      if (!booking) return handleCORS(NextResponse.json({ error: 'Booking not found' }, { status: 404 }))
      const { _id, ...rest } = booking
      return handleCORS(NextResponse.json(rest))
    }

    return handleCORS(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))
  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json({ error: 'Internal server error', detail: String(error) }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute

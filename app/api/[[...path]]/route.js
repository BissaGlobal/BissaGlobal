import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

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
const DEFAULT_RATES = { USD: 2850, EUR: 3080, GBP: 3600 }
const DEFAULT_FEE = 0.07 // 7% markup on foreign currency payments

async function getSettings(db) {
  let s = await db.collection('settings').findOne({ id: 'global' })
  if (!s) {
    s = { id: 'global', rates: DEFAULT_RATES, fee: DEFAULT_FEE, updatedAt: new Date() }
    await db.collection('settings').insertOne(s)
  }
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

async function seed(db) {
  const count = await db.collection('hotels').countDocuments()
  if (count > 0) return { seeded: false, hotels: count }
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

// ---------------- Router ----------------
async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: 'YABISO HOTELS API' }))
    }

    // Seed
    if (route === '/seed' && (method === 'GET' || method === 'POST')) {
      const res = await seed(db)
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
        updatedAt: new Date()
      }
      await db.collection('settings').updateOne({ id: 'global' }, { $set: updated })
      return handleCORS(NextResponse.json({ id: 'global', ...updated }))
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
      if (country) hotels = hotels.filter((h) => h.country === country)
      if (featured === 'true') hotels = hotels.filter((h) => h.featured)
      if (guests) hotels = hotels.filter((h) => h.rooms.some((r) => r.capacity >= guests))
      return handleCORS(NextResponse.json(clean(hotels)))
    }

    // Single hotel
    if (path[0] === 'hotels' && path[1] && method === 'GET') {
      const hotel = await db.collection('hotels').findOne({ id: path[1] })
      if (!hotel) return handleCORS(NextResponse.json({ error: 'Hotel not found' }, { status: 404 }))
      const reviews = await db.collection('reviews').find({ hotelId: path[1] }).sort({ createdAt: -1 }).toArray()
      const { _id, ...rest } = hotel
      return handleCORS(NextResponse.json({ ...rest, reviews: clean(reviews) }))
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
      const commissionCDF = Math.round(totalCDF * 0.3)
      const payoutCDF = totalCDF - commissionCDF
      const totalDisplay = priceIn(totalCDF, currency, settings.rates, settings.fee)
      const rateUsed = currency === 'CDF' ? 1 : settings.rates[currency]
      const booking = {
        id: uuidv4(),
        reference: genRef(),
        hotelId, hotelName: hotel.name, hotelCity: hotel.city, hotelImage: hotel.images[0],
        roomId, roomName: room.name,
        checkIn, checkOut, nights, guests: guests || 1,
        currency, rateUsed, conversionFee: currency === 'CDF' ? 0 : settings.fee,
        totalCDF, totalDisplay, commissionCDF, payoutCDF,
        customer, paymentMethod,
        status: 'payment_received',
        statusHistory: [
          { key: 'pending_payment', at: new Date() },
          { key: 'payment_received', at: new Date() }
        ],
        createdAt: new Date()
      }
      await db.collection('bookings').insertOne({ ...booking })
      return handleCORS(NextResponse.json(booking))
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

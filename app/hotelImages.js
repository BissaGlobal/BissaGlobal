// Curated realistic photo pools used to replace expired Google Places photos
// on imported hotels. Structured by scene so galleries look natural.

export const HOTEL_IMAGES = {
  exterior: [
    'https://images.unsplash.com/photo-1630587148265-761cbd139043?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
    'https://images.unsplash.com/photo-1551918120-9739cb430c6d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
    'https://images.unsplash.com/photo-1549294413-26f195200c16?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
    'https://images.pexels.com/photos/34496713/pexels-photo-34496713.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1000',
    'https://images.pexels.com/photos/33803734/pexels-photo-33803734.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1000',
  ],
  room: [
    'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
    'https://images.pexels.com/photos/14750394/pexels-photo-14750394.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1000',
    'https://images.pexels.com/photos/34496701/pexels-photo-34496701.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1000',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
  ],
  amenity: [
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
    'https://images.unsplash.com/photo-1604348825621-22800b6ed16d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
    'https://images.pexels.com/photos/10923534/pexels-photo-10923534.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1000',
    'https://images.pexels.com/photos/37610710/pexels-photo-37610710.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1000',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
  ],
}

export const STAY_IMAGES = {
  exterior: [
    'https://images.unsplash.com/photo-1670589953882-b94c9cb380f5?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
    'https://images.unsplash.com/photo-1688653802629-5360086bf632?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
    'https://images.unsplash.com/photo-1622015663319-e97e697503ee?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
    'https://images.pexels.com/photos/16573669/pexels-photo-16573669.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1000',
    'https://images.pexels.com/photos/30165027/pexels-photo-30165027.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1000',
    'https://images.unsplash.com/photo-1716807335226-dfe1e2062db1?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
  ],
  room: [
    'https://images.unsplash.com/photo-1666282167632-c613fbeb163c?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
    'https://images.unsplash.com/photo-1628592102751-ba83b0314276?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
    'https://images.pexels.com/photos/6585598/pexels-photo-6585598.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1000',
    'https://images.pexels.com/photos/7587828/pexels-photo-7587828.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1000',
    'https://images.unsplash.com/photo-1662454419716-c4c504728811?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
    'https://images.unsplash.com/photo-1594873604892-b599f847e859?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
  ],
  amenity: [
    'https://images.unsplash.com/photo-1552558636-f6a8f071c2b3?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
    'https://images.unsplash.com/photo-1499916078039-922301b0eb9b?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
    'https://images.unsplash.com/photo-1541004995602-b3e898709909?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
    'https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000',
    'https://images.pexels.com/photos/8089268/pexels-photo-8089268.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1000',
    'https://images.pexels.com/photos/34574606/pexels-photo-34574606.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1000',
  ],
}

function hashId(id) {
  let h = 0
  const s = String(id || '')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

// Build a 4-photo realistic gallery, stable per hotel id, varied by type
export function galleryFor(hotel) {
  const t = hotel.type || 'hotel'
  const stay = t !== 'hotel'
  const pool = stay ? STAY_IMAGES : HOTEL_IMAGES
  const s = hashId(hotel.id)
  const ext = pool.exterior
  const room = pool.room
  const amen = pool.amenity
  const at = (arr, i) => arr[((i % arr.length) + arr.length) % arr.length]
  const g = [
    at(ext, s),
    at(room, s >>> 2),
    at(amen, s >>> 4),
    at(ext, s + 3),
  ]
  // ensure 4 distinct, non-null
  const out = []
  for (const im of g) if (im && !out.includes(im)) out.push(im)
  let i = 0
  while (out.length < 4) { const im = at(room, s + i); if (im && !out.includes(im)) out.push(im); i++; if (i > 30) break }
  return out
}

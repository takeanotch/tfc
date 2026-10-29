
// // app/api/semantic-recherche/route.ts
// // Recherche TFC : même moteur que le chat (lib/tfc-search.ts → lib/embeddings.ts → semantic_search_tfc_v2).
// // Les 50 résultats les plus proches sont mis en cache ; filtres, tri et pagination sont appliqués ensuite.
// import { NextRequest, NextResponse } from 'next/server'
// import { getSession } from '@/utils/session'
// import { searchTFCs, type SearchType, type TfcResult } from '@/lib/tfc-search'

// export const runtime = 'nodejs'
// export const maxDuration = 30

// /* -------------------------------- Constantes ------------------------------ */

// const POOL_SIZE = 50
// const CACHE_TTL = 5 * 60 * 1000
// const CACHE_MAX = 100
// const MAX_QUERY_LENGTH = 2000

// const DEFAULT_THRESHOLD = 0.15
// const MIN_THRESHOLD = 0.05
// const MAX_THRESHOLD = 0.8

// const PAGE_SIZES = [5, 10, 20, 50]
// const DEFAULT_PAGE_SIZE = 10

// const RATE_LIMIT = 20
// const RATE_WINDOW_MS = 60_000

// // Mets SEARCH_REQUIRE_SESSION=true dans .env pour réserver la recherche aux utilisateurs connectés.
// const REQUIRE_SESSION = process.env.SEARCH_REQUIRE_SESSION === 'true'

// /* --------------------------------- Types ---------------------------------- */

// type SortKey = 'relevance' | 'note' | 'annee'

// interface Filters {
//   technologies: string[]
//   fonctionnalites: string[]
//   annees_academiques: string[]
//   facultes: string[]
//   departements: string[]
//   filieres: string[]
//   noteMin: number
//   noteMax: number
// }

// interface TfcDto {
//   id: number
//   titre: string
//   resume: string
//   auteur: string
//   promoteur: string
//   faculte: string
//   departement: string
//   filiere: string
//   annee: string
//   note: number | null
//   technologies: string[]
//   fonctionnalites: string[]
//   mots_cles: string[]
//   cas_application: string
//   has_pdf: boolean
//   pdf_url: string | null
//   /** Pourcentage 0-100, ou null si trouvé par mots-clés uniquement */
//   similarity: number | null
//   match_type: 'semantic' | 'text'
// }

// interface Facets {
//   technologies: string[]
//   fonctionnalites: string[]
//   annees: string[]
//   facultes: string[]
//   departements: string[]
//   filieres: string[]
// }

// interface Pool {
//   items: TfcDto[]
//   facets: Facets
//   searchType: SearchType
//   ts: number
// }

// /* ------------------------------ Limite de débit ---------------------------- */

// const hits = new Map<string, number[]>()

// function isRateLimited(key: string): boolean {
//   const now = Date.now()
//   const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
//   if (recent.length >= RATE_LIMIT) {
//     hits.set(key, recent)
//     return true
//   }
//   recent.push(now)
//   hits.set(key, recent)

//   if (hits.size > 5000) {
//     hits.forEach((times, k) => {
//       if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k)
//     })
//   }
//   return false
// }

// function clientKey(request: NextRequest, userId?: string): string {
//   if (userId) return `u:${userId}`
//   const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
//   return `ip:${forwarded || request.headers.get('x-real-ip') || 'unknown'}`
// }

// /* ---------------------------------- Cache --------------------------------- */

// const cache = new Map<string, Pool>()

// function pruneCache() {
//   const now = Date.now()
//   cache.forEach((pool, key) => {
//     if (now - pool.ts > CACHE_TTL) cache.delete(key)
//   })
//   while (cache.size > CACHE_MAX) {
//     const oldest = cache.keys().next().value
//     if (oldest === undefined) break
//     cache.delete(oldest)
//   }
// }

// /* ------------------------------ Transformation ---------------------------- */

// const asStringArray = (value: unknown): string[] =>
//   Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : []

// const asNote = (value: unknown): number | null => {
//   if (value === null || value === undefined || value === '') return null
//   const n = Number(value)
//   return Number.isFinite(n) ? n : null
// }

// function toDto(r: TfcResult): TfcDto {
//   const similarity = typeof r.similarity === 'number' ? r.similarity : null
//   const path = typeof r.fichier_chemin === 'string' ? r.fichier_chemin.trim() : ''

//   return {
//     id: r.id,
//     titre: (r.titre ?? '').trim(),
//     resume: typeof r.resume === 'string' ? r.resume : '',
//     auteur: r.auteur || '',
//     promoteur: r.promoteur || '',
//     faculte: r.facultes?.nom || '',
//     departement: r.departements?.nom || '',
//     filiere: r.filieres?.nom || '',
//     annee: r.annees_academiques?.annee || '',
//     note: asNote(r.note),
//     technologies: asStringArray(r.technologies),
//     fonctionnalites: asStringArray(r.fonctionnalites),
//     mots_cles: asStringArray(r.mots_cles),
//     cas_application: typeof r.cas_application === 'string' ? r.cas_application : '',
//     has_pdf: path !== '',
//     pdf_url: /^https?:\/\//i.test(path) ? path : null,
//     similarity,
//     match_type: r.match_type === 'text' || similarity === null ? 'text' : 'semantic',
//   }
// }

// function facetOf(values: string[], max = 40): string[] {
//   const counts = new Map<string, number>()
//   for (const value of values) {
//     const key = value.trim()
//     if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
//   }
//   return Array.from(counts.entries())
//     .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'fr'))
//     .slice(0, max)
//     .map(([key]) => key)
// }

// function buildFacets(items: TfcDto[]): Facets {
//   return {
//     technologies: facetOf(items.flatMap((i) => i.technologies)),
//     fonctionnalites: facetOf(items.flatMap((i) => i.fonctionnalites)),
//     annees: facetOf(items.map((i) => i.annee), 20).sort((a, b) => b.localeCompare(a)),
//     facultes: facetOf(items.map((i) => i.faculte)),
//     departements: facetOf(items.map((i) => i.departement)),
//     filieres: facetOf(items.map((i) => i.filiere)),
//   }
// }

// /* --------------------------------- Filtres -------------------------------- */

// const cleanList = (value: unknown): string[] =>
//   Array.isArray(value)
//     ? value
//         .filter((x): x is string => typeof x === 'string')
//         .map((x) => x.trim().slice(0, 120))
//         .filter(Boolean)
//         .slice(0, 50)
//     : []

// const cleanNote = (value: unknown, fallback: number): number =>
//   typeof value === 'number' && Number.isFinite(value) ? Math.min(Math.max(value, 0), 20) : fallback

// function parseFilters(raw: unknown): Filters {
//   const f = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
//   let noteMin = cleanNote(f.noteMin, 0)
//   let noteMax = cleanNote(f.noteMax, 20)
//   if (noteMin > noteMax) [noteMin, noteMax] = [noteMax, noteMin]

//   return {
//     technologies: cleanList(f.technologies),
//     fonctionnalites: cleanList(f.fonctionnalites),
//     annees_academiques: cleanList(f.annees_academiques),
//     facultes: cleanList(f.facultes),
//     departements: cleanList(f.departements),
//     filieres: cleanList(f.filieres),
//     noteMin,
//     noteMax,
//   }
// }

// function hasAny(list: string[], wanted: string[]): boolean {
//   const set = new Set(list.map((x) => x.toLowerCase()))
//   return wanted.some((w) => set.has(w.toLowerCase()))
// }

// function applyFilters(items: TfcDto[], f: Filters): TfcDto[] {
//   const noteActive = f.noteMin > 0 || f.noteMax < 20

//   return items.filter((t) => {
//     if (f.technologies.length && !hasAny(t.technologies, f.technologies)) return false
//     if (f.fonctionnalites.length && !hasAny(t.fonctionnalites, f.fonctionnalites)) return false
//     if (f.annees_academiques.length && !f.annees_academiques.includes(t.annee)) return false
//     if (f.facultes.length && !f.facultes.includes(t.faculte)) return false
//     if (f.departements.length && !f.departements.includes(t.departement)) return false
//     if (f.filieres.length && !f.filieres.includes(t.filiere)) return false
//     if (noteActive && (t.note === null || t.note < f.noteMin || t.note > f.noteMax)) return false
//     return true
//   })
// }

// function sortItems(items: TfcDto[], sort: SortKey): TfcDto[] {
//   if (sort === 'relevance') return items // ordre déjà classé par searchTFCs
//   const copy = [...items]
//   if (sort === 'note') {
//     copy.sort((a, b) => (b.note ?? -1) - (a.note ?? -1))
//   } else {
//     copy.sort((a, b) => b.annee.localeCompare(a.annee))
//   }
//   return copy
// }

// /* --------------------------------- Recherche ------------------------------ */

// async function getPool(query: string, threshold: number): Promise<Pool> {
//   const key = `${query.toLowerCase()}|${threshold.toFixed(2)}`
//   const hit = cache.get(key)
//   if (hit && Date.now() - hit.ts < CACHE_TTL) return hit

//   const { results, searchType } = await searchTFCs({
//     query,
//     limit: POOL_SIZE,
//     similarityThreshold: threshold,
//   })

//   const items = results.map(toDto)
//   const pool: Pool = { items, facets: buildFacets(items), searchType, ts: Date.now() }

//   // On ne mémorise pas un repli « texte » : l'embedding a pu échouer ponctuellement.
//   if (items.length > 0 && searchType !== 'text') {
//     cache.set(key, pool)
//     pruneCache()
//   }
//   return pool
// }

// async function handleSearch(request: NextRequest, raw: Record<string, unknown>) {
//   const user = await Promise.resolve(getSession()).catch(() => null)
//   if (REQUIRE_SESSION && !user) {
//     return NextResponse.json({ error: 'Connectez-vous pour utiliser la recherche.' }, { status: 401 })
//   }

//   if (isRateLimited(clientKey(request, (user as { id?: string } | null)?.id))) {
//     return NextResponse.json(
//       { error: 'Trop de recherches en peu de temps. Patientez quelques secondes.' },
//       { status: 429 }
//     )
//   }

//   const query = typeof raw.query === 'string' ? raw.query.trim() : ''
//   if (!query) {
//     return NextResponse.json({ error: 'La requête de recherche est obligatoire' }, { status: 400 })
//   }
//   if (query.length > MAX_QUERY_LENGTH) {
//     return NextResponse.json({ error: 'La requête est trop longue' }, { status: 400 })
//   }

//   const rawThreshold = raw.similarityThreshold == null ? DEFAULT_THRESHOLD : Number(raw.similarityThreshold)
//   const threshold = Math.round(
//     Math.min(Math.max(Number.isFinite(rawThreshold) ? rawThreshold : DEFAULT_THRESHOLD, MIN_THRESHOLD), MAX_THRESHOLD) * 100
//   ) / 100

//   const rawSize = Number(raw.pageSize)
//   const pageSize = PAGE_SIZES.includes(rawSize) ? rawSize : DEFAULT_PAGE_SIZE
//   const sort: SortKey = raw.sort === 'note' || raw.sort === 'annee' ? raw.sort : 'relevance'
//   const filters = parseFilters(raw.filters)

//   const pool = await getPool(query, threshold)

//   const filtered = sortItems(applyFilters(pool.items, filters), sort)
//   const total = filtered.length
//   const totalPages = Math.max(1, Math.ceil(total / pageSize))
//   const requestedPage = Math.floor(Number(raw.page)) || 1
//   const page = Math.min(Math.max(requestedPage, 1), totalPages)
//   const results = filtered.slice((page - 1) * pageSize, page * pageSize)

//   return NextResponse.json(
//     {
//       results,
//       total,
//       totalBeforeFilters: pool.items.length,
//       capped: pool.items.length >= POOL_SIZE,
//       page,
//       pageSize,
//       totalPages,
//       facets: pool.facets,
//       query,
//       sort,
//       searchType: pool.searchType,
//       hasSemanticResults: pool.searchType === 'semantic' || pool.searchType === 'hybrid',
//       timestamp: new Date().toISOString(),
//     },
//     { headers: { 'Cache-Control': 'no-store' } }
//   )
// }

// /* ---------------------------------- Routes -------------------------------- */

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json().catch(() => ({}))
//     return await handleSearch(request, body && typeof body === 'object' ? body : {})
//   } catch (error) {
//     console.error('❌ Erreur recherche sémantique :', error)
//     return NextResponse.json(
//       { error: 'Service de recherche temporairement indisponible' },
//       { status: 503 }
//     )
//   }
// }

// // Utilisation simple : /api/semantic-recherche?q=blockchain&page=2&pageSize=10
// export async function GET(request: NextRequest) {
//   try {
//     const params = request.nextUrl.searchParams
//     const raw: Record<string, unknown> = {
//       query: params.get('q') ?? '',
//       page: params.get('page'),
//       pageSize: params.get('pageSize'),
//       sort: params.get('sort'),
//       similarityThreshold: params.get('similarityThreshold'),
//     }
//     return await handleSearch(request, raw)
//   } catch (error) {
//     console.error('❌ Erreur recherche sémantique (GET) :', error)
//     return NextResponse.json(
//       { error: 'Service de recherche temporairement indisponible' },
//       { status: 503 }
//     )
//   }
// }

// app/api/semantic-recherche/route.ts
// Recherche TFC : même moteur que le chat (lib/tfc-search.ts → lib/embeddings.ts → semantic_search_tfc_v2).
// Les 50 résultats les plus pertinents sont mis en cache ; filtres, tri et pagination sont appliqués ensuite.
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/utils/session'
import { searchTFCs, type SearchType, type TfcResult } from '@/lib/tfc-search'

export const runtime = 'nodejs'
export const maxDuration = 30

/* -------------------------------- Constantes ------------------------------ */

const POOL_SIZE = 50
const CACHE_TTL = 5 * 60 * 1000
const CACHE_MAX = 100
const MAX_QUERY_LENGTH = 2000

// Pertinence minimale (score final 0 à 1) : 30 % par défaut, curseur de 10 % à 70 %
const DEFAULT_THRESHOLD = 0.3
const MIN_THRESHOLD = 0.3
const MAX_THRESHOLD = 1.0

const PAGE_SIZES = [5, 10, 20, 50]
const DEFAULT_PAGE_SIZE = 10

const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60_000

// Mets SEARCH_REQUIRE_SESSION=true dans .env pour réserver la recherche aux utilisateurs connectés.
const REQUIRE_SESSION = process.env.SEARCH_REQUIRE_SESSION === 'true'

/* --------------------------------- Types ---------------------------------- */

type SortKey = 'relevance' | 'note' | 'annee'

interface Filters {
  technologies: string[]
  fonctionnalites: string[]
  annees_academiques: string[]
  facultes: string[]
  departements: string[]
  filieres: string[]
  noteMin: number
  noteMax: number
}

interface TfcDto {
  id: number
  titre: string
  resume: string
  auteur: string
  promoteur: string
  faculte: string
  departement: string
  filiere: string
  annee: string
  note: number | null
  technologies: string[]
  fonctionnalites: string[]
  mots_cles: string[]
  cas_application: string
  has_pdf: boolean
  pdf_url: string | null
  /** Pourcentage 0-100, ou null si aucun score disponible */
  similarity: number | null
  match_type: 'semantic' | 'text'
}

interface Facets {
  technologies: string[]
  fonctionnalites: string[]
  annees: string[]
  facultes: string[]
  departements: string[]
  filieres: string[]
}

interface Pool {
  items: TfcDto[]
  facets: Facets
  searchType: SearchType
  ts: number
}

/* ------------------------------ Limite de débit ---------------------------- */

const hits = new Map<string, number[]>()

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_LIMIT) {
    hits.set(key, recent)
    return true
  }
  recent.push(now)
  hits.set(key, recent)

  if (hits.size > 5000) {
    hits.forEach((times, k) => {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k)
    })
  }
  return false
}

function clientKey(request: NextRequest, userId?: string): string {
  if (userId) return `u:${userId}`
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return `ip:${forwarded || request.headers.get('x-real-ip') || 'unknown'}`
}

/* ---------------------------------- Cache --------------------------------- */

const cache = new Map<string, Pool>()

function pruneCache() {
  const now = Date.now()
  cache.forEach((pool, key) => {
    if (now - pool.ts > CACHE_TTL) cache.delete(key)
  })
  while (cache.size > CACHE_MAX) {
    const oldest = cache.keys().next().value
    if (oldest === undefined) break
    cache.delete(oldest)
  }
}

/* ------------------------------ Transformation ---------------------------- */

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : []

const asNote = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function toDto(r: TfcResult): TfcDto {
  const similarity = typeof r.similarity === 'number' ? r.similarity : null
  const path = typeof r.fichier_chemin === 'string' ? r.fichier_chemin.trim() : ''

  return {
    id: r.id,
    titre: (r.titre ?? '').trim(),
    resume: typeof r.resume === 'string' ? r.resume : '',
    auteur: r.auteur || '',
    promoteur: r.promoteur || '',
    faculte: r.facultes?.nom || '',
    departement: r.departements?.nom || '',
    filiere: r.filieres?.nom || '',
    annee: r.annees_academiques?.annee || '',
    note: asNote(r.note),
    technologies: asStringArray(r.technologies),
    fonctionnalites: asStringArray(r.fonctionnalites),
    mots_cles: asStringArray(r.mots_cles),
    cas_application: typeof r.cas_application === 'string' ? r.cas_application : '',
    has_pdf: path !== '',
    pdf_url: /^https?:\/\//i.test(path) ? path : null,
    similarity,
    match_type: r.match_type === 'text' || similarity === null ? 'text' : 'semantic',
  }
}

function facetOf(values: string[], max = 40): string[] {
  const counts = new Map<string, number>()
  for (const value of values) {
    const key = value.trim()
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'fr'))
    .slice(0, max)
    .map(([key]) => key)
}

function buildFacets(items: TfcDto[]): Facets {
  return {
    technologies: facetOf(items.flatMap((i) => i.technologies)),
    fonctionnalites: facetOf(items.flatMap((i) => i.fonctionnalites)),
    annees: facetOf(items.map((i) => i.annee), 20).sort((a, b) => b.localeCompare(a)),
    facultes: facetOf(items.map((i) => i.faculte)),
    departements: facetOf(items.map((i) => i.departement)),
    filieres: facetOf(items.map((i) => i.filiere)),
  }
}

/* --------------------------------- Filtres -------------------------------- */

const cleanList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .filter((x): x is string => typeof x === 'string')
        .map((x) => x.trim().slice(0, 120))
        .filter(Boolean)
        .slice(0, 50)
    : []

const cleanNote = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(Math.max(value, 0), 20) : fallback

function parseFilters(raw: unknown): Filters {
  const f = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  let noteMin = cleanNote(f.noteMin, 0)
  let noteMax = cleanNote(f.noteMax, 20)
  if (noteMin > noteMax) [noteMin, noteMax] = [noteMax, noteMin]

  return {
    technologies: cleanList(f.technologies),
    fonctionnalites: cleanList(f.fonctionnalites),
    annees_academiques: cleanList(f.annees_academiques),
    facultes: cleanList(f.facultes),
    departements: cleanList(f.departements),
    filieres: cleanList(f.filieres),
    noteMin,
    noteMax,
  }
}

function hasAny(list: string[], wanted: string[]): boolean {
  const set = new Set(list.map((x) => x.toLowerCase()))
  return wanted.some((w) => set.has(w.toLowerCase()))
}

function applyFilters(items: TfcDto[], f: Filters): TfcDto[] {
  const noteActive = f.noteMin > 0 || f.noteMax < 20

  return items.filter((t) => {
    if (f.technologies.length && !hasAny(t.technologies, f.technologies)) return false
    if (f.fonctionnalites.length && !hasAny(t.fonctionnalites, f.fonctionnalites)) return false
    if (f.annees_academiques.length && !f.annees_academiques.includes(t.annee)) return false
    if (f.facultes.length && !f.facultes.includes(t.faculte)) return false
    if (f.departements.length && !f.departements.includes(t.departement)) return false
    if (f.filieres.length && !f.filieres.includes(t.filiere)) return false
    if (noteActive && (t.note === null || t.note < f.noteMin || t.note > f.noteMax)) return false
    return true
  })
}

function sortItems(items: TfcDto[], sort: SortKey): TfcDto[] {
  if (sort === 'relevance') return items // ordre déjà classé par searchTFCs
  const copy = [...items]
  if (sort === 'note') {
    copy.sort((a, b) => (b.note ?? -1) - (a.note ?? -1))
  } else {
    copy.sort((a, b) => b.annee.localeCompare(a.annee))
  }
  return copy
}

/* --------------------------------- Recherche ------------------------------ */

async function getPool(query: string, threshold: number): Promise<Pool> {
  const key = `${query.toLowerCase()}|${threshold.toFixed(2)}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit

  const { results, searchType } = await searchTFCs({
    query,
    limit: POOL_SIZE,
    similarityThreshold: threshold,
  })

  const items = results.map(toDto)
  const pool: Pool = { items, facets: buildFacets(items), searchType, ts: Date.now() }

  // On ne mémorise pas un repli « texte » : l'embedding a pu échouer ponctuellement.
  if (items.length > 0 && searchType !== 'text') {
    cache.set(key, pool)
    pruneCache()
  }
  return pool
}

async function handleSearch(request: NextRequest, raw: Record<string, unknown>) {
  const user = await Promise.resolve(getSession()).catch(() => null)
  if (REQUIRE_SESSION && !user) {
    return NextResponse.json({ error: 'Connectez-vous pour utiliser la recherche.' }, { status: 401 })
  }

  if (isRateLimited(clientKey(request, (user as { id?: string } | null)?.id))) {
    return NextResponse.json(
      { error: 'Trop de recherches en peu de temps. Patientez quelques secondes.' },
      { status: 429 }
    )
  }

  const query = typeof raw.query === 'string' ? raw.query.trim() : ''
  if (!query) {
    return NextResponse.json({ error: 'La requête de recherche est obligatoire' }, { status: 400 })
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: 'La requête est trop longue' }, { status: 400 })
  }

  const rawThreshold = raw.similarityThreshold == null ? DEFAULT_THRESHOLD : Number(raw.similarityThreshold)
  const threshold = Math.round(
    Math.min(Math.max(Number.isFinite(rawThreshold) ? rawThreshold : DEFAULT_THRESHOLD, MIN_THRESHOLD), MAX_THRESHOLD) * 100
  ) / 100

  const rawSize = Number(raw.pageSize)
  const pageSize = PAGE_SIZES.includes(rawSize) ? rawSize : DEFAULT_PAGE_SIZE
  const sort: SortKey = raw.sort === 'note' || raw.sort === 'annee' ? raw.sort : 'relevance'
  const filters = parseFilters(raw.filters)

  const pool = await getPool(query, threshold)

  const filtered = sortItems(applyFilters(pool.items, filters), sort)
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const requestedPage = Math.floor(Number(raw.page)) || 1
  const page = Math.min(Math.max(requestedPage, 1), totalPages)
  const results = filtered.slice((page - 1) * pageSize, page * pageSize)

  return NextResponse.json(
    {
      results,
      total,
      totalBeforeFilters: pool.items.length,
      capped: pool.items.length >= POOL_SIZE,
      page,
      pageSize,
      totalPages,
      facets: pool.facets,
      query,
      sort,
      searchType: pool.searchType,
      hasSemanticResults: pool.searchType === 'semantic' || pool.searchType === 'hybrid',
      timestamp: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

/* ---------------------------------- Routes -------------------------------- */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    return await handleSearch(request, body && typeof body === 'object' ? body : {})
  } catch (error) {
    console.error('❌ Erreur recherche sémantique :', error)
    return NextResponse.json(
      { error: 'Service de recherche temporairement indisponible' },
      { status: 503 }
    )
  }
}

// Utilisation simple : /api/semantic-recherche?q=blockchain&page=2&pageSize=10
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams
    const raw: Record<string, unknown> = {
      query: params.get('q') ?? '',
      page: params.get('page'),
      pageSize: params.get('pageSize'),
      sort: params.get('sort'),
      similarityThreshold: params.get('similarityThreshold'),
    }
    return await handleSearch(request, raw)
  } catch (error) {
    console.error('❌ Erreur recherche sémantique (GET) :', error)
    return NextResponse.json(
      { error: 'Service de recherche temporairement indisponible' },
      { status: 503 }
    )
  }
}
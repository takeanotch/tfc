

// 'use client'

// import { useEffect, useMemo, useRef, useState } from 'react'
// import Link from 'next/link'
// import { AnimatePresence, motion } from 'framer-motion'
// import {
//   AlertCircle,
//   Building2,
//   Calendar,
//   ChevronDown,
//   ChevronLeft,
//   ChevronRight,
//   Download,
//   GraduationCap,
//   Loader2,
//   Search,
//   SlidersHorizontal,
//   Star,
//   User,
//   UserCheck,
//   X,
// } from 'lucide-react'
// import ThemeSwitch from '@/components/ThemeSwitch'

// /* -------------------------------------------------------------------------- */
// /*                                   Types                                    */
// /* -------------------------------------------------------------------------- */

// interface TFC {
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
//   similarity: number | null // pourcentage 0-100, null = trouvé par mots-clés
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

// interface SearchResponse {
//   results: TFC[]
//   total: number
//   totalBeforeFilters: number
//   capped: boolean
//   page: number
//   pageSize: number
//   totalPages: number
//   facets: Facets
//   query: string
//   searchType: 'semantic' | 'hybrid' | 'text'
// }

// type SortKey = 'relevance' | 'note' | 'annee'
// type ListKey =
//   | 'technologies'
//   | 'fonctionnalites'
//   | 'annees_academiques'
//   | 'facultes'
//   | 'departements'
//   | 'filieres'

// interface Filters {
//   technologies: string[]
//   fonctionnalites: string[]
//   annees_academiques: string[]
//   facultes: string[]
//   departements: string[]
//   filieres: string[]
//   // Les champs noteMin et noteMax ont été retirés
// }

// /* -------------------------------------------------------------------------- */
// /*                                 Constantes                                 */
// /* -------------------------------------------------------------------------- */

// const PAGE_SIZES = [5, 10, 20, 50]
// const DEFAULT_THRESHOLD_PCT = 30 // 👈 pertinence minimale par défaut
// const MIN_THRESHOLD_PCT = 30 // 👈
// const MAX_THRESHOLD_PCT = 100 // 👈

// const SUGGESTIONS = [
//   "Intelligence artificielle",
//   'Blockchain et sécurité',
//   'Application mobile Flutter',
//   'React et Node.js',
// ]

// const EMPTY_FILTERS: Filters = {
//   technologies: [],
//   fonctionnalites: [],
//   annees_academiques: [],
//   facultes: [],
//   departements: [],
//   filieres: [],
// }

// const EMPTY_FACETS: Facets = {
//   technologies: [],
//   fonctionnalites: [],
//   annees: [],
//   facultes: [],
//   departements: [],
//   filieres: [],
// }

// const LIST_FILTERS: { key: ListKey; label: string; facet: keyof Facets }[] = [
//   { key: 'technologies', label: 'Technologies', facet: 'technologies' },
//   { key: 'fonctionnalites', label: 'Fonctionnalités', facet: 'fonctionnalites' },
//   { key: 'annees_academiques', label: 'Années académiques', facet: 'annees' },
//   { key: 'facultes', label: 'Facultés', facet: 'facultes' },
//   { key: 'departements', label: 'Départements', facet: 'departements' },
//   { key: 'filieres', label: 'Filières', facet: 'filieres' },
// ]

// /* -------------------------------------------------------------------------- */
// /*                                  Helpers                                   */
// /* -------------------------------------------------------------------------- */

// function useDebounced<T>(value: T, delay: number): T {
//   const [debounced, setDebounced] = useState(value)
//   useEffect(() => {
//     const timer = setTimeout(() => setDebounced(value), delay)
//     return () => clearTimeout(timer)
//   }, [value, delay])
//   return debounced
// }

// function pageWindow(current: number, total: number): (number | '…')[] {
//   if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

//   const pages = new Set<number>([1, total, current, current - 1, current + 1])
//   if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p))
//   if (current >= total - 2) [total - 1, total - 2, total - 3].forEach((p) => pages.add(p))

//   const sorted = Array.from(pages)
//     .filter((p) => p >= 1 && p <= total)
//     .sort((a, b) => a - b)

//   const out: (number | '…')[] = []
//   sorted.forEach((p, i) => {
//     if (i > 0 && p - sorted[i - 1] > 1) out.push('…')
//     out.push(p)
//   })
//   return out
// }

// const selectClass =
//   'rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-neutral-700 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'

// /* -------------------------------------------------------------------------- */
// /*                              Petits composants                             */
// /* -------------------------------------------------------------------------- */

// function FilterGroup({
//   label,
//   items,
//   selected,
//   onToggle,
// }: {
//   label: string
//   items: string[]
//   selected: string[]
//   onToggle: (item: string) => void
// }) {
//   const [open, setOpen] = useState(selected.length > 0)
//   if (items.length === 0) return null

//   return (
//     <div className="border-b border-neutral-200 last:border-b-0 dark:border-neutral-700">
//       <button
//         type="button"
//         onClick={() => setOpen((o) => !o)}
//         aria-expanded={open}
//         className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-100"
//       >
//         <span className="flex items-center gap-2">
//           {label}
//           {selected.length > 0 && (
//             <span className="rounded-full bg-neutral-900 px-1.5 py-0.5 text-[11px] leading-none text-white dark:bg-neutral-100 dark:text-neutral-900">
//               {selected.length}
//             </span>
//           )}
//         </span>
//         <ChevronDown
//           className={`h-4 w-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}
//           aria-hidden
//         />
//       </button>
//       {open && (
//         <ul className="max-h-52 space-y-1.5 overflow-y-auto pb-3">
//           {items.map((item) => (
//             <li key={item}>
//               <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white">
//                 <input
//                   type="checkbox"
//                   checked={selected.includes(item)}
//                   onChange={() => onToggle(item)}
//                   className="h-4 w-4 shrink-0 rounded border-neutral-300 accent-neutral-900 dark:border-neutral-600 dark:accent-neutral-100"
//                 />
//                 <span className="min-w-0 truncate" title={item}>
//                   {item}
//                 </span>
//               </label>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   )
// }

// function FiltersPanel({
//   facets,
//   filters,
//   onToggle,
// }: {
//   facets: Facets
//   filters: Filters
//   onToggle: (key: ListKey, value: string) => void
// }) {
//   const hasFacets = LIST_FILTERS.some(({ facet }) => facets[facet].length > 0)

//   return (
//     <div>
//       {hasFacets ? (
//         LIST_FILTERS.map(({ key, label, facet }) => (
//           <FilterGroup
//             key={key}
//             label={label}
//             items={facets[facet]}
//             selected={filters[key]}
//             onToggle={(value) => onToggle(key, value)}
//           />
//         ))
//       ) : (
//         <p className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
//           Lancez une recherche pour filtrer par technologie, année, faculté…
//         </p>
//       )}
//     </div>
//   )
// }

// function ResultCard({
//   tfc,
//   activeTechs,
//   onTech,
// }: {
//   tfc: TFC
//   activeTechs: string[]
//   onTech: (tech: string) => void
// }) {
//   const [expanded, setExpanded] = useState(false)

//   const pct =
//     tfc.similarity === null ? null : Math.max(0, Math.min(100, Math.round(tfc.similarity)))

//   const meta = [
//     { icon: User, label: tfc.auteur, title: 'Auteur' },
//     { icon: UserCheck, label: tfc.promoteur, title: 'Promoteur' },
//     { icon: Building2, label: tfc.faculte, title: 'Faculté' },
//     { icon: Calendar, label: tfc.annee, title: 'Année académique' },
//   ].filter((m) => m.label)

//   return (
//     <article className="rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800">
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
//         <div className="min-w-0 flex-1">
//           <div className="mb-1.5 flex items-center gap-2">
//             <span className="rounded-md bg-neutral-200/70 px-1.5 py-0.5 font-mono text-[11px] font-medium text-neutral-700 dark:bg-neutral-700/70 dark:text-neutral-200">
//               ID {tfc.id}
//             </span>
//             {tfc.note !== null && (
//               <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
//                 <Star className="h-3.5 w-3.5" aria-hidden />
//                 {tfc.note}/20
//               </span>
//             )}
//           </div>
//           <h3 className="text-base font-semibold leading-6 text-neutral-900 dark:text-neutral-50">
//             {tfc.titre}
//           </h3>
//         </div>

//         <div className="shrink-0">
//           {pct === null ? (
//             <span
//               title="Trouvé par correspondance de mots-clés, sans score sémantique"
//               className="inline-flex rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-600 dark:text-neutral-300"
//             >
//               Mots-clés
//             </span>
//           ) : (
//             <div className="flex items-center gap-2">
//               <div className="h-1 w-20 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
//                 <div
//                   className="h-full rounded-full bg-neutral-700 dark:bg-neutral-300"
//                   style={{ width: `${pct}%` }}
//                 />
//               </div>
//               <span className="text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
//                 {pct} % de pertinence
//               </span>
//             </div>
//           )}
//         </div>
//       </div>

//       {meta.length > 0 && (
//         <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
//           {meta.map(({ icon: Icon, label, title }) => (
//             <li key={title} className="flex min-w-0 items-center gap-1.5" title={title}>
//               <Icon className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden />
//               <span className="truncate">{label}</span>
//             </li>
//           ))}
//         </ul>
//       )}

//       {tfc.resume && (
//         <p
//           className={`mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300 ${
//             expanded ? '' : 'line-clamp-3'
//           }`}
//         >
//           {tfc.resume}
//         </p>
//       )}

//       {tfc.technologies.length > 0 && (
//         <div className="mt-3 flex flex-wrap gap-1.5">
//           {tfc.technologies.slice(0, expanded ? undefined : 5).map((tech) => {
//             const active = activeTechs.some((t) => t.toLowerCase() === tech.toLowerCase())
//             return (
//               <button
//                 key={tech}
//                 type="button"
//                 onClick={() => onTech(tech)}
//                 aria-pressed={active}
//                 title="Filtrer par cette technologie"
//                 className={`rounded-md px-2 py-0.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
//                   active
//                     ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
//                     : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
//                 }`}
//               >
//                 {tech}
//               </button>
//             )
//           })}
//           {!expanded && tfc.technologies.length > 5 && (
//             <span className="px-1 py-0.5 text-xs text-neutral-400">
//               +{tfc.technologies.length - 5}
//             </span>
//           )}
//         </div>
//       )}

//       {expanded && (
//         <dl className="mt-4 space-y-3 border-t border-neutral-200 pt-4 text-sm dark:border-neutral-700">
//           {tfc.cas_application && (
//             <div>
//               <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
//                 Cas d’application
//               </dt>
//               <dd className="mt-0.5 leading-6 text-neutral-700 dark:text-neutral-300">
//                 {tfc.cas_application}
//               </dd>
//             </div>
//           )}
//           {tfc.fonctionnalites.length > 0 && (
//             <div>
//               <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
//                 Fonctionnalités
//               </dt>
//               <dd className="mt-1 flex flex-wrap gap-1.5">
//                 {tfc.fonctionnalites.map((f) => (
//                   <span
//                     key={f}
//                     className="rounded-md border border-neutral-200 px-2 py-0.5 text-xs text-neutral-600 dark:border-neutral-600 dark:text-neutral-300"
//                   >
//                     {f}
//                   </span>
//                 ))}
//               </dd>
//             </div>
//           )}
//           {tfc.mots_cles.length > 0 && (
//             <div>
//               <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
//                 Mots-clés
//               </dt>
//               <dd className="mt-0.5 text-neutral-700 dark:text-neutral-300">
//                 {tfc.mots_cles.join(', ')}
//               </dd>
//             </div>
//           )}
//           {(tfc.departement || tfc.filiere) && (
//             <div>
//               <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
//                 Département / Filière
//               </dt>
//               <dd className="mt-0.5 text-neutral-700 dark:text-neutral-300">
//                 {[tfc.departement, tfc.filiere].filter(Boolean).join(' · ')}
//               </dd>
//             </div>
//           )}
//         </dl>
//       )}

//       <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3 dark:border-neutral-700/70">
//         <button
//           type="button"
//           onClick={() => setExpanded((e) => !e)}
//           aria-expanded={expanded}
//           className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-300 dark:hover:bg-neutral-700"
//         >
//           {expanded ? 'Réduire' : 'Détails'}
//           <ChevronDown
//             className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
//             aria-hidden
//           />
//         </button>

//         {tfc.pdf_url ? (
//           <a
//             href={tfc.pdf_url}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white dark:focus-visible:ring-offset-neutral-800"
//           >
//             <Download className="h-4 w-4" aria-hidden />
//             PDF
//           </a>
//         ) : tfc.has_pdf ? (
//           <span className="text-xs text-neutral-400 dark:text-neutral-500">PDF disponible</span>
//         ) : null}
//       </div>
//     </article>
//   )
// }

// function Pagination({
//   page,
//   totalPages,
//   total,
//   pageSize,
//   onChange,
// }: {
//   page: number
//   totalPages: number
//   total: number
//   pageSize: number
//   onChange: (page: number) => void
// }) {
//   if (totalPages <= 1) return null

//   const from = (page - 1) * pageSize + 1
//   const to = Math.min(page * pageSize, total)

//   const navButton =
//     'inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800'

//   return (
//     <nav
//       aria-label="Pagination"
//       className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row"
//     >
//       <p className="text-sm tabular-nums text-neutral-500 dark:text-neutral-400">
//         {from}–{to} sur {total}
//       </p>

//       <div className="flex items-center gap-1">
//         <button
//           type="button"
//           onClick={() => onChange(page - 1)}
//           disabled={page <= 1}
//           className={navButton}
//           aria-label="Page précédente"
//         >
//           <ChevronLeft className="h-4 w-4" aria-hidden />
//           <span className="hidden sm:inline">Précédent</span>
//         </button>

//         {pageWindow(page, totalPages).map((p, i) =>
//           p === '…' ? (
//             <span key={`gap-${i}`} className="px-1.5 text-neutral-400" aria-hidden>
//               …
//             </span>
//           ) : (
//             <button
//               key={p}
//               type="button"
//               onClick={() => onChange(p)}
//               aria-current={p === page ? 'page' : undefined}
//               aria-label={`Page ${p}`}
//               className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
//                 p === page
//                   ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
//                   : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
//               }`}
//             >
//               {p}
//             </button>
//           )
//         )}

//         <button
//           type="button"
//           onClick={() => onChange(page + 1)}
//           disabled={page >= totalPages}
//           className={navButton}
//           aria-label="Page suivante"
//         >
//           <span className="hidden sm:inline">Suivant</span>
//           <ChevronRight className="h-4 w-4" aria-hidden />
//         </button>
//       </div>
//     </nav>
//   )
// }

// function ResultSkeletons() {
//   return (
//     <div className="space-y-4" role="status" aria-label="Recherche en cours">
//       {[0, 1, 2].map((i) => (
//         <div
//           key={i}
//           className="animate-pulse rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800"
//         >
//           <div className="h-3 w-16 rounded bg-neutral-200 dark:bg-neutral-700" />
//           <div className="mt-3 h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
//           <div className="mt-4 h-3 w-full rounded bg-neutral-100 dark:bg-neutral-700/60" />
//           <div className="mt-2 h-3 w-5/6 rounded bg-neutral-100 dark:bg-neutral-700/60" />
//           <div className="mt-4 flex gap-2">
//             <div className="h-5 w-14 rounded bg-neutral-100 dark:bg-neutral-700/60" />
//             <div className="h-5 w-16 rounded bg-neutral-100 dark:bg-neutral-700/60" />
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }

// /* -------------------------------------------------------------------------- */
// /*                                    Page                                    */
// /* -------------------------------------------------------------------------- */

// export default function RecherchePage() {
//   const [input, setInput] = useState('')
//   const [query, setQuery] = useState('')
//   const [thresholdPct, setThresholdPct] = useState(DEFAULT_THRESHOLD_PCT)
//   const debouncedThreshold = useDebounced(thresholdPct, 450)
//   const [page, setPage] = useState(1)
//   const [pageSize, setPageSize] = useState(10)
//   const [sort, setSort] = useState<SortKey>('relevance')
//   const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
//   const [filtersOpen, setFiltersOpen] = useState(false)

//   const [data, setData] = useState<SearchResponse | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   const resultsTopRef = useRef<HTMLDivElement>(null)

//   /* ------------------------------- Chargement ------------------------------ */

//   useEffect(() => {
//     if (!query) return
//     const controller = new AbortController()

//     setLoading(true)
//     setError('')

//     void (async () => {
//       try {
//         const res = await fetch('/api/semantic-recherche', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             query,
//             similarityThreshold: debouncedThreshold / 100,
//             page,
//             pageSize,
//             sort,
//             filters,
//           }),
//           signal: controller.signal,
//         })
//         const payload = await res.json().catch(() => null)
//         if (!res.ok) throw new Error(payload?.error ?? `Erreur ${res.status}`)

//         setData(payload as SearchResponse)
//         // Le serveur ramène la page dans les limites (ex. après un filtre)
//         if (payload.page !== page) setPage(payload.page)
//       } catch (err) {
//         if (err instanceof DOMException && err.name === 'AbortError') return
//         setError(err instanceof Error ? err.message : 'Connexion au serveur impossible.')
//       } finally {
//         if (!controller.signal.aborted) setLoading(false)
//       }
//     })()

//     return () => controller.abort()
//   }, [query, debouncedThreshold, page, pageSize, sort, filters])

//   useEffect(() => {
//     if (!filtersOpen) return
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') setFiltersOpen(false)
//     }
//     window.addEventListener('keydown', onKey)
//     return () => window.removeEventListener('keydown', onKey)
//   }, [filtersOpen])

//   /* --------------------------------- Actions ------------------------------- */

//   const runSearch = (text: string) => {
//     const q = text.trim()
//     if (!q) return
//     setInput(q)
//     if (q !== query) {
//       setFilters(EMPTY_FILTERS)
//       setPage(1)
//       setData(null)
//       setQuery(q)
//     }
//   }

//   const goToPage = (p: number) => {
//     setPage(p)
//     resultsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
//   }

//   const toggleFilter = (key: ListKey, value: string) => {
//     setFilters((prev) => {
//       const current = prev[key]
//       const exists = current.some((v) => v.toLowerCase() === value.toLowerCase())
//       return {
//         ...prev,
//         [key]: exists
//           ? current.filter((v) => v.toLowerCase() !== value.toLowerCase())
//           : [...current, value],
//       }
//     })
//     setPage(1)
//   }

//   const resetFilters = () => {
//     setFilters(EMPTY_FILTERS)
//     setPage(1)
//   }

//   /* --------------------------------- Dérivés ------------------------------- */

//   const activeChips = useMemo(
//     () => LIST_FILTERS.flatMap(({ key }) => filters[key].map((value) => ({ key, value }))),
//     [filters]
//   )
//   const activeCount = activeChips.length

//   const facets = data?.facets ?? EMPTY_FACETS
//   const showSkeleton = !!query && loading && !data
//   const filtersHideAll = !!data && data.total === 0 && data.totalBeforeFilters > 0

//   /* --------------------------------- Rendu --------------------------------- */

//   return (
//     <div className="min-h-[100dvh] bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 dark:[color-scheme:dark]">
     

//       <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
//         <div className="mx-auto mb-6 max-w-3xl text-center">
//           <h1 className="text-2xl font-semibold tracking-tight">Recherche sémantique</h1>
//           <p className="mt-2 text-[15px] leading-6 text-neutral-500 dark:text-neutral-400">
//             Retrouvez les Travaux de Fin de Cycle par sujet, technologie ou idée : la recherche
//             comprend le sens, pas seulement les mots.
//           </p>
//         </div>

//         <form
//           role="search"
//           onSubmit={(e) => {
//             e.preventDefault()
//             runSearch(input)
//           }}
//           className="mx-auto w-full max-w-3xl"
//         >
//           <div className="flex items-center gap-2 rounded-3xl border border-neutral-200 bg-white p-2 pl-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_30px_-18px_rgba(0,0,0,0.25)] transition focus-within:border-neutral-400 focus-within:ring-4 focus-within:ring-neutral-900/5 dark:border-neutral-700 dark:bg-neutral-800 dark:focus-within:border-neutral-500 dark:focus-within:ring-white/5">
//             <Search className="h-5 w-5 shrink-0 text-neutral-400" aria-hidden />
//             <input
//               type="text"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               maxLength={2000}
//               placeholder="Sujet, technologie, fonctionnalité…"
//               aria-label="Votre recherche"
//               className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] outline-none placeholder:text-neutral-400"
//             />
//             {input && (
//               <button
//                 type="button"
//                 onClick={() => setInput('')}
//                 aria-label="Effacer la recherche"
//                 className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
//               >
//                 <X className="h-4 w-4" />
//               </button>
//             )}
//             <button
//               type="submit"
//               disabled={!input.trim() || (loading && input.trim() === query)}
//               className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white dark:focus-visible:ring-offset-neutral-800 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-500"
//             >
//               {loading ? (
//                 <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
//               ) : (
//                 <Search className="h-4 w-4 sm:hidden" aria-hidden />
//               )}
//               <span className={loading ? 'sr-only' : 'hidden sm:inline'}>Rechercher</span>
//             </button>
//           </div>

//           <div className="mt-3 flex items-center justify-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
//             <label htmlFor="threshold" className="whitespace-nowrap">
//               Pertinence minimale :{' '}
//               <span className="font-medium tabular-nums text-neutral-800 dark:text-neutral-200">
//                 {thresholdPct} %
//               </span>
//             </label>
//             <input
//               id="threshold"
//               type="range"
//               min={MIN_THRESHOLD_PCT} // 👈
//               max={MAX_THRESHOLD_PCT} // 👈
//               step={5}
//               value={thresholdPct}
//               onChange={(e) => {
//                 setThresholdPct(Number(e.target.value))
//                 setPage(1)
//               }}
//               className="w-32 accent-neutral-900 dark:accent-neutral-100"
//             />
//           </div>
//         </form>

//         <div className="mt-8 grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
//           <aside className="hidden lg:block" aria-label="Filtres">
//             <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
//               <FiltersPanel
//                 facets={facets}
//                 filters={filters}
//                 onToggle={toggleFilter}
//               />
//             </div>
//           </aside>

//           <section className="min-w-0" aria-live="polite">
//             <div ref={resultsTopRef} className="scroll-mt-20" />

//             {error && (
//               <div
//                 role="alert"
//                 className="mb-4 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
//               >
//                 <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
//                 <span className="flex-1">{error}</span>
//                 <button
//                   type="button"
//                   onClick={() => setError('')}
//                   aria-label="Fermer ce message"
//                   className="rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700"
//                 >
//                   <X className="h-4 w-4" />
//                 </button>
//               </div>
//             )}

//             {!query ? (
//               <div className="rounded-2xl border border-dashed border-neutral-300 px-6 py-14 text-center dark:border-neutral-700">
//                 <Search className="mx-auto h-8 w-8 text-neutral-300 dark:text-neutral-600" aria-hidden />
//                 <h2 className="mt-3 text-base font-semibold">Que cherchez-vous ?</h2>
//                 <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
//                   Décrivez un sujet avec vos propres mots, ou essayez une de ces idées.
//                 </p>
//                 <div className="mt-5 flex flex-wrap justify-center gap-2">
//                   {SUGGESTIONS.map((s) => (
//                     <button
//                       key={s}
//                       type="button"
//                       onClick={() => runSearch(s)}
//                       className="rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-sm text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700/70"
//                     >
//                       {s}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             ) : showSkeleton ? (
//               <ResultSkeletons />
//             ) : data ? (
//               <>
//                 <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
//                   <div className="min-w-0">
//                     <h2 className="text-sm font-semibold">
//                       {data.total} résultat{data.total > 1 ? 's' : ''}
//                     </h2>
//                     <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
//                       pour « {data.query} »
//                       {data.total !== data.totalBeforeFilters &&
//                         ` · ${data.totalBeforeFilters} avant filtres`}
//                       {data.capped && ' · limité aux 50 plus pertinents'}
//                     </p>
//                   </div>

//                   <div className="flex flex-wrap items-center gap-2">
//                     <button
//                       type="button"
//                       onClick={() => setFiltersOpen(true)}
//                       className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 lg:hidden"
//                     >
//                       <SlidersHorizontal className="h-4 w-4" aria-hidden />
//                       Filtres{activeCount > 0 && ` (${activeCount})`}
//                     </button>

//                     <select
//                       value={sort}
//                       onChange={(e) => {
//                         setSort(e.target.value as SortKey)
//                         setPage(1)
//                       }}
//                       aria-label="Trier par"
//                       className={selectClass}
//                     >
//                       <option value="relevance">Pertinence</option>
//                       <option value="note">Meilleure note</option>
//                       <option value="annee">Plus récents</option>
//                     </select>

//                     <select
//                       value={pageSize}
//                       onChange={(e) => {
//                         setPageSize(Number(e.target.value))
//                         setPage(1)
//                       }}
//                       aria-label="Résultats par page"
//                       className={selectClass}
//                     >
//                       {PAGE_SIZES.map((n) => (
//                         <option key={n} value={n}>
//                           {n} / page
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 {data.searchType === 'text' && (
//                   <div className="mb-4 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
//                     <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
//                     La recherche sémantique est momentanément indisponible : résultats par mots-clés.
//                   </div>
//                 )}

//                 {activeCount > 0 && (
//                   <div className="mb-4 flex flex-wrap items-center gap-2">
//                     {activeChips.map(({ key, value }) => (
//                       <button
//                         key={`${key}-${value}`}
//                         type="button"
//                         onClick={() => toggleFilter(key, value)}
//                         className="inline-flex items-center gap-1 rounded-full bg-neutral-200/70 py-1 pl-2.5 pr-1.5 text-xs font-medium text-neutral-800 transition-colors hover:bg-neutral-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:bg-neutral-700/70 dark:text-neutral-100 dark:hover:bg-neutral-600"
//                       >
//                         {value}
//                         <X className="h-3.5 w-3.5" aria-label="Retirer le filtre" />
//                       </button>
//                     ))}
//                     <button
//                       type="button"
//                       onClick={resetFilters}
//                       className="text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-900 hover:underline dark:text-neutral-400 dark:hover:text-neutral-100"
//                     >
//                       Tout effacer
//                     </button>
//                   </div>
//                 )}

//                 {data.total === 0 ? (
//                   <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-12 text-center dark:border-neutral-700 dark:bg-neutral-800">
//                     <Search className="mx-auto h-8 w-8 text-neutral-300 dark:text-neutral-600" aria-hidden />
//                     <h3 className="mt-3 text-base font-semibold">
//                       {filtersHideAll ? 'Aucun résultat avec ces filtres' : 'Aucun TFC trouvé'}
//                     </h3>
//                     <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
//                       {filtersHideAll
//                         ? 'Retirez un filtre pour voir les résultats de la recherche.'
//                         : 'Essayez d’autres termes (synonymes, mots en anglais, technologie précise) ou baissez la pertinence minimale.'}
//                     </p>
//                     <div className="mt-4 flex flex-wrap justify-center gap-2">
//                       {filtersHideAll && (
//                         <button
//                           type="button"
//                           onClick={resetFilters}
//                           className="rounded-lg bg-neutral-900 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
//                         >
//                           Réinitialiser les filtres
//                         </button>
//                       )}
//                       {!filtersHideAll && thresholdPct > MIN_THRESHOLD_PCT && ( // 👈
//                         <button
//                           type="button"
//                           onClick={() =>
//                             setThresholdPct((t) => Math.max(MIN_THRESHOLD_PCT, t - 10)) // 👈
//                           }
//                           className="rounded-lg bg-neutral-900 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
//                         >
//                           Baisser la pertinence minimale
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 ) : (
//                   <div
//                     className={`space-y-4 transition-opacity ${loading ? 'opacity-60' : ''}`}
//                     aria-busy={loading}
//                   >
//                     {data.results.map((tfc) => (
//                       <ResultCard
//                         key={tfc.id}
//                         tfc={tfc}
//                         activeTechs={filters.technologies}
//                         onTech={(tech) => toggleFilter('technologies', tech)}
//                       />
//                     ))}
//                   </div>
//                 )}

//                 <Pagination
//                   page={data.page}
//                   totalPages={data.totalPages}
//                   total={data.total}
//                   pageSize={data.pageSize}
//                   onChange={goToPage}
//                 />
//               </>
//             ) : null}
//           </section>
//         </div>
//       </main>

//       <AnimatePresence>
//         {filtersOpen && (
//           <>
//             <motion.div
//               key="filters-backdrop"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 z-40 bg-black/30 dark:bg-black/60 lg:hidden"
//               onClick={() => setFiltersOpen(false)}
//               aria-hidden
//             />
//             <motion.aside
//               key="filters-drawer"
//               role="dialog"
//               aria-label="Filtres"
//               initial={{ x: '100%' }}
//               animate={{ x: 0 }}
//               exit={{ x: '100%' }}
//               transition={{ type: 'spring', damping: 32, stiffness: 320 }}
//               className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900 sm:w-[380px] lg:hidden"
//             >
//               <div className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-700">
//                 <h2 className="text-sm font-semibold">Filtres</h2>
//                 <button
//                   type="button"
//                   onClick={() => setFiltersOpen(false)}
//                   aria-label="Fermer les filtres"
//                   className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
//                 >
//                   <X className="h-[18px] w-[18px]" />
//                 </button>
//               </div>
//               <div className="min-h-0 flex-1 overflow-y-auto p-4">
//                 <FiltersPanel
//                   facets={facets}
//                   filters={filters}
//                   onToggle={toggleFilter}
//                 />
//               </div>
//               <div className="shrink-0 border-t border-neutral-200 p-4 dark:border-neutral-700">
//                 <button
//                   type="button"
//                   onClick={() => setFiltersOpen(false)}
//                   className="w-full rounded-xl bg-neutral-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
//                 >
//                   Voir {data?.total ?? 0} résultat{(data?.total ?? 0) > 1 ? 's' : ''}
//                 </button>
//               </div>
//             </motion.aside>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   )
// }

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-8 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
            <path d="m8.5 8.5 5 5" />
          </svg>
        </div>

        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
          La recherche sémantique n’est pas disponible pour le moment
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-neutral-500 dark:text-neutral-400">
          Cette fonctionnalité sera activée avec le support de l’intelligence
          artificielle sur la plateforme.
        </p>
      </div>
    </main>
  );
}
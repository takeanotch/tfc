

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowUpDown,
  Check,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Grid,
  Hash,
  History,
  List,
  Pencil,
  Plus,
  Search,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import EditTFCModal from '@/components/tfc/EditTFCModal'
import { PaginationClient } from '@/components/tfc/PaginationClient'

/* --------------------------------- Types --------------------------------- */

interface TFCList {
  id: number
  titre: string
  auteur: string
  annee: string
  filiere: string
  faculte: string
  created_at: string
  departement?: string
  promoteur?: string
  resume?: string
  mots_cles?: string[]
  date_soutenance?: string
  note?: number
  statut?: string
  fichier_nom?: string
  fichier_chemin?: string
  cas_application?: string
  doc_available?: boolean
  nombre_vues?: number
}

type ViewType = 'grid' | 'list'
type SortOption = 'recent' | 'oldest' | 'views_desc' | 'views_asc'

/* ------------------------------- Constantes ------------------------------ */

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ElementType }[] = [
  { value: 'recent', label: 'Plus récent', icon: Clock },
  { value: 'oldest', label: 'Plus ancien', icon: History },
  { value: 'views_desc', label: 'Plus de vues', icon: Eye },
  { value: 'views_asc', label: 'Moins de vues', icon: EyeOff },
]

const VIEW_BUTTONS: { view: ViewType; icon: React.ElementType; label: string }[] = [
  { view: 'list', icon: List, label: 'Liste' },
  { view: 'grid', icon: Grid, label: 'Grille' },
]

const STATUS_TONES: Record<string, string> = {
  en_attente:
    'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',
  default:
    'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20',
}

const CARD = 'rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'

const FOCUS =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500'

/* ------------------------------- Helpers --------------------------------- */

// Une relation Supabase peut revenir en objet ou en tableau selon le schéma
const relation = (rel: unknown, key: string): string => {
  const item = Array.isArray(rel) ? rel[0] : rel
  const value = (item as Record<string, unknown> | null | undefined)?.[key]
  return typeof value === 'string' && value ? value : 'N/A'
}

const lookupName = async (table: string, column: string, id?: number | null): Promise<string> => {
  if (!id) return 'N/A'
  try {
    const { data, error } = await supabase.from(table).select(column).eq('id', id).single()
    if (error) throw error
    const value = (data as unknown as Record<string, unknown> | null)?.[column]
    return typeof value === 'string' && value ? value : 'N/A'
  } catch (err) {
    console.error(`Erreur chargement ${table} :`, err)
    return 'N/A'
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const baseFields = (item: any) => ({
  id: item.id,
  titre: item.titre,
  auteur: item.auteur,
  promoteur: item.promoteur || '',
  resume: item.resume || '',
  mots_cles: item.mots_cles || [],
  date_soutenance: item.date_soutenance || '',
  note: item.note || 0,
  statut: item.statut || 'approuvé',
  fichier_nom: item.fichier_nom || '',
  fichier_chemin: item.fichier_chemin || '',
  cas_application: item.cas_application || 'anonymes',
  doc_available: item.doc_available ?? true,
  nombre_vues: item.nombre_vues || 0,
  created_at: item.created_at,
})

/* ------------------------------ Sous-composants -------------------------- */

function StatusBadge({ statut }: { statut?: string }) {
  // Le statut "approuvé" est l'état normal : on ne l'affiche pas
  if (!statut || statut === 'approuvé') return null
  const tone = STATUS_TONES[statut] ?? STATUS_TONES.default
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}>
      {statut.replace('_', ' ')}
    </span>
  )
}

function IdBadge({ id }: { id: number }) {
  return (
    <span className="rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
      #{id}
    </span>
  )
}

function DocWarning() {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400"
      title="Document indisponible"
    >
      <AlertCircle className="h-4 w-4" aria-hidden />
      <span className="sr-only">Document indisponible</span>
    </span>
  )
}

function EditButton({ onClick, compact = false }: { onClick: () => void; compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Modifier le TFC"
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 ${FOCUS} ${
        compact ? '' : 'w-full'
      }`}
    >
      <Pencil className="h-3.5 w-3.5" aria-hidden />
      <span className={compact ? 'hidden sm:inline' : ''}>Modifier</span>
    </button>
  )
}

function TFCGridCard({ tfc, onEdit }: { tfc: TFCList; onEdit: (t: TFCList) => void }) {
  return (
    <div className={`${CARD} flex h-full flex-col p-4 transition-colors hover:border-zinc-300 dark:hover:border-zinc-600`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <IdBadge id={tfc.id} />
          <StatusBadge statut={tfc.statut} />
        </div>
        <div className="flex items-center gap-3">
          {!tfc.doc_available && <DocWarning />}
          <span className="inline-flex items-center gap-1 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
            <Eye className="h-3.5 w-3.5" aria-hidden />
            {tfc.nombre_vues || 0}
          </span>
        </div>
      </div>

      {/* Titre complet, sans troncature */}
      <h3 className="mb-4 text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
        {tfc.titre}
      </h3>

      <dl className="mt-auto space-y-1.5 text-xs">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="shrink-0 text-zinc-500 dark:text-zinc-400">Auteur</dt>
          <dd className="truncate text-right font-medium text-zinc-900 dark:text-zinc-50">{tfc.auteur}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="shrink-0 text-zinc-500 dark:text-zinc-400">Année</dt>
          <dd className="font-medium text-zinc-900 dark:text-zinc-50">{tfc.annee}</dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-700">
        <EditButton onClick={() => onEdit(tfc)} />
      </div>
    </div>
  )
}

function TFCListItem({ tfc, onEdit }: { tfc: TFCList; onEdit: (t: TFCList) => void }) {
  return (
    <div className={`${CARD} flex items-start gap-3 p-4 transition-colors hover:border-zinc-300 dark:hover:border-zinc-600`}>
     <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#E30613] dark:bg-red-500/10 dark:text-red-400">
  <FileText className="h-4 w-4" aria-hidden />
</div>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <IdBadge id={tfc.id} />
          <StatusBadge statut={tfc.statut} />
          {!tfc.doc_available && <DocWarning />}
        </div>

        <h3 className="mb-2 text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
          {tfc.titre}
        </h3>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">{tfc.auteur}</span>
          {tfc.promoteur && (
            <span>
              Prom. <span className="font-medium text-zinc-700 dark:text-zinc-300">{tfc.promoteur}</span>
            </span>
          )}
          <span>
            Année <span className="font-medium text-zinc-700 dark:text-zinc-300">{tfc.annee}</span>
          </span>
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Eye className="h-3.5 w-3.5" aria-hidden />
            {tfc.nombre_vues || 0} vues
          </span>
        </div>
      </div>

      <div className="shrink-0">
        <EditButton onClick={() => onEdit(tfc)} compact />
      </div>
    </div>
  )
}

function SortModal({
  open,
  onClose,
  sortBy,
  onChange,
  count,
}: {
  open: boolean
  onClose: () => void
  sortBy: SortOption
  onChange: (o: SortOption) => void
  count: number
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Trier par"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2 }}
            className="relative w-full overflow-hidden rounded-t-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800 md:w-80 md:rounded-lg"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Trier par</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className={`rounded p-1 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700 ${FOCUS}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 p-2">
              {SORT_OPTIONS.map(({ value, label, icon: Icon }) => {
                const active = sortBy === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onChange(value)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${FOCUS} ${
                      active
                        ? 'bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50'
                        : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-700/50'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="flex-1">{label}</span>
                    {active && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />}
                  </button>
                )
              })}
            </div>

            <div className="border-t border-zinc-200 px-4 py-2.5 text-center text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              {count} TFC trouvé{count > 1 ? 's' : ''}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-56 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-72 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="h-9 w-36 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <div className={`${CARD} h-16`} />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`${CARD} flex gap-3 p-4`}>
            <div className="h-9 w-9 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* --------------------------------- Page ---------------------------------- */

export default function TFCManagementPage() {
  const [tfcList, setTfcList] = useState<TFCList[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchById, setSearchById] = useState(false)
  const [currentView, setCurrentView] = useState<ViewType>('list') // vue par défaut
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [showSortModal, setShowSortModal] = useState(false)
  const [selectedTFC, setSelectedTFC] = useState<TFCList | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const itemsPerPage = currentView === 'grid' ? 9 : 12

  /* ----------------------------- Chargement ---------------------------- */

  const loadTFCList = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tfc')
        .select(
          `
          id, titre, auteur, promoteur, resume, mots_cles, date_soutenance, note,
          statut, fichier_nom, fichier_chemin, cas_application, doc_available,
          nombre_vues, created_at,
          faculte_id, annee_academique_id, departement_id, filiere_id,
          facultes:faculte_id(nom, code),
          annees_academiques:annee_academique_id(annee),
          departements:departement_id(nom, code),
          filieres:filiere_id(nom, code)
        `
        )
        .order('created_at', { ascending: false })

      if (error) throw error

      // Repli : requête simple + résolution des noms séparément
      let rows = data ?? []
      let useFallback = false
      if (rows.length === 0) {
        const { data: simple, error: simpleError } = await supabase
          .from('tfc')
          .select('*')
          .order('created_at', { ascending: false })
        if (simpleError) throw simpleError
        rows = simple ?? []
        useFallback = true
      }

      const formatted: TFCList[] = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rows.map(async (item: any) => {
          let annee = useFallback ? 'N/A' : relation(item.annees_academiques, 'annee')
          let filiere = useFallback ? 'N/A' : relation(item.filieres, 'nom')
          let faculte = useFallback ? 'N/A' : relation(item.facultes, 'nom')
          let departement = useFallback ? 'N/A' : relation(item.departements, 'nom')

          const [a, f, fa, d] = await Promise.all([
            annee === 'N/A' ? lookupName('annees_academiques', 'annee', item.annee_academique_id) : annee,
            filiere === 'N/A' ? lookupName('filieres', 'nom', item.filiere_id) : filiere,
            faculte === 'N/A' ? lookupName('facultes', 'nom', item.faculte_id) : faculte,
            departement === 'N/A' ? lookupName('departements', 'nom', item.departement_id) : departement,
          ])
          annee = a
          filiere = f
          faculte = fa
          departement = d

          return { ...baseFields(item), annee, filiere, faculte, departement }
        })
      )

      setTfcList(formatted)
    } catch (err) {
      console.error('Erreur lors du chargement des TFC :', err)
      setNotice('Impossible de charger les TFC.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTFCList()
  }, [loadTFCList])

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(''), 5000)
    return () => clearTimeout(t)
  }, [notice])

  /* ------------------------------ Dérivés ------------------------------ */

  const filteredAndSortedTFC = useMemo(() => {
    const q = searchTerm.toLowerCase()

    const filtered = tfcList.filter((tfc) => {
      if (searchById) return tfc.id?.toString().includes(searchTerm)
      return (
        tfc.titre?.toLowerCase().includes(q) ||
        tfc.auteur?.toLowerCase().includes(q) ||
        tfc.filiere?.toLowerCase().includes(q) ||
        tfc.annee?.toLowerCase().includes(q) ||
        tfc.departement?.toLowerCase().includes(q) ||
        tfc.promoteur?.toLowerCase().includes(q) ||
        tfc.mots_cles?.some((mot) => mot.toLowerCase().includes(q))
      )
    })

    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'views_asc':
        filtered.sort((a, b) => (a.nombre_vues || 0) - (b.nombre_vues || 0))
        break
      case 'views_desc':
        filtered.sort((a, b) => (b.nombre_vues || 0) - (a.nombre_vues || 0))
        break
    }

    return filtered
  }, [tfcList, searchTerm, sortBy, searchById])

  const totalPages = Math.ceil(filteredAndSortedTFC.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredAndSortedTFC.slice(startIndex, startIndex + itemsPerPage)
  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label

  /* ------------------------------ Actions ------------------------------ */

  const handleEdit = (tfc: TFCList) => {
    setSelectedTFC(tfc)
    setIsEditModalOpen(true)
  }

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view)
    setCurrentPage(1)
  }

  const handleSearch = (query: string) => {
    setSearchTerm(query)
    setCurrentPage(1)
  }

  const handleSortChange = (option: SortOption) => {
    setSortBy(option)
    setShowSortModal(false)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetSearch = () => {
    setSearchTerm('')
    setSearchById(false)
    setCurrentPage(1)
  }

  /* ------------------------------- Rendu ------------------------------- */

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <SortModal
        open={showSortModal}
        onClose={() => setShowSortModal(false)}
        sortBy={sortBy}
        onChange={handleSortChange}
        count={filteredAndSortedTFC.length}
      />

      {notice && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200"
        >
          <span className="flex-1">{notice}</span>
          <button
            type="button"
            onClick={() => setNotice('')}
            className="rounded p-1 hover:bg-amber-100 dark:hover:bg-amber-900/40"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* En-tête */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
            <FileText className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Gestion des TFC</h1>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              {tfcList.length} travaux de fin de cycle
            </p>
          </div>
        </div>

        <Link
          href="/admin/add"
          className={`inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20 ${FOCUS}`}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Ajouter un TFC
        </Link>
      </div>

      {/* Barre de contrôle */}
      <div className={`${CARD} mb-4 p-3`}>
        <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1 lg:max-w-md">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
              aria-hidden
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchById ? 'Rechercher par ID…' : 'Titre, auteur, filière, année…'}
              className={`w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-20 text-sm text-zinc-900 placeholder-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 ${FOCUS}`}
            />
            <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
              {searchTerm && (
                <button
                  type="button"
                  onClick={resetSearch}
                  aria-label="Effacer la recherche"
                  className={`rounded p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 ${FOCUS}`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchById((v) => !v)}
                aria-pressed={searchById}
                title={searchById ? 'Recherche par ID activée' : 'Rechercher par ID'}
                className={`rounded-md p-1.5 transition-colors ${FOCUS} ${
                  searchById
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600'
                }`}
              >
                <Hash className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSortModal(true)}
              className={`inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 ${FOCUS}`}
            >
              <ArrowUpDown className="h-4 w-4" aria-hidden />
              Trier
            </button>

            <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
              {VIEW_BUTTONS.map(({ view, icon: Icon, label }) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => handleViewChange(view)}
                  title={label}
                  aria-pressed={currentView === view}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${FOCUS} ${
                    currentView === view
                      ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Résumé */}
      <div className="mb-4 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          <span className="text-base font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {filteredAndSortedTFC.length}
          </span>{' '}
          TFC trouvé{filteredAndSortedTFC.length > 1 ? 's' : ''}
        </span>
        <span>
          Tri : <span className="font-medium text-zinc-700 dark:text-zinc-300">{activeSortLabel}</span>
        </span>
      </div>

      {/* Liste / grille */}
      {currentItems.length === 0 ? (
        <div className={`${CARD} flex flex-col items-center gap-2 px-4 py-12 text-center`}>
          <FileText className="h-6 w-6 text-zinc-400" aria-hidden />
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Aucun TFC trouvé</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Modifie ta recherche ou ajoute un nouveau TFC.
          </p>
        </div>
      ) : currentView === 'grid' ? (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {currentItems.map((tfc) => (
            <TFCGridCard key={tfc.id} tfc={tfc} onEdit={handleEdit} />
          ))}
        </div>
      ) : (
        <div className="mb-8 space-y-3">
          {currentItems.map((tfc) => (
            <TFCListItem key={tfc.id} tfc={tfc} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <PaginationClient currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}

      <EditTFCModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedTFC(null)
        }}
        tfc={selectedTFC}
        onTFCUpdated={loadTFCList}
      />
    </div>
  )
}

'use client'

import { useState, useMemo, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PaginationClient } from './PaginationClient'
import { 
  Grid, 
  List, 
  Search, 
  FileText, 
  Eye, 
  X, 
  AlertCircle, 
  Hash, 
  ChevronDown, 
  Calendar, 
  Building, 
  Users,
  Clock,
  History,
  EyeOff,
  Check
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiFilter } from 'react-icons/fi'

interface TFCClientViewProps {
  tfcList: any[]
  user: any
}

type ViewType = 'grid' | 'list'
type SortOption = 'recent' | 'oldest' | 'views_desc' | 'views_asc'

// Rôles qui ont accès à tous les TFCs
const FULL_ACCESS_ROLES = ['admin', 'teacher', 'check_in_admin']

// Constantes de design (Admin TFC) - Couleurs corrigées pour le mode sombre
const CARD = 'rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'
const FOCUS = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500'

export function TFCClientView({ tfcList, user }: TFCClientViewProps) {
  const [currentView, setCurrentView] = useState<ViewType>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [filteredTfcList, setFilteredTfcList] = useState<any[]>([])
  const [showSortModal, setShowSortModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchById, setSearchById] = useState(false)
  
  // États pour les filtres
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedFiliere, setSelectedFiliere] = useState<string>('all')
  const [availableFilters, setAvailableFilters] = useState<{
    years: string[]
    departments: string[]
    filieres: string[]
  }>({
    years: [],
    departments: [],
    filieres: []
  })

  // Options de tri avec icônes Lucide
  const sortOptions = [
    { value: 'recent' as SortOption, label: 'Plus récent', icon: Clock },
    { value: 'oldest' as SortOption, label: 'Plus ancien', icon: History },
    { value: 'views_desc' as SortOption, label: 'Plus de vues', icon: Eye },
    { value: 'views_asc' as SortOption, label: 'Moins de vues', icon: EyeOff }
  ]

  // Extraire les filtres disponibles depuis les données
  useEffect(() => {
    const years = Array.from(new Set(
      tfcList.map(tfc => tfc.annees_academiques?.annee).filter(Boolean).sort((a, b) => b.localeCompare(a))
    ))
    const departments = Array.from(new Set(
      tfcList.map(tfc => tfc.departements?.nom).filter(Boolean).sort()
    ))
    const filieres = Array.from(new Set(
      tfcList.map(tfc => tfc.filieres?.nom).filter(Boolean).sort()
    ))

    setAvailableFilters({
      years: years as string[],
      departments: departments as string[],
      filieres: filieres as string[]
    })
  }, [tfcList])

  // Filtrer les TFCs selon la logique d'accès
  useEffect(() => {
    const filterTFCs = async () => {
      try {
        setIsLoading(true)
        
        if (FULL_ACCESS_ROLES.includes(user?.role)) {
          setFilteredTfcList(tfcList)
          return
        }

        if (user?.departement) {
          const { data: userDepartement } = await supabase
            .from('departements')
            .select('id')
            .eq('nom', user.departement)
            .single()

          if (userDepartement) {
            const filtered = tfcList.filter(tfc => tfc.departement_id === userDepartement.id)
            setFilteredTfcList(filtered)
          } else {
            setFilteredTfcList(tfcList)
          }
        } else {
          setFilteredTfcList(tfcList)
        }
      } catch (error) {
        console.error('Erreur lors du filtrage des TFCs:', error)
        setFilteredTfcList(tfcList)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) { filterTFCs() } else { setIsLoading(false) }
  }, [tfcList, user])

  const filteredAndSortedTFC = useMemo(() => {
    let filtered = filteredTfcList.filter(tfc => {
      const searchMatch = searchById
        ? tfc.id?.toString().includes(searchQuery)
        : tfc.titre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tfc.auteur?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tfc.promoteur?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tfc.resume?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tfc.mots_cles?.some((mot: string) => mot.toLowerCase().includes(searchQuery.toLowerCase()))

      const yearMatch = selectedYear === 'all' || tfc.annees_academiques?.annee === selectedYear
      const departmentMatch = selectedDepartment === 'all' || tfc.departements?.nom === selectedDepartment
      const filiereMatch = selectedFiliere === 'all' || tfc.filieres?.nom === selectedFiliere

      return searchMatch && yearMatch && departmentMatch && filiereMatch
    })

    switch (sortBy) {
      case 'recent': filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break
      case 'oldest': filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break
      case 'views_asc': filtered.sort((a, b) => (a.nombre_vues || 0) - (b.nombre_vues || 0)); break
      case 'views_desc': filtered.sort((a, b) => (b.nombre_vues || 0) - (a.nombre_vues || 0)); break
    }

    return filtered
  }, [filteredTfcList, searchQuery, sortBy, searchById, selectedYear, selectedDepartment, selectedFiliere])

  const itemsPerPage = currentView === 'grid' ? 9 : 12
  const totalPages = Math.ceil(filteredAndSortedTFC.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredAndSortedTFC.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const handleViewChange = (view: ViewType) => { setCurrentView(view); setCurrentPage(1) }
  const handleSearch = (query: string) => { setSearchQuery(query); setCurrentPage(1) }
  const handleSortChange = (option: SortOption) => { setSortBy(option); setShowSortModal(false); setCurrentPage(1) }
  const resetSearch = () => { setSearchQuery(''); setSearchById(false); setCurrentPage(1) }
  const resetFilters = () => { setSelectedYear('all'); setSelectedDepartment('all'); setSelectedFiliere('all'); setCurrentPage(1) }
  
  // Réinitialiser un filtre spécifique
  const clearYearFilter = () => { setSelectedYear('all'); setCurrentPage(1) }
  const clearDepartmentFilter = () => { setSelectedDepartment('all'); setCurrentPage(1) }
  const clearFiliereFilter = () => { setSelectedFiliere('all'); setCurrentPage(1) }

  const hasActiveFilters = selectedYear !== 'all' || selectedDepartment !== 'all' || selectedFiliere !== 'all'
  
  // Compter le nombre de filtres actifs
  const activeFiltersCount = [
    selectedYear !== 'all',
    selectedDepartment !== 'all',
    selectedFiliere !== 'all'
  ].filter(Boolean).length

  const getAccessBadge = () => {
    if (FULL_ACCESS_ROLES.includes(user?.role)) {
      return { text: 'Accès complet à tous les TFCs', light: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dark: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20' }
    } else if (user?.departement) {
      return { text: `Département: ${user.departement}`, light: 'bg-blue-50 text-blue-700 ring-blue-200', dark: 'bg-blue-500/10 text-blue-300 ring-blue-500/20' }
    } else {
      return { text: 'Accès général', light: 'bg-zinc-100 text-zinc-700 ring-zinc-200', dark: 'bg-zinc-800 text-zinc-300 ring-zinc-700' }
    }
  }
  const accessBadge = getAccessBadge()

  // Skeleton Loaders
  const SkeletonGridCard = () => (
    <div className={`${CARD} p-4 animate-pulse`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
          <div className="w-16 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
        </div>
        <div className="w-8 h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="w-3/4 h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="w-full h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="w-1/2 h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      </div>
      <div className="space-y-2 text-xs mt-6">
        <div className="flex justify-between"><div className="w-12 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div><div className="w-20 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div></div>
        <div className="flex justify-between"><div className="w-12 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div><div className="w-10 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div></div>
      </div>
    </div>
  )

  const SkeletonListItem = () => (
    <div className={`${CARD} p-4 animate-pulse`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="w-3/4 h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="w-1/2 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
      </div>
    </div>
  )

  // Composant TFCGridCard
  const TFCGridCard = ({ tfc }: { tfc: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.2 }}
      className={`${CARD} flex flex-col p-4 transition-colors hover:border-zinc-300 dark:hover:border-zinc-600 relative h-full`}
    >
      {!tfc.doc_available && (
        <div className="absolute top-3 right-3 z-10">
          <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400" />
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-[#E30613] dark:bg-red-500/10 dark:text-red-400">
            <FileText className="h-4 w-4" />
          </div>
          {searchById && (
            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
              #{tfc.id}
            </span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
            tfc.statut === 'approuvé' 
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20' 
              : tfc.statut === 'en_attente' 
              ? 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20'
              : 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20'
          }`}>
            {tfc.statut}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
          <Eye className="h-3.5 w-3.5" />
          <span>{tfc.nombre_vues || 0}</span>
        </div>
      </div>

      <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 mb-3 leading-snug">
        {tfc.titre}
      </h3>

      <dl className="mt-auto space-y-1.5 text-xs">
        <div className="flex justify-between items-baseline gap-3">
          <dt className="text-zinc-500 dark:text-zinc-400">Auteur</dt>
          <dd className="font-medium text-zinc-900 dark:text-zinc-50 truncate text-right">{tfc.auteur}</dd>
        </div>
        <div className="flex justify-between items-baseline gap-3">
          <dt className="text-zinc-500 dark:text-zinc-400">Année</dt>
          <dd className="font-medium text-zinc-900 dark:text-zinc-50">{tfc.annees_academiques?.annee || 'N/A'}</dd>
        </div>
      </dl>
    </motion.div>
  )

  // Composant TFCListItem
  const TFCListItem = ({ tfc }: { tfc: any }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
      className={`${CARD} flex items-start gap-3 p-4 transition-colors hover:border-zinc-300 dark:hover:border-zinc-600 relative`}
    >
      {!tfc.doc_available && (
        <div className="absolute top-3 right-3 z-10">
          <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400" />
        </div>
      )}

      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#E30613] dark:bg-red-500/10 dark:text-red-400">
          <FileText className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            {searchById && (
              <span className="rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
                #{tfc.id}
              </span>
            )}
          </div>
          
          <h3 className="mb-2 text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
            {tfc.titre}
          </h3>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-medium text-zinc-900 dark:text-zinc-50">{tfc.auteur}</span>
            <span>Année <span className="font-medium text-zinc-700 dark:text-zinc-300">{tfc.annees_academiques?.annee || 'N/A'}</span></span>
            <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {tfc.nombre_vues || 0} vues</span>
          </div>
        </div>
      </div>
    </motion.div>
  )

  // Modal de tri
  const SortModal = () => (
    <AnimatePresence>
      {showSortModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            onClick={() => setShowSortModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
            className={`${CARD} relative w-full overflow-hidden rounded-t-2xl shadow-xl md:w-80 md:rounded-lg`}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Trier par</h3>
              <button onClick={() => setShowSortModal(false)} className={`rounded p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${FOCUS}`}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1 p-2">
              {sortOptions.map((option) => {
                const active = sortBy === option.value
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${FOCUS} ${
                      active ? 'bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50' : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="flex-1">{option.label}</span>
                    {active && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />}
                  </button>
                )
              })}
            </div>
            <div className="border-t border-zinc-200 px-4 py-2.5 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              {filteredAndSortedTFC.length} TFC trouvé{filteredAndSortedTFC.length > 1 ? 's' : ''}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  // Modal de filtrage
  const FilterModal = () => (
    <AnimatePresence>
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            onClick={() => setShowFilterModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
            className={`${CARD} relative w-full overflow-hidden rounded-t-2xl shadow-xl md:w-96 md:rounded-lg`}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Filtrer les TFCs</h3>
              <button onClick={() => setShowFilterModal(false)} className={`rounded p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${FOCUS}`}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300"><Calendar size={14} /> Année académique</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className={`w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 ${FOCUS}`}>
                  <option value="all">Toutes les années</option>
                  {availableFilters.years.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300"><Building size={14} /> Département</label>
                <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className={`w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 ${FOCUS}`}>
                  <option value="all">Tous les départements</option>
                  {availableFilters.departments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300"><Users size={14} /> Filière</label>
                <select value={selectedFiliere} onChange={(e) => setSelectedFiliere(e.target.value)} className={`w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 ${FOCUS}`}>
                  <option value="all">Toutes les filières</option>
                  {availableFilters.filieres.map((filiere) => <option key={filiere} value={filiere}>{filiere}</option>)}
                </select>
              </div>
            </div>
            <div className="border-t border-zinc-200 p-3 flex gap-2 dark:border-zinc-800">
              <button onClick={resetFilters} disabled={!hasActiveFilters} className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${hasActiveFilters ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300' : 'border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600'} ${FOCUS}`}>
                Réinitialiser
              </button>
              <button onClick={() => setShowFilterModal(false)} className={`flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 ${FOCUS}`}>
                Appliquer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  // Composant pour afficher les filtres actifs
  const ActiveFiltersBar = () => {
    if (!hasActiveFilters) return null

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-4"
      >
        <div className={`${CARD} p-3`}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <FiFilter className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Filtres actifs ({activeFiltersCount})
              </span>
            </div>
            <button
              onClick={resetFilters}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 ${FOCUS}`}
            >
              <X className="h-3 w-3" />
              Tout effacer
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedYear !== 'all' && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300"
              >
                <Calendar className="h-3 w-3" />
                Année: {selectedYear}
                <button
                  onClick={clearYearFilter}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                  aria-label="Supprimer le filtre année"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            )}
            {selectedDepartment !== 'all' && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300"
              >
                <Building className="h-3 w-3" />
                Département: {selectedDepartment}
                <button
                  onClick={clearDepartmentFilter}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-purple-100 dark:hover:bg-purple-500/20"
                  aria-label="Supprimer le filtre département"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            )}
            {selectedFiliere !== 'all' && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
              >
                <Users className="h-3 w-3" />
                Filière: {selectedFiliere}
                <button
                  onClick={clearFiliereFilter}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-amber-100 dark:hover:bg-amber-500/20"
                  aria-label="Supprimer le filtre filière"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  const renderTFCList = () => {
    if (isLoading) {
      return currentView === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {Array.from({ length: 6 }).map((_, index) => <SkeletonGridCard key={index} />)}
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {Array.from({ length: 6 }).map((_, index) => <SkeletonListItem key={index} />)}
        </div>
      )
    }

    if (filteredAndSortedTFC.length === 0) {
      return (
        <div className={`${CARD} flex flex-col items-center gap-2 px-4 py-12 text-center mb-8`}>
          <FileText className="h-6 w-6 text-zinc-400" />
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Aucun TFC trouvé</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {searchQuery || hasActiveFilters ? 'Essayez de modifier vos critères de recherche ou filtres' : 'Aucun travail ne correspond à vos critères'}
          </p>
          {(searchQuery || hasActiveFilters) && (
            <button
              onClick={() => {
                resetSearch()
                resetFilters()
              }}
              className={`mt-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 ${FOCUS}`}
            >
              Réinitialiser tous les filtres
            </button>
          )}
        </div>
      )
    }

    return currentView === 'grid' ? (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8 items-start">
        <AnimatePresence>
          {currentItems.map((tfc) => (
            <motion.a key={tfc.id} href={`/tfc/${tfc.id}`} className="block h-full">
              <TFCGridCard tfc={tfc} />
            </motion.a>
          ))}
        </AnimatePresence>
      </div>
    ) : (
      <div className="space-y-3 mb-8">
        <AnimatePresence>
          {currentItems.map((tfc) => (
            <motion.a key={tfc.id} href={`/tfc/${tfc.id}`} className="block">
              <TFCListItem tfc={tfc} />
            </motion.a>
          ))}
        </AnimatePresence>
      </div>
    )
  }

  const viewButtons = [
    { view: 'list' as ViewType, icon: List, label: 'Liste' },
    { view: 'grid' as ViewType, icon: Grid, label: 'Grille' }
  ]

  return (
    <div className="relative">
      <SortModal />
      <FilterModal />

      {/* Barre de contrôle */}
      <div className={`${CARD} mb-4 p-3`}>
        <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchById ? 'Rechercher par ID…' : 'Titre, auteur, filière…'}
              className={`w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-20 text-sm text-zinc-900 placeholder-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-500 ${FOCUS}`}
            />
            <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
              {searchQuery && (
                <button onClick={resetSearch} className={`rounded p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 ${FOCUS}`}>
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchById((v) => !v)}
                aria-pressed={searchById}
                title={searchById ? 'Recherche par ID activée' : 'Rechercher par ID'}
                className={`rounded-md p-1.5 transition-colors ${FOCUS} ${searchById ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
              >
                <Hash className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilterModal(true)} className={`inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 ${FOCUS} relative`}>
              <FiFilter className="h-4 w-4" /> Filtrer
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#E30613] text-[10px] font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button onClick={() => setShowSortModal(true)} className={`inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 ${FOCUS}`}>
              <ChevronDown className="h-4 w-4" /> Trier
            </button>
            <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-950">
              {viewButtons.map(({ view, icon: Icon, label }) => (
                <button key={view} onClick={() => handleViewChange(view)} className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${FOCUS} ${currentView === view ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'}`}>
                  <Icon className="h-4 w-4" /> <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {searchById && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <Hash size={12} />
            <span>Mode recherche par ID activé (les IDs sont affichés sur les cartes)</span>
          </motion.div>
        )}
      </div>

      {/* Filtres actifs */}
      <AnimatePresence>
        <ActiveFiltersBar />
      </AnimatePresence>

      {/* Résumé */}
      <div className="mb-4 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          <span className="text-base font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{filteredAndSortedTFC.length}</span> TFC trouvé{filteredAndSortedTFC.length > 1 ? 's' : ''}
        </span>
        <span>Tri : <span className="font-medium text-zinc-700 dark:text-zinc-300">{sortOptions.find(opt => opt.value === sortBy)?.label}</span></span>
      </div>

      <AnimatePresence mode="wait">{renderTFCList()}</AnimatePresence>

      {totalPages > 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <PaginationClient currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </motion.div>
      )}
    </div>
  )
}
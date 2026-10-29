'use client'

import { useState, useEffect, useCallback, useMemo, FormEvent } from 'react'
import { AnneeAcademique, Departement, Faculte, Filiere } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import {
  Loader2,
  Pencil,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  CalendarDays,
  Network,
  GraduationCap,
  RefreshCw,
} from 'lucide-react'
import GenericTable, { Column, ActionConfig } from '@/components/GenericTable'

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type AdminSection = 'facultes' | 'annees' | 'departements' | 'filieres'
type Toast = { type: 'success' | 'error'; message: string } | null

const SECTIONS: { id: AdminSection; label: string; icon: typeof Building2 }[] = [
  { id: 'facultes', label: 'Facultés', icon: Building2 },
  { id: 'annees', label: 'Années académiques', icon: CalendarDays },
  { id: 'departements', label: 'Départements', icon: Network },
  { id: 'filieres', label: 'Filières', icon: GraduationCap },
]

/* -------------------------------------------------------------------------- */
/*                              Hook Toast                                    */
/* -------------------------------------------------------------------------- */

function useToast() {
  const [toast, setToast] = useState<Toast>(null)

  const show = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const dismiss = useCallback(() => setToast(null), [])

  return { toast, show, dismiss }
}

/* -------------------------------------------------------------------------- */
/*                              Composants UI                                 */
/* -------------------------------------------------------------------------- */

const inputClass =
  'w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:ring-teal-400 dark:focus:border-teal-400 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm outline-none transition-colors'

const labelClass =
  'block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2'

const primaryBtnClass =
  'inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 px-4 h-9 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed'

const secondaryBtnClass =
  'inline-flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-4 h-9 rounded-lg text-sm font-medium transition-colors'

function ToastBanner({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  if (!toast) return null
  const isSuccess = toast.type === 'success'
  return (
    <div
      role="alert"
      className={`mb-6 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
        isSuccess
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
          : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20'
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 shrink-0" />
      )}
      <span className="flex-1 break-words">{toast.message}</span>
      <button
        onClick={onClose}
        className="shrink-0 rounded p-1 hover:bg-black/5 dark:hover:bg-white/10"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Page Admin                                  */
/* -------------------------------------------------------------------------- */

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('facultes')

  return (
    <div className="min-h-[100dvh] w-full max-w-full overflow-x-clip bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Référentiel académique
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Gérez les facultés, années académiques, départements et filières.
          </p>
        </div>

        {/* Tabs (desktop + mobile) */}
        <div className="mb-6 w-full max-w-full overflow-x-auto overflow-y-hidden border-b border-zinc-200 [-ms-overflow-style:none] [scrollbar-width:none] dark:border-zinc-800 [&::-webkit-scrollbar]:hidden">
          <nav
            className="flex w-max min-w-full space-x-1 pr-4 sm:space-x-4"
            aria-label="Sections d'administration"
          >
            {SECTIONS.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                    isActive
                      ? 'text-zinc-900 dark:text-zinc-50'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{section.label}</span>
                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-900 dark:bg-zinc-100" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Contenu */}
        {activeSection === 'facultes' && <FacultesSection />}
        {activeSection === 'annees' && <AnneesSection />}
        {activeSection === 'departements' && <DepartementsSection />}
        {activeSection === 'filieres' && <FilieresSection />}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Facultés                                     */
/* -------------------------------------------------------------------------- */

function FacultesSection() {
  const [facultes, setFacultes] = useState<Faculte[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ nom: '', code: '' })
  const [editingId, setEditingId] = useState<number | null>(null)
  const { toast, show, dismiss } = useToast()

  const fetchFacultes = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('facultes').select('*').order('nom')
      if (error) throw error
      setFacultes(data || [])
    } catch (error) {
      console.error('Erreur:', error)
      show('Erreur lors du chargement des facultés', 'error')
    } finally {
      setLoading(false)
    }
  }, [show])

  useEffect(() => {
    void fetchFacultes()
  }, [fetchFacultes])

  const resetForm = () => {
    setFormData({ nom: '', code: '' })
    setEditingId(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.nom.trim() || !formData.code.trim()) {
      show('Veuillez remplir tous les champs', 'error')
      return
    }
    try {
      const payload = { nom: formData.nom.trim(), code: formData.code.trim().toUpperCase() }
      if (editingId) {
        const { error } = await supabase.from('facultes').update(payload).eq('id', editingId)
        if (error) throw error
        show('Faculté modifiée avec succès')
      } else {
        const { error } = await supabase.from('facultes').insert([payload])
        if (error) throw error
        show('Faculté ajoutée avec succès')
      }
      resetForm()
      await fetchFacultes()
    } catch (error) {
      console.error('Erreur:', error)
      show('Erreur lors de la sauvegarde', 'error')
    }
  }

  const handleEdit = (faculte: Faculte) => {
    setFormData({ nom: faculte.nom, code: faculte.code })
    setEditingId(faculte.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette faculté ?')) return
    try {
      const { error } = await supabase.from('facultes').delete().eq('id', id)
      if (error) throw error
      show('Faculté supprimée')
      await fetchFacultes()
    } catch (error) {
      console.error('Erreur:', error)
      show('Erreur lors de la suppression', 'error')
    }
  }

  const columns = useMemo<Column[]>(
    () => [
      {
        key: 'nom',
        label: 'Nom',
        mobile: 'primary',
        renderer: (v) => (
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {String(v)}
          </span>
        ),
      },
      {
        key: 'code',
        label: 'Code',
        renderer: (v) => (
          <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20">
            {String(v)}
          </span>
        ),
      },
    ],
    []
  )

  const rowActions = useMemo<ActionConfig[]>(
    () => [
      {
        label: 'Modifier',
        icon: Pencil,
        onClick: (row) => handleEdit(row as unknown as Faculte),
      },
      {
        label: 'Supprimer',
        icon: Trash2,
        variant: 'destructive',
        onClick: (row) => void handleDelete((row as unknown as Faculte).id),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const topActions = useMemo<ActionConfig[]>(
    () => [
      {
        label: 'Actualiser',
        icon: RefreshCw,
        variant: 'outline',
        onClick: () => void fetchFacultes(),
      },
    ],
    [fetchFacultes]
  )

  return (
    <div className="space-y-6">
      <ToastBanner toast={toast} onClose={dismiss} />

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-800/50"
      >
        <h3 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {editingId ? 'Modifier la faculté' : 'Ajouter une faculté'}
        </h3>

        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="fac-nom" className={labelClass}>
              Nom
            </label>
            <input
              id="fac-nom"
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData((p) => ({ ...p, nom: e.target.value }))}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="fac-code" className={labelClass}>
              Code
            </label>
            <input
              id="fac-code"
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))
              }
              className={inputClass}
              required
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className={primaryBtnClass}>
            <Plus className="h-4 w-4" />
            {editingId ? 'Modifier' : 'Ajouter'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className={secondaryBtnClass}>
              Annuler
            </button>
          )}
        </div>
      </form>

      <GenericTable
        title="Facultés"
        subtitle={`${facultes.length} faculté(s)`}
        data={facultes as unknown as Record<string, unknown>[]}
        columns={columns}
        loading={loading}
        topActions={topActions}
        rowActions={rowActions}
        minWidth={600}
        searchable
        searchPlaceholder="Rechercher une faculté…"
        itemsPerPage={10}
        emptyMessage="Aucune faculté enregistrée"
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                            Années académiques                              */
/* -------------------------------------------------------------------------- */

function AnneesSection() {
  const [annees, setAnnees] = useState<AnneeAcademique[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ annee: '' })
  const [editingId, setEditingId] = useState<number | null>(null)
  const { toast, show, dismiss } = useToast()

  const fetchAnnees = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('annees_academiques')
        .select('*')
        .order('annee', { ascending: false })
      if (error) throw error
      setAnnees(data || [])
    } catch (error) {
      console.error('Erreur:', error)
      show('Erreur lors du chargement des années', 'error')
    } finally {
      setLoading(false)
    }
  }, [show])

  useEffect(() => {
    void fetchAnnees()
  }, [fetchAnnees])

  const resetForm = () => {
    setFormData({ annee: '' })
    setEditingId(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.annee.trim()) {
      show('Veuillez renseigner une année', 'error')
      return
    }
    try {
      const payload = { annee: formData.annee.trim() }
      if (editingId) {
        const { error } = await supabase
          .from('annees_academiques')
          .update(payload)
          .eq('id', editingId)
        if (error) throw error
        show('Année modifiée avec succès')
      } else {
        const { error } = await supabase.from('annees_academiques').insert([payload])
        if (error) throw error
        show('Année ajoutée avec succès')
      }
      resetForm()
      await fetchAnnees()
    } catch (error) {
      console.error('Erreur:', error)
      show('Erreur lors de la sauvegarde', 'error')
    }
  }

  const handleEdit = (annee: AnneeAcademique) => {
    setFormData({ annee: annee.annee })
    setEditingId(annee.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette année ?')) return
    try {
      const { error } = await supabase.from('annees_academiques').delete().eq('id', id)
      if (error) throw error
      show('Année supprimée')
      await fetchAnnees()
    } catch (error) {
      console.error('Erreur:', error)
      show('Erreur lors de la suppression', 'error')
    }
  }

  const columns = useMemo<Column[]>(
    () => [
      {
        key: 'annee',
        label: 'Année académique',
        mobile: 'primary',
        renderer: (v) => (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
            <CalendarDays className="h-4 w-4 text-zinc-400" />
            {String(v)}
          </span>
        ),
      },
    ],
    []
  )

  const rowActions = useMemo<ActionConfig[]>(
    () => [
      {
        label: 'Modifier',
        icon: Pencil,
        onClick: (row) => handleEdit(row as unknown as AnneeAcademique),
      },
      {
        label: 'Supprimer',
        icon: Trash2,
        variant: 'destructive',
        onClick: (row) => void handleDelete((row as unknown as AnneeAcademique).id),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const topActions = useMemo<ActionConfig[]>(
    () => [
      {
        label: 'Actualiser',
        icon: RefreshCw,
        variant: 'outline',
        onClick: () => void fetchAnnees(),
      },
    ],
    [fetchAnnees]
  )

  return (
    <div className="space-y-6">
      <ToastBanner toast={toast} onClose={dismiss} />

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-800/50"
      >
        <h3 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {editingId ? "Modifier l'année" : 'Ajouter une année académique'}
        </h3>

        <div className="mb-5">
          <label htmlFor="annee-input" className={labelClass}>
            Année académique
          </label>
          <input
            id="annee-input"
            type="text"
            placeholder="2023-2024"
            value={formData.annee}
            onChange={(e) => setFormData({ annee: e.target.value })}
            className={inputClass}
            required
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className={primaryBtnClass}>
            <Plus className="h-4 w-4" />
            {editingId ? 'Modifier' : 'Ajouter'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className={secondaryBtnClass}>
              Annuler
            </button>
          )}
        </div>
      </form>

      <GenericTable
        title="Années académiques"
        subtitle={`${annees.length} année(s)`}
        data={annees as unknown as Record<string, unknown>[]}
        columns={columns}
        loading={loading}
        topActions={topActions}
        rowActions={rowActions}
        minWidth={500}
        searchable
        searchPlaceholder="Rechercher une année…"
        itemsPerPage={10}
        emptyMessage="Aucune année académique enregistrée"
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Départements                                  */
/* -------------------------------------------------------------------------- */

function DepartementsSection() {
  const [departements, setDepartements] = useState<Departement[]>([])
  const [facultes, setFacultes] = useState<Faculte[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ nom: '', code: '', faculte_id: 0 })
  const [editingId, setEditingId] = useState<number | null>(null)
  const { toast, show, dismiss } = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [depRes, facRes] = await Promise.all([
        supabase
          .from('departements')
          .select('*, faculte:facultes(id, nom, code)')
          .order('nom'),
        supabase.from('facultes').select('*').order('nom'),
      ])
      if (depRes.error) throw depRes.error
      if (facRes.error) throw facRes.error
      setDepartements(depRes.data || [])
      setFacultes(facRes.data || [])
    } catch (error) {
      console.error('Erreur:', error)
      show('Erreur lors du chargement des données', 'error')
    } finally {
      setLoading(false)
    }
  }, [show])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const resetForm = () => {
    setFormData({ nom: '', code: '', faculte_id: 0 })
    setEditingId(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.nom.trim() || !formData.code.trim() || !formData.faculte_id) {
      show('Veuillez remplir tous les champs', 'error')
      return
    }
    try {
      const payload = {
        nom: formData.nom.trim(),
        code: formData.code.trim().toUpperCase(),
        faculte_id: formData.faculte_id,
      }
      if (editingId) {
        const { error } = await supabase
          .from('departements')
          .update(payload)
          .eq('id', editingId)
        if (error) throw error
        show('Département modifié avec succès')
      } else {
        const { error } = await supabase.from('departements').insert([payload])
        if (error) throw error
        show('Département ajouté avec succès')
      }
      resetForm()
      await fetchData()
    } catch (error) {
      console.error('Erreur:', error)
      show('Erreur lors de la sauvegarde', 'error')
    }
  }

  const handleEdit = (dep: Departement) => {
    setFormData({ nom: dep.nom, code: dep.code, faculte_id: dep.faculte_id })
    setEditingId(dep.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) return
    try {
      const { error } = await supabase.from('departements').delete().eq('id', id)
      if (error) throw error
      show('Département supprimé')
      await fetchData()
    } catch (error) {
      console.error('Erreur:', error)
      show('Erreur lors de la suppression', 'error')
    }
  }

  const columns = useMemo<Column[]>(
    () => [
      {
        key: 'nom',
        label: 'Nom',
        mobile: 'primary',
        renderer: (v) => (
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {String(v)}
          </span>
        ),
      },
      {
        key: 'code',
        label: 'Code',
        renderer: (v) => (
          <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20">
            {String(v)}
          </span>
        ),
      },
      {
        key: 'faculte',
        label: 'Faculté',
        renderer: (_v, row) => {
          const dep = row as unknown as Departement
          return (
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {dep.faculte?.nom || '—'}
            </span>
          )
        },
      },
    ],
    []
  )

  const rowActions = useMemo<ActionConfig[]>(
    () => [
      {
        label: 'Modifier',
        icon: Pencil,
        onClick: (row) => handleEdit(row as unknown as Departement),
      },
      {
        label: 'Supprimer',
        icon: Trash2,
        variant: 'destructive',
        onClick: (row) => void handleDelete((row as unknown as Departement).id),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const topActions = useMemo<ActionConfig[]>(
    () => [
      {
        label: 'Actualiser',
        icon: RefreshCw,
        variant: 'outline',
        onClick: () => void fetchData(),
      },
    ],
    [fetchData]
  )

  return (
    <div className="space-y-6">
      <ToastBanner toast={toast} onClose={dismiss} />

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-800/50"
      >
        <h3 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {editingId ? 'Modifier le département' : 'Ajouter un département'}
        </h3>

        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="dep-nom" className={labelClass}>
              Nom
            </label>
            <input
              id="dep-nom"
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData((p) => ({ ...p, nom: e.target.value }))}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="dep-code" className={labelClass}>
              Code
            </label>
            <input
              id="dep-code"
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))
              }
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="dep-fac" className={labelClass}>
              Faculté
            </label>
            <select
              id="dep-fac"
              value={formData.faculte_id || ''}
              onChange={(e) =>
                setFormData((p) => ({ ...p, faculte_id: Number(e.target.value) }))
              }
              className={inputClass}
              required
            >
              <option value="">-- Choisir une faculté --</option>
              {facultes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className={primaryBtnClass}>
            <Plus className="h-4 w-4" />
            {editingId ? 'Modifier' : 'Ajouter'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className={secondaryBtnClass}>
              Annuler
            </button>
          )}
        </div>
      </form>

      <GenericTable
        title="Départements"
        subtitle={`${departements.length} département(s)`}
        data={departements as unknown as Record<string, unknown>[]}
        columns={columns}
        loading={loading}
        topActions={topActions}
        rowActions={rowActions}
        minWidth={700}
        searchable
        searchPlaceholder="Rechercher un département…"
        itemsPerPage={10}
        emptyMessage="Aucun département enregistré"
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 Filières                                   */
/* -------------------------------------------------------------------------- */

function FilieresSection() {
  const [filieres, setFilieres] = useState<Filiere[]>([])
  const [departements, setDepartements] = useState<Departement[]>([])
  const [facultes, setFacultes] = useState<Faculte[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    faculte_id: 0,
    departement_id: 0,
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const { toast, show, dismiss } = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [filRes, facRes] = await Promise.all([
        supabase
          .from('filieres')
          .select(
            '*, departement:departements(id, nom, faculte_id, faculte:facultes(id, nom))'
          )
          .order('nom'),
        supabase.from('facultes').select('*').order('nom'),
      ])
      if (filRes.error) throw filRes.error
      if (facRes.error) throw facRes.error
      setFilieres(filRes.data || [])
      setFacultes(facRes.data || [])
    } catch (error) {
      console.error('Erreur:', error)
      show('Erreur lors du chargement des données', 'error')
    } finally {
      setLoading(false)
    }
  }, [show])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const fetchDepartementsByFaculte = useCallback(
    async (faculteId: number) => {
      try {
        const { data, error } = await supabase
          .from('departements')
          .select('*')
          .eq('faculte_id', faculteId)
          .order('nom')
        if (error) throw error
        setDepartements(data || [])
      } catch (error) {
        console.error('Erreur:', error)
        show('Erreur lors du chargement des départements', 'error')
      }
    },
    [show]
  )

  const resetForm = () => {
    setFormData({ nom: '', code: '', faculte_id: 0, departement_id: 0 })
    setDepartements([])
    setEditingId(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (
      !formData.nom.trim() ||
      !formData.code.trim() ||
      !formData.faculte_id ||
      !formData.departement_id
    ) {
      show('Veuillez remplir tous les champs', 'error')
      return
    }
    try {
      const payload = {
        nom: formData.nom.trim(),
        code: formData.code.trim().toUpperCase(),
        departement_id: formData.departement_id,
      }
      if (editingId) {
        const { error } = await supabase
          .from('filieres')
          .update(payload)
          .eq('id', editingId)
        if (error) throw error
        show('Filière modifiée avec succès')
      } else {
        const { error } = await supabase.from('filieres').insert([payload])
        if (error) throw error
        show('Filière ajoutée avec succès')
      }
      resetForm()
      await fetchData()
    } catch (error) {
      console.error('Erreur:', error)
      show('Erreur lors de la sauvegarde', 'error')
    }
  }

  const handleEdit = (fil: Filiere) => {
    setFormData({
      nom: fil.nom,
      code: fil.code,
      faculte_id: fil.departement?.faculte_id || 0,
      departement_id: fil.departement_id,
    })
    if (fil.departement?.faculte_id) {
      void fetchDepartementsByFaculte(fil.departement.faculte_id)
    }
    setEditingId(fil.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette filière ?')) return
    try {
      const { error } = await supabase.from('filieres').delete().eq('id', id)
      if (error) throw error
      show('Filière supprimée')
      await fetchData()
    } catch (error) {
      console.error('Erreur:', error)
      show('Erreur lors de la suppression', 'error')
    }
  }

  const columns = useMemo<Column[]>(
    () => [
      {
        key: 'nom',
        label: 'Nom',
        mobile: 'primary',
        renderer: (v) => (
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {String(v)}
          </span>
        ),
      },
      {
        key: 'code',
        label: 'Code',
        renderer: (v) => (
          <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20">
            {String(v)}
          </span>
        ),
      },
      {
        key: 'departement',
        label: 'Département',
        renderer: (_v, row) => {
          const fil = row as unknown as Filiere
          return (
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {fil.departement?.nom || '—'}
            </span>
          )
        },
      },
      {
        key: 'faculte',
        label: 'Faculté',
        renderer: (_v, row) => {
          const fil = row as unknown as Filiere
          return (
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {fil.departement?.faculte?.nom || '—'}
            </span>
          )
        },
      },
    ],
    []
  )

  const rowActions = useMemo<ActionConfig[]>(
    () => [
      {
        label: 'Modifier',
        icon: Pencil,
        onClick: (row) => handleEdit(row as unknown as Filiere),
      },
      {
        label: 'Supprimer',
        icon: Trash2,
        variant: 'destructive',
        onClick: (row) => void handleDelete((row as unknown as Filiere).id),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const topActions = useMemo<ActionConfig[]>(
    () => [
      {
        label: 'Actualiser',
        icon: RefreshCw,
        variant: 'outline',
        onClick: () => void fetchData(),
      },
    ],
    [fetchData]
  )

  return (
    <div className="space-y-6">
      <ToastBanner toast={toast} onClose={dismiss} />

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-800/50"
      >
        <h3 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {editingId ? 'Modifier la filière' : 'Ajouter une filière'}
        </h3>

        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label htmlFor="fil-nom" className={labelClass}>
              Nom
            </label>
            <input
              id="fil-nom"
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData((p) => ({ ...p, nom: e.target.value }))}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="fil-code" className={labelClass}>
              Code
            </label>
            <input
              id="fil-code"
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))
              }
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="fil-fac" className={labelClass}>
              Faculté
            </label>
            <select
              id="fil-fac"
              value={formData.faculte_id || ''}
              onChange={(e) => {
                const faculteId = Number(e.target.value)
                setFormData((p) => ({
                  ...p,
                  faculte_id: faculteId,
                  departement_id: 0,
                }))
                if (faculteId) void fetchDepartementsByFaculte(faculteId)
                else setDepartements([])
              }}
              className={inputClass}
              required
            >
              <option value="">-- Choisir une faculté --</option>
              {facultes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="fil-dep" className={labelClass}>
              Département
            </label>
            <select
              id="fil-dep"
              value={formData.departement_id || ''}
              onChange={(e) =>
                setFormData((p) => ({ ...p, departement_id: Number(e.target.value) }))
              }
              className={inputClass}
              required
              disabled={!formData.faculte_id}
            >
              <option value="">-- Choisir un département --</option>
              {departements.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className={primaryBtnClass}>
            <Plus className="h-4 w-4" />
            {editingId ? 'Modifier' : 'Ajouter'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className={secondaryBtnClass}>
              Annuler
            </button>
          )}
        </div>
      </form>

      <GenericTable
        title="Filières"
        subtitle={`${filieres.length} filière(s)`}
        data={filieres as unknown as Record<string, unknown>[]}
        columns={columns}
        loading={loading}
        topActions={topActions}
        rowActions={rowActions}
        minWidth={900}
        searchable
        searchPlaceholder="Rechercher une filière…"
        itemsPerPage={10}
        emptyMessage="Aucune filière enregistrée"
      />
    </div>
  )
}
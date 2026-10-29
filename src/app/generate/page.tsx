

// app/generate/page.tsx  (ou app/admin/embeddings/page.tsx)
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Search,
  Square,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

/* --------------------------------- Types --------------------------------- */

type ItemStatus = 'pending' | 'processing' | 'completed' | 'failed'
type RunState = 'idle' | 'running' | 'paused'
type RunMode = 'missing' | 'all' | 'failed'
type Filter = 'all' | ItemStatus

interface EmbeddingItem {
  id: number
  titre: string
  auteur: string
  status: ItemStatus
  error?: string
}

interface TfcRow {
  id: number
  titre: string | null
  auteur: string | null
  resume: string | null
  mots_cles: string[] | null
  technologies: string[] | null
  fonctionnalites: string[] | null
  cas_application: string | null
}

interface ModelInfo {
  model: string
  dimensions: number
  source: string
}

interface Notice {
  type: 'success' | 'error' | 'info'
  message: string
}

/* -------------------------------- Constantes ------------------------------ */

const PAGE_SIZE = 50
const DEFAULT_DIMENSIONS = 1536
const TFC_COLUMNS =
  'id, titre, auteur, resume, mots_cles, technologies, fonctionnalites, cas_application'

const BATCH_OPTIONS = [1, 3, 5, 10]
const DELAY_OPTIONS = [
  { value: 1000, label: '1 seconde' },
  { value: 2000, label: '2 secondes' },
  { value: 3000, label: '3 secondes' },
  { value: 5000, label: '5 secondes' },
]

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'pending', label: 'En attente' },
  { id: 'completed', label: 'Terminés' },
  { id: 'failed', label: 'Échecs' },
]

const STATUS_META: Record<ItemStatus, { label: string; badge: string }> = {
  pending: {
    label: 'En attente',
    badge:
      'bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700',
  },
  processing: {
    label: 'En cours',
    badge:
      'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20',
  },
  completed: {
    label: 'Terminé',
    badge:
      'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
  },
  failed: {
    label: 'Échec',
    badge:
      'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20',
  },
}

const inputBase =
  'rounded-lg border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60'
const inputEditable =
  'border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-zinc-900/10 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-white/10'

const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50'
const btnPrimary = `${btnBase} bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white`
const btnOutline = `${btnBase} border border-zinc-300 bg-transparent text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800`
const btnDanger = `${btnBase} border border-rose-300 bg-transparent text-rose-700 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/40`

/* -------------------------------- Helpers --------------------------------- */

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const buildEmbeddingText = (tfc: TfcRow): string => {
  const parts: string[] = []
  if (tfc.titre) parts.push(`TITRE: ${tfc.titre}`)
  if (tfc.resume) parts.push(`RÉSUMÉ: ${tfc.resume}`)
  if (tfc.mots_cles?.length) parts.push(`DOMAINE: ${tfc.mots_cles.join(', ')}`)
  if (tfc.technologies?.length) parts.push(`TECHNOLOGIES: ${tfc.technologies.join(', ')}`)
  if (tfc.fonctionnalites?.length) parts.push(`FONCTIONNALITÉS: ${tfc.fonctionnalites.join(', ')}`)
  if (tfc.cas_application && tfc.cas_application !== 'anonymes') {
    parts.push(`APPLICATION: ${tfc.cas_application}`)
  }
  if (tfc.auteur) parts.push(`AUTEUR: ${tfc.auteur}`)
  return parts.join('\n\n').trim()
}

const generateEmbedding = async (text: string): Promise<number[]> => {
  const res = await fetch('/api/generate-embedding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Erreur serveur (${res.status})`)
  if (!Array.isArray(data.embedding)) throw new Error('Embedding manquant dans la réponse')
  return data.embedding
}

/* ------------------------------- Sous-vues -------------------------------- */

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  icon: React.ElementType
  tone: string
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {value}
          </p>
        </div>
        <Icon className={`h-5 w-5 shrink-0 ${tone}`} aria-hidden />
      </div>
    </div>
  )
}

function StatusIcon({ status }: { status: ItemStatus }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
    case 'processing':
      return <Loader2 className="h-4 w-4 animate-spin text-sky-600 dark:text-sky-400" aria-hidden />
    case 'failed':
      return <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" aria-hidden />
    default:
      return <Clock className="h-4 w-4 text-zinc-400 dark:text-zinc-500" aria-hidden />
  }
}

/* ---------------------------------- Page ---------------------------------- */

export default function EmbeddingsPage() {
  const [items, setItems] = useState<EmbeddingItem[]>([])
  const [withV1, setWithV1] = useState(0)
  const [loading, setLoading] = useState(true)
  const [runState, setRunState] = useState<RunState>('idle')
  const [batchSize, setBatchSize] = useState(5)
  const [delayMs, setDelayMs] = useState(2000)
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [modelError, setModelError] = useState(false)
  const [confirmRegen, setConfirmRegen] = useState(false)

  // Refs : la boucle asynchrone lit toujours l'état courant
  const runningRef = useRef(false)
  const pausedRef = useRef(false)

  const dimensions = modelInfo?.dimensions ?? DEFAULT_DIMENSIONS

  /* ----------------------------- Chargement ---------------------------- */

  const loadData = useCallback(async () => {
    try {
      setLoading(true)

      // On évite de télécharger les vecteurs : seulement les ids en attente et un compteur v1
      const [allRes, pendingRes, v1Res] = await Promise.all([
        supabase.from('tfc').select('id, titre, auteur').order('id', { ascending: true }),
        supabase.from('tfc').select('id').is('embedding_2', null),
        supabase.from('tfc').select('id', { count: 'exact', head: true }).not('embedding', 'is', null),
      ])

      if (allRes.error) throw allRes.error
      if (pendingRes.error) throw pendingRes.error

      const pendingIds = new Set<number>((pendingRes.data ?? []).map((r) => r.id as number))

      setItems(
        (allRes.data ?? []).map((t) => ({
          id: t.id as number,
          titre: (t.titre as string | null) ?? 'Sans titre',
          auteur: (t.auteur as string | null) ?? '',
          status: pendingIds.has(t.id as number) ? 'pending' : 'completed',
        }))
      )
      setWithV1(v1Res.count ?? 0)
    } catch (err) {
      console.error('Erreur chargement des statistiques :', err)
      setNotice({ type: 'error', message: 'Impossible de charger les statistiques.' })
    } finally {
      setLoading(false)
    }
  }, [])

  const loadModel = useCallback(async () => {
    try {
      const res = await fetch('/api/generate-embedding')
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      setModelInfo(await res.json())
      setModelError(false)
    } catch (err) {
      console.error('Erreur chargement du modèle :', err)
      setModelError(true)
    }
  }, [])

  useEffect(() => {
    void loadData()
    void loadModel()
  }, [loadData, loadModel])

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 6000)
    return () => clearTimeout(t)
  }, [notice])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [filter, query])

  // Arrête la boucle si on quitte la page
  useEffect(() => {
    return () => {
      runningRef.current = false
    }
  }, [])

  // Prévient avant de fermer l'onglet pendant une génération
  useEffect(() => {
    if (runState === 'idle') return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [runState])

  /* ------------------------------ Dérivés ------------------------------ */

  const counts = useMemo(() => {
    const c = { total: items.length, pending: 0, processing: 0, completed: 0, failed: 0 }
    for (const it of items) c[it.status] += 1
    return c
  }, [items])

  const percentage = counts.total === 0 ? 0 : Math.round((counts.completed / counts.total) * 100)

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((it) => {
      if (filter !== 'all') {
        // « en attente » inclut ce qui est en cours de traitement
        const match =
          filter === 'pending' ? it.status === 'pending' || it.status === 'processing' : it.status === filter
        if (!match) return false
      }
      if (!q) return true
      return (
        it.titre.toLowerCase().includes(q) ||
        it.auteur.toLowerCase().includes(q) ||
        String(it.id).includes(q)
      )
    })
  }, [items, filter, query])

  const visibleItems = filteredItems.slice(0, visibleCount)
  const isActive = runState !== 'idle'

  /* ------------------------------ Génération ------------------------------ */

  const updateItem = (id: number, patch: Partial<EmbeddingItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }

  // Retourne true si le TFC a été traité sans erreur
  const processOne = async (tfc: TfcRow): Promise<boolean> => {
    updateItem(tfc.id, { status: 'processing', error: undefined })
    try {
      const text = buildEmbeddingText(tfc)

      // Texte quasi vide : vecteur neutre pour ne pas bloquer la file
      const embedding =
        text.length < 10 ? new Array<number>(dimensions).fill(0.001) : await generateEmbedding(text)

      const { error } = await supabase
        .from('tfc')
        .update({ embedding_2: embedding, updated_at: new Date().toISOString() })
        .eq('id', tfc.id)

      if (error) throw new Error(`Mise à jour impossible : ${error.message}`)
      updateItem(tfc.id, { status: 'completed' })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error(`Erreur TFC ${tfc.id} :`, err)
      updateItem(tfc.id, { status: 'failed', error: message })
      return false
    }
  }

  /*
    mode 'missing' : les TFC sans embedding_2
    mode 'all'     : tous les TFC (les anciens vecteurs restent en base jusqu'à leur remplacement)
    mode 'failed'  : seulement les échecs
  */
  const runLoop = async (mode: RunMode) => {
    if (runningRef.current) return

    const queue = items
      .filter((it) =>
        mode === 'all' ? true : mode === 'failed' ? it.status === 'failed' : it.status === 'pending'
      )
      .map((it) => it.id)
    if (queue.length === 0) return

    runningRef.current = true
    pausedRef.current = false
    setRunState('running')

    const inQueue = new Set(queue)
    setItems((prev) =>
      prev.map((it) => (inQueue.has(it.id) ? { ...it, status: 'pending', error: undefined } : it))
    )

    const waitIfPaused = async () => {
      while (pausedRef.current && runningRef.current) await sleep(250)
    }

    let failures = 0
    let finished = false

    try {
      for (let i = 0; i < queue.length && runningRef.current; i += batchSize) {
        await waitIfPaused()
        if (!runningRef.current) break

        const chunk = queue.slice(i, i + batchSize)
        const { data, error } = await supabase.from('tfc').select(TFC_COLUMNS).in('id', chunk)
        if (error) {
          setNotice({ type: 'error', message: `Lecture des TFC impossible : ${error.message}` })
          break
        }

        const rows = ((data ?? []) as TfcRow[]).sort((a, b) => chunk.indexOf(a.id) - chunk.indexOf(b.id))

        for (const tfc of rows) {
          await waitIfPaused()
          if (!runningRef.current) break
          const ok = await processOne(tfc)
          if (!ok) failures += 1
          if (runningRef.current) await sleep(delayMs)
        }
      }

      finished = runningRef.current
      if (finished) {
        setNotice(
          failures > 0
            ? { type: 'error', message: `Terminé avec ${failures} échec${failures > 1 ? 's' : ''}.` }
            : { type: 'success', message: 'Génération terminée.' }
        )
      }
    } finally {
      runningRef.current = false
      pausedRef.current = false
      setRunState('idle')
      setItems((prev) =>
        prev.map((it) => (it.status === 'processing' ? { ...it, status: 'pending' } : it))
      )
      // Arrêt en cours de régénération : on relit la base pour retrouver les vrais statuts
      if (!finished && mode === 'all') void loadData()
    }
  }

  const startGeneration = () => {
    setNotice({ type: 'info', message: 'Génération des embeddings démarrée.' })
    void runLoop('missing')
  }

  const startRegeneration = () => {
    setConfirmRegen(false)
    setNotice({
      type: 'info',
      message: `Régénération de ${counts.total} TFC avec ${modelInfo?.model ?? 'le modèle actif'}.`,
    })
    void runLoop('all')
  }

  const retryFailed = () => {
    setNotice({ type: 'info', message: `Nouvelle tentative pour ${counts.failed} TFC.` })
    void runLoop('failed')
  }

  const pauseGeneration = () => {
    pausedRef.current = true
    setRunState('paused')
    setNotice({ type: 'info', message: 'Génération en pause.' })
  }

  const resumeGeneration = () => {
    pausedRef.current = false
    setRunState('running')
    setNotice({ type: 'info', message: 'Génération reprise.' })
  }

  const stopGeneration = () => {
    runningRef.current = false
    pausedRef.current = false
    setNotice({ type: 'info', message: 'Génération arrêtée.' })
  }

  /* -------------------------------- Rendu -------------------------------- */

  return (
    <div className="min-h-[100dvh] bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 dark:[color-scheme:dark]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Embeddings des TFC
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Génère la version 2 des embeddings pour les TFC qui n’en ont pas encore, ou recalcule-les
              tous avec un nouveau modèle.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void loadData()
              void loadModel()
            }}
            disabled={isActive || loading}
            className={btnOutline}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
            Actualiser
          </button>
        </div>

        {/* Notice */}
        {notice && (
          <div
            role="alert"
            className={`mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
              notice.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200'
                : notice.type === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200'
                : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200'
            }`}
          >
            {notice.type === 'success' ? (
              <Check className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            )}
            <span className="flex-1">{notice.message}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Modèle actif */}
        <div className="mb-6 flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
            <Cpu className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Modèle actif</p>
            {modelInfo ? (
              <p className="mt-0.5 truncate font-mono text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {modelInfo.model}
              </p>
            ) : modelError ? (
              <p className="mt-0.5 text-sm text-rose-600 dark:text-rose-400">
                Modèle indisponible : vérifie la route /api/generate-embedding.
              </p>
            ) : (
              <p className="mt-0.5 text-sm text-zinc-400 dark:text-zinc-500">Chargement…</p>
            )}
          </div>
          {modelInfo && (
            <div className="hidden shrink-0 text-right text-xs text-zinc-500 dark:text-zinc-400 sm:block">
              <p>{modelInfo.dimensions} dimensions</p>
              <p className="capitalize">{modelInfo.source === 'huggingface' ? 'Hugging Face' : modelInfo.source}</p>
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Total TFC" value={counts.total} icon={Database} tone="text-zinc-600 dark:text-zinc-400" />
          <StatCard
            label="Terminés"
            value={counts.completed}
            icon={CheckCircle2}
            tone="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            label="En attente"
            value={counts.pending + counts.processing}
            icon={Clock}
            tone="text-amber-600 dark:text-amber-400"
          />
          <StatCard label="Échecs" value={counts.failed} icon={AlertCircle} tone="text-rose-600 dark:text-rose-400" />
        </div>

        {/* Progression + contrôles */}
        <section className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800 sm:p-5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-zinc-900 dark:text-zinc-50">Progression</span>
            <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
              {percentage} % · {counts.completed} sur {counts.total}
            </span>
          </div>
          <div
            className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
            aria-label="Progression de la génération"
          >
            <div
              className="h-full rounded-full bg-emerald-600 transition-[width] duration-500 dark:bg-emerald-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {withV1} TFC ont déjà un embedding v1.
          </p>

          <div className="mt-5 flex flex-col gap-5 border-t border-zinc-200 pt-5 dark:border-zinc-700 xl:flex-row xl:items-end xl:justify-between">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:w-[420px]">
              <div>
                <label
                  htmlFor="batch-size"
                  className="mb-1.5 block text-[13px] font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Taille du lot
                </label>
                <select
                  id="batch-size"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  disabled={isActive}
                  className={`${inputBase} ${inputEditable} w-full`}
                >
                  {BATCH_OPTIONS.map((n) => (
                    <option key={n} value={n} className="bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                      {n} TFC par lot
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="delay"
                  className="mb-1.5 block text-[13px] font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Délai entre deux requêtes
                </label>
                <select
                  id="delay"
                  value={delayMs}
                  onChange={(e) => setDelayMs(Number(e.target.value))}
                  disabled={isActive}
                  className={`${inputBase} ${inputEditable} w-full`}
                >
                  {DELAY_OPTIONS.map((o) => (
                    <option
                      key={o.value}
                      value={o.value}
                      className="bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {runState === 'idle' && (
                <button
                  type="button"
                  onClick={startGeneration}
                  disabled={loading || counts.pending === 0}
                  className={btnPrimary}
                >
                  <Play className="h-4 w-4" aria-hidden />
                  Démarrer
                </button>
              )}
              {runState === 'running' && (
                <button type="button" onClick={pauseGeneration} className={btnPrimary}>
                  <Pause className="h-4 w-4" aria-hidden />
                  Mettre en pause
                </button>
              )}
              {runState === 'paused' && (
                <button type="button" onClick={resumeGeneration} className={btnPrimary}>
                  <Play className="h-4 w-4" aria-hidden />
                  Reprendre
                </button>
              )}
              {isActive && (
                <button type="button" onClick={stopGeneration} className={btnDanger}>
                  <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
                  Arrêter
                </button>
              )}
              <button
                type="button"
                onClick={retryFailed}
                disabled={counts.failed === 0 || isActive}
                className={btnOutline}
              >
                <RotateCw className="h-4 w-4" aria-hidden />
                Réessayer les échecs
              </button>
              <button
                type="button"
                onClick={() => setConfirmRegen(true)}
                disabled={loading || isActive || counts.total === 0 || !modelInfo}
                className={btnOutline}
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Tout régénérer
              </button>
            </div>
          </div>

          {/* Confirmation de la régénération complète */}
          {confirmRegen && modelInfo && (
            <div
              role="alertdialog"
              aria-label="Confirmer la régénération"
              className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200"
            >
              <p className="font-medium">
                Recalculer les embeddings des {counts.total} TFC avec {modelInfo.model} ?
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-800 dark:text-amber-300">
                <li>Les anciens vecteurs restent en base jusqu’à ce que chaque TFC soit remplacé.</li>
                <li>
                  Pendant l’opération, la recherche mélange deux modèles : les résultats seront moins
                  fiables.
                </li>
                <li>
                  Si ce modèle n’a pas {modelInfo.dimensions} dimensions, la colonne de la base doit être
                  adaptée avant de lancer.
                </li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={startRegeneration} className={btnPrimary}>
                  Régénérer {counts.total} TFC
                </button>
                <button type="button" onClick={() => setConfirmRegen(false)} className={btnOutline}>
                  Annuler
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Liste détaillée */}
        <section className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 dark:border-zinc-700 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Détail par TFC</h2>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {filteredItems.length} résultat{filteredItems.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrer par statut">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    aria-pressed={filter === f.id}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                      filter === f.id
                        ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700/50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative sm:w-64">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
                  aria-hidden
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un TFC…"
                  aria-label="Rechercher un TFC"
                  className={`${inputBase} ${inputEditable} w-full pl-9`}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div
              role="status"
              className="flex items-center justify-center gap-2.5 px-4 py-16 text-sm text-zinc-500 dark:text-zinc-400"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Chargement…
            </div>
          ) : visibleItems.length === 0 ? (
            <p className="px-4 py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {items.length === 0 ? 'Aucun TFC dans la base.' : 'Aucun TFC ne correspond à ce filtre.'}
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-700/70">
              {visibleItems.map((it) => (
                <li key={it.id} className="flex items-center gap-3 px-4 py-3">
                  <StatusIcon status={it.status} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{it.titre}</p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {it.auteur ? `${it.auteur} · ` : ''}ID {it.id}
                    </p>
                    {it.error && (
                      <p className="mt-0.5 truncate text-xs text-rose-600 dark:text-rose-400" title={it.error}>
                        {it.error}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_META[it.status].badge}`}
                  >
                    {STATUS_META[it.status].label}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {!loading && filteredItems.length > visibleCount && (
            <div className="border-t border-zinc-200 p-3 text-center dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className={btnOutline}
              >
                Afficher {Math.min(PAGE_SIZE, filteredItems.length - visibleCount)} de plus
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
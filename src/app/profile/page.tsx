
// app/profile/page.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  User, Mail, Lock, Camera, Save, X, Shield, GraduationCap,
  Key, Info, AlertCircle, Check, Loader2, AtSign, Eye, EyeOff,
  ArrowLeft,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

/* --------------------------------- Types --------------------------------- */

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  bio: string | null
  profil_url: string | null
  departement: string | null
  username: string
  privileged: boolean
}

type ActiveTab = 'personal' | 'security' | 'info'

interface Notice {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

/* -------------------------------- Helpers -------------------------------- */

const getRoleMeta = (role: string) => {
  switch (role) {
    case 'admin': return { label: 'Administrateur', icon: Shield }
    case 'teacher': return { label: 'Enseignant', icon: GraduationCap }
    case 'student': return { label: 'Étudiant', icon: User }
    case 'alumni': return { label: 'Ancien élève', icon: GraduationCap }
    case 'check_in_admin': return { label: 'Admin Check-in', icon: Shield }
    default: return { label: 'Utilisateur', icon: User }
  }
}

const getInitials = (name: string) =>
  name.split(' ').filter(Boolean).map((p) => p.charAt(0).toUpperCase()).join('').slice(0, 2) || '?'

const inputBase =
  'w-full rounded-lg border bg-transparent px-3 py-2 text-[15px] outline-none transition-colors focus:ring-2'
const inputEditable =
  'border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-zinc-900/10 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-white/10'
const inputReadOnly =
  'cursor-not-allowed border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-500'

/* ------------------------------- Sous-vues ------------------------------- */

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{hint}</p>}
    </div>
  )
}

function NoticeBanner({ notice, onClose }: { notice: Notice; onClose: () => void }) {
  const styles: Record<Notice['type'], string> = {
    success: 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
    error: 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
    warning: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
    info: 'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200',
  }
  const Icon = notice.type === 'success' ? Check : AlertCircle
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      role="alert"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${styles[notice.type]}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span className="flex-1">{notice.message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

/* ---------------------------------- Page --------------------------------- */

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('personal')
  const [notice, setNotice] = useState<Notice | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: '', email: '', username: '', bio: '',
    newPassword: '', confirmPassword: '',
  })

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 5000)
    return () => clearTimeout(t)
  }, [notice])

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (!response.ok) { router.push('/auth/login'); return }
      const userData: UserProfile = await response.json()
      setUser(userData)
      setFormData({
        name: userData.name ?? '',
        email: userData.email ?? '',
        username: userData.username ?? '',
        bio: userData.bio ?? '',
        newPassword: '', confirmPassword: '',
      })
      setPreviewUrl(userData.profil_url)
    } catch (error) {
      console.error('Erreur chargement profil :', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { void fetchUserProfile() }, [fetchUserProfile])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !user) return
    if (!user.privileged) {
      setNotice({ type: 'warning', message: 'Vous n’avez pas les permissions pour modifier votre photo.' })
      return
    }
    if (!file.type.startsWith('image/')) {
      setNotice({ type: 'error', message: 'Veuillez sélectionner une image valide.' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setNotice({ type: 'error', message: 'L’image ne doit pas dépasser 5 Mo.' })
      return
    }

    setUploading(true)
    try {
      if (user.profil_url) {
        const oldFileName = user.profil_url.split('/').pop()
        if (oldFileName) await supabase.storage.from('profiles').remove([`${user.id}/${oldFileName}`])
      }
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/avatar.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath)
      const updateResponse = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profil_url: publicUrl }),
      })
      if (!updateResponse.ok) throw new Error('Erreur mise à jour profil')

      setPreviewUrl(publicUrl)
      setUser((prev) => (prev ? { ...prev, profil_url: publicUrl } : null))
      setNotice({ type: 'success', message: 'Photo mise à jour.' })
    } catch (error) {
      console.error('Erreur upload :', error)
      setNotice({ type: 'error', message: 'Erreur lors de l’upload.' })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!user.privileged) {
      setNotice({ type: 'warning', message: 'Vous n’avez pas les permissions pour modifier votre profil.' })
      return
    }
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setNotice({ type: 'error', message: 'Les mots de passe ne correspondent pas.' })
      return
    }
    if (formData.newPassword && formData.newPassword.length < 8) {
      setNotice({ type: 'error', message: 'Minimum 8 caractères pour le mot de passe.' })
      return
    }

    setSaving(true)
    try {
      const updateData: Record<string, unknown> = {
        name: formData.name, email: formData.email,
        username: formData.username, bio: formData.bio,
      }
      if (formData.newPassword) updateData.password = formData.newPassword

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erreur lors de la mise à jour')
      }
      await fetchUserProfile()
      setFormData((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }))
      setNotice({ type: 'success', message: 'Profil mis à jour.' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour'
      setNotice({ type: 'error', message })
    } finally {
      setSaving(false)
    }
  }

  const isReadOnly = !user?.privileged

  /* ------------------------------- Loading ------------------------------- */

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div role="status" className="flex items-center gap-2.5 text-sm text-zinc-500 dark:text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Chargement…
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
        <div className="max-w-sm text-center">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Utilisateur non trouvé</h2>
          <button
            onClick={() => router.push('/')}
            className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Retour à l’accueil
          </button>
        </div>
      </div>
    )
  }

  const roleMeta = getRoleMeta(user.role)
  const RoleIcon = roleMeta.icon

  /* -------------------------------- Rendu -------------------------------- */

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-900 dark:[color-scheme:dark]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Fil d'Ariane éditorial */}
        <nav className="flex items-center gap-2 py-6 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Retour
          </button>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span>Profil</span>
        </nav>

        {/* Grille principale : rail gauche + contenu */}
        <div className="grid grid-cols-1 gap-10 pb-20 lg:grid-cols-[280px_1fr] lg:gap-16">

          {/* --------------------------- RAIL GAUCHE --------------------------- */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            {/* Identité : avatar + nom + rôle, sans carte */}
            <div className="flex flex-col items-start">
              <div className="relative">
                <div className="h-20 w-20 overflow-hidden rounded-full bg-zinc-200 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700">
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt={`Photo de ${user.name}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-xl font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                      {getInitials(user.name)}
                    </div>
                  )}
                </div>

                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                    <Loader2 className="h-5 w-5 animate-spin text-white" aria-hidden />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || isReadOnly}
                  aria-label="Changer la photo de profil"
                  className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-zinc-50 text-white transition-colors dark:border-zinc-900 ${
                    isReadOnly
                      ? 'cursor-not-allowed bg-zinc-400 dark:bg-zinc-600'
                      : 'bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white'
                  }`}
                >
                  <Camera className="h-3 w-3" />
                </button>
                <input
                  ref={fileInputRef} type="file" className="hidden" accept="image/*"
                  onChange={handleImageUpload} disabled={uploading || isReadOnly}
                />
              </div>

              <h1 className="mt-5 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {user.name}
              </h1>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                <RoleIcon className="h-3.5 w-3.5" aria-hidden />
                {roleMeta.label}
                {user.departement && (
                  <>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span>{user.departement}</span>
                  </>
                )}
              </div>

              {user.privileged && (
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                  <Shield className="h-3 w-3" aria-hidden />
                  Accès privilégié
                </div>
              )}
            </div>

            {/* Navigation verticale, façon sommaire */}
            <nav className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800" aria-label="Sections">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Sections
              </p>
              <ul className="space-y-1">
                {([
                  { id: 'personal', label: 'Informations', icon: User },
                  { id: 'security', label: 'Sécurité', icon: Key },
                  { id: 'info', label: 'Compte', icon: Info },
                ] as const).map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <li key={tab.id}>
                      <button
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                          isActive
                            ? 'bg-zinc-900 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900'
                            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        {tab.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Note de bas de rail */}
            <p className="mt-10 text-xs leading-5 text-zinc-500 dark:text-zinc-500">
              Les champs <span className="font-medium text-zinc-700 dark:text-zinc-300">rôle</span>,{' '}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">département</span> et{' '}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">ID</span> sont gérés par
              l’administration.
            </p>
          </aside>

          {/* --------------------------- CONTENU --------------------------- */}
          <main className="min-w-0">
            {/* Bannière lecture seule */}
            {isReadOnly && (
              <div className="mb-8 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <div>
                  <p className="font-medium">Mode consultation seule</p>
                  <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                    Contactez un administrateur pour obtenir un accès privilégié.
                  </p>
                </div>
              </div>
            )}

            {/* Notices */}
            <AnimatePresence mode="wait">
              {notice && (
                <div className="mb-6">
                  <NoticeBanner key={notice.message} notice={notice} onClose={() => setNotice(null)} />
                </div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} noValidate>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* ---------------- PERSONAL ---------------- */}
                  {activeTab === 'personal' && (
                    <section>
                      <header className="mb-8 border-b border-zinc-200 pb-5 dark:border-zinc-800">
                        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                          Informations personnelles
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          Visibles par les autres membres de la plateforme.
                        </p>
                      </header>

                      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                        <Field label="Nom complet">
                          <input
                            type="text" value={formData.name}
                            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                            className={`${inputBase} ${isReadOnly ? inputReadOnly : inputEditable}`}
                            required disabled={isReadOnly}
                          />
                        </Field>

                        <Field label="Nom d’utilisateur">
                          <div className="relative">
                            <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" aria-hidden />
                            <input
                              type="text" value={formData.username}
                              onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
                              className={`${inputBase} pl-9 ${isReadOnly ? inputReadOnly : inputEditable}`}
                              required disabled={isReadOnly}
                            />
                          </div>
                        </Field>

                        <Field label="Email">
                          <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" aria-hidden />
                            <input
                              type="email" value={formData.email}
                              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                              className={`${inputBase} pl-9 ${isReadOnly ? inputReadOnly : inputEditable}`}
                              required disabled={isReadOnly}
                            />
                          </div>
                        </Field>

                        <Field label="Département" hint="Géré par un administrateur">
                          <input
                            type="text" value={user.departement || ''}
                            className={`${inputBase} ${inputReadOnly}`} disabled
                          />
                        </Field>

                        <div className="sm:col-span-2">
                          <Field label="Bio">
                            <textarea
                              value={formData.bio}
                              onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
                              rows={4}
                              placeholder="Quelques mots sur vous…"
                              className={`${inputBase} resize-none ${isReadOnly ? inputReadOnly : inputEditable}`}
                              disabled={isReadOnly}
                            />
                          </Field>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* ---------------- SECURITY ---------------- */}
                  {activeTab === 'security' && (
                    <section>
                      <header className="mb-8 border-b border-zinc-200 pb-5 dark:border-zinc-800">
                        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                          Sécurité
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          Laissez vide pour conserver le mot de passe actuel. Minimum 8 caractères.
                        </p>
                      </header>

                      <div className="grid max-w-md grid-cols-1 gap-6">
                        <Field label="Nouveau mot de passe">
                          <div className="relative">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" aria-hidden />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={formData.newPassword}
                              onChange={(e) => setFormData((p) => ({ ...p, newPassword: e.target.value }))}
                              placeholder="••••••••"
                              autoComplete="new-password"
                              className={`${inputBase} pl-9 pr-10 ${isReadOnly ? inputReadOnly : inputEditable}`}
                              disabled={isReadOnly}
                            />
                            <button
                              type="button" onClick={() => setShowPassword((v) => !v)}
                              aria-label={showPassword ? 'Masquer' : 'Afficher'}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </Field>

                        <Field label="Confirmer le mot de passe">
                          <div className="relative">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" aria-hidden />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
                              placeholder="••••••••"
                              autoComplete="new-password"
                              className={`${inputBase} pl-9 ${isReadOnly ? inputReadOnly : inputEditable}`}
                              disabled={isReadOnly}
                            />
                          </div>
                        </Field>
                      </div>
                    </section>
                  )}

                  {/* ---------------- INFO ---------------- */}
                  {activeTab === 'info' && (
                    <section>
                      <header className="mb-8 border-b border-zinc-200 pb-5 dark:border-zinc-800">
                        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                          Compte
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          Données en lecture seule gérées par l’administration.
                        </p>
                      </header>

                      <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                        <div>
                          <dt className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">Rôle</dt>
                          <dd className="mt-1 flex items-center gap-2 text-[15px] text-zinc-900 dark:text-zinc-100">
                            <RoleIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" aria-hidden />
                            {roleMeta.label}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">Statut</dt>
                          <dd className="mt-1 flex items-center gap-2 text-[15px] text-zinc-900 dark:text-zinc-100">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                            Compte actif
                          </dd>
                        </div>

                        <div className="sm:col-span-2">
                          <dt className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">ID utilisateur</dt>
                          <dd className="mt-1">
                            <code className="break-all font-mono text-xs text-zinc-600 dark:text-zinc-400">
                              {user.id}
                            </code>
                          </dd>
                        </div>

                        {user.privileged && (
                          <div className="sm:col-span-2">
                            <dt className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">Privilèges</dt>
                            <dd className="mt-1 flex items-center gap-2 text-[15px] text-amber-700 dark:text-amber-400">
                              <Shield className="h-4 w-4" aria-hidden />
                              Accès privilégié activé
                            </dd>
                          </div>
                        )}
                      </dl>
                    </section>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Barre d'action collée en bas du contenu */}
              {!isReadOnly && activeTab !== 'info' && (
                <div className="mt-10 flex flex-col-reverse gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800 sm:flex-row sm:justify-end">
                  <button
                    type="button" onClick={() => router.back()}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-transparent px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit" disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus-visible:ring-offset-zinc-900"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
                    {saving ? 'Sauvegarde…' : 'Enregistrer'}
                  </button>
                </div>
              )}
            </form>
          </main>
        </div>
      </div>
    </div>
  )
}
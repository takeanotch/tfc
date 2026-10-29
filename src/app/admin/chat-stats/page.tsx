// app/admin/chat-stats/page.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Users,
  MessageSquare,
  MessagesSquare,
  TrendingUp,
  RefreshCw,
  Trash2,
  AlertCircle,
  X,
  CalendarDays,
  CheckCircle2,
} from 'lucide-react'
import GenericTable, { Column, ActionConfig } from '@/components/GenericTable'

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface UserStats {
  id: string // pour GenericTable (getRowId)
  user_id: string
  email: string
  name: string
  message_count: number
  last_active: string
  conversation_count: number
  role: string
}

interface ConversationStats {
  total_conversations: number
  total_messages: number
  active_today: number
  avg_messages_per_user: number
}

interface Conversation {
  id: number
  user_id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
  user_name: string
  user_email: string
}

type TimeRange = '7d' | '30d' | 'all'
type ActiveTab = 'users' | 'conversations'
type Toast = { type: 'success' | 'error'; message: string } | null

/* -------------------------------------------------------------------------- */
/*                                 Helpers                                    */
/* -------------------------------------------------------------------------- */

function getDateRange(range: TimeRange): string {
  const now = new Date()
  switch (range) {
    case '7d':
      return new Date(now.setDate(now.getDate() - 7)).toISOString()
    case '30d':
      return new Date(now.setDate(now.getDate() - 30)).toISOString()
    default:
      return new Date(0).toISOString()
  }
}

function isToday(date: Date): boolean {
  return date.toDateString() === new Date().toDateString()
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'check_in_admin':
      return 'Admin check-in'
    case 'teacher':
      return 'Enseignant'
    case 'student':
      return 'Étudiant'
    case 'alumni':
      return 'Ancien élève'
    default:
      return role || 'N/A'
  }
}

function getRoleTone(role: string): string {
  switch (role) {
    case 'admin':
      return 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20'
    case 'check_in_admin':
      return 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20'
    case 'teacher':
      return 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20'
    case 'student':
      return 'bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20'
    case 'alumni':
      return 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20'
    default:
      return 'bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700'
  }
}

/* -------------------------------------------------------------------------- */
/*                                 Composants                                 */
/* -------------------------------------------------------------------------- */

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
    <div className="min-w-0 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {value}
          </p>
        </div>
        <Icon className={`h-5 w-5 shrink-0 ${tone}`} aria-hidden />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Page principale                               */
/* -------------------------------------------------------------------------- */

export default function ChatStatsAdmin() {
  const [userStats, setUserStats] = useState<UserStats[]>([])
  const [conversationStats, setConversationStats] = useState<ConversationStats | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [activeTab, setActiveTab] = useState<ActiveTab>('users')
  const [deletingConversation, setDeletingConversation] = useState<number | null>(null)
  const [toast, setToast] = useState<Toast>(null)

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type })
      setTimeout(() => setToast(null), 5000)
    },
    []
  )

  /* ----------------------------- Chargement ----------------------------- */

  const loadStats = useCallback(async () => {
    try {
      setLoading(true)

      // 1. Conversations (avec user)
      const { data: conversationsData, error: convError, count: totalConversations } =
        await supabase
          .from('chat_conversations')
          .select(
            `
            id,
            user_id,
            title,
            created_at,
            updated_at,
            users!inner(id, email, name, role)
          `,
            { count: 'exact' }
          )
          .gte('created_at', getDateRange(timeRange))
          .order('updated_at', { ascending: false })

      if (convError) throw convError

      // 2. Messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select(
          `
          id,
          conversation_id,
          role,
          content,
          created_at,
          chat_conversations!inner(user_id)
        `
        )
        .gte('created_at', getDateRange(timeRange))

      if (messagesError) throw messagesError

      // 3. Utilisateurs
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, name, role, last_login')

      if (usersError) throw usersError

      // 4. Agrégation utilisateurs
      const userMap = new Map<string, UserStats>()

      usersData?.forEach((user) => {
        userMap.set(user.id, {
          id: user.id,
          user_id: user.id,
          email: user.email || 'Email non disponible',
          name: user.name || 'Utilisateur sans nom',
          role: user.role || 'N/A',
          message_count: 0,
          last_active: user.last_login || new Date().toISOString(),
          conversation_count: 0,
        })
      })

      const resolveUserInfo = (raw: unknown) => {
        const obj = Array.isArray(raw) ? raw[0] : raw
        return obj as { email?: string; name?: string; role?: string; user_id?: string } | undefined
      }

      conversationsData?.forEach((conv) => {
        const userId = conv.user_id
        if (!userId) return
        const info = resolveUserInfo(conv.users)
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            id: userId,
            user_id: userId,
            email: info?.email || 'Email non disponible',
            name: info?.name || 'Utilisateur sans nom',
            role: info?.role || 'N/A',
            message_count: 0,
            last_active: conv.updated_at || conv.created_at,
            conversation_count: 0,
          })
        }
        const user = userMap.get(userId)!
        user.conversation_count++
        const convDate = new Date(conv.updated_at || conv.created_at)
        if (convDate > new Date(user.last_active)) {
          user.last_active = conv.updated_at || conv.created_at
        }
      })

      messagesData?.forEach((msg) => {
        const userId = resolveUserInfo(msg.chat_conversations)?.user_id
        if (!userId) return
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            id: userId,
            user_id: userId,
            email: 'Utilisateur inconnu',
            name: 'Utilisateur inconnu',
            role: 'N/A',
            message_count: 0,
            last_active: msg.created_at,
            conversation_count: 0,
          })
        }
        const user = userMap.get(userId)!
        user.message_count++
        if (new Date(msg.created_at) > new Date(user.last_active)) {
          user.last_active = msg.created_at
        }
      })

      const userStatsArray = Array.from(userMap.values()).sort(
        (a, b) => b.message_count - a.message_count
      )

      setUserStats(userStatsArray)

      // 5. Conversations enrichies
      const convWithCounts: Conversation[] = (conversationsData || []).map((conv) => {
        const info = resolveUserInfo(conv.users)
        const messageCount =
          messagesData?.filter((m) => m.conversation_id === conv.id).length || 0
        return {
          id: conv.id,
          user_id: conv.user_id,
          title: conv.title,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          message_count: messageCount,
          user_name: info?.name || 'Utilisateur inconnu',
          user_email: info?.email || 'Email inconnu',
        }
      })

      setConversations(convWithCounts)

      // 6. Stats globales
      const totalMessages = messagesData?.length || 0
      const activeToday = userStatsArray.filter((u) => isToday(new Date(u.last_active))).length

      setConversationStats({
        total_conversations: totalConversations || 0,
        total_messages: totalMessages,
        active_today: activeToday,
        avg_messages_per_user:
          userStatsArray.length > 0
            ? Math.round(totalMessages / userStatsArray.length)
            : 0,
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [timeRange, showToast])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  /* --------------------------- Suppression ---------------------------- */

  const deleteConversation = useCallback(
    async (conversationId: number) => {
      if (
        !confirm(
          'Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.'
        )
      ) {
        return
      }

      try {
        setDeletingConversation(conversationId)
        const { error } = await supabase
          .from('chat_conversations')
          .delete()
          .eq('id', conversationId)
        if (error) throw error
        showToast('Conversation supprimée')
        await loadStats()
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Erreur lors de la suppression'
        showToast(msg, 'error')
      } finally {
        setDeletingConversation(null)
      }
    },
    [loadStats, showToast]
  )

  /* ----------------------------- Colonnes ----------------------------- */

  const userColumns = useMemo<Column[]>(
    () => [
      {
        key: 'name',
        label: 'Utilisateur',
        renderer: (_v, row) => {
          const u = row as unknown as UserStats
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {u.name}
                </div>
                <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {u.email}
                </div>
              </div>
            </div>
          )
        },
        mobile: 'primary',
      },
      {
        key: 'role',
        label: 'Rôle',
        renderer: (v) => {
          const role = String(v)
          return (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getRoleTone(
                role
              )}`}
            >
              {getRoleLabel(role)}
            </span>
          )
        },
      },
      {
        key: 'message_count',
        label: 'Messages',
        renderer: (v) => (
          <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {Number(v)}
          </span>
        ),
      },
      {
        key: 'conversation_count',
        label: 'Conversations',
        renderer: (v) => (
          <span className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
            {Number(v)}
          </span>
        ),
      },
      {
        key: 'last_active',
        label: 'Dernière activité',
        renderer: (v) => (
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {v ? formatDate(String(v)) : '—'}
          </span>
        ),
      },
    ],
    []
  )

  const conversationColumns = useMemo<Column[]>(
    () => [
      {
        key: 'title',
        label: 'Titre',
        truncate: true,
        renderer: (v) => (
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {String(v) || 'Sans titre'}
          </span>
        ),
        mobile: 'primary',
      },
      {
        key: 'user_name',
        label: 'Utilisateur',
        renderer: (_v, row) => {
          const c = row as unknown as Conversation
          return (
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {c.user_name}
              </div>
              <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {c.user_email}
              </div>
            </div>
          )
        },
      },
      {
        key: 'message_count',
        label: 'Messages',
        renderer: (v) => (
          <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {Number(v)}
          </span>
        ),
      },
      {
        key: 'created_at',
        label: 'Création',
        renderer: (v) => (
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {formatDate(String(v))}
          </span>
        ),
        mobile: 'hidden',
      },
      {
        key: 'updated_at',
        label: 'Dernière activité',
        renderer: (v) => (
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {formatDate(String(v))}
          </span>
        ),
      },
    ],
    []
  )

  /* --------------------------- Actions lignes -------------------------- */

  const conversationRowActions = useMemo<ActionConfig[]>(
    () => [
      {
        label: deletingConversation !== null ? 'Suppression…' : 'Supprimer',
        icon: Trash2,
        variant: 'destructive',
        onClick: (row) => {
          const c = row as unknown as Conversation
          void deleteConversation(c.id)
        },
      },
    ],
    [deleteConversation, deletingConversation]
  )

  const topActions = useMemo<ActionConfig[]>(
    () => [
      {
        label: 'Actualiser',
        icon: RefreshCw,
        variant: 'outline',
        onClick: () => void loadStats(),
      },
    ],
    [loadStats]
  )

  /* ------------------------------ Filtres ----------------------------- */

  const rangeFilters = [
    { id: '7d' as TimeRange, label: '7 jours' },
    { id: '30d' as TimeRange, label: '30 jours' },
    { id: 'all' as TimeRange, label: 'Tout' },
  ]

  /* ------------------------------- Rendu ------------------------------- */

  return (
    <div className="min-h-[100dvh] w-full max-w-full overflow-x-clip bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Statistiques du chat
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Activité des utilisateurs et conversations du chatbot.
            </p>
          </div>
        </div>

        {/* Toast */}
        <ToastBanner toast={toast} onClose={() => setToast(null)} />

        {/* Filtres période */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label="Période"
            className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-800"
          >
            {rangeFilters.map((r) => {
              const isActive = timeRange === r.id
              return (
                <button
                  key={r.id}
                  onClick={() => setTimeRange(r.id)}
                  aria-pressed={isActive}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700'
                  }`}
                >
                  {r.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Stats globales */}
        {conversationStats && (
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard
              label="Utilisateurs actifs"
              value={userStats.length}
              icon={Users}
              tone="text-zinc-600 dark:text-zinc-400"
            />
            <StatCard
              label="Total messages"
              value={conversationStats.total_messages}
              icon={MessageSquare}
              tone="text-emerald-600 dark:text-emerald-400"
            />
            <StatCard
              label="Conversations"
              value={conversationStats.total_conversations}
              icon={MessagesSquare}
              tone="text-sky-600 dark:text-sky-400"
            />
            <StatCard
              label="Moyenne / user"
              value={conversationStats.avg_messages_per_user}
              icon={TrendingUp}
              tone="text-amber-600 dark:text-amber-400"
            />
          </div>
        )}

        {/* Onglets Utilisateurs / Conversations */}
        <div className="mb-4 w-full max-w-full overflow-x-auto overflow-y-hidden border-b border-zinc-200 [-ms-overflow-style:none] [scrollbar-width:none] dark:border-zinc-800 [&::-webkit-scrollbar]:hidden">
          <nav
            className="flex w-max min-w-full space-x-1 pr-4 sm:space-x-4"
            aria-label="Onglets de statistiques"
          >
            {[
              { id: 'users' as ActiveTab, label: 'Utilisateurs', icon: Users },
              { id: 'conversations' as ActiveTab, label: 'Conversations', icon: MessagesSquare },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                    isActive
                      ? 'text-zinc-900 dark:text-zinc-50'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-900 dark:bg-zinc-100" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Table utilisateurs */}
        {activeTab === 'users' && (
          <GenericTable
            title="Utilisateurs"
            subtitle={`${userStats.length} utilisateur(s) sur la période`}
            data={userStats as unknown as Record<string, unknown>[]}
            columns={userColumns}
            loading={loading}
            topActions={topActions}
            minWidth={900}
            searchable
            searchPlaceholder="Rechercher un nom, un email, un rôle…"
            itemsPerPage={10}
            emptyMessage="Aucun utilisateur trouvé pour la période sélectionnée"
          />
        )}

        {/* Table conversations */}
        {activeTab === 'conversations' && (
          <GenericTable
            title="Conversations"
            subtitle={`${conversations.length} conversation(s) sur la période`}
            data={conversations as unknown as Record<string, unknown>[]}
            columns={conversationColumns}
            loading={loading}
            topActions={topActions}
            rowActions={conversationRowActions}
            minWidth={900}
            searchable
            searchPlaceholder="Rechercher un titre, un utilisateur…"
            itemsPerPage={10}
            emptyMessage="Aucune conversation trouvée pour la période sélectionnée"
          />
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
        </div>
      </div>
    </div>
  )
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiRefreshCw,
  FiActivity,
  FiClock,
  FiGlobe,
  FiFilter,
  FiUser,
  FiMonitor,
  FiSmartphone,
  FiLogIn,
  FiLogOut,
  FiEye,
  FiPlus,
  FiEdit,
  FiTrash2,
} from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import GenericTable from '@/components/GenericTable';

/* --------------------------------- Types --------------------------------- */

interface UserActivity {
  id: string;
  user_id: string;
  page_url: string;
  action_type: string;
  user_agent: string;
  ip_address: string;
  created_at: string;
  users?: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
    departement: string;
    active: boolean;
    last_login: string;
    created_at: string;
  };
}

/* ------------------------------- Helpers --------------------------------- */

const ACTION_LABELS: Record<string, string> = {
  login: 'Connexion',
  logout: 'Déconnexion',
  page_view: 'Page visitée',
  create: 'Création',
  update: 'Modification',
  delete: 'Suppression',
};

const ACTION_ICONS: Record<string, React.ElementType> = {
  login: FiLogIn,
  logout: FiLogOut,
  page_view: FiEye,
  create: FiPlus,
  update: FiEdit,
  delete: FiTrash2,
};

const getBrowserInfo = (ua?: string): string => {
  if (!ua) return 'Inconnu';
  const s = ua.toLowerCase();
  if (s.includes('edg')) return 'Edge';
  if (s.includes('chrome') && !s.includes('edg')) return 'Chrome';
  if (s.includes('firefox')) return 'Firefox';
  if (s.includes('safari') && !s.includes('chrome')) return 'Safari';
  if (s.includes('opera')) return 'Opera';
  return 'Navigateur';
};

const getDeviceInfo = (ua?: string): { label: string; icon: React.ElementType } => {
  if (!ua) return { label: 'Desktop', icon: FiMonitor };
  const s = ua.toLowerCase();
  if (s.includes('tablet') || s.includes('ipad')) return { label: 'Tablette', icon: FiSmartphone };
  if (s.includes('mobile') || s.includes('android') || s.includes('iphone'))
    return { label: 'Mobile', icon: FiSmartphone };
  return { label: 'Desktop', icon: FiMonitor };
};

const getTimeAgo = (dateString: string): string => {
  if (!dateString) return 'Jamais';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return 'Date invalide';
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'À l’instant';
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}j`;
};

const formatTime = (dateString: string): string => {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

/* --------------------------------- Page ---------------------------------- */

export default function UserActivityPage() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [notice, setNotice] = useState('');

  /* ----------------------------- Chargement ---------------------------- */

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_activity')
        .select(
          `*, users (id, username, email, name, role, departement, active, last_login, created_at)`
        )
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      setActivities(data ?? []);
    } catch (err) {
      console.error('Erreur chargement activités :', err);
      setNotice('Impossible de charger les activités.');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchActivities, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchActivities]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  /* ------------------------------ Dérivés ------------------------------ */

  // Enrichissement des données pour le tableau
  const tableData = useMemo(
    () =>
      activities.map((a) => ({
        ...a,
        id: a.id,
        action_label: ACTION_LABELS[a.action_type] ?? a.action_type,
        time_ago: getTimeAgo(a.created_at),
        formatted_time: formatTime(a.created_at),
        user_name: a.users?.name || a.users?.username || 'N/A',
        user_email: a.users?.email || '',
        user_role: a.users?.role || '',
        user_departement: a.users?.departement || '',
        browser: getBrowserInfo(a.user_agent),
        device_label: getDeviceInfo(a.user_agent).label,
      })),
    [activities]
  );

  const actionTypes = useMemo(
    () => Array.from(new Set(tableData.map((a) => a.action_label))),
    [tableData]
  );

  const roleOptions = useMemo(
    () => Array.from(new Set(tableData.map((a) => a.user_role).filter(Boolean))),
    [tableData]
  );

  const stats = useMemo(
    () => ({
      total: activities.length,
      users: new Set(activities.map((a) => a.user_id)).size,
      types: actionTypes.length,
      pages: new Set(activities.map((a) => a.page_url)).size,
    }),
    [activities, actionTypes]
  );

  /* ------------------------------- Rendu ------------------------------- */

  return (
    <div>
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
            ✕
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Total activités', value: stats.total, icon: FiClock, tone: 'text-zinc-600 dark:text-zinc-400' },
          { label: 'Utilisateurs uniques', value: stats.users, icon: FiUser, tone: 'text-sky-600 dark:text-sky-400' },
          { label: 'Types d’actions', value: stats.types, icon: FiFilter, tone: 'text-violet-600 dark:text-violet-400' },
          { label: 'Pages visitées', value: stats.pages, icon: FiGlobe, tone: 'text-emerald-600 dark:text-emerald-400' },
        ].map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.label}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {it.label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                    {it.value}
                  </p>
                </div>
                <Icon className={`h-5 w-5 shrink-0 ${it.tone}`} aria-hidden />
              </div>
            </div>
          );
        })}
      </div>

      <GenericTable
        title="Journal d’activité"
        subtitle="Dernières activités des utilisateurs"
        data={tableData}
        loading={loading}
        emptyMessage="Aucune activité"
        searchable
        searchPlaceholder="Rechercher (utilisateur, page, IP)…"
        pagination
        itemsPerPage={25}
        sortable
        minWidth={1100}
        columns={[
          {
            key: 'user_name',
            label: 'Utilisateur',
            renderer: (_v, row) => {
              const r = row as Record<string, unknown>;
              const name = String(r.user_name);
              return (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {name}
                    </div>
                    <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {String(r.user_email)}
                    </div>
                  </div>
                </div>
              );
            },
          },
          {
            key: 'user_role',
            label: 'Rôle',
            truncate: true,
            renderer: (v) => {
              const role = String(v || '');
              const label =
                role === 'admin'
                  ? 'Admin'
                  : role === 'check_in_admin'
                  ? 'Check-in'
                  : role === 'teacher'
                  ? 'Enseignant'
                  : role === 'student'
                  ? 'Étudiant'
                  : role === 'alumni'
                  ? 'Alumni'
                  : role || '—';
              return <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>;
            },
          },
          {
            key: 'action_label',
            label: 'Action',
            type: 'status',
            options: {
              customStatuses: Object.fromEntries(
                Object.entries(ACTION_LABELS).map(([key, label]) => {
                  const toneMap: Record<string, string> = {
                    login:
                      'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
                    logout:
                      'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20',
                    page_view:
                      'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20',
                    create:
                      'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20',
                    update:
                      'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',
                    delete:
                      'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20',
                  };
                  return [label, { color: toneMap[key] ?? 'bg-zinc-100 text-zinc-600 ring-zinc-200' }];
                })
              ),
            },
          },
          {
            key: 'page_url',
            label: 'Page',
            truncate: true,
            renderer: (v, row) => {
              const r = row as Record<string, unknown>;
              const page = v as string | undefined;
              return (
                <div className="max-w-[220px]">
                  <div className="truncate text-sm text-zinc-900 dark:text-zinc-100" title={page}>
                    {page || '—'}
                  </div>
                  <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {String(r.ip_address || '—')}
                  </div>
                </div>
              );
            },
          },
          {
            key: 'browser',
            label: 'Appareil',
            renderer: (_v, row) => {
              const r = row as Record<string, unknown>;
              const device = String(r.device_label || 'Desktop');
              const DeviceIcon = device === 'Desktop' ? FiMonitor : FiSmartphone;
              return (
                <div>
                  <div className="text-sm text-zinc-700 dark:text-zinc-300">
                    {String(r.browser)}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <DeviceIcon className="h-3 w-3" />
                    {device}
                  </div>
                </div>
              );
            },
          },
          {
            key: 'time_ago',
            label: 'Temps',
            renderer: (_v, row) => {
              const r = row as Record<string, unknown>;
              return (
                <div>
                  <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {String(r.time_ago)}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {String(r.formatted_time)}
                  </div>
                </div>
              );
            },
          },
        ]}
        filters={[
          { key: 'action_label', placeholder: 'Type d’action', options: actionTypes },
          { key: 'user_role', placeholder: 'Rôle', options: roleOptions },
        ]}
        topActions={[
          {
            label: autoRefresh ? 'Auto ON' : 'Auto OFF',
            icon: FiRefreshCw,
            variant: 'outline',
            onClick: () => setAutoRefresh((v) => !v),
          },
          {
            label: 'Actualiser',
            icon: FiRefreshCw,
            variant: 'outline',
            onClick: fetchActivities,
          },
        ]}
      />
    </div>
  );
}
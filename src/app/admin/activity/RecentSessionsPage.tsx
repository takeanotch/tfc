
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FiUsers,
  FiActivity,
  FiUserCheck,
  FiTrendingUp,
  FiRefreshCw,
  FiUser,
  FiRadio,
  FiBarChart2,
  FiLogOut,
  FiExternalLink,
} from 'react-icons/fi';
import { RealTimeClock } from '@/components/RealTimeClock';
import GenericTable from '@/components/GenericTable';

/* --------------------------------- Types --------------------------------- */

interface OnlineUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  departement?: string;
  last_activity: string;
  is_online: boolean;
  profil_url?: string;
  active: boolean;
  current_page?: string;
  login_duration?: string;
}

interface SessionStats {
  onlineNow: number;
  activeToday: number;
  totalUsers: number;
  peakToday: number;
}

/* ------------------------------- Helpers --------------------------------- */

const getTimeAgo = (dateString: string): string => {
  if (!dateString) return 'Jamais';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return 'Date invalide';
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 30) return 'À l’instant';
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
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

/* --------------------------------- Stats --------------------------------- */

function StatsRow({ stats }: { stats: SessionStats }) {
  const items = [
    { label: 'En ligne', value: stats.onlineNow, icon: FiRadio, tone: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Actifs aujourd’hui', value: stats.activeToday, icon: FiActivity, tone: 'text-sky-600 dark:text-sky-400' },
    { label: 'Total utilisateurs', value: stats.totalUsers, icon: FiUsers, tone: 'text-zinc-600 dark:text-zinc-400' },
    { label: 'Pic aujourd’hui', value: stats.peakToday, icon: FiTrendingUp, tone: 'text-amber-600 dark:text-amber-400' },
  ];
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((it) => {
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
  );
}

/* --------------------------------- Page ---------------------------------- */

export default function RecentSessionsPage() {
  const [recentUsers, setRecentUsers] = useState<OnlineUser[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    onlineNow: 0,
    activeToday: 0,
    totalUsers: 0,
    peakToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notice, setNotice] = useState('');

  /* ----------------------------- Chargement ---------------------------- */

  const loadSessionData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/sessions/recent');
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setRecentUsers(data.recentUsers ?? []);
      setStats(
        data.stats ?? {
          onlineNow: 0,
          activeToday: data.recentUsers?.length ?? 0,
          totalUsers: 0,
          peakToday: 0,
        }
      );
    } catch (err) {
      console.error('Erreur chargement sessions :', err);
      setNotice('Impossible de charger les sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSessionData();
    if (!autoRefresh) return;
    const interval = setInterval(loadSessionData, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadSessionData]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  /* ------------------------------ Actions ------------------------------ */

  const handleForceLogout = async (userId: string, username: string) => {
    if (!window.confirm(`Déconnecter ${username} ?`)) return;
    setLogoutLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/logout`, { method: 'POST' });
      if (!res.ok) throw new Error('Erreur lors de la déconnexion');
      const result = await res.json();
      setNotice(result.message ?? 'Utilisateur déconnecté.');
      await loadSessionData();
    } catch (err) {
      console.error('Erreur déconnexion :', err);
      setNotice('Erreur lors de la déconnexion.');
    } finally {
      setLogoutLoading(null);
    }
  };

  const handleBulkLogout = async (ids: (string | number)[]) => {
    if (!window.confirm(`Déconnecter ${ids.length} utilisateur(s) ?`)) return;
    for (const id of ids) {
      try {
        await fetch(`/api/admin/users/${id}/logout`, { method: 'POST' });
      } catch (err) {
        console.error('Erreur bulk logout :', err);
      }
    }
    setNotice(`${ids.length} utilisateur(s) déconnecté(s).`);
    await loadSessionData();
  };

  /* ------------------------------ Dérivés ------------------------------ */

  const uniqueRoles = useMemo(
    () => Array.from(new Set(recentUsers.map((u) => u.role).filter(Boolean))),
    [recentUsers]
  );

  // On enrichit les données brutes avec des champs calculés pour le tableau
  const tableData = useMemo(
    () =>
      recentUsers.map((u) => ({
        ...u,
        id: u.id,
        time_ago: getTimeAgo(u.last_activity),
        formatted_time: formatTime(u.last_activity),
        status_label: u.is_online ? 'En ligne' : 'Hors ligne',
        role_label:
          u.role === 'admin'
            ? 'Admin'
            : u.role === 'check_in_admin'
            ? 'Check-in'
            : u.role === 'teacher'
            ? 'Enseignant'
            : u.role === 'student'
            ? 'Étudiant'
            : u.role === 'alumni'
            ? 'Alumni'
            : u.role,
      })),
    [recentUsers]
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

      <div className="mb-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          MAJ <RealTimeClock />
        </span>
        <span>
          {stats.onlineNow} en ligne sur {recentUsers.length}
        </span>
      </div>

      <StatsRow stats={stats} />

      <GenericTable
        title="Sessions récentes"
        subtitle="Dernières 24 heures"
        data={tableData}
        loading={loading}
        emptyMessage="Aucun utilisateur trouvé"
        searchable
        searchPlaceholder="Rechercher un utilisateur…"
        pagination
        itemsPerPage={10}
        sortable
        showCheckbox
        stickyFirstColumn
        minWidth={1000}
        columns={[
          {
            key: 'name',
            label: 'Utilisateur',
            type: 'avatar',
            options: { size: 36, showText: false },
            renderer: (_v, row) => {
              const u = row as unknown as OnlineUser;
              return (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {u.profil_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={u.profil_url}
                        alt={u.name}
                        className="h-9 w-9 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                        {u.name?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                    )}
                    {u.is_online && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-800" />
                    )}
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
              );
            },
          },
          { key: 'role_label', label: 'Rôle', truncate: true },
          {
            key: 'departement',
            label: 'Département',
            truncate: true,
            renderer: (v) => (
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {(v as string) || '—'}
              </span>
            ),
          },
          {
            key: 'time_ago',
            label: 'Dernière activité',
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
          {
            key: 'status_label',
            label: 'Statut',
            type: 'status',
            options: {
              customStatuses: {
                'En ligne': {
                  color:
                    'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
                },
                'Hors ligne': {
                  color:
                    'bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700',
                },
              },
            },
          },
          {
            key: 'current_page',
            label: 'Page',
            truncate: true,
            renderer: (v) => {
              const page = v as string | undefined;
              if (!page) return <span className="text-xs text-zinc-400">—</span>;
              return (
                <span
                  className="max-w-[180px] truncate text-xs text-zinc-500 dark:text-zinc-400"
                  title={page}
                >
                  {page.replace(/^https?:\/\//, '')}
                </span>
              );
            },
          },
        ]}
        rowActions={[
          {
            label: 'Voir le profil',
            icon: FiExternalLink,
            onClick: (row) => {
              const id = (row as Record<string, unknown>).id as string;
              window.location.href = `/admin/users/${id}`;
            },
          },
          {
            label: 'Déconnecter',
            icon: FiLogOut,
            onClick: (row) => {
              const r = row as Record<string, unknown>;
              handleForceLogout(r.id as string, r.username as string);
            },
          },
        ]}
        bulkActions={[
          {
            label: 'Déconnecter la sélection',
            icon: FiLogOut,
            onClick: () => {},
          },
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
            onClick: loadSessionData,
          },
        ]}
        onBulkDelete={handleBulkLogout}
      />
    </div>
  );
}
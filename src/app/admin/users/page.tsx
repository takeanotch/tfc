
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiKey,
  FiShield,
  FiPlus,
  FiRefreshCw,
  FiX,
  FiTrash2,
  FiMail,
  FiBarChart2,
  FiLoader,
} from 'react-icons/fi';
import GenericTable, { Column, ActionConfig } from '@/components/GenericTable';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'student' | 'teacher' | 'alumni' | 'check_in_admin';
  active: boolean;
  privileged: boolean;
  departement?: string;
  bio?: string;
  profil_url?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  teachers: number;
  students: number;
  alumni: number;
  privileged: number;
}

type ActiveTab = 'all' | 'active' | 'inactive' | 'admins' | 'teachers' | 'students';

type BulkAction =
  | 'activate'
  | 'deactivate'
  | 'grant_privileges'
  | 'revoke_privileges';

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'admin': return 'Administrateur';
    case 'check_in_admin': return 'Admin Check-in';
    case 'teacher': return 'Enseignant';
    case 'student': return 'Étudiant';
    case 'alumni': return 'Ancien élève';
    default: return role;
  }
};

const getRoleTone = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20';
    case 'check_in_admin': return 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20';
    case 'teacher': return 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20';
    case 'student': return 'bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20';
    case 'alumni': return 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20';
    default: return 'bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700';
  }
};

/** Configuration de chaque action groupée */
const BULK_CONFIG: Record<
  BulkAction,
  {
    title: string;
    verb: string;
    endpoint: string;
    body: (userId: string) => Record<string, unknown>;
    /** Ne traiter que les utilisateurs qui ne sont pas déjà dans l'état cible */
    needsChange: (u: User) => boolean;
    successLabel: string;
    danger?: boolean;
  }
> = {
  activate: {
    title: 'Activer les comptes',
    verb: 'activer',
    endpoint: '/api/admin/users/toggle-status',
    body: (userId) => ({ userId, active: true }),
    needsChange: (u) => !u.active,
    successLabel: 'activé(s)',
  },
  deactivate: {
    title: 'Désactiver les comptes',
    verb: 'désactiver',
    endpoint: '/api/admin/users/toggle-status',
    body: (userId) => ({ userId, active: false }),
    needsChange: (u) => u.active,
    successLabel: 'désactivé(s)',
    danger: true,
  },
  grant_privileges: {
    title: 'Accorder les privilèges',
    verb: 'accorder les privilèges à',
    endpoint: '/api/admin/users/toggle-privileged',
    body: (userId) => ({ userId, privileged: true }),
    needsChange: (u) => !u.privileged,
    successLabel: 'avec privilèges',
  },
  revoke_privileges: {
    title: 'Retirer les privilèges',
    verb: 'retirer les privilèges de',
    endpoint: '/api/admin/users/toggle-privileged',
    body: (userId) => ({ userId, privileged: false }),
    needsChange: (u) => u.privileged,
    successLabel: 'sans privilèges',
    danger: true,
  },
};

/* -------------------------------------------------------------------------- */
/*                                   Page                                     */
/* -------------------------------------------------------------------------- */

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showStats, setShowStats] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');

  // Sélection multiple
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingBulk, setPendingBulk] = useState<BulkAction | null>(null);
  const [bulkRunning, setBulkRunning] = useState(false);

  const [stats, setStats] = useState<UserStats>({
    total: 0, active: 0, inactive: 0,
    admins: 0, teachers: 0, students: 0,
    alumni: 0, privileged: 0,
  });

  const showMessage = useCallback((msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  }, []);

  /* ----------------------------- API Calls ----------------------------- */

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      } else {
        showMessage('Erreur lors du chargement', 'error');
      }
    } catch {
      showMessage('Erreur de connexion', 'error');
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setStats({
      total: users.length,
      active: users.filter(u => u.active).length,
      inactive: users.filter(u => !u.active).length,
      admins: users.filter(u => u.role === 'admin').length,
      teachers: users.filter(u => u.role === 'teacher').length,
      students: users.filter(u => u.role === 'student').length,
      alumni: users.filter(u => u.role === 'alumni').length,
      privileged: users.filter(u => u.privileged).length,
    });
  }, [users]);

  /* ----------------------------- Actions unitaires ----------------------------- */

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/users/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, active: !currentStatus }),
      });
      const data = await response.json();
      if (response.ok) {
        showMessage(`Compte ${!currentStatus ? 'activé' : 'désactivé'} avec succès`, 'success');
        void loadUsers();
      } else {
        showMessage(data.error, 'error');
      }
    } catch {
      showMessage('Erreur de connexion', 'error');
    }
  };

  const togglePrivilegedStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/users/toggle-privileged', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, privileged: !currentStatus }),
      });
      const data = await response.json();
      if (response.ok) {
        showMessage(`Privilèges ${!currentStatus ? 'activés' : 'désactivés'}`, 'success');
        void loadUsers();
      } else {
        showMessage(data.error, 'error');
      }
    } catch {
      showMessage('Erreur de connexion', 'error');
    }
  };

  const changePassword = async (userId: string) => {
    if (!newPassword) {
      showMessage('Veuillez saisir un nouveau mot de passe', 'error');
      return;
    }
    try {
      const response = await fetch('/api/admin/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        showMessage('Mot de passe changé avec succès', 'success');
        setEditingUser(null);
        setNewPassword('');
      } else {
        showMessage(data.error, 'error');
      }
    } catch {
      showMessage('Erreur de connexion', 'error');
    }
  };

  /* --------------------------- Onglets & Filtres --------------------------- */

  const tabs = [
    { id: 'all' as ActiveTab, label: 'Tous', count: stats.total },
    { id: 'active' as ActiveTab, label: 'Actifs', count: stats.active },
    { id: 'inactive' as ActiveTab, label: 'Inactifs', count: stats.inactive },
    { id: 'admins' as ActiveTab, label: 'Admins', count: stats.admins },
    { id: 'teachers' as ActiveTab, label: 'Enseignants', count: stats.teachers },
    { id: 'students' as ActiveTab, label: 'Étudiants', count: stats.students },
  ];

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (activeTab === 'active') return user.active;
      if (activeTab === 'inactive') return !user.active;
      if (activeTab === 'admins') return user.role === 'admin';
      if (activeTab === 'teachers') return user.role === 'teacher';
      if (activeTab === 'students') return user.role === 'student';
      return true;
    });
  }, [users, activeTab]);

  /* --------------------------- Sélection multiple --------------------------- */

  // Retire de la sélection les utilisateurs qui ne sont plus visibles
  // (changement d'onglet, rechargement, etc.)
  useEffect(() => {
    const visible = new Set(filteredUsers.map(u => u.id));
    setSelectedIds(prev => {
      const next = prev.filter(id => visible.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [filteredUsers]);

  const selectedUsers = useMemo(
    () => users.filter(u => selectedIds.includes(u.id)),
    [users, selectedIds]
  );

  const handleSelectionChange = useCallback((items: (string | number)[]) => {
    setSelectedIds(items.map(String));
  }, []);

  const executeBulk = async (action: BulkAction) => {
    const config = BULK_CONFIG[action];
    const targets = selectedUsers.filter(config.needsChange);

    if (targets.length === 0) {
      setPendingBulk(null);
      showMessage('Aucun utilisateur à modifier (déjà dans cet état)', 'error');
      return;
    }

    setBulkRunning(true);
    try {
      const results = await Promise.allSettled(
        targets.map(async (u) => {
          const res = await fetch(config.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config.body(u.id)),
          });
          if (!res.ok) throw new Error(`Échec pour ${u.username}`);
        })
      );

      const ok = results.filter(r => r.status === 'fulfilled').length;
      const ko = results.length - ok;

      if (ko === 0) {
        showMessage(`${ok} utilisateur(s) ${config.successLabel}`, 'success');
      } else {
        showMessage(`${ok} réussi(s), ${ko} échec(s)`, 'error');
      }

      setSelectedIds([]);
      await loadUsers();
    } catch {
      showMessage('Erreur de connexion', 'error');
    } finally {
      setBulkRunning(false);
      setPendingBulk(null);
    }
  };

  const sendBulkEmail = () => {
    const emails = selectedUsers.map(u => u.email).filter(Boolean);
    if (emails.length === 0) return;
    window.location.href = `mailto:?bcc=${encodeURIComponent(emails.join(','))}`;
  };

  const bulkActions: ActionConfig[] = [
    {
      label: 'Activer',
      icon: FiUserCheck,
      variant: 'outline',
      onClick: () => setPendingBulk('activate'),
    },
    {
      label: 'Désactiver',
      icon: FiUserX,
      variant: 'destructive',
      onClick: () => setPendingBulk('deactivate'),
    },
    {
      label: 'Accorder privilèges',
      icon: FiShield,
      variant: 'outline',
      onClick: () => setPendingBulk('grant_privileges'),
    },
    {
      label: 'Retirer privilèges',
      icon: FiShield,
      variant: 'outline',
      onClick: () => setPendingBulk('revoke_privileges'),
    },
    {
      label: 'Envoyer email',
      icon: FiMail,
      variant: 'outline',
      onClick: sendBulkEmail,
    },
    {
      label: 'Supprimer',
      icon: FiTrash2,
      variant: 'destructive',
      onClick: () => showMessage('Suppression groupée à venir', 'error'),
    },
  ];

  /* ----------------------------- Colonnes ----------------------------- */

  const columns = useMemo<Column[]>(() => [
    {
      key: 'name',
      label: 'Utilisateur',
      renderer: (_v, row) => {
        const user = row as unknown as User;
        return (
          <div className="flex items-center gap-3">
            {user.profil_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profil_url}
                alt={user.name}
                className="h-9 w-9 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {user.name}{' '}
                <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500">
                  ({user.username})
                </span>
              </div>
              <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {user.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      label: 'Rôle',
      renderer: (v) => {
        const role = String(v);
        const tone = getRoleTone(role);
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}>
            {getRoleLabel(role)}
          </span>
        );
      },
    },
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
      key: 'active',
      label: 'Statut',
      renderer: (v) => {
        const active = Boolean(v);
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${
            active
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {active ? 'Actif' : 'Inactif'}
          </span>
        );
      },
    },
    {
      key: 'privileged',
      label: 'Privilèges',
      renderer: (v) => {
        if (!v) return null;
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            <FiShield className="h-3.5 w-3.5" /> Oui
          </span>
        );
      },
    },
    {
      key: 'last_login',
      label: 'Dernière connexion',
      renderer: (v) => {
        if (!v) return <span className="text-xs text-zinc-400">Jamais</span>;
        return (
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {new Date(v as string).toLocaleDateString('fr-FR')}
          </span>
        );
      },
    },
  ], []);

  /* ----------------------------- Actions & Toolbar ----------------------------- */

  const rowActions = useMemo<ActionConfig[]>(() => [
    {
      label: 'Changer MDP',
      icon: FiKey,
      onClick: (row) => {
        setEditingUser((row as unknown as User).id);
        setNewPassword('');
      },
    },
    {
      label: 'Basculer statut',
      icon: FiUserCheck,
      onClick: (row) => {
        const u = row as unknown as User;
        void toggleUserStatus(u.id, u.active);
      },
    },
    {
      label: 'Gérer privilèges',
      icon: FiShield,
      onClick: (row) => {
        const u = row as unknown as User;
        void togglePrivilegedStatus(u.id, u.privileged);
      },
    },
    {
      label: 'Envoyer email',
      icon: FiMail,
      onClick: (row) => {
        showMessage(`Fonctionnalité email bientôt disponible pour ${(row as unknown as User).email}`, 'success');
      },
    },
    {
      label: 'Supprimer',
      icon: FiTrash2,
      onClick: () => {
        showMessage('Fonctionnalité suppression à venir', 'error');
      },
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [showMessage]);

  const topActions = useMemo<ActionConfig[]>(() => [
    {
      label: showStats ? 'Masquer stats' : 'Voir stats',
      icon: FiBarChart2,
      variant: 'outline',
      onClick: () => setShowStats(v => !v),
    },
    {
      label: 'Actualiser',
      icon: FiRefreshCw,
      variant: 'outline',
      onClick: loadUsers,
    },
  ], [showStats, loadUsers]);

  /* ----------------------------- Données de la modale de confirmation ----------------------------- */

  const pendingConfig = pendingBulk ? BULK_CONFIG[pendingBulk] : null;
  const pendingTargets = pendingConfig
    ? selectedUsers.filter(pendingConfig.needsChange)
    : [];

  /* ----------------------------- Rendu ----------------------------- */

  return (
    // ✅ overflow-x-clip + w-full + max-w-full : empêche tout scroll horizontal de la page
    <div className="min-h-[100dvh] w-full max-w-full overflow-x-clip bg-zinc-50 dark:bg-zinc-900 dark:[color-scheme:dark]">
      {/* ✅ min-w-0 : permet au contenu de rétrécir au lieu d'élargir la page */}
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Gestion des utilisateurs
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Gérez les accès, les rôles et les privilèges des membres.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/users/create"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              aria-label="Nouvel utilisateur"
            >
              <FiPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Nouvel utilisateur</span>
            </Link>
          </div>
        </div>

        {/* Message de retour */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
                messageType === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
                  : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20'
              }`}
            >
              <span className="min-w-0 flex-1 break-words">{message}</span>
              <button onClick={() => setMessage('')} className="shrink-0 rounded p-1 hover:bg-black/5 dark:hover:bg-white/10">
                <FiX className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistiques */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 grid grid-cols-2 gap-3 overflow-hidden md:grid-cols-4"
            >
              {[
                { label: 'Total', value: stats.total, icon: FiUsers, tone: 'text-zinc-600 dark:text-zinc-400' },
                { label: 'Actifs', value: stats.active, icon: FiUserCheck, tone: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Inactifs', value: stats.inactive, icon: FiUserX, tone: 'text-rose-600 dark:text-rose-400' },
                { label: 'Privilégiés', value: stats.privileged, icon: FiShield, tone: 'text-amber-600 dark:text-amber-400' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="min-w-0 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                        <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{stat.value}</p>
                      </div>
                      <Icon className={`h-5 w-5 shrink-0 ${stat.tone}`} aria-hidden />
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs (Rôles & Statuts) */}
        {/* ✅ Scroll horizontal conservé mais barre de défilement masquée */}
        <div
          className="mb-4 w-full max-w-full overflow-x-auto overflow-y-hidden border-b border-zinc-200 [-ms-overflow-style:none] [scrollbar-width:none] dark:border-zinc-800 [&::-webkit-scrollbar]:hidden"
        >
          <nav
            className="flex w-max min-w-full space-x-1 pr-4 sm:space-x-4"
            aria-label="Filtres d'utilisateurs"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                    isActive
                      ? 'text-zinc-900 dark:text-zinc-50'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      isActive
                        ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200'
                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="users-active-tab"
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-900 dark:bg-zinc-100"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Table générique avec sélection multiple */}
        {/* ✅ Wrapper min-w-0 : la table (minWidth 1000) scrolle dans sa carte
            au lieu d'élargir toute la page */}
        <div className="w-full min-w-0 max-w-full">
          <GenericTable
            title="Répertoire des utilisateurs"
            data={filteredUsers as unknown as Record<string, unknown>[]}
            columns={columns}
            loading={loading}
            topActions={topActions}
            rowActions={rowActions}
            minWidth={1000}
            searchable
            searchPlaceholder="Rechercher un nom, un email, un rôle…"
            itemsPerPage={10}
            showCheckbox
            selectedItems={selectedIds}
            onSelectionChange={handleSelectionChange}
            bulkActions={bulkActions}
          />
        </div>
      </div>

      {/* Modale de confirmation des actions groupées */}
      <AnimatePresence>
        {pendingBulk && pendingConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-800"
            >
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {pendingConfig.title}
              </h3>
              <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                Voulez-vous {pendingConfig.verb}{' '}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {pendingTargets.length} utilisateur{pendingTargets.length > 1 ? 's' : ''}
                </span>{' '}
                ?
                {pendingTargets.length < selectedUsers.length && (
                  <span className="mt-1 block text-xs text-zinc-500">
                    {selectedUsers.length - pendingTargets.length} utilisateur(s) sélectionné(s) sont déjà dans cet état et seront ignorés.
                  </span>
                )}
              </p>

              {pendingTargets.length > 0 && (
                <ul className="mb-5 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900/40">
                  {pendingTargets.map(u => (
                    <li key={u.id} className="flex items-center justify-between gap-2 px-1 text-zinc-700 dark:text-zinc-300">
                      <span className="truncate">{u.name}</span>
                      <span className="shrink-0 text-xs text-zinc-400">{u.username}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex justify-end gap-2">
                <button
                  disabled={bulkRunning}
                  onClick={() => setPendingBulk(null)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-700"
                >
                  Annuler
                </button>
                <button
                  disabled={bulkRunning || pendingTargets.length === 0}
                  onClick={() => void executeBulk(pendingBulk)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                    pendingConfig.danger
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white'
                  }`}
                >
                  {bulkRunning && <FiLoader className="h-4 w-4 animate-spin" />}
                  Confirmer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modale de changement de mot de passe */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-800"
            >
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                <FiKey className="h-5 w-5" />
                Changer le mot de passe
              </h3>
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mb-6 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-white/5"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setNewPassword('');
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                >
                  Annuler
                </button>
                <button
                  onClick={() => changePassword(editingUser)}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
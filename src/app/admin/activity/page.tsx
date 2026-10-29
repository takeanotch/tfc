
'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiUsers, FiActivity } from 'react-icons/fi';
import RecentSessionsPage from './RecentSessionsPage';
import UserActivityPage from './UserActivityPage';

type ActiveTab = 'sessions' | 'activity';

const TABS: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
  { id: 'sessions', label: 'Sessions récentes', icon: FiUsers },
  { id: 'activity', label: 'Journal d’activité', icon: FiActivity },
];

export default function AdminActivityPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('sessions');

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-900 dark:[color-scheme:dark]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Monitoring
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Sessions actives et journal d’activité des utilisateurs.
          </p>

          <nav
            className="mt-5 flex gap-1 border-b border-zinc-200 dark:border-zinc-800"
            aria-label="Sections de monitoring"
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex items-center gap-2 px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                    active
                      ? 'text-zinc-900 dark:text-zinc-50'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {tab.label}
                  {active && (
                    <motion.span
                      layoutId="admin-activity-tab"
                      className="absolute inset-x-0 -bottom-px h-0.5 bg-zinc-900 dark:bg-zinc-100"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'sessions' ? <RecentSessionsPage /> : <UserActivityPage />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
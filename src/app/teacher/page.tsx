// app/teacher/page.tsx
import Link from 'next/link';
import { requireAuth } from '@/utils/session';
import {
  Book,
  ChevronRight,
  ChartCandlestick,
  Folder,
} from 'lucide-react';
import { FaFileAlt } from 'react-icons/fa';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  description: string;
}

const roleConfig = {
  teacher: {
    label: 'Enseignant',
  },
};

// Heure locale de Lubumbashi (le serveur peut être dans un autre fuseau)
const getGreeting = () => {
  const hour = Number(
    new Intl.DateTimeFormat('fr-FR', {
      hour: 'numeric',
      hourCycle: 'h23',
      timeZone: 'Africa/Lubumbashi',
    }).format(new Date())
  );
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
};

export default async function TeacherHomePage() {
  const user = await requireAuth();

  const currentRole =
    roleConfig[user.role as keyof typeof roleConfig] || { label: 'Utilisateur' };

  const menuItems: MenuItem[] = [
    {
      name: 'Liste des TFC',
      path: '/tfc',
      icon: <FaFileAlt className="h-4 w-4" />,
      description: 'Voir la liste des travaux de fin de cycle',
    },
    {
      name: 'Statistiques TFC',
      path: '/stats',
      icon: <ChartCandlestick className="h-4 w-4" />,
      description: 'Consultez les statistiques des TFC existants',
    },
    {
      name: 'Explorer TFC',
      path: '/tfc/explorer',
      icon: <Folder className="h-4 w-4" />,
      description: 'Explorez et ajoutez des travaux de fin de cycle',
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-zinc-50 p-6 transition-colors dark:bg-zinc-900 dark:[color-scheme:dark] sm:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-12">
          {/* Badge rôle */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
            <Book className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" aria-hidden />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {currentRole.label}
            </span>
          </div>

          {/* Bienvenue */}
          <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
            {getGreeting()}, <span className="font-semibold">{user.name}</span>
          </h1>
          <p className="mt-2 text-base text-zinc-500 dark:text-zinc-400">
            Votre espace dédié à l’enseignement et au suivi pédagogique.
          </p>

          {/* Infos utilisateur */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Email</span>
              <span>{user.email}</span>
            </div>
            {user.departement && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  Département
                </span>
                <span>{user.departement}</span>
              </div>
            )}
          </div>
        </header>

        {/* Navigation */}
        <nav aria-label="Sections de l’espace enseignant">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-700/70"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {item.name}
                    </span>
                    <span className="block text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {item.description}
                    </span>
                  </span>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 dark:text-zinc-500"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
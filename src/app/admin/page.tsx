

import { requireAuth } from '@/utils/session';
import { BellAlertIcon, Cog6ToothIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';
import {
  Users,
  Database,
  MessageSquare,
  Activity,
  Settings,
  ChartCandlestick,
  ChartAreaIcon,
  Folder
} from 'lucide-react';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  description: string;
}

const roleConfig = {
  admin: {
    label: 'Administrateur',
  },
  check_in_admin: {
    label: 'Admin Check-in',
  },
  teacher: {
    label: 'Enseignant',
  },
  student: {
    label: 'Étudiant',
  },
  alumni: {
    label: 'Ancien élève',
  }
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
};

export default async function AdminHomePage() {
  const user = await requireAuth();

  const currentRole = roleConfig[user.role as keyof typeof roleConfig] || {
    label: 'Utilisateur',
  }

  const menuItems: MenuItem[] = [
    {
      name: 'Gestion Utilisateurs',
      path: '/admin/users',
      icon: <Users className="w-5 h-5" />,
      description: 'Gérez les comptes utilisateurs et permissions'
    },
    {
      name: 'Administration TFC',
      path: '/admin/tfc',
      icon: <Database className="w-5 h-5" />,
      description: 'Panel d\'administration des données TFC'
    },
    {
      name: 'Explorer TFC',
      path: '/tfc/explorer',
      icon: <Folder className="w-5 h-5" />,
      description: 'Explorez la base de données TFC'
    },
    {
      name: 'Liste TFC',
      path: '/tfc',
      icon: <DocumentCheckIcon className="w-5 h-5" />,
      description: 'Consultez tous les travaux de fin de cycle'
    },
    {
      name: 'Stats TFCs',
      path: '/stats',
      icon: <ChartCandlestick className="w-5 h-5" />,
      description: 'Voir les statistiques des TFCs'
    },
    {
      name: 'Config Admin',
      path: '/admin/config',
      icon: <Cog6ToothIcon className="w-5 h-5" />,
      description: 'Configurer la structure des données TFC'
    },
    {
      name: 'Chat Assistant',
      path: '/chat',
      icon: <MessageSquare className="w-5 h-5" />,
      description: 'Assistant intelligent pour vos questions'
    },
    {
      name: 'Activité',
      path: '/admin/activity',
      icon: <Activity className="w-5 h-5" />,
      description: 'Suivi de l\'activité du système'
    },
    {
      name: 'Notifications',
      path: '/admin/notifications',
      icon: <BellAlertIcon className="w-5 h-5" />,
      description: 'CRUD notifications utilisateurs'
    },
    {
      name: 'Chat Stats',
      path: '/admin/chat-stats',
      icon: <ChartAreaIcon className="w-5 h-5" />,
      description: 'Statistiques et analyses des conversations du chat'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 dark:[color-scheme:dark] transition-colors duration-300 p-6">
      {/* Header */}
      <header className="mb-12 text-center">
        {/* Badge Administrateur */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 mb-6">
          <Settings className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {currentRole.label}
          </span>
        </div>

        {/* Message de bienvenue personnalisé */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-light text-zinc-900 dark:text-zinc-50 mb-4">
            {getGreeting()}, <span className="font-semibold">{user.name}</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
            Panel de contrôle et d'administration de la plateforme
          </p>
        </div>
      </header>

      {/* Menu : icône seule dans la carte, titre en dessous */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
        {menuItems.map((item) => (
          <div key={item.path} className="flex flex-col items-center">
            <a
              href={item.path}
              title={item.description}
              aria-label={item.name}
              className="
                bg-white dark:bg-zinc-800
                border border-zinc-200 dark:border-zinc-700
                hover:border-zinc-300 dark:hover:border-zinc-600
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400
                rounded-xl p-4
                transition-all duration-200
                hover:shadow-md hover:scale-[1.03]
                flex items-center justify-center
                w-20 h-20
              "
            >
              <div className="text-zinc-700 dark:text-zinc-300">
                {item.icon}
              </div>
            </a>

            <span className="mt-2 text-sm text-center text-zinc-700 dark:text-zinc-300 font-medium tracking-tight">
              {item.name}
            </span>
          </div>
        ))}
      </div>

      {/* Informations de l'utilisateur */}
      <div className="bg-zinc-50 mt-8 mx-auto dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700 max-w-2xl">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Email:</span>
            <span>{user.email}</span>
          </div>
          {user.departement && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Département:</span>
              <span>{user.departement}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
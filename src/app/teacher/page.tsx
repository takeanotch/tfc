import UserNotifications from '@/components/UserNotifications';
import { requireAuth } from '@/utils/session';

import { 
  Book, 
  Users, 
  Search, 
  Upload,
  FileText,
  ChevronRight,
  ChartCandlestickIcon,
  Folder
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
  }
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
};

export default async function TeacherHomePage() {
  const user = await requireAuth();

  const currentRole = roleConfig[user.role as keyof typeof roleConfig] || {
    label: 'Utilisateur',
  }

  const menuItems: MenuItem[] = [
    {
      name: 'Liste des TFCs',
      path: '/tfc',
      icon: <FaFileAlt className="w-5 h-5" />,
      description: 'Voir la list de vos travaux de fin de cycle'
    },
    {
      name: 'Statistiques TFCs',
      path: '/stats',
      icon: <ChartCandlestickIcon className="w-5 h-5" />,
      description: 'Consultez les statistiques des TFCs existants'
    },
    {
      name: 'Explorer TFC',
      path: '/tfc/explorer',
      icon: <Folder className="w-5 h-5" />,
      description: 'Explorez & ajouter les travaux de fin de cycle'
    },
   
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 p-6">
      {/* Header */}
    
      <header className="mb-12 text-center">
        {/* Badge Enseignant */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-6">
          <Book className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentRole.label}
          </span>
        </div>

        {/* Message de bienvenue personnalisé */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-4">
            {getGreeting()}, <span className="font-semibold">{user.name}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Votre espace dédié à l'enseignement et au suivi pédagogique
          </p>
        </div>

        {/* Informations de l'utilisateur */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 inline-block">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
              <span>{user.email}</span>
            </div>
            {user.departement && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">Département:</span>
                <span>{user.departement}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {menuItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className="group block cursor-pointer"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 h-full hover:shadow-lg group-hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  {item.icon}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                {item.name}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          </a>
        ))}
      </div>

      {/* Quick Stats */}
      
    </div>
  );
}
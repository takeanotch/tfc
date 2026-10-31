
// // // app/student/page.tsx
// // import { requireAuth } from '@/utils/session';
// // import { ChartBarIcon } from '@heroicons/react/24/outline';
// // import { 
// //   Book, 
// //   User, 
// //   Search, 
// //   Download,
// //   Calendar,
// //   ChevronRight,
// //   ChartCandlestick,
// //   BookmarkCheck
// // } from 'lucide-react';
// // import UserNotifications from '@/components/UserNotifications'; // ✅ Importez le composant
// // import { FaFileAlt } from 'react-icons/fa';

// // interface MenuItem {
// //   name: string;
// //   path: string;
// //   icon: React.ReactNode;
// //   description: string;
// // }

// // const roleConfig = {
// //   student: {
// //     label: 'Étudiant',
// //   }
// // }

// // const getGreeting = () => {
// //   const hour = new Date().getHours();
// //   if (hour < 12) return 'Bonjour';
// //   if (hour < 18) return 'Bon après-midi';
// //   return 'Bonsoir';
// // };

// // export default async function StudentHomePage() {
// //   const user = await requireAuth();

// //   const currentRole = roleConfig[user.role as keyof typeof roleConfig] || {
// //     label: 'Utilisateur',
// //   }

// //   const menuItems: MenuItem[] = [
// //     {
// //       name: 'Stats TFCs',
// //       path: '/stats',
// //       icon: <ChartCandlestick className="w-5 h-5 rota9" />,
// //       description: 'Voire les statistiques de tfcs'
// //     },
// //     {
// //       name: 'Mon Profil',
// //       path: '/profile',
// //       icon: <User className="w-5 h-5" />,
// //       description: 'Gérez votre profil étudiant'
// //     },
// //     {
// //       name: 'Explorer TFC',
// //       path: '/tfc/',
// //       icon: <FaFileAlt className="w-5 h-5" />,
// //       description: 'Découvrez les travaux de fin de cycle'
// //     },
    
// //     {
// //       name: 'Favorites',
// //       path: '/favorites/',
// //       icon: <BookmarkCheck className="w-5 h-5" />,
// //       description: 'Voir les tfcs favoris'
// //     },
 
// //   ];

// //   return (
// //     <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 p-6">
// //       {/* Header avec notifications en haut à droite */}
     
// //       <header className="mb-12 text-center">
// //         {/* Badge Étudiant */}
// //         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-6">
// //           <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
// //           <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
// //             {currentRole.label}
// //           </span>
// //         </div>

// //         {/* Message de bienvenue personnalisé */}
// //         <div className="mb-8">
// //           <h1 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-4">
// //             {getGreeting()}, <span className="font-semibold">{user.name}</span>
// //           </h1>
// //           <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
// //             Bienvenue dans votre espace étudiant
// //           </p>
// //         </div>

// //         {/* Informations de l'utilisateur */}
// //         <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 inline-block">
// //           <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
// //             <div className="flex items-center gap-2">
// //               <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
// //               <span>{user.email}</span>
// //             </div>
// //             {user.departement && (
// //               <div className="flex items-center gap-2">
// //                 <span className="font-medium text-gray-700 dark:text-gray-300">Département:</span>
// //                 <span>{user.departement}</span>
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </header>

// //       {/* Le reste de votre code reste exactement pareil */}
// //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
// //         {menuItems.map((item) => (
// //           <a
// //             key={item.path}
// //             href={item.path}
// //             className="group block cursor-pointer"
// //           >
// //             <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 h-full hover:shadow-lg group-hover:scale-105">
// //               <div className="flex items-center justify-between mb-4">
// //                 <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
// //                   {item.icon}
// //                 </div>
// //                 <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform duration-200" />
// //               </div>
              
// //               <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
// //                 {item.name}
// //               </h3>
              
// //               <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
// //                 {item.description}
// //               </p>
// //             </div>
// //           </a>
// //         ))}
// //       </div>

// //       {/* Quick Info */}
      
// //     </div>
// //   );
// // }

// // app/student/page.tsx
// import { requireAuth } from '@/utils/session';
// import {
//   User,
//   ChevronRight,
//   ChartCandlestick,
//   BookmarkCheck,
//   MessageSquare,
//   Lock,
// } from 'lucide-react';
// import { FaFileAlt } from 'react-icons/fa';

// interface MenuItem {
//   name: string;
//   path: string;
//   icon: React.ReactNode;
//   description: string;
//   disabled?: boolean;
// }

// const roleConfig = {
//   student: {
//     label: 'Étudiant',
//   },
// };

// const getGreeting = () => {
//   const hour = new Date().getHours();
//   if (hour < 12) return 'Bonjour';
//   if (hour < 18) return 'Bon après-midi';
//   return 'Bonsoir';
// };

// export default async function StudentHomePage() {
//   const user = await requireAuth();

//   const currentRole =
//     roleConfig[user.role as keyof typeof roleConfig] || { label: 'Utilisateur' };

//   const menuItems: MenuItem[] = [
//     {
//       name: 'Explorer TFC',
//       path: '/tfc/',
//       icon: <FaFileAlt className="h-4 w-4" />,
//       description: 'Découvrez les travaux de fin de cycle',
//     },
//     {
//       name: 'Favorites',
//       path: '/favorites/',
//       icon: <BookmarkCheck className="h-4 w-4" />,
//       description: 'Voir les TFC favoris',
//     },
//     {
//       name: 'Stats TFCs',
//       path: '/stats',
//       icon: <ChartCandlestick className="h-4 w-4" />,
//       description: 'Voir les statistiques des TFC',
//     },
//     {
//       name: 'Chat',
//       path: '/chat',
//       icon: <MessageSquare className="h-4 w-4" />,
//       description: 'Assistant de recherche sur les TFC',
//       disabled: true,
//     },
//   ];

//   return (
//     <div className="min-h-[100dvh] bg-zinc-50 p-6 transition-colors dark:bg-zinc-900 dark:[color-scheme:dark] sm:p-8">
//       <div className="mx-auto max-w-5xl">
//         {/* Header */}
//         <header className="mb-12">
//           {/* Badge rôle */}
//           <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
//             <User className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" aria-hidden />
//             <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
//               {currentRole.label}
//             </span>
//           </div>

//           {/* Bienvenue */}
//           <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
//             {getGreeting()}, <span className="font-semibold">{user.name}</span>
//           </h1>
//           <p className="mt-2 text-base text-zinc-500 dark:text-zinc-400">
//             Bienvenue dans votre espace étudiant.
//           </p>

//           {/* Infos utilisateur */}
//           <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
//             <div className="flex items-center gap-2">
//               <span className="font-medium text-zinc-700 dark:text-zinc-300">Email</span>
//               <span>{user.email}</span>
//             </div>
//             {user.departement && (
//               <div className="flex items-center gap-2">
//                 <span className="font-medium text-zinc-700 dark:text-zinc-300">Département</span>
//                 <span>{user.departement}</span>
//               </div>
//             )}
//           </div>
//         </header>

//         {/* Navigation simplifiée */}
//         <nav aria-label="Sections de l’espace étudiant">
//           <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//             {menuItems.map((item) => {
//               const content = (
//                 <>
//                   <span
//                     className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
//                       item.disabled
//                         ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600'
//                         : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
//                     }`}
//                   >
//                     {item.icon}
//                   </span>
//                   <span className="min-w-0 flex-1">
//                     <span
//                       className={`block truncate text-sm font-medium ${
//                         item.disabled
//                           ? 'text-zinc-400 dark:text-zinc-500'
//                           : 'text-zinc-900 dark:text-zinc-50'
//                       }`}
//                     >
//                       {item.name}
//                     </span>
//                     <span
//                       className={`block truncate text-xs ${
//                         item.disabled
//                           ? 'text-zinc-400 dark:text-zinc-600'
//                           : 'text-zinc-500 dark:text-zinc-400'
//                       }`}
//                     >
//                       {item.description}
//                     </span>
//                   </span>
//                   {item.disabled ? (
//                     <Lock
//                       className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600"
//                       aria-hidden
//                     />
//                   ) : (
//                     <ChevronRight
//                       className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 dark:text-zinc-500"
//                       aria-hidden
//                     />
//                   )}
//                 </>
//               );

//               return (
//                 <li key={item.path}>
//                   {item.disabled ? (
//                     <div
//                       aria-disabled="true"
//                       title="Bientôt disponible"
//                       className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-100/50 px-4 py-3.5 opacity-70 dark:border-zinc-700 dark:bg-zinc-800/40"
//                     >
//                       {content}
//                     </div>
//                   ) : (
//                     <a
//                       href={item.path}
//                       className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-700/70"
//                     >
//                       {content}
//                     </a>
//                   )}
//                 </li>
//               );
//             })}
//           </ul>
//         </nav>
//       </div>
//     </div>
//   );
// }

// app/student/page.tsx
import { requireAuth } from '@/utils/session';
import {
  User,
  ChevronRight,
  ChartCandlestick,
  BookmarkCheck,
  MessageSquare,
  Lock,
  Lightbulb,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { FaFileAlt } from 'react-icons/fa';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  description: string;
  disabled?: boolean;
}

const roleConfig = {
  student: {
    label: 'Étudiant',
  },
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
};

export default async function StudentHomePage() {
  const user = await requireAuth();

  const currentRole =
    roleConfig[user.role as keyof typeof roleConfig] || { label: 'Utilisateur' };

  const menuItems: MenuItem[] = [
    {
      name: 'Explorer TFC',
      path: '/tfc/',
      icon: <FaFileAlt className="h-4 w-4" />,
      description: 'Découvrez les travaux de fin de cycle',
    },
    {
      name: 'Favorites',
      path: '/favorites/',
      icon: <BookmarkCheck className="h-4 w-4" />,
      description: 'Voir les TFC favoris',
    },
    {
      name: 'Stats TFCs',
      path: '/stats',
      icon: <ChartCandlestick className="h-4 w-4" />,
      description: 'Voir les statistiques des TFC',
    },
    {
      name: 'Chat',
      path: '/chat',
      icon: <MessageSquare className="h-4 w-4" />,
      description: 'Assistant de recherche sur les TFC',
      disabled: true,
    },
  ];

  const tutoSteps = [
    {
      icon: <Search className="h-4 w-4" />,
      title: 'Recherchez un TFC',
      text: 'Dans « Explorer TFC », tapez un titre, un auteur ou un mot-clé. Le bouton # permet de chercher par ID.',
    },
    {
      icon: <SlidersHorizontal className="h-4 w-4" />,
      title: 'Affinez avec les filtres',
      text: 'Filtrez par année académique, département ou filière, puis triez par date ou nombre de vues.',
    },
    {
      icon: <BookmarkCheck className="h-4 w-4" />,
      title: 'Gardez vos favoris',
      text: 'Ajoutez un TFC à vos favoris pour le retrouver rapidement dans la section « Favorites ».',
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-zinc-50 p-6 transition-colors dark:bg-zinc-900 dark:[color-scheme:dark] sm:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-12">
          {/* Badge rôle */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
            <User className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" aria-hidden />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {currentRole.label}
            </span>
          </div>

          {/* Bienvenue */}
          <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
            {getGreeting()}, <span className="font-semibold">{user.name}</span>
          </h1>
          <p className="mt-2 text-base text-zinc-500 dark:text-zinc-400">
            Bienvenue dans votre espace étudiant.
          </p>

          {/* Infos utilisateur */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Email</span>
              <span>{user.email}</span>
            </div>
            {user.departement && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Département</span>
                <span>{user.departement}</span>
              </div>
            )}
          </div>
        </header>

        {/* Navigation simplifiée */}
        <nav aria-label="Sections de l’espace étudiant">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {menuItems.map((item) => {
              const content = (
                <>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      item.disabled
                        ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-sm font-medium ${
                        item.disabled
                          ? 'text-zinc-400 dark:text-zinc-500'
                          : 'text-zinc-900 dark:text-zinc-50'
                      }`}
                    >
                      {item.name}
                    </span>
                    <span
                      className={`block truncate text-xs ${
                        item.disabled
                          ? 'text-zinc-400 dark:text-zinc-600'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {item.description}
                    </span>
                  </span>
                  {item.disabled ? (
                    <Lock
                      className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600"
                      aria-hidden
                    />
                  ) : (
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 dark:text-zinc-500"
                      aria-hidden
                    />
                  )}
                </>
              );

              return (
                <li key={item.path}>
                  {item.disabled ? (
                    <div
                      aria-disabled="true"
                      title="Bientôt disponible"
                      className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-100/50 px-4 py-3.5 opacity-70 dark:border-zinc-700 dark:bg-zinc-800/40"
                    >
                      {content}
                    </div>
                  ) : (
                    <a
                      href={item.path}
                      className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-700/70"
                    >
                      {content}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mini tuto */}
        <details
          open
          className="group/tuto mt-8 rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
        >
          <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 [&::-webkit-details-marker]:hidden">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
              <Lightbulb className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Comment ça marche ?
              </span>
              <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                Un petit guide pour bien démarrer
              </span>
            </span>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-open/tuto:rotate-90 dark:text-zinc-500"
              aria-hidden
            />
          </summary>

          <ol className="space-y-3 border-t border-zinc-200 px-4 py-4 dark:border-zinc-700">
            {tutoSteps.map((step, i) => (
              <li key={step.title} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold tabular-nums text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    <span className="text-zinc-500 dark:text-zinc-400">{step.icon}</span>
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </details>
      </div>
    </div>
  );
}
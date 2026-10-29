
// // 'use client'

// // import { useEffect, useState } from 'react'
// // import { createPortal } from 'react-dom'
// // import Link from 'next/link'
// // import { usePathname } from 'next/navigation'
// // import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
// // import {
// //   Activity,
// //   BookmarkCheck,
// //   BotIcon,
// //   Briefcase,
// //   Calendar,
// //   File,
// //   Folder,
// //   Headset,
// //   Home,
// //   Network,
// //   Search,
// //   Upload,
// //   Users,
// //   X,
// // } from 'lucide-react'
// // import { ArrowLongRightIcon } from '@heroicons/react/24/outline'

// // import { RoleIcon } from './RoleIcon'
// // import ThemeSwitch from './ThemeSwitch'
// // import { LogoutButton } from './LogoutBouton'
// // import UserNotifications from './UserNotifications'

// // /* -------------------------------------------------------------------------- */
// // /*                                Configuration                               */
// // /* -------------------------------------------------------------------------- */

// // const iconMap = {
// //   home: Home,
// //   thumbtack: BookmarkCheck,
// //   upload: Upload,
// //   file: File,
// //   folder: Folder,
// //   search: Search,
// //   headset: Headset,
// //   users: Users,
// //   activity: Activity,
// //   calendar: Calendar,
// //   briefcase: Briefcase,
// //   network: Network,
// //   bot: BotIcon,
// // } as const

// // const getInitials = (name: string) =>
// //   name
// //     .split(' ')
// //     .filter(Boolean)
// //     .map((part) => part.charAt(0).toUpperCase())
// //     .join('')
// //     .slice(0, 2)

// // // Chemins comparés sans le « / » final ('/tfc/' et '/tfc' sont la même page)
// // const normalize = (path: string) => (path.length > 1 ? path.replace(/\/$/, '') : path)

// // interface MobileMenuUser {
// //   name: string
// //   email: string
// //   profil_url?: string | null
// //   role: string
// // }

// // interface MobileMenuProps {
// //   navigationLinks: Array<{
// //     href: string
// //     iconName: keyof typeof iconMap
// //     label: string
// //   }>
// //   user: MobileMenuUser
// //   // Classes Tailwind complètes (avec leur variante `dark:`), préparées côté serveur
// //   styles: {
// //     solid: string
// //     tone: string
// //   }
// //   currentRole: {
// //     label: string
// //     color: string
// //   }
// // }

// // /* -------------------------------------------------------------------------- */
// // /*                              Petits composants                             */
// // /* -------------------------------------------------------------------------- */

// // function Avatar({
// //   user,
// //   solid,
// //   size,
// //   badge = true,
// // }: {
// //   user: MobileMenuUser
// //   solid: string
// //   size: string
// //   badge?: boolean
// // }) {
// //   return (
// //     <span className="relative inline-flex shrink-0">
// //       {user.profil_url ? (
// //         <img
// //           src={user.profil_url}
// //           alt="Photo de profil"
// //           className={`${size} rounded-full border-2 border-zinc-200 object-cover dark:border-zinc-700`}
// //         />
// //       ) : (
// //         <span
// //           className={`${size} flex items-center justify-center rounded-full text-sm font-semibold text-white ${solid}`}
// //         >
// //           {getInitials(user.name)}
// //         </span>
// //       )}
// //       {badge && (
// //         <span
// //           className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-zinc-900 ${solid}`}
// //         >
// //           <RoleIcon role={user.role} className="h-2 w-2 text-white" />
// //         </span>
// //       )}
// //     </span>
// //   )
// // }

// // /* -------------------------------------------------------------------------- */
// // /*                                 Composant                                  */
// // /* -------------------------------------------------------------------------- */

// // export function MobileMenu({ navigationLinks, user, styles, currentRole }: MobileMenuProps) {
// //   const [isOpen, setIsOpen] = useState(false)
// //   const [isMounted, setIsMounted] = useState(false)
// //   const pathname = usePathname()
// //   const reduceMotion = useReducedMotion()

// //   // Le portail a besoin du `document` : on attend le montage côté client
// //   useEffect(() => {
// //     setIsMounted(true)
// //   }, [])

// //   // Ferme le menu après une navigation
// //   useEffect(() => {
// //     setIsOpen(false)
// //   }, [pathname])

// //   // Menu ouvert : on bloque le défilement de la page (sans `position: fixed`,
// //   // qui ramenait la page tout en haut) et Échap ferme le menu
// //   useEffect(() => {
// //     if (!isOpen) return

// //     const previousOverflow = document.body.style.overflow
// //     document.body.style.overflow = 'hidden'

// //     const onKey = (e: KeyboardEvent) => {
// //       if (e.key === 'Escape') setIsOpen(false)
// //     }
// //     window.addEventListener('keydown', onKey)

// //     return () => {
// //       document.body.style.overflow = previousOverflow
// //       window.removeEventListener('keydown', onKey)
// //     }
// //   }, [isOpen])

// //   /* -------------------------------- Animations ------------------------------ */

// //   const spring = reduceMotion
// //     ? { duration: 0 }
// //     : { type: 'spring' as const, stiffness: 400, damping: 40 }

// //   const panelVariants: Variants = {
// //     closed: { x: '100%', transition: spring },
// //     open: {
// //       x: 0,
// //       transition: {
// //         ...spring,
// //         staggerChildren: reduceMotion ? 0 : 0.05,
// //         delayChildren: reduceMotion ? 0 : 0.08,
// //       },
// //     },
// //   }

// //   const itemVariants: Variants = {
// //     closed: { x: 24, opacity: 0, transition: { duration: reduceMotion ? 0 : 0.15 } },
// //     open: {
// //       x: 0,
// //       opacity: 1,
// //       transition: reduceMotion
// //         ? { duration: 0 }
// //         : { type: 'spring', stiffness: 500, damping: 30 },
// //     },
// //   }

// //   const overlayVariants: Variants = {
// //     closed: { opacity: 0, transition: { duration: 0.2 } },
// //     open: { opacity: 1, transition: { duration: 0.2 } },
// //   }

// //   /* ---------------------------------- Rendu --------------------------------- */

// //   return (
// //     <>
// //       {/*
// //         Barre du haut : l'assistant IA et les notifications restent TOUJOURS visibles
// //         sur mobile, quel que soit le rôle. `shrink-0` les empêche de disparaître
// //         quand la place manque.
// //       */}
// //       <div className="flex shrink-0 items-center gap-1">
// //         <Link
// //           href="/chat"
// //           aria-label="Assistant IA"
// //           title="Assistant IA"
// //           className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-800"
// //         >
// //           <img src="/generative.png" alt="" className="h-5 w-5 object-contain dark:invert" />
// //         </Link>

// //         <div className="flex h-10 w-10 shrink-0 items-center justify-center">
// //           <UserNotifications />
// //         </div>

// //         <button
// //           type="button"
// //           onClick={() => setIsOpen((open) => !open)}
// //           aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
// //           aria-haspopup="dialog"
// //           aria-expanded={isOpen}
// //           className="ml-1 flex shrink-0 items-center gap-3 rounded-lg p-1 transition-colors duration-300 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:hover:bg-zinc-800"
// //         >
// //           {/* Nom : seulement quand il y a la place (tablette) */}
// //           <span className="hidden flex-col pl-2 text-right leading-tight md:flex">
// //             <span className="max-w-[120px] truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">
// //               {user.name}
// //             </span>
// //             <span className="max-w-[120px] truncate text-xs text-zinc-500 dark:text-zinc-400">
// //               {user.email}
// //             </span>
// //           </span>
// //           <Avatar user={user} solid={styles.solid} size="h-9 w-9" />
// //         </button>
// //       </div>

// //       {/*
// //         Menu en portail sur <body> : le panneau reste ainsi positionné par rapport à
// //         l'écran, même si un parent de la barre applique un transform ou un filtre.
// //       */}
// //       {isMounted &&
// //         createPortal(
// //           <AnimatePresence>
// //             {isOpen && (
// //               <motion.div
// //                 key="overlay"
// //                 variants={overlayVariants}
// //                 initial="closed"
// //                 animate="open"
// //                 exit="closed"
// //                 className="fixed inset-0 z-[60] bg-black/50 dark:bg-black/60 lg:hidden"
// //                 onClick={() => setIsOpen(false)}
// //                 aria-hidden
// //               />
// //             )}
// //             {isOpen && (
// //               <motion.aside
// //                 key="panel"
// //                 role="dialog"
// //                 aria-modal="true"
// //                 aria-label="Menu de navigation"
// //                 variants={panelVariants}
// //                 initial="closed"
// //                 animate="open"
// //                 exit="closed"
// //                 className="fixed right-0 top-0 z-[70] flex h-[100dvh] w-[85%] max-w-sm flex-col overflow-hidden border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 lg:hidden"
// //               >
// //                 {/* En-tête : logo, thème, fermeture */}
// //                 <motion.div
// //                   variants={itemVariants}
// //                   className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-4 dark:border-zinc-700"
// //                 >
// //                   <Link href="/" onClick={() => setIsOpen(false)} className="flex-shrink-0">
// //                     <img
// //                       src="/logo.png"
// //                       className="w-[80px] transition-all duration-300 dark:brightness-0 dark:invert"
// //                       alt="cx"
// //                     />
// //                   </Link>
// //                   <div className="flex items-center gap-1">
// //                     <div className="flex h-10 w-10 items-center justify-center">
// //                       <ThemeSwitch />
// //                     </div>
// //                     <button
// //                       type="button"
// //                       onClick={() => setIsOpen(false)}
// //                       aria-label="Fermer le menu"
// //                       className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-800"
// //                     >
// //                       <X size={20} aria-hidden />
// //                     </button>
// //                   </div>
// //                 </motion.div>

// //                 {/* Profil */}
// //                 <motion.div variants={itemVariants} className="shrink-0">
// //                   <Link
// //                     href="/profile"
// //                     onClick={() => setIsOpen(false)}
// //                     className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-4 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700/60"
// //                   >
// //                     <Avatar user={user} solid={styles.solid} size="h-12 w-12" badge={false} />
// //                     <div className="min-w-0 flex-1">
// //                       <div className="truncate font-medium text-zinc-900 dark:text-zinc-50">
// //                         {user.name}
// //                       </div>
// //                       <div className="truncate text-sm text-zinc-500 dark:text-zinc-400">
// //                         {user.email}
// //                       </div>
// //                       <div className="mt-1.5 flex items-center gap-2">
// //                         <span
// //                           className={`inline-flex items-center rounded-full bg-zinc-200/70 px-2 py-0.5 text-xs font-medium dark:bg-zinc-700 ${styles.tone}`}
// //                         >
// //                           {currentRole.label}
// //                         </span>
// //                         <span className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
// //                           Modifier
// //                           <ArrowLongRightIcon className="h-4 w-4" aria-hidden />
// //                         </span>
// //                       </div>
// //                     </div>
// //                   </Link>
// //                 </motion.div>

// //                 {/* Liens : zone défilante */}
// //                 <motion.nav
// //                   variants={itemVariants}
// //                   aria-label="Navigation principale"
// //                   className="hide-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
// //                 >
// //                   <ul className="grid grid-cols-2 gap-3">
// //                     {navigationLinks.map((link) => {
// //                       const Icon = iconMap[link.iconName]
// //                       const active = normalize(pathname ?? '') === normalize(link.href)
// //                       return (
// //                         <li key={link.href}>
// //                           <Link
// //                             href={link.href}
// //                             onClick={() => setIsOpen(false)}
// //                             aria-current={active ? 'page' : undefined}
// //                             className={`flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
// //                               active
// //                                 ? 'border-zinc-900 bg-zinc-100 text-zinc-900 dark:border-zinc-100 dark:bg-zinc-700 dark:text-zinc-50'
// //                                 : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700/60'
// //                             }`}
// //                           >
// //                             <Icon size={22} className="shrink-0" aria-hidden />
// //                             <span className="text-xs font-medium leading-4">{link.label}</span>
// //                           </Link>
// //                         </li>
// //                       )
// //                     })}
// //                   </ul>
// //                 </motion.nav>

// //                 {/* Pied : déconnexion toujours accessible */}
// //                 <motion.div
// //                   variants={itemVariants}
// //                   className="shrink-0 border-t border-zinc-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-zinc-700"
// //                 >
// //                   <div className="grid place-content-center rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
// //                     <LogoutButton />
// //                   </div>
// //                 </motion.div>
// //               </motion.aside>
// //             )}
// //           </AnimatePresence>,
// //           document.body
// //         )}

// //       <style jsx global>{`
// //         .hide-scrollbar {
// //           -ms-overflow-style: none;
// //           scrollbar-width: none;
// //         }
// //         .hide-scrollbar::-webkit-scrollbar {
// //           display: none;
// //         }
// //       `}</style>
// //     </>
// //   )
// // }

// 'use client'

// import { useEffect, useState } from 'react'
// import { createPortal } from 'react-dom'
// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
// import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
// import {
//   Activity,
//   BookmarkCheck,
//   BotIcon,
//   Briefcase,
//   Calendar,
//   File,
//   Folder,
//   Headset,
//   Home,
//   Network,
//   Search,
//   Upload,
//   Users,
//   X,
// } from 'lucide-react'
// import { ArrowLongRightIcon } from '@heroicons/react/24/outline'

// import { RoleIcon } from './RoleIcon'
// import ThemeSwitch from './ThemeSwitch'
// import { LogoutButton } from './LogoutBouton'
// import UserNotifications from './UserNotifications'

// /* -------------------------------------------------------------------------- */
// /*                                Configuration                               */
// /* -------------------------------------------------------------------------- */

// const iconMap = {
//   home: Home,
//   thumbtack: BookmarkCheck,
//   upload: Upload,
//   file: File,
//   folder: Folder,
//   search: Search,
//   headset: Headset,
//   users: Users,
//   activity: Activity,
//   calendar: Calendar,
//   briefcase: Briefcase,
//   network: Network,
//   bot: BotIcon,
// } as const

// const getInitials = (name: string) =>
//   name
//     .split(' ')
//     .filter(Boolean)
//     .map((part) => part.charAt(0).toUpperCase())
//     .join('')
//     .slice(0, 2)

// // Chemins comparés sans le « / » final ('/tfc/' et '/tfc' sont la même page)
// const normalize = (path: string) => (path.length > 1 ? path.replace(/\/$/, '') : path)

// interface MobileMenuUser {
//   name: string
//   email: string
//   profil_url?: string | null
//   role: string
// }

// interface MobileMenuProps {
//   navigationLinks: Array<{
//     href: string
//     iconName: keyof typeof iconMap
//     label: string
//   }>
//   user: MobileMenuUser
//   // Classes Tailwind complètes (avec leur variante `dark:`), préparées côté serveur
//   styles: {
//     solid: string
//     tone: string
//   }
//   currentRole: {
//     label: string
//     color: string
//   }
// }

// /* -------------------------------------------------------------------------- */
// /*                              Petits composants                             */
// /* -------------------------------------------------------------------------- */

// function Avatar({
//   user,
//   solid,
//   size,
//   badge = true,
// }: {
//   user: MobileMenuUser
//   solid: string
//   size: string
//   badge?: boolean
// }) {
//   return (
//     <span className="relative inline-flex shrink-0">
//       {user.profil_url ? (
//         <img
//           src={user.profil_url}
//           alt="Photo de profil"
//           className={`${size} rounded-full border-2 border-zinc-200 object-cover dark:border-zinc-700`}
//         />
//       ) : (
//         <span
//           className={`${size} flex items-center justify-center rounded-full text-sm font-semibold text-white ${solid}`}
//         >
//           {getInitials(user.name)}
//         </span>
//       )}
//       {badge && (
//         <span
//           className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-zinc-900 ${solid}`}
//         >
//           <RoleIcon role={user.role} className="h-2 w-2 text-white" />
//         </span>
//       )}
//     </span>
//   )
// }

// /* -------------------------------------------------------------------------- */
// /*                                 Composant                                  */
// /* -------------------------------------------------------------------------- */

// export function MobileMenu({ navigationLinks, user, styles, currentRole }: MobileMenuProps) {
//   const [isOpen, setIsOpen] = useState(false)
//   const [isMounted, setIsMounted] = useState(false)
//   const pathname = usePathname()
//   const reduceMotion = useReducedMotion()

//   // Le portail a besoin du `document` : on attend le montage côté client
//   useEffect(() => {
//     setIsMounted(true)
//   }, [])

//   // Ferme le menu après une navigation
//   useEffect(() => {
//     setIsOpen(false)
//   }, [pathname])

//   // Menu ouvert : on bloque le défilement de la page (sans `position: fixed`,
//   // qui ramenait la page tout en haut) et Échap ferme le menu
//   useEffect(() => {
//     if (!isOpen) return

//     const previousOverflow = document.body.style.overflow
//     document.body.style.overflow = 'hidden'

//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') setIsOpen(false)
//     }
//     window.addEventListener('keydown', onKey)

//     return () => {
//       document.body.style.overflow = previousOverflow
//       window.removeEventListener('keydown', onKey)
//     }
//   }, [isOpen])

//   /* -------------------------------- Animations ------------------------------ */

//   const spring = reduceMotion
//     ? { duration: 0 }
//     : { type: 'spring' as const, stiffness: 400, damping: 40 }

//   const panelVariants: Variants = {
//     closed: { x: '100%', transition: spring },
//     open: {
//       x: 0,
//       transition: {
//         ...spring,
//         staggerChildren: reduceMotion ? 0 : 0.05,
//         delayChildren: reduceMotion ? 0 : 0.08,
//       },
//     },
//   }

//   const itemVariants: Variants = {
//     closed: { x: 24, opacity: 0, transition: { duration: reduceMotion ? 0 : 0.15 } },
//     open: {
//       x: 0,
//       opacity: 1,
//       transition: reduceMotion
//         ? { duration: 0 }
//         : { type: 'spring', stiffness: 500, damping: 30 },
//     },
//   }

//   const overlayVariants: Variants = {
//     closed: { opacity: 0, transition: { duration: 0.2 } },
//     open: { opacity: 1, transition: { duration: 0.2 } },
//   }

//   /* ---------------------------------- Rendu --------------------------------- */

//   return (
//     <>
//       {/*
//         Barre du haut : recherche, assistant IA et notifications restent TOUJOURS
//         visibles sur mobile, quel que soit le rôle. `shrink-0` les empêche de
//         disparaître quand la place manque.
//       */}
//       <div className="flex shrink-0 items-center gap-1">
//         {/* Recherche */}
//         <Link
//           href="/recherche"
//           aria-label="Recherche"
//           title="Recherche"
//           className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-800"
//         >
//           <img src="/search2.png" alt="" className="h-4 w-4 object-contain dark:invert" />
//         </Link>

//         {/* Assistant IA */}
//         <Link
//           href="/chat"
//           aria-label="Assistant IA"
//           title="Assistant IA"
//           className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-800"
//         >
//           <img src="/ia.png" alt="" className="h-8 w-8 dark:invert  rounded object-cover" />
//         </Link>

//         <div className="flex h-10 w-10 shrink-0 items-center justify-center">
//           <UserNotifications />
//         </div>

//         <button
//           type="button"
//           onClick={() => setIsOpen((open) => !open)}
//           aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
//           aria-haspopup="dialog"
//           aria-expanded={isOpen}
//           className="ml-1 flex shrink-0 items-center gap-3 rounded-lg p-1 transition-colors duration-300 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:hover:bg-zinc-800"
//         >
//           {/* Nom : seulement quand il y a la place (tablette) */}
//           <span className="hidden flex-col pl-2 text-right leading-tight md:flex">
//             <span className="max-w-[120px] truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">
//               {user.name}
//             </span>
//             <span className="max-w-[120px] truncate text-xs text-zinc-500 dark:text-zinc-400">
//               {user.email}
//             </span>
//           </span>
//           <Avatar user={user} solid={styles.solid} size="h-9 w-9" />
//         </button>
//       </div>

//       {/*
//         Menu en portail sur <body> : le panneau reste ainsi positionné par rapport à
//         l'écran, même si un parent de la barre applique un transform ou un filtre.
//       */}
//       {isMounted &&
//         createPortal(
//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//                 key="overlay"
//                 variants={overlayVariants}
//                 initial="closed"
//                 animate="open"
//                 exit="closed"
//                 className="fixed inset-0 z-[60] bg-black/50 dark:bg-black/60 lg:hidden"
//                 onClick={() => setIsOpen(false)}
//                 aria-hidden
//               />
//             )}
//             {isOpen && (
//               <motion.aside
//                 key="panel"
//                 role="dialog"
//                 aria-modal="true"
//                 aria-label="Menu de navigation"
//                 variants={panelVariants}
//                 initial="closed"
//                 animate="open"
//                 exit="closed"
//                 className="fixed right-0 top-0 z-[70] flex h-[100dvh] w-[85%] max-w-sm flex-col overflow-hidden border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 lg:hidden"
//               >
//                 {/* En-tête : logo, thème, fermeture */}
//                 <motion.div
//                   variants={itemVariants}
//                   className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-4 dark:border-zinc-700"
//                 >
//                   <Link href="/" onClick={() => setIsOpen(false)} className="flex-shrink-0">
//                     <img
//                       src="/logo.png"
//                       className="w-[80px] transition-all duration-300 dark:brightness-0 dark:invert"
//                       alt="cx"
//                     />
//                   </Link>
//                   <div className="flex items-center gap-1">
//                     <div className="flex h-10 w-10 items-center justify-center">
//                       <ThemeSwitch />
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => setIsOpen(false)}
//                       aria-label="Fermer le menu"
//                       className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-800"
//                     >
//                       <X size={20} aria-hidden />
//                     </button>
//                   </div>
//                 </motion.div>

//                 {/* Profil */}
//                 <motion.div variants={itemVariants} className="shrink-0">
//                   <Link
//                     href="/profile"
//                     onClick={() => setIsOpen(false)}
//                     className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-4 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700/60"
//                   >
//                     <Avatar user={user} solid={styles.solid} size="h-12 w-12" badge={false} />
//                     <div className="min-w-0 flex-1">
//                       <div className="truncate font-medium text-zinc-900 dark:text-zinc-50">
//                         {user.name}
//                       </div>
//                       <div className="truncate text-sm text-zinc-500 dark:text-zinc-400">
//                         {user.email}
//                       </div>
//                       <div className="mt-1.5 flex items-center gap-2">
//                         <span
//                           className={`inline-flex items-center rounded-full bg-zinc-200/70 px-2 py-0.5 text-xs font-medium dark:bg-zinc-700 ${styles.tone}`}
//                         >
//                           {currentRole.label}
//                         </span>
//                         <span className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
//                           Modifier
//                           <ArrowLongRightIcon className="h-4 w-4" aria-hidden />
//                         </span>
//                       </div>
//                     </div>
//                   </Link>
//                 </motion.div>

//                 {/* Liens : zone défilante */}
//                 <motion.nav
//                   variants={itemVariants}
//                   aria-label="Navigation principale"
//                   className="hide-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
//                 >
//                   <ul className="grid grid-cols-2 gap-3">
//                     {navigationLinks.map((link) => {
//                       const Icon = iconMap[link.iconName]
//                       const active = normalize(pathname ?? '') === normalize(link.href)
//                       return (
//                         <li key={link.href}>
//                           <Link
//                             href={link.href}
//                             onClick={() => setIsOpen(false)}
//                             aria-current={active ? 'page' : undefined}
//                             className={`flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
//                               active
//                                 ? 'border-zinc-900 bg-zinc-100 text-zinc-900 dark:border-zinc-100 dark:bg-zinc-700 dark:text-zinc-50'
//                                 : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700/60'
//                             }`}
//                           >
//                             <Icon size={22} className="shrink-0" aria-hidden />
//                             <span className="text-xs font-medium leading-4">{link.label}</span>
//                           </Link>
//                         </li>
//                       )
//                     })}
//                   </ul>
//                 </motion.nav>

//                 {/* Pied : déconnexion toujours accessible */}
//                 <motion.div
//                   variants={itemVariants}
//                   className="shrink-0 border-t border-zinc-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-zinc-700"
//                 >
//                   <div className="grid place-content-center rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
//                     <LogoutButton />
//                   </div>
//                 </motion.div>
//               </motion.aside>
//             )}
//           </AnimatePresence>,
//           document.body
//         )}

//       <style jsx global>{`
//         .hide-scrollbar {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//         .hide-scrollbar::-webkit-scrollbar {
//           display: none;
//         }
//       `}</style>
//     </>
//   )
// }

'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import {
  Activity,
  BookmarkCheck,
  BotIcon,
  Briefcase,
  Calendar,
  File,
  Folder,
  Headset,
  Home,
  Network,
  Search,
  Upload,
  Users,
  X,
} from 'lucide-react'
import { ArrowLongRightIcon } from '@heroicons/react/24/outline'

import { RoleIcon } from './RoleIcon'
import ThemeSwitch from './ThemeSwitch'
import { LogoutButton } from './LogoutBouton'
import UserNotifications from './UserNotifications'

/* -------------------------------------------------------------------------- */
/*                                Configuration                               */
/* -------------------------------------------------------------------------- */

const iconMap = {
  home: Home,
  thumbtack: BookmarkCheck,
  upload: Upload,
  file: File,
  folder: Folder,
  search: Search,
  headset: Headset,
  users: Users,
  activity: Activity,
  calendar: Calendar,
  briefcase: Briefcase,
  network: Network,
  bot: BotIcon,
} as const

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)

// Chemins comparés sans le « / » final ('/tfc/' et '/tfc' sont la même page)
const normalize = (path: string) => (path.length > 1 ? path.replace(/\/$/, '') : path)

// Liens désactivés selon le rôle (ex: chat IA interdit aux étudiants)
const isLinkDisabled = (href: string, role: string) => {
  if (href === '/chat' && role === 'student') return true
  return false
}

interface MobileMenuUser {
  name: string
  email: string
  profil_url?: string | null
  role: string
}

interface MobileMenuProps {
  navigationLinks: Array<{
    href: string
    iconName: keyof typeof iconMap
    label: string
  }>
  user: MobileMenuUser
  // Classes Tailwind complètes (avec leur variante `dark:`), préparées côté serveur
  styles: {
    solid: string
    tone: string
  }
  currentRole: {
    label: string
    color: string
  }
}

/* -------------------------------------------------------------------------- */
/*                              Petits composants                             */
/* -------------------------------------------------------------------------- */

function Avatar({
  user,
  solid,
  size,
  badge = true,
}: {
  user: MobileMenuUser
  solid: string
  size: string
  badge?: boolean
}) {
  return (
    <span className="relative inline-flex shrink-0">
      {user.profil_url ? (
        <img
          src={user.profil_url}
          alt="Photo de profil"
          className={`${size} rounded-full border-2 border-zinc-200 object-cover dark:border-zinc-700`}
        />
      ) : (
        <span
          className={`${size} flex items-center justify-center rounded-full text-sm font-semibold text-white ${solid}`}
        >
          {getInitials(user.name)}
        </span>
      )}
      {badge && (
        <span
          className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-zinc-900 ${solid}`}
        >
          <RoleIcon role={user.role} className="h-2 w-2 text-white" />
        </span>
      )}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 Composant                                  */
/* -------------------------------------------------------------------------- */

export function MobileMenu({ navigationLinks, user, styles, currentRole }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()

  // Le portail a besoin du `document` : on attend le montage côté client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Ferme le menu après une navigation
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Menu ouvert : on bloque le défilement de la page (sans `position: fixed`,
  // qui ramenait la page tout en haut) et Échap ferme le menu
  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen])

  /* -------------------------------- Animations ------------------------------ */

  const spring = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 400, damping: 40 }

  const panelVariants: Variants = {
    closed: { x: '100%', transition: spring },
    open: {
      x: 0,
      transition: {
        ...spring,
        staggerChildren: reduceMotion ? 0 : 0.05,
        delayChildren: reduceMotion ? 0 : 0.08,
      },
    },
  }

  const itemVariants: Variants = {
    closed: { x: 24, opacity: 0, transition: { duration: reduceMotion ? 0 : 0.15 } },
    open: {
      x: 0,
      opacity: 1,
      transition: reduceMotion
        ? { duration: 0 }
        : { type: 'spring', stiffness: 500, damping: 30 },
    },
  }

  const overlayVariants: Variants = {
    closed: { opacity: 0, transition: { duration: 0.2 } },
    open: { opacity: 1, transition: { duration: 0.2 } },
  }

  /* ---------------------------------- Rendu --------------------------------- */

  return (
    <>
      {/*
        Barre du haut : recherche, assistant IA et notifications restent TOUJOURS
        visibles sur mobile, quel que soit le rôle. `shrink-0` les empêche de
        disparaître quand la place manque.
      */}
      <div className="flex shrink-0 items-center gap-1">
        {/* Recherche */}
        <Link
          href="/recherche"
          aria-label="Recherche"
          title="Recherche"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <img src="/search2.png" alt="" className="h-4 w-4 object-contain dark:invert" />
        </Link>

        {/* Assistant IA — désactivé pour les étudiants */}
        {isLinkDisabled('/chat', user.role) ? (
          <span
            aria-disabled="true"
            title="Assistant IA non disponible"
            className="flex h-10 w-10 shrink-0 cursor-not-allowed items-center justify-center rounded-lg opacity-40 grayscale"
          >
            <img src="/ia.png" alt="" className="h-8 w-8 rounded object-cover dark:invert" />
          </span>
        ) : (
          <Link
            href="/chat"
            aria-label="Assistant IA"
            title="Assistant IA"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <img src="/ia.png" alt="" className="h-8 w-8 rounded object-cover dark:invert" />
          </Link>
        )}

        <div className="flex h-10 w-10 shrink-0 items-center justify-center">
          <UserNotifications />
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="ml-1 flex shrink-0 items-center gap-3 rounded-lg p-1 transition-colors duration-300 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:hover:bg-zinc-800"
        >
          {/* Nom : seulement quand il y a la place (tablette) */}
          <span className="hidden flex-col pl-2 text-right leading-tight md:flex">
            <span className="max-w-[120px] truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">
              {user.name}
            </span>
            <span className="max-w-[120px] truncate text-xs text-zinc-500 dark:text-zinc-400">
              {user.email}
            </span>
          </span>
          <Avatar user={user} solid={styles.solid} size="h-9 w-9" />
        </button>
      </div>

      {/*
        Menu en portail sur <body> : le panneau reste ainsi positionné par rapport à
        l'écran, même si un parent de la barre applique un transform ou un filtre.
      */}
      {isMounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="overlay"
                variants={overlayVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="fixed inset-0 z-[60] bg-black/50 dark:bg-black/60 lg:hidden"
                onClick={() => setIsOpen(false)}
                aria-hidden
              />
            )}
            {isOpen && (
              <motion.aside
                key="panel"
                role="dialog"
                aria-modal="true"
                aria-label="Menu de navigation"
                variants={panelVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="fixed right-0 top-0 z-[70] flex h-[100dvh] w-[85%] max-w-sm flex-col overflow-hidden border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 lg:hidden"
              >
                {/* En-tête : logo, thème, fermeture */}
                <motion.div
                  variants={itemVariants}
                  className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-4 dark:border-zinc-700"
                >
                  <Link href="/" onClick={() => setIsOpen(false)} className="flex-shrink-0">
                    <img
                      src="/logo.png"
                      className="w-[80px] transition-all duration-300 dark:brightness-0 dark:invert"
                      alt="cx"
                    />
                  </Link>
                  <div className="flex items-center gap-1">
                    <div className="flex h-10 w-10 items-center justify-center">
                      <ThemeSwitch />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      aria-label="Fermer le menu"
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      <X size={20} aria-hidden />
                    </button>
                  </div>
                </motion.div>

                {/* Profil */}
                <motion.div variants={itemVariants} className="shrink-0">
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-4 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700/60"
                  >
                    <Avatar user={user} solid={styles.solid} size="h-12 w-12" badge={false} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                        {user.name}
                      </div>
                      <div className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                        {user.email}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full bg-zinc-200/70 px-2 py-0.5 text-xs font-medium dark:bg-zinc-700 ${styles.tone}`}
                        >
                          {currentRole.label}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                          Modifier
                          <ArrowLongRightIcon className="h-4 w-4" aria-hidden />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                {/* Liens : zone défilante */}
                <motion.nav
                  variants={itemVariants}
                  aria-label="Navigation principale"
                  className="hide-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
                >
                  <ul className="grid grid-cols-2 gap-3">
                    {navigationLinks.map((link) => {
                      const Icon = iconMap[link.iconName]
                      const active = normalize(pathname ?? '') === normalize(link.href)
                      const disabled = isLinkDisabled(link.href, user.role)

                      return (
                        <li key={link.href}>
                          {disabled ? (
                            <span
                              aria-disabled="true"
                              title="Non disponible pour votre rôle"
                              className="flex min-h-[88px] cursor-not-allowed flex-col items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100 p-3 text-center opacity-50 dark:border-zinc-700 dark:bg-zinc-800/50"
                            >
                              <Icon size={22} className="shrink-0" aria-hidden />
                              <span className="text-xs font-medium leading-4">{link.label}</span>
                            </span>
                          ) : (
                            <Link
                              href={link.href}
                              onClick={() => setIsOpen(false)}
                              aria-current={active ? 'page' : undefined}
                              className={`flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                                active
                                  ? 'border-zinc-900 bg-zinc-100 text-zinc-900 dark:border-zinc-100 dark:bg-zinc-700 dark:text-zinc-50'
                                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700/60'
                              }`}
                            >
                              <Icon size={22} className="shrink-0" aria-hidden />
                              <span className="text-xs font-medium leading-4">{link.label}</span>
                            </Link>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </motion.nav>

                {/* Pied : déconnexion toujours accessible */}
                <motion.div
                  variants={itemVariants}
                  className="shrink-0 border-t border-zinc-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-zinc-700"
                >
                  <div className="grid place-content-center rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
                    <LogoutButton />
                  </div>
                </motion.div>
              </motion.aside>
            )}
          </AnimatePresence>,
          document.body
        )}

      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}
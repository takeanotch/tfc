
// // components/Navigation.tsx

// import Link from 'next/link'
// import { requireAuth } from '@/utils/session'
// import { NavLinks } from './NavLinks'
// import { MobileMenu } from './MobileMenu'
// import { RoleIcon } from './RoleIcon'
// import { LogoutButton } from './LogoutBouton'
// import ThemeSwitch from './ThemeSwitch'
// import UserNotifications from './UserNotifications'

// /* -------------------------------------------------------------------------- */
// /*                                Configuration                               */
// /* -------------------------------------------------------------------------- */

// type RoleKey = 'admin' | 'check_in_admin' | 'teacher' | 'student' | 'alumni'
// type ColorKey = 'purple' | 'red' | 'blue' | 'green' | 'orange' | 'gray'
// type IconName =
//   | 'home'
//   | 'activity'
//   | 'thumbtack'
//   | 'headset'
//   | 'folder'
//   | 'search'
//   | 'file'
//   | 'users'
//   | 'calendar'
//   | 'briefcase'
//   | 'network'
//   | 'bot'

// interface NavItem {
//   href: string
//   iconName: IconName
//   label: string
// }

// const roleConfig: Record<RoleKey, { label: string; color: ColorKey }> = {
//   admin: { label: 'Administrateur', color: 'purple' },
//   check_in_admin: { label: 'Admin Check-in', color: 'red' },
//   teacher: { label: 'Enseignant', color: 'blue' },
//   student: { label: 'Étudiant', color: 'green' },
//   alumni: { label: 'Ancien élève', color: 'orange' },
// }

// /*
//   IMPORTANT (Tailwind) : une classe comme `dark:${styles.dark.bg}` n'est jamais
//   générée, car Tailwind ne repère que les chaînes complètes écrites dans le code.
//   Les champs `solid`, `tone` et `edge` contiennent donc les classes `dark:` en entier.
//   Les champs `border`, `bg`, `text` et `dark` sont conservés tels quels pour `NavLinks`.
// */
// const colorStyles: Record<
//   ColorKey,
//   {
//     border: string
//     bg: string
//     text: string
//     dark: { border: string; bg: string; text: string }
//     solid: string
//     tone: string
//     edge: string
//   }
// > = {
//   purple: {
//     border: 'border-purple-500',
//     bg: 'bg-purple-500',
//     text: 'text-purple-600',
//     dark: { border: 'border-purple-400', bg: 'bg-purple-400', text: 'text-purple-300' },
//     solid: 'bg-purple-500 dark:bg-purple-400',
//     tone: 'text-purple-600 dark:text-purple-300',
//     edge: 'border-purple-500 dark:border-purple-400',
//   },
//   red: {
//     border: 'border-red-500',
//     bg: 'bg-red-500',
//     text: 'text-red-600',
//     dark: { border: 'border-red-400', bg: 'bg-red-400', text: 'text-red-300' },
//     solid: 'bg-red-500 dark:bg-red-400',
//     tone: 'text-red-600 dark:text-red-300',
//     edge: 'border-red-500 dark:border-red-400',
//   },
//   blue: {
//     border: 'border-blue-500',
//     bg: 'bg-blue-500',
//     text: 'text-blue-600',
//     dark: { border: 'border-blue-400', bg: 'bg-blue-400', text: 'text-blue-300' },
//     solid: 'bg-blue-500 dark:bg-blue-400',
//     tone: 'text-blue-600 dark:text-blue-300',
//     edge: 'border-blue-500 dark:border-blue-400',
//   },
//   green: {
//     border: 'border-green-500',
//     bg: 'bg-green-500',
//     text: 'text-green-600',
//     dark: { border: 'border-green-400', bg: 'bg-green-400', text: 'text-green-300' },
//     solid: 'bg-green-500 dark:bg-green-400',
//     tone: 'text-green-600 dark:text-green-300',
//     edge: 'border-green-500 dark:border-green-400',
//   },
//   orange: {
//     border: 'border-orange-500',
//     bg: 'bg-orange-500',
//     text: 'text-orange-600',
//     dark: { border: 'border-orange-400', bg: 'bg-orange-400', text: 'text-orange-300' },
//     solid: 'bg-orange-500 dark:bg-orange-400',
//     tone: 'text-orange-600 dark:text-orange-300',
//     edge: 'border-orange-500 dark:border-orange-400',
//   },
//   gray: {
//     border: 'border-zinc-500',
//     bg: 'bg-zinc-500',
//     text: 'text-zinc-600',
//     dark: { border: 'border-zinc-400', bg: 'bg-zinc-400', text: 'text-zinc-300' },
//     solid: 'bg-zinc-500 dark:bg-zinc-400',
//     tone: 'text-zinc-600 dark:text-zinc-300',
//     edge: 'border-zinc-500 dark:border-zinc-400',
//   },
// }

// const linkConfig: Record<RoleKey, NavItem[]> = {
//   admin: [
//     { href: '/admin/users', iconName: 'users', label: 'Users' },
//     { href: '/tfc', iconName: 'file', label: 'List' },
//     { href: '/chat', iconName: 'bot', label: 'Chat' },
//     { href: '/admin/activity', iconName: 'activity', label: 'Activity' },
//     { href: '/favorites', iconName: 'thumbtack', label: 'Fav' },
//   ],
//   check_in_admin: [
//     { href: '/admin/', iconName: 'calendar', label: 'Check-in' },
//     { href: '/check-in', iconName: 'search', label: 'Recherche' },
//     { href: '/support', iconName: 'headset', label: 'Support' },
//   ],
//   teacher: [
//     { href: '/tfc/', iconName: 'file', label: 'TFCs' },
//     { href: '/students', iconName: 'users', label: 'Étudiants' },
//     { href: '/tfc/explorer', iconName: 'folder', label: 'TFC' },
//     { href: '/favorites', iconName: 'thumbtack', label: 'Favorites' },
//     { href: '/support', iconName: 'headset', label: 'Support' },
//   ],
//   student: [
//     { href: '/chat', iconName: 'bot', label: 'Chat' },
//     { href: '/tfc/', iconName: 'file', label: 'TFCs' },
//     { href: '/favorites', iconName: 'thumbtack', label: 'Favorites' },
//     { href: '/support', iconName: 'headset', label: 'Support' },
//   ],
//   alumni: [
//     { href: '/alumni/', iconName: 'network', label: 'Réseau' },
//     { href: '/tfc', iconName: 'briefcase', label: 'Offres' },
//     { href: '/support', iconName: 'headset', label: 'Support' },
//   ],
// }

// /* -------------------------------------------------------------------------- */
// /*                                  Helpers                                   */
// /* -------------------------------------------------------------------------- */

// const getInitials = (name: string) =>
//   name
//     .split(' ')
//     .filter(Boolean)
//     .map((part) => part.charAt(0).toUpperCase())
//     .join('')
//     .slice(0, 2)

// // Même gabarit (36 px) pour toutes les icônes d'action de la barre
// const ICON_SLOT = 'flex h-9 w-9 shrink-0 items-center justify-center'
// const ICON_LINK = `${ICON_SLOT} rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-800`

// function Avatar({
//   user,
//   solid,
// }: {
//   user: { name: string; profil_url?: string | null; role: string }
//   solid: string
// }) {
//   return (
//     <span className="relative inline-flex shrink-0">
//       {user.profil_url ? (
//         <img
//           src={user.profil_url}
//           alt="Photo de profil"
//           className="h-10 w-10 rounded-full border-2 border-zinc-200 object-cover transition-colors duration-300 dark:border-zinc-700"
//         />
//       ) : (
//         <span
//           className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white transition-colors duration-300 ${solid}`}
//         >
//           {getInitials(user.name)}
//         </span>
//       )}
//       <span
//         className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white transition-colors duration-300 dark:border-zinc-900 ${solid}`}
//       >
//         <RoleIcon role={user.role} className="h-2 w-2 text-white" />
//       </span>
//     </span>
//   )
// }

// /* -------------------------------------------------------------------------- */
// /*                                 Composant                                  */
// /* -------------------------------------------------------------------------- */

// export default async function Navigation() {
//   const user = await requireAuth()

//   const currentRole = roleConfig[user.role as RoleKey] ?? {
//     label: 'Utilisateur',
//     color: 'gray' as ColorKey,
//   }
//   const styles = colorStyles[currentRole.color]

//   const roleLinks = linkConfig[user.role as RoleKey] ?? []
//   const navigationLinks: NavItem[] = [
//     { href: '/', iconName: 'home', label: 'Accueil' },
//     ...roleLinks,
//   ]

//   // On ne transmet au composant client que le strict nécessaire
//   const mobileUser = {
//     name: user.name,
//     email: user.email,
//     profil_url: user.profil_url ?? null,
//     role: user.role,
//   }

//   return (
//     <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white transition-colors duration-300 dark:border-zinc-700 dark:bg-zinc-900">
//       {/* Pas de `container` : il impose une largeur max par palier et créait de grandes marges sur petit écran */}
//       <div className="mx-auto w-full max-w-screen-2xl px-3 sm:px-4 lg:px-6">
//         {/* ------------------------------ Desktop ------------------------------ */}
//         <div className="hidden h-16 items-center gap-4 lg:flex">
//           {/* Logo */}
//           <Link href="/" className="flex-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400">
//             <img
//               src="/logo.png"
//               className="w-[80px] transition-all duration-300 dark:brightness-0 dark:invert"
//               alt="cx"
//             />
//           </Link>

//           {/* Actions rapides */}
//           <div className="flex items-center gap-1">
//             <div className={ICON_SLOT}>
//               <ThemeSwitch />
//             </div>
//             <div className={ICON_SLOT}>
//               <UserNotifications />
//             </div>
//             <Link href="/recherche" aria-label="Recherche" title="Recherche" className={ICON_LINK}>
//               <img src="/search2.png" alt="" className="h-4 w-4 object-contain dark:invert" />
//             </Link>
//           </div>

//           {/* Liens de navigation */}
//           <div className="flex flex-1 items-center justify-center gap-1">
//             <NavLinks links={navigationLinks} styles={styles} />
//           </div>

//           {/* Utilisateur */}
//           <div className="group relative">
//             <div
//               tabIndex={0}
//               className="flex cursor-pointer items-center gap-3 rounded-lg p-1.5 pl-3 transition-colors duration-300 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:hover:bg-zinc-800"
//             >
//               <div className="flex flex-col text-right leading-tight">
//                 <span className="max-w-[140px] truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
//                   {user.name}
//                 </span>
//                 <span className="max-w-[140px] truncate text-xs text-zinc-500 dark:text-zinc-400">
//                   {user.email}
//                 </span>
//               </div>
//               <Avatar user={mobileUser} solid={styles.solid} />
//             </div>

//             {/* Menu : le padding haut (et non une marge) évite de perdre le survol en descendant la souris */}
//             <div className="invisible absolute right-0 top-full z-50 w-64 pt-2 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
//               <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
//                 <div className="px-1">
//                   <div className="truncate font-medium text-zinc-900 dark:text-zinc-50">{user.name}</div>
//                   <div className="truncate text-sm text-zinc-500 dark:text-zinc-400">{user.email}</div>
//                   <div className={`mt-1 text-sm font-medium transition-colors duration-300 ${styles.tone}`}>
//                     {currentRole.label}
//                   </div>
//                 </div>

//                 <div className="mt-3 space-y-1 border-t border-zinc-200 pt-3 dark:border-zinc-700">
//                   <Link
//                     href="/profile"
//                     className="block rounded-lg px-2 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-300 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-50"
//                   >
//                     Modifier le profil
//                   </Link>
//                   <LogoutButton />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ------------------------------- Mobile ------------------------------- */}
//         <div className="flex h-14 items-center justify-between gap-3 lg:hidden">
//           <Link href="/" className="flex-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400">
//             <img
//               src="/logo.png"
//               className="w-[70px] transition-all duration-300 dark:brightness-0 dark:invert"
//               alt="cx"
//             />
//           </Link>

//           <MobileMenu
//             navigationLinks={navigationLinks}
//             user={mobileUser}
//             styles={{ solid: styles.solid, tone: styles.tone }}
//             currentRole={currentRole}
//           />
//         </div>
//       </div>

//       {/* Barre de statut privilégiée */}
//       {user.privileged && (
//         <div className="border-t border-amber-200 bg-amber-50 transition-colors duration-300 dark:border-amber-900 dark:bg-amber-950">
//           <div className="mx-auto px-3 py-1 sm:px-4 lg:px-6">
//             <div className="flex items-center justify-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-300">
//               <RoleIcon role="admin" className="h-3 w-3" />
//               <span>Accès privilégié</span>
//             </div>
//           </div>
//         </div>
//       )}
//     </nav>
//   )
// }

// components/Navigation.tsx

import Link from 'next/link'
import { requireAuth } from '@/utils/session'
import { NavLinks } from './NavLinks'
import { MobileMenu } from './MobileMenu'
import { RoleIcon } from './RoleIcon'
import { LogoutButton } from './LogoutBouton'
import ThemeSwitch from './ThemeSwitch'
import UserNotifications from './UserNotifications'

/* -------------------------------------------------------------------------- */
/*                                Configuration                               */
/* -------------------------------------------------------------------------- */

type RoleKey = 'admin' | 'check_in_admin' | 'teacher' | 'student' | 'alumni'
type ColorKey = 'purple' | 'red' | 'blue' | 'green' | 'orange' | 'gray'
type IconName =
  | 'home'
  | 'activity'
  | 'thumbtack'
  | 'headset'
  | 'folder'
  | 'search'
  | 'file'
  | 'users'
  | 'calendar'
  | 'briefcase'
  | 'network'
  | 'bot'

interface NavItem {
  href: string
  iconName: IconName
  label: string
  disabled?: boolean
}

const roleConfig: Record<RoleKey, { label: string; color: ColorKey }> = {
  admin: { label: 'Administrateur', color: 'purple' },
  check_in_admin: { label: 'Admin Check-in', color: 'red' },
  teacher: { label: 'Enseignant', color: 'blue' },
  student: { label: 'Étudiant', color: 'green' },
  alumni: { label: 'Ancien élève', color: 'orange' },
}

/*
  IMPORTANT (Tailwind) : une classe comme `dark:${styles.dark.bg}` n'est jamais
  générée, car Tailwind ne repère que les chaînes complètes écrites dans le code.
  Les champs `solid`, `tone` et `edge` contiennent donc les classes `dark:` en entier.
  Les champs `border`, `bg`, `text` et `dark` sont conservés tels quels pour `NavLinks`.
*/
const colorStyles: Record<
  ColorKey,
  {
    border: string
    bg: string
    text: string
    dark: { border: string; bg: string; text: string }
    solid: string
    tone: string
    edge: string
  }
> = {
  purple: {
    border: 'border-purple-500',
    bg: 'bg-purple-500',
    text: 'text-purple-600',
    dark: { border: 'border-purple-400', bg: 'bg-purple-400', text: 'text-purple-300' },
    solid: 'bg-purple-500 dark:bg-purple-400',
    tone: 'text-purple-600 dark:text-purple-300',
    edge: 'border-purple-500 dark:border-purple-400',
  },
  red: {
    border: 'border-red-500',
    bg: 'bg-red-500',
    text: 'text-red-600',
    dark: { border: 'border-red-400', bg: 'bg-red-400', text: 'text-red-300' },
    solid: 'bg-red-500 dark:bg-red-400',
    tone: 'text-red-600 dark:text-red-300',
    edge: 'border-red-500 dark:border-red-400',
  },
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-500',
    text: 'text-blue-600',
    dark: { border: 'border-blue-400', bg: 'bg-blue-400', text: 'text-blue-300' },
    solid: 'bg-blue-500 dark:bg-blue-400',
    tone: 'text-blue-600 dark:text-blue-300',
    edge: 'border-blue-500 dark:border-blue-400',
  },
  green: {
    border: 'border-green-500',
    bg: 'bg-green-500',
    text: 'text-green-600',
    dark: { border: 'border-green-400', bg: 'bg-green-400', text: 'text-green-300' },
    solid: 'bg-green-500 dark:bg-green-400',
    tone: 'text-green-600 dark:text-green-300',
    edge: 'border-green-500 dark:border-green-400',
  },
  orange: {
    border: 'border-orange-500',
    bg: 'bg-orange-500',
    text: 'text-orange-600',
    dark: { border: 'border-orange-400', bg: 'bg-orange-400', text: 'text-orange-300' },
    solid: 'bg-orange-500 dark:bg-orange-400',
    tone: 'text-orange-600 dark:text-orange-300',
    edge: 'border-orange-500 dark:border-orange-400',
  },
  gray: {
    border: 'border-zinc-500',
    bg: 'bg-zinc-500',
    text: 'text-zinc-600',
    dark: { border: 'border-zinc-400', bg: 'bg-zinc-400', text: 'text-zinc-300' },
    solid: 'bg-zinc-500 dark:bg-zinc-400',
    tone: 'text-zinc-600 dark:text-zinc-300',
    edge: 'border-zinc-500 dark:border-zinc-400',
  },
}

const linkConfig: Record<RoleKey, NavItem[]> = {
  admin: [
    { href: '/admin/users', iconName: 'users', label: 'Users' },
    { href: '/tfc', iconName: 'file', label: 'List' },
    { href: '/chat', iconName: 'bot', label: 'Chat' },
    { href: '/admin/activity', iconName: 'activity', label: 'Activity' },
    { href: '/favorites', iconName: 'thumbtack', label: 'Fav' },
  ],
  check_in_admin: [
    { href: '/admin/', iconName: 'calendar', label: 'Check-in' },
    { href: '/check-in', iconName: 'search', label: 'Recherche' },
    { href: '/support', iconName: 'headset', label: 'Support' },
  ],
  teacher: [
    { href: '/tfc/', iconName: 'file', label: 'TFCs' },
    { href: '/students', iconName: 'users', label: 'Étudiants' },
    { href: '/tfc/explorer', iconName: 'folder', label: 'TFC' },
    { href: '/favorites', iconName: 'thumbtack', label: 'Favorites' },
    { href: '/support', iconName: 'headset', label: 'Support' },
  ],
  student: [
    // Chat désactivé pour les étudiants
    { href: '/chat', iconName: 'bot', label: 'Chat', disabled: true },
    { href: '/tfc/', iconName: 'file', label: 'TFCs' },
    { href: '/favorites', iconName: 'thumbtack', label: 'Favorites' },
    { href: '/support', iconName: 'headset', label: 'Support' },
  ],
  alumni: [
    { href: '/alumni/', iconName: 'network', label: 'Réseau' },
    { href: '/tfc', iconName: 'briefcase', label: 'Offres' },
    { href: '/support', iconName: 'headset', label: 'Support' },
  ],
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)

// Même gabarit (36 px) pour toutes les icônes d'action de la barre
const ICON_SLOT = 'flex h-9 w-9 shrink-0 items-center justify-center'
const ICON_LINK = `${ICON_SLOT} rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-800`

function Avatar({
  user,
  solid,
}: {
  user: { name: string; profil_url?: string | null; role: string }
  solid: string
}) {
  return (
    <span className="relative inline-flex shrink-0">
      {user.profil_url ? (
        <img
          src={user.profil_url}
          alt="Photo de profil"
          className="h-10 w-10 rounded-full border-2 border-zinc-200 object-cover transition-colors duration-300 dark:border-zinc-700"
        />
      ) : (
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white transition-colors duration-300 ${solid}`}
        >
          {getInitials(user.name)}
        </span>
      )}
      <span
        className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white transition-colors duration-300 dark:border-zinc-900 ${solid}`}
      >
        <RoleIcon role={user.role} className="h-2 w-2 text-white" />
      </span>
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 Composant                                  */
/* -------------------------------------------------------------------------- */

export default async function Navigation() {
  const user = await requireAuth()

  const currentRole = roleConfig[user.role as RoleKey] ?? {
    label: 'Utilisateur',
    color: 'gray' as ColorKey,
  }
  const styles = colorStyles[currentRole.color]

  const roleLinks = linkConfig[user.role as RoleKey] ?? []
  const navigationLinks: NavItem[] = [
    { href: '/', iconName: 'home', label: 'Accueil' },
    ...roleLinks,
  ]

  // On ne transmet au composant client que le strict nécessaire
  const mobileUser = {
    name: user.name,
    email: user.email,
    profil_url: user.profil_url ?? null,
    role: user.role,
  }

  // L'assistant IA est désactivé pour les étudiants (barre desktop et mobile)
  const chatDisabled = user.role === 'student'

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white transition-colors duration-300 dark:border-zinc-700 dark:bg-zinc-900">
      {/* Pas de `container` : il impose une largeur max par palier et créait de grandes marges sur petit écran */}
      <div className="mx-auto w-full max-w-screen-2xl px-3 sm:px-4 lg:px-6">
        {/* ------------------------------ Desktop ------------------------------ */}
        <div className="hidden h-16 items-center gap-4 lg:flex">
          {/* Logo */}
          <Link href="/" className="flex-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400">
            <img
              src="/logo.png"
              className="w-[80px] transition-all duration-300 dark:brightness-0 dark:invert"
              alt="cx"
            />
          </Link>

          {/* Actions rapides */}
          <div className="flex items-center gap-1">
            <div className={ICON_SLOT}>
              <ThemeSwitch />
            </div>
            <div className={ICON_SLOT}>
              <UserNotifications />
            </div>
            <Link href="/recherche" aria-label="Recherche" title="Recherche" className={ICON_LINK}>
              <img src="/search2.png" alt="" className="h-4 w-4 object-contain dark:invert" />
            </Link>
            {/* Assistant IA : désactivé pour les étudiants */}
            {chatDisabled ? (
              <span
                aria-disabled="true"
                title="Assistant IA non disponible"
                className={`${ICON_SLOT} cursor-not-allowed rounded-lg opacity-40 grayscale`}
              >
                <img src="/ia.png" alt="" className="h-8 w-8 rounded object-cover dark:invert" />
              </span>
            ) : (
              <Link
                href="/chat"
                aria-label="Assistant IA"
                title="Assistant IA"
                className={ICON_LINK}
              >
                <img src="/ia.png" alt="" className="h-8 w-8 rounded object-cover dark:invert" />
              </Link>
            )}
          </div>

          {/* Liens de navigation */}
          <div className="flex flex-1 items-center justify-center gap-1">
            <NavLinks links={navigationLinks} styles={styles} />
          </div>

          {/* Utilisateur */}
          <div className="group relative">
            <div
              tabIndex={0}
              className="flex cursor-pointer items-center gap-3 rounded-lg p-1.5 pl-3 transition-colors duration-300 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:hover:bg-zinc-800"
            >
              <div className="flex flex-col text-right leading-tight">
                <span className="max-w-[140px] truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {user.name}
                </span>
                <span className="max-w-[140px] truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {user.email}
                </span>
              </div>
              <Avatar user={mobileUser} solid={styles.solid} />
            </div>

            {/* Menu : le padding haut (et non une marge) évite de perdre le survol en descendant la souris */}
            <div className="invisible absolute right-0 top-full z-50 w-64 pt-2 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                <div className="px-1">
                  <div className="truncate font-medium text-zinc-900 dark:text-zinc-50">{user.name}</div>
                  <div className="truncate text-sm text-zinc-500 dark:text-zinc-400">{user.email}</div>
                  <div className={`mt-1 text-sm font-medium transition-colors duration-300 ${styles.tone}`}>
                    {currentRole.label}
                  </div>
                </div>

                <div className="mt-3 space-y-1 border-t border-zinc-200 pt-3 dark:border-zinc-700">
                  <Link
                    href="/profile"
                    className="block rounded-lg px-2 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-300 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-50"
                  >
                    Modifier le profil
                  </Link>
                  <LogoutButton />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------- Mobile ------------------------------- */}
        <div className="flex h-14 items-center justify-between gap-3 lg:hidden">
          <Link href="/" className="flex-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400">
            <img
              src="/logo.png"
              className="w-[70px] transition-all duration-300 dark:brightness-0 dark:invert"
              alt="cx"
            />
          </Link>

          <MobileMenu
            navigationLinks={navigationLinks}
            user={mobileUser}
            styles={{ solid: styles.solid, tone: styles.tone }}
            currentRole={currentRole}
          />
        </div>
      </div>

      {/* Barre de statut privilégiée */}
      {user.privileged && (
        <div className="border-t border-amber-200 bg-amber-50 transition-colors duration-300 dark:border-amber-900 dark:bg-amber-950">
          <div className="mx-auto px-3 py-1 sm:px-4 lg:px-6">
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-300">
              <RoleIcon role="admin" className="h-3 w-3" />
              <span>Accès privilégié</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
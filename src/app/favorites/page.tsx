// // app/favorites/page.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { useAuth } from '@/hooks/useAuth'
// import { getUserFavorites, FavoriteTFC } from '@/lib/favorites'
// import { useRouter } from 'next/navigation'
// import { 
//   FaThumbtack, 
//   FaUserGraduate, 
//   FaUniversity, 
//   FaCalendarAlt, 
//   FaStar,
//   FaRegSadTear,
//   FaSearch
// } from 'react-icons/fa'
// import { motion } from 'framer-motion'

// export default function FavoritesPage() {
//   const { user, loading: sessionLoading } = useAuth()
//   const router = useRouter()
//   const [favorites, setFavorites] = useState<FavoriteTFC[]>([])
//   const [loading, setLoading] = useState(true)
//   const [searchTerm, setSearchTerm] = useState('')

//   useEffect(() => {
//     if (!sessionLoading && !user) {
//       router.push('/auth/login?redirect=/favorites')
//       return
//     }

//     if (user) {
//       loadFavorites()
//     }
//   }, [user, sessionLoading])

//   const loadFavorites = async () => {
//     if (!user) return
    
//     try {
//       setLoading(true)
//       const userFavorites = await getUserFavorites(user.id)
//       setFavorites(userFavorites)
//     } catch (error) {
//       console.error('Erreur chargement favoris:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Filtrer les favoris selon la recherche
//   const filteredFavorites = favorites.filter(fav => 
//     fav.tfc?.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     fav.tfc?.auteur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     fav.tfc?.faculte_nom?.toLowerCase().includes(searchTerm.toLowerCase())
//   )

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('fr-FR', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     })
//   }

//   if (sessionLoading || loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
//         <div className="max-w-6xl mx-auto px-4">
//           <div className="animate-pulse space-y-6">
//             <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-8"></div>
//             {[...Array(3)].map((_, i) => (
//               <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
//                 <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
//                   <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
//       <div className="max-w-6xl mx-auto px-4">
//         {/* En-tête */}
//         <div className="mb-8">
//           <div className="flex items-center space-x-3 mb-2">
//             <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
//               <FaThumbtack size={24} />
//             </div>
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//               Mes TFC Favoris
//             </h1>
//           </div>
//           <p className="text-gray-600 dark:text-gray-400">
//             Retrouvez tous les travaux que vous avez épinglés pour consultation ultérieure
//           </p>
//         </div>

//         {/* Statistiques */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//           <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
//             <div className="flex items-center space-x-3">
//               <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
//                 <FaThumbtack size={16} />
//               </div>
//               <div>
//                 <div className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {favorites.length}
//                 </div>
//                 <div className="text-sm text-gray-500 dark:text-gray-400">
//                   Total favoris
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Barre de recherche */}
//         <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
//           <div className="relative">
//             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Rechercher dans vos favoris..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//         </div>

//         {/* Liste des favoris */}
//         {filteredFavorites.length === 0 ? (
//           <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
//             <FaRegSadTear size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
//             <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
//               {searchTerm ? 'Aucun favori trouvé' : 'Aucun favori pour le moment'}
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
//               {searchTerm 
//                 ? 'Aucun de vos favoris ne correspond à votre recherche.'
//                 : 'Commencez à épingler des TFC qui vous intéressent pour les retrouver facilement ici.'
//               }
//             </p>
//             {!searchTerm && (
//               <button
//                 onClick={() => router.push('/explorer')}
//                 className="px-6 py-2 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
//               >
//                 Explorer les TFC
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {filteredFavorites.map((favorite, index) => (
//               <motion.div
//                 key={favorite.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//                 className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600 transition-colors group cursor-pointer"
//                 onClick={() => router.push(`/tfc/${favorite.tfc_id}`)}
//               >
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center space-x-2 mb-2">
//                       <FaThumbtack className="text-yellow-500 dark:text-yellow-400 transform -rotate-45" />
//                       <span className="text-sm text-yellow-600 dark:text-yellow-400">
//                         Épinglé le {formatDate(favorite.pinned_at)}
//                       </span>
//                     </div>
                    
//                     <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
//                       {favorite.tfc?.titre}
//                     </h3>

//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
//                       <div className="flex items-center space-x-2">
//                         <FaUserGraduate className="text-gray-400 flex-shrink-0" />
//                         <span className="text-gray-600 dark:text-gray-400">
//                           {favorite.tfc?.auteur}
//                         </span>
//                       </div>

//                       <div className="flex items-center space-x-2">
//                         <FaUniversity className="text-gray-400 flex-shrink-0" />
//                         <span className="text-gray-600 dark:text-gray-400">
//                           {favorite.tfc?.faculte_nom || 'Non spécifié'}
//                         </span>
//                       </div>

//                       <div className="flex items-center space-x-2">
//                         <FaCalendarAlt className="text-gray-400 flex-shrink-0" />
//                         <span className="text-gray-600 dark:text-gray-400">
//                           {favorite.tfc?.annee || 'Non spécifié'}
//                         </span>
//                       </div>
//                     </div>

//                     {favorite.tfc?.note && (
//                       <div className="flex items-center space-x-2 mt-3">
//                         <FaStar className="text-yellow-500 dark:text-yellow-400" />
//                         <span className="font-semibold text-gray-900 dark:text-white">
//                           {favorite.tfc.note}/20
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {favorite.notes && (
//                   <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
//                     <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                       Vos notes :
//                     </div>
//                     <div className="text-gray-600 dark:text-gray-400 text-sm">
//                       {favorite.notes}
//                     </div>
//                   </div>
//                 )}
//               </motion.div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// app/favorites/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getUserFavorites, FavoriteTFC } from '@/lib/favorites'
import { useRouter } from 'next/navigation'
import { 
  FaThumbtack, 
  FaUserGraduate, 
  FaUniversity, 
  FaCalendarAlt, 
  FaStar,
  FaRegSadTear,
  FaSearch
} from 'react-icons/fa'
import { motion } from 'framer-motion'

// Constantes de design (identiques à la page TFC)
const CARD = 'rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
const FOCUS = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-500'

// Couleur primaire : bleu
const PRIMARY_TEXT = 'text-blue-600 dark:text-blue-400'
const PRIMARY_BG = 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500'

export default function FavoritesPage() {
  const { user, loading: sessionLoading } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteTFC[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!sessionLoading && !user) {
      router.push('/auth/login?redirect=/favorites')
      return
    }

    if (user) {
      loadFavorites()
    }
  }, [user, sessionLoading])

  const loadFavorites = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const userFavorites = await getUserFavorites(user.id)
      setFavorites(userFavorites)
    } catch (error) {
      console.error('Erreur chargement favoris:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les favoris selon la recherche
  const filteredFavorites = favorites.filter(fav => 
    fav.tfc?.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fav.tfc?.auteur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fav.tfc?.faculte_nom?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-64 mb-8"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`${CARD} p-6`}>
                <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400">
              <FaThumbtack size={18} />
            </div>
            <h1 className="text-xl md:text-2xl font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
              Mes TFC Favoris
            </h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Retrouvez tous les travaux que vous avez épinglés pour consultation ultérieure
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className={`${CARD} p-4 transition-colors duration-200`}>
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <FaThumbtack size={16} />
              </div>
              <div>
                <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {favorites.length}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  Total favoris
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className={`${CARD} p-4 mb-6 transition-colors duration-200`}>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={14} />
            <input
              type="text"
              placeholder="Rechercher dans vos favoris..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 transition-colors ${FOCUS}`}
            />
          </div>
        </div>

        {/* Liste des favoris */}
        {filteredFavorites.length === 0 ? (
          <div className={`${CARD} text-center py-16 px-6`}>
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                <FaRegSadTear className="h-5 w-5" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
              {searchTerm ? 'Aucun favori trouvé' : 'Aucun favori pour le moment'}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? 'Aucun de vos favoris ne correspond à votre recherche.'
                : 'Commencez à épingler des TFC qui vous intéressent pour les retrouver facilement ici.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push('/tfc')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors text-white ${PRIMARY_BG} ${FOCUS}`}
              >
                Explorer les TFC
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFavorites.map((favorite, index) => (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${CARD} p-6 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors group cursor-pointer`}
                onClick={() => router.push(`/tfc/${favorite.tfc_id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaThumbtack className="text-amber-500 dark:text-amber-400 transform -rotate-45" size={14} />
                      <span className="text-sm text-amber-600 dark:text-amber-400">
                        Épinglé le {formatDate(favorite.pinned_at)}
                      </span>
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-semibold mb-3 text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {favorite.tfc?.titre}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <FaUserGraduate className={`flex-shrink-0 ${PRIMARY_TEXT}`} />
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {favorite.tfc?.auteur}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <FaUniversity className={`flex-shrink-0 ${PRIMARY_TEXT}`} />
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {favorite.tfc?.faculte_nom || 'Non spécifié'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="flex-shrink-0 text-amber-500 dark:text-amber-400" />
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {favorite.tfc?.annee || 'Non spécifié'}
                        </span>
                      </div>
                    </div>

                    {favorite.tfc?.note && (
                      <div className="flex items-center space-x-2 mt-3">
                        <FaStar className="text-amber-500 dark:text-amber-400" />
                        <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                          {favorite.tfc.note}/20
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {favorite.notes && (
                  <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Vos notes :
                    </div>
                    <div className="text-zinc-600 dark:text-zinc-400 text-sm">
                      {favorite.notes}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
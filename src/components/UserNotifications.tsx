
// // components/UserNotifications.tsx
// 'use client'

// import { useState, useEffect, useCallback, useRef } from 'react'
// import { Bell, X, Check, Info, CheckCircle, AlertTriangle, AlertCircle, RefreshCw, Trash2 } from 'lucide-react'
// import { BellIcon } from '@heroicons/react/24/outline'

// interface Notification {
//   id: number
//   title: string
//   message: string
//   type: 'info' | 'warning' | 'success' | 'error' | 'system'
//   priority: 'low' | 'normal' | 'high' | 'urgent'
//   action_url?: string
//   action_label?: string
//   created_at: string
// }

// export default function UserNotifications() {
//   const [notifications, setNotifications] = useState<Notification[]>([])
//   const [unreadCount, setUnreadCount] = useState(0)
//   const [isOpen, setIsOpen] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string>('')
//   const [lastFetch, setLastFetch] = useState<number>(0)
  
//   const dropdownRef = useRef<HTMLDivElement>(null)
//   const buttonRef = useRef<HTMLButtonElement>(null)

//   // Fermeture au clic extérieur
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current && 
//         !dropdownRef.current.contains(event.target as Node) &&
//         buttonRef.current && 
//         !buttonRef.current.contains(event.target as Node)
//       ) {
//         setIsOpen(false)
//       }
//     }

//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside)
//       // Empêcher le scroll du body quand le dropdown est ouvert
//       document.body.style.overflow = 'hidden'
//     } else {
//       document.body.style.overflow = 'unset'
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside)
//       document.body.style.overflow = 'unset'
//     }
//   }, [isOpen])

//   const fetchNotifications = useCallback(async (force = false) => {
//     const now = Date.now()
    
//     // OPTIMISATION : Ne recharge que si forcé ou après 1 heure
//     if (!force && (now - lastFetch) < 3600000) { // 1 heure = 3600000 ms
//       console.log('⏰ Cache encore valide, pas de rechargement')
//       return
//     }

//     try {
//       setLoading(true)
//       setError('')
//       console.time('🔄 Chargement notifications')
      
//       const response = await fetch('/api/user/notifications', {
//         credentials: 'include',
//         headers: {
//           'Cache-Control': 'no-cache'
//         }
//       })
      
//       console.timeEnd('🔄 Chargement notifications')
      
//       if (response.ok) {
//         const data = await response.json()
//         console.log('✅ Données reçues:', data.notifications?.length, 'notifications')
        
//         setNotifications(data.notifications || [])
//         setUnreadCount(data.unreadCount || 0)
//         setLastFetch(now) // Mettre à jour le timestamp
//       } else if (response.status === 401) {
//         setError('Non authentifié')
//       } else {
//         const errorData = await response.json()
//         setError(errorData.error || 'Erreur de chargement')
//       }
//     } catch (error) {
//       console.error('❌ Erreur fetch:', error)
//       setError('Erreur de connexion')
//     } finally {
//       setLoading(false)
//     }
//   }, [lastFetch])

//   // OPTIMISATION : Chargement uniquement au premier rendu
//   useEffect(() => {
//     console.log('🎯 Premier chargement des notifications')
//     fetchNotifications(true) // Force le premier chargement
//   }, []) // Empty dependency array = exécuté une seule fois

//   const markAsRead = async (notificationId: number) => {
//     try {
//       const response = await fetch('/api/user/notifiications', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//         body: JSON.stringify({ notificationId })
//       })

//       if (response.ok) {
//         // Mise à jour locale sans recharger l'API
//         setNotifications(prev => 
//           prev.filter(notif => notif.id !== notificationId)
//         )
//         setUnreadCount(prev => Math.max(0, prev - 1))
//       }
//     } catch (error) {
//       console.error('Erreur marquage comme lu:', error)
//     }
//   }

//   const markAllAsRead = async () => {
//     try {
//       const response = await fetch('/api/user/notifications', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//         body: JSON.stringify({ markAll: true })
//       })

//       if (response.ok) {
//         setNotifications([])
//         setUnreadCount(0)
//       }
//     } catch (error) {
//       console.error('Erreur marquage tout comme lu:', error)
//     }
//   }

//   const handleOpen = () => {
//     setIsOpen(true)
//     // OPTIMISATION : Recharge seulement si les données ont plus de 5 minutes
//     const now = Date.now()
//     if ((now - lastFetch) > 300000) { // 5 minutes = 300000 ms
//       fetchNotifications(true)
//     }
//   }

//   const getIcon = (type: string) => {
//     switch (type) {
//       case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />
//       case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
//       case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />
//       case 'system': return <Info className="w-5 h-5 text-blue-500" />
//       default: return <Info className="w-5 h-5 text-gray-500" />
//     }
//   }

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case 'urgent': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
//       case 'high': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20'
//       case 'normal': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
//       case 'low': return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20'
//       default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20'
//     }
//   }

//   return (
//     <div className="relative">
//       <button
//         ref={buttonRef}
//         onClick={handleOpen}
//         className="relative p-0.5 -translate-x-1 translate-y-0.5 text-gray-600  dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
//       >
//         <BellIcon className="w-6 h-6" />
//         {unreadCount > 0 && (
//           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//             {unreadCount > 9 ? '9+' : unreadCount}
//           </span>
//         )}
//       </button>

//       {/* Overlay blur */}
//       {isOpen && (
//         <div className="sm z-40 transition-opacity duration-200" />
//       )}

//       {/* Dropdown notifications */}
//       {isOpen && (
//         <div
//           ref={dropdownRef}
//           className="absolute translate-x-[-0%] translate-y-[10%] left-[-600%]  top-[100%] mt-2 w-max bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 transform transition-all duration-200 ease-out"
//           style={{
//             transform: 'translateY(8px)',
//             animation: 'slideDown 0.2s ease-out'
//           }}
//         >
//           {/* Header */}
//           <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
//             <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => fetchNotifications(true)}
//                 className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
//                 title="Actualiser manuellement"
//               >
//                 <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//               </button>
//               {unreadCount > 0 && (
//                 <button
//                   onClick={markAllAsRead}
//                   className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
//                 >
//                   <Trash2/>
//                 </button>
//               )}
//               <button
//                 onClick={() => setIsOpen(false)}
//                 className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>
//           </div>

//           {/* Notifications list */}
//           <div className="max-h-96 overflow-y-auto">
//             {error && (
//               <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm border-b border-red-200 dark:border-red-800">
//                 {error}
//               </div>
//             )}
            
//             {loading ? (
//               <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-3">
//                 <RefreshCw className="w-6 h-6 animate-spin" />
//                 <span>Chargement des notifications...</span>
//               </div>
//             ) : notifications.length === 0 ? (
//               <div className="p-8 text-center text-gray-500 dark:text-gray-400">
//                 <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
//                 <p className="font-medium">Aucune notification</p>
//                 <p className="text-sm mt-1">Vous êtes à jour !</p>
//                 <div className="text-xs mt-4 text-gray-400 dark:text-gray-500">
//                   Dernière mise à jour: {lastFetch ? new Date(lastFetch).toLocaleTimeString('fr-FR') : 'Jamais'}
//                 </div>
//               </div>
//             ) : (
//               <>
//                 {notifications.map(notification => (
//                   <div
//                     key={notification.id}
//                     className={`p-4 border-b  border-gray-100 dark:border-gray-700 ${getPriorityColor(notification.priority)} border-l-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50`}
//                   >
//                     <div className="flex gap-3">
//                       <div className="flex-shrink-0 mt-1">
//                         {getIcon(notification.type)}
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <h4 className="font-medium text-gray-900 dark:text-white text-sm">
//                           {notification.title}
//                         </h4>
//                         <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
//                           {notification.message}
//                         </p>
//                         <div className="flex justify-between items-center mt-2">
//                           <span className="text-xs text-gray-500 dark:text-gray-400">
//                             {new Date(notification.created_at).toLocaleDateString('fr-FR', {
//                               day: 'numeric',
//                               month: 'short',
//                               year: 'numeric',
//                               hour: '2-digit',
//                               minute: '2-digit'
//                             })}
//                           </span>
//                           <div className="flex gap-2">
//                             {notification.action_url && (
//                               <a
//                                 href={notification.action_url}
//                                 className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
//                                 onClick={(e) => e.stopPropagation()}
//                               >
//                                 {notification.action_label || 'Voir'}
//                               </a>
//                             )}
//                             <button
//                               onClick={() => markAsRead(notification.id)}
//                               className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
//                               title="Marquer comme lu"
//                             >
//                               <Check className="w-3 h-3" />
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//                 <div className="p-3 text-center text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20">
//                   Dernière mise à jour: {new Date(lastFetch).toLocaleTimeString('fr-FR')}
//                 </div>
//               </>
//             )}
//           </div>

        
//         </div>
//       )}

//       {/* Styles d'animation */}
//       <style jsx>{`
//         @keyframes slideDown {
//           from {
//             opacity: 0;
//             transform: translateY(-8px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(8px);
//           }
//         }
//       `}</style>
//     </div>
//   )
// }
// components/UserNotifications.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Bell, X, Check, Info, CheckCircle, AlertTriangle, AlertCircle, RefreshCw, Trash2 } from 'lucide-react'
import { BellIcon } from '@heroicons/react/24/outline'

interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error' | 'system'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  action_url?: string
  action_label?: string
  created_at: string
}

export default function UserNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [lastFetch, setLastFetch] = useState<number>(0)
  const [expandedNotifications, setExpandedNotifications] = useState<Set<number>>(new Set())
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Fermeture au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Empêcher le scroll du body quand le dropdown est ouvert
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const fetchNotifications = useCallback(async (force = false) => {
    const now = Date.now()
    
    // OPTIMISATION : Ne recharge que si forcé ou après 1 heure
    if (!force && (now - lastFetch) < 3600000) { // 1 heure = 3600000 ms
      console.log('⏰ Cache encore valide, pas de rechargement')
      return
    }

    try {
      setLoading(true)
      setError('')
      console.time('🔄 Chargement notifications')
      
      const response = await fetch('/api/user/notifications', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      console.timeEnd('🔄 Chargement notifications')
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Données reçues:', data.notifications?.length, 'notifications')
        
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
        setLastFetch(now) // Mettre à jour le timestamp
      } else if (response.status === 401) {
        setError('Non authentifié')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur de chargement')
      }
    } catch (error) {
      console.error('❌ Erreur fetch:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }, [lastFetch])

  // OPTIMISATION : Chargement uniquement au premier rendu
  useEffect(() => {
    console.log('🎯 Premier chargement des notifications')
    fetchNotifications(true) // Force le premier chargement
  }, []) // Empty dependency array = exécuté une seule fois

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationId })
      })

      if (response.ok) {
        // Mise à jour locale sans recharger l'API
        setNotifications(prev => 
          prev.filter(notif => notif.id !== notificationId)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
        // Retirer aussi de l'état expanded
        setExpandedNotifications(prev => {
          const newSet = new Set(prev)
          newSet.delete(notificationId)
          return newSet
        })
      }
    } catch (error) {
      console.error('Erreur marquage comme lu:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ markAll: true })
      })

      if (response.ok) {
        setNotifications([])
        setUnreadCount(0)
        setExpandedNotifications(new Set())
      }
    } catch (error) {
      console.error('Erreur marquage tout comme lu:', error)
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    // OPTIMISATION : Recharge seulement si les données ont plus de 5 minutes
    const now = Date.now()
    if ((now - lastFetch) > 300000) { // 5 minutes = 300000 ms
      fetchNotifications(true)
    }
  }

  const toggleExpand = (notificationId: number) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev)
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId)
      } else {
        newSet.add(notificationId)
      }
      return newSet
    })
  }

  const truncateMessage = (message: string, maxLength: number = 130): string => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'system': return <Info className="w-5 h-5 text-blue-500" />
      default: return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
      case 'high': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20'
      case 'normal': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
      case 'low': return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20'
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="relative p-0.5 -translate-x-1 translate-y-0.5 text-gray-600 dark:text-gray-100 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Overlay blur */}
      {isOpen && (
        <div className="fixed inset-0 bg z-40 transition-opacity duration-200" />
      )}

      {/* Dropdown notifications */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed md:absolute left-1/2 md:left-1/2 md:right-0 top-[250%] md:top-full transform -translate-x-1/2 md:translate-x-0 -translate-y-1/2 md:translate-y-2 mt-2 w-[95vw] md:w-96 max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <div className="flex gap-2">
              <button
                onClick={() => fetchNotifications(true)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Actualiser manuellement"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Tout marquer comme lu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 bg-gray-600/10 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Notifications list */}
          <div className="flex-1 overflow-y-auto">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm border-b border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span>Chargement des notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="font-medium">Aucune notification</p>
                <p className="text-sm mt-1">Vous êtes à jour !</p>
                <div className="text-xs mt-4 text-gray-400 dark:text-gray-500">
                  Dernière mise à jour: {lastFetch ? new Date(lastFetch).toLocaleTimeString('fr-FR') : 'Jamais'}
                </div>
              </div>
            ) : (
              <>
                {notifications.map(notification => {
                  const isExpanded = expandedNotifications.has(notification.id)
                  const shouldTruncate = notification.message.length > 120
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 ${getPriorityColor(notification.priority)} border-l-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                            {notification.title}
                          </h4>
                          
                          {/* Message avec truncate */}
                          <div className="text-gray-600 dark:text-gray-300 text-sm">
                            <p className={isExpanded ? '' : 'line-clamp-3'}>
                              {isExpanded ? notification.message : truncateMessage(notification.message)}
                            </p>
                            
                            {/* Bouton "Voir plus/moins" */}
                            {shouldTruncate && (
                              <button
                                onClick={() => toggleExpand(notification.id)}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors mt-1 font-medium"
                              >
                                {isExpanded ? 'Voir moins' : 'Voir plus'}
                              </button>
                            )}
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <div className="flex gap-2">
                              {notification.action_url && (
                                <a
                                  href={notification.action_url}
                                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {notification.action_label || 'Voir'}
                                </a>
                              )}
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                                title="Marquer comme lu"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {/* Footer avec timestamp */}
                <div className="p-3 text-center text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20">
                  Dernière mise à jour: {new Date(lastFetch).toLocaleTimeString('fr-FR')}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
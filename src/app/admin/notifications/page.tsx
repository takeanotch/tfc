
// // // app/admin/notifications/page.tsx
// // 'use client'

// // import { useState, useEffect } from 'react'
// // import { 
// //   Send, 
// //   Users, 
// //   Search, 
// //   User, 
// //   Building, 
// //   Info, 
// //   Bell, 
// //   Trash2,
// //   Eye,
// //   Filter,
// //   Calendar,
// //   AlertTriangle,
// //   CheckCircle,
// //   AlertCircle,
// //   MessageCircle
// // } from 'lucide-react'

// // interface User {
// //   id: string
// //   username: string
// //   name: string
// //   email: string
// //   role: string
// //   departement?: string
// // }

// // interface Notification {
// //   id: number
// //   title: string
// //   message: string
// //   type: 'info' | 'warning' | 'success' | 'error' | 'system'
// //   priority: 'low' | 'normal' | 'high' | 'urgent'
// //   user_id: string
// //   created_by: string
// //   is_read: boolean
// //   expires_at: string | null
// //   action_url?: string
// //   action_label?: string
// //   created_at: string
// //   users?: {
// //     name: string
// //     email: string
// //   }
// // }

// // interface NotificationForm {
// //   title: string
// //   message: string
// //   type: 'info' | 'warning' | 'success' | 'error' | 'system'
// //   priority: 'low' | 'normal' | 'high' | 'urgent'
// //   targetType: 'all' | 'role' | 'department' | 'user'
// //   targetRole?: string
// //   targetDepartment?: string
// //   targetUserId?: string
// //   expiresIn: number
// //   actionUrl?: string
// //   actionLabel?: string
// // }

// // type TabType = 'create' | 'manage'

// // export default function AdminNotificationsPage() {
// //   const [activeTab, setActiveTab] = useState<TabType>('create')
// //   const [users, setUsers] = useState<User[]>([])
// //   const [filteredUsers, setFilteredUsers] = useState<User[]>([])
// //   const [notifications, setNotifications] = useState<Notification[]>([])
// //   const [searchTerm, setSearchTerm] = useState('')
// //   const [loading, setLoading] = useState(false)
// //   const [sending, setSending] = useState(false)
// //   const [message, setMessage] = useState('')

// //   const [form, setForm] = useState<NotificationForm>({
// //     title: '',
// //     message: '',
// //     type: 'info',
// //     priority: 'normal',
// //     targetType: 'all',
// //     expiresIn: 24,
// //     actionUrl: '',
// //     actionLabel: ''
// //   })

// //   useEffect(() => {
// //     fetchUsers()
// //     if (activeTab === 'manage') {
// //       fetchNotifications()
// //     }
// //   }, [activeTab])

// //   useEffect(() => {
// //     if (searchTerm) {
// //       const filtered = users.filter(u =>
// //         u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //         u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //         u.username.toLowerCase().includes(searchTerm.toLowerCase())
// //       )
// //       setFilteredUsers(filtered)
// //     } else {
// //       setFilteredUsers(users.slice(0, 10))
// //     }
// //   }, [searchTerm, users])

// //   const fetchUsers = async () => {
// //     try {
// //       setLoading(true)
// //       const response = await fetch('/api/admin/users')
// //       if (response.ok) {
// //         const data = await response.json()
// //         setUsers(data.users)
// //         setFilteredUsers(data.users.slice(0, 10))
// //       }
// //     } catch (error) {
// //       console.error('Erreur chargement utilisateurs:', error)
// //       setMessage('Erreur lors du chargement des utilisateurs')
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const fetchNotifications = async () => {
// //     try {
// //       const response = await fetch('/api/admin/all-notifications')
// //       if (response.ok) {
// //         const data = await response.json()
// //         setNotifications(data.notifications || [])
// //       }
// //     } catch (error) {
// //       console.error('Erreur chargement notifications:', error)
// //     }
// //   }

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault()
    
// //     if (!form.title || !form.message) {
// //       setMessage('Veuillez remplir le titre et le message')
// //       return
// //     }

// //     try {
// //       setSending(true)
// //       setMessage('')

// //       const response = await fetch('/api/admin/notifications', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(form)
// //       })

// //       if (response.ok) {
// //         setMessage('Notification envoyée avec succès!')
// //         setForm({
// //           title: '',
// //           message: '',
// //           type: 'info',
// //           priority: 'normal',
// //           targetType: 'all',
// //           expiresIn: 24,
// //           actionUrl: '',
// //           actionLabel: ''
// //         })
// //       } else {
// //         const error = await response.json()
// //         setMessage(error.error || 'Erreur lors de l\'envoi')
// //       }
// //     } catch (error) {
// //       console.error('Erreur envoi notification:', error)
// //       setMessage('Erreur lors de l\'envoi de la notification')
// //     } finally {
// //       setSending(false)
// //     }
// //   }

// //   const deleteNotification = async (id: number) => {
// //     if (!confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) return

// //     try {
// //       const response = await fetch(`/api/admin/notifications/${id}`, {
// //         method: 'DELETE'
// //       })

// //       if (response.ok) {
// //         setNotifications(prev => prev.filter(notif => notif.id !== id))
// //         setMessage('Notification supprimée avec succès')
// //       }
// //     } catch (error) {
// //       console.error('Erreur suppression:', error)
// //       setMessage('Erreur lors de la suppression')
// //     }
// //   }

// //   const getTargetDescription = () => {
// //     switch (form.targetType) {
// //       case 'all':
// //         return 'Tous les utilisateurs'
// //       case 'role':
// //         return `Rôle: ${form.targetRole}`
// //       case 'department':
// //         return `Département: ${form.targetDepartment}`
// //       case 'user':
// //         const targetUser = users.find(u => u.id === form.targetUserId)
// //         return `Utilisateur: ${targetUser?.name || form.targetUserId}`
// //       default:
// //         return ''
// //     }
// //   }

// //   const getTypeIcon = (type: string) => {
// //     switch (type) {
// //       case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
// //       case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
// //       case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
// //       case 'system': return <Info className="w-4 h-4 text-blue-500" />
// //       default: return <MessageCircle className="w-4 h-4 text-gray-500" />
// //     }
// //   }

// //   const getPriorityColor = (priority: string) => {
// //     switch (priority) {
// //       case 'urgent': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
// //       case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
// //       case 'normal': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
// //       case 'low': return 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
// //       default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
// //     }
// //   }

// //   const formatDate = (dateString: string) => {
// //     return new Date(dateString).toLocaleDateString('fr-FR', {
// //       day: 'numeric',
// //       month: 'short',
// //       year: 'numeric',
// //       hour: '2-digit',
// //       minute: '2-digit'
// //     })
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
// //       <div className="max-w-7xl mx-auto">
// //         {/* Header */}
// //         <div className="mb-8">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
// //                 Gestion des Notifications
// //               </h1>
// //               <p className="text-gray-600 dark:text-gray-400">
// //                 Créez et gérez les notifications des utilisateurs
// //               </p>
// //             </div>
// //             <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 border border-gray-200 dark:border-gray-700">
// //               <Bell className="w-5 h-5 text-blue-500" />
// //               <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
// //                 {notifications.length} notifications
// //               </span>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Message d'alerte */}
// //         {message && (
// //           <div className={`p-4 rounded-lg mb-6 ${
// //             message.includes('succès') 
// //               ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
// //               : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
// //           }`}>
// //             {message}
// //           </div>
// //         )}

// //         {/* Tabs */}
// //         <div className="mb-8">
// //           <div className="border-b border-gray-200 dark:border-gray-700">
// //             <nav className="-mb-px flex space-x-8">
// //               <button
// //                 onClick={() => setActiveTab('create')}
// //                 className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
// //                   activeTab === 'create'
// //                     ? 'border-blue-500 text-blue-600 dark:text-blue-400'
// //                     : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
// //                 }`}
// //               >
// //                 <Send className="w-4 h-4 inline mr-2" />
// //                 Créer 
// //               </button>
// //               <button
// //                 onClick={() => setActiveTab('manage')}
// //                 className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
// //                   activeTab === 'manage'
// //                     ? 'border-blue-500 text-blue-600 dark:text-blue-400'
// //                     : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
// //                 }`}
// //               >
// //                 <Eye className="w-4 h-4 inline mr-2" />
// //                 Gérer les notifications
// //               </button>
// //             </nav>
// //           </div>
// //         </div>

// //         {/* Tab Content */}
// //         {activeTab === 'create' ? (
// //           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
// //             {/* Formulaire d'envoi */}
// //             <div className="lg:col-span-2">
// //               <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
// //                 <div className="flex items-center gap-3 mb-6">
// //                   <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
// //                     <Send className="w-5 h-5 text-blue-500" />
// //                   </div>
// //                   <div>
// //                     <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
// //                       Nouvelle notification
// //                     </h2>
// //                     <p className="text-sm text-gray-600 dark:text-gray-400">
// //                       Remplissez les détails de la notification
// //                     </p>
// //                   </div>
// //                 </div>

// //                 <form onSubmit={handleSubmit} className="space-y-6">
// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                         Titre de la notification *
// //                       </label>
// //                       <input
// //                         type="text"
// //                         value={form.title}
// //                         onChange={(e) => setForm({ ...form, title: e.target.value })}
// //                         className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
// //                         placeholder="Titre important..."
// //                         required
// //                       />
// //                     </div>

// //                     <div className="grid grid-cols-2 gap-4">
// //                       <div>
// //                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                           Type
// //                         </label>
// //                         <select
// //                           value={form.type}
// //                           onChange={(e) => setForm({ ...form, type: e.target.value as any })}
// //                           className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
// //                         >
// //                           <option value="info">Information</option>
// //                           <option value="success">Succès</option>
// //                           <option value="warning">Avertissement</option>
// //                           <option value="error">Erreur</option>
// //                           <option value="system">Système</option>
// //                         </select>
// //                       </div>

// //                       <div>
// //                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                           Priorité
// //                         </label>
// //                         <select
// //                           value={form.priority}
// //                           onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
// //                           className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
// //                         >
// //                           <option value="low">Basse</option>
// //                           <option value="normal">Normale</option>
// //                           <option value="high">Haute</option>
// //                           <option value="urgent">Urgente</option>
// //                         </select>
// //                       </div>
// //                     </div>
// //                   </div>

// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                       Message *
// //                     </label>
// //                     <textarea
// //                       value={form.message}
// //                       onChange={(e) => setForm({ ...form, message: e.target.value })}
// //                       rows={4}
// //                       className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
// //                       placeholder="Décrivez le contenu de la notification..."
// //                       required
// //                     />
// //                   </div>

// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                       Destinataires
// //                     </label>
// //                     <select
// //                       value={form.targetType}
// //                       onChange={(e) => setForm({ ...form, targetType: e.target.value as any })}
// //                       className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white mb-4"
// //                     >
// //                       <option value="all">Tous les utilisateurs</option>
// //                       <option value="role">Par rôle</option>
// //                       <option value="department">Par département</option>
// //                       <option value="user">Utilisateur spécifique</option>
// //                     </select>

// //                     {form.targetType === 'role' && (
// //                       <select
// //                         value={form.targetRole}
// //                         onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
// //                         className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
// //                       >
// //                         <option value="">Sélectionnez un rôle</option>
// //                         <option value="student">Étudiant</option>
// //                         <option value="teacher">Enseignant</option>
// //                         <option value="admin">Administrateur</option>
// //                         <option value="alumni">Alumni</option>
// //                         <option value="check_in_admin">Responsable Check-in</option>
// //                       </select>
// //                     )}

// //                     {form.targetType === 'department' && (
// //                       <select
// //                         value={form.targetDepartment}
// //                         onChange={(e) => setForm({ ...form, targetDepartment: e.target.value })}
// //                         className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
// //                       >
// //                         <option value="">Sélectionnez un département</option>
// //                         <option value="Informatique">Informatique</option>
// //                         <option value="Sciences">Sciences</option>
// //                         <option value="Gestion">Gestion</option>
// //                         <option value="Administration">Administration</option>
// //                         <option value="Accueil">Accueil</option>
// //                       </select>
// //                     )}

// //                     {form.targetType === 'user' && (
// //                       <div>
// //                         <div className="relative">
// //                           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
// //                           <input
// //                             type="text"
// //                             value={searchTerm}
// //                             onChange={(e) => setSearchTerm(e.target.value)}
// //                             className="w-full pl-10 pr-3 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
// //                             placeholder="Rechercher un utilisateur..."
// //                           />
// //                         </div>
                        
// //                         <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
// //                           {filteredUsers.map(user => (
// //                             <div
// //                               key={user.id}
// //                               className={`p-3 border-b border-gray-100 dark:border-gray-600 cursor-pointer transition-colors ${
// //                                 form.targetUserId === user.id 
// //                                   ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
// //                                   : 'hover:bg-gray-50 dark:hover:bg-gray-600'
// //                               }`}
// //                               onClick={() => setForm({ ...form, targetUserId: user.id })}
// //                             >
// //                               <div className="font-medium text-sm text-gray-900 dark:text-white">{user.name}</div>
// //                               <div className="text-xs text-gray-500 dark:text-gray-400">
// //                                 {user.email} • {user.role}
// //                               </div>
// //                             </div>
// //                           ))}
// //                         </div>
// //                       </div>
// //                     )}
// //                   </div>

// //                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                         Lien d'action
// //                       </label>
// //                       <input
// //                         type="url"
// //                         value={form.actionUrl}
// //                         onChange={(e) => setForm({ ...form, actionUrl: e.target.value })}
// //                         className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
// //                         placeholder="https://..."
// //                       />
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                         Libellé du lien
// //                       </label>
// //                       <input
// //                         type="text"
// //                         value={form.actionLabel}
// //                         onChange={(e) => setForm({ ...form, actionLabel: e.target.value })}
// //                         className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
// //                         placeholder="Voir plus..."
// //                       />
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                         Expire dans
// //                       </label>
// //                       <select
// //                         value={form.expiresIn}
// //                         onChange={(e) => setForm({ ...form, expiresIn: parseInt(e.target.value) })}
// //                         className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
// //                       >
// //                         <option value={1}>1 heure</option>
// //                         <option value={6}>6 heures</option>
// //                         <option value={24}>24 heures</option>
// //                         <option value={168}>7 jours</option>
// //                         <option value={720}>30 jours</option>
// //                         <option value={0}>Jamais</option>
// //                       </select>
// //                     </div>
// //                   </div>

// //                   <button
// //                     type="submit"
// //                     disabled={sending}
// //                     className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
// //                   >
// //                     <Send className="w-5 h-5" />
// //                     {sending ? 'Envoi en cours...' : 'Envoyer la notification'}
// //                   </button>
// //                 </form>
// //               </div>
// //             </div>

// //             {/* Aperçu */}
// //             <div className="lg:col-span-1">
// //               <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
// //                 <div className="flex items-center gap-3 mb-6">
// //                   <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
// //                     <Eye className="w-5 h-5 text-purple-500" />
// //                   </div>
// //                   <div>
// //                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
// //                       Aperçu
// //                     </h3>
// //                     <p className="text-sm text-gray-600 dark:text-gray-400">
// //                       Visualisez votre notification
// //                     </p>
// //                   </div>
// //                 </div>
                
// //                 <div className="space-y-6">
// //                   <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
// //                     <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destinataires</h4>
// //                     <p className="text-sm text-gray-900 dark:text-white font-medium">{getTargetDescription()}</p>
// //                   </div>

// //                   {form.title && (
// //                     <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
// //                       <div className="flex gap-3">
// //                         {getTypeIcon(form.type)}
// //                         <div className="flex-1">
// //                           <h5 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
// //                             {form.title}
// //                           </h5>
// //                           {form.message && (
// //                             <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
// //                               {form.message}
// //                             </p>
// //                           )}
// //                           {form.actionUrl && (
// //                             <a href={form.actionUrl} className="text-blue-600 dark:text-blue-400 text-xs font-medium mt-2 inline-block hover:underline">
// //                               {form.actionLabel || 'Voir plus'} →
// //                             </a>
// //                           )}
// //                         </div>
// //                       </div>
// //                     </div>
// //                   )}

// //                   <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
// //                     <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Informations</h4>
// //                     <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
// //                       <p className="flex items-center gap-2">
// //                         <Bell className="w-3 h-3" />
// //                         Apparaîtra dans le panneau des notifications
// //                       </p>
// //                       <p className="flex items-center gap-2">
// //                         <Calendar className="w-3 h-3" />
// //                         {form.expiresIn > 0 ? `Expire dans ${form.expiresIn}h` : 'N\'expire jamais'}
// //                       </p>
// //                       <p className="flex items-center gap-2">
// //                         <Filter className="w-3 h-3" />
// //                         Mises à jour en temps réel
// //                       </p>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         ) : (
// //           /* Tab Gérer les notifications */
// //           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
// //             <div className="p-6 border-b border-gray-200 dark:border-gray-700">
// //               <div className="flex items-center justify-between">
// //                 <div className="flex items-center gap-3">
// //                   <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
// //                     <Eye className="w-5 h-5 text-green-500" />
// //                   </div>
// //                   <div>
// //                     <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
// //                       Notifications envoyées
// //                     </h2>
// //                     <p className="text-sm text-gray-600 dark:text-gray-400">
// //                       Gérez et surveillez toutes les notifications
// //                     </p>
// //                   </div>
// //                 </div>
// //                 <button
// //                   onClick={fetchNotifications}
// //                   className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm transition-colors"
// //                 >
// //                   Actualiser
// //                 </button>
// //               </div>
// //             </div>

// //             <div className="p-6">
// //               {notifications.length === 0 ? (
// //                 <div className="text-center py-12">
// //                   <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
// //                   <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
// //                     Aucune notification
// //                   </h3>
// //                   <p className="text-gray-500 dark:text-gray-400">
// //                     Aucune notification n'a été envoyée pour le moment.
// //                   </p>
// //                 </div>
// //               ) : (
// //                 <div className="space-y-4">
// //                   {notifications.map(notification => (
// //                     <div
// //                       key={notification.id}
// //                       className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
// //                     >
// //                       <div className="flex items-start justify-between">
// //                         <div className="flex-1">
// //                           <div className="flex items-center gap-3 mb-2">
// //                             {getTypeIcon(notification.type)}
// //                             <h3 className="font-semibold text-gray-900 dark:text-white">
// //                               {notification.title}
// //                             </h3>
// //                             <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
// //                               {notification.priority}
// //                             </span>
// //                           </div>
                          
// //                           <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
// //                             {notification.message}
// //                           </p>

// //                           <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
// //                             <span>Envoyé le {formatDate(notification.created_at)}</span>
// //                             <span>•</span>
// //                             <span className={notification.is_read ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}>
// //                               {notification.is_read ? 'Lu' : 'Non lu'}
// //                             </span>
// //                             {notification.expires_at && (
// //                               <>
// //                                 <span>•</span>
// //                                 <span>Expire le {formatDate(notification.expires_at)}</span>
// //                               </>
// //                             )}
// //                           </div>
// //                         </div>

// //                         <button
// //                           onClick={() => deleteNotification(notification.id)}
// //                           className="ml-4 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
// //                           title="Supprimer la notification"
// //                         >
// //                           <Trash2 className="w-4 h-4" />
// //                         </button>
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   )
// // }
// // app/admin/notifications/page.tsx
// 'use client'

// import { useState, useEffect, useCallback, useMemo, FormEvent } from 'react'
// import {
//   Send,
//   Search,
//   Eye,
//   Trash2,
//   Bell,
//   CalendarDays,
//   CheckCircle2,
//   AlertCircle,
//   AlertTriangle,
//   Info,
//   MessageCircle,
//   RefreshCw,
//   Target,
//   X,
//   Link2,
//   Clock,
//   Filter,
// } from 'lucide-react'
// import GenericTable, { Column, ActionConfig } from '@/components/GenericTable'

// /* -------------------------------------------------------------------------- */
// /*                                   Types                                    */
// /* -------------------------------------------------------------------------- */

// interface User {
//   id: string
//   username: string
//   name: string
//   email: string
//   role: string
//   departement?: string
// }

// interface Notification {
//   id: number
//   title: string
//   message: string
//   type: 'info' | 'warning' | 'success' | 'error' | 'system'
//   priority: 'low' | 'normal' | 'high' | 'urgent'
//   user_id: string
//   created_by: string
//   is_read: boolean
//   expires_at: string | null
//   action_url?: string
//   action_label?: string
//   created_at: string
//   users?: {
//     name: string
//     email: string
//   }
// }

// interface NotificationForm {
//   title: string
//   message: string
//   type: 'info' | 'warning' | 'success' | 'error' | 'system'
//   priority: 'low' | 'normal' | 'high' | 'urgent'
//   targetType: 'all' | 'role' | 'department' | 'user'
//   targetRole?: string
//   targetDepartment?: string
//   targetUserId?: string
//   expiresIn: number
//   actionUrl?: string
//   actionLabel?: string
// }

// type TabType = 'create' | 'manage'
// type Toast = { type: 'success' | 'error'; message: string } | null

// /* -------------------------------------------------------------------------- */
// /*                                 Constantes                                 */
// /* -------------------------------------------------------------------------- */

// const TYPE_OPTIONS: { value: NotificationForm['type']; label: string }[] = [
//   { value: 'info', label: 'Information' },
//   { value: 'success', label: 'Succès' },
//   { value: 'warning', label: 'Avertissement' },
//   { value: 'error', label: 'Erreur' },
//   { value: 'system', label: 'Système' },
// ]

// const PRIORITY_OPTIONS: { value: NotificationForm['priority']; label: string }[] = [
//   { value: 'low', label: 'Basse' },
//   { value: 'normal', label: 'Normale' },
//   { value: 'high', label: 'Haute' },
//   { value: 'urgent', label: 'Urgente' },
// ]

// const ROLE_OPTIONS = [
//   { value: 'student', label: 'Étudiant' },
//   { value: 'teacher', label: 'Enseignant' },
//   { value: 'admin', label: 'Administrateur' },
//   { value: 'alumni', label: 'Alumni' },
//   { value: 'check_in_admin', label: 'Responsable Check-in' },
// ]

// const DEPARTMENT_OPTIONS = [
//   'Informatique',
//   'Sciences',
//   'Gestion',
//   'Administration',
//   'Accueil',
// ]

// const EXPIRES_OPTIONS = [
//   { value: 1, label: '1 heure' },
//   { value: 6, label: '6 heures' },
//   { value: 24, label: '24 heures' },
//   { value: 168, label: '7 jours' },
//   { value: 720, label: '30 jours' },
//   { value: 0, label: 'Jamais' },
// ]

// const EMPTY_FORM: NotificationForm = {
//   title: '',
//   message: '',
//   type: 'info',
//   priority: 'normal',
//   targetType: 'all',
//   expiresIn: 24,
//   actionUrl: '',
//   actionLabel: '',
// }

// /* -------------------------------------------------------------------------- */
// /*                                 Helpers                                    */
// /* -------------------------------------------------------------------------- */

// function formatDate(dateString: string): string {
//   return new Date(dateString).toLocaleDateString('fr-FR', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//   })
// }

// function getTypeIcon(type: string) {
//   switch (type) {
//     case 'success':
//       return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
//     case 'warning':
//       return <AlertTriangle className="h-4 w-4 text-amber-500" />
//     case 'error':
//       return <AlertCircle className="h-4 w-4 text-rose-500" />
//     case 'system':
//       return <Info className="h-4 w-4 text-sky-500" />
//     default:
//       return <MessageCircle className="h-4 w-4 text-zinc-500" />
//   }
// }

// function getPriorityTone(priority: string): string {
//   switch (priority) {
//     case 'urgent':
//       return 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20'
//     case 'high':
//       return 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20'
//     case 'normal':
//       return 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20'
//     case 'low':
//     default:
//       return 'bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700'
//   }
// }

// /* -------------------------------------------------------------------------- */
// /*                              Composants UI                                 */
// /* -------------------------------------------------------------------------- */

// const inputClass =
//   'w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:ring-teal-400 dark:focus:border-teal-400 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm outline-none transition-colors'

// const labelClass =
//   'block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2'

// const primaryBtnClass =
//   'inline-flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 px-4 h-10 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed'

// function ToastBanner({ toast, onClose }: { toast: Toast; onClose: () => void }) {
//   if (!toast) return null
//   const isSuccess = toast.type === 'success'
//   return (
//     <div
//       role="alert"
//       className={`mb-6 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
//         isSuccess
//           ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
//           : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20'
//       }`}
//     >
//       {isSuccess ? (
//         <CheckCircle2 className="h-4 w-4 shrink-0" />
//       ) : (
//         <AlertCircle className="h-4 w-4 shrink-0" />
//       )}
//       <span className="flex-1 break-words">{toast.message}</span>
//       <button
//         onClick={onClose}
//         className="shrink-0 rounded p-1 hover:bg-black/5 dark:hover:bg-white/10"
//         aria-label="Fermer"
//       >
//         <X className="h-4 w-4" />
//       </button>
//     </div>
//   )
// }

// /* -------------------------------------------------------------------------- */
// /*                       Composant principal (export default)                 */
// /* -------------------------------------------------------------------------- */

// export default function AdminNotificationsPage() {
//   const [activeTab, setActiveTab] = useState<TabType>('create')
//   const [users, setUsers] = useState<User[]>([])
//   const [notifications, setNotifications] = useState<Notification[]>([])
//   const [searchTerm, setSearchTerm] = useState('')
//   const [loadingUsers, setLoadingUsers] = useState(false)
//   const [loadingNotifications, setLoadingNotifications] = useState(false)
//   const [sending, setSending] = useState(false)
//   const [toast, setToast] = useState<Toast>(null)
//   const [form, setForm] = useState<NotificationForm>(EMPTY_FORM)

//   const showToast = useCallback(
//     (message: string, type: 'success' | 'error' = 'success') => {
//       setToast({ message, type })
//       setTimeout(() => setToast(null), 5000)
//     },
//     []
//   )

//   /* ----------------------------- Fetch API ----------------------------- */

//   const fetchUsers = useCallback(async () => {
//     try {
//       setLoadingUsers(true)
//       const res = await fetch('/api/admin/users')
//       if (!res.ok) throw new Error('Erreur de chargement')
//       const data = await res.json()
//       setUsers(data.users || [])
//     } catch (error) {
//       console.error('Erreur chargement utilisateurs:', error)
//       showToast('Erreur lors du chargement des utilisateurs', 'error')
//     } finally {
//       setLoadingUsers(false)
//     }
//   }, [showToast])

//   const fetchNotifications = useCallback(async () => {
//     try {
//       setLoadingNotifications(true)
//       const res = await fetch('/api/admin/all-notifications')
//       if (!res.ok) throw new Error('Erreur de chargement')
//       const data = await res.json()
//       setNotifications(data.notifications || [])
//     } catch (error) {
//       console.error('Erreur chargement notifications:', error)
//       showToast('Erreur lors du chargement des notifications', 'error')
//     } finally {
//       setLoadingNotifications(false)
//     }
//   }, [showToast])

//   useEffect(() => {
//     void fetchUsers()
//   }, [fetchUsers])

//   useEffect(() => {
//     if (activeTab === 'manage') {
//       void fetchNotifications()
//     }
//   }, [activeTab, fetchNotifications])

//   /* --------------------------- Envoi notif ----------------------------- */

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault()
//     if (!form.title.trim() || !form.message.trim()) {
//       showToast('Veuillez remplir le titre et le message', 'error')
//       return
//     }
//     try {
//       setSending(true)
//       const res = await fetch('/api/admin/notifications', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form),
//       })
//       if (!res.ok) {
//         const err = await res.json().catch(() => ({}))
//         throw new Error(err.error || "Erreur lors de l'envoi")
//       }
//       showToast('Notification envoyée avec succès')
//       setForm(EMPTY_FORM)
//       setSearchTerm('')
//     } catch (error) {
//       const msg = error instanceof Error ? error.message : "Erreur lors de l'envoi"
//       showToast(msg, 'error')
//     } finally {
//       setSending(false)
//     }
//   }

//   /* ------------------------- Suppression notif ------------------------- */

//   const deleteNotification = useCallback(
//     async (id: number) => {
//       if (!confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) return
//       try {
//         const res = await fetch(`/api/admin/notifications/${id}`, {
//           method: 'DELETE',
//         })
//         if (!res.ok) throw new Error('Erreur lors de la suppression')
//         setNotifications((prev) => prev.filter((n) => n.id !== id))
//         showToast('Notification supprimée')
//       } catch (error) {
//         const msg =
//           error instanceof Error ? error.message : 'Erreur lors de la suppression'
//         showToast(msg, 'error')
//       }
//     },
//     [showToast]
//   )

//   /* ----------------------------- Dérivés ------------------------------ */

//   const filteredUsers = useMemo(() => {
//     if (!searchTerm.trim()) return users.slice(0, 10)
//     const q = searchTerm.toLowerCase()
//     return users
//       .filter(
//         (u) =>
//           u.name.toLowerCase().includes(q) ||
//           u.email.toLowerCase().includes(q) ||
//           u.username.toLowerCase().includes(q)
//       )
//       .slice(0, 20)
//   }, [users, searchTerm])

//   const targetDescription = useMemo(() => {
//     switch (form.targetType) {
//       case 'all':
//         return 'Tous les utilisateurs'
//       case 'role':
//         return `Rôle : ${
//           ROLE_OPTIONS.find((r) => r.value === form.targetRole)?.label || '—'
//         }`
//       case 'department':
//         return `Département : ${form.targetDepartment || '—'}`
//       case 'user': {
//         const u = users.find((x) => x.id === form.targetUserId)
//         return `Utilisateur : ${u?.name || '—'}`
//       }
//       default:
//         return ''
//     }
//   }, [form, users])

//   /* ---------------------- Colonnes GenericTable ----------------------- */

//   const columns = useMemo<Column[]>(
//     () => [
//       {
//         key: 'title',
//         label: 'Notification',
//         mobile: 'primary',
//         renderer: (_v, row) => {
//           const n = row as unknown as Notification
//           return (
//             <div className="flex items-start gap-3">
//               <div className="mt-0.5 shrink-0">{getTypeIcon(n.type)}</div>
//               <div className="min-w-0">
//                 <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
//                   {n.title}
//                 </div>
//                 <div className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
//                   {n.message}
//                 </div>
//               </div>
//             </div>
//           )
//         },
//       },
//       {
//         key: 'priority',
//         label: 'Priorité',
//         renderer: (v) => {
//           const priority = String(v)
//           return (
//             <span
//               className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${getPriorityTone(
//                 priority
//               )}`}
//             >
//               {priority}
//             </span>
//           )
//         },
//       },
//       {
//         key: 'is_read',
//         label: 'Statut',
//         renderer: (v) => {
//           const read = Boolean(v)
//           return (
//             <span
//               className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
//                 read
//                   ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
//                   : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
//               }`}
//             >
//               <span
//                 className={`h-1.5 w-1.5 rounded-full ${
//                   read ? 'bg-emerald-500' : 'bg-amber-500'
//                 }`}
//               />
//               {read ? 'Lu' : 'Non lu'}
//             </span>
//           )
//         },
//       },
//       {
//         key: 'expires_at',
//         label: 'Expiration',
//         mobile: 'hidden',
//         renderer: (v) => {
//           if (!v) {
//             return <span className="text-xs text-zinc-400">Jamais</span>
//           }
//           const expired = new Date(String(v)) < new Date()
//           return (
//             <span
//               className={`inline-flex items-center gap-1.5 text-xs ${
//                 expired
//                   ? 'text-rose-600 dark:text-rose-400'
//                   : 'text-zinc-600 dark:text-zinc-400'
//               }`}
//             >
//               <Clock className="h-3.5 w-3.5" />
//               {formatDate(String(v))}
//             </span>
//           )
//         },
//       },
//       {
//         key: 'created_at',
//         label: 'Envoyée le',
//         renderer: (v) => (
//           <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
//             <CalendarDays className="h-3.5 w-3.5" />
//             {formatDate(String(v))}
//           </span>
//         ),
//       },
//     ],
//     []
//   )

//   const rowActions = useMemo<ActionConfig[]>(
//     () => [
//       {
//         label: 'Supprimer',
//         icon: Trash2,
//         variant: 'destructive',
//         onClick: (row) =>
//           void deleteNotification((row as unknown as Notification).id),
//       },
//     ],
//     [deleteNotification]
//   )

//   const topActions = useMemo<ActionConfig[]>(
//     () => [
//       {
//         label: 'Actualiser',
//         icon: RefreshCw,
//         variant: 'outline',
//         onClick: () => void fetchNotifications(),
//       },
//     ],
//     [fetchNotifications]
//   )

//   /* ------------------------------- Rendu ------------------------------- */

//   return (
//     <div className="min-h-[100dvh] w-full max-w-full overflow-x-clip bg-zinc-50 dark:bg-zinc-900">
//       <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div className="min-w-0">
//             <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
//               Gestion des notifications
//             </h1>
//             <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
//               Créez et gérez les notifications envoyées aux utilisateurs.
//             </p>
//           </div>
//           <div className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
//             <Bell className="h-4 w-4 text-teal-600 dark:text-teal-400" />
//             <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
//               {notifications.length} notification{notifications.length > 1 ? 's' : ''}
//             </span>
//           </div>
//         </div>

//         <ToastBanner toast={toast} onClose={() => setToast(null)} />

//         {/* Tabs */}
//         <div className="mb-6 w-full max-w-full overflow-x-auto overflow-y-hidden border-b border-zinc-200 [-ms-overflow-style:none] [scrollbar-width:none] dark:border-zinc-800 [&::-webkit-scrollbar]:hidden">
//           <nav
//             className="flex w-max min-w-full space-x-1 pr-4 sm:space-x-4"
//             aria-label="Sections notifications"
//           >
//             {[
//               { id: 'create' as TabType, label: 'Créer', icon: Send },
//               { id: 'manage' as TabType, label: 'Gérer les notifications', icon: Eye },
//             ].map((tab) => {
//               const Icon = tab.icon
//               const isActive = activeTab === tab.id
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   aria-current={isActive ? 'page' : undefined}
//                   className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
//                     isActive
//                       ? 'text-zinc-900 dark:text-zinc-50'
//                       : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
//                   }`}
//                 >
//                   <Icon className="h-4 w-4" />
//                   <span>{tab.label}</span>
//                   {isActive && (
//                     <span className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-900 dark:bg-zinc-100" />
//                   )}
//                 </button>
//               )
//             })}
//           </nav>
//         </div>

//         {/* Tab: Créer */}
//         {activeTab === 'create' && (
//           <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//             <form
//               onSubmit={handleSubmit}
//               className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-800/50 lg:col-span-2"
//             >
//               <div className="mb-2 flex items-center gap-3">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-500/10">
//                   <Send className="h-5 w-5 text-teal-600 dark:text-teal-400" />
//                 </div>
//                 <div>
//                   <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
//                     Nouvelle notification
//                   </h2>
//                   <p className="text-sm text-zinc-500 dark:text-zinc-400">
//                     Remplissez les détails ci-dessous.
//                   </p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                 <div>
//                   <label htmlFor="notif-title" className={labelClass}>
//                     Titre *
//                   </label>
//                   <input
//                     id="notif-title"
//                     type="text"
//                     value={form.title}
//                     onChange={(e) => setForm({ ...form, title: e.target.value })}
//                     className={inputClass}
//                     placeholder="Titre important…"
//                     required
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label htmlFor="notif-type" className={labelClass}>
//                       Type
//                     </label>
//                     <select
//                       id="notif-type"
//                       value={form.type}
//                       onChange={(e) =>
//                         setForm({
//                           ...form,
//                           type: e.target.value as NotificationForm['type'],
//                         })
//                       }
//                       className={inputClass}
//                     >
//                       {TYPE_OPTIONS.map((o) => (
//                         <option key={o.value} value={o.value}>
//                           {o.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label htmlFor="notif-priority" className={labelClass}>
//                       Priorité
//                     </label>
//                     <select
//                       id="notif-priority"
//                       value={form.priority}
//                       onChange={(e) =>
//                         setForm({
//                           ...form,
//                           priority: e.target.value as NotificationForm['priority'],
//                         })
//                       }
//                       className={inputClass}
//                     >
//                       {PRIORITY_OPTIONS.map((o) => (
//                         <option key={o.value} value={o.value}>
//                           {o.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="notif-message" className={labelClass}>
//                   Message *
//                 </label>
//                 <textarea
//                   id="notif-message"
//                   value={form.message}
//                   onChange={(e) => setForm({ ...form, message: e.target.value })}
//                   rows={4}
//                   className={inputClass}
//                   placeholder="Décrivez le contenu de la notification…"
//                   required
//                 />
//               </div>

//               <div>
//                 <label htmlFor="notif-target" className={labelClass}>
//                   Destinataires
//                 </label>
//                 <select
//                   id="notif-target"
//                   value={form.targetType}
//                   onChange={(e) =>
//                     setForm({
//                       ...form,
//                       targetType: e.target.value as NotificationForm['targetType'],
//                     })
//                   }
//                   className={inputClass}
//                 >
//                   <option value="all">Tous les utilisateurs</option>
//                   <option value="role">Par rôle</option>
//                   <option value="department">Par département</option>
//                   <option value="user">Utilisateur spécifique</option>
//                 </select>

//                 {form.targetType === 'role' && (
//                   <select
//                     value={form.targetRole || ''}
//                     onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
//                     className={`${inputClass} mt-3`}
//                   >
//                     <option value="">Sélectionnez un rôle</option>
//                     {ROLE_OPTIONS.map((o) => (
//                       <option key={o.value} value={o.value}>
//                         {o.label}
//                       </option>
//                     ))}
//                   </select>
//                 )}

//                 {form.targetType === 'department' && (
//                   <select
//                     value={form.targetDepartment || ''}
//                     onChange={(e) =>
//                       setForm({ ...form, targetDepartment: e.target.value })
//                     }
//                     className={`${inputClass} mt-3`}
//                   >
//                     <option value="">Sélectionnez un département</option>
//                     {DEPARTMENT_OPTIONS.map((d) => (
//                       <option key={d} value={d}>
//                         {d}
//                       </option>
//                     ))}
//                   </select>
//                 )}

//                 {form.targetType === 'user' && (
//                   <div className="mt-3">
//                     <div className="relative">
//                       <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
//                       <input
//                         type="text"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className={`${inputClass} pl-9`}
//                         placeholder="Rechercher un utilisateur…"
//                       />
//                     </div>
//                     <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
//                       {loadingUsers ? (
//                         <div className="p-3 text-sm text-zinc-500">Chargement…</div>
//                       ) : filteredUsers.length === 0 ? (
//                         <div className="p-3 text-sm text-zinc-500">
//                           Aucun utilisateur trouvé
//                         </div>
//                       ) : (
//                         filteredUsers.map((user) => (
//                           <button
//                             key={user.id}
//                             type="button"
//                             onClick={() => setForm({ ...form, targetUserId: user.id })}
//                             className={`flex w-full items-center gap-2 border-b border-zinc-100 p-3 text-left transition-colors last:border-0 dark:border-zinc-700/60 ${
//                               form.targetUserId === user.id
//                                 ? 'bg-teal-50 dark:bg-teal-500/10'
//                                 : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
//                             }`}
//                           >
//                             <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
//                               {user.name.charAt(0).toUpperCase()}
//                             </div>
//                             <div className="min-w-0 flex-1">
//                               <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
//                                 {user.name}
//                               </div>
//                               <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
//                                 {user.email} · {user.role}
//                               </div>
//                             </div>
//                           </button>
//                         ))
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//                 <div>
//                   <label htmlFor="notif-url" className={labelClass}>
//                     Lien d'action
//                   </label>
//                   <input
//                     id="notif-url"
//                     type="url"
//                     value={form.actionUrl}
//                     onChange={(e) => setForm({ ...form, actionUrl: e.target.value })}
//                     className={inputClass}
//                     placeholder="https://…"
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="notif-label" className={labelClass}>
//                     Libellé du lien
//                   </label>
//                   <input
//                     id="notif-label"
//                     type="text"
//                     value={form.actionLabel}
//                     onChange={(e) => setForm({ ...form, actionLabel: e.target.value })}
//                     className={inputClass}
//                     placeholder="Voir plus…"
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="notif-expires" className={labelClass}>
//                     Expire dans
//                   </label>
//                   <select
//                     id="notif-expires"
//                     value={form.expiresIn}
//                     onChange={(e) =>
//                       setForm({ ...form, expiresIn: Number(e.target.value) })
//                     }
//                     className={inputClass}
//                   >
//                     {EXPIRES_OPTIONS.map((o) => (
//                       <option key={o.value} value={o.value}>
//                         {o.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={sending}
//                 className={`${primaryBtnClass} w-full`}
//               >
//                 <Send className="h-4 w-4" />
//                 {sending ? 'Envoi en cours…' : 'Envoyer la notification'}
//               </button>
//             </form>

//             {/* Aperçu */}
//             <div className="space-y-4">
//               <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-800/50">
//                 <div className="mb-4 flex items-center gap-2">
//                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-50 dark:bg-fuchsia-500/10">
//                     <Eye className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-400" />
//                   </div>
//                   <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
//                     Aperçu en direct
//                   </h3>
//                 </div>

//                 <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
//                   <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
//                     <Target className="h-3 w-3" /> Destinataires
//                   </div>
//                   <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
//                     {targetDescription || '—'}
//                   </p>
//                 </div>

//                 {form.title ? (
//                   <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50 p-3 dark:bg-teal-500/10">
//                     <div className="flex gap-2">
//                       {getTypeIcon(form.type)}
//                       <div className="min-w-0 flex-1">
//                         <h5 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
//                           {form.title}
//                         </h5>
//                         {form.message && (
//                           <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
//                             {form.message}
//                           </p>
//                         )}
//                         {form.actionUrl && (
//                           <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-teal-700 dark:text-teal-400">
//                             <Link2 className="h-3 w-3" />
//                             {form.actionLabel || 'Voir plus'} →
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
//                     Commencez à remplir le formulaire pour voir l'aperçu.
//                   </div>
//                 )}
//               </div>

//               <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-800/50">
//                 <h4 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
//                   Informations
//                 </h4>
//                 <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
//                   <li className="flex items-center gap-2">
//                     <Bell className="h-3.5 w-3.5" />
//                     Apparaîtra dans le panneau des notifications
//                   </li>
//                   <li className="flex items-center gap-2">
//                     <CalendarDays className="h-3.5 w-3.5" />
//                     {form.expiresIn > 0
//                       ? `Expire dans ${form.expiresIn}h`
//                       : "N'expire jamais"}
//                   </li>
//                   <li className="flex items-center gap-2">
//                     <Filter className="h-3.5 w-3.5" />
//                     Mise à jour en temps réel
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Tab: Gérer */}
//         {activeTab === 'manage' && (
//           <GenericTable
//             title="Notifications envoyées"
//             subtitle={`${notifications.length} notification(s) au total`}
//             data={notifications as unknown as Record<string, unknown>[]}
//             columns={columns}
//             loading={loadingNotifications}
//             topActions={topActions}
//             rowActions={rowActions}
//             minWidth={900}
//             searchable
//             searchPlaceholder="Rechercher un titre, un message…"
//             itemsPerPage={10}
//             emptyMessage="Aucune notification n'a été envoyée pour le moment"
//           />
//         )}
//       </div>
//     </div>
//   )
// }

// src/app/admin/notifications/page.tsx
'use client'

import { useState, useEffect, useCallback, useMemo, FormEvent } from 'react'
import {
  Send,
  Search,
  Eye,
  Trash2,
  Bell,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  MessageCircle,
  RefreshCw,
  Target,
  X,
  Link2,
  Clock,
  Filter,
} from 'lucide-react'
import GenericTable, { Column, ActionConfig } from '@/components/GenericTable'

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface User {
  id: string
  username: string
  name: string
  email: string
  role: string
  departement?: string
}

interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error' | 'system'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  user_id: string
  created_by: string
  is_read: boolean
  expires_at: string | null
  action_url?: string
  action_label?: string
  created_at: string
  users?: {
    name: string
    email: string
  }
}

interface NotificationForm {
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error' | 'system'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  targetType: 'all' | 'role' | 'department' | 'user'
  targetRole?: string
  targetDepartment?: string
  targetUserId?: string
  expiresIn: number
  actionUrl?: string
  actionLabel?: string
}

type TabType = 'create' | 'manage'
type Toast = { type: 'success' | 'error'; message: string } | null

/* -------------------------------------------------------------------------- */
/*                                 Constantes                                 */
/* -------------------------------------------------------------------------- */

const TYPE_OPTIONS = [
  { value: 'info', label: 'Information' },
  { value: 'success', label: 'Succès' },
  { value: 'warning', label: 'Avertissement' },
  { value: 'error', label: 'Erreur' },
  { value: 'system', label: 'Système' },
] as const

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Basse' },
  { value: 'normal', label: 'Normale' },
  { value: 'high', label: 'Haute' },
  { value: 'urgent', label: 'Urgente' },
] as const

const ROLE_OPTIONS = [
  { value: 'student', label: 'Étudiant' },
  { value: 'teacher', label: 'Enseignant' },
  { value: 'admin', label: 'Administrateur' },
  { value: 'alumni', label: 'Alumni' },
  { value: 'check_in_admin', label: 'Responsable Check-in' },
]

const DEPARTMENT_OPTIONS = [
  'Informatique',
  'Sciences',
  'Gestion',
  'Administration',
  'Accueil',
]

const EXPIRES_OPTIONS = [
  { value: 1, label: '1 heure' },
  { value: 6, label: '6 heures' },
  { value: 24, label: '24 heures' },
  { value: 168, label: '7 jours' },
  { value: 720, label: '30 jours' },
  { value: 0, label: 'Jamais' },
]

const EMPTY_FORM: NotificationForm = {
  title: '',
  message: '',
  type: 'info',
  priority: 'normal',
  targetType: 'all',
  expiresIn: 24,
  actionUrl: '',
  actionLabel: '',
}

/* -------------------------------------------------------------------------- */
/*                                 Helpers                                    */
/* -------------------------------------------------------------------------- */

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />
    case 'error':
      return <AlertCircle className="h-4 w-4 text-rose-500" />
    case 'system':
      return <Info className="h-4 w-4 text-sky-500" />
    default:
      return <MessageCircle className="h-4 w-4 text-zinc-500" />
  }
}

function getPriorityTone(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20'
    case 'high':
      return 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20'
    case 'normal':
      return 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20'
    case 'low':
    default:
      return 'bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700'
  }
}

/* -------------------------------------------------------------------------- */
/*                              Composants UI                                 */
/* -------------------------------------------------------------------------- */

const inputClass =
  'w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:ring-teal-400 dark:focus:border-teal-400 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm outline-none transition-colors'

const labelClass =
  'block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2'

const primaryBtnClass =
  'inline-flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 px-4 h-10 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed'

function ToastBanner({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  if (!toast) return null
  const isSuccess = toast.type === 'success'
  return (
    <div
      role="alert"
      className={`mb-6 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
        isSuccess
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
          : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20'
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 shrink-0" />
      )}
      <span className="flex-1 break-words">{toast.message}</span>
      <button
        onClick={onClose}
        className="shrink-0 rounded p-1 hover:bg-black/5 dark:hover:bg-white/10"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                       Composant principal (export default)                 */
/* -------------------------------------------------------------------------- */

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('create')
  const [users, setUsers] = useState<User[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState<Toast>(null)
  const [form, setForm] = useState<NotificationForm>(EMPTY_FORM)

  // ✅ État pour la sélection multiple
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([])

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type })
      setTimeout(() => setToast(null), 5000)
    },
    []
  )

  /* ----------------------------- Fetch API ----------------------------- */

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true)
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Erreur de chargement')
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error(error)
      showToast('Erreur lors du chargement des utilisateurs', 'error')
    } finally {
      setLoadingUsers(false)
    }
  }, [showToast])

  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true)
      const res = await fetch('/api/admin/all-notifications')
      if (!res.ok) throw new Error('Erreur de chargement')
      const data = await res.json()
      setNotifications(data.notifications || [])
      setSelectedIds([]) // On vide la sélection au rechargement
    } catch (error) {
      console.error(error)
      showToast('Erreur lors du chargement des notifications', 'error')
    } finally {
      setLoadingNotifications(false)
    }
  }, [showToast])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    if (activeTab === 'manage') {
      void fetchNotifications()
    }
  }, [activeTab, fetchNotifications])

  /* --------------------------- Envoi notif ----------------------------- */

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.message.trim()) {
      showToast('Veuillez remplir le titre et le message', 'error')
      return
    }
    try {
      setSending(true)
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Erreur lors de l'envoi")
      }
      showToast('Notification envoyée avec succès')
      setForm(EMPTY_FORM)
      setSearchTerm('')
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erreur lors de l'envoi"
      showToast(msg, 'error')
    } finally {
      setSending(false)
    }
  }

  /* ------------------------- Suppression ------------------------- */

  // ✅ Suppression qui gère 1 ou plusieurs IDs
  const deleteNotifications = useCallback(
    async (ids: (string | number)[]) => {
      if (ids.length === 0) return
      const confirmMsg =
        ids.length === 1
          ? 'Êtes-vous sûr de vouloir supprimer cette notification ?'
          : `Êtes-vous sûr de vouloir supprimer ces ${ids.length} notifications ?`

      if (!confirm(confirmMsg)) return

      try {
        // Suppression en parallèle
        const results = await Promise.allSettled(
          ids.map((id) =>
            fetch(`/api/admin/notifications/${id}`, { method: 'DELETE' })
          )
        )

        const failed = results.filter(
          (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok)
        ).length
        const successCount = ids.length - failed

        if (failed > 0) {
          showToast(`${successCount} supprimée(s), ${failed} échec(s)`, 'error')
        } else {
          showToast(`${successCount} notification(s) supprimée(s)`)
        }

        // Mise à jour locale
        setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)))
        setSelectedIds([]) // Vider la sélection
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : 'Erreur lors de la suppression'
        showToast(msg, 'error')
      }
    },
    [showToast]
  )

  /* ----------------------------- Dérivés ------------------------------ */

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users.slice(0, 10)
    const q = searchTerm.toLowerCase()
    return users
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)
      )
      .slice(0, 20)
  }, [users, searchTerm])

  const targetDescription = useMemo(() => {
    switch (form.targetType) {
      case 'all':
        return 'Tous les utilisateurs'
      case 'role':
        return `Rôle : ${
          ROLE_OPTIONS.find((r) => r.value === form.targetRole)?.label || '—'
        }`
      case 'department':
        return `Département : ${form.targetDepartment || '—'}`
      case 'user':
        return `Utilisateur : ${
          users.find((x) => x.id === form.targetUserId)?.name || '—'
        }`
      default:
        return ''
    }
  }, [form, users])

  /* ---------------------- Colonnes & Actions ----------------------- */

  const columns = useMemo<Column[]>(
    () => [
      {
        key: 'title',
        label: 'Notification',
        mobile: 'primary',
        renderer: (_v, row) => {
          const n = row as unknown as Notification
          return (
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">{getTypeIcon(n.type)}</div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {n.title}
                </div>
                <div className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {n.message}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        key: 'priority',
        label: 'Priorité',
        renderer: (v) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${getPriorityTone(
              String(v)
            )}`}
          >
            {String(v)}
          </span>
        ),
      },
      {
        key: 'is_read',
        label: 'Statut',
        renderer: (v) => (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
              v
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                v ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            {v ? 'Lu' : 'Non lu'}
          </span>
        ),
      },
      {
        key: 'expires_at',
        label: 'Expiration',
        mobile: 'hidden',
        renderer: (v) => {
          if (!v) return <span className="text-xs text-zinc-400">Jamais</span>
          const expired = new Date(String(v)) < new Date()
          return (
            <span
              className={`inline-flex items-center gap-1.5 text-xs ${
                expired
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              {formatDate(String(v))}
            </span>
          )
        },
      },
      {
        key: 'created_at',
        label: 'Envoyée le',
        renderer: (v) => (
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(String(v))}
          </span>
        ),
      },
    ],
    []
  )

  // ✅ Actions sur une ligne spécifique
  const rowActions = useMemo<ActionConfig[]>(
    () => [
      {
        label: 'Supprimer',
        icon: Trash2,
        variant: 'destructive',
        onClick: (row) =>
          void deleteNotifications([(row as unknown as Notification).id]),
      },
    ],
    [deleteNotifications]
  )

  // ✅ Actions groupées (quand on coche des cases)
  const bulkActions = useMemo<ActionConfig[]>(
    () => [
      {
        label: 'Supprimer',
        icon: Trash2,
        variant: 'destructive',
        onClick: () => void deleteNotifications(selectedIds),
      },
    ],
    [deleteNotifications, selectedIds]
  )

  const topActions = useMemo<ActionConfig[]>(
    () => [
      {
        label: 'Actualiser',
        icon: RefreshCw,
        variant: 'outline',
        onClick: () => void fetchNotifications(),
      },
    ],
    [fetchNotifications]
  )

  /* ------------------------------- Rendu ------------------------------- */

  return (
    <div className="min-h-[100dvh] w-full max-w-full overflow-x-clip bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Gestion des notifications
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Créez et gérez les notifications envoyées aux utilisateurs.
            </p>
          </div>
          <div className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
            <Bell className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {notifications.length} notification{notifications.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <ToastBanner toast={toast} onClose={() => setToast(null)} />

        {/* Tabs */}
        <div className="mb-6 w-full max-w-full overflow-x-auto overflow-y-hidden border-b border-zinc-200 [-ms-overflow-style:none] [scrollbar-width:none] dark:border-zinc-800 [&::-webkit-scrollbar]:hidden">
          <nav
            className="flex w-max min-w-full space-x-1 pr-4 sm:space-x-4"
            aria-label="Sections notifications"
          >
            {[
              { id: 'create' as TabType, label: 'Créer', icon: Send },
              { id: 'manage' as TabType, label: 'Gérer les notifications', icon: Eye },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                    isActive
                      ? 'text-zinc-900 dark:text-zinc-50'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-900 dark:bg-zinc-100" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab: Créer */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-800/50 lg:col-span-2"
            >
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-500/10">
                  <Send className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    Nouvelle notification
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Remplissez les détails ci-dessous.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="notif-title" className={labelClass}>
                    Titre *
                  </label>
                  <input
                    id="notif-title"
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className={inputClass}
                    placeholder="Titre important…"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="notif-type" className={labelClass}>
                      Type
                    </label>
                    <select
                      id="notif-type"
                      value={form.type}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          type: e.target.value as NotificationForm['type'],
                        })
                      }
                      className={inputClass}
                    >
                      {TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="notif-priority" className={labelClass}>
                      Priorité
                    </label>
                    <select
                      id="notif-priority"
                      value={form.priority}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          priority: e.target.value as NotificationForm['priority'],
                        })
                      }
                      className={inputClass}
                    >
                      {PRIORITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="notif-message" className={labelClass}>
                  Message *
                </label>
                <textarea
                  id="notif-message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  className={inputClass}
                  placeholder="Décrivez le contenu de la notification…"
                  required
                />
              </div>

              <div>
                <label htmlFor="notif-target" className={labelClass}>
                  Destinataires
                </label>
                <select
                  id="notif-target"
                  value={form.targetType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      targetType: e.target.value as NotificationForm['targetType'],
                    })
                  }
                  className={inputClass}
                >
                  <option value="all">Tous les utilisateurs</option>
                  <option value="role">Par rôle</option>
                  <option value="department">Par département</option>
                  <option value="user">Utilisateur spécifique</option>
                </select>

                {form.targetType === 'role' && (
                  <select
                    value={form.targetRole || ''}
                    onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                    className={`${inputClass} mt-3`}
                  >
                    <option value="">Sélectionnez un rôle</option>
                    {ROLE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                )}

                {form.targetType === 'department' && (
                  <select
                    value={form.targetDepartment || ''}
                    onChange={(e) =>
                      setForm({ ...form, targetDepartment: e.target.value })
                    }
                    className={`${inputClass} mt-3`}
                  >
                    <option value="">Sélectionnez un département</option>
                    {DEPARTMENT_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                )}

                {form.targetType === 'user' && (
                  <div className="mt-3">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`${inputClass} pl-9`}
                        placeholder="Rechercher un utilisateur…"
                      />
                    </div>
                    <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
                      {loadingUsers ? (
                        <div className="p-3 text-sm text-zinc-500">Chargement…</div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="p-3 text-sm text-zinc-500">
                          Aucun utilisateur trouvé
                        </div>
                      ) : (
                        filteredUsers.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => setForm({ ...form, targetUserId: user.id })}
                            className={`flex w-full items-center gap-2 border-b border-zinc-100 p-3 text-left transition-colors last:border-0 dark:border-zinc-700/60 ${
                              form.targetUserId === user.id
                                ? 'bg-teal-50 dark:bg-teal-500/10'
                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                            }`}
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                {user.name}
                              </div>
                              <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                                {user.email} · {user.role}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label htmlFor="notif-url" className={labelClass}>
                    Lien d'action
                  </label>
                  <input
                    id="notif-url"
                    type="url"
                    value={form.actionUrl}
                    onChange={(e) => setForm({ ...form, actionUrl: e.target.value })}
                    className={inputClass}
                    placeholder="https://…"
                  />
                </div>
                <div>
                  <label htmlFor="notif-label" className={labelClass}>
                    Libellé du lien
                  </label>
                  <input
                    id="notif-label"
                    type="text"
                    value={form.actionLabel}
                    onChange={(e) => setForm({ ...form, actionLabel: e.target.value })}
                    className={inputClass}
                    placeholder="Voir plus…"
                  />
                </div>
                <div>
                  <label htmlFor="notif-expires" className={labelClass}>
                    Expire dans
                  </label>
                  <select
                    id="notif-expires"
                    value={form.expiresIn}
                    onChange={(e) =>
                      setForm({ ...form, expiresIn: Number(e.target.value) })
                    }
                    className={inputClass}
                  >
                    {EXPIRES_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={sending}
                className={`${primaryBtnClass} w-full`}
              >
                <Send className="h-4 w-4" />
                {sending ? 'Envoi en cours…' : 'Envoyer la notification'}
              </button>
            </form>

            {/* Aperçu */}
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-800/50">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-50 dark:bg-fuchsia-500/10">
                    <Eye className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    Aperçu en direct
                  </h3>
                </div>

                <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <Target className="h-3 w-3" /> Destinataires
                  </div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {targetDescription || '—'}
                  </p>
                </div>

                {form.title ? (
                  <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50 p-3 dark:bg-teal-500/10">
                    <div className="flex gap-2">
                      {getTypeIcon(form.type)}
                      <div className="min-w-0 flex-1">
                        <h5 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          {form.title}
                        </h5>
                        {form.message && (
                          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                            {form.message}
                          </p>
                        )}
                        {form.actionUrl && (
                          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-teal-700 dark:text-teal-400">
                            <Link2 className="h-3 w-3" />
                            {form.actionLabel || 'Voir plus'} →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                    Commencez à remplir le formulaire pour voir l'aperçu.
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-800/50">
                <h4 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Informations
                </h4>
                <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-center gap-2">
                    <Bell className="h-3.5 w-3.5" />
                    Apparaîtra dans le panneau des notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {form.expiresIn > 0
                      ? `Expire dans ${form.expiresIn}h`
                      : "N'expire jamais"}
                  </li>
                  <li className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5" />
                    Mise à jour en temps réel
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Gérer */}
        {activeTab === 'manage' && (
          <GenericTable
            title="Notifications envoyées"
            subtitle={`${notifications.length} notification(s) au total`}
            data={notifications as unknown as Record<string, unknown>[]}
            columns={columns}
            loading={loadingNotifications}
            topActions={topActions}
            rowActions={rowActions}
            bulkActions={bulkActions} // ✅ Actions groupées
            showCheckbox // ✅ Active la sélection
            selectedItems={selectedIds}
            onSelectionChange={(items) => setSelectedIds(items)}
            minWidth={900}
            searchable
            searchPlaceholder="Rechercher un titre, un message…"
            itemsPerPage={10}
            emptyMessage="Aucune notification n'a été envoyée pour le moment"
          />
        )}
      </div>
    </div>
  )
}
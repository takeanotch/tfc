// 'use client'
// import { useState, useEffect, useRef } from 'react'
// import { supabase } from '@/lib/supabase'
// import { Comment, CommentFormData } from '@/types/comment'
// import { useRouter } from 'next/navigation'
// import { 
//   FaHeart, 
//   FaRegHeart, 
//   FaReply, 
//   FaEdit, 
//   FaTrash, 
//   FaUser, 
//   FaCheck, 
//   FaTimes,
//   FaCaretDown,
//   FaCaretUp,
//   FaSignInAlt,
//   FaPlus,
//   FaComment,
//   FaRegComment,
//   FaLock
// } from 'react-icons/fa'

// // Constantes de design (cohérentes avec le reste de l'app)
// const CARD = 'rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
// const FOCUS = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-500'

// interface CommentSectionProps {
//   tfcId: number
//   currentUser: {
//     id: string
//     name: string
//     profil_url?: string
//     role: string
//     privileged?: boolean
//   } | null
// }

// export default function CommentSection({ tfcId, currentUser }: CommentSectionProps) {
//   const router = useRouter()
//   const [comments, setComments] = useState<Comment[]>([])
//   const [loading, setLoading] = useState(true)
//   const [replyingTo, setReplyingTo] = useState<string | null>(null)
//   const [editingComment, setEditingComment] = useState<string | null>(null)
//   const [editContent, setEditContent] = useState('')
//   const [showReplies, setShowReplies] = useState<Set<string>>(new Set())
//   const [replies, setReplies] = useState<Record<string, Comment[]>>({})
//   const [showCommentForm, setShowCommentForm] = useState(false)
//   const [isMobile, setIsMobile] = useState(false)

//   // Références pour les textareas
//   const textareaRefs = useRef<{[key: string]: HTMLTextAreaElement | null}>({})

//   // Détection mobile
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768)
//     }
    
//     checkMobile()
//     window.addEventListener('resize', checkMobile)
    
//     return () => window.removeEventListener('resize', checkMobile)
//   }, [])

//   // Focus automatique pour mobile
//   useEffect(() => {
//     if (isMobile && (replyingTo || editingComment || showCommentForm)) {
//       setTimeout(() => {
//         const key = replyingTo || editingComment || 'main'
//         const textarea = textareaRefs.current[key]
//         if (textarea) {
//           textarea.focus()
//           textarea.scrollIntoView({ 
//             behavior: 'smooth', 
//             block: 'center',
//             inline: 'nearest'
//           })
//         }
//       }, 100)
//     }
//   }, [isMobile, replyingTo, editingComment, showCommentForm])

//   // Fonction pour obtenir les initiales
//   const getInitials = (name: string) =>
//     name
//       .split(' ')
//       .map(part => part.charAt(0).toUpperCase())
//       .join('')
//       .slice(0, 2)

//   // Fonction pour gérer les actions nécessitant une connexion
//   const requireAuth = (action: string, callback: () => void) => {
//     if (!currentUser) {
//       const confirmLogin = window.confirm(
//         `Veuillez vous connecter pour ${action}. Souhaitez-vous être redirigé vers la page de connexion ?`
//       )
//       if (confirmLogin) {
//         router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)
//       }
//       return
//     }
    
//     if (action.includes('commenter') && !currentUser.privileged) {
//       alert('Seuls les utilisateurs privilégiés peuvent ajouter des commentaires.')
//       return
//     }
    
//     callback()
//   }

//   const canComment = currentUser?.privileged || false

//   // Charger les commentaires
//   const loadComments = async () => {
//     try {
//       setLoading(true)
      
//       const { data: commentsData, error } = await supabase
//         .from('tfc_comments_with_users')
//         .select('*')
//         .eq('tfc_id', tfcId)
//         .is('parent_id', null)
//         .order('created_at', { ascending: false })

//       if (error) throw error

//       const enrichedComments = await Promise.all(
//         (commentsData || []).map(async (comment) => {
//           let has_liked = false
          
//           if (currentUser) {
//             try {
//               const { data: likeData } = await supabase
//                 .from('tfc_comment_likes')
//                 .select('id')
//                 .eq('comment_id', comment.id)
//                 .eq('user_id', currentUser.id)
//                 .single()

//               if (likeData) {
//                 has_liked = true
//               }
//             } catch (likeErr) {
//               // Pas de like pour ce commentaire
//             }
//           }

//           return {
//             id: comment.id,
//             content: comment.content,
//             likes_count: comment.likes_count || 0,
//             created_at: comment.created_at,
//             updated_at: comment.updated_at,
//             user_id: comment.user_id,
//             user_name: comment.user_name,
//             user_profil_url: comment.user_profil_url,
//             user_role: comment.user_role,
//             parent_id: comment.parent_id,
//             has_liked,
//             current_user_id: currentUser?.id || null,
//             replies_count: comment.replies_count || 0
//           }
//         })
//       )

//       setComments(enrichedComments)
      
//     } catch (error) {
//       await loadCommentsFallback()
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Fallback si la vue n'existe pas
//   const loadCommentsFallback = async () => {
//     try {
//       const { data: commentsData, error } = await supabase
//         .from('tfc_comments')
//         .select(`
//           *,
//           users:user_id (id, name, profil_url, role)
//         `)
//         .eq('tfc_id', tfcId)
//         .is('parent_id', null)
//         .order('created_at', { ascending: false })

//       if (error) throw error

//       const enrichedComments = await Promise.all(
//         (commentsData || []).map(async (comment) => {
//           const { count: repliesCount } = await supabase
//             .from('tfc_comments')
//             .select('id', { count: 'exact' })
//             .eq('parent_id', comment.id)

//           let has_liked = false
//           if (currentUser) {
//             const { data: likeData } = await supabase
//               .from('tfc_comment_likes')
//               .select('id')
//               .eq('comment_id', comment.id)
//               .eq('user_id', currentUser.id)
//               .single()
            
//             has_liked = !!likeData
//           }

//           return {
//             id: comment.id,
//             content: comment.content,
//             likes_count: comment.likes_count || 0,
//             created_at: comment.created_at,
//             updated_at: comment.updated_at,
//             user_id: comment.user_id,
//             user_name: comment.users.name,
//             user_profil_url: comment.users.profil_url,
//             user_role: comment.users.role,
//             parent_id: comment.parent_id,
//             has_liked,
//             current_user_id: currentUser?.id || null,
//             replies_count: repliesCount || 0
//           }
//         })
//       )

//       setComments(enrichedComments)
//     } catch (fallbackError) {
//       console.error('Erreur lors du chargement de fallback:', fallbackError)
//       setComments([])
//     }
//   }

//   // Charger les réponses d'un commentaire
//   const loadReplies = async (commentId: string) => {
//     try {
//       const { data: repliesData, error } = await supabase
//         .from('tfc_comments')
//         .select(`
//           *,
//           users:user_id (id, name, profil_url, role)
//         `)
//         .eq('parent_id', commentId)
//         .order('created_at', { ascending: true })

//       if (error) throw error

//       const formattedReplies: Comment[] = await Promise.all(
//         (repliesData || []).map(async (reply) => {
//           let has_liked = false
//           if (currentUser) {
//             const { data: likeData } = await supabase
//               .from('tfc_comment_likes')
//               .select('id')
//               .eq('comment_id', reply.id)
//               .eq('user_id', currentUser.id)
//               .single()
            
//             has_liked = !!likeData
//           }

//           return {
//             id: reply.id,
//             content: reply.content,
//             likes_count: reply.likes_count || 0,
//             created_at: reply.created_at,
//             updated_at: reply.updated_at,
//             user_id: reply.user_id,
//             user_name: reply.users.name,
//             user_profil_url: reply.users.profil_url,
//             user_role: reply.users.role,
//             parent_id: reply.parent_id,
//             has_liked,
//             current_user_id: currentUser?.id || null,
//             replies_count: 0
//           }
//         })
//       )

//       setReplies(prev => ({
//         ...prev,
//         [commentId]: formattedReplies
//       }))
//     } catch (error) {
//       console.error('Erreur lors du chargement des réponses:', error)
//     }
//   }

//   useEffect(() => {
//     loadComments()
//   }, [tfcId, currentUser?.id])

//   // Ajouter un commentaire
//   const addComment = async (formData: CommentFormData) => {
//     requireAuth('commenter', async () => {
//       try {
//         const { data, error } = await supabase
//           .from('tfc_comments')
//           .insert({
//             tfc_id: tfcId,
//             user_id: currentUser!.id,
//             content: formData.content,
//             parent_id: formData.parent_id || null
//           })
//           .select()
//           .single()

//         if (error) throw error

//         await loadComments()
        
//         if (formData.parent_id) {
//           await loadReplies(formData.parent_id)
//         }

//         setReplyingTo(null)
//         setShowCommentForm(false)
//       } catch (error) {
//         console.error('Erreur lors de l\'ajout du commentaire:', error)
//         alert('Erreur lors de l\'ajout du commentaire')
//       }
//     })
//   }

//   // Modifier un commentaire
//   const updateComment = async (commentId: string) => {
//     try {
//       const { error } = await supabase
//         .from('tfc_comments')
//         .update({
//           content: editContent,
//           updated_at: new Date().toISOString()
//         })
//         .eq('id', commentId)

//       if (error) throw error

//       await loadComments()
//       setEditingComment(null)
//       setEditContent('')
//     } catch (error) {
//       console.error('Erreur lors de la modification du commentaire:', error)
//       alert('Erreur lors de la modification du commentaire')
//     }
//   }

//   // Supprimer un commentaire
//   const deleteComment = async (commentId: string) => {
//     if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
//       return
//     }

//     try {
//       const { error } = await supabase
//         .from('tfc_comments')
//         .delete()
//         .eq('id', commentId)

//       if (error) throw error

//       await loadComments()
//     } catch (error) {
//       console.error('Erreur lors de la suppression du commentaire:', error)
//       alert('Erreur lors de la suppression du commentaire')
//     }
//   }

//   // Like/Unlike un commentaire
//   const toggleLike = async (commentId: string) => {
//     requireAuth('aimer un commentaire', async () => {
//       try {
//         const { data: existingLike } = await supabase
//           .from('tfc_comment_likes')
//           .select('id')
//           .eq('comment_id', commentId)
//           .eq('user_id', currentUser!.id)
//           .single()

//         if (existingLike) {
//           const { error } = await supabase
//             .from('tfc_comment_likes')
//             .delete()
//             .eq('comment_id', commentId)
//             .eq('user_id', currentUser!.id)
          
//           if (error) throw error
//         } else {
//           const { error } = await supabase
//             .from('tfc_comment_likes')
//             .insert({
//               comment_id: commentId,
//               user_id: currentUser!.id
//             })
          
//           if (error) throw error
//         }

//         await loadComments()
//       } catch (error) {
//         console.error('Erreur lors du like:', error)
//       }
//     })
//   }

//   const handleReply = (commentId: string) => {
//     requireAuth('répondre', () => {
//       setReplyingTo(commentId)
//     })
//   }

//   const toggleReplies = async (commentId: string) => {
//     const newShowReplies = new Set(showReplies)
    
//     if (newShowReplies.has(commentId)) {
//       newShowReplies.delete(commentId)
//     } else {
//       newShowReplies.add(commentId)
//       if (!replies[commentId]) {
//         await loadReplies(commentId)
//       }
//     }
    
//     setShowReplies(newShowReplies)
//   }

//   // Composant formulaire de commentaire
//   const CommentForm = ({ 
//     onSubmit, 
//     onCancel, 
//     initialContent = '', 
//     placeholder = 'Ajouter un commentaire...',
//     autoFocus = false,
//     compact = false,
//     formKey = 'main'
//   }: {
//     onSubmit: (content: string) => void
//     onCancel?: () => void
//     initialContent?: string
//     placeholder?: string
//     autoFocus?: boolean
//     compact?: boolean
//     formKey?: string
//   }) => {
//     const [content, setContent] = useState(initialContent)

//     const handleSubmit = (e: React.FormEvent) => {
//       e.preventDefault()
//       if (content.trim()) {
//         onSubmit(content)
//         setContent('')
//       }
//     }

//     const textareaRef = (el: HTMLTextAreaElement | null) => {
//       textareaRefs.current[formKey] = el
//     }

//     return (
//       <form onSubmit={handleSubmit} className={`space-y-3 ${compact ? 'bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg' : ''}`}>
//         <textarea
//           ref={textareaRef}
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//           placeholder={placeholder}
//           className={`w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg resize-none transition-all duration-200 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-500 ${FOCUS}`}
//           style={{ 
//             minHeight: compact ? '60px' : '80px',
//           }}
//           autoFocus={autoFocus && !isMobile}
//         />
//         <div className="flex justify-end space-x-2">
//           {onCancel && (
//             <button
//               type="button"
//               onClick={onCancel}
//               className={`px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium text-zinc-700 dark:text-zinc-300 ${FOCUS}`}
//             >
//               <FaTimes className="inline mr-1" />
//               Annuler
//             </button>
//           )}
//           <button
//             type="submit"
//             disabled={!content.trim()}
//             className={`px-4 py-2 text-sm text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 hover:shadow-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 ${FOCUS}`}
//           >
//             <FaCheck className="inline mr-1" />
//             Publier
//           </button>
//         </div>
//       </form>
//     )
//   }

//   // Composant pour un commentaire individuel
//   const CommentItem = ({ 
//     comment, 
//     isReply = false,
//     onReply
//   }: { 
//     comment: Comment
//     isReply?: boolean
//     onReply: (commentId: string) => void
//   }) => {
//     const isOwner = currentUser && comment.user_id === currentUser.id
//     const canEdit = isOwner
//     const canDelete = isOwner || currentUser?.role === 'admin'

//     return (
//       <div className={`${isReply ? 'ml-4 md:ml-8 pl-3 md:pl-4 border-l-2 border-blue-200 dark:border-blue-500/30' : ''} transition-all duration-200`}>
//         <div className={`${CARD} rounded-xl p-4 transition-all duration-200 hover:shadow-sm ${
//           isReply ? 'border-l-4 border-l-blue-300 dark:border-l-blue-600' : 'shadow-sm'
//         }`}>
//           {/* En-tête du commentaire */}
//           <div className="flex items-start justify-between mb-3">
//             <div className="flex items-center space-x-3">
//               {comment.user_profil_url ? (
//                 <img 
//                   src={comment.user_profil_url} 
//                   alt="Photo de profil"
//                   className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-blue-200 dark:border-blue-500/30"
//                 />
//               ) : (
//                 <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold shadow-sm bg-blue-600 dark:bg-blue-500">
//                   {getInitials(comment.user_name)}
//                 </div>
//               )}
              
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center space-x-2 flex-wrap">
//                   <span className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
//                     {comment.user_name}
//                   </span>
//                   {comment.user_role === 'admin' && (
//                     <span className="px-2 py-0.5 text-xs rounded-full font-medium ring-1 ring-inset bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
//                       Admin
//                     </span>
//                   )}
//                 </div>
//                 <div className="text-xs flex items-center space-x-2 text-zinc-500 dark:text-zinc-400 flex-wrap">
//                   <span>
//                     {new Date(comment.created_at).toLocaleDateString('fr-FR', {
//                       year: 'numeric',
//                       month: 'short',
//                       day: 'numeric',
//                       hour: '2-digit',
//                       minute: '2-digit'
//                     })}
//                   </span>
//                   {comment.updated_at !== comment.created_at && (
//                     <span className="italic">(modifié)</span>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Actions */}
//             {(canEdit || canDelete) && (
//               <div className="flex items-center space-x-1">
//                 {canEdit && (
//                   <button
//                     onClick={() => {
//                       setEditingComment(comment.id)
//                       setEditContent(comment.content)
//                     }}
//                     className={`p-2 rounded-lg transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:shadow-sm text-blue-600 dark:text-blue-400 ${FOCUS}`}
//                     title="Modifier"
//                   >
//                     <FaEdit size={14} />
//                   </button>
//                 )}
                
//                 {canDelete && (
//                   <button
//                     onClick={() => deleteComment(comment.id)}
//                     className={`p-2 rounded-lg transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-500/10 hover:shadow-sm text-red-600 dark:text-red-400 ${FOCUS}`}
//                     title="Supprimer"
//                   >
//                     <FaTrash size={14} />
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Contenu du commentaire */}
//           {editingComment === comment.id ? (
//             <CommentForm
//               onSubmit={(content) => updateComment(comment.id)}
//               onCancel={() => setEditingComment(null)}
//               initialContent={editContent}
//               placeholder="Modifier votre commentaire..."
//               autoFocus
//               compact
//               formKey={comment.id}
//             />
//           ) : (
//             <>
//               <div className="mb-4">
//                 <p className="whitespace-pre-wrap leading-relaxed text-zinc-800 dark:text-zinc-200">
//                   {comment.content}
//                 </p>
//               </div>

//               {/* Actions du commentaire */}
//               <div className="flex items-center justify-between flex-wrap gap-2">
//                 <div className="flex items-center space-x-2 md:space-x-4">
//                   <button
//                     onClick={() => toggleLike(comment.id)}
//                     className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${FOCUS} ${
//                       comment.has_liked 
//                         ? 'text-red-500 bg-red-50 dark:bg-red-500/10 shadow-sm' 
//                         : 'text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
//                     }`}
//                     title="Aimer"
//                   >
//                     {comment.has_liked ? <FaHeart /> : <FaRegHeart />}
//                     <span className="text-sm font-medium">{comment.likes_count}</span>
//                   </button>

//                   {!isReply && (
//                     <button
//                       onClick={() => onReply(comment.id)}
//                       className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-zinc-500 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 ${FOCUS}`}
//                       title="Répondre"
//                     >
//                       <FaReply />
//                       <span className="text-sm font-medium hidden sm:inline">Répondre</span>
//                     </button>
//                   )}
//                 </div>

//                 {/* Bouton pour afficher/masquer les réponses */}
//                 {!isReply && comment.replies_count > 0 && (
//                   <button
//                     onClick={() => toggleReplies(comment.id)}
//                     className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:shadow-sm ${FOCUS}`}
//                   >
//                     {showReplies.has(comment.id) ? <FaCaretUp /> : <FaCaretDown />}
//                     <span className="text-sm font-medium">
//                       {showReplies.has(comment.id) ? 'Masquer' : 'Afficher'} {comment.replies_count} réponse{comment.replies_count > 1 ? 's' : ''}
//                     </span>
//                   </button>
//                 )}
//               </div>
//             </>
//           )}
//         </div>

//         {/* Réponses */}
//         {!isReply && showReplies.has(comment.id) && replies[comment.id] && (
//           <div className="mt-4 space-y-4">
//             {replies[comment.id].map(reply => (
//               <CommentItem
//                 key={reply.id}
//                 comment={reply}
//                 isReply={true}
//                 onReply={onReply}
//               />
//             ))}
            
//             {/* Formulaire de réponse */}
//             {replyingTo === comment.id && (
//               <div className="ml-4 md:ml-8 pl-3 md:pl-4 border-l-2 border-blue-200 dark:border-blue-500/30">
//                 <CommentForm
//                   onSubmit={(content) => addComment({ content, parent_id: comment.id })}
//                   onCancel={() => setReplyingTo(null)}
//                   placeholder={`Répondre à ${comment.user_name}...`}
//                   autoFocus
//                   compact
//                   formKey={`reply-${comment.id}`}
//                 />
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     )
//   }

//   if (loading) {
//     return (
//       <div className="space-y-4">
//         {[...Array(3)].map((_, i) => (
//           <div key={i} className={`${CARD} rounded-xl p-4 shadow-sm animate-pulse`}>
//             <div className="flex items-center space-x-3 mb-3">
//               <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
//               <div className="space-y-2 flex-1">
//                 <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div>
//                 <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-20"></div>
//               </div>
//             </div>
//             <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full mb-2"></div>
//             <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
//           </div>
//         ))}
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6 min-h-screen">
//       {/* En-tête de la section commentaires */}
//       <div className="flex items-center justify-between gap-3 flex-wrap">
//         <div className="flex items-center space-x-3">
//           <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10">
//             <FaComment className="text-blue-600 dark:text-blue-400" size={12} />
//           </div>
//           <div>
//             <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
//               Commentaires
//             </h2>
//             <p className="text-sm text-zinc-600 dark:text-zinc-400">
//               {comments.length} commentaire{comments.length !== 1 ? 's' : ''} • Participez à la conversation
//             </p>
//           </div>
//         </div>

//         {/* Bouton pour ajouter un commentaire */}
//         {currentUser && canComment && (
//           <button
//             onClick={() => setShowCommentForm(!showCommentForm)}
//             className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 hover:shadow-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm ${FOCUS}`}
//           >
//             <FaPlus size={12} />
//             <span className="hidden sm:inline">Commenter</span>
//             <span className="sm:hidden">+</span>
//           </button>
//         )}
//       </div>

//       {/* Formulaire principal de commentaire */}
//       {(showCommentForm || comments.length === 0) && (
//         <div className={`${CARD} rounded-xl p-4 md:p-6 shadow-sm transition-all duration-200`}>
//           <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-zinc-900 dark:text-zinc-50">
//             <FaRegComment />
//             <span>
//               {comments.length === 0 ? 'Commencer la discussion' : 'Laisser un commentaire'}
//             </span>
//           </h3>
          
//           {currentUser ? (
//             canComment ? (
//               <CommentForm
//                 onSubmit={(content) => addComment({ content })}
//                 placeholder={`Partagez vos pensées sur ce mémoire, ${currentUser.name}...`}
//                 autoFocus={comments.length === 0}
//                 formKey="main"
//               />
//             ) : (
//               <div className="text-center py-6 md:py-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 transition-all duration-200">
//                 <FaLock size={40} className="mx-auto mb-4 text-amber-500 dark:text-amber-400" />
//                 <h4 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
//                   Commentaires réservés
//                 </h4>
//                 <p className="mb-4 max-w-md mx-auto text-zinc-600 dark:text-zinc-400 px-4">
//                   Seuls les utilisateurs privilégiés peuvent ajouter des commentaires. 
//                   Contactez l'administration pour obtenir des droits de commentaire.
//                 </p>
//                 <div className="text-sm text-zinc-500 dark:text-zinc-400">
//                   <p>Vous pouvez toujours :</p>
//                   <ul className="mt-2 space-y-1">
//                     <li>• Lire les commentaires existants</li>
//                     <li>• Aimer les commentaires</li>
//                     <li>• Voir les réponses</li>
//                   </ul>
//                 </div>
//               </div>
//             )
//           ) : (
//             <div className="text-center py-6 md:py-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600">
//               <FaSignInAlt size={40} className="mx-auto mb-4 text-zinc-400 dark:text-zinc-500" />
//               <h4 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
//                 Discussion en cours
//               </h4>
//               <p className="mb-6 max-w-md mx-auto text-zinc-600 dark:text-zinc-400 px-4">
//                 Connectez-vous pour rejoindre la conversation, partager vos insights et poser vos questions sur ce mémoire.
//               </p>
//               <button
//                 onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
//                 className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-md flex items-center space-x-2 mx-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white ${FOCUS}`}
//               >
//                 <FaSignInAlt />
//                 <span>Se connecter pour commenter</span>
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Liste des commentaires */}
//       <div className="space-y-6 pb-8">
//         {comments.length === 0 && !showCommentForm ? (
//           <div className={`text-center py-12 ${CARD} rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 shadow-sm`}>
//             <FaComment size={48} className="mx-auto mb-4 text-zinc-400 dark:text-zinc-500" />
//             <h3 className="text-xl font-semibold mb-3 text-zinc-900 dark:text-zinc-50">
//               Aucun commentaire pour le moment
//             </h3>
//             <p className="mb-6 max-w-md mx-auto text-zinc-600 dark:text-zinc-400 px-4">
//               {currentUser && canComment 
//                 ? "Soyez le premier à partager vos réflexions sur ce mémoire. Votre commentaire pourrait aider d'autres lecteurs."
//                 : "Les commentaires seront visibles ici une fois que les utilisateurs privilégiés auront commencé la discussion."
//               }
//             </p>
//             {currentUser && canComment && (
//               <button
//                 onClick={() => setShowCommentForm(true)}
//                 className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-md flex items-center space-x-2 mx-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white ${FOCUS}`}
//               >
//                 <FaPlus />
//                 <span>Commencer la discussion</span>
//               </button>
//             )}
//           </div>
//         ) : (
//           comments.map(comment => (
//             <CommentItem
//               key={comment.id}
//               comment={comment}
//               onReply={handleReply}
//             />
//           ))
//         )}
//       </div>
//     </div>
//   )
// }

'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Comment, CommentFormData } from '@/types/comment'
import { useRouter } from 'next/navigation'
import {
  FaHeart,
  FaRegHeart,
  FaReply,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaCaretDown,
  FaCaretUp,
  FaSignInAlt,
  FaPlus,
  FaComment,
  FaRegComment,
  FaLock
} from 'react-icons/fa'

// Constantes de design (cohérentes avec le reste de l'app)
const CARD = 'rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
const FOCUS = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-500'

interface CommentSectionProps {
  tfcId: number
  currentUser: {
    id: string
    name: string
    profil_url?: string
    role: string
    privileged?: boolean
  } | null
}

const getInitials = (name: string) =>
  (name || '?')
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)

/* ------------------------------------------------------------------ */
/* Formulaire : composant STABLE (défini hors de CommentSection)       */
/* ------------------------------------------------------------------ */
interface CommentFormProps {
  onSubmit: (content: string) => Promise<boolean | void> | boolean | void
  onCancel?: () => void
  initialContent?: string
  placeholder?: string
  autoFocus?: boolean
  compact?: boolean
  submitLabel?: string
}

function CommentForm({
  onSubmit,
  onCancel,
  initialContent = '',
  placeholder = 'Ajouter un commentaire...',
  autoFocus = false,
  compact = false,
  submitLabel = 'Publier'
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent)
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)

  // Focus + scroll une seule fois au montage (laisse le temps au clavier de s'ouvrir)
  useEffect(() => {
    if (!autoFocus) return
    const t = setTimeout(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus({ preventScroll: true })
      const len = el.value.length
      try { el.setSelectionRange(len, len) } catch {}
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = content.trim()
    if (!value || submitting) return

    setSubmitting(true)
    try {
      const result = await onSubmit(value)
      // On vide seulement si l'envoi a réussi
      if (result !== false) setContent('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`space-y-3 ${compact ? 'bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg' : ''}`}
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={compact ? 3 : 4}
        // text-base (16px) : évite le zoom automatique d'iOS au focus
        className={`w-full p-3 text-base border border-zinc-300 dark:border-zinc-700 rounded-lg resize-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-500 ${FOCUS}`}
        style={{ minHeight: compact ? '72px' : '96px' }}
      />
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium text-zinc-700 dark:text-zinc-300 ${FOCUS}`}
          >
            <FaTimes className="inline mr-1" />
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className={`px-4 py-2 text-sm text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 hover:shadow-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 ${FOCUS}`}
        >
          <FaCheck className="inline mr-1" />
          {submitting ? 'Envoi...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* Section commentaires                                                */
/* ------------------------------------------------------------------ */
export default function CommentSection({ tfcId, currentUser }: CommentSectionProps) {
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set())
  const [replies, setReplies] = useState<Record<string, Comment[]>>({})
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [notice, setNotice] = useState<{ message: string; login?: boolean } | null>(null)

  const canComment = currentUser?.privileged || false
  const loginUrl = () =>
    `/auth/login?redirect=${encodeURIComponent(
      typeof window !== 'undefined' ? window.location.pathname : ''
    )}`

  // Vérification d'accès SANS alert/confirm (souvent bloqués sur mobile / webviews)
  const requireAuth = (action: string, needsPrivilege = false): boolean => {
    if (!currentUser) {
      setNotice({ message: `Veuillez vous connecter pour ${action}.`, login: true })
      return false
    }
    if (needsPrivilege && !currentUser.privileged) {
      setNotice({ message: 'Seuls les utilisateurs privilégiés peuvent ajouter des commentaires.' })
      return false
    }
    setNotice(null)
    return true
  }

  // Récupère les likes de l'utilisateur en UNE requête
  const fetchLikedIds = async (ids: string[]): Promise<Set<string>> => {
    if (!currentUser || ids.length === 0) return new Set()
    const { data } = await supabase
      .from('tfc_comment_likes')
      .select('comment_id')
      .eq('user_id', currentUser.id)
      .in('comment_id', ids)
    return new Set((data || []).map((l: any) => l.comment_id))
  }

  // Charger les commentaires (silent = ne pas afficher les squelettes)
  const loadComments = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true)

        let rows: any[] = []
        const { data, error } = await supabase
          .from('tfc_comments_with_users')
          .select('*')
          .eq('tfc_id', tfcId)
          .is('parent_id', null)
          .order('created_at', { ascending: false })

        if (error) {
          // Fallback si la vue n'existe pas
          const { data: raw, error: rawError } = await supabase
            .from('tfc_comments')
            .select(`*, users:user_id (id, name, profil_url, role)`)
            .eq('tfc_id', tfcId)
            .is('parent_id', null)
            .order('created_at', { ascending: false })
          if (rawError) throw rawError

          rows = await Promise.all(
            (raw || []).map(async (c: any) => {
              const { count } = await supabase
                .from('tfc_comments')
                .select('id', { count: 'exact', head: true })
                .eq('parent_id', c.id)
              return {
                ...c,
                user_name: c.users?.name,
                user_profil_url: c.users?.profil_url,
                user_role: c.users?.role,
                replies_count: count || 0
              }
            })
          )
        } else {
          rows = data || []
        }

        const liked = await fetchLikedIds(rows.map(r => r.id))

        setComments(
          rows.map(c => ({
            id: c.id,
            content: c.content,
            likes_count: c.likes_count || 0,
            created_at: c.created_at,
            updated_at: c.updated_at,
            user_id: c.user_id,
            user_name: c.user_name,
            user_profil_url: c.user_profil_url,
            user_role: c.user_role,
            parent_id: c.parent_id,
            has_liked: liked.has(c.id),
            current_user_id: currentUser?.id || null,
            replies_count: c.replies_count || 0
          }))
        )
      } catch (err) {
        console.error('Erreur lors du chargement des commentaires:', err)
        setComments([])
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tfcId, currentUser?.id]
  )

  // Charger les réponses d'un commentaire
  const loadReplies = useCallback(
    async (commentId: string) => {
      try {
        const { data, error } = await supabase
          .from('tfc_comments')
          .select(`*, users:user_id (id, name, profil_url, role)`)
          .eq('parent_id', commentId)
          .order('created_at', { ascending: true })

        if (error) throw error

        const liked = await fetchLikedIds((data || []).map((r: any) => r.id))

        const formatted: Comment[] = (data || []).map((r: any) => ({
          id: r.id,
          content: r.content,
          likes_count: r.likes_count || 0,
          created_at: r.created_at,
          updated_at: r.updated_at,
          user_id: r.user_id,
          user_name: r.users?.name,
          user_profil_url: r.users?.profil_url,
          user_role: r.users?.role,
          parent_id: r.parent_id,
          has_liked: liked.has(r.id),
          current_user_id: currentUser?.id || null,
          replies_count: 0
        }))

        setReplies(prev => ({ ...prev, [commentId]: formatted }))
      } catch (err) {
        console.error('Erreur lors du chargement des réponses:', err)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser?.id]
  )

  useEffect(() => {
    loadComments()
  }, [loadComments])

  // Rechargement silencieux (commentaires + réponses ouvertes)
  const refreshAll = async () => {
    await loadComments(true)
    await Promise.all(Array.from(showReplies).map(id => loadReplies(id)))
  }

  // Ajouter un commentaire / une réponse
  const addComment = async (formData: CommentFormData): Promise<boolean> => {
    if (!requireAuth(formData.parent_id ? 'répondre' : 'commenter', true)) return false

    try {
      const { error } = await supabase
        .from('tfc_comments')
        .insert({
          tfc_id: tfcId,
          user_id: currentUser!.id,
          content: formData.content,
          parent_id: formData.parent_id || null
        })

      if (error) throw error

      if (formData.parent_id) {
        const parentId = formData.parent_id
        setShowReplies(prev => new Set(prev).add(parentId))
        await loadReplies(parentId)
        setReplyingTo(null)
      } else {
        setShowCommentForm(false)
      }
      await loadComments(true)
      return true
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire:", err)
      setNotice({ message: "Erreur lors de l'ajout du commentaire. Réessayez." })
      return false
    }
  }

  // Modifier un commentaire
  const updateComment = async (commentId: string, content: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tfc_comments')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', commentId)

      if (error) throw error

      setEditingComment(null)
      await refreshAll()
      return true
    } catch (err) {
      console.error('Erreur lors de la modification du commentaire:', err)
      setNotice({ message: 'Erreur lors de la modification du commentaire.' })
      return false
    }
  }

  // Supprimer un commentaire
  const deleteComment = async (commentId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return

    try {
      const { error } = await supabase.from('tfc_comments').delete().eq('id', commentId)
      if (error) throw error
      await refreshAll()
    } catch (err) {
      console.error('Erreur lors de la suppression du commentaire:', err)
      setNotice({ message: 'Erreur lors de la suppression du commentaire.' })
    }
  }

  // Like / Unlike
  const toggleLike = async (commentId: string) => {
    if (!requireAuth('aimer un commentaire')) return

    try {
      const { data: existingLike } = await supabase
        .from('tfc_comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', currentUser!.id)
        .maybeSingle()

      if (existingLike) {
        const { error } = await supabase
          .from('tfc_comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', currentUser!.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('tfc_comment_likes')
          .insert({ comment_id: commentId, user_id: currentUser!.id })
        if (error) throw error
      }

      await refreshAll()
    } catch (err) {
      console.error('Erreur lors du like:', err)
    }
  }

  const handleReply = (commentId: string) => {
    if (!requireAuth('répondre', true)) return
    setReplyingTo(commentId)
  }

  const toggleReplies = async (commentId: string) => {
    const next = new Set(showReplies)
    if (next.has(commentId)) {
      next.delete(commentId)
    } else {
      next.add(commentId)
      if (!replies[commentId]) await loadReplies(commentId)
    }
    setShowReplies(next)
  }

  // Rendu d'un commentaire (fonction, PAS un composant => pas de remontage)
  const renderComment = (comment: Comment, isReply = false): React.ReactNode => {
    const isOwner = !!currentUser && comment.user_id === currentUser.id
    const canEdit = isOwner
    const canDelete = isOwner || currentUser?.role === 'admin'
    const repliesOpen = showReplies.has(comment.id)

    return (
      <div
        key={comment.id}
        className={`${isReply ? 'ml-4 md:ml-8 pl-3 md:pl-4 border-l-2 border-blue-200 dark:border-blue-500/30' : ''}`}
      >
        <div
          className={`${CARD} rounded-xl p-4 transition-shadow duration-200 hover:shadow-sm ${
            isReply ? 'border-l-4 border-l-blue-300 dark:border-l-blue-600' : 'shadow-sm'
          }`}
        >
          {/* En-tête */}
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex items-center space-x-3 min-w-0">
              {comment.user_profil_url ? (
                <img
                  src={comment.user_profil_url}
                  alt="Photo de profil"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-blue-200 dark:border-blue-500/30 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold shadow-sm bg-blue-600 dark:bg-blue-500 shrink-0">
                  {getInitials(comment.user_name)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                    {comment.user_name}
                  </span>
                  {comment.user_role === 'admin' && (
                    <span className="px-2 py-0.5 text-xs rounded-full font-medium ring-1 ring-inset bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                      Admin
                    </span>
                  )}
                </div>
                <div className="text-xs flex items-center space-x-2 text-zinc-500 dark:text-zinc-400 flex-wrap">
                  <span>
                    {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {comment.updated_at !== comment.created_at && (
                    <span className="italic">(modifié)</span>
                  )}
                </div>
              </div>
            </div>

            {(canEdit || canDelete) && (
              <div className="flex items-center space-x-1 shrink-0">
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setEditingComment(comment.id)}
                    className={`p-2 rounded-lg transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 ${FOCUS}`}
                    title="Modifier"
                  >
                    <FaEdit size={14} />
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => deleteComment(comment.id)}
                    className={`p-2 rounded-lg transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 ${FOCUS}`}
                    title="Supprimer"
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Contenu */}
          {editingComment === comment.id ? (
            <CommentForm
              onSubmit={(content) => updateComment(comment.id, content)}
              onCancel={() => setEditingComment(null)}
              initialContent={comment.content}
              placeholder="Modifier votre commentaire..."
              submitLabel="Enregistrer"
              autoFocus
              compact
            />
          ) : (
            <>
              <div className="mb-4">
                <p className="whitespace-pre-wrap break-words leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {comment.content}
                </p>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2 md:space-x-4">
                  <button
                    type="button"
                    onClick={() => toggleLike(comment.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${FOCUS} ${
                      comment.has_liked
                        ? 'text-red-500 bg-red-50 dark:bg-red-500/10 shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                    title="Aimer"
                  >
                    {comment.has_liked ? <FaHeart /> : <FaRegHeart />}
                    <span className="text-sm font-medium">{comment.likes_count}</span>
                  </button>

                  {!isReply && (
                    <button
                      type="button"
                      onClick={() => handleReply(comment.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-zinc-500 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 ${FOCUS}`}
                      title="Répondre"
                    >
                      <FaReply />
                      <span className="text-sm font-medium hidden sm:inline">Répondre</span>
                    </button>
                  )}
                </div>

                {!isReply && comment.replies_count > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleReplies(comment.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 ${FOCUS}`}
                  >
                    {repliesOpen ? <FaCaretUp /> : <FaCaretDown />}
                    <span className="text-sm font-medium">
                      {repliesOpen ? 'Masquer' : 'Afficher'} {comment.replies_count} réponse
                      {comment.replies_count > 1 ? 's' : ''}
                    </span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Réponses + formulaire de réponse (indépendants l'un de l'autre) */}
        {!isReply && (
          <>
            {repliesOpen && replies[comment.id] && replies[comment.id].length > 0 && (
              <div className="mt-4 space-y-4">
                {replies[comment.id].map(reply => renderComment(reply, true))}
              </div>
            )}

            {replyingTo === comment.id && (
              <div className="mt-4 ml-4 md:ml-8 pl-3 md:pl-4 border-l-2 border-blue-200 dark:border-blue-500/30">
                <CommentForm
                  onSubmit={(content) => addComment({ content, parent_id: comment.id })}
                  onCancel={() => setReplyingTo(null)}
                  placeholder={`Répondre à ${comment.user_name}...`}
                  autoFocus
                  compact
                />
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`${CARD} rounded-xl p-4 shadow-sm animate-pulse`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div>
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-20"></div>
              </div>
            </div>
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full mb-2"></div>
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bannière d'information (remplace alert/confirm) */}
      {notice && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 flex-wrap rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
        >
          <span>{notice.message}</span>
          <div className="flex items-center gap-2">
            {notice.login && (
              <button
                type="button"
                onClick={() => router.push(loginUrl())}
                className={`px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 ${FOCUS}`}
              >
                Se connecter
              </button>
            )}
            <button
              type="button"
              onClick={() => setNotice(null)}
              className={`p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 ${FOCUS}`}
              aria-label="Fermer"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10">
            <FaComment className="text-blue-600 dark:text-blue-400" size={12} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Commentaires</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {comments.length} commentaire{comments.length !== 1 ? 's' : ''} • Participez à la conversation
            </p>
          </div>
        </div>

        {currentUser && canComment && (
          <button
            type="button"
            onClick={() => setShowCommentForm(v => !v)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 hover:shadow-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm ${FOCUS}`}
          >
            <FaPlus size={12} />
            <span className="hidden sm:inline">Commenter</span>
            <span className="sm:hidden">Commenter</span>
          </button>
        )}
      </div>

      {/* Formulaire principal */}
      {(showCommentForm || comments.length === 0) && (
        <div className={`${CARD} rounded-xl p-4 md:p-6 shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-zinc-900 dark:text-zinc-50">
            <FaRegComment />
            <span>{comments.length === 0 ? 'Commencer la discussion' : 'Laisser un commentaire'}</span>
          </h3>

          {currentUser ? (
            canComment ? (
              <CommentForm
                onSubmit={(content) => addComment({ content })}
                placeholder={`Partagez vos pensées sur ce mémoire, ${currentUser.name}...`}
                autoFocus={showCommentForm && comments.length > 0}
              />
            ) : (
              <div className="text-center py-6 md:py-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950/50">
                <FaLock size={40} className="mx-auto mb-4 text-amber-500 dark:text-amber-400" />
                <h4 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
                  Commentaires réservés
                </h4>
                <p className="mb-4 max-w-md mx-auto text-zinc-600 dark:text-zinc-400 px-4">
                  Seuls les utilisateurs privilégiés peuvent ajouter des commentaires. Contactez
                  l&apos;administration pour obtenir des droits de commentaire.
                </p>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  <p>Vous pouvez toujours :</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Lire les commentaires existants</li>
                    <li>• Aimer les commentaires</li>
                    <li>• Voir les réponses</li>
                  </ul>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-6 md:py-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
              <FaSignInAlt size={40} className="mx-auto mb-4 text-zinc-400 dark:text-zinc-500" />
              <h4 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
                Discussion en cours
              </h4>
              <p className="mb-6 max-w-md mx-auto text-zinc-600 dark:text-zinc-400 px-4">
                Connectez-vous pour rejoindre la conversation, partager vos insights et poser vos
                questions sur ce mémoire.
              </p>
              <button
                type="button"
                onClick={() => router.push(loginUrl())}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-md flex items-center space-x-2 mx-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white ${FOCUS}`}
              >
                <FaSignInAlt />
                <span>Se connecter pour commenter</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Liste */}
      <div className="space-y-6 pb-8">
        {comments.length === 0 && !showCommentForm ? (
          <div className={`text-center py-12 ${CARD} rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 shadow-sm`}>
            <FaComment size={48} className="mx-auto mb-4 text-zinc-400 dark:text-zinc-500" />
            <h3 className="text-xl font-semibold mb-3 text-zinc-900 dark:text-zinc-50">
              Aucun commentaire pour le moment
            </h3>
            <p className="mb-6 max-w-md mx-auto text-zinc-600 dark:text-zinc-400 px-4">
              {currentUser && canComment
                ? "Soyez le premier à partager vos réflexions sur ce mémoire. Votre commentaire pourrait aider d'autres lecteurs."
                : 'Les commentaires seront visibles ici une fois que les utilisateurs privilégiés auront commencé la discussion.'}
            </p>
            {currentUser && canComment && (
              <button
                type="button"
                onClick={() => setShowCommentForm(true)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-md flex items-center space-x-2 mx-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white ${FOCUS}`}
              >
                <FaPlus />
                <span>Commencer la discussion</span>
              </button>
            )}
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  )
}
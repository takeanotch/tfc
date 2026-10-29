
// // 'use client'
// // import { useAuth } from '@/hooks/useAuth'
// // import PDFPreviewer from '@/components/PDFPreviewer'
// // import { useState, useEffect, useRef } from 'react'
// // import { useRouter } from 'next/navigation'
// // import { supabase } from '@/lib/supabase'
// // import AddReferenceModal from '@/components/AddReferenceModal'
// // import { TFC } from '@/lib/gen'
// // import { 
// //   FaFilePdf, 
// //   FaDownload, 
// //   FaCalendarAlt, 
// //   FaUserGraduate, 
// //   FaChalkboardTeacher, 
// //   FaUniversity, 
// //   FaBuilding, 
// //   FaGraduationCap, 
// //   FaArrowLeft,
// //   FaClipboardList,
// //   FaUser,
// //   FaPlus,
// //   FaLink,
// //   FaClock,
// //   FaInfoCircle,
// //   FaTh,
// //   FaFileAlt,
// //   FaNetworkWired,
// //   FaComments,
// //   FaCode,
// //   FaCogs,
// //   FaEye,
// //   FaExclamationTriangle, // ⭐ AJOUTÉ POUR L'ICON D'AVERTISSEMENT
// //   FaCheckCircle
// // } from 'react-icons/fa'
// // import CommentSection from '@/components/CommentSection'
// // import { CheckCircle, Loader2Icon, LoaderCircle, LoaderIcon } from 'lucide-react'
// // import { motion, AnimatePresence } from 'framer-motion'
// // import TFCReferencesTabs from '@/components/TFCReferencesTabs'
// // import { IconType } from 'react-icons'
// // import RouteLoader from '@/components/RouteLoader'
// // import PinButton from '@/components/PinButton'
// // import { CheckBadgeIcon } from '@heroicons/react/24/solid'

// // // Fonction pour obtenir les initiales
// // const getInitials = (name: string) =>
// //   name
// //     .split(' ')
// //     .map(part => part.charAt(0).toUpperCase())
// //     .join('')
// //     .slice(0, 2)

// // interface TFCDetailPageProps {
// //   params: Promise<{
// //     id: string
// //   }>
// // }

// // interface TFCReference {
// //   id: number
// //   titre: string
// //   auteur: string
// //   annee: string
// //   note?: number
// //   faculte: string
// //   type: 'reference' | 'referenced_by'
// // }

// // type TabType = 'overview' | 'comments' | 'document' | 'references'

// // interface TabConfig {
// //   id: TabType
// //   label: string
// //   icon: IconType
// //   mobileLabel: string
// // }

// // export default function TFCDetailPage({ params }: TFCDetailPageProps) {
// //   const router = useRouter()
// //   const [tfc, setTfc] = useState<TFC | null>(null)
// //   const [loading, setLoading] = useState(true)
// //   const [downloading, setDownloading] = useState(false)
// //   const [references, setReferences] = useState<TFCReference[]>([])
// //   const [referencedBy, setReferencedBy] = useState<TFCReference[]>([])
// //   const [showAddReferenceModal, setShowAddReferenceModal] = useState(false)
// //   const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
// //   const [activeTab, setActiveTab] = useState<TabType>('overview')
// //   const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

// //   const [showPdfPreview, setShowPdfPreview] = useState(false)
// //   const [pdfUrl, setPdfUrl] = useState('')
// //   const { user, loading: sessionLoading } = useAuth()

// //   // ⭐⭐⭐ AJOUT: État pour le nombre de vues ⭐⭐⭐
// //   const [viewCount, setViewCount] = useState<number>(0)

// //   const tabRefs = {
// //     overview: useRef<HTMLButtonElement>(null),
// //     comments: useRef<HTMLButtonElement>(null),
// //     document: useRef<HTMLButtonElement>(null),
// //     references: useRef<HTMLButtonElement>(null)
// //   }

// //   // Couleurs pour light mode
// //   const lightColors = {
// //     primary: '#3B82F6',
// //     secondary: '#6B7280',
// //     success: '#10B981',
// //     warning: '#F59E0B',
// //     error: '#EF4444',
// //     background: '#F9FAFB',
// //     surface: '#FFFFFF',
// //     text: {
// //       primary: '#111827',
// //       secondary: '#6B7280',
// //       light: '#9CA3AF'
// //     },
// //     border: '#E5E7EB'
// //   }

// //   // Couleurs pour dark mode
// //   const darkColors = {
// //     primary: '#60A5FA',
// //     secondary: '#9CA3AF',
// //     success: '#34D399',
// //     warning: '#FBBF24',
// //     error: '#F87171',
// //     background: '#111827',
// //     surface: '#1F2937',
// //     text: {
// //       primary: '#F9FAFB',
// //       secondary: '#D1D5DB',
// //       light: '#9CA3AF'
// //     },
// //     border: '#374151'
// //   }

// //   // Fonction pour déterminer les couleurs en fonction du mode
// //   const getColors = () => {
// //     if (typeof window === 'undefined') return lightColors
    
// //     const isDarkMode = document.documentElement.classList.contains('dark')
// //     return isDarkMode ? darkColors : lightColors
// //   }

// //   const [colors, setColors] = useState(lightColors)

// //   useEffect(() => {
// //     const updateColors = () => {
// //       setColors(getColors())
// //     }

// //     // Initialiser les couleurs
// //     updateColors()

// //     // Observer les changements de classe sur l'élément html
// //     const observer = new MutationObserver(updateColors)
// //     observer.observe(document.documentElement, {
// //       attributes: true,
// //       attributeFilter: ['class']
// //     })

// //     return () => observer.disconnect()
// //   }, [])

// //   useEffect(() => {
// //     const resolveParams = async () => {
// //       const resolved = await params
// //       setResolvedParams(resolved)
// //     }
    
// //     resolveParams()
// //   }, [params])

// //   useEffect(() => {
// //     if (resolvedParams) {
// //       loadTFC()
// //     }
// //   }, [resolvedParams])

// //   useEffect(() => {
// //     if (tfc) {
// //       loadReferences()
// //       // ⭐⭐⭐ AJOUT: Initialiser le compteur de vues depuis les données TFC ⭐⭐⭐
// //       if (tfc.nombre_vues) {
// //         setViewCount(tfc.nombre_vues)
// //       }
// //     }
// //   }, [tfc])

// //   // ⭐⭐⭐ AJOUT: Fonction pour enregistrer une vue ⭐⭐⭐
// //   const enregistrerVue = async () => {
// //     if (!user?.id || !resolvedParams?.id) return;
    
// //     try {
// //       const response = await fetch(`/api/tfc/${resolvedParams.id}/vue`, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //       });

// //       if (response.ok) {
// //         const data = await response.json();
// //         setViewCount(data.nombreVues);
// //       }
// //     } catch (error) {
// //       console.error('Erreur enregistrement vue:', error);
// //     }
// //   };

// //   // ⭐⭐⭐ AJOUT: Effet pour enregistrer la vue quand le TFC est chargé ET utilisateur connecté ⭐⭐⭐
// //   useEffect(() => {
// //     if (tfc && user?.id && !sessionLoading) {
// //       console.log('✅ Enregistrement de la vue pour le TFC:', tfc.id, 'par utilisateur:', user.id);
// //       enregistrerVue();
// //     }
// //   }, [tfc, user?.id, sessionLoading]);

// //   useEffect(() => {
// //     const updateIndicator = () => {
// //       const activeTabRef = tabRefs[activeTab].current
// //       console.log('Active tab ref:', activeTabRef)
// //       if (activeTabRef) {
// //         const { offsetLeft, offsetWidth } = activeTabRef
// //         console.log('Indicator position:', { left: offsetLeft, width: offsetWidth })
// //         setIndicatorStyle({
// //           left: offsetLeft,
// //           width: offsetWidth
// //         })
// //       }
// //     }

// //     const timer = setTimeout(updateIndicator, 100)
// //     window.addEventListener('resize', updateIndicator)
    
// //     return () => {
// //       clearTimeout(timer)
// //       window.removeEventListener('resize', updateIndicator)
// //     }
// //   }, [activeTab])

// //   interface TFCLight {
// //     id: number
// //     titre: string
// //     auteur: string
// //     note?: number
// //     annees_academiques?: { annee: string } | null
// //     facultes?: { nom: string } | null
// //   }

// //   const loadReferences = async () => {
// //     if (!tfc) return

// //     try {
// //       const { data: referencesData, error: refError } = await supabase
// //         .from('tfc_references')
// //         .select(`
// //           tfc:tfc_reference_id (
// //             id,
// //             titre,
// //             auteur,
// //             note,
// //             annees_academiques:annee_academique_id (annee),
// //             facultes:faculte_id (nom)
// //           )
// //         `)
// //         .eq('tfc_source_id', tfc.id)
// //         .returns<{ tfc: TFCLight }[]>()

// //       if (refError) throw refError

// //       const { data: referencedByData, error: refByError } = await supabase
// //         .from('tfc_references')
// //         .select(`
// //           tfc:tfc_source_id (
// //             id,
// //             titre,
// //             auteur,
// //             note,
// //             annees_academiques:annee_academique_id (annee),
// //             facultes:faculte_id (nom)
// //           )
// //         `)
// //         .eq('tfc_reference_id', tfc.id)
// //         .returns<{ tfc: TFCLight }[]>()

// //       if (refByError) throw refByError

// //       const refs: TFCReference[] = (referencesData || []).map(item => ({
// //         id: item.tfc.id,
// //         titre: item.tfc.titre,
// //         auteur: item.tfc.auteur,
// //         annee: item.tfc.annees_academiques?.annee || 'N/A',
// //         note: item.tfc.note,
// //         faculte: item.tfc.facultes?.nom || 'N/A',
// //         type: 'reference'
// //       }))

// //       const refBy: TFCReference[] = (referencedByData || []).map(item => ({
// //         id: item.tfc.id,
// //         titre: item.tfc.titre,
// //         auteur: item.tfc.auteur,
// //         annee: item.tfc.annees_academiques?.annee || 'N/A',
// //         note: item.tfc.note,
// //         faculte: item.tfc.facultes?.nom || 'N/A',
// //         type: 'referenced_by'
// //       }))

// //       setReferences(refs)
// //       setReferencedBy(refBy)
// //     } catch (error) {
// //       console.error('Erreur lors du chargement des références:', error)
// //     }
// //   }

// //   const loadTFC = async () => {
// //     if (!resolvedParams) return

// //     try {
// //       const { data, error } = await supabase
// //         .from('tfc')
// //         .select(`
// //           *,
// //           facultes:faculte_id(nom, code),
// //           annees_academiques:annee_academique_id(annee),
// //           departements:departement_id(nom, code),
// //           filieres:filiere_id(nom, code),
// //           users:added_by_user_id(name, username, email,profil_url)
// //         `)
// //         .eq('id', resolvedParams.id)
// //         .single()

// //       if (error) throw error
// //       setTfc(data)
// //     } catch (error) {
// //       console.error('Erreur lors du chargement du TFC:', error)
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const downloadTFC = async () => {
// //     if (!tfc || !tfc.doc_available) return
    
// //     try {
// //       setDownloading(true)
// //       const { data } = supabase.storage
// //         .from('tfc-bucket')
// //         .getPublicUrl(tfc.fichier_chemin)

// //       if (data?.publicUrl) {
// //         window.open(data.publicUrl, '_blank')
// //       }
// //     } catch (error) {
// //       console.error('Erreur lors du téléchargement:', error)
// //     } finally {
// //       setDownloading(false)
// //     }
// //   }

// //   const previewTFC = async () => {
// //     if (!tfc || !tfc.doc_available) return
    
// //     try {
// //       setDownloading(true)
// //       const { data } = supabase.storage
// //         .from('tfc-bucket')
// //         .getPublicUrl(tfc.fichier_chemin)

// //       if (data?.publicUrl) {
// //         setPdfUrl(data.publicUrl)
// //         setShowPdfPreview(true)
// //       }
// //     } catch (error) {
// //       console.error('Erreur lors de la prévisualisation:', error)
// //     } finally {
// //       setDownloading(false)
// //     }
// //   }

// //   const formatFileSize = (bytes: number) => {
// //     const mb = bytes / (1024 * 1024)
// //     return `${mb.toFixed(1)} MB`
// //   }

// //   const formatDate = (dateString: string) => {
// //     return new Date(dateString).toLocaleDateString('fr-FR', {
// //       year: 'numeric',
// //       month: 'long',
// //       day: 'numeric'
// //     })
// //   }

// //   const formatDateTime = (dateString: string) => {
// //     return new Date(dateString).toLocaleDateString('fr-FR', {
// //       year: 'numeric',
// //       month: 'short',
// //       day: 'numeric',
// //       hour: '2-digit',
// //       minute: '2-digit'
// //     })
// //   }

// //   const tabs: TabConfig[] = [
// //     {
// //       id: 'overview',
// //       label: 'Vue générale',
// //       icon: FaInfoCircle,
// //       mobileLabel: 'Général'
// //     },
// //     {
// //       id: 'comments',
// //       label: 'Commentaires',
// //       icon: FaComments,
// //       mobileLabel: 'Commentaires'
// //     },
// //     {
// //       id: 'document',
// //       label: 'Document',
// //       icon: FaFileAlt,
// //       mobileLabel: 'Document'
// //     },
// //     {
// //       id: 'references',
// //       label: 'Références',
// //       icon: FaNetworkWired,
// //       mobileLabel: 'Références'
// //     }
// //   ]

// //   if (sessionLoading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
// //         {/* <div className="text-center animate-spin">
// //           <LoaderIcon className='text-3xl block size-[38px] text-blue-600 dark:text-blue-400'/>
// //         </div> */}
// //         <RouteLoader />
// //       </div>
// //     )
// //   }

// //   if (!resolvedParams && loading) {
// //     return (
// //       <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
// //         <div className="max-w-4xl mx-auto px-4 py-8">
// //           <div className="animate-pulse space-y-6">
// //             <div className="flex items-center space-x-4 mb-8">
// //               <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
// //               <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
// //             </div>
// //             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
// //               <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     )
// //   }

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
// //         <div className="max-w-4xl mx-auto px-4 py-8">
// //           <div className="animate-pulse space-y-6">
// //             <div className="flex items-center space-x-4 mb-8">
// //               <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
// //               <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
// //             </div>

// //             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
// //               <div className="flex justify-between mb-6">
// //                 <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
// //                 <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
// //               </div>
// //               <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
// //               <div className="grid md:grid-cols-2 gap-4">
// //                 {[...Array(4)].map((_, i) => (
// //                   <div key={i} className="space-y-2">
// //                     <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
// //                     <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     )
// //   }

// //   if (!tfc) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
// //         <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
// //           <div className="text-4xl mb-4">📄</div>
// //           <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">TFC non trouvé</h2>
// //           <p className="mb-6 text-gray-600 dark:text-gray-400">Le travail de fin de cycle que vous recherchez n'existe pas.</p>
// //           <button
// //             onClick={() => router.back()}
// //             className="px-6 py-2 rounded font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
// //           >
// //             Retour à l'explorateur
// //           </button>
// //         </div>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
// //       {showPdfPreview && (
// //         <PDFPreviewer
// //           fileUrl={pdfUrl}
// //           fileName={tfc.fichier_nom}
// //           onClose={() => setShowPdfPreview(false)}
// //         />
// //       )}
      
// //       <div className="max-w-4xl mx-auto px-4 py-8">
// //         {/* Version Desktop - Bouton retour et tabs sur la même ligne */}
// //         <div className="hidden md:flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2 mb-8 transition-colors duration-200">
// //           {/* Bouton de retour */}
// //           <button
// //             onClick={() => router.back()}
// //             className="flex items-center space-x-3 px-4 py-2 group transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
// //           >
// //             <div 
// //               className="w-8 h-8 rounded flex items-center justify-center transition-colors border border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500"
// //             >
// //               <FaArrowLeft className="text-blue-600 dark:text-blue-400" size={14} />
// //             </div>
// //             <span className="text-sm text-gray-600 dark:text-gray-400">
// //               Retour
// //             </span>
// //           </button>

// //           {/* Navigation par onglets */}
// //           <div className="flex-1 relative px-4">
// //             <div className="flex justify-center">
// //               {tabs.map((tab) => {
// //                 const Icon = tab.icon
// //                 return (
// //                   <button
// //                     key={tab.id}
// //                     ref={tabRefs[tab.id]}
// //                     onClick={() => setActiveTab(tab.id)}
// //                     className={`flex items-center justify-center space-x-2 px-6 py-3 font-medium transition-colors relative text-sm ${
// //                       activeTab === tab.id 
// //                         ? 'text-blue-600 dark:text-blue-400' 
// //                         : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
// //                     }`}
// //                   >
// //                     <Icon size={14} />
// //                     <span>{tab.label}</span>
// //                   </button>
// //                 )
// //               })}
// //             {/* Indicateur animé - CORRIGÉ */}
// //             <motion.div
// //               className="absolute bottom-0 h-0.5 bg-blue-600 dark:bg-blue-400"
// //               initial={false}
// //               animate={{
// //                 left: indicatorStyle.left,
// //                 width: indicatorStyle.width
// //               }}
// //               transition={{ type: "spring", stiffness: 300, damping: 30 }}
// //             />
// //             </div>
            
// //           </div>

// //           {/* Espace vide pour équilibrer la mise en page */}
// //           <div className="w-32"></div>
// //         </div>

// //         {/* Version Mobile - Bouton retour au-dessus et tabs en dessous */}
// //         <div className="md:hidden space-y-4 mb-8">
// //           {/* Bouton de retour */}
// //           <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
// //             <button
// //               onClick={() => router.back()}
// //               className="flex items-center space-x-3 group transition-colors"
// //             >
// //               <div 
// //                 className="w-10 h-10 rounded flex items-center justify-center transition-colors group-hover:bg-gray-50 dark:group-hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
// //               >
// //                 <FaArrowLeft className="text-blue-600 dark:text-blue-400" />
// //               </div>
// //               <div>
// //                 <div className="text-sm font-medium text-gray-900 dark:text-white">
// //                   Retour
// //                 </div>
// //                 <div className="text-xs text-gray-600 dark:text-gray-400">
// //                   {tfc.titre.length > 40 ? `${tfc.titre.substring(0, 40)}...` : tfc.titre}
// //                 </div>
// //               </div>
// //             </button>
// //           </div>

// //           {/* Navigation par onglets mobile - toujours visible */}
// //           <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
// //             <div className="flex relative">
// //               {tabs.map((tab) => {
// //                 const Icon = tab.icon
// //                 return (
// //                   <button
// //                     key={tab.id}
// //                     ref={tabRefs[tab.id]}
// //                     onClick={() => setActiveTab(tab.id)}
// //                     className={`flex-1 flex flex-col items-center justify-center p-3 font-medium transition-colors relative ${
// //                       activeTab === tab.id 
// //                         ? 'text-blue-600 dark:text-blue-400' 
// //                         : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
// //                     }`}
// //                   >
// //                     <Icon size={16} className="mb-1" />
// //                     <span className="text-xs text-center leading-tight">{tab.mobileLabel}</span>
// //                   </button>
// //                 )
// //               })}
              
// //               {/* Indicateur animé pour mobile */}
// //               <motion.div
// //                 className="absolute bottom-0 h-1 bg-blue-600 dark:bg-blue-400"
// //                 initial={false}
// //                 animate={{
// //                   left: indicatorStyle.left,
// //                   width: indicatorStyle.width
// //                 }}
// //                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
// //               />
// //             </div>
// //           </div>
// //         </div>

// //         {/* Contenu des onglets avec animation */}
// //         <AnimatePresence mode="wait">
// //           <motion.div
// //             key={activeTab}
// //             initial={{ opacity: 0, y: 20 }}
// //             animate={{ opacity: 1, y: 0 }}
// //             exit={{ opacity: 0, y: -20 }}
// //             transition={{ duration: 0.2 }}
// //           >
// //             {/* Onglet Vue générale */}
// //             {activeTab === 'overview' && (
// //               <div className="space-y-6">
// //                 {/* Carte principale simplifiée */}
// //                 <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
// //                   <div className="flex justify-between items-start mb-6">
// //                     <div className="flex-1">
// //                       <span 
// //                         className="w-max items-center gap-1 p-2 flex dark:bg-green-700/20 bg-green-600/10 text-green-600  rounded-lg text-sm font-medium mb-4"
                        
// //                       ><FaCheckCircle/>
// //                         {tfc.statut}
// //                       </span>
// //                     </div>
                     
                    
// //                     {/* {tfc.note && (
// //                       <div className="text-right ml-4">
// //                         <div className="text-xl md:text-2xl font-semibold text-blue-600 dark:text-blue-400">
// //                           {tfc.note}/20
// //                         </div>
// //                         <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
// //                           Note finale
// //                         </div>
// //                       </div>
// //                     )} */}
// //                   <PinButton
// //                     tfcId={tfc.id} 
// //                     size="lg" 
// //                     showLabel 
// //                     className="justify-center"
// //                   />
// //                   </div>
// //  <h1 className="text-xl mb-5 serifo md:text-2xl font-semibold leading-tight text-gray-900 dark:text-gray-100">
// //                         {tfc.titre}
// //                       </h1>
// //                   {/* ⭐⭐⭐ AJOUT: Compteur de vues dans l'en-tête ⭐⭐⭐ */}
// //                   <div className="flex items-center justify-between mb-6 p-4 w-max bg-gray-50 dark:bg-gray-700 rounded-lg">
// //                     <div className="flex items-center space-x-3">
// //                       <FaEye className="text-blue-600 dark:text-blue-400 text-lg" />
// //                       <div>
                       
// //                         <div className="text-sm font-old text-gray-900 dark:text-white">
// //                           {viewCount} vue(s)
// //                         </div>
// //                       </div>
// //                     </div>
// //                     {/* <div className="text-right">
// //                       <div className="text-sm text-gray-500 dark:text-gray-400">
// //                         Statut des vues
// //                       </div>
// //                       <div className="text-sm font-medium text-green-600 dark:text-green-400">
// //                         {user ? 'Connecté' : 'Non comptabilisé'}
// //                       </div>
// //                     </div> */}
// //                   </div>

// //                   {/* Grille d'informations compacte */}
// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
// //                     <div className="flex items-start space-x-3">
// //                       <FaUserGraduate className="mt-1 flex-shrink-0 text-blue-600 dark:text-blue-400" />
// //                       <div>
// //                         <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Auteur</div>
// //                         <div className="text-gray-900 dark:text-white">{tfc.auteur}</div>
// //                         {tfc.auteur_email && (
// //                           <div className="text-sm text-blue-600 dark:text-blue-400">{tfc.auteur_email}</div>
// //                         )}
// //                       </div>
// //                     </div>

// //                     <div className="flex items-start space-x-3">
// //                       <FaChalkboardTeacher className="mt-1 flex-shrink-0 text-green-500 dark:text-green-400" />
// //                       <div>
// //                         <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Promoteur</div>
// //                         <div className="text-gray-900 dark:text-white">{tfc.promoteur}</div>
// //                       </div>
// //                     </div>

// //                     <div className="flex items-start space-x-3">
// //                       <FaUniversity className="mt-1 flex-shrink-0 text-blue-600 dark:text-blue-400" />
// //                       <div>
// //                         <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Faculté</div>
// //                         <div className="text-gray-900 dark:text-white">{tfc.facultes?.nom}</div>
// //                       </div>
// //                     </div>

// //                     <div className="flex items-start space-x-3">
// //                       <FaBuilding className="mt-1 flex-shrink-0 text-gray-600 dark:text-gray-400" />
// //                       <div>
// //                         <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Département</div>
// //                         <div className="text-gray-900 dark:text-white">{tfc.departements?.nom}</div>
// //                       </div>
// //                     </div>

// //                     <div className="flex items-start space-x-3">
// //                       <FaGraduationCap className="mt-1 flex-shrink-0 text-green-500 dark:text-green-400" />
// //                       <div>
// //                         <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Filière</div>
// //                         <div className="text-gray-900 dark:text-white">{tfc.filieres?.nom}</div>
// //                       </div>
// //                     </div>

// //                     <div className="flex items-start space-x-3">
// //                       <FaCalendarAlt className="mt-1 flex-shrink-0 text-yellow-500 dark:text-yellow-400" />
// //                       <div>
// //                         <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Année académique</div>
// //                         <div className="text-gray-900 dark:text-white">{tfc.annees_academiques?.annee}</div>
// //                       </div>
// //                     </div>
// //                   </div>

// //                   {/* Informations additionnelles */}
// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
// //                     {tfc.cas_application && (
// //                       <div className="flex items-start space-x-3">
// //                         <FaClipboardList className="mt-0.5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
// //                         <div>
// //                           <div className="text-gray-500 dark:text-gray-400">Cas d'application</div>
// //                           <div className="text-gray-900 dark:text-white">{tfc.cas_application}</div>
// //                         </div>
// //                       </div>
// //                     )}
                    
// //                     {tfc.date_soutenance && (
// //                       <div className="flex items-start space-x-3">
// //                         <FaCalendarAlt className="mt-0.5 flex-shrink-0 text-yellow-500 dark:text-yellow-400" />
// //                         <div>
// //                           <div className="text-gray-500 dark:text-gray-400">Date de soutenance</div>
// //                           <div className="text-gray-900 dark:text-white">{formatDate(tfc.date_soutenance)}</div>
// //                         </div>
// //                       </div>
// //                     )}
// //                   </div>

// //                   {/* Technologies utilisées */}
// //                   {tfc.technologies && tfc.technologies.length > 0 && (
// //                     <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
// //                       <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-gray-900 dark:text-white">
// //                         <FaCode className="text-green-500 dark:text-green-400" />
// //                         <span>Technologies utilisées</span>
// //                       </h3>
// //                       <div className="flex flex-wrap gap-2">
// //                         {tfc.technologies.map((tech, index) => (
// //                           <span 
// //                             key={index}
// //                             className="px-3 py-1 rounded-full text-sm font-medium transition-all hover:scale-105 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
// //                           >
// //                             {tech}
// //                           </span>
// //                         ))}
// //                       </div>
// //                     </div>
// //                   )}

// //                   {/* Fonctionnalités développées */}
// //                   {tfc.fonctionnalites && tfc.fonctionnalites.length > 0 && (
// //                     <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
// //                       <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-gray-900 dark:text-white">
// //                         <FaCogs className="text-blue-600 dark:text-blue-400" />
// //                         <span>Fonctionnalités développées</span>
// //                       </h3>
// //                       <div className="flex flex-wrap gap-2">
// //                         {tfc.fonctionnalites.map((fonctionnalite, index) => (
// //                           <span 
// //                             key={index}
// //                             className="px-3 py-1 rounded-full text-sm font-medium transition-all hover:scale-105 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
// //                           >
// //                             {fonctionnalite}
// //                           </span>
// //                         ))}
// //                       </div>
// //                     </div>
// //                   )}

// //                   {/* Uploader info */}
// //                   {(tfc.added_by_user_id || tfc.added_by_name) && (
// //                     <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
// //                       <div className="flex items-center space-x-3">
// //                         {tfc.users?.profil_url ? (
// //                           <img 
// //                             src={tfc.users.profil_url} 
// //                             alt="Photo de profil"
// //                             className="w-8 h-8 rounded-full object-cover"
// //                           />
// //                         ) : (
// //                           <div 
// //                             className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium bg-blue-600 dark:bg-blue-500"
// //                           >
// //                             {getInitials(tfc.users?.name || tfc.added_by_name || 'U')}
// //                           </div>
// //                         )}
                        
// //                         <div>
// //                           <div className="text-sm text-gray-500 dark:text-gray-400">
// //                             Ajouté par
// //                           </div>
// //                           <div className="text-gray-900 dark:text-white">
// //                             {tfc.users?.name || tfc.added_by_name}
// //                             {tfc.users?.username && ` (@${tfc.users.username})`}
// //                           </div>
// //                           {tfc.created_at && (
// //                             <div className="text-xs flex items-center space-x-1 mt-1 text-gray-500 dark:text-gray-400">
// //                               <FaClock size={10} />
// //                               <span>le {formatDateTime(tfc.created_at)}</span>
// //                             </div>
// //                           )}
// //                         </div>
// //                       </div>
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>
// //             )}

// //             {/* Onglet Commentaires */}
// //             {activeTab === 'comments' && (
// //               <div className="space-y-6">
// //                 <div className="bg-white dark:bg-gray-800  transition-colors duration-200">
                 
// //                   <CommentSection 
// //                     tfcId={tfc.id} 
// //                     currentUser={user}
// //                   />
// //                 </div>
// //               </div>
// //             )}

// //             {/* Onglet Document & Résumé */}
// //             {activeTab === 'document' && (
// //               <div className="space-y-6">
// //                 {/* Résumé */}
// //                 <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
// //                   <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-gray-900 dark:text-white">
// //                     <FaFileAlt className="text-blue-600 dark:text-blue-400" />
// //                     <span>Résumé</span>
// //                   </h2>
// //                   <div className="prose max-w-none dark:prose-invert">
// //                     <p className="leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300" style={{ lineHeight: '1.8' }}>
// //                       {tfc.resume}
// //                     </p>
// //                   </div>
// //                 </div>

// //                 {/* Mots-clés */}
// //                 {tfc.mots_cles && tfc.mots_cles.length > 0 && (
// //                   <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
// //                     <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-gray-900 dark:text-white">
// //                       <FaClipboardList className="text-green-500 dark:text-green-400" />
// //                       <span>Mots-clés</span>
// //                     </h2>
// //                     <div className="flex flex-wrap gap-2">
// //                       {tfc.mots_cles.map((mot, index) => (
// //                         <span 
// //                           key={index}
// //                           className="px-3 py-1 rounded-full text-sm font-medium transition-all hover:scale-105 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
// //                         >
// //                           #{mot}
// //                         </span>
// //                       ))}
// //                     </div>
// //                   </div>
// //                 )}
                
// //                 {/* Document */}
// //                 <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
// //                   <h2 className="text-lg font-semibold mb-6 flex items-center space-x-2 text-gray-900 dark:text-white">
// //                     <FaFilePdf className="text-red-500 dark:text-red-400" />
// //                     <span>Document</span>
// //                   </h2>
                  
// //                   <div className="space-y-6">
// //                     {/* Vérification de la disponibilité du document */}
// //                     {tfc.doc_available ? (
// //                       <>
// //                         {/* Info du fichier compacte */}
// //                         <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
// //                           <FaFilePdf className="text-red-500 dark:text-red-400 text-2xl" />
// //                           <div className="flex-1 min-w-0">
// //                             <p className="font-semibold text-gray-900 dark:text-white truncate">
// //                               {tfc.fichier_nom}
// //                             </p>
// //                             <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                              
// //                               <span>•</span>
// //                               <span>{formatFileSize(tfc.fichier_taille)}</span>
// //                             </div>
// //                           </div>
// //                         </div>

// //                         {/* Actions */}
// //                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                           <button
// //                             onClick={previewTFC}
// //                             disabled={downloading}
// //                             className="flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border border-blue-600 dark:border-blue-500 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium transition-all hover:bg-blue-50 dark:hover:bg-gray-700 disabled:opacity-50"
// //                           >
// //                             {downloading ? (
// //                               <LoaderIcon className="animate-spin" size={16} />
// //                             ) : (
// //                               <>
// //                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
// //                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
// //                                 </svg>
// //                                 <span>Prévisualiser</span>
// //                               </>
// //                             )}
// //                           </button>

// //                           <button
// //                             onClick={downloadTFC}
// //                             disabled={downloading}
// //                             className="flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-50 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
// //                           >
// //                             {downloading ? (
// //                               <LoaderIcon className="animate-spin" size={16} />
// //                             ) : (
// //                               <>
// //                                 <FaDownload size={16} />
// //                                 <span>Télécharger</span>
// //                               </>
// //                             )}
// //                           </button>
// //                         </div>
// //                       </>
// //                     ) : (
// //                       /* Message quand le document n'est pas disponible */
// //                       <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
// //                         <div className="flex flex-col items-center justify-center space-y-4">
// //                           <FaExclamationTriangle className="text-yellow-500 dark:text-yellow-400 text-5xl" />
// //                           <div>
// //                             <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
// //                               Document non disponible
// //                             </h3>
// //                             <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
// //                               Contacter votre département pour plus d'informations sur la disponibilité de ce document.
// //                             </p>
// //                           </div>
// //                           <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
// //                             <p className="text-sm text-yellow-800 dark:text-yellow-200">
// //                               <strong>Information :</strong> Ce document n'est pas accessible pour le moment. 
// //                               Veuillez contacter l'administration de votre département pour connaître 
// //                               les conditions d'accès.
// //                             </p>
// //                           </div>
// //                         </div>
// //                       </div>
// //                     )}
// //                   </div>
// //                 </div>
// //               </div>
// //             )}

// //             {/* Onglet Références */}
// //             {activeTab === 'references' && (
// //               <div className="rounded-lg">
// //                 <TFCReferencesTabs
// //                   references={references}
// //                   referencedBy={referencedBy}
// //                   onOpenTFC={(tfcId: number) => {
// //                     router.push(`/tfc/${tfcId}`)
// //                   }}
// //                   onAddReference={() => setShowAddReferenceModal(true)}
// //                 />

// //                 {/* État vide - seulement si aucune référence des deux côtés */}
// //                 {/* {references.length === 0 && referencedBy.length === 0 && (
// //                   <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg mt-6 bg-white dark:bg-gray-800 transition-colors duration-200">
// //                     <FaLink size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
// //                     <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
// //                       Aucune référence pour le moment
// //                     </h3>
// //                     <p className="mb-4 max-w-md mx-auto text-gray-600 dark:text-gray-400">
// //                       Commencez par ajouter des références pour établir des liens entre les mémoires académiques
// //                     </p>
// //                     <button
// //                       onClick={() => setShowAddReferenceModal(true)}
// //                       className="px-6 py-2 rounded font-medium transition-colors text-sm hover:opacity-90 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
// //                     >
// //                       Ajouter la première référence
// //                     </button>
// //                   </div>
// //                 )} */}
// //               </div>
// //             )}
// //           </motion.div>
// //         </AnimatePresence>

// //         {/* Modal d'ajout de référence */}
// //         <AddReferenceModal
// //           isOpen={showAddReferenceModal}
// //           onClose={() => setShowAddReferenceModal(false)}
// //           currentTfcId={tfc?.id || 0}
// //           onReferenceAdded={loadReferences}
// //           existingReferences={[...references, ...referencedBy].map(ref => ref.id)}
// //         />
// //       </div>
// //     </div>
// //   )
// // }

// 'use client'
// import { useAuth } from '@/hooks/useAuth'
// import PDFPreviewer from '@/components/PDFPreviewer'
// import { useState, useEffect, useRef } from 'react'
// import { useRouter } from 'next/navigation'
// import { supabase } from '@/lib/supabase'
// import AddReferenceModal from '@/components/AddReferenceModal'
// import { TFC } from '@/lib/gen'
// import { 
//   FaFilePdf, 
//   FaDownload, 
//   FaCalendarAlt, 
//   FaUserGraduate, 
//   FaChalkboardTeacher, 
//   FaUniversity, 
//   FaBuilding, 
//   FaGraduationCap, 
//   FaArrowLeft,
//   FaClipboardList,
//   FaUser,
//   FaPlus,
//   FaLink,
//   FaClock,
//   FaInfoCircle,
//   FaTh,
//   FaFileAlt,
//   FaNetworkWired,
//   FaComments,
//   FaCode,
//   FaCogs,
//   FaEye,
//   FaExclamationTriangle,
//   FaCheckCircle
// } from 'react-icons/fa'
// import CommentSection from '@/components/CommentSection'
// import { CheckCircle, Loader2Icon, LoaderCircle, LoaderIcon } from 'lucide-react'
// import { motion, AnimatePresence } from 'framer-motion'
// import TFCReferencesTabs from '@/components/TFCReferencesTabs'
// import { IconType } from 'react-icons'
// import RouteLoader from '@/components/RouteLoader'
// import PinButton from '@/components/PinButton'
// import { CheckBadgeIcon } from '@heroicons/react/24/solid'

// // Constantes de design
// const CARD = 'rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
// const FOCUS = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-500'

// // Couleur primaire : bleu (tabs + boutons retour)
// const PRIMARY_TEXT = 'text-blue-600 dark:text-blue-400'
// const PRIMARY_BG = 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500'
// const PRIMARY_INDICATOR = 'bg-blue-600 dark:bg-blue-400'

// // Fonction pour obtenir les initiales
// const getInitials = (name: string) =>
//   name
//     .split(' ')
//     .map(part => part.charAt(0).toUpperCase())
//     .join('')
//     .slice(0, 2)

// interface TFCDetailPageProps {
//   params: Promise<{
//     id: string
//   }>
// }

// interface TFCReference {
//   id: number
//   titre: string
//   auteur: string
//   annee: string
//   note?: number
//   faculte: string
//   type: 'reference' | 'referenced_by'
// }

// type TabType = 'overview' | 'comments' | 'document' | 'references'

// interface TabConfig {
//   id: TabType
//   label: string
//   icon: IconType
//   mobileLabel: string
// }

// export default function TFCDetailPage({ params }: TFCDetailPageProps) {
//   const router = useRouter()
//   const [tfc, setTfc] = useState<TFC | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [downloading, setDownloading] = useState(false)
//   const [references, setReferences] = useState<TFCReference[]>([])
//   const [referencedBy, setReferencedBy] = useState<TFCReference[]>([])
//   const [showAddReferenceModal, setShowAddReferenceModal] = useState(false)
//   const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
//   const [activeTab, setActiveTab] = useState<TabType>('overview')
//   const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

//   const [showPdfPreview, setShowPdfPreview] = useState(false)
//   const [pdfUrl, setPdfUrl] = useState('')
//   const { user, loading: sessionLoading } = useAuth()

//   // État pour le nombre de vues
//   const [viewCount, setViewCount] = useState<number>(0)

//   const tabRefs = {
//     overview: useRef<HTMLButtonElement>(null),
//     comments: useRef<HTMLButtonElement>(null),
//     document: useRef<HTMLButtonElement>(null),
//     references: useRef<HTMLButtonElement>(null)
//   }

//   useEffect(() => {
//     const resolveParams = async () => {
//       const resolved = await params
//       setResolvedParams(resolved)
//     }
    
//     resolveParams()
//   }, [params])

//   useEffect(() => {
//     if (resolvedParams) {
//       loadTFC()
//     }
//   }, [resolvedParams])

//   useEffect(() => {
//     if (tfc) {
//       loadReferences()
//       if (tfc.nombre_vues) {
//         setViewCount(tfc.nombre_vues)
//       }
//     }
//   }, [tfc])

//   // Enregistrer une vue
//   const enregistrerVue = async () => {
//     if (!user?.id || !resolvedParams?.id) return;
    
//     try {
//       const response = await fetch(`/api/tfc/${resolvedParams.id}/vue`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setViewCount(data.nombreVues);
//       }
//     } catch (error) {
//       console.error('Erreur enregistrement vue:', error);
//     }
//   };

//   useEffect(() => {
//     if (tfc && user?.id && !sessionLoading) {
//       enregistrerVue();
//     }
//   }, [tfc, user?.id, sessionLoading]);

//   useEffect(() => {
//     const updateIndicator = () => {
//       const activeTabRef = tabRefs[activeTab].current
//       if (activeTabRef) {
//         const { offsetLeft, offsetWidth } = activeTabRef
//         setIndicatorStyle({
//           left: offsetLeft,
//           width: offsetWidth
//         })
//       }
//     }

//     const timer = setTimeout(updateIndicator, 100)
//     window.addEventListener('resize', updateIndicator)
    
//     return () => {
//       clearTimeout(timer)
//       window.removeEventListener('resize', updateIndicator)
//     }
//   }, [activeTab])

//   interface TFCLight {
//     id: number
//     titre: string
//     auteur: string
//     note?: number
//     annees_academiques?: { annee: string } | null
//     facultes?: { nom: string } | null
//   }

//   const loadReferences = async () => {
//     if (!tfc) return

//     try {
//       const { data: referencesData, error: refError } = await supabase
//         .from('tfc_references')
//         .select(`
//           tfc:tfc_reference_id (
//             id,
//             titre,
//             auteur,
//             note,
//             annees_academiques:annee_academique_id (annee),
//             facultes:faculte_id (nom)
//           )
//         `)
//         .eq('tfc_source_id', tfc.id)
//         .returns<{ tfc: TFCLight }[]>()

//       if (refError) throw refError

//       const { data: referencedByData, error: refByError } = await supabase
//         .from('tfc_references')
//         .select(`
//           tfc:tfc_source_id (
//             id,
//             titre,
//             auteur,
//             note,
//             annees_academiques:annee_academique_id (annee),
//             facultes:faculte_id (nom)
//           )
//         `)
//         .eq('tfc_reference_id', tfc.id)
//         .returns<{ tfc: TFCLight }[]>()

//       if (refByError) throw refByError

//       const refs: TFCReference[] = (referencesData || []).map(item => ({
//         id: item.tfc.id,
//         titre: item.tfc.titre,
//         auteur: item.tfc.auteur,
//         annee: item.tfc.annees_academiques?.annee || 'N/A',
//         note: item.tfc.note,
//         faculte: item.tfc.facultes?.nom || 'N/A',
//         type: 'reference'
//       }))

//       const refBy: TFCReference[] = (referencedByData || []).map(item => ({
//         id: item.tfc.id,
//         titre: item.tfc.titre,
//         auteur: item.tfc.auteur,
//         annee: item.tfc.annees_academiques?.annee || 'N/A',
//         note: item.tfc.note,
//         faculte: item.tfc.facultes?.nom || 'N/A',
//         type: 'referenced_by'
//       }))

//       setReferences(refs)
//       setReferencedBy(refBy)
//     } catch (error) {
//       console.error('Erreur lors du chargement des références:', error)
//     }
//   }

//   const loadTFC = async () => {
//     if (!resolvedParams) return

//     try {
//       const { data, error } = await supabase
//         .from('tfc')
//         .select(`
//           *,
//           facultes:faculte_id(nom, code),
//           annees_academiques:annee_academique_id(annee),
//           departements:departement_id(nom, code),
//           filieres:filiere_id(nom, code),
//           users:added_by_user_id(name, username, email,profil_url)
//         `)
//         .eq('id', resolvedParams.id)
//         .single()

//       if (error) throw error
//       setTfc(data)
//     } catch (error) {
//       console.error('Erreur lors du chargement du TFC:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const downloadTFC = async () => {
//     if (!tfc || !tfc.doc_available) return
    
//     try {
//       setDownloading(true)
//       const { data } = supabase.storage
//         .from('tfc-bucket')
//         .getPublicUrl(tfc.fichier_chemin)

//       if (data?.publicUrl) {
//         window.open(data.publicUrl, '_blank')
//       }
//     } catch (error) {
//       console.error('Erreur lors du téléchargement:', error)
//     } finally {
//       setDownloading(false)
//     }
//   }

//   const previewTFC = async () => {
//     if (!tfc || !tfc.doc_available) return
    
//     try {
//       setDownloading(true)
//       const { data } = supabase.storage
//         .from('tfc-bucket')
//         .getPublicUrl(tfc.fichier_chemin)

//       if (data?.publicUrl) {
//         setPdfUrl(data.publicUrl)
//         setShowPdfPreview(true)
//       }
//     } catch (error) {
//       console.error('Erreur lors de la prévisualisation:', error)
//     } finally {
//       setDownloading(false)
//     }
//   }

//   const formatFileSize = (bytes: number) => {
//     const mb = bytes / (1024 * 1024)
//     return `${mb.toFixed(1)} MB`
//   }

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('fr-FR', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     })
//   }

//   const formatDateTime = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('fr-FR', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   }

//   const tabs: TabConfig[] = [
//     {
//       id: 'overview',
//       label: 'Vue générale',
//       icon: FaInfoCircle,
//       mobileLabel: 'Général'
//     },
//     {
//       id: 'comments',
//       label: 'Commentaires',
//       icon: FaComments,
//       mobileLabel: 'Commentaires'
//     },
//     {
//       id: 'document',
//       label: 'Document',
//       icon: FaFileAlt,
//       mobileLabel: 'Document'
//     },
//     {
//       id: 'references',
//       label: 'Références',
//       icon: FaNetworkWired,
//       mobileLabel: 'Références'
//     }
//   ]

//   if (sessionLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
//         <RouteLoader />
//       </div>
//     )
//   }

//   if (!resolvedParams && loading) {
//     return (
//       <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
//         <div className="max-w-4xl mx-auto px-4 py-8">
//           <div className="animate-pulse space-y-6">
//             <div className="flex items-center space-x-4 mb-8">
//               <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
//               <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div>
//             </div>
//             <div className={`${CARD} p-6`}>
//               <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-6"></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
//         <div className="max-w-4xl mx-auto px-4 py-8">
//           <div className="animate-pulse space-y-6">
//             <div className="flex items-center space-x-4 mb-8">
//               <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
//               <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div>
//             </div>

//             <div className={`${CARD} p-6`}>
//               <div className="flex justify-between mb-6">
//                 <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div>
//                 <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-16"></div>
//               </div>
//               <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-6"></div>
//               <div className="grid md:grid-cols-2 gap-4">
//                 {[...Array(4)].map((_, i) => (
//                   <div key={i} className="space-y-2">
//                     <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20"></div>
//                     <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (!tfc) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
//         <div className={`${CARD} text-center p-8`}>
//           <div className="flex justify-center mb-4">
//             <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-[#E30613] dark:bg-red-500/10 dark:text-red-400">
//               <FaFileAlt className="h-5 w-5" />
//             </div>
//           </div>
//           <h2 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">TFC non trouvé</h2>
//           <p className="mb-6 text-zinc-600 dark:text-zinc-400">Le travail de fin de cycle que vous recherchez n'existe pas.</p>
//           <button
//             onClick={() => router.back()}
//             className={`px-6 py-2 rounded-lg font-medium transition-colors text-white ${PRIMARY_BG} ${FOCUS}`}
//           >
//             Retour à l'explorateur
//           </button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
//       {showPdfPreview && (
//         <PDFPreviewer
//           fileUrl={pdfUrl}
//           fileName={tfc.fichier_nom}
//           onClose={() => setShowPdfPreview(false)}
//         />
//       )}
      
//       <div className="max-w-4xl mx-auto px-4 py-8">
//         {/* Version Desktop - Bouton retour et tabs sur la même ligne */}
//         <div className={`hidden md:flex items-center justify-between ${CARD} p-2 mb-8 transition-colors duration-200`}>
//           {/* Bouton de retour */}
//           <button
//             onClick={() => router.back()}
//             className={`flex items-center space-x-3 px-4 py-2 group transition-colors rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 ${FOCUS}`}
//           >
//             <div className="w-8 h-8 rounded flex items-center justify-center transition-colors border border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400 dark:group-hover:border-zinc-600">
//               <FaArrowLeft className={PRIMARY_TEXT} size={14} />
//             </div>
//             <span className="text-sm text-zinc-600 dark:text-zinc-400">
//               Retour
//             </span>
//           </button>

//           {/* Navigation par onglets */}
//           <div className="flex-1 relative px-4">
//             <div className="flex justify-center">
//               {tabs.map((tab) => {
//                 const Icon = tab.icon
//                 return (
//                   <button
//                     key={tab.id}
//                     ref={tabRefs[tab.id]}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`flex items-center justify-center space-x-2 px-6 py-3 font-medium transition-colors relative text-sm ${FOCUS} ${
//                       activeTab === tab.id 
//                         ? PRIMARY_TEXT
//                         : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
//                     }`}
//                   >
//                     <Icon size={14} />
//                     <span>{tab.label}</span>
//                   </button>
//                 )
//               })}
//             {/* Indicateur animé */}
//             <motion.div
//               className={`absolute bottom-0 h-0.5 ${PRIMARY_INDICATOR}`}
//               initial={false}
//               animate={{
//                 left: indicatorStyle.left,
//                 width: indicatorStyle.width
//               }}
//               transition={{ type: "spring", stiffness: 300, damping: 30 }}
//             />
//             </div>
//           </div>

//           {/* Espace vide pour équilibrer la mise en page */}
//           <div className="w-32"></div>
//         </div>

//         {/* Version Mobile - Bouton retour au-dessus et tabs en dessous */}
//         <div className="md:hidden space-y-4 mb-8">
//           {/* Bouton de retour */}
//           <div className={`${CARD} p-4 transition-colors duration-200`}>
//             <button
//               onClick={() => router.back()}
//               className={`flex items-center space-x-3 group transition-colors ${FOCUS} rounded-lg`}
//             >
//               <div className="w-10 h-10 rounded flex items-center justify-center transition-colors group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700">
//                 <FaArrowLeft className={PRIMARY_TEXT} />
//               </div>
//               <div>
//                 <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
//                   Retour
//                 </div>
//                 <div className="text-xs text-zinc-600 dark:text-zinc-400">
//                   {tfc.titre.length > 40 ? `${tfc.titre.substring(0, 40)}...` : tfc.titre}
//                 </div>
//               </div>
//             </button>
//           </div>

//           {/* Navigation par onglets mobile */}
//           <div className={`${CARD} overflow-hidden transition-colors duration-200`}>
//             <div className="flex relative">
//               {tabs.map((tab) => {
//                 const Icon = tab.icon
//                 return (
//                   <button
//                     key={tab.id}
//                     ref={tabRefs[tab.id]}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`flex-1 flex flex-col items-center justify-center p-3 font-medium transition-colors relative ${FOCUS} ${
//                       activeTab === tab.id 
//                         ? PRIMARY_TEXT
//                         : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
//                     }`}
//                   >
//                     <Icon size={16} className="mb-1" />
//                     <span className="text-xs text-center leading-tight">{tab.mobileLabel}</span>
//                   </button>
//                 )
//               })}
              
//               {/* Indicateur animé pour mobile */}
//               <motion.div
//                 className={`absolute bottom-0 h-1 ${PRIMARY_INDICATOR}`}
//                 initial={false}
//                 animate={{
//                   left: indicatorStyle.left,
//                   width: indicatorStyle.width
//                 }}
//                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Contenu des onglets avec animation */}
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={activeTab}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             transition={{ duration: 0.2 }}
//           >
//             {/* Onglet Vue générale */}
//             {activeTab === 'overview' && (
//               <div className="space-y-6">
//                 {/* Carte principale */}
//                 <div className={`${CARD} p-6 transition-colors duration-200`}>
//                   <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
//                     <div className="flex-1">
//                       <span className="w-max items-center gap-1 px-2 py-0.5 flex rounded-full text-xs font-medium ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
//                         <FaCheckCircle className="h-3 w-3" />
//                         {tfc.statut}
//                       </span>
//                     </div>
//                   <PinButton
//                     tfcId={tfc.id} 
//                     size="lg" 
//                     showLabel 
//                     className="justify-center"
//                   />
//                   </div>
//                   <h1 className="text-xl mb-5 md:text-2xl font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
//                     {tfc.titre}
//                   </h1>
//                   {/* Compteur de vues */}
//                   <div className="flex items-center justify-between mb-6 p-4 w-max bg-zinc-50 dark:bg-zinc-800 rounded-lg">
//                     <div className="flex items-center space-x-3">
//                       <FaEye className={`${PRIMARY_TEXT} text-lg`} />
//                       <div>
//                         <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
//                           {viewCount} vue(s)
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Grille d'informations compacte */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                     <div className="flex items-start space-x-3">
//                       <FaUserGraduate className={`mt-1 flex-shrink-0 ${PRIMARY_TEXT}`} />
//                       <div>
//                         <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Auteur</div>
//                         <div className="text-zinc-900 dark:text-zinc-50">{tfc.auteur}</div>
//                         {tfc.auteur_email && (
//                           <div className={`text-sm ${PRIMARY_TEXT}`}>{tfc.auteur_email}</div>
//                         )}
//                       </div>
//                     </div>

//                     <div className="flex items-start space-x-3">
//                       <FaChalkboardTeacher className="mt-1 flex-shrink-0 text-emerald-500 dark:text-emerald-400" />
//                       <div>
//                         <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Promoteur</div>
//                         <div className="text-zinc-900 dark:text-zinc-50">{tfc.promoteur}</div>
//                       </div>
//                     </div>

//                     <div className="flex items-start space-x-3">
//                       <FaUniversity className={`mt-1 flex-shrink-0 ${PRIMARY_TEXT}`} />
//                       <div>
//                         <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Faculté</div>
//                         <div className="text-zinc-900 dark:text-zinc-50">{tfc.facultes?.nom}</div>
//                       </div>
//                     </div>

//                     <div className="flex items-start space-x-3">
//                       <FaBuilding className="mt-1 flex-shrink-0 text-zinc-600 dark:text-zinc-400" />
//                       <div>
//                         <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Département</div>
//                         <div className="text-zinc-900 dark:text-zinc-50">{tfc.departements?.nom}</div>
//                       </div>
//                     </div>

//                     <div className="flex items-start space-x-3">
//                       <FaGraduationCap className="mt-1 flex-shrink-0 text-emerald-500 dark:text-emerald-400" />
//                       <div>
//                         <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Filière</div>
//                         <div className="text-zinc-900 dark:text-zinc-50">{tfc.filieres?.nom}</div>
//                       </div>
//                     </div>

//                     <div className="flex items-start space-x-3">
//                       <FaCalendarAlt className="mt-1 flex-shrink-0 text-amber-500 dark:text-amber-400" />
//                       <div>
//                         <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Année académique</div>
//                         <div className="text-zinc-900 dark:text-zinc-50">{tfc.annees_academiques?.annee}</div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Informations additionnelles */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                     {tfc.cas_application && (
//                       <div className="flex items-start space-x-3">
//                         <FaClipboardList className="mt-0.5 flex-shrink-0 text-zinc-600 dark:text-zinc-400" />
//                         <div>
//                           <div className="text-zinc-500 dark:text-zinc-400">Cas d'application</div>
//                           <div className="text-zinc-900 dark:text-zinc-50">{tfc.cas_application}</div>
//                         </div>
//                       </div>
//                     )}
                    
//                     {tfc.date_soutenance && (
//                       <div className="flex items-start space-x-3">
//                         <FaCalendarAlt className="mt-0.5 flex-shrink-0 text-amber-500 dark:text-amber-400" />
//                         <div>
//                           <div className="text-zinc-500 dark:text-zinc-400">Date de soutenance</div>
//                           <div className="text-zinc-900 dark:text-zinc-50">{formatDate(tfc.date_soutenance)}</div>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Technologies utilisées */}
//                   {tfc.technologies && tfc.technologies.length > 0 && (
//                     <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
//                       <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-zinc-900 dark:text-zinc-50">
//                         <FaCode className="text-emerald-500 dark:text-emerald-400" />
//                         <span>Technologies utilisées</span>
//                       </h3>
//                       <div className="flex flex-wrap gap-2">
//                         {tfc.technologies.map((tech, index) => (
//                           <span 
//                             key={index}
//                             className="px-3 py-1 rounded-full text-sm font-medium transition-all hover:scale-105 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20"
//                           >
//                             {tech}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Fonctionnalités développées */}
//                   {tfc.fonctionnalites && tfc.fonctionnalites.length > 0 && (
//                     <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
//                       <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-zinc-900 dark:text-zinc-50">
//                         <FaCogs className={PRIMARY_TEXT} />
//                         <span>Fonctionnalités développées</span>
//                       </h3>
//                       <div className="flex flex-wrap gap-2">
//                         {tfc.fonctionnalites.map((fonctionnalite, index) => (
//                           <span 
//                             key={index}
//                             className="px-3 py-1 rounded-full text-sm font-medium transition-all hover:scale-105 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20"
//                           >
//                             {fonctionnalite}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Uploader info */}
//                   {(tfc.added_by_user_id || tfc.added_by_name) && (
//                     <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
//                       <div className="flex items-center space-x-3">
//                         {tfc.users?.profil_url ? (
//                           <img 
//                             src={tfc.users.profil_url} 
//                             alt="Photo de profil"
//                             className="w-8 h-8 rounded-full object-cover"
//                           />
//                         ) : (
//                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${PRIMARY_BG}`}>
//                             {getInitials(tfc.users?.name || tfc.added_by_name || 'U')}
//                           </div>
//                         )}
                        
//                         <div>
//                           <div className="text-sm text-zinc-500 dark:text-zinc-400">
//                             Ajouté par
//                           </div>
//                           <div className="text-zinc-900 dark:text-zinc-50">
//                             {tfc.users?.name || tfc.added_by_name}
//                             {tfc.users?.username && ` (@${tfc.users.username})`}
//                           </div>
//                           {tfc.created_at && (
//                             <div className="text-xs flex items-center space-x-1 mt-1 text-zinc-500 dark:text-zinc-400">
//                               <FaClock size={10} />
//                               <span>le {formatDateTime(tfc.created_at)}</span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Onglet Commentaires */}
//             {activeTab === 'comments' && (
//               <div className="space-y-6">
//                 <div className="transition-colors duration-200">
//                   <CommentSection 
//                     tfcId={tfc.id} 
//                     currentUser={user}
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Onglet Document & Résumé */}
//             {activeTab === 'document' && (
//               <div className="space-y-6">
//                 {/* Résumé */}
//                 <div className={`${CARD} p-6 transition-colors duration-200`}>
//                   <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-zinc-900 dark:text-zinc-50">
//                     <FaFileAlt className={PRIMARY_TEXT} />
//                     <span>Résumé</span>
//                   </h2>
//                   <div className="prose max-w-none dark:prose-invert">
//                     <p className="leading-relaxed whitespace-pre-line text-zinc-700 dark:text-zinc-300" style={{ lineHeight: '1.8' }}>
//                       {tfc.resume}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Mots-clés */}
//                 {tfc.mots_cles && tfc.mots_cles.length > 0 && (
//                   <div className={`${CARD} p-6 transition-colors duration-200`}>
//                     <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-zinc-900 dark:text-zinc-50">
//                       <FaClipboardList className="text-emerald-500 dark:text-emerald-400" />
//                       <span>Mots-clés</span>
//                     </h2>
//                     <div className="flex flex-wrap gap-2">
//                       {tfc.mots_cles.map((mot, index) => (
//                         <span 
//                           key={index}
//                           className="px-3 py-1 rounded-full text-sm font-medium transition-all hover:scale-105 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20"
//                         >
//                           #{mot}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}
                
//                 {/* Document */}
//                 <div className={`${CARD} p-6 transition-colors duration-200`}>
//                   <h2 className="text-lg font-semibold mb-6 flex items-center space-x-2 text-zinc-900 dark:text-zinc-50">
//                     <FaFilePdf className="text-[#E30613] dark:text-red-400" />
//                     <span>Document</span>
//                   </h2>
                  
//                   <div className="space-y-6">
//                     {tfc.doc_available ? (
//                       <>
//                         {/* Info du fichier compacte */}
//                         <div className="flex items-center space-x-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
//                           <FaFilePdf className="text-[#E30613] dark:text-red-400 text-2xl" />
//                           <div className="flex-1 min-w-0">
//                             <p className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
//                               {tfc.fichier_nom}
//                             </p>
//                             <div className="flex flex-wrap gap-3 mt-1 text-sm text-zinc-600 dark:text-zinc-400">
//                               <span>•</span>
//                               <span>{formatFileSize(tfc.fichier_taille)}</span>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Actions */}
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                           <button
//                             onClick={previewTFC}
//                             disabled={downloading}
//                             className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 ${PRIMARY_TEXT} font-medium transition-all hover:bg-blue-50 dark:hover:bg-blue-500/10 disabled:opacity-50 ${FOCUS}`}
//                           >
//                             {downloading ? (
//                               <LoaderIcon className="animate-spin" size={16} />
//                             ) : (
//                               <>
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                                 </svg>
//                                 <span>Prévisualiser</span>
//                               </>
//                             )}
//                           </button>

//                           <button
//                             onClick={downloadTFC}
//                             disabled={downloading}
//                             className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-50 text-white ${PRIMARY_BG} ${FOCUS}`}
//                           >
//                             {downloading ? (
//                               <LoaderIcon className="animate-spin" size={16} />
//                             ) : (
//                               <>
//                                 <FaDownload size={16} />
//                                 <span>Télécharger</span>
//                               </>
//                             )}
//                           </button>
//                         </div>
//                       </>
//                     ) : (
//                       /* Message quand le document n'est pas disponible */
//                       <div className="text-center py-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
//                         <div className="flex flex-col items-center justify-center space-y-4">
//                           <FaExclamationTriangle className="text-amber-500 dark:text-amber-400 text-5xl" />
//                           <div>
//                             <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
//                               Document non disponible
//                             </h3>
//                             <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
//                               Contacter votre département pour plus d'informations sur la disponibilité de ce document.
//                             </p>
//                           </div>
//                           <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-500/20">
//                             <p className="text-sm text-amber-800 dark:text-amber-200">
//                               <strong>Information :</strong> Ce document n'est pas accessible pour le moment. 
//                               Veuillez contacter l'administration de votre département pour connaître 
//                               les conditions d'accès.
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Onglet Références */}
//             {activeTab === 'references' && (
//               <div className="rounded-lg">
//                 <TFCReferencesTabs
//                   references={references}
//                   referencedBy={referencedBy}
//                   onOpenTFC={(tfcId: number) => {
//                     router.push(`/tfc/${tfcId}`)
//                   }}
//                   onAddReference={() => setShowAddReferenceModal(true)}
//                 />
//               </div>
//             )}
//           </motion.div>
//         </AnimatePresence>

//         {/* Modal d'ajout de référence */}
//         <AddReferenceModal
//           isOpen={showAddReferenceModal}
//           onClose={() => setShowAddReferenceModal(false)}
//           currentTfcId={tfc?.id || 0}
//           onReferenceAdded={loadReferences}
//           existingReferences={[...references, ...referencedBy].map(ref => ref.id)}
//         />
//       </div>
//     </div>
//   )
// }

'use client'
import { useAuth } from '@/hooks/useAuth'
import PDFPreviewer from '@/components/PDFPreviewer'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AddReferenceModal from '@/components/AddReferenceModal'
import { TFC } from '@/lib/gen'
import { 
  FaFilePdf, 
  FaDownload, 
  FaCalendarAlt, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaUniversity, 
  FaBuilding, 
  FaGraduationCap, 
  FaArrowLeft,
  FaClipboardList,
  FaUser,
  FaPlus,
  FaLink,
  FaClock,
  FaInfoCircle,
  FaTh,
  FaFileAlt,
  FaNetworkWired,
  FaComments,
  FaCode,
  FaCogs,
  FaEye,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa'
import CommentSection from '@/components/CommentSection'
import { CheckCircle, Loader2Icon, LoaderCircle, LoaderIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import TFCReferencesTabs from '@/components/TFCReferencesTabs'
import { IconType } from 'react-icons'
import RouteLoader from '@/components/RouteLoader'
import PinButton from '@/components/PinButton'
import { CheckBadgeIcon } from '@heroicons/react/24/solid'

// Constantes de design
const CARD = 'rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
const FOCUS = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-500'

// Couleur primaire : bleu (tabs + boutons retour)
const PRIMARY_TEXT = 'text-blue-600 dark:text-blue-400'
const PRIMARY_BG = 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500'
const PRIMARY_INDICATOR = 'bg-blue-600 dark:bg-blue-400'

// Fonction pour obtenir les initiales
const getInitials = (name: string) =>
  name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)

interface TFCDetailPageProps {
  params: Promise<{
    id: string
  }>
}

interface TFCReference {
  id: number
  titre: string
  auteur: string
  annee: string
  note?: number
  faculte: string
  type: 'reference' | 'referenced_by'
}

type TabType = 'overview' | 'comments' | 'document' | 'references'

interface TabConfig {
  id: TabType
  label: string
  icon: IconType
  mobileLabel: string
}

export default function TFCDetailPage({ params }: TFCDetailPageProps) {
  const router = useRouter()
  const [tfc, setTfc] = useState<TFC | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [references, setReferences] = useState<TFCReference[]>([])
  const [referencedBy, setReferencedBy] = useState<TFCReference[]>([])
  const [showAddReferenceModal, setShowAddReferenceModal] = useState(false)
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')
  const { user, loading: sessionLoading } = useAuth()

  // État pour le nombre de vues
  const [viewCount, setViewCount] = useState<number>(0)

  const tabRefs = {
    overview: useRef<HTMLButtonElement>(null),
    comments: useRef<HTMLButtonElement>(null),
    document: useRef<HTMLButtonElement>(null),
    references: useRef<HTMLButtonElement>(null)
  }

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setResolvedParams(resolved)
    }
    
    resolveParams()
  }, [params])

  useEffect(() => {
    if (resolvedParams) {
      loadTFC()
    }
  }, [resolvedParams])

  useEffect(() => {
    if (tfc) {
      loadReferences()
      if (tfc.nombre_vues) {
        setViewCount(tfc.nombre_vues)
      }
    }
  }, [tfc])

  // Enregistrer une vue
  const enregistrerVue = async () => {
    if (!user?.id || !resolvedParams?.id) return;
    
    try {
      const response = await fetch(`/api/tfc/${resolvedParams.id}/vue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setViewCount(data.nombreVues);
      }
    } catch (error) {
      console.error('Erreur enregistrement vue:', error);
    }
  };

  useEffect(() => {
    if (tfc && user?.id && !sessionLoading) {
      enregistrerVue();
    }
  }, [tfc, user?.id, sessionLoading]);

  useEffect(() => {
    const updateIndicator = () => {
      const activeTabRef = tabRefs[activeTab].current
      if (activeTabRef) {
        const { offsetLeft, offsetWidth } = activeTabRef
        setIndicatorStyle({
          left: offsetLeft,
          width: offsetWidth
        })
      }
    }

    const timer = setTimeout(updateIndicator, 100)
    window.addEventListener('resize', updateIndicator)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateIndicator)
    }
  }, [activeTab])

  interface TFCLight {
    id: number
    titre: string
    auteur: string
    note?: number
    annees_academiques?: { annee: string } | null
    facultes?: { nom: string } | null
  }

  const loadReferences = async () => {
    if (!tfc) return

    try {
      const { data: referencesData, error: refError } = await supabase
        .from('tfc_references')
        .select(`
          tfc:tfc_reference_id (
            id,
            titre,
            auteur,
            note,
            annees_academiques:annee_academique_id (annee),
            facultes:faculte_id (nom)
          )
        `)
        .eq('tfc_source_id', tfc.id)
        .returns<{ tfc: TFCLight }[]>()

      if (refError) throw refError

      const { data: referencedByData, error: refByError } = await supabase
        .from('tfc_references')
        .select(`
          tfc:tfc_source_id (
            id,
            titre,
            auteur,
            note,
            annees_academiques:annee_academique_id (annee),
            facultes:faculte_id (nom)
          )
        `)
        .eq('tfc_reference_id', tfc.id)
        .returns<{ tfc: TFCLight }[]>()

      if (refByError) throw refByError

      const refs: TFCReference[] = (referencesData || []).map(item => ({
        id: item.tfc.id,
        titre: item.tfc.titre,
        auteur: item.tfc.auteur,
        annee: item.tfc.annees_academiques?.annee || 'N/A',
        note: item.tfc.note,
        faculte: item.tfc.facultes?.nom || 'N/A',
        type: 'reference'
      }))

      const refBy: TFCReference[] = (referencedByData || []).map(item => ({
        id: item.tfc.id,
        titre: item.tfc.titre,
        auteur: item.tfc.auteur,
        annee: item.tfc.annees_academiques?.annee || 'N/A',
        note: item.tfc.note,
        faculte: item.tfc.facultes?.nom || 'N/A',
        type: 'referenced_by'
      }))

      setReferences(refs)
      setReferencedBy(refBy)
    } catch (error) {
      console.error('Erreur lors du chargement des références:', error)
    }
  }

  const loadTFC = async () => {
    if (!resolvedParams) return

    try {
      const { data, error } = await supabase
        .from('tfc')
        .select(`
          *,
          facultes:faculte_id(nom, code),
          annees_academiques:annee_academique_id(annee),
          departements:departement_id(nom, code),
          filieres:filiere_id(nom, code),
          users:added_by_user_id(name, username, email,profil_url)
        `)
        .eq('id', resolvedParams.id)
        .single()

      if (error) throw error
      setTfc(data)
    } catch (error) {
      console.error('Erreur lors du chargement du TFC:', error)
    } finally {
      setLoading(false)
    }
  }

  // Téléchargement direct : récupère le fichier en Blob puis déclenche
  // le téléchargement sans ouvrir de nouvel onglet
  const downloadTFC = async () => {
    if (!tfc || !tfc.doc_available || !tfc.fichier_chemin) return

    try {
      setDownloading(true)

      const { data: blob, error } = await supabase.storage
        .from('tfc-bucket')
        .download(tfc.fichier_chemin)

      if (error || !blob) throw error || new Error('Fichier introuvable')

      // URL temporaire locale pour le blob
      const blobUrl = window.URL.createObjectURL(blob)

      // Lien invisible pour déclencher le téléchargement
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = tfc.fichier_nom || `${tfc.titre}.pdf`
      document.body.appendChild(link)
      link.click()

      // Nettoyage
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      alert('Impossible de télécharger le document. Veuillez réessayer.')
    } finally {
      setDownloading(false)
    }
  }

  const previewTFC = async () => {
    if (!tfc || !tfc.doc_available) return
    
    try {
      setPreviewing(true)
      const { data } = supabase.storage
        .from('tfc-bucket')
        .getPublicUrl(tfc.fichier_chemin)

      if (data?.publicUrl) {
        setPdfUrl(data.publicUrl)
        setShowPdfPreview(true)
      }
    } catch (error) {
      console.error('Erreur lors de la prévisualisation:', error)
    } finally {
      setPreviewing(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const tabs: TabConfig[] = [
    {
      id: 'overview',
      label: 'Vue générale',
      icon: FaInfoCircle,
      mobileLabel: 'Général'
    },
    {
      id: 'comments',
      label: 'Commentaires',
      icon: FaComments,
      mobileLabel: 'Commentaires'
    },
    {
      id: 'document',
      label: 'Document',
      icon: FaFileAlt,
      mobileLabel: 'Document'
    },
    {
      id: 'references',
      label: 'Références',
      icon: FaNetworkWired,
      mobileLabel: 'Références'
    }
  ]

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <RouteLoader />
      </div>
    )
  }

  if (!resolvedParams && loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div>
            </div>
            <div className={`${CARD} p-6`}>
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div>
            </div>

            <div className={`${CARD} p-6`}>
              <div className="flex justify-between mb-6">
                <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div>
                <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-16"></div>
              </div>
              <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-6"></div>
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20"></div>
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!tfc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className={`${CARD} text-center p-8`}>
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-[#E30613] dark:bg-red-500/10 dark:text-red-400">
              <FaFileAlt className="h-5 w-5" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">TFC non trouvé</h2>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">Le travail de fin de cycle que vous recherchez n'existe pas.</p>
          <button
            onClick={() => router.back()}
            className={`px-6 py-2 rounded-lg font-medium transition-colors text-white ${PRIMARY_BG} ${FOCUS}`}
          >
            Retour à l'explorateur
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      {showPdfPreview && (
        <PDFPreviewer
          fileUrl={pdfUrl}
          fileName={tfc.fichier_nom}
          onClose={() => setShowPdfPreview(false)}
        />
      )}
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Version Desktop - Bouton retour et tabs sur la même ligne */}
        <div className={`hidden md:flex items-center justify-between ${CARD} p-2 mb-8 transition-colors duration-200`}>
          {/* Bouton de retour */}
          <button
            onClick={() => router.back()}
            className={`flex items-center space-x-3 px-4 py-2 group transition-colors rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 ${FOCUS}`}
          >
            <div className="w-8 h-8 rounded flex items-center justify-center transition-colors border border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400 dark:group-hover:border-zinc-600">
              <FaArrowLeft className={PRIMARY_TEXT} size={14} />
            </div>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Retour
            </span>
          </button>

          {/* Navigation par onglets */}
          <div className="flex-1 relative px-4">
            <div className="flex justify-center">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    ref={tabRefs[tab.id]}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center space-x-2 px-6 py-3 font-medium transition-colors relative text-sm ${FOCUS} ${
                      activeTab === tab.id 
                        ? PRIMARY_TEXT
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            {/* Indicateur animé */}
            <motion.div
              className={`absolute bottom-0 h-0.5 ${PRIMARY_INDICATOR}`}
              initial={false}
              animate={{
                left: indicatorStyle.left,
                width: indicatorStyle.width
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            </div>
          </div>

          {/* Espace vide pour équilibrer la mise en page */}
          <div className="w-32"></div>
        </div>

        {/* Version Mobile - Bouton retour au-dessus et tabs en dessous */}
        <div className="md:hidden space-y-4 mb-8">
          {/* Bouton de retour */}
          <div className={`${CARD} p-4 transition-colors duration-200`}>
            <button
              onClick={() => router.back()}
              className={`flex items-center space-x-3 group transition-colors ${FOCUS} rounded-lg`}
            >
              <div className="w-10 h-10 rounded flex items-center justify-center transition-colors group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700">
                <FaArrowLeft className={PRIMARY_TEXT} />
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Retour
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  {tfc.titre.length > 40 ? `${tfc.titre.substring(0, 40)}...` : tfc.titre}
                </div>
              </div>
            </button>
          </div>

          {/* Navigation par onglets mobile */}
          <div className={`${CARD} overflow-hidden transition-colors duration-200`}>
            <div className="flex relative">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    ref={tabRefs[tab.id]}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center justify-center p-3 font-medium transition-colors relative ${FOCUS} ${
                      activeTab === tab.id 
                        ? PRIMARY_TEXT
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Icon size={16} className="mb-1" />
                    <span className="text-xs text-center leading-tight">{tab.mobileLabel}</span>
                  </button>
                )
              })}
              
              {/* Indicateur animé pour mobile */}
              <motion.div
                className={`absolute bottom-0 h-1 ${PRIMARY_INDICATOR}`}
                initial={false}
                animate={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
          </div>
        </div>

        {/* Contenu des onglets avec animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Onglet Vue générale */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Carte principale */}
                <div className={`${CARD} p-6 transition-colors duration-200`}>
                  <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
                    <div className="flex-1">
                      <span className="w-max items-center gap-1 px-2 py-0.5 flex rounded-full text-xs font-medium ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
                        <FaCheckCircle className="h-3 w-3" />
                        {tfc.statut}
                      </span>
                    </div>
                  <PinButton
                    tfcId={tfc.id} 
                    size="lg" 
                    showLabel 
                    className="justify-center"
                  />
                  </div>
                  <h1 className="text-xl mb-5 md:text-2xl font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
                    {tfc.titre}
                  </h1>
                  {/* Compteur de vues */}
                  <div className="flex items-center justify-between mb-6 p-4 w-max bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FaEye className={`${PRIMARY_TEXT} text-lg`} />
                      <div>
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {viewCount} vue(s)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grille d'informations compacte */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <FaUserGraduate className={`mt-1 flex-shrink-0 ${PRIMARY_TEXT}`} />
                      <div>
                        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Auteur</div>
                        <div className="text-zinc-900 dark:text-zinc-50">{tfc.auteur}</div>
                        {tfc.auteur_email && (
                          <div className={`text-sm ${PRIMARY_TEXT}`}>{tfc.auteur_email}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <FaChalkboardTeacher className="mt-1 flex-shrink-0 text-emerald-500 dark:text-emerald-400" />
                      <div>
                        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Promoteur</div>
                        <div className="text-zinc-900 dark:text-zinc-50">{tfc.promoteur}</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <FaUniversity className={`mt-1 flex-shrink-0 ${PRIMARY_TEXT}`} />
                      <div>
                        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Faculté</div>
                        <div className="text-zinc-900 dark:text-zinc-50">{tfc.facultes?.nom}</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <FaBuilding className="mt-1 flex-shrink-0 text-zinc-600 dark:text-zinc-400" />
                      <div>
                        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Département</div>
                        <div className="text-zinc-900 dark:text-zinc-50">{tfc.departements?.nom}</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <FaGraduationCap className="mt-1 flex-shrink-0 text-emerald-500 dark:text-emerald-400" />
                      <div>
                        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Filière</div>
                        <div className="text-zinc-900 dark:text-zinc-50">{tfc.filieres?.nom}</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <FaCalendarAlt className="mt-1 flex-shrink-0 text-amber-500 dark:text-amber-400" />
                      <div>
                        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Année académique</div>
                        <div className="text-zinc-900 dark:text-zinc-50">{tfc.annees_academiques?.annee}</div>
                      </div>
                    </div>
                  </div>

                  {/* Informations additionnelles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {tfc.cas_application && (
                      <div className="flex items-start space-x-3">
                        <FaClipboardList className="mt-0.5 flex-shrink-0 text-zinc-600 dark:text-zinc-400" />
                        <div>
                          <div className="text-zinc-500 dark:text-zinc-400">Cas d'application</div>
                          <div className="text-zinc-900 dark:text-zinc-50">{tfc.cas_application}</div>
                        </div>
                      </div>
                    )}
                    
                    {tfc.date_soutenance && (
                      <div className="flex items-start space-x-3">
                        <FaCalendarAlt className="mt-0.5 flex-shrink-0 text-amber-500 dark:text-amber-400" />
                        <div>
                          <div className="text-zinc-500 dark:text-zinc-400">Date de soutenance</div>
                          <div className="text-zinc-900 dark:text-zinc-50">{formatDate(tfc.date_soutenance)}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Technologies utilisées */}
                  {tfc.technologies && tfc.technologies.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                      <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-zinc-900 dark:text-zinc-50">
                        <FaCode className="text-emerald-500 dark:text-emerald-400" />
                        <span>Technologies utilisées</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {tfc.technologies.map((tech, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 rounded-full text-sm font-medium transition-all hover:scale-105 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fonctionnalités développées */}
                  {tfc.fonctionnalites && tfc.fonctionnalites.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                      <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-zinc-900 dark:text-zinc-50">
                        <FaCogs className={PRIMARY_TEXT} />
                        <span>Fonctionnalités développées</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {tfc.fonctionnalites.map((fonctionnalite, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 rounded-full text-sm font-medium transition-all hover:scale-105 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20"
                          >
                            {fonctionnalite}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Uploader info */}
                  {(tfc.added_by_user_id || tfc.added_by_name) && (
                    <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center space-x-3">
                        {tfc.users?.profil_url ? (
                          <img 
                            src={tfc.users.profil_url} 
                            alt="Photo de profil"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${PRIMARY_BG}`}>
                            {getInitials(tfc.users?.name || tfc.added_by_name || 'U')}
                          </div>
                        )}
                        
                        <div>
                          <div className="text-sm text-zinc-500 dark:text-zinc-400">
                            Ajouté par
                          </div>
                          <div className="text-zinc-900 dark:text-zinc-50">
                            {tfc.users?.name || tfc.added_by_name}
                            {tfc.users?.username && ` (@${tfc.users.username})`}
                          </div>
                          {tfc.created_at && (
                            <div className="text-xs flex items-center space-x-1 mt-1 text-zinc-500 dark:text-zinc-400">
                              <FaClock size={10} />
                              <span>le {formatDateTime(tfc.created_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Onglet Commentaires */}
            {activeTab === 'comments' && (
              <div className="space-y-6">
                <div className="transition-colors duration-200">
                  <CommentSection 
                    tfcId={tfc.id} 
                    currentUser={user}
                  />
                </div>
              </div>
            )}

            {/* Onglet Document & Résumé */}
            {activeTab === 'document' && (
              <div className="space-y-6">
                {/* Résumé */}
                <div className={`${CARD} p-6 transition-colors duration-200`}>
                  <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-zinc-900 dark:text-zinc-50">
                    <FaFileAlt className={PRIMARY_TEXT} />
                    <span>Résumé</span>
                  </h2>
                  <div className="prose max-w-none dark:prose-invert">
                    <p className="leading-relaxed whitespace-pre-line text-zinc-700 dark:text-zinc-300" style={{ lineHeight: '1.8' }}>
                      {tfc.resume}
                    </p>
                  </div>
                </div>

                {/* Mots-clés */}
                {tfc.mots_cles && tfc.mots_cles.length > 0 && (
                  <div className={`${CARD} p-6 transition-colors duration-200`}>
                    <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-zinc-900 dark:text-zinc-50">
                      <FaClipboardList className="text-emerald-500 dark:text-emerald-400" />
                      <span>Mots-clés</span>
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {tfc.mots_cles.map((mot, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 rounded-full text-sm font-medium transition-all hover:scale-105 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20"
                        >
                          #{mot}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Document */}
                <div className={`${CARD} p-6 transition-colors duration-200`}>
                  <h2 className="text-lg font-semibold mb-6 flex items-center space-x-2 text-zinc-900 dark:text-zinc-50">
                    <FaFilePdf className="text-[#E30613] dark:text-red-400" />
                    <span>Document</span>
                  </h2>
                  
                  <div className="space-y-6">
                    {tfc.doc_available ? (
                      <>
                        {/* Info du fichier compacte */}
                        <div className="flex items-center space-x-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                          <FaFilePdf className="text-[#E30613] dark:text-red-400 text-2xl" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                              {tfc.fichier_nom}
                            </p>
                            <div className="flex flex-wrap gap-3 mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                              <span>•</span>
                              <span>{formatFileSize(tfc.fichier_taille)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button
                            onClick={previewTFC}
                            disabled={previewing || downloading}
                            className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 ${PRIMARY_TEXT} font-medium transition-all hover:bg-blue-50 dark:hover:bg-blue-500/10 disabled:opacity-50 ${FOCUS}`}
                          >
                            {previewing ? (
                              <LoaderIcon className="animate-spin" size={16} />
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>Prévisualiser</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={downloadTFC}
                            disabled={downloading || previewing}
                            className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-50 text-white ${PRIMARY_BG} ${FOCUS}`}
                          >
                            {downloading ? (
                              <LoaderIcon className="animate-spin" size={16} />
                            ) : (
                              <>
                                <FaDownload size={16} />
                                <span>Télécharger</span>
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    ) : (
                      /* Message quand le document n'est pas disponible */
                      <div className="text-center py-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <FaExclamationTriangle className="text-amber-500 dark:text-amber-400 text-5xl" />
                          <div>
                            <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
                              Document non disponible
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                              Contacter votre département pour plus d'informations sur la disponibilité de ce document.
                            </p>
                          </div>
                          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-500/20">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                              <strong>Information :</strong> Ce document n'est pas accessible pour le moment. 
                              Veuillez contacter l'administration de votre département pour connaître 
                              les conditions d'accès.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Références */}
            {activeTab === 'references' && (
              <div className="rounded-lg">
                <TFCReferencesTabs
                  references={references}
                  referencedBy={referencedBy}
                  onOpenTFC={(tfcId: number) => {
                    router.push(`/tfc/${tfcId}`)
                  }}
                  onAddReference={() => setShowAddReferenceModal(true)}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Modal d'ajout de référence */}
        <AddReferenceModal
          isOpen={showAddReferenceModal}
          onClose={() => setShowAddReferenceModal(false)}
          currentTfcId={tfc?.id || 0}
          onReferenceAdded={loadReferences}
          existingReferences={[...references, ...referencedBy].map(ref => ref.id)}
        />
      </div>
    </div>
  )
}
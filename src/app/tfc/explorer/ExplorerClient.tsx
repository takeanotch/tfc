
// // // src/app/explorer/ExplorerClient.tsx

// // 'use client'
// // import '../../globals.css'
// // import { useState, useEffect } from 'react'
// // import { useRouter } from 'next/navigation'
// // import { supabase } from '@/lib/supabase'
// // import { SessionUser, TFC, Faculte, AnneeAcademique, Departement, Filiere } from '@/lib/types'
// // import { FaFilePdf, FaDownload, FaEye } from 'react-icons/fa'

// // interface ExplorerClientProps {
// //   user: SessionUser
// //   initialFacultes: Faculte[]
// //   initialAnnees: AnneeAcademique[]
// // }

// // interface Breadcrumb {
// //   name: string
// //   path: string
// // }

// // export default function ExploreourClient({ user, initialFacultes, initialAnnees }: ExplorerClientProps) {
// //   const router = useRouter()
// //   const [currentPath, setCurrentPath] = useState<string[]>([])
// //   const [folders, setFolders] = useState<string[]>([])
// //   const [tfcList, setTfcList] = useState<TFC[]>([])
// //   const [departements, setDepartements] = useState<Departement[]>([])
// //   const [filieres, setFilieres] = useState<Filiere[]>([])
// //   const [loading, setLoading] = useState(false)
// //   const [darkMode, setDarkMode] = useState(false)

// //   const [facultes] = useState<Faculte[]>(initialFacultes)
// //   const [annees] = useState<AnneeAcademique[]>(initialAnnees)

// //   const [currentFaculteId, setCurrentFaculteId] = useState<number | null>(null)
// //   const [currentAnneeId, setCurrentAnneeId] = useState<number | null>(null)
// //   const [currentDepartementId, setCurrentDepartementId] = useState<number | null>(null)
// //   const [currentFiliereId, setCurrentFiliereId] = useState<number | null>(null)

// //   // Couleurs pour light mode
// //   const lightColors = {
// //     primary: '#3B82F6',
// //     secondary: '#6B7280',
// //     success: '#10B981',
// //     warning: '#F59E0B',
// //     error: '#EF4444',
// //     background: '#F8FAFC',
// //     surface: '#FFFFFF',
// //     text: {
// //       primary: '#1F2937',
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

// //   const colors = darkMode ? darkColors : lightColors

// //   useEffect(() => {
// //     // Vérifier la préférence système pour le dark mode
// //     if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
// //       setDarkMode(true)
// //     }
// //   }, [])

// //   useEffect(() => {
// //     if (user.departement) {
// //       setCurrentPath([user.departement])
// //     } else {
// //       setCurrentPath(['facultes'])
// //     }
// //   }, [user.departement])

// //   useEffect(() => {
// //     if (currentPath.length > 0) {
// //       loadCurrentView()
// //     }
// //   }, [currentPath])

// //   const loadCurrentView = async () => {
// //     if (!user) return

// //     try {
// //       setLoading(true)
// //       setFolders([])
// //       setTfcList([])
// //       setCurrentFaculteId(null)
// //       setCurrentAnneeId(null)
// //       setCurrentDepartementId(null)
// //       setCurrentFiliereId(null)

// //       const pathLength = currentPath.length

// //       if (user.departement && currentPath[0] === user.departement) {
// //         if (pathLength === 1) {
// //           setFolders(annees.map(a => a.annee))
// //         }
// //         else if (pathLength === 2) {
// //           const { data: deptData } = await supabase
// //             .from('departements')
// //             .select('id')
// //             .eq('nom', user.departement)
// //             .single()
          
// //           if (deptData) {
// //             setCurrentDepartementId(deptData.id)
// //             const { data: fils } = await supabase
// //               .from('filieres')
// //               .select('*')
// //               .eq('departement_id', deptData.id)
// //             setFilieres(fils || [])
// //             setFolders(fils?.map(f => f.nom) || [])
// //           }
// //         }
// //         else if (pathLength === 3) {
// //           const annee = annees.find(a => a.annee === currentPath[1])
// //           const filiere = filieres.find(f => f.nom === currentPath[2])
          
// //           if (annee) setCurrentAnneeId(annee.id)
// //           if (filiere) setCurrentFiliereId(filiere.id)
          
// //           await loadTFCs()
// //         }
// //       }
// //       else if (currentPath[0] === 'facultes') {
// //         if (pathLength === 1) {
// //           setFolders(facultes.map(f => f.nom))
// //         } 
// //         else if (pathLength === 2) {
// //           setFolders(annees.map(a => a.annee))
// //         }
// //         else if (pathLength === 3) {
// //           const faculte = facultes.find(f => f.nom === currentPath[1])
// //           if (faculte) {
// //             setCurrentFaculteId(faculte.id)
// //             const { data: depts } = await supabase
// //               .from('departements')
// //               .select('*')
// //               .eq('faculte_id', faculte.id)
// //             setDepartements(depts || [])
// //             setFolders(depts?.map(d => d.nom) || [])
// //           }
// //         }
// //         else if (pathLength === 4) {
// //           const faculte = facultes.find(f => f.nom === currentPath[1])
// //           const annee = annees.find(a => a.annee === currentPath[2])
// //           const dept = departements.find(d => d.nom === currentPath[3])
          
// //           if (faculte) setCurrentFaculteId(faculte.id)
// //           if (annee) setCurrentAnneeId(annee.id)
// //           if (dept) setCurrentDepartementId(dept.id)
          
// //           if (dept && faculte) {
// //             const { data: fils } = await supabase
// //               .from('filieres')
// //               .select('*')
// //               .eq('departement_id', dept.id)
// //             setFilieres(fils || [])
// //             setFolders(fils?.map(f => f.nom) || [])
// //           }
// //         }
// //         else if (pathLength === 5) {
// //           const faculte = facultes.find(f => f.nom === currentPath[1])
// //           const annee = annees.find(a => a.annee === currentPath[2])
// //           const dept = departements.find(d => d.nom === currentPath[3])
// //           const filiere = filieres.find(f => f.nom === currentPath[4])
          
// //           if (faculte) setCurrentFaculteId(faculte.id)
// //           if (annee) setCurrentAnneeId(annee.id)
// //           if (dept) setCurrentDepartementId(dept.id)
// //           if (filiere) setCurrentFiliereId(filiere.id)
          
// //           await loadTFCs()
// //         }
// //       }
// //       else if (currentPath[0] === 'departements') {
// //         if (pathLength === 1) {
// //           const { data: depts } = await supabase
// //             .from('departements')
// //             .select('*')
// //             .order('nom')
// //           setDepartements(depts || [])
// //           setFolders(depts?.map(d => d.nom) || [])
// //         }
// //         else if (pathLength === 2) {
// //           setFolders(annees.map(a => a.annee))
// //         }
// //         else if (pathLength === 3) {
// //           const dept = departements.find(d => d.nom === currentPath[1])
// //           const annee = annees.find(a => a.annee === currentPath[2])
          
// //           if (dept) setCurrentDepartementId(dept.id)
// //           if (annee) setCurrentAnneeId(annee.id)
          
// //           if (dept) {
// //             const { data: fils } = await supabase
// //               .from('filieres')
// //               .select('*')
// //               .eq('departement_id', dept.id)
// //             setFilieres(fils || [])
// //             setFolders(fils?.map(f => f.nom) || [])
// //           }
// //         }
// //         else if (pathLength === 4) {
// //           const dept = departements.find(d => d.nom === currentPath[1])
// //           const annee = annees.find(a => a.annee === currentPath[2])
// //           const filiere = filieres.find(f => f.nom === currentPath[3])
          
// //           if (dept) setCurrentDepartementId(dept.id)
// //           if (annee) setCurrentAnneeId(annee.id)
// //           if (filiere) setCurrentFiliereId(filiere.id)
          
// //           await loadTFCs()
// //         }
// //       }
// //       else if (currentPath[0] === 'annees') {
// //         if (pathLength === 1) {
// //           setFolders(annees.map(a => a.annee))
// //         }
// //         else if (pathLength === 2) {
// //           setFolders(facultes.map(f => f.nom))
// //         }
// //       }

// //     } catch (error) {
// //       console.error('Erreur lors du chargement:', error)
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const loadTFCs = async () => {
// //     try {
// //       let query = supabase
// //         .from('tfc')
// //         .select(`
// //           *,
// //           facultes:faculte_id(nom, code),
// //           annees_academiques:annee_academique_id(annee),
// //           departements:departement_id(nom, code),
// //           filieres:filiere_id(nom, code)
// //         `)
// //         .eq('statut', 'approuvé')

// //       if (user.departement && currentPath[0] === user.departement && currentPath.length === 3) {
// //         const { data: deptData } = await supabase
// //           .from('departements')
// //           .select('id')
// //           .eq('nom', user.departement)
// //           .single()
        
// //         const annee = annees.find(a => a.annee === currentPath[1])
// //         const filiere = filieres.find(f => f.nom === currentPath[2])

// //         if (deptData) query = query.eq('departement_id', deptData.id)
// //         if (filiere) query = query.eq('filiere_id', filiere.id)
// //         if (annee) query = query.eq('annee_academique_id', annee.id)
// //       }
// //       else if (currentPath[0] === 'departements' && currentPath.length === 4) {
// //         const dept = departements.find(d => d.nom === currentPath[1])
// //         const annee = annees.find(a => a.annee === currentPath[2])
// //         const filiere = filieres.find(f => f.nom === currentPath[3])

// //         if (dept) query = query.eq('departement_id', dept.id)
// //         if (filiere) query = query.eq('filiere_id', filiere.id)
// //         if (annee) query = query.eq('annee_academique_id', annee.id)
// //       }
// //       else if (currentPath[0] === 'facultes' && currentPath.length === 5) {
// //         const faculte = facultes.find(f => f.nom === currentPath[1])
// //         const dept = departements.find(d => d.nom === currentPath[3])
// //         const filiere = filieres.find(f => f.nom === currentPath[4])
// //         const annee = annees.find(a => a.annee === currentPath[2])

// //         if (faculte) query = query.eq('faculte_id', faculte.id)
// //         if (dept) query = query.eq('departement_id', dept.id)
// //         if (filiere) query = query.eq('filiere_id', filiere.id)
// //         if (annee) query = query.eq('annee_academique_id', annee.id)
// //       }

// //       const { data: tfcs } = await query.order('created_at', { ascending: false })
// //       setTfcList(tfcs || [])
// //     } catch (error) {
// //       console.error('Erreur lors du chargement des TFCs:', error)
// //     }
// //   }

// //   const navigateTo = (folderName: string) => {
// //     setCurrentPath(prev => [...prev, folderName])
// //   }

// //   const navigateBack = (index: number) => {
// //     setCurrentPath(prev => prev.slice(0, index + 1))
// //   }

// //   const downloadTFC = async (tfc: TFC) => {
// //     try {
// //       const { data } = supabase.storage
// //         .from('tfc-bucket')
// //         .getPublicUrl(tfc.fichier_chemin)

// //       if (data?.publicUrl) {
// //         window.open(data.publicUrl, '_blank')
// //       }
// //     } catch (error) {
// //       console.error('Erreur lors du téléchargement:', error)
// //       alert('Erreur lors du téléchargement du fichier')
// //     }
// //   }

// //   const viewTFC = (tfcId: number) => {
// //     router.push(`/tfc/${tfcId}`)
// //   }

// //   const handleLogout = async () => {
// //     try {
// //       await supabase.auth.signOut()
// //       router.push('/auth/login')
// //     } catch (error) {
// //       console.error('Erreur lors de la déconnexion:', error)
// //     }
// //   }

// //   const navigateToAddTFC = () => {
// //     const params = new URLSearchParams()
    
// //     if (currentFaculteId) params.append('faculte_id', currentFaculteId.toString())
// //     if (currentAnneeId) params.append('annee_id', currentAnneeId.toString())
// //     if (currentDepartementId) params.append('departement_id', currentDepartementId.toString())
// //     if (currentFiliereId) params.append('filiere_id', currentFiliereId.toString())
    
// //     router.push(`/admin/add?${params.toString()}`)
// //   }

// //   const canAddTFC = () => {
// //     if (user.departement && currentPath[0] === user.departement) {
// //       return currentPath.length === 3
// //     }
// //     else if (currentPath[0] === 'facultes') {
// //       return currentPath.length === 5
// //     }
// //     else if (currentPath[0] === 'departements') {
// //       return currentPath.length === 4
// //     }
    
// //     return false
// //   }

// //   const getBreadcrumbs = (): Breadcrumb[] => {
// //     if (user.departement && currentPath[0] === user.departement) {
// //       const crumbs: Breadcrumb[] = [
// //         { name: user.departement, path: user.departement }
// //       ]
      
// //       currentPath.slice(1).forEach((segment, index) => {
// //         crumbs.push({
// //           name: segment,
// //           path: currentPath.slice(0, index + 2).join('/')
// //         })
// //       })
      
// //       return crumbs
// //     }
    
// //     const crumbs: Breadcrumb[] = []
    
// //     currentPath.forEach((segment, index) => {
// //       let displayName = segment
      
// //       if (segment === 'facultes') displayName = 'Facultés'
// //       else if (segment === 'departements') displayName = 'Départements'
// //       else if (segment === 'annees') displayName = 'Années académiques'
      
// //       crumbs.push({
// //         name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
// //         path: currentPath.slice(0, index + 1).join('/')
// //       })
// //     })
    
// //     return crumbs
// //   }

// //   const getFolderEmoji = (folderName: string, index: number) => {
// //     if (folderName.includes('20') || folderName === 'Années académiques') return '📅'
// //     if (folderName === 'Départements' || index === 0 && user.departement) return '🏢'
// //     if (folderName === 'Facultés') return '🎓'
// //     return '📁'
// //   }

// //   const toggleDarkMode = () => {
// //     setDarkMode(!darkMode)
// //   }

// //   return (
// //     <div className="min-h-screen transition-colors duration-200" style={{ backgroundColor: colors.background }}>
// //       <div className="max-w-7xl mx-auto px-4 py-6">
// //         {/* En-tête simplifié */}
// //         <div className="rounded-2xl p-4 mb-6 shadow-sm border transition-colors duration-200" style={{ 
// //           backgroundColor: colors.surface,
// //           borderColor: colors.border 
// //         }}>
// //           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
// //             <div className="flex-1 min-w-0">
// //               <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
// //                 <h1 className="text-xl font-bold truncate" style={{ color: colors.text.primary }}>
// //                   Explorateur de TFC
// //                 </h1>
// //                 <div className="flex items-center space-x-2 text-sm" style={{ color: colors.text.secondary }}>
// //                   <span>Département:</span>
// //                   <span className="font-semibold truncate" style={{ color: colors.text.primary }}>
// //                     {user.departement || 'Non spécifié'}
// //                   </span>
// //                 </div>
// //               </div>
// //             </div>
            
// //             <div className="flex items-center space-x-2 w-full sm:w-auto">
// //               {canAddTFC() && (
// //                 <button
// //                   onClick={navigateToAddTFC}
// //                   className="px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md flex-1 sm:flex-none text-sm"
// //                   style={{ 
// //                     backgroundColor: colors.success,
// //                     color: 'white'
// //                   }}
// //                 >
// //                   Ajouter un TFC
// //                 </button>
// //               )}
              
// //               <button
// //                 onClick={toggleDarkMode}
// //                 className="px-3 py-2 rounded-lg font-medium transition-all duration-200 border text-sm"
// //                 style={{ 
// //                   backgroundColor: colors.surface,
// //                   borderColor: colors.border,
// //                   color: colors.text.primary
// //                 }}
// //               >
// //                 {darkMode ? '☀️' : '🌙'}
// //               </button>
// //             </div>
// //           </div>

// //           {/* Fil d'Ariane */}
// //           <nav className="mt-4 flex  hide-scrollbar items-center space-x-1 text-sm overflow-x-auto">
// //             {getBreadcrumbs().map((crumb, index) => (
// //               <div key={index} className=" hide-scrollbar flex items-center flex-shrink-0">
// //                 {index > 0 && (
// //                   <span className="mx-2 flex-shrink-0" style={{ color: colors.text.light }}>
// //                     ›
// //                   </span>
// //                 )}
// //                 <button
// //                   onClick={() => navigateBack(index)}
// //                   className={`px-2 py-1 rounded-lg transition-all duration-200 flex-shrink-0 text-sm ${
// //                     index === getBreadcrumbs().length - 1 
// //                       ? 'font-normal' 
// //                       : 'hover:bg-opacity-20'
// //                   }`}
// //                   style={{
// //                     color: index === getBreadcrumbs().length - 1 
// //                       ? colors.primary 
// //                       : colors.text.secondary,
// //                     backgroundColor: index === getBreadcrumbs().length - 1 
// //                       ? `${colors.primary}20` 
// //                       : 'transparent'
// //                   }}
// //                 >
// //                   {index === 0 ? `${getFolderEmoji(crumb.name, index)} ` : ''}{crumb.name}
// //                 </button>
// //               </div>
// //             ))}
// //           </nav>
// //         </div>

// //         {/* Contenu principal */}
// //         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
// //           {/* Dossiers */}
// //           <div className="lg:col-span-1">
// //             <div className="rounded-2xl p-4 shadow-sm border transition-colors duration-200" style={{ 
// //               backgroundColor: colors.surface,
// //               borderColor: colors.border 
// //             }}>
// //               <h2 className="text-base font-semibold mb-3" style={{ color: colors.text.primary }}>
// //                 Dossiers
// //               </h2>
              
// //               {loading ? (
// //                 <div className="space-y-2">
// //                   {[...Array(6)].map((_, i) => (
// //                     <div key={i} className="animate-pulse flex items-center space-x-2 p-2">
// //                       <div className="w-6 h-6 rounded bg-gray-400"></div>
// //                       <div className="h-4 bg-gray-400 rounded flex-1"></div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               ) : (
// //                 <div className="space-y-1">
// //                   {folders.map((folder, index) => (
// //                     <button
// //                       key={index}
// //                       onClick={() => navigateTo(folder)}
// //                       className="w-full flex items-center space-x-2 p-2 rounded-lg text-left transition-all duration-200 text-sm"
// //                       style={{ 
// //                         backgroundColor: 'transparent',
// //                         color: colors.text.primary
// //                       }}
// //                       onMouseEnter={(e) => {
// //                         e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#F3F4F6'
// //                       }}
// //                       onMouseLeave={(e) => {
// //                         e.currentTarget.style.backgroundColor = 'transparent'
// //                       }}
// //                     >
// //                       <span className="text-base">{getFolderEmoji(folder, currentPath.length)}</span>
// //                       <span className="font-medium truncate">{folder}</span>
// //                     </button>
// //                   ))}
                  
// //                   {folders.length === 0 && (
// //                     <div className="text-center py-6 text-sm" style={{ color: colors.text.light }}>
// //                       <span className="text-3xl mb-2 block">📁</span>
// //                       <p>Aucun dossier disponible</p>
// //                     </div>
// //                   )}
// //                 </div>
// //               )}
// //             </div>
// //           </div>

// //           {/* Fichiers TFC */}
// //           <div className="lg:col-span-3">
// //             <div className="rounded-2xl p-4 shadow-sm border transition-colors duration-200" style={{ 
// //               backgroundColor: colors.surface,
// //               borderColor: colors.border 
// //             }}>
// //               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
// //                 <h2 className="text-lg font-semibold flex items-center space-x-2" style={{ color: colors.text.primary }}>
// //                   <FaFilePdf style={{ color: colors.error }} />
// //                   <span>Travaux de Fin de Cycle</span>
// //                 </h2>
// //                 <span 
// //                   className="px-2 py-1 rounded-full text-xs font-medium"
// //                   style={{ 
// //                     backgroundColor: `${colors.primary}20`,
// //                     color: colors.primary
// //                   }}
// //                 >
// //                   {tfcList.length} document{tfcList.length !== 1 ? 's' : ''}
// //                 </span>
// //               </div>

// //               {loading ? (
// //                 <div className="space-y-3">
// //                   {[...Array(3)].map((_, i) => (
// //                     <div key={i} className="animate-pulse p-4 border rounded-xl">
// //                       <div className="flex space-x-3">
// //                         <div className="w-10 h-14 bg-gray-400 rounded-lg flex-shrink-0"></div>
// //                         <div className="flex-1 space-y-2">
// //                           <div className="h-4 bg-gray-400 rounded w-3/4"></div>
// //                           <div className="h-3 bg-gray-400 rounded w-1/2"></div>
// //                           <div className="flex space-x-3">
// //                             <div className="h-3 bg-gray-400 rounded w-1/4"></div>
// //                             <div className="h-3 bg-gray-400 rounded w-1/4"></div>
// //                           </div>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               ) : (
// //                 <div className="space-y-3">
// //                   {tfcList.map((tfc) => (
// //                     <div 
// //                       key={tfc.id} 
// //                       className="border rounded-xl p-4 transition-all duration-200 cursor-pointer"
// //                       style={{ 
// //                         borderColor: colors.border,
// //                         backgroundColor: colors.surface
// //                       }}
// //                       onMouseEnter={(e) => {
// //                         e.currentTarget.style.borderColor = colors.primary
// //                         e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#F8FAFC'
// //                       }}
// //                       onMouseLeave={(e) => {
// //                         e.currentTarget.style.borderColor = colors.border
// //                         e.currentTarget.style.backgroundColor = colors.surface
// //                       }}
// //                     >
// //                       <div className="flex items-start justify-between gap-3">
// //                         {/* Icône PDF et contenu */}
// //                         <div className="flex items-start space-x-3 flex-1 min-w-0">
// //                           <div 
// //                             className="w-10 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
// //                             style={{ backgroundColor: darkMode ? '#4B5563' : '#FEE2E2' }}
// //                           >
// //                             <FaFilePdf style={{ color: colors.error, fontSize: '1.25rem' }} />
// //                           </div>

// //                           <div className="flex-1 min-w-0">
// //                             <h3 
// //                               className="font-bold text-base mb-1 line-clamp-2"
// //                               style={{ color: colors.text.primary }}
// //                             >
// //                               {tfc.titre}
// //                             </h3>
// //                             <p 
// //                               className="mb-2 line-clamp-2 text-sm leading-relaxed"
// //                               style={{ color: colors.text.secondary }}
// //                             >
// //                               {tfc.resume}
// //                             </p>
                            
// //                             <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs mb-2" style={{ color: colors.text.secondary }}>
// //                               <span><strong>Auteur:</strong> {tfc.auteur}</span>
// //                               <span className="hidden sm:block">•</span>
// //                               <span><strong>Promoteur:</strong> {tfc.promoteur}</span>
// //                               {tfc.note && (
// //                                 <>
// //                                   <span className="hidden sm:block">•</span>
// //                                   <span 
// //                                     className="px-2 py-1 rounded-full font-bold inline-block"
// //                                     style={{ 
// //                                       backgroundColor: darkMode ? '#065F46' : '#D1FAE5',
// //                                       color: darkMode ? '#34D399' : '#065F46'
// //                                     }}
// //                                   >
// //                                     Note: {tfc.note}/20
// //                                   </span>
// //                                 </>
// //                               )}
// //                             </div>
// //                           </div>
// //                         </div>

// //                         {/* Bouton d'action unique */}
// //                         <div className="flex flex-col space-y-2 flex-shrink-0">
// //                           <button
// //                             onClick={(e) => {
// //                               e.stopPropagation()
// //                               viewTFC(tfc.id)
// //                             }}
// //                             className="px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 flex items-center space-x-2"
// //                             style={{ 
// //                               backgroundColor: colors.primary,
// //                               color: 'white'
// //                             }}
// //                           >
// //                             <FaEye />
// //                             <span className="hidden sm:inline">Ouvrir</span>
// //                           </button>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   ))}
                  
// //                   {tfcList.length === 0 && (
// //                     <div className="text-center py-8 text-sm" style={{ color: colors.text.light }}>
// //                       <FaFilePdf className="w-12 h-12 mx-auto mb-3 opacity-50" />
// //                       <h3 className="font-semibold mb-1">Aucun TFC trouvé</h3>
// //                       <p>Aucun travail de fin de cycle dans ce dossier.</p>
// //                     </div>
// //                   )}
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }
// // src/app/explorer/ExplorerClient.tsx

// 'use client'
// import '../../globals.css'
// import { useEffect, useMemo, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import type { IconType } from 'react-icons'
// import {
//   FiCalendar,
//   FiBookOpen,
//   FiLayers,
//   FiFileText,
//   FiFolder,
//   FiEye,
//   FiPlus,
//   FiChevronRight,
//   FiEyeOff,
//   FiCheckSquare,
// } from 'react-icons/fi'
// import { supabase } from '@/lib/supabase'
// import { SessionUser, TFC, Faculte, AnneeAcademique, Departement, Filiere } from '@/lib/types'

// /* --------------------------------- Types --------------------------------- */

// interface ExplorerClientProps {
//   user: SessionUser
//   initialFacultes: Faculte[]
//   initialAnnees: AnneeAcademique[]
// }

// type Kind = 'faculte' | 'annee' | 'departement' | 'filiere'

// interface PathItem {
//   kind: Kind
//   id: number
//   label: string
// }

// interface FolderItem extends PathItem {
//   count: number
// }

// type DeptRow = Departement & { faculte_id: number }
// type FiliereRow = Filiere & { departement_id: number }

// interface TfcIndex {
//   faculte_id: number | null
//   annee_academique_id: number | null
//   departement_id: number | null
//   filiere_id: number | null
// }

// /* ------------------------------- Constantes ------------------------------ */

// // Colonne de la table `tfc` correspondant à chaque niveau de dossier
// const KEY: Record<Kind, keyof TfcIndex> = {
//   faculte: 'faculte_id',
//   annee: 'annee_academique_id',
//   departement: 'departement_id',
//   filiere: 'filiere_id',
// }

// // Icône par niveau. `null` = on garde l'emoji dossier 📁
// const KIND_ICON: Record<Kind, IconType | null> = {
//   faculte: FiBookOpen,
//   annee: FiCalendar,
//   departement: FiLayers,
//   filiere: null,
// }

// const KIND_LABEL: Record<Kind, string> = {
//   faculte: 'Faculté',
//   annee: 'Année académique',
//   departement: 'Département',
//   filiere: 'Filière',
// }

// /* ------------------------------- Helpers --------------------------------- */

// function KindIcon({ kind, className = 'h-4 w-4' }: { kind: Kind; className?: string }) {
//   const Icon = KIND_ICON[kind]
//   if (!Icon) return <span className="text-base leading-none">📁</span>
//   return <Icon className={className} aria-hidden />
// }

// const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`

// /* --------------------------------- Stats --------------------------------- */

// function StatsRow({
//   items,
// }: {
//   items: { label: string; value: number; icon: IconType; tone: string }[]
// }) {
//   return (
//     <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
//       {items.map((it) => {
//         const Icon = it.icon
//         return (
//           <div
//             key={it.label}
//             className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
//           >
//             <div className="flex items-center justify-between gap-3">
//               <div className="min-w-0">
//                 <p className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">
//                   {it.label}
//                 </p>
//                 <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
//                   {it.value}
//                 </p>
//               </div>
//               <Icon className={`h-5 w-5 shrink-0 ${it.tone}`} aria-hidden />
//             </div>
//           </div>
//         )
//       })}
//     </div>
//   )
// }

// /* --------------------------------- Page ---------------------------------- */

// export default function ExplorerClient({ user, initialFacultes, initialAnnees }: ExplorerClientProps) {
//   const router = useRouter()
//   const isDeptUser = Boolean(user.departement)

//   // Étapes de navigation selon le profil
//   const flow: Kind[] = useMemo(
//     () => (isDeptUser ? ['annee', 'filiere'] : ['faculte', 'annee', 'departement', 'filiere']),
//     [isDeptUser]
//   )

//   const [path, setPath] = useState<PathItem[]>([])
//   const [departements, setDepartements] = useState<DeptRow[]>([])
//   const [filieres, setFilieres] = useState<FiliereRow[]>([])
//   const [index, setIndex] = useState<TfcIndex[]>([])
//   const [initLoading, setInitLoading] = useState(true)

//   const [tfcList, setTfcList] = useState<TFC[]>([])
//   const [tfcLoading, setTfcLoading] = useState(false)

//   const [hideEmpty, setHideEmpty] = useState(false)
//   const [notice, setNotice] = useState('')

//   /* ----------------------------- Chargement ---------------------------- */

//   // Une seule fois : départements, filières et un index léger des TFC approuvés
//   // (sert à calculer les compteurs de chaque dossier sans y entrer)
//   useEffect(() => {
//     let cancelled = false
//     ;(async () => {
//       try {
//         const [d, f, t] = await Promise.all([
//           supabase.from('departements').select('*').order('nom'),
//           supabase.from('filieres').select('*').order('nom'),
//           supabase
//             .from('tfc')
//             .select('faculte_id, annee_academique_id, departement_id, filiere_id')
//             .eq('statut', 'approuvé')
//             .range(0, 9999),
//         ])
//         if (d.error) throw d.error
//         if (f.error) throw f.error
//         if (t.error) throw t.error
//         if (cancelled) return
//         setDepartements((d.data as DeptRow[]) ?? [])
//         setFilieres((f.data as FiliereRow[]) ?? [])
//         setIndex((t.data as TfcIndex[]) ?? [])
//       } catch (err) {
//         console.error('Erreur lors du chargement:', err)
//         if (!cancelled) setNotice('Impossible de charger les dossiers.')
//       } finally {
//         if (!cancelled) setInitLoading(false)
//       }
//     })()
//     return () => {
//       cancelled = true
//     }
//   }, [])

//   useEffect(() => {
//     if (!notice) return
//     const t = setTimeout(() => setNotice(''), 5000)
//     return () => clearTimeout(t)
//   }, [notice])

//   /* ------------------------------ Dérivés ------------------------------ */

//   // Département fixe pour un utilisateur rattaché à un département
//   const fixedDeptId = useMemo(
//     () => (isDeptUser ? departements.find((d) => d.nom === user.departement)?.id ?? null : null),
//     [isDeptUser, departements, user.departement]
//   )

//   // Filtres actifs = choix faits dans le chemin (+ département imposé)
//   const selected = useMemo(() => {
//     const s: Partial<Record<Kind, number>> = {}
//     path.forEach((p) => {
//       s[p.kind] = p.id
//     })
//     if (fixedDeptId !== null) s.departement = fixedDeptId
//     return s
//   }, [path, fixedDeptId])

//   // TFC concernés par la vue actuelle
//   const scopeRows = useMemo(() => {
//     const kinds = Object.keys(selected) as Kind[]
//     return index.filter((row) => kinds.every((k) => row[KEY[k]] === selected[k]))
//   }, [index, selected])

//   const nextKind: Kind | undefined = flow[path.length]
//   const isLeaf = path.length === flow.length

//   // Sous-dossiers du niveau suivant, avec leur compteur
//   const folders: FolderItem[] = useMemo(() => {
//     if (!nextKind) return []

//     let base: PathItem[] = []
//     if (nextKind === 'faculte') {
//       base = initialFacultes.map((f) => ({ kind: 'faculte', id: f.id, label: f.nom }))
//     } else if (nextKind === 'annee') {
//       base = initialAnnees.map((a) => ({ kind: 'annee', id: a.id, label: a.annee }))
//     } else if (nextKind === 'departement') {
//       base = departements
//         .filter((d) => d.faculte_id === selected.faculte)
//         .map((d) => ({ kind: 'departement', id: d.id, label: d.nom }))
//     } else if (nextKind === 'filiere') {
//       base = filieres
//         .filter((f) => f.departement_id === selected.departement)
//         .map((f) => ({ kind: 'filiere', id: f.id, label: f.nom }))
//     }

//     return base.map((b) => ({
//       ...b,
//       count: scopeRows.filter((r) => r[KEY[b.kind]] === b.id).length,
//     }))
//   }, [nextKind, initialFacultes, initialAnnees, departements, filieres, selected, scopeRows])

//   const visibleFolders = hideEmpty ? folders.filter((f) => f.count > 0) : folders
//   const emptyFolders = folders.filter((f) => f.count === 0).length

//   // Liste complète des TFC uniquement au dernier niveau
//   useEffect(() => {
//     if (initLoading || !isLeaf) {
//       setTfcList([])
//       return
//     }
//     let cancelled = false
//     setTfcLoading(true)
//     ;(async () => {
//       try {
//         let query = supabase
//           .from('tfc')
//           .select(
//             `
//             *,
//             facultes:faculte_id(nom, code),
//             annees_academiques:annee_academique_id(annee),
//             departements:departement_id(nom, code),
//             filieres:filiere_id(nom, code)
//           `
//           )
//           .eq('statut', 'approuvé')

//         ;(Object.keys(selected) as Kind[]).forEach((k) => {
//           query = query.eq(KEY[k], selected[k] as number)
//         })

//         const { data, error } = await query.order('created_at', { ascending: false })
//         if (error) throw error
//         if (!cancelled) setTfcList((data as TFC[]) ?? [])
//       } catch (err) {
//         console.error('Erreur lors du chargement des TFCs:', err)
//         if (!cancelled) {
//           setTfcList([])
//           setNotice('Impossible de charger les TFC.')
//         }
//       } finally {
//         if (!cancelled) setTfcLoading(false)
//       }
//     })()
//     return () => {
//       cancelled = true
//     }
//   }, [initLoading, isLeaf, selected])

//   /* ------------------------------ Actions ------------------------------ */

//   const navigateTo = (folder: FolderItem) => {
//     setPath((prev) => [...prev, { kind: folder.kind, id: folder.id, label: folder.label }])
//   }

//   const navigateBack = (length: number) => {
//     setPath((prev) => prev.slice(0, length))
//   }

//   const viewTFC = (tfcId: number) => {
//     router.push(`/tfc/${tfcId}`)
//   }

//   const navigateToAddTFC = () => {
//     const params = new URLSearchParams()
//     if (selected.faculte) params.append('faculte_id', String(selected.faculte))
//     if (selected.annee) params.append('annee_id', String(selected.annee))
//     if (selected.departement) params.append('departement_id', String(selected.departement))
//     if (selected.filiere) params.append('filiere_id', String(selected.filiere))
//     router.push(`/admin/add?${params.toString()}`)
//   }

//   const rootLabel = isDeptUser ? (user.departement as string) : 'Facultés'
//   const RootIcon = isDeptUser ? FiLayers : FiBookOpen

//   const stats = [
//     { label: 'TFC au total', value: index.length, icon: FiFileText, tone: 'text-zinc-600 dark:text-zinc-400' },
//     { label: 'Dans cette vue', value: scopeRows.length, icon: FiCheckSquare, tone: 'text-emerald-600 dark:text-emerald-400' },
//     { label: 'Dossiers', value: folders.length, icon: FiFolder, tone: 'text-sky-600 dark:text-sky-400' },
//     { label: 'Dossiers vides', value: emptyFolders, icon: FiEyeOff, tone: 'text-amber-600 dark:text-amber-400' },
//   ]

//   /* ------------------------------- Rendu ------------------------------- */

//   return (
//     <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
//       <div className="mx-auto max-w-7xl px-4 py-6">
//         {notice && (
//           <div
//             role="alert"
//             className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200"
//           >
//             <span className="flex-1">{notice}</span>
//             <button
//               type="button"
//               onClick={() => setNotice('')}
//               className="rounded p-1 hover:bg-amber-100 dark:hover:bg-amber-900/40"
//               aria-label="Fermer"
//             >
//               ✕
//             </button>
//           </div>
//         )}

//         {/* En-tête */}
//         <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
//           <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
//             <div className="min-w-0">
//               <h1 className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-50">
//                 Explorateur de TFC
//               </h1>
//               <p className="text-xs text-zinc-500 dark:text-zinc-400">
//                 Département :{' '}
//                 <span className="font-medium text-zinc-700 dark:text-zinc-300">
//                   {user.departement || 'Non spécifié'}
//                 </span>
//               </p>
//             </div>

//             {isLeaf && (
//               <button
//                 type="button"
//                 onClick={navigateToAddTFC}
//                 className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
//               >
//                 <FiPlus className="h-4 w-4" aria-hidden />
//                 Ajouter un TFC
//               </button>
//             )}
//           </div>

//           {/* Fil d'Ariane */}
//           <nav
//             aria-label="Fil d’Ariane"
//             className="hide-scrollbar mt-4 flex items-center gap-1 overflow-x-auto border-t border-zinc-200 pt-3 text-sm dark:border-zinc-700"
//           >
//             <button
//               type="button"
//               onClick={() => navigateBack(0)}
//               className={`flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 transition-colors ${
//                 path.length === 0
//                   ? 'bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50'
//                   : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700'
//               }`}
//             >
//               <RootIcon className="h-4 w-4" aria-hidden />
//               {rootLabel}
//             </button>

//             {path.map((item, i) => {
//               const last = i === path.length - 1
//               return (
//                 <div key={`${item.kind}-${item.id}`} className="flex shrink-0 items-center gap-1">
//                   <FiChevronRight className="h-4 w-4 text-zinc-400" aria-hidden />
//                   <button
//                     type="button"
//                     onClick={() => navigateBack(i + 1)}
//                     className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors ${
//                       last
//                         ? 'bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50'
//                         : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700'
//                     }`}
//                   >
//                     <KindIcon kind={item.kind} className="h-4 w-4" />
//                     {item.label}
//                   </button>
//                 </div>
//               )
//             })}
//           </nav>
//         </div>

//         <StatsRow items={stats} />

//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
//           {/* Dossiers */}
//           <div className="lg:col-span-1">
//             <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
//               <div className="mb-3 flex items-center justify-between gap-2">
//                 <div className="min-w-0">
//                   <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Dossiers</h2>
//                   {nextKind && (
//                     <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
//                       {KIND_LABEL[nextKind]}
//                     </p>
//                   )}
//                 </div>
//                 {emptyFolders > 0 && (
//                   <button
//                     type="button"
//                     onClick={() => setHideEmpty((v) => !v)}
//                     className="shrink-0 rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700"
//                   >
//                     {hideEmpty ? 'Afficher les vides' : 'Masquer les vides'}
//                   </button>
//                 )}
//               </div>

//               {initLoading ? (
//                 <div className="space-y-2">
//                   {[...Array(6)].map((_, i) => (
//                     <div key={i} className="flex animate-pulse items-center gap-3 p-2">
//                       <div className="h-8 w-8 rounded-md bg-zinc-200 dark:bg-zinc-700" />
//                       <div className="h-4 flex-1 rounded bg-zinc-200 dark:bg-zinc-700" />
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="space-y-1">
//                   {visibleFolders.map((folder) => {
//                     const empty = folder.count === 0
//                     return (
//                       <button
//                         type="button"
//                         key={`${folder.kind}-${folder.id}`}
//                         onClick={() => navigateTo(folder)}
//                         className={`flex w-full items-center gap-3 rounded-md p-2 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 ${
//                           empty ? 'opacity-60' : ''
//                         }`}
//                       >
//                         <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
//                           <KindIcon kind={folder.kind} className="h-4 w-4" />
//                         </span>
//                         <span className="min-w-0 flex-1 truncate font-medium text-zinc-900 dark:text-zinc-50">
//                           {folder.label}
//                         </span>
//                         <span
//                           className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ring-1 ${
//                             empty
//                               ? 'bg-zinc-100 text-zinc-500 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700'
//                               : 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20'
//                           }`}
//                           title={plural(folder.count, 'TFC')}
//                         >
//                           {folder.count}
//                         </span>
//                       </button>
//                     )
//                   })}

//                   {visibleFolders.length === 0 && (
//                     <div className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
//                       <span className="mb-2 block text-3xl">📁</span>
//                       <p>{isLeaf ? 'Dernier niveau atteint' : 'Aucun dossier disponible'}</p>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Fichiers TFC */}
//           <div className="lg:col-span-3">
//             <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
//               <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
//                 <div>
//                   <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
//                     <FiFileText className="h-4 w-4 text-rose-500" aria-hidden />
//                     Travaux de fin de cycle
//                   </h2>
//                   <p className="text-xs text-zinc-500 dark:text-zinc-400">
//                     {isLeaf ? 'Documents de ce dossier' : 'Choisissez un dossier pour afficher les documents'}
//                   </p>
//                 </div>
//                 <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium tabular-nums text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-700 dark:text-zinc-200 dark:ring-zinc-600">
//                   {plural(isLeaf ? tfcList.length : scopeRows.length, 'document')}
//                 </span>
//               </div>

//               {tfcLoading || initLoading ? (
//                 <div className="space-y-3">
//                   {[...Array(3)].map((_, i) => (
//                     <div
//                       key={i}
//                       className="animate-pulse rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
//                     >
//                       <div className="flex gap-3">
//                         <div className="h-12 w-10 shrink-0 rounded-md bg-zinc-200 dark:bg-zinc-700" />
//                         <div className="flex-1 space-y-2">
//                           <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
//                           <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
//                           <div className="h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-700" />
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : !isLeaf ? (
//                 <div className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
//                   <FiFolder className="mx-auto mb-3 h-10 w-10 opacity-40" aria-hidden />
//                   <h3 className="mb-1 font-semibold text-zinc-700 dark:text-zinc-300">
//                     {plural(scopeRows.length, 'TFC')} dans cette vue
//                   </h3>
//                   <p>
//                     Ouvrez un dossier avec un compteur vert pour accéder aux documents.
//                   </p>
//                 </div>
//               ) : tfcList.length === 0 ? (
//                 <div className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
//                   <FiFileText className="mx-auto mb-3 h-10 w-10 opacity-40" aria-hidden />
//                   <h3 className="mb-1 font-semibold text-zinc-700 dark:text-zinc-300">Aucun TFC trouvé</h3>
//                   <p>Aucun travail de fin de cycle dans ce dossier.</p>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {tfcList.map((tfc) => (
//                     <div
//                       key={tfc.id}
//                       className="rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-700/40"
//                     >
//                       <div className="flex items-start justify-between gap-3">
//                         <div className="flex min-w-0 flex-1 items-start gap-3">
//                           <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded-md bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
//                             <FiFileText className="h-5 w-5" aria-hidden />
//                           </div>

//                           <div className="min-w-0 flex-1">
//                             <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
//                               {tfc.titre}
//                             </h3>
//                             <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
//                               {tfc.resume}
//                             </p>

//                             <div className="mt-2 flex flex-col gap-1 text-xs text-zinc-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 dark:text-zinc-400">
//                               <span>
//                                 <span className="font-medium text-zinc-700 dark:text-zinc-300">Auteur :</span>{' '}
//                                 {tfc.auteur}
//                               </span>
//                               <span>
//                                 <span className="font-medium text-zinc-700 dark:text-zinc-300">Promoteur :</span>{' '}
//                                 {tfc.promoteur}
//                               </span>
//                               {tfc.note && (
//                                 <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
//                                   Note : {tfc.note}/20
//                                 </span>
//                               )}
//                             </div>
//                           </div>
//                         </div>

//                         <button
//                           type="button"
//                           onClick={() => viewTFC(tfc.id)}
//                           className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
//                         >
//                           <FiEye className="h-4 w-4" aria-hidden />
//                           <span className="hidden sm:inline">Ouvrir</span>
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// src/app/explorer/ExplorerClient.tsx

'use client'
import '../../globals.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { IconType } from 'react-icons'
import {
  FiCalendar,
  FiBookOpen,
  FiLayers,
  FiFileText,
  FiFolder,
  FiEye,
  FiPlus,
  FiChevronRight,
  FiChevronLeft,
  FiEyeOff,
  FiCheckSquare,
} from 'react-icons/fi'
import { supabase } from '@/lib/supabase'
import { SessionUser, TFC, Faculte, AnneeAcademique, Departement, Filiere } from '@/lib/types'

/* --------------------------------- Types --------------------------------- */

interface ExplorerClientProps {
  user: SessionUser
  initialFacultes: Faculte[]
  initialAnnees: AnneeAcademique[]
}

type Kind = 'faculte' | 'annee' | 'departement' | 'filiere'

interface PathItem {
  kind: Kind
  id: number
  label: string
}

interface FolderItem extends PathItem {
  count: number
}

type DeptRow = Departement & { faculte_id: number }
type FiliereRow = Filiere & { departement_id: number }

interface TfcIndex {
  faculte_id: number | null
  annee_academique_id: number | null
  departement_id: number | null
  filiere_id: number | null
}

/* ------------------------------- Constantes ------------------------------ */

// Colonne de la table `tfc` correspondant à chaque niveau de dossier
const KEY: Record<Kind, keyof TfcIndex> = {
  faculte: 'faculte_id',
  annee: 'annee_academique_id',
  departement: 'departement_id',
  filiere: 'filiere_id',
}

// Icône par niveau. `null` = on garde l'emoji dossier 📁
const KIND_ICON: Record<Kind, IconType | null> = {
  faculte: FiBookOpen,
  annee: FiCalendar,
  departement: FiLayers,
  filiere: null,
}

const KIND_LABEL: Record<Kind, string> = {
  faculte: 'Faculté',
  annee: 'Année académique',
  departement: 'Département',
  filiere: 'Filière',
}

const PAGE_SIZE = 10

/* ------------------------------- Helpers --------------------------------- */

// Numéros de pages à afficher, avec « … » quand il y en a beaucoup
function getPageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push('…')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push('…')
  pages.push(total)
  return pages
}

function KindIcon({ kind, className = 'h-4 w-4' }: { kind: Kind; className?: string }) {
  const Icon = KIND_ICON[kind]
  if (!Icon) return <span className="text-base leading-none">📁</span>
  return <Icon className={className} aria-hidden />
}

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`

/* --------------------------------- Stats --------------------------------- */

function StatsRow({
  items,
}: {
  items: { label: string; value: number; icon: IconType; tone: string }[]
}) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((it) => {
        const Icon = it.icon
        return (
          <div
            key={it.label}
            className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {it.label}
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                  {it.value}
                </p>
              </div>
              <Icon className={`h-5 w-5 shrink-0 ${it.tone}`} aria-hidden />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* --------------------------------- Page ---------------------------------- */

export default function ExplorerClient({ user, initialFacultes, initialAnnees }: ExplorerClientProps) {
  const router = useRouter()
  const isDeptUser = Boolean(user.departement)

  // Étapes de navigation selon le profil
  const flow: Kind[] = useMemo(
    () => (isDeptUser ? ['annee', 'filiere'] : ['faculte', 'annee', 'departement', 'filiere']),
    [isDeptUser]
  )

  const [path, setPath] = useState<PathItem[]>([])
  const [departements, setDepartements] = useState<DeptRow[]>([])
  const [filieres, setFilieres] = useState<FiliereRow[]>([])
  const [index, setIndex] = useState<TfcIndex[]>([])
  const [initLoading, setInitLoading] = useState(true)

  const [tfcList, setTfcList] = useState<TFC[]>([])
  const [tfcLoading, setTfcLoading] = useState(false)
  const [page, setPage] = useState(1)
  const listRef = useRef<HTMLDivElement>(null)

  const [hideEmpty, setHideEmpty] = useState(false)
  const [notice, setNotice] = useState('')

  /* ----------------------------- Chargement ---------------------------- */

  // Une seule fois : départements, filières et un index léger des TFC approuvés
  // (sert à calculer les compteurs de chaque dossier sans y entrer)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [d, f, t] = await Promise.all([
          supabase.from('departements').select('*').order('nom'),
          supabase.from('filieres').select('*').order('nom'),
          supabase
            .from('tfc')
            .select('faculte_id, annee_academique_id, departement_id, filiere_id')
            .eq('statut', 'approuvé')
            .range(0, 9999),
        ])
        if (d.error) throw d.error
        if (f.error) throw f.error
        if (t.error) throw t.error
        if (cancelled) return
        setDepartements((d.data as DeptRow[]) ?? [])
        setFilieres((f.data as FiliereRow[]) ?? [])
        setIndex((t.data as TfcIndex[]) ?? [])
      } catch (err) {
        console.error('Erreur lors du chargement:', err)
        if (!cancelled) setNotice('Impossible de charger les dossiers.')
      } finally {
        if (!cancelled) setInitLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(''), 5000)
    return () => clearTimeout(t)
  }, [notice])

  /* ------------------------------ Dérivés ------------------------------ */

  // Département fixe pour un utilisateur rattaché à un département
  const fixedDeptId = useMemo(
    () => (isDeptUser ? departements.find((d) => d.nom === user.departement)?.id ?? null : null),
    [isDeptUser, departements, user.departement]
  )

  // Filtres actifs = choix faits dans le chemin (+ département imposé)
  const selected = useMemo(() => {
    const s: Partial<Record<Kind, number>> = {}
    path.forEach((p) => {
      s[p.kind] = p.id
    })
    if (fixedDeptId !== null) s.departement = fixedDeptId
    return s
  }, [path, fixedDeptId])

  // TFC concernés par la vue actuelle
  const scopeRows = useMemo(() => {
    const kinds = Object.keys(selected) as Kind[]
    return index.filter((row) => kinds.every((k) => row[KEY[k]] === selected[k]))
  }, [index, selected])

  const nextKind: Kind | undefined = flow[path.length]
  const isLeaf = path.length === flow.length

  // Sous-dossiers du niveau suivant, avec leur compteur
  const folders: FolderItem[] = useMemo(() => {
    if (!nextKind) return []

    let base: PathItem[] = []
    if (nextKind === 'faculte') {
      base = initialFacultes.map((f) => ({ kind: 'faculte', id: f.id, label: f.nom }))
    } else if (nextKind === 'annee') {
      base = initialAnnees.map((a) => ({ kind: 'annee', id: a.id, label: a.annee }))
    } else if (nextKind === 'departement') {
      base = departements
        .filter((d) => d.faculte_id === selected.faculte)
        .map((d) => ({ kind: 'departement', id: d.id, label: d.nom }))
    } else if (nextKind === 'filiere') {
      base = filieres
        .filter((f) => f.departement_id === selected.departement)
        .map((f) => ({ kind: 'filiere', id: f.id, label: f.nom }))
    }

    return base.map((b) => ({
      ...b,
      count: scopeRows.filter((r) => r[KEY[b.kind]] === b.id).length,
    }))
  }, [nextKind, initialFacultes, initialAnnees, departements, filieres, selected, scopeRows])

  const visibleFolders = hideEmpty ? folders.filter((f) => f.count > 0) : folders
  const emptyFolders = folders.filter((f) => f.count === 0).length

  // Liste complète des TFC uniquement au dernier niveau
  useEffect(() => {
    if (initLoading || !isLeaf) {
      setTfcList([])
      return
    }
    let cancelled = false
    setTfcLoading(true)
    ;(async () => {
      try {
        let query = supabase
          .from('tfc')
          .select(
            `
            *,
            facultes:faculte_id(nom, code),
            annees_academiques:annee_academique_id(annee),
            departements:departement_id(nom, code),
            filieres:filiere_id(nom, code)
          `
          )
          .eq('statut', 'approuvé')

        ;(Object.keys(selected) as Kind[]).forEach((k) => {
          query = query.eq(KEY[k], selected[k] as number)
        })

        const { data, error } = await query.order('created_at', { ascending: false })
        if (error) throw error
        if (!cancelled) setTfcList((data as TFC[]) ?? [])
      } catch (err) {
        console.error('Erreur lors du chargement des TFCs:', err)
        if (!cancelled) {
          setTfcList([])
          setNotice('Impossible de charger les TFC.')
        }
      } finally {
        if (!cancelled) setTfcLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [initLoading, isLeaf, selected])

  // Retour à la page 1 à chaque changement de dossier / de liste
  useEffect(() => {
    setPage(1)
  }, [tfcList])

  const totalPages = Math.max(1, Math.ceil(tfcList.length / PAGE_SIZE))
  const pagedTfc = useMemo(
    () => tfcList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [tfcList, page]
  )
  const rangeStart = tfcList.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, tfcList.length)

  /* ------------------------------ Actions ------------------------------ */

  const goToPage = (n: number) => {
    setPage(Math.min(Math.max(1, n), totalPages))
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const navigateTo = (folder: FolderItem) => {
    setPath((prev) => [...prev, { kind: folder.kind, id: folder.id, label: folder.label }])
  }

  const navigateBack = (length: number) => {
    setPath((prev) => prev.slice(0, length))
  }

  const viewTFC = (tfcId: number) => {
    router.push(`/tfc/${tfcId}`)
  }

  const navigateToAddTFC = () => {
    const params = new URLSearchParams()
    if (selected.faculte) params.append('faculte_id', String(selected.faculte))
    if (selected.annee) params.append('annee_id', String(selected.annee))
    if (selected.departement) params.append('departement_id', String(selected.departement))
    if (selected.filiere) params.append('filiere_id', String(selected.filiere))
    router.push(`/admin/add?${params.toString()}`)
  }

  const rootLabel = isDeptUser ? (user.departement as string) : 'Facultés'
  const RootIcon = isDeptUser ? FiLayers : FiBookOpen

  const stats = [
    { label: 'TFC au total', value: index.length, icon: FiFileText, tone: 'text-zinc-600 dark:text-zinc-400' },
    { label: 'Dans cette vue', value: scopeRows.length, icon: FiCheckSquare, tone: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Dossiers', value: folders.length, icon: FiFolder, tone: 'text-sky-600 dark:text-sky-400' },
    { label: 'Dossiers vides', value: emptyFolders, icon: FiEyeOff, tone: 'text-amber-600 dark:text-amber-400' },
  ]

  /* ------------------------------- Rendu ------------------------------- */

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {notice && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200"
          >
            <span className="flex-1">{notice}</span>
            <button
              type="button"
              onClick={() => setNotice('')}
              className="rounded p-1 hover:bg-amber-100 dark:hover:bg-amber-900/40"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        )}

        {/* En-tête */}
        <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Explorateur de TFC
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Département :{' '}
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {user.departement || 'Non spécifié'}
                </span>
              </p>
            </div>

            {isLeaf && (
              <button
                type="button"
                onClick={navigateToAddTFC}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <FiPlus className="h-4 w-4" aria-hidden />
                Ajouter un TFC
              </button>
            )}
          </div>

          {/* Fil d'Ariane */}
          <nav
            aria-label="Fil d’Ariane"
            className="hide-scrollbar mt-4 flex items-center gap-1 overflow-x-auto border-t border-zinc-200 pt-3 text-sm dark:border-zinc-700"
          >
            <button
              type="button"
              onClick={() => navigateBack(0)}
              className={`flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 transition-colors ${
                path.length === 0
                  ? 'bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              <RootIcon className="h-4 w-4" aria-hidden />
              {rootLabel}
            </button>

            {path.map((item, i) => {
              const last = i === path.length - 1
              return (
                <div key={`${item.kind}-${item.id}`} className="flex shrink-0 items-center gap-1">
                  <FiChevronRight className="h-4 w-4 text-zinc-400" aria-hidden />
                  <button
                    type="button"
                    onClick={() => navigateBack(i + 1)}
                    className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors ${
                      last
                        ? 'bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50'
                        : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <KindIcon kind={item.kind} className="h-4 w-4" />
                    {item.label}
                  </button>
                </div>
              )
            })}
          </nav>
        </div>

        <StatsRow items={stats} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Dossiers */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Dossiers</h2>
                  {nextKind && (
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {KIND_LABEL[nextKind]}
                    </p>
                  )}
                </div>
                {emptyFolders > 0 && (
                  <button
                    type="button"
                    onClick={() => setHideEmpty((v) => !v)}
                    className="shrink-0 rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    {hideEmpty ? 'Afficher les vides' : 'Masquer les vides'}
                  </button>
                )}
              </div>

              {initLoading ? (
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex animate-pulse items-center gap-3 p-2">
                      <div className="h-8 w-8 rounded-md bg-zinc-200 dark:bg-zinc-700" />
                      <div className="h-4 flex-1 rounded bg-zinc-200 dark:bg-zinc-700" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {visibleFolders.map((folder) => {
                    const empty = folder.count === 0
                    return (
                      <button
                        type="button"
                        key={`${folder.kind}-${folder.id}`}
                        onClick={() => navigateTo(folder)}
                        className={`flex w-full items-center gap-3 rounded-md p-2 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 ${
                          empty ? 'opacity-60' : ''
                        }`}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                          <KindIcon kind={folder.kind} className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1 truncate font-medium text-zinc-900 dark:text-zinc-50">
                          {folder.label}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ring-1 ${
                            empty
                              ? 'bg-zinc-100 text-zinc-500 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700'
                              : 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20'
                          }`}
                          title={plural(folder.count, 'TFC')}
                        >
                          {folder.count}
                        </span>
                      </button>
                    )
                  })}

                  {visibleFolders.length === 0 && (
                    <div className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      <span className="mb-2 block text-3xl">📁</span>
                      <p>{isLeaf ? 'Dernier niveau atteint' : 'Aucun dossier disponible'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Fichiers TFC */}
          <div className="lg:col-span-3">
            <div
              ref={listRef}
              className="scroll-mt-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    <FiFileText className="h-4 w-4 text-rose-500" aria-hidden />
                    Travaux de fin de cycle
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {isLeaf ? 'Documents de ce dossier' : 'Choisissez un dossier pour afficher les documents'}
                  </p>
                </div>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium tabular-nums text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-700 dark:text-zinc-200 dark:ring-zinc-600">
                  {plural(isLeaf ? tfcList.length : scopeRows.length, 'document')}
                </span>
              </div>

              {tfcLoading || initLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
                    >
                      <div className="flex gap-3">
                        <div className="h-12 w-10 shrink-0 rounded-md bg-zinc-200 dark:bg-zinc-700" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
                          <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
                          <div className="h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-700" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isLeaf ? (
                <div className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  <FiFolder className="mx-auto mb-3 h-10 w-10 opacity-40" aria-hidden />
                  <h3 className="mb-1 font-semibold text-zinc-700 dark:text-zinc-300">
                    {plural(scopeRows.length, 'TFC')} dans cette vue
                  </h3>
                  <p>
                    Ouvrez un dossier avec un compteur vert pour accéder aux documents.
                  </p>
                </div>
              ) : tfcList.length === 0 ? (
                <div className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  <FiFileText className="mx-auto mb-3 h-10 w-10 opacity-40" aria-hidden />
                  <h3 className="mb-1 font-semibold text-zinc-700 dark:text-zinc-300">Aucun TFC trouvé</h3>
                  <p>Aucun travail de fin de cycle dans ce dossier.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pagedTfc.map((tfc) => (
                    <div
                      key={tfc.id}
                      className="rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-700/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded-md bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                            <FiFileText className="h-5 w-5" aria-hidden />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                              {tfc.titre}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                              {tfc.resume}
                            </p>

                            <div className="mt-2 flex flex-col gap-1 text-xs text-zinc-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 dark:text-zinc-400">
                              <span>
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">Auteur :</span>{' '}
                                {tfc.auteur}
                              </span>
                              <span>
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">Promoteur :</span>{' '}
                                {tfc.promoteur}
                              </span>
                              {tfc.note && (
                                <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
                                  Note : {tfc.note}/20
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => viewTFC(tfc.id)}
                          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                          <FiEye className="h-4 w-4" aria-hidden />
                          <span className="hidden sm:inline">Ouvrir</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-200 pt-4 sm:flex-row dark:border-zinc-700">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {rangeStart}–{rangeEnd} sur {tfcList.length}
                      </p>

                      <nav aria-label="Pagination" className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => goToPage(page - 1)}
                          disabled={page === 1}
                          aria-label="Page précédente"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        >
                          <FiChevronLeft className="h-4 w-4" aria-hidden />
                        </button>

                        {getPageNumbers(page, totalPages).map((p, i) =>
                          p === '…' ? (
                            <span
                              key={`gap-${i}`}
                              className="inline-flex h-8 w-6 items-center justify-center text-xs text-zinc-400"
                            >
                              …
                            </span>
                          ) : (
                            <button
                              type="button"
                              key={p}
                              onClick={() => goToPage(p)}
                              aria-current={p === page ? 'page' : undefined}
                              className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-medium tabular-nums transition-colors ${
                                p === page
                                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                  : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700'
                              }`}
                            >
                              {p}
                            </button>
                          )
                        )}

                        <button
                          type="button"
                          onClick={() => goToPage(page + 1)}
                          disabled={page === totalPages}
                          aria-label="Page suivante"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        >
                          <FiChevronRight className="h-4 w-4" aria-hidden />
                        </button>
                      </nav>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
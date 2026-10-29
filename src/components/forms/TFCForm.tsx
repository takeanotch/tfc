

// // components/forms/TFCForm.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { TFCFormData, Faculte, AnneeAcademique, Departement, Filiere } from '@/lib/types'
// import { supabase } from '@/lib/supabase'
// import { FileText, FileUp, X } from 'lucide-react'
// import TruncateText from '../TruncateText'

// interface TFCFormProps {
//   onSubmit: (formData: TFCFormData) => Promise<void>
//   isLoading?: boolean
//   onFileSelect?: (file: File) => void
//   prefillData?: {
//     faculte_id?: number
//     annee_academique_id?: number
//     departement_id?: number
//     filiere_id?: number
//   }
//   docAvailable?: boolean
// }

// // Fonction pour obtenir l'icône du fichier selon le type
// const getFileIcon = (fileName: string) => {
//   const extension = fileName.split('.').pop()?.toLowerCase()
  
//   if (extension === 'pdf') {
//     return <FileText className="h-8 w-8 text-red-500" />
//   } else if (['doc', 'docx'].includes(extension || '')) {
//     return <FileText className="h-8 w-8 text-blue-500" />
//   } else {
//     return <FileText className="h-8 w-8 text-gray-500" />
//   }
// }

// // Fonction pour formater la taille du fichier
// const formatFileSize = (bytes: number): string => {
//   if (bytes === 0) return '0 Bytes'
//   const k = 1024
//   const sizes = ['Bytes', 'KB', 'MB', 'GB']
//   const i = Math.floor(Math.log(bytes) / Math.log(k))
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
// }

// export default function TFCForm({ 
//   onSubmit, 
//   isLoading = false, 
//   onFileSelect, 
//   prefillData,
//   docAvailable = true 
// }: TFCFormProps) {
//   const [formData, setFormData] = useState<TFCFormData>({
//     titre: '',
//     resume: '',
//     mots_cles: '',
//     auteur: '',
//     technologies: '',
//     fonctionnalites: '',
//     auteur_email: '',
//     promoteur: '',
//     cas_application: '',
//     faculte_id: prefillData?.faculte_id || 0,
//     annee_academique_id: prefillData?.annee_academique_id || 0,
//     departement_id: prefillData?.departement_id || 0,
//     filiere_id: prefillData?.filiere_id || 0,
//     date_soutenance: '',
//     note: 0,
//     fichier: null
//   })

//   const [facultes, setFacultes] = useState<Faculte[]>([])
//   const [annees, setAnnees] = useState<AnneeAcademique[]>([])
//   const [departements, setDepartements] = useState<Departement[]>([])
//   const [filieres, setFilieres] = useState<Filiere[]>([])

//   const [prefilledFaculte, setPrefilledFaculte] = useState<Faculte | null>(null)
//   const [prefilledAnnee, setPrefilledAnnee] = useState<AnneeAcademique | null>(null)
//   const [prefilledDepartement, setPrefilledDepartement] = useState<Departement | null>(null)
//   const [prefilledFiliere, setPrefilledFiliere] = useState<Filiere | null>(null)

//   const [loadingDependencies, setLoadingDependencies] = useState(false)
//   const [dependenciesLoaded, setDependenciesLoaded] = useState(false)

//   useEffect(() => {
//     fetchFacultes()
//     fetchAnnees()
//   }, [])

//   // Charger les données pré-remplies
//   useEffect(() => {
//     if (prefillData && facultes.length > 0 && annees.length > 0) {
//       loadPrefilledData()
//     }
//   }, [prefillData, facultes, annees])

//   // Charger automatiquement le département et la faculté à partir de la filière
//   useEffect(() => {
//     if (prefillData?.filiere_id && !prefillData.departement_id && !dependenciesLoaded) {
//       loadDependenciesFromFiliere()
//     }
//   }, [prefillData?.filiere_id, dependenciesLoaded])

//   const loadDependenciesFromFiliere = async () => {
//     if (!prefillData?.filiere_id || dependenciesLoaded) return
    
//     setLoadingDependencies(true)
//     try {
//       const { data: filiereData, error } = await supabase
//         .from('filieres')
//         .select('*, departement:departements(*, faculte:facultes(*))')
//         .eq('id', prefillData.filiere_id)
//         .single()

//       if (error) throw error

//       if (filiereData && filiereData.departement) {
//         const departement = filiereData.departement
//         const faculte = filiereData.departement.faculte

//         setFormData(prev => ({
//           ...prev,
//           departement_id: departement.id,
//           faculte_id: faculte.id
//         }))

//         await fetchDepartements(faculte.id)
//         await fetchFilieres(departement.id)

//         setPrefilledDepartement(departement)
//         setPrefilledFaculte(faculte)
        
//         setDependenciesLoaded(true)
//       }
//     } catch (error) {
//       console.error('Erreur lors du chargement des dépendances:', error)
//     } finally {
//       setLoadingDependencies(false)
//     }
//   }

//   const loadPrefilledData = async () => {
//     if (!prefillData) return

//     if (prefillData.annee_academique_id) {
//       const annee = annees.find(a => a.id === prefillData.annee_academique_id)
//       if (annee) setPrefilledAnnee(annee)
//     }

//     if (prefillData.filiere_id) {
//       const filiere = filieres.find(f => f.id === prefillData.filiere_id)
//       if (filiere) {
//         setPrefilledFiliere(filiere)
//       } else {
//         const { data: filiereData } = await supabase
//           .from('filieres')
//           .select('*')
//           .eq('id', prefillData.filiere_id)
//           .single()
        
//         if (filiereData) {
//           setPrefilledFiliere(filiereData)
//           setFormData(prev => ({ ...prev, filiere_id: filiereData.id }))
//         }
//       }
//     }

//     if (prefillData.faculte_id) {
//       const faculte = facultes.find(f => f.id === prefillData.faculte_id)
//       if (faculte) {
//         setPrefilledFaculte(faculte)
//         await fetchDepartements(faculte.id)
//       }
//     }

//     if (prefillData.departement_id) {
//       const departement = departements.find(d => d.id === prefillData.departement_id)
//       if (departement) {
//         setPrefilledDepartement(departement)
//         await fetchFilieres(departement.id)
//       } else {
//         const { data: deptData } = await supabase
//           .from('departements')
//           .select('*')
//           .eq('id', prefillData.departement_id)
//           .single()
        
//         if (deptData) {
//           setPrefilledDepartement(deptData)
//           setFormData(prev => ({ ...prev, departement_id: deptData.id }))
          
//           if (!prefillData.faculte_id) {
//             const { data: facData } = await supabase
//               .from('facultes')
//               .select('*')
//               .eq('id', deptData.faculte_id)
//               .single()
            
//             if (facData) {
//               setPrefilledFaculte(facData)
//               setFormData(prev => ({ ...prev, faculte_id: facData.id }))
//               await fetchDepartements(facData.id)
//             }
//           }
//         }
//       }
//     }
//   }

//   const fetchFacultes = async () => {
//     const { data, error } = await supabase
//       .from('facultes')
//       .select('*')
//       .order('nom')
    
//     if (!error && data) {
//       setFacultes(data)
//     }
//   }

//   const fetchAnnees = async () => {
//     const { data, error } = await supabase
//       .from('annees_academiques')
//       .select('*')
//       .order('annee', { ascending: false })
    
//     if (!error && data) {
//       setAnnees(data)
//     }
//   }

//   const fetchDepartements = async (faculteId: number) => {
//     const { data, error } = await supabase
//       .from('departements')
//       .select('*')
//       .eq('faculte_id', faculteId)
//       .order('nom')
    
//     if (!error && data) {
//       setDepartements(data)
//     }
//   }

//   const fetchFilieres = async (departementId: number) => {
//     const { data, error } = await supabase
//       .from('filieres')
//       .select('*')
//       .eq('departement_id', departementId)
//       .order('nom')
    
//     if (!error && data) {
//       setFilieres(data)
//     }
//   }

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target
    
//     if (name === 'faculte_id') {
//       const faculteId = parseInt(value)
//       setFormData(prev => ({ 
//         ...prev, 
//         [name]: faculteId,
//         departement_id: 0,
//         filiere_id: 0
//       }))
//       if (faculteId > 0) {
//         fetchDepartements(faculteId)
//       }
//     } 
//     else if (name === 'departement_id') {
//       const deptId = parseInt(value)
//       setFormData(prev => ({ 
//         ...prev, 
//         [name]: deptId,
//         filiere_id: 0
//       }))
//       if (deptId > 0) {
//         fetchFilieres(deptId)
//       }
//     }
//     else if (name === 'annee_academique_id' || name === 'filiere_id') {
//       setFormData(prev => ({ ...prev, [name]: parseInt(value) }))
//     }
//     else if (name === 'note') {
//       setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
//     }
//     else {
//       setFormData(prev => ({ ...prev, [name]: value }))
//     }
//   }

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null
//     setFormData(prev => ({ ...prev, fichier: file }))
    
//     if (file && onFileSelect) {
//       onFileSelect(file)
//     }
//   }

//   const handleRemoveFile = () => {
//     setFormData(prev => ({ ...prev, fichier: null }))
//   }

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
    
//     // Vérifier le fichier seulement si docAvailable est true
//     if (docAvailable) {
//       if (!formData.fichier) {
//         alert('Veuillez sélectionner un fichier')
//         return
//       }
      
//       if (formData.fichier.size > 50 * 1024 * 1024) {
//         alert('Le fichier est trop volumineux. Taille maximale: 50MB')
//         return
//       }
//     }
    
//     onSubmit(formData)
//   }

//   const isPrefilled = prefillData && (
//     prefillData.faculte_id || 
//     prefillData.annee_academique_id || 
//     prefillData.departement_id || 
//     prefillData.filiere_id
//   )

//   const areDependenciesLoaded = !loadingDependencies && 
//     (prefillData?.filiere_id ? dependenciesLoaded : true)

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       {isPrefilled && (
//         <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg p-4 mb-6">
//           <h3 className="text-blue-800 dark:text-blue-300 font-medium mb-2">Informations pré-remplies depuis l'explorateur</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//             {prefilledAnnee && (
//               <div>
//                 <span className="text-blue-600 dark:text-blue-400 font-medium">Année académique:</span>
//                 <p className="text-blue-800 dark:text-blue-300">{prefilledAnnee.annee}</p>
//               </div>
//             )}
//             {prefilledFiliere && (
//               <div>
//                 <span className="text-blue-600 dark:text-blue-400 font-medium">Filière:</span>
//                 <p className="text-blue-800 dark:text-blue-300">{prefilledFiliere.nom}</p>
//               </div>
//             )}
//             {prefilledDepartement && areDependenciesLoaded && (
//               <div>
//                 <span className="text-blue-600 dark:text-blue-400 font-medium">Département:</span>
//                 <p className="text-blue-800 dark:text-blue-300">{prefilledDepartement.nom}</p>
//               </div>
//             )}
//             {prefilledFaculte && areDependenciesLoaded && (
//               <div>
//                 <span className="text-blue-600 dark:text-blue-400 font-medium">Faculté:</span>
//                 <p className="text-blue-800 dark:text-blue-300">{prefilledFaculte.nom}</p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {loadingDependencies && (
//         <div className="bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-lg p-4 mb-6">
//           <div className="flex items-center space-x-2">
//             <svg className="animate-spin h-4 w-4 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//             </svg>
//             <span className="text-yellow-700 dark:text-yellow-300">Chargement des informations de structure...</span>
//           </div>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Section Informations de base */}
//         <div className="md:col-span-2">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b dark:border-gray-600">Informations de base</h3>
//         </div>

//         <div>
//           <label htmlFor="titre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//             Titre du TFC *
//           </label>
//           <input
//             type="text"
//             id="titre"
//             name="titre"
//             value={formData.titre}
//             onChange={handleChange}
//             required
//             className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white border p-2"
//             placeholder="Entrez le titre du travail de fin de cycle"
//           />
//         </div>

//         <div>
//           <label htmlFor="auteur" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//             Auteur *
//           </label>
//           <input
//             type="text"
//             id="auteur"
//             name="auteur"
//             value={formData.auteur}
//             onChange={handleChange}
//             required
//             className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white border p-2"
//             placeholder="Nom complet de l'auteur"
//           />
//         </div>

//         <div>
//           <label htmlFor="auteur_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//             Email de l'auteur
//           </label>
//           <input
//             type="email"
//             id="auteur_email"
//             name="auteur_email"
//             value={formData.auteur_email}
//             onChange={handleChange}
//             className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white border p-2"
//             placeholder="email@exemple.com"
//           />
//         </div>

//         <div>
//           <label htmlFor="promoteur" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//             Promoteur *
//           </label>
//           <input
//             type="text"
//             id="promoteur"
//             name="promoteur"
//             value={formData.promoteur}
//             onChange={handleChange}
//             required
//             className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white border p-2"
//             placeholder="Nom du promoteur"
//           />
//         </div>

//         <div>
//           <label htmlFor="cas_application" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//             Cas d'application
//           </label>
//           <input
//             type="text"
//             id="cas_application"
//             name="cas_application"
//             value={formData.cas_application}
//             onChange={handleChange}
//             className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white border p-2"
//             placeholder="ex: Entreprise X, Organisation Y, etc."
//           />
//           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//             Laisser vide pour utiliser "Non spécifié" par défaut
//           </p>
//         </div>

//         {/* Section Structure académique */}
//         <div className="md:col-span-2 mt-6">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b dark:border-gray-600">Structure académique</h3>
//         </div>

//         <div>
//           <label htmlFor="faculte_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//             Faculté *
//           </label>
//           <select
//             id="faculte_id"
//             name="faculte_id"
//             value={formData.faculte_id}
//             onChange={handleChange}
//             required
//             disabled={loadingDependencies}
//             className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white border p-2 disabled:bg-gray-100 dark:disabled:bg-gray-800"
//           >
//             <option value={0}>Sélectionner une faculté</option>
//             {facultes.map(faculte => (
//               <option key={faculte.id} value={faculte.id}>
//                 {faculte.nom}
//               </option>
//             ))}
//           </select>
//           {prefilledFaculte && areDependenciesLoaded && (
//             <p className="text-xs text-green-600 dark:text-green-400 mt-1">
//               Pré-rempli: {prefilledFaculte.nom}
//             </p>
//           )}
//         </div>

//         <div>
//           <label htmlFor="departement_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//             Département *
//           </label>
//           <select
//             id="departement_id"
//             name="departement_id"
//             value={formData.departement_id}
//             onChange={handleChange}
//             required
//             disabled={loadingDependencies || formData.faculte_id === 0}
//             className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white border p-2 disabled:bg-gray-100 dark:disabled:bg-gray-800"
//           >
//             <option value={0}>
//               {formData.faculte_id === 0 ? 'Sélectionnez d\'abord une faculté' : 'Sélectionner un département'}
//             </option>
//             {departements.map(departement => (
//               <option key={departement.id} value={departement.id}>
//                 {departement.nom}
//               </option>
//             ))}
//           </select>
//           {prefilledDepartement && areDependenciesLoaded && (
//             <p className="text-xs text-green-600 dark:text-green-400 mt-1">
//               Pré-rempli: {prefilledDepartement.nom}
//             </p>
//           )}
//         </div>

//         <div>
//           <label htmlFor="filiere_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//             Filière *
//           </label>
//           <select
//             id="filiere_id"
//             name="filiere_id"
//             value={formData.filiere_id}
//             onChange={handleChange}
//             required
//             disabled={loadingDependencies || formData.departement_id === 0}
//             className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white border p-2 disabled:bg-gray-100 dark:disabled:bg-gray-800"
//           >
//             <option value={0}>
//               {formData.departement_id === 0 ? 'Sélectionnez d\'abord un département' : 'Sélectionner une filière'}
//             </option>
//             {filieres.map(filiere => (
//               <option key={filiere.id} value={filiere.id}>
//                 {filiere.nom}
//               </option>
//             ))}
//           </select>
//           {prefilledFiliere && (
//             <p className="text-xs text-green-600 dark:text-green-400 mt-1">
//               {loadingDependencies ? 'Chargement...' : `Pré-rempli: ${prefilledFiliere.nom}`}
//             </p>
//           )}
//         </div>

//         <div>
//           <label htmlFor="annee_academique_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//             Année académique *
//           </label>
//           <select
//             id="annee_academique_id"
//             name="annee_academique_id"
//             value={formData.annee_academique_id}
//             onChange={handleChange}
//             required
//             className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white border p-2"
//           >
//             <option value={0}>Sélectionner une année</option>
//             {annees.map(annee => (
//               <option key={annee.id} value={annee.id}>
//                 {annee.annee}
//               </option>
//             ))}
//           </select>
//           {prefilledAnnee && (
//             <p className="text-xs text-green-600 dark:text-green-400 mt-1">
//               Pré-rempli: {prefilledAnnee.annee}
//             </p>
//           )}
//         </div>

//         {/* Section Informations complémentaires */}
//         <div className="md:col-span-2 mt-6">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b dark:border-gray-600">Informations complémentaires</h3>
//         </div>

//         <div>
//           <label htmlFor="date_soutenance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//             Date de soutenance
//           </label>
//           <input
//             type="date"
//             id="date_soutenance"
//             name="date_soutenance"
//             value={formData.date_soutenance}
//             onChange={handleChange}
//             className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white border p-2"
//           />
//         </div>

//         <div>
//           <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//             Note (sur 20)
//           </label>
//           <input
//             type="number"
//             id="note"
//             name="note"
//             min="0"
//             max="20"
//             step="0.1"
//             value={formData.note}
//             onChange={handleChange}
//             className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white border p-2"
//             placeholder="ex: 16.5"
//           />
//         </div>

//         <div className="md:col-span-2">
//           <label htmlFor="mots_cles" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//             Mots-clés (séparés par des virgules) *
//           </label>
//           <input
//             type="text"
//             id="mots_cles"
//             name="mots_cles"
//             value={formData.mots_cles}
//             onChange={handleChange}
//             required
//             className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white border p-2"
//             placeholder="ex: intelligence artificielle, machine learning, deep learning"
//           />
//         </div>

//         {/* Fonctionnalités */}
//         <div className="space-y-2">
//           <label htmlFor="fonctionnalites" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//             Fonctionnalités principales
//           </label>
//           <input
//             type="text"
//             id="fonctionnalites"
//             name="fonctionnalites"
//             value={formData.fonctionnalites}
//             onChange={handleChange}
//             placeholder="Ex: Authentification, Gestion des utilisateurs, Rapport PDF, API REST"
//             className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//           />
//           <p className="text-xs text-gray-500 dark:text-gray-400">
//             Séparez les fonctionnalités par des virgules
//           </p>
//         </div>

//         <div className="md:col-span-2">
//           <label htmlFor="technologies" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//             Technologies utilisées (séparées par des virgules)
//           </label>
//           <input
//             type="text"
//             id="technologies"
//             name="technologies"
//             value={formData.technologies || ''}
//             onChange={handleChange}
//             className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white border p-2"
//             placeholder="ex: React, Node.js, Python, TensorFlow, MongoDB"
//           />
//           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//             Liste des technologies, frameworks et outils utilisés dans le projet (optionnel)
//           </p>
//         </div>

//         <div className="md:col-span-2">
//           <label htmlFor="resume" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//             Résumé *
//           </label>
//           <textarea
//             id="resume"
//             name="resume"
//             rows={4}
//             value={formData.resume}
//             onChange={handleChange}
//             required
//             className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white border p-2"
//             placeholder="Résumé détaillé du travail de fin de cycle..."
//           ></textarea>
//         </div>

//         {/* Section Fichier - conditionnée par docAvailable */}
//         {docAvailable && (
//           <>
//             <div className="md:col-span-2 mt-6">
//               <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b dark:border-gray-600">
//                 Fichier du TFC
//               </h3>
//             </div>

//             <div className="md:col-span-2">
//               <label htmlFor="fichier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Fichier du TFC (PDF/DOC) *
//               </label>
              
//               {!formData.fichier ? (
//                 <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
//                   <div className="space-y-1 text-center">
//                     <FileUp className="mx-auto h-12 w-12 text-gray-400" />
//                     <div className="flex text-sm text-gray-600 dark:text-gray-400">
//                       <label htmlFor="fichier" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 focus-within:outline-none">
//                         <span>Téléversez un fichier</span>
//                         <input
//                           type="file"
//                           id="fichier"
//                           name="fichier"
//                           onChange={handleFileChange}
//                           accept=".pdf,.doc,.docx"
//                           required={docAvailable}
//                           className="sr-only"
//                         />
//                       </label>
//                       <p className="pl-1">ou glissez-déposez</p>
//                     </div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOC, DOCX jusqu'à 50MB</p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-3">
//                       {getFileIcon(formData.fichier.name)}
//                       <div>
//                         <p className="font-medium text-gray-900 dark:text-white">
                          
//                           <TruncateText text={formData.fichier.name} limit={16} type='characters' />
                          
//                           </p>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                           {formatFileSize(formData.fichier.size)} • {formData.fichier.type}
//                         </p>
//                       </div>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={handleRemoveFile}
//                       className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
//                     >
//                       <X className="h-5 w-5" />
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </>
//         )}

//         {/* Message lorsque docAvailable est false */}
//         {!docAvailable && (
//           <div className="md:col-span-2">
//             <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
//               <div className="flex items-center space-x-3">
//                 <FileText className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
//                 <div>
//                   <h4 className="text-yellow-800 dark:text-yellow-300 font-medium">
//                     Aucun document ne sera uploadé
//                   </h4>
//                   <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
//                     Le TFC sera créé avec les métadonnées seulement. Vous pourrez ajouter un document plus tard.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="flex justify-end space-x-4 pt-6 border-t dark:border-gray-600">
//         <button
//           type="button"
//           onClick={() => window.history.back()}
//           className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//         >
//           Annuler
//         </button>
//         <button
//           type="submit"
//           disabled={isLoading || loadingDependencies}
//           className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {isLoading ? (
//             <>
//               <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//               Envoi en cours...
//             </>
//           ) : (
//             'Ajouter le TFC'
//           )}
//         </button>
//       </div>
//     </form>
//   )
// }

// components/forms/TFCForm.tsx
'use client'

import { useState, useEffect } from 'react'
import type { IconType } from 'react-icons'
import {
  FiFileText,
  FiUploadCloud,
  FiX,
  FiLoader,
  FiPlus,
  FiUser,
  FiLayers,
  FiAlignLeft,
  FiInfo,
} from 'react-icons/fi'
import { TFCFormData, Faculte, AnneeAcademique, Departement, Filiere } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import TruncateText from '../TruncateText'

interface TFCFormProps {
  onSubmit: (formData: TFCFormData) => Promise<void>
  isLoading?: boolean
  onFileSelect?: (file: File) => void
  prefillData?: {
    faculte_id?: number
    annee_academique_id?: number
    departement_id?: number
    filiere_id?: number
  }
  docAvailable?: boolean
}

/* ------------------------------ Styles communs ---------------------------- */

const labelCls = 'block text-xs font-medium text-zinc-700 dark:text-zinc-300'

const inputCls =
  'mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500'

const hintCls = 'mt-1 text-[11px] text-zinc-500 dark:text-zinc-400'
const okCls = 'mt-1 text-[11px] text-emerald-600 dark:text-emerald-400'

/* ------------------------------- Helpers --------------------------------- */

// Icône du fichier selon le type
const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()

  if (extension === 'pdf') {
    return <FiFileText className="h-6 w-6 text-rose-500" aria-hidden />
  } else if (['doc', 'docx'].includes(extension || '')) {
    return <FiFileText className="h-6 w-6 text-sky-500" aria-hidden />
  }
  return <FiFileText className="h-6 w-6 text-zinc-500" aria-hidden />
}

// Taille du fichier lisible
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const ACCEPTED_EXT = ['pdf', 'doc', 'docx']

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: IconType
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <h3 className="mb-4 flex items-center gap-2 border-b border-zinc-200 pb-3 text-sm font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-50">
        <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" aria-hidden />
        {title}
      </h3>
      <div className="flex flex-1 flex-col gap-4">{children}</div>
    </section>
  )
}

/* --------------------------------- Form ---------------------------------- */

export default function TFCForm({
  onSubmit,
  isLoading = false,
  onFileSelect,
  prefillData,
  docAvailable = true,
}: TFCFormProps) {
  const [formData, setFormData] = useState<TFCFormData>({
    titre: '',
    resume: '',
    mots_cles: '',
    auteur: '',
    technologies: '',
    fonctionnalites: '',
    auteur_email: '',
    promoteur: '',
    cas_application: '',
    faculte_id: prefillData?.faculte_id || 0,
    annee_academique_id: prefillData?.annee_academique_id || 0,
    departement_id: prefillData?.departement_id || 0,
    filiere_id: prefillData?.filiere_id || 0,
    date_soutenance: '',
    note: 0,
    fichier: null,
  })

  const [facultes, setFacultes] = useState<Faculte[]>([])
  const [annees, setAnnees] = useState<AnneeAcademique[]>([])
  const [departements, setDepartements] = useState<Departement[]>([])
  const [filieres, setFilieres] = useState<Filiere[]>([])

  const [prefilledFaculte, setPrefilledFaculte] = useState<Faculte | null>(null)
  const [prefilledAnnee, setPrefilledAnnee] = useState<AnneeAcademique | null>(null)
  const [prefilledDepartement, setPrefilledDepartement] = useState<Departement | null>(null)
  const [prefilledFiliere, setPrefilledFiliere] = useState<Filiere | null>(null)

  const [loadingDependencies, setLoadingDependencies] = useState(false)
  const [dependenciesLoaded, setDependenciesLoaded] = useState(false)

  useEffect(() => {
    fetchFacultes()
    fetchAnnees()
  }, [])

  // Charger les données pré-remplies
  useEffect(() => {
    if (prefillData && facultes.length > 0 && annees.length > 0) {
      loadPrefilledData()
    }
  }, [prefillData, facultes, annees])

  // Charger automatiquement le département et la faculté à partir de la filière
  useEffect(() => {
    if (prefillData?.filiere_id && !prefillData.departement_id && !dependenciesLoaded) {
      loadDependenciesFromFiliere()
    }
  }, [prefillData?.filiere_id, dependenciesLoaded])

  const loadDependenciesFromFiliere = async () => {
    if (!prefillData?.filiere_id || dependenciesLoaded) return

    setLoadingDependencies(true)
    try {
      const { data: filiereData, error } = await supabase
        .from('filieres')
        .select('*, departement:departements(*, faculte:facultes(*))')
        .eq('id', prefillData.filiere_id)
        .single()

      if (error) throw error

      if (filiereData && filiereData.departement) {
        const departement = filiereData.departement
        const faculte = filiereData.departement.faculte

        setFormData((prev) => ({
          ...prev,
          departement_id: departement.id,
          faculte_id: faculte.id,
        }))

        await fetchDepartements(faculte.id)
        await fetchFilieres(departement.id)

        setPrefilledDepartement(departement)
        setPrefilledFaculte(faculte)

        setDependenciesLoaded(true)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des dépendances:', error)
    } finally {
      setLoadingDependencies(false)
    }
  }

  const loadPrefilledData = async () => {
    if (!prefillData) return

    if (prefillData.annee_academique_id) {
      const annee = annees.find((a) => a.id === prefillData.annee_academique_id)
      if (annee) setPrefilledAnnee(annee)
    }

    if (prefillData.filiere_id) {
      const filiere = filieres.find((f) => f.id === prefillData.filiere_id)
      if (filiere) {
        setPrefilledFiliere(filiere)
      } else {
        const { data: filiereData } = await supabase
          .from('filieres')
          .select('*')
          .eq('id', prefillData.filiere_id)
          .single()

        if (filiereData) {
          setPrefilledFiliere(filiereData)
          setFormData((prev) => ({ ...prev, filiere_id: filiereData.id }))
        }
      }
    }

    if (prefillData.faculte_id) {
      const faculte = facultes.find((f) => f.id === prefillData.faculte_id)
      if (faculte) {
        setPrefilledFaculte(faculte)
        await fetchDepartements(faculte.id)
      }
    }

    if (prefillData.departement_id) {
      const departement = departements.find((d) => d.id === prefillData.departement_id)
      if (departement) {
        setPrefilledDepartement(departement)
        await fetchFilieres(departement.id)
      } else {
        const { data: deptData } = await supabase
          .from('departements')
          .select('*')
          .eq('id', prefillData.departement_id)
          .single()

        if (deptData) {
          setPrefilledDepartement(deptData)
          setFormData((prev) => ({ ...prev, departement_id: deptData.id }))

          if (!prefillData.faculte_id) {
            const { data: facData } = await supabase
              .from('facultes')
              .select('*')
              .eq('id', deptData.faculte_id)
              .single()

            if (facData) {
              setPrefilledFaculte(facData)
              setFormData((prev) => ({ ...prev, faculte_id: facData.id }))
              await fetchDepartements(facData.id)
            }
          }
        }
      }
    }
  }

  const fetchFacultes = async () => {
    const { data, error } = await supabase.from('facultes').select('*').order('nom')

    if (!error && data) {
      setFacultes(data)
    }
  }

  const fetchAnnees = async () => {
    const { data, error } = await supabase
      .from('annees_academiques')
      .select('*')
      .order('annee', { ascending: false })

    if (!error && data) {
      setAnnees(data)
    }
  }

  const fetchDepartements = async (faculteId: number) => {
    const { data, error } = await supabase
      .from('departements')
      .select('*')
      .eq('faculte_id', faculteId)
      .order('nom')

    if (!error && data) {
      setDepartements(data)
    }
  }

  const fetchFilieres = async (departementId: number) => {
    const { data, error } = await supabase
      .from('filieres')
      .select('*')
      .eq('departement_id', departementId)
      .order('nom')

    if (!error && data) {
      setFilieres(data)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    if (name === 'faculte_id') {
      const faculteId = parseInt(value)
      setFormData((prev) => ({
        ...prev,
        [name]: faculteId,
        departement_id: 0,
        filiere_id: 0,
      }))
      if (faculteId > 0) {
        fetchDepartements(faculteId)
      }
    } else if (name === 'departement_id') {
      const deptId = parseInt(value)
      setFormData((prev) => ({
        ...prev,
        [name]: deptId,
        filiere_id: 0,
      }))
      if (deptId > 0) {
        fetchFilieres(deptId)
      }
    } else if (name === 'annee_academique_id' || name === 'filiere_id') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) }))
    } else if (name === 'note') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const selectFile = (file: File | null) => {
    setFormData((prev) => ({ ...prev, fichier: file }))
    if (file && onFileSelect) {
      onFileSelect(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    selectFile(e.target.files?.[0] || null)
  }

  // Glisser-déposer (le texte de la zone le promet)
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (!ACCEPTED_EXT.includes(ext)) {
      alert('Format non accepté. Utilisez un fichier PDF, DOC ou DOCX.')
      return
    }
    selectFile(file)
  }

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, fichier: null }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Vérifier le fichier seulement si docAvailable est true
    if (docAvailable) {
      if (!formData.fichier) {
        alert('Veuillez sélectionner un fichier')
        return
      }

      if (formData.fichier.size > 50 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximale: 50MB')
        return
      }
    }

    onSubmit(formData)
  }

  const isPrefilled =
    prefillData &&
    (prefillData.faculte_id ||
      prefillData.annee_academique_id ||
      prefillData.departement_id ||
      prefillData.filiere_id)

  const areDependenciesLoaded =
    !loadingDependencies && (prefillData?.filiere_id ? dependenciesLoaded : true)

  const prefillChips: { label: string; value: string }[] = []
  if (prefilledFaculte && areDependenciesLoaded)
    prefillChips.push({ label: 'Faculté', value: prefilledFaculte.nom })
  if (prefilledDepartement && areDependenciesLoaded)
    prefillChips.push({ label: 'Département', value: prefilledDepartement.nom })
  if (prefilledFiliere) prefillChips.push({ label: 'Filière', value: prefilledFiliere.nom })
  if (prefilledAnnee) prefillChips.push({ label: 'Année', value: prefilledAnnee.annee })

  /* ------------------------------- Rendu ------------------------------- */

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Informations pré-remplies */}
      {isPrefilled && prefillChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
          <span className="flex items-center gap-1.5 font-medium">
            <FiInfo className="h-4 w-4" aria-hidden />
            Pré-rempli depuis l’explorateur :
          </span>
          {prefillChips.map((c) => (
            <span
              key={c.label}
              className="rounded-full bg-white px-2 py-0.5 ring-1 ring-sky-200 dark:bg-zinc-900/40 dark:ring-sky-500/20"
            >
              <span className="text-sky-600 dark:text-sky-400">{c.label} :</span> {c.value}
            </span>
          ))}
        </div>
      )}

      {loadingDependencies && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          <FiLoader className="h-4 w-4 animate-spin" aria-hidden />
          Chargement des informations de structure…
        </div>
      )}

      {/* 3 sections côte à côte sur desktop */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Colonne 1 : informations de base */}
        <Section title="Informations de base" icon={FiUser}>
          <div>
            <label htmlFor="titre" className={labelCls}>
              Titre du TFC *
            </label>
            <input
              type="text"
              id="titre"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              required
              className={inputCls}
              placeholder="Titre du travail de fin de cycle"
            />
          </div>

          <div>
            <label htmlFor="auteur" className={labelCls}>
              Auteur *
            </label>
            <input
              type="text"
              id="auteur"
              name="auteur"
              value={formData.auteur}
              onChange={handleChange}
              required
              className={inputCls}
              placeholder="Nom complet de l'auteur"
            />
          </div>

          <div>
            <label htmlFor="auteur_email" className={labelCls}>
              Email de l'auteur
            </label>
            <input
              type="email"
              id="auteur_email"
              name="auteur_email"
              value={formData.auteur_email}
              onChange={handleChange}
              className={inputCls}
              placeholder="email@exemple.com"
            />
          </div>

          <div>
            <label htmlFor="promoteur" className={labelCls}>
              Promoteur *
            </label>
            <input
              type="text"
              id="promoteur"
              name="promoteur"
              value={formData.promoteur}
              onChange={handleChange}
              required
              className={inputCls}
              placeholder="Nom du promoteur"
            />
          </div>

          <div>
            <label htmlFor="cas_application" className={labelCls}>
              Cas d'application
            </label>
            <input
              type="text"
              id="cas_application"
              name="cas_application"
              value={formData.cas_application}
              onChange={handleChange}
              className={inputCls}
              placeholder="ex: Entreprise X, Organisation Y"
            />
            <p className={hintCls}>Laisser vide pour « Non spécifié »</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="date_soutenance" className={labelCls}>
                Date de soutenance
              </label>
              <input
                type="date"
                id="date_soutenance"
                name="date_soutenance"
                value={formData.date_soutenance}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="note" className={labelCls}>
                Note (sur 20)
              </label>
              <input
                type="number"
                id="note"
                name="note"
                min="0"
                max="20"
                step="0.1"
                value={formData.note}
                onChange={handleChange}
                className={inputCls}
                placeholder="ex: 16.5"
              />
            </div>
          </div>
        </Section>

        {/* Colonne 2 : structure académique + fichier */}
        <Section title="Structure académique" icon={FiLayers}>
          <div>
            <label htmlFor="faculte_id" className={labelCls}>
              Faculté *
            </label>
            <select
              id="faculte_id"
              name="faculte_id"
              value={formData.faculte_id}
              onChange={handleChange}
              required
              disabled={loadingDependencies}
              className={inputCls}
            >
              <option value={0}>Sélectionner une faculté</option>
              {facultes.map((faculte) => (
                <option key={faculte.id} value={faculte.id}>
                  {faculte.nom}
                </option>
              ))}
            </select>
            {prefilledFaculte && areDependenciesLoaded && (
              <p className={okCls}>Pré-rempli : {prefilledFaculte.nom}</p>
            )}
          </div>

          <div>
            <label htmlFor="departement_id" className={labelCls}>
              Département *
            </label>
            <select
              id="departement_id"
              name="departement_id"
              value={formData.departement_id}
              onChange={handleChange}
              required
              disabled={loadingDependencies || formData.faculte_id === 0}
              className={inputCls}
            >
              <option value={0}>
                {formData.faculte_id === 0
                  ? "Sélectionnez d'abord une faculté"
                  : 'Sélectionner un département'}
              </option>
              {departements.map((departement) => (
                <option key={departement.id} value={departement.id}>
                  {departement.nom}
                </option>
              ))}
            </select>
            {prefilledDepartement && areDependenciesLoaded && (
              <p className={okCls}>Pré-rempli : {prefilledDepartement.nom}</p>
            )}
          </div>

          <div>
            <label htmlFor="filiere_id" className={labelCls}>
              Filière *
            </label>
            <select
              id="filiere_id"
              name="filiere_id"
              value={formData.filiere_id}
              onChange={handleChange}
              required
              disabled={loadingDependencies || formData.departement_id === 0}
              className={inputCls}
            >
              <option value={0}>
                {formData.departement_id === 0
                  ? "Sélectionnez d'abord un département"
                  : 'Sélectionner une filière'}
              </option>
              {filieres.map((filiere) => (
                <option key={filiere.id} value={filiere.id}>
                  {filiere.nom}
                </option>
              ))}
            </select>
            {prefilledFiliere && (
              <p className={okCls}>
                {loadingDependencies ? 'Chargement…' : `Pré-rempli : ${prefilledFiliere.nom}`}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="annee_academique_id" className={labelCls}>
              Année académique *
            </label>
            <select
              id="annee_academique_id"
              name="annee_academique_id"
              value={formData.annee_academique_id}
              onChange={handleChange}
              required
              className={inputCls}
            >
              <option value={0}>Sélectionner une année</option>
              {annees.map((annee) => (
                <option key={annee.id} value={annee.id}>
                  {annee.annee}
                </option>
              ))}
            </select>
            {prefilledAnnee && <p className={okCls}>Pré-rempli : {prefilledAnnee.annee}</p>}
          </div>

          {/* Fichier */}
          {docAvailable ? (
            <div>
              <label htmlFor="fichier" className={labelCls}>
                Fichier du TFC (PDF/DOC) *
              </label>

              {!formData.fichier ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-zinc-300 px-4 py-4 dark:border-zinc-600"
                >
                  <div className="space-y-1 text-center">
                    <FiUploadCloud className="mx-auto h-7 w-7 text-zinc-400" aria-hidden />
                    <div className="flex flex-wrap justify-center text-xs text-zinc-600 dark:text-zinc-400">
                      <label
                        htmlFor="fichier"
                        className="relative cursor-pointer rounded-md font-medium text-sky-600 hover:text-sky-500 focus-within:outline-none dark:text-sky-400 dark:hover:text-sky-300"
                      >
                        <span>Téléversez un fichier</span>
                        <input
                          type="file"
                          id="fichier"
                          name="fichier"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx"
                          required={docAvailable}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">ou glissez-déposez</p>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      PDF, DOC, DOCX jusqu'à 50MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-1 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/40">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {getFileIcon(formData.fichier.name)}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          <TruncateText text={formData.fichier.name} limit={16} type="characters" />
                        </p>
                        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                          {formatFileSize(formData.fichier.size)} • {formData.fichier.type}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      aria-label="Retirer le fichier"
                      className="shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                    >
                      <FiX className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/30">
              <FiFileText className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
              <div>
                <h4 className="text-sm font-medium text-amber-900 dark:text-amber-200">
                  Aucun document ne sera uploadé
                </h4>
                <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">
                  Le TFC sera créé avec les métadonnées seulement. Vous pourrez ajouter un document plus tard.
                </p>
              </div>
            </div>
          )}
        </Section>

        {/* Colonne 3 : contenu */}
        <Section title="Contenu du TFC" icon={FiAlignLeft}>
          <div>
            <label htmlFor="mots_cles" className={labelCls}>
              Mots-clés (séparés par des virgules) *
            </label>
            <input
              type="text"
              id="mots_cles"
              name="mots_cles"
              value={formData.mots_cles}
              onChange={handleChange}
              required
              className={inputCls}
              placeholder="ex: intelligence artificielle, machine learning"
            />
          </div>

          <div>
            <label htmlFor="technologies" className={labelCls}>
              Technologies utilisées
            </label>
            <input
              type="text"
              id="technologies"
              name="technologies"
              value={formData.technologies || ''}
              onChange={handleChange}
              className={inputCls}
              placeholder="ex: React, Node.js, Python, MongoDB"
            />
            <p className={hintCls}>Séparées par des virgules (optionnel)</p>
          </div>

          <div>
            <label htmlFor="fonctionnalites" className={labelCls}>
              Fonctionnalités principales
            </label>
            <input
              type="text"
              id="fonctionnalites"
              name="fonctionnalites"
              value={formData.fonctionnalites}
              onChange={handleChange}
              placeholder="ex: Authentification, Rapport PDF, API REST"
              className={inputCls}
            />
            <p className={hintCls}>Séparez les fonctionnalités par des virgules</p>
          </div>

          <div className="flex flex-1 flex-col">
            <label htmlFor="resume" className={labelCls}>
              Résumé *
            </label>
            <textarea
              id="resume"
              name="resume"
              rows={6}
              value={formData.resume}
              onChange={handleChange}
              required
              className={`${inputCls} min-h-[8rem] flex-1 resize-y`}
              placeholder="Résumé détaillé du travail de fin de cycle…"
            ></textarea>
          </div>
        </Section>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading || loadingDependencies}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isLoading ? (
            <>
              <FiLoader className="h-4 w-4 animate-spin" aria-hidden />
              Envoi en cours…
            </>
          ) : (
            <>
              <FiPlus className="h-4 w-4" aria-hidden />
              Ajouter le TFC
            </>
          )}
        </button>
      </div>
    </form>
  )
}
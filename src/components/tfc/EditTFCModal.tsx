
// 'use client'

// import { useState, useEffect } from 'react'
// import { supabase } from '@/lib/supabase'
// import { 
//   X, 
//   Save, 
//   Loader, 
//   CheckCircle, 
//   AlertCircle, 
//   Tag, 
//   Settings, 
//   Rocket, 
//   FileText, 
//   Upload,
//   Download,
//   Trash2
// } from 'lucide-react'
// import { toast } from 'react-toastify'
// import RouteLoader from '../RouteLoader'
// import TruncateText from '../TruncateText'

// // Interfaces améliorées
// interface TFCList {
//   id: number
//   titre: string
//   auteur: string
//   annee: string
//   filiere: string
//   faculte: string
//   fichier_nom?: string
//   fichier_chemin?: string
//   doc_available?: boolean
// }

// interface EditTFCModalProps {
//   isOpen: boolean
//   onClose: () => void
//   tfc: TFCList | null
//   onTFCUpdated: () => void
// }

// interface FormData {
//   titre: string
//   auteur: string
//   auteur_email: string
//   promoteur: string
//   annee_academique_id: number
//   faculte_id: number
//   departement_id: number
//   filiere_id: number
//   resume: string
//   mots_cles: string[]
//   technologies: string[]
//   fonctionnalites: string[]
//   date_soutenance: string
//   note: number | null
//   cas_application: string
// }

// interface SelectOption {
//   id: number
//   nom: string
//   annee?: string
// }

// // Service pour générer les embeddings - VERSION MISE À JOUR
// class EmbeddingService {
//   static async generateEmbedding(text: string): Promise<number[]> {
//     try {
//       console.log('Début génération embedding avec SPECTER...')

//       const response = await fetch('/api/generate-embedding', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ text }),
//       })

//       const responseText = await response.text()
//       console.log('Réponse API:', response.status, responseText)

//       if (!response.ok) {
//         throw new Error(`Erreur API ${response.status}: ${responseText}`)
//       }

//       const data = JSON.parse(responseText)
      
//       if (!data.embedding) {
//         throw new Error('Format de réponse invalide: embedding manquant')
//       }

//       // VÉRIFIER LA DIMENSION DE L'EMBEDDING
//       if (data.embedding.length !== 768) {
//         console.warn(`Attention: Embedding a ${data.embedding.length} dimensions au lieu de 768`)
//       }

//       console.log(`Embedding généré avec succès (${data.embedding.length} dimensions)`)
//       return data.embedding

//     } catch (error: any) {
//       console.error('Erreur critique génération embedding:', error)
      
//       // Fallback: embedding vide de 768 dimensions (taille SPECTER)
//       const fallbackEmbedding = new Array(768).fill(0.001)
//       console.log('Utilisation embedding de secours (768 dimensions)')
//       return fallbackEmbedding
//     }
//   }

//   static async generateEmbeddingForTFC(tfcData: {
//     titre: string
//     resume: string
//     mots_cles: string[]
//     technologies: string[]
//     fonctionnalites: string[]
//     auteur: string
//     promoteur?: string
//     cas_application?: string
//   }): Promise<number[]> {
//     // Améliorer le texte pour l'embedding avec plus de contexte
//     const text = `
//       TITRE: ${tfcData.titre}
      
//       RÉSUMÉ: ${tfcData.resume}
      
//       DOMAINE: ${tfcData.mots_cles.join(', ')}
//       TECHNOLOGIES: ${tfcData.technologies.join(', ')}
//       FONCTIONNALITÉS: ${tfcData.fonctionnalites.join(', ')}
//       APPLICATION: ${tfcData.cas_application || 'anonymes'}
      
//       AUTEUR: ${tfcData.auteur}
//       PROMOTEUR: ${tfcData.promoteur || 'non spécifié'}
//     `.trim()

//     return this.generateEmbedding(text)
//   }
// }

// export default function EditTFCModal({ isOpen, onClose, tfc, onTFCUpdated }: EditTFCModalProps) {
//   const [loading, setLoading] = useState(false)
//   const [saving, setSaving] = useState(false)
//   const [uploading, setUploading] = useState(false)
//   const [uploadProgress, setUploadProgress] = useState(0)
//   const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
//   const [formData, setFormData] = useState<FormData>({
//     titre: '',
//     auteur: '',
//     auteur_email: '',
//     promoteur: '',
//     annee_academique_id: 0,
//     faculte_id: 0,
//     departement_id: 0,
//     filiere_id: 0,
//     resume: '',
//     mots_cles: [],
//     technologies: [],
//     fonctionnalites: [],
//     date_soutenance: '',
//     note: null,
//     cas_application: 'anonymes'
//   })

//   const [currentFile, setCurrentFile] = useState<{
//     name: string
//     path: string
//     size: number
//     type: string
//   } | null>(null)

//   const [annees, setAnnees] = useState<SelectOption[]>([])
//   const [facultes, setFacultes] = useState<SelectOption[]>([])
//   const [departements, setDepartements] = useState<SelectOption[]>([])
//   const [filieres, setFilieres] = useState<SelectOption[]>([])
//   const [motsClesInput, setMotsClesInput] = useState('')
//   const [technologiesInput, setTechnologiesInput] = useState('')
//   const [fonctionnalitesInput, setFonctionnalitesInput] = useState('')

//   useEffect(() => {
//     if (isOpen) {
//       setSaveStatus('idle')
//       setUploadProgress(0)
//       loadSelectData()
//       if (tfc) {
//         loadTFCData()
//       } else {
//         resetForm()
//       }
//     }
//   }, [isOpen, tfc])

//   const resetForm = () => {
//     setFormData({
//       titre: '',
//       auteur: '',
//       auteur_email: '',
//       promoteur: '',
//       annee_academique_id: 0,
//       faculte_id: 0,
//       departement_id: 0,
//       filiere_id: 0,
//       resume: '',
//       mots_cles: [],
//       technologies: [],
//       fonctionnalites: [],
//       date_soutenance: '',
//       note: null,
//       cas_application: 'anonymes'
//     })
//     setCurrentFile(null)
//     setMotsClesInput('')
//     setTechnologiesInput('')
//     setFonctionnalitesInput('')
//   }

//   const loadSelectData = async () => {
//     try {
//       setLoading(true)
//       const [
//         { data: anneesData },
//         { data: facultesData },
//         { data: departementsData },
//         { data: filieresData }
//       ] = await Promise.all([
//         supabase.from('annees_academiques').select('id, annee').order('annee', { ascending: false }),
//         supabase.from('facultes').select('id, nom').order('nom'),
//         supabase.from('departements').select('id, nom').order('nom'),
//         supabase.from('filieres').select('id, nom').order('nom')
//       ])

//       setAnnees((anneesData as SelectOption[]) || [])
//       setFacultes((facultesData as SelectOption[]) || [])
//       setDepartements((departementsData as SelectOption[]) || [])
//       setFilieres((filieresData as SelectOption[]) || [])
//     } catch (error) {
//       console.error('Erreur lors du chargement des données:', error)
//       toast.error('Erreur lors du chargement des données')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const loadTFCData = async () => {
//     if (!tfc) return

//     try {
//       setLoading(true)
//       const { data, error } = await supabase
//         .from('tfc')
//         .select('*')
//         .eq('id', tfc.id)
//         .single()

//       if (error) throw error

//       if (data) {
//         const formattedData = {
//           titre: data.titre || '',
//           auteur: data.auteur || '',
//           auteur_email: data.auteur_email || '',
//           promoteur: data.promoteur || '',
//           annee_academique_id: data.annee_academique_id || 0,
//           faculte_id: data.faculte_id || 0,
//           departement_id: data.departement_id || 0,
//           filiere_id: data.filiere_id || 0,
//           resume: data.resume || '',
//           mots_cles: data.mots_cles || [],
//           technologies: data.technologies || [],
//           fonctionnalites: data.fonctionnalites || [],
//           date_soutenance: data.date_soutenance || '',
//           note: data.note || null,
//           cas_application: data.cas_application || 'anonymes'
//         }
        
//         setFormData(formattedData)
//         setMotsClesInput(formattedData.mots_cles.join(', '))
//         setTechnologiesInput(formattedData.technologies.join(', '))
//         setFonctionnalitesInput(formattedData.fonctionnalites.join(', '))

//         // Charger les informations du fichier
//         if (data.fichier_nom && data.fichier_chemin) {
//           setCurrentFile({
//             name: data.fichier_nom,
//             path: data.fichier_chemin,
//             size: data.fichier_taille || 0,
//             type: data.fichier_type || 'application/pdf'
//           })
//         }
        
//         console.log('Données TFC chargées:', formattedData)
//       }
//     } catch (error) {
//       console.error('Erreur lors du chargement du TFC:', error)
//       toast.error('Erreur lors du chargement des données du TFC')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleFileUpload = async (file: File) => {
//     if (!tfc) return

//     try {
//       setUploading(true)
//       setUploadProgress(0)

//       // Simuler la progression
//       const progressInterval = setInterval(() => {
//         setUploadProgress(prev => {
//           if (prev >= 90) {
//             clearInterval(progressInterval)
//             return 90
//           }
//           return prev + 10
//         })
//       }, 200)

//       // Normaliser le nom du fichier
//       const normalizeString = (str: string): string => {
//         return str
//           .normalize('NFD')
//           .replace(/[\u0300-\u036f]/g, '')
//           .replace(/[^a-zA-Z0-9\s\-_]/g, '')
//           .replace(/\s+/g, '-')
//           .toLowerCase()
//       }

//       const fileExtension = file.name.split('.').pop()
//       const normalizedFileName = normalizeString(file.name.split('.')[0])
//       const fileName = `${normalizedFileName}.${fileExtension}`
//       const filePath = `tfc-uploads/${tfc.id}/${fileName}`

//       // Upload du fichier
//       const { error: uploadError } = await supabase.storage
//         .from('tfc-bucket')
//         .upload(filePath, file)

//       clearInterval(progressInterval)

//       if (uploadError) {
//         throw new Error(`Erreur lors de l'upload: ${uploadError.message}`)
//       }

//       // Mettre à jour le TFC avec les infos du fichier
//       const { error: updateError } = await supabase
//         .from('tfc')
//         .update({
//           fichier_nom: file.name,
//           fichier_chemin: filePath,
//           fichier_taille: file.size,
//           fichier_type: file.type,
//           doc_available: true,
//           updated_at: new Date().toISOString()
//         })
//         .eq('id', tfc.id)

//       if (updateError) {
//         // Supprimer le fichier uploadé en cas d'erreur
//         await supabase.storage.from('tfc-bucket').remove([filePath])
//         throw new Error(`Erreur mise à jour: ${updateError.message}`)
//       }

//       setUploadProgress(100)
//       setCurrentFile({
//         name: file.name,
//         path: filePath,
//         size: file.size,
//         type: file.type
//       })

//       toast.success('Fichier uploadé avec succès!')
      
//       setTimeout(() => {
//         setUploading(false)
//         setUploadProgress(0)
//       }, 1000)

//     } catch (error: any) {
//       console.error('Erreur upload fichier:', error)
//       setUploading(false)
//       setUploadProgress(0)
//       toast.error(`Erreur: ${error.message}`)
//     }
//   }

//   const handleFileRemove = async () => {
//     if (!tfc || !currentFile) return

//     if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) return

//     try {
//       // Supprimer le fichier du storage
//       const { error: storageError } = await supabase.storage
//         .from('tfc-bucket')
//         .remove([currentFile.path])

//       if (storageError) {
//         throw new Error(`Erreur suppression fichier: ${storageError.message}`)
//       }

//       // Mettre à jour le TFC
//       const { error: updateError } = await supabase
//         .from('tfc')
//         .update({
//           fichier_nom: null,
//           fichier_chemin: null,
//           fichier_taille: null,
//           fichier_type: null,
//           doc_available: false,
//           updated_at: new Date().toISOString()
//         })
//         .eq('id', tfc.id)

//       if (updateError) {
//         throw new Error(`Erreur mise à jour: ${updateError.message}`)
//       }

//       setCurrentFile(null)
//       toast.success('Fichier supprimé avec succès!')
//     } catch (error: any) {
//       console.error('Erreur suppression fichier:', error)
//       toast.error(`Erreur: ${error.message}`)
//     }
//   }

//   const handleDownloadFile = async () => {
//     if (!currentFile) return

//     try {
//       const { data, error } = await supabase.storage
//         .from('tfc-bucket')
//         .download(currentFile.path)

//       if (error) throw error

//       // Créer un URL temporaire pour le téléchargement
//       const url = URL.createObjectURL(data)
//       const a = document.createElement('a')
//       a.href = url
//       a.download = currentFile.name
//       document.body.appendChild(a)
//       a.click()
//       document.body.removeChild(a)
//       URL.revokeObjectURL(url)
//     } catch (error: any) {
//       console.error('Erreur téléchargement:', error)
//       toast.error('Erreur lors du téléchargement')
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!tfc) return

//     setSaving(true)
//     setSaveStatus('idle')

//     try {
//       console.log('Tentative de mise à jour du TFC:', tfc.id)
//       console.log('Données à envoyer:', formData)

//       if (!formData.titre.trim() || !formData.auteur.trim()) {
//         throw new Error('Le titre et l\'auteur sont obligatoires')
//       }

//       console.log('Génération du nouvel embedding SPECTER...')
//       const embedding = await EmbeddingService.generateEmbeddingForTFC({
//         titre: formData.titre,
//         resume: formData.resume,
//         mots_cles: formData.mots_cles,
//         technologies: formData.technologies,
//         fonctionnalites: formData.fonctionnalites,
//         auteur: formData.auteur,
//         promoteur: formData.promoteur,
//         cas_application: formData.cas_application
//       })

//       console.log(`Embedding SPECTER généré avec succès (${embedding.length} dimensions), mise à jour du TFC...`)

//       // MISE À JOUR : Utiliser embedding_2 au lieu de embedding
//       const { error } = await supabase
//         .from('tfc')
//         .update({
//           titre: formData.titre,
//           auteur: formData.auteur,
//           auteur_email: formData.auteur_email,
//           promoteur: formData.promoteur,
//           annee_academique_id: formData.annee_academique_id || null,
//           faculte_id: formData.faculte_id || null,
//           departement_id: formData.departement_id || null,
//           filiere_id: formData.filiere_id || null,
//           resume: formData.resume,
//           mots_cles: formData.mots_cles,
//           technologies: formData.technologies,
//           fonctionnalites: formData.fonctionnalites,
//           date_soutenance: formData.date_soutenance || null,
//           note: formData.note,
//           cas_application: formData.cas_application,
//           embedding_2: embedding, // ← CHANGEMENT ICI : utiliser embedding_2
//           updated_at: new Date().toISOString()
//         })
//         .eq('id', tfc.id)

//       if (error) {
//         console.error('Erreur Supabase:', error)
//         throw error
//       }

//       console.log('TFC mis à jour avec succès avec embedding_2')
//       setSaveStatus('success')
//       toast.success('TFC modifié avec succès! (embedding SPECTER mis à jour)')
      
//       setTimeout(() => {
//         onTFCUpdated()
//         onClose()
//       }, 1000)

//     } catch (error: any) {
//       console.error('Erreur lors de la modification:', error)
//       setSaveStatus('error')
//       toast.error(`Erreur lors de la modification: ${error.message}`)
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handleChange = (field: keyof FormData, value: any) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }))
//   }

//   // Fonctions pour les mots-clés
//   const handleMotsClesInputChange = (value: string) => {
//     setMotsClesInput(value)
//   }

//   const addMotCle = () => {
//     const mot = motsClesInput.trim()
//     if (mot && !formData.mots_cles.includes(mot)) {
//       const newMotsCles = [...formData.mots_cles, mot]
//       handleChange('mots_cles', newMotsCles)
//       setMotsClesInput('')
//     }
//   }

//   const removeMotCle = (index: number) => {
//     const newMotsCles = formData.mots_cles.filter((_, i) => i !== index)
//     handleChange('mots_cles', newMotsCles)
//   }

//   const handleMotsClesKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' || e.key === ',') {
//       e.preventDefault()
//       if (motsClesInput.trim()) {
//         addMotCle()
//       }
//     }
//   }

//   const handleMotsClesBlur = () => {
//     if (motsClesInput.trim()) {
//       addMotCle()
//     }
//   }

//   const processMotsClesInput = () => {
//     if (motsClesInput.trim()) {
//       const mots = motsClesInput.split(',')
//         .map(mot => mot.trim())
//         .filter(mot => mot.length > 0)
//         .filter(mot => !formData.mots_cles.includes(mot))

//       if (mots.length > 0) {
//         const newMotsCles = [...formData.mots_cles, ...mots]
//         handleChange('mots_cles', newMotsCles)
//         setMotsClesInput('')
//       }
//     }
//   }

//   // Fonctions pour technologies
//   const handleTechnologiesInputChange = (value: string) => {
//     setTechnologiesInput(value)
//   }

//   const addTechnologie = () => {
//     const tech = technologiesInput.trim()
//     if (tech && !formData.technologies.includes(tech)) {
//       const newTechnologies = [...formData.technologies, tech]
//       handleChange('technologies', newTechnologies)
//       setTechnologiesInput('')
//     }
//   }

//   const removeTechnologie = (index: number) => {
//     const newTechnologies = formData.technologies.filter((_, i) => i !== index)
//     handleChange('technologies', newTechnologies)
//   }

//   const handleTechnologiesKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' || e.key === ',') {
//       e.preventDefault()
//       if (technologiesInput.trim()) {
//         addTechnologie()
//       }
//     }
//   }

//   const processTechnologiesInput = () => {
//     if (technologiesInput.trim()) {
//       const techs = technologiesInput.split(',')
//         .map(tech => tech.trim())
//         .filter(tech => tech.length > 0)
//         .filter(tech => !formData.technologies.includes(tech))

//       if (techs.length > 0) {
//         const newTechnologies = [...formData.technologies, ...techs]
//         handleChange('technologies', newTechnologies)
//         setTechnologiesInput('')
//       }
//     }
//   }

//   // Fonctions pour fonctionnalités
//   const handleFonctionnalitesInputChange = (value: string) => {
//     setFonctionnalitesInput(value)
//   }

//   const addFonctionnalite = () => {
//     const fonc = fonctionnalitesInput.trim()
//     if (fonc && !formData.fonctionnalites.includes(fonc)) {
//       const newFonctionnalites = [...formData.fonctionnalites, fonc]
//       handleChange('fonctionnalites', newFonctionnalites)
//       setFonctionnalitesInput('')
//     }
//   }

//   const removeFonctionnalite = (index: number) => {
//     const newFonctionnalites = formData.fonctionnalites.filter((_, i) => i !== index)
//     handleChange('fonctionnalites', newFonctionnalites)
//   }

//   const handleFonctionnalitesKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' || e.key === ',') {
//       e.preventDefault()
//       if (fonctionnalitesInput.trim()) {
//         addFonctionnalite()
//       }
//     }
//   }

//   const processFonctionnalitesInput = () => {
//     if (fonctionnalitesInput.trim()) {
//       const foncs = fonctionnalitesInput.split(',')
//         .map(fonc => fonc.trim())
//         .filter(fonc => fonc.length > 0)
//         .filter(fonc => !formData.fonctionnalites.includes(fonc))

//       if (foncs.length > 0) {
//         const newFonctionnalites = [...formData.fonctionnalites, ...foncs]
//         handleChange('fonctionnalites', newFonctionnalites)
//         setFonctionnalitesInput('')
//       }
//     }
//   }

//   const formatFileSize = (bytes: number): string => {
//     if (bytes === 0) return '0 Bytes'
//     const k = 1024
//     const sizes = ['Bytes', 'KB', 'MB', 'GB']
//     const i = Math.floor(Math.log(bytes) / Math.log(k))
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
//   }

//   if (!isOpen) return null

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-0.5 bg-black/60 backdrop-blur-sm">
//       <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-200 dark:border-gray-800">
//         {/* En-tête élégant */}
//         <div className="flex items-center justify-between py-4 px-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
//           <div className="flex items-center space-x-4">
            
//             <div>
//               <h2 className="text-lg font-bold text-gray-900 dark:text-white">
//                 Modifier le TFC
//               </h2>
//               <p className="text-gray-600 dark:text-gray-400 mt-1">
//                <TruncateText text={tfc?.titre } limit={70} type='characters'/>
             
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-3 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         {/* Indicateur de statut */}
//         {saveStatus === 'success' && (
//           <div className="flex items-center space-x-3 p-4 mx-6 mt-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
//             <CheckCircle className="text-green-600 dark:text-green-400 h-5 w-5 flex-shrink-0" />
//             <span className="text-green-800 dark:text-green-300 text-sm font-medium">
//               Modifications enregistrées avec succès! (embedding SPECTER mis à jour)
//             </span>
//           </div>
//         )}

//         {saveStatus === 'error' && (
//           <div className="flex items-center space-x-3 p-4 mx-6 mt-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
//             <AlertCircle className="text-red-600 dark:text-red-400 h-5 w-5 flex-shrink-0" />
//             <span className="text-red-800 dark:text-red-300 text-sm font-medium">
//               Erreur lors de l'enregistrement
//             </span>
//           </div>
//         )}

//         {/* Formulaire */}
//         <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-140px)]">
//           <div className="p-6 space-y-8">
//             {loading ? (
//               <div className="flex justify-center py-12">
//                 <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
//                   <Loader className="animate-spin h-5 w-5" />
//                   <span>Chargement des données...</span>
//                 </div>
//               </div>
//             ) : (
//               <>
//                 {/* Section Document */}
//                 <div className="space-y-6">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                       Document du TFC
//                     </h3>
//                   </div>
                  
//                   <div className="space-y-4">
//                     {currentFile ? (
//                       <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center space-x-3">
//                             <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
//                             <div>
//                               <p className="font-medium text-gray-900 dark:text-white">
//                                 <TruncateText text={currentFile.name} limit={16} type='characters'/>
//                                 </p>
//                               <p className="text-sm text-gray-600 dark:text-gray-400">
//                                 {formatFileSize(currentFile.size)} 
//                                 {/* • {currentFile.type} */}
//                               </p>
//                             </div>
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             <button
//                               type="button"
//                               onClick={handleDownloadFile}
//                               className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
//                               title="Télécharger"
//                             >
//                               <Download className="h-4 w-4" />
//                             </button>
//                             <button
//                               type="button"
//                               onClick={handleFileRemove}
//                               className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
//                               title="Supprimer"
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
//                         <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
//                         <p className="text-gray-600 dark:text-gray-400 mb-4">Aucun document uploadé</p>
//                         <label className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer">
//                           <Upload className="h-4 w-4" />
//                           <span>Uploader un document</span>
//                           <input
//                             type="file"
//                             accept=".pdf,.doc,.docx"
//                             className="hidden"
//                             onChange={(e) => {
//                               const file = e.target.files?.[0]
//                               if (file) handleFileUpload(file)
//                             }}
//                           />
//                         </label>
//                       </div>
//                     )}

//                     {/* Barre de progression */}
//                     {uploading && (
//                       <div className="space-y-2">
//                         <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
//                           <span>Upload en cours...</span>
//                           <span>{uploadProgress}%</span>
//                         </div>
//                         <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                           <div 
//                             className="bg-blue-500 h-2 rounded-full transition-all duration-300"
//                             style={{ width: `${uploadProgress}%` }}
//                           />
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Section Informations de base */}
//                 <div className="space-y-6">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                       Informations de base
//                     </h3>
//                   </div>
                  
//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                     <div className="space-y-2">
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                         Titre du travail *
//                       </label>
//                       <input
//                         type="text"
//                         required
//                         value={formData.titre}
//                         onChange={(e) => handleChange('titre', e.target.value)}
//                         className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                         placeholder="Titre du travail de fin de cycle..."
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                         Auteur *
//                       </label>
//                       <input
//                         type="text"
//                         required
//                         value={formData.auteur}
//                         onChange={(e) => handleChange('auteur', e.target.value)}
//                         className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                         placeholder="Nom complet de l'auteur..."
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                         Email de l'auteur
//                       </label>
//                       <input
//                         type="email"
//                         value={formData.auteur_email}
//                         onChange={(e) => handleChange('auteur_email', e.target.value)}
//                         className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                         placeholder="email@exemple.com"
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                         Promoteur
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.promoteur}
//                         onChange={(e) => handleChange('promoteur', e.target.value)}
//                         className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                         placeholder="Nom du promoteur..."
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Section Contexte académique */}
//                 <div className="space-y-6">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                       Contexte académique
//                     </h3>
//                   </div>
                  
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                     <div className="space-y-2">
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                         Année académique
//                       </label>
//                       <select
//                         value={formData.annee_academique_id}
//                         onChange={(e) => handleChange('annee_academique_id', parseInt(e.target.value) || 0)}
//                         className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
//                       >
//                         <option value={0}>Sélectionner...</option>
//                         {annees.map(annee => (
//                           <option key={annee.id} value={annee.id}>{annee.annee}</option>
//                         ))}
//                       </select>
//                     </div>

//                     <div className="space-y-2">
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                         Faculté
//                       </label>
//                       <select
//                         value={formData.faculte_id}
//                         onChange={(e) => handleChange('faculte_id', parseInt(e.target.value) || 0)}
//                         className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
//                       >
//                         <option value={0}>Sélectionner...</option>
//                         {facultes.map(faculte => (
//                           <option key={faculte.id} value={faculte.id}>{faculte.nom}</option>
//                         ))}
//                       </select>
//                     </div>

//                     <div className="space-y-2">
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                         Département
//                       </label>
//                       <select
//                         value={formData.departement_id}
//                         onChange={(e) => handleChange('departement_id', parseInt(e.target.value) || 0)}
//                         className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
//                       >
//                         <option value={0}>Sélectionner...</option>
//                         {departements.map(dep => (
//                           <option key={dep.id} value={dep.id}>{dep.nom}</option>
//                         ))}
//                       </select>
//                     </div>

//                     <div className="space-y-2">
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                         Filière
//                       </label>
//                       <select
//                         value={formData.filiere_id}
//                         onChange={(e) => handleChange('filiere_id', parseInt(e.target.value) || 0)}
//                         className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
//                       >
//                         <option value={0}>Sélectionner...</option>
//                         {filieres.map(filiere => (
//                           <option key={filiere.id} value={filiere.id}>{filiere.nom}</option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Section Évaluation */}
//                 <div className="space-y-6">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-1.5 h-6 bg-green-600 rounded-full"></div>
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                       Évaluation
//                     </h3>
//                   </div>
                  
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-2">
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                         Date de soutenance
//                       </label>
//                       <input
//                         type="date"
//                         value={formData.date_soutenance}
//                         onChange={(e) => handleChange('date_soutenance', e.target.value)}
//                         className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                         Note (/20)
//                       </label>
//                       <input
//                         type="number"
//                         min="0"
//                         max="20"
//                         step="0.1"
//                         value={formData.note || ''}
//                         onChange={(e) => handleChange('note', e.target.value ? parseFloat(e.target.value) : null)}
//                         className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
//                         placeholder="0.0 - 20.0"
//                       />
//                     </div>

//                     <div className="md:col-span-2 space-y-2">
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                         Cas d'application
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.cas_application}
//                         onChange={(e) => handleChange('cas_application', e.target.value)}
//                         placeholder="Ex: Entreprise X, Organisation Y, Secteur Z..."
//                         className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Section Mots-clés */}
//                 <div className="space-y-4">
//                   <div className="flex items-center space-x-3">
//                     <Tag className="text-blue-600 dark:text-blue-400 h-5 w-5" />
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                       Mots-clés
//                     </h3>
//                   </div>
                  
//                   <div className="space-y-3">
//                     <div className="flex flex-col sm:flex-row gap-3">
//                       <input
//                         type="text"
//                         value={motsClesInput}
//                         onChange={(e) => handleMotsClesInputChange(e.target.value)}
//                         onKeyPress={handleMotsClesKeyPress}
//                         onBlur={handleMotsClesBlur}
//                         placeholder="Saisissez un mot-clé et appuyez sur Entrée..."
//                         className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                       />
//                       <div className="flex gap-2">
//                         <button
//                           type="button"
//                           onClick={addMotCle}
//                           disabled={!motsClesInput.trim()}
//                           className="px-4 py-3 rounded-xl font-medium transition-all duration-200 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white min-w-[60px]"
//                         >
//                           +
//                         </button>
//                         <button
//                           type="button"
//                           onClick={processMotsClesInput}
//                           disabled={!motsClesInput.trim()}
//                           className="px-4 py-3 rounded-xl font-medium transition-all duration-200 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white whitespace-nowrap"
//                         >
//                           Multiples
//                         </button>
//                       </div>
//                     </div>
                    
//                     <div className="flex flex-wrap gap-2">
//                       {formData.mots_cles.map((mot, index) => (
//                         <span 
//                           key={index} 
//                           className="inline-flex items-center space-x-2 px-3 py-2 text-sm rounded-full transition-all duration-200 cursor-pointer hover:scale-105 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
//                           onClick={() => removeMotCle(index)}
//                         >
//                           <span>#{mot}</span>
//                           <X className="h-3 w-3" />
//                         </span>
//                       ))}
//                       {formData.mots_cles.length === 0 && (
//                         <span className="text-sm text-gray-500 dark:text-gray-400 italic">
//                           Aucun mot-clé ajouté
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Section Technologies */}
//                 <div className="space-y-4">
//                   <div className="flex items-center space-x-3">
//                     <Settings className="text-green-600 dark:text-green-400 h-5 w-5" />
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                       Technologies utilisées
//                     </h3>
//                   </div>
                  
//                   <div className="space-y-3">
//                     <div className="flex flex-col sm:flex-row gap-3">
//                       <input
//                         type="text"
//                         value={technologiesInput}
//                         onChange={(e) => handleTechnologiesInputChange(e.target.value)}
//                         onKeyPress={handleTechnologiesKeyPress}
//                         placeholder="Ex: React, Node.js, MongoDB, Python..."
//                         className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                       />
//                       <div className="flex gap-2">
//                         <button
//                           type="button"
//                           onClick={addTechnologie}
//                           disabled={!technologiesInput.trim()}
//                           className="px-4 py-3 rounded-xl font-medium transition-all duration-200 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white min-w-[60px]"
//                         >
//                           +
//                         </button>
//                         <button
//                           type="button"
//                           onClick={processTechnologiesInput}
//                           disabled={!technologiesInput.trim()}
//                           className="px-4 py-3 rounded-xl font-medium transition-all duration-200 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white whitespace-nowrap"
//                         >
//                           Multiples
//                         </button>
//                       </div>
//                     </div>
                    
//                     <div className="flex flex-wrap gap-2">
//                       {formData.technologies.map((tech, index) => (
//                         <span 
//                           key={index} 
//                           className="inline-flex items-center space-x-2 px-3 py-2 text-sm rounded-full transition-all duration-200 cursor-pointer hover:scale-105 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
//                           onClick={() => removeTechnologie(index)}
//                         >
//                           <span>⚙️ {tech}</span>
//                           <X className="h-3 w-3" />
//                         </span>
//                       ))}
//                       {formData.technologies.length === 0 && (
//                         <span className="text-sm text-gray-500 dark:text-gray-400 italic">
//                           Aucune technologie ajoutée
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Section Fonctionnalités */}
//                 <div className="space-y-4">
//                   <div className="flex items-center space-x-3">
//                     <Rocket className="text-purple-600 dark:text-purple-400 h-5 w-5" />
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                       Fonctionnalités principales
//                     </h3>
//                   </div>
                  
//                   <div className="space-y-3">
//                     <div className="flex flex-col sm:flex-row gap-3">
//                       <input
//                         type="text"
//                         value={fonctionnalitesInput}
//                         onChange={(e) => handleFonctionnalitesInputChange(e.target.value)}
//                         onKeyPress={handleFonctionnalitesKeyPress}
//                         placeholder="Ex: Authentification, Gestion utilisateurs, Rapport PDF..."
//                         className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                       />
//                       <div className="flex gap-2">
//                         <button
//                           type="button"
//                           onClick={addFonctionnalite}
//                           disabled={!fonctionnalitesInput.trim()}
//                           className="px-4 py-3 rounded-xl font-medium transition-all duration-200 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white min-w-[60px]"
//                         >
//                           +
//                         </button>
//                         <button
//                           type="button"
//                           onClick={processFonctionnalitesInput}
//                           disabled={!fonctionnalitesInput.trim()}
//                           className="px-4 py-3 rounded-xl font-medium transition-all duration-200 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white whitespace-nowrap"
//                         >
//                           Multiples
//                         </button>
//                       </div>
//                     </div>
                    
//                     <div className="flex flex-wrap gap-2">
//                       {formData.fonctionnalites.map((fonc, index) => (
//                         <span 
//                           key={index} 
//                           className="inline-flex items-center space-x-2 px-3 py-2 text-sm rounded-full transition-all duration-200 cursor-pointer hover:scale-105 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
//                           onClick={() => removeFonctionnalite(index)}
//                         >
//                           <span>{fonc}</span>
//                           <X className="h-3 w-3" />
//                         </span>
//                       ))}
//                       {formData.fonctionnalites.length === 0 && (
//                         <span className="text-sm text-gray-500 dark:text-gray-400 italic">
//                           Aucune fonctionnalité ajoutée
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Section Résumé */}
//                 <div className="space-y-4">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-1.5 h-6 bg-orange-600 rounded-full"></div>
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                       Résumé du travail
//                     </h3>
//                   </div>
                  
//                   <div className="space-y-3">
//                     <textarea
//                       rows={6}
//                       value={formData.resume}
//                       onChange={(e) => handleChange('resume', e.target.value)}
//                       className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
//                       placeholder="Décrivez brièvement le travail réalisé, les objectifs, la méthodologie et les résultats obtenus..."
//                     />
//                     <div className="flex justify-between items-center text-sm">
//                       <span className="text-gray-500 dark:text-gray-400">
//                         Résumé détaillé du travail
//                       </span>
//                       <span className={`font-medium ${
//                         formData.resume.length > 500 ? 'text-orange-600' : 'text-gray-500 dark:text-gray-400'
//                       }`}>
//                         {formData.resume.length} caractères
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Information embedding */}
//                 <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
//                   <div className="flex items-center space-x-3">
//                     <Rocket className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//                     <div>
//                       <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
//                         Nouveau modèle d'embedding
//                       </p>
//                       <p className="text-sm text-blue-700 dark:text-blue-400">
//                         Utilisation de SPECTER (768 dimensions) pour une meilleure recherche sémantique
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>

//           {/* Actions */}
//           <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
//             {/* <button
//               type="button"
//               onClick={onClose}
//               disabled={saving}
//               className="px-6 py-3 rounded-xl font-medium transition-all duration-200 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-800 min-w-[120px]"
//             >
//               Annuler
//             </button> */}
//             <button
//               type="submit"
//               disabled={saving || loading || !formData.titre.trim() || !formData.auteur.trim()}
//               className="flex items-center justify-center space-x-3 px-8 py-3 rounded-xl font-medium transition-all duration-200 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white min-w-[140px]"
//             >
//               {saving ? (
//                 <>
//                   <RouteLoader/>
//                   <span>Sauvegarde...</span>
//                 </>
//               ) : (
//                 <>
//                   <Save className="h-4 w-4" />
//                   <span>Sauvegarder</span>
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Check,
  Download,
  FileText,
  Loader2,
  Rocket,
  Save,
  Settings,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import TruncateText from '../TruncateText'

/* --------------------------------- Types --------------------------------- */

interface TFCList {
  id: number
  titre: string
  auteur: string
  annee: string
  filiere: string
  faculte: string
  fichier_nom?: string
  fichier_chemin?: string
  doc_available?: boolean
}

interface EditTFCModalProps {
  isOpen: boolean
  onClose: () => void
  tfc: TFCList | null
  onTFCUpdated: () => void
}

interface FormData {
  titre: string
  auteur: string
  auteur_email: string
  promoteur: string
  annee_academique_id: number
  faculte_id: number
  departement_id: number
  filiere_id: number
  resume: string
  mots_cles: string[]
  technologies: string[]
  fonctionnalites: string[]
  date_soutenance: string
  note: number | null
  cas_application: string
}

interface SelectOption {
  id: number
  nom?: string
  annee?: string
}

interface CurrentFile {
  name: string
  path: string
  size: number
  type: string
}

interface Notice {
  type: 'success' | 'error'
  message: string
}

/* ------------------------------- Constantes ------------------------------ */

const EMPTY_FORM: FormData = {
  titre: '',
  auteur: '',
  auteur_email: '',
  promoteur: '',
  annee_academique_id: 0,
  faculte_id: 0,
  departement_id: 0,
  filiere_id: 0,
  resume: '',
  mots_cles: [],
  technologies: [],
  fonctionnalites: [],
  date_soutenance: '',
  note: null,
  cas_application: 'anonymes',
}

const FOCUS =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500'

const INPUT =
  'w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-white/10'

const BTN_GHOST = `inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-transparent px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 ${FOCUS}`

const BTN_PRIMARY = `inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white ${FOCUS}`

const ICON_BTN = `rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 ${FOCUS}`

/* ------------------------------- Embedding ------------------------------- */

class EmbeddingService {
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('/api/generate-embedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      const responseText = await response.text()
      if (!response.ok) {
        throw new Error(`Erreur API ${response.status}: ${responseText}`)
      }

      const data = JSON.parse(responseText)
      if (!data.embedding) {
        throw new Error('Format de réponse invalide : embedding manquant')
      }
      if (data.embedding.length !== 768) {
        console.warn(`Embedding à ${data.embedding.length} dimensions au lieu de 768`)
      }
      return data.embedding
    } catch (error) {
      console.error('Erreur génération embedding :', error)
      // Repli : vecteur de 768 dimensions (taille SPECTER)
      return new Array(768).fill(0.001)
    }
  }

  static async generateEmbeddingForTFC(tfcData: {
    titre: string
    resume: string
    mots_cles: string[]
    technologies: string[]
    fonctionnalites: string[]
    auteur: string
    promoteur?: string
    cas_application?: string
  }): Promise<number[]> {
    const text = `
      TITRE: ${tfcData.titre}

      RÉSUMÉ: ${tfcData.resume}

      DOMAINE: ${tfcData.mots_cles.join(', ')}
      TECHNOLOGIES: ${tfcData.technologies.join(', ')}
      FONCTIONNALITÉS: ${tfcData.fonctionnalites.join(', ')}
      APPLICATION: ${tfcData.cas_application || 'anonymes'}

      AUTEUR: ${tfcData.auteur}
      PROMOTEUR: ${tfcData.promoteur || 'non spécifié'}
    `.trim()

    return this.generateEmbedding(text)
  }
}

/* -------------------------------- Helpers -------------------------------- */

const normalizeString = (str: string): string =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()

const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 octet'
  const units = ['octets', 'Ko', 'Mo', 'Go']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${units[i]}`
}

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback

/* ------------------------------ Sous-composants -------------------------- */

function Field({
  label,
  hint,
  children,
  className = '',
}: {
  label: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon?: React.ElementType
  children: React.ReactNode
}) {
  return (
    <section>
      <header className="mb-4 flex items-center gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800">
        {Icon && <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" aria-hidden />}
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
      </header>
      {children}
    </section>
  )
}

function SelectField({
  label,
  value,
  options,
  getLabel,
  onChange,
}: {
  label: string
  value: number
  options: SelectOption[]
  getLabel: (o: SelectOption) => string | undefined
  onChange: (v: number) => void
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className={INPUT}
      >
        <option value={0}>Sélectionner…</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {getLabel(o)}
          </option>
        ))}
      </select>
    </Field>
  )
}

function TagInput({
  title,
  icon,
  items,
  onChange,
  placeholder,
  emptyText,
  prefix = '',
}: {
  title: string
  icon: React.ElementType
  items: string[]
  onChange: (items: string[]) => void
  placeholder: string
  emptyText: string
  prefix?: string
}) {
  const [input, setInput] = useState('')

  // Accepte une saisie unique ou plusieurs valeurs séparées par des virgules
  const commit = () => {
    const values = input
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .filter((v) => !items.includes(v))
    if (values.length > 0) onChange([...items, ...values])
    setInput('')
  }

  return (
    <Section title={title} icon={icon}>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              commit()
            }
          }}
          onBlur={commit}
          placeholder={placeholder}
          className={INPUT}
        />
        <button
          type="button"
          onClick={commit}
          disabled={!input.trim()}
          aria-label={`Ajouter à ${title.toLowerCase()}`}
          className={BTN_GHOST}
        >
          Ajouter
        </button>
      </div>
      <p className="mt-1 text-xs text-zinc-500">Entrée ou virgule pour valider. Plusieurs valeurs possibles.</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 py-1 pl-3 pr-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            {prefix}
            {item}
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              aria-label={`Retirer ${item}`}
              className={`rounded-full p-0.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 ${FOCUS}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-sm italic text-zinc-500 dark:text-zinc-400">{emptyText}</span>
        )}
      </div>
    </Section>
  )
}

function NoticeBanner({ notice, onClose }: { notice: Notice; onClose: () => void }) {
  const styles: Record<Notice['type'], string> = {
    success:
      'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
    error:
      'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
  }
  const Icon = notice.type === 'success' ? Check : AlertCircle
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      role="alert"
      className={`mx-6 mt-4 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${styles[notice.type]}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span className="flex-1">{notice.message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

/* --------------------------------- Modal --------------------------------- */

export default function EditTFCModal({ isOpen, onClose, tfc, onTFCUpdated }: EditTFCModalProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)
  const [currentFile, setCurrentFile] = useState<CurrentFile | null>(null)

  const [annees, setAnnees] = useState<SelectOption[]>([])
  const [facultes, setFacultes] = useState<SelectOption[]>([])
  const [departements, setDepartements] = useState<SelectOption[]>([])
  const [filieres, setFilieres] = useState<SelectOption[]>([])

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = <K extends keyof FormData>(field: K, value: FormData[K]) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  /* ----------------------------- Chargement ---------------------------- */

  const loadSelectData = useCallback(async () => {
    try {
      const [a, f, d, fi] = await Promise.all([
        supabase.from('annees_academiques').select('id, annee').order('annee', { ascending: false }),
        supabase.from('facultes').select('id, nom').order('nom'),
        supabase.from('departements').select('id, nom').order('nom'),
        supabase.from('filieres').select('id, nom').order('nom'),
      ])
      setAnnees((a.data as SelectOption[]) || [])
      setFacultes((f.data as SelectOption[]) || [])
      setDepartements((d.data as SelectOption[]) || [])
      setFilieres((fi.data as SelectOption[]) || [])
    } catch (error) {
      console.error('Erreur chargement des listes :', error)
      setNotice({ type: 'error', message: 'Erreur lors du chargement des données.' })
    }
  }, [])

  const loadTFCData = useCallback(async (id: number) => {
    try {
      const { data, error } = await supabase.from('tfc').select('*').eq('id', id).single()
      if (error) throw error
      if (!data) return

      setFormData({
        titre: data.titre || '',
        auteur: data.auteur || '',
        auteur_email: data.auteur_email || '',
        promoteur: data.promoteur || '',
        annee_academique_id: data.annee_academique_id || 0,
        faculte_id: data.faculte_id || 0,
        departement_id: data.departement_id || 0,
        filiere_id: data.filiere_id || 0,
        resume: data.resume || '',
        mots_cles: data.mots_cles || [],
        technologies: data.technologies || [],
        fonctionnalites: data.fonctionnalites || [],
        date_soutenance: data.date_soutenance || '',
        note: data.note ?? null,
        cas_application: data.cas_application || 'anonymes',
      })

      setCurrentFile(
        data.fichier_nom && data.fichier_chemin
          ? {
              name: data.fichier_nom,
              path: data.fichier_chemin,
              size: data.fichier_taille || 0,
              type: data.fichier_type || 'application/pdf',
            }
          : null
      )
    } catch (error) {
      console.error('Erreur chargement du TFC :', error)
      setNotice({ type: 'error', message: 'Erreur lors du chargement des données du TFC.' })
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    setNotice(null)
    setUploadProgress(0)

    let cancelled = false
    ;(async () => {
      setLoading(true)
      await loadSelectData()
      if (tfc) {
        await loadTFCData(tfc.id)
      } else {
        setFormData(EMPTY_FORM)
        setCurrentFile(null)
      }
      if (!cancelled) setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [isOpen, tfc, loadSelectData, loadTFCData])

  // Fermeture avec Échap + nettoyage du timer
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [isOpen, saving, onClose])

  // Les erreurs restent affichées, les succès d'upload/suppression disparaissent
  useEffect(() => {
    if (!notice || notice.type === 'error') return
    const t = setTimeout(() => setNotice(null), 5000)
    return () => clearTimeout(t)
  }, [notice])

  /* ------------------------------ Fichier ------------------------------ */

  const handleFileUpload = async (file: File) => {
    if (!tfc) return

    setUploading(true)
    setUploadProgress(0)

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 10))
    }, 200)

    try {
      const ext = file.name.split('.').pop()
      const fileName = `${normalizeString(file.name.split('.')[0])}.${ext}`
      const filePath = `tfc-uploads/${tfc.id}/${fileName}`

      const { error: uploadError } = await supabase.storage.from('tfc-bucket').upload(filePath, file)
      if (uploadError) throw new Error(`Erreur lors de l’upload : ${uploadError.message}`)

      const { error: updateError } = await supabase
        .from('tfc')
        .update({
          fichier_nom: file.name,
          fichier_chemin: filePath,
          fichier_taille: file.size,
          fichier_type: file.type,
          doc_available: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tfc.id)

      if (updateError) {
        await supabase.storage.from('tfc-bucket').remove([filePath])
        throw new Error(`Erreur mise à jour : ${updateError.message}`)
      }

      setUploadProgress(100)
      setCurrentFile({ name: file.name, path: filePath, size: file.size, type: file.type })
      setNotice({ type: 'success', message: 'Fichier uploadé avec succès.' })
    } catch (error) {
      console.error('Erreur upload fichier :', error)
      setNotice({ type: 'error', message: errorMessage(error, 'Erreur lors de l’upload.') })
    } finally {
      clearInterval(progressInterval)
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
      }, 800)
    }
  }

  const handleFileRemove = async () => {
    if (!tfc || !currentFile) return
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) return

    try {
      const { error: storageError } = await supabase.storage
        .from('tfc-bucket')
        .remove([currentFile.path])
      if (storageError) throw new Error(`Erreur suppression fichier : ${storageError.message}`)

      const { error: updateError } = await supabase
        .from('tfc')
        .update({
          fichier_nom: null,
          fichier_chemin: null,
          fichier_taille: null,
          fichier_type: null,
          doc_available: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tfc.id)
      if (updateError) throw new Error(`Erreur mise à jour : ${updateError.message}`)

      setCurrentFile(null)
      setNotice({ type: 'success', message: 'Fichier supprimé avec succès.' })
    } catch (error) {
      console.error('Erreur suppression fichier :', error)
      setNotice({ type: 'error', message: errorMessage(error, 'Erreur lors de la suppression.') })
    }
  }

  const handleDownloadFile = async () => {
    if (!currentFile) return
    try {
      const { data, error } = await supabase.storage.from('tfc-bucket').download(currentFile.path)
      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = currentFile.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur téléchargement :', error)
      setNotice({ type: 'error', message: 'Erreur lors du téléchargement.' })
    }
  }

  /* ------------------------------ Sauvegarde --------------------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tfc) return

    setSaving(true)
    setNotice(null)

    try {
      if (!formData.titre.trim() || !formData.auteur.trim()) {
        throw new Error('Le titre et l’auteur sont obligatoires.')
      }

      const embedding = await EmbeddingService.generateEmbeddingForTFC({
        titre: formData.titre,
        resume: formData.resume,
        mots_cles: formData.mots_cles,
        technologies: formData.technologies,
        fonctionnalites: formData.fonctionnalites,
        auteur: formData.auteur,
        promoteur: formData.promoteur,
        cas_application: formData.cas_application,
      })

      const { error } = await supabase
        .from('tfc')
        .update({
          titre: formData.titre,
          auteur: formData.auteur,
          auteur_email: formData.auteur_email,
          promoteur: formData.promoteur,
          annee_academique_id: formData.annee_academique_id || null,
          faculte_id: formData.faculte_id || null,
          departement_id: formData.departement_id || null,
          filiere_id: formData.filiere_id || null,
          resume: formData.resume,
          mots_cles: formData.mots_cles,
          technologies: formData.technologies,
          fonctionnalites: formData.fonctionnalites,
          date_soutenance: formData.date_soutenance || null,
          note: formData.note,
          cas_application: formData.cas_application,
          embedding_2: embedding,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tfc.id)

      if (error) throw error

      setNotice({ type: 'success', message: 'Modifications enregistrées (embedding SPECTER mis à jour).' })
      closeTimer.current = setTimeout(() => {
        onTFCUpdated()
        onClose()
      }, 1000)
    } catch (error) {
      console.error('Erreur lors de la modification :', error)
      setNotice({
        type: 'error',
        message: errorMessage(error, 'Erreur lors de l’enregistrement.'),
      })
    } finally {
      setSaving(false)
    }
  }

  /* ------------------------------- Rendu ------------------------------- */

  if (!isOpen) return null

  const canSubmit = !saving && !loading && formData.titre.trim() && formData.auteur.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4">
      <div
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
        onClick={() => !saving && onClose()}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Modifier le TFC"
        className="relative flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900 md:rounded-lg"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <FileText className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Modifier le TFC
              </h2>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                <TruncateText text={tfc?.titre ?? ''} limit={70} type="characters" />
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className={ICON_BTN}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Notices */}
        <AnimatePresence mode="wait">
          {notice && <NoticeBanner key={notice.message} notice={notice} onClose={() => setNotice(null)} />}
        </AnimatePresence>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-8 overflow-y-auto p-6">
            {loading ? (
              <div
                role="status"
                className="flex items-center justify-center gap-2.5 py-12 text-sm text-zinc-500 dark:text-zinc-400"
              >
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Chargement des données…
              </div>
            ) : (
              <>
                {/* Document */}
                <Section title="Document du TFC" icon={FileText}>
                  {currentFile ? (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#E30613] dark:bg-red-500/10 dark:text-red-400">
                          <FileText className="h-4 w-4" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            <TruncateText text={currentFile.name} limit={32} type="characters" />
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {formatFileSize(currentFile.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={handleDownloadFile}
                          title="Télécharger"
                          aria-label="Télécharger"
                          className={ICON_BTN}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleFileRemove}
                          title="Supprimer"
                          aria-label="Supprimer"
                          className={`${ICON_BTN} hover:!text-rose-600 dark:hover:!text-rose-400`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center dark:border-zinc-700">
                      <FileText className="h-6 w-6 text-zinc-400" aria-hidden />
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Aucun document uploadé</p>
                      <label className={`${BTN_PRIMARY} cursor-pointer`}>
                        <Upload className="h-4 w-4" aria-hidden />
                        Uploader un document
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          disabled={uploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            e.target.value = ''
                            if (file) handleFileUpload(file)
                          }}
                        />
                      </label>
                    </div>
                  )}

                  {uploading && (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>Upload en cours…</span>
                        <span className="tabular-nums">{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                        <div
                          className="h-full rounded-full bg-zinc-900 transition-all duration-300 dark:bg-zinc-100"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Section>

                {/* Informations de base */}
                <Section title="Informations de base">
                  <div className="grid grid-cols-1 gap-x-8 gap-y-5 lg:grid-cols-2">
                    <Field label="Titre du travail *">
                      <input
                        type="text"
                        required
                        value={formData.titre}
                        onChange={(e) => handleChange('titre', e.target.value)}
                        placeholder="Titre du travail de fin de cycle…"
                        className={INPUT}
                      />
                    </Field>
                    <Field label="Auteur *">
                      <input
                        type="text"
                        required
                        value={formData.auteur}
                        onChange={(e) => handleChange('auteur', e.target.value)}
                        placeholder="Nom complet de l’auteur…"
                        className={INPUT}
                      />
                    </Field>
                    <Field label="Email de l’auteur">
                      <input
                        type="email"
                        value={formData.auteur_email}
                        onChange={(e) => handleChange('auteur_email', e.target.value)}
                        placeholder="email@exemple.com"
                        className={INPUT}
                      />
                    </Field>
                    <Field label="Promoteur">
                      <input
                        type="text"
                        value={formData.promoteur}
                        onChange={(e) => handleChange('promoteur', e.target.value)}
                        placeholder="Nom du promoteur…"
                        className={INPUT}
                      />
                    </Field>
                  </div>
                </Section>

                {/* Contexte académique */}
                <Section title="Contexte académique">
                  <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                    <SelectField
                      label="Année académique"
                      value={formData.annee_academique_id}
                      options={annees}
                      getLabel={(o) => o.annee}
                      onChange={(v) => handleChange('annee_academique_id', v)}
                    />
                    <SelectField
                      label="Faculté"
                      value={formData.faculte_id}
                      options={facultes}
                      getLabel={(o) => o.nom}
                      onChange={(v) => handleChange('faculte_id', v)}
                    />
                    <SelectField
                      label="Département"
                      value={formData.departement_id}
                      options={departements}
                      getLabel={(o) => o.nom}
                      onChange={(v) => handleChange('departement_id', v)}
                    />
                    <SelectField
                      label="Filière"
                      value={formData.filiere_id}
                      options={filieres}
                      getLabel={(o) => o.nom}
                      onChange={(v) => handleChange('filiere_id', v)}
                    />
                  </div>
                </Section>

                {/* Évaluation */}
                <Section title="Évaluation">
                  <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                    <Field label="Date de soutenance">
                      <input
                        type="date"
                        value={formData.date_soutenance}
                        onChange={(e) => handleChange('date_soutenance', e.target.value)}
                        className={`${INPUT} dark:[color-scheme:dark]`}
                      />
                    </Field>
                    <Field label="Note (/20)">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value={formData.note ?? ''}
                        onChange={(e) =>
                          handleChange('note', e.target.value ? parseFloat(e.target.value) : null)
                        }
                        placeholder="0.0 - 20.0"
                        className={INPUT}
                      />
                    </Field>
                    <Field label="Cas d’application" className="sm:col-span-2">
                      <input
                        type="text"
                        value={formData.cas_application}
                        onChange={(e) => handleChange('cas_application', e.target.value)}
                        placeholder="Ex : Entreprise X, Organisation Y, Secteur Z…"
                        className={INPUT}
                      />
                    </Field>
                  </div>
                </Section>

                {/* Tags */}
                <TagInput
                  title="Mots-clés"
                  icon={Tag}
                  items={formData.mots_cles}
                  onChange={(v) => handleChange('mots_cles', v)}
                  placeholder="Saisissez un mot-clé…"
                  emptyText="Aucun mot-clé ajouté"
                  prefix="#"
                />

                <TagInput
                  title="Technologies utilisées"
                  icon={Settings}
                  items={formData.technologies}
                  onChange={(v) => handleChange('technologies', v)}
                  placeholder="Ex : React, Node.js, MongoDB, Python…"
                  emptyText="Aucune technologie ajoutée"
                />

                <TagInput
                  title="Fonctionnalités principales"
                  icon={Rocket}
                  items={formData.fonctionnalites}
                  onChange={(v) => handleChange('fonctionnalites', v)}
                  placeholder="Ex : Authentification, Gestion utilisateurs, Rapport PDF…"
                  emptyText="Aucune fonctionnalité ajoutée"
                />

                {/* Résumé */}
                <Section title="Résumé du travail">
                  <textarea
                    rows={6}
                    value={formData.resume}
                    onChange={(e) => handleChange('resume', e.target.value)}
                    placeholder="Décrivez brièvement le travail réalisé, les objectifs, la méthodologie et les résultats obtenus…"
                    className={`${INPUT} resize-none`}
                  />
                  <div className="mt-1.5 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Résumé détaillé du travail</span>
                    <span
                      className={`tabular-nums ${
                        formData.resume.length > 500 ? 'font-medium text-amber-700 dark:text-amber-400' : ''
                      }`}
                    >
                      {formData.resume.length} caractères
                    </span>
                  </div>
                </Section>

                {/* Info embedding */}
                <p className="flex items-start gap-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  <Rocket className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>
                    L’embedding <span className="font-medium text-zinc-700 dark:text-zinc-300">SPECTER</span>{' '}
                    (768 dimensions) est régénéré à chaque sauvegarde pour la recherche sémantique.
                  </span>
                </p>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 px-6 py-4 dark:border-zinc-800 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={saving} className={BTN_GHOST}>
              Annuler
            </button>
            <button type="submit" disabled={!canSubmit} className={BTN_PRIMARY}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              {saving ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
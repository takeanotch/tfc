
// 'use client'

// import { useState } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import TFCForm from '@/components/forms/TFCForm'
// import { TFCFormData } from '@/lib/types'
// import { supabase } from '@/lib/supabase'
// import { SessionUser } from '@/types/user'
// import { FileText, FileUp, CheckCircle, AlertCircle } from 'lucide-react'

// interface AjouterTFCClientProps {
//   user: SessionUser
// }

// // Fonction pour normaliser les chaînes (supprimer les accents et caractères spéciaux)
// const normalizeString = (str: string): string => {
//   return str
//     .normalize('NFD')
//     .replace(/[\u0300-\u036f]/g, '')
//     .replace(/[^a-zA-Z0-9\s\-_]/g, '')
//     .replace(/\s+/g, '-')
//     .toLowerCase()
// }

// // Fonction utilitaire pour formater les tableaux PostgreSQL
// const formatPostgresArray = (items: string[] | string): string[] => {
//   if (typeof items === 'string') {
//     items = items.split(',').map(k => k.trim()).filter(k => k.length > 0)
//   }
  
//   if (!Array.isArray(items) || items.length === 0) {
//     return ['non spécifié']
//   }
  
//   return items.map(item => {
//     let cleaned = item
//       .trim()
//       .replace(/"/g, '')
//       .replace(/'/g, '')
//       .replace(/[{}]/g, '')
//       .replace(/\\/g, '')
    
//     return cleaned.substring(0, 100)
//   }).filter(item => item.length > 0)
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
//       const fallbackEmbedding = new Array(768).fill(0)
//       console.log('Utilisation embedding de secours (768 dimensions)')
//       return fallbackEmbedding
//     }
//   }

//   static async generateEmbeddingForTFC(tfcData: {
//     titre: string
//     resume: string
//     mots_cles: string[]
//     auteur: string
//     promoteur?: string
//     technologies?: string[]
//     fonctionnalites?: string[]
//     cas_application?: string
//   }): Promise<number[]> {
//     // Améliorer le texte pour l'embedding avec plus de contexte
//     const text = `
//       TITRE: ${tfcData.titre}
      
//       RÉSUMÉ: ${tfcData.resume}
      
//       DOMAINE: ${tfcData.mots_cles.join(', ')}
//       TECHNOLOGIES: ${tfcData.technologies?.join(', ') || 'non spécifié'}
//       FONCTIONNALITÉS: ${tfcData.fonctionnalites?.join(', ') || 'non spécifié'}
//       APPLICATION: ${tfcData.cas_application || 'anonymes'}
      
//       AUTEUR: ${tfcData.auteur}
//       PROMOTEUR: ${tfcData.promoteur || 'non spécifié'}
//     `.trim()

//     return this.generateEmbedding(text)
//   }
// }

// export default function AjouterTFCClient({ user }: AjouterTFCClientProps) {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [uploadedFile, setUploadedFile] = useState<File | null>(null)
//   const [uploadProgress, setUploadProgress] = useState<number>(0)
//   const [currentStep, setCurrentStep] = useState<'upload' | 'embedding' | 'insertion'>('upload')
//   const [docAvailable, setDocAvailable] = useState<boolean>(true)
  
//   // Récupérer les paramètres d'URL
//   const faculteId = searchParams.get('faculte_id')
//   const anneeId = searchParams.get('annee_id')
//   const departementId = searchParams.get('departement_id')
//   const filiereId = searchParams.get('filiere_id')

//   const handleSubmit = async (formData: TFCFormData) => {
//     setIsLoading(true)
//     setError(null)
//     setUploadProgress(0)
//     setCurrentStep('upload')

//     try {
//       // Vérifier qu'un fichier a été sélectionné seulement si docAvailable est true
//       if (docAvailable && !formData.fichier) {
//         throw new Error('Veuillez sélectionner un fichier')
//       }

//       const { data: faculte } = await supabase
//         .from('facultes')
//         .select('nom')
//         .eq('id', formData.faculte_id)
//         .single()

//       const { data: annee } = await supabase
//         .from('annees_academiques')
//         .select('annee')
//         .eq('id', formData.annee_academique_id)
//         .single()

//       const { data: departement } = await supabase
//         .from('departements')
//         .select('nom')
//         .eq('id', formData.departement_id)
//         .single()

//       const { data: filiere } = await supabase
//         .from('filieres')
//         .select('nom')
//         .eq('id', formData.filiere_id)
//         .single()

//       if (!faculte || !annee || !departement || !filiere) {
//         throw new Error('Erreur lors de la récupération des informations de structure')
//       }

//       const normalizedFaculte = normalizeString(faculte.nom)
//       const normalizedAnnee = normalizeString(annee.annee)
//       const normalizedDepartement = normalizeString(departement.nom)
//       const normalizedFiliere = normalizeString(filiere.nom)

//       let filePath = null
//       let fileName = null

//       // Étape 1: Upload du fichier seulement si docAvailable est true
//       if (docAvailable && formData.fichier) {
//         setCurrentStep('upload')
//         const uploadProgressInterval = setInterval(() => {
//           setUploadProgress(prev => {
//             if (prev >= 30) {
//               clearInterval(uploadProgressInterval)
//               return 30
//             }
//             return prev + 10
//           })
//         }, 200)

//         const fileExtension = formData.fichier.name.split('.').pop()
//         const normalizedFileName = normalizeString(formData.titre)
//         fileName = `${normalizedFileName}.${fileExtension}`
//         filePath = `${normalizedFaculte}/${normalizedAnnee}/${normalizedDepartement}/${normalizedFiliere}/${fileName}`

//         const { error: uploadError } = await supabase.storage
//           .from('tfc-bucket')
//           .upload(filePath, formData.fichier)

//         clearInterval(uploadProgressInterval)
//         setUploadProgress(30)

//         if (uploadError) {
//           throw new Error(`Erreur lors de l'upload du fichier: ${uploadError.message}`)
//         }
//       } else {
//         // Si pas de fichier, passer directement à l'étape suivante
//         setUploadProgress(30)
//       }

//       // Étape 2: Génération de l'embedding
//       setCurrentStep('embedding')
//       const embeddingProgressInterval = setInterval(() => {
//         setUploadProgress(prev => {
//           if (prev >= 70) {
//             clearInterval(embeddingProgressInterval)
//             return 70
//           }
//           return prev + 5
//         })
//       }, 200)

//       const embedding = await EmbeddingService.generateEmbeddingForTFC({
//         titre: formData.titre,
//         resume: formData.resume,
//         mots_cles: formData.mots_cles.split(',').map(k => k.trim()),
//         auteur: formData.auteur,
//         promoteur: formData.promoteur,
//         technologies: Array.isArray(formData.technologies) ? formData.technologies : [],
//         fonctionnalites: Array.isArray(formData.fonctionnalites) ? formData.fonctionnalites : ['non spécifié'],
//         cas_application: formData.cas_application
//       })

//       clearInterval(embeddingProgressInterval)
//       setUploadProgress(70)

//       // Étape 3: Insertion dans la base de données
//       setCurrentStep('insertion')
//       const insertionProgressInterval = setInterval(() => {
//         setUploadProgress(prev => {
//           if (prev >= 100) {
//             clearInterval(insertionProgressInterval)
//             return 100
//           }
//           return prev + 10
//         })
//       }, 100)

//       // Préparer les données d'insertion AVEC embedding_2
//       const insertData: any = {
//         titre: formData.titre,
//         resume: formData.resume,
//         mots_cles: formatPostgresArray(formData.mots_cles),
//         auteur: formData.auteur,
//         auteur_email: formData.auteur_email,
//         promoteur: formData.promoteur,
//         cas_application: formData.cas_application || 'anonymes',
//         faculte_id: formData.faculte_id,
//         annee_academique_id: formData.annee_academique_id,
//         departement_id: formData.departement_id,
//         filiere_id: formData.filiere_id,
//         date_soutenance: formData.date_soutenance || null,
//         note: formData.note || null,
//         statut: 'approuvé',
//         technologies: formatPostgresArray(formData.technologies || []),
//         fonctionnalites: formatPostgresArray(formData.fonctionnalites || ['non spécifié']),
//         added_by_user_id: user.id,
//         added_by_name: user.name || user.username,
//         embedding_2: embedding, // ← CHANGEMENT ICI: utiliser embedding_2
//         doc_available: docAvailable
//       }

//       // Ajouter les informations du fichier seulement si docAvailable est true
//       if (docAvailable && formData.fichier) {
//         insertData.fichier_nom = formData.fichier.name
//         insertData.fichier_chemin = filePath
//         insertData.fichier_taille = formData.fichier.size
//         insertData.fichier_type = formData.fichier.type
//       }

//       const { error: insertError } = await supabase
//         .from('tfc')
//         .insert(insertData)

//       clearInterval(insertionProgressInterval)
//       setUploadProgress(100)

//       if (insertError) {
//         // Supprimer le fichier uploadé en cas d'erreur seulement si docAvailable est true
//         if (docAvailable && filePath) {
//           await supabase.storage.from('tfc-bucket').remove([filePath])
//         }
//         throw new Error(`Erreur lors de l'insertion des données: ${insertError.message}`)
//       }

//       setTimeout(() => {
//         router.push('/tfc/?message=tfc_ajoute')
//       }, 1000)

//     } catch (err: any) {
//       setError(err.message)
//       setUploadProgress(0)
//       setCurrentStep('upload')
//       console.error('Erreur détaillée:', err)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleFileSelect = (file: File) => {
//     setUploadedFile(file)
//     setError(null)
//   }

//   const getStepLabel = (step: string) => {
//     switch (step) {
//       case 'upload':
//         return docAvailable ? 'Upload du fichier' : 'Préparation des données'
//       case 'embedding':
//         return 'Génération de l\'embedding (SPECTER)'
//       case 'insertion':
//         return 'Insertion dans la base'
//       default:
//         return 'Traitement'
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
//       <div className="container mx-auto px-2 lg:px-4 max-w-4xl">
//         {/* Section d'erreur */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 rounded-xl p-6 mb-8">
//             <div className="flex items-center space-x-3">
//               <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
//               <div>
//                 <h3 className="text-red-800 dark:text-red-300 font-semibold">Erreur lors de l'ajout</h3>
//                 <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Formulaire */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 border border-gray-200 dark:border-gray-700">
//           {/* Switch pour activer/désactiver l'upload de document */}
//           <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
//                   Doc disponible
//                 </h3>
//                 <p className="text-xs text-gray-600 dark:text-gray-300">
//                   {docAvailable 
//                     ? 'Le TFC aura un Doc téléchargeable' 
//                     : 'Le TFC sera ajouté sans Doc'}
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setDocAvailable(!docAvailable)}
//                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
//                   docAvailable ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
//                 }`}
//               >
//                 <span
//                   className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
//                     docAvailable ? 'translate-x-6' : 'translate-x-1'
//                   }`}
//                 />
//               </button>
//             </div>
//           </div>

//           <div className="mb-6">
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Informations du TFC</h2>
//             <p className="text-gray-600 dark:text-gray-300 text-sm">
//               Remplissez toutes les informations requises pour votre travail de fin de cycle.
//             </p>
//           </div>

//           <TFCForm 
//             onSubmit={handleSubmit} 
//             isLoading={isLoading}
//             onFileSelect={handleFileSelect}
//             prefillData={{
//               faculte_id: faculteId ? parseInt(faculteId) : 0,
//               annee_academique_id: anneeId ? parseInt(anneeId) : 0,
//               departement_id: departementId ? parseInt(departementId) : 0,
//               filiere_id: filiereId ? parseInt(filiereId) : 0
//             }}
//             docAvailable={docAvailable}
//           />
//         </div>

//         {isLoading && (
//           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8 border border-green-200 dark:border-green-800">
//             <div className="flex items-center space-x-4 mb-4">
//               <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
//                 <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                   {getStepLabel(currentStep)}
//                 </h3>
//                 <p className="text-gray-600 dark:text-gray-300">Veuillez patienter pendant le traitement...</p>
//               </div>
//             </div>
            
//             {/* Barre de progression */}
//             <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
//               <div 
//                 className="bg-green-500 h-3 rounded-full transition-all duration-300 ease-in-out"
//                 style={{ width: `${uploadProgress}%` }}
//               ></div>
//             </div>
//             <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
//               <span>{getStepLabel(currentStep)}</span>
//               <span>{uploadProgress}%</span>
//             </div>

//             {/* Étapes détaillées */}
//             <div className="grid grid-cols-3 gap-4 my-6 text-xs">
//               <div className={`text-center p-2 rounded ${
//                 currentStep === 'upload' 
//                   ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' 
//                   : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
//               }`}>
//                 {docAvailable ? 'Upload fichier' : 'Préparation'}
//               </div>
//               <div className={`text-center p-2 rounded ${
//                 currentStep === 'embedding' 
//                   ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' 
//                   : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
//               }`}>
//                 Génération embedding
//               </div>
//               <div className={`text-center p-2 rounded ${
//                 currentStep === 'insertion' 
//                   ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' 
//                   : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
//               }`}>
//                 Insertion base
//               </div>
//             </div>

//             {/* Information sur l'embedding */}
//             <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//               <p className="text-sm text-blue-700 dark:text-blue-300">
//                 <strong>Nouveau modèle:</strong> Utilisation de SPECTER (768 dimensions) pour une meilleure recherche sémantique
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  FiArrowLeft,
  FiUpload,
  FiCpu,
  FiDatabase,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi'
import TFCForm from '@/components/forms/TFCForm'
import { TFCFormData } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { SessionUser } from '@/types/user'

interface AjouterTFCClientProps {
  user: SessionUser
}

type Step = 'upload' | 'embedding' | 'insertion'

/* ------------------------------- Helpers --------------------------------- */

// Normalise les chaînes (supprime accents et caractères spéciaux)
const normalizeString = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

// Formate les tableaux PostgreSQL
const formatPostgresArray = (items: string[] | string): string[] => {
  if (typeof items === 'string') {
    items = items.split(',').map((k) => k.trim()).filter((k) => k.length > 0)
  }

  if (!Array.isArray(items) || items.length === 0) {
    return ['non spécifié']
  }

  return items
    .map((item) => {
      const cleaned = item
        .trim()
        .replace(/"/g, '')
        .replace(/'/g, '')
        .replace(/[{}]/g, '')
        .replace(/\\/g, '')

      return cleaned.substring(0, 100)
    })
    .filter((item) => item.length > 0)
}

/* --------------------------- Service d'embedding -------------------------- */

class EmbeddingService {
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      console.log('Début génération embedding avec SPECTER...')

      const response = await fetch('/api/generate-embedding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      const responseText = await response.text()
      console.log('Réponse API:', response.status, responseText)

      if (!response.ok) {
        throw new Error(`Erreur API ${response.status}: ${responseText}`)
      }

      const data = JSON.parse(responseText)

      if (!data.embedding) {
        throw new Error('Format de réponse invalide: embedding manquant')
      }

      // Vérifier la dimension de l'embedding
      if (data.embedding.length !== 768) {
        console.warn(`Attention: Embedding a ${data.embedding.length} dimensions au lieu de 768`)
      }

      console.log(`Embedding généré avec succès (${data.embedding.length} dimensions)`)
      return data.embedding
    } catch (error: any) {
      console.error('Erreur critique génération embedding:', error)

      // Fallback: embedding vide de 768 dimensions (taille SPECTER)
      const fallbackEmbedding = new Array(768).fill(0)
      console.log('Utilisation embedding de secours (768 dimensions)')
      return fallbackEmbedding
    }
  }

  static async generateEmbeddingForTFC(tfcData: {
    titre: string
    resume: string
    mots_cles: string[]
    auteur: string
    promoteur?: string
    technologies?: string[]
    fonctionnalites?: string[]
    cas_application?: string
  }): Promise<number[]> {
    // Texte enrichi pour l'embedding avec plus de contexte
    const text = `
      TITRE: ${tfcData.titre}
      
      RÉSUMÉ: ${tfcData.resume}
      
      DOMAINE: ${tfcData.mots_cles.join(', ')}
      TECHNOLOGIES: ${tfcData.technologies?.join(', ') || 'non spécifié'}
      FONCTIONNALITÉS: ${tfcData.fonctionnalites?.join(', ') || 'non spécifié'}
      APPLICATION: ${tfcData.cas_application || 'anonymes'}
      
      AUTEUR: ${tfcData.auteur}
      PROMOTEUR: ${tfcData.promoteur || 'non spécifié'}
    `.trim()

    return this.generateEmbedding(text)
  }
}

/* --------------------------------- Page ---------------------------------- */

export default function AjouterTFCClient({ user }: AjouterTFCClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [currentStep, setCurrentStep] = useState<Step>('upload')
  const [docAvailable, setDocAvailable] = useState<boolean>(true)

  // Paramètres d'URL
  const faculteId = searchParams.get('faculte_id')
  const anneeId = searchParams.get('annee_id')
  const departementId = searchParams.get('departement_id')
  const filiereId = searchParams.get('filiere_id')

  /* ------------------------------ Soumission ------------------------------ */

  const handleSubmit = async (formData: TFCFormData) => {
    setIsLoading(true)
    setError(null)
    setUploadProgress(0)
    setCurrentStep('upload')

    try {
      // Fichier obligatoire seulement si docAvailable est true
      if (docAvailable && !formData.fichier) {
        throw new Error('Veuillez sélectionner un fichier')
      }

      const { data: faculte } = await supabase
        .from('facultes')
        .select('nom')
        .eq('id', formData.faculte_id)
        .single()

      const { data: annee } = await supabase
        .from('annees_academiques')
        .select('annee')
        .eq('id', formData.annee_academique_id)
        .single()

      const { data: departement } = await supabase
        .from('departements')
        .select('nom')
        .eq('id', formData.departement_id)
        .single()

      const { data: filiere } = await supabase
        .from('filieres')
        .select('nom')
        .eq('id', formData.filiere_id)
        .single()

      if (!faculte || !annee || !departement || !filiere) {
        throw new Error('Erreur lors de la récupération des informations de structure')
      }

      const normalizedFaculte = normalizeString(faculte.nom)
      const normalizedAnnee = normalizeString(annee.annee)
      const normalizedDepartement = normalizeString(departement.nom)
      const normalizedFiliere = normalizeString(filiere.nom)

      let filePath = null
      let fileName = null

      // Étape 1 : upload du fichier seulement si docAvailable est true
      if (docAvailable && formData.fichier) {
        setCurrentStep('upload')
        const uploadProgressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 30) {
              clearInterval(uploadProgressInterval)
              return 30
            }
            return prev + 10
          })
        }, 200)

        const fileExtension = formData.fichier.name.split('.').pop()
        const normalizedFileName = normalizeString(formData.titre)
        fileName = `${normalizedFileName}.${fileExtension}`
        filePath = `${normalizedFaculte}/${normalizedAnnee}/${normalizedDepartement}/${normalizedFiliere}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('tfc-bucket')
          .upload(filePath, formData.fichier)

        clearInterval(uploadProgressInterval)
        setUploadProgress(30)

        if (uploadError) {
          throw new Error(`Erreur lors de l'upload du fichier: ${uploadError.message}`)
        }
      } else {
        // Pas de fichier : on passe directement à l'étape suivante
        setUploadProgress(30)
      }

      // Étape 2 : génération de l'embedding
      setCurrentStep('embedding')
      const embeddingProgressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 70) {
            clearInterval(embeddingProgressInterval)
            return 70
          }
          return prev + 5
        })
      }, 200)

      const embedding = await EmbeddingService.generateEmbeddingForTFC({
        titre: formData.titre,
        resume: formData.resume,
        mots_cles: formData.mots_cles.split(',').map((k) => k.trim()),
        auteur: formData.auteur,
        promoteur: formData.promoteur,
        technologies: Array.isArray(formData.technologies) ? formData.technologies : [],
        fonctionnalites: Array.isArray(formData.fonctionnalites)
          ? formData.fonctionnalites
          : ['non spécifié'],
        cas_application: formData.cas_application,
      })

      clearInterval(embeddingProgressInterval)
      setUploadProgress(70)

      // Étape 3 : insertion dans la base de données
      setCurrentStep('insertion')
      const insertionProgressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(insertionProgressInterval)
            return 100
          }
          return prev + 10
        })
      }, 100)

      // Données d'insertion avec embedding_2
      const insertData: any = {
        titre: formData.titre,
        resume: formData.resume,
        mots_cles: formatPostgresArray(formData.mots_cles),
        auteur: formData.auteur,
        auteur_email: formData.auteur_email,
        promoteur: formData.promoteur,
        cas_application: formData.cas_application || 'anonymes',
        faculte_id: formData.faculte_id,
        annee_academique_id: formData.annee_academique_id,
        departement_id: formData.departement_id,
        filiere_id: formData.filiere_id,
        date_soutenance: formData.date_soutenance || null,
        note: formData.note || null,
        statut: 'approuvé',
        technologies: formatPostgresArray(formData.technologies || []),
        fonctionnalites: formatPostgresArray(formData.fonctionnalites || ['non spécifié']),
        added_by_user_id: user.id,
        added_by_name: user.name || user.username,
        embedding_2: embedding,
        doc_available: docAvailable,
      }

      // Infos du fichier seulement si docAvailable est true
      if (docAvailable && formData.fichier) {
        insertData.fichier_nom = formData.fichier.name
        insertData.fichier_chemin = filePath
        insertData.fichier_taille = formData.fichier.size
        insertData.fichier_type = formData.fichier.type
      }

      const { error: insertError } = await supabase.from('tfc').insert(insertData)

      clearInterval(insertionProgressInterval)
      setUploadProgress(100)

      if (insertError) {
        // Supprime le fichier uploadé en cas d'erreur
        if (docAvailable && filePath) {
          await supabase.storage.from('tfc-bucket').remove([filePath])
        }
        throw new Error(`Erreur lors de l'insertion des données: ${insertError.message}`)
      }

      setTimeout(() => {
        router.push('/tfc/?message=tfc_ajoute')
      }, 1000)
    } catch (err: any) {
      setError(err.message)
      setUploadProgress(0)
      setCurrentStep('upload')
      console.error('Erreur détaillée:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (file: File) => {
    setUploadedFile(file)
    setError(null)
  }

  /* ------------------------------ Dérivés ------------------------------ */

  const steps: { key: Step; label: string; icon: React.ElementType }[] = [
    { key: 'upload', label: docAvailable ? 'Upload du fichier' : 'Préparation', icon: FiUpload },
    { key: 'embedding', label: 'Génération embedding', icon: FiCpu },
    { key: 'insertion', label: 'Insertion en base', icon: FiDatabase },
  ]
  const currentIndex = steps.findIndex((s) => s.key === currentStep)

  /* ------------------------------- Rendu ------------------------------- */

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Erreur */}
        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200"
          >
            <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-medium">Erreur lors de l’ajout</p>
              <p className="break-words text-rose-800 dark:text-rose-300">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="rounded p-1 hover:bg-rose-100 dark:hover:bg-rose-900/40"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        )}

        {/* En-tête + option « Doc disponible » */}
        <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isLoading}
                aria-label="Retour"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <FiArrowLeft className="h-4 w-4" aria-hidden />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Ajouter un TFC
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Remplissez les informations requises du travail de fin de cycle.
                </p>
              </div>
            </div>

            <div className="flex w-full items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 sm:w-auto dark:border-zinc-700 dark:bg-zinc-900/40">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Doc disponible</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {docAvailable ? 'Le TFC aura un document téléchargeable' : 'Le TFC sera ajouté sans document'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={docAvailable}
                aria-label="Doc disponible"
                disabled={isLoading}
                onClick={() => setDocAvailable(!docAvailable)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                  docAvailable ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    docAvailable ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Progression */}
        {isLoading && (
          <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {steps[currentIndex]?.label ?? 'Traitement'}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Veuillez patienter pendant le traitement…
                </p>
              </div>
              <span className="text-sm font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
                {uploadProgress}%
              </span>
            </div>

            <div
              className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
              role="progressbar"
              aria-valuenow={uploadProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-2 rounded-full bg-emerald-500 transition-all duration-300 ease-in-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {steps.map((s, i) => {
                const Icon = s.icon
                const done = i < currentIndex
                const active = i === currentIndex
                return (
                  <div
                    key={s.key}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                      active
                        ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300'
                        : done
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400'
                    }`}
                  >
                    {done ? (
                      <FiCheck className="h-4 w-4 shrink-0" aria-hidden />
                    ) : (
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    )}
                    <span className="truncate font-medium">{s.label}</span>
                  </div>
                )
              })}
            </div>

       
          </div>
        )}

        {/* Formulaire (pleine largeur pour afficher les champs en colonnes sur desktop) */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4 lg:p-5 dark:border-zinc-700 dark:bg-zinc-800">
          <TFCForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onFileSelect={handleFileSelect}
            prefillData={{
              faculte_id: faculteId ? parseInt(faculteId) : 0,
              annee_academique_id: anneeId ? parseInt(anneeId) : 0,
              departement_id: departementId ? parseInt(departementId) : 0,
              filiere_id: filiereId ? parseInt(filiereId) : 0,
            }}
            docAvailable={docAvailable}
          />
        </div>
      </div>
    </div>
  )
}
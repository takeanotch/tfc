
// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import TFCForm from '@/components/forms/TFCForm'
// import { TFCFormData } from '@/lib/types'
// import { supabase } from '@/lib/supabase'

// export default function AjouterTFC() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
  
//   // Récupérer les paramètres d'URL
//   const faculteId = searchParams.get('faculte_id')
//   const anneeId = searchParams.get('annee_id')
//   const departementId = searchParams.get('departement_id')
//   const filiereId = searchParams.get('filiere_id')

//   const handleSubmit = async (formData: TFCFormData) => {
//     setIsLoading(true)
//     setError(null)

//     try {
//       // Vérifier qu'un fichier a été sélectionné
//       if (!formData.fichier) {
//         throw new Error('Veuillez sélectionner un fichier')
//       }

//       // Récupérer les informations de la faculté, département et filière
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

//       // Créer le chemin du fichier
//       const fileExtension = formData.fichier.name.split('.').pop()
//       const fileName = `${formData.titre.toLowerCase().replace(/\s+/g, '-')}.${fileExtension}`
//       const filePath = `${faculte.nom}/${annee.annee}/${departement.nom}/${filiere.nom}/${fileName}`

//       // Uploader le fichier vers Supabase Storage
//       const { error: uploadError } = await supabase.storage
//         .from('tfc-bucket')
//         .upload(filePath, formData.fichier)

//       if (uploadError) {
//         throw new Error(`Erreur lors de l'upload du fichier: ${uploadError.message}`)
//       }

//       // Récupérer l'URL publique du fichier
//       const { data: urlData } = supabase.storage
//         .from('tfc-bucket')
//         .getPublicUrl(filePath)

//       // Insérer les métadonnées dans la table TFC
//       const { error: insertError } = await supabase
//         .from('tfc')
//         .insert({
//           titre: formData.titre,
//           resume: formData.resume,
//           mots_cles: formData.mots_cles.split(',').map(k => k.trim()),
//           auteur: formData.auteur,
//           auteur_email: formData.auteur_email,
//           promoteur: formData.promoteur,
//           faculte_id: formData.faculte_id,
//           annee_academique_id: formData.annee_academique_id,
//           departement_id: formData.departement_id,
//           filiere_id: formData.filiere_id,
//           fichier_nom: formData.fichier.name,
//           fichier_chemin: filePath,
//           fichier_taille: formData.fichier.size,
//           fichier_type: formData.fichier.type,
//           date_soutenance: formData.date_soutenance || null,
//           note: formData.note || null,
//           statut: 'approuvé'
//         })

//       if (insertError) {
//         // Si l'insertion échoue, supprimer le fichier uploadé
//         await supabase.storage
//           .from('tfc-bucket')
//           .remove([filePath])
        
//         throw new Error(`Erreur lors de l'insertion des données: ${insertError.message}`)
//       }

//       // Rediriger vers la page d'accueil avec un message de succès
//       router.push('/?message=tfc_ajoute')
//     } catch (err: any) {
//       setError(err.message)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8">Ajouter un TFC</h1>
      
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
//           {error}
//         </div>
//       )}
      
//       <div className="bg-white shadow-md rounded-lg p-6">
//         <TFCForm 
//           onSubmit={handleSubmit} 
//           isLoading={isLoading}
//           prefillData={{
//             faculte_id: faculteId ? parseInt(faculteId) : 0,
//             annee_academique_id: anneeId ? parseInt(anneeId) : 0,
//             departement_id: departementId ? parseInt(departementId) : 0,
//             filiere_id: filiereId ? parseInt(filiereId) : 0
//           }}
//         />
//       </div>
//     </div>
//   )
// }
// app/ajouter-tfc/page.tsx (Server Component)
export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AjouterTFCClient from './AjouterTFCClient'
import { getSession } from '@/utils/session'
export default async function AjouterTFCPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/auth/login?redirect=/ajouter-tfc')
  }

  return <div className='m'>
  
  <AjouterTFCClient user={session} />
  </div>
}
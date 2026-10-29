// // src/app/tfc/page.tsx
// import { supabase } from '@/lib/supabase'
// import { TFCClientView } from '@/components/tfc/TFCClientView'
// import { requireAuth } from '@/utils/session'

// export const dynamic = 'force-dynamic'

// async function getTFCList() {
//   const { data, error } = await supabase
//     .from('tfc')
//     .select(`
//       *,
//       facultes:faculte_id(nom, code),
//       annees_academiques:annee_academique_id(annee),
//       departements:departement_id(nom, code),
//       filieres:filiere_id(nom, code)
//     `)
//     .eq('statut', 'approuvé')
//     .order('created_at', { ascending: false })

//   if (error) {
//     throw error
//   }

//   return data
// }

// export default async function TFCListPage() {
//   const user = await requireAuth()
//   const tfcList = await getTFCList()

//   return (
//     // Changement de bg-gray-900 à dark:bg-zinc-950 pour un fond très sombre cohérent
//     <div className="min-h-screen bg-white dark:bg-zinc-950 py-8">
//       <div className="container mx-auto px-4 max-w-7xl">
//         <TFCClientView tfcList={tfcList} user={user} />
//       </div>
//     </div>
//   )
// }

// src/app/tfc/page.tsx
import { supabase } from '@/lib/supabase'
import { TFCClientView } from '@/components/tfc/TFCClientView'
import { requireAuth } from '@/utils/session'

export const dynamic = 'force-dynamic'

async function getTFCList() {
  const { data, error } = await supabase
    .from('tfc')
    .select(`
      *,
      facultes:faculte_id(nom, code),
      annees_academiques:annee_academique_id(annee),
      departements:departement_id(nom, code),
      filieres:filiere_id(nom, code)
    `)
    .eq('statut', 'approuvé')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export default async function TFCListPage() {
  const user = await requireAuth()
  const tfcList = await getTFCList()

  return (
    // Fond anthracite très sombre pour correspondre à la capture
    <div className="min-h-screen dark:bg-zinc-900 bg-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <TFCClientView tfcList={tfcList} user={user} />
      </div>
    </div>
  )
}
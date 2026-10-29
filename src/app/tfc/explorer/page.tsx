export const dynamic = 'force-dynamic';


// app/explorer/page.tsx
import { Suspense } from 'react'
import { requireAuth } from '@/utils/session'
import { supabase } from '@/lib/supabase'
import ExplorerClient from './ExplorerClient'
import { Faculte, AnneeAcademique, Departement, Filiere, TFC } from '@/lib/types'

async function getInitialData() {
  const [facultesRes, anneesRes] = await Promise.all([
    supabase.from('facultes').select('*').order('nom'),
    supabase.from('annees_academiques').select('*').order('annee', { ascending: false })
  ])

  return {
    facultes: facultesRes.data || [],
    annees: anneesRes.data || []
  }
}

export default async function ExplorerPage() {
  const user = await requireAuth()
  const { facultes, annees } = await getInitialData()

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ExplorerClient 
        user={user}
        initialFacultes={facultes}
        initialAnnees={annees}
      />
    </Suspense>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}
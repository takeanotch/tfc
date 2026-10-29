// // app/api/tfc/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { supabase } from '@/lib/supabase'

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const faculte = searchParams.get('faculte')
//     const annee = searchParams.get('annee')
//     const departement = searchParams.get('departement')
//     const filiere = searchParams.get('filiere')
//     const search = searchParams.get('search')
//     const page = parseInt(searchParams.get('page') || '1')
//     const limit = parseInt(searchParams.get('limit') || '10')

//     let query = supabase
//       .from('tfc')
//       .select(`
//         *,
//         faculte:faculte_id (*),
//         annee_academique:annee_academique_id (*),
//         departement:departement_id (*),
//         filiere:filiere_id (*)
//       `, { count: 'exact' })
//       .eq('statut', 'approuvé')

//     // Appliquer les filtres
//     if (faculte) query = query.eq('faculte_id', faculte)
//     if (annee) query = query.eq('annee_academique_id', annee)
//     if (departement) query = query.eq('departement_id', departement)
//     if (filiere) query = query.eq('filiere_id', filiere)

//     // Appliquer la recherche
//     if (search) {
//       query = query.or(`
//         titre.ilike.%${search}%,
//         auteur.ilike.%${search}%,
//         promoteur.ilike.%${search}%,
//         mots_cles.cs.{${search.split(' ').join(',')}}
//       `)
//     }

//     // Pagination
//     const from = (page - 1) * limit
//     const to = from + limit - 1
//     query = query.range(from, to).order('created_at', { ascending: false })

//     const { data, error, count } = await query

//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 500 })
//     }

//     return NextResponse.json({
//       tfc: data,
//       total: count,
//       page,
//       totalPages: Math.ceil((count || 0) / limit)
//     })
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 })
//   }
// }
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const faculte = searchParams.get('faculte')
    const annee = searchParams.get('annee')
    const departement = searchParams.get('departement')
    const filiere = searchParams.get('filiere')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = supabase
      .from('tfc')
      .select(`
        *,
        faculte:facultes(id, nom),
        annee_academique:annees_academiques(id, annee),
        departement:departements(id, nom),
        filiere:filieres(id, nom)
      `, { count: 'exact' })
    //   .eq('statut', 'approuvé')

    // Appliquer les filtres
    if (faculte) query = query.eq('faculte_id', Number(faculte))
    if (annee) query = query.eq('annee_academique_id', Number(annee))
    if (departement) query = query.eq('departement_id', Number(departement))
    if (filiere) query = query.eq('filiere_id', Number(filiere))

    // Appliquer la recherche
    if (search) {
      query = query.or(`
        titre.ilike.%${search}%,
        auteur.ilike.%${search}%,
        promoteur.ilike.%${search}%,
        mots_cles.cs.{${search.split(' ').join(',')}}
      `)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to).order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      tfc: data,
      total: count,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

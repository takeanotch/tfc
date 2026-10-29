import { NextRequest, NextResponse } from 'next/server'

// Configuration Supabase - CORRECTION : utilisation des bonnes variables
const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

// Vérification de la configuration
console.log('🔧 Configuration Supabase:', {
  url: supabaseConfig.url ? '✓ Définie' : '✗ Manquante',
  anonKey: supabaseConfig.anonKey ? '✓ Définie' : '✗ Manquante'
})

export async function POST(request: NextRequest) {
  try {
    const { 
      query, 
      similarity_threshold = 0.3, 
      match_count = 10,
      filter_faculte_id,
      filter_departement_id,
      filter_filiere_id,
      filter_annee_academique_id,
      filter_auteur,
      filter_promoteur
    } = await request.json()

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'La requête de recherche est requise' },
        { status: 400 }
      )
    }

    const cleanQuery = query.trim()
    console.log('🔍 Recherche sémantique:', { 
      query: cleanQuery.substring(0, 100)
    })

    // 1. Générer l'embedding de la requête
    const queryEmbedding = await generateQueryEmbedding(cleanQuery)
    
    let finalResults: any[] = []
    let searchType = 'semantic'

    if (queryEmbedding && isSupabaseConfigured()) {
      // 2. Recherche sémantique avec embedding_2
      const semanticResults = await performVectorSearch(
        queryEmbedding, 
        {
          filter_faculte_id,
          filter_departement_id,
          filter_filiere_id,
          filter_annee_academique_id,
          filter_auteur,
          filter_promoteur
        }, 
        match_count,
        similarity_threshold
      )

      console.log(`📊 Résultats sémantiques: ${semanticResults.length}`)

      if (semanticResults.length >= Math.min(match_count, 5)) {
        finalResults = semanticResults
        searchType = 'semantic'
      } else {
        console.log('🔄 Complétion avec recherche textuelle...')
        const textResults = await performTextSearch(
          cleanQuery, 
          {
            filter_faculte_id,
            filter_departement_id,
            filter_filiere_id,
            filter_annee_academique_id,
            filter_auteur,
            filter_promoteur
          }, 
          Math.max(match_count, 15)
        )
        
        finalResults = mergeSearchResults(semanticResults, textResults, match_count)
        searchType = semanticResults.length > 0 ? 'hybrid' : 'text'
      }
    } else {
      // Fallback vers recherche textuelle
      console.log('🔄 Fallback vers recherche textuelle')
      finalResults = await performTextSearch(
        cleanQuery, 
        {
          filter_faculte_id,
          filter_departement_id,
          filter_filiere_id,
          filter_annee_academique_id,
          filter_auteur,
          filter_promoteur
        }, 
        match_count
      )
      searchType = 'text'
    }

    console.log(`✅ ${finalResults.length} résultats (${searchType})`)

    return NextResponse.json({
      results: finalResults,
      total: finalResults.length,
      query: cleanQuery,
      hasSemanticResults: searchType.includes('semantic') || searchType.includes('hybrid'),
      searchType,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ Erreur recherche sémantique:', error)
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la recherche sémantique',
        details: error.message,
        results: [],
        total: 0
      },
      { status: 500 }
    )
  }
}

// 🔧 FONCTIONS UTILITAIRES

function isSupabaseConfigured(): boolean {
  return !!(supabaseConfig.url && supabaseConfig.anonKey)
}

async function generateQueryEmbedding(query: string): Promise<number[] | null> {
  try {
    console.log('🔧 Génération embedding...')

    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/generate-embedding`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: query.trim()
        }),
      }
    )

    if (response.ok) {
      const data = await response.json()
      if (data.embedding && Array.isArray(data.embedding)) {
        console.log(`✅ Embedding généré: ${data.embedding.length} dimensions`)
        return data.embedding
      }
    }

    console.warn('⚠️ Échec génération embedding:', response.status)
    return null

  } catch (error) {
    console.error('❌ Erreur génération embedding:', error)
    return null
  }
}

/**
 * RECHERCHE VECTORIELLE
 */
async function performVectorSearch(
  queryEmbedding: number[], 
  filters: any, 
  limit: number, 
  similarityThreshold: number
): Promise<any[]> {
  try {
    console.log('🔍 Recherche vectorielle avec embedding_2...')
    
    if (!isSupabaseConfigured()) {
      console.error('❌ Configuration Supabase manquante pour la recherche vectorielle')
      return []
    }
    
    const response = await fetch(
      `${supabaseConfig.url}/rest/v1/rpc/semantic_search_tfc_v2`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseConfig.anonKey!,
          'Authorization': `Bearer ${supabaseConfig.anonKey!}`,
        },
        body: JSON.stringify({
          query_embedding: queryEmbedding,
          similarity_threshold: similarityThreshold,
          match_count: limit,
          filter_faculte_id: filters.filter_faculte_id || null,
          filter_departement_id: filters.filter_departement_id || null,
          filter_filiere_id: filters.filter_filiere_id || null,
          filter_annee_academique_id: filters.filter_annee_academique_id || null,
          filter_auteur: filters.filter_auteur || null,
          filter_promoteur: filters.filter_promoteur || null
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erreur recherche vectorielle:', response.status, errorText)
      return []
    }

    const results = await response.json()
    console.log(`📈 ${results?.length || 0} résultats vectoriels`)

    return results || []

  } catch (error) {
    console.error('❌ Erreur recherche vectorielle:', error)
    return []
  }
}

/**
 * RECHERCHE TEXTUELLE
 */
async function performTextSearch(query: string, filters: any, limit: number): Promise<any[]> {
  try {
    console.log('🔤 Recherche textuelle...')
    
    const cleanQuery = query.trim().replace(/\s+/g, ' ')
    
    if (!isSupabaseConfigured()) {
      console.error('❌ Configuration Supabase manquante pour la recherche textuelle')
      return []
    }
    
    // Construire l'URL avec les filtres
    const searchParams = new URLSearchParams({
      select: `*,
        facultes:faculte_id(nom,code),
        departements:departement_id(nom,code),
        filieres:filiere_id(nom,code),
        annees_academiques:annee_academique_id(annee)`,
      or: `titre.ilike.%${cleanQuery}%,resume.ilike.%${cleanQuery}%,auteur.ilike.%${cleanQuery}%,promoteur.ilike.%${cleanQuery}%`,
      statut: 'eq.approuvé',
      limit: limit.toString()
    })

    // Ajouter les filtres
    if (filters.filter_faculte_id) searchParams.append('faculte_id', `eq.${filters.filter_faculte_id}`)
    if (filters.filter_departement_id) searchParams.append('departement_id', `eq.${filters.filter_departement_id}`)
    if (filters.filter_filiere_id) searchParams.append('filiere_id', `eq.${filters.filter_filiere_id}`)
    if (filters.filter_annee_academique_id) searchParams.append('annee_academique_id', `eq.${filters.filter_annee_academique_id}`)
    if (filters.filter_auteur) searchParams.append('auteur', `ilike.%${filters.filter_auteur}%`)
    if (filters.filter_promoteur) searchParams.append('promoteur', `ilike.%${filters.filter_promoteur}%`)

    const response = await fetch(
      `${supabaseConfig.url}/rest/v1/tfc?${searchParams}`,
      {
        headers: {
          'apikey': supabaseConfig.anonKey!,
          'Authorization': `Bearer ${supabaseConfig.anonKey!}`,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erreur recherche textuelle:', response.status, errorText)
      return []
    }

    const data = await response.json()
    console.log(`📄 ${data?.length || 0} résultats textuels`)

    return (data || [])
      .map((item: any) => ({
        ...item,
        similarity: calculateTextRelevance(item, cleanQuery)
      }))
      .sort((a: any, b: any) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, limit)

  } catch (error) {
    console.error('❌ Erreur recherche textuelle:', error)
    return []
  }
}

function calculateTextRelevance(item: any, query: string): number {
  let score = 0
  const queryLower = query.toLowerCase()
  const titleLower = item.titre?.toLowerCase() || ''
  const summaryLower = item.resume?.toLowerCase() || ''
  const authorLower = item.auteur?.toLowerCase() || ''
  const promotorLower = item.promoteur?.toLowerCase() || ''

  // Score basé sur la correspondance exacte
  if (titleLower.includes(queryLower)) {
    score += 40
  }

  // Score basé sur les termes individuels
  const searchTerms = queryLower.split(' ').filter(term => term.length > 2)
  searchTerms.forEach(term => {
    if (titleLower.includes(term)) score += 15
    if (summaryLower.includes(term)) score += 10
    if (authorLower.includes(term)) score += 8
    if (promotorLower.includes(term)) score += 8
  })

  // Bonus pour mots-clés
  if (item.mots_cles && Array.isArray(item.mots_cles)) {
    const keywordMatches = item.mots_cles.filter((keyword: string) =>
      searchTerms.some(term => keyword.toLowerCase().includes(term))
    ).length
    score += keywordMatches * 8
  }

  // Bonus pour données complètes
  if (item.fichier_chemin) score += 5
  if (item.mots_cles?.length > 0) score += 3
  if (item.technologies?.length > 0) score += 3
  if (item.note && item.note > 15) score += 5

  return Math.min(score, 100) / 100
}

function mergeSearchResults(semanticResults: any[], textResults: any[], limit: number): any[] {
  const seenIds = new Set()
  const merged = []

  // Ajouter d'abord les résultats sémantiques
  for (const result of semanticResults) {
    if (!seenIds.has(result.id)) {
      merged.push(result)
      seenIds.add(result.id)
    }
  }

  // Ajouter les résultats textuels non dupliqués
  for (const result of textResults) {
    if (!seenIds.has(result.id) && merged.length < limit) {
      merged.push(result)
      seenIds.add(result.id)
    }
  }

  return merged.slice(0, limit)
}

export async function GET() {
  return NextResponse.json({
    message: 'API de recherche sémantique TFC',
    status: isSupabaseConfigured() ? 'operational' : 'misconfigured',
    version: '2.0.0',
    supabase_configured: isSupabaseConfigured()
  })
}
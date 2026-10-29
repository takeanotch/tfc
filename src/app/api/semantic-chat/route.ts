
// app/api/semantic-chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/utils/session'
import { searchTFCs, type SearchFilters } from '@/lib/tfc-search'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Chaque recherche coûte un appel d'embedding : session obligatoire.
    // Retire ce bloc si une page publique doit appeler cette route.
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié', results: [], total: 0 }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const query = typeof body.query === 'string' ? body.query.trim() : ''
    const filters = (body.filters ?? {}) as SearchFilters
    const limit = Number(body.limit) || 20
    const similarityThreshold =
      typeof body.similarityThreshold === 'number' ? body.similarityThreshold : 0.15

    if (!query) {
      return NextResponse.json({ error: 'La requête de recherche est requise' }, { status: 400 })
    }
    if (query.length > 2000) {
      return NextResponse.json({ error: 'La requête est trop longue' }, { status: 400 })
    }

    const { results, searchType } = await searchTFCs({
      query,
      limit,
      similarityThreshold,
      filters,
    })

    return NextResponse.json({
      results,
      total: results.length,
      query,
      hasSemanticResults: searchType === 'semantic' || searchType === 'hybrid',
      searchType,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ Erreur recherche sémantique :', error)
    return NextResponse.json(
      { error: 'Service de recherche temporairement indisponible', results: [], total: 0 },
      { status: 503 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de recherche sémantique pour les TFC',
    status: 'operational',
    version: '3.0.0',
    features: ['Recherche pgvector (match_tfc)', 'Recherche textuelle', 'Fusion hybride'],
  })
}
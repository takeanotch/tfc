

// app/api/generate-embedding/route.ts
// Utilisée par la page /generate (génération en masse d'embedding_2).
// Le chat n'appelle plus cette route : il utilise lib/embeddings.ts directement.
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/utils/session'

/*
  .env :
    OPENROUTER_API_KEY=sk-or-...
    EMBEDDING_MODEL=openai/text-embedding-3-small:batch   (ou openai/text-embedding-3-small)
    EMBEDDING_DIMENSIONS=1536
    # optionnel : modèle des questions du chat (":batch" est de toute façon retiré)
    QUERY_EMBEDDING_MODEL=openai/text-embedding-3-small
*/
const MODEL_ID = process.env.EMBEDDING_MODEL ?? 'openai/text-embedding-3-small'
const DIMENSIONS = Number(process.env.EMBEDDING_DIMENSIONS ?? 1536)
const API_URL = 'https://openrouter.ai/api/v1/embeddings'
const MAX_RETRIES = 3

export const runtime = 'nodejs'

/* --------------------------------- GET ---------------------------------- */
// La page /generate lit ici le modèle actif

export async function GET() {
  return NextResponse.json({
    model: MODEL_ID,
    dimensions: DIMENSIONS,
    source: 'OpenRouter',
  })
}

/* -------------------------------- Helpers -------------------------------- */

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Les modèles text-embedding-3 supportent la réduction de dimensions (tronquer puis normaliser)
const supportsTruncation = MODEL_ID.includes('text-embedding-3')

function truncateAndNormalize(vector: number[], size: number): number[] {
  const cut = vector.slice(0, size)
  const norm = Math.sqrt(cut.reduce((sum, v) => sum + v * v, 0)) || 1
  return cut.map((v) => v / norm)
}

async function callModel(text: string, apiKey: string) {
  return fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Title': 'Archive TFC',
    },
    body: JSON.stringify({
      model: MODEL_ID,
      input: text,
      ...(supportsTruncation ? { dimensions: DIMENSIONS } : {}),
    }),
  })
}

/* --------------------------------- POST ---------------------------------- */

export async function POST(request: NextRequest) {
  try {
    // Sans session, n'importe qui pouvait consommer le crédit OpenRouter.
    // Pour restreindre davantage : vérifie aussi user.role (ex. 'admin').
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { text } = await request.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Le texte est requis' }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY manquante dans le fichier .env' },
        { status: 500 }
      )
    }

    let response = await callModel(text, apiKey)

    // 429 (limite de débit) et 5xx : on réessaie avec une attente croissante
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      if (response.status !== 429 && response.status < 500) break
      const wait = Math.min(Number(response.headers.get('Retry-After')) || attempt * 3, 30)
      console.log(`OpenRouter ${response.status}, nouvel essai dans ${wait} s`)
      await sleep(wait * 1000)
      response = await callModel(text, apiKey)
    }

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      const message = payload?.error?.message ?? `Erreur OpenRouter (${response.status})`
      console.error('Erreur OpenRouter :', response.status, payload)
      return NextResponse.json({ error: message, details: payload?.error }, { status: response.status })
    }

    const embedding: unknown = payload?.data?.[0]?.embedding
    if (!Array.isArray(embedding) || embedding.length === 0) {
      return NextResponse.json(
        { error: `Format de réponse inattendu pour le modèle ${MODEL_ID}`, details: payload },
        { status: 500 }
      )
    }

    let vector = embedding as number[]

    // Si le fournisseur ignore « dimensions », on réduit nous-mêmes
    if (supportsTruncation && vector.length > DIMENSIONS) {
      vector = truncateAndNormalize(vector, DIMENSIONS)
    }

    // Protège la base : un vecteur de mauvaise taille casserait la colonne et la recherche
    if (vector.length !== DIMENSIONS) {
      return NextResponse.json(
        {
          error: `Dimensions inattendues : ${vector.length} reçues, ${DIMENSIONS} attendues. Mets à jour EMBEDDING_DIMENSIONS et la colonne vector de la base.`,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      embedding: vector,
      model: MODEL_ID,
      source: 'OpenRouter',
      dimensions: vector.length,
    })
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Erreur inconnue'
    console.error('Erreur génération embedding :', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération de l’embedding', details },
      { status: 500 }
    )
  }
}
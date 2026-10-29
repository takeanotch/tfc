// lib/embeddings.ts
// Embedding des QUESTIONS de l'utilisateur (temps réel).
// Même modèle et mêmes dimensions que les TFC stockés dans embedding_2.

const API_URL = 'https://openrouter.ai/api/v1/embeddings'
const MAX_ATTEMPTS = 3
const CACHE_TTL = 10 * 60 * 1000
const CACHE_MAX = 200

export const EMBEDDING_DIMENSIONS = Number(process.env.EMBEDDING_DIMENSIONS ?? 1536)

// Le mode ":batch" est asynchrone : on le retire toujours pour les requêtes du chat.
// Tu peux aussi définir QUERY_EMBEDDING_MODEL pour séparer explicitement les deux usages.
export const QUERY_EMBEDDING_MODEL = (
  process.env.QUERY_EMBEDDING_MODEL ??
  process.env.EMBEDDING_MODEL ??
  'openai/text-embedding-3-small'
).replace(/:batch$/, '')

const cache = new Map<string, { embedding: number[]; ts: number }>()

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function truncateAndNormalize(vector: number[], size: number): number[] {
  const cut = vector.slice(0, size)
  const norm = Math.sqrt(cut.reduce((sum, v) => sum + v * v, 0)) || 1
  return cut.map((v) => v / norm)
}

export async function embedQuery(text: string): Promise<number[]> {
  const input = text.trim().slice(0, 2000)
  if (!input) throw new Error('Texte vide')

  const key = input.toLowerCase()
  const hit = cache.get(key)
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.embedding

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY manquante')

  const supportsDimensions = QUERY_EMBEDDING_MODEL.includes('text-embedding-3')
  let lastError: unknown = null

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-Title': 'Archive TFC',
        },
        body: JSON.stringify({
          model: QUERY_EMBEDDING_MODEL,
          input,
          ...(supportsDimensions ? { dimensions: EMBEDDING_DIMENSIONS } : {}),
        }),
        signal: AbortSignal.timeout(15_000),
      })

      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(payload?.error?.message ?? `Erreur OpenRouter (${res.status})`)
      }

      let vector = payload?.data?.[0]?.embedding as number[] | undefined
      if (!Array.isArray(vector) || vector.length === 0) {
        throw new Error('Format de réponse inattendu pour l’embedding')
      }
      if (vector.length > EMBEDDING_DIMENSIONS && supportsDimensions) {
        vector = truncateAndNormalize(vector, EMBEDDING_DIMENSIONS)
      }
      if (vector.length !== EMBEDDING_DIMENSIONS) {
        throw new Error(
          `Dimensions inattendues : ${vector.length} reçues, ${EMBEDDING_DIMENSIONS} attendues`
        )
      }

      if (cache.size >= CACHE_MAX) {
        const oldest = cache.keys().next().value
        if (oldest !== undefined) cache.delete(oldest)
      }
      cache.set(key, { embedding: vector, ts: Date.now() })
      return vector
    } catch (err) {
      lastError = err
      if (attempt < MAX_ATTEMPTS) await sleep(400 * attempt)
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Échec de l’embedding')
}
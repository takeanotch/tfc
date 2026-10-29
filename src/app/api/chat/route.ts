

// // // // app/api/chat/route.ts
// // // /* eslint-disable @typescript-eslint/no-explicit-any */
// // // import { NextRequest, NextResponse } from 'next/server'
// // // import { supabase } from '@/lib/supabase'
// // // import { getSession } from '@/utils/session'
// // // import { searchTFCs, type TfcResult } from '@/lib/tfc-search'

// // // export const runtime = 'nodejs'
// // // export const maxDuration = 60

// // // /* -------------------------------- Constantes ------------------------------ */

// // // const CHAT_MODEL = process.env.CHAT_MODEL ?? 'deepseek/deepseek-v4.1-flash'
// // // const MAX_MESSAGE_LENGTH = 2000
// // // const HISTORY_LIMIT = 8 // derniers messages envoyés au modèle
// // // const HISTORY_CHARS = 1500 // longueur max par message d'historique
// // // const SEARCH_LIMIT = 20
// // // const CONTEXT_TFC = 12 // TFC donnés au modèle
// // // const MIN_SIMILARITY = 5 // seuil (%) pour les sources quand le modèle n'en cite aucune

// // // type QuestionType = 'general' | 'suggestion_sujet' | 'specific_search'
// // // type ChatRole = 'user' | 'assistant'

// // // interface HistoryMessage {
// // //   role: ChatRole
// // //   content: string
// // // }

// // // type StreamEvent =
// // //   | { type: 'meta'; conversationId: number }
// // //   | { type: 'delta'; text: string }
// // //   | { type: 'done'; conversationId: number; references: TFCReferencePayload[] }
// // //   | { type: 'error'; message: string }

// // // interface TFCReferencePayload {
// // //   id: number
// // //   titre: string
// // //   auteur: string
// // //   promoteur: string
// // //   faculte: string
// // //   annee: string
// // //   technologies: string[]
// // //   resume: string
// // //   similarity: number | null
// // // }

// // // /* ----------------------------- Classification ----------------------------- */

// // // // Message entièrement composé de formules de politesse
// // // const SMALL_TALK =
// // //   /^(?:(?:bonjour|bonsoir|salut|coucou|hello|hi|hey|merci(?: beaucoup)?|thanks|ok|d'accord|super|parfait|au revoir|bye|à bientôt|a bientot)[\s!.,?]*)+$/i
// // // const ABOUT_BOT =
// // //   /(qui es[- ]tu|tu es qui|présente[- ]toi|ton rôle|que peux[- ]tu faire|comment (ça )?(marche|fonctionne))/i
// // // const SUGGESTION_PATTERNS = [
// // //   /(propose|suggère|suggestion|idée|donne|cherche|besoin|nouveau|proposition).{0,40}sujet/i,
// // //   /sujet.{0,30}(tfc|mémoire|projet|intéressant|possible)/i,
// // //   /thème.{0,20}sujet/i,
// // // ]

// // // function classifyQuestion(message: string): QuestionType {
// // //   const m = message.toLowerCase().trim()
// // //   if (m.length <= 60 && (SMALL_TALK.test(m) || ABOUT_BOT.test(m))) return 'general'
// // //   if (SUGGESTION_PATTERNS.some((p) => p.test(m))) return 'suggestion_sujet'
// // //   return 'specific_search'
// // // }

// // // // Une question de suivi courte (« et en 2023 ? ») est enrichie par la question précédente
// // // function buildSearchQuery(message: string, history: HistoryMessage[]): string {
// // //   const words = message.split(/\s+/).filter(Boolean)
// // //   if (words.length > 7) return message
// // //   const lastUser = [...history].reverse().find((m) => m.role === 'user')
// // //   return lastUser ? `${lastUser.content.slice(0, 200)} ${message}` : message
// // // }

// // // /* --------------------------------- Prompt --------------------------------- */

// // // const SYSTEM_PROMPT = `Tu es l'assistant de l'archive des TFC (Travaux de Fin de Cycle). Tu aides les étudiants à retrouver des travaux passés, à comprendre ce qui a déjà été fait et à choisir un sujet.

// // // RÈGLES
// // // - Pour parler des travaux existants, appuie-toi uniquement sur les TFC fournis ci-dessous. N'invente jamais un TFC, un titre, un auteur ou un ID.
// // // - Chaque fois que tu mentionnes un TFC, ajoute son ID entre parenthèses au format (ID:123). Pour en citer plusieurs : (ID:12) (ID:15).
// // // - Ne cite que des TFC réellement pertinents pour la demande. Si aucun ne l'est, dis-le franchement et propose de reformuler.
// // // - Tiens compte de l'historique de la conversation pour les questions de suivi.
// // // - Réponds en français, de façon claire et structurée (Markdown, titres ###, listes courtes). Va droit au but, sans répétitions.`

// // // const TYPE_INSTRUCTIONS: Record<QuestionType, string> = {
// // //   specific_search:
// // //     'Présente les travaux les plus pertinents (titre, auteur, année, technologies, ce qui les distingue). Signale ensuite les thèmes peu couverts si c’est utile.',
// // //   suggestion_sujet:
// // //     'L’étudiant cherche une idée de sujet. Analyse les TFC existants pour repérer les tendances et les lacunes, puis propose 1 à 3 sujets innovants et réalistes. Pour chacun : titre, problématique, objectifs, technologies suggérées, et ce qui le différencie des travaux existants (cités avec leur ID).',
// // //   general:
// // //     'C’est un message de conversation courante (salutation, remerciement, question sur ton rôle). Réponds brièvement. Si c’est utile, explique que tu peux rechercher des TFC par thème, technologie, auteur ou année, et proposer des sujets. Ne cite aucun TFC.',
// // // }

// // // function buildContext(candidates: TfcResult[]): string {
// // //   if (candidates.length === 0) return 'Aucun TFC trouvé pour cette demande.'
// // //   return candidates
// // //     .slice(0, CONTEXT_TFC)
// // //     .map((t) => {
// // //       const resume = (t.resume ?? 'Non disponible').toString().slice(0, 500)
// // //       return [
// // //         `[ID:${t.id}] ${t.titre}`,
// // //         `  Auteur: ${t.auteur || 'Non spécifié'} | Promoteur: ${t.promoteur || 'Non spécifié'} | Faculté: ${
// // //           t.facultes?.nom || 'Non spécifié'
// // //         } | Année: ${t.annees_academiques?.annee || 'Non spécifié'} | Pertinence: ${t.similarity}%`,
// // //         `  Technologies: ${(t.technologies || []).join(', ') || 'Non spécifié'}`,
// // //         `  Mots-clés: ${(t.mots_cles || []).join(', ') || 'Non spécifié'}`,
// // //         `  Résumé: ${resume}`,
// // //       ].join('\n')
// // //     })
// // //     .join('\n\n')
// // // }

// // // function buildMessages(
// // //   userMessage: string,
// // //   history: HistoryMessage[],
// // //   candidates: TfcResult[],
// // //   type: QuestionType
// // // ) {
// // //   const context =
// // //     type === 'general' ? '' : `\n\nTFC TROUVÉS (${candidates.length}) :\n${buildContext(candidates)}`
// // //   return [
// // //     { role: 'system', content: `${SYSTEM_PROMPT}\n\nCONSIGNE POUR CETTE DEMANDE\n${TYPE_INSTRUCTIONS[type]}${context}` },
// // //     ...history.map((m) => ({ role: m.role, content: m.content.slice(0, HISTORY_CHARS) })),
// // //     { role: 'user', content: userMessage },
// // //   ]
// // // }

// // // /* ------------------------------- Références ------------------------------- */

// // // function toReference(row: any, similarity: number | null): TFCReferencePayload {
// // //   return {
// // //     id: row.id,
// // //     titre: row.titre,
// // //     auteur: row.auteur || 'Non spécifié',
// // //     promoteur: row.promoteur || 'Non spécifié',
// // //     faculte: row.facultes?.nom || 'Non spécifié',
// // //     annee: row.annees_academiques?.annee || 'Non spécifié',
// // //     technologies: row.technologies || [],
// // //     resume: row.resume || 'Aucun résumé disponible',
// // //     similarity,
// // //   }
// // // }

// // // // Sources = TFC réellement cités par le modèle (ID:123). À défaut, les meilleurs résultats.
// // // function pickReferences(answer: string, candidates: TfcResult[]): TFCReferencePayload[] {
// // //   const cited = Array.from(new Set(Array.from(answer.matchAll(/ID\s*:\s*(\d+)/gi), (m) => Number(m[1]))))
// // //   const byId = new Map(candidates.map((c) => [c.id, c]))
// // //   const citedRows = cited.map((id) => byId.get(id)).filter((c): c is TfcResult => !!c)

// // //   const rows =
// // //     citedRows.length > 0
// // //       ? citedRows
// // //       : candidates.filter((c) => (c.similarity || 0) > MIN_SIMILARITY).slice(0, 8)

// // //   return rows.map((r) => toReference(r, r.similarity ?? 0))
// // // }

// // // /* ----------------------------- Base de données ---------------------------- */

// // // async function ownsConversation(userId: string, conversationId: number): Promise<boolean> {
// // //   const { data } = await supabase
// // //     .from('chat_conversations')
// // //     .select('id')
// // //     .eq('id', conversationId)
// // //     .eq('user_id', userId)
// // //     .maybeSingle()
// // //   return !!data
// // // }

// // // async function createConversation(userId: string, firstMessage: string): Promise<number> {
// // //   const { data, error } = await supabase
// // //     .from('chat_conversations')
// // //     .insert({
// // //       user_id: userId,
// // //       title: firstMessage.substring(0, 80) + (firstMessage.length > 80 ? '...' : ''),
// // //     })
// // //     .select('id')
// // //     .single()
// // //   if (error || !data) throw new Error(`Création de la conversation impossible : ${error?.message}`)
// // //   return data.id as number
// // // }

// // // async function loadHistory(conversationId: number): Promise<HistoryMessage[]> {
// // //   const { data } = await supabase
// // //     .from('chat_messages')
// // //     .select('role, content')
// // //     .eq('conversation_id', conversationId)
// // //     .order('created_at', { ascending: false })
// // //     .limit(HISTORY_LIMIT)
// // //   return ((data ?? []) as HistoryMessage[]).reverse()
// // // }

// // // async function saveAssistantMessage(conversationId: number, content: string, tfcIds: number[]) {
// // //   try {
// // //     const { data, error } = await supabase
// // //       .from('chat_messages')
// // //       .insert({
// // //         conversation_id: conversationId,
// // //         role: 'assistant',
// // //         content,
// // //         tfc_references: tfcIds.length > 0 ? tfcIds : null,
// // //       })
// // //       .select('id')
// // //       .single()
// // //     if (error) throw error

// // //     await supabase
// // //       .from('chat_conversations')
// // //       .update({ updated_at: new Date().toISOString() })
// // //       .eq('id', conversationId)

// // //     return data
// // //   } catch (err) {
// // //     console.error('❌ Sauvegarde de la réponse :', err)
// // //     return null
// // //   }
// // // }

// // // /* ---------------------------- Appel du modèle ---------------------------- */

// // // // Lit le flux SSE d'OpenRouter et transmet chaque morceau de texte
// // // async function streamCompletion(
// // //   messages: { role: string; content: string }[],
// // //   signal: AbortSignal,
// // //   onDelta: (text: string) => void
// // // ): Promise<void> {
// // //   const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
// // //     method: 'POST',
// // //     headers: {
// // //       Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
// // //       'Content-Type': 'application/json',
// // //       'HTTP-Referer': process.env.NEXTAUTH_URL || 'https://recherchetfc.vercel.app',
// // //       'X-Title': 'TFC Assistant',
// // //     },
// // //     body: JSON.stringify({
// // //       model: CHAT_MODEL,
// // //       messages,
// // //       stream: true,
// // //       max_tokens: 2500,
// // //       temperature: 0.6,
// // //       top_p: 0.9,
// // //     }),
// // //     signal,
// // //   })

// // //   if (!res.ok || !res.body) {
// // //     const detail = await res.text().catch(() => '')
// // //     console.error('❌ Erreur modèle de chat :', res.status, detail.slice(0, 300))
// // //     throw new Error(`Le modèle de réponse est indisponible (${res.status}).`)
// // //   }

// // //   const reader = res.body.getReader()
// // //   const decoder = new TextDecoder()
// // //   let buffer = ''

// // //   while (true) {
// // //     const { done, value } = await reader.read()
// // //     if (done) break
// // //     buffer += decoder.decode(value, { stream: true })

// // //     let newline: number
// // //     while ((newline = buffer.indexOf('\n')) !== -1) {
// // //       const line = buffer.slice(0, newline).trim()
// // //       buffer = buffer.slice(newline + 1)

// // //       // Les lignes de commentaire (": OPENROUTER PROCESSING") sont ignorées
// // //       if (!line.startsWith('data:')) continue
// // //       const payload = line.slice(5).trim()
// // //       if (payload === '[DONE]') return

// // //       let json: any
// // //       try {
// // //         json = JSON.parse(payload)
// // //       } catch {
// // //         continue
// // //       }
// // //       if (json.error) throw new Error(json.error.message ?? 'Erreur du modèle')
// // //       const delta = json.choices?.[0]?.delta?.content
// // //       if (typeof delta === 'string' && delta) onDelta(delta)
// // //     }
// // //   }
// // // }

// // // function fallbackAnswer(query: string, candidates: TfcResult[]): string {
// // //   const top = candidates.slice(0, 3)
// // //   return `🔍 **Résultats pour :** « ${query} »\n\nLe générateur de réponses est momentanément indisponible, mais voici les travaux les plus proches :\n\n${top
// // //     .map((t) => `- **${t.titre}** — ${t.auteur || 'Auteur non spécifié'} (${t.similarity}% de pertinence) (ID:${t.id})`)
// // //     .join('\n')}\n\n*Reformulez ou réessayez dans un instant pour une analyse détaillée.*`
// // // }

// // // /* ---------------------------------- POST ---------------------------------- */

// // // export async function POST(request: NextRequest) {
// // //   const user = await getSession()
// // //   if (!user) {
// // //     return NextResponse.json({ error: 'Non authentifié', success: false }, { status: 401 })
// // //   }

// // //   const body = await request.json().catch(() => null)
// // //   const message = typeof body?.message === 'string' ? body.message.trim() : ''
// // //   if (!message) {
// // //     return NextResponse.json({ error: 'Le message est requis', success: false }, { status: 400 })
// // //   }
// // //   if (message.length > MAX_MESSAGE_LENGTH) {
// // //     return NextResponse.json(
// // //       { error: `Le message est trop long (maximum ${MAX_MESSAGE_LENGTH} caractères).`, success: false },
// // //       { status: 400 }
// // //     )
// // //   }

// // //   const requestedId = Number(body?.conversationId) || undefined
// // //   let conversationId: number
// // //   let history: HistoryMessage[] = []
// // //   let userMessageId: number | null = null

// // //   try {
// // //     if (requestedId) {
// // //       if (!(await ownsConversation(user.id, requestedId))) {
// // //         return NextResponse.json({ error: 'Conversation introuvable', success: false }, { status: 404 })
// // //       }
// // //       conversationId = requestedId
// // //       history = await loadHistory(conversationId)
// // //     } else {
// // //       conversationId = await createConversation(user.id, message)
// // //     }

// // //     const { data: saved } = await supabase
// // //       .from('chat_messages')
// // //       .insert({ conversation_id: conversationId, role: 'user', content: message })
// // //       .select('id')
// // //       .single()
// // //     userMessageId = (saved?.id as number | undefined) ?? null
// // //   } catch (err: any) {
// // //     console.error('❌ Préparation de la conversation :', err)
// // //     return NextResponse.json(
// // //       { error: 'Erreur lors du traitement de votre message', details: err?.message, success: false },
// // //       { status: 500 }
// // //     )
// // //   }

// // //   const encoder = new TextEncoder()

// // //   const stream = new ReadableStream({
// // //     async start(controller) {
// // //       let closed = false
// // //       const send = (event: StreamEvent) => {
// // //         if (closed) return
// // //         try {
// // //           controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
// // //         } catch {
// // //           closed = true
// // //         }
// // //       }
// // //       const close = () => {
// // //         if (closed) return
// // //         closed = true
// // //         try {
// // //           controller.close()
// // //         } catch {
// // //           /* déjà fermé */
// // //         }
// // //       }

// // //       let answer = ''
// // //       let candidates: TfcResult[] = []

// // //       try {
// // //         send({ type: 'meta', conversationId })

// // //         const type = classifyQuestion(message)
// // //         if (type !== 'general') {
// // //           const { results } = await searchTFCs({
// // //             query: buildSearchQuery(message, history),
// // //             limit: SEARCH_LIMIT,
// // //             similarityThreshold: 0.1,
// // //           })
// // //           candidates = results
// // //         }

// // //         try {
// // //           await streamCompletion(buildMessages(message, history, candidates, type), request.signal, (text) => {
// // //             answer += text
// // //             send({ type: 'delta', text })
// // //           })
// // //         } catch (err) {
// // //           // Modèle indisponible avant la moindre réponse : on affiche au moins les résultats trouvés
// // //           if (!request.signal.aborted && !answer && candidates.length > 0) {
// // //             answer = fallbackAnswer(message, candidates)
// // //             send({ type: 'delta', text: answer })
// // //           } else {
// // //             throw err
// // //           }
// // //         }

// // //         if (!answer.trim()) throw new Error('Le modèle a renvoyé une réponse vide.')

// // //         const references = pickReferences(answer, candidates)
// // //         await saveAssistantMessage(conversationId, answer, references.map((r) => r.id))
// // //         send({ type: 'done', conversationId, references })
// // //       } catch (err: any) {
// // //         if (request.signal.aborted) {
// // //           // L'utilisateur a arrêté : on garde la réponse partielle pour que l'historique reste cohérent
// // //           if (answer.trim()) {
// // //             await saveAssistantMessage(conversationId, answer, pickReferences(answer, candidates).map((r) => r.id))
// // //           }
// // //         } else {
// // //           console.error('❌ Erreur chatbot :', err)
// // //           // Rien n'a été produit : on retire la question pour qu'un « Réessayer » ne la duplique pas
// // //           if (!answer.trim() && userMessageId !== null) {
// // //             await supabase.from('chat_messages').delete().eq('id', userMessageId)
// // //           }
// // //           send({
// // //             type: 'error',
// // //             message: err?.message || 'Erreur lors du traitement de votre message.',
// // //           })
// // //         }
// // //       } finally {
// // //         close()
// // //       }
// // //     },
// // //   })

// // //   return new Response(stream, {
// // //     headers: {
// // //       'Content-Type': 'application/x-ndjson; charset=utf-8',
// // //       'Cache-Control': 'no-store, no-transform',
// // //       'X-Accel-Buffering': 'no',
// // //     },
// // //   })
// // // }

// // // /* ----------------------------------- GET ---------------------------------- */

// // // const REFERENCE_SELECT =
// // //   'id, titre, auteur, promoteur, resume, technologies, facultes:faculte_id(nom), annees_academiques:annee_academique_id(annee)'

// // // export async function GET(request: NextRequest) {
// // //   try {
// // //     const user = await getSession()
// // //     if (!user) {
// // //       return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
// // //     }

// // //     const conversationParam = new URL(request.url).searchParams.get('conversationId')

// // //     if (conversationParam) {
// // //       const conversationId = parseInt(conversationParam, 10)
// // //       if (Number.isNaN(conversationId) || !(await ownsConversation(user.id, conversationId))) {
// // //         return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 })
// // //       }

// // //       const { data: messages, error } = await supabase
// // //         .from('chat_messages')
// // //         .select('*')
// // //         .eq('conversation_id', conversationId)
// // //         .order('created_at', { ascending: true })

// // //       if (error) {
// // //         console.error('❌ Récupération des messages :', error)
// // //         return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
// // //       }

// // //       const list = (messages ?? []) as any[]

// // //       // Sources des anciennes réponses (similarité inconnue : non stockée)
// // //       const ids = Array.from(new Set(list.flatMap((m) => (Array.isArray(m.tfc_references) ? m.tfc_references : []))))
// // //       const references: Record<number, TFCReferencePayload[]> = {}
// // //       if (ids.length > 0) {
// // //         const { data: tfcs } = await supabase.from('tfc').select(REFERENCE_SELECT).in('id', ids)
// // //         const byId = new Map<number, any>((tfcs ?? []).map((t: any) => [t.id as number, t]))
// // //         for (const m of list) {
// // //           if (m.role !== 'assistant' || !Array.isArray(m.tfc_references)) continue
// // //           const refs = (m.tfc_references as number[])
// // //             .map((id) => byId.get(id))
// // //             .filter(Boolean)
// // //             .map((row) => toReference(row, null))
// // //           if (refs.length > 0) references[m.id] = refs
// // //         }
// // //       }

// // //       return NextResponse.json({ messages: list, references, conversationId })
// // //     }

// // //     const { data: conversations, error } = await supabase
// // //       .from('chat_conversations')
// // //       .select('id, title, created_at, updated_at')
// // //       .eq('user_id', user.id)
// // //       .order('updated_at', { ascending: false })
// // //       .limit(100)

// // //     if (error) {
// // //       console.error('❌ Récupération des conversations :', error)
// // //       return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
// // //     }

// // //     const u = user as any
// // //     return NextResponse.json({
// // //       conversations: conversations || [],
// // //       user: {
// // //         id: u.id,
// // //         name: u.name,
// // //         email: u.email,
// // //         role: u.role,
// // //         profil_url: u.profil_url,
// // //       },
// // //     })
// // //   } catch (error) {
// // //     console.error('❌ Erreur API chat :', error)
// // //     return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
// // //   }
// // // }

// // // app/api/chat/route.ts
// // /* eslint-disable @typescript-eslint/no-explicit-any */
// // import { NextRequest, NextResponse } from 'next/server'
// // import { supabase } from '@/lib/supabase'
// // import { getSession } from '@/utils/session'
// // import { searchTFCs, type TfcResult } from '@/lib/tfc-search'

// // export const runtime = 'nodejs'
// // export const maxDuration = 60

// // /* -------------------------------- Constantes ------------------------------ */

// // const CHAT_MODEL = process.env.CHAT_MODEL ?? 'deepseek/deepseek-v4.1-flash'
// // const MAX_MESSAGE_LENGTH = 2000
// // const HISTORY_LIMIT = 8 // derniers messages envoyés au modèle
// // const HISTORY_CHARS = 1500 // longueur max par message d'historique
// // const SEARCH_LIMIT = 20
// // const CONTEXT_TFC = 15 // TFC donnés au modèle (≤ SEARCH_LIMIT)
// // const MIN_SIMILARITY = 5 // seuil (%) pour les sources quand le modèle n'en cite aucune
// // const COUNT_CACHE_MS = 10 * 60 * 1000

// // type QuestionType = 'general' | 'suggestion_sujet' | 'specific_search'
// // type ChatRole = 'user' | 'assistant'

// // interface HistoryMessage {
// //   role: ChatRole
// //   content: string
// // }

// // type StreamEvent =
// //   | { type: 'meta'; conversationId: number }
// //   | { type: 'delta'; text: string }
// //   | { type: 'done'; conversationId: number; references: TFCReferencePayload[] }
// //   | { type: 'error'; message: string }

// // interface TFCReferencePayload {
// //   id: number
// //   titre: string
// //   auteur: string
// //   promoteur: string
// //   faculte: string
// //   annee: string
// //   technologies: string[]
// //   resume: string
// //   similarity: number | null
// // }

// // /* ----------------------------- Classification ----------------------------- */

// // // Message entièrement composé de formules de politesse
// // const SMALL_TALK =
// //   /^(?:(?:bonjour|bonsoir|salut|coucou|hello|hi|hey|merci(?: beaucoup)?|thanks|ok|d'accord|super|parfait|au revoir|bye|à bientôt|a bientot)[\s!.,?]*)+$/i
// // const ABOUT_BOT =
// //   /(qui es[- ]tu|tu es qui|présente[- ]toi|ton rôle|que peux[- ]tu faire|comment (ça )?(marche|fonctionne))/i
// // const SUGGESTION_PATTERNS = [
// //   /(propose|suggère|suggestion|idée|donne|cherche|besoin|nouveau|proposition).{0,40}sujet/i,
// //   /sujet.{0,30}(tfc|mémoire|projet|intéressant|possible)/i,
// //   /thème.{0,20}sujet/i,
// // ]

// // function classifyQuestion(message: string): QuestionType {
// //   const m = message.toLowerCase().trim()
// //   if (m.length <= 60 && (SMALL_TALK.test(m) || ABOUT_BOT.test(m))) return 'general'
// //   if (SUGGESTION_PATTERNS.some((p) => p.test(m))) return 'suggestion_sujet'
// //   return 'specific_search'
// // }

// // // Une question de suivi courte (« et en 2023 ? ») est enrichie par la question précédente
// // function buildSearchQuery(message: string, history: HistoryMessage[]): string {
// //   const words = message.split(/\s+/).filter(Boolean)
// //   if (words.length > 7) return message
// //   const lastUser = [...history].reverse().find((m) => m.role === 'user')
// //   return lastUser ? `${lastUser.content.slice(0, 200)} ${message}` : message
// // }

// // /* ------------------------------ Taille archive ----------------------------- */

// // let cachedTotal: { value: number; at: number } | null = null

// // // Nombre réel de TFC dans l'archive (mis en cache pour ne pas recompter à chaque message)
// // async function getTotalTfc(): Promise<number | null> {
// //   if (cachedTotal && Date.now() - cachedTotal.at < COUNT_CACHE_MS) return cachedTotal.value
// //   try {
// //     const { count, error } = await supabase.from('tfc').select('id', { count: 'exact', head: true })
// //     if (error || count === null) return cachedTotal?.value ?? null
// //     cachedTotal = { value: count, at: Date.now() }
// //     return count
// //   } catch {
// //     return cachedTotal?.value ?? null
// //   }
// // }

// // /* --------------------------------- Prompt --------------------------------- */

// // const SYSTEM_PROMPT = `Tu es l'assistant de l'archive des TFC (Travaux de Fin de Cycle). Tu aides les étudiants à retrouver des travaux passés, à comprendre ce qui a déjà été fait et à choisir un sujet.

// // RÈGLES
// // - Pour parler des travaux existants, appuie-toi uniquement sur les TFC fournis ci-dessous. N'invente jamais un TFC, un titre, un auteur ou un ID.
// // - Les TFC fournis ne sont qu'un extrait de l'archive : ce sont les résultats d'une recherche, pas la liste complète. Ne déduis jamais la taille de l'archive du nombre de TFC listés ; si on te la demande, utilise le total indiqué ci-dessous.
// // - Si aucun TFC fourni ne correspond à la demande, dis : « Je n'ai trouvé aucun TFC correspondant dans les résultats de la recherche ». N'affirme jamais qu'un sujet n'existe pas dans l'archive, et ne présente pas de travaux sans rapport pour combler. Propose plutôt de reformuler (synonymes, termes en anglais, technologie précise).
// // - Chaque fois que tu mentionnes un TFC, ajoute son ID entre parenthèses au format (ID:123). Pour en citer plusieurs : (ID:12) (ID:15).
// // - Ne cite que des TFC réellement pertinents pour la demande.
// // - Tiens compte de l'historique de la conversation pour les questions de suivi.
// // - Réponds en français, de façon claire et structurée. Va droit au but, sans répétitions.

// // FORMAT
// // - Écris du Markdown directement, sans jamais l'entourer d'un bloc de code (pas de \`\`\`).
// // - Titres au format « ### Titre » (espace après les #), listes avec « - », mots importants en **gras**.
// // - Laisse une ligne vide avant chaque titre et chaque liste.`

// // const TYPE_INSTRUCTIONS: Record<QuestionType, string> = {
// //   specific_search:
// //     'Présente les travaux les plus pertinents (titre, auteur, année, technologies, ce qui les distingue). Signale ensuite les thèmes peu couverts si c’est utile.',
// //   suggestion_sujet:
// //     'L’étudiant cherche une idée de sujet. Analyse les TFC existants pour repérer les tendances et les lacunes, puis propose 1 à 3 sujets innovants et réalistes. Pour chacun : titre, problématique, objectifs, technologies suggérées, et ce qui le différencie des travaux existants (cités avec leur ID).',
// //   general:
// //     'C’est un message de conversation courante (salutation, remerciement, question sur ton rôle). Réponds brièvement. Si c’est utile, explique que tu peux rechercher des TFC par thème, technologie, auteur ou année, et proposer des sujets. Ne cite aucun TFC.',
// // }

// // function buildContext(candidates: TfcResult[]): string {
// //   return candidates
// //     .slice(0, CONTEXT_TFC)
// //     .map((t) => {
// //       const resume = (t.resume ?? 'Non disponible').toString().slice(0, 500)
// //       return [
// //         `[ID:${t.id}] ${t.titre}`,
// //         `  Auteur: ${t.auteur || 'Non spécifié'} | Promoteur: ${t.promoteur || 'Non spécifié'} | Faculté: ${
// //           t.facultes?.nom || 'Non spécifié'
// //         } | Année: ${t.annees_academiques?.annee || 'Non spécifié'} | Pertinence: ${t.similarity}%`,
// //         `  Technologies: ${(t.technologies || []).join(', ') || 'Non spécifié'}`,
// //         `  Mots-clés: ${(t.mots_cles || []).join(', ') || 'Non spécifié'}`,
// //         `  Résumé: ${resume}`,
// //       ].join('\n')
// //     })
// //     .join('\n\n')
// // }

// // function buildMessages(
// //   userMessage: string,
// //   history: HistoryMessage[],
// //   candidates: TfcResult[],
// //   type: QuestionType,
// //   totalTfc: number | null
// // ) {
// //   let context = ''
// //   if (type !== 'general') {
// //     const shown = Math.min(candidates.length, CONTEXT_TFC)
// //     const archive = totalTfc ? `L'archive complète contient ${totalTfc} TFC.` : "L'archive contient de nombreux TFC."
// //     context =
// //       shown === 0
// //         ? `\n\n${archive} La recherche n'a retourné aucun TFC pour cette demande.`
// //         : `\n\n${archive} Voici les ${shown} TFC les plus proches de la demande (résultats de recherche, pas la liste complète) :\n${buildContext(
// //             candidates
// //           )}`
// //   }
// //   return [
// //     { role: 'system', content: `${SYSTEM_PROMPT}\n\nCONSIGNE POUR CETTE DEMANDE\n${TYPE_INSTRUCTIONS[type]}${context}` },
// //     ...history.map((m) => ({ role: m.role, content: m.content.slice(0, HISTORY_CHARS) })),
// //     { role: 'user', content: userMessage },
// //   ]
// // }

// // /* ------------------------------- Références ------------------------------- */

// // function toReference(row: any, similarity: number | null): TFCReferencePayload {
// //   return {
// //     id: row.id,
// //     titre: row.titre,
// //     auteur: row.auteur || 'Non spécifié',
// //     promoteur: row.promoteur || 'Non spécifié',
// //     faculte: row.facultes?.nom || 'Non spécifié',
// //     annee: row.annees_academiques?.annee || 'Non spécifié',
// //     technologies: row.technologies || [],
// //     resume: row.resume || 'Aucun résumé disponible',
// //     similarity,
// //   }
// // }

// // // Sources = TFC réellement cités par le modèle (ID:123). À défaut, les meilleurs résultats.
// // function pickReferences(answer: string, candidates: TfcResult[]): TFCReferencePayload[] {
// //   const cited = Array.from(new Set(Array.from(answer.matchAll(/ID\s*:\s*(\d+)/gi), (m) => Number(m[1]))))
// //   const byId = new Map(candidates.map((c) => [c.id, c]))
// //   const citedRows = cited.map((id) => byId.get(id)).filter((c): c is TfcResult => !!c)

// //   const rows =
// //     citedRows.length > 0
// //       ? citedRows
// //       : candidates.filter((c) => (c.similarity || 0) > MIN_SIMILARITY).slice(0, 8)

// //   return rows.map((r) => toReference(r, r.similarity ?? 0))
// // }

// // /* ----------------------------- Base de données ---------------------------- */

// // async function ownsConversation(userId: string, conversationId: number): Promise<boolean> {
// //   const { data } = await supabase
// //     .from('chat_conversations')
// //     .select('id')
// //     .eq('id', conversationId)
// //     .eq('user_id', userId)
// //     .maybeSingle()
// //   return !!data
// // }

// // async function createConversation(userId: string, firstMessage: string): Promise<number> {
// //   const { data, error } = await supabase
// //     .from('chat_conversations')
// //     .insert({
// //       user_id: userId,
// //       title: firstMessage.substring(0, 80) + (firstMessage.length > 80 ? '...' : ''),
// //     })
// //     .select('id')
// //     .single()
// //   if (error || !data) throw new Error(`Création de la conversation impossible : ${error?.message}`)
// //   return data.id as number
// // }

// // async function loadHistory(conversationId: number): Promise<HistoryMessage[]> {
// //   const { data } = await supabase
// //     .from('chat_messages')
// //     .select('role, content')
// //     .eq('conversation_id', conversationId)
// //     .order('created_at', { ascending: false })
// //     .limit(HISTORY_LIMIT)
// //   return ((data ?? []) as HistoryMessage[]).reverse()
// // }

// // async function saveAssistantMessage(conversationId: number, content: string, tfcIds: number[]) {
// //   try {
// //     const { data, error } = await supabase
// //       .from('chat_messages')
// //       .insert({
// //         conversation_id: conversationId,
// //         role: 'assistant',
// //         content,
// //         tfc_references: tfcIds.length > 0 ? tfcIds : null,
// //       })
// //       .select('id')
// //       .single()
// //     if (error) throw error

// //     await supabase
// //       .from('chat_conversations')
// //       .update({ updated_at: new Date().toISOString() })
// //       .eq('id', conversationId)

// //     return data
// //   } catch (err) {
// //     console.error('❌ Sauvegarde de la réponse :', err)
// //     return null
// //   }
// // }

// // /* ---------------------------- Appel du modèle ---------------------------- */

// // // Lit le flux SSE d'OpenRouter et transmet chaque morceau de texte
// // async function streamCompletion(
// //   messages: { role: string; content: string }[],
// //   signal: AbortSignal,
// //   onDelta: (text: string) => void
// // ): Promise<void> {
// //   const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
// //     method: 'POST',
// //     headers: {
// //       Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
// //       'Content-Type': 'application/json',
// //       'HTTP-Referer': process.env.NEXTAUTH_URL || 'https://recherchetfc.vercel.app',
// //       'X-Title': 'TFC Assistant',
// //     },
// //     body: JSON.stringify({
// //       model: CHAT_MODEL,
// //       messages,
// //       stream: true,
// //       max_tokens: 2500,
// //       temperature: 0.6,
// //       top_p: 0.9,
// //     }),
// //     signal,
// //   })

// //   if (!res.ok || !res.body) {
// //     const detail = await res.text().catch(() => '')
// //     console.error('❌ Erreur modèle de chat :', res.status, detail.slice(0, 300))
// //     throw new Error(`Le modèle de réponse est indisponible (${res.status}).`)
// //   }

// //   const reader = res.body.getReader()
// //   const decoder = new TextDecoder()
// //   let buffer = ''

// //   while (true) {
// //     const { done, value } = await reader.read()
// //     if (done) break
// //     buffer += decoder.decode(value, { stream: true })

// //     let newline: number
// //     while ((newline = buffer.indexOf('\n')) !== -1) {
// //       const line = buffer.slice(0, newline).trim()
// //       buffer = buffer.slice(newline + 1)

// //       // Les lignes de commentaire (": OPENROUTER PROCESSING") sont ignorées
// //       if (!line.startsWith('data:')) continue
// //       const payload = line.slice(5).trim()
// //       if (payload === '[DONE]') return

// //       let json: any
// //       try {
// //         json = JSON.parse(payload)
// //       } catch {
// //         continue
// //       }
// //       if (json.error) throw new Error(json.error.message ?? 'Erreur du modèle')
// //       const delta = json.choices?.[0]?.delta?.content
// //       if (typeof delta === 'string' && delta) onDelta(delta)
// //     }
// //   }
// // }

// // function fallbackAnswer(query: string, candidates: TfcResult[]): string {
// //   const top = candidates.slice(0, 3)
// //   return `🔍 **Résultats pour :** « ${query} »\n\nLe générateur de réponses est momentanément indisponible, mais voici les travaux les plus proches :\n\n${top
// //     .map((t) => `- **${t.titre}** — ${t.auteur || 'Auteur non spécifié'} (${t.similarity}% de pertinence) (ID:${t.id})`)
// //     .join('\n')}\n\n*Reformulez ou réessayez dans un instant pour une analyse détaillée.*`
// // }

// // /* ---------------------------------- POST ---------------------------------- */

// // export async function POST(request: NextRequest) {
// //   const user = await getSession()
// //   if (!user) {
// //     return NextResponse.json({ error: 'Non authentifié', success: false }, { status: 401 })
// //   }

// //   const body = await request.json().catch(() => null)
// //   const message = typeof body?.message === 'string' ? body.message.trim() : ''
// //   if (!message) {
// //     return NextResponse.json({ error: 'Le message est requis', success: false }, { status: 400 })
// //   }
// //   if (message.length > MAX_MESSAGE_LENGTH) {
// //     return NextResponse.json(
// //       { error: `Le message est trop long (maximum ${MAX_MESSAGE_LENGTH} caractères).`, success: false },
// //       { status: 400 }
// //     )
// //   }

// //   const requestedId = Number(body?.conversationId) || undefined
// //   let conversationId: number
// //   let history: HistoryMessage[] = []
// //   let userMessageId: number | null = null

// //   try {
// //     if (requestedId) {
// //       if (!(await ownsConversation(user.id, requestedId))) {
// //         return NextResponse.json({ error: 'Conversation introuvable', success: false }, { status: 404 })
// //       }
// //       conversationId = requestedId
// //       history = await loadHistory(conversationId)
// //     } else {
// //       conversationId = await createConversation(user.id, message)
// //     }

// //     const { data: saved } = await supabase
// //       .from('chat_messages')
// //       .insert({ conversation_id: conversationId, role: 'user', content: message })
// //       .select('id')
// //       .single()
// //     userMessageId = (saved?.id as number | undefined) ?? null
// //   } catch (err: any) {
// //     console.error('❌ Préparation de la conversation :', err)
// //     return NextResponse.json(
// //       { error: 'Erreur lors du traitement de votre message', details: err?.message, success: false },
// //       { status: 500 }
// //     )
// //   }

// //   const encoder = new TextEncoder()

// //   const stream = new ReadableStream({
// //     async start(controller) {
// //       let closed = false
// //       const send = (event: StreamEvent) => {
// //         if (closed) return
// //         try {
// //           controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
// //         } catch {
// //           closed = true
// //         }
// //       }
// //       const close = () => {
// //         if (closed) return
// //         closed = true
// //         try {
// //           controller.close()
// //         } catch {
// //           /* déjà fermé */
// //         }
// //       }

// //       let answer = ''
// //       let candidates: TfcResult[] = []

// //       try {
// //         send({ type: 'meta', conversationId })

// //         const type = classifyQuestion(message)
// //         let totalTfc: number | null = null

// //         if (type !== 'general') {
// //           // Recherche et comptage en parallèle
// //           const [search, total] = await Promise.all([
// //             searchTFCs({
// //               query: buildSearchQuery(message, history),
// //               limit: SEARCH_LIMIT,
// //               similarityThreshold: 0.1,
// //             }),
// //             getTotalTfc(),
// //           ])
// //           candidates = search.results
// //           totalTfc = total
// //         }

// //         try {
// //           await streamCompletion(
// //             buildMessages(message, history, candidates, type, totalTfc),
// //             request.signal,
// //             (text) => {
// //               answer += text
// //               send({ type: 'delta', text })
// //             }
// //           )
// //         } catch (err) {
// //           // Modèle indisponible avant la moindre réponse : on affiche au moins les résultats trouvés
// //           if (!request.signal.aborted && !answer && candidates.length > 0) {
// //             answer = fallbackAnswer(message, candidates)
// //             send({ type: 'delta', text: answer })
// //           } else {
// //             throw err
// //           }
// //         }

// //         if (!answer.trim()) throw new Error('Le modèle a renvoyé une réponse vide.')

// //         const references = pickReferences(answer, candidates)
// //         await saveAssistantMessage(conversationId, answer, references.map((r) => r.id))
// //         send({ type: 'done', conversationId, references })
// //       } catch (err: any) {
// //         if (request.signal.aborted) {
// //           // L'utilisateur a arrêté : on garde la réponse partielle pour que l'historique reste cohérent
// //           if (answer.trim()) {
// //             await saveAssistantMessage(conversationId, answer, pickReferences(answer, candidates).map((r) => r.id))
// //           }
// //         } else {
// //           console.error('❌ Erreur chatbot :', err)
// //           // Rien n'a été produit : on retire la question pour qu'un « Réessayer » ne la duplique pas
// //           if (!answer.trim() && userMessageId !== null) {
// //             await supabase.from('chat_messages').delete().eq('id', userMessageId)
// //           }
// //           send({
// //             type: 'error',
// //             message: err?.message || 'Erreur lors du traitement de votre message.',
// //           })
// //         }
// //       } finally {
// //         close()
// //       }
// //     },
// //   })

// //   return new Response(stream, {
// //     headers: {
// //       'Content-Type': 'application/x-ndjson; charset=utf-8',
// //       'Cache-Control': 'no-store, no-transform',
// //       'X-Accel-Buffering': 'no',
// //     },
// //   })
// // }

// // /* ----------------------------------- GET ---------------------------------- */

// // const REFERENCE_SELECT =
// //   'id, titre, auteur, promoteur, resume, technologies, facultes:faculte_id(nom), annees_academiques:annee_academique_id(annee)'

// // export async function GET(request: NextRequest) {
// //   try {
// //     const user = await getSession()
// //     if (!user) {
// //       return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
// //     }

// //     const conversationParam = new URL(request.url).searchParams.get('conversationId')

// //     if (conversationParam) {
// //       const conversationId = parseInt(conversationParam, 10)
// //       if (Number.isNaN(conversationId) || !(await ownsConversation(user.id, conversationId))) {
// //         return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 })
// //       }

// //       const { data: messages, error } = await supabase
// //         .from('chat_messages')
// //         .select('*')
// //         .eq('conversation_id', conversationId)
// //         .order('created_at', { ascending: true })

// //       if (error) {
// //         console.error('❌ Récupération des messages :', error)
// //         return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
// //       }

// //       const list = (messages ?? []) as any[]

// //       // Sources des anciennes réponses (similarité inconnue : non stockée)
// //       const ids = Array.from(new Set(list.flatMap((m) => (Array.isArray(m.tfc_references) ? m.tfc_references : []))))
// //       const references: Record<number, TFCReferencePayload[]> = {}
// //       if (ids.length > 0) {
// //         const { data: tfcs } = await supabase.from('tfc').select(REFERENCE_SELECT).in('id', ids)
// //         const byId = new Map<number, any>((tfcs ?? []).map((t: any) => [t.id as number, t]))
// //         for (const m of list) {
// //           if (m.role !== 'assistant' || !Array.isArray(m.tfc_references)) continue
// //           const refs = (m.tfc_references as number[])
// //             .map((id) => byId.get(id))
// //             .filter(Boolean)
// //             .map((row) => toReference(row, null))
// //           if (refs.length > 0) references[m.id] = refs
// //         }
// //       }

// //       return NextResponse.json({ messages: list, references, conversationId })
// //     }

// //     const { data: conversations, error } = await supabase
// //       .from('chat_conversations')
// //       .select('id, title, created_at, updated_at')
// //       .eq('user_id', user.id)
// //       .order('updated_at', { ascending: false })
// //       .limit(100)

// //     if (error) {
// //       console.error('❌ Récupération des conversations :', error)
// //       return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
// //     }

// //     const u = user as any
// //     return NextResponse.json({
// //       conversations: conversations || [],
// //       user: {
// //         id: u.id,
// //         name: u.name,
// //         email: u.email,
// //         role: u.role,
// //         profil_url: u.profil_url,
// //       },
// //     })
// //   } catch (error) {
// //     console.error('❌ Erreur API chat :', error)
// //     return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
// //   }
// // }

// // app/api/chat/route.ts
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextRequest, NextResponse } from 'next/server'
// import { supabase } from '@/lib/supabase'
// import { getSession } from '@/utils/session'
// import { searchTFCs, type TfcResult } from '@/lib/tfc-search'

// export const runtime = 'nodejs'
// export const maxDuration = 60

// /* -------------------------------- Constantes ------------------------------ */

// const CHAT_MODEL = process.env.CHAT_MODEL ?? 'deepseek/deepseek-v4.1-flash'
// // Modèle de secours (optionnel) : utilisé si le premier échoue avant d'avoir répondu
// const FALLBACK_MODEL = process.env.CHAT_FALLBACK_MODEL
// const MAX_MESSAGE_LENGTH = 2000
// const HISTORY_LIMIT = 8 // derniers messages envoyés au modèle
// const HISTORY_CHARS = 1500 // longueur max par message d'historique
// const SEARCH_LIMIT = 20
// const CONTEXT_TFC = 15 // TFC donnés au modèle (≤ SEARCH_LIMIT)
// const HISTORY_CITED_MAX = 5 // TFC cités plus tôt dans la conversation et gardés en contexte
// const MIN_SIMILARITY = 5 // seuil (%) pour les sources quand le modèle n'en cite aucune
// const COUNT_CACHE_MS = 10 * 60 * 1000

// // Limite de débit (en mémoire : par instance serveur, suffisant contre les rafales)
// const RATE_LIMIT = 12
// const RATE_WINDOW_MS = 60_000

// type QuestionType = 'general' | 'suggestion_sujet' | 'specific_search'
// type ChatRole = 'user' | 'assistant'

// // TFC fourni au modèle. `fromHistory` : cité plus tôt dans la conversation (pas de score de similarité)
// type Candidate = TfcResult & { fromHistory?: boolean }

// interface HistoryMessage {
//   role: ChatRole
//   content: string
// }

// type StreamEvent =
//   | { type: 'meta'; conversationId: number }
//   | { type: 'delta'; text: string }
//   | { type: 'done'; conversationId: number; references: TFCReferencePayload[] }
//   | { type: 'error'; message: string }

// interface TFCReferencePayload {
//   id: number
//   titre: string
//   auteur: string
//   promoteur: string
//   faculte: string
//   annee: string
//   technologies: string[]
//   resume: string
//   similarity: number | null
// }

// const REFERENCE_SELECT =
//   'id, titre, auteur, promoteur, resume, technologies, facultes:faculte_id(nom), annees_academiques:annee_academique_id(annee)'

// /* ------------------------------ Limite de débit ---------------------------- */

// const hits = new Map<string, number[]>()

// function isRateLimited(userId: string): boolean {
//   const now = Date.now()
//   const recent = (hits.get(userId) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
//   if (recent.length >= RATE_LIMIT) {
//     hits.set(userId, recent)
//     return true
//   }
//   recent.push(now)
//   hits.set(userId, recent)

//   // Nettoyage occasionnel pour ne pas faire grossir la Map
//   if (hits.size > 5000) {
//     hits.forEach((times, key) => {
//       if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key)
//     })
//   }
//   return false
// }

// /* ----------------------------- Classification ----------------------------- */

// // Message entièrement composé de formules de politesse
// const SMALL_TALK =
//   /^(?:(?:bonjour|bonsoir|salut|coucou|hello|hi|hey|merci(?: beaucoup)?|thanks|ok|d'accord|super|parfait|au revoir|bye|à bientôt|a bientot)[\s!.,?]*)+$/i
// const ABOUT_BOT =
//   /(qui es[- ]tu|tu es qui|présente[- ]toi|ton rôle|que peux[- ]tu faire|comment (ça )?(marche|fonctionne))/i
// const SUGGESTION_PATTERNS = [
//   /(propose|suggère|suggestion|idée|donne|cherche|besoin|nouveau|proposition|inspire|recommande).{0,40}(sujet|thème|idée)/i,
//   /(quel|quels|quelle).{0,20}(sujet|thème)/i,
//   /sujet.{0,30}(tfc|mémoire|projet|intéressant|possible|original|innovant)/i,
//   /thème.{0,20}sujet/i,
//   /(que|quoi) (faire|traiter|choisir).{0,30}(tfc|mémoire|projet)/i,
//   /(j'hésite|je ne sais pas).{0,40}(sujet|thème|tfc)/i,
// ]
// // « un autre ? », « plus original », « encore une idée » : demande de nouvelles propositions
// const MORE_IDEAS = /(autre|encore|différent|plus (original|innovant|simple|réaliste|ambitieux))/i

// function baseClassify(message: string): QuestionType {
//   const m = message.toLowerCase().trim()
//   if (m.length <= 60 && (SMALL_TALK.test(m) || ABOUT_BOT.test(m))) return 'general'
//   if (SUGGESTION_PATTERNS.some((p) => p.test(m))) return 'suggestion_sujet'
//   return 'specific_search'
// }

// function classifyQuestion(message: string, history: HistoryMessage[]): QuestionType {
//   const base = baseClassify(message)
//   if (base !== 'specific_search') return base

//   // Question de suivi courte après une demande de sujet : on reste en mode « suggestion »
//   const words = message.split(/\s+/).filter(Boolean).length
//   if (words <= 8 && MORE_IDEAS.test(message)) {
//     const lastUser = [...history].reverse().find((m) => m.role === 'user')
//     if (lastUser && baseClassify(lastUser.content) === 'suggestion_sujet') return 'suggestion_sujet'
//   }
//   return base
// }

// // Une question de suivi courte (« et en 2023 ? ») est enrichie par la question précédente
// function buildSearchQuery(message: string, history: HistoryMessage[]): string {
//   const words = message.split(/\s+/).filter(Boolean)
//   if (words.length > 7) return message
//   const lastUser = [...history].reverse().find((m) => m.role === 'user')
//   return lastUser ? `${lastUser.content.slice(0, 200)} ${message}` : message
// }

// /* ------------------------------ Taille archive ----------------------------- */

// let cachedTotal: { value: number; at: number } | null = null

// // Nombre réel de TFC dans l'archive (mis en cache pour ne pas recompter à chaque message)
// async function getTotalTfc(): Promise<number | null> {
//   if (cachedTotal && Date.now() - cachedTotal.at < COUNT_CACHE_MS) return cachedTotal.value
//   try {
//     const { count, error } = await supabase.from('tfc').select('id', { count: 'exact', head: true })
//     if (error || count === null) return cachedTotal?.value ?? null
//     cachedTotal = { value: count, at: Date.now() }
//     return count
//   } catch {
//     return cachedTotal?.value ?? null
//   }
// }

// /* ------------------------- TFC cités plus tôt (suivi) ---------------------- */

// // « Parle-moi plus du deuxième » : les TFC cités dans les dernières réponses restent en contexte,
// // même si la recherche de la question de suivi ne les remonte plus.
// async function loadCitedFromHistory(history: HistoryMessage[], exclude: Set<number>): Promise<Candidate[]> {
//   const ids: number[] = []
//   const recentAssistant = [...history].reverse().filter((m) => m.role === 'assistant').slice(0, 2)
//   for (const m of recentAssistant) {
//     const idPattern = /ID\s*:\s*(\d+)/gi
//     let match: RegExpExecArray | null
//     while ((match = idPattern.exec(m.content)) !== null) {
//       const id = Number(match[1])
//       if (!exclude.has(id) && !ids.includes(id)) ids.push(id)
//     }
//   }
//   const wanted = ids.slice(0, HISTORY_CITED_MAX)
//   if (wanted.length === 0) return []

//   try {
//     const { data } = await supabase.from('tfc').select(REFERENCE_SELECT).in('id', wanted)
//     return (data ?? [])
//       .sort((a: any, b: any) => wanted.indexOf(a.id) - wanted.indexOf(b.id))
//       .map((row: any) => ({ ...row, similarity: null, fromHistory: true }) as unknown as Candidate)
//   } catch (err) {
//     console.error('❌ TFC cités dans l’historique :', err)
//     return []
//   }
// }

// /* --------------------------------- Prompt --------------------------------- */

// const SYSTEM_PROMPT = `Tu es l'assistant de l'archive des TFC (Travaux de Fin de Cycle). Tu aides les étudiants à retrouver des travaux passés, à comprendre ce qui a déjà été fait et à choisir un sujet.

// RÈGLES
// - Pour parler des travaux existants, appuie-toi uniquement sur les TFC fournis ci-dessous. N'invente jamais un TFC, un titre, un auteur ou un ID.
// - Les TFC fournis ne sont qu'un extrait de l'archive : ce sont les résultats d'une recherche, pas la liste complète. Ne déduis jamais la taille de l'archive du nombre de TFC listés ; si on te la demande, utilise le total indiqué ci-dessous.
// - Si aucun TFC fourni ne correspond à la demande, dis : « Je n'ai trouvé aucun TFC correspondant dans les résultats de la recherche ». N'affirme jamais qu'un sujet n'existe pas dans l'archive, et ne présente pas de travaux sans rapport pour combler. Propose plutôt de reformuler (synonymes, termes en anglais, technologie précise).
// - Chaque fois que tu mentionnes un TFC, ajoute son ID entre parenthèses au format (ID:123). Pour en citer plusieurs : (ID:12) (ID:15). Ces ID apparaissent aussi dans le panneau « Sources » de l'étudiant.
// - Ne cite que des TFC réellement pertinents pour la demande.
// - Tiens compte de l'historique de la conversation pour les questions de suivi.
// - Réponds en français, de façon claire et structurée. Va droit au but, sans répétitions.

// DÉMARCATION OBLIGATOIRE
// Chaque fois que tu proposes quelque chose de nouveau (un sujet, une idée, une amélioration, un angle de recherche, une combinaison de technologies), tu dois situer ta proposition par rapport à l'existant. Termine chaque proposition par un bloc « **Démarcation par rapport à l'existant** » qui indique :
// - les TFC les plus proches, cités avec leur ID, et ce qu'ils couvrent déjà ;
// - ce que ta proposition apporte de différent (problématique, public cible, jeu de données, méthode, technologies, périmètre) ;
// - le niveau de recouvrement avec l'existant : faible, moyen ou élevé.
// Si le recouvrement est élevé, adapte la proposition pour qu'elle se démarque réellement. Si aucun TFC fourni n'est proche, dis-le sans affirmer que le sujet n'a jamais été traité, et conseille de vérifier avec une recherche plus précise. Avec plusieurs propositions, fais une démarcation par proposition. N'invente jamais un TFC pour illustrer une ressemblance.

// FORMAT
// - Écris du Markdown directement, sans jamais l'entourer d'un bloc de code (pas de \`\`\`).
// - Titres au format « ### Titre » (espace après les #), listes avec « - », mots importants en **gras**.
// - Laisse une ligne vide avant chaque titre et chaque liste.`

// const TYPE_INSTRUCTIONS: Record<QuestionType, string> = {
//   specific_search:
//     'Présente les travaux les plus pertinents (titre, auteur, année, technologies, ce qui les distingue). Signale ensuite les thèmes peu couverts si c’est utile. Si l’étudiant semble vouloir traiter un sujet proche de ces travaux, explique comment s’en démarquer (bloc « Démarcation par rapport à l’existant »).',
//   suggestion_sujet:
//     'L’étudiant cherche une idée de sujet. Analyse d’abord les TFC existants pour repérer les tendances et les lacunes, puis propose 1 à 3 sujets innovants et réalistes. Pour chaque sujet, utilise cette structure : un titre en « ### », puis la problématique, les objectifs, les technologies suggérées, et enfin le bloc « **Démarcation par rapport à l’existant** » (TFC les plus proches avec leur ID, apport différenciant, niveau de recouvrement). La démarcation est obligatoire pour chaque sujet.',
//   general:
//     'C’est un message de conversation courante (salutation, remerciement, question sur ton rôle). Réponds brièvement. Si c’est utile, explique que tu peux rechercher des TFC par thème, technologie, auteur ou année, et proposer des sujets en les situant par rapport aux travaux existants. Ne cite aucun TFC.',
// }

// function buildContext(candidates: Candidate[]): string {
//   return candidates
//     .slice(0, CONTEXT_TFC)
//     .map((t) => {
//       const resume = (t.resume ?? 'Non disponible').toString().slice(0, 500)
//       const pertinence = t.fromHistory
//         ? 'non calculée (cité plus tôt dans la conversation)'
//         : `${t.similarity}%`
//       return [
//         `[ID:${t.id}] ${t.titre}`,
//         `  Auteur: ${t.auteur || 'Non spécifié'} | Promoteur: ${t.promoteur || 'Non spécifié'} | Faculté: ${
//           t.facultes?.nom || 'Non spécifié'
//         } | Année: ${t.annees_academiques?.annee || 'Non spécifié'} | Pertinence: ${pertinence}`,
//         `  Technologies: ${(t.technologies || []).join(', ') || 'Non spécifié'}`,
//         `  Mots-clés: ${(t.mots_cles || []).join(', ') || 'Non spécifié'}`,
//         `  Résumé: ${resume}`,
//       ].join('\n')
//     })
//     .join('\n\n')
// }

// function buildMessages(
//   userMessage: string,
//   history: HistoryMessage[],
//   candidates: Candidate[],
//   type: QuestionType,
//   totalTfc: number | null
// ) {
//   let context = ''
//   if (type !== 'general') {
//     const shown = Math.min(candidates.length, CONTEXT_TFC)
//     const archive = totalTfc ? `L'archive complète contient ${totalTfc} TFC.` : "L'archive contient de nombreux TFC."
//     context =
//       shown === 0
//         ? `\n\n${archive} La recherche n'a retourné aucun TFC pour cette demande.`
//         : `\n\n${archive} Voici les ${shown} TFC les plus proches de la demande (résultats de recherche, pas la liste complète) :\n${buildContext(
//             candidates
//           )}`
//   }
//   return [
//     { role: 'system', content: `${SYSTEM_PROMPT}\n\nCONSIGNE POUR CETTE DEMANDE\n${TYPE_INSTRUCTIONS[type]}${context}` },
//     ...history.map((m) => ({ role: m.role, content: m.content.slice(0, HISTORY_CHARS) })),
//     { role: 'user', content: userMessage },
//   ]
// }

// /* ------------------------------- Références ------------------------------- */

// function toReference(row: any, similarity: number | null): TFCReferencePayload {
//   return {
//     id: row.id,
//     titre: row.titre,
//     auteur: row.auteur || 'Non spécifié',
//     promoteur: row.promoteur || 'Non spécifié',
//     faculte: row.facultes?.nom || 'Non spécifié',
//     annee: row.annees_academiques?.annee || 'Non spécifié',
//     technologies: row.technologies || [],
//     resume: row.resume || 'Aucun résumé disponible',
//     similarity,
//   }
// }

// const NO_MATCH = /aucun TFC correspondant/i

// // Sources = TFC réellement cités par le modèle (ID:123). À défaut, les meilleurs résultats.
// function pickReferences(answer: string, candidates: Candidate[]): TFCReferencePayload[] {
//   const cited = Array.from(new Set(Array.from(answer.matchAll(/ID\s*:\s*(\d+)/gi), (m) => Number(m[1]))))
//   const byId = new Map(candidates.map((c) => [c.id, c]))
//   const citedRows = cited.map((id) => byId.get(id)).filter((c): c is Candidate => !!c)

//   let rows: Candidate[]
//   if (citedRows.length > 0) {
//     rows = citedRows
//   } else if (NO_MATCH.test(answer)) {
//     // Le modèle dit qu'il n'a rien trouvé : on n'affiche pas de sources sans rapport
//     rows = []
//   } else {
//     rows = candidates.filter((c) => !c.fromHistory && (c.similarity || 0) > MIN_SIMILARITY).slice(0, 8)
//   }

//   return rows.map((r) => toReference(r, r.fromHistory ? null : r.similarity ?? 0))
// }

// /* ----------------------------- Base de données ---------------------------- */

// async function ownsConversation(userId: string, conversationId: number): Promise<boolean> {
//   const { data } = await supabase
//     .from('chat_conversations')
//     .select('id')
//     .eq('id', conversationId)
//     .eq('user_id', userId)
//     .maybeSingle()
//   return !!data
// }

// async function createConversation(userId: string, firstMessage: string): Promise<number> {
//   const { data, error } = await supabase
//     .from('chat_conversations')
//     .insert({
//       user_id: userId,
//       title: firstMessage.substring(0, 80) + (firstMessage.length > 80 ? '...' : ''),
//     })
//     .select('id')
//     .single()
//   if (error || !data) throw new Error(`Création de la conversation impossible : ${error?.message}`)
//   return data.id as number
// }

// async function loadHistory(conversationId: number): Promise<HistoryMessage[]> {
//   const { data } = await supabase
//     .from('chat_messages')
//     .select('role, content')
//     .eq('conversation_id', conversationId)
//     .order('created_at', { ascending: false })
//     .limit(HISTORY_LIMIT)
//   return ((data ?? []) as HistoryMessage[]).reverse()
// }

// async function saveAssistantMessage(conversationId: number, content: string, tfcIds: number[]) {
//   try {
//     const { data, error } = await supabase
//       .from('chat_messages')
//       .insert({
//         conversation_id: conversationId,
//         role: 'assistant',
//         content,
//         tfc_references: tfcIds.length > 0 ? tfcIds : null,
//       })
//       .select('id')
//       .single()
//     if (error) throw error

//     await supabase
//       .from('chat_conversations')
//       .update({ updated_at: new Date().toISOString() })
//       .eq('id', conversationId)

//     return data
//   } catch (err) {
//     console.error('❌ Sauvegarde de la réponse :', err)
//     return null
//   }
// }

// /* ---------------------------- Appel du modèle ---------------------------- */

// // Lit le flux SSE d'OpenRouter et transmet chaque morceau de texte
// async function streamCompletion(
//   model: string,
//   messages: { role: string; content: string }[],
//   signal: AbortSignal,
//   onDelta: (text: string) => void
// ): Promise<void> {
//   const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//       'Content-Type': 'application/json',
//       'HTTP-Referer': process.env.NEXTAUTH_URL || 'https://recherchetfc.vercel.app',
//       'X-Title': 'TFC Assistant',
//     },
//     body: JSON.stringify({
//       model,
//       messages,
//       stream: true,
//       max_tokens: 2500,
//       temperature: 0.6,
//       top_p: 0.9,
//     }),
//     signal,
//   })

//   if (!res.ok || !res.body) {
//     const detail = await res.text().catch(() => '')
//     console.error('❌ Erreur modèle de chat :', model, res.status, detail.slice(0, 300))
//     throw new Error(`Le modèle de réponse est indisponible (${res.status}).`)
//   }

//   const reader = res.body.getReader()
//   const decoder = new TextDecoder()
//   let buffer = ''

//   while (true) {
//     const { done, value } = await reader.read()
//     if (done) break
//     buffer += decoder.decode(value, { stream: true })

//     let newline: number
//     while ((newline = buffer.indexOf('\n')) !== -1) {
//       const line = buffer.slice(0, newline).trim()
//       buffer = buffer.slice(newline + 1)

//       // Les lignes de commentaire (": OPENROUTER PROCESSING") sont ignorées
//       if (!line.startsWith('data:')) continue
//       const payload = line.slice(5).trim()
//       if (payload === '[DONE]') return

//       let json: any
//       try {
//         json = JSON.parse(payload)
//       } catch {
//         continue
//       }
//       if (json.error) throw new Error(json.error.message ?? 'Erreur du modèle')
//       const delta = json.choices?.[0]?.delta?.content
//       if (typeof delta === 'string' && delta) onDelta(delta)
//     }
//   }
// }

// function fallbackAnswer(query: string, candidates: Candidate[]): string {
//   const top = candidates.slice(0, 3)
//   return `🔍 **Résultats pour :** « ${query} »\n\nLe générateur de réponses est momentanément indisponible, mais voici les travaux les plus proches :\n\n${top
//     .map(
//       (t) =>
//         `- **${t.titre}** — ${t.auteur || 'Auteur non spécifié'}${
//           t.fromHistory ? '' : ` (${t.similarity}% de pertinence)`
//         } (ID:${t.id})`
//     )
//     .join('\n')}\n\n*Reformulez ou réessayez dans un instant pour une analyse détaillée.*`
// }

// /* ---------------------------------- POST ---------------------------------- */

// export async function POST(request: NextRequest) {
//   const user = await getSession()
//   if (!user) {
//     return NextResponse.json({ error: 'Non authentifié', success: false }, { status: 401 })
//   }

//   if (isRateLimited(user.id)) {
//     return NextResponse.json(
//       { error: 'Trop de messages en peu de temps. Patientez quelques secondes avant de réessayer.', success: false },
//       { status: 429 }
//     )
//   }

//   const body = await request.json().catch(() => null)
//   const message = typeof body?.message === 'string' ? body.message.trim() : ''
//   if (!message) {
//     return NextResponse.json({ error: 'Le message est requis', success: false }, { status: 400 })
//   }
//   if (message.length > MAX_MESSAGE_LENGTH) {
//     return NextResponse.json(
//       { error: `Le message est trop long (maximum ${MAX_MESSAGE_LENGTH} caractères).`, success: false },
//       { status: 400 }
//     )
//   }

//   const requestedId = Number(body?.conversationId) || undefined
//   let conversationId: number
//   let history: HistoryMessage[] = []
//   let userMessageId: number | null = null

//   try {
//     if (requestedId) {
//       if (!(await ownsConversation(user.id, requestedId))) {
//         return NextResponse.json({ error: 'Conversation introuvable', success: false }, { status: 404 })
//       }
//       conversationId = requestedId
//       history = await loadHistory(conversationId)
//     } else {
//       conversationId = await createConversation(user.id, message)
//     }

//     const { data: saved } = await supabase
//       .from('chat_messages')
//       .insert({ conversation_id: conversationId, role: 'user', content: message })
//       .select('id')
//       .single()
//     userMessageId = (saved?.id as number | undefined) ?? null
//   } catch (err: any) {
//     console.error('❌ Préparation de la conversation :', err)
//     return NextResponse.json(
//       { error: 'Erreur lors du traitement de votre message', details: err?.message, success: false },
//       { status: 500 }
//     )
//   }

//   const encoder = new TextEncoder()

//   const stream = new ReadableStream({
//     async start(controller) {
//       let closed = false
//       const send = (event: StreamEvent) => {
//         if (closed) return
//         try {
//           controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
//         } catch {
//           closed = true
//         }
//       }
//       const close = () => {
//         if (closed) return
//         closed = true
//         try {
//           controller.close()
//         } catch {
//           /* déjà fermé */
//         }
//       }

//       let answer = ''
//       let candidates: Candidate[] = []

//       try {
//         send({ type: 'meta', conversationId })

//         const type = classifyQuestion(message, history)
//         let totalTfc: number | null = null

//         if (type !== 'general') {
//           // Recherche (similarité) et comptage en parallèle
//           const [search, total] = await Promise.all([
//             searchTFCs({
//               query: buildSearchQuery(message, history),
//               limit: SEARCH_LIMIT,
//               similarityThreshold: 0.1,
//             }),
//             getTotalTfc(),
//           ])
//           totalTfc = total

//           const found = search.results.slice(0, CONTEXT_TFC) as Candidate[]
//           const extras =
//             history.length > 0 ? await loadCitedFromHistory(history, new Set(found.map((t) => t.id))) : []

//           // Les TFC cités plus tôt gardent leur place dans le contexte
//           candidates = [...found.slice(0, CONTEXT_TFC - extras.length), ...extras]
//         }

//         const messages = buildMessages(message, history, candidates, type, totalTfc)
//         const models = [CHAT_MODEL, FALLBACK_MODEL].filter(
//           (m, i, all): m is string => !!m && all.indexOf(m) === i
//         )

//         let modelError: unknown = null
//         for (const model of models) {
//           try {
//             await streamCompletion(model, messages, request.signal, (text) => {
//               answer += text
//               send({ type: 'delta', text })
//             })
//             modelError = null
//             break
//           } catch (err) {
//             modelError = err
//             // On n'essaie le modèle de secours que si rien n'a encore été envoyé
//             if (request.signal.aborted || answer) break
//           }
//         }

//         if (modelError) {
//           // Modèle indisponible avant la moindre réponse : on affiche au moins les résultats trouvés
//           if (!request.signal.aborted && !answer && candidates.length > 0) {
//             answer = fallbackAnswer(message, candidates)
//             send({ type: 'delta', text: answer })
//           } else {
//             throw modelError
//           }
//         }

//         if (!answer.trim()) throw new Error('Le modèle a renvoyé une réponse vide.')

//         const references = pickReferences(answer, candidates)
//         await saveAssistantMessage(conversationId, answer, references.map((r) => r.id))
//         send({ type: 'done', conversationId, references })
//       } catch (err: any) {
//         if (request.signal.aborted) {
//           // L'utilisateur a arrêté : on garde la réponse partielle pour que l'historique reste cohérent
//           if (answer.trim()) {
//             await saveAssistantMessage(conversationId, answer, pickReferences(answer, candidates).map((r) => r.id))
//           }
//         } else {
//           console.error('❌ Erreur chatbot :', err)
//           if (answer.trim()) {
//             // Réponse coupée en route : on conserve ce qui a été généré
//             await saveAssistantMessage(conversationId, answer, pickReferences(answer, candidates).map((r) => r.id))
//           } else if (userMessageId !== null) {
//             // Rien n'a été produit : on retire la question pour qu'un « Réessayer » ne la duplique pas
//             await supabase.from('chat_messages').delete().eq('id', userMessageId)
//           }
//           send({
//             type: 'error',
//             message: err?.message || 'Erreur lors du traitement de votre message.',
//           })
//         }
//       } finally {
//         close()
//       }
//     },
//   })

//   return new Response(stream, {
//     headers: {
//       'Content-Type': 'application/x-ndjson; charset=utf-8',
//       'Cache-Control': 'no-store, no-transform',
//       'X-Accel-Buffering': 'no',
//     },
//   })
// }

// /* ----------------------------------- GET ---------------------------------- */

// export async function GET(request: NextRequest) {
//   try {
//     const user = await getSession()
//     if (!user) {
//       return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
//     }

//     const conversationParam = new URL(request.url).searchParams.get('conversationId')

//     if (conversationParam) {
//       const conversationId = parseInt(conversationParam, 10)
//       if (Number.isNaN(conversationId) || !(await ownsConversation(user.id, conversationId))) {
//         return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 })
//       }

//       const { data: messages, error } = await supabase
//         .from('chat_messages')
//         .select('*')
//         .eq('conversation_id', conversationId)
//         .order('created_at', { ascending: true })

//       if (error) {
//         console.error('❌ Récupération des messages :', error)
//         return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
//       }

//       const list = (messages ?? []) as any[]

//       // Sources des anciennes réponses (similarité inconnue : non stockée)
//       const ids = Array.from(new Set(list.flatMap((m) => (Array.isArray(m.tfc_references) ? m.tfc_references : []))))
//       const references: Record<number, TFCReferencePayload[]> = {}
//       if (ids.length > 0) {
//         const { data: tfcs } = await supabase.from('tfc').select(REFERENCE_SELECT).in('id', ids)
//         const byId = new Map<number, any>((tfcs ?? []).map((t: any) => [t.id as number, t]))
//         for (const m of list) {
//           if (m.role !== 'assistant' || !Array.isArray(m.tfc_references)) continue
//           const refs = (m.tfc_references as number[])
//             .map((id) => byId.get(id))
//             .filter(Boolean)
//             .map((row) => toReference(row, null))
//           if (refs.length > 0) references[m.id] = refs
//         }
//       }

//       return NextResponse.json({ messages: list, references, conversationId })
//     }

//     const { data: conversations, error } = await supabase
//       .from('chat_conversations')
//       .select('id, title, created_at, updated_at')
//       .eq('user_id', user.id)
//       .order('updated_at', { ascending: false })
//       .limit(100)

//     if (error) {
//       console.error('❌ Récupération des conversations :', error)
//       return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
//     }

//     const u = user as any
//     return NextResponse.json({
//       conversations: conversations || [],
//       user: {
//         id: u.id,
//         name: u.name,
//         email: u.email,
//         role: u.role,
//         profil_url: u.profil_url,
//       },
//     })
//   } catch (error) {
//     console.error('❌ Erreur API chat :', error)
//     return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
//   }
// }

// app/api/chat/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/utils/session'
import { searchTFCs, type TfcResult } from '@/lib/tfc-search'

export const runtime = 'nodejs'
export const maxDuration = 60

/* -------------------------------- Constantes ------------------------------ */

const CHAT_MODEL = process.env.CHAT_MODEL ?? 'deepseek/deepseek-v4.1-flash'
const FALLBACK_MODEL = process.env.CHAT_FALLBACK_MODEL
const MAX_MESSAGE_LENGTH = 2000
const HISTORY_LIMIT = 8
const HISTORY_CHARS = 1500
const SEARCH_LIMIT = 20
const CONTEXT_TFC = 15
const HISTORY_CITED_MAX = 5
const MIN_SIMILARITY = 5
const COUNT_CACHE_MS = 10 * 60 * 1000

const RATE_LIMIT = 12
const RATE_WINDOW_MS = 60_000

type QuestionType = 'general' | 'suggestion_sujet' | 'specific_search'
type ChatRole = 'user' | 'assistant'

type Candidate = TfcResult & { fromHistory?: boolean }

interface HistoryMessage {
  role: ChatRole
  content: string
}

type StreamEvent =
  | { type: 'meta'; conversationId: number }
  | { type: 'delta'; text: string }
  | { type: 'done'; conversationId: number; references: TFCReferencePayload[] }
  | { type: 'error'; message: string }

interface TFCReferencePayload {
  id: number
  titre: string
  auteur: string
  promoteur: string
  faculte: string
  annee: string
  technologies: string[]
  resume: string
  similarity: number | null
}

const REFERENCE_SELECT =
  'id, titre, auteur, promoteur, resume, technologies, facultes:faculte_id(nom), annees_academiques:annee_academique_id(annee)'

/* ------------------------------ Limite de débit ---------------------------- */

const hits = new Map<string, number[]>()

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_LIMIT) {
    hits.set(userId, recent)
    return true
  }
  recent.push(now)
  hits.set(userId, recent)

  if (hits.size > 5000) {
    hits.forEach((times, key) => {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key)
    })
  }
  return false
}

/* ----------------------------- Classification ----------------------------- */

const SMALL_TALK =
  /^(?:(?:bonjour|bonsoir|salut|coucou|hello|hi|hey|merci(?: beaucoup)?|thanks|ok|d'accord|super|parfait|au revoir|bye|à bientôt|a bientot)[\s!.,?]*)+$/i
const ABOUT_BOT =
  /(qui es[- ]tu|tu es qui|présente[- ]toi|ton rôle|que peux[- ]tu faire|comment (ça )?(marche|fonctionne))/i
const SUGGESTION_PATTERNS = [
  /(propose|suggère|suggestion|idée|donne|cherche|besoin|nouveau|proposition|inspire|recommande).{0,40}(sujet|thème|idée)/i,
  /(quel|quels|quelle).{0,20}(sujet|thème)/i,
  /sujet.{0,30}(tfc|mémoire|projet|intéressant|possible|original|innovant)/i,
  /thème.{0,20}sujet/i,
  /(que|quoi) (faire|traiter|choisir).{0,30}(tfc|mémoire|projet)/i,
  /(j'hésite|je ne sais pas).{0,40}(sujet|thème|tfc)/i,
]
const MORE_IDEAS = /(autre|encore|différent|plus (original|innovant|simple|réaliste|ambitieux))/i

function baseClassify(message: string): QuestionType {
  const m = message.toLowerCase().trim()
  if (m.length <= 60 && (SMALL_TALK.test(m) || ABOUT_BOT.test(m))) return 'general'
  if (SUGGESTION_PATTERNS.some((p) => p.test(m))) return 'suggestion_sujet'
  return 'specific_search'
}

function classifyQuestion(message: string, history: HistoryMessage[]): QuestionType {
  const base = baseClassify(message)
  if (base !== 'specific_search') return base

  const words = message.split(/\s+/).filter(Boolean).length
  if (words <= 8 && MORE_IDEAS.test(message)) {
    const lastUser = [...history].reverse().find((m) => m.role === 'user')
    if (lastUser && baseClassify(lastUser.content) === 'suggestion_sujet') return 'suggestion_sujet'
  }
  return base
}

function buildSearchQuery(message: string, history: HistoryMessage[]): string {
  const words = message.split(/\s+/).filter(Boolean)
  if (words.length > 7) return message
  const lastUser = [...history].reverse().find((m) => m.role === 'user')
  return lastUser ? `${lastUser.content.slice(0, 200)} ${message}` : message
}

/* ------------------------------ Taille archive ----------------------------- */

let cachedTotal: { value: number; at: number } | null = null

async function getTotalTfc(): Promise<number | null> {
  if (cachedTotal && Date.now() - cachedTotal.at < COUNT_CACHE_MS) return cachedTotal.value
  try {
    const { count, error } = await supabase.from('tfc').select('id', { count: 'exact', head: true })
    if (error || count === null) return cachedTotal?.value ?? null
    cachedTotal = { value: count, at: Date.now() }
    return count
  } catch {
    return cachedTotal?.value ?? null
  }
}

/* ------------------------- TFC cités plus tôt (suivi) ---------------------- */

async function loadCitedFromHistory(history: HistoryMessage[], exclude: Set<number>): Promise<Candidate[]> {
  const ids: number[] = []
  const recentAssistant = [...history].reverse().filter((m) => m.role === 'assistant').slice(0, 2)
  for (const m of recentAssistant) {
    const idPattern = /ID\s*:\s*(\d+)/gi
    let match: RegExpExecArray | null
    while ((match = idPattern.exec(m.content)) !== null) {
      const id = Number(match[1])
      if (!exclude.has(id) && !ids.includes(id)) ids.push(id)
    }
  }
  const wanted = ids.slice(0, HISTORY_CITED_MAX)
  if (wanted.length === 0) return []

  try {
    const { data } = await supabase.from('tfc').select(REFERENCE_SELECT).in('id', wanted)
    return (data ?? [])
      .sort((a: any, b: any) => wanted.indexOf(a.id) - wanted.indexOf(b.id))
      .map((row: any) => ({ ...row, similarity: null, fromHistory: true }) as unknown as Candidate)
  } catch (err) {
    console.error('❌ TFC cités dans l’historique :', err)
    return []
  }
}

/* --------------------------------- Prompt --------------------------------- */

const SYSTEM_PROMPT = `Tu es l'assistant de l'archive des TFC (Travaux de Fin de Cycle). Tu aides les étudiants à retrouver des travaux passés, à comprendre ce qui a déjà été fait et à choisir un sujet.

RÈGLES
- Pour parler des travaux existants, appuie-toi uniquement sur les TFC fournis ci-dessous. N'invente jamais un TFC, un titre, un auteur ou un ID.
- Les TFC fournis ne sont qu'un extrait de l'archive : ce sont les résultats d'une recherche, pas la liste complète. Ne déduis jamais la taille de l'archive du nombre de TFC listés ; si on te la demande, utilise le total indiqué ci-dessous.
- Si aucun TFC fourni ne correspond à la demande, dis : « Je n'ai trouvé aucun TFC correspondant dans les résultats de la recherche ». N'affirme jamais qu'un sujet n'existe pas dans l'archive, et ne présente pas de travaux sans rapport pour combler. Propose plutôt de reformuler (synonymes, termes en anglais, technologie précise).
- Chaque fois que tu mentionnes un TFC, ajoute son ID entre parenthèses au format (ID:123). Pour en citer plusieurs : (ID:12) (ID:15). Ces ID apparaissent aussi dans le panneau « Sources » de l'étudiant.
- Ne cite que des TFC réellement pertinents pour la demande.
- Tiens compte de l'historique de la conversation pour les questions de suivi.
- Réponds en français, de façon claire et structurée. Va droit au but, sans répétitions.

DÉMARCATION OBLIGATOIRE
Chaque fois que tu proposes quelque chose de nouveau (un sujet, une idée, une amélioration, un angle de recherche, une combinaison de technologies), tu dois situer ta proposition par rapport à l'existant. Termine chaque proposition par un bloc « **Démarcation par rapport à l'existant** » qui indique :
- les TFC les plus proches, cités avec leur ID, et ce qu'ils couvrent déjà ;
- ce que ta proposition apporte de différent (problématique, public cible, jeu de données, méthode, technologies, périmètre) ;
- le niveau de recouvrement avec l'existant : faible, moyen ou élevé.
Si le recouvrement est élevé, adapte la proposition pour qu'elle se démarque réellement. Si aucun TFC fourni n'est proche, dis-le sans affirmer que le sujet n'a jamais été traité, et conseille de vérifier avec une recherche plus précise. Avec plusieurs propositions, fais une démarcation par proposition. N'invente jamais un TFC pour illustrer une ressemblance.

FORMAT
- Écris du Markdown directement, sans jamais l'entourer d'un bloc de code (pas de \`\`\`).
- Titres au format « ### Titre » (espace après les #), listes avec « - », mots importants en **gras**.
- Laisse une ligne vide avant chaque titre et chaque liste.`

const TYPE_INSTRUCTIONS: Record<QuestionType, string> = {
  specific_search:
    'Présente les travaux les plus pertinents (titre, auteur, année, technologies, ce qui les distingue). Signale ensuite les thèmes peu couverts si c’est utile. Si l’étudiant semble vouloir traiter un sujet proche de ces travaux, explique comment s’en démarquer (bloc « Démarcation par rapport à l’existant »).',
  suggestion_sujet:
    'L’étudiant cherche une idée de sujet. Analyse d’abord les TFC existants pour repérer les tendances et les lacunes, puis propose 1 à 3 sujets innovants et réalistes. Pour chaque sujet, utilise cette structure : un titre en « ### », puis la problématique, les objectifs, les technologies suggérées, et enfin le bloc « **Démarcation par rapport à l’existant** » (TFC les plus proches avec leur ID, apport différenciant, niveau de recouvrement). La démarcation est obligatoire pour chaque sujet.',
  general:
    'C’est un message de conversation courante (salutation, remerciement, question sur ton rôle). Réponds brièvement. Si c’est utile, explique que tu peux rechercher des TFC par thème, technologie, auteur ou année, et proposer des sujets en les situant par rapport aux travaux existants. Ne cite aucun TFC.',
}

function buildContext(candidates: Candidate[]): string {
  return candidates
    .slice(0, CONTEXT_TFC)
    .map((t) => {
      const resume = (t.resume ?? 'Non disponible').toString().slice(0, 500)
      const pertinence = t.fromHistory
        ? 'non calculée (cité plus tôt dans la conversation)'
        : `${t.similarity}%`
      return [
        `[ID:${t.id}] ${t.titre}`,
        `  Auteur: ${t.auteur || 'Non spécifié'} | Promoteur: ${t.promoteur || 'Non spécifié'} | Faculté: ${
          t.facultes?.nom || 'Non spécifié'
        } | Année: ${t.annees_academiques?.annee || 'Non spécifié'} | Pertinence: ${pertinence}`,
        `  Technologies: ${(t.technologies || []).join(', ') || 'Non spécifié'}`,
        `  Mots-clés: ${(t.mots_cles || []).join(', ') || 'Non spécifié'}`,
        `  Résumé: ${resume}`,
      ].join('\n')
    })
    .join('\n\n')
}

function buildMessages(
  userMessage: string,
  history: HistoryMessage[],
  candidates: Candidate[],
  type: QuestionType,
  totalTfc: number | null
) {
  let context = ''
  if (type !== 'general') {
    const shown = Math.min(candidates.length, CONTEXT_TFC)
    const archive = totalTfc ? `L'archive complète contient ${totalTfc} TFC.` : "L'archive contient de nombreux TFC."
    context =
      shown === 0
        ? `\n\n${archive} La recherche n'a retourné aucun TFC pour cette demande.`
        : `\n\n${archive} Voici les ${shown} TFC les plus proches de la demande (résultats de recherche, pas la liste complète) :\n${buildContext(
            candidates
          )}`
  }
  return [
    { role: 'system', content: `${SYSTEM_PROMPT}\n\nCONSIGNE POUR CETTE DEMANDE\n${TYPE_INSTRUCTIONS[type]}${context}` },
    ...history.map((m) => ({ role: m.role, content: m.content.slice(0, HISTORY_CHARS) })),
    { role: 'user', content: userMessage },
  ]
}

/* ------------------------------- Références ------------------------------- */

function toReference(row: any, similarity: number | null): TFCReferencePayload {
  return {
    id: row.id,
    titre: row.titre,
    auteur: row.auteur || 'Non spécifié',
    promoteur: row.promoteur || 'Non spécifié',
    faculte: row.facultes?.nom || 'Non spécifié',
    annee: row.annees_academiques?.annee || 'Non spécifié',
    technologies: row.technologies || [],
    resume: row.resume || 'Aucun résumé disponible',
    similarity,
  }
}

const NO_MATCH = /aucun TFC correspondant/i

// Sources = TFC réellement cités par le modèle (ID:123). À défaut, les meilleurs résultats.
// On ajoute le type de question pour éviter d'afficher des sources sur un simple "merci".
function pickReferences(answer: string, candidates: Candidate[], type: QuestionType): TFCReferencePayload[] {
  if (type === 'general') {
    return []
  }

  const cited = Array.from(new Set(Array.from(answer.matchAll(/ID\s*:\s*(\d+)/gi), (m) => Number(m[1]))))
  const byId = new Map(candidates.map((c) => [c.id, c]))
  const citedRows = cited.map((id) => byId.get(id)).filter((c): c is Candidate => !!c)

  let rows: Candidate[]
  if (citedRows.length > 0) {
    rows = citedRows
  } else if (NO_MATCH.test(answer)) {
    rows = []
  } else {
    rows = candidates.filter((c) => !c.fromHistory && (c.similarity || 0) > MIN_SIMILARITY).slice(0, 8)
  }

  return rows.map((r) => toReference(r, r.fromHistory ? null : r.similarity ?? 0))
}

/* ----------------------------- Base de données ---------------------------- */

async function ownsConversation(userId: string, conversationId: number): Promise<boolean> {
  const { data } = await supabase
    .from('chat_conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}

async function createConversation(userId: string, firstMessage: string): Promise<number> {
  const { data, error } = await supabase
    .from('chat_conversations')
    .insert({
      user_id: userId,
      title: firstMessage.substring(0, 80) + (firstMessage.length > 80 ? '...' : ''),
    })
    .select('id')
    .single()
  if (error || !data) throw new Error(`Création de la conversation impossible : ${error?.message}`)
  return data.id as number
}

async function loadHistory(conversationId: number): Promise<HistoryMessage[]> {
  const { data } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT)
  return ((data ?? []) as HistoryMessage[]).reverse()
}

async function saveAssistantMessage(conversationId: number, content: string, tfcIds: number[]) {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content,
        tfc_references: tfcIds.length > 0 ? tfcIds : null,
      })
      .select('id')
      .single()
    if (error) throw error

    await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    return data
  } catch (err) {
    console.error('❌ Sauvegarde de la réponse :', err)
    return null
  }
}

/* ---------------------------- Appel du modèle ---------------------------- */

async function streamCompletion(
  model: string,
  messages: { role: string; content: string }[],
  signal: AbortSignal,
  onDelta: (text: string) => void
): Promise<void> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXTAUTH_URL || 'https://recherchetfc.vercel.app',
      'X-Title': 'TFC Assistant',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_tokens: 2500,
      temperature: 0.6,
      top_p: 0.9,
    }),
    signal,
  })

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '')
    console.error('❌ Erreur modèle de chat :', model, res.status, detail.slice(0, 300))
    throw new Error(`Le modèle de réponse est indisponible (${res.status}).`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let newline: number
    while ((newline = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, newline).trim()
      buffer = buffer.slice(newline + 1)

      if (!line.startsWith('data:')) continue
      const payload = line.slice(5).trim()
      if (payload === '[DONE]') return

      let json: any
      try {
        json = JSON.parse(payload)
      } catch {
        continue
      }
      if (json.error) throw new Error(json.error.message ?? 'Erreur du modèle')
      const delta = json.choices?.[0]?.delta?.content
      if (typeof delta === 'string' && delta) onDelta(delta)
    }
  }
}

function fallbackAnswer(query: string, candidates: Candidate[]): string {
  const top = candidates.slice(0, 3)
  return `🔍 **Résultats pour :** « ${query} »\n\nLe générateur de réponses est momentanément indisponible, mais voici les travaux les plus proches :\n\n${top
    .map(
      (t) =>
        `- **${t.titre}** — ${t.auteur || 'Auteur non spécifié'}${
          t.fromHistory ? '' : ` (${t.similarity}% de pertinence)`
        } (ID:${t.id})`
    )
    .join('\n')}\n\n*Reformulez ou réessayez dans un instant pour une analyse détaillée.*`
}

/* ---------------------------------- POST ---------------------------------- */

export async function POST(request: NextRequest) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié', success: false }, { status: 401 })
  }

  if (isRateLimited(user.id)) {
    return NextResponse.json(
      { error: 'Trop de messages en peu de temps. Patientez quelques secondes avant de réessayer.', success: false },
      { status: 429 }
    )
  }

  const body = await request.json().catch(() => null)
  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  if (!message) {
    return NextResponse.json({ error: 'Le message est requis', success: false }, { status: 400 })
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Le message est trop long (maximum ${MAX_MESSAGE_LENGTH} caractères).`, success: false },
      { status: 400 }
    )
  }

  const requestedId = Number(body?.conversationId) || undefined
  let conversationId: number
  let history: HistoryMessage[] = []
  let userMessageId: number | null = null

  try {
    if (requestedId) {
      if (!(await ownsConversation(user.id, requestedId))) {
        return NextResponse.json({ error: 'Conversation introuvable', success: false }, { status: 404 })
      }
      conversationId = requestedId
      history = await loadHistory(conversationId)
    } else {
      conversationId = await createConversation(user.id, message)
    }

    const { data: saved } = await supabase
      .from('chat_messages')
      .insert({ conversation_id: conversationId, role: 'user', content: message })
      .select('id')
      .single()
    userMessageId = (saved?.id as number | undefined) ?? null
  } catch (err: any) {
    console.error('❌ Préparation de la conversation :', err)
    return NextResponse.json(
      { error: 'Erreur lors du traitement de votre message', details: err?.message, success: false },
      { status: 500 }
    )
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false
      const send = (event: StreamEvent) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
        } catch {
          closed = true
        }
      }
      const close = () => {
        if (closed) return
        closed = true
        try {
          controller.close()
        } catch {
          /* déjà fermé */
        }
      }

      let answer = ''
      let candidates: Candidate[] = []
      let questionType: QuestionType = 'general'

      try {
        send({ type: 'meta', conversationId })

        questionType = classifyQuestion(message, history)
        let totalTfc: number | null = null

        if (questionType !== 'general') {
          const [search, total] = await Promise.all([
            searchTFCs({
              query: buildSearchQuery(message, history),
              limit: SEARCH_LIMIT,
              similarityThreshold: 0.1,
            }),
            getTotalTfc(),
          ])
          totalTfc = total

          const found = search.results.slice(0, CONTEXT_TFC) as Candidate[]
          const extras =
            history.length > 0 ? await loadCitedFromHistory(history, new Set(found.map((t) => t.id))) : []

          candidates = [...found.slice(0, CONTEXT_TFC - extras.length), ...extras]
        }

        const messages = buildMessages(message, history, candidates, questionType, totalTfc)
        const models = [CHAT_MODEL, FALLBACK_MODEL].filter(
          (m, i, all): m is string => !!m && all.indexOf(m) === i
        )

        let modelError: unknown = null
        for (const model of models) {
          try {
            await streamCompletion(model, messages, request.signal, (text) => {
              answer += text
              send({ type: 'delta', text })
            })
            modelError = null
            break
          } catch (err) {
            modelError = err
            if (request.signal.aborted || answer) break
          }
        }

        if (modelError) {
          if (!request.signal.aborted && !answer && candidates.length > 0) {
            answer = fallbackAnswer(message, candidates)
            send({ type: 'delta', text: answer })
          } else {
            throw modelError
          }
        }

        if (!answer.trim()) throw new Error('Le modèle a renvoyé une réponse vide.')

        const references = pickReferences(answer, candidates, questionType)
        await saveAssistantMessage(conversationId, answer, references.map((r) => r.id))
        send({ type: 'done', conversationId, references })
      } catch (err: any) {
        if (request.signal.aborted) {
          if (answer.trim()) {
            await saveAssistantMessage(conversationId, answer, pickReferences(answer, candidates, questionType).map((r) => r.id))
          }
        } else {
          console.error('❌ Erreur chatbot :', err)
          if (answer.trim()) {
            await saveAssistantMessage(conversationId, answer, pickReferences(answer, candidates, questionType).map((r) => r.id))
          } else if (userMessageId !== null) {
            await supabase.from('chat_messages').delete().eq('id', userMessageId)
          }
          send({
            type: 'error',
            message: err?.message || 'Erreur lors du traitement de votre message.',
          })
        }
      } finally {
        close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}

/* ----------------------------------- GET ---------------------------------- */

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const conversationParam = new URL(request.url).searchParams.get('conversationId')

    if (conversationParam) {
      const conversationId = parseInt(conversationParam, 10)
      if (Number.isNaN(conversationId) || !(await ownsConversation(user.id, conversationId))) {
        return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 })
      }

      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Récupération des messages :', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
      }

      const list = (messages ?? []) as any[]

      const ids = Array.from(new Set(list.flatMap((m) => (Array.isArray(m.tfc_references) ? m.tfc_references : []))))
      const references: Record<number, TFCReferencePayload[]> = {}
      if (ids.length > 0) {
        const { data: tfcs } = await supabase.from('tfc').select(REFERENCE_SELECT).in('id', ids)
        const byId = new Map<number, any>((tfcs ?? []).map((t: any) => [t.id as number, t]))
        for (const m of list) {
          if (m.role !== 'assistant' || !Array.isArray(m.tfc_references)) continue
          const refs = (m.tfc_references as number[])
            .map((id) => byId.get(id))
            .filter(Boolean)
            .map((row) => toReference(row, null))
          if (refs.length > 0) references[m.id] = refs
        }
      }

      return NextResponse.json({ messages: list, references, conversationId })
    }

    const { data: conversations, error } = await supabase
      .from('chat_conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('❌ Récupération des conversations :', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    const u = user as any
    return NextResponse.json({
      conversations: conversations || [],
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        profil_url: u.profil_url,
      },
    })
  } catch (error) {
    console.error('❌ Erreur API chat :', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// // // lib/tfc-search.ts
// // // Recherche partagée par /api/chat et /api/semantic-chat (aucun appel HTTP interne).

// // /* eslint-disable @typescript-eslint/no-explicit-any */
// // import { supabase } from '@/lib/supabase'
// // import { embedQuery } from '@/lib/embeddings'

// // export interface SearchFilters {
// //   faculte_id?: number
// //   departement_id?: number
// //   filiere_id?: number
// //   annee_academique_id?: number
// //   auteur?: string
// //   promoteur?: string
// // }

// // export type SearchType = 'semantic' | 'hybrid' | 'text'

// // export type TfcResult = Record<string, any> & { id: number; titre: string; similarity: number }

// // const TFC_SELECT = `
// //   id, titre, auteur, promoteur, statut, resume, mots_cles, technologies,
// //   fonctionnalites, cas_application, fichier_chemin, note,
// //   facultes:faculte_id(nom, code),
// //   departements:departement_id(nom, code),
// //   filieres:filiere_id(nom, code),
// //   annees_academiques:annee_academique_id(annee)
// // `

// // const STOPWORDS = new Set([
// //   'les', 'des', 'une', 'aux', 'que', 'qui', 'quoi', 'quel', 'quels', 'quelle', 'quelles',
// //   'dans', 'sur', 'sous', 'avec', 'sans', 'pour', 'par', 'est', 'sont', 'etre', 'être',
// //   'parle', 'parlent', 'parler', 'traite', 'traitent', 'propose', 'proposer', 'trouve',
// //   'trouvez', 'trouver', 'moi', 'toi', 'nous', 'vous', 'ils', 'elles', 'ces', 'cet', 'cette',
// //   'mon', 'ton', 'son', 'mes', 'tes', 'ses', 'leur', 'leurs', 'plus', 'moins', 'tout', 'tous',
// //   'comme', 'mais', 'donc', 'ainsi', 'aussi', 'peut', 'peux', 'faire', 'fait', 'sujet',
// //   'sujets', 'travaux', 'travail', 'tfc', 'recherche', 'cherche', 'donne', 'liste', 'des',
// //   'the', 'and', 'for', 'et', // 'et' ajouté ici pour ne pas polluer la recherche
// // ])

// // /* ------------------------------- Utilitaires ------------------------------ */

// // export function extractTerms(query: string): string[] {
// //   const words = query
// //     .toLowerCase()
// //     .replace(/[^a-zA-Z0-9À-ÖØ-öø-ÿ\s-]/g, ' ')
// //     .split(/\s+/)
// //     .map((w) => w.replace(/^-+|-+$/g, ''))
// //     .filter((w) => w.length > 2 && !STOPWORDS.has(w))
// //   return Array.from(new Set(words)).slice(0, 6)
// // }

// // function applyFilters(query: any, filters: SearchFilters) {
// //   let q = query
// //   if (filters.faculte_id) q = q.eq('faculte_id', filters.faculte_id)
// //   if (filters.departement_id) q = q.eq('departement_id', filters.departement_id)
// //   if (filters.filiere_id) q = q.eq('filiere_id', filters.filiere_id)
// //   if (filters.annee_academique_id) q = q.eq('annee_academique_id', filters.annee_academique_id)
// //   if (filters.auteur) q = q.ilike('auteur', `%${filters.auteur.replace(/[%,()]/g, ' ')}%`)
// //   if (filters.promoteur) q = q.ilike('promoteur', `%${filters.promoteur.replace(/[%,()]/g, ' ')}%`)
// //   return q
// // }

// // function formatSummary(summary: string | null, maxLength = 200): string {
// //   if (!summary) return 'Aucun résumé disponible'
// //   const clean = summary.trim()
// //   return clean.length <= maxLength ? clean : `${clean.substring(0, maxLength)}...`
// // }

// // function enrich(row: any, similarity01: number, query: string, index: number): TfcResult {
// //   const percent = Math.round(Math.max(0, Math.min(1, similarity01)) * 100)

// //   let relevance = percent
// //   if ((row.titre ?? '').toLowerCase().includes(query.toLowerCase().trim())) {
// //     relevance += 20
// //   }

// //   return {
// //     ...row,
// //     similarity: Math.min(relevance, 100),
// //     relevance_score: Math.min(relevance, 100),
// //     ranking_position: index + 1,

// //     display_title: row.titre?.trim() || 'Titre non disponible',
// //     display_author: row.auteur || 'Auteur non spécifié',
// //     display_faculty: row.facultes?.nom || 'Non spécifié',
// //     display_department: row.departements?.nom || 'Non spécifié',
// //     display_program: row.filieres?.nom || 'Non spécifié',
// //     display_year: row.annees_academiques?.annee || 'Non spécifié',
// //     display_promotor: row.promoteur || 'Non spécifié',

// //     summary: formatSummary(row.resume),
// //     abstract: row.resume ? formatSummary(row.resume, 250) : 'Aucun résumé disponible',
// //     keywords: row.mots_cles?.slice(0, 6) || [],
// //     technologies: row.technologies?.slice(0, 8) || [],
// //     fonctionnalites: row.fonctionnalites?.slice(0, 10) || [],

// //     has_pdf: !!row.fichier_chemin,
// //     has_abstract: !!row.resume,
// //     has_keywords: (row.mots_cles?.length || 0) > 0,
// //     has_technologies: (row.technologies?.length || 0) > 0,
// //     application_case: row.cas_application || 'Non spécifié',
// //   }
// // }

// // /* ------------------------------ Recherches ------------------------------- */

// // function pickColumns(row: any) {
// //   return {
// //     id: row.id,
// //     titre: row.titre,
// //     auteur: row.auteur,
// //     promoteur: row.promoteur,
// //     statut: row.statut,
// //     resume: row.resume,
// //     mots_cles: row.mots_cles,
// //     technologies: row.technologies,
// //     fonctionnalites: row.fonctionnalites,
// //     cas_application: row.cas_application,
// //     fichier_chemin: row.fichier_chemin,
// //     note: row.note,
// //     facultes: { nom: row.faculte_nom },
// //     departements: { nom: row.departement_nom },
// //     filieres: { nom: row.filiere_nom },
// //     annees_academiques: { annee: row.annee_academique },
// //   }
// // }

// // async function vectorSearch(
// //   embedding: number[],
// //   filters: SearchFilters,
// //   limit: number,
// //   threshold: number
// // ): Promise<{ row: any; similarity: number }[]> {
// //   const params: Record<string, unknown> = {
// //     query_embedding: embedding,
// //     similarity_threshold: threshold,
// //     match_count: limit,
// //   }
// //   if (filters.faculte_id) params.filter_faculte_id = filters.faculte_id
// //   if (filters.departement_id) params.filter_departement_id = filters.departement_id
// //   if (filters.filiere_id) params.filter_filiere_id = filters.filiere_id
// //   if (filters.annee_academique_id) params.filter_annee_academique_id = filters.annee_academique_id
// //   if (filters.auteur) params.filter_auteur = filters.auteur
// //   if (filters.promoteur) params.filter_promoteur = filters.promoteur

// //   const { data, error } = await supabase.rpc('semantic_search_tfc_v2', params)
// //   if (error) throw new Error(`semantic_search_tfc_v2 : ${error.message}`)

// //   return ((data ?? []) as any[]).map((r) => ({
// //     row: pickColumns(r),
// //     similarity: Number(r.similarity) || 0,
// //   }))
// // }

// // async function textSearch(
// //   query: string,
// //   filters: SearchFilters,
// //   limit: number
// // ): Promise<{ row: any; similarity: number }[]> {
// //   const terms = extractTerms(query)
// //   if (terms.length === 0) return []

// //   // On utilise "or" pour récupérer un maximum de candidats potentiels
// //   const conditions = terms
// //     .map(
// //       (t) =>
// //         `titre.ilike.%${t}%,resume.ilike.%${t}%,auteur.ilike.%${t}%,mots_cles.cs.{${t}},technologies.cs.{${t}}`
// //     )
// //     .join(',')

// //   let q = supabase
// //     .from('tfc')
// //     .select(TFC_SELECT)
// //     .eq('statut', 'approuvé')
// //     .or(conditions)
// //     .limit(limit + 50) // On prend un peu plus de marge pour pouvoir scorer
// //   q = applyFilters(q, filters)

// //   const { data, error } = await q
// //   if (error) {
// //     console.error('❌ Recherche textuelle :', error.message)
// //     return []
// //   }

// //   // C'EST ICI QUE LA MAGIE OPÈRE : On vérifie que TOUS les termes sont présents
// //   return (data ?? [])
// //     .map((row: any) => {
// //       const title = (row.titre ?? '').toLowerCase()
// //       const summary = (row.resume ?? '').toLowerCase()
// //       const keywords = (row.mots_cles ?? []).map((k: string) => k.toLowerCase())
// //       const technos = (row.technologies ?? []).map((t: string) => t.toLowerCase())
// //       const fullText = `${title} ${summary} ${keywords.join(' ')} ${technos.join(' ')}`

// //       // On compte combien de termes de la requête on retrouve dans le TFC
// //       const matchedTerms = terms.filter(term => fullText.includes(term))
// //       const matchRatio = matchedTerms.length / terms.length

// //       let baseScore = 0

// //       // RÈGLE STRICTE : Si l'utilisateur cherche 2 mots (ex: Blockchain ET sécurité),
// //       // et que le TFC n'en contient qu'un seul, on ne lui donne pas de score élevé.
// //       if (matchRatio === 1) {
// //         // Tous les mots sont là
// //         baseScore = 80 
// //         if (title.includes(query.toLowerCase().trim())) baseScore += 20 // Bonus titre exact
// //       } else if (matchRatio >= 0.5 && terms.length > 1) {
// //         // Seulement la moitié des mots (ex: juste "sécurité" pour la requête "blockchain et sécurité")
// //         // On donne un score très faible pour qu'il soit éliminé par le threshold (ex: 15%)
// //         baseScore = 20 
// //       } else {
// //         // Un seul mot trouvé sur plusieurs
// //         baseScore = 10
// //       }

// //       // Bonus si le mot est trouvé textuellement dans le titre
// //       const inTitle = terms.some(t => title.includes(t))
// //       if (inTitle) baseScore += 10

// //       const finalScore = Math.min(baseScore, 100) / 100

// //       return { row, similarity: finalScore }
// //     })
// //     .filter(r => r.similarity > 0)
// //     .sort((a: any, b: any) => b.similarity - a.similarity)
// //     .slice(0, limit)
// // }

// // /* --------------------------------- Public --------------------------------- */

// // export async function searchTFCs(options: {
// //   query: string
// //   limit?: number
// //   similarityThreshold?: number
// //   filters?: SearchFilters
// // }): Promise<{ results: TfcResult[]; searchType: SearchType }> {
// //   const query = options.query.trim()
// //   const limit = Math.min(Math.max(options.limit ?? 20, 1), 50)
// //   const threshold = options.similarityThreshold ?? 0.1
// //   const filters = options.filters ?? {}

// //   let semantic: { row: any; similarity: number }[] = []
// //   try {
// //     const embedding = await embedQuery(query)
// //     semantic = await vectorSearch(embedding, filters, limit, threshold)
// //   } catch (err) {
// //     console.error('❌ Recherche vectorielle indisponible :', err)
// //   }

// //   let merged = semantic
// //   let searchType: SearchType = 'semantic'

// //   if (semantic.length < Math.min(limit, 5)) {
// //     const text = await textSearch(query, filters, Math.max(limit, 15))
// //     const seen = new Set(semantic.map((s) => s.row.id))
// //     merged = [...semantic]
    
// //     for (const t of text) {
// //       // On vérifie STRICTEMENT le seuil
// //       if (t.similarity >= threshold && !seen.has(t.row.id) && merged.length < limit) {
// //         merged.push(t)
// //         seen.add(t.row.id)
// //       }
// //     }
// //     searchType = semantic.length > 0 ? 'hybrid' : 'text'
// //   }

// //   const results = merged
// //     .filter(({ row }) => row && typeof row.id === 'number' && row.titre?.trim())
// //     .map(({ row, similarity }, i) => enrich(row, similarity, query, i))

// //   return { results, searchType }
// // }

// // lib/tfc-search.ts
// // Recherche partagée par /api/chat, /api/semantic-chat et /api/semantic-recherche
// // (aucun appel HTTP interne).
// //
// // Principe : on lance TOUJOURS la recherche vectorielle et la recherche par mots-clés,
// // puis on classe avec un score hybride :
// //   score = sémantique × (0.4 + 0.6 × lexical)
// // - sémantique : cosinus recalibré entre SEM_FLOOR et SEM_CEIL (0 à 1)
// // - lexical    : part des mots de la requête retrouvés dans le TFC, pondérée par leur
// //                rareté (un mot que presque aucun TFC ne contient, ex. « blockchain »,
// //                pèse beaucoup plus qu'un mot banal comme « sécurité »).
// // Un TFC proche « en gros » mais qui n'a pas le mot rare est donc fortement pénalisé.

// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { supabase } from '@/lib/supabase'
// import { embedQuery } from '@/lib/embeddings'

// export interface SearchFilters {
//   faculte_id?: number
//   departement_id?: number
//   filiere_id?: number
//   annee_academique_id?: number
//   auteur?: string
//   promoteur?: string
// }

// export type SearchType = 'semantic' | 'hybrid' | 'text'

// export type TfcResult = Record<string, any> & { id: number; titre: string; similarity: number }

// type MatchType = 'semantic' | 'text'
// type Candidate = { row: any; sem: number | null }

// /* -------------------------------- Constantes ------------------------------ */

// // Cosinus (requête → document) en dessous duquel il n'y a aucun lien sémantique,
// // et cosinus à partir duquel le document est considéré comme très proche.
// // À ajuster avec le log ci-dessous si besoin.
// const SEM_FLOOR = 0.2
// const SEM_CEIL = 0.55

// // Seuil large côté base : on récupère les candidats, le vrai filtrage se fait ensuite
// const CANDIDATE_THRESHOLD = 0.1
// const DEFAULT_THRESHOLD = 0.3

// const TFC_SELECT = `
//   id, titre, auteur, promoteur, statut, resume, mots_cles, technologies,
//   fonctionnalites, cas_application, fichier_chemin, note,
//   facultes:faculte_id(nom, code),
//   departements:departement_id(nom, code),
//   filieres:filiere_id(nom, code),
//   annees_academiques:annee_academique_id(annee)
// `

// const STOPWORDS = new Set([
//   'les', 'des', 'une', 'aux', 'que', 'qui', 'quoi', 'quel', 'quels', 'quelle', 'quelles',
//   'dans', 'sur', 'sous', 'avec', 'sans', 'pour', 'par', 'est', 'sont', 'etre', 'être',
//   'parle', 'parlent', 'parler', 'traite', 'traitent', 'propose', 'proposer', 'trouve',
//   'trouvez', 'trouver', 'moi', 'toi', 'nous', 'vous', 'ils', 'elles', 'ces', 'cet', 'cette',
//   'mon', 'ton', 'son', 'mes', 'tes', 'ses', 'leur', 'leurs', 'plus', 'moins', 'tout', 'tous',
//   'comme', 'mais', 'donc', 'ainsi', 'aussi', 'peut', 'peux', 'faire', 'fait', 'sujet',
//   'sujets', 'travaux', 'travail', 'tfc', 'recherche', 'cherche', 'donne', 'liste',
//   'the', 'and', 'for', 'et',
// ])

// /* ------------------------------- Utilitaires ------------------------------ */

// const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

// const normalize = (s: string) =>
//   s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

// // Préfixe de 6 lettres sans accent : « sécurité » et « sécurisation » → « securi »
// const stemOf = (w: string) => normalize(w).slice(0, 6)

// export function extractTerms(query: string): string[] {
//   const words = query
//     .toLowerCase()
//     .replace(/[^a-zA-Z0-9À-ÖØ-öø-ÿ\s-]/g, ' ')
//     .split(/\s+/)
//     .map((w) => w.replace(/^-+|-+$/g, ''))
//     .filter((w) => w.length > 2 && !STOPWORDS.has(w))
//   return Array.from(new Set(words)).slice(0, 6)
// }

// function applyFilters(query: any, filters: SearchFilters) {
//   let q = query
//   if (filters.faculte_id) q = q.eq('faculte_id', filters.faculte_id)
//   if (filters.departement_id) q = q.eq('departement_id', filters.departement_id)
//   if (filters.filiere_id) q = q.eq('filiere_id', filters.filiere_id)
//   if (filters.annee_academique_id) q = q.eq('annee_academique_id', filters.annee_academique_id)
//   if (filters.auteur) q = q.ilike('auteur', `%${filters.auteur.replace(/[%,()]/g, ' ')}%`)
//   if (filters.promoteur) q = q.ilike('promoteur', `%${filters.promoteur.replace(/[%,()]/g, ' ')}%`)
//   return q
// }

// function formatSummary(summary: string | null, maxLength = 200): string {
//   if (!summary) return 'Aucun résumé disponible'
//   const clean = summary.trim()
//   return clean.length <= maxLength ? clean : `${clean.substring(0, maxLength)}...`
// }

// function enrich(row: any, score01: number, index: number, matchType: MatchType): TfcResult {
//   const percent = Math.round(clamp01(score01) * 100)

//   return {
//     ...row,
//     similarity: percent,
//     relevance_score: percent,
//     match_type: matchType,
//     ranking_position: index + 1,

//     display_title: row.titre?.trim() || 'Titre non disponible',
//     display_author: row.auteur || 'Auteur non spécifié',
//     display_faculty: row.facultes?.nom || 'Non spécifié',
//     display_department: row.departements?.nom || 'Non spécifié',
//     display_program: row.filieres?.nom || 'Non spécifié',
//     display_year: row.annees_academiques?.annee || 'Non spécifié',
//     display_promotor: row.promoteur || 'Non spécifié',

//     summary: formatSummary(row.resume),
//     abstract: row.resume ? formatSummary(row.resume, 250) : 'Aucun résumé disponible',
//     keywords: row.mots_cles?.slice(0, 6) || [],
//     technologies: row.technologies?.slice(0, 8) || [],
//     fonctionnalites: row.fonctionnalites?.slice(0, 10) || [],

//     has_pdf: !!row.fichier_chemin,
//     has_abstract: !!row.resume,
//     has_keywords: (row.mots_cles?.length || 0) > 0,
//     has_technologies: (row.technologies?.length || 0) > 0,
//     application_case: row.cas_application || 'Non spécifié',
//   }
// }

// /* ------------------------------ Scoring hybride --------------------------- */

// function docText(row: any): string {
//   return normalize(
//     [
//       row.titre,
//       row.resume,
//       (row.mots_cles ?? []).join(' '),
//       (row.technologies ?? []).join(' '),
//       (row.fonctionnalites ?? []).join(' '),
//     ].join(' ')
//   )
// }

// function hasStem(text: string, stem: string): boolean {
//   return new RegExp(`\\b${stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(text)
// }

// function scoreCandidates(
//   candidates: Candidate[],
//   query: string,
//   semanticAvailable: boolean
// ): { row: any; score: number; matchType: MatchType }[] {
//   const stems = extractTerms(query).map(stemOf)
//   const texts = candidates.map((c) => docText(c.row))

//   // Poids IDF : un terme présent dans peu de TFC compte plus.
//   // Un terme présent nulle part (ex. « blockchain ») a le poids maximal
//   // et pénalise donc tous les TFC qui ne l'ont pas.
//   const N = Math.max(candidates.length, 1)
//   const weights = stems.map((st) => {
//     const df = texts.filter((t) => hasStem(t, st)).length
//     return Math.log(1 + N / Math.max(df, 0.5))
//   })
//   const totalWeight = weights.reduce((a, b) => a + b, 0)

//   const normQuery = normalize(query).trim()

//   return candidates.map((c, i) => {
//     const lex =
//       totalWeight > 0
//         ? stems.reduce((acc, st, k) => acc + (hasStem(texts[i], st) ? weights[k] : 0), 0) /
//           totalWeight
//         : 0

//     // Un TFC trouvé uniquement par mots-clés n'a pas de cosinus : valeur neutre
//     const sem = c.sem === null ? 0.5 : clamp01((c.sem - SEM_FLOOR) / (SEM_CEIL - SEM_FLOOR))

//     let score: number
//     if (totalWeight === 0) score = sem // requête sans terme exploitable : sémantique seul
//     else if (!semanticAvailable) score = lex // embedding en panne : mots-clés seuls
//     else score = sem * (0.4 + 0.6 * lex) // le lexical module le sémantique

//     // Bonus si la requête entière figure dans le titre
//     if (normQuery && normalize(c.row.titre ?? '').includes(normQuery)) score += 0.1

//     return {
//       row: c.row,
//       score: clamp01(score),
//       matchType: c.sem === null ? 'text' : 'semantic',
//     }
//   })
// }

// /* ------------------------------ Recherches ------------------------------- */

// function pickColumns(row: any) {
//   return {
//     id: row.id,
//     titre: row.titre,
//     auteur: row.auteur,
//     promoteur: row.promoteur,
//     statut: row.statut,
//     resume: row.resume,
//     mots_cles: row.mots_cles,
//     technologies: row.technologies,
//     fonctionnalites: row.fonctionnalites,
//     cas_application: row.cas_application,
//     fichier_chemin: row.fichier_chemin,
//     note: row.note,
//     facultes: { nom: row.faculte_nom },
//     departements: { nom: row.departement_nom },
//     filieres: { nom: row.filiere_nom },
//     annees_academiques: { annee: row.annee_academique },
//   }
// }

// async function vectorSearch(
//   embedding: number[],
//   filters: SearchFilters,
//   limit: number,
//   threshold: number
// ): Promise<{ row: any; similarity: number }[]> {
//   const params: Record<string, unknown> = {
//     query_embedding: embedding,
//     similarity_threshold: threshold,
//     match_count: limit,
//   }
//   if (filters.faculte_id) params.filter_faculte_id = filters.faculte_id
//   if (filters.departement_id) params.filter_departement_id = filters.departement_id
//   if (filters.filiere_id) params.filter_filiere_id = filters.filiere_id
//   if (filters.annee_academique_id) params.filter_annee_academique_id = filters.annee_academique_id
//   if (filters.auteur) params.filter_auteur = filters.auteur
//   if (filters.promoteur) params.filter_promoteur = filters.promoteur

//   const { data, error } = await supabase.rpc('semantic_search_tfc_v2', params)
//   if (error) throw new Error(`semantic_search_tfc_v2 : ${error.message}`)

//   return ((data ?? []) as any[]).map((r) => ({
//     row: pickColumns(r),
//     similarity: Number(r.similarity) || 0,
//   }))
// }

// // Candidats par mots-clés : le scoring (lexical pondéré) se fait ensuite dans scoreCandidates
// async function textSearch(query: string, filters: SearchFilters, limit: number): Promise<any[]> {
//   const terms = extractTerms(query)
//   if (terms.length === 0) return []

//   const conditions = terms
//     .map((t) => {
//       const p = t.slice(0, 6) // préfixe : couvre sécurité / sécurisation
//       return `titre.ilike.%${p}%,resume.ilike.%${p}%,mots_cles.cs.{${t}},technologies.cs.{${t}}`
//     })
//     .join(',')

//   let q = supabase
//     .from('tfc')
//     .select(TFC_SELECT)
//     .eq('statut', 'approuvé')
//     .or(conditions)
//     .limit(limit)
//   q = applyFilters(q, filters)

//   const { data, error } = await q
//   if (error) {
//     console.error('❌ Recherche textuelle :', error.message)
//     return []
//   }
//   return data ?? []
// }

// /* --------------------------------- Public --------------------------------- */

// export async function searchTFCs(options: {
//   query: string
//   limit?: number
//   similarityThreshold?: number
//   filters?: SearchFilters
// }): Promise<{ results: TfcResult[]; searchType: SearchType }> {
//   const query = options.query.trim()
//   const limit = Math.min(Math.max(options.limit ?? 20, 1), 50)
//   const threshold = options.similarityThreshold ?? DEFAULT_THRESHOLD
//   const filters = options.filters ?? {}

//   // Les deux recherches tournent toujours, en parallèle.
//   const [vector, lexicalRows] = await Promise.all([
//     (async () => {
//       try {
//         const embedding = await embedQuery(query)
//         const rows = await vectorSearch(
//           embedding,
//           filters,
//           Math.max(limit, 50),
//           CANDIDATE_THRESHOLD
//         )
//         return { rows, ok: true }
//       } catch (err) {
//         console.error('❌ Recherche vectorielle indisponible :', err)
//         return { rows: [] as { row: any; similarity: number }[], ok: false }
//       }
//     })(),
//     textSearch(query, filters, 50),
//   ])

//   const semantic = vector.rows

//   // 👇 LOG TEMPORAIRE pour calibrer SEM_FLOOR / SEM_CEIL (à supprimer ensuite)
//   console.log(
//     `[search] "${query}"`,
//     semantic.slice(0, 10).map((s) => `${s.similarity.toFixed(2)} ${String(s.row.titre).slice(0, 40)}`)
//   )

//   const byId = new Map<number, Candidate>()
//   for (const s of semantic) byId.set(s.row.id, { row: s.row, sem: s.similarity })
//   for (const row of lexicalRows) {
//     if (!byId.has(row.id)) byId.set(row.id, { row, sem: null })
//   }

//   const scored = scoreCandidates(Array.from(byId.values()), query, vector.ok)
//     .filter(
//       ({ row, score }) =>
//         row && typeof row.id === 'number' && row.titre?.trim() && score >= threshold
//     )
//     .sort((a, b) => b.score - a.score)
//     .slice(0, limit)

//   const results = scored.map(({ row, score, matchType }, i) => enrich(row, score, i, matchType))

//   const searchType: SearchType =
//     !vector.ok || semantic.length === 0
//       ? 'text'
//       : scored.some((s) => s.matchType === 'text')
//         ? 'hybrid'
//         : 'semantic'

//   return { results, searchType }
// }


// lib/tfc-search.ts
// Recherche partagée par /api/chat, /api/semantic-chat et /api/semantic-recherche
// (aucun appel HTTP interne).
//
// Principe : on lance TOUJOURS la recherche vectorielle et la recherche par mots-clés,
// puis on classe avec un score hybride :
//   score = sémantique × (0.4 + 0.6 × lexical)
// - sémantique : cosinus recalibré entre SEM_FLOOR et SEM_CEIL (0 à 1)
// - lexical    : part des mots de la requête retrouvés dans le TFC, pondérée par leur
//                rareté (un mot que presque aucun TFC ne contient, ex. « blockchain »,
//                pèse beaucoup plus qu'un mot banal comme « sécurité »).
// Un TFC proche « en gros » mais qui n'a pas le mot rare est donc fortement pénalisé.

/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase'
import { embedQuery } from '@/lib/embeddings'

export interface SearchFilters {
  faculte_id?: number
  departement_id?: number
  filiere_id?: number
  annee_academique_id?: number
  auteur?: string
  promoteur?: string
}

export type SearchType = 'semantic' | 'hybrid' | 'text'

export type TfcResult = Record<string, any> & { id: number; titre: string; similarity: number }

type MatchType = 'semantic' | 'text'
type Candidate = { row: any; sem: number | null }

/* -------------------------------- Constantes ------------------------------ */

// Cosinus (requête → document) en dessous duquel il n'y a aucun lien sémantique,
// et cosinus à partir duquel le document est considéré comme très proche.
// À ajuster avec le log ci-dessous si besoin.
const SEM_FLOOR = 0.2
const SEM_CEIL = 0.55

// Seuil large côté base : on récupère les candidats, le vrai filtrage se fait ensuite
const CANDIDATE_THRESHOLD = 0.1

// Pertinence minimale par défaut (score final, 0 à 1)
const DEFAULT_THRESHOLD = 0.3

const TFC_SELECT = `
  id, titre, auteur, promoteur, statut, resume, mots_cles, technologies,
  fonctionnalites, cas_application, fichier_chemin, note,
  facultes:faculte_id(nom, code),
  departements:departement_id(nom, code),
  filieres:filiere_id(nom, code),
  annees_academiques:annee_academique_id(annee)
`

const STOPWORDS = new Set([
  'les', 'des', 'une', 'aux', 'que', 'qui', 'quoi', 'quel', 'quels', 'quelle', 'quelles',
  'dans', 'sur', 'sous', 'avec', 'sans', 'pour', 'par', 'est', 'sont', 'etre', 'être',
  'parle', 'parlent', 'parler', 'traite', 'traitent', 'propose', 'proposer', 'trouve',
  'trouvez', 'trouver', 'moi', 'toi', 'nous', 'vous', 'ils', 'elles', 'ces', 'cet', 'cette',
  'mon', 'ton', 'son', 'mes', 'tes', 'ses', 'leur', 'leurs', 'plus', 'moins', 'tout', 'tous',
  'comme', 'mais', 'donc', 'ainsi', 'aussi', 'peut', 'peux', 'faire', 'fait', 'sujet',
  'sujets', 'travaux', 'travail', 'tfc', 'recherche', 'cherche', 'donne', 'liste',
  'the', 'and', 'for', 'et',
])

/* ------------------------------- Utilitaires ------------------------------ */

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

// Préfixe de 6 lettres sans accent : « sécurité » et « sécurisation » → « securi »
const stemOf = (w: string) => normalize(w).slice(0, 6)

export function extractTerms(query: string): string[] {
  const words = query
    .toLowerCase()
    .replace(/[^a-zA-Z0-9À-ÖØ-öø-ÿ\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^-+|-+$/g, ''))
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
  return Array.from(new Set(words)).slice(0, 6)
}

function applyFilters(query: any, filters: SearchFilters) {
  let q = query
  if (filters.faculte_id) q = q.eq('faculte_id', filters.faculte_id)
  if (filters.departement_id) q = q.eq('departement_id', filters.departement_id)
  if (filters.filiere_id) q = q.eq('filiere_id', filters.filiere_id)
  if (filters.annee_academique_id) q = q.eq('annee_academique_id', filters.annee_academique_id)
  if (filters.auteur) q = q.ilike('auteur', `%${filters.auteur.replace(/[%,()]/g, ' ')}%`)
  if (filters.promoteur) q = q.ilike('promoteur', `%${filters.promoteur.replace(/[%,()]/g, ' ')}%`)
  return q
}

function formatSummary(summary: string | null, maxLength = 200): string {
  if (!summary) return 'Aucun résumé disponible'
  const clean = summary.trim()
  return clean.length <= maxLength ? clean : `${clean.substring(0, maxLength)}...`
}

function enrich(row: any, score01: number, index: number, matchType: MatchType): TfcResult {
  const percent = Math.round(clamp01(score01) * 100)

  return {
    ...row,
    similarity: percent,
    relevance_score: percent,
    match_type: matchType,
    ranking_position: index + 1,

    display_title: row.titre?.trim() || 'Titre non disponible',
    display_author: row.auteur || 'Auteur non spécifié',
    display_faculty: row.facultes?.nom || 'Non spécifié',
    display_department: row.departements?.nom || 'Non spécifié',
    display_program: row.filieres?.nom || 'Non spécifié',
    display_year: row.annees_academiques?.annee || 'Non spécifié',
    display_promotor: row.promoteur || 'Non spécifié',

    summary: formatSummary(row.resume),
    abstract: row.resume ? formatSummary(row.resume, 250) : 'Aucun résumé disponible',
    keywords: row.mots_cles?.slice(0, 6) || [],
    technologies: row.technologies?.slice(0, 8) || [],
    fonctionnalites: row.fonctionnalites?.slice(0, 10) || [],

    has_pdf: !!row.fichier_chemin,
    has_abstract: !!row.resume,
    has_keywords: (row.mots_cles?.length || 0) > 0,
    has_technologies: (row.technologies?.length || 0) > 0,
    application_case: row.cas_application || 'Non spécifié',
  }
}

/* ------------------------------ Scoring hybride --------------------------- */

function docText(row: any): string {
  return normalize(
    [
      row.titre,
      row.resume,
      (row.mots_cles ?? []).join(' '),
      (row.technologies ?? []).join(' '),
      (row.fonctionnalites ?? []).join(' '),
    ].join(' ')
  )
}

function hasStem(text: string, stem: string): boolean {
  return new RegExp(`\\b${stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(text)
}

function scoreCandidates(
  candidates: Candidate[],
  query: string,
  semanticAvailable: boolean
): { row: any; score: number; matchType: MatchType }[] {
  const stems = extractTerms(query).map(stemOf)
  const texts = candidates.map((c) => docText(c.row))

  // Poids IDF : un terme présent dans peu de TFC compte plus.
  // Un terme présent nulle part (ex. « blockchain ») a le poids maximal
  // et pénalise donc tous les TFC qui ne l'ont pas.
  const N = Math.max(candidates.length, 1)
  const weights = stems.map((st) => {
    const df = texts.filter((t) => hasStem(t, st)).length
    return Math.log(1 + N / Math.max(df, 0.5))
  })
  const totalWeight = weights.reduce((a, b) => a + b, 0)

  const normQuery = normalize(query).trim()

  return candidates.map((c, i) => {
    const lex =
      totalWeight > 0
        ? stems.reduce((acc, st, k) => acc + (hasStem(texts[i], st) ? weights[k] : 0), 0) /
          totalWeight
        : 0

    // Un TFC trouvé uniquement par mots-clés n'a pas de cosinus : valeur neutre
    const sem = c.sem === null ? 0.5 : clamp01((c.sem - SEM_FLOOR) / (SEM_CEIL - SEM_FLOOR))

    let score: number
    if (totalWeight === 0) score = sem // requête sans terme exploitable : sémantique seul
    else if (!semanticAvailable) score = lex // embedding en panne : mots-clés seuls
    else score = sem * (0.4 + 0.6 * lex) // le lexical module le sémantique

    // Bonus si la requête entière figure dans le titre
    if (normQuery && normalize(c.row.titre ?? '').includes(normQuery)) score += 0.1

    return {
      row: c.row,
      score: clamp01(score),
      matchType: c.sem === null ? 'text' : 'semantic',
    }
  })
}

/* ------------------------------ Recherches ------------------------------- */

function pickColumns(row: any) {
  return {
    id: row.id,
    titre: row.titre,
    auteur: row.auteur,
    promoteur: row.promoteur,
    statut: row.statut,
    resume: row.resume,
    mots_cles: row.mots_cles,
    technologies: row.technologies,
    fonctionnalites: row.fonctionnalites,
    cas_application: row.cas_application,
    fichier_chemin: row.fichier_chemin,
    note: row.note,
    facultes: { nom: row.faculte_nom },
    departements: { nom: row.departement_nom },
    filieres: { nom: row.filiere_nom },
    annees_academiques: { annee: row.annee_academique },
  }
}

async function vectorSearch(
  embedding: number[],
  filters: SearchFilters,
  limit: number,
  threshold: number
): Promise<{ row: any; similarity: number }[]> {
  const params: Record<string, unknown> = {
    query_embedding: embedding,
    similarity_threshold: threshold,
    match_count: limit,
  }
  if (filters.faculte_id) params.filter_faculte_id = filters.faculte_id
  if (filters.departement_id) params.filter_departement_id = filters.departement_id
  if (filters.filiere_id) params.filter_filiere_id = filters.filiere_id
  if (filters.annee_academique_id) params.filter_annee_academique_id = filters.annee_academique_id
  if (filters.auteur) params.filter_auteur = filters.auteur
  if (filters.promoteur) params.filter_promoteur = filters.promoteur

  const { data, error } = await supabase.rpc('semantic_search_tfc_v2', params)
  if (error) throw new Error(`semantic_search_tfc_v2 : ${error.message}`)

  return ((data ?? []) as any[]).map((r) => ({
    row: pickColumns(r),
    similarity: Number(r.similarity) || 0,
  }))
}

// Candidats par mots-clés : le scoring (lexical pondéré) se fait ensuite dans scoreCandidates
async function textSearch(query: string, filters: SearchFilters, limit: number): Promise<any[]> {
  const terms = extractTerms(query)
  if (terms.length === 0) return []

  const conditions = terms
    .map((t) => {
      const p = t.slice(0, 6) // préfixe : couvre sécurité / sécurisation
      return `titre.ilike.%${p}%,resume.ilike.%${p}%,mots_cles.cs.{${t}},technologies.cs.{${t}}`
    })
    .join(',')

  let q = supabase
    .from('tfc')
    .select(TFC_SELECT)
    .eq('statut', 'approuvé')
    .or(conditions)
    .limit(limit)
  q = applyFilters(q, filters)

  const { data, error } = await q
  if (error) {
    console.error('❌ Recherche textuelle :', error.message)
    return []
  }
  return data ?? []
}

/* --------------------------------- Public --------------------------------- */

export async function searchTFCs(options: {
  query: string
  limit?: number
  similarityThreshold?: number
  filters?: SearchFilters
}): Promise<{ results: TfcResult[]; searchType: SearchType }> {
  const query = options.query.trim()
  const limit = Math.min(Math.max(options.limit ?? 20, 1), 50)
  const threshold = options.similarityThreshold ?? DEFAULT_THRESHOLD
  const filters = options.filters ?? {}

  // Les deux recherches tournent toujours, en parallèle.
  const [vector, lexicalRows] = await Promise.all([
    (async () => {
      try {
        const embedding = await embedQuery(query)
        const rows = await vectorSearch(
          embedding,
          filters,
          Math.max(limit, 50),
          CANDIDATE_THRESHOLD
        )
        return { rows, ok: true }
      } catch (err) {
        console.error('❌ Recherche vectorielle indisponible :', err)
        return { rows: [] as { row: any; similarity: number }[], ok: false }
      }
    })(),
    textSearch(query, filters, 50),
  ])

  const semantic = vector.rows

  // 👇 LOG TEMPORAIRE pour calibrer SEM_FLOOR / SEM_CEIL (à supprimer ensuite)
  console.log(
    `[search] "${query}"`,
    semantic.slice(0, 10).map((s) => `${s.similarity.toFixed(2)} ${String(s.row.titre).slice(0, 40)}`)
  )

  const byId = new Map<number, Candidate>()
  for (const s of semantic) byId.set(s.row.id, { row: s.row, sem: s.similarity })
  for (const row of lexicalRows) {
    if (!byId.has(row.id)) byId.set(row.id, { row, sem: null })
  }

  const scored = scoreCandidates(Array.from(byId.values()), query, vector.ok)
    .filter(
      ({ row, score }) =>
        row && typeof row.id === 'number' && row.titre?.trim() && score >= threshold
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  const results = scored.map(({ row, score, matchType }, i) => enrich(row, score, i, matchType))

  const searchType: SearchType =
    !vector.ok || semantic.length === 0
      ? 'text'
      : scored.some((s) => s.matchType === 'text')
        ? 'hybrid'
        : 'semantic'

  return { results, searchType }
}
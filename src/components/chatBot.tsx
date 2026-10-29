
// 'use client'

// import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
// import { AnimatePresence, motion } from 'framer-motion'
// import ReactMarkdown, { type Components } from 'react-markdown'
// import remarkGfm from 'remark-gfm'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import {
//   AlertCircle,
//   ArrowDown,
//   ArrowLeft,
//   ArrowUp,
//   BookOpen,
//   Check,
//   ChevronDown,
//   Copy,
//   GraduationCap,
//   Loader2,
//   Mic,
//   PanelLeft,
//   Plus,
//   RotateCw,
//   Search,
//   Square,
//   ThumbsDown,
//   ThumbsUp,
//   Volume2,
//   VolumeX,
//   X,
// } from 'lucide-react'
// import LottieAnimation from './LottieAnimation'
// import ThemeSwitch from './ThemeSwitch'

// /* -------------------------------------------------------------------------- */
// /*                                   Types                                    */
// /* -------------------------------------------------------------------------- */

// interface Message {
//   id: number
//   role: 'user' | 'assistant'
//   content: string
//   tfc_references?: number[]
//   created_at: string
//   feedback?: 'positive' | 'negative'
//   error?: boolean
//   streaming?: boolean
// }

// interface TFCReference {
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

// interface User {
//   id: string
//   name: string
//   email: string
//   role: string
//   profil_url?: string
// }

// interface Conversation {
//   id: number
//   title: string
//   created_at: string
//   updated_at: string
//   chat_messages?: Message[]
// }

// type StreamEvent =
//   | { type: 'meta'; conversationId: number }
//   | { type: 'delta'; text: string }
//   | { type: 'done'; conversationId: number; references: TFCReference[] }
//   | { type: 'error'; message: string }

// // Interfaces pour la Web Speech API
// interface SpeechRecognitionEventLike {
//   results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>
// }
// interface SpeechRecognitionLike {
//   lang: string
//   continuous: boolean
//   interimResults: boolean
//   onresult: ((event: SpeechRecognitionEventLike) => void) | null
//   onerror: ((event: { error: string }) => void) | null
//   onend: (() => void) | null
//   start: () => void
//   stop: () => void
//   abort: () => void
// }
// type SpeechRecognitionCtor = new () => SpeechRecognitionLike

// const getSpeechRecognition = (): SpeechRecognitionCtor | null => {
//   if (typeof window === 'undefined') return null
//   const w = window as unknown as {
//     SpeechRecognition?: SpeechRecognitionCtor
//     webkitSpeechRecognition?: SpeechRecognitionCtor
//   }
//   return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
// }

// /* -------------------------------------------------------------------------- */
// /*                                 Constantes                                 */
// /* -------------------------------------------------------------------------- */

// const SIMILARITY_THRESHOLDS = [5, 20, 30, 40, 50]
// const DEFAULT_THRESHOLD = 5
// const DESKTOP_BREAKPOINT = 1024

// const SUGGESTIONS = [
//   "Quels TFC parlent de l'intelligence artificielle ?",
//   'Trouvez-moi des travaux sur la blockchain',
//   'Propose un sujet en cybersécurité',
//   'Recherche des TFC avec React et Node.js',
// ]

// /* -------------------------------------------------------------------------- */
// /*                                  Helpers                                   */
// /* -------------------------------------------------------------------------- */

// const formatTime = (iso: string) =>
//   new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

// const getInitials = (name: string) =>
//   name
//     .split(' ')
//     .filter(Boolean)
//     .map((part) => part.charAt(0).toUpperCase())
//     .join('')
//     .slice(0, 2)

// const passesThreshold = (ref: TFCReference, threshold: number) =>
//   ref.similarity === null || ref.similarity >= threshold

// function groupConversations(list: Conversation[]) {
//   const DAY = 86_400_000
//   const now = new Date()
//   const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

//   const groups: { label: string; items: Conversation[] }[] = [
//     { label: "Aujourd'hui", items: [] },
//     { label: 'Hier', items: [] },
//     { label: '7 derniers jours', items: [] },
//     { label: 'Plus ancien', items: [] },
//   ]

//   const sorted = [...list].sort(
//     (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
//   )

//   for (const conv of sorted) {
//     const t = new Date(conv.updated_at).getTime()
//     if (t >= startOfToday) groups[0].items.push(conv)
//     else if (t >= startOfToday - DAY) groups[1].items.push(conv)
//     else if (t >= startOfToday - 7 * DAY) groups[2].items.push(conv)
//     else groups[3].items.push(conv)
//   }

//   return groups.filter((g) => g.items.length > 0)
// }

// const CITATION_GROUP = /\(\s*((?:ID\s*:\s*\d+\s*[,;]?\s*)+)\)/gi
// function linkifyCitations(text: string): string {
//   return text.replace(CITATION_GROUP, (_match, group: string) => {
//     const ids = Array.from(group.matchAll(/\d+/g), (m) => m[0])
//     return ids.map((id) => `[ID ${id}](#tfc-${id})`).join(' ')
//   })
// }

// /* ----------------------------- Lecture vocale ----------------------------- */

// const speechSynthesisSupported = () =>
//   typeof window !== 'undefined' &&
//   'speechSynthesis' in window &&
//   typeof SpeechSynthesisUtterance !== 'undefined'

// function toSpeakableText(markdown: string): string {
//   return markdown
//     .replace(/```[\s\S]*?```/g, ' ')
//     .replace(/\(\s*(?:ID\s*:\s*\d+\s*[,;]?\s*)+\)/gi, '')
//     .replace(/`([^`]*)`/g, '$1')
//     .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
//     .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
//     .replace(/^\s{0,3}#{1,6}\s+/gm, '')
//     .replace(/^\s*[-*+]\s+/gm, '')
//     .replace(/^\s*\d+\.\s+/gm, '')
//     .replace(/^\s*>\s?/gm, '')
//     .replace(/^[\s|:-]*-{3,}[\s|:-]*$/gm, '')
//     .replace(/\|/g, ', ')
//     .replace(/[*_~]{1,3}/g, '')
//     .replace(/[ \t]+/g, ' ')
//     .trim()
// }

// function chunkForSpeech(text: string, max = 180): string[] {
//   const chunks: string[] = []
//   for (const line of text.split(/\n+/)) {
//     const clean = line.trim()
//     if (!clean) continue
//     const sentences = clean.match(/[^.!?…]+[.!?…]*\s*/g) ?? [clean]
//     let current = ''
//     for (const sentence of sentences) {
//       if (current && (current + sentence).length > max) {
//         chunks.push(current.trim())
//         current = ''
//       }
//       current += sentence
//       while (current.length > max) {
//         const space = current.lastIndexOf(' ', max)
//         const cut = space > 40 ? space : max
//         chunks.push(current.slice(0, cut).trim())
//         current = current.slice(cut)
//       }
//     }
//     if (current.trim()) chunks.push(current.trim())
//   }
//   return chunks
// }

// function pickFrenchVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
//   const french = voices.filter((v) => v.lang.toLowerCase().startsWith('fr'))
//   if (french.length === 0) return null
//   const score = (v: SpeechSynthesisVoice) =>
//     (/natural|online|neural/i.test(v.name) ? 4 : 0) +
//     (/google|premium|enhanced/i.test(v.name) ? 2 : 0) +
//     (v.lang.toLowerCase() === 'fr-fr' ? 1 : 0)
//   return [...french].sort((a, b) => score(b) - score(a))[0]
// }

// /* -------------------------------------------------------------------------- */
// /*                         Rendu Markdown (réponses IA)                       */
// /* -------------------------------------------------------------------------- */

// const PROSE_CLASSES = [
//   'text-[15px] leading-7 text-neutral-800 dark:text-neutral-200 break-words',
//   '[&_:not(pre)>code]:rounded-md [&_:not(pre)>code]:bg-neutral-100 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[13px]',
//   'dark:[&_:not(pre)>code]:bg-neutral-800',
// ].join(' ')

// const baseMarkdownComponents: Components = {
//   h1: ({ children }) => (
//     <h1 className="mb-3 mt-6 text-xl font-semibold tracking-tight text-neutral-900 first:mt-0 dark:text-neutral-50">
//       {children}
//     </h1>
//   ),
//   h2: ({ children }) => (
//     <h2 className="mb-2 mt-6 text-lg font-semibold tracking-tight text-neutral-900 first:mt-0 dark:text-neutral-50">
//       {children}
//     </h2>
//   ),
//   h3: ({ children }) => (
//     <h3 className="mb-2 mt-5 text-base font-semibold text-neutral-900 first:mt-0 dark:text-neutral-50">
//       {children}
//     </h3>
//   ),
//   h4: ({ children }) => (
//     <h4 className="mb-2 mt-4 text-[15px] font-semibold text-neutral-900 first:mt-0 dark:text-neutral-50">
//       {children}
//     </h4>
//   ),
//   p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
//   ul: ({ children }) => (
//     <ul className="mb-3 list-disc space-y-1 pl-5 marker:text-neutral-400 last:mb-0">{children}</ul>
//   ),
//   ol: ({ children }) => (
//     <ol className="mb-3 list-decimal space-y-1 pl-5 marker:text-neutral-400 last:mb-0">{children}</ol>
//   ),
//   li: ({ children }) => <li className="pl-1">{children}</li>,
//   strong: ({ children }) => (
//     <strong className="font-semibold text-neutral-900 dark:text-neutral-50">{children}</strong>
//   ),
//   blockquote: ({ children }) => (
//     <blockquote className="mb-3 border-l-2 border-neutral-300 pl-4 text-neutral-600 dark:border-neutral-600 dark:text-neutral-400">
//       {children}
//     </blockquote>
//   ),
//   hr: () => <hr className="my-5 border-neutral-200 dark:border-neutral-700" />,
//   pre: ({ children }) => (
//     <pre className="app-scroll mb-3 overflow-x-auto rounded-xl bg-neutral-950 p-4 font-mono text-[13px] leading-6 text-neutral-100 dark:border dark:border-neutral-700">
//       {children}
//     </pre>
//   ),
//   table: ({ children }) => (
//     <div className="app-scroll mb-3 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
//       <table className="min-w-full text-left text-sm">{children}</table>
//     </div>
//   ),
//   thead: ({ children }) => (
//     <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
//       {children}
//     </thead>
//   ),
//   tbody: ({ children }) => (
//     <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">{children}</tbody>
//   ),
//   th: ({ children }) => <th className="px-3 py-2 font-medium">{children}</th>,
//   td: ({ children }) => <td className="px-3 py-2 align-top">{children}</td>,
// }

// const Markdown = memo(function Markdown({
//   content,
//   messageId,
//   knownKey,
//   streaming,
//   onCite,
// }: {
//   content: string
//   messageId: number
//   knownKey: string
//   streaming: boolean
//   onCite: (messageId: number, tfcId: number) => void
// }) {
//   const knownIds = useMemo(() => new Set(knownKey ? knownKey.split(',').map(Number) : []), [knownKey])

//   const components = useMemo<Components>(
//     () => ({
//       ...baseMarkdownComponents,
//       a: ({ href, children }) => {
//         if (href?.startsWith('#tfc-')) {
//           const tfcId = Number(href.slice(5))
//           if (!streaming && !knownIds.has(tfcId)) {
//             return (
//               <span
//                 title="Ce TFC n’a pas été retrouvé dans les résultats de la recherche"
//                 className="mx-0.5 inline-flex items-center rounded-md bg-neutral-100 px-1.5 py-0.5 align-baseline text-xs font-medium text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
//               >
//                 {children}
//               </span>
//             )
//           }
//           return (
//             <button
//               type="button"
//               onClick={() => onCite(messageId, tfcId)}
//               className="mx-0.5 inline-flex items-center rounded-md bg-neutral-200/70 px-1.5 py-0.5 align-baseline text-xs font-medium text-neutral-800 transition-colors hover:bg-neutral-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:bg-neutral-700/70 dark:text-neutral-100 dark:hover:bg-neutral-600"
//             >
//               {children}
//             </button>
//           )
//         }
//         return (
//           <a
//             href={href}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-300"
//           >
//             {children}
//           </a>
//         )
//       },
//     }),
//     [messageId, onCite, knownIds, streaming]
//   )

//   const text = useMemo(() => linkifyCitations(content), [content])

//   return (
//     <div className={PROSE_CLASSES}>
//       <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
//         {text}
//       </ReactMarkdown>
//     </div>
//   )
// })

// /* -------------------------------------------------------------------------- */
// /*                              Petits composants                             */
// /* -------------------------------------------------------------------------- */

// function IconButton({
//   label,
//   onClick,
//   active,
//   activeClass = '',
//   children,
// }: {
//   label: string
//   onClick: () => void
//   active?: boolean
//   activeClass?: string
//   children: React.ReactNode
// }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       aria-label={label}
//       title={label}
//       aria-pressed={active}
//       className={`rounded-lg p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
//         active
//           ? activeClass
//           : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200'
//       }`}
//     >
//       {children}
//     </button>
//   )
// }

// function Avatar({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' }) {
//   const dimension = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm'
//   if (user.profil_url) {
//     return (
//       // eslint-disable-next-line @next/next/no-img-element
//       <img
//         src={user.profil_url}
//         alt={`Photo de ${user.name}`}
//         className={`${dimension} shrink-0 rounded-full object-cover`}
//       />
//     )
//   }
//   return (
//     <div
//       className={`${dimension} flex shrink-0 items-center justify-center rounded-full bg-neutral-900 font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900`}
//     >
//       {getInitials(user.name)}
//     </div>
//   )
// }

// /* -------------------------------------------------------------------------- */
// /*                                 Composant                                  */
// /* -------------------------------------------------------------------------- */

// export default function ChatBot() {
//   const router = useRouter()

//   const [messages, setMessages] = useState<Message[]>([])
//   const [conversationId, setConversationId] = useState<number>()
//   const [conversations, setConversations] = useState<Conversation[]>([])
//   const [referencesByMessage, setReferencesByMessage] = useState<Record<number, TFCReference[]>>({})
//   const [user, setUser] = useState<User | null>(null)
//   const [authChecked, setAuthChecked] = useState(false)

//   const [input, setInput] = useState('')
//   const [isLoading, setIsLoading] = useState(false)
//   const [isRecording, setIsRecording] = useState(false)
//   const [speakingId, setSpeakingId] = useState<number | null>(null)
//   const [ttsSupported, setTtsSupported] = useState(false)
//   const [loadingConversationId, setLoadingConversationId] = useState<number | null>(null)
//   const [sidebarOpen, setSidebarOpen] = useState(false)
//   const [conversationQuery, setConversationQuery] = useState('')
//   const [sourcesMessageId, setSourcesMessageId] = useState<number | null>(null)
//   const [expandedReference, setExpandedReference] = useState<number | null>(null)
//   const [similarityThreshold, setSimilarityThreshold] = useState(DEFAULT_THRESHOLD)
//   const [copiedId, setCopiedId] = useState<number | null>(null)
//   const [notice, setNotice] = useState('')
//   const [showScrollDown, setShowScrollDown] = useState(false)

//   const scrollRef = useRef<HTMLDivElement>(null)
//   const textareaRef = useRef<HTMLTextAreaElement>(null)
//   const abortRef = useRef<AbortController | null>(null)
  
//   // Refs pour la dictée vocale
//   const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
//   const isRecordingRef = useRef(false) // Pour savoir si l'utilisateur veut toujours enregistrer
//   const baseInputRef = useRef('')
  
//   const speechTokenRef = useRef(0)
//   const lastPromptRef = useRef('')
//   const stickToBottom = useRef(true)
//   const referencesRef = useRef(referencesByMessage)
//   referencesRef.current = referencesByMessage
//   const inputRef = useRef(input)
//   inputRef.current = input

//   const idCounterRef = useRef(Date.now())
//   const nextId = () => {
//     idCounterRef.current += 1
//     return idCounterRef.current
//   }

//   /* ------------------------------- Chargement ------------------------------ */

//   const loadUser = useCallback(async () => {
//     try {
//       const res = await fetch('/api/chat')
//       if (res.ok) {
//         const data = await res.json()
//         setUser(data.user)
//         setConversations(data.conversations || [])
//       } else {
//         setUser(null)
//       }
//     } catch (err) {
//       console.error('Erreur chargement utilisateur :', err)
//       setUser(null)
//     } finally {
//       setAuthChecked(true)
//     }
//   }, [])

//   const refreshConversations = useCallback(async () => {
//     try {
//       const res = await fetch('/api/chat')
//       if (res.ok) {
//         const data = await res.json()
//         setConversations(data.conversations || [])
//       }
//     } catch (err) {
//       console.error('Erreur rafraîchissement des conversations :', err)
//     }
//   }, [])

//   useEffect(() => {
//     if (window.innerWidth >= DESKTOP_BREAKPOINT) setSidebarOpen(true)
//     setTtsSupported(speechSynthesisSupported())
//     void loadUser()
//   }, [loadUser])

//   useEffect(() => {
//     if (authChecked && user === null) router.push('/auth/login')
//   }, [authChecked, user, router])

//   useEffect(() => {
//     if (authChecked && user && window.innerWidth >= DESKTOP_BREAKPOINT) {
//       textareaRef.current?.focus()
//     }
//   }, [authChecked, user])

//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key !== 'Escape') return
//       if (sourcesMessageId !== null) setSourcesMessageId(null)
//       else if (window.innerWidth < DESKTOP_BREAKPOINT) setSidebarOpen(false)
//     }
//     window.addEventListener('keydown', onKey)
//     return () => window.removeEventListener('keydown', onKey)
//   }, [sourcesMessageId])

//   useEffect(() => {
//     const el = textareaRef.current
//     if (!el) return
//     el.style.height = 'auto'
//     el.style.height = `${Math.min(el.scrollHeight, 200)}px`
//   }, [input])

//   useEffect(() => {
//     return () => {
//       isRecordingRef.current = false
//       const rec = recognitionRef.current
//       recognitionRef.current = null
//       rec?.abort()
//       abortRef.current?.abort()
//       if (speechSynthesisSupported()) window.speechSynthesis.cancel()
//     }
//   }, [])

//   /* -------------------------------- Défilement ----------------------------- */

//   const scrollToBottom = useCallback((smooth = true) => {
//     const el = scrollRef.current
//     if (!el) return
//     el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
//   }, [])

//   useEffect(() => {
//     if (stickToBottom.current) scrollToBottom(!isLoading)
//   }, [messages, isLoading, scrollToBottom])

//   const handleScroll = () => {
//     const el = scrollRef.current
//     if (!el) return
//     const distance = el.scrollHeight - el.scrollTop - el.clientHeight
//     stickToBottom.current = distance < 120
//     setShowScrollDown(distance > 300)
//   }

//   /* ------------------------------ Dictée vocale ----------------------------- */

//   const stopRecording = useCallback(() => {
//     isRecordingRef.current = false
//     setIsRecording(false)
//     if (recognitionRef.current) {
//       recognitionRef.current.stop()
//       recognitionRef.current = null
//     }
//     // On remet le focus sur le champ de texte
//     setTimeout(() => textareaRef.current?.focus(), 50)
//   }, [])

//   const startRecording = () => {
//     const Ctor = getSpeechRecognition()
//     if (!Ctor) {
//       setNotice('La dictée vocale n’est pas prise en charge par ce navigateur. Utilisez Chrome, Edge ou Safari.')
//       return
//     }

//     // Si une lecture vocale est en cours, on la coupe
//     stopSpeaking()

//     isRecordingRef.current = true
//     setIsRecording(true)
//     setNotice('')
    
//     // On mémorise le texte déjà présent pour ne pas l'écraser
//     baseInputRef.current = inputRef.current.trim() ? `${inputRef.current.replace(/\s+$/, '')} ` : ''

//     const recognition = new Ctor()
//     recognition.lang = 'fr-FR'
//     recognition.continuous = true
//     recognition.interimResults = true

//     recognition.onresult = (event) => {
//       if (!isRecordingRef.current) return
      
//       let finalText = ''
//       let interimText = ''
//       for (let i = 0; i < event.results.length; i++) {
//         const result = event.results[i]
//         if (result.isFinal) finalText += result[0].transcript
//         else interimText += result[0].transcript
//       }
      
//       const newText = (finalText + interimText).trimStart()
//       setInput(baseInputRef.current + newText)
//     }

//     recognition.onerror = (event) => {
//       // On ignore 'no-speech' et 'aborted' car ce sont des comportements normaux
//       if (event.error === 'no-speech' || event.error === 'aborted') return

//       if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
//         setNotice('Accès au micro refusé. Autorisez le micro dans les réglages du navigateur.')
//       } else if (event.error === 'audio-capture') {
//         setNotice('Aucun micro détecté. Branchez un micro puis réessayez.')
//       } else if (event.error === 'network') {
//         setNotice('La dictée vocale nécessite une connexion internet.')
//       } else {
//         setNotice('La dictée vocale a rencontré un problème. Réessayez.')
//       }
      
//       // En cas d'erreur bloquante, on arrête tout
//       stopRecording()
//     }

//     recognition.onend = () => {
//       // Si le navigateur coupe le flux (silence) mais qu'on veut toujours enregistrer,
//       // on relance la reconnaissance (sauf si on a appelé stopRecording manuellement)
//       if (isRecordingRef.current) {
//         // Petit délai pour éviter les boucles trop rapides
//         setTimeout(() => {
//           if (isRecordingRef.current) {
//             try {
//               recognition.start()
//             } catch {
//               stopRecording()
//             }
//           }
//         }, 150)
//       } else {
//         setIsRecording(false)
//       }
//     }

//     recognitionRef.current = recognition

//     try {
//       recognition.start()
//     } catch {
//       setNotice('Impossible de démarrer la dictée. Réessayez.')
//       stopRecording()
//     }
//   }

//   const toggleRecording = () => {
//     if (isRecording) {
//       stopRecording()
//     } else {
//       startRecording()
//     }
//   }

//   /* ------------------------------ Lecture vocale ---------------------------- */

//   const stopSpeaking = useCallback(() => {
//     speechTokenRef.current += 1
//     if (speechSynthesisSupported()) window.speechSynthesis.cancel()
//     setSpeakingId(null)
//   }, [])

//   const speakMessage = (message: Message) => {
//     if (!speechSynthesisSupported()) {
//       setNotice('La lecture vocale n’est pas prise en charge par ce navigateur.')
//       return
//     }
//     if (speakingId === message.id) {
//       stopSpeaking()
//       return
//     }

//     const chunks = chunkForSpeech(toSpeakableText(message.content))
//     if (chunks.length === 0) return

//     // On coupe le micro si on est en train d'enregistrer
//     if (isRecording) stopRecording()

//     window.speechSynthesis.cancel()
//     const token = ++speechTokenRef.current
//     const voice = pickFrenchVoice(window.speechSynthesis.getVoices())
//     setSpeakingId(message.id)

//     chunks.forEach((chunk, index) => {
//       const utterance = new SpeechSynthesisUtterance(chunk)
//       utterance.lang = voice?.lang ?? 'fr-FR'
//       if (voice) utterance.voice = voice
//       utterance.rate = 1
//       utterance.onend = () => {
//         if (speechTokenRef.current === token && index === chunks.length - 1) setSpeakingId(null)
//       }
//       utterance.onerror = (event) => {
//         if (speechTokenRef.current !== token) return
//         if (event.error === 'canceled' || event.error === 'interrupted') return
//         setSpeakingId(null)
//         setNotice('La lecture vocale a rencontré un problème.')
//       }
//       window.speechSynthesis.speak(utterance)
//     })
//   }

//   /* --------------------------------- Actions ------------------------------- */

//   const closeSidebarOnMobile = () => {
//     if (window.innerWidth < DESKTOP_BREAKPOINT) setSidebarOpen(false)
//   }

//   const stopGeneration = () => {
//     abortRef.current?.abort()
//     abortRef.current = null
//     setIsLoading(false)
//     setMessages((prev) =>
//       prev.some((m) => m.streaming)
//         ? prev.map((m) => (m.streaming ? { ...m, streaming: false } : m))
//         : prev
//     )
//   }

//   const startNewConversation = () => {
//     stopGeneration()
//     stopSpeaking()
//     stopRecording()
//     setMessages([])
//     setConversationId(undefined)
//     setReferencesByMessage({})
//     setSourcesMessageId(null)
//     setExpandedReference(null)
//     setNotice('')
//     stickToBottom.current = true
//     closeSidebarOnMobile()
//     textareaRef.current?.focus()
//   }

//   const loadConversation = async (id: number) => {
//     if (id === conversationId) {
//       closeSidebarOnMobile()
//       return
//     }
//     setLoadingConversationId(id)
//     try {
//       const res = await fetch(`/api/chat?conversationId=${id}`)
//       if (res.status === 401) {
//         router.push('/auth/login')
//         return
//       }
//       if (!res.ok) throw new Error(`Erreur ${res.status}`)
//       const data = await res.json()
//       stopGeneration()
//       stopSpeaking()
//       stopRecording()
//       setMessages(data.messages || [])
//       setConversationId(id)
//       setReferencesByMessage(data.references || {})
//       setSourcesMessageId(null)
//       setExpandedReference(null)
//       setNotice('')
//       stickToBottom.current = true
//       closeSidebarOnMobile()
//     } catch (err) {
//       console.error('Erreur chargement conversation :', err)
//       setNotice('Impossible de charger cette conversation. Réessayez dans un instant.')
//     } finally {
//       setLoadingConversationId(null)
//     }
//   }

//   const sendMessage = async (text: string, isRetry = false) => {
//     const prompt = text.trim()
//     if (!prompt || isLoading) return

//     lastPromptRef.current = prompt
//     stopSpeaking()
//     if (isRecording) stopRecording()
    
//     setIsLoading(true)
//     setNotice('')
//     stickToBottom.current = true

//     const userMessageId = nextId()
//     const assistantId = nextId()

//     if (!isRetry) {
//       const createdAt = new Date().toISOString()
//       setMessages((prev) => [
//         ...prev,
//         { id: userMessageId, role: 'user', content: prompt, created_at: createdAt },
//       ])
//     }

//     const controller = new AbortController()
//     abortRef.current = controller

//     let streamedText = ''
//     let finished = false

//     const upsertAssistant = (patch: Partial<Message>) =>
//       setMessages((prev) => {
//         const index = prev.findIndex((m) => m.id === assistantId && m.role === 'assistant')
//         if (index === -1) {
//           return [
//             ...prev,
//             {
//               id: assistantId,
//               role: 'assistant',
//               content: '',
//               created_at: new Date().toISOString(),
//               ...patch,
//             },
//           ]
//         }
//         const next = [...prev]
//         next[index] = { ...next[index], ...patch }
//         return next
//       })

//     try {
//       const res = await fetch('/api/chat', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ message: prompt, conversationId }),
//         signal: controller.signal,
//       })

//       if (res.status === 401) {
//         throw new Error('Session expirée. Reconnectez-vous pour continuer.')
//       }

//       const isStream = (res.headers.get('content-type') ?? '').includes('application/x-ndjson')
//       if (!res.ok || !isStream || !res.body) {
//         const data = await res.json().catch(() => ({}))
//         throw new Error(data.error || data.details || `Erreur ${res.status}`)
//       }

//       const handleLine = (line: string) => {
//         if (!line.trim()) return
//         let event: StreamEvent
//         try {
//           event = JSON.parse(line) as StreamEvent
//         } catch {
//           return
//         }

//         switch (event.type) {
//           case 'meta':
//             setConversationId(event.conversationId)
//             break
//           case 'delta':
//             streamedText += event.text
//             upsertAssistant({ content: streamedText, streaming: true })
//             break
//           case 'done': {
//             finished = true
//             const refs = event.references || []
//             upsertAssistant({
//               content: streamedText,
//               streaming: false,
//               tfc_references: refs.map((r) => r.id),
//             })
//             if (refs.length > 0) {
//               setReferencesByMessage((prev) => ({ ...prev, [assistantId]: refs }))
//             }
//             setConversationId(event.conversationId)
//             setTimeout(refreshConversations, 300)
//             break
//           }
//           case 'error':
//             throw new Error(event.message)
//         }
//       }

//       const reader = res.body.getReader()
//       const decoder = new TextDecoder()
//       let buffer = ''

//       while (true) {
//         const { done, value } = await reader.read()
//         if (done) break
//         buffer += decoder.decode(value, { stream: true })
//         const lines = buffer.split('\n')
//         buffer = lines.pop() ?? ''
//         lines.forEach(handleLine)
//       }
//       handleLine(buffer)

//       if (!finished) {
//         if (!streamedText) throw new Error('La connexion avec le serveur a été interrompue.')
//         upsertAssistant({ streaming: false })
//         setNotice('La réponse a été interrompue avant la fin.')
//       }
//     } catch (err) {
//       if (err instanceof DOMException && err.name === 'AbortError') {
//         setMessages((prev) => prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)))
//         return
//       }

//       const message = err instanceof Error ? err.message : 'Connexion au serveur impossible.'

//       if (streamedText) {
//         upsertAssistant({ streaming: false })
//         setNotice(message)
//       } else {
//         const errorId = nextId()
//         const createdAt = new Date().toISOString()
//         setMessages((prev) => [
//           ...prev,
//           {
//             id: errorId,
//             role: 'assistant',
//             content: message,
//             created_at: createdAt,
//             error: true,
//           },
//         ])
//       }

//       if (message.startsWith('Session expirée')) {
//         setTimeout(() => router.push('/auth/login'), 2000)
//       }
//     } finally {
//       if (abortRef.current === controller) {
//         abortRef.current = null
//         setIsLoading(false)
//       }
//     }
//   }

//   const submitComposer = () => {
//     const text = input.trim()
//     if (!text || isLoading) return
//     if (isRecording) stopRecording()
//     setInput('')
//     void sendMessage(text)
//   }

//   const retry = (errorMessageId: number) => {
//     setMessages((prev) => prev.filter((m) => m.id !== errorMessageId))
//     void sendMessage(lastPromptRef.current, true)
//   }

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
//       e.preventDefault()
//       submitComposer()
//     }
//   }

//   const copyMessage = async (message: Message) => {
//     try {
//       await navigator.clipboard.writeText(message.content)
//       setCopiedId(message.id)
//       setTimeout(() => setCopiedId((current) => (current === message.id ? null : current)), 1800)
//     } catch {
//       setNotice('La copie n’est pas disponible dans ce navigateur.')
//     }
//   }

//   const toggleFeedback = (messageId: number, type: 'positive' | 'negative') => {
//     setMessages((prev) =>
//       prev.map((m) =>
//         m.id === messageId ? { ...m, feedback: m.feedback === type ? undefined : type } : m
//       )
//     )
//   }

//   const openSources = (messageId: number) => {
//     setExpandedReference(null)
//     setSourcesMessageId(messageId)
//   }

//   const handleCite = useCallback((messageId: number, tfcId: number) => {
//     if (!referencesRef.current[messageId]?.some((r) => r.id === tfcId)) return
//     setSimilarityThreshold(DEFAULT_THRESHOLD)
//     setExpandedReference(tfcId)
//     setSourcesMessageId(messageId)
//   }, [])

//   /* --------------------------------- Dérivés ------------------------------- */

//   const firstName = user?.name?.split(' ')[0] ?? ''

//   const groupedConversations = useMemo(() => {
//     const q = conversationQuery.trim().toLowerCase()
//     const list = q
//       ? conversations.filter((c) => (c.title || '').toLowerCase().includes(q))
//       : conversations
//     return groupConversations(list)
//   }, [conversations, conversationQuery])

//   const currentTitle = conversations.find((c) => c.id === conversationId)?.title

//   const activeRefs = sourcesMessageId !== null ? referencesByMessage[sourcesMessageId] ?? [] : []
//   const visibleRefs = activeRefs
//     .filter((r) => passesThreshold(r, similarityThreshold))
//     .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
//   const hiddenRefsCount = activeRefs.length - visibleRefs.length

//   const lastAssistantId = [...messages].reverse().find((m) => m.role === 'assistant')?.id

//   const waitingForFirstToken = isLoading && !messages.some((m) => m.streaming)

//   /* ------------------------------ États d'attente --------------------------- */

//   if (!authChecked || !user) {
//     return (
//       <div className="flex h-[100dvh] items-center justify-center bg-white dark:bg-neutral-900">
//         <div
//           role="status"
//           className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400"
//         >
//           <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
//           {authChecked ? 'Redirection vers la connexion…' : 'Vérification de votre session…'}
//         </div>
//       </div>
//     )
//   }

//   /* --------------------------------- Rendu --------------------------------- */

//   return (
//     <div className="flex h-[100dvh] overflow-hidden bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 dark:[color-scheme:dark]">
//       <style jsx global>{`
//         .app-scroll::-webkit-scrollbar {
//           width: 10px;
//           height: 10px;
//         }
//         .app-scroll::-webkit-scrollbar-button {
//           display: none;
//           width: 0;
//           height: 0;
//         }
//         .app-scroll::-webkit-scrollbar-corner {
//           background: transparent;
//         }
//         .app-scroll::-webkit-scrollbar-track {
//           background: linear-gradient(
//             to right,
//             transparent calc(50% - 0.5px),
//             rgba(115, 115, 115, 0.18) calc(50% - 0.5px),
//             rgba(115, 115, 115, 0.18) calc(50% + 0.5px),
//             transparent calc(50% + 0.5px)
//           );
//         }
//         .app-scroll::-webkit-scrollbar-track:horizontal {
//           background: linear-gradient(
//             to bottom,
//             transparent calc(50% - 0.5px),
//             rgba(115, 115, 115, 0.18) calc(50% - 0.5px),
//             rgba(115, 115, 115, 0.18) calc(50% + 0.5px),
//             transparent calc(50% + 0.5px)
//           );
//         }
//         .app-scroll::-webkit-scrollbar-thumb {
//           background-color: #d4d4d4;
//           background-clip: content-box;
//           border: 2px solid transparent;
//           border-radius: 9999px;
//           min-height: 36px;
//         }
//         .app-scroll::-webkit-scrollbar-thumb:hover {
//           background-color: #a3a3a3;
//         }
//         .dark .app-scroll::-webkit-scrollbar-thumb {
//           background-color: #525252;
//         }
//         .dark .app-scroll::-webkit-scrollbar-thumb:hover {
//           background-color: #737373;
//         }
//         @supports not selector(::-webkit-scrollbar) {
//           .app-scroll {
//             scrollbar-width: thin;
//             scrollbar-color: #d4d4d4 transparent;
//           }
//           .dark .app-scroll {
//             scrollbar-color: #525252 transparent;
//           }
//         }

//         .tfc-no-scrollbar {
//           scrollbar-width: none;
//           -ms-overflow-style: none;
//         }
//         .tfc-no-scrollbar::-webkit-scrollbar {
//           display: none;
//         }

//         @keyframes tfc-eq {
//           0%,
//           100% {
//             transform: scaleY(0.35);
//           }
//           50% {
//             transform: scaleY(1);
//           }
//         }
//         .tfc-eq-bar {
//           display: block;
//           width: 3px;
//           height: 14px;
//           border-radius: 9999px;
//           background: currentColor;
//           animation: tfc-eq 900ms ease-in-out infinite;
//         }
//         .tfc-eq-bar:nth-child(2) {
//           animation-delay: -600ms;
//         }
//         .tfc-eq-bar:nth-child(3) {
//           animation-delay: -300ms;
//         }
//         .tfc-eq-bar:nth-child(4) {
//           animation-delay: -750ms;
//         }

//         @keyframes tfc-caret {
//           0%,
//           100% {
//             opacity: 1;
//           }
//           50% {
//             opacity: 0;
//           }
//         }
//         .tfc-caret {
//           display: inline-block;
//           width: 7px;
//           height: 1.05em;
//           margin-left: 2px;
//           vertical-align: text-bottom;
//           border-radius: 2px;
//           background: currentColor;
//           opacity: 0.55;
//           animation: tfc-caret 1s steps(2, start) infinite;
//         }

//         @media (prefers-reduced-motion: reduce) {
//           .tfc-eq-bar {
//             animation: none;
//             transform: scaleY(0.7);
//           }
//           .tfc-caret {
//             animation: none;
//           }
//         }
//       `}</style>

//       <AnimatePresence>
//         {sidebarOpen && (
//           <motion.div
//             key="sidebar-backdrop"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60 lg:hidden"
//             onClick={() => setSidebarOpen(false)}
//             aria-hidden
//           />
//         )}
//       </AnimatePresence>

//       <aside
//         aria-label="Historique des conversations"
//         className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-neutral-200 bg-neutral-50 transition-[transform,width,visibility] duration-200 dark:border-neutral-700 dark:bg-neutral-800 lg:static lg:z-auto lg:translate-x-0 lg:overflow-hidden ${
//           sidebarOpen
//             ? 'visible translate-x-0 lg:w-72'
//             : 'invisible -translate-x-full lg:w-0 lg:border-r-0'
//         }`}
//       >
//         <div className="flex h-full w-72 flex-col">
//           <div className="flex h-14 shrink-0 items-center justify-between px-4">
//             <div className="flex items-center gap-2.5">
//               <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">
//                 <GraduationCap className="h-4 w-4" aria-hidden />
//               </div>
//               <span className="text-sm font-semibold tracking-tight">Archive TFC</span>
//             </div>
//             <IconButton label="Fermer le menu" onClick={() => setSidebarOpen(false)}>
//               <PanelLeft className="h-[18px] w-[18px]" />
//             </IconButton>
//           </div>

//           <div className="space-y-2 px-3 pb-3">
//             <button
//               type="button"
//               onClick={startNewConversation}
//               className="flex w-full items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600/70"
//             >
//               <Plus className="h-4 w-4" aria-hidden />
//               Nouvelle conversation
//             </button>

//             {conversations.length > 0 && (
//               <div className="relative">
//                 <Search
//                   className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
//                   aria-hidden
//                 />
//                 <input
//                   type="search"
//                   value={conversationQuery}
//                   onChange={(e) => setConversationQuery(e.target.value)}
//                   placeholder="Rechercher"
//                   aria-label="Rechercher dans l’historique"
//                   className="w-full rounded-xl bg-neutral-200/50 py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-300 dark:bg-neutral-700/60 dark:focus:bg-neutral-700 dark:focus:ring-neutral-500"
//                 />
//               </div>
//             )}
//           </div>

//           <nav
//             aria-label="Conversations"
//             className="app-scroll min-h-0 flex-1 overflow-y-auto px-2 pb-2"
//           >
//             {groupedConversations.length === 0 ? (
//               <p className="px-3 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
//                 {conversationQuery
//                   ? `Aucun résultat pour « ${conversationQuery} ».`
//                   : 'Vos conversations apparaîtront ici.'}
//               </p>
//             ) : (
//               groupedConversations.map((group) => (
//                 <section key={group.label} className="pb-1">
//                   <h3 className="px-3 pb-1 pt-4 text-xs font-medium text-neutral-500 dark:text-neutral-400">
//                     {group.label}
//                   </h3>
//                   <ul className="space-y-0.5">
//                     {group.items.map((conv) => {
//                       const active = conversationId === conv.id
//                       return (
//                         <li key={conv.id}>
//                           <button
//                             type="button"
//                             onClick={() => loadConversation(conv.id)}
//                             aria-current={active ? 'page' : undefined}
//                             className={`relative flex w-full items-center gap-2 rounded-lg py-2 pl-4 pr-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
//                               active
//                                 ? 'bg-neutral-200/70 font-medium text-neutral-900 dark:bg-neutral-700 dark:text-neutral-50'
//                                 : 'text-neutral-600 hover:bg-neutral-200/40 dark:text-neutral-400 dark:hover:bg-neutral-700/50'
//                             }`}
//                           >
//                             {active && (
//                               <span
//                                 className="absolute left-1.5 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-neutral-900 dark:bg-neutral-100"
//                                 aria-hidden
//                               />
//                             )}
//                             <span className="min-w-0 flex-1 truncate">
//                               {conv.title || 'Conversation sans titre'}
//                             </span>
//                             {loadingConversationId === conv.id && (
//                               <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
//                             )}
//                           </button>
//                         </li>
//                       )
//                     })}
//                   </ul>
//                 </section>
//               ))
//             )}
//           </nav>

//           <div className="shrink-0 space-y-1 border-t border-neutral-200 p-3 dark:border-neutral-700">
//             <div className="flex items-center gap-3 rounded-xl p-2">
//               <Avatar user={user} />
//               <div className="min-w-0 flex-1">
//                 <p className="truncate text-sm font-medium leading-5">{user.name}</p>
//                 <p className="truncate text-xs capitalize leading-4 text-neutral-500 dark:text-neutral-400">
//                   {user.role}
//                 </p>
//               </div>
//               <div className="flex shrink-0 items-center">
//                 <ThemeSwitch />
//               </div>
//             </div>
//             <Link
//               href="/"
//               className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-200/50 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-400 dark:hover:bg-neutral-700/60 dark:hover:text-neutral-100"
//             >
//               <ArrowLeft className="h-4 w-4" aria-hidden />
//               Retour au site
//             </Link>
//           </div>
//         </div>
//       </aside>

//       <div className="flex min-w-0 flex-1 flex-col">
//         <header className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200 px-3 dark:border-neutral-700">
//           {!sidebarOpen && (
//             <IconButton label="Ouvrir le menu" onClick={() => setSidebarOpen(true)}>
//               <PanelLeft className="h-[18px] w-[18px]" />
//             </IconButton>
//           )}
//           <h1 className="min-w-0 flex-1 truncate px-1 text-sm font-medium">
//             {currentTitle || (messages.length > 0 ? 'Conversation en cours' : 'Nouvelle conversation')}
//           </h1>
//           {messages.length > 0 && (
//             <button
//               type="button"
//               onClick={startNewConversation}
//               className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-300 dark:hover:bg-neutral-800"
//             >
//               <Plus className="h-4 w-4" aria-hidden />
//               <span className="hidden sm:inline">Nouvelle</span>
//               <span className="sr-only sm:hidden">Nouvelle conversation</span>
//             </button>
//           )}
//         </header>

//         <AnimatePresence>
//           {notice && (
//             <motion.div
//               key="notice"
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: 'auto' }}
//               exit={{ opacity: 0, height: 0 }}
//               className="overflow-hidden"
//             >
//               <div
//                 role="alert"
//                 className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
//               >
//                 <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
//                 <span className="flex-1">{notice}</span>
//                 <button
//                   type="button"
//                   onClick={() => setNotice('')}
//                   aria-label="Fermer ce message"
//                   className="rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700"
//                 >
//                   <X className="h-4 w-4" />
//                 </button>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <div className="relative min-h-0 flex-1">
//           <div ref={scrollRef} onScroll={handleScroll} className="app-scroll h-full overflow-y-auto">
//             <div className="mx-auto flex min-h-full w-full max-w-[52rem] flex-col px-4 py-8 sm:px-6">
//               {messages.length === 0 && !isLoading ? (
//                 <div className="my-auto pb-4 pt- text-center">
//                   <div className="mx-auto mb-2 w-32 [&>*]:max-w-full">
//                     <LottieAnimation />
//                   </div>
//                   <h2 className="text-2xl font-semibold tracking-tight">
//                     Bonjour{firstName ? `, ${firstName}` : ''}
//                   </h2>
//                   <p className="mx-auto mt-2 max-w-lg text-[15px] leading-6 text-neutral-500 dark:text-neutral-400">
//                     Posez une question sur les Travaux de Fin de Cycle archivés : sujets, auteurs,
//                     technologies, années.
//                   </p>

//                   <div className="mx-auto mt-6 flex max-w-md flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200/60 bg-neutral-50/50 px-5 py-3.5 shadow-sm backdrop-blur-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700/50 dark:bg-neutral-800/30 dark:hover:bg-neutral-800/50 sm:flex-row sm:gap-4 sm:rounded-full">
//                     <span className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400">
//                       Propulsé par
//                     </span>
//                     <div
//                       className="hidden h-4 w-px bg-neutral-300 dark:bg-neutral-600 sm:block"
//                       aria-hidden
//                     />
//                     <div className="flex items-center gap-4">
//                       <div className="group flex items-center gap-2" title="DeepSeek V4.1 Flash">
//                         <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white p-1 shadow-sm ring-1 ring-neutral-900/5 transition-transform group-hover:scale-110 dark:bg-neutral-700 dark:ring-white/10">
//                           {/* eslint-disable-next-line @next/next/no-img-element */}
//                           <img
//                             src="/deepseek.png"
//                             alt="DeepSeek"
//                             className="h-full w-full object-contain"
//                           />
//                         </div>
//                         <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
//                           DeepSeek V4.1
//                         </span>
//                       </div>

//                       <div className="group flex items-center gap-2" title="Claude Opus">
//                         <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white p-1 shadow-sm ring-1 ring-neutral-900/5 transition-transform group-hover:scale-110 dark:bg-neutral-700 dark:ring-white/10">
//                           {/* eslint-disable-next-line @next/next/no-img-element */}
//                           <img
//                             src="/claude.webp"
//                             alt="Claude"
//                             className="h-full w-full object-contain"
//                           />
//                         </div>
//                         <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
//                           Claude Opus 4.7
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="tfc-no-scrollbar -mx-4 mt-8 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
//                     <div className="flex w-max gap-3 text-left sm:w-full">
//                       {SUGGESTIONS.map((question, index) => (
//                         <motion.button
//                           key={question}
//                           type="button"
//                           onClick={() => void sendMessage(question)}
//                           initial={{ opacity: 0, x: -28 }}
//                           animate={{ opacity: 1, x: 0 }}
//                           transition={{
//                             duration: 0.5,
//                             delay: 0.15 + index * 0.1,
//                             ease: [0.22, 1, 0.36, 1],
//                           }}
//                           className="w-56 shrink-0 rounded-xl border border-neutral-200 bg-white p-4 text-sm leading-5 text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700/70 sm:w-auto sm:min-w-0 sm:flex-1"
//                         >
//                           {question}
//                         </motion.button>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex flex-col gap-8">
//                   {messages.map((message) => {
//                     if (message.role === 'user') {
//                       return (
//                         <div key={message.id} className="flex justify-end">
//                           <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-neutral-100 px-4 py-2.5 text-[15px] leading-6 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
//                             {message.content}
//                           </div>
//                         </div>
//                       )
//                     }

//                     const refs = referencesByMessage[message.id]
//                     const visibleForMessage = refs?.filter((r) => passesThreshold(r, similarityThreshold)) ?? []
//                     const sourceCount = visibleForMessage.length
//                     const knownKey = refs ? refs.map((r) => r.id).join(',') : ''
//                     const isLast = message.id === lastAssistantId
//                     const isSpeaking = speakingId === message.id

//                     return (
//                       <div key={message.id} className="group flex gap-3">
//                         <div
//                           className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
//                           aria-hidden
//                         >
//                           <GraduationCap className="h-4 w-4" />
//                         </div>

//                         <div className="min-w-0 flex-1">
//                           {message.error ? (
//                             <div
//                               role="alert"
//                               className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm dark:border-red-900/50 dark:bg-red-950/30"
//                             >
//                               <div className="flex items-start gap-2.5">
//                                 <AlertCircle
//                                   className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400"
//                                   aria-hidden
//                                 />
//                                 <div className="min-w-0 flex-1">
//                                   <p className="font-medium text-red-800 dark:text-red-200">
//                                     La réponse n’a pas pu être générée
//                                   </p>
//                                   <p className="mt-1 text-red-700 dark:text-red-300">
//                                     {message.content}
//                                   </p>
//                                   {!message.content.startsWith('Session expirée') && (
//                                     <button
//                                       type="button"
//                                       onClick={() => retry(message.id)}
//                                       disabled={isLoading}
//                                       className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-950/50"
//                                     >
//                                       <RotateCw className="h-3.5 w-3.5" aria-hidden />
//                                       Réessayer
//                                     </button>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           ) : (
//                             <>
//                               <Markdown
//                                 content={message.content}
//                                 messageId={message.id}
//                                 knownKey={knownKey}
//                                 streaming={!!message.streaming}
//                                 onCite={handleCite}
//                               />
//                               {message.streaming && (
//                                 <span className="tfc-caret text-neutral-500" aria-hidden />
//                               )}

//                               {!message.streaming && (
//                                 <div
//                                   className={`mt-2 flex flex-wrap items-center gap-1 transition-opacity focus-within:opacity-100 ${
//                                     isLast || isSpeaking
//                                       ? ''
//                                       : 'opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100'
//                                   }`}
//                                 >
//                                   <IconButton
//                                     label={copiedId === message.id ? 'Copié' : 'Copier la réponse'}
//                                     onClick={() => copyMessage(message)}
//                                   >
//                                     {copiedId === message.id ? (
//                                       <Check className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
//                                     ) : (
//                                       <Copy className="h-4 w-4" />
//                                     )}
//                                   </IconButton>

//                                   {ttsSupported && (
//                                     <IconButton
//                                       label={isSpeaking ? 'Arrêter la lecture' : 'Lire à voix haute'}
//                                       onClick={() => speakMessage(message)}
//                                       active={isSpeaking}
//                                       activeClass="bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white"
//                                     >
//                                       {isSpeaking ? (
//                                         <VolumeX className="h-4 w-4" />
//                                       ) : (
//                                         <Volume2 className="h-4 w-4" />
//                                       )}
//                                     </IconButton>
//                                   )}

//                                   <IconButton
//                                     label="Réponse utile"
//                                     onClick={() => toggleFeedback(message.id, 'positive')}
//                                     active={message.feedback === 'positive'}
//                                     activeClass="text-neutral-900 dark:text-white"
//                                   >
//                                     <ThumbsUp
//                                       className={`h-4 w-4 ${
//                                         message.feedback === 'positive' ? 'fill-current' : ''
//                                       }`}
//                                     />
//                                   </IconButton>
//                                   <IconButton
//                                     label="Réponse peu utile"
//                                     onClick={() => toggleFeedback(message.id, 'negative')}
//                                     active={message.feedback === 'negative'}
//                                     activeClass="text-neutral-900 dark:text-white"
//                                   >
//                                     <ThumbsDown
//                                       className={`h-4 w-4 ${
//                                         message.feedback === 'negative' ? 'fill-current' : ''
//                                       }`}
//                                     />
//                                   </IconButton>

//                                   {sourceCount > 0 && (
//                                     <button
//                                       type="button"
//                                       onClick={() => openSources(message.id)}
//                                       title={visibleForMessage.map((r) => `ID ${r.id}`).join(', ')}
//                                       className="ml-1 inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
//                                     >
//                                       <BookOpen className="h-3.5 w-3.5" aria-hidden />
//                                       {sourceCount} source{sourceCount > 1 ? 's' : ''}
//                                       {sourceCount <= 3 && (
//                                         <span className="hidden font-normal text-neutral-400 dark:text-neutral-500 sm:inline">
//                                           · ID {visibleForMessage.map((r) => r.id).join(', ')}
//                                         </span>
//                                       )}
//                                     </button>
//                                   )}

//                                   <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500">
//                                     {formatTime(message.created_at)}
//                                   </span>
//                                 </div>
//                               )}
//                             </>
//                           )}
//                         </div>
//                       </div>
//                     )
//                   })}

//                   {waitingForFirstToken && (
//                     <div className="flex gap-3" role="status" aria-live="polite">
//                       <div
//                         className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
//                         aria-hidden
//                       >
//                         <GraduationCap className="h-4 w-4" />
//                       </div>
//                       <div className="flex items-center gap-2.5 py-1.5 text-sm text-neutral-500 dark:text-neutral-400">
//                         <span className="flex gap-1" aria-hidden>
//                           {[0, 150, 300].map((delay) => (
//                             <span
//                               key={delay}
//                               className="h-1.5 w-1.5 rounded-full bg-neutral-400 motion-safe:animate-bounce"
//                               style={{ animationDelay: `${delay}ms` }}
//                             />
//                           ))}
//                         </span>
//                         Recherche dans les archives…
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           <AnimatePresence>
//             {showScrollDown && (
//               <motion.button
//                 key="scroll-down"
//                 type="button"
//                 initial={{ opacity: 0, y: 8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: 8 }}
//                 onClick={() => {
//                   stickToBottom.current = true
//                   scrollToBottom()
//                 }}
//                 aria-label="Aller au dernier message"
//                 className="absolute bottom-3 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-md transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
//               >
//                 <ArrowDown className="h-4 w-4" />
//               </motion.button>
//             )}
//           </AnimatePresence>
//         </div>

//         <div className="shrink-0 px-4 pb-4 pt-2 sm:px-6">
//           <div className="mx-auto w-full max-w-[52rem]">
//             <div
//               className={`rounded-3xl border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_30px_-18px_rgba(0,0,0,0.25)] transition focus-within:ring-4 dark:bg-neutral-800 ${
//                 isRecording
//                   ? 'border-red-300 focus-within:ring-red-500/10 dark:border-red-900/70 dark:focus-within:ring-red-500/10'
//                   : 'border-neutral-200 focus-within:border-neutral-400 focus-within:ring-neutral-900/5 dark:border-neutral-700 dark:focus-within:border-neutral-500 dark:focus-within:ring-white/5'
//               }`}
//             >
//               <textarea
//                 ref={textareaRef}
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 rows={1}
//                 maxLength={2000}
//                 placeholder={
//                   isRecording
//                     ? 'Parlez maintenant…'
//                     : isLoading
//                       ? 'Réponse en cours, vous pouvez déjà préparer la suite…'
//                       : 'Posez votre question sur les TFC…'
//                 }
//                 aria-label="Votre question"
//                 className="app-scroll block max-h-[200px] min-h-[52px] w-full resize-none bg-transparent px-5 pb-1 pt-4 text-[15px] leading-6 outline-none placeholder:text-neutral-400"
//               />

//               <div className="flex items-center justify-between gap-3 px-3 pb-3 pt-1">
//                 <div className="flex min-w-0 items-center gap-2">
//                   <button
//                     type="button"
//                     onClick={toggleRecording}
//                     aria-pressed={isRecording}
//                     aria-label={isRecording ? 'Terminer la dictée' : 'Dicter avec le micro'}
//                     title={isRecording ? 'Terminer la dictée' : 'Dicter avec le micro'}
//                     className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
//                       isRecording
//                         ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
//                         : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100'
//                     }`}
//                   >
//                     {isRecording && (
//                       <span
//                         className="absolute inset-0 rounded-full bg-red-500/20 motion-safe:animate-ping"
//                         aria-hidden
//                       />
//                     )}
//                     <Mic className="relative h-[18px] w-[18px]" />
//                   </button>

//                   {isRecording ? (
//                     <div
//                       role="status"
//                       className="flex min-w-0 items-center gap-2.5 text-xs text-red-600 dark:text-red-400"
//                     >
//                       <span className="flex h-4 items-center gap-[3px]" aria-hidden>
//                         <span className="tfc-eq-bar" />
//                         <span className="tfc-eq-bar" />
//                         <span className="tfc-eq-bar" />
//                         <span className="tfc-eq-bar" />
//                       </span>
//                       <span className="truncate">Écoute en cours, touchez le micro pour terminer</span>
//                     </div>
//                   ) : isLoading ? (
//                     <div
//                       role="status"
//                       className="flex min-w-0 items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400"
//                     >
//                       <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
//                       <span className="truncate">
//                         {waitingForFirstToken ? 'Recherche dans les archives…' : 'Rédaction de la réponse…'}
//                       </span>
//                     </div>
//                   ) : (
//                     <span className="hidden truncate text-xs text-neutral-400 dark:text-neutral-500 sm:block">
//                       Entrée pour envoyer, Maj + Entrée pour aller à la ligne
//                     </span>
//                   )}
//                 </div>

//                 <AnimatePresence mode="wait" initial={false}>
//                   {isLoading ? (
//                     <motion.div
//                       key="stop"
//                       initial={{ opacity: 0, scale: 0.85 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       exit={{ opacity: 0, scale: 0.85 }}
//                       transition={{ duration: 0.15 }}
//                       whileTap={{ scale: 0.94 }}
//                       className="shrink-0"
//                     >
//                       <button
//                         type="button"
//                         onClick={stopGeneration}
//                         aria-label="Arrêter la réponse"
//                         title="Arrêter la réponse"
//                         className="flex h-9 items-center gap-2 rounded-full bg-neutral-900 pl-2 pr-3 text-white transition-colors hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white dark:focus-visible:ring-offset-neutral-800"
//                       >
//                         <Square className="h-3 w-3 fill-current" />
//                         <span className="text-[13px] font-medium">Arrêter</span>
//                       </button>
//                     </motion.div>
//                   ) : (
//                     <motion.button
//                       key="send"
//                       type="button"
//                       onClick={submitComposer}
//                       disabled={!input.trim()}
//                       aria-label="Envoyer le message"
//                       title="Envoyer"
//                       initial={{ opacity: 0, scale: 0.85 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       exit={{ opacity: 0, scale: 0.85 }}
//                       transition={{ duration: 0.15 }}
//                       whileTap={input.trim() ? { scale: 0.94 } : undefined}
//                       className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white transition-colors hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white dark:focus-visible:ring-offset-neutral-800 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-500"
//                     >
//                       <ArrowUp className="h-4 w-4" />
//                     </motion.button>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </div>

//             <p className="mt-2 text-center text-xs text-neutral-400 dark:text-neutral-500">
//               L’assistant peut se tromper : vérifiez les TFC cités dans les sources.
//             </p>
//           </div>
//         </div>
//       </div>

//       <AnimatePresence>
//         {sourcesMessageId !== null && (
//           <motion.div
//             key="sources-backdrop"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-40 bg-black/30 dark:bg-black/60"
//             onClick={() => setSourcesMessageId(null)}
//             aria-hidden
//           />
//         )}
//         {sourcesMessageId !== null && (
//           <motion.aside
//             key="sources-panel"
//             role="dialog"
//             aria-label="Sources citées"
//             initial={{ x: '100%' }}
//             animate={{ x: 0 }}
//             exit={{ x: '100%' }}
//             transition={{ type: 'spring', damping: 32, stiffness: 320 }}
//             className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900 sm:w-[420px]"
//           >
//             <div className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-700">
//               <div>
//                 <h2 className="text-sm font-semibold">Sources</h2>
//                 <p className="text-xs text-neutral-500 dark:text-neutral-400">
//                   {visibleRefs.length} TFC sur {activeRefs.length}
//                 </p>
//               </div>
//               <IconButton label="Fermer les sources" onClick={() => setSourcesMessageId(null)}>
//                 <X className="h-[18px] w-[18px]" />
//               </IconButton>
//             </div>

//             <div className="shrink-0 border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
//               <p className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
//                 Pertinence minimale
//               </p>
//               <div className="flex flex-wrap gap-1.5">
//                 {SIMILARITY_THRESHOLDS.map((threshold) => (
//                   <button
//                     key={threshold}
//                     type="button"
//                     onClick={() => setSimilarityThreshold(threshold)}
//                     aria-pressed={similarityThreshold === threshold}
//                     className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
//                       similarityThreshold === threshold
//                         ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
//                         : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800'
//                     }`}
//                   >
//                     {threshold} %
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="app-scroll min-h-0 flex-1 overflow-y-auto">
//               {visibleRefs.length === 0 ? (
//                 <p className="px-6 py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
//                   Aucune source au-dessus de {similarityThreshold} %.
//                   {hiddenRefsCount > 0 && ' Baissez le seuil pour voir les autres résultats.'}
//                 </p>
//               ) : (
//                 <ul className="divide-y divide-neutral-100 dark:divide-neutral-700/70">
//                   {visibleRefs.map((tfc) => {
//                     const expanded = expandedReference === tfc.id
//                     const pct =
//                       tfc.similarity === null
//                         ? null
//                         : Math.max(0, Math.min(100, Math.round(tfc.similarity)))
//                     return (
//                       <li key={tfc.id}>
//                         <button
//                           type="button"
//                           onClick={() => setExpandedReference(expanded ? null : tfc.id)}
//                           aria-expanded={expanded}
//                           className="w-full px-4 py-4 text-left transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:outline-none dark:hover:bg-neutral-800 dark:focus-visible:bg-neutral-800"
//                         >
//                           <div className="flex items-start gap-3">
//                             <div className="min-w-0 flex-1">
//                               <div className="mb-1.5 flex items-center gap-2">
//                                 <span className="rounded-md bg-neutral-200/70 px-1.5 py-0.5 font-mono text-[11px] font-medium text-neutral-700 dark:bg-neutral-700/70 dark:text-neutral-200">
//                                   ID {tfc.id}
//                                 </span>
//                                 {tfc.annee && (
//                                   <span className="text-xs text-neutral-500 dark:text-neutral-400">
//                                     {tfc.annee}
//                                   </span>
//                                 )}
//                               </div>
//                               <p className="line-clamp-2 text-sm font-medium leading-5">{tfc.titre}</p>
//                               <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
//                                 {tfc.auteur}
//                               </p>

//                               {pct !== null && (
//                                 <div className="mt-2.5 flex items-center gap-2">
//                                   <div className="h-1 w-24 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
//                                     <div
//                                       className="h-full rounded-full bg-neutral-700 dark:bg-neutral-300"
//                                       style={{ width: `${pct}%` }}
//                                     />
//                                   </div>
//                                   <span className="text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
//                                     {pct} % de pertinence
//                                   </span>
//                                 </div>
//                               )}

//                               {tfc.technologies?.length > 0 && (
//                                 <div className="mt-2.5 flex flex-wrap gap-1.5">
//                                   {tfc.technologies.slice(0, 4).map((tech) => (
//                                     <span
//                                       key={tech}
//                                       className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
//                                     >
//                                       {tech}
//                                     </span>
//                                   ))}
//                                   {tfc.technologies.length > 4 && (
//                                     <span className="px-1 py-0.5 text-xs text-neutral-400">
//                                       +{tfc.technologies.length - 4}
//                                     </span>
//                                   )}
//                                 </div>
//                               )}
//                             </div>
//                             <ChevronDown
//                               className={`mt-0.5 h-4 w-4 shrink-0 text-neutral-400 transition-transform ${
//                                 expanded ? 'rotate-180' : ''
//                               }`}
//                               aria-hidden
//                             />
//                           </div>
//                         </button>

//                         {expanded && (
//                           <dl className="space-y-3 bg-neutral-50 px-4 pb-4 pt-1 text-sm dark:bg-neutral-800">
//                             <div>
//                               <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
//                                 Identifiant
//                               </dt>
//                               <dd className="mt-0.5 font-mono text-[13px]">ID:{tfc.id}</dd>
//                             </div>
//                             <div>
//                               <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
//                                 Promoteur
//                               </dt>
//                               <dd className="mt-0.5">{tfc.promoteur}</dd>
//                             </div>
//                             <div>
//                               <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
//                                 Faculté
//                               </dt>
//                               <dd className="mt-0.5">{tfc.faculte}</dd>
//                             </div>
//                             <div>
//                               <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
//                                 Résumé
//                               </dt>
//                               <dd className="mt-0.5 leading-6 text-neutral-700 dark:text-neutral-300">
//                                 {tfc.resume}
//                               </dd>
//                             </div>
//                           </dl>
//                         )}
//                       </li>
//                     )
//                   })}
//                 </ul>
//               )}
//             </div>
//           </motion.aside>
//         )}
//       </AnimatePresence>
//     </div>
//   )
// }

'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  GraduationCap,
  Loader2,
  Mic,
  PanelLeft,
  Plus,
  RotateCw,
  Search,
  Square,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import LottieAnimation from './LottieAnimation'
import ThemeSwitch from './ThemeSwitch'

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  tfc_references?: number[]
  created_at: string
  feedback?: 'positive' | 'negative'
  error?: boolean
  streaming?: boolean
}

interface TFCReference {
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

interface User {
  id: string
  name: string
  email: string
  role: string
  profil_url?: string
}

interface Conversation {
  id: number
  title: string
  created_at: string
  updated_at: string
  chat_messages?: Message[]
}

type StreamEvent =
  | { type: 'meta'; conversationId: number }
  | { type: 'delta'; text: string }
  | { type: 'done'; conversationId: number; references: TFCReference[] }
  | { type: 'error'; message: string }

// Interfaces pour la Web Speech API
interface SpeechRecognitionEventLike {
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>
}
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

const getSpeechRecognition = (): SpeechRecognitionCtor | null => {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/* -------------------------------------------------------------------------- */
/*                                 Constantes                                 */
/* -------------------------------------------------------------------------- */

const SIMILARITY_THRESHOLDS = [5, 20, 30, 40, 50]
const DEFAULT_THRESHOLD = 5
const DESKTOP_BREAKPOINT = 1024

const SUGGESTIONS = [
  "Quels TFC parlent de l'intelligence artificielle ?",
  'Trouvez-moi des travaux sur la blockchain',
  'Propose un sujet en cybersécurité',
  'Recherche des TFC avec React et Node.js',
]

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)

const passesThreshold = (ref: TFCReference, threshold: number) =>
  ref.similarity === null || ref.similarity >= threshold

function groupConversations(list: Conversation[]) {
  const DAY = 86_400_000
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

  const groups: { label: string; items: Conversation[] }[] = [
    { label: "Aujourd'hui", items: [] },
    { label: 'Hier', items: [] },
    { label: '7 derniers jours', items: [] },
    { label: 'Plus ancien', items: [] },
  ]

  const sorted = [...list].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )

  for (const conv of sorted) {
    const t = new Date(conv.updated_at).getTime()
    if (t >= startOfToday) groups[0].items.push(conv)
    else if (t >= startOfToday - DAY) groups[1].items.push(conv)
    else if (t >= startOfToday - 7 * DAY) groups[2].items.push(conv)
    else groups[3].items.push(conv)
  }

  return groups.filter((g) => g.items.length > 0)
}

const CITATION_GROUP = /\(\s*((?:ID\s*:\s*\d+\s*[,;]?\s*)+)\)/gi
function linkifyCitations(text: string): string {
  return text.replace(CITATION_GROUP, (_match, group: string) => {
    const ids = Array.from(group.matchAll(/\d+/g), (m) => m[0])
    return ids.map((id) => `[ID ${id}](#tfc-${id})`).join(' ')
  })
}

/* ----------------------------- Lecture vocale ----------------------------- */

const speechSynthesisSupported = () =>
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  typeof SpeechSynthesisUtterance !== 'undefined'

function toSpeakableText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\(\s*(?:ID\s*:\s*\d+\s*[,;]?\s*)+\)/gi, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^[\s|:-]*-{3,}[\s|:-]*$/gm, '')
    .replace(/\|/g, ', ')
    .replace(/[*_~]{1,3}/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

function chunkForSpeech(text: string, max = 180): string[] {
  const chunks: string[] = []
  for (const line of text.split(/\n+/)) {
    const clean = line.trim()
    if (!clean) continue
    const sentences = clean.match(/[^.!?…]+[.!?…]*\s*/g) ?? [clean]
    let current = ''
    for (const sentence of sentences) {
      if (current && (current + sentence).length > max) {
        chunks.push(current.trim())
        current = ''
      }
      current += sentence
      while (current.length > max) {
        const space = current.lastIndexOf(' ', max)
        const cut = space > 40 ? space : max
        chunks.push(current.slice(0, cut).trim())
        current = current.slice(cut)
      }
    }
    if (current.trim()) chunks.push(current.trim())
  }
  return chunks
}

function pickFrenchVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const french = voices.filter((v) => v.lang.toLowerCase().startsWith('fr'))
  if (french.length === 0) return null
  const score = (v: SpeechSynthesisVoice) =>
    (/natural|online|neural/i.test(v.name) ? 4 : 0) +
    (/google|premium|enhanced/i.test(v.name) ? 2 : 0) +
    (v.lang.toLowerCase() === 'fr-fr' ? 1 : 0)
  return [...french].sort((a, b) => score(b) - score(a))[0]
}

/* -------------------------------------------------------------------------- */
/*                         Rendu Markdown (réponses IA)                       */
/* -------------------------------------------------------------------------- */

const PROSE_CLASSES = [
  'text-[15px] leading-7 text-neutral-800 dark:text-neutral-200 break-words',
  '[&_:not(pre)>code]:rounded-md [&_:not(pre)>code]:bg-neutral-100 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[13px]',
  'dark:[&_:not(pre)>code]:bg-neutral-800',
].join(' ')

const baseMarkdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-3 mt-6 text-xl font-semibold tracking-tight text-neutral-900 first:mt-0 dark:text-neutral-50">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-6 text-lg font-semibold tracking-tight text-neutral-900 first:mt-0 dark:text-neutral-50">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-5 text-base font-semibold text-neutral-900 first:mt-0 dark:text-neutral-50">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-4 text-[15px] font-semibold text-neutral-900 first:mt-0 dark:text-neutral-50">
      {children}
    </h4>
  ),
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 marker:text-neutral-400 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 marker:text-neutral-400 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-neutral-900 dark:text-neutral-50">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-2 border-neutral-300 pl-4 text-neutral-600 dark:border-neutral-600 dark:text-neutral-400">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-5 border-neutral-200 dark:border-neutral-700" />,
  pre: ({ children }) => (
    <pre className="app-scroll mb-3 overflow-x-auto rounded-xl bg-neutral-950 p-4 font-mono text-[13px] leading-6 text-neutral-100 dark:border dark:border-neutral-700">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="app-scroll mb-3 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
      <table className="min-w-full text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">{children}</tbody>
  ),
  th: ({ children }) => <th className="px-3 py-2 font-medium">{children}</th>,
  td: ({ children }) => <td className="px-3 py-2 align-top">{children}</td>,
}

const Markdown = memo(function Markdown({
  content,
  messageId,
  knownKey,
  streaming,
  onCite,
}: {
  content: string
  messageId: number
  knownKey: string
  streaming: boolean
  onCite: (messageId: number, tfcId: number) => void
}) {
  const knownIds = useMemo(() => new Set(knownKey ? knownKey.split(',').map(Number) : []), [knownKey])

  const components = useMemo<Components>(
    () => ({
      ...baseMarkdownComponents,
      a: ({ href, children }) => {
        if (href?.startsWith('#tfc-')) {
          const tfcId = Number(href.slice(5))
          if (!streaming && !knownIds.has(tfcId)) {
            return (
              <span
                title="Ce TFC n’a pas été retrouvé dans les résultats de la recherche"
                className="mx-0.5 inline-flex items-center rounded-md bg-neutral-100 px-1.5 py-0.5 align-baseline text-xs font-medium text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
              >
                {children}
              </span>
            )
          }
          return (
            <button
              type="button"
              onClick={() => onCite(messageId, tfcId)}
              className="mx-0.5 inline-flex items-center rounded-md bg-neutral-200/70 px-1.5 py-0.5 align-baseline text-xs font-medium text-neutral-800 transition-colors hover:bg-neutral-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:bg-neutral-700/70 dark:text-neutral-100 dark:hover:bg-neutral-600"
            >
              {children}
            </button>
          )
        }
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-300"
          >
            {children}
          </a>
        )
      },
    }),
    [messageId, onCite, knownIds, streaming]
  )

  const text = useMemo(() => linkifyCitations(content), [content])

  return (
    <div className={PROSE_CLASSES}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  )
})

/* -------------------------------------------------------------------------- */
/*                              Petits composants                             */
/* -------------------------------------------------------------------------- */

function IconButton({
  label,
  onClick,
  active,
  activeClass = '',
  children,
}: {
  label: string
  onClick: () => void
  active?: boolean
  activeClass?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`rounded-lg p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
        active
          ? activeClass
          : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200'
      }`}
    >
      {children}
    </button>
  )
}

function Avatar({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' }) {
  const dimension = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm'
  if (user.profil_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.profil_url}
        alt={`Photo de ${user.name}`}
        className={`${dimension} shrink-0 rounded-full object-cover`}
      />
    )
  }
  return (
    <div
      className={`${dimension} flex shrink-0 items-center justify-center rounded-full bg-neutral-900 font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900`}
    >
      {getInitials(user.name)}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 Composant                                  */
/* -------------------------------------------------------------------------- */

export default function ChatBot() {
  const router = useRouter()

  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState<number>()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [referencesByMessage, setReferencesByMessage] = useState<Record<number, TFCReference[]>>({})
  const [user, setUser] = useState<User | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [speakingId, setSpeakingId] = useState<number | null>(null)
  const [ttsSupported, setTtsSupported] = useState(false)
  const [loadingConversationId, setLoadingConversationId] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [conversationQuery, setConversationQuery] = useState('')
  const [sourcesMessageId, setSourcesMessageId] = useState<number | null>(null)
  const [expandedReference, setExpandedReference] = useState<number | null>(null)
  const [similarityThreshold, setSimilarityThreshold] = useState(DEFAULT_THRESHOLD)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [notice, setNotice] = useState('')
  const [showScrollDown, setShowScrollDown] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  
  // Refs pour la dictée vocale
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const isRecordingRef = useRef(false) // Pour savoir si l'utilisateur veut toujours enregistrer
  const baseInputRef = useRef('')
  
  const speechTokenRef = useRef(0)
  const lastPromptRef = useRef('')
  const stickToBottom = useRef(true)
  const referencesRef = useRef(referencesByMessage)
  referencesRef.current = referencesByMessage
  const inputRef = useRef(input)
  inputRef.current = input

  const idCounterRef = useRef(Date.now())
  const nextId = () => {
    idCounterRef.current += 1
    return idCounterRef.current
  }

  /* ------------------------------- Chargement ------------------------------ */

  const loadUser = useCallback(async () => {
    try {
      const res = await fetch('/api/chat')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setConversations(data.conversations || [])
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Erreur chargement utilisateur :', err)
      setUser(null)
    } finally {
      setAuthChecked(true)
    }
  }, [])

  const refreshConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (err) {
      console.error('Erreur rafraîchissement des conversations :', err)
    }
  }, [])

  useEffect(() => {
    if (window.innerWidth >= DESKTOP_BREAKPOINT) setSidebarOpen(true)
    setTtsSupported(speechSynthesisSupported())
    void loadUser()
  }, [loadUser])

  useEffect(() => {
    if (authChecked && user === null) router.push('/auth/login')
  }, [authChecked, user, router])

  useEffect(() => {
    if (authChecked && user && window.innerWidth >= DESKTOP_BREAKPOINT) {
      textareaRef.current?.focus()
    }
  }, [authChecked, user])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (sourcesMessageId !== null) setSourcesMessageId(null)
      else if (window.innerWidth < DESKTOP_BREAKPOINT) setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sourcesMessageId])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [input])

  useEffect(() => {
    return () => {
      isRecordingRef.current = false
      const rec = recognitionRef.current
      recognitionRef.current = null
      rec?.abort()
      abortRef.current?.abort()
      if (speechSynthesisSupported()) window.speechSynthesis.cancel()
    }
  }, [])

  /* -------------------------------- Défilement ----------------------------- */

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  useEffect(() => {
    if (stickToBottom.current) scrollToBottom(!isLoading)
  }, [messages, isLoading, scrollToBottom])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    stickToBottom.current = distance < 120
    setShowScrollDown(distance > 300)
  }

  /* ------------------------------ Dictée vocale ----------------------------- */

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false
    setIsRecording(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    // On remet le focus sur le champ de texte
    setTimeout(() => textareaRef.current?.focus(), 50)
  }, [])

  const startRecording = () => {
    const Ctor = getSpeechRecognition()
    if (!Ctor) {
      setNotice('La dictée vocale n’est pas prise en charge par ce navigateur. Utilisez Chrome, Edge ou Safari.')
      return
    }

    // Si une lecture vocale est en cours, on la coupe
    stopSpeaking()

    isRecordingRef.current = true
    setIsRecording(true)
    setNotice('')
    
    // On mémorise le texte déjà présent pour ne pas l'écraser
    baseInputRef.current = inputRef.current.trim() ? `${inputRef.current.replace(/\s+$/, '')} ` : ''

    const recognition = new Ctor()
    recognition.lang = 'fr-FR'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      if (!isRecordingRef.current) return
      
      let finalText = ''
      let interimText = ''
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) finalText += result[0].transcript
        else interimText += result[0].transcript
      }
      
      const newText = (finalText + interimText).trimStart()
      setInput(baseInputRef.current + newText)
    }

    recognition.onerror = (event) => {
      // On ignore 'no-speech' et 'aborted' car ce sont des comportements normaux
      if (event.error === 'no-speech' || event.error === 'aborted') return

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setNotice('Accès au micro refusé. Autorisez le micro dans les réglages du navigateur.')
      } else if (event.error === 'audio-capture') {
        setNotice('Aucun micro détecté. Branchez un micro puis réessayez.')
      } else if (event.error === 'network') {
        setNotice('La dictée vocale nécessite une connexion internet.')
      } else {
        setNotice('La dictée vocale a rencontré un problème. Réessayez.')
      }
      
      // En cas d'erreur bloquante, on arrête tout
      stopRecording()
    }

    recognition.onend = () => {
      // Si le navigateur coupe le flux (silence) mais qu'on veut toujours enregistrer,
      // on relance la reconnaissance (sauf si on a appelé stopRecording manuellement)
      if (isRecordingRef.current) {
        // Petit délai pour éviter les boucles trop rapides
        setTimeout(() => {
          if (isRecordingRef.current) {
            try {
              recognition.start()
            } catch {
              stopRecording()
            }
          }
        }, 150)
      } else {
        setIsRecording(false)
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch {
      setNotice('Impossible de démarrer la dictée. Réessayez.')
      stopRecording()
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  /* ------------------------------ Lecture vocale ---------------------------- */

  const stopSpeaking = useCallback(() => {
    speechTokenRef.current += 1
    if (speechSynthesisSupported()) window.speechSynthesis.cancel()
    setSpeakingId(null)
  }, [])

  const speakMessage = (message: Message) => {
    if (!speechSynthesisSupported()) {
      setNotice('La lecture vocale n’est pas prise en charge par ce navigateur.')
      return
    }
    if (speakingId === message.id) {
      stopSpeaking()
      return
    }

    const chunks = chunkForSpeech(toSpeakableText(message.content))
    if (chunks.length === 0) return

    // On coupe le micro si on est en train d'enregistrer
    if (isRecording) stopRecording()

    window.speechSynthesis.cancel()
    const token = ++speechTokenRef.current
    const voice = pickFrenchVoice(window.speechSynthesis.getVoices())
    setSpeakingId(message.id)

    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk)
      utterance.lang = voice?.lang ?? 'fr-FR'
      if (voice) utterance.voice = voice
      utterance.rate = 1
      utterance.onend = () => {
        if (speechTokenRef.current === token && index === chunks.length - 1) setSpeakingId(null)
      }
      utterance.onerror = (event) => {
        if (speechTokenRef.current !== token) return
        if (event.error === 'canceled' || event.error === 'interrupted') return
        setSpeakingId(null)
        setNotice('La lecture vocale a rencontré un problème.')
      }
      window.speechSynthesis.speak(utterance)
    })
  }

  /* --------------------------------- Actions ------------------------------- */

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < DESKTOP_BREAKPOINT) setSidebarOpen(false)
  }

  const stopGeneration = () => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsLoading(false)
    setMessages((prev) =>
      prev.some((m) => m.streaming)
        ? prev.map((m) => (m.streaming ? { ...m, streaming: false } : m))
        : prev
    )
  }

  const startNewConversation = () => {
    stopGeneration()
    stopSpeaking()
    stopRecording()
    setMessages([])
    setConversationId(undefined)
    setReferencesByMessage({})
    setSourcesMessageId(null)
    setExpandedReference(null)
    setNotice('')
    stickToBottom.current = true
    closeSidebarOnMobile()
    textareaRef.current?.focus()
  }

  const loadConversation = async (id: number) => {
    if (id === conversationId) {
      closeSidebarOnMobile()
      return
    }
    setLoadingConversationId(id)
    try {
      const res = await fetch(`/api/chat?conversationId=${id}`)
      if (res.status === 401) {
        router.push('/auth/login')
        return
      }
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      const data = await res.json()
      stopGeneration()
      stopSpeaking()
      stopRecording()
      setMessages(data.messages || [])
      setConversationId(id)
      setReferencesByMessage(data.references || {})
      setSourcesMessageId(null)
      setExpandedReference(null)
      setNotice('')
      stickToBottom.current = true
      closeSidebarOnMobile()
    } catch (err) {
      console.error('Erreur chargement conversation :', err)
      setNotice('Impossible de charger cette conversation. Réessayez dans un instant.')
    } finally {
      setLoadingConversationId(null)
    }
  }

  const sendMessage = async (text: string, isRetry = false) => {
    const prompt = text.trim()
    if (!prompt || isLoading) return

    lastPromptRef.current = prompt
    stopSpeaking()
    if (isRecording) stopRecording()
    
    setIsLoading(true)
    setNotice('')
    stickToBottom.current = true

    const userMessageId = nextId()
    const assistantId = nextId()

    if (!isRetry) {
      const createdAt = new Date().toISOString()
      setMessages((prev) => [
        ...prev,
        { id: userMessageId, role: 'user', content: prompt, created_at: createdAt },
      ])
    }

    const controller = new AbortController()
    abortRef.current = controller

    let streamedText = ''
    let finished = false

    const upsertAssistant = (patch: Partial<Message>) =>
      setMessages((prev) => {
        const index = prev.findIndex((m) => m.id === assistantId && m.role === 'assistant')
        if (index === -1) {
          return [
            ...prev,
            {
              id: assistantId,
              role: 'assistant',
              content: '',
              created_at: new Date().toISOString(),
              ...patch,
            },
          ]
        }
        const next = [...prev]
        next[index] = { ...next[index], ...patch }
        return next
      })

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, conversationId }),
        signal: controller.signal,
      })

      if (res.status === 401) {
        throw new Error('Session expirée. Reconnectez-vous pour continuer.')
      }

      const isStream = (res.headers.get('content-type') ?? '').includes('application/x-ndjson')
      if (!res.ok || !isStream || !res.body) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || data.details || `Erreur ${res.status}`)
      }

      const handleLine = (line: string) => {
        if (!line.trim()) return
        let event: StreamEvent
        try {
          event = JSON.parse(line) as StreamEvent
        } catch {
          return
        }

        switch (event.type) {
          case 'meta':
            setConversationId(event.conversationId)
            break
          case 'delta':
            streamedText += event.text
            upsertAssistant({ content: streamedText, streaming: true })
            break
          case 'done': {
            finished = true
            const refs = event.references || []
            upsertAssistant({
              content: streamedText,
              streaming: false,
              tfc_references: refs.map((r) => r.id),
            })
            if (refs.length > 0) {
              setReferencesByMessage((prev) => ({ ...prev, [assistantId]: refs }))
            }
            setConversationId(event.conversationId)
            setTimeout(refreshConversations, 300)
            break
          }
          case 'error':
            throw new Error(event.message)
        }
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        lines.forEach(handleLine)
      }
      handleLine(buffer)

      if (!finished) {
        if (!streamedText) throw new Error('La connexion avec le serveur a été interrompue.')
        upsertAssistant({ streaming: false })
        setNotice('La réponse a été interrompue avant la fin.')
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setMessages((prev) => prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)))
        return
      }

      const message = err instanceof Error ? err.message : 'Connexion au serveur impossible.'

      if (streamedText) {
        upsertAssistant({ streaming: false })
        setNotice(message)
      } else {
        const errorId = nextId()
        const createdAt = new Date().toISOString()
        setMessages((prev) => [
          ...prev,
          {
            id: errorId,
            role: 'assistant',
            content: message,
            created_at: createdAt,
            error: true,
          },
        ])
      }

      if (message.startsWith('Session expirée')) {
        setTimeout(() => router.push('/auth/login'), 2000)
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
        setIsLoading(false)
      }
    }
  }

  const submitComposer = () => {
    const text = input.trim()
    if (!text || isLoading) return
    if (isRecording) stopRecording()
    setInput('')
    void sendMessage(text)
  }

  const retry = (errorMessageId: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== errorMessageId))
    void sendMessage(lastPromptRef.current, true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submitComposer()
    }
  }

  const copyMessage = async (message: Message) => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopiedId(message.id)
      setTimeout(() => setCopiedId((current) => (current === message.id ? null : current)), 1800)
    } catch {
      setNotice('La copie n’est pas disponible dans ce navigateur.')
    }
  }

  const toggleFeedback = (messageId: number, type: 'positive' | 'negative') => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, feedback: m.feedback === type ? undefined : type } : m
      )
    )
  }

  const openSources = (messageId: number) => {
    setExpandedReference(null)
    setSourcesMessageId(messageId)
  }

  const handleCite = useCallback((messageId: number, tfcId: number) => {
    if (!referencesRef.current[messageId]?.some((r) => r.id === tfcId)) return
    setSimilarityThreshold(DEFAULT_THRESHOLD)
    setExpandedReference(tfcId)
    setSourcesMessageId(messageId)
  }, [])

  /* --------------------------------- Dérivés ------------------------------- */

  const firstName = user?.name?.split(' ')[0] ?? ''

  const groupedConversations = useMemo(() => {
    const q = conversationQuery.trim().toLowerCase()
    const list = q
      ? conversations.filter((c) => (c.title || '').toLowerCase().includes(q))
      : conversations
    return groupConversations(list)
  }, [conversations, conversationQuery])

  const currentTitle = conversations.find((c) => c.id === conversationId)?.title

  const activeRefs = sourcesMessageId !== null ? referencesByMessage[sourcesMessageId] ?? [] : []
  const visibleRefs = activeRefs
    .filter((r) => passesThreshold(r, similarityThreshold))
    .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
  const hiddenRefsCount = activeRefs.length - visibleRefs.length

  const lastAssistantId = [...messages].reverse().find((m) => m.role === 'assistant')?.id

  const waitingForFirstToken = isLoading && !messages.some((m) => m.streaming)

  /* ------------------------------ États d'attente --------------------------- */

  if (!authChecked || !user) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-white dark:bg-neutral-900">
        <div
          role="status"
          className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400"
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {authChecked ? 'Redirection vers la connexion…' : 'Vérification de votre session…'}
        </div>
      </div>
    )
  }

  /* --------------------------------- Rendu --------------------------------- */

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 dark:[color-scheme:dark]">
      <style jsx global>{`
        .app-scroll::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .app-scroll::-webkit-scrollbar-button {
          display: none;
          width: 0;
          height: 0;
        }
        .app-scroll::-webkit-scrollbar-corner {
          background: transparent;
        }
        .app-scroll::-webkit-scrollbar-track {
          background: linear-gradient(
            to right,
            transparent calc(50% - 0.5px),
            rgba(115, 115, 115, 0.18) calc(50% - 0.5px),
            rgba(115, 115, 115, 0.18) calc(50% + 0.5px),
            transparent calc(50% + 0.5px)
          );
        }
        .app-scroll::-webkit-scrollbar-track:horizontal {
          background: linear-gradient(
            to bottom,
            transparent calc(50% - 0.5px),
            rgba(115, 115, 115, 0.18) calc(50% - 0.5px),
            rgba(115, 115, 115, 0.18) calc(50% + 0.5px),
            transparent calc(50% + 0.5px)
          );
        }
        .app-scroll::-webkit-scrollbar-thumb {
          background-color: #d4d4d4;
          background-clip: content-box;
          border: 2px solid transparent;
          border-radius: 9999px;
          min-height: 36px;
        }
        .app-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #a3a3a3;
        }
        .dark .app-scroll::-webkit-scrollbar-thumb {
          background-color: #525252;
        }
        .dark .app-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #737373;
        }
        @supports not selector(::-webkit-scrollbar) {
          .app-scroll {
            scrollbar-width: thin;
            scrollbar-color: #d4d4d4 transparent;
          }
          .dark .app-scroll {
            scrollbar-color: #525252 transparent;
          }
        }

        .tfc-no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .tfc-no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        @keyframes tfc-eq {
          0%,
          100% {
            transform: scaleY(0.35);
          }
          50% {
            transform: scaleY(1);
          }
        }
        .tfc-eq-bar {
          display: block;
          width: 3px;
          height: 14px;
          border-radius: 9999px;
          background: currentColor;
          animation: tfc-eq 900ms ease-in-out infinite;
        }
        .tfc-eq-bar:nth-child(2) {
          animation-delay: -600ms;
        }
        .tfc-eq-bar:nth-child(3) {
          animation-delay: -300ms;
        }
        .tfc-eq-bar:nth-child(4) {
          animation-delay: -750ms;
        }

        @keyframes tfc-caret {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        .tfc-caret {
          display: inline-block;
          width: 7px;
          height: 1.05em;
          margin-left: 2px;
          vertical-align: text-bottom;
          border-radius: 2px;
          background: currentColor;
          opacity: 0.55;
          animation: tfc-caret 1s steps(2, start) infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .tfc-eq-bar {
            animation: none;
            transform: scaleY(0.7);
          }
          .tfc-caret {
            animation: none;
          }
        }
      `}</style>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <aside
        aria-label="Historique des conversations"
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-neutral-200 bg-neutral-50 transition-[transform,width,visibility] duration-200 dark:border-neutral-700 dark:bg-neutral-800 lg:static lg:z-auto lg:translate-x-0 lg:overflow-hidden ${
          sidebarOpen
            ? 'visible translate-x-0 lg:w-72'
            : 'invisible -translate-x-full lg:w-0 lg:border-r-0'
        }`}
      >
        <div className="flex h-full w-72 flex-col">
          <div className="flex h-14 shrink-0 items-center justify-between px-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">
                <GraduationCap className="h-4 w-4" aria-hidden />
              </div>
              <span className="text-sm font-semibold tracking-tight">Archive TFC</span>
            </div>
            <IconButton label="Fermer le menu" onClick={() => setSidebarOpen(false)}>
              <PanelLeft className="h-[18px] w-[18px]" />
            </IconButton>
          </div>

          <div className="space-y-2 px-3 pb-3">
            <button
              type="button"
              onClick={startNewConversation}
              className="flex w-full items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600/70"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Nouvelle conversation
            </button>

            {conversations.length > 0 && (
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                  aria-hidden
                />
                <input
                  type="search"
                  value={conversationQuery}
                  onChange={(e) => setConversationQuery(e.target.value)}
                  placeholder="Rechercher"
                  aria-label="Rechercher dans l’historique"
                  className="w-full rounded-xl bg-neutral-200/50 py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-300 dark:bg-neutral-700/60 dark:focus:bg-neutral-700 dark:focus:ring-neutral-500"
                />
              </div>
            )}
          </div>

          <nav
            aria-label="Conversations"
            className="app-scroll min-h-0 flex-1 overflow-y-auto px-2 pb-2"
          >
            {groupedConversations.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                {conversationQuery
                  ? `Aucun résultat pour « ${conversationQuery} ».`
                  : 'Vos conversations apparaîtront ici.'}
              </p>
            ) : (
              groupedConversations.map((group) => (
                <section key={group.label} className="pb-1">
                  <h3 className="px-3 pb-1 pt-4 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {group.label}
                  </h3>
                  <ul className="space-y-0.5">
                    {group.items.map((conv) => {
                      const active = conversationId === conv.id
                      return (
                        <li key={conv.id}>
                          <button
                            type="button"
                            onClick={() => loadConversation(conv.id)}
                            aria-current={active ? 'page' : undefined}
                            className={`relative flex w-full items-center gap-2 rounded-lg py-2 pl-4 pr-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
                              active
                                ? 'bg-neutral-200/70 font-medium text-neutral-900 dark:bg-neutral-700 dark:text-neutral-50'
                                : 'text-neutral-600 hover:bg-neutral-200/40 dark:text-neutral-400 dark:hover:bg-neutral-700/50'
                            }`}
                          >
                            {active && (
                              <span
                                className="absolute left-1.5 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-neutral-900 dark:bg-neutral-100"
                                aria-hidden
                              />
                            )}
                            <span className="min-w-0 flex-1 truncate">
                              {conv.title || 'Conversation sans titre'}
                            </span>
                            {loadingConversationId === conv.id && (
                              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                            )}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))
            )}
          </nav>

          <div className="shrink-0 space-y-1 border-t border-neutral-200 p-3 dark:border-neutral-700">
            <div className="flex items-center gap-3 rounded-xl p-2">
              <Avatar user={user} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-5">{user.name}</p>
                <p className="truncate text-xs capitalize leading-4 text-neutral-500 dark:text-neutral-400">
                  {user.role}
                </p>
              </div>
              <div className="flex shrink-0 items-center">
                <ThemeSwitch />
              </div>
            </div>
            <Link
              href="/"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-200/50 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-400 dark:hover:bg-neutral-700/60 dark:hover:text-neutral-100"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Retour au site
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200 px-3 dark:border-neutral-700">
          {!sidebarOpen && (
            <IconButton label="Ouvrir le menu" onClick={() => setSidebarOpen(true)}>
              <PanelLeft className="h-[18px] w-[18px]" />
            </IconButton>
          )}
          <h1 className="min-w-0 flex-1 truncate px-1 text-sm font-medium">
            {currentTitle || (messages.length > 0 ? 'Conversation en cours' : 'Nouvelle conversation')}
          </h1>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={startNewConversation}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <Plus className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Nouvelle</span>
              <span className="sr-only sm:hidden">Nouvelle conversation</span>
            </button>
          )}
        </header>

        <AnimatePresence>
          {notice && (
            <motion.div
              key="notice"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                role="alert"
                className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              >
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                <span className="flex-1">{notice}</span>
                <button
                  type="button"
                  onClick={() => setNotice('')}
                  aria-label="Fermer ce message"
                  className="rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative min-h-0 flex-1">
          <div ref={scrollRef} onScroll={handleScroll} className="app-scroll h-full overflow-y-auto">
            <div className="mx-auto flex min-h-full w-full max-w-[52rem] flex-col px-4 py-8 sm:px-6">
              {messages.length === 0 && !isLoading ? (
                <div className="my-auto pb-4 pt- text-center">
                  <div className="mx-auto mb-2 w-32 [&>*]:max-w-full">
                    <LottieAnimation />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Bonjour{firstName ? `, ${firstName}` : ''}
                  </h2>
                  <p className="mx-auto mt-2 max-w-lg text-[15px] leading-6 text-neutral-500 dark:text-neutral-400">
                    Posez une question sur les Travaux de Fin de Cycle archivés : sujets, auteurs,
                    technologies, années.
                  </p>

                  <div className="mx-auto mt-6 flex max-w-md flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200/60 bg-neutral-50/50 px-5 py-3.5 shadow-sm backdrop-blur-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700/50 dark:bg-neutral-800/30 dark:hover:bg-neutral-800/50 sm:flex-row sm:gap-4 sm:rounded-full">
                    <span className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400">
                      Propulsé par
                    </span>
                    <div
                      className="hidden h-4 w-px bg-neutral-300 dark:bg-neutral-600 sm:block"
                      aria-hidden
                    />
                    <div className="flex items-center gap-4">
                      <div className="group flex items-center gap-2" title="DeepSeek V4.1 Flash">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white p-1 shadow-sm ring-1 ring-neutral-900/5 transition-transform group-hover:scale-110 dark:bg-neutral-700 dark:ring-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/deepseek.png"
                            alt="DeepSeek"
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                          DeepSeek V4.1
                        </span>
                      </div>

                      <div className="group flex items-center gap-2" title="Claude Opus">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white p-1 shadow-sm ring-1 ring-neutral-900/5 transition-transform group-hover:scale-110 dark:bg-neutral-700 dark:ring-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/claude.webp"
                            alt="Claude"
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                          Claude Opus 4.7
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="tfc-no-scrollbar -mx-4 mt-8 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
                    <div className="flex w-max gap-3 text-left sm:w-full">
                      {SUGGESTIONS.map((question, index) => (
                        <motion.button
                          key={question}
                          type="button"
                          onClick={() => void sendMessage(question)}
                          initial={{ opacity: 0, x: -28 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.5,
                            delay: 0.15 + index * 0.1,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="w-56 shrink-0 rounded-xl border border-neutral-200 bg-white p-4 text-sm leading-5 text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700/70 sm:w-auto sm:min-w-0 sm:flex-1"
                        >
                          {question}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {messages.map((message) => {
                    if (message.role === 'user') {
                      return (
                        <div key={message.id} className="flex justify-end">
                          <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-neutral-100 px-4 py-2.5 text-[15px] leading-6 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
                            {message.content}
                          </div>
                        </div>
                      )
                    }

                    const refs = referencesByMessage[message.id]
                    const visibleForMessage = refs?.filter((r) => passesThreshold(r, similarityThreshold)) ?? []
                    const sourceCount = visibleForMessage.length
                    const knownKey = refs ? refs.map((r) => r.id).join(',') : ''
                    const isLast = message.id === lastAssistantId
                    const isSpeaking = speakingId === message.id

                    return (
                      <div key={message.id} className="group flex gap-3">
                        {/* Chapeau masqué sur mobile, visible dès sm (desktop) */}
                        <div
                          className="mt-0.5 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 sm:flex"
                          aria-hidden
                        >
                          <GraduationCap className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          {message.error ? (
                            <div
                              role="alert"
                              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm dark:border-red-900/50 dark:bg-red-950/30"
                            >
                              <div className="flex items-start gap-2.5">
                                <AlertCircle
                                  className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400"
                                  aria-hidden
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-red-800 dark:text-red-200">
                                    La réponse n’a pas pu être générée
                                  </p>
                                  <p className="mt-1 text-red-700 dark:text-red-300">
                                    {message.content}
                                  </p>
                                  {!message.content.startsWith('Session expirée') && (
                                    <button
                                      type="button"
                                      onClick={() => retry(message.id)}
                                      disabled={isLoading}
                                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-950/50"
                                    >
                                      <RotateCw className="h-3.5 w-3.5" aria-hidden />
                                      Réessayer
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Markdown
                                content={message.content}
                                messageId={message.id}
                                knownKey={knownKey}
                                streaming={!!message.streaming}
                                onCite={handleCite}
                              />
                              {message.streaming && (
                                <span className="tfc-caret text-neutral-500" aria-hidden />
                              )}

                              {!message.streaming && (
                                <div
                                  className={`mt-2 flex flex-wrap items-center gap-1 transition-opacity focus-within:opacity-100 ${
                                    isLast || isSpeaking
                                      ? ''
                                      : 'opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100'
                                  }`}
                                >
                                  <IconButton
                                    label={copiedId === message.id ? 'Copié' : 'Copier la réponse'}
                                    onClick={() => copyMessage(message)}
                                  >
                                    {copiedId === message.id ? (
                                      <Check className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </IconButton>

                                  {ttsSupported && (
                                    <IconButton
                                      label={isSpeaking ? 'Arrêter la lecture' : 'Lire à voix haute'}
                                      onClick={() => speakMessage(message)}
                                      active={isSpeaking}
                                      activeClass="bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white"
                                    >
                                      {isSpeaking ? (
                                        <VolumeX className="h-4 w-4" />
                                      ) : (
                                        <Volume2 className="h-4 w-4" />
                                      )}
                                    </IconButton>
                                  )}

                                  <IconButton
                                    label="Réponse utile"
                                    onClick={() => toggleFeedback(message.id, 'positive')}
                                    active={message.feedback === 'positive'}
                                    activeClass="text-neutral-900 dark:text-white"
                                  >
                                    <ThumbsUp
                                      className={`h-4 w-4 ${
                                        message.feedback === 'positive' ? 'fill-current' : ''
                                      }`}
                                    />
                                  </IconButton>
                                  <IconButton
                                    label="Réponse peu utile"
                                    onClick={() => toggleFeedback(message.id, 'negative')}
                                    active={message.feedback === 'negative'}
                                    activeClass="text-neutral-900 dark:text-white"
                                  >
                                    <ThumbsDown
                                      className={`h-4 w-4 ${
                                        message.feedback === 'negative' ? 'fill-current' : ''
                                      }`}
                                    />
                                  </IconButton>

                                  {sourceCount > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => openSources(message.id)}
                                      title={visibleForMessage.map((r) => `ID ${r.id}`).join(', ')}
                                      className="ml-1 inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                    >
                                      <BookOpen className="h-3.5 w-3.5" aria-hidden />
                                      {sourceCount} source{sourceCount > 1 ? 's' : ''}
                                      {sourceCount <= 3 && (
                                        <span className="hidden font-normal text-neutral-400 dark:text-neutral-500 sm:inline">
                                          · ID {visibleForMessage.map((r) => r.id).join(', ')}
                                        </span>
                                      )}
                                    </button>
                                  )}

                                  <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500">
                                    {formatTime(message.created_at)}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {waitingForFirstToken && (
                    <div className="flex gap-3" role="status" aria-live="polite">
                      {/* Pendant la recherche : le chapeau reste visible partout (mobile inclus) */}
                      <div
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        aria-hidden
                      >
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-2.5 py-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                        <span className="flex gap-1" aria-hidden>
                          {[0, 150, 300].map((delay) => (
                            <span
                              key={delay}
                              className="h-1.5 w-1.5 rounded-full bg-neutral-400 motion-safe:animate-bounce"
                              style={{ animationDelay: `${delay}ms` }}
                            />
                          ))}
                        </span>
                        Recherche dans les archives…
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showScrollDown && (
              <motion.button
                key="scroll-down"
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                onClick={() => {
                  stickToBottom.current = true
                  scrollToBottom()
                }}
                aria-label="Aller au dernier message"
                className="absolute bottom-3 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-md transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <ArrowDown className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="shrink-0 px-4 pb-4 pt-2 sm:px-6">
          <div className="mx-auto w-full max-w-[52rem]">
            <div
              className={`rounded-3xl border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_30px_-18px_rgba(0,0,0,0.25)] transition focus-within:ring-4 dark:bg-neutral-800 ${
                isRecording
                  ? 'border-red-300 focus-within:ring-red-500/10 dark:border-red-900/70 dark:focus-within:ring-red-500/10'
                  : 'border-neutral-200 focus-within:border-neutral-400 focus-within:ring-neutral-900/5 dark:border-neutral-700 dark:focus-within:border-neutral-500 dark:focus-within:ring-white/5'
              }`}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                maxLength={2000}
                placeholder={
                  isRecording
                    ? 'Parlez maintenant…'
                    : isLoading
                      ? 'Réponse en cours, vous pouvez déjà préparer la suite…'
                      : 'Posez votre question sur les TFC…'
                }
                aria-label="Votre question"
                className="app-scroll block max-h-[200px] min-h-[52px] w-full resize-none bg-transparent px-5 pb-1 pt-4 text-[15px] leading-6 outline-none placeholder:text-neutral-400"
              />

              <div className="flex items-center justify-between gap-3 px-3 pb-3 pt-1">
                <div className="flex min-w-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    aria-pressed={isRecording}
                    aria-label={isRecording ? 'Terminer la dictée' : 'Dicter avec le micro'}
                    title={isRecording ? 'Terminer la dictée' : 'Dicter avec le micro'}
                    className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
                      isRecording
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                        : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100'
                    }`}
                  >
                    {isRecording && (
                      <span
                        className="absolute inset-0 rounded-full bg-red-500/20 motion-safe:animate-ping"
                        aria-hidden
                      />
                    )}
                    <Mic className="relative h-[18px] w-[18px]" />
                  </button>

                  {isRecording ? (
                    <div
                      role="status"
                      className="flex min-w-0 items-center gap-2.5 text-xs text-red-600 dark:text-red-400"
                    >
                      <span className="flex h-4 items-center gap-[3px]" aria-hidden>
                        <span className="tfc-eq-bar" />
                        <span className="tfc-eq-bar" />
                        <span className="tfc-eq-bar" />
                        <span className="tfc-eq-bar" />
                      </span>
                      <span className="truncate">Écoute en cours, touchez le micro pour terminer</span>
                    </div>
                  ) : isLoading ? (
                    <div
                      role="status"
                      className="flex min-w-0 items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400"
                    >
                      <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                      <span className="truncate">
                        {waitingForFirstToken ? 'Recherche dans les archives…' : 'Rédaction de la réponse…'}
                      </span>
                    </div>
                  ) : (
                    <span className="hidden truncate text-xs text-neutral-400 dark:text-neutral-500 sm:block">
                      Entrée pour envoyer, Maj + Entrée pour aller à la ligne
                    </span>
                  )}
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  {isLoading ? (
                    <motion.div
                      key="stop"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.15 }}
                      whileTap={{ scale: 0.94 }}
                      className="shrink-0"
                    >
                      <button
                        type="button"
                        onClick={stopGeneration}
                        aria-label="Arrêter la réponse"
                        title="Arrêter la réponse"
                        className="flex h-9 items-center gap-2 rounded-full bg-neutral-900 pl-2 pr-3 text-white transition-colors hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white dark:focus-visible:ring-offset-neutral-800"
                      >
                        <Square className="h-3 w-3 fill-current" />
                        <span className="text-[13px] font-medium">Arrêter</span>
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="send"
                      type="button"
                      onClick={submitComposer}
                      disabled={!input.trim()}
                      aria-label="Envoyer le message"
                      title="Envoyer"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.15 }}
                      whileTap={input.trim() ? { scale: 0.94 } : undefined}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white transition-colors hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white dark:focus-visible:ring-offset-neutral-800 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-500"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <p className="mt-2 text-center text-xs text-neutral-400 dark:text-neutral-500">
              L’assistant peut se tromper : vérifiez les TFC cités dans les sources.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {sourcesMessageId !== null && (
          <motion.div
            key="sources-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 dark:bg-black/60"
            onClick={() => setSourcesMessageId(null)}
            aria-hidden
          />
        )}
        {sourcesMessageId !== null && (
          <motion.aside
            key="sources-panel"
            role="dialog"
            aria-label="Sources citées"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900 sm:w-[420px]"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-700">
              <div>
                <h2 className="text-sm font-semibold">Sources</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {visibleRefs.length} TFC sur {activeRefs.length}
                </p>
              </div>
              <IconButton label="Fermer les sources" onClick={() => setSourcesMessageId(null)}>
                <X className="h-[18px] w-[18px]" />
              </IconButton>
            </div>

            <div className="shrink-0 border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
              <p className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Pertinence minimale
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SIMILARITY_THRESHOLDS.map((threshold) => (
                  <button
                    key={threshold}
                    type="button"
                    onClick={() => setSimilarityThreshold(threshold)}
                    aria-pressed={similarityThreshold === threshold}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
                      similarityThreshold === threshold
                        ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {threshold} %
                  </button>
                ))}
              </div>
            </div>

            <div className="app-scroll min-h-0 flex-1 overflow-y-auto">
              {visibleRefs.length === 0 ? (
                <p className="px-6 py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  Aucune source au-dessus de {similarityThreshold} %.
                  {hiddenRefsCount > 0 && ' Baissez le seuil pour voir les autres résultats.'}
                </p>
              ) : (
                <ul className="divide-y divide-neutral-100 dark:divide-neutral-700/70">
                  {visibleRefs.map((tfc) => {
                    const expanded = expandedReference === tfc.id
                    const pct =
                      tfc.similarity === null
                        ? null
                        : Math.max(0, Math.min(100, Math.round(tfc.similarity)))
                    return (
                      <li key={tfc.id}>
                        <button
                          type="button"
                          onClick={() => setExpandedReference(expanded ? null : tfc.id)}
                          aria-expanded={expanded}
                          className="w-full px-4 py-4 text-left transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:outline-none dark:hover:bg-neutral-800 dark:focus-visible:bg-neutral-800"
                        >
                          <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="mb-1.5 flex items-center gap-2">
                                <span className="rounded-md bg-neutral-200/70 px-1.5 py-0.5 font-mono text-[11px] font-medium text-neutral-700 dark:bg-neutral-700/70 dark:text-neutral-200">
                                  ID {tfc.id}
                                </span>
                                {tfc.annee && (
                                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {tfc.annee}
                                  </span>
                                )}
                              </div>
                              <p className="line-clamp-2 text-sm font-medium leading-5">{tfc.titre}</p>
                              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                {tfc.auteur}
                              </p>

                              {pct !== null && (
                                <div className="mt-2.5 flex items-center gap-2">
                                  <div className="h-1 w-24 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                    <div
                                      className="h-full rounded-full bg-neutral-700 dark:bg-neutral-300"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
                                    {pct} % de pertinence
                                  </span>
                                </div>
                              )}

                              {tfc.technologies?.length > 0 && (
                                <div className="mt-2.5 flex flex-wrap gap-1.5">
                                  {tfc.technologies.slice(0, 4).map((tech) => (
                                    <span
                                      key={tech}
                                      className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                  {tfc.technologies.length > 4 && (
                                    <span className="px-1 py-0.5 text-xs text-neutral-400">
                                      +{tfc.technologies.length - 4}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <ChevronDown
                              className={`mt-0.5 h-4 w-4 shrink-0 text-neutral-400 transition-transform ${
                                expanded ? 'rotate-180' : ''
                              }`}
                              aria-hidden
                            />
                          </div>
                        </button>

                        {expanded && (
                          <dl className="space-y-3 bg-neutral-50 px-4 pb-4 pt-1 text-sm dark:bg-neutral-800">
                            <div>
                              <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                Identifiant
                              </dt>
                              <dd className="mt-0.5 font-mono text-[13px]">ID:{tfc.id}</dd>
                            </div>
                            <div>
                              <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                Promoteur
                              </dt>
                              <dd className="mt-0.5">{tfc.promoteur}</dd>
                            </div>
                            <div>
                              <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                Faculté
                              </dt>
                              <dd className="mt-0.5">{tfc.faculte}</dd>
                            </div>
                            <div>
                              <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                Résumé
                              </dt>
                              <dd className="mt-0.5 leading-6 text-neutral-700 dark:text-neutral-300">
                                {tfc.resume}
                              </dd>
                            </div>
                          </dl>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}
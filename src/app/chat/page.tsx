// // 'use client'

// // import ChatBot from '@/components/chatBot'
// // import { useTheme } from '@/context/ThemeContext'

// // export default function ExPage() {
// //   const { theme } = useTheme()

// //   return (
// //     <div className="">

// //       <div className=" ">

// //     <ChatBot/>
// //       </div>
// //     </div>
// //   )
// // }

// 'use client'

// import { useEffect, useState } from 'react'
// import ChatBot from '@/components/chatBot'
// import { useTheme } from '@/context/ThemeContext'

// export default function ExPage() {
//   const { theme } = useTheme()
  
//   // On crée un état pour stocker l'utilisateur et le chargement
//   const [user, setUser] = useState<any>(null)
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     // On appelle la même API que dans ton HomePage pour avoir le rôle
//     const fetchUser = async () => {
//       try {
//         const response = await fetch('/api/auth/me')
//         if (response.ok) {
//           const userData = await response.json()
//           setUser(userData)
//         }
//       } catch (error) {
//         console.error('Erreur récupération user:', error)
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchUser()
//   }, [])

//   // Pendant le chargement, on affiche un écran d'attente (ou un spinner)
//   if (!isLoading) {
//     return (
//       <div className="flex min-h-[60vh] items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     )
//   }

//   // Si le rôle est étudiant, on affiche le message à la place du chatbot
//   if (user?.role === 'student') {
//     return (
//       <div className="flex min-h-[70vh] items-center justify-center p-6">
//         <div className="max-w-md rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
//           <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
//             Assistant IA non disponible
//           </h2>
//           <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
//             L'assistant IA n'est pas accessible avec le rôle <strong>Étudiant</strong>.
//             <br />
//             Pour toute question, veuillez contacter le support.
//           </p>
//         </div>
//       </div>
//     )
//   }

//   // Sinon, l'utilisateur n'est pas étudiant (ou pas connecté), on affiche le ChatBot
//   return (
//     <div className="">
//       <div className="">
//         <ChatBot />
//       </div>
//     </div>
//   )
// }

'use client'

import { useEffect, useState } from 'react'
import ChatBot from '@/components/chatBot'
import { useTheme } from '@/context/ThemeContext'

export default function ExPage() {
  const { theme } = useTheme()
  
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {
        console.error('Erreur récupération user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  // ==========================================
  // LE LOADER (identique à ton HomePage)
  // ==========================================
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
        <div className="loader-small"></div>
        <style jsx>{`
          .loader-small {
            width: 24px;
            height: 24px;
            display: grid;
            border-radius: 50%;
            background:
              linear-gradient(0deg, rgb(59 130 246 / 50%) 30%, #0000 0 70%, rgb(59 130 246 / 100%) 0) 50% / 8% 100%,
              linear-gradient(90deg, rgb(59 130 246 / 25%) 30%, #0000 0 70%, rgb(59 130 246 / 75%) 0) 50% / 100% 8%;
            background-repeat: no-repeat;
            animation: l23 1s infinite steps(12);
          }
          .loader-small::before,
          .loader-small::after {
            content: "";
            grid-area: 1/1;
            border-radius: 50%;
            background: inherit;
            opacity: 0.915;
            transform: rotate(30deg);
          }
          .loader-small::after {
            opacity: 0.83;
            transform: rotate(60deg);
          }
          @keyframes l23 {
            100% { transform: rotate(1turn); }
          }
        `}</style>
      </div>
    )
  }

  // ==========================================
  // BLOCAGE ÉTUDIANT
  // ==========================================
  if (user?.role === 'student') {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <img src="/ia.png" alt="Assistant IA" className="mx-auto dark:invert mb-4 h-16 w-16" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Assistant IA non disponible
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            L'assistant IA n'est pas accessible avec le rôle <strong>Étudiant</strong> .
            <br />
            Pour toute question, veuillez contacter le support.
          </p>
        </div>
      </div>
    )
  }

  // ==========================================
  // AFFICHAGE NORMAL DU CHATBOT
  // ==========================================
  return (
    <div className="">
      <div className="">
        <ChatBot />
      </div>
    </div>
  )
}
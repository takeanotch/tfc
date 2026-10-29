
'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const STORAGE_KEY = 'theme' // même clé et mêmes valeurs ('dark' / 'light') que next-themes

export default function ThemeSwitch() {
  const [isDark, setIsDark] = useState(false)

  // Synchronise l'état avec le thème déjà appliqué sur <html>
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const root = document.documentElement
    const next = !root.classList.contains('dark')

    root.classList.toggle('dark', next)
    root.style.colorScheme = next ? 'dark' : 'light'

    try {
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
    } catch {
      // stockage indisponible (navigation privée, etc.) : le thème reste appliqué pour la session
    }

    setIsDark(next)
  }

  const label = isDark ? 'Passer en mode clair' : 'Passer en mode sombre'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    >
      {/* Les deux icônes sont dans le HTML et c'est le CSS qui choisit : pas de scintillement au chargement */}
      <Moon className="h-[18px] w-[18px] dark:hidden" aria-hidden />
      <Sun className="hidden h-[18px] w-[18px] dark:block" aria-hidden />
    </button>
  )
}
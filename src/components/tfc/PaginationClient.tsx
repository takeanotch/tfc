// src/components/tfc/PaginationClient.tsx
'use client'

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { useState, useEffect } from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const FOCUS = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500'

export function PaginationClient({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const [visiblePages, setVisiblePages] = useState<number[]>([])
  
  // Générer les pages visibles de manière responsive
  useEffect(() => {
    const generateVisiblePages = () => {
      if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
      }
      
      const pages: number[] = []
      const maxVisiblePages = window.innerWidth < 768 ? 5 : 7
      
      pages.push(1)
      
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)
      
      if (currentPage <= 3) {
        endPage = maxVisiblePages - 1
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxVisiblePages + 2
      }
      
      if (startPage > 2) {
        pages.push(-1)
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      if (endPage < totalPages - 1) {
        pages.push(-2)
      }
      
      if (totalPages > 1) {
        pages.push(totalPages)
      }
      
      return pages
    }
    
    setVisiblePages(generateVisiblePages())
    
    const handleResize = () => {
      setVisiblePages(generateVisiblePages())
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [currentPage, totalPages])

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex justify-center items-center gap-1 sm:gap-2 mt-8 flex-wrap">
      {/* Bouton précédent */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-lg border border-zinc-200 bg-white text-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center ${FOCUS}`}
        aria-label="Page précédente"
      >
        <ChevronLeft size={20} />
      </button>
      
      {/* Pages */}
      {visiblePages.map((page, index) => {
        if (page === -1 || page === -2) {
          return (
            <span
              key={`ellipsis-${index}`}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-zinc-500 dark:text-zinc-400"
            >
              <MoreHorizontal size={16} />
            </span>
          )
        }
        
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`
              w-8 h-8 sm:w-10 sm:h-10 rounded-lg border transition-all flex items-center justify-center text-sm sm:text-base ${FOCUS}
              ${page === currentPage
                ? 'bg-zinc-900 text-white border-zinc-900 font-medium dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }
            `}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      })}
      
      {/* Bouton suivant */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-lg border border-zinc-200 bg-white text-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center ${FOCUS}`}
        aria-label="Page suivante"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
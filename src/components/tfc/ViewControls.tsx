// src/components/tfc/ViewControls.tsx
'use client'

import { Grid, List, LayoutGrid, Filter,Search } from 'lucide-react'
import { useState } from 'react'

type ViewType = 'grid' | 'big-grid' | 'list'

interface ViewControlsProps {
  onViewChange: (view: ViewType) => void
  onSearch: (query: string) => void
}

export function ViewControls({ onViewChange, onSearch }: ViewControlsProps) {
  const [activeView, setActiveView] = useState<ViewType>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  const handleViewChange = (view: ViewType) => {
    setActiveView(view)
    onViewChange(view)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch(query)
  }

  const viewButtons = [
    { view: 'grid' as ViewType, icon: Grid, label: 'Grille' },
    { view: 'big-grid' as ViewType, icon: LayoutGrid, label: 'Grande grille' },
    { view: 'list' as ViewType, icon: List, label: 'Liste' }
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 lg:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un TFC..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full lg:w-80"
            />
          </div>
          
          <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
            <Filter size={20} />
            <span>Filtrer</span>
          </button>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          {viewButtons.map(({ view, icon: Icon, label }) => (
            <button
              key={view}
              onClick={() => handleViewChange(view)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeView === view 
                  ? 'bg-white shadow-sm' 
                  : 'hover:bg-white hover:shadow-sm'
              }`}
              title={label}
            >
              <Icon size={18} />
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
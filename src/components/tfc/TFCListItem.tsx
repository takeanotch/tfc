
// src/components/tfc/TFCListItem.tsx
import { FaFilePdf } from 'react-icons/fa';

export function TFCListItem({ tfc }: { tfc: any }) {
  return (
    <div className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 hover:bg-gray-50 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Icon PDF */}
          <div className="mt-1 text-red-600 flex-shrink-0">
            <FaFilePdf size={20} />
          </div>
          
          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            {/* Titre en premier */}
            <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer line-clamp-2">
              {tfc.titre}
            </h3>
            
            {/* Informations - disposition verticale sur mobile */}
            <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-4 text-sm text-gray-600">
              {/* Auteur */}
              <div className="flex items-center gap-1">
                <span className="font-medium text-gray-900 truncate">{tfc.auteur}</span>
              </div>
              
              {/* Promoteur */}
              <div className="flex items-center gap-1">
                <span className="text-gray-500 hidden sm:inline">Promoteur:</span>
                <span className="text-gray-500 sm:hidden">Prom.:</span>
                <span className="font-medium text-gray-900 truncate">{tfc.promoteur}</span>
              </div>
              
              {/* Année */}
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Année:</span>
                <span className="font-medium text-gray-900">
                  {tfc.annees_academiques?.annee}
                </span>
              </div>
              
              {/* Statut */}
              <div className="flex items-center gap-2 sm:gap-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                  tfc.statut === 'approuvé' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                  tfc.statut === 'en_attente' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                  'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  {tfc.statut}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Note à droite si elle existe */}
        {tfc.note && (
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            <span className="text-base sm:text-lg font-semibold text-gray-900">
              {tfc.note}/20
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
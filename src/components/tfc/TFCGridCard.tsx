
// src/components/tfc/TFCGridCard.tsx
import { FaFilePdf } from 'react-icons/fa';

export function TFCGridCard({ tfc }: { tfc: any }) {
  return (
    <div className="group bg-white rounded-lg border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col h-64">
      <div className="p-4 flex flex-col flex-1">
        {/* Header avec icône PDF et statut */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <FaFilePdf className="text-red-600" size={16} />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              tfc.statut === 'approuvé' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
              tfc.statut === 'en_attente' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
              'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {tfc.statut}
            </span>
          </div>
          {tfc.note && (
            <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
              {tfc.note}/20
            </span>
          )}
        </div>

        {/* Titre avec hauteur fixe */}
        <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 text-sm leading-tight group-hover:text-blue-600 transition-colors min-h-[40px]">
          {tfc.titre}
        </h3>

        {/* Métadonnées compactes */}
        <div className="space-y-1.5 text-xs text-gray-600 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 whitespace-nowrap">Auteur</span>
            <span className="font-medium text-gray-900 truncate ml-2 text-right flex-1">{tfc.auteur}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 whitespace-nowrap">Promoteur</span>
            <span className="font-medium text-gray-900 truncate ml-2 text-right flex-1">{tfc.promoteur}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 whitespace-nowrap">Année</span>
            <span className="font-medium text-gray-900">{tfc.annees_academiques?.annee}</span>
          </div>
        </div>

        {/* Tags/Mots-clés - placé en bas avec marge auto */}
        {tfc.mots_cles && tfc.mots_cles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {tfc.mots_cles.slice(0, 3).map((mot: string, index: number) => (
              <span 
                key={index} 
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 transition-colors"
              >
                #{mot}
              </span>
            ))}
            {tfc.mots_cles.length > 3 && (
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                +{tfc.mots_cles.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
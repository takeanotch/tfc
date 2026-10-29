// src/components/tfc/TFCBigGridCard.tsx
export function TFCBigGridCard({ tfc }: { tfc: any }) {
  return (
    <div className="group bg-white rounded-3xl border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              tfc.statut === 'approuvé' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
              tfc.statut === 'en_attente' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
              'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {tfc.statut}
            </span>
            <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
              {tfc.annees_academiques?.annee}
            </span>
          </div>
          {tfc.note && (
            <span className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-2 rounded-xl">
              {tfc.note}/20
            </span>
          )}
        </div>

        {/* Titre */}
        <h3 className="font-bold text-2xl text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
          {tfc.titre}
        </h3>

        {/* Résumé */}
        <p className="text-gray-600 text-lg mb-6 leading-relaxed line-clamp-3">
          {tfc.resume}
        </p>

        {/* Métadonnées en grille */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Auteur</div>
            <div className="font-semibold text-gray-900">{tfc.auteur}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Promoteur</div>
            <div className="font-semibold text-gray-900">{tfc.promoteur}</div>
          </div>
          {tfc.filieres?.nom && (
            <div>
              <div className="text-sm text-gray-500 mb-1">Filière</div>
              <div className="font-semibold text-gray-900">{tfc.filieres.nom}</div>
            </div>
          )}
          {tfc.departements?.nom && (
            <div>
              <div className="text-sm text-gray-500 mb-1">Département</div>
              <div className="font-semibold text-gray-900">{tfc.departements.nom}</div>
            </div>
          )}
        </div>

        {/* Mots-clés */}
        {tfc.mots_cles && tfc.mots_cles.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {tfc.mots_cles.map((mot: string, index: number) => (
              <span key={index} className="text-sm bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200">
                #{mot}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
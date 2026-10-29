// import { NextRequest, NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const tfcId = params.id;

//   try {
//     const { data: tfc, error } = await supabase
//       .from('tfc')
//       .select(`
//         *,
//         facultes:faculte_id(nom),
//         departements:departement_id(nom),
//         filieres:filiere_id(nom),
//         annees_academiques:annee_academique_id(annee)
//       `)
//       .eq('id', tfcId)
//       .single();

//     if (error || !tfc) {
//       return NextResponse.json({ message: 'TFC non trouvé' }, { status: 404 });
//     }

//     // Formater les données
//     const formattedTfc = {
//       ...tfc,
//       faculte_nom: tfc.facultes?.nom,
//       departement_nom: tfc.departements?.nom,
//       filiere_nom: tfc.filieres?.nom,
//       annee_academique: tfc.annees_academiques?.annee
//     };

//     return NextResponse.json(formattedTfc);
//   } catch (error) {
//     console.error('Erreur récupération TFC:', error);
//     return NextResponse.json(
//       { message: 'Erreur serveur' },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ⭐ params est maintenant Promise
) {
  // ⭐ AJOUT: Attendre les params
  const resolvedParams = await params;
  const tfcId = resolvedParams.id;

  try {
    const { data: tfc, error } = await supabase
      .from('tfc')
      .select(`
        *,
        facultes:faculte_id(nom),
        departements:departement_id(nom),
        filieres:filiere_id(nom),
        annees_academiques:annee_academique_id(annee)
      `)
      .eq('id', tfcId)
      .single();

    if (error || !tfc) {
      return NextResponse.json({ message: 'TFC non trouvé' }, { status: 404 });
    }

    // Formater les données
    const formattedTfc = {
      ...tfc,
      faculte_nom: tfc.facultes?.nom,
      departement_nom: tfc.departements?.nom,
      filiere_nom: tfc.filieres?.nom,
      annee_academique: tfc.annees_academiques?.annee
    };

    return NextResponse.json(formattedTfc);
  } catch (error) {
    console.error('Erreur récupération TFC:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
// import { NextRequest, NextResponse } from 'next/server';
// import { getSession } from '@/utils/session';
// import { supabase } from '@/lib/supabase';

// export async function POST(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const user = await getSession();
    
//     if (!user) {
//       return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
//     }

//     const tfcId = parseInt(params.id);

//     // Appeler la fonction PostgreSQL via Supabase RPC
//     const { data: nombreVues, error } = await supabase.rpc(
//       'incrementer_vue_tfc',
//       {
//         p_tfc_id: tfcId,
//         p_user_id: user.id
//       }
//     );

//     if (error) {
//       console.error('Erreur fonction PostgreSQL:', error);
//       throw error;
//     }

//     return NextResponse.json({
//       success: true,
//       nombreVues: nombreVues || 0,
//       message: 'Vue enregistrée avec succès'
//     });
//   } catch (error) {
//     console.error('Erreur enregistrement vue:', error);
//     return NextResponse.json(
//       { success: false, message: 'Erreur serveur' },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/utils/session';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ⭐ params est maintenant Promise
) {
  try {
    // ⭐ AJOUT: Attendre les params
    const resolvedParams = await params;
    const user = await getSession();
    
    if (!user) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    const tfcId = parseInt(resolvedParams.id); // ⭐ Utiliser resolvedParams au lieu de params

    // Appeler la fonction PostgreSQL via Supabase RPC
    const { data: nombreVues, error } = await supabase.rpc(
      'incrementer_vue_tfc',
      {
        p_tfc_id: tfcId,
        p_user_id: user.id
      }
    );

    if (error) {
      console.error('Erreur fonction PostgreSQL:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      nombreVues: nombreVues || 0,
      message: 'Vue enregistrée avec succès'
    });
  } catch (error) {
    console.error('Erreur enregistrement vue:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
// // app/api/auth/me/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { cookies } from 'next/headers';

// export async function GET() {
//   try {
//     const cookieStore = await cookies();
//     const userCookie = cookieStore.get('user');
    
//     if (!userCookie) {
//       return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
//     }
    
//     const user = JSON.parse(userCookie.value);
//     return NextResponse.json(user);
//   } catch (error) {
//     return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
//   }
// }

// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');

    if (!userCookie) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    let sessionUser: Record<string, unknown> & { id?: string };
    try {
      sessionUser = JSON.parse(userCookie.value);
    } catch {
      // Cookie corrompu : on considère l'utilisateur non authentifié
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    if (!sessionUser?.id) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    // Valeur fraîche depuis la base (le cookie peut être périmé jusqu'à 7 jours)
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('access_chat')
      .eq('id', sessionUser.id)
      .maybeSingle();

    if (error) {
      console.error('auth/me: erreur lecture access_chat', error);
    }

    return NextResponse.json(
      {
        ...sessionUser,
        // En cas d'erreur ou d'utilisateur introuvable : accès refusé par défaut
        access_chat: dbUser?.access_chat ?? false,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('auth/me: erreur interne', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
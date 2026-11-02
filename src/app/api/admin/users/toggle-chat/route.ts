import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/utils/session';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // 1. Authentification
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // 2. Autorisation : réservé aux administrateurs
    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // 3. Validation du corps de la requête
    const body = await request.json().catch(() => null);
    const userId = body?.userId;
    const accessChat = body?.accessChat;

    if (!userId || typeof userId !== 'string' || typeof accessChat !== 'boolean') {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    // 4. Mise à jour en base
    const { data, error } = await supabase
      .from('users')
      .update({
        access_chat: accessChat,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id, access_chat')
      .maybeSingle();

    if (error) {
      console.error('toggle-chat: erreur DB', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: accessChat ? 'Accès au chat activé' : 'Accès au chat désactivé',
      user: data,
    });
  } catch (error) {
    console.error('toggle-chat: erreur interne', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
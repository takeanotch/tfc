import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Vérifier la table user_activity
    const { data: activities, error } = await supabase
      .from('user_activity')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json({ 
        error: 'Erreur table user_activity', 
        details: error 
      }, { status: 500 });
    }

    // Vérifier les utilisateurs
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, last_login')
      .limit(5);

    return NextResponse.json({
      user_activity: {
        count: activities?.length || 0,
        recent: activities || []
      },
      users: {
        count: users?.length || 0,
        recent: users || []
      },
      message: activities?.length === 0 
        ? 'Table user_activity vide - le tracking ne fonctionne pas' 
        : 'Tracking fonctionne correctement'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
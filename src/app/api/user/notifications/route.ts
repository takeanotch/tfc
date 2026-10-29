// // app/api/user/notifications/route.ts (version simplifiée)
// import { NextRequest, NextResponse } from 'next/server'
// import { supabase } from '@/lib/supabase'
// import { getSession } from '@/utils/session'

// export async function GET(request: NextRequest) {
//   try {
//     const user = await getSession()
//     if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

//     const { data: notifications, error, count } = await supabase
//       .from('user_notifications')
//       .select('*', { count: 'exact' })
//       .eq('user_id', user.id)
//       .eq('is_read', false)
//       .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
//       .order('created_at', { ascending: false })

//     if (error) throw error

//     return NextResponse.json({
//       notifications: notifications || [],
//       unreadCount: count || 0
//     })
//   } catch (error) {
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
//   }
// }
// app/api/user/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/utils/session'

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data: notifications, error, count } = await supabase
      .from('user_notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount: count || 0
    })
  } catch (error) {
    console.error('Erreur GET notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const body = await request.json()
    const { notificationId, markAll } = body

    if (markAll) {
      // Marquer toutes les notifications comme lues
      const { error } = await supabase
        .from('user_notifications')
        .update({ 
          is_read: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error

      return NextResponse.json({ success: true })
    } else if (notificationId) {
      // Marquer une notification spécifique comme lue
      const { error } = await supabase
        .from('user_notifications')
        .update({ 
          is_read: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) throw error

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }
  } catch (error) {
    console.error('Erreur PUT notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
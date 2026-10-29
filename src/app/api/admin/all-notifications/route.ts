// app/api/admin/all-notifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/utils/session'

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { data: notifications, error } = await supabase
      .from('user_notifications')
      .select(`
        *,
        users:user_id (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      notifications: notifications || []
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
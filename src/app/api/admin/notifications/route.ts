// app/api/admin/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/utils/session'

export async function POST(request: NextRequest) {
  try {
    // Récupérer l'admin connecté
    const adminUser = await getSession()
    
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      message,
      type,
      priority,
      targetType,
      targetRole,
      targetDepartment,
      targetUserId,
      expiresIn,
      actionUrl,
      actionLabel
    } = body

    // Déterminer les utilisateurs cibles
    let targetUsers: any[] = []

    if (targetType === 'all') {
      const { data: users, error } = await supabase
        .from('users')
        .select('id')
        .eq('active', true)
      if (error) throw error
      targetUsers = users || []
    } else if (targetType === 'role' && targetRole) {
      const { data: users, error } = await supabase
        .from('users')
        .select('id')
        .eq('role', targetRole)
        .eq('active', true)
      if (error) throw error
      targetUsers = users || []
    } else if (targetType === 'department' && targetDepartment) {
      const { data: users, error } = await supabase
        .from('users')
        .select('id')
        .eq('departement', targetDepartment)
        .eq('active', true)
      if (error) throw error
      targetUsers = users || []
    } else if (targetType === 'user' && targetUserId) {
      targetUsers = [{ id: targetUserId }]
    }

    // Calculer la date d'expiration
    const expiresAt = expiresIn > 0 
      ? new Date(Date.now() + expiresIn * 60 * 60 * 1000).toISOString()
      : null

    // CORRECTION : Utiliser l'ID de l'admin comme créateur
    const notifications = targetUsers.map(user => ({
      user_id: user.id, // ID de l'utilisateur qui reçoit
      title,
      message,
      type,
      priority,
      expires_at: expiresAt,
      action_url: actionUrl,
      action_label: actionLabel,
      created_by: adminUser.id // ID de l'admin qui envoie
    }))

    if (notifications.length > 0) {
      const { error } = await supabase
        .from('user_notifications')
        .insert(notifications)

      if (error) throw error
    }

    return NextResponse.json({ 
      success: true, 
      message: `Notification envoyée à ${notifications.length} utilisateur(s)`
    })
  } catch (error) {
    console.error('Error creating notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
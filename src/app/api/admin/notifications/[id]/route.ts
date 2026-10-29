// // app/api/admin/notifications/[id]/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { supabase } from '@/lib/supabase'
// import { getSession } from '@/utils/session'

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const user = await getSession()
    
//     if (!user || user.role !== 'admin') {
//       return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
//     }

//     const { error } = await supabase
//       .from('user_notifications')
//       .delete()
//       .eq('id', params.id)

//     if (error) throw error

//     return NextResponse.json({ success: true })
//   } catch (error) {
//     console.error('Error deleting notification:', error)
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
//   }
// }
// app/api/admin/notifications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/utils/session'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params is a Promise
) {
  try {
    // Await the params to get the actual values
    const { id } = await params
    
    const user = await getSession()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { error } = await supabase
      .from('user_notifications')
      .delete()
      .eq('id', id) // Use the destructured id

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
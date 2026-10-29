// // app/api/chat/conversations/[id]/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { supabase } from '@/lib/supabase'
// import { getSession } from '@/utils/session'

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const user = await getSession()
    
//     if (!user) {
//       return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
//     }

//     const conversationId = parseInt(params.id)

//     // Vérifier que la conversation appartient à l'utilisateur
//     const { data: conversation, error: convError } = await supabase
//       .from('chat_conversations')
//       .select('user_id')
//       .eq('id', conversationId)
//       .single()

//     if (convError || !conversation) {
//       return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 })
//     }

//     if (conversation.user_id !== user.id) {
//       return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
//     }

//     // Récupérer les messages de la conversation
//     const { data: messages, error } = await supabase
//       .from('chat_messages')
//       .select('*')
//       .eq('conversation_id', conversationId)
//       .order('created_at', { ascending: true })

//     if (error) {
//       console.error('❌ Erreur récupération messages:', error)
//       return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
//     }

//     return NextResponse.json({ 
//       messages: messages || [],
//       conversationId 
//     })

//   } catch (error) {
//     console.error('❌ Erreur conversation:', error)
//     return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
//   }
// }
// app/api/chat/conversations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/utils/session'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Attendre les params
    const { id } = await params
    const conversationId = parseInt(id)

    if (isNaN(conversationId)) {
      return NextResponse.json({ error: 'ID de conversation invalide' }, { status: 400 })
    }

    // Vérifier que la conversation appartient à l'utilisateur
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 })
    }

    if (conversation.user_id !== user.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Récupérer les messages de la conversation
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ Erreur récupération messages:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ 
      messages: messages || [],
      conversationId 
    })

  } catch (error) {
    console.error('❌ Erreur conversation:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
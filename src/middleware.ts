// // CORRIGÉ - middleware.ts
// import { NextResponse, type NextRequest } from 'next/server'
// import { getSession } from '@/utils/session'

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl
//   console.log('🛡️ Middleware triggered for:', pathname) // DEBUG

//   if (pathname.startsWith('/admin')) {
//     console.log('🔒 Admin route detected') // DEBUG
//     try {
//       const session = await getSession()
//       console.log('👤 Session:', session) // DEBUG
      
//       if (!session) {
//         console.log('❌ No session, redirecting to login')
//         const loginUrl = new URL('/auth/login', request.url)
//         loginUrl.searchParams.set('redirect', pathname)
//         return NextResponse.redirect(loginUrl)
//       }

//       console.log('🔑 User role:', session.role)
      
//       // BLOCAGE IMMÉDIAT des rôles non autorisés
//       if (!['admin', 'check_in_admin'].includes(session.role)) {
//         console.log('🚫 Unauthorized role:', session.role)
//         const redirectMap: Record<string, string> = {
//           teacher: '/teacher',
//           student: '/student',
//           alumni: '/alumni'
//         }
        
//         const redirectPath = redirectMap[session.role] || '/'
//         console.log('↪️ Redirecting to:', redirectPath)
//         return NextResponse.redirect(new URL(redirectPath, request.url))
//       }

//       // Logique pour les admin autorisés
//       if (session.role === 'check_in_admin' && !pathname.startsWith('/admin/check-in')) {
//         return NextResponse.redirect(new URL('/admin/check-in', request.url))
//       }

//       console.log('✅ Access granted for admin')
//       return NextResponse.next()

//     } catch (error) {
//       console.error('❌ Middleware error:', error)
//       return NextResponse.redirect(new URL('/auth/login', request.url))
//     }
//   }

//   return NextResponse.next()
// }

// // CONFIGURATION CRITIQUE - Doit être à la racine du projet
// export const config = {
//   matcher: [
//     '/admin/:path*',
//     // Éviter les fichiers statiques
//     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
//   ]
// }
// CORRIGÉ - middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { getSession } from '@/utils/session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log('🛡️ Middleware triggered for:', pathname) // DEBUG

  // Protection des routes admin
  if (pathname.startsWith('/admin')) {
    console.log('🔒 Admin route detected') // DEBUG
    try {
      const session = await getSession()
      console.log('👤 Session:', session) // DEBUG
      
      if (!session) {
        console.log('❌ No session, redirecting to login')
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      console.log('🔑 User role:', session.role)
      
      // BLOCAGE IMMÉDIAT des rôles non autorisés
      if (!['admin', 'check_in_admin'].includes(session.role)) {
        console.log('🚫 Unauthorized role:', session.role)
        const redirectMap: Record<string, string> = {
          teacher: '/teacher',
          student: '/student',
          alumni: '/alumni'
        }
        
        const redirectPath = redirectMap[session.role] || '/'
        console.log('↪️ Redirecting to:', redirectPath)
        return NextResponse.redirect(new URL(redirectPath, request.url))
      }

      // Logique pour les admin autorisés
      if (session.role === 'check_in_admin' && !pathname.startsWith('/admin/check-in')) {
        return NextResponse.redirect(new URL('/admin/check-in', request.url))
      }

      console.log('✅ Access granted for admin')
      return NextResponse.next()

    } catch (error) {
      console.error('❌ Middleware error:', error)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // Protection de la route /tfc/explorer
  if (pathname.startsWith('/tfc/explorer')) {
    console.log('🔒 TFC Explorer route detected') // DEBUG
    try {
      const session = await getSession()
      console.log('👤 Session:', session) // DEBUG
      
      if (!session) {
        console.log('❌ No session, redirecting to login')
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      console.log('🔑 User role:', session.role)
      
      // BLOCAGE des étudiants sur /tfc/explorer
      if (session.role === 'student') {
        console.log('🚫 Student access denied to TFC Explorer')
        return NextResponse.redirect(new URL('/student', request.url))
      }

      console.log('✅ Access granted for TFC Explorer')
      return NextResponse.next()

    } catch (error) {
      console.error('❌ Middleware error:', error)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // Protection des routes /alumni - interdites aux étudiants
  if (pathname.startsWith('/alumni')) {
    console.log('🔒 Alumni route detected') // DEBUG
    try {
      const session = await getSession()
      console.log('👤 Session:', session) // DEBUG
      
      if (!session) {
        console.log('❌ No session, redirecting to login')
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      console.log('🔑 User role:', session.role)
      
      // BLOCAGE des étudiants sur /alumni
      if (session.role === 'student') {
        console.log('🚫 Student access denied to Alumni section')
        return NextResponse.redirect(new URL('/student', request.url))
      }

      // Redirection des alumni vers leur dashboard s'ils accèdent à d'autres routes alumni
      if (session.role === 'alumni' && pathname !== '/alumni') {
        return NextResponse.redirect(new URL('/alumni', request.url))
      }

      console.log('✅ Access granted for Alumni route')
      return NextResponse.next()

    } catch (error) {
      console.error('❌ Middleware error:', error)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // Protection des routes /teacher - interdites aux étudiants
  if (pathname.startsWith('/teacher')) {
    console.log('🔒 Teacher route detected') // DEBUG
    try {
      const session = await getSession()
      console.log('👤 Session:', session) // DEBUG
      
      if (!session) {
        console.log('❌ No session, redirecting to login')
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      console.log('🔑 User role:', session.role)
      
      // BLOCAGE des étudiants sur /teacher
      if (session.role === 'student') {
        console.log('🚫 Student access denied to Teacher section')
        return NextResponse.redirect(new URL('/student', request.url))
      }

      // Redirection des teachers vers leur dashboard s'ils accèdent à d'autres routes teacher
      if (session.role === 'teacher' && pathname !== '/teacher') {
        return NextResponse.redirect(new URL('/teacher', request.url))
      }

      console.log('✅ Access granted for Teacher route')
      return NextResponse.next()

    } catch (error) {
      console.error('❌ Middleware error:', error)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

// CONFIGURATION CRITIQUE - Doit être à la racine du projet
export const config = {
  matcher: [
    '/admin/:path*',
    '/tfc/explorer/:path*',
    '/alumni/:path*',
    '/teacher/:path*',
    // Éviter les fichiers statiques
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ]
}
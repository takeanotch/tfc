
// utils/session.ts
import { cookies } from 'next/headers';
import { SessionUser } from '@/types/user';
import { redirect } from 'next/navigation';
import { getUserById } from '@/lib/auth';

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies(); // ✅ await ici
    const userCookie = cookieStore.get('user');

    if (!userCookie) return null;

    const sessionUser = JSON.parse(userCookie.value);

    const user = await getUserById(sessionUser.id);

    if (!user || user.active === false) return null;

    return user;
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

export async function requireAuth(role?: string): Promise<SessionUser> {
  const user = await getSession();

  if (!user) {
    redirect(
      `/auth/login?redirect=${encodeURIComponent(
        typeof window !== 'undefined' ? window.location.pathname : '/'
      )}`
    );
  }

  if (role && user.role !== role) {
    switch (user.role) {
      case 'admin':
        redirect('/admin');
      case 'check_in_admin':
        redirect('/admin/check-in');
      case 'teacher':
        redirect('/teacher');
      case 'student':
        redirect('/student');
      case 'alumni':
        redirect('/alumni');
      default:
        redirect('/');
    }
  }

  return user;
}

export async function checkAuth(): Promise<SessionUser | null> {
  return await getSession();
}

export async function logout() {
  'use server';

  const cookieStore = await cookies();
  cookieStore.delete({
    name: 'user',    // ✅ le nom du cookie à supprimer
    path: '/',       // chemin
    // tu peux ajouter httpOnly, sameSite si tu veux
  });

  redirect('/auth/login');
}

export async function login(user: SessionUser) {
  'use server';

  const cookieStore = await cookies(); // ✅ await ici
  cookieStore.set({
    name: 'user',
    value: JSON.stringify(user),
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });

  switch (user.role) {
    case 'admin':
      redirect('/admin');
    case 'check_in_admin':
      redirect('/admin/check-in');
    case 'teacher':
      redirect('/teacher');
    case 'student':
      redirect('/student');
    case 'alumni':
      redirect('/alumni');
    default:
      redirect('/');
  }
}

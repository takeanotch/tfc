'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SessionUser } from '@/types/user';

export async function loginAction(user: SessionUser) {
  const cookieStore = await cookies();
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

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete({
    name: 'user',
    path: '/',
  });

  redirect('/auth/login');
}
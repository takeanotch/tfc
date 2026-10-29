'use client';

import { SessionUser } from '@/types/user';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// Fonction pour récupérer la session depuis les cookies côté client
export function getClientSession(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user='));
    
    if (!userCookie) return null;
    
    const cookieValue = decodeURIComponent(userCookie.split('=')[1]);
    const sessionUser = JSON.parse(cookieValue);
    
    // IMPORTANT: On retourne directement l'user du cookie
    // car côté client on ne peut pas appeler getUserById
    return sessionUser;
  } catch (error) {
    console.error('Session client error:', error);
    return null;
  }
}

// Hook pour utiliser la session dans les composants React
export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const session = getClientSession();
    setUser(session);
    setLoading(false);
  }, []);
  
  return { user, loading };
}

// Hook pour la redirection d'authentification côté client
export function useRequireAuth(role?: string): SessionUser | null {
  const router = useRouter();
  const { user, loading } = useSession();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (!loading && user && role && user.role !== role) {
      switch (user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'check_in_admin':
          router.push('/admin/check-in');
          break;
        case 'teacher':
          router.push('/teacher');
          break;
        case 'student':
          router.push('/student');
          break;
        case 'alumni':
          router.push('/alumni');
          break;
        default:
          router.push('/');
          break;
      }
    }
  }, [user, loading, role, router]);

  return user;
}

// Fonction pour vérifier l'authentification (version synchrone pour le client)
export function checkAuth(): SessionUser | null {
  return getClientSession();
}

// Fonction de déconnexion côté client
export function clientLogout() {
  // Supprimer le cookie
  document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
  
  // Rediriger vers la page de login
  window.location.href = '/auth/login';
}
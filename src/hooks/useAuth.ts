'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SessionUser } from '@/types/user';
import { getClientSession } from '@/utils/session-clients';

export function useAuth() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fonction pour rafraîchir les données utilisateur depuis l'API
  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      // En cas d'erreur, on utilise les données du cookie
      setUser(getClientSession());
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // D'abord, on utilise les données du cookie pour un affichage immédiat
      const sessionUser = getClientSession();
      setUser(sessionUser);
      
      // Ensuite, on rafraîchit avec les données de la base
      await refreshUser();
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const requireAuth = (role?: string) => {
    if (!user) {
      router.push('/auth/login');
      return false;
    }

    if (role && user.role !== role) {
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
      return false;
    }

    return true;
  };

  const logout = () => {
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    window.location.href = '/auth/login';
  };

  return {
    user,
    loading,
    requireAuth,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    hasRole: (role: string) => user?.role === role
  };
}
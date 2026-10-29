

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Constantes de design (cohérentes avec le reste de l'app)
const CARD = 'rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
const FOCUS = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-500'

const PRIMARY_BG = 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500'
const PRIMARY_TEXT = 'text-blue-600 dark:text-blue-400'

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/me');
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        // Redirection automatique immédiate
        handleAutoRedirect(userData.role);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erreur de vérification auth:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoRedirect = (role: string) => {
    const redirectPath = getRedirectPath(role);
    router.push(redirectPath);
  };

  const getRedirectPath = (role: string) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'check_in_admin':
        return '/admin/check-in';
      case 'teacher':
        return '/teacher';
      case 'student':
        return '/student';
      case 'alumni':
        return '/alumni';
      default:
        return '/dashboard';
    }
  };

  // État de chargement (affiche le spinner dans tous les cas où on est en chargement ou connecté)
  if (isLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
        <div className="loader-small"></div>
        <style jsx>{`
          .loader-small {
            width: 24px;
            height: 24px;
            display: grid;
            border-radius: 50%;
            background:
              linear-gradient(0deg, rgb(59 130 246 / 50%) 30%, #0000 0 70%, rgb(59 130 246 / 100%) 0) 50% / 8% 100%,
              linear-gradient(90deg, rgb(59 130 246 / 25%) 30%, #0000 0 70%, rgb(59 130 246 / 75%) 0) 50% / 100% 8%;
            background-repeat: no-repeat;
            animation: l23 1s infinite steps(12);
          }
          .loader-small::before,
          .loader-small::after {
            content: "";
            grid-area: 1/1;
            border-radius: 50%;
            background: inherit;
            opacity: 0.915;
            transform: rotate(30deg);
          }
          .loader-small::after {
            opacity: 0.83;
            transform: rotate(60deg);
          }
          @keyframes l23 {
            100% { transform: rotate(1turn); }
          }
        `}</style>
      </div>
    );
  }

  // État non connecté - affiche la carte de connexion
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      <div className="max-w-md w-full mx-4 text-center">
        <div className={`${CARD} rounded-2xl shadow-sm p-8 transition-colors duration-200`}>
          <div className="mb-6">
            <img 
              src='/logo.png' 
              className='w-48 mx-auto dark:brightness-90 transition-all duration-200' 
              alt="UDBL Logo"
            />
          </div>
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Bienvenue sur UDBL
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Veuillez vous connecter pour accéder à votre espace personnel.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/auth/login')}
              className={`w-full text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 ${PRIMARY_BG} ${FOCUS}`}
            >
              Se connecter
            </button>
            
            <button
              onClick={() => router.push('/support')}
              className={`w-full border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${FOCUS}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Access Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
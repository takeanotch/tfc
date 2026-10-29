// Dans lib/auth.ts 

import { supabase } from './supabase';
import { SessionUser } from '@/types/user';
import bcrypt from 'bcryptjs';
import { UserActivity, OnlineUser } from '@/types/auth';

const SALT_ROUNDS = 12;

// Fonction pour hasher un mot de passe
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// Fonction pour vérifier un mot de passe
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Fonction pour mettre à jour last_login
export async function updateUserLastLogin(userId: string): Promise<void> {
  try {
    await supabase
      .from('users')
      .update({ 
        last_login: new Date().toISOString() 
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Erreur mise à jour last_login:', error);
  }
}

export async function authenticate(username: string, password: string): Promise<SessionUser | null> {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .limit(1);

    if (error || !users || users.length === 0) {
      console.error('Erreur d\'authentification:', error);
      return null;
    }

    const user = users[0];
    
    const isPasswordValid = await verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      console.error('Mot de passe incorrect');
      return null;
    }

    if (user.active === false) {
      console.error('Compte désactivé');
      return null;
    }

    // ✅ METTRE À JOUR LE LAST_LOGIN
    await updateUserLastLogin(user.id);

    const { password: _, ...sessionUser } = user;
    return sessionUser as SessionUser;
  } catch (error) {
    console.error('Erreur lors de authentification:', error);
    return null;
  }
}

// Fonction pour enregistrer l'activité utilisateur
export async function trackUserActivity(userId: string, pageUrl: string, actionType: string = 'page_view', ipAddress?: string, userAgent?: string): Promise<void> {
  try {
    await supabase
      .from('user_activity')
      .insert({
        user_id: userId,
        page_url: pageUrl,
        action_type: actionType,
        ip_address: ipAddress,
        user_agent: userAgent
      });
  } catch (error) {
    console.error('Erreur tracking activité:', error);
  }
}

// Fonction pour récupérer les utilisateurs en ligne (activité < 2 minutes)
export async function getOnlineUsers(): Promise<any[]> {
  try {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    
    const { data: activities, error } = await supabase
      .from('user_activity')
      .select(`
        user_id,
        created_at,
        page_url,
        users (
          id,
          username,
          name,
          email,
          role,
          departement,
          profil_url,
          active
        )
      `)
      .gte('created_at', twoMinutesAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération utilisateurs en ligne:', error);
      return [];
    }

    // Filtrer les doublons et formater
    const uniqueUsers = new Map();
    
    activities?.forEach((activity: any) => {
      if (activity.users && !uniqueUsers.has(activity.user_id)) {
        uniqueUsers.set(activity.user_id, {
          ...activity.users,
          last_activity: activity.created_at,
          current_page: activity.page_url
        });
      }
    });

    return Array.from(uniqueUsers.values());
  } catch (error) {
    console.error('Erreur récupération utilisateurs en ligne:', error);
    return [];
  }
}

// Fonction pour récupérer l'activité récente (24h)
export async function getRecentActivity(hours: number = 24): Promise<any[]> {
  try {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const { data: activities, error } = await supabase
      .from('user_activity')
      .select(`
        user_id,
        page_url,
        action_type,
        created_at,
        users (
          id,
          username,
          name,
          email,
          role,
          departement,
          profil_url,
          active,
          last_login
        )
      `)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Erreur récupération activité récente:', error);
      return [];
    }

    return activities || [];
  } catch (error) {
    console.error('Erreur récupération activité récente:', error);
    return [];
  }
}

export async function getUserById(id: string): Promise<SessionUser | null> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, role, name, email, active, privileged, departement, profil_url')
      .eq('id', id)
      .single();

    if (error || !user) {
      return null;
    }

    return user as SessionUser;
  } catch (error) {
    console.error('Erreur lors de la récupération de utilisateur:', error);
    return null;
  }
}

// NOUVELLE FONCTION : Récupérer les utilisateurs récemment connectés
export async function getRecentlyActiveUsers(hours: number = 24) {
  try {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .not('last_login', 'is', null)
      .gte('last_login', since.toISOString())
      .order('last_login', { ascending: false });

    if (error) {
      console.error('Erreur récupération utilisateurs actifs:', error);
      return [];
    }

    return users || [];
  } catch (error) {
    console.error('Erreur récupération utilisateurs actifs:', error);
    return [];
  }
}

export async function getSessionStats() {
  try {
    const onlineUsers = await getOnlineUsers();
    const recentActivity = await getRecentActivity(24);
    
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    return {
      onlineNow: onlineUsers.length,
      activeToday: recentActivity.length,
      totalUsers: totalUsers || 0,
      peakToday: onlineUsers.length // Estimation simple
    };
  } catch (error) {
    console.error('Erreur stats sessions:', error);
    return {
      onlineNow: 0,
      activeToday: 0,
      totalUsers: 0,
      peakToday: 0
    };
  }
}


// Fonction pour forcer la déconnexion d'un utilisateur
export async function forceLogoutUser(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`/api/admin/users/${userId}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la déconnexion');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur forceLogoutUser:', error);
    throw error;
  }
}


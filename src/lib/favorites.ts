// lib/favorites.ts
import { supabase } from './supabase';

export interface FavoriteTFC {
  id: string;
  tfc_id: number;
  user_id: string;
  pinned_at: string;
  notes?: string;
  tfc?: {
    id: number;
    titre: string;
    auteur: string;
    note?: number;
    faculte_nom?: string;
    annee?: string;
  };
}

// Ajouter un TFC aux favoris
export async function addToFavorites(userId: string, tfcId: number, notes?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('tfc_favorites')
      .insert({
        user_id: userId,
        tfc_id: tfcId,
        notes: notes
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Violation de contrainte unique
        return { success: false, error: 'Ce TFC est déjà dans vos favoris' };
      }
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'ajout aux favoris:', error);
    return { success: false, error: 'Erreur lors de l\'ajout aux favoris' };
  }
}

// Retirer un TFC des favoris
export async function removeFromFavorites(userId: string, tfcId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('tfc_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('tfc_id', tfcId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression des favoris:', error);
    return { success: false, error: 'Erreur lors de la suppression des favoris' };
  }
}

// Vérifier si un TFC est dans les favoris
export async function isTfcFavorite(userId: string, tfcId: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('tfc_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('tfc_id', tfcId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Erreur lors de la vérification des favoris:', error);
    return false;
  }
}

// Récupérer tous les TFC favoris d'un utilisateur
export async function getUserFavorites(userId: string): Promise<FavoriteTFC[]> {
  try {
    const { data, error } = await supabase
      .from('tfc_favorites')
      .select(`
        id,
        tfc_id,
        user_id,
        pinned_at,
        notes,
        tfc: tfc_id (
          id,
          titre,
          auteur,
          note,
          facultes: faculte_id (nom),
          annees_academiques: annee_academique_id (annee)
        )
      `)
      .eq('user_id', userId)
      .order('pinned_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => {
      const tfcData = Array.isArray(item.tfc) ? item.tfc[0] : item.tfc;
      return {
        id: item.id,
        tfc_id: item.tfc_id,
        user_id: item.user_id,
        pinned_at: item.pinned_at,
        notes: item.notes,
        tfc: tfcData
          ? {
              id: tfcData.id,
              titre: tfcData.titre,
              auteur: tfcData.auteur,
              note: tfcData.note,
              faculte_nom: Array.isArray(tfcData.facultes)
                ? (tfcData.facultes as { nom?: string }[])[0]?.nom
                : (tfcData.facultes as { nom?: string } | undefined)?.nom,
              annee: Array.isArray(tfcData.annees_academiques)
                ? (tfcData.annees_academiques as { annee?: string }[])[0]?.annee
                : (tfcData.annees_academiques as { annee?: string } | undefined)?.annee
            }
          : undefined
      };
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    return [];
  }
}

// Récupérer les statistiques des favoris
export async function getFavoritesStats(userId: string) {
  try {
    const { count, error } = await supabase
      .from('tfc_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;

    return {
      totalFavorites: count || 0,
      recentFavorites: 0 // Vous pouvez ajouter une logique pour les favoris récents
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return {
      totalFavorites: 0,
      recentFavorites: 0
    };
  }
}
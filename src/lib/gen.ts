// // src/types/tfc.ts
// export interface TFC {
//   id: number
//   titre: string
//   resume: string
//   mots_cles: string[]
//   auteur: string
//   auteur_email: string
//   promoteur: string
//   faculte_id: number
//   annee_academique_id: number
//   departement_id: number
//   filiere_id: number
//   fichier_nom: string
//   fichier_chemin: string
//   fichier_taille: number
//   fichier_type: string
//   date_soutenance: string
//   note: number
//   statut: string
//   created_at: string
//   updated_at: string
//   facultes?: {
//     nom: string
//     code: string
//   }
//   annees_academiques?: {
//     annee: string
//   }
//   departements?: {
//     nom: string
//     code: string
//   }
//   filieres?: {
//     nom: string
//     code: string
//   }
// }
// src/types/tfc.ts



export interface TFC {
  id: number
  titre: string
  resume: string
  mots_cles: string[]
  technologies: string[]
  auteur: string
  auteur_email: string
  promoteur: string
  faculte_id: number
  annee_academique_id: number
  departement_id: number
  filiere_id: number
  fichier_nom: string
  fichier_chemin: string
  fichier_taille: number
  nombre_vues: number
  fichier_type: string
  date_soutenance: string
  doc_available: boolean
  fonctionnalites: string[]
  note: number
     embedding?: number[] // Ajouter le champ embedding
  statut: string
  created_at: string
  updated_at: string
  added_by_user_id?: string
  added_by_name?: string
  cas_application: string 
  
  // Relations
  facultes?: {
    nom: string
    code: string
  }
  annees_academiques?: {
    annee: string
  }
  departements?: {
    nom: string
    code: string
  }
  filieres?: {
    nom: string
    code: string
  }
  users?: {
    id: string
    name: string
    username: string
    email: string
    profil_url?: string 
    role: string
  }
}

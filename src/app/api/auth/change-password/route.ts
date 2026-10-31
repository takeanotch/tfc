// // app/api/auth/change-password/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';
// import bcrypt from 'bcryptjs';

// export async function POST(request: NextRequest) {
//   try {
//     const { login, currentPassword, newPassword } = await request.json();

//     if (!login || !currentPassword || !newPassword) {
//       return NextResponse.json(
//         { error: 'Tous les champs sont requis' },
//         { status: 400 }
//       );
//     }

//     // Vérifier la force du mot de passe
//     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
//     if (!passwordRegex.test(newPassword)) {
//       return NextResponse.json(
//         { error: 'Le mot de passe ne respecte pas les exigences de sécurité' },
//         { status: 400 }
//       );
//     }

//     // Trouver l'utilisateur par email ou username
//     const { data: user, error: userError } = await supabase
//       .from('users')
//       .select('*')
//       .or(`email.eq.${login},username.eq.${login}`)
//       .single();

//     if (userError || !user) {
//       return NextResponse.json(
//         { error: 'Identifiants incorrects' },
//         { status: 401 }
//       );
//     }

//     // Vérifier le mot de passe actuel
//     const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
//     if (!isPasswordValid) {
//       return NextResponse.json(
//         { error: 'Mot de passe actuel incorrect' },
//         { status: 401 }
//       );
//     }

//     // Hasher le nouveau mot de passe
//     const hashedPassword = await bcrypt.hash(newPassword, 12);

//     // Mettre à jour le mot de passe et last_login
//     const { data: updatedUser, error: updateError } = await supabase
//       .from('users')
//       .update({
//         password: hashedPassword,
//         last_login: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//       })
//       .eq('id', user.id)
//       .select()
//       .single();

//     if (updateError) {
//       console.error('Erreur mise à jour mot de passe:', updateError);
//       return NextResponse.json(
//         { error: 'Erreur lors du changement de mot de passe' },
//         { status: 500 }
//       );
//     }

//     // Retourner les informations utilisateur sans le mot de passe
//     const { password: _, ...userWithoutPassword } = updatedUser;
    
//     return NextResponse.json({
//       message: 'Mot de passe changé avec succès',
//       user: userWithoutPassword
//     });

//   } catch (error) {
//     console.error('Erreur changement mot de passe:', error);
//     return NextResponse.json(
//       { error: 'Erreur interne du serveur' },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// Identifiant : sans espaces autour, insensible à la casse
const normalizeLogin = (value: unknown): string =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

// Mot de passe : casse conservée, espaces aux extrémités retirés
const cleanPassword = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

// Échappe %, _ et \ pour ILIKE
const escapeLike = (value: string): string => value.replace(/[\\%_]/g, '\\$&');

// Cherche par username puis par email, sans tenir compte de la casse
async function findUserByLogin(login: string) {
  const pattern = escapeLike(login);

  const { data: byUsername, error: usernameError } = await supabase
    .from('users')
    .select('*')
    .ilike('username', pattern)
    .limit(1);

  if (usernameError) return { user: null, error: usernameError };
  if (byUsername && byUsername.length > 0) {
    return { user: byUsername[0], error: null };
  }

  const { data: byEmail, error: emailError } = await supabase
    .from('users')
    .select('*')
    .ilike('email', pattern)
    .limit(1);

  if (emailError) return { user: null, error: emailError };
  return { user: byEmail && byEmail.length > 0 ? byEmail[0] : null, error: null };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const login = normalizeLogin(body.login);
    const currentPassword = cleanPassword(body.currentPassword);
    const newPassword = cleanPassword(body.newPassword);

    if (!login || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Vérifier la force du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { error: 'Le mot de passe ne respecte pas les exigences de sécurité' },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur par email ou username
    const { user, error: userError } = await findUserByLogin(login);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Mot de passe actuel incorrect' },
        { status: 401 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Mettre à jour le mot de passe et last_login
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur mise à jour mot de passe:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors du changement de mot de passe' },
        { status: 500 }
      );
    }

    // Retourner les informations utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      message: 'Mot de passe changé avec succès',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
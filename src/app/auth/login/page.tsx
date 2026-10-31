

// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   EnvelopeIcon,
//   UserCircleIcon,
//   EyeIcon,
//   EyeSlashIcon,
//   ExclamationTriangleIcon,
//   LockClosedIcon,
//   PhoneIcon,
//   CheckCircleIcon,
//   XCircleIcon
// } from '@heroicons/react/24/outline';

// export default function LoginPage() {
//   const [login, setLogin] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [acceptedTerms, setAcceptedTerms] = useState(false);
//   const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [passwordStrength, setPasswordStrength] = useState({
//     hasMinLength: false,
//     hasUpperCase: false,
//     hasLowerCase: false,
//     hasNumber: false
//   });
//   const router = useRouter();

//   useEffect(() => {
//     const strength = {
//       hasMinLength: newPassword.length >= 8,
//       hasUpperCase: /[A-Z]/.test(newPassword),
//       hasLowerCase: /[a-z]/.test(newPassword),
//       hasNumber: /[0-9]/.test(newPassword)
//     };
//     setPasswordStrength(strength);
//   }, [newPassword]);

//   const isPasswordValid = Object.values(passwordStrength).every(Boolean);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     if (!login.trim() || !password.trim()) {
//       setError('Veuillez remplir tous les champs');
//       setIsLoading(false);
//       return;
//     }

//     if (!acceptedTerms) {
//       setError('Veuillez accepter les conditions d\'utilisation');
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch('/api/auth', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 
//           username: login,
//           email: login.includes('@') ? login : undefined,
//           password 
//         }),
//       });

//       const contentType = response.headers.get('content-type');
      
//       if (!contentType || !contentType.includes('application/json')) {
//         const text = await response.text();
//         console.error('Réponse non-JSON:', text);
//         throw new Error('Réponse serveur invalide');
//       }

//       const data = await response.json();

//       if (response.ok) {
//         if (data.user.requires_password_change) {
//           setRequiresPasswordChange(true);
//           setIsLoading(false);
//           return;
//         }

//         const redirectPath = getRedirectPath(data.user.role);
//         router.push(redirectPath);
//         router.refresh();
//       } else {
//         switch (response.status) {
//           case 403:
//             setError(data.error || 'Compte désactivé');
//             break;
//           case 401:
//             setError(data.error || 'Identifiants incorrects');
//             break;
//           case 400:
//             setError(data.error || 'Données manquantes');
//             break;
//           default:
//             setError(data.error || 'Erreur de connexion');
//         }
//       }
//     } catch (error) {
//       console.error('Erreur de connexion:', error);
//       setError('Erreur de connexion. Veuillez réessayer.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handlePasswordChange = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     if (!isPasswordValid) {
//       setError('Le mot de passe ne respecte pas les exigences de sécurité');
//       setIsLoading(false);
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setError('Les mots de passe ne correspondent pas');
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch('/api/auth/change-password', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           login,
//           currentPassword: password,
//           newPassword
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         const redirectPath = getRedirectPath(data.user.role);
//         router.push(redirectPath);
//         router.refresh();
//       } else {
//         setError(data.error || 'Erreur lors du changement de mot de passe');
//       }
//     } catch (error) {
//       console.error('Erreur:', error);
//       setError('Erreur lors du changement de mot de passe');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getRedirectPath = (role: string) => {
//     switch (role) {
//       case 'admin': return '/admin';
//       case 'check_in_admin': return '/admin/check-in';
//       case 'teacher': return '/teacher';
//       case 'student': return '/student';
//       case 'alumni': return '/alumni';
//       default: return '/dashboard';
//     }
//   };

//   const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
//     <div className={`flex items-center gap-2 text-sm transition-colors duration-200 ${
//       met ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-500'
//     }`}>
//       {met ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
//       <span>{text}</span>
//     </div>
//   );

//   // Inputs : transparents, bordures douces
//   const inputClasses = "block w-full pl-10 pr-10 py-4 border border-zinc-200 dark:border-zinc-800 rounded-lg placeholder-zinc-400 dark:placeholder-zinc-500 text-zinc-900 dark:text-zinc-100 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm transition-all duration-200";

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="max-w-md w-full space-y-8"
//       >
//         {/* Carte de connexion - Style réintégré */}
//         <motion.div 
//           className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors duration-200"
//           whileHover={{ y: -2 }}
//           transition={{ type: "spring", stiffness: 300 }}
//         >
//           <motion.div 
//             className="grid place-content-center mb-4"
//             initial={{ scale: 0.9 }}
//             animate={{ scale: 1 }}
//             transition={{ delay: 0.1 }}
//           >
//             {/* Logo : Blanc pur en mode sombre */}
//             <img 
//               src='/logo.png' 
//               className='w-[230px] dark:brightness-0 dark:invert transition-all duration-200' 
//               alt="UDBL Logo"
//             />
//           </motion.div>
            
//           <motion.p 
//             className="text-xs text-zinc-500 dark:text-zinc-400 mb-8 text-center transition-colors duration-200"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2 }}
//           >
//             {requiresPasswordChange 
//               ? 'Pour votre sécurité, veuillez définir un nouveau mot de passe'
//               : 'Utiliser votre propre compte pour vous connecter !'
//             }
//           </motion.p>
          
//           {!requiresPasswordChange ? (
//             <form className="space-y-5" onSubmit={handleSubmit}>
//               {/* Message d'erreur */}
//               <AnimatePresence>
//                 {error && (
//                   <motion.div 
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: 'auto' }}
//                     exit={{ opacity: 0, height: 0 }}
//                     className={`p-3 rounded-lg border text-sm transition-colors duration-200 ${
//                       error.includes('désactivé') 
//                         ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400' 
//                         : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400'
//                     }`}
//                   >
//                     <div className="flex items-center">
//                       <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
//                       <span className="font-medium">{error}</span>
//                     </div>
//                     {error.includes('désactivé') && (
//                       <p className="mt-1 text-xs">
//                         Contactez votre administrateur pour réactiver votre compte.
//                       </p>
//                     )}
//                   </motion.div>
//                 )}
//               </AnimatePresence>
             
//               {/* Champ identifiant */}
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.3 }}
//               >
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     {login.includes('@') ? (
//                       <EnvelopeIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500 transition-colors duration-200" />
//                     ) : (
//                       <UserCircleIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500 transition-colors duration-200" />
//                     )}
//                   </div>
//                   <input
//                     id="login"
//                     name="login"
//                     type="text"
//                     required
//                     className={inputClasses}
//                     placeholder="votre@email.com ou nom d'utilisateur"
//                     value={login}
//                     onChange={(e) => setLogin(e.target.value)}
//                     disabled={isLoading}
//                     autoComplete="username"
//                   />
//                 </div>
//               </motion.div>
              
//               {/* Champ mot de passe */}
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.4 }}
//               >
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <LockClosedIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500 transition-colors duration-200" />
//                   </div>
//                   <input
//                     id="password"
//                     name="password"
//                     type={showPassword ? "text" : "password"}
//                     required
//                     className={inputClasses}
//                     placeholder="Votre mot de passe"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     disabled={isLoading}
//                     autoComplete="current-password"
//                   />
//                   <motion.button
//                     type="button"
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200"
//                     onClick={() => setShowPassword(!showPassword)}
//                     whileTap={{ scale: 0.95 }}
//                   >
//                     {showPassword ? (
//                       <EyeSlashIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-200" />
//                     ) : (
//                       <EyeIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-200" />
//                     )}
//                   </motion.button>
//                 </div>
//               </motion.div>

//               {/* Case à cocher pour les conditions */}
//               <motion.div 
//                 className="flex items-start gap-3 p-3 bg-zinc-100/50 dark:bg-zinc-800/30 rounded-lg transition-colors duration-200"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.5 }}
//               >
//                 <div className="flex items-center h-5 mt-0.5">
//                   <input
//                     id="terms"
//                     name="terms"
//                     type="checkbox"
//                     checked={acceptedTerms}
//                     onChange={(e) => setAcceptedTerms(e.target.checked)}
//                     className="w-4 h-4 text-blue-600 bg-transparent border-zinc-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-zinc-900 focus:ring-2 dark:border-zinc-600"
//                   />
//                 </div>
//                 <label htmlFor="terms" className="text-sm text-zinc-600 dark:text-zinc-400 leading-snug">
//                   En vous connectant, vous acceptez les{' '}
//                   <a href="/conditions-politiques" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">
//                     Conditions d'utilisation et Politique de confidentialité
//                   </a>{' '}
//                   de cette plateforme.
//                 </label>
//               </motion.div>

//               {/* Boutons */}
//               <div className="space-y-3 pt-2">
//                 <motion.button
//                   type="submit"
//                   disabled={isLoading || !acceptedTerms}
//                   className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 dark:focus:ring-offset-zinc-900"
//                   whileHover={{ scale: isLoading ? 1 : 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   {isLoading ? (
//                     <div className="flex items-center gap-2">
//                       <div className="loader-small"></div>
//                       <span>Connexion...</span>
//                     </div>
//                   ) : (
//                     'Se connecter'
//                   )}
//                 </motion.button>

//                 <Link href="/support" className='block mt-3'>
//                   <motion.button
//                     type="button"
//                     disabled={isLoading}
//                     className="w-full flex justify-center gap-2 items-center py-4 px-4 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 dark:focus:ring-offset-zinc-900 disabled:opacity-50"
//                     whileHover={{ scale: isLoading ? 1 : 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     <PhoneIcon className="w-4 h-4" />
//                     <span>Support d'accès</span>
//                   </motion.button>
//                 </Link>
//               </div>
//             </form>
//           ) : (
//             /* Formulaire de changement de mot de passe */
//             <form className="space-y-5" onSubmit={handlePasswordChange}>
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 text-center">
//                   Définir un nouveau mot de passe
//                 </h3>
                
//                 <AnimatePresence>
//                   {error && (
//                     <motion.div 
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: 'auto' }}
//                       exit={{ opacity: 0, height: 0 }}
//                       className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-sm mb-4"
//                     >
//                       <div className="flex items-center">
//                         <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
//                         <span className="font-medium">{error}</span>
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
//                     Nouveau mot de passe
//                   </label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <LockClosedIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
//                     </div>
//                     <input
//                       type={showNewPassword ? "text" : "password"}
//                       value={newPassword}
//                       onChange={(e) => setNewPassword(e.target.value)}
//                       className={inputClasses}
//                       placeholder="Votre nouveau mot de passe"
//                       required
//                     />
//                     <motion.button
//                       type="button"
//                       className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                       onClick={() => setShowNewPassword(!showNewPassword)}
//                       whileTap={{ scale: 0.95 }}
//                     >
//                       {showNewPassword ? (
//                         <EyeSlashIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
//                       ) : (
//                         <EyeIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
//                       )}
//                     </motion.button>
//                   </div>
//                 </div>

//                 <div className="space-y-2 mt-4">
//                   <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
//                     Confirmer le mot de passe
//                   </label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <LockClosedIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
//                     </div>
//                     <input
//                       type={showConfirmPassword ? "text" : "password"}
//                       value={confirmPassword}
//                       onChange={(e) => setConfirmPassword(e.target.value)}
//                       className={inputClasses}
//                       placeholder="Confirmez votre mot de passe"
//                       required
//                     />
//                     <motion.button
//                       type="button"
//                       className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                       whileTap={{ scale: 0.95 }}
//                     >
//                       {showConfirmPassword ? (
//                         <EyeSlashIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
//                       ) : (
//                         <EyeIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
//                       )}
//                     </motion.button>
//                   </div>
//                 </div>

//                 <div className="p-4 bg-zinc-100/50 dark:bg-zinc-800/30 rounded-lg space-y-2 mt-6">
//                   <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
//                     Le mot de passe doit contenir :
//                   </p>
//                   <PasswordRequirement met={passwordStrength.hasMinLength} text="Au moins 8 caractères" />
//                   <PasswordRequirement met={passwordStrength.hasUpperCase} text="Une lettre majuscule" />
//                   <PasswordRequirement met={passwordStrength.hasLowerCase} text="Une lettre minuscule" />
//                   <PasswordRequirement met={passwordStrength.hasNumber} text="Un chiffre" />
//                 </div>

//                 <div className="flex gap-3 pt-6">
//                   <motion.button
//                     type="button"
//                     onClick={() => setRequiresPasswordChange(false)}
//                     className="flex-1 py-3 px-4 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors duration-200"
//                     whileTap={{ scale: 0.95 }}
//                   >
//                     Retour
//                   </motion.button>
//                   <motion.button
//                     type="submit"
//                     disabled={isLoading || !isPasswordValid || newPassword !== confirmPassword}
//                     className="flex-1 py-3 px-4 bg-blue-600 dark:bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
//                     whileTap={{ scale: 0.95 }}
//                   >
//                     {isLoading ? (
//                       <div className="flex items-center justify-center gap-2">
//                         <div className="loader-small"></div>
//                         <span>Changement...</span>
//                       </div>
//                     ) : (
//                       'Changer'
//                     )}
//                   </motion.button>
//                 </div>
//               </motion.div>
//             </form>
//           )}
//         </motion.div>

//         <motion.div 
//           className="text-center text-xs text-zinc-500 dark:text-zinc-600 pt-4 transition-colors duration-200"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.7 }}
//         >
//           <p>© {new Date().getFullYear()} UDBL. Tous droits réservés.</p>
//         </motion.div>
//       </motion.div>

//       {/* CSS pour corriger l'autofill et le loader */}
//       <style jsx global>{`
//         /* Correction du pré-remplissage (autofill) */
//         input:-webkit-autofill,
//         input:-webkit-autofill:hover, 
//         input:-webkit-autofill:focus, 
//         input:-webkit-autofill:active {
//           /* On force le fond à être transparent */
//           -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
//           box-shadow: 0 0 0 1000px transparent inset !important;
//           /* On empêche le navigateur de changer la couleur de fond */
//           transition: background-color 5000s ease-in-out 0s !important;
//         }
        
//         /* En mode sombre, on force le texte à rester clair */
//         .dark input:-webkit-autofill,
//         .dark input:-webkit-autofill:hover, 
//         .dark input:-webkit-autofill:focus, 
//         .dark input:-webkit-autofill:active {
//           -webkit-text-fill-color: #f4f4f5 !important; /* zinc-100 */
//           caret-color: #f4f4f5 !important;
//         }

//         .loader-small {
//           width: 14px;
//           height: 14px;
//           display: grid;
//           border-radius: 50%;
//           background:
//             linear-gradient(0deg, rgb(255 255 255 / 50%) 30%, #0000 0 70%, rgb(255 255 255 / 100%) 0) 50% / 8% 100%,
//             linear-gradient(90deg, rgb(255 255 255 / 25%) 30%, #0000 0 70%, rgb(255 255 255 / 75%) 0) 50% / 100% 8%;
//           background-repeat: no-repeat;
//           animation: l23 1s infinite steps(12);
//         }
        
//         .loader-small::before,
//         .loader-small::after {
//           content: "";
//           grid-area: 1/1;
//           border-radius: 50%;
//           background: inherit;
//           opacity: 0.915;
//           transform: rotate(30deg);
//         }
        
//         .loader-small::after {
//           opacity: 0.83;
//           transform: rotate(60deg);
//         }
        
//         @keyframes l23 {
//           100% {
//             transform: rotate(1turn);
//           }
//         }
//       `}</style>
//     </div>
//   );
// }


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EnvelopeIcon,
  UserCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// Identifiant (email / username) : sans espaces autour, insensible à la casse
const normalizeLogin = (value: string) => value.trim().toLowerCase();

// Mot de passe : casse conservée, seuls les espaces aux extrémités sont retirés
const cleanPasswordValue = (value: string) => value.trim();

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false
  });
  const router = useRouter();

  useEffect(() => {
    const value = cleanPasswordValue(newPassword);
    const strength = {
      hasMinLength: value.length >= 8,
      hasUpperCase: /[A-Z]/.test(value),
      hasLowerCase: /[a-z]/.test(value),
      hasNumber: /[0-9]/.test(value)
    };
    setPasswordStrength(strength);
  }, [newPassword]);

  const isPasswordValid = Object.values(passwordStrength).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const normalizedLogin = normalizeLogin(login);
    const cleanPassword = cleanPasswordValue(password);

    if (!normalizedLogin || !cleanPassword) {
      setError('Veuillez remplir tous les champs');
      setIsLoading(false);
      return;
    }

    if (!acceptedTerms) {
      setError('Veuillez accepter les conditions d\'utilisation');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: normalizedLogin,
          email: normalizedLogin.includes('@') ? normalizedLogin : undefined,
          password: cleanPassword
        }),
      });

      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Réponse non-JSON:', text);
        throw new Error('Réponse serveur invalide');
      }

      const data = await response.json();

      if (response.ok) {
        if (data.user.requires_password_change) {
          setRequiresPasswordChange(true);
          setIsLoading(false);
          return;
        }

        const redirectPath = getRedirectPath(data.user.role);
        router.push(redirectPath);
        router.refresh();
      } else {
        switch (response.status) {
          case 403:
            setError(data.error || 'Compte désactivé');
            break;
          case 401:
            setError(data.error || 'Identifiants incorrects');
            break;
          case 400:
            setError(data.error || 'Données manquantes');
            break;
          default:
            setError(data.error || 'Erreur de connexion');
        }
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const normalizedLogin = normalizeLogin(login);
    const cleanCurrent = cleanPasswordValue(password);
    const cleanNew = cleanPasswordValue(newPassword);
    const cleanConfirm = cleanPasswordValue(confirmPassword);

    if (!isPasswordValid) {
      setError('Le mot de passe ne respecte pas les exigences de sécurité');
      setIsLoading(false);
      return;
    }

    if (cleanNew !== cleanConfirm) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: normalizedLogin,
          currentPassword: cleanCurrent,
          newPassword: cleanNew
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const redirectPath = getRedirectPath(data.user.role);
        router.push(redirectPath);
        router.refresh();
      } else {
        setError(data.error || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du changement de mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  const getRedirectPath = (role: string) => {
    switch (role) {
      case 'admin': return '/admin';
      case 'check_in_admin': return '/admin/check-in';
      case 'teacher': return '/teacher';
      case 'student': return '/student';
      case 'alumni': return '/alumni';
      default: return '/dashboard';
    }
  };

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-sm transition-colors duration-200 ${
      met ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-500'
    }`}>
      {met ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
      <span>{text}</span>
    </div>
  );

  // Inputs : transparents, bordures douces
  const inputClasses = "block w-full pl-10 pr-10 py-4 border border-zinc-200 dark:border-zinc-800 rounded-lg placeholder-zinc-400 dark:placeholder-zinc-500 text-zinc-900 dark:text-zinc-100 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm transition-all duration-200";

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Carte de connexion - Style réintégré */}
        <motion.div 
          className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors duration-200"
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div 
            className="grid place-content-center mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* Logo : Blanc pur en mode sombre */}
            <img 
              src='/logo.png' 
              className='w-[230px] dark:brightness-0 dark:invert transition-all duration-200' 
              alt="UDBL Logo"
            />
          </motion.div>
            
          <motion.p 
            className="text-xs text-zinc-500 dark:text-zinc-400 mb-8 text-center transition-colors duration-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {requiresPasswordChange 
              ? 'Pour votre sécurité, veuillez définir un nouveau mot de passe'
              : 'Utiliser votre propre compte pour vous connecter !'
            }
          </motion.p>
          
          {!requiresPasswordChange ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Message d'erreur */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-3 rounded-lg border text-sm transition-colors duration-200 ${
                      error.includes('désactivé') 
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400' 
                        : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                      <span className="font-medium">{error}</span>
                    </div>
                    {error.includes('désactivé') && (
                      <p className="mt-1 text-xs">
                        Contactez votre administrateur pour réactiver votre compte.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
             
              {/* Champ identifiant */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {login.includes('@') ? (
                      <EnvelopeIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500 transition-colors duration-200" />
                    ) : (
                      <UserCircleIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500 transition-colors duration-200" />
                    )}
                  </div>
                  <input
                    id="login"
                    name="login"
                    type="text"
                    required
                    className={inputClasses}
                    placeholder="votre@email.com ou nom d'utilisateur"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    disabled={isLoading}
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>
              </motion.div>
              
              {/* Champ mot de passe */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500 transition-colors duration-200" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className={inputClasses}
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <motion.button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-200" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-200" />
                    )}
                  </motion.button>
                </div>
              </motion.div>

              {/* Case à cocher pour les conditions */}
              <motion.div 
                className="flex items-start gap-3 p-3 bg-zinc-100/50 dark:bg-zinc-800/30 rounded-lg transition-colors duration-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-transparent border-zinc-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-zinc-900 focus:ring-2 dark:border-zinc-600"
                  />
                </div>
                <label htmlFor="terms" className="text-sm text-zinc-600 dark:text-zinc-400 leading-snug">
                  En vous connectant, vous acceptez les{' '}
                  <a href="/conditions-politiques" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">
                    Conditions d'utilisation et Politique de confidentialité
                  </a>{' '}
                  de cette plateforme.
                </label>
              </motion.div>

              {/* Boutons */}
              <div className="space-y-3 pt-2">
                <motion.button
                  type="submit"
                  disabled={isLoading || !acceptedTerms}
                  className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 dark:focus:ring-offset-zinc-900"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="loader-small"></div>
                      <span>Connexion...</span>
                    </div>
                  ) : (
                    'Se connecter'
                  )}
                </motion.button>

                <Link href="/support" className='block mt-3'>
                  <motion.button
                    type="button"
                    disabled={isLoading}
                    className="w-full flex justify-center gap-2 items-center py-4 px-4 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 dark:focus:ring-offset-zinc-900 disabled:opacity-50"
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <PhoneIcon className="w-4 h-4" />
                    <span>Support d'accès</span>
                  </motion.button>
                </Link>
              </div>
            </form>
          ) : (
            /* Formulaire de changement de mot de passe */
            <form className="space-y-5" onSubmit={handlePasswordChange}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 text-center">
                  Définir un nouveau mot de passe
                </h3>
                
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-sm mb-4"
                    >
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                        <span className="font-medium">{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputClasses}
                      placeholder="Votre nouveau mot de passe"
                      required
                    />
                    <motion.button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      whileTap={{ scale: 0.95 }}
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                      )}
                    </motion.button>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputClasses}
                      placeholder="Confirmez votre mot de passe"
                      required
                    />
                    <motion.button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      whileTap={{ scale: 0.95 }}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                      )}
                    </motion.button>
                  </div>
                </div>

                <div className="p-4 bg-zinc-100/50 dark:bg-zinc-800/30 rounded-lg space-y-2 mt-6">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Le mot de passe doit contenir :
                  </p>
                  <PasswordRequirement met={passwordStrength.hasMinLength} text="Au moins 8 caractères" />
                  <PasswordRequirement met={passwordStrength.hasUpperCase} text="Une lettre majuscule" />
                  <PasswordRequirement met={passwordStrength.hasLowerCase} text="Une lettre minuscule" />
                  <PasswordRequirement met={passwordStrength.hasNumber} text="Un chiffre" />
                </div>

                <div className="flex gap-3 pt-6">
                  <motion.button
                    type="button"
                    onClick={() => setRequiresPasswordChange(false)}
                    className="flex-1 py-3 px-4 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors duration-200"
                    whileTap={{ scale: 0.95 }}
                  >
                    Retour
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={
                      isLoading ||
                      !isPasswordValid ||
                      cleanPasswordValue(newPassword) !== cleanPasswordValue(confirmPassword)
                    }
                    className="flex-1 py-3 px-4 bg-blue-600 dark:bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="loader-small"></div>
                        <span>Changement...</span>
                      </div>
                    ) : (
                      'Changer'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </form>
          )}
        </motion.div>

        <motion.div 
          className="text-center text-xs text-zinc-500 dark:text-zinc-600 pt-4 transition-colors duration-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p>© {new Date().getFullYear()} UDBL. Tous droits réservés.</p>
        </motion.div>
      </motion.div>

      {/* CSS pour corriger l'autofill et le loader */}
      <style jsx global>{`
        /* Correction du pré-remplissage (autofill) */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          /* On force le fond à être transparent */
          -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
          box-shadow: 0 0 0 1000px transparent inset !important;
          /* On empêche le navigateur de changer la couleur de fond */
          transition: background-color 5000s ease-in-out 0s !important;
        }
        
        /* En mode sombre, on force le texte à rester clair */
        .dark input:-webkit-autofill,
        .dark input:-webkit-autofill:hover, 
        .dark input:-webkit-autofill:focus, 
        .dark input:-webkit-autofill:active {
          -webkit-text-fill-color: #f4f4f5 !important; /* zinc-100 */
          caret-color: #f4f4f5 !important;
        }

        .loader-small {
          width: 14px;
          height: 14px;
          display: grid;
          border-radius: 50%;
          background:
            linear-gradient(0deg, rgb(255 255 255 / 50%) 30%, #0000 0 70%, rgb(255 255 255 / 100%) 0) 50% / 8% 100%,
            linear-gradient(90deg, rgb(255 255 255 / 25%) 30%, #0000 0 70%, rgb(255 255 255 / 75%) 0) 50% / 100% 8%;
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
          100% {
            transform: rotate(1turn);
          }
        }
      `}</style>
    </div>
  );
}
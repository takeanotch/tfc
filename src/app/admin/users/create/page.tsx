
// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabase';
// import { 
//   UserPlusIcon, 
//   XMarkIcon, 
//   DocumentArrowUpIcon,
//   AcademicCapIcon,
//   BuildingLibraryIcon,
//   UserIcon,
//   CheckCircleIcon,
//   ExclamationTriangleIcon,
//   ArrowLeftIcon,
//   PlusIcon,
//   ChevronDownIcon,
//   ChevronUpIcon
// } from '@heroicons/react/24/outline';

// interface Faculte {
//   id: number;
//   nom: string;
// }

// interface Departement {
//   id: number;
//   nom: string;
//   code: string;
//   faculte_id: number;
// }

// interface RoleOption {
//   value: 'admin' | 'student' | 'teacher' | 'alumni' | 'check_in_admin';
//   label: string;
//   icon: React.ComponentType<any>;
//   description: string;
// }

// export default function CreateUserPage() {
//   const router = useRouter();
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: '',
//     name: '',
//     role: 'student' as 'admin' | 'student' | 'teacher' | 'alumni' | 'check_in_admin',
//     departement: '',
//     faculte_id: 0,
//     departement_id: 0,
//     privileged: false,
//     bio: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');
//   const [facultes, setFacultes] = useState<Faculte[]>([]);
//   const [departements, setDepartements] = useState<Departement[]>([]);
//   const [loadingFacultes, setLoadingFacultes] = useState(true);
//   const [csvFile, setCsvFile] = useState<File | null>(null);
//   const [csvPreview, setCsvPreview] = useState<any[]>([]);
//   const [showAllFacultes, setShowAllFacultes] = useState(false);
//   const [showAllDepartements, setShowAllDepartements] = useState(false);

//   const roles: RoleOption[] = [
//     { 
//       value: 'student', 
//       label: 'Étudiant', 
//       icon: AcademicCapIcon,
//       description: 'Accès étudiant standard'
//     },
//     { 
//       value: 'teacher', 
//       label: 'Enseignant', 
//       icon: UserIcon,
//       description: 'Accès enseignant avec privilèges'
//     },
//     { 
//       value: 'admin', 
//       label: 'Administrateur', 
//       icon: UserIcon,
//       description: 'Accès complet administrateur'
//     },
//     { 
//       value: 'check_in_admin', 
//       label: 'Admin Check-in', 
//       icon: UserIcon,
//       description: 'Gestion des présences'
//     },
//     { 
//       value: 'alumni', 
//       label: 'Ancien élève', 
//       icon: AcademicCapIcon,
//       description: 'Accès alumni'
//     },
//   ];

//   // Charger les facultés au montage du composant
//   useEffect(() => {
//     fetchFacultes();
//   }, []);

//   // Charger les départements quand une faculté est sélectionnée
//   useEffect(() => {
//     if (formData.faculte_id > 0) {
//       fetchDepartementsByFaculte();
//     } else {
//       setDepartements([]);
//       setFormData(prev => ({
//         ...prev,
//         departement_id: 0,
//         departement: ''
//       }));
//     }
//   }, [formData.faculte_id]);

//   const fetchFacultes = async () => {
//     try {
//       setLoadingFacultes(true);
      
//       const { data: facData, error: facError } = await supabase
//         .from('facultes')
//         .select('*')
//         .order('nom');

//       if (facError) throw facError;

//       setFacultes(facData || []);
//     } catch (error) {
//       console.error('Erreur lors du chargement des facultés:', error);
//       setMessage('Erreur lors du chargement des facultés');
//     } finally {
//       setLoadingFacultes(false);
//     }
//   };

//   const fetchDepartementsByFaculte = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('departements')
//         .select('*')
//         .eq('faculte_id', formData.faculte_id)
//         .order('nom');

//       if (error) throw error;
      
//       setDepartements(data || []);
//     } catch (error) {
//       console.error('Erreur lors du chargement des départements:', error);
//       setMessage('Erreur lors du chargement des départements');
//       setDepartements([]);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage('');

//     if (formData.faculte_id > 0 && formData.departement_id === 0) {
//       setMessage('Veuillez sélectionner un département');
//       setLoading(false);
//       return;
//     }

//     let departementNom = '';
//     if (formData.departement_id > 0) {
//       const selectedDepartement = departements.find(d => d.id === formData.departement_id);
//       departementNom = selectedDepartement?.nom || '';
//     }

//     try {
//       const response = await fetch('/api/admin/users', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           ...formData,
//           departement: departementNom
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setMessage('Compte créé avec succès!');
//         setFormData({ 
//           username: '', 
//           email: '', 
//           password: '', 
//           name: '', 
//           role: 'student',
//           departement: '',
//           faculte_id: 0,
//           departement_id: 0,
//           privileged: false,
//           bio: ''
//         });
//         setTimeout(() => {
//           router.push('/admin/users');
//         }, 1500);
//       } else {
//         setMessage(data.error || 'Erreur lors de la création');
//       }
//     } catch (error) {
//       setMessage('Erreur de connexion');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBulkSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!csvFile) {
//       setMessage('Veuillez sélectionner un fichier CSV');
//       return;
//     }

//     setLoading(true);
//     setMessage('');

//     const formData = new FormData();
//     formData.append('file', csvFile);

//     try {
//       const response = await fetch('/api/admin/users/bulk', {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setMessage(`${data.created} comptes créés avec succès! ${data.errors > 0 ? `${data.errors} erreurs.` : ''}`);
//         setCsvFile(null);
//         setCsvPreview([]);
//         if (fileInputRef.current) {
//           fileInputRef.current.value = '';
//         }
//       } else {
//         setMessage(data.error || 'Erreur lors de la création en masse');
//       }
//     } catch (error) {
//       setMessage('Erreur de connexion');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setCsvFile(file);
//       previewCsvFile(file);
//     }
//   };

//   // const previewCsvFile = (file: File) => {
//   //   const reader = new FileReader();
//   //   reader.onload = (e) => {
//   //     const text = e.target?.result as string;
//   //     const lines = text.split('\n').slice(0, 6);
//   //     const preview = lines.map(line => {
//   //       const [name, email, username, role, departement] = line.split(',');
//   //       return { name, email, username, role, departement };
//   //     }).filter(row => row.name && row.email);
//   //     setCsvPreview(preview);
//   //   };
//   //   reader.readAsText(file);
//   // };
// const previewCsvFile = (file: File) => {
//   const reader = new FileReader();
//   reader.onload = (e) => {
//     const text = e.target?.result as string;
//     const lines = text.split('\n').slice(0, 6);
    
//     const preview = lines.map(line => {
//       // Détecter le séparateur
//       const separator = line.includes(';') ? ';' : ',';
//       const [name, email, username, password, role, departement, privileged, bio] = line.split(separator);
      
//       return { 
//         name: name?.trim() || '', 
//         email: email?.trim() || '', 
//         username: username?.trim() || '', 
//         password: password?.trim() || '',
//         role: role?.trim() || '',
//         departement: departement?.trim() || '',
//         privileged: privileged?.trim() || '',
//         bio: bio?.trim() || ''
//       };
//     }).filter(row => row.name && row.email);
    
//     setCsvPreview(preview);
//   };
//   reader.readAsText(file);
// };
//   const downloadCSVTemplate = async () => {
//     try {
//       const response = await fetch('/api/admin/users/bulk');
//       const blob = await response.blob();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = 'template-utilisateurs.csv';
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error('Erreur lors du téléchargement du template:', error);
//       setMessage('Erreur lors du téléchargement du template');
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value, type } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
//     }));
//   };

//   const handleRoleSelect = (role: 'admin' | 'student' | 'teacher' | 'alumni' | 'check_in_admin') => {
//     setFormData(prev => ({ ...prev, role }));
//   };

//   const handleFaculteSelect = (faculteId: number) => {
//     setFormData(prev => ({
//       ...prev,
//       faculte_id: faculteId,
//       departement_id: 0
//     }));
//     setShowAllFacultes(false);
//   };

//   const handleDepartementSelect = (departementId: number) => {
//     setFormData(prev => ({
//       ...prev,
//       departement_id: departementId
//     }));
//     setShowAllDepartements(false);
//   };

//   const togglePrivileged = () => {
//     setFormData(prev => ({ ...prev, privileged: !prev.privileged }));
//   };

//   const displayedFacultes = showAllFacultes ? facultes : facultes.slice(0, 5);
//   const displayedDepartements = showAllDepartements ? departements : departements.slice(0, 5);

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <button
//             onClick={() => router.push('/admin/users')}
//             className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
//           >
//             <ArrowLeftIcon className="h-5 w-5" />
//             <span>Retour aux utilisateurs</span>
//           </button>
//         </div>

//         <div className="shadow-xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
//           {/* Header */}
//           <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
//             <div className="flex items-center space-x-3">
//               <UserPlusIcon className="h-8 w-8 text-blue-600 dark:text-blue-500" />
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Créer un utilisateur</h1>
//                 <p className="text-gray-500 dark:text-gray-400">Ajouter un nouveau compte utilisateur</p>
//               </div>
//             </div>
//           </div>

//           {/* Tabs */}
//           <div className="border-b border-gray-200 dark:border-gray-700">
//             <div className="flex">
//               <button
//                 onClick={() => setActiveTab('single')}
//                 className={`flex items-center px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
//                   activeTab === 'single'
//                     ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-500'
//                     : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
//                 }`}
//               >
//                 <PlusIcon className="h-4 w-4 mr-2" />
//                 Utilisateur unique
//               </button>
//               <button
//                 onClick={() => setActiveTab('bulk')}
//                 className={`flex items-center px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
//                   activeTab === 'bulk'
//                     ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-500'
//                     : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
//                 }`}
//               >
//                 <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
//                 Import CSV
//               </button>
//             </div>
//           </div>

//           <div className="p-6">
//             {activeTab === 'single' ? (
//               <form onSubmit={handleSubmit} className="space-y-8">
//                 {/* Informations de base */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                       Nom complet *
//                     </label>
//                     <input
//                       type="text"
//                       name="name"
//                       required
//                       value={formData.name}
//                       onChange={handleChange}
//                       className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                       placeholder="Ex: Jean Dupont"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                       Nom d'utilisateur *
//                     </label>
//                     <input
//                       type="text"
//                       name="username"
//                       required
//                       value={formData.username}
//                       onChange={handleChange}
//                       className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                       placeholder="Ex: jdupont"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                       Email *
//                     </label>
//                     <input
//                       type="email"
//                       name="email"
//                       required
//                       value={formData.email}
//                       onChange={handleChange}
//                       className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                       placeholder="Ex: jean.dupont@email.com"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                       Mot de passe *
//                     </label>
//                     <input
//                       type="password"
//                       name="password"
//                       required
//                       value={formData.password}
//                       onChange={handleChange}
//                       className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                       placeholder="Saisir le mot de passe"
//                       minLength={4}
//                     />
//                   </div>
//                 </div>

//                 {/* Sélection du rôle */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
//                     Rôle *
//                   </label>
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {roles.map((role) => {
//                       const Icon = role.icon;
//                       const isSelected = formData.role === role.value;
//                       return (
//                         <div
//                           key={role.value}
//                           onClick={() => handleRoleSelect(role.value)}
//                           className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
//                             isSelected
//                               ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-600/20 dark:ring-blue-500/20'
//                               : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
//                           }`}
//                         >
//                           <div className="flex items-center space-x-3">
//                             <div className={`p-2 rounded-lg ${
//                               isSelected ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
//                             }`}>
//                               <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
//                             </div>
//                             <div>
//                               <h3 className={`font-medium ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
//                                 {role.label}
//                               </h3>
//                               <p className="text-sm text-gray-500 dark:text-gray-400">{role.description}</p>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 {/* Sélection de la faculté */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
//                     Faculté
//                   </label>
//                   {loadingFacultes ? (
//                     <div className="text-gray-500 dark:text-gray-400">Chargement des facultés...</div>
//                   ) : (
//                     <div className="space-y-3">
//                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                         {displayedFacultes.map((faculte) => {
//                           const isSelected = formData.faculte_id === faculte.id;
//                           return (
//                             <div
//                               key={faculte.id}
//                               onClick={() => handleFaculteSelect(faculte.id)}
//                               className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
//                                 isSelected
//                                   ? 'border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-600/20 dark:ring-green-500/20'
//                                   : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
//                               }`}
//                             >
//                               <div className="flex items-center space-x-3">
//                                 <BuildingLibraryIcon className={`h-5 w-5 ${
//                                   isSelected ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
//                                 }`} />
//                                 <span className={`font-medium ${isSelected ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
//                                   {faculte.nom}
//                                 </span>
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </div>
                      
//                       {facultes.length > 5 && (
//                         <button
//                           type="button"
//                           onClick={() => setShowAllFacultes(!showAllFacultes)}
//                           className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
//                         >
//                           <span>{showAllFacultes ? 'Afficher moins' : `Afficher les ${facultes.length - 5} autres...`}</span>
//                           {showAllFacultes ? (
//                             <ChevronUpIcon className="h-4 w-4" />
//                           ) : (
//                             <ChevronDownIcon className="h-4 w-4" />
//                           )}
//                         </button>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 {/* Sélection du département */}
//                 {formData.faculte_id > 0 && (
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
//                       Département *
//                     </label>
//                     {departements.length === 0 ? (
//                       <div className="text-gray-500 dark:text-gray-400">Aucun département disponible</div>
//                     ) : (
//                       <div className="space-y-3">
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                           {displayedDepartements.map((departement) => {
//                             const isSelected = formData.departement_id === departement.id;
//                             return (
//                               <div
//                                 key={departement.id}
//                                 onClick={() => handleDepartementSelect(departement.id)}
//                                 className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
//                                   isSelected
//                                     ? 'border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-600/20 dark:ring-purple-500/20'
//                                     : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
//                                 }`}
//                               >
//                                 <div className="flex items-center justify-between">
//                                   <div>
//                                     <h3 className={`font-medium ${isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-white'}`}>
//                                       {departement.nom}
//                                     </h3>
//                                     <p className="text-sm text-gray-500 dark:text-gray-400">{departement.code}</p>
//                                   </div>
//                                   {isSelected && (
//                                     <CheckCircleIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
//                                   )}
//                                 </div>
//                               </div>
//                             );
//                           })}
//                         </div>
                        
//                         {departements.length > 5 && (
//                           <button
//                             type="button"
//                             onClick={() => setShowAllDepartements(!showAllDepartements)}
//                             className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
//                           >
//                             <span>{showAllDepartements ? 'Afficher moins' : `Afficher les ${departements.length - 5} autres...`}</span>
//                             {showAllDepartements ? (
//                               <ChevronUpIcon className="h-4 w-4" />
//                             ) : (
//                               <ChevronDownIcon className="h-4 w-4" />
//                             )}
//                           </button>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Toggle Privileged */}
//                 <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 bg-opacity-50">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                       Accès privilégié
//                     </label>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">
//                       Droits supplémentaires pour l'utilisateur
//                     </p>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={togglePrivileged}
//                     className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
//                       formData.privileged ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
//                     }`}
//                   >
//                     <span
//                       className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
//                         formData.privileged ? 'translate-x-6' : 'translate-x-1'
//                       }`}
//                     />
//                   </button>
//                 </div>

//                 {/* Biographie */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Biographie
//                   </label>
//                   <textarea
//                     name="bio"
//                     value={formData.bio}
//                     onChange={handleChange}
//                     rows={3}
//                     className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                     placeholder="Description de l'utilisateur..."
//                   />
//                 </div>

//                 {/* Actions */}
//                 <div className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="flex items-center space-x-2 py-3 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white disabled:opacity-50 transition duration-200 font-medium"
//                   >
//                     {loading ? (
//                       <>
//                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                         <span>Création en cours...</span>
//                       </>
//                     ) : (
//                       <>
//                         <UserPlusIcon className="h-5 w-5" />
//                         <span>Créer le compte</span>
//                       </>
//                     )}
//                   </button>
                  
//                   <button
//                     type="button"
//                     onClick={() => router.push('/admin/users')}
//                     className="flex items-center space-x-2 py-3 px-8 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white transition duration-200 font-medium"
//                   >
//                     <XMarkIcon className="h-5 w-5" />
//                     <span>Annuler</span>
//                   </button>
//                 </div>
//               </form>
//             ) : (
//               <form onSubmit={handleBulkSubmit} className="space-y-6">
//                 {/* Upload CSV */}
//                 <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     onChange={handleFileChange}
//                     accept=".csv"
//                     className="hidden"
//                   />
                  
//                   {!csvFile ? (
//                     <div 
//                       onClick={() => fileInputRef.current?.click()}
//                       className="cursor-pointer"
//                     >
//                       <DocumentArrowUpIcon className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
//                       <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
//                         Importer un fichier CSV
//                       </h3>
//                       <p className="mb-4 text-gray-500 dark:text-gray-400">
//                         Cliquez pour sélectionner ou glissez-déposez votre fichier CSV
//                       </p>
//                       <button
//                         type="button"
//                         className="py-2 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white transition duration-200 font-medium"
//                       >
//                         Choisir un fichier
//                       </button>
//                     </div>
//                   ) : (
//                     <div className="text-center">
//                       <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
//                       <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
//                         Fichier sélectionné
//                       </h3>
//                       <p className="mb-2 text-gray-500 dark:text-gray-400">{csvFile.name}</p>
//                       <p className="text-sm mb-4 text-gray-500 dark:text-gray-400">
//                         {(csvFile.size / 1024).toFixed(2)} KB
//                       </p>
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setCsvFile(null);
//                           setCsvPreview([]);
//                           if (fileInputRef.current) {
//                             fileInputRef.current.value = '';
//                           }
//                         }}
//                         className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
//                       >
//                         Supprimer le fichier
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Template Download */}
//                 <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h4 className="font-medium text-gray-900 dark:text-white">
//                         Template CSV
//                       </h4>
//                       <p className="text-sm text-gray-500 dark:text-gray-400">
//                         Téléchargez notre template pour formater correctement votre fichier
//                       </p>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={downloadCSVTemplate}
//                       className="flex items-center space-x-2 py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white transition duration-200 font-medium"
//                     >
//                       <DocumentArrowUpIcon className="h-4 w-4" />
//                       <span>Télécharger le template</span>
//                     </button>
//                   </div>
//                 </div>

//                 {/* Aperçu CSV */}
//                 {csvPreview.length > 0 && (
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
//                       Aperçu des données ({csvPreview.length} lignes)
//                     </h4>
//                     <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
//                       <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
//                         <thead className="bg-gray-50 dark:bg-gray-700">
//                           <tr>
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
//                               Nom
//                             </th>
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
//                               Email
//                             </th>
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
//                               Username
//                             </th>
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
//                               Rôle
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
//                           {csvPreview.map((row, index) => (
//                             <tr key={index} className="bg-white dark:bg-gray-800">
//                               <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{row.name}</td>
//                               <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{row.email}</td>
//                               <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{row.username}</td>
//                               <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{row.role}</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 )}

//                 {/* Actions CSV */}
//                 <div className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
//                   <button
//                     type="submit"
//                     disabled={loading || !csvFile}
//                     className="flex items-center space-x-2 py-3 px-8 rounded-lg bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white disabled:opacity-50 transition duration-200 font-medium"
//                   >
//                     {loading ? (
//                       <>
//                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                         <span>Import en cours...</span>
//                       </>
//                     ) : (
//                       <>
//                         <DocumentArrowUpIcon className="h-5 w-5" />
//                         <span>Importer les utilisateurs</span>
//                       </>
//                     )}
//                   </button>
                  
//                   <button
//                     type="button"
//                     onClick={() => router.push('/admin/users')}
//                     className="flex items-center space-x-2 py-3 px-8 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white transition duration-200 font-medium"
//                   >
//                     <XMarkIcon className="h-5 w-5" />
//                     <span>Annuler</span>
//                   </button>
//                 </div>
//               </form>
//             )}

//             {/* Message */}
//             {message && (
//               <div className={`mt-6 p-4 rounded-lg border ${
//                 message.includes('succès') || message.includes('créés')
//                   ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' 
//                   : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
//               }`}>
//                 <div className="flex items-center space-x-2">
//                   {message.includes('succès') || message.includes('créés') ? (
//                     <CheckCircleIcon className="h-5 w-5" />
//                   ) : (
//                     <ExclamationTriangleIcon className="h-5 w-5" />
//                   )}
//                   <span>{message}</span>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  UserPlusIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
  ArrowDownTrayIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  UserIcon,
  ShieldCheckIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type Role = 'admin' | 'student' | 'teacher' | 'alumni' | 'check_in_admin';

interface Faculte {
  id: number;
  nom: string;
}

interface Departement {
  id: number;
  nom: string;
  code: string;
  faculte_id: number;
}

interface RoleOption {
  value: Role;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
}

interface CsvRow {
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
  departement: string;
  privileged: string;
  bio: string;
}

interface FormState {
  username: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  departement: string;
  faculte_id: number;
  departement_id: number;
  privileged: boolean;
  bio: string;
}

const INITIAL_FORM: FormState = {
  username: '',
  email: '',
  password: '',
  name: '',
  role: 'student',
  departement: '',
  faculte_id: 0,
  departement_id: 0,
  privileged: false,
  bio: '',
};

const ROLES: RoleOption[] = [
  { value: 'student', label: 'Étudiant', icon: AcademicCapIcon, description: 'Accès étudiant standard' },
  { value: 'teacher', label: 'Enseignant', icon: UserIcon, description: 'Accès enseignant avec privilèges' },
  { value: 'admin', label: 'Administrateur', icon: ShieldCheckIcon, description: 'Accès complet administrateur' },
  { value: 'check_in_admin', label: 'Admin Check-in', icon: ClipboardDocumentCheckIcon, description: 'Gestion des présences' },
  { value: 'alumni', label: 'Ancien élève', icon: AcademicCapIcon, description: 'Accès alumni' },
];

const PREVIEW_LIMIT = 5;

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const INPUT =
  'h-10 w-full min-w-0 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-white/5';

const BTN_BASE =
  'inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto';

const BTN_PRIMARY = `${BTN_BASE} bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white`;

const BTN_OUTLINE = `${BTN_BASE} border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700`;

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

/** Affiche les `limit` premiers éléments, en gardant toujours l'élément sélectionné visible. */
function visibleItems<T extends { id: number }>(
  items: T[],
  selectedId: number,
  showAll: boolean,
  limit = 5
): T[] {
  if (showAll || items.length <= limit) return items;
  const first = items.slice(0, limit);
  if (selectedId > 0 && !first.some((i) => i.id === selectedId)) {
    const selected = items.find((i) => i.id === selectedId);
    if (selected) return [...first, selected];
  }
  return first;
}

/* -------------------------------------------------------------------------- */
/*                              Petits composants                             */
/* -------------------------------------------------------------------------- */

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      {children}
    </div>
  );
}

function SectionLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <h2 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
      {children}
      {required && <span className="text-rose-500"> *</span>}
    </h2>
  );
}

function OptionCard({
  selected,
  onClick,
  icon: Icon,
  title,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  subtitle?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
        selected
          ? 'border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-700'
          : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700/60'
      }`}
    >
      {Icon && (
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            selected
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
          }`}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{title}</span>
        {subtitle && (
          <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</span>
        )}
      </span>
      {selected && <CheckCircleIcon className="h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />}
    </button>
  );
}

function ShowMoreButton({
  expanded,
  hiddenCount,
  onClick,
}: {
  expanded: boolean;
  hiddenCount: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:text-zinc-100"
    >
      <span>{expanded ? 'Afficher moins' : `Afficher les ${hiddenCount} autres…`}</span>
      {expanded ? <ChevronUpIcon className="h-4 w-4" aria-hidden /> : <ChevronDownIcon className="h-4 w-4" aria-hidden />}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Page                                     */
/* -------------------------------------------------------------------------- */

export default function CreateUserPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const [facultes, setFacultes] = useState<Faculte[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [loadingFacultes, setLoadingFacultes] = useState(true);
  const [showAllFacultes, setShowAllFacultes] = useState(false);
  const [showAllDepartements, setShowAllDepartements] = useState(false);

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<CsvRow[]>([]);
  const [dragging, setDragging] = useState(false);

  /* ------------------------------- Messages ------------------------------- */

  const showMessage = (msg: string, type: 'success' | 'error') => {
    if (messageTimer.current) clearTimeout(messageTimer.current);
    setMessage(msg);
    setMessageType(type);
    messageTimer.current = setTimeout(() => setMessage(''), 6000);
  };

  useEffect(() => {
    return () => {
      if (messageTimer.current) clearTimeout(messageTimer.current);
    };
  }, []);

  /* ------------------------------ Chargements ----------------------------- */

  useEffect(() => {
    let cancelled = false;

    const fetchFacultes = async () => {
      try {
        setLoadingFacultes(true);
        const { data, error } = await supabase.from('facultes').select('*').order('nom');
        if (error) throw error;
        if (!cancelled) setFacultes(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des facultés:', error);
        if (!cancelled) showMessage('Erreur lors du chargement des facultés', 'error');
      } finally {
        if (!cancelled) setLoadingFacultes(false);
      }
    };

    void fetchFacultes();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (formData.faculte_id <= 0) {
      setDepartements([]);
      return;
    }

    let cancelled = false;

    const fetchDepartements = async () => {
      try {
        const { data, error } = await supabase
          .from('departements')
          .select('*')
          .eq('faculte_id', formData.faculte_id)
          .order('nom');
        if (error) throw error;
        if (!cancelled) setDepartements(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des départements:', error);
        if (!cancelled) {
          setDepartements([]);
          showMessage('Erreur lors du chargement des départements', 'error');
        }
      }
    };

    void fetchDepartements();
    return () => {
      cancelled = true;
    };
  }, [formData.faculte_id]);

  /* ------------------------------ Formulaire ------------------------------ */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (role: Role) => setFormData((prev) => ({ ...prev, role }));

  // Recliquer sur la faculté sélectionnée la désélectionne
  const handleFaculteSelect = (faculteId: number) => {
    setFormData((prev) => ({
      ...prev,
      faculte_id: prev.faculte_id === faculteId ? 0 : faculteId,
      departement_id: 0,
      departement: '',
    }));
    setShowAllDepartements(false);
  };

  const handleDepartementSelect = (departementId: number) => {
    setFormData((prev) => ({ ...prev, departement_id: departementId }));
  };

  const togglePrivileged = () => setFormData((prev) => ({ ...prev, privileged: !prev.privileged }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (formData.faculte_id > 0 && formData.departement_id === 0) {
      showMessage('Veuillez sélectionner un département', 'error');
      return;
    }

    setLoading(true);

    const departementNom =
      formData.departement_id > 0
        ? departements.find((d) => d.id === formData.departement_id)?.nom || ''
        : '';

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, departement: departementNom }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Compte créé avec succès !', 'success');
        setFormData(INITIAL_FORM);
        setTimeout(() => router.push('/admin/users'), 1500);
      } else {
        showMessage(data.error || 'Erreur lors de la création', 'error');
      }
    } catch {
      showMessage('Erreur de connexion', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------- Import CSV ------------------------------- */

  const previewCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) ?? '';
      const lines = text.split(/\r?\n/).filter((l) => l.trim()).slice(0, PREVIEW_LIMIT + 2);

      const rows: CsvRow[] = lines.map((line) => {
        const separator = line.includes(';') ? ';' : ',';
        const [name, email, username, password, role, departement, privileged, bio] = line.split(separator);
        return {
          name: name?.trim() || '',
          email: email?.trim() || '',
          username: username?.trim() || '',
          password: password?.trim() || '',
          role: role?.trim() || '',
          departement: departement?.trim() || '',
          privileged: privileged?.trim() || '',
          bio: bio?.trim() || '',
        };
      });

      // La première ligne est un en-tête si son « email » n'en est pas un
      const dataRows = rows.length > 0 && !rows[0].email.includes('@') ? rows.slice(1) : rows;

      setCsvPreview(dataRows.filter((r) => r.name && r.email).slice(0, PREVIEW_LIMIT));
    };
    reader.readAsText(file);
  };

  const acceptFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      showMessage('Le fichier doit être au format .csv', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setCsvFile(file);
    previewCsvFile(file);
  };

  const clearFile = () => {
    setCsvFile(null);
    setCsvPreview([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    acceptFile(e.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      showMessage('Veuillez sélectionner un fichier CSV', 'error');
      return;
    }

    setLoading(true);
    setMessage('');

    const body = new FormData();
    body.append('file', csvFile);

    try {
      const response = await fetch('/api/admin/users/bulk', { method: 'POST', body });
      const data = await response.json();

      if (response.ok) {
        const created = Number(data.created) || 0;
        const errors = Number(data.errors) || 0;
        showMessage(
          `${created} compte(s) créé(s)${errors > 0 ? `, ${errors} erreur(s)` : ''}`,
          created > 0 ? 'success' : 'error'
        );
        clearFile();
      } else {
        showMessage(data.error || 'Erreur lors de la création en masse', 'error');
      }
    } catch {
      showMessage('Erreur de connexion', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSVTemplate = async () => {
    try {
      const response = await fetch('/api/admin/users/bulk');
      if (!response.ok) throw new Error('Téléchargement impossible');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template-utilisateurs.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement du template:', error);
      showMessage('Erreur lors du téléchargement du template', 'error');
    }
  };

  /* --------------------------------- Dérivés -------------------------------- */

  const displayedFacultes = visibleItems(facultes, formData.faculte_id, showAllFacultes);
  const displayedDepartements = visibleItems(departements, formData.departement_id, showAllDepartements);

  const tabs = [
    { id: 'single' as const, label: 'Utilisateur unique', icon: PlusIcon },
    { id: 'bulk' as const, label: 'Import CSV', icon: DocumentArrowUpIcon },
  ];

  /* ---------------------------------- Rendu --------------------------------- */

  return (
    <div className="min-h-[100dvh] w-full min-w-0 max-w-full overflow-x-hidden bg-zinc-50 dark:bg-zinc-900 dark:[color-scheme:dark]">
      <div className="mx-auto w-full min-w-0 max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Retour */}
        <button
          type="button"
          onClick={() => router.push('/admin/users')}
          className="mb-6 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          Retour aux utilisateurs
        </button>

        {/* En-tête de page */}
        <div className="mb-6 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
            <UserPlusIcon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Créer un utilisateur
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Ajoutez un compte, ou importez-en plusieurs depuis un fichier CSV.
            </p>
          </div>
        </div>

        {/* Message de retour */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              role="status"
              className={`mb-6 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
                messageType === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
                  : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300'
              }`}
            >
              {messageType === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 shrink-0" aria-hidden />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 shrink-0" aria-hidden />
              )}
              <span className="min-w-0 flex-1 break-words">{message}</span>
              <button
                type="button"
                onClick={() => setMessage('')}
                aria-label="Fermer le message"
                className="shrink-0 rounded p-1 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Carte principale */}
        <div className="w-full min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          {/* Onglets */}
          <div className="border-b border-zinc-200 dark:border-zinc-700">
            <nav className="flex" aria-label="Mode de création">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative flex min-w-0 flex-1 items-center justify-center gap-2 px-3 py-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-400 sm:flex-none sm:justify-start sm:px-6 ${
                      isActive
                        ? 'text-zinc-900 dark:text-zinc-50'
                        : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="truncate">{tab.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="create-user-active-tab"
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-900 dark:bg-zinc-100"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'single' ? (
              /* ============================ Utilisateur unique ============================ */
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Informations de base */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                  <Field id="name" label="Nom complet" required>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      required
                      autoComplete="off"
                      value={formData.name}
                      onChange={handleChange}
                      className={INPUT}
                      placeholder="Ex : Jean Dupont"
                    />
                  </Field>

                  <Field id="username" label="Nom d'utilisateur" required>
                    <input
                      id="username"
                      type="text"
                      name="username"
                      required
                      autoComplete="off"
                      value={formData.username}
                      onChange={handleChange}
                      className={INPUT}
                      placeholder="Ex : jdupont"
                    />
                  </Field>

                  <Field id="email" label="Email" required>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      required
                      autoComplete="off"
                      value={formData.email}
                      onChange={handleChange}
                      className={INPUT}
                      placeholder="Ex : jean.dupont@email.com"
                    />
                  </Field>

                  <Field id="password" label="Mot de passe" required>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      required
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      className={INPUT}
                      placeholder="Saisir le mot de passe"
                      minLength={4}
                    />
                  </Field>
                </div>

                {/* Rôle */}
                <section>
                  <SectionLabel required>Rôle</SectionLabel>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {ROLES.map((role) => (
                      <OptionCard
                        key={role.value}
                        selected={formData.role === role.value}
                        onClick={() => handleRoleSelect(role.value)}
                        icon={role.icon}
                        title={role.label}
                        subtitle={role.description}
                      />
                    ))}
                  </div>
                </section>

                {/* Faculté */}
                <section>
                  <SectionLabel>Faculté</SectionLabel>
                  {loadingFacultes ? (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Chargement des facultés…</p>
                  ) : facultes.length === 0 ? (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Aucune faculté disponible</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {displayedFacultes.map((faculte) => (
                          <OptionCard
                            key={faculte.id}
                            selected={formData.faculte_id === faculte.id}
                            onClick={() => handleFaculteSelect(faculte.id)}
                            icon={BuildingLibraryIcon}
                            title={faculte.nom}
                          />
                        ))}
                      </div>
                      {facultes.length > 5 && (
                        <ShowMoreButton
                          expanded={showAllFacultes}
                          hiddenCount={facultes.length - 5}
                          onClick={() => setShowAllFacultes((v) => !v)}
                        />
                      )}
                    </div>
                  )}
                </section>

                {/* Département */}
                {formData.faculte_id > 0 && (
                  <section>
                    <SectionLabel required>Département</SectionLabel>
                    {departements.length === 0 ? (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Aucun département disponible</p>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {displayedDepartements.map((departement) => (
                            <OptionCard
                              key={departement.id}
                              selected={formData.departement_id === departement.id}
                              onClick={() => handleDepartementSelect(departement.id)}
                              title={departement.nom}
                              subtitle={departement.code}
                            />
                          ))}
                        </div>
                        {departements.length > 5 && (
                          <ShowMoreButton
                            expanded={showAllDepartements}
                            hiddenCount={departements.length - 5}
                            onClick={() => setShowAllDepartements((v) => !v)}
                          />
                        )}
                      </div>
                    )}
                  </section>
                )}

                {/* Accès privilégié */}
                <div className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Accès privilégié</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Droits supplémentaires pour l&apos;utilisateur
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.privileged}
                    aria-label="Accès privilégié"
                    onClick={togglePrivileged}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                      formData.privileged ? 'bg-teal-600 dark:bg-teal-500' : 'bg-zinc-300 dark:bg-zinc-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.privileged ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Biographie */}
                <Field id="bio" label="Biographie">
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className={`${INPUT} h-auto resize-y py-2`}
                    placeholder="Description de l'utilisateur…"
                  />
                </Field>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-700 sm:flex-row">
                  <button type="button" onClick={() => router.push('/admin/users')} className={BTN_OUTLINE}>
                    <XMarkIcon className="h-4 w-4" aria-hidden />
                    Annuler
                  </button>
                  <button type="submit" disabled={loading} className={BTN_PRIMARY}>
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Création en cours…
                      </>
                    ) : (
                      <>
                        <UserPlusIcon className="h-4 w-4" aria-hidden />
                        Créer le compte
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* ================================ Import CSV ================================ */
              <form onSubmit={handleBulkSubmit} className="space-y-6">
                {/* Zone de dépôt */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors sm:p-8 ${
                    dragging
                      ? 'border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-700'
                      : 'border-zinc-300 dark:border-zinc-600'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv"
                    className="hidden"
                  />

                  {!csvFile ? (
                    <div>
                      <DocumentArrowUpIcon className="mx-auto mb-3 h-10 w-10 text-zinc-400 dark:text-zinc-500" aria-hidden />
                      <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                        Importer un fichier CSV
                      </h3>
                      <p className="mx-auto mb-4 mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
                        Glissez-déposez votre fichier ici, ou sélectionnez-le depuis votre appareil.
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={BTN_PRIMARY}
                      >
                        Choisir un fichier
                      </button>
                    </div>
                  ) : (
                    <div>
                      <CheckCircleIcon className="mx-auto mb-3 h-10 w-10 text-teal-600 dark:text-teal-400" aria-hidden />
                      <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-50">Fichier sélectionné</h3>
                      <p className="mt-1 break-all text-sm text-zinc-600 dark:text-zinc-300">{csvFile.name}</p>
                      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
                        {(csvFile.size / 1024).toFixed(2)} Ko
                      </p>
                      <button
                        type="button"
                        onClick={clearFile}
                        className="rounded-lg px-2 py-1 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                      >
                        Supprimer le fichier
                      </button>
                    </div>
                  )}
                </div>

                {/* Template */}
                <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/40 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Template CSV</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Téléchargez le modèle pour formater correctement votre fichier.
                    </p>
                  </div>
                  <button type="button" onClick={downloadCSVTemplate} className={`${BTN_OUTLINE} shrink-0`}>
                    <ArrowDownTrayIcon className="h-4 w-4" aria-hidden />
                    Télécharger le template
                  </button>
                </div>

                {/* Aperçu */}
                {csvPreview.length > 0 && (
                  <section>
                    <h4 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Aperçu des données ({csvPreview.length} première{csvPreview.length > 1 ? 's' : ''} ligne
                      {csvPreview.length > 1 ? 's' : ''})
                    </h4>

                    {/* Mobile : cartes, sans scroll horizontal */}
                    <ul role="list" className="space-y-2 md:hidden">
                      {csvPreview.map((row, index) => (
                        <li
                          key={index}
                          className="min-w-0 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800"
                        >
                          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{row.name}</p>
                          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{row.email}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            {row.username && (
                              <span className="max-w-full truncate text-zinc-500 dark:text-zinc-400">
                                @{row.username}
                              </span>
                            )}
                            {row.role && (
                              <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                                {row.role}
                              </span>
                            )}
                            {row.departement && (
                              <span className="max-w-full truncate text-zinc-500 dark:text-zinc-400">
                                {row.departement}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Desktop : tableau */}
                    <div className="hidden overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700 md:block">
                      <table className="w-full table-fixed border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/40">
                            {['Nom', 'Email', 'Username', 'Rôle', 'Département'].map((h) => (
                              <th
                                key={h}
                                className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvPreview.map((row, index) => (
                            <tr
                              key={index}
                              className="border-b border-zinc-100 last:border-0 dark:border-zinc-700/60"
                            >
                              <td className="truncate px-3 py-3 text-sm text-zinc-800 dark:text-zinc-200">{row.name}</td>
                              <td className="truncate px-3 py-3 text-sm text-zinc-800 dark:text-zinc-200">{row.email}</td>
                              <td className="truncate px-3 py-3 text-sm text-zinc-800 dark:text-zinc-200">{row.username}</td>
                              <td className="truncate px-3 py-3 text-sm text-zinc-800 dark:text-zinc-200">{row.role}</td>
                              <td className="truncate px-3 py-3 text-sm text-zinc-800 dark:text-zinc-200">{row.departement}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-700 sm:flex-row">
                  <button type="button" onClick={() => router.push('/admin/users')} className={BTN_OUTLINE}>
                    <XMarkIcon className="h-4 w-4" aria-hidden />
                    Annuler
                  </button>
                  <button type="submit" disabled={loading || !csvFile} className={BTN_PRIMARY}>
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Import en cours…
                      </>
                    ) : (
                      <>
                        <DocumentArrowUpIcon className="h-4 w-4" aria-hidden />
                        Importer les utilisateurs
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
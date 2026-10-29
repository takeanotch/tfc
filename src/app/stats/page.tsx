
// 'use client';

// import { useState, useEffect, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { supabase } from '@/lib/supabase';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement,
// } from 'chart.js';
// import { Bar, Line, Doughnut } from 'react-chartjs-2';

// // Enregistrer les composants Chart.js
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement
// );

// // Types
// interface Technology {
//   name: string;
//   count: number;
// }

// interface Keyword {
//   name: string;
//   count: number;
// }

// interface Feature {
//   name: string;
//   count: number;
// }

// interface YearlyTrend {
//   year: string;
//   technologies: { [key: string]: number };
//   keywords: { [key: string]: number };
//   features: { [key: string]: number };
//   totalTfcs: number;
// }

// // Constantes pour la pagination
// const ITEMS_PER_PAGE = 10;
// const MOBILE_ITEMS_PER_PAGE = 8;

// export default function AnalyticsPage() {
//   const [activeTab, setActiveTab] = useState<'technologies' | 'keywords' | 'features' | 'trends'>('technologies');
//   const [technologies, setTechnologies] = useState<Technology[]>([]);
//   const [keywords, setKeywords] = useState<Keyword[]>([]);
//   const [features, setFeatures] = useState<Feature[]>([]);
//   const [yearlyTrends, setYearlyTrends] = useState<YearlyTrend[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [totalTfcCount, setTotalTfcCount] = useState(0);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isMobile, setIsMobile] = useState(false);

//   // Détection de la taille d'écran
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   // Réinitialiser la pagination quand on change d'onglet
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [activeTab]);

//   // Options pour les graphiques
//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: 'top' as const,
//       },
//     },
//   };

//   useEffect(() => {
//     fetchAnalyticsData();
//   }, []);

//   const fetchAnalyticsData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Récupérer tous les TFC approuvés avec leurs années académiques
//       const { data: tfcData, error: tfcError } = await supabase
//         .from('tfc')
//         .select(`
//           technologies,
//           mots_cles,
//           fonctionnalites,
//           annee_academique_id,
//           annees_academiques (annee)
//         `)
//         .eq('statut', 'approuvé');

//       if (tfcError) throw tfcError;

//       // Compter le nombre total de TFC
//       setTotalTfcCount(tfcData?.length || 0);

//       // Traiter les données pour les tendances annuelles
//       const yearMap = new Map<string, YearlyTrend>();

//       // Traiter les technologies, mots-clés et fonctionnalités
//       const techMap = new Map<string, number>();
//       const keywordMap = new Map<string, number>();
//       const featureMap = new Map<string, number>();

//       tfcData?.forEach(tfc => {
//         const year = Array.isArray(tfc.annees_academiques)
//           ? ((tfc.annees_academiques[0] as any)?.annee ?? 'Non spécifiée')
//           : ((tfc.annees_academiques as any)?.annee ?? 'Non spécifiée');
        
//         // Initialiser l'année si elle n'existe pas
//         if (!yearMap.has(year)) {
//           yearMap.set(year, {
//             year,
//             technologies: {},
//             keywords: {},
//             features: {},
//             totalTfcs: 0
//           });
//         }

//         const yearData = yearMap.get(year)!;
//         yearData.totalTfcs += 1;

//         // Traiter les technologies
//         if (tfc.technologies && Array.isArray(tfc.technologies)) {
//           tfc.technologies.forEach((tech: string) => {
//             if (tech && tech.trim() !== '') {
//               const normalizedTech = tech.trim().toLowerCase();
              
//               // Global count
//               techMap.set(normalizedTech, (techMap.get(normalizedTech) || 0) + 1);
              
//               // Yearly count
//               yearData.technologies[normalizedTech] = 
//                 (yearData.technologies[normalizedTech] || 0) + 1;
//             }
//           });
//         }

//         // Traiter les mots-clés
//         if (tfc.mots_cles && Array.isArray(tfc.mots_cles)) {
//           tfc.mots_cles.forEach((keyword: string) => {
//             if (keyword && keyword.trim() !== '') {
//               const normalizedKeyword = keyword.trim().toLowerCase();
              
//               // Global count
//               keywordMap.set(normalizedKeyword, (keywordMap.get(normalizedKeyword) || 0) + 1);
              
//               // Yearly count
//               yearData.keywords[normalizedKeyword] = 
//                 (yearData.keywords[normalizedKeyword] || 0) + 1;
//             }
//           });
//         }

//         // Traiter les fonctionnalités
//         if (tfc.fonctionnalites && Array.isArray(tfc.fonctionnalites)) {
//           tfc.fonctionnalites.forEach((feature: string) => {
//             if (feature && feature.trim() !== '' && feature !== 'non spécifié') {
//               const normalizedFeature = feature.trim().toLowerCase();
              
//               // Global count
//               featureMap.set(normalizedFeature, (featureMap.get(normalizedFeature) || 0) + 1);
              
//               // Yearly count
//               yearData.features[normalizedFeature] = 
//                 (yearData.features[normalizedFeature] || 0) + 1;
//             }
//           });
//         }
//       });

//       // Convertir les maps en tableaux et trier
//       const sortedTechnologies = Array.from(techMap.entries())
//         .map(([name, count]) => ({ name, count }))
//         .sort((a, b) => b.count - a.count);

//       const sortedKeywords = Array.from(keywordMap.entries())
//         .map(([name, count]) => ({ name, count }))
//         .sort((a, b) => b.count - a.count);

//       const sortedFeatures = Array.from(featureMap.entries())
//         .map(([name, count]) => ({ name, count }))
//         .sort((a, b) => b.count - a.count);

//       // Convertir les tendances annuelles en tableau et trier par année
//       const sortedYearlyTrends = Array.from(yearMap.values())
//         .sort((a, b) => a.year.localeCompare(b.year));

//       setTechnologies(sortedTechnologies);
//       setKeywords(sortedKeywords);
//       setFeatures(sortedFeatures);
//       setYearlyTrends(sortedYearlyTrends);

//     } catch (err) {
//       console.error('Erreur lors du chargement des données:', err);
//       setError('Erreur lors du chargement des données');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Pagination
//   const itemsPerPage = isMobile ? MOBILE_ITEMS_PER_PAGE : ITEMS_PER_PAGE;

//   const getCurrentData = () => {
//     switch (activeTab) {
//       case 'technologies':
//         return technologies;
//       case 'keywords':
//         return keywords;
//       case 'features':
//         return features;
//       case 'trends':
//         return [];
//     }
//   };

//   const paginatedData = useMemo(() => {
//     const data = getCurrentData();
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
//     return data.slice(startIndex, endIndex);
//   }, [getCurrentData(), currentPage, itemsPerPage]);

//   const totalPages = Math.ceil(getCurrentData().length / itemsPerPage);

//   // Fonctions de pagination
//   const goToPage = (page: number) => {
//     setCurrentPage(page);
//     // Scroll vers le haut de la liste
//     if (typeof window !== 'undefined') {
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   const nextPage = () => {
//     if (currentPage < totalPages) {
//       goToPage(currentPage + 1);
//     }
//   };

//   const prevPage = () => {
//     if (currentPage > 1) {
//       goToPage(currentPage - 1);
//     }
//   };

//   // Préparer les données pour le graphique des tendances des technologies
//   const getTechnologyTrendsData = () => {
//     const topTechs = technologies.slice(0, 8).map(tech => tech.name);
//     const years = yearlyTrends.map(trend => trend.year);

//     const datasets = topTechs.map((tech, index) => {
//       const colors = [
//         'rgb(59, 130, 246)',
//         'rgb(16, 185, 129)',
//         'rgb(245, 158, 11)',
//         'rgb(239, 68, 68)',
//         'rgb(139, 92, 246)',
//         'rgb(14, 165, 233)',
//         'rgb(236, 72, 153)',
//         'rgb(20, 184, 166)'
//       ];

//       return {
//         label: tech.charAt(0).toUpperCase() + tech.slice(1),
//         data: years.map(year => 
//           yearlyTrends.find(t => t.year === year)?.technologies[tech] || 0
//         ),
//         borderColor: colors[index % colors.length],
//         backgroundColor: colors[index % colors.length] + '20',
//         tension: 0.3,
//       };
//     });

//     return {
//       labels: years,
//       datasets,
//     };
//   };

//   // Préparer les données pour le graphique des tendances des mots-clés
//   const getKeywordTrendsData = () => {
//     const topKeywords = keywords.slice(0, 6).map(keyword => keyword.name);
//     const years = yearlyTrends.map(trend => trend.year);

//     const datasets = topKeywords.map((keyword, index) => {
//       const colors = [
//         'rgb(139, 92, 246)',
//         'rgb(14, 165, 233)',
//         'rgb(236, 72, 153)',
//         'rgb(20, 184, 166)',
//         'rgb(245, 158, 11)',
//         'rgb(239, 68, 68)'
//       ];

//       return {
//         label: keyword.charAt(0).toUpperCase() + keyword.slice(1),
//         data: years.map(year => 
//           yearlyTrends.find(t => t.year === year)?.keywords[keyword] || 0
//         ),
//         borderColor: colors[index % colors.length],
//         backgroundColor: colors[index % colors.length] + '20',
//         tension: 0.3,
//       };
//     });

//     return {
//       labels: years,
//       datasets,
//     };
//   };

//   // Préparer les données pour le graphique des tendances des fonctionnalités
//   const getFeatureTrendsData = () => {
//     const topFeatures = features.slice(0, 6).map(feature => feature.name);
//     const years = yearlyTrends.map(trend => trend.year);

//     const datasets = topFeatures.map((feature, index) => {
//       const colors = [
//         'rgb(16, 185, 129)',
//         'rgb(245, 158, 11)',
//         'rgb(239, 68, 68)',
//         'rgb(139, 92, 246)',
//         'rgb(14, 165, 233)',
//         'rgb(236, 72, 153)'
//       ];

//       return {
//         label: feature.charAt(0).toUpperCase() + feature.slice(1),
//         data: years.map(year => 
//           yearlyTrends.find(t => t.year === year)?.features[feature] || 0
//         ),
//         borderColor: colors[index % colors.length],
//         backgroundColor: colors[index % colors.length] + '20',
//         tension: 0.3,
//       };
//     });

//     return {
//       labels: years,
//       datasets,
//     };
//   };

//   // Préparer les données pour le graphique en barres des technologies
//   const getTechnologyBarData = () => {
//     const topTechs = technologies.slice(0, 10);
    
//     return {
//       labels: topTechs.map(tech => {
//         const name = tech.name.charAt(0).toUpperCase() + tech.name.slice(1);
//         return isMobile && name.length > 12 ? name.substring(0, 10) + '...' : name;
//       }),
//       datasets: [
//         {
//           label: 'Nombre d\'utilisations',
//           data: topTechs.map(tech => tech.count),
//           backgroundColor: 'rgba(59, 130, 246, 0.7)',
//           borderColor: 'rgb(59, 130, 246)',
//           borderWidth: 1,
//         },
//       ],
//     };
//   };

//   // Préparer les données pour le graphique en barres des mots-clés
//   const getKeywordBarData = () => {
//     const topKeywords = keywords.slice(0, 10);
    
//     return {
//       labels: topKeywords.map(keyword => {
//         const name = keyword.name.charAt(0).toUpperCase() + keyword.name.slice(1);
//         return isMobile && name.length > 12 ? name.substring(0, 10) + '...' : name;
//       }),
//       datasets: [
//         {
//           label: 'Nombre d\'utilisations',
//           data: topKeywords.map(keyword => keyword.count),
//           backgroundColor: 'rgba(139, 92, 246, 0.7)',
//           borderColor: 'rgb(139, 92, 246)',
//           borderWidth: 1,
//         },
//       ],
//     };
//   };

//   // Préparer les données pour le graphique en doughnut des fonctionnalités
//   const getFeatureDoughnutData = () => {
//     const topFeatures = features.slice(0, 8);
    
//     const backgroundColors = [
//       'rgba(16, 185, 129, 0.7)',
//       'rgba(245, 158, 11, 0.7)',
//       'rgba(239, 68, 68, 0.7)',
//       'rgba(139, 92, 246, 0.7)',
//       'rgba(14, 165, 233, 0.7)',
//       'rgba(236, 72, 153, 0.7)',
//       'rgba(20, 184, 166, 0.7)',
//       'rgba(99, 102, 241, 0.7)'
//     ];

//     return {
//       labels: topFeatures.map(feature => {
//         const name = feature.name.charAt(0).toUpperCase() + feature.name.slice(1);
//         return isMobile && name.length > 15 ? name.substring(0, 13) + '...' : name;
//       }),
//       datasets: [
//         {
//           data: topFeatures.map(feature => feature.count),
//           backgroundColor: backgroundColors,
//           borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
//           borderWidth: 1,
//         },
//       ],
//     };
//   };

//   // Préparer les données pour le graphique en doughnut des mots-clés
//   const getKeywordDoughnutData = () => {
//     const topKeywords = keywords.slice(0, 8);
    
//     const backgroundColors = [
//       'rgba(139, 92, 246, 0.7)',
//       'rgba(14, 165, 233, 0.7)',
//       'rgba(236, 72, 153, 0.7)',
//       'rgba(20, 184, 166, 0.7)',
//       'rgba(245, 158, 11, 0.7)',
//       'rgba(239, 68, 68, 0.7)',
//       'rgba(16, 185, 129, 0.7)',
//       'rgba(99, 102, 241, 0.7)'
//     ];

//     return {
//       labels: topKeywords.map(keyword => {
//         const name = keyword.name.charAt(0).toUpperCase() + keyword.name.slice(1);
//         return isMobile && name.length > 15 ? name.substring(0, 13) + '...' : name;
//       }),
//       datasets: [
//         {
//           data: topKeywords.map(keyword => keyword.count),
//           backgroundColor: backgroundColors,
//           borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
//           borderWidth: 1,
//         },
//       ],
//     };
//   };

//   const tabs = [
//     { id: 'technologies' as const, label: 'Techs', count: technologies.length },
//     { id: 'keywords' as const, label: 'Kw', count: keywords.length },
//     { id: 'features' as const, label: 'Fonctions', count: features.length },
//     { id: 'trends' as const, label: 'Trends', count: yearlyTrends.length },
//   ];

//   const getTotalCount = () => {
//     return getCurrentData().reduce((sum, item) => sum + item.count, 0);
//   };

//   const getMaxCount = () => {
//     const data = getCurrentData();
//     return data.length > 0 ? Math.max(...data.map(item => item.count)) : 0;
//   };

//   // Composant de pagination moderne
//   const Pagination = () => {
//     if (totalPages <= 1) return null;

//     const visiblePages = () => {
//       if (isMobile) {
//         // Sur mobile, on montre seulement la page actuelle et les boutons précédent/suivant
//         return [currentPage];
//       }

//       // Sur desktop, on montre plus de pages
//       const delta = 2;
//       const range = [];
//       const rangeWithDots = [];

//       for (
//         let i = Math.max(2, currentPage - delta);
//         i <= Math.min(totalPages - 1, currentPage + delta);
//         i++
//       ) {
//         range.push(i);
//       }

//       if (currentPage - delta > 2) {
//         rangeWithDots.push(1, '...');
//       } else {
//         rangeWithDots.push(1);
//       }

//       rangeWithDots.push(...range);

//       if (currentPage + delta < totalPages - 1) {
//         rangeWithDots.push('...', totalPages);
//       } else {
//         rangeWithDots.push(totalPages);
//       }

//       return rangeWithDots;
//     };

//     return (
//       <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
//         {/* Info de pagination */}
//         <div className="text-sm text-gray-500 dark:text-gray-400">
//           Page {currentPage} sur {totalPages}
//         </div>

//         {/* Contrôles de pagination */}
//         <div className="flex items-center space-x-2">
//           {/* Bouton précédent */}
//           <button
//             onClick={prevPage}
//             disabled={currentPage === 1}
//             className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//           >
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//             </svg>
//           </button>

//           {/* Pages */}
//           <div className="flex items-center space-x-1">
//             {visiblePages().map((page, index) => (
//               <button
//                 key={index}
//                 onClick={() => typeof page === 'number' && goToPage(page)}
//                 className={`min-w-[2.5rem] h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
//                   page === currentPage
//                     ? 'bg-blue-500 text-white shadow-sm'
//                     : page === '...'
//                     ? 'text-gray-400 cursor-default'
//                     : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
//                 }`}
//                 disabled={page === '...'}
//               >
//                 {page}
//               </button>
//             ))}
//           </div>

//           {/* Bouton suivant */}
//           <button
//             onClick={nextPage}
//             disabled={currentPage === totalPages}
//             className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//           >
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//             </svg>
//           </button>
//         </div>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8">
//         <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400 mx-auto"></div>
//             <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des données analytiques...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8">
//         <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-md mx-auto">
//               <p className="text-red-600 dark:text-red-400">{error}</p>
//               <button
//                 onClick={fetchAnalyticsData}
//                 className="mt-3 bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
//               >
//                 Réessayer
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8">
//       <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
//         {/* En-tête */}
//         <div className="text-center mb-6 md:mb-8">
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
//             Analytics TFC
//           </h1>
//           <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">
//             Analyse détaillée des technologies, fonctionnalités et tendances
//           </p>
//         </div>

//         {/* Statistique simple et discrète */}
//         <div className="text-center mb-6 md:mb-8">
//           <div className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
//             <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
//               Basé sur <span className="font-semibold text-gray-900 dark:text-white">{totalTfcCount}</span> TFC
//             </span>
//           </div>
//         </div>

//         {/* Navigation par onglets - Version mobile optimisée */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 md:p-2 mb-6 md:mb-8 max-w-2xl mx-auto">
//           <div className="relative">
//             <div className="flex space-x-1">
//               {tabs.map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`relative flex-1 py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium transition-all duration-200 rounded-lg ${
//                     activeTab === tab.id
//                       ? 'text-gray-900 dark:text-white'
//                       : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
//                   }`}
//                 >
//                   <div className="flex items-center justify-center space-x-1 md:space-x-2">
//                     <span className="truncate">{tab.label}</span>
//                     <span className={`inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 text-xs rounded-full ${
//                       activeTab === tab.id
//                         ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
//                         : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
//                     }`}>
//                       {tab.count}
//                     </span>
//                   </div>
                  
//                   {activeTab === tab.id && (
//                     <motion.div
//                       className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400"
//                       layoutId="activeTab"
//                       transition={{
//                         type: "spring",
//                         stiffness: 300,
//                         damping: 30
//                       }}
//                     />
//                   )}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Contenu des onglets */}
//         {activeTab === 'trends' ? (
//           // Section Tendances avec graphiques
//           <div className="space-y-4 md:space-y-6">
//             {/* Graphique des tendances des technologies */}
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
//               <div className="flex items-center justify-between mb-4 md:mb-6">
//                 <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
//                   Tendances Technologies
//                 </h2>
//                 <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
//                   Top 8
//                 </div>
//               </div>
//               <div className="h-64 md:h-80">
//                 <Line 
//                   data={getTechnologyTrendsData()} 
//                   options={{
//                     ...chartOptions,
//                     plugins: {
//                       ...chartOptions.plugins,
//                       legend: {
//                         ...chartOptions.plugins.legend,
//                         labels: {
//                           boxWidth: isMobile ? 8 : 12,
//                           font: {
//                             size: isMobile ? 10 : 12
//                           }
//                         }
//                       }
//                     }
//                   }} 
//                 />
//               </div>
//             </div>

//             {/* Graphiques secondaires */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
//               {/* Graphique des tendances des mots-clés */}
//               <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
//                 <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
//                   Tendances Mots-clés
//                 </h3>
//                 <div className="h-56 md:h-64">
//                   <Line 
//                     data={getKeywordTrendsData()} 
//                     options={{
//                       ...chartOptions,
//                       plugins: {
//                         ...chartOptions.plugins,
//                         legend: {
//                           ...chartOptions.plugins.legend,
//                           labels: {
//                             boxWidth: isMobile ? 8 : 12,
//                             font: {
//                               size: isMobile ? 10 : 12
//                             }
//                           }
//                         }
//                       }
//                     }} 
//                   />
//                 </div>
//               </div>

//               {/* Graphique des tendances des fonctionnalités */}
//               <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
//                 <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
//                   Tendances Fonctionnalités
//                 </h3>
//                 <div className="h-56 md:h-64">
//                   <Line 
//                     data={getFeatureTrendsData()} 
//                     options={{
//                       ...chartOptions,
//                       plugins: {
//                         ...chartOptions.plugins,
//                         legend: {
//                           ...chartOptions.plugins.legend,
//                           labels: {
//                             boxWidth: isMobile ? 8 : 12,
//                             font: {
//                               size: isMobile ? 10 : 12
//                             }
//                           }
//                         }
//                       }
//                     }} 
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Graphiques en barres */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
//               {/* Graphique en barres des technologies */}
//               <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
//                 <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
//                   Top 10 Technologies
//                 </h3>
//                 <div className="h-56 md:h-64">
//                   <Bar 
//                     data={getTechnologyBarData()} 
//                     options={{
//                       ...chartOptions,
//                       indexAxis: 'y' as const,
//                       plugins: {
//                         ...chartOptions.plugins,
//                         legend: {
//                           display: false
//                         }
//                       }
//                     }} 
//                   />
//                 </div>
//               </div>

//               {/* Graphique en barres des mots-clés */}
//               <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
//                 <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
//                   Top 10 Mots-clés
//                 </h3>
//                 <div className="h-56 md:h-64">
//                   <Bar 
//                     data={getKeywordBarData()} 
//                     options={{
//                       ...chartOptions,
//                       indexAxis: 'y' as const,
//                       plugins: {
//                         ...chartOptions.plugins,
//                         legend: {
//                           display: false
//                         }
//                       }
//                     }} 
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Graphiques en doughnut */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
//               {/* Graphique en doughnut des fonctionnalités */}
//               <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
//                 <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 text-center">
//                   Répartition Fonctionnalités
//                 </h3>
//                 <div className="h-64 md:h-72">
//                   <Doughnut 
//                     data={getFeatureDoughnutData()} 
//                     options={{
//                       ...chartOptions,
//                       plugins: {
//                         ...chartOptions.plugins,
//                         legend: {
//                           position: isMobile ? 'bottom' : 'right',
//                           labels: {
//                             boxWidth: isMobile ? 10 : 12,
//                             font: {
//                               size: isMobile ? 10 : 12
//                             }
//                           }
//                         }
//                       }
//                     }} 
//                   />
//                 </div>
//               </div>

//               {/* Graphique en doughnut des mots-clés */}
//               <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
//                 <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 text-center">
//                   Répartition Mots-clés
//                 </h3>
//                 <div className="h-64 md:h-72">
//                   <Doughnut 
//                     data={getKeywordDoughnutData()} 
//                     options={{
//                       ...chartOptions,
//                       plugins: {
//                         ...chartOptions.plugins,
//                         legend: {
//                           position: isMobile ? 'bottom' : 'right',
//                           labels: {
//                             boxWidth: isMobile ? 10 : 12,
//                             font: {
//                               size: isMobile ? 10 : 12
//                             }
//                           }
//                         }
//                       }
//                     }} 
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           // Section Liste classique pour les autres onglets avec pagination
//           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
//             {/* En-tête du contenu */}
//             <div className="border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-3 md:py-4">
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
//                 <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white capitalize">
//                   {activeTab === 'technologies' ? 'Technologies' : 
//                    activeTab === 'keywords' ? 'Mots-clés' : 'Fonctionnalités'}
//                 </h2>
//                 <div className="text-sm text-gray-500 dark:text-gray-400">
//                   Total: <span className="font-semibold text-gray-900 dark:text-white">{getTotalCount()}</span> utilisations
//                 </div>
//               </div>
//             </div>

//             {/* Liste des éléments */}
//             <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
//               {paginatedData.length === 0 ? (
//                 <div className="px-4 md:px-6 py-8 text-center">
//                   <p className="text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
//                 </div>
//               ) : (
//                 <AnimatePresence>
//                   {paginatedData.map((item, index) => (
//                     <motion.div
//                       key={item.name}
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: -20 }}
//                       transition={{ delay: index * 0.05 }}
//                       className="px-4 md:px-6 py-3 md:py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
//                     >
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
//                           {/* Indicateur de rang */}
//                           <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
//                             <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
//                               #{(currentPage - 1) * itemsPerPage + index + 1}
//                             </span>
//                           </div>

//                           {/* Nom de l'élément */}
//                           <div className="flex-1 min-w-0">
//                             <h3 className="text-sm font-medium text-gray-900 dark:text-white capitalize truncate">
//                               {item.name}
//                             </h3>
//                             <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
//                               Utilisé dans {item.count} TFC{item.count > 1 ? 's' : ''}
//                             </p>
//                           </div>
//                         </div>

//                         {/* Barre de progression - cachée sur mobile très petit */}
//                         <div className={`flex items-center space-x-2 md:space-x-3 ${isMobile ? 'ml-2' : ''}`}>
//                           {!isMobile && (
//                             <div className="w-24 md:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                               <div
//                                 className="h-2 rounded-full bg-blue-500 dark:bg-blue-400 transition-all duration-500"
//                                 style={{
//                                   width: `${getMaxCount() > 0 ? (item.count / getMaxCount()) * 100 : 0}%`
//                                 }}
//                               />
//                             </div>
//                           )}
//                           <span className="text-sm font-medium text-gray-900 dark:text-white w-8 md:w-12 text-right">
//                             {item.count}
//                           </span>
//                         </div>
//                       </div>
//                     </motion.div>
//                   ))}
//                 </AnimatePresence>
//               )}
//             </div>

//             {/* Pagination */}
//             <Pagination />

//             {/* Pied de page */}
//             <div className="border-t border-gray-200 dark:border-gray-700 px-4 md:px-6 py-3 md:py-4 bg-gray-50 dark:bg-gray-700/30">
//               <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 text-center">
//                 {getCurrentData().length} éléments au total • Page {currentPage} sur {totalPages}
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  type ChartOptions,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Types
interface Technology {
  name: string;
  count: number;
}

interface Keyword {
  name: string;
  count: number;
}

interface Feature {
  name: string;
  count: number;
}

interface YearlyTrend {
  year: string;
  technologies: Record<string, number>;
  keywords: Record<string, number>;
  features: Record<string, number>;
  totalTfcs: number;
}

type TabId = 'technologies' | 'keywords' | 'features' | 'trends';

// Constantes pour la pagination
const ITEMS_PER_PAGE = 10;
const MOBILE_ITEMS_PER_PAGE = 8;

// Couleur de légende (zinc-400)
const LEGEND_COLOR = '#a1a1aa';

// Palette de couleurs réutilisable
const LINE_COLORS = [
  'rgb(59, 130, 246)',
  'rgb(16, 185, 129)',
  'rgb(245, 158, 11)',
  'rgb(239, 68, 68)',
  'rgb(139, 92, 246)',
  'rgb(14, 165, 233)',
  'rgb(236, 72, 153)',
  'rgb(20, 184, 166)',
];

const DOUGHNUT_COLORS = [
  'rgba(16, 185, 129, 0.7)',
  'rgba(245, 158, 11, 0.7)',
  'rgba(239, 68, 68, 0.7)',
  'rgba(139, 92, 246, 0.7)',
  'rgba(14, 165, 233, 0.7)',
  'rgba(236, 72, 153, 0.7)',
  'rgba(20, 184, 166, 0.7)',
  'rgba(99, 102, 241, 0.7)',
];

const capitalize = (str: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

const truncate = (str: string, max: number) =>
  str.length > max ? str.substring(0, max - 2) + '...' : str;

/**
 * Helper générique pour produire des options Chart.js correctement typées
 * pour un type de graphique précis. Évite le conflit TypeScript lié à
 * `ChartOptions<'line' | 'bar' | 'doughnut'>` (union incompatible).
 */
function buildOptions<T extends 'line' | 'bar' | 'doughnut'>(
  isMobile: boolean,
  opts: {
    indexAxis?: 'x' | 'y';
    hideLegend?: boolean;
    legendPosition?: 'top' | 'left' | 'right' | 'bottom';
  } = {}
): ChartOptions<T> {
  const { indexAxis, hideLegend, legendPosition = 'top' } = opts;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: hideLegend
        ? { display: false }
        : {
            position: legendPosition,
            labels: {
              color: LEGEND_COLOR,
              boxWidth: isMobile ? 10 : 12,
              font: { size: isMobile ? 10 : 12 },
            },
          },
    },
  } as ChartOptions<T>;

  if (indexAxis && (indexAxis === 'x' || indexAxis === 'y')) {
    // indexAxis n'existe que pour bar (et line en théorie), mais le cast
    // contrôlé ci-dessous est sûr car on ne l'utilise que pour les barres.
    (options as ChartOptions<'bar'>).indexAxis = indexAxis;
  }

  return options;
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('technologies');
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [yearlyTrends, setYearlyTrends] = useState<YearlyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalTfcCount, setTotalTfcCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // Détection de la taille d'écran
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Réinitialiser la pagination quand on change d'onglet
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: tfcData, error: tfcError } = await supabase
        .from('tfc')
        .select(
          `
          technologies,
          mots_cles,
          fonctionnalites,
          annee_academique_id,
          annees_academiques (annee)
        `
        )
        .eq('statut', 'approuvé');

      if (tfcError) throw tfcError;

      const rows = tfcData ?? [];
      setTotalTfcCount(rows.length);

      const yearMap = new Map<string, YearlyTrend>();
      const techMap = new Map<string, number>();
      const keywordMap = new Map<string, number>();
      const featureMap = new Map<string, number>();

      rows.forEach((tfc) => {
        const yearRelation = tfc.annees_academiques as
          | { annee: string }
          | { annee: string }[]
          | null;

        const year = Array.isArray(yearRelation)
          ? yearRelation[0]?.annee ?? 'Non spécifiée'
          : yearRelation?.annee ?? 'Non spécifiée';

        if (!yearMap.has(year)) {
          yearMap.set(year, {
            year,
            technologies: {},
            keywords: {},
            features: {},
            totalTfcs: 0,
          });
        }

        const yearData = yearMap.get(year)!;
        yearData.totalTfcs += 1;

        if (Array.isArray(tfc.technologies)) {
          (tfc.technologies as string[]).forEach((tech) => {
            if (tech && tech.trim() !== '') {
              const key = tech.trim().toLowerCase();
              techMap.set(key, (techMap.get(key) || 0) + 1);
              yearData.technologies[key] =
                (yearData.technologies[key] || 0) + 1;
            }
          });
        }

        if (Array.isArray(tfc.mots_cles)) {
          (tfc.mots_cles as string[]).forEach((keyword) => {
            if (keyword && keyword.trim() !== '') {
              const key = keyword.trim().toLowerCase();
              keywordMap.set(key, (keywordMap.get(key) || 0) + 1);
              yearData.keywords[key] = (yearData.keywords[key] || 0) + 1;
            }
          });
        }

        if (Array.isArray(tfc.fonctionnalites)) {
          (tfc.fonctionnalites as string[]).forEach((feature) => {
            if (
              feature &&
              feature.trim() !== '' &&
              feature.toLowerCase() !== 'non spécifié'
            ) {
              const key = feature.trim().toLowerCase();
              featureMap.set(key, (featureMap.get(key) || 0) + 1);
              yearData.features[key] = (yearData.features[key] || 0) + 1;
            }
          });
        }
      });

      const toSortedArray = (map: Map<string, number>) =>
        Array.from(map.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

      setTechnologies(toSortedArray(techMap));
      setKeywords(toSortedArray(keywordMap));
      setFeatures(toSortedArray(featureMap));
      setYearlyTrends(
        Array.from(yearMap.values()).sort((a, b) =>
          a.year.localeCompare(b.year)
        )
      );
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const currentData = useMemo<(Technology | Keyword | Feature)[]>(() => {
    switch (activeTab) {
      case 'technologies':
        return technologies;
      case 'keywords':
        return keywords;
      case 'features':
        return features;
      default:
        return [];
    }
  }, [activeTab, technologies, keywords, features]);

  const itemsPerPage = isMobile ? MOBILE_ITEMS_PER_PAGE : ITEMS_PER_PAGE;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return currentData.slice(start, start + itemsPerPage);
  }, [currentData, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(currentData.length / itemsPerPage));

  const goToPage = (page: number) => {
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  };

  const getTotalCount = () =>
    currentData.reduce((sum, item) => sum + item.count, 0);

  const getMaxCount = () =>
    currentData.length > 0
      ? Math.max(...currentData.map((item) => item.count))
      : 0;

  /* ------------------------- Données graphiques ------------------------- */

  const getTechnologyTrendsData = () => {
    const topTechs = technologies.slice(0, 8).map((t) => t.name);
    const years = yearlyTrends.map((t) => t.year);

    return {
      labels: years,
      datasets: topTechs.map((tech, index) => ({
        label: capitalize(tech),
        data: years.map(
          (year) =>
            yearlyTrends.find((t) => t.year === year)?.technologies[tech] || 0
        ),
        borderColor: LINE_COLORS[index % LINE_COLORS.length],
        backgroundColor: LINE_COLORS[index % LINE_COLORS.length] + '20',
        tension: 0.3,
      })),
    };
  };

  const getKeywordTrendsData = () => {
    const topKeywords = keywords.slice(0, 6).map((k) => k.name);
    const years = yearlyTrends.map((t) => t.year);

    return {
      labels: years,
      datasets: topKeywords.map((keyword, index) => ({
        label: capitalize(keyword),
        data: years.map(
          (year) =>
            yearlyTrends.find((t) => t.year === year)?.keywords[keyword] || 0
        ),
        borderColor: LINE_COLORS[index % LINE_COLORS.length],
        backgroundColor: LINE_COLORS[index % LINE_COLORS.length] + '20',
        tension: 0.3,
      })),
    };
  };

  const getFeatureTrendsData = () => {
    const topFeatures = features.slice(0, 6).map((f) => f.name);
    const years = yearlyTrends.map((t) => t.year);

    return {
      labels: years,
      datasets: topFeatures.map((feature, index) => ({
        label: capitalize(feature),
        data: years.map(
          (year) =>
            yearlyTrends.find((t) => t.year === year)?.features[feature] || 0
        ),
        borderColor: LINE_COLORS[index % LINE_COLORS.length],
        backgroundColor: LINE_COLORS[index % LINE_COLORS.length] + '20',
        tension: 0.3,
      })),
    };
  };

  const getTechnologyBarData = () => {
    const topTechs = technologies.slice(0, 10);
    return {
      labels: topTechs.map((tech) => {
        const name = capitalize(tech.name);
        return isMobile ? truncate(name, 12) : name;
      }),
      datasets: [
        {
          label: "Nombre d'utilisations",
          data: topTechs.map((t) => t.count),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
      ],
    };
  };

  const getKeywordBarData = () => {
    const topKeywords = keywords.slice(0, 10);
    return {
      labels: topKeywords.map((keyword) => {
        const name = capitalize(keyword.name);
        return isMobile ? truncate(name, 12) : name;
      }),
      datasets: [
        {
          label: "Nombre d'utilisations",
          data: topKeywords.map((k) => k.count),
          backgroundColor: 'rgba(139, 92, 246, 0.7)',
          borderColor: 'rgb(139, 92, 246)',
          borderWidth: 1,
        },
      ],
    };
  };

  const getFeatureDoughnutData = () => {
    const topFeatures = features.slice(0, 8);
    const backgroundColors = DOUGHNUT_COLORS.slice(0, topFeatures.length);
    return {
      labels: topFeatures.map((f) => {
        const name = capitalize(f.name);
        return isMobile ? truncate(name, 15) : name;
      }),
      datasets: [
        {
          data: topFeatures.map((f) => f.count),
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map((c) => c.replace('0.7', '1')),
          borderWidth: 1,
        },
      ],
    };
  };

  const getKeywordDoughnutData = () => {
    const topKeywords = keywords.slice(0, 8);
    const backgroundColors = DOUGHNUT_COLORS.slice(0, topKeywords.length);
    return {
      labels: topKeywords.map((k) => {
        const name = capitalize(k.name);
        return isMobile ? truncate(name, 15) : name;
      }),
      datasets: [
        {
          data: topKeywords.map((k) => k.count),
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map((c) => c.replace('0.7', '1')),
          borderWidth: 1,
        },
      ],
    };
  };

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: 'technologies', label: 'Techs', count: technologies.length },
    { id: 'keywords', label: 'Kw', count: keywords.length },
    { id: 'features', label: 'Fonctions', count: features.length },
    { id: 'trends', label: 'Trends', count: yearlyTrends.length },
  ];

  /* ----------------------------- Pagination ----------------------------- */

  const Pagination = () => {
    if (totalPages <= 1) return null;

    const visiblePages = () => {
      if (isMobile) return [currentPage];

      const delta = 2;
      const range: number[] = [];
      const rangeWithDots: (number | string)[] = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots.filter(
        (value, i, arr) => i === 0 || value !== arr[i - 1]
      );
    };

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/30">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Page {currentPage} sur {totalPages}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            aria-label="Page précédente"
            className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex items-center space-x-1">
            {visiblePages().map((page, index) => (
              <button
                key={`${page}-${index}`}
                onClick={() => typeof page === 'number' && goToPage(page)}
                className={`min-w-[2.5rem] h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                  page === currentPage
                    ? 'bg-blue-500 text-white shadow-sm'
                    : page === '...'
                    ? 'text-zinc-400 cursor-default'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-600'
                }`}
                disabled={page === '...'}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            aria-label="Page suivante"
            className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  /* --------------------------------- Rendu -------------------------------- */

  if (loading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-4 md:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={fetchAnalyticsData}
                className="mt-3 bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Analytics TFC
          </h1>
          <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto px-2">
            Analyse détaillée des technologies, fonctionnalités et tendances
          </p>
        </div>

        {/* Statistique */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <span className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
              Basé sur{' '}
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                {totalTfcCount}
              </span>{' '}
              TFC
            </span>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-1 md:p-2 mb-6 md:mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium transition-all duration-200 rounded-lg ${
                    activeTab === tab.id
                      ? 'text-zinc-900 dark:text-zinc-50'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1 md:space-x-2">
                    <span className="truncate">{tab.label}</span>
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 text-xs rounded-full ${
                        activeTab === tab.id
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </div>

                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400"
                      layoutId="activeTab"
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'trends' ? (
          <div className="space-y-4 md:space-y-6">
            {/* Tendances technologies */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-base md:text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Tendances Technologies
                </h2>
                <div className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
                  Top 8
                </div>
              </div>
              <div className="h-64 md:h-80">
                <Line
                  data={getTechnologyTrendsData()}
                  options={buildOptions<'line'>(isMobile, {
                    legendPosition: 'top',
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3 md:mb-4">
                  Tendances Mots-clés
                </h3>
                <div className="h-56 md:h-64">
                  <Line
                    data={getKeywordTrendsData()}
                    options={buildOptions<'line'>(isMobile, {
                      legendPosition: 'top',
                    })}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3 md:mb-4">
                  Tendances Fonctionnalités
                </h3>
                <div className="h-56 md:h-64">
                  <Line
                    data={getFeatureTrendsData()}
                    options={buildOptions<'line'>(isMobile, {
                      legendPosition: 'top',
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3 md:mb-4">
                  Top 10 Technologies
                </h3>
                <div className="h-56 md:h-64">
                  <Bar
                    data={getTechnologyBarData()}
                    options={buildOptions<'bar'>(isMobile, {
                      indexAxis: 'y',
                      hideLegend: true,
                    })}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3 md:mb-4">
                  Top 10 Mots-clés
                </h3>
                <div className="h-56 md:h-64">
                  <Bar
                    data={getKeywordBarData()}
                    options={buildOptions<'bar'>(isMobile, {
                      indexAxis: 'y',
                      hideLegend: true,
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3 md:mb-4 text-center">
                  Répartition Fonctionnalités
                </h3>
                <div className="h-64 md:h-72">
                  <Doughnut
                    data={getFeatureDoughnutData()}
                    options={buildOptions<'doughnut'>(isMobile, {
                      legendPosition: isMobile ? 'bottom' : 'right',
                    })}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3 md:mb-4 text-center">
                  Répartition Mots-clés
                </h3>
                <div className="h-64 md:h-72">
                  <Doughnut
                    data={getKeywordDoughnutData()}
                    options={buildOptions<'doughnut'>(isMobile, {
                      legendPosition: isMobile ? 'bottom' : 'right',
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Liste paginée
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 md:px-6 py-3 md:py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h2 className="text-base md:text-lg font-semibold text-zinc-900 dark:text-zinc-50 capitalize">
                  {activeTab === 'technologies'
                    ? 'Technologies'
                    : activeTab === 'keywords'
                    ? 'Mots-clés'
                    : 'Fonctionnalités'}
                </h2>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  Total:{' '}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {getTotalCount()}
                  </span>{' '}
                  utilisations
                </div>
              </div>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-96 overflow-y-auto">
              {paginatedData.length === 0 ? (
                <div className="px-4 md:px-6 py-8 text-center">
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Aucune donnée disponible
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {paginatedData.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-4 md:px-6 py-3 md:py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors duration-150"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                          <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                            <span className="text-xs md:text-sm font-medium text-zinc-600 dark:text-zinc-400">
                              #{(currentPage - 1) * itemsPerPage + index + 1}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 capitalize truncate">
                              {item.name}
                            </h3>
                            <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                              Utilisé dans {item.count} TFC
                              {item.count > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`flex items-center space-x-2 md:space-x-3 ${
                            isMobile ? 'ml-2' : ''
                          }`}
                        >
                          {!isMobile && (
                            <div className="w-24 md:w-32 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-blue-500 dark:bg-blue-400 transition-all duration-500"
                                style={{
                                  width: `${
                                    getMaxCount() > 0
                                      ? (item.count / getMaxCount()) * 100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          )}
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 w-8 md:w-12 text-right">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            <Pagination />

            <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 md:px-6 py-3 md:py-4 bg-zinc-50 dark:bg-zinc-800/30">
              <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 text-center">
                {currentData.length} éléments au total • Page {currentPage} sur{' '}
                {totalPages}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
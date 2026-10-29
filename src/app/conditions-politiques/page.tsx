'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFileText, 
  FiShield, 
  FiUsers, 
  FiBook,
  FiMessageSquare,
  FiFeather,
  FiArrowLeft
} from 'react-icons/fi';

interface TabContent {
  title: string;
  content: {
    title: string;
    content: string;
  }[];
}

interface TabContentMap {
  [key: string]: TabContent;
}

const ConditionsPolitiquePage = () => {
  const [activeTab, setActiveTab] = useState('conditions');

  const tabs = [
    { id: 'conditions', label: 'Conditions', icon: FiFileText },
    { id: 'confidentialite', label: 'Confidentialité', icon: FiShield },
    { id: 'comptes', label: 'Comptes', icon: FiUsers },
    { id: 'contenu', label: 'Contenu', icon: FiBook },
    { id: 'chat', label: 'Chat', icon: FiMessageSquare },
    { id: 'propriete', label: 'Propriété', icon: FiFeather }
  ];

  const tabContent: TabContentMap = {
    conditions: {
      title: "Conditions d'Utilisation",
      content: [
        {
          title: "Accès Restreint à la Communauté Universitaire",
          content: "Cette plateforme est exclusivement réservée aux membres de l'université. L'accès est strictement limité aux étudiants, enseignants, administrateurs et alumni."
        },
        {
          title: "Engagements des Utilisateurs",
          content: "En utilisant cette plateforme, vous vous engagez à respecter les droits de propriété intellectuelle, maintenir la confidentialité de vos identifiants et signaler tout comportement suspect."
        }
      ]
    },
    confidentialite: {
      title: "Politique de Confidentialité",
      content: [
        {
          title: "Collecte et Utilisation des Données",
          content: "Nous collectons uniquement les informations nécessaires : nom, prénom, matricule, email institutionnel et rôle au sein de l'université."
        },
        {
          title: "Protection des Données",
          content: "Vos données sont protégées par des mesures de sécurité avancées incluant le chiffrement AES-256 et des audits de sécurité réguliers."
        }
      ]
    },
    comptes: {
      title: "Gestion des Comptes",
      content: [
        {
          title: "Types de Comptes",
          content: "Étudiants : consultation des TFC et recherche avancée. Enseignants : supervision des TFC et évaluation. Administrateurs : gestion complète."
        },
        {
          title: "Désactivation des Comptes",
          content: "En cas de non-respect des politiques, suspension immédiate avec possibilité de recours dans les 7 jours."
        }
      ]
    },
    contenu: {
      title: "Utilisation du Contenu",
      content: [
        {
          title: "Propriété Intellectuelle des TFC",
          content: "Les TFC sont la propriété intellectuelle exclusive de leurs auteurs. Interdiction de distribution sans autorisation écrite."
        }
      ]
    },
    chat: {
      title: "Service de Chat",
      content: [
        {
          title: "Nature du Service",
          content: "Le service de chat est fourni à titre indicatif et ne constitue pas un service officiel de conseil académique."
        }
      ]
    },
    propriete: {
      title: "Propriété Intellectuelle",
      content: [
        {
          title: "Droits des Auteurs",
          content: "Les auteurs conservent leurs droits moraux et peuvent retirer leur TFC à tout moment. La plateforme protège contre le plagiat."
        },
        {
          title: "Utilisation des Métadonnées",
          content: "Les métadonnées sont utilisées pour améliorer les algorithmes de recherche tout en respectant la confidentialité du contenu intégral."
        }
      ]
    }
  };

  const currentContent = tabContent[activeTab];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Conditions et Confidentialité
          </h1>
          <p className="text-base text-zinc-500 dark:text-zinc-400">
            Plateforme de Recherche de TFC · Université
          </p>
        </div>

        {/* Conteneur principal */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-200">
          
          {/* Navigation par onglets */}
          <div className="relative border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:bg-zinc-50 dark:focus-visible:bg-zinc-800/50 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contenu des onglets */}
          <div className="p-6 md:p-8 min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-3">
                  {React.createElement(tabs.find(tab => tab.id === activeTab)?.icon || FiFileText, { className: "w-5 h-5 text-zinc-400 dark:text-zinc-500" })}
                  {currentContent.title}
                </h2>

                <div className="space-y-6">
                  {currentContent.content.map((section, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 p-5"
                    >
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                        {section.title}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {section.content}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer - Retour au login */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 md:p-8 text-center transition-colors duration-200">
          <div className="max-w-xl mx-auto space-y-5">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Prêt à continuer ?
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Vous avez lu et compris nos conditions d'utilisation et notre politique de confidentialité.
            </p>
            <div className="pt-2">
              <Link href="/auth/login">
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900">
                  <FiArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </button>
              </Link>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 pt-2">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>

      {/* Styles pour cacher la scrollbar sur mobile */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ConditionsPolitiquePage;

// export default SupportPage;// app/support/page.tsx
'use client';

import { 
  EnvelopeIcon, 
  PhoneIcon, 
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { FaLinkedin, FaWhatsapp } from 'react-icons/fa';

const SupportPage = () => {
  const contacts = [
    {
      icon: <FaWhatsapp className="w-6 h-6" />,
      text: "WhatsApp",
      link: "https://wa.me/+243990664406",
      description: "Message direct - Réponse rapide",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50/50 dark:bg-emerald-950/20",
      borderColor: "border-emerald-200/60 dark:border-emerald-900/50"
    },
    {
      icon: <EnvelopeIcon className="w-5 h-5" />,
      text: "Email",
      link: "mailto:nzanamugisho@gmail.com",
      description: "nzanamugisho@gmail.com",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50/50 dark:bg-blue-950/20",
      borderColor: "border-blue-200/60 dark:border-blue-900/50"
    },
    {
      icon: <FaLinkedin className="w-5 h-5" />,
      text: "LinkedIn",
      link: "https://www.linkedin.com/in/peter-nz/",
      description: "Peter Nzana",
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50/50 dark:bg-indigo-950/20",
      borderColor: "border-indigo-200/60 dark:border-indigo-900/50"
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4 py-8 transition-colors duration-200">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full space-y-8"
      >
        {/* Logo - Force le blanc pur en mode sombre */}
        <motion.div 
          className="flex justify-center mb-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <img 
            src='/logo.png' 
            className='w-[180px] dark:brightness-0 dark:invert transition-all duration-300' 
            alt="UDBL Logo"
          />
        </motion.div>

        {/* Header */}
        <div className="text-center space-y-2">
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-zinc-900 dark:text-white"
          >
            Peter Nzana
          </motion.h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            Pour toute Question ou Assistance
          </p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 dark:text-zinc-500 text-sm"
          >
            Concernant cette plateforme, n'hésitez pas à me contacter via l'un des moyens ci-dessous.
          </motion.p>
        </div>

        {/* Contact Cards */}
        <div className="space-y-3">
          {contacts.map((contact, index) => (
            <motion.a
              key={index}
              href={contact.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              whileHover={{ 
                scale: 1.02,
                y: -2
              }}
              whileTap={{ scale: 0.98 }}
              className={`block p-4 rounded-xl border ${contact.bgColor} ${contact.borderColor} transition-all duration-200 group`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className={`${contact.color} group-hover:scale-110 transition-transform`}>
                    {contact.icon}
                  </div>
                  <div>
                    <div className={`font-semibold ${contact.color} group-hover:underline`}>
                      {contact.text}
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      {contact.description}
                    </div>
                  </div>
                </div>
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  whileHover={{ x: 0, opacity: 1 }}
                  className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                >
                  →
                </motion.div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Quick Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center pt-6"
        >
          <div className="inline-flex items-center space-x-2 text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>Disponible maintenant</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SupportPage;
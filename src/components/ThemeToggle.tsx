import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-[100] w-12 h-12 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex items-center justify-center text-black dark:text-white transition-all duration-300 group overflow-hidden"
      aria-label="Toggle Theme"
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        <motion.div
          initial={false}
          animate={{
            y: theme === 'dark' ? 0 : 30,
            opacity: theme === 'dark' ? 1 : 0
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="absolute"
        >
          <Sun className="w-5 h-5 text-primary fill-primary/20" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{
            y: theme === 'light' ? 0 : -30,
            opacity: theme === 'light' ? 1 : 0
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="absolute"
        >
          <Moon className="w-5 h-5 text-neutral-800 fill-neutral-800/20" />
        </motion.div>
      </div>
    </motion.button>
  );
}

import React from 'react';
import { motion } from 'framer-motion';

interface ThemeChangerProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
  isRecording: boolean;
  onToggleRecording: () => void;
}

export const ThemeChanger: React.FC<ThemeChangerProps> = ({
  isDarkMode,
  onThemeToggle,
  isRecording,
  onToggleRecording
}) => {
  return (
    <div className="flex items-center space-x-4">
      {/* Record toggle */}
      <motion.button
        className={`
          text-xs font-mono transition-colors duration-300
          ${isRecording 
            ? (isDarkMode ? 'text-white' : 'text-black') 
            : (isDarkMode ? 'text-white/40 hover:text-white/60' : 'text-black/40 hover:text-black/60')
          }
        `}
        onClick={onToggleRecording}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isRecording ? '[recording]' : '[record]'}
      </motion.button>

      {/* Theme toggle */}
      <motion.button
        className={`
          text-xs font-mono transition-colors duration-300
          ${isDarkMode 
            ? 'text-white/40 hover:text-white/60' 
            : 'text-black/40 hover:text-black/60'
          }
        `}
        onClick={onThemeToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        [{isDarkMode ? 'black' : 'white'}]
      </motion.button>
    </div>
  );
};
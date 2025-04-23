import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const themes = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'cupcake', label: 'Cupcake', icon: '🧁' },
  { value: 'cyberpunk', label: 'Cyberpunk', icon: '🤖' },
  { value: 'synthwave', label: 'Synthwave', icon: '🎸' },
  { value: 'retro', label: 'Retro', icon: '📼' },
  { value: 'valentine', label: 'Valentine', icon: '❤️' },
  { value: 'halloween', label: 'Halloween', icon: '🎃' },
  { value: 'garden', label: 'Garden', icon: '🌺' },
  { value: 'forest', label: 'Forest', icon: '🌲' },
  { value: 'aqua', label: 'Aqua', icon: '🌊' },
  { value: 'lofi', label: 'Lofi', icon: '🎵' },
  { value: 'pastel', label: 'Pastel', icon: '🎨' },
  { value: 'fantasy', label: 'Fantasy', icon: '🐉' },
  { value: 'wireframe', label: 'Wireframe', icon: '📐' },
  { value: 'black', label: 'Black', icon: '⚫' },
  { value: 'luxury', label: 'Luxury', icon: '💎' },
  { value: 'dracula', label: 'Dracula', icon: '🧛' },
  { value: 'cmyk', label: 'CMYK', icon: '🖨️' },
  { value: 'autumn', label: 'Autumn', icon: '🍂' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'acid', label: 'Acid', icon: '🧪' },
  { value: 'lemonade', label: 'Lemonade', icon: '🍋' },
  { value: 'night', label: 'Night', icon: '🌃' },
  { value: 'coffee', label: 'Coffee', icon: '☕' },
  { value: 'winter', label: 'Winter', icon: '❄️' },
];

const Header: React.FC<HeaderProps> = ({ currentTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentThemeData = themes.find(t => t.value === currentTheme) || { icon: '🎨', label: 'Theme' };
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const handleThemeChange = (theme: string) => {
    onThemeChange(theme);
    setIsOpen(false);
  };
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.theme-dropdown')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-base-200 shadow-md transition-colors duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <motion.h1 
            className="text-2xl font-bold text-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ShareMyText
          </motion.h1>
          <div className="flex items-center">
            <div className="theme-dropdown relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDropdown}
                className="btn btn-ghost btn-sm flex items-center space-x-2"
                aria-label="Select theme"
              >
                <span className="text-xl">{currentThemeData.icon}</span>
                <span className="hidden md:inline">{currentThemeData.label}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>
              
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-base-200 ring-1 ring-black ring-opacity-5 z-50 max-h-80 overflow-y-auto"
                  >
                    <div className="py-1">
                      {themes.map((theme) => (
                        <motion.button
                          key={theme.value}
                          whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleThemeChange(theme.value)}
                          className={`flex items-center w-full px-4 py-2 text-sm ${
                            currentTheme === theme.value ? 'bg-primary/10 font-medium' : ''
                          }`}
                        >
                          <span className="mr-3">{theme.icon}</span>
                          <span>{theme.label}</span>
                          {currentTheme === theme.value && (
                            <span className="ml-auto">✓</span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InteractionMode } from '../../types';

interface NodeControlsProps {
  mode: InteractionMode;
  onModeChange: (mode: InteractionMode) => void;
  onAddNode: () => void;
  onZoomFit: () => void;
  isDarkMode: boolean;
}

export const NodeControls: React.FC<NodeControlsProps> = ({
  mode,
  onModeChange,
  onAddNode,
  onZoomFit,
  isDarkMode
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAddNode = () => {
    onAddNode();
    setIsExpanded(false);
  };

  const handleZoomFit = () => {
    onZoomFit();
    setIsExpanded(false);
  };

  const handleModeToggle = () => {
    const nextMode = mode === 'play' ? 'edit' : mode === 'edit' ? 'connect' : 'play';
    onModeChange(nextMode);
    setIsExpanded(false);
  };

  return (
    <>
      {/* Minimal controls (bottom center) */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
        <motion.div className="flex items-center space-x-6">
          {/* Add node */}
          <motion.button
            className={`text-sm font-mono transition-colors ${
              isDarkMode 
                ? 'text-white/40 hover:text-white/80' 
                : 'text-black/40 hover:text-black/80'
            }`}
            onClick={handleAddNode}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            [+]
          </motion.button>

          {/* Mode indicator/toggle */}
          <motion.button
            className={`text-xs font-mono transition-colors ${
              isDarkMode 
                ? 'text-white/60 hover:text-white/80' 
                : 'text-black/60 hover:text-black/80'
            }`}
            onClick={handleModeToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            [{mode}]
          </motion.button>

          {/* Zoom fit */}
          <motion.button
            className={`text-sm font-mono transition-colors ${
              isDarkMode 
                ? 'text-white/40 hover:text-white/80' 
                : 'text-black/40 hover:text-black/80'
            }`}
            onClick={handleZoomFit}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            [◯]
          </motion.button>
        </motion.div>
      </div>


    </>
  );
};
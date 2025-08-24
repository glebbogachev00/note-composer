import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InteractionMode } from '../../types';

interface NodeControlsProps {
  mode: InteractionMode;
  onModeChange: (mode: InteractionMode) => void;
  onAddNode: () => void;
  onZoomFit: () => void;
  onDeleteSelected?: () => void;
  onClearSelection?: () => void;
  selectedForDeletionCount?: number;
  isDarkMode: boolean;
}

export const NodeControls: React.FC<NodeControlsProps> = ({
  mode,
  onModeChange,
  onAddNode,
  onZoomFit,
  onDeleteSelected,
  onClearSelection,
  selectedForDeletionCount = 0,
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
    const modes: InteractionMode[] = ['play', 'edit', 'connect', 'delete'];
    const currentIndex = modes.indexOf(mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    onModeChange(nextMode);
    setIsExpanded(false);
  };

  const handleDeleteConfirm = () => {
    if (onDeleteSelected && selectedForDeletionCount > 0) {
      onDeleteSelected();
    }
  };

  const handleClearSelection = () => {
    if (onClearSelection) {
      onClearSelection();
    }
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

      {/* Delete mode controls */}
      <AnimatePresence>
        {mode === 'delete' && (
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`
              backdrop-blur-sm rounded-lg p-6 border
              ${isDarkMode 
                ? 'bg-pure-black/95 border-white/10 text-white' 
                : 'bg-white/95 border-black/10 text-black'
              }
            `}>
              <div className="text-center space-y-4">
                <h3 className={`text-lg font-mono tracking-wide ${
                  isDarkMode ? 'text-white/80' : 'text-black/80'
                }`}>
                  [delete mode]
                </h3>
                
                <p className={`text-sm font-light ${
                  isDarkMode ? 'text-white/60' : 'text-black/60'
                }`}>
                  {selectedForDeletionCount === 0 
                    ? 'Select nodes to delete' 
                    : `${selectedForDeletionCount} node${selectedForDeletionCount > 1 ? 's' : ''} selected`
                  }
                </p>

                <div className="flex space-x-3">
                  {selectedForDeletionCount > 0 && (
                    <>
                      <motion.button
                        className={`
                          px-4 py-2 text-sm font-mono border rounded
                          ${isDarkMode 
                            ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30' 
                            : 'bg-red-100 border-red-300 text-red-600 hover:bg-red-200'
                          }
                          transition-all duration-200
                        `}
                        onClick={handleDeleteConfirm}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Delete {selectedForDeletionCount}
                      </motion.button>
                      
                      <motion.button
                        className={`
                          px-4 py-2 text-sm font-mono border rounded
                          ${isDarkMode 
                            ? 'border-white/20 text-white/60 hover:border-white/40 hover:text-white/80' 
                            : 'border-black/20 text-black/60 hover:border-black/40 hover:text-black/80'
                          }
                          transition-all duration-200
                        `}
                        onClick={handleClearSelection}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Clear
                      </motion.button>
                    </>
                  )}
                  
                  <motion.button
                    className={`
                      px-4 py-2 text-sm font-mono border rounded
                      ${isDarkMode 
                        ? 'border-white/20 text-white/60 hover:border-white/40 hover:text-white/80' 
                        : 'border-black/20 text-black/60 hover:border-black/40 hover:text-black/80'
                      }
                      transition-all duration-200
                    `}
                    onClick={() => onModeChange('play')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Exit
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
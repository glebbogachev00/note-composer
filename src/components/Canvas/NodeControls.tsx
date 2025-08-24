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
  const [_isExpanded, _setIsExpanded] = useState(false);

  const handleAddNode = () => {
    onAddNode();
  };

  const handleZoomFit = () => {
    onZoomFit();
  };

  const handleModeToggle = () => {
    const modes: InteractionMode[] = ['play', 'edit', 'connect', 'delete'];
    const currentIndex = modes.indexOf(mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    onModeChange(nextMode);
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`
              text-center space-y-3 font-mono text-sm
              ${isDarkMode ? 'text-white/80' : 'text-black/80'}
            `}>
              <div className={`${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
                [delete mode]
              </div>
              
              <div className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                {selectedForDeletionCount === 0 
                  ? 'select nodes' 
                  : `${selectedForDeletionCount} selected`
                }
              </div>

              <div className="flex space-x-4 justify-center">
                {selectedForDeletionCount > 0 && (
                  <>
                    <motion.button
                      className={`
                        text-xs transition-colors
                        ${isDarkMode 
                          ? 'text-white/60 hover:text-white/80' 
                          : 'text-black/60 hover:text-black/80'
                        }
                      `}
                      onClick={handleDeleteConfirm}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      [delete {selectedForDeletionCount}]
                    </motion.button>
                    
                    <motion.button
                      className={`
                        text-xs transition-colors
                        ${isDarkMode 
                          ? 'text-white/40 hover:text-white/60' 
                          : 'text-black/40 hover:text-black/60'
                        }
                      `}
                      onClick={handleClearSelection}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      [clear]
                    </motion.button>
                  </>
                )}
                
                <motion.button
                  className={`
                    text-xs transition-colors
                    ${isDarkMode 
                      ? 'text-white/40 hover:text-white/60' 
                      : 'text-black/40 hover:text-black/60'
                    }
                  `}
                  onClick={() => onModeChange('play')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  [exit]
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
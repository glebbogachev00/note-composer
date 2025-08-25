import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AudioNode } from '../types';

interface SimplifiedControlsProps {
  nodes: AudioNode[];
  onPlayAll: () => void;
  onResetAll: () => void;
  onAddNode: () => void;
  onZoomFit: () => void;
  isDarkMode: boolean;
}

export const SimplifiedControls: React.FC<SimplifiedControlsProps> = ({
  nodes,
  onPlayAll,
  onResetAll,
  onAddNode,
  onZoomFit,
  isDarkMode
}) => {
  const [allPlaying, setAllPlaying] = useState(false);

  // Check if any nodes are playing
  useEffect(() => {
    const checkPlayingState = () => {
      setAllPlaying(nodes.some(node => node.isPlaying));
    };
    
    const interval = setInterval(checkPlayingState, 200);
    return () => clearInterval(interval);
  }, [nodes]);

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
      <motion.div className="flex items-center space-x-6">
        {/* Add node */}
        <motion.button
          className={`text-sm font-mono transition-colors ${
            isDarkMode 
              ? 'text-white/40 hover:text-white/80' 
              : 'text-black/40 hover:text-black/80'
          }`}
          onClick={onAddNode}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          [+]
        </motion.button>

        {/* Play All / Pause All */}
        {nodes.length > 0 && (
          <motion.button
            className={`text-sm font-mono transition-colors ${
              allPlaying
                ? (isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-400')
                : (isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-green-500 hover:text-green-400')
            }`}
            onClick={onPlayAll}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            [{allPlaying ? 'pause all' : 'play all'}]
          </motion.button>
        )}

        {/* Reset All */}
        {nodes.length > 0 && (
          <motion.button
            className={`text-sm font-mono transition-colors ${
              isDarkMode 
                ? 'text-yellow-400 hover:text-yellow-300' 
                : 'text-yellow-500 hover:text-yellow-400'
            }`}
            onClick={onResetAll}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            [reset all]
          </motion.button>
        )}

        {/* Zoom fit */}
        <motion.button
          className={`text-sm font-mono transition-colors ${
            isDarkMode 
              ? 'text-white/40 hover:text-white/80' 
              : 'text-black/40 hover:text-black/80'
          }`}
          onClick={onZoomFit}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          [◯]
        </motion.button>
      </motion.div>
    </div>
  );
};
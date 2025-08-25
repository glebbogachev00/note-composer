import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AudioNode } from '../types';
import { IndividualPlaybackManager } from '../audio/IndividualPlaybackManager';

interface PlayAllButtonProps {
  nodes: AudioNode[];
  playbackManager: IndividualPlaybackManager;
  isDarkMode: boolean;
}

export const PlayAllButton: React.FC<PlayAllButtonProps> = ({ 
  nodes, 
  playbackManager, 
  isDarkMode 
}) => {
  const [allPlaying, setAllPlaying] = useState(false);
  
  // Check if all nodes are playing
  useEffect(() => {
    const checkAllPlaying = () => {
      if (nodes.length === 0) {
        setAllPlaying(false);
        return;
      }
      
      const playingCount = nodes.filter(node => {
        const state = playbackManager.getNodeState(node.id);
        return state?.isPlaying;
      }).length;
      
      setAllPlaying(playingCount === nodes.length);
    };
    
    const interval = setInterval(checkAllPlaying, 200);
    return () => clearInterval(interval);
  }, [nodes, playbackManager]);

  const handlePlayAll = () => {
    const nodeIds = nodes.map(n => n.id);
    const audioBuffers = new Map();
    nodes.forEach(node => {
      if (node.audioBuffer) {
        audioBuffers.set(node.id, node.audioBuffer);
      }
    });
    
    if (allPlaying) {
      // Pause all nodes
      playbackManager.pauseAllNodes(nodeIds);
    } else {
      // Play all nodes
      playbackManager.playAllNodes(nodeIds, audioBuffers);
    }
  };
  
  // Don't show if no nodes
  if (nodes.length === 0) {
    return null;
  }
  
  return (
    <motion.button 
      className={`
        fixed bottom-8 right-8 z-40 w-16 h-16 rounded-full border-none
        flex items-center justify-center text-2xl transition-all duration-200
        ${allPlaying 
          ? (isDarkMode ? 'bg-red-500 hover:bg-red-600' : 'bg-red-400 hover:bg-red-500')
          : (isDarkMode ? 'bg-green-500 hover:bg-green-600' : 'bg-green-400 hover:bg-green-500')
        }
        text-white shadow-lg hover:shadow-xl
      `}
      onClick={handlePlayAll}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      {allPlaying ? '⏸️' : '▶️'}
    </motion.button>
  );
};
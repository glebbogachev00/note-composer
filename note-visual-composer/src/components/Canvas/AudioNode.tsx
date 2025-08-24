import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioNode as AudioNodeType } from '../../types';

interface AudioNodeProps {
  node: AudioNodeType;
  onPlay: (nodeId: string, loop: boolean) => void;
  onStop: (nodeId: string) => void;
  onMove: (nodeId: string, x: number, y: number) => void;
  onDelete: (nodeId: string) => void;
  onConnectionStart: (nodeId: string) => void;
  isConnecting: boolean;
  scale: number;
  isDarkMode: boolean;
}

export const AudioNodeComponent: React.FC<AudioNodeProps> = ({
  node,
  onPlay,
  onStop,
  onMove,
  onDelete,
  onConnectionStart,
  isConnecting,
  scale,
  isDarkMode
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showLabel, setShowLabel] = useState(false);

  const handleTouchStart = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    event.stopPropagation();
    setIsPressed(true);
    setShowLabel(true);
  }, []);

  const handleTouchEnd = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    event.stopPropagation();
    
    if (!isDragging) {
      if (isConnecting) {
        onConnectionStart(node.id);
      } else if (node.isPlaying) {
        onStop(node.id);
      } else {
        onPlay(node.id, false);
      }
    }
    
    setIsPressed(false);
    setIsDragging(false);
    
    setTimeout(() => setShowLabel(false), 2000);
  }, [isDragging, isConnecting, node.isPlaying, node.id, onConnectionStart, onStop, onPlay]);


  const handleDrag = useCallback((_: any, info: any) => {
    setIsDragging(true);
    const newX = node.x + info.delta.x / scale;
    const newY = node.y + info.delta.y / scale;
    onMove(node.id, newX, newY);
  }, [node.x, node.y, node.id, onMove, scale]);

  const nodeSize = 100;
  const glowSize = node.isPlaying ? nodeSize * 1.4 : nodeSize * 1.1;

  return (
    <motion.div
      className="absolute"
      style={{
        left: node.x - nodeSize / 2,
        top: node.y - nodeSize / 2,
        width: nodeSize,
        height: nodeSize
      }}
      drag
      onDrag={handleDrag}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: isPressed ? 0.95 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      {/* Bright glow for playing state */}
      {node.isPlaying && (
        <motion.div
          className="absolute inset-0 rounded-full blur-lg"
          style={{
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
            width: glowSize,
            height: glowSize,
            left: (nodeSize - glowSize) / 2,
            top: (nodeSize - glowSize) / 2
          }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Main node - molecular style */}
      <motion.div
        className="relative w-full h-full rounded-full border-2 cursor-pointer"
        style={{
          backgroundColor: isDarkMode 
            ? (node.isPlaying ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)')
            : (node.isPlaying ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)'),
          borderColor: isDarkMode
            ? (node.isPlaying ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)')
            : (node.isPlaying ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.2)')
        }}
        animate={{
          scale: node.isPlaying ? [1, 1.03, 1] : 1
        }}
        transition={{ 
          duration: node.isPlaying ? 1.5 : 0.2,
          repeat: node.isPlaying ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {/* Bright center dot - molecular atom */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className={`rounded-full ${isDarkMode ? 'bg-white' : 'bg-black'}`}
            style={{
              width: node.isPlaying ? 10 : 8,
              height: node.isPlaying ? 10 : 8
            }}
            animate={{
              opacity: 1,
              scale: node.isPlaying ? [1, 1.2, 1] : 1,
              boxShadow: node.isPlaying 
                ? (isDarkMode 
                    ? ['0 0 6px rgba(255, 255, 255, 0.9)', '0 0 16px rgba(255, 255, 255, 1)', '0 0 6px rgba(255, 255, 255, 0.9)']
                    : ['0 0 6px rgba(0, 0, 0, 0.8)', '0 0 16px rgba(0, 0, 0, 1)', '0 0 6px rgba(0, 0, 0, 0.8)'])
                : (isDarkMode ? '0 0 3px rgba(255, 255, 255, 0.7)' : '0 0 3px rgba(0, 0, 0, 0.6)')
            }}
            transition={{
              duration: node.isPlaying ? 2 : 0.3,
              repeat: node.isPlaying ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>

      {/* File name label */}
      <AnimatePresence>
        {showLabel && (
          <motion.div
            className={`
              absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-mono whitespace-nowrap pointer-events-none
              ${isDarkMode ? 'text-white/60' : 'text-black/60'}
            `}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            [{node.fileName.replace(/\.[^/.]+$/, '')}]
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
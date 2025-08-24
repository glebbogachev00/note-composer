import React from 'react';
import { motion } from 'framer-motion';
import { AudioNode } from '../../types';

interface ConnectionLineProps {
  fromNode: AudioNode;
  toNode: AudioNode;
  isActive: boolean;
  isDarkMode: boolean;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  fromNode,
  toNode,
  isActive,
  isDarkMode
}) => {
  const dx = toNode.x - fromNode.x;
  const dy = toNode.y - fromNode.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Calculate control points for organic curve
  const midX = (fromNode.x + toNode.x) / 2;
  const midY = (fromNode.y + toNode.y) / 2;
  
  // Add some organic curvature
  const perpX = -dy / distance;
  const perpY = dx / distance;
  const curvature = Math.min(50, distance * 0.1);
  
  const controlX = midX + perpX * curvature;
  const controlY = midY + perpY * curvature;

  // SVG path for organic molecular bond
  const pathData = `M ${fromNode.x} ${fromNode.y} Q ${controlX} ${controlY} ${toNode.x} ${toNode.y}`;

  return (
    <motion.svg
      className="absolute inset-0 pointer-events-none"
      style={{
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main molecular bond line */}
      <motion.path
        d={pathData}
        fill="none"
        stroke={isDarkMode 
          ? (isActive ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.3)')
          : (isActive ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.2)')
        }
        strokeWidth={isActive ? 3 : 2}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ 
          pathLength: 1,
          filter: isActive 
            ? (isDarkMode 
                ? 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.6))' 
                : 'drop-shadow(0 0 6px rgba(0, 0, 0, 0.4))')
            : 'none'
        }}
        transition={{
          pathLength: { duration: 0.8, ease: "easeOut" },
          filter: { duration: 0.3 }
        }}
      />

      {/* Double bond for active connections (molecular style) */}
      {isActive && (
        <>
          {/* Secondary bond line */}
          <motion.path
            d={`M ${fromNode.x + 3} ${fromNode.y + 3} Q ${controlX + 3} ${controlY + 3} ${toNode.x + 3} ${toNode.y + 3}`}
            fill="none"
            stroke={isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)'}
            strokeWidth={1}
            strokeLinecap="round"
            animate={{
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Energy particles flowing along bond */}
          <motion.circle
            r="2"
            fill={isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)'}
            filter={isDarkMode 
              ? 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.9))' 
              : 'drop-shadow(0 0 6px rgba(0, 0, 0, 0.7))'
            }
          >
            <animateMotion
              dur="4s"
              repeatCount="indefinite"
              path={pathData}
            />
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="4s"
              repeatCount="indefinite"
            />
          </motion.circle>
        </>
      )}
    </motion.svg>
  );
};
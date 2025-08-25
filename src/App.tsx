import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioEngine } from './audio/AudioEngine';
import { NodeManager } from './audio/NodeManager';
import { InfiniteCanvas } from './components/Canvas/InfiniteCanvas';
import { AudioNodeComponent } from './components/Canvas/AudioNode';
import { ConnectionLine } from './components/Canvas/ConnectionLine';
import { NodeControls } from './components/Canvas/NodeControls';
import { AudioUploader } from './components/Upload/AudioUploader';
import { SessionRecorder } from './components/Recording/SessionRecorder';
import { ExportManager } from './components/Recording/ExportManager';
import { ThemeChanger } from './components/ThemeChanger';
import { SimplifiedControls } from './components/SimplifiedControls';
import { CanvasState, InteractionMode, DeletionState } from './types';
import { validateAudioFile } from './utils/fileHandling';

function App() {
  const audioEngineRef = useRef<AudioEngine>(new AudioEngine());
  const nodeManagerRef = useRef<NodeManager>(new NodeManager(audioEngineRef.current));
  
  const [canvasState, setCanvasState] = useState<CanvasState>({
    nodes: [],
    connections: [],
    zoom: 1,
    panX: 0,
    panY: 0
  });

  const [mode, setMode] = useState<InteractionMode>('play');
  const [isUploaderVisible, setIsUploaderVisible] = useState(false);
  const [uploadPosition, setUploadPosition] = useState<{ x: number; y: number } | null>(null);
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [isExportVisible, setIsExportVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isControlsHidden, setIsControlsHidden] = useState(false);
  const [deletionState, setDeletionState] = useState<DeletionState>({
    mode: 'normal',
    selectedForDeletion: new Set()
  });

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await audioEngineRef.current.initialize();
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    initializeAudio();
  }, []);

  useEffect(() => {
    setDeletionState(prev => ({
      ...prev,
      mode: mode === 'delete' ? 'delete' : 'normal',
      selectedForDeletion: mode !== 'delete' ? new Set() : prev.selectedForDeletion
    }));
  }, [mode]);

  const handleCanvasUpdate = useCallback((updates: Partial<CanvasState>) => {
    setCanvasState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleCanvasTouch = useCallback((x: number, y: number) => {
    // Always allow adding nodes by touching canvas
    setUploadPosition({ x, y });
    setIsUploaderVisible(true);
  }, []);

  const handleFileUpload = useCallback(async (file: File, x: number, y: number) => {
    const validation = validateAudioFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    try {
      await audioEngineRef.current.resumeContext();
      const newNode = await nodeManagerRef.current.createNode(file, x, y);
      
      setCanvasState(prev => {
        const updatedNodes = [...prev.nodes, newNode];
        
        // Auto-connect all nodes when we have 2 or more
        if (updatedNodes.length >= 2) {
          // Connect the new node to all existing nodes
          const connectionsToAdd: string[] = [];
          prev.nodes.forEach(existingNode => {
            if (!existingNode.connections.includes(newNode.id)) {
              nodeManagerRef.current.connectNodes(existingNode.id, newNode.id);
              connectionsToAdd.push(existingNode.id);
            }
          });
          
          // Update the new node's connections
          newNode.connections = connectionsToAdd;
          
          // Update existing nodes' connections to include the new node
          return {
            ...prev,
            nodes: updatedNodes.map(node => {
              if (node.id !== newNode.id && !node.connections.includes(newNode.id)) {
                return { ...node, connections: [...node.connections, newNode.id] };
              }
              return node;
            })
          };
        }
        
        return {
          ...prev,
          nodes: updatedNodes
        };
      });
    } catch (error) {
      console.error('Failed to create node:', error);
      throw error;
    }
  }, []);

  const handleNodePlay = useCallback(async (nodeId: string, loop: boolean) => {
    await audioEngineRef.current.resumeContext();
    nodeManagerRef.current.playNode(nodeId, loop);
    
    setCanvasState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId || node.connections.includes(nodeId)
          ? { ...node, isPlaying: true }
          : node
      )
    }));
  }, []);

  const handleNodeStop = useCallback((nodeId: string) => {
    nodeManagerRef.current.stopNode(nodeId);
    
    setCanvasState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => ({ ...node, isPlaying: false }))
    }));
  }, []);

  const handleNodePause = useCallback((nodeId: string) => {
    nodeManagerRef.current.pauseNode(nodeId);
    
    setCanvasState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId || node.connections.includes(nodeId)
          ? { ...node, isPlaying: false }
          : node
      )
    }));
  }, []);

  const handleNodeResume = useCallback((nodeId: string) => {
    nodeManagerRef.current.resumeNode(nodeId);
    
    setCanvasState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId || node.connections.includes(nodeId)
          ? { ...node, isPlaying: true }
          : node
      )
    }));
  }, []);

  // Individual node control (doesn't affect connected nodes)
  const handleIndividualNodePause = useCallback((nodeId: string) => {
    nodeManagerRef.current.pauseNodeOnly(nodeId);
    
    setCanvasState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, isPlaying: false } : node
      )
    }));
  }, []);

  const handleIndividualNodeResume = useCallback((nodeId: string) => {
    nodeManagerRef.current.resumeNodeOnly(nodeId);
    
    setCanvasState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, isPlaying: true } : node
      )
    }));
  }, []);

  const handleIndividualNodeStop = useCallback((nodeId: string) => {
    nodeManagerRef.current.stopNodeOnly(nodeId);
    
    setCanvasState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, isPlaying: false } : node
      )
    }));
  }, []);

  const handleNodeMove = useCallback((nodeId: string, x: number, y: number) => {
    nodeManagerRef.current.updateNodePosition(nodeId, x, y);
    
    setCanvasState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, x, y } : node
      )
    }));
  }, []);

  const handleNodeDelete = useCallback((nodeId: string) => {
    nodeManagerRef.current.removeNode(nodeId);
    
    setCanvasState(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId)
    }));
  }, []);

  const handleConnectionStart = useCallback((nodeId: string) => {
    if (mode === 'connect') {
      if (connectingNodeId === null) {
        setConnectingNodeId(nodeId);
      } else if (connectingNodeId !== nodeId) {
        nodeManagerRef.current.connectNodes(connectingNodeId, nodeId);
        
        setCanvasState(prev => ({
          ...prev,
          nodes: prev.nodes.map(node => {
            if (node.id === connectingNodeId && !node.connections.includes(nodeId)) {
              return { ...node, connections: [...node.connections, nodeId] };
            }
            if (node.id === nodeId && !node.connections.includes(connectingNodeId)) {
              return { ...node, connections: [...node.connections, connectingNodeId] };
            }
            return node;
          })
        }));
        
        setConnectingNodeId(null);
      } else {
        setConnectingNodeId(null);
      }
    }
  }, [mode, connectingNodeId]);

  const handleAddNode = useCallback(() => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const canvasX = (centerX - canvasState.panX) / canvasState.zoom;
    const canvasY = (centerY - canvasState.panY) / canvasState.zoom;
    
    setUploadPosition({ x: canvasX, y: canvasY });
    setIsUploaderVisible(true);
  }, [canvasState.panX, canvasState.panY, canvasState.zoom]);

  const handleZoomFit = useCallback(() => {
    if (canvasState.nodes.length === 0) {
      setCanvasState(prev => ({ ...prev, zoom: 1, panX: 0, panY: 0 }));
      return;
    }

    const bounds = canvasState.nodes.reduce(
      (acc, node) => ({
        minX: Math.min(acc.minX, node.x),
        maxX: Math.max(acc.maxX, node.x),
        minY: Math.min(acc.minY, node.y),
        maxY: Math.max(acc.maxY, node.y)
      }),
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );

    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    const zoom = Math.min(
      window.innerWidth / (width + 200),
      window.innerHeight / (height + 200),
      1
    );

    setCanvasState(prev => ({
      ...prev,
      zoom,
      panX: window.innerWidth / 2 - centerX * zoom,
      panY: window.innerHeight / 2 - centerY * zoom
    }));
  }, [canvasState.nodes]);

  const handleRecordingComplete = useCallback((audioBlob: Blob, events?: any[]) => {
    setRecordingBlob(audioBlob);
    setIsExportVisible(true);
    if (events) {
      console.log('Recording events:', events); // For future use with playback
    }
  }, []);

  const handleToggleDeleteSelection = useCallback((nodeId: string) => {
    setDeletionState(prev => {
      const newSet = new Set(prev.selectedForDeletion);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return { ...prev, selectedForDeletion: newSet };
    });
  }, []);

  const handleDeleteSelected = useCallback(() => {
    const nodeIdsToDelete = Array.from(deletionState.selectedForDeletion);
    
    // Delete each selected node
    nodeIdsToDelete.forEach(nodeId => {
      nodeManagerRef.current.removeNode(nodeId);
    });

    // Update canvas state
    setCanvasState(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => !deletionState.selectedForDeletion.has(node.id))
    }));

    // Clear selection and exit delete mode
    setDeletionState({
      mode: 'normal',
      selectedForDeletion: new Set()
    });
    setMode('play');
  }, [deletionState.selectedForDeletion]);

  const handleClearSelection = useCallback(() => {
    setDeletionState(prev => ({
      ...prev,
      selectedForDeletion: new Set()
    }));
  }, []);

  const handleDisconnectNodes = useCallback((fromNodeId: string, toNodeId: string) => {
    nodeManagerRef.current.disconnectNodes(fromNodeId, toNodeId);
    
    setCanvasState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => {
        if (node.id === fromNodeId) {
          return {
            ...node,
            connections: node.connections.filter(id => id !== toNodeId)
          };
        }
        if (node.id === toNodeId) {
          return {
            ...node,
            connections: node.connections.filter(id => id !== fromNodeId)
          };
        }
        return node;
      })
    }));
  }, []);

  const handleVolumeChange = useCallback((nodeId: string, volume: number) => {
    audioEngineRef.current.setNodeVolume(nodeId, volume);
  }, []);

  const handleMuteToggle = useCallback((nodeId: string) => {
    const nodeState = audioEngineRef.current.getNodeState(nodeId);
    if (nodeState) {
      if (nodeState.isMuted) {
        audioEngineRef.current.unmuteNode(nodeId);
      } else {
        audioEngineRef.current.muteNode(nodeId);
      }
    }
  }, []);

  const handleControlsToggle = useCallback(() => {
    setIsControlsHidden(prev => !prev);
    // Exit any active modes when hiding controls
    if (!isControlsHidden) {
      setMode('play');
      setDeletionState({
        mode: 'normal',
        selectedForDeletion: new Set()
      });
    }
  }, [isControlsHidden]);

  const handlePlayAll = useCallback(async () => {
    await audioEngineRef.current.resumeContext();
    
    // Check if any nodes are currently playing
    const anyPlaying = canvasState.nodes.some(node => node.isPlaying);
    
    if (anyPlaying) {
      // Stop all nodes
      canvasState.nodes.forEach(node => {
        if (node.isPlaying) {
          nodeManagerRef.current.pauseNode(node.id);
        }
      });
      
      setCanvasState(prev => ({
        ...prev,
        nodes: prev.nodes.map(node => ({ ...node, isPlaying: false }))
      }));
    } else {
      // Play all nodes
      canvasState.nodes.forEach(node => {
        if (!node.isPlaying) {
          nodeManagerRef.current.playNode(node.id, false);
        }
      });
      
      setCanvasState(prev => ({
        ...prev,
        nodes: prev.nodes.map(node => ({ ...node, isPlaying: true }))
      }));
    }
  }, [canvasState.nodes]);

  const handleResetAll = useCallback(() => {
    // Stop all nodes and reset their playback position
    canvasState.nodes.forEach(node => {
      nodeManagerRef.current.stopNode(node.id);
    });
    
    setCanvasState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => ({ ...node, isPlaying: false }))
    }));
  }, [canvasState.nodes]);

  const connections = nodeManagerRef.current.getConnections();

  return (
    <div className={`w-full h-full relative overflow-hidden transition-colors duration-500 ${
      isDarkMode ? 'bg-pure-black' : 'bg-white'
    }`}>
      {/* Header */}
      <AnimatePresence>
        {!isControlsHidden && (
          <motion.div 
            className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* App title */}
            <motion.h1 
              className={`text-sm font-mono tracking-wide transition-colors duration-500 ${
                isDarkMode ? 'text-white/80' : 'text-black/80'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              [note] - visual composer
            </motion.h1>

            {/* Theme changer */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ThemeChanger
                isDarkMode={isDarkMode}
                onThemeToggle={() => setIsDarkMode(!isDarkMode)}
                isRecording={isRecording}
                onToggleRecording={() => setIsRecording(!isRecording)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <InfiniteCanvas
        canvasState={canvasState}
        onCanvasUpdate={handleCanvasUpdate}
        onCanvasTouch={handleCanvasTouch}
      >
        {/* Connection lines */}
        {connections.map(({ from, to }) => (
          <ConnectionLine
            key={`${from.id}-${to.id}`}
            fromNode={from}
            toNode={to}
            isActive={from.isPlaying || to.isPlaying}
            isDarkMode={isDarkMode}
            onDisconnect={handleDisconnectNodes}
          />
        ))}

        {/* Audio nodes */}
        {canvasState.nodes.map(node => {
          const nodeState = audioEngineRef.current.getNodeState(node.id);
          return (
            <AudioNodeComponent
              key={node.id}
              node={node}
              onPlay={handleNodePlay}
              onStop={handleIndividualNodeStop}
              onPause={handleIndividualNodePause}
              onResume={handleIndividualNodeResume}
              onMove={handleNodeMove}
              onDelete={handleNodeDelete}
              onConnectionStart={handleConnectionStart}
              onVolumeChange={!isControlsHidden ? handleVolumeChange : undefined}
              onMuteToggle={!isControlsHidden ? handleMuteToggle : undefined}
              isConnecting={false}
              isDeletionMode={false}
              isMarkedForDeletion={false}
              nodeVolume={nodeState?.volume ?? 1}
              isMuted={nodeState?.isMuted ?? false}
              scale={canvasState.zoom}
              isDarkMode={isDarkMode}
              isConnected={node.connections.length > 0}
              isPaused={nodeManagerRef.current.isNodePaused(node.id)}
            />
          );
        })}

        {/* Connection preview line */}
        {connectingNodeId && mode === 'connect' && (
          <div className="absolute inset-0 pointer-events-none">
            {/* This would show a preview line following the cursor */}
          </div>
        )}
      </InfiniteCanvas>

      {/* Simplified Controls */}
      <AnimatePresence>
        {!isControlsHidden && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <SimplifiedControls
              nodes={canvasState.nodes}
              onPlayAll={handlePlayAll}
              onResetAll={handleResetAll}
              onAddNode={handleAddNode}
              onZoomFit={handleZoomFit}
              isDarkMode={isDarkMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hide controls toggle button */}
      <AnimatePresence>
        {!isControlsHidden && (
          <motion.button
            className={`
              fixed bottom-8 right-8 z-40 text-xs font-mono transition-colors
              ${isDarkMode 
                ? 'text-white/40 hover:text-white/80' 
                : 'text-black/40 hover:text-black/80'
              }
            `}
            onClick={handleControlsToggle}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            [hide controls]
          </motion.button>
        )}
      </AnimatePresence>

      {/* Show controls button */}
      <AnimatePresence>
        {isControlsHidden && (
          <motion.button
            className={`
              fixed top-8 left-8 z-50 text-xs font-mono transition-colors
              ${isDarkMode 
                ? 'text-white/40 hover:text-white/80' 
                : 'text-black/40 hover:text-black/80'
              }
            `}
            onClick={handleControlsToggle}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            [show controls]
          </motion.button>
        )}
      </AnimatePresence>

      {/* Audio uploader modal */}
      {!isControlsHidden && (
        <AudioUploader
          onFileUpload={handleFileUpload}
          isVisible={isUploaderVisible}
          onClose={() => setIsUploaderVisible(false)}
          uploadPosition={uploadPosition}
        />
      )}

      {/* Session recorder */}
      {!isControlsHidden && (
        <SessionRecorder
          isRecording={isRecording}
          onRecordingComplete={handleRecordingComplete}
          audioEngine={audioEngineRef.current}
        />
      )}

      {/* Export manager */}
      {!isControlsHidden && (
        <ExportManager
          audioBlob={recordingBlob}
          isVisible={isExportVisible}
          onClose={() => {
            setIsExportVisible(false);
            setRecordingBlob(null);
          }}
        />
      )}

      {/* Welcome interface for first-time users */}
      {canvasState.nodes.length === 0 && !isControlsHidden && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className={`text-center max-w-md ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
            <motion.div
              className="space-y-3 text-sm font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>01. Touch anywhere to upload audio</p>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>02. Touch nodes to play sounds</p>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>03. Connect nodes to layer audio</p>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>04. Record your composition</p>
            </motion.div>

            <motion.div
              className={`mt-8 text-xs font-light ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              What happens when you teach touch to compose music?
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default App;
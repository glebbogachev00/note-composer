import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
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
import { CanvasState, InteractionMode } from './types';
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

  const handleCanvasUpdate = useCallback((updates: Partial<CanvasState>) => {
    setCanvasState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleCanvasTouch = useCallback((x: number, y: number) => {
    if (mode === 'edit') {
      setUploadPosition({ x, y });
      setIsUploaderVisible(true);
    }
  }, [mode]);

  const handleFileUpload = useCallback(async (file: File, x: number, y: number) => {
    const validation = validateAudioFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    try {
      await audioEngineRef.current.resumeContext();
      const newNode = await nodeManagerRef.current.createNode(file, x, y);
      
      setCanvasState(prev => ({
        ...prev,
        nodes: [...prev.nodes, newNode]
      }));
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

  const connections = nodeManagerRef.current.getConnections();

  return (
    <div className={`w-full h-full relative overflow-hidden transition-colors duration-500 ${
      isDarkMode ? 'bg-pure-black' : 'bg-white'
    }`}>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6">
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
      </div>

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
          />
        ))}

        {/* Audio nodes */}
        {canvasState.nodes.map(node => (
          <AudioNodeComponent
            key={node.id}
            node={node}
            onPlay={handleNodePlay}
            onStop={handleNodeStop}
            onPause={handleNodePause}
            onResume={handleNodeResume}
            onMove={handleNodeMove}
            onDelete={handleNodeDelete}
            onConnectionStart={handleConnectionStart}
            isConnecting={mode === 'connect'}
            scale={canvasState.zoom}
            isDarkMode={isDarkMode}
            isConnected={node.connections.length > 0}
            isPaused={nodeManagerRef.current.isNodePaused(node.id)}
          />
        ))}

        {/* Connection preview line */}
        {connectingNodeId && mode === 'connect' && (
          <div className="absolute inset-0 pointer-events-none">
            {/* This would show a preview line following the cursor */}
          </div>
        )}
      </InfiniteCanvas>

      {/* Controls */}
      <NodeControls
        mode={mode}
        onModeChange={setMode}
        onAddNode={handleAddNode}
        onZoomFit={handleZoomFit}
        isDarkMode={isDarkMode}
      />

      {/* Audio uploader modal */}
      <AudioUploader
        onFileUpload={handleFileUpload}
        isVisible={isUploaderVisible}
        onClose={() => setIsUploaderVisible(false)}
        uploadPosition={uploadPosition}
      />

      {/* Session recorder */}
      <SessionRecorder
        isRecording={isRecording}
        onRecordingComplete={handleRecordingComplete}
        audioEngine={audioEngineRef.current}
      />

      {/* Export manager */}
      <ExportManager
        audioBlob={recordingBlob}
        isVisible={isExportVisible}
        onClose={() => {
          setIsExportVisible(false);
          setRecordingBlob(null);
        }}
      />

      {/* Welcome interface for first-time users */}
      {canvasState.nodes.length === 0 && (
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
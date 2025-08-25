interface NodePlaybackState {
  source: AudioBufferSourceNode | null;
  gainNode: GainNode;
  isPlaying: boolean;
  isPaused: boolean;
  startTime: number;
  pauseTime: number;
  volume: number;
  isMuted: boolean;
}

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: Map<string, AudioBufferSourceNode> = new Map();
  private nodeStates: Map<string, NodePlaybackState> = new Map();
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.7;
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw new Error('Audio not supported in this browser');
    }
  }

  async loadAudioFile(file: File): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('Audio engine not initialized');
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      console.error('Failed to decode audio file:', error);
      throw new Error('Invalid audio file format');
    }
  }

  playAudioBuffer(nodeId: string, audioBuffer: AudioBuffer, loop: boolean = false): void {
    if (!this.audioContext || !this.masterGain) return;

    this.stopNode(nodeId);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = loop;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 1;

    source.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Initialize node state if it doesn't exist
    if (!this.nodeStates.has(nodeId)) {
      this.nodeStates.set(nodeId, {
        source: null,
        gainNode,
        isPlaying: false,
        isPaused: false,
        startTime: 0,
        pauseTime: 0,
        volume: 1,
        isMuted: false
      });
    }

    const nodeState = this.nodeStates.get(nodeId)!;
    nodeState.source = source;
    nodeState.gainNode = gainNode;
    nodeState.isPlaying = true;
    nodeState.isPaused = false;
    
    // Reset timing for fresh play (not resume)
    nodeState.startTime = this.audioContext.currentTime;
    nodeState.pauseTime = 0;

    source.start();
    this.activeNodes.set(nodeId, source);

    source.onended = () => {
      this.activeNodes.delete(nodeId);
      nodeState.isPlaying = false;
      nodeState.source = null;
    };
  }

  stopNode(nodeId: string): void {
    const activeNode = this.activeNodes.get(nodeId);
    if (activeNode) {
      try {
        activeNode.stop();
      } catch (error) {
        console.warn('Node already stopped:', nodeId);
      }
      this.activeNodes.delete(nodeId);
    }

    const nodeState = this.nodeStates.get(nodeId);
    if (nodeState) {
      nodeState.isPlaying = false;
      nodeState.isPaused = false;
      nodeState.source = null;
    }
  }

  pauseNode(nodeId: string): void {
    const nodeState = this.nodeStates.get(nodeId);
    if (nodeState && nodeState.isPlaying && !nodeState.isPaused) {
      if (nodeState.source) {
        try {
          nodeState.source.stop();
        } catch (error) {
          console.warn('Node already stopped:', nodeId);
        }
      }
      
      nodeState.isPaused = true;
      nodeState.isPlaying = false;
      nodeState.pauseTime = this.audioContext?.currentTime || 0;
      
      // Debug logging
      const elapsedTime = nodeState.pauseTime - nodeState.startTime;
      console.log(`Pausing node ${nodeId}: elapsed time = ${elapsedTime}s`);
      
      this.activeNodes.delete(nodeId);
    }
  }

  resumeNode(nodeId: string, audioBuffer: AudioBuffer): void {
    const nodeState = this.nodeStates.get(nodeId);
    if (nodeState && nodeState.isPaused && this.audioContext && this.masterGain) {
      // Calculate the elapsed time when paused
      const elapsedTime = nodeState.pauseTime - nodeState.startTime;
      
      console.log(`Resuming node ${nodeId}: elapsed time = ${elapsedTime}s, buffer duration = ${audioBuffer.duration}s`);
      
      // Create new source for resuming from the paused position
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(nodeState.gainNode);
      
      nodeState.source = source;
      nodeState.isPlaying = true;
      nodeState.isPaused = false;
      
      // Adjust start time so the elapsed calculation works for future pauses
      nodeState.startTime = this.audioContext.currentTime - elapsedTime;

      // Start from the paused position, ensuring we don't exceed buffer duration
      const startOffset = Math.max(0, Math.min(elapsedTime, audioBuffer.duration));
      
      console.log(`Using startOffset: ${startOffset}s`);
      
      // Only start with offset if we have a meaningful elapsed time
      if (startOffset > 0.01 && startOffset < audioBuffer.duration) {
        source.start(0, startOffset);
      } else {
        // If elapsed time is invalid, start from beginning
        console.log('Starting from beginning due to invalid offset');
        source.start();
        nodeState.startTime = this.audioContext.currentTime;
      }
      
      this.activeNodes.set(nodeId, source);

      source.onended = () => {
        this.activeNodes.delete(nodeId);
        nodeState.isPlaying = false;
        nodeState.source = null;
      };
    }
  }

  isNodePaused(nodeId: string): boolean {
    const nodeState = this.nodeStates.get(nodeId);
    return nodeState ? nodeState.isPaused : false;
  }

  stopAllNodes(): void {
    this.activeNodes.forEach((_, nodeId) => {
      this.stopNode(nodeId);
    });
  }

  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  async resumeContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  getContext(): AudioContext | null {
    return this.audioContext;
  }

  getMasterGain(): GainNode | null {
    return this.masterGain;
  }

  isNodePlaying(nodeId: string): boolean {
    return this.activeNodes.has(nodeId);
  }

  setNodeVolume(nodeId: string, volume: number): void {
    const nodeState = this.nodeStates.get(nodeId);
    if (nodeState) {
      nodeState.volume = Math.max(0, Math.min(1, volume));
      nodeState.gainNode.gain.value = nodeState.isMuted ? 0 : nodeState.volume;
    }
  }

  muteNode(nodeId: string): void {
    const nodeState = this.nodeStates.get(nodeId);
    if (nodeState) {
      nodeState.isMuted = true;
      nodeState.gainNode.gain.value = 0;
    }
  }

  unmuteNode(nodeId: string): void {
    const nodeState = this.nodeStates.get(nodeId);
    if (nodeState) {
      nodeState.isMuted = false;
      nodeState.gainNode.gain.value = nodeState.volume;
    }
  }

  getNodeState(nodeId: string): NodePlaybackState | undefined {
    return this.nodeStates.get(nodeId);
  }
}
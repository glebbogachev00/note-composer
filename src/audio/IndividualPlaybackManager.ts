import { IndividualNodeState } from '../types';

export class IndividualPlaybackManager {
  private nodeStates: Map<string, IndividualNodeState> = new Map();
  private audioContext: AudioContext;
  private masterGain: GainNode;
  private timeTrackers: Map<string, number> = new Map();

  constructor(audioContext: AudioContext, masterGain: GainNode) {
    this.audioContext = audioContext;
    this.masterGain = masterGain;
  }

  initializeNode(nodeId: string): void {
    this.nodeStates.set(nodeId, {
      isPlaying: false,
      isPaused: false,
      currentTime: 0
    });
  }

  async playNode(nodeId: string, audioBuffer: AudioBuffer): Promise<void> {
    const state = this.nodeStates.get(nodeId);
    if (!state) return;

    // Stop any existing playback
    this.stopNode(nodeId);

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = audioBuffer;
    source.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Resume from paused position or start from beginning
    const startTime = state.isPaused ? state.currentTime : 0;
    const startOffset = state.isPaused ? state.currentTime : 0;
    
    source.start(0, startOffset);
    
    // Update state
    this.nodeStates.set(nodeId, {
      ...state,
      isPlaying: true,
      isPaused: false,
      audioSource: source,
      currentTime: startTime
    });
    
    // Track current time for pause functionality
    this.startTimeTracking(nodeId, startTime);
    
    // Handle source end
    source.onended = () => {
      this.stopNode(nodeId);
    };
  }

  pauseNode(nodeId: string): void {
    const state = this.nodeStates.get(nodeId);
    if (!state || !state.isPlaying) return;

    // Stop the audio source
    if (state.audioSource) {
      try {
        state.audioSource.stop();
      } catch (error) {
        console.warn('Source already stopped:', nodeId);
      }
    }

    // Clear time tracking
    const tracker = this.timeTrackers.get(nodeId);
    if (tracker) {
      clearInterval(tracker);
      this.timeTrackers.delete(nodeId);
    }

    // Calculate current playback position
    const pausedAt = this.audioContext.currentTime;
    
    this.nodeStates.set(nodeId, {
      ...state,
      isPlaying: false,
      isPaused: true,
      audioSource: undefined,
      pausedAt
    });
  }

  stopNode(nodeId: string): void {
    const state = this.nodeStates.get(nodeId);
    if (!state) return;

    // Stop the audio source
    if (state.audioSource) {
      try {
        state.audioSource.stop();
      } catch (error) {
        console.warn('Source already stopped:', nodeId);
      }
    }

    // Clear time tracking
    const tracker = this.timeTrackers.get(nodeId);
    if (tracker) {
      clearInterval(tracker);
      this.timeTrackers.delete(nodeId);
    }

    this.nodeStates.set(nodeId, {
      ...state,
      isPlaying: false,
      isPaused: false,
      audioSource: undefined,
      currentTime: 0,
      pausedAt: undefined
    });
  }

  toggleNode(nodeId: string, audioBuffer: AudioBuffer): void {
    const state = this.nodeStates.get(nodeId);
    if (!state) return;
    
    if (state.isPlaying) {
      this.pauseNode(nodeId);
    } else {
      this.playNode(nodeId, audioBuffer);
    }
  }

  private startTimeTracking(nodeId: string, startTime: number): void {
    // Clear any existing tracker
    const existingTracker = this.timeTrackers.get(nodeId);
    if (existingTracker) {
      clearInterval(existingTracker);
    }

    const startRealTime = this.audioContext.currentTime;
    
    const trackingInterval = setInterval(() => {
      const state = this.nodeStates.get(nodeId);
      if (!state || !state.isPlaying) {
        clearInterval(trackingInterval);
        this.timeTrackers.delete(nodeId);
        return;
      }
      
      const elapsed = this.audioContext.currentTime - startRealTime;
      this.nodeStates.set(nodeId, {
        ...state,
        currentTime: startTime + elapsed
      });
    }, 100); // Update every 100ms
    
    this.timeTrackers.set(nodeId, trackingInterval);
  }
  
  getNodeState(nodeId: string): IndividualNodeState | undefined {
    return this.nodeStates.get(nodeId);
  }

  playAllNodes(nodeIds: string[], audioBuffers: Map<string, AudioBuffer>): void {
    nodeIds.forEach(nodeId => {
      const audioBuffer = audioBuffers.get(nodeId);
      if (audioBuffer) {
        this.playNode(nodeId, audioBuffer);
      }
    });
  }

  pauseAllNodes(nodeIds: string[]): void {
    nodeIds.forEach(nodeId => {
      this.pauseNode(nodeId);
    });
  }

  dispose(): void {
    // Clean up all trackers
    this.timeTrackers.forEach(tracker => clearInterval(tracker));
    this.timeTrackers.clear();
    
    // Stop all nodes
    this.nodeStates.forEach((_, nodeId) => {
      this.stopNode(nodeId);
    });
  }
}
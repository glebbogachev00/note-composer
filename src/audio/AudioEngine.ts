export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: Map<string, AudioBufferSourceNode> = new Map();
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

    source.start();
    this.activeNodes.set(nodeId, source);

    source.onended = () => {
      this.activeNodes.delete(nodeId);
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

  isNodePlaying(nodeId: string): boolean {
    return this.activeNodes.has(nodeId);
  }
}
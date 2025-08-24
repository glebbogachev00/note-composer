import { AudioEngine } from './AudioEngine';
import { AudioNode } from '../types';

export class NodeManager {
  private audioEngine: AudioEngine;
  private nodes: Map<string, AudioNode> = new Map();

  constructor(audioEngine: AudioEngine) {
    this.audioEngine = audioEngine;
  }

  async createNode(file: File, x: number, y: number): Promise<AudioNode> {
    const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const audioBuffer = await this.audioEngine.loadAudioFile(file);
      
      const node: AudioNode = {
        id,
        x,
        y,
        audioBuffer,
        fileName: file.name,
        isPlaying: false,
        connections: [],
        color: this.generateNodeColor()
      };

      this.nodes.set(id, node);
      return node;
    } catch (error) {
      console.error('Failed to create audio node:', error);
      throw error;
    }
  }

  playNode(nodeId: string, loop: boolean = false): void {
    const node = this.nodes.get(nodeId);
    if (!node || !node.audioBuffer) return;

    this.audioEngine.playAudioBuffer(nodeId, node.audioBuffer, loop);
    this.updateNodeState(nodeId, { isPlaying: true });

    node.connections.forEach(connectedNodeId => {
      const connectedNode = this.nodes.get(connectedNodeId);
      if (connectedNode && connectedNode.audioBuffer && !connectedNode.isPlaying) {
        this.audioEngine.playAudioBuffer(connectedNodeId, connectedNode.audioBuffer, loop);
        this.updateNodeState(connectedNodeId, { isPlaying: true });
      }
    });
  }

  stopNode(nodeId: string): void {
    this.audioEngine.stopNode(nodeId);
    this.updateNodeState(nodeId, { isPlaying: false });

    const node = this.nodes.get(nodeId);
    if (node) {
      node.connections.forEach(connectedNodeId => {
        this.audioEngine.stopNode(connectedNodeId);
        this.updateNodeState(connectedNodeId, { isPlaying: false });
      });
    }
  }

  connectNodes(fromNodeId: string, toNodeId: string): void {
    const fromNode = this.nodes.get(fromNodeId);
    const toNode = this.nodes.get(toNodeId);
    
    if (fromNode && toNode && !fromNode.connections.includes(toNodeId)) {
      fromNode.connections.push(toNodeId);
      toNode.connections.push(fromNodeId);
    }
  }

  disconnectNodes(fromNodeId: string, toNodeId: string): void {
    const fromNode = this.nodes.get(fromNodeId);
    const toNode = this.nodes.get(toNodeId);
    
    if (fromNode) {
      fromNode.connections = fromNode.connections.filter(id => id !== toNodeId);
    }
    if (toNode) {
      toNode.connections = toNode.connections.filter(id => id !== fromNodeId);
    }
  }

  removeNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    this.stopNode(nodeId);
    
    node.connections.forEach(connectedId => {
      this.disconnectNodes(nodeId, connectedId);
    });

    this.nodes.delete(nodeId);
  }

  updateNodePosition(nodeId: string, x: number, y: number): void {
    this.updateNodeState(nodeId, { x, y });
  }

  private updateNodeState(nodeId: string, updates: Partial<AudioNode>): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      Object.assign(node, updates);
      this.nodes.set(nodeId, node);
    }
  }

  private generateNodeColor(): string {
    const grays = [
      '#ffffff', // White
      '#e5e7eb', // Light gray
      '#9ca3af', // Medium gray
      '#6b7280', // Darker gray
      '#4b5563', // Dark gray
      '#374151'  // Very dark gray
    ];
    return grays[Math.floor(Math.random() * grays.length)];
  }

  getNode(nodeId: string): AudioNode | undefined {
    return this.nodes.get(nodeId);
  }

  getAllNodes(): AudioNode[] {
    return Array.from(this.nodes.values());
  }

  getConnections(): Array<{ from: AudioNode; to: AudioNode }> {
    const connections: Array<{ from: AudioNode; to: AudioNode }> = [];
    
    this.nodes.forEach(node => {
      node.connections.forEach(connectedId => {
        const connectedNode = this.nodes.get(connectedId);
        if (connectedNode && node.id < connectedId) {
          connections.push({ from: node, to: connectedNode });
        }
      });
    });
    
    return connections;
  }
}
export interface AudioNode {
  id: string;
  x: number;
  y: number;
  audioBuffer: AudioBuffer | null;
  fileName: string;
  isPlaying: boolean;
  connections: string[];
  color: string;
}

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
}

export interface CanvasState {
  nodes: AudioNode[];
  connections: Connection[];
  zoom: number;
  panX: number;
  panY: number;
}

export interface AudioUpload {
  file: File;
  buffer: AudioBuffer;
}

export type InteractionMode = 'play' | 'edit' | 'connect';

export interface GestureState {
  isPressed: boolean;
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}
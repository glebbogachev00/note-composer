export interface TouchPoint {
  x: number;
  y: number;
  id: number;
}

export interface GestureEvent {
  type: 'tap' | 'longPress' | 'drag' | 'pinch' | 'doubleTap';
  position: { x: number; y: number };
  data?: any;
}

export class GestureRecognizer {
  private startTime: number = 0;
  private startPosition: { x: number; y: number } = { x: 0, y: 0 };
  private lastTapTime: number = 0;
  private longPressTimer: number | null = null;
  private isDragging: boolean = false;
  
  private readonly LONG_PRESS_DURATION = 800;
  private readonly DOUBLE_TAP_DURATION = 300;
  private readonly DRAG_THRESHOLD = 10;

  onStart(x: number, y: number): void {
    this.startTime = Date.now();
    this.startPosition = { x, y };
    this.isDragging = false;

    // Set up long press detection
    this.longPressTimer = setTimeout(() => {
      if (!this.isDragging) {
        this.onGesture({
          type: 'longPress',
          position: this.startPosition
        });
      }
    }, this.LONG_PRESS_DURATION);
  }

  onMove(x: number, y: number): void {
    const deltaX = x - this.startPosition.x;
    const deltaY = y - this.startPosition.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > this.DRAG_THRESHOLD && !this.isDragging) {
      this.isDragging = true;
      this.clearLongPressTimer();
      
      this.onGesture({
        type: 'drag',
        position: { x, y },
        data: { startPosition: this.startPosition, distance }
      });
    }
  }

  onEnd(x: number, y: number): void {
    const currentTime = Date.now();
    const duration = currentTime - this.startTime;
    
    this.clearLongPressTimer();

    if (!this.isDragging && duration < this.LONG_PRESS_DURATION) {
      // Check for double tap
      if (currentTime - this.lastTapTime < this.DOUBLE_TAP_DURATION) {
        this.onGesture({
          type: 'doubleTap',
          position: { x, y }
        });
        this.lastTapTime = 0; // Reset to prevent triple tap
      } else {
        this.onGesture({
          type: 'tap',
          position: { x, y }
        });
        this.lastTapTime = currentTime;
      }
    }

    this.isDragging = false;
  }

  private clearLongPressTimer(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private onGesture(event: GestureEvent): void {
    // This will be overridden by the component using this class
    console.log('Gesture detected:', event);
  }

  setGestureHandler(handler: (event: GestureEvent) => void): void {
    this.onGesture = handler;
  }
}

export const getRelativePosition = (
  event: React.TouchEvent | React.MouseEvent,
  element: HTMLElement,
  canvasState: { panX: number; panY: number; zoom: number }
): { x: number; y: number } => {
  const rect = element.getBoundingClientRect();
  
  let clientX: number, clientY: number;
  
  if ('touches' in event && event.touches.length > 0) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else if ('clientX' in event) {
    clientX = event.clientX;
    clientY = event.clientY;
  } else {
    return { x: 0, y: 0 };
  }

  const canvasX = (clientX - rect.left - canvasState.panX) / canvasState.zoom;
  const canvasY = (clientY - rect.top - canvasState.panY) / canvasState.zoom;

  return { x: canvasX, y: canvasY };
};

export const calculateDistance = (
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};
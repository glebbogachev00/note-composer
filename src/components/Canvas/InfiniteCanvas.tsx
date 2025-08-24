import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { CanvasState, GestureState } from '../../types';

interface InfiniteCanvasProps {
  canvasState: CanvasState;
  onCanvasUpdate: (state: Partial<CanvasState>) => void;
  onCanvasTouch: (x: number, y: number) => void;
  children?: React.ReactNode;
}

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  canvasState,
  onCanvasUpdate,
  onCanvasTouch,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [gestureState, setGestureState] = useState<GestureState>({
    isPressed: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0
  });

  const handlePanStart = useCallback((_: any, info: PanInfo) => {
    setIsPanning(true);
    setGestureState(prev => ({
      ...prev,
      isPressed: true,
      startX: info.point.x,
      startY: info.point.y,
      currentX: info.point.x,
      currentY: info.point.y
    }));
  }, []);

  const handlePan = useCallback((_: any, info: PanInfo) => {
    if (!isPanning) return;

    setGestureState(prev => ({
      ...prev,
      isDragging: true,
      currentX: info.point.x,
      currentY: info.point.y
    }));

    onCanvasUpdate({
      panX: canvasState.panX + info.delta.x,
      panY: canvasState.panY + info.delta.y
    });
  }, [isPanning, canvasState.panX, canvasState.panY, onCanvasUpdate]);

  const handlePanEnd = useCallback((_: any, info: PanInfo) => {
    if (!gestureState.isDragging && gestureState.isPressed) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const canvasX = (info.point.x - rect.left - canvasState.panX) / canvasState.zoom;
        const canvasY = (info.point.y - rect.top - canvasState.panY) / canvasState.zoom;
        onCanvasTouch(canvasX, canvasY);
      }
    }

    setIsPanning(false);
    setGestureState({
      isPressed: false,
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0
    });
  }, [gestureState.isDragging, gestureState.isPressed, canvasState.panX, canvasState.panY, canvasState.zoom, onCanvasTouch]);

  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    
    const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(2, canvasState.zoom * zoomDelta));
    
    onCanvasUpdate({ zoom: newZoom });
  }, [canvasState.zoom, onCanvasUpdate]);

  const handleDoubleClick = useCallback(() => {
    onCanvasUpdate({
      zoom: 1,
      panX: 0,
      panY: 0
    });
  }, [onCanvasUpdate]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('dblclick', handleDoubleClick);
      
      return () => {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('dblclick', handleDoubleClick);
      };
    }
  }, [handleWheel, handleDoubleClick]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-deep-black overflow-hidden cursor-grab active:cursor-grabbing no-select touch-manipulation"
    >
      <motion.div
        className="relative w-full h-full"
        animate={{
          x: canvasState.panX,
          y: canvasState.panY,
          scale: canvasState.zoom
        }}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        drag
        dragConstraints={false}
        dragElastic={0}
        transition={{
          type: "tween",
          duration: 0.1
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
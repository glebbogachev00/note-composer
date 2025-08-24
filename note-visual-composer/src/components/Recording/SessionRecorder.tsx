import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface RecordingEvent {
  timestamp: number;
  type: 'nodePlay' | 'nodeStop' | 'nodeTouch';
  nodeId: string;
  data?: any;
}

interface SessionRecorderProps {
  isRecording: boolean;
  onRecordingComplete: (audioBlob: Blob, events: RecordingEvent[]) => void;
}

export const SessionRecorder: React.FC<SessionRecorderProps> = ({
  isRecording,
  onRecordingComplete
}) => {
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const eventsRef = useRef<RecordingEvent[]>([]);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];
      eventsRef.current = [];
      startTimeRef.current = Date.now();
      setRecordingDuration(0);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob, eventsRef.current);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(100); // Collect data every 100ms

      // Update duration counter
      intervalRef.current = setInterval(() => {
        setRecordingDuration(Date.now() - startTimeRef.current);
      }, 100);

    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Microphone access required for recording. Please allow microphone access and try again.');
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);


  React.useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {isRecording && (
        <motion.div
          className="fixed top-20 right-6 z-40"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          <div className="
            bg-red-500/20 backdrop-blur-sm rounded-lg px-3 py-2
            border border-red-500/30 text-red-400 text-sm font-medium
          ">
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-2 h-2 bg-red-500 rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span>{formatDuration(recordingDuration)}</span>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};
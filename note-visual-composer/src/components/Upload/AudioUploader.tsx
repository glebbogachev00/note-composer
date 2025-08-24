import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioUploaderProps {
  onFileUpload: (file: File, x: number, y: number) => Promise<void>;
  isVisible: boolean;
  onClose: () => void;
  uploadPosition: { x: number; y: number } | null;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  onFileUpload,
  isVisible,
  onClose,
  uploadPosition
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const acceptedFormats = '.mp3,.wav,.m4a,.ogg,.aac';
  const maxFileSize = 30 * 1024 * 1024; // 30MB

  const handleFileSelect = async (file: File) => {
    if (!uploadPosition) return;
    
    if (file.size > maxFileSize) {
      alert('File too large. Please select a file under 30MB.');
      return;
    }

    try {
      setIsUploading(true);
      await onFileUpload(file, uploadPosition.x, uploadPosition.y);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload audio file. Please try a different format.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    const audioFile = files.find(file => file.type.startsWith('audio/'));
    
    if (audioFile) {
      await handleFileSelect(audioFile);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-pure-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`
              bg-pure-black/95 backdrop-blur-sm border border-white/10 p-8 max-w-sm w-full mx-4
              ${isDragOver ? 'border-white/30' : ''}
            `}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="text-center">
              <motion.h3 
                className="text-lg font-light text-white mb-6 tracking-wide"
                animate={{ opacity: isDragOver ? 1 : 0.8 }}
              >
                [upload audio]
              </motion.h3>
              
              <div className="text-gray-400 mb-8 text-sm font-light space-y-2">
                <p>Drop file here or click to browse</p>
                <p className="text-xs text-gray-500">MP3, WAV, M4A, OGG (max 30MB)</p>
              </div>

              {isUploading ? (
                <motion.div
                  className="text-white/60 text-sm font-mono"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  [processing...]
                </motion.div>
              ) : (
                <motion.button
                  className="
                    text-white/60 hover:text-white border border-white/20 hover:border-white/40
                    px-6 py-2 text-sm font-mono transition-all duration-300
                  "
                  onClick={triggerFileInput}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  [select file]
                </motion.button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFormats}
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
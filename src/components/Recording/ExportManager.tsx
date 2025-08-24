import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExportManagerProps {
  audioBlob: Blob | null;
  isVisible: boolean;
  onClose: () => void;
  sessionName?: string;
}

export const ExportManager: React.FC<ExportManagerProps> = ({
  audioBlob,
  isVisible,
  onClose,
  sessionName = 'note-composition'
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const downloadAudio = async (format: 'webm' | 'wav') => {
    if (!audioBlob) return;

    try {
      setIsExporting(true);
      
      let finalBlob = audioBlob;
      let extension = 'webm';

      if (format === 'wav') {
        // For now, we'll keep the original format since WAV conversion
        // would require additional audio processing libraries
        extension = 'wav';
      }

      const url = URL.createObjectURL(finalBlob);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const filename = `${sessionName}-${timestamp}.${extension}`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      // Auto-close after successful download
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export recording. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatFileSize = (blob: Blob): string => {
    const bytes = blob.size;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <AnimatePresence>
      {isVisible && audioBlob && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="
              bg-pure-black/95 backdrop-blur-sm border border-white/10 p-8 max-w-sm w-full mx-4
            "
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <motion.h3 
                className="text-lg font-light text-white mb-6 tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                [recording complete]
              </motion.h3>
              
              <div className="text-gray-400 mb-8 text-sm font-light space-y-2">
                <p>Your composition has been captured</p>
                <p className="text-xs text-gray-500 font-mono">Size: {formatFileSize(audioBlob)}</p>
              </div>

              {isExporting ? (
                <motion.div
                  className="text-white/60 text-sm font-mono"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  [preparing download...]
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <motion.button
                    className="
                      w-full text-white/60 hover:text-white border border-white/20 hover:border-white/40
                      px-6 py-2 text-sm font-mono transition-all duration-300
                    "
                    onClick={() => downloadAudio('webm')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    [download webm]
                  </motion.button>

                  <motion.button
                    className="
                      w-full text-white/40 hover:text-white/60 border border-white/10 hover:border-white/20
                      px-6 py-2 text-sm font-mono transition-all duration-300
                    "
                    onClick={() => downloadAudio('wav')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    [download wav]
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
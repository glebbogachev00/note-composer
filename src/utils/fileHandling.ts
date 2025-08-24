export const validateAudioFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 30 * 1024 * 1024; // 30MB
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/aac'];
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File too large. Maximum size is 30MB.' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Unsupported file format. Please use MP3, WAV, M4A, OGG, or AAC.' };
  }
  
  return { isValid: true };
};

export const generateWaveformData = (audioBuffer: AudioBuffer, samples: number = 100): number[] => {
  const channelData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / samples);
  const waveformData: number[] = [];

  for (let i = 0; i < samples; i++) {
    let sum = 0;
    const start = i * blockSize;
    const end = Math.min(start + blockSize, channelData.length);
    
    for (let j = start; j < end; j++) {
      sum += Math.abs(channelData[j]);
    }
    
    waveformData.push(sum / (end - start));
  }

  return waveformData;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
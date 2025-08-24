# [note] - Visual Music Composer

A web-based visual music composition tool where users upload their own audio files and map them to interactive visual nodes. Create personalized music instruments by connecting sounds in an infinite canvas.

## Features

- **Upload Audio Files**: Support for MP3, WAV, M4A, OGG formats
- **Visual Sound Nodes**: Organic blob shapes with waveform visualization
- **Interactive Canvas**: Infinite pan/zoom with touch and mouse support
- **Node Connections**: Link sounds to play simultaneously
- **Session Recording**: Capture compositions for export
- **Apple-Inspired Design**: Clean, minimal dark interface

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. **Add Sounds**: Touch empty canvas or use + button to upload audio files
2. **Play Music**: Touch nodes to trigger sounds
3. **Connect Nodes**: Switch to connect mode and drag between nodes
4. **Record Sessions**: Use record button to capture your compositions
5. **Export**: Download recordings in WebM or WAV format

## Project Structure

```
src/
├── components/
│   ├── Canvas/          # Infinite canvas and node components
│   ├── Upload/          # Audio file upload system
│   └── Recording/       # Session recording and export
├── audio/               # Web Audio API engine
├── utils/               # Utilities for gestures, animations, file handling
└── types/              # TypeScript type definitions
```

## Browser Support

- Modern browsers with Web Audio API support
- Touch devices (iOS Safari, Android Chrome)
- Desktop (Chrome, Firefox, Safari, Edge)

## License

MIT
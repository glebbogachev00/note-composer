# [note] - Visual Composer

A modern, interactive audio visual composer built with React, TypeScript, and the Web Audio API. Touch anywhere to upload audio, create nodes, and visually compose music by connecting sounds together.

## Features

- **Visual Audio Composition**: Create and connect audio nodes in an infinite canvas
- **Touch-Friendly Interface**: Intuitive touch controls for uploading and manipulating audio
- **Real-time Audio Processing**: Powered by the Web Audio API for low-latency audio playback
- **Session Recording**: Record and export your compositions
- **Dark/Light Theme**: Toggle between dark and light modes
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## How to Use

1. **Upload Audio**: Touch anywhere on the canvas to upload audio files
2. **Play Sounds**: Touch audio nodes to play individual sounds
3. **Connect Nodes**: Use connect mode to link nodes and layer audio
4. **Record**: Capture your live compositions for export
5. **Export**: Save your recorded sessions as audio files

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Build Tool**: Vite
- **Audio**: Web Audio API

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/glebbogachev00/note-composer.git
cd note-composer
```

2. Navigate to the project directory:
```bash
cd note-visual-composer
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Project Structure

```
src/
├── components/          # React components
│   ├── Canvas/         # Canvas and node components
│   ├── Recording/      # Recording and export functionality
│   └── Upload/         # File upload components
├── audio/              # Audio engine and node management
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Browser Compatibility

This application requires modern browsers with Web Audio API support:
- Chrome 66+
- Firefox 60+
- Safari 14.1+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Author

Gleb Bogachev - [glebbogachev00](https://github.com/glebbogachev00)
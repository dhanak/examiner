# C1 Examiner

A single-page web application for training and self-testing to prepare for the Cambridge C1 (Advanced) language exam. This app runs entirely in the browser with no backend dependencies, making it perfect for hosting on GitHub Pages.

## Features

- **Self-Contained**: No backend server required - all data stored locally in the browser
- **Progress Tracking**: Individual progress saved in browser state with analytics
- **Multiple Exercise Types**: Practice for different sections of the C1 exam
- **Performance Analytics**: Visualize your progress with charts and statistics
- **Dictionary Integration**: Optional integration with online dictionary/thesaurus APIs
- **Offline-Ready**: Works without an internet connection once loaded

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **State Management**: Zustand with localStorage persistence
- **Database**: IndexedDB via Dexie.js for question storage and user history
- **Routing**: React Router
- **Testing**: Vitest + React Testing Library
- **Charts**: Recharts for analytics visualization

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view in your browser.

### Testing

```bash
# Run tests
npm test

# Run tests with UI
npm test:ui

# Generate coverage report
npm test:coverage
```

Coverage reports are generated in the `coverage/` directory.

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory, ready for deployment to GitHub Pages.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
 pages/          # Page components (Dashboard, Practice, etc.)
 components/     # Reusable UI components
 store/          # Zustand state management
 db/             # Dexie.js database setup and queries
 hooks/          # Custom React hooks
 utils/          # Utility functions
 test/           # Test setup and utilities
 App.jsx         # Main application component
```

## Deployment

This app is configured for GitHub Pages deployment:

1. Update `base` in `vite.config.js` to match your repository name
2. Build the project: `npm run build`
3. Deploy the `dist/` folder to GitHub Pages

## Contributing

Contributions are welcome! Please ensure:

- All tests pass: `npm test`
- Code is linted: `npm run lint`
- Test coverage is maintained: `npm test:coverage`

## License

MIT

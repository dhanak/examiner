# C1 Examiner

A single-page web application for Hungarian learners preparing for the Cambridge C1 (Advanced) English language exam. This app runs entirely in the browser with no backend dependencies, making it perfect for hosting on GitHub Pages.

## Language Context

- **Target Language**: British English
- **Learner's Native Language**: Hungarian
- **Exam Focus**: Cambridge C1 Advanced (CAE)

## Features

- **Vocabulary Flipcards**: Interactive flashcards with English words and Hungarian translations
- **Self-Contained**: No backend server required - all data stored locally in the browser
- **Progress Tracking**: Individual progress saved in browser state with analytics
- **Multiple Exercise Types**: Practice for different sections of the C1 exam
- **Performance Analytics**: Visualize your progress with charts and statistics
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
npm run dev -- --host
```

Open [http://localhost:5173/examiner/](http://localhost:5173/examiner/) to view in your browser. The `--host` flag exposes the server to your network.

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

This app is automatically deployed to GitHub Pages via GitHub Actions:

- **Live URL**: [https://dev.vidga.hu/examiner/](https://dev.vidga.hu/examiner/)
- **Repository**: [github.com/dhanak/examiner](https://github.com/dhanak/examiner)
- **Workflow**: Runs tests, builds, and deploys on every push to `master`
- **Base Path**: `/examiner/` (configured in `vite.config.js`)

### Manual Deployment

If you need to deploy manually:

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to GitHub Pages

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:
1. ✅ Runs all tests
2. ✅ Runs ESLint
3. 🏗️ Builds the production bundle
4. 🚀 Deploys to GitHub Pages (only on `master` branch)

Pull requests will run tests and build but won't deploy.

## Contributing

Contributions are welcome! Please ensure:

- All tests pass: `npm test`
- Code is linted: `npm run lint`
- Test coverage is maintained: `npm test:coverage`

## License

MIT

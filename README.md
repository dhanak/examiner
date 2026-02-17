# C1 Examiner

A single-page web application for language learners preparing for Cambridge C1 (Advanced) or Goethe-Zertifikat C1 exams. Supports both English and German target languages. This app runs entirely in the browser with no backend dependencies, making it perfect for hosting on GitHub Pages.

## Language Context

- **Target Languages**:
  - British English (Cambridge C1 Advanced / CAE)
  - German (Goethe-Zertifikat C1 / DSD)
- **Learner's Native Language**: Hungarian
- **Vocabulary**: 1000 words per language (200 B1, 400 B2, 400 C1)

## Features

### Language Support
- **Bilingual Interface**: Switch between English and German UI with flag buttons (🇬🇧 / 🇩🇪) in the header
- **Separate Vocabularies**: 1000 independent words for each target language
- **Language-Aware Stats**: Progress and statistics tracked separately per language
- **Vocabulary Context**: All definitions and examples in the target language; translations in Hungarian
- **Text-to-Speech**: Native speaker voices (en-GB for English, de-DE for German)

### Vocabulary Management
- **Flashcards**: Interactive flipcard system with words and Hungarian translations
- **1000+ Words per Language**: Comprehensive vocabulary bank covering B1, B2, and C1 levels
- **Filtering**: Filter by language level (B1, B2, C1) and learning status (learned/unlearned)
- **Shuffle**: Randomize card order for varied practice
- **Progress Tracking**: Visual indicators for learned words and overall progress
- **Part of Speech**: Displayed and translated for both languages (e.g., German: "Substantiv", "Verb", "Adjektiv")

### Practice Modes
- **Multiple Choice**: Select correct Hungarian translation or target language word (4-8 options)
- **Match Pairs**: Match target language words with Hungarian translations (4-8 pairs)
- **Fill in Blanks**: Complete target language sentences with correct words (1-3 blanks, 2-6 distractors)
- **Direction Toggle**: Practice Language→Hungarian or Hungarian→Language
- **Case Preservation**: German nouns maintain proper capitalization (e.g., "Substantiv" not "substantiv")

### Progress & Analytics
- **Global Statistics**: Track cumulative correct/incorrect answers across all sessions
- **Session Stats**: Monitor performance in current practice mode
- **Dashboard**: Comprehensive view of vocabulary progress, learning stats, and accuracy metrics
- **Clear Progress**: Reset all data with confirmation dialog

### Technical Features
- **Self-Contained**: No backend server required - all data stored locally
- **Offline-Ready**: Works without internet connection once loaded
- **Persistent Storage**: Progress saved using localStorage and Zustand
- **Hash-Based Routing**: URLs work directly on GitHub Pages (e.g., `/#/practice`)
- **Dark/Light Theme**: Toggle between dark and light modes

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **State Management**: Zustand with localStorage persistence
- **Routing**: React Router with hash-based navigation
- **Testing**: Vitest + React Testing Library
- **Styling**: CSS with CSS variables for theming
- **Linting**: ESLint (flat config)

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

Open [http://localhost:5173/](http://localhost:5173/) in your browser. The app will be available at `/#/`.

### Testing

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm test:ui

# Generate coverage report (target: >80%)
npm test:coverage
```

Coverage reports are generated in the `coverage/` directory.

### Linting

```bash
npm run lint
```

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
 pages/          # Page components (Dashboard, Practice, VocabularyPractice)
 components/     # UI components (MultipleChoice, MatchPairs, FillBlanks, FlipCard, etc.)
 store/          # Zustand state management (practiceStore, vocabularyStore, themeStore, languageStore)
 utils/          # Utility functions (practiceUtils, formatScore, vocabularyUtils, etc.)
 data/           # Static data (vocabulary-en.json, vocabulary-de.json - alphabetically sorted)
 i18n/           # Internationalization (en.js, de.js, index.js)
 hooks/          # Custom hooks (useTranslation.js, useTimer.js)
 App.jsx         # Main application component
```

## Header Layout

The header uses CSS Grid for stable layout:
- **Left**: Application title ("C1 Examiner")
- **Center**: Navigation tabs (Dashboard, Vocabulary, Practice) — perfectly centered regardless of title length
- **Right**: Language selector (🇬🇧 / 🇩🇪) and theme toggle (☀️ / 🌙)

Layout remains stable when switching languages (e.g., "Prüfung" vs "Practice" have different widths)

## Key Components

### Practice Modes
- **MultipleChoice.jsx**: Multiple choice question component with direction toggle
- **MatchPairs.jsx**: Drag-and-drop pairs matching game
- **FillBlanks.jsx**: Fill-in-the-blank sentence completion with show answers feature
- **FlipCardDeck.jsx**: Vocabulary flipcard display with learn/mistake tracking

### Pages
- **Dashboard.jsx**: Comprehensive statistics and progress overview
- **Practice.jsx**: Container for all practice modes with mode selector
- **VocabularyPractice.jsx**: Flipcard learning mode with filters and shuffle

### State Management
- **languageStore.js**: Current target language (en/de), persisted to localStorage
- **practiceStore.js**: Global and session statistics, practice mode settings — **per-language**
- **vocabularyStore.js**: Learned words, mistakes, vocabulary filters — **per-language**
- **themeStore.js**: Dark/light theme preference

### Internationalization (i18n)
- **System**: Custom i18n solution (not a library) for lightweight performance
- **Files**: `src/i18n/en.js` and `src/i18n/de.js` contain all UI strings
- **Part of Speech Translations**:
  - English: noun, verb, adjective, adverb, preposition, conjunction, pronoun
  - German: Substantiv, Verb, Adjektiv, Adverb, Präposition, Konjunktion, Pronomen

## Vocabulary Data

- **English**: `src/data/vocabulary-en.json`
- **German**: `src/data/vocabulary-de.json`
- **Format**: Alphabetically sorted arrays of word objects (articles ignored for noun sorting)
- **Structure**: Each word includes id, word, level (B1/B2/C1), partOfSpeech, translations (Hungarian), definition (target language), and example
- **Total**: 1000 words per language (200 B1 + 400 B2 + 400 C1)
- **German Specifics**:
  - Nouns include articles (der, die, das) and maintain proper capitalization
  - Definitions and examples use German grammar and conventions
  - All parts of speech follow German language norms

## Deployment

This app is automatically deployed to GitHub Pages via GitHub Actions:

- **Live URL**: [https://dev.vidga.hu/examiner/](https://dev.vidga.hu/examiner/)
- **Repository**: [github.com/dhanak/examiner](https://github.com/dhanak/examiner)
- **Workflow**: Runs tests, builds, and deploys on every push to `master`
- **Routing**: Hash-based URLs (e.g., `/#/practice`, `/#/vocabulary`)

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:
1. ✅ Runs all tests (target: >80% coverage)
2. ✅ Runs ESLint
3. 🏗️ Builds the production bundle
4. 🚀 Deploys to GitHub Pages (only on `master` branch)

Pull requests will run tests and build but won't deploy.

## Testing Strategy

- **Unit Tests**: Component behavior and user interactions
- **Integration Tests**: Page workflows and state management
- **Test Coverage**: Maintained at >80% across all files
- **Test Files**: Co-located with components (e.g., `Component.jsx` + `Component.test.jsx`)

## Contributing

Contributions are welcome! Please ensure:

- All tests pass: `npm test -- --run`
- Code is linted: `npm run lint`
- Test coverage is maintained: `npm test:coverage`
- New vocabulary words are added in batches and sorted alphabetically

## License

MIT © 2026 David Hanak. See LICENSE file for details.

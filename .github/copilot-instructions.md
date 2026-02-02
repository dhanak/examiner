# Copilot Instructions for C1 Examiner

## Project Overview

C1 Examiner is a single-page React application for Cambridge C1 exam preparation. It runs entirely client-side with no backend, using IndexedDB for data storage and localStorage for user preferences.

## Build, Test, and Lint Commands

### Development
```bash
npm run dev          # Start dev server on http://localhost:5173
```

### Testing
```bash
npm test             # Run tests in watch mode
npm test:ui          # Run tests with Vitest UI
npm test:coverage    # Generate coverage report (target: >80%)
```

**Running a single test:**
```bash
npm test -- src/App.test.jsx           # Run specific test file
npm test -- -t "test name pattern"     # Run tests matching pattern
```

### Build and Lint
```bash
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

## Architecture

### Data Flow
- **User Input** → **React Components** → **Zustand Store** (ephemeral state) → **localStorage** (persistence)
- **Question Data** → **IndexedDB (Dexie.js)** → **React components** via `dexie-react-hooks`

### Key Layers
1. **Pages** (`src/pages/`): Top-level route components (Dashboard, Practice)
2. **State Management** (`src/store/`): Zustand stores with persist middleware
3. **Database** (`src/db/database.js`): Dexie.js schema and seed data
4. **Components**: Pure UI components receiving props from pages

### State Management Strategy
- **Zustand stores**: User progress, session state, UI preferences
- **IndexedDB (Dexie)**: Question bank, user answer history, study sessions
- **Local component state**: Temporary UI state (form inputs, modals)

## Key Conventions

### File Naming
- Components: PascalCase (`Dashboard.jsx`, `QuestionCard.jsx`)
- Utilities/hooks: camelCase (`useTimer.js`, `formatScore.js`)
- Stores: camelCase with "Store" suffix (`progressStore.js`, `settingsStore.js`)

### Component Structure
- Prefer functional components with hooks
- Co-locate tests: `Component.jsx` + `Component.test.jsx` in same directory
- Keep components small and focused (< 150 lines)

### Zustand Store Pattern
```javascript
export const useStoreNameStore = create(
  persist(
    (set, get) => ({
      // state
      // actions
    }),
    { name: 'storage-key' }
  )
)
```

### Dexie Database Access
- Use `useLiveQuery` hook for reactive database queries
- Example: `const questions = useLiveQuery(() => db.questions.toArray())`
- Avoid direct database mutations in components; use functions in `src/db/`

### Testing Expectations
- All new components must have tests
- Test user interactions, not implementation details
- Mock Zustand stores in tests using `setState` on the store
- Mock IndexedDB queries with Vitest's `vi.mock()`

### GitHub Pages Configuration
- Base path is set in `vite.config.js` as `/examiner/`
- Update this if deploying to a different repository name
- Router basename must match: `<BrowserRouter basename="/examiner">`

## Common Patterns

### Adding a New Question Type
1. Add schema to `db.version().stores()` if needed
2. Create question component in `src/components/questions/`
3. Add route in `App.jsx`
4. Update database seed function
5. Add tests for question component

### Integrating External APIs (Dictionary)
- Use `fetch` in utility functions under `src/utils/api/`
- Handle offline gracefully with try/catch
- Cache responses in IndexedDB when possible
- Example: `src/utils/api/dictionaryApi.js`

### Performance Considerations
- Lazy load routes: `const Practice = lazy(() => import('./pages/Practice'))`
- Use `React.memo()` for expensive list items
- IndexedDB queries are async; show loading states
- Debounce user input for search/filter operations

## Dependencies

### Production
- **React Router**: `<Routes>`, `<Route>`, `useNavigate`, `useParams`
- **Zustand**: `create()`, `persist` middleware
- **Dexie.js**: `db.table.add()`, `useLiveQuery()`, `db.table.where()`
- **Recharts**: Use for progress charts on Dashboard

### Development
- **Vitest**: `describe`, `it`, `expect`, `vi.mock()`
- **Testing Library**: `render`, `screen`, `userEvent`, `waitFor`
- **ESLint**: Flat config format (eslint.config.js)

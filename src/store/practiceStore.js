import { create } from 'zustand'

export const usePracticeStore = create((set, get) => ({
  // Current mode: 'multiple-choice', 'match-pairs', 'fill-blanks'
  currentMode: 'multiple-choice',
  
  // Translation direction: 'hu-to-en' (Hungarian→English) or 'en-to-hu' (English→Hungarian)
  direction: 'hu-to-en',
  
  // Word pool filter: 'all', 'learned', 'mistakes'
  wordPoolFilter: 'all',
  
  // Session statistics
  correctCount: 0,
  incorrectCount: 0,
  
  // Current question state (varies by mode)
  currentQuestion: null,
  
  // Settings for each mode
  settings: {
    multipleChoice: {
      optionCount: 4  // 4, 6, or 8 options
    },
    matchPairs: {
      pairCount: 6    // 4-8 pairs
    },
    fillBlanks: {
      distractorCount: 3  // 2-4 distractors
    }
  },
  
  // Actions
  setMode: (mode) => set({ currentMode: mode }),
  
  setDirection: (direction) => set({ direction }),
  
  setWordPoolFilter: (filter) => set({ wordPoolFilter: filter }),
  
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  
  incrementCorrect: () => set((state) => ({ 
    correctCount: state.correctCount + 1 
  })),
  
  incrementIncorrect: () => set((state) => ({ 
    incorrectCount: state.incorrectCount + 1 
  })),
  
  updateSettings: (mode, settings) => set((state) => ({
    settings: {
      ...state.settings,
      [mode]: { ...state.settings[mode], ...settings }
    }
  })),
  
  getAccuracy: () => {
    const { correctCount, incorrectCount } = get()
    const total = correctCount + incorrectCount
    return total === 0 ? 0 : Math.round((correctCount / total) * 100)
  },
  
  resetSession: () => set({
    correctCount: 0,
    incorrectCount: 0,
    currentQuestion: null
  }),
  
  resetAll: () => set({
    currentMode: 'multiple-choice',
    direction: 'hu-to-en',
    wordPoolFilter: 'all',
    correctCount: 0,
    incorrectCount: 0,
    currentQuestion: null,
    settings: {
      multipleChoice: {
        optionCount: 4
      },
      matchPairs: {
        pairCount: 6
      },
      fillBlanks: {
        distractorCount: 3
      }
    }
  })
}))

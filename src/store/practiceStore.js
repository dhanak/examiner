import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const usePracticeStore = create(
  persist(
    (set, get) => ({
      // Current mode: 'multiple-choice', 'match-pairs', 'fill-blanks'
      currentMode: 'multiple-choice',
      
      // Translation direction: 'hu-to-en' (Hungarian→English) or 'en-to-hu' (English→Hungarian)
      direction: 'hu-to-en',
      
      // Word pool filter: 'all', 'learned', 'mistakes'
      wordPoolFilter: 'all',
      
      // Level filter: 'all', 'B1', 'B2', 'C1'
      levelFilter: 'all',
      
      // Global statistics (persist across session resets)
      globalCorrectCount: 0,
      globalIncorrectCount: 0,
      
      // Session statistics (reset when changing modes)
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
          pairCount: 4    // 4-8 pairs
        },
        fillBlanks: {
          blankCount: 2,       // 1-3 blanks per sentence
          distractorCount: 3   // 2-6 distractors
        }
      },
      
      // Actions
      setMode: (mode) => set({ currentMode: mode }),
      
      setDirection: (direction) => set({ direction }),
      
      setWordPoolFilter: (filter) => set({ wordPoolFilter: filter }),
      
      setLevelFilter: (level) => set({ levelFilter: level }),
      
      setCurrentQuestion: (question) => set({ currentQuestion: question }),
      
      incrementCorrect: () => set((state) => ({ 
        correctCount: state.correctCount + 1,
        globalCorrectCount: state.globalCorrectCount + 1
      })),
      
      incrementIncorrect: () => set((state) => ({ 
        incorrectCount: state.incorrectCount + 1,
        globalIncorrectCount: state.globalIncorrectCount + 1
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
        globalCorrectCount: 0,
        globalIncorrectCount: 0,
        currentQuestion: null,
        settings: {
          multipleChoice: {
            optionCount: 4
          },
          matchPairs: {
            pairCount: 6
          },
          fillBlanks: {
            blankCount: 2,
            distractorCount: 3
          }
        }
      })
    }),
    { name: 'practice-store' }
  )
)

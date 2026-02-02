import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useVocabularyStore = create(
  persist(
    (set, get) => ({
      learnedWords: new Set(),
      mistakeWords: new Set(),
      currentFilter: 'all',
      
      markAsLearned: (wordId) => set((state) => {
        const newLearned = new Set(state.learnedWords)
        newLearned.add(wordId)
        return { learnedWords: newLearned }
      }),
      
      unmarkAsLearned: (wordId) => set((state) => {
        const newLearned = new Set(state.learnedWords)
        newLearned.delete(wordId)
        return { learnedWords: newLearned }
      }),
      
      isLearned: (wordId) => {
        return get().learnedWords.has(wordId)
      },
      
      markAsMistake: (wordId) => set((state) => {
        const newMistakes = new Set(state.mistakeWords)
        newMistakes.add(wordId)
        return { mistakeWords: newMistakes }
      }),
      
      clearMistake: (wordId) => set((state) => {
        const newMistakes = new Set(state.mistakeWords)
        newMistakes.delete(wordId)
        return { mistakeWords: newMistakes }
      }),
      
      isMistake: (wordId) => {
        return get().mistakeWords.has(wordId)
      },
      
      clearAllMistakes: () => set({ mistakeWords: new Set() }),
      
      setFilter: (filter) => set({ currentFilter: filter }),
      
      getLearnedCount: () => get().learnedWords.size,
      
      getMistakeCount: () => get().mistakeWords.size,
      
      resetProgress: () => set({ 
        learnedWords: new Set(),
        mistakeWords: new Set()
      })
    }),
    {
      name: 'c1-examiner-vocabulary',
      // Custom serialization for Set
      partialize: (state) => ({
        learnedWords: Array.from(state.learnedWords),
        mistakeWords: Array.from(state.mistakeWords),
        currentFilter: state.currentFilter
      }),
      // Custom deserialization for Set
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        learnedWords: new Set(persistedState?.learnedWords || []),
        mistakeWords: new Set(persistedState?.mistakeWords || [])
      })
    }
  )
)

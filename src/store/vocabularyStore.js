import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useVocabularyStore = create(
  persist(
    (set, get) => ({
      learnedWords: new Set(),
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
      
      setFilter: (filter) => set({ currentFilter: filter }),
      
      getLearnedCount: () => get().learnedWords.size,
      
      resetProgress: () => set({ learnedWords: new Set() })
    }),
    {
      name: 'c1-examiner-vocabulary',
      // Custom serialization for Set
      partialize: (state) => ({
        learnedWords: Array.from(state.learnedWords),
        currentFilter: state.currentFilter
      }),
      // Custom deserialization for Set
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        learnedWords: new Set(persistedState?.learnedWords || [])
      })
    }
  )
)

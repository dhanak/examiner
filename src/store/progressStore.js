import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useProgressStore = create(
  persist(
    (set) => ({
      totalQuestions: 0,
      correctAnswers: 0,
      sessionHistory: [],
      
      incrementTotal: () => set((state) => ({ 
        totalQuestions: state.totalQuestions + 1 
      })),
      
      incrementCorrect: () => set((state) => ({ 
        correctAnswers: state.correctAnswers + 1 
      })),
      
      addSessionResult: (result) => set((state) => ({
        sessionHistory: [...state.sessionHistory, result]
      })),
      
      resetProgress: () => set({
        totalQuestions: 0,
        correctAnswers: 0,
        sessionHistory: []
      })
    }),
    {
      name: 'c1-examiner-progress'
    }
  )
)

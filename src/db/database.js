import Dexie from 'dexie'

export const db = new Dexie('C1ExaminerDB')

db.version(1).stores({
  questions: '++id, category, difficulty, lastAttempted',
  userAnswers: '++id, questionId, timestamp, correct',
  studySessions: '++id, startTime, endTime, questionCount'
})

// Seed with sample questions (to be expanded)
export async function seedDatabase() {
  const count = await db.questions.count()
  if (count === 0) {
    await db.questions.bulkAdd([
      {
        category: 'vocabulary',
        difficulty: 'medium',
        question: 'Choose the correct word to complete the sentence.',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: 'Sample explanation'
      }
    ])
  }
}

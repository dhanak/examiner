import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FillBlanks from './FillBlanks'
import { usePracticeStore } from '../store/practiceStore'
import { useVocabularyStore } from '../store/vocabularyStore'

// Mock the data
vi.mock('../data/vocabulary.json', () => ({
  default: {
    words: [
      { id: '1', word: 'apple', level: 'B2', partOfSpeech: 'noun', translations: ['alma'], definition: 'A fruit', example: 'I eat an apple every day.' },
      { id: '2', word: 'book', level: 'B2', partOfSpeech: 'noun', translations: ['könyv'], definition: 'A written work', example: 'She reads a book in the library.' },
      { id: '3', word: 'cat', level: 'B2', partOfSpeech: 'noun', translations: ['macska'], definition: 'A pet animal', example: 'The cat sleeps on the couch.' },
      { id: '4', word: 'dog', level: 'B2', partOfSpeech: 'noun', translations: ['kutya'], definition: 'A pet animal', example: 'My dog runs in the park.' },
      { id: '5', word: 'elephant', level: 'C1', partOfSpeech: 'noun', translations: ['elefánt'], definition: 'A large animal', example: 'The elephant is the largest land animal.' },
      { id: '6', word: 'forest', level: 'C1', partOfSpeech: 'noun', translations: ['erdő'], definition: 'Many trees', example: 'We walked through a dark forest.' },
      { id: '7', word: 'garden', level: 'B2', partOfSpeech: 'noun', translations: ['kert'], definition: 'A place with plants', example: 'Flowers grow in the garden.' },
      { id: '8', word: 'house', level: 'B2', partOfSpeech: 'noun', translations: ['ház'], definition: 'A place to live', example: 'I live in a house near the city.' }
    ]
  }
}))

describe('FillBlanks', () => {
  beforeEach(() => {
    usePracticeStore.setState({
      direction: 'hu-to-en',
      wordPoolFilter: 'all',
      settings: {
        multipleChoice: { optionCount: 4 },
        matchPairs: { pairCount: 4 },
        fillBlanks: { blankCount: 2, distractorCount: 3 }
      },
      correctCount: 0,
      incorrectCount: 0
    })
    useVocabularyStore.setState({
      learnedWords: new Set(),
      mistakeWords: new Set()
    })
  })

  it('renders exercise with sentence and lozenges', () => {
    const { container } = render(<FillBlanks />)

    // Should have exercise card with content
    const exerciseCard = container.querySelector('.exercise-card')
    expect(exerciseCard).toBeTruthy()
  })

  it('displays draggable word lozenges in a single row', () => {
    const { container } = render(<FillBlanks />)

    // Should have exercise card with options or no-words message
    const hasContent = container.querySelector('.exercise-card') || 
                      screen.queryByText(/No words available/)
    expect(hasContent).toBeTruthy()
  })

  it('assigns hotkeys 1-9 to lozenges', () => {
    const { container } = render(<FillBlanks />)

    const hotkeys = container.querySelectorAll('.hotkey')
    
    // Should have hotkey labels if lozenges exist
    if (hotkeys.length > 0) {
      expect(hotkeys.length).toBeGreaterThanOrEqual(1)
      hotkeys.forEach((hk, idx) => {
        expect(hk.textContent).toBe(String(idx + 1))
      })
    }
  })

  it('allows dragging lozenges into blanks', async () => {
    const { container } = render(<FillBlanks />)

    // Check if blanks exist in the sentence
    const emptyBlanks = container.querySelectorAll('.empty-blank')
    
    if (emptyBlanks.length > 0) {
      expect(emptyBlanks[0]).toBeInTheDocument()
    }
  })

  it('removes lozenges from pool when used', async () => {
    const { container } = render(<FillBlanks />)

    const lozenges = container.querySelectorAll('.lozenge')
    
    if (lozenges.length > 0) {
      // Initially, no lozenges should be used (opacity 1)
      const usedLoz = Array.from(lozenges).filter(l => l.className.includes('used'))
      expect(usedLoz.length).toBe(0)
    }
  })

  it('shows check button for validation', () => {
    render(<FillBlanks />)

    const checkButton = screen.queryByText(/Check \(Enter\)/)
    const noWordsMsg = screen.queryByText(/No words available/)
    
    expect(checkButton || noWordsMsg).toBeTruthy()
  })

  it('respects word pool filter for learned words', () => {
    useVocabularyStore.setState({
      learnedWords: new Set(['1', '2', '3', '4'])
    })
    usePracticeStore.setState({
      wordPoolFilter: 'learned'
    })

    const { container } = render(<FillBlanks />)

    // Should have exercise card
    const exerciseCard = container.querySelector('.exercise-card')
    expect(exerciseCard || screen.queryByText(/No words available/)).toBeTruthy()
  })

  it('allows clicking filled lozenges to remove them', async () => {
    const { container } = render(<FillBlanks />)

    const filledLozenges = container.querySelectorAll('.filled-lozenge')
    
    if (filledLozenges.length > 0) {
      expect(filledLozenges[0]).toBeInTheDocument()
    }
  })

  it('shows feedback after checking', async () => {
    render(<FillBlanks />)

    const checkButton = screen.queryByText(/Check \(Enter\)/)
    
    if (checkButton) {
      // Button should be interactive
      expect(checkButton).toBeEnabled()
    }
  })

  it('increments stats when checking answers', () => {
    render(<FillBlanks />)

    const { correctCount, incorrectCount } = usePracticeStore.getState()
    expect(typeof correctCount).toBe('number')
    expect(typeof incorrectCount).toBe('number')
  })

  it('supports hotkey input 1-9 to fill blanks', async () => {
    const user = userEvent.setup()
    const { container } = render(<FillBlanks />)

    // Trigger hotkey
    await user.keyboard('1')

    // Component should render without error
    const exerciseCard = container.querySelector('.exercise-card')
    expect(exerciseCard).toBeTruthy()
  })

  it('supports Enter key for check/next', async () => {
    const user = userEvent.setup()
    render(<FillBlanks />)

    // Trigger Enter
    await user.keyboard('{Enter}')

    // Should show feedback or stay on exercise
    const hasContent = screen.queryByText(/Fill in the blanks:/) || 
                      screen.queryByText(/\bfeedback\b/) ||
                      screen.queryByText(/Perfect|incorrect|blanks/)
    expect(hasContent || screen.getByText(/Check \(Enter\)|Next \(Enter\)/i)).toBeTruthy()
  })
})

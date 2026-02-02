import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VocabularyPractice from './VocabularyPractice'
import { useVocabularyStore } from '../store/vocabularyStore'

// Mock vocabulary data
vi.mock('../data/vocabulary.json', () => ({
  default: {
    words: [
      { id: 'word1', word: 'Test Word 1', level: 'B2', partOfSpeech: 'noun', translations: ['teszt1'], definition: 'def1', example: 'ex1' },
      { id: 'word2', word: 'Test Word 2', level: 'C1', partOfSpeech: 'verb', translations: ['teszt2'], definition: 'def2', example: 'ex2' },
      { id: 'word3', word: 'Test Word 3', level: 'B2', partOfSpeech: 'adjective', translations: ['teszt3'], definition: 'def3', example: 'ex3' },
      { id: 'word4', word: 'Test Word 4', level: 'C1', partOfSpeech: 'noun', translations: ['teszt4'], definition: 'def4', example: 'ex4' },
    ]
  }
}))

describe('VocabularyPractice Filtering', () => {
  beforeEach(() => {
    // Reset store before each test
    useVocabularyStore.setState({ 
      currentFilter: 'all',
      learnedWords: new Set()
    })
  })

  it('shows all words by default', () => {
    render(<VocabularyPractice />)
    
    // Check that "All (4)" is selected
    const allRadio = screen.getByRole('radio', { name: /All \(4\)/ })
    expect(allRadio).toBeChecked()
  })

  it('filters words by B2 level', async () => {
    const user = userEvent.setup()
    render(<VocabularyPractice />)
    
    // Click B2 filter
    const b2Radio = screen.getByRole('radio', { name: /B2 \(2\)/ })
    await user.click(b2Radio)
    
    expect(b2Radio).toBeChecked()
    
    // Progress should show 2 words
    expect(screen.getByText(/Card 1 of 2/)).toBeInTheDocument()
  })

  it('filters words by C1 level', async () => {
    const user = userEvent.setup()
    render(<VocabularyPractice />)
    
    // Click C1 filter
    const c1Radio = screen.getByRole('radio', { name: /C1 \(2\)/ })
    await user.click(c1Radio)
    
    expect(c1Radio).toBeChecked()
    
    // Progress should show 2 words
    expect(screen.getByText(/Card 1 of 2/)).toBeInTheDocument()
  })

  it('filters by learned status', async () => {
    const user = userEvent.setup()
    
    // Mark word1 as learned
    useVocabularyStore.setState({ 
      learnedWords: new Set(['word1'])
    })
    
    render(<VocabularyPractice />)
    
    // Click "Learned" filter
    const learnedRadio = screen.getByRole('radio', { name: /Learned \(1\)/ })
    await user.click(learnedRadio)
    
    expect(learnedRadio).toBeChecked()
    
    // Should show only 1 word
    expect(screen.getByText(/Card 1 of 1/)).toBeInTheDocument()
  })

  it('filters by unlearned status', async () => {
    const user = userEvent.setup()
    
    // Mark word1 as learned
    useVocabularyStore.setState({ 
      learnedWords: new Set(['word1'])
    })
    
    render(<VocabularyPractice />)
    
    // Click "Not Learned" filter
    const unlearnedRadio = screen.getByRole('radio', { name: /Not Learned \(3\)/ })
    await user.click(unlearnedRadio)
    
    expect(unlearnedRadio).toBeChecked()
    
    // Should show 3 unlearned words
    expect(screen.getByText(/Card 1 of 3/)).toBeInTheDocument()
  })

  it('combines level and status filters', async () => {
    const user = userEvent.setup()
    
    // Mark word1 (B2) and word2 (C1) as learned
    useVocabularyStore.setState({ 
      learnedWords: new Set(['word1', 'word2'])
    })
    
    render(<VocabularyPractice />)
    
    // Filter by C1 level
    const c1Radio = screen.getByRole('radio', { name: /C1 \(2\)/ })
    await user.click(c1Radio)
    
    // Filter by Learned - need to be specific to avoid matching the stats label
    const statusSection = screen.getByText('Status').closest('.filter-group')
    const learnedRadio = statusSection.querySelector('input[value="learned"]')
    await user.click(learnedRadio)
    
    // Should show only 1 word (C1 AND learned = word2)
    expect(screen.getByText(/Card 1 of 1/)).toBeInTheDocument()
  })

  it('clears all filters when Clear button is clicked', async () => {
    const user = userEvent.setup()
    
    // Mark a word as learned
    useVocabularyStore.setState({ 
      learnedWords: new Set(['word1']),
      currentFilter: 'C1'
    })
    
    render(<VocabularyPractice />)
    
    // Click Clear All Filters
    const clearButton = screen.getByRole('button', { name: /Clear All Filters/i })
    await user.click(clearButton)
    
    // Should reset to all filters
    const allLevelRadio = screen.getByRole('radio', { name: /All \(4\)/ })
    const allStatusRadio = screen.getByRole('radio', { name: /^All$/ })
    
    expect(allLevelRadio).toBeChecked()
    expect(allStatusRadio).toBeChecked()
    
    // Should show all 4 words
    expect(screen.getByText(/Card 1 of 4/)).toBeInTheDocument()
  })

  it('disables Clear button when no filters are active', () => {
    render(<VocabularyPractice />)
    
    const clearButton = screen.getByRole('button', { name: /Clear All Filters/i })
    expect(clearButton).toBeDisabled()
  })

  it('enables Clear button when filters are active', async () => {
    const user = userEvent.setup()
    render(<VocabularyPractice />)
    
    const clearButton = screen.getByRole('button', { name: /Clear All Filters/i })
    expect(clearButton).toBeDisabled()
    
    // Apply a filter
    const c1Radio = screen.getByRole('radio', { name: /C1 \(2\)/ })
    await user.click(c1Radio)
    
    expect(clearButton).toBeEnabled()
  })
})

describe('VocabularyPractice Shuffling', () => {
  beforeEach(() => {
    useVocabularyStore.setState({ 
      currentFilter: 'all',
      learnedWords: new Set()
    })
  })

  it('shows Shuffle button by default', () => {
    render(<VocabularyPractice />)
    
    expect(screen.getByRole('button', { name: /🔀 Shuffle/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /↺ Reset Order/i })).not.toBeInTheDocument()
  })

  it('switches to Reset Order button after shuffling', async () => {
    const user = userEvent.setup()
    render(<VocabularyPractice />)
    
    const shuffleButton = screen.getByRole('button', { name: /🔀 Shuffle/i })
    await user.click(shuffleButton)
    
    // Should now show Reset Order button
    expect(screen.queryByRole('button', { name: /🔀 Shuffle/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /↺ Reset Order/i })).toBeInTheDocument()
  })

  it('resets to original order when Reset Order is clicked', async () => {
    const user = userEvent.setup()
    render(<VocabularyPractice />)
    
    // Shuffle
    const shuffleButton = screen.getByRole('button', { name: /🔀 Shuffle/i })
    await user.click(shuffleButton)
    
    // Reset
    const resetButton = screen.getByRole('button', { name: /↺ Reset Order/i })
    await user.click(resetButton)
    
    // Should show Shuffle button again
    expect(screen.getByRole('button', { name: /🔀 Shuffle/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /↺ Reset Order/i })).not.toBeInTheDocument()
  })

  it('maintains shuffle mode when filters change', async () => {
    const user = userEvent.setup()
    render(<VocabularyPractice />)
    
    // Shuffle
    const shuffleButton = screen.getByRole('button', { name: /🔀 Shuffle/i })
    await user.click(shuffleButton)
    
    // Change filter
    const c1Radio = screen.getByRole('radio', { name: /C1 \(2\)/ })
    await user.click(c1Radio)
    
    // Should still be in shuffle mode (showing Reset Order button)
    expect(screen.getByRole('button', { name: /↺ Reset Order/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /🔀 Shuffle/i })).not.toBeInTheDocument()
  })

  it('shows correct card count after filtering in shuffle mode', async () => {
    const user = userEvent.setup()
    render(<VocabularyPractice />)
    
    // Start with all 4 words
    expect(screen.getByText(/Card 1 of 4/)).toBeInTheDocument()
    
    // Shuffle
    const shuffleButton = screen.getByRole('button', { name: /🔀 Shuffle/i })
    await user.click(shuffleButton)
    
    // Filter to C1 (2 words)
    const c1Radio = screen.getByRole('radio', { name: /C1 \(2\)/ })
    await user.click(c1Radio)
    
    // Should show 2 words
    expect(screen.getByText(/Card 1 of 2/)).toBeInTheDocument()
  })
})

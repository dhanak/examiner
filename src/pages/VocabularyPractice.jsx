import { useState, useMemo } from 'react'
import FlipCardDeck from '../components/FlipCardDeck'
import { useVocabularyStore } from '../store/vocabularyStore'
import vocabularyData from '../data/vocabulary.json'
import './VocabularyPractice.css'

export default function VocabularyPractice() {
  const { currentFilter, setFilter, learnedWords, getLearnedCount } = useVocabularyStore()
  const [currentProgress, setCurrentProgress] = useState({ current: 1, total: 0 })

  const filteredWords = useMemo(() => {
    let filtered = vocabularyData.words

    // Filter by level
    if (currentFilter !== 'all') {
      filtered = filtered.filter(word => word.level === currentFilter)
    }

    return filtered
  }, [currentFilter])

  const handleFilterChange = (filter) => {
    setFilter(filter)
  }

  const handleProgress = (progress) => {
    setCurrentProgress(progress)
  }

  const learnedPercentage = filteredWords.length > 0
    ? Math.round((getLearnedCount() / vocabularyData.words.length) * 100)
    : 0

  return (
    <div className="vocabulary-practice">
      <div className="practice-header">
        <h2>Vocabulary Practice</h2>
        <p className="practice-description">
          Study C1-level English vocabulary with Hungarian translations. 
          Click cards to flip and see definitions and examples.
        </p>
      </div>

      <div className="practice-stats">
        <div className="stat-item">
          <span className="stat-label">Total Words:</span>
          <span className="stat-value">{vocabularyData.words.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Learned:</span>
          <span className="stat-value">{getLearnedCount()} ({learnedPercentage}%)</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Current Deck:</span>
          <span className="stat-value">{filteredWords.length} words</span>
        </div>
      </div>

      <div className="filter-controls">
        <label htmlFor="level-filter">Filter by level:</label>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${currentFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All ({vocabularyData.words.length})
          </button>
          <button
            className={`filter-btn ${currentFilter === 'B2' ? 'active' : ''}`}
            onClick={() => handleFilterChange('B2')}
          >
            B2 ({vocabularyData.words.filter(w => w.level === 'B2').length})
          </button>
          <button
            className={`filter-btn ${currentFilter === 'C1' ? 'active' : ''}`}
            onClick={() => handleFilterChange('C1')}
          >
            C1 ({vocabularyData.words.filter(w => w.level === 'C1').length})
          </button>
        </div>
      </div>

      {filteredWords.length > 0 ? (
        <FlipCardDeck 
          words={filteredWords} 
          onProgress={handleProgress}
        />
      ) : (
        <div className="no-results">
          <p>No words found for the selected filter.</p>
        </div>
      )}
    </div>
  )
}

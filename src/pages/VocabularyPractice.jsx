import { useState, useMemo, useCallback } from 'react'
import FlipCardDeck from '../components/FlipCardDeck'
import { useVocabularyStore } from '../store/vocabularyStore'
import vocabularyData from '../data/vocabulary.json'
import './VocabularyPractice.css'

export default function VocabularyPractice() {
  const { currentFilter, setFilter, getLearnedCount } = useVocabularyStore()
  const [currentProgress, setCurrentProgress] = useState({ current: 1, total: 0 })
  const [shuffleKey, setShuffleKey] = useState(0) // Increment to trigger shuffle
  const [cachedShuffled, setCachedShuffled] = useState([])

  const filteredWords = useMemo(() => {
    let filtered = vocabularyData.words

    // Filter by level
    if (currentFilter !== 'all') {
      filtered = filtered.filter(word => word.level === currentFilter)
    }

    return filtered
  }, [currentFilter])

  const learnedCount = getLearnedCount()

  // Derive display words
  const displayWords = useMemo(() => {
    if (shuffleKey === 0) {
      // Not shuffled
      return filteredWords
    }
    
    // Return cached shuffled
    return cachedShuffled
  }, [filteredWords, shuffleKey, cachedShuffled])

  const handleFilterChange = (filter) => {
    setFilter(filter)
  }

  const handleProgress = useCallback((progress) => {
    setCurrentProgress(progress)
  }, [])

  const handleShuffle = () => {
    const shuffled = [...filteredWords].sort(() => Math.random() - 0.5)
    setCachedShuffled(shuffled)
    setShuffleKey(prev => prev + 1)
  }

  const handleReset = () => {
    setShuffleKey(0)
    setCachedShuffled([])
  }

  const isShuffled = shuffleKey > 0
  const words = displayWords

  return (
    <div className="vocabulary-practice">
      <div className="practice-sidebar">
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

      <div className="progress-section">
        <div className="learned-stats">
          <div className="stat-item">
            <span className="stat-label">Total words:</span>
            <span className="stat-value">{vocabularyData.words.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Learned:</span>
            <span className="stat-value learned">{learnedCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Progress:</span>
            <span className="stat-value">{Math.round((learnedCount / vocabularyData.words.length) * 100)}%</span>
          </div>
        </div>

        <div className="progress-info">
          <span className="progress-text">
            Card {currentProgress.current} of {currentProgress.total || words.length}
          </span>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${((currentProgress.current) / (currentProgress.total || words.length)) * 100}%` }}
            />
          </div>
        </div>

        <div className="shuffle-controls">
          {!isShuffled ? (
            <button 
              onClick={handleShuffle} 
              className="btn btn-secondary btn-shuffle"
            >
              🔀 Shuffle
            </button>
          ) : (
            <button 
              onClick={handleReset} 
              className="btn btn-secondary btn-shuffle"
            >
              ↺ Reset Order
            </button>
          )}
        </div>
      </div>
    </div>

    <div className="practice-content">
        {words.length > 0 ? (
          <FlipCardDeck 
            words={words} 
            onProgress={handleProgress}
          />
        ) : (
          <div className="no-results">
            <p>No words found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}

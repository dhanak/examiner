import { useState, useMemo, useCallback } from 'react'
import FlipCardDeck from '../components/FlipCardDeck'
import { useVocabularyStore } from '../store/vocabularyStore'
import vocabularyData from '../data/vocabulary.json'
import './VocabularyPractice.css'

export default function VocabularyPractice() {
  const { currentFilter, setFilter, getLearnedCount, isLearned } = useVocabularyStore()
  const [currentProgress, setCurrentProgress] = useState({ current: 1, total: 0 })
  const [shuffleKey, setShuffleKey] = useState(0) // Increment to trigger shuffle
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'learned', 'unlearned'

  const filteredWords = useMemo(() => {
    let filtered = vocabularyData.words

    // Filter by level
    if (currentFilter !== 'all') {
      filtered = filtered.filter(word => word.level === currentFilter)
    }

    // Filter by status
    if (statusFilter === 'learned') {
      filtered = filtered.filter(word => isLearned(word.id))
    } else if (statusFilter === 'unlearned') {
      filtered = filtered.filter(word => !isLearned(word.id))
    }

    return filtered
  }, [currentFilter, statusFilter, isLearned])

  const learnedCount = getLearnedCount()

  // Derive display words - reshuffle when filters change in shuffle mode
  const displayWords = useMemo(() => {
    if (shuffleKey === 0) {
      // Not shuffled
      return filteredWords
    }
    
    // In shuffle mode - shuffle the current filtered words
    // Use shuffleKey as seed to get different shuffle on each shuffle click
    const seed = shuffleKey * 9999
    const shuffled = [...filteredWords].sort((a, b) => {
      const hash = (str) => {
        let h = 0
        for (let i = 0; i < str.length; i++) {
          h = ((h << 5) - h) + str.charCodeAt(i)
          h = h & h
        }
        return h
      }
      return (hash(a.id + seed) - hash(b.id + seed))
    })
    return shuffled
  }, [filteredWords, shuffleKey])

  const handleFilterChange = (filter) => {
    setFilter(filter)
  }

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status)
  }

  const handleClearFilters = () => {
    setFilter('all')
    setStatusFilter('all')
  }

  const handleProgress = useCallback((progress) => {
    setCurrentProgress(progress)
  }, [])

  const handleShuffle = () => {
    // Generate a new random seed for each shuffle
    setShuffleKey(Math.floor(Math.random() * 1000000))
  }

  const handleReset = () => {
    setShuffleKey(0)
  }

  const isShuffled = shuffleKey > 0
  const words = displayWords

  return (
    <div className="vocabulary-practice">
      <div className="practice-sidebar">
        <div className="filter-controls">
          <button 
            onClick={handleClearFilters} 
            className="btn-clear-filters"
            disabled={currentFilter === 'all' && statusFilter === 'all'}
          >
            Clear All Filters
          </button>

          <div className="filter-group">
            <h3 className="filter-group-title">Level</h3>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="level"
                  value="all"
                  checked={currentFilter === 'all'}
                  onChange={() => handleFilterChange('all')}
                />
                <span>All ({vocabularyData.words.length})</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="level"
                  value="B2"
                  checked={currentFilter === 'B2'}
                  onChange={() => handleFilterChange('B2')}
                />
                <span>B2 ({vocabularyData.words.filter(w => w.level === 'B2').length})</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="level"
                  value="C1"
                  checked={currentFilter === 'C1'}
                  onChange={() => handleFilterChange('C1')}
                />
                <span>C1 ({vocabularyData.words.filter(w => w.level === 'C1').length})</span>
              </label>
            </div>
          </div>

          <div className="filter-group">
            <h3 className="filter-group-title">Status</h3>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="status"
                  value="all"
                  checked={statusFilter === 'all'}
                  onChange={() => handleStatusFilterChange('all')}
                />
                <span>All</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="status"
                  value="learned"
                  checked={statusFilter === 'learned'}
                  onChange={() => handleStatusFilterChange('learned')}
                />
                <span>Learned ({learnedCount})</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="status"
                  value="unlearned"
                  checked={statusFilter === 'unlearned'}
                  onChange={() => handleStatusFilterChange('unlearned')}
                />
                <span>Not Learned ({vocabularyData.words.length - learnedCount})</span>
              </label>
            </div>
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

import { useState, useMemo } from 'react'
import FlipCardDeck from '../components/FlipCardDeck'
import { useVocabularyStore } from '../store/vocabularyStore'
import vocabularyData from '../data/vocabulary.json'
import './VocabularyPractice.css'

export default function VocabularyPractice() {
  const { currentFilter, setFilter, learnedWords, getLearnedCount } = useVocabularyStore()
  const [currentProgress, setCurrentProgress] = useState({ current: 1, total: 0 })
  const [isShuffled, setIsShuffled] = useState(false)
  const [shuffledWords, setShuffledWords] = useState([])

  const filteredWords = useMemo(() => {
    let filtered = vocabularyData.words

    // Filter by level
    if (currentFilter !== 'all') {
      filtered = filtered.filter(word => word.level === currentFilter)
    }

    return filtered
  }, [currentFilter])

  // Reset shuffle when filter changes
  useMemo(() => {
    setShuffledWords(filteredWords)
    setIsShuffled(false)
  }, [filteredWords])

  const handleFilterChange = (filter) => {
    setFilter(filter)
  }

  const handleProgress = (progress) => {
    setCurrentProgress(progress)
  }

  const handleShuffle = () => {
    const shuffled = [...filteredWords].sort(() => Math.random() - 0.5)
    setShuffledWords(shuffled)
    setIsShuffled(true)
  }

  const handleReset = () => {
    setShuffledWords(filteredWords)
    setIsShuffled(false)
  }

  const displayWords = isShuffled ? shuffledWords : filteredWords

  const learnedPercentage = filteredWords.length > 0
    ? Math.round((getLearnedCount() / vocabularyData.words.length) * 100)
    : 0

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
        <div className="progress-info">
          <span className="progress-text">
            Card {currentProgress.current} of {currentProgress.total || displayWords.length}
          </span>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${((currentProgress.current) / (currentProgress.total || displayWords.length)) * 100}%` }}
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
        {displayWords.length > 0 ? (
          <FlipCardDeck 
            words={displayWords} 
            onProgress={handleProgress}
            isShuffled={isShuffled}
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

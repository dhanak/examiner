import { useState, useEffect } from 'react'
import FlipCard from './FlipCard'
import './FlipCardDeck.css'

export default function FlipCardDeck({ words, onProgress }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [shuffledWords, setShuffledWords] = useState([])
  const [isShuffled, setIsShuffled] = useState(false)

  useEffect(() => {
    setShuffledWords(words)
  }, [words])

  const shuffle = () => {
    const shuffled = [...words].sort(() => Math.random() - 0.5)
    setShuffledWords(shuffled)
    setCurrentIndex(0)
    setIsShuffled(true)
  }

  const reset = () => {
    setShuffledWords(words)
    setCurrentIndex(0)
    setIsShuffled(false)
  }

  const handleNext = () => {
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      handleNext()
    } else if (e.key === 'ArrowLeft') {
      handlePrevious()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, shuffledWords.length])

  useEffect(() => {
    if (onProgress) {
      onProgress({
        current: currentIndex + 1,
        total: shuffledWords.length
      })
    }
  }, [currentIndex, shuffledWords.length, onProgress])

  if (!shuffledWords.length) {
    return <div className="no-words">No vocabulary words available.</div>
  }

  const currentWord = shuffledWords[currentIndex]

  return (
    <div className="flip-card-deck">
      <div className="deck-controls">
        <div className="progress-info">
          <span className="progress-text">
            Card {currentIndex + 1} of {shuffledWords.length}
          </span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentIndex + 1) / shuffledWords.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="shuffle-controls">
          <button 
            onClick={shuffle} 
            className="btn btn-secondary"
            disabled={isShuffled}
          >
            🔀 Shuffle
          </button>
          {isShuffled && (
            <button 
              onClick={reset} 
              className="btn btn-secondary"
            >
              ↺ Reset Order
            </button>
          )}
        </div>
      </div>

      <div className="card-container">
        <FlipCard
          key={currentWord.id}
          word={currentWord.word}
          level={currentWord.level}
          partOfSpeech={currentWord.partOfSpeech}
          translations={currentWord.translations}
          definition={currentWord.definition}
          example={currentWord.example}
        />
      </div>

      <div className="navigation-controls">
        <button 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="btn btn-primary"
          aria-label="Previous card"
        >
          ← Previous
        </button>
        
        <span className="keyboard-hint">Use ← → arrow keys</span>
        
        <button 
          onClick={handleNext}
          disabled={currentIndex === shuffledWords.length - 1}
          className="btn btn-primary"
          aria-label="Next card"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

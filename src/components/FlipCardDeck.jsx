import { useState, useEffect } from 'react'
import FlipCard from './FlipCard'
import './FlipCardDeck.css'

export default function FlipCardDeck({ words, onProgress, onShuffle, onReset, isShuffled }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayWords, setDisplayWords] = useState([])

  useEffect(() => {
    setDisplayWords(words)
    setCurrentIndex(0)
  }, [words])

  const handleNext = () => {
    if (currentIndex < displayWords.length - 1) {
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
  }, [currentIndex, displayWords.length])

  useEffect(() => {
    if (onProgress) {
      onProgress({
        current: currentIndex + 1,
        total: displayWords.length
      })
    }
  }, [currentIndex, displayWords.length, onProgress])

  if (!displayWords.length) {
    return <div className="no-words">No vocabulary words available.</div>
  }

  const currentWord = displayWords[currentIndex]

  return (
    <div className="flip-card-deck">
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
          className="btn btn-primary btn-nav"
          aria-label="Previous card"
        >
          ← Previous
        </button>
        
        <span className="keyboard-hint">Use ← → arrow keys</span>
        
        <button 
          onClick={handleNext}
          disabled={currentIndex === displayWords.length - 1}
          className="btn btn-primary btn-nav"
          aria-label="Next card"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

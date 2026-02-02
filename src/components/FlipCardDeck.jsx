import { useState, useEffect } from 'react'
import FlipCard from './FlipCard'
import './FlipCardDeck.css'

export default function FlipCardDeck({ words, onProgress }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Reset index when words change
  const [prevWords, setPrevWords] = useState(words)
  if (words !== prevWords) {
    setPrevWords(words)
    setCurrentIndex(0)
  }

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => {
          if (prev < words.length - 1) {
            return prev + 1
          }
          return prev
        })
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => {
          if (prev > 0) {
            return prev - 1
          }
          return prev
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [words.length]) // Only depend on length, use functional updates for index

  useEffect(() => {
    if (onProgress) {
      onProgress({
        current: currentIndex + 1,
        total: words.length
      })
    }
  }, [currentIndex, words.length, onProgress])

  if (!words.length) {
    return <div className="no-words">No vocabulary words available.</div>
  }

  const currentWord = words[currentIndex]

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
          disabled={currentIndex === words.length - 1}
          className="btn btn-primary btn-nav"
          aria-label="Next card"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

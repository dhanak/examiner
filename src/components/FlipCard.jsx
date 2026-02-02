import { useState, useEffect } from 'react'
import { useVocabularyStore } from '../store/vocabularyStore'
import './FlipCard.css'

export default function FlipCard({ wordId, word, level, partOfSpeech, translations, definition, example }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const { isLearned, markAsLearned, unmarkAsLearned } = useVocabularyStore()
  const learned = isLearned(wordId)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleToggleLearned = (e) => {
    e.stopPropagation() // Prevent card flip
    if (learned) {
      unmarkAsLearned(wordId)
    } else {
      markAsLearned(wordId)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        setIsFlipped(prev => !prev)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (learned) {
          unmarkAsLearned(wordId)
        } else {
          markAsLearned(wordId)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [learned, wordId, markAsLearned, unmarkAsLearned]) // Include dependencies for Enter key handler

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleFlip()
    }
  }

  return (
    <div 
      className={`flip-card ${isFlipped ? 'flipped' : ''} ${learned ? 'learned' : ''}`}
      onClick={handleFlip}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`Flashcard for word: ${word}. ${isFlipped ? 'Showing translation' : 'Showing word'}. ${learned ? 'Marked as learned' : 'Not learned yet'}`}
    >
      <div className="flip-card-inner">
        {/* Front Side */}
        <div className="flip-card-front">
          <div className="level-badge">{level}</div>
          <button
            className={`learned-toggle ${learned ? 'is-learned' : ''}`}
            onClick={handleToggleLearned}
            aria-label={learned ? 'Mark as not learned' : 'Mark as learned'}
            title={learned ? 'Mark as not learned' : 'Mark as learned'}
          >
            {learned ? '✓' : '○'}
          </button>
          <div className="word-container">
            <h2 className="word">{word}</h2>
          </div>
          <div className="flip-hint">Click or press Space to flip • Press Enter to mark as learned</div>
        </div>

        {/* Back Side */}
        <div className="flip-card-back">
          <div className="level-badge">{level}</div>
          <button
            className={`learned-toggle ${learned ? 'is-learned' : ''}`}
            onClick={handleToggleLearned}
            aria-label={learned ? 'Mark as not learned' : 'Mark as learned'}
            title={learned ? 'Mark as not learned' : 'Mark as learned'}
          >
            {learned ? '✓' : '○'}
          </button>
          <div className="back-content">
            <div className="word-header">
              <h3 className="word-title">{word}</h3>
              <span className="part-of-speech">{partOfSpeech}</span>
            </div>
            
            <div className="translations">
              <strong>Magyar:</strong> {translations.join(', ')}
            </div>
            
            {definition && (
              <div className="definition">
                <strong>Definition:</strong> {definition}
              </div>
            )}
            
            {example && (
              <div className="example">
                <strong>Example:</strong> "{example}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

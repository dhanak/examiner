import { useState } from 'react'
import './FlipCard.css'

export default function FlipCard({ word, level, partOfSpeech, translations, definition, example }) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleFlip()
    }
  }

  return (
    <div 
      className={`flip-card ${isFlipped ? 'flipped' : ''}`}
      onClick={handleFlip}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`Flashcard for word: ${word}. ${isFlipped ? 'Showing translation' : 'Showing word'}`}
    >
      <div className="flip-card-inner">
        {/* Front Side */}
        <div className="flip-card-front">
          <div className="level-badge">{level}</div>
          <div className="word-container">
            <h2 className="word">{word}</h2>
          </div>
          <div className="flip-hint">Click to flip</div>
        </div>

        {/* Back Side */}
        <div className="flip-card-back">
          <div className="level-badge">{level}</div>
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

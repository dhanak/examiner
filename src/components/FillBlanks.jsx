import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { usePracticeStore } from '../store/practiceStore'
import { useVocabularyStore } from '../store/vocabularyStore'
import { shuffleArray } from '../utils/practiceUtils'
import vocabularyData from '../data/vocabulary.json'
import './FillBlanks.css'
import SpeakerIcon from './SpeakerIcon'

export default function FillBlanks() {
  const {
    wordPoolFilter,
    levelFilter,
    settings,
    incrementCorrect,
    incrementIncorrect
  } = usePracticeStore()

  const {
    learnedWords,
    mistakeWords,
    markAsMistake,
    clearMistake
  } = useVocabularyStore()

  const blankCount = settings.fillBlanks.blankCount
  const distractorCount = settings.fillBlanks.distractorCount

  // Filter words based on word pool filter and ensure they have examples
  const filteredWords = useMemo(() => {
    let words = vocabularyData.words.filter(w => w.example && w.example.trim().length > 0)

    if (wordPoolFilter === 'learned') {
      words = words.filter(w => learnedWords.has(w.id))
    } else if (wordPoolFilter === 'mistakes') {
      words = words.filter(w => mistakeWords.has(w.id))
    }

    // Apply level filter
    if (levelFilter !== 'all') {
      words = words.filter(w => w.level === levelFilter)
    }

    return words
  }, [wordPoolFilter, levelFilter, learnedWords, mistakeWords])

  // State for current exercise
  const [word, setWord] = useState(null)
  const [sentence, setSentence] = useState('')
  const [blanks, setBlanks] = useState([]) // Array of {id, wordIdx, correctWord, wordData}
  const [options, setOptions] = useState([]) // Array of {id, word, isCorrect}
  const [filledBlanks, setFilledBlanks] = useState({}) // {blankId: wordId}
  const [draggedLozenge, setDraggedLozenge] = useState(null) // Track dragged word
  const [feedback, setFeedback] = useState(null) // {type, message}
  const [showingAnswers, setShowingAnswers] = useState(false) // Showing correct answers (disables lozenges)
  const [hoveredBlankId, setHoveredBlankId] = useState(null) // Track hovered correct answer in sentence
  const [touchTarget, setTouchTarget] = useState(null) // Track touch target receptacle

  const hasInitializedRef = useRef(false)

  // Generate an exercise by picking a random word and creating blanks
  const generateExercise = useCallback(() => {
    if (filteredWords.length === 0) return null

    // Pick a random word
    const selectedWord = filteredWords[Math.floor(Math.random() * filteredWords.length)]
    const example = selectedWord.example
    const words = example.split(/\s+/)

    // Find the index of the selected word in the sentence to ensure it's always a blank
    const selectedWordIndex = words.findIndex(w =>
      w.toLowerCase().replace(/[^a-z]/g, '') === selectedWord.word.toLowerCase()
    )

    // Create blanks: ensure selectedWord is always one of them
    const availableIndices = words.map((_, idx) => idx)
    const numBlanks = Math.min(blankCount, availableIndices.length)
    
    // Start with the selected word's index
    let blankIndices = selectedWordIndex >= 0 ? [selectedWordIndex] : []
    
    // Add additional random indices to reach numBlanks
    if (numBlanks > blankIndices.length) {
      const remainingIndices = availableIndices.filter(idx => !blankIndices.includes(idx))
      const additionalIndices = shuffleArray(remainingIndices).slice(0, numBlanks - blankIndices.length)
      blankIndices = blankIndices.concat(additionalIndices)
    }
    
    // Shuffle the final indices for visual variety
    blankIndices = shuffleArray(blankIndices)

    // Build blanks array with correct words and their vocabulary data
    const newBlanks = blankIndices.map((idx) => {
      const correctWord = words[idx].toLowerCase().replace(/[^a-z]/g, '')
      const wordData = vocabularyData.words.find(w => w.word.toLowerCase() === correctWord)
      return {
        id: `blank-${idx}`,
        wordIdx: idx,
        correctWord,
        wordData // Store full word object for tooltip display
      }
    })

    // Get distractor words (exclude correct words and duplicates)
    const correctWords = new Set(newBlanks.map(b => b.correctWord.toLowerCase()))
    let distractors = []
    for (const w of filteredWords) {
      const wLower = w.word.toLowerCase()
      if (!correctWords.has(wLower)) {
        distractors.push(w)
      }
      if (distractors.length >= distractorCount) break
    }

    // Create options: correct words + distractors, with correct flag
    const correctWordsList = newBlanks.map(b => b.correctWord)
    const optionsList = [
      ...correctWordsList.map(w => ({ id: `opt-${w}`, word: w, isCorrect: true })),
      ...distractors.slice(0, distractorCount).map((w, i) => ({ id: `dist-${i}`, word: w.word.toLowerCase(), isCorrect: false }))
    ]

    return {
      word: selectedWord,
      sentence: example,
      blanks: newBlanks,
      options: shuffleArray(optionsList)
    }
  }, [filteredWords, blankCount, distractorCount])

  // Initialize exercise on mount
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      const exercise = generateExercise()
      if (exercise) {
        setWord(exercise.word)
        setSentence(exercise.sentence)
        setBlanks(exercise.blanks)
        setOptions(exercise.options)
        setFilledBlanks({})
        setFeedback(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Regenerate when blankCount or distractorCount changes
  useEffect(() => {
    const exercise = generateExercise()
    if (exercise) {
      setWord(exercise.word)
      setSentence(exercise.sentence)
      setBlanks(exercise.blanks)
      setOptions(exercise.options)
      setFilledBlanks({})
      setFeedback(null)
      setShowingAnswers(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blankCount, distractorCount])

  // Clear error feedback when user modifies filled blanks (try again)
  useEffect(() => {
    if (feedback?.type === 'incorrect') {
      setFeedback(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filledBlanks])

  const handleCheck = useCallback(() => {
    if (!word || blanks.length === 0) return

    // Check if all blanks are filled
    const unfilled = blanks.filter(b => !filledBlanks[b.id])
    if (unfilled.length > 0) {
      // Don't set feedback, just return (button will be disabled)
      return
    }

    // Check each blank
    let allCorrect = true
    for (const blank of blanks) {
      const filledWordId = filledBlanks[blank.id]
      const filledOption = options.find(o => o.id === filledWordId)
      if (!filledOption || !filledOption.isCorrect) {
        allCorrect = false
        break
      }
    }

    if (allCorrect) {
      if (word) {
        incrementCorrect()
        clearMistake(word.id)
      }
      setFeedback({ type: 'correct', message: '✓ Perfect! All answers are correct.' })
    } else {
      if (word) {
        incrementIncorrect()
        markAsMistake(word.id)
      }
      setFeedback({ type: 'incorrect', message: '✗ Some answers are incorrect. Try again or move to the next sentence.' })
    }
  }, [word, blanks, filledBlanks, options, incrementCorrect, incrementIncorrect, markAsMistake, clearMistake])

  const handleNext = useCallback(() => {
    const exercise = generateExercise()
    if (exercise) {
      setWord(exercise.word)
      setSentence(exercise.sentence)
      setBlanks(exercise.blanks)
      setOptions(exercise.options)
      setFilledBlanks({})
      setFeedback(null)
      setShowingAnswers(false)
    }
  }, [generateExercise])

  const handleShowAnswers = useCallback(() => {
    // Clear filled blanks, disable lozenges, show correct answers
    setFilledBlanks({})
    setShowingAnswers(true)
    setFeedback(null)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // S for Show Answers (when incorrect)
      if (e.key.toLowerCase() === 's' && feedback?.type === 'incorrect') {
        e.preventDefault()
        handleShowAnswers()
        return
      }

      // Enter for Check/Next
      if (e.key === 'Enter') {
        e.preventDefault()
        // Check: only if no feedback and not showing answers
        if (feedback === null && !showingAnswers) {
          const allFilled = blanks.every(b => filledBlanks[b.id])
          if (allFilled) {
            handleCheck()
          }
        } else if (feedback?.type === 'incorrect' || feedback?.type === 'correct' || showingAnswers) {
          // Next: when incorrect, correct, or showing answers
          handleNext()
        }
        return
      }

      // Don't allow hotkeys when showing answers
      if (showingAnswers) return

      // Hotkeys 1-9 for selecting lozenges or removing filled ones
      const keyNum = parseInt(e.key, 10)
      if (keyNum >= 1 && keyNum <= 9) {
        const optionIdx = keyNum - 1
        if (optionIdx < options.length) {
          const selectedOption = options[optionIdx]

          // Check if this option is already filled in a blank
          const filledBlankId = Object.keys(filledBlanks).find(
            bId => filledBlanks[bId] === selectedOption.id
          )

          if (filledBlankId) {
            // Remove it from the blank
            setFilledBlanks(prev => {
              const updated = { ...prev }
              delete updated[filledBlankId]
              return updated
            })
          } else {
            // Find first empty blank in left-to-right order
            const sortedBlanks = [...blanks].sort((a, b) => a.wordIdx - b.wordIdx)
            const emptyBlank = sortedBlanks.find(b => !filledBlanks[b.id])
            if (emptyBlank) {
              setFilledBlanks(prev => ({
                ...prev,
                [emptyBlank.id]: selectedOption.id
              }))
            }
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [feedback, handleCheck, handleNext, handleShowAnswers, blanks, filledBlanks, options, showingAnswers])

  if (filteredWords.length === 0) {
    return (
      <div className="fill-blanks">
        <div className="no-words-message">
          <p>No words available with examples for this exercise.</p>
          <p>Try changing the word pool filter or add more words to your collection.</p>
        </div>
      </div>
    )
  }

  if (!word) {
    return <div className="fill-blanks">Loading...</div>
  }

  // Build the sentence with blanks as interactive elements
  const sentenceWords = sentence.split(/\s+/)
  const sentenceElements = sentenceWords.map((w, idx) => {
    const blank = blanks.find(b => b.wordIdx === idx)
    if (blank) {
      const filledOptionId = filledBlanks[blank.id]
      const filledOption = filledOptionId ? options.find(o => o.id === filledOptionId) : null
      // Find the hotkey for this option
      const hotkeyNumber = filledOption ? options.findIndex(o => o.id === filledOption.id) + 1 : null

      // Show correct answer if showingAnswers is true
      const shouldShowCorrect = showingAnswers
      const correctWord = shouldShowCorrect ? blank.correctWord : null
      const isHovered = hoveredBlankId === blank.id
      const showTooltip = shouldShowCorrect && isHovered && blank.wordData

      return (
        <span key={idx} className="blank-slot">
          {filledOption ? (
            <span
              className="receptacle-lozenge filled"
              data-blank-id={blank.id}
              onClick={() => {
                if (!showingAnswers) {
                  setFilledBlanks(prev => {
                    const updated = { ...prev }
                    delete updated[blank.id]
                    return updated
                  })
                }
              }}
              title={showingAnswers ? '' : 'Click to remove'}
            >
              {hotkeyNumber && hotkeyNumber <= 9 && <span className="hotkey">{hotkeyNumber}</span>}
              <span className="word-text">{filledOption.word}</span>
            </span>
          ) : shouldShowCorrect ? (
            <span 
              className="receptacle-lozenge correct-answer"
              data-blank-id={blank.id}
              onMouseEnter={() => setHoveredBlankId(blank.id)}
              onMouseLeave={() => setHoveredBlankId(null)}
              style={{ position: 'relative' }}
            >
              <span className="word-text">{correctWord}</span>
              {/* Tooltip for correct answer */}
              {showTooltip && (
                <div className="word-tooltip">
                  <div className="tooltip-header">
                    <div className="tooltip-word">{blank.wordData.word}</div>
                    <div className="tooltip-meta">
                      <span className="tooltip-level">{blank.wordData.level}</span>
                      <span className="tooltip-pos">{blank.wordData.partOfSpeech}</span>
                    </div>
                  </div>
                  
                  <div className="tooltip-translations">
                    <strong>Magyar:</strong> {blank.wordData.translations && blank.wordData.translations.join(', ')}
                  </div>
                  
                  {blank.wordData.definition && (
                    <div className="tooltip-definition">
                      <strong>Definition:</strong> {blank.wordData.definition}
                    </div>
                  )}
                  
                  {blank.wordData.example && (
                    <div className="tooltip-example">
                      <strong>Example:</strong> {blank.wordData.example}
                    </div>
                  )}
                </div>
              )}
            </span>
          ) : (
            <span
              className="receptacle-lozenge empty"
              data-blank-id={blank.id}
              onDragOver={(e) => {
                e.preventDefault()
                if (!showingAnswers) e.currentTarget.classList.add('drag-over')
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('drag-over')
              }}
              onDrop={(e) => {
                if (showingAnswers) return
                e.preventDefault()
                e.currentTarget.classList.remove('drag-over')
                const data = e.dataTransfer && e.dataTransfer.getData && e.dataTransfer.getData('text/plain')
                const draggedId = data || draggedLozenge
                if (draggedId) {
                  setFilledBlanks(prev => ({
                    ...prev,
                    [blank.id]: draggedId
                  }))
                  setDraggedLozenge(null)
                }
              }}
            >
              _______
            </span>
          )}
        </span>
      )
    }
    return (
      <span key={idx} className="word">
        {w}{' '}
      </span>
    )
  })

  return (
    <div className="fill-blanks">
      <div className="exercise-card">
        <div className="sentence-header">
          <p className="sentence">{sentenceElements}</p>
          {(showingAnswers || feedback?.type === 'correct') && (
            <div className="sentence-controls">
              <SpeakerIcon text={sentence} size={18} className="sentence-speaker" noRole />
            </div>
          )}
        </div>

        <div className="options-row">
          {options.map((option, idx) => {
            const isUsed = Object.values(filledBlanks).includes(option.id)
            const hotkey = idx + 1 <= 9 ? idx + 1 : null
            return (
              <div
                key={option.id}
                className={`lozenge ${isUsed ? 'used' : ''} ${showingAnswers ? 'disabled' : ''}`}
                draggable={!showingAnswers}
                onDragStart={(e) => {
                  if (!showingAnswers) {
                    try {
                      e.dataTransfer.setData('text/plain', option.id)
                      e.dataTransfer.effectAllowed = 'move'
                    } catch (err) {
                      /* ignore */
                    }
                    setDraggedLozenge(option.id)
                  }
                }}
                onDragEnd={() => setDraggedLozenge(null)}
                onTouchStart={() => {
                  if (!showingAnswers) setDraggedLozenge(option.id)
                }}
                onTouchEnd={(e) => {
                  if (showingAnswers) {
                    setDraggedLozenge(null)
                    setTouchTarget(null)
                    return
                  }
                  const touch = e.changedTouches && e.changedTouches[0]
                  if (touch) {
                    const el = document.elementFromPoint(touch.clientX, touch.clientY)
                    const recept = el && el.closest && el.closest('.receptacle-lozenge')
                    if (recept && !recept.classList.contains('filled') && !recept.classList.contains('correct-answer')) {
                      const blankId = recept.getAttribute('data-blank-id')
                      if (blankId) {
                        setFilledBlanks(prev => ({ ...prev, [blankId]: option.id }))
                      }
                    }
                  }
                  setDraggedLozenge(null)
                  setTouchTarget(null)
                }}
                onClick={() => {
                  if (showingAnswers) return
                  const filledBlankId = Object.keys(filledBlanks).find(bId => filledBlanks[bId] === option.id)
                  if (filledBlankId) {
                    setFilledBlanks(prev => {
                      const updated = { ...prev }
                      delete updated[filledBlankId]
                      return updated
                    })
                  } else {
                    const sortedBlanks = [...blanks].sort((a, b) => a.wordIdx - b.wordIdx)
                    const emptyBlank = sortedBlanks.find(b => !filledBlanks[b.id])
                    if (emptyBlank) {
                      setFilledBlanks(prev => ({ ...prev, [emptyBlank.id]: option.id }))
                    }
                  }
                }}
                title={hotkey ? `${option.word} (${hotkey})` : option.word}
              >
                {hotkey && <span className="hotkey">{hotkey}</span>}
                <span className="lozenge-text">{option.word}</span>
                <SpeakerIcon text={option.word} size={16} className="lozenge-speaker" noRole />
              </div>
            )
          })}
        </div>

        <div className="button-row">
          {showingAnswers ? (
            <>
              <div className={`feedback correct`}>✓ Correct answers shown above.</div>
              <button className="next-button" onClick={handleNext}>
                Next (Enter)
              </button>
            </>
          ) : feedback === null ? (
            <button
              className="check-button"
              onClick={handleCheck}
              disabled={blanks.some(b => !filledBlanks[b.id])}
            >
              Check (Enter)
            </button>
          ) : feedback.type === 'correct' ? (
            <>
              <div className={`feedback ${feedback.type}`}>{feedback.message}</div>
              <button className="next-button" onClick={handleNext}>
                Next (Enter)
              </button>
            </>
          ) : feedback.type === 'incorrect' ? (
            <>
              <div className={`feedback ${feedback.type}`}>{feedback.message}</div>
              <div className="incorrect-actions">
                <button className="show-answer-button" onClick={handleShowAnswers}>
                  Show Answers (S)
                </button>
                <button className="next-button" onClick={handleNext}>
                  Next (Enter)
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

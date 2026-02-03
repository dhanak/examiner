import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { usePracticeStore } from '../store/practiceStore'
import { useVocabularyStore } from '../store/vocabularyStore'
import { shuffleArray } from '../utils/practiceUtils'
import vocabularyData from '../data/vocabulary.json'
import './FillBlanks.css'

export default function FillBlanks() {
  const {
    wordPoolFilter,
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

    return words
  }, [wordPoolFilter, learnedWords, mistakeWords])

  // State for current exercise
  const [word, setWord] = useState(null)
  const [sentence, setSentence] = useState('')
  const [blanks, setBlanks] = useState([]) // Array of {id, wordIdx, correctWord}
  const [options, setOptions] = useState([]) // Array of {id, word, isCorrect}
  const [filledBlanks, setFilledBlanks] = useState({}) // {blankId: wordId}
  const [draggedLozenge, setDraggedLozenge] = useState(null) // Track dragged word
  const [feedback, setFeedback] = useState(null) // {type, message}

  const hasInitializedRef = useRef(false)

  // Generate an exercise by picking a random word and creating blanks
  const generateExercise = useCallback(() => {
    if (filteredWords.length === 0) return null

    // Pick a random word
    const selectedWord = filteredWords[Math.floor(Math.random() * filteredWords.length)]
    const example = selectedWord.example
    const words = example.split(/\s+/)

    // Create blanks by randomly selecting word positions from the sentence
    const availableIndices = words.map((_, idx) => idx)
    const numBlanks = Math.min(blankCount, availableIndices.length)
    const blankIndices = shuffleArray(availableIndices).slice(0, numBlanks)

    // Build blanks array with correct words
    const newBlanks = blankIndices.map((idx) => ({
      id: `blank-${idx}`,
      wordIdx: idx,
      correctWord: words[idx].toLowerCase().replace(/[^a-z]/g, '')
    }))

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
    }
  }, [blankCount, distractorCount, generateExercise])

  const handleCheck = useCallback(() => {
    if (!word || blanks.length === 0) return

    // Check if all blanks are filled
    const unfilled = blanks.filter(b => !filledBlanks[b.id])
    if (unfilled.length > 0) {
      setFeedback({ type: 'incomplete', message: '✓ Please fill all blanks before checking.' })
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
    }
  }, [generateExercise])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Enter for Check/Next
      if (e.key === 'Enter') {
        e.preventDefault()
        if (feedback === null || feedback.type === 'incomplete') {
          handleCheck()
        } else {
          handleNext()
        }
        return
      }

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
  }, [feedback, handleCheck, handleNext, blanks, filledBlanks, options])

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
      
      return (
        <span key={idx} className="blank-slot">
          {filledOption ? (
            <span
              className="receptacle-lozenge filled"
              onClick={() => {
                setFilledBlanks(prev => {
                  const updated = { ...prev }
                  delete updated[blank.id]
                  return updated
                })
              }}
              title="Click to remove"
            >
              {hotkeyNumber && hotkeyNumber <= 9 && <span className="hotkey">{hotkeyNumber}</span>}
              <span className="word-text">{filledOption.word}</span>
            </span>
          ) : (
            <span
              className="receptacle-lozenge empty"
              onDragOver={(e) => {
                e.preventDefault()
                e.currentTarget.classList.add('drag-over')
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('drag-over')
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.currentTarget.classList.remove('drag-over')
                if (draggedLozenge) {
                  setFilledBlanks(prev => ({
                    ...prev,
                    [blank.id]: draggedLozenge
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
        <p className="sentence">{sentenceElements}</p>

        <div className="options-row">
          {options.map((option, idx) => {
            const isUsed = Object.values(filledBlanks).includes(option.id)
            const hotkey = idx + 1 <= 9 ? idx + 1 : null
            return (
              <div
                key={option.id}
                className={`lozenge ${isUsed ? 'used' : ''}`}
                draggable
                onDragStart={() => setDraggedLozenge(option.id)}
                onDragEnd={() => setDraggedLozenge(null)}
                title={hotkey ? `${option.word} (${hotkey})` : option.word}
              >
                {hotkey && <span className="hotkey">{hotkey}</span>}
                <span className="lozenge-text">{option.word}</span>
              </div>
            )
          })}
        </div>

        <div className="button-row">
          {feedback === null || feedback.type === 'incomplete' ? (
            <button className="check-button" onClick={handleCheck}>
              Check (Enter)
            </button>
          ) : (
            <>
              <div className={`feedback ${feedback.type}`}>{feedback.message}</div>
              <button className="next-button" onClick={handleNext}>
                Next (Enter)
              </button>
            </>
          )}
          {feedback && feedback.type === 'incomplete' && (
            <div className={`feedback ${feedback.type}`}>{feedback.message}</div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { usePracticeStore } from '../store/practiceStore'
import { useVocabularyStore } from '../store/vocabularyStore'
import { getRandomWords, getDistractors, shuffleArray, getRandomTranslation } from '../utils/practiceUtils'
import vocabularyData from '../data/vocabulary.json'
import './MultipleChoice.css'

export default function MultipleChoice() {
  const {
    direction,
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

  const [currentWord, setCurrentWord] = useState(null)
  const [options, setOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [correctAnswer, setCorrectAnswer] = useState(null)
  const hasInitializedRef = useRef(false)

  const optionCount = settings.multipleChoice.optionCount

  // Filter words based on word pool filter
  const filteredWords = useMemo(() => {
    let words = vocabularyData.words

    // Apply word pool filter
    if (wordPoolFilter === 'learned') {
      words = words.filter(w => learnedWords.has(w.id))
    } else if (wordPoolFilter === 'mistakes') {
      words = words.filter(w => mistakeWords.has(w.id))
    }

    return words
  }, [wordPoolFilter, learnedWords, mistakeWords])

  // Generate new question
  const generateQuestion = useCallback(() => {
    if (filteredWords.length === 0) {
      return { word: null, options: [], correctAnswer: null }
    }

    // Pick a random word
    const [word] = getRandomWords(filteredWords, 1)

    // Generate options based on direction
    if (direction === 'en-to-hu') {
      // Show English word, pick Hungarian translation
      const correct = getRandomTranslation(word)

      // Get distractors (other Hungarian translations)
      const distractorWords = getDistractors(word, filteredWords, optionCount - 1)
      const distractorOptions = distractorWords.map(w => getRandomTranslation(w))

      // Combine and shuffle
      const allOptions = shuffleArray([correct, ...distractorOptions])

      return { word, options: allOptions, correctAnswer: correct }
    } else {
      // Show Hungarian translation, pick English word
      const hungarianPrompt = getRandomTranslation(word)

      // Get distractor English words
      const distractorWords = getDistractors(word, filteredWords, optionCount - 1)
      const distractorOptions = distractorWords.map(w => w.word)

      // Combine and shuffle
      const allOptions = shuffleArray([word.word, ...distractorOptions])

      // Store the Hungarian word used as prompt
      const wordWithPrompt = { ...word, promptText: hungarianPrompt }

      return { word: wordWithPrompt, options: allOptions, correctAnswer: word.word }
    }
  }, [filteredWords, direction, optionCount])

  // Generate first question on mount only
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      const question = generateQuestion()
      setCurrentWord(question.word)
      setOptions(question.options)
      setCorrectAnswer(question.correctAnswer)
      setSelectedOption(null)
      setIsCorrect(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleOptionClick = useCallback((option) => {
    if (isCorrect !== null) return // Already answered

    setSelectedOption(option)
    const correct = option === correctAnswer

    setIsCorrect(correct)

    if (correct) {
      incrementCorrect()
      clearMistake(currentWord.id)
    } else {
      incrementIncorrect()
      markAsMistake(currentWord.id)
    }
  }, [isCorrect, correctAnswer, currentWord, incrementCorrect, incrementIncorrect, markAsMistake, clearMistake])

  const handleNext = () => {
    const question = generateQuestion()
    setCurrentWord(question.word)
    setOptions(question.options)
    setCorrectAnswer(question.correctAnswer)
    setSelectedOption(null)
    setIsCorrect(null)
  }

  const handleKeyPress = useCallback((e) => {
    if (isCorrect !== null && e.key === 'Enter') {
      const question = generateQuestion()
      setCurrentWord(question.word)
      setOptions(question.options)
      setCorrectAnswer(question.correctAnswer)
      setSelectedOption(null)
      setIsCorrect(null)
      return
    }

    // Number keys 1-8 for option selection
    const num = parseInt(e.key)
    if (num >= 1 && num <= options.length && isCorrect === null) {
      handleOptionClick(options[num - 1])
    }
  }, [isCorrect, options, generateQuestion, handleOptionClick])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  if (filteredWords.length === 0) {
    return (
      <div className="multiple-choice">
        <div className="no-words-message">
          <p>No words available with the current filter settings.</p>
          <p>Try changing the word pool filter or add more words to your collection.</p>
        </div>
      </div>
    )
  }

  if (!currentWord) {
    return <div className="multiple-choice">Loading...</div>
  }

  const promptText = direction === 'en-to-hu'
    ? currentWord.word
    : currentWord.promptText

  const instructionText = direction === 'en-to-hu'
    ? 'Select the Hungarian translation:'
    : 'Select the English word:'

  return (
    <div className="multiple-choice">
      <div className="question-card">
        <div className="badges">
          <span className="level-badge">{currentWord.level}</span>
          <span className="pos-badge">{currentWord.partOfSpeech}</span>
        </div>

        <div className="prompt-word">
          {promptText}
        </div>

        <div className="instruction">
          {instructionText}
        </div>

        <div className="options-list">
          {options.map((option, index) => {
            const isSelected = selectedOption === option
            const isTheCorrectAnswer = option === correctAnswer
            const showAsCorrect = isCorrect !== null && isTheCorrectAnswer
            const showAsWrong = isSelected && !isCorrect

            return (
              <button
                key={index}
                className={`option-button ${isSelected ? 'selected' : ''} ${showAsCorrect ? 'correct' : ''} ${showAsWrong ? 'wrong' : ''}`}
                onClick={() => handleOptionClick(option)}
                disabled={isCorrect !== null}
              >
                <span className="option-number">{index + 1}</span>
                <span className="option-text">{option}</span>
                {showAsCorrect && <span className="option-icon">✓</span>}
                {showAsWrong && <span className="option-icon">✗</span>}
              </button>
            )
          })}
        </div>

        {isCorrect !== null && (
          <div className={`feedback ${isCorrect ? 'correct-feedback' : 'wrong-feedback'}`}>
            {isCorrect ? (
              <p>✓ Correct!</p>
            ) : (
              <p>✗ Incorrect. The correct answer was: <strong>{correctAnswer}</strong></p>
            )}
            <button className="next-button" onClick={handleNext}>
              Next Question (Enter)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

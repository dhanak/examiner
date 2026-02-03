import { usePracticeStore } from '../store/practiceStore'
import { useVocabularyStore } from '../store/vocabularyStore'
import vocabularyData from '../data/vocabulary.json'
import './Dashboard.css'

export default function Dashboard() {
  const {
    globalCorrectCount,
    globalIncorrectCount,
    resetAll
  } = usePracticeStore()

  const {
    learnedWords,
    mistakeWords,
    resetProgress
  } = useVocabularyStore()

  const totalVocabulary = vocabularyData.words.length
  const learnedCount = learnedWords.size
  const mistakeCount = mistakeWords.size
  const totalAttempts = globalCorrectCount + globalIncorrectCount
  const accuracy = totalAttempts > 0 
    ? Math.round((globalCorrectCount / totalAttempts) * 100)
    : 0

  const handleClearProgress = () => {
    if (window.confirm('Are you sure you want to clear all progress? This will:\n\n• Reset all practice statistics\n• Forget all learned words\n• Clear all mistake records\n• Reset all practice settings\n\nThis action cannot be undone.')) {
      resetAll()
      resetProgress()
    }
  }

  return (
    <div className="dashboard">
      {/* Vocabulary Stats */}
      <section className="dashboard-section vocabulary-section">
        <h2>Vocabulary Progress</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>Total Words</h3>
              <p className="stat-value">{totalVocabulary}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✓</div>
            <div className="stat-content">
              <h3>Learned Words</h3>
              <p className="stat-value">{learnedCount}</p>
              <p className="stat-percentage">{totalVocabulary > 0 ? Math.round((learnedCount / totalVocabulary) * 100) : 0}% complete</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3>Mistake Words</h3>
              <p className="stat-value">{mistakeCount}</p>
              <p className="stat-percentage">Need review</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">?</div>
            <div className="stat-content">
              <h3>Words to Learn</h3>
              <p className="stat-value">{totalVocabulary - learnedCount}</p>
              <p className="stat-percentage">Not yet learned</p>
            </div>
          </div>
        </div>
      </section>

      {/* Practice Stats */}
      <section className="dashboard-section practice-section">
        <h2>Practice Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>Total Attempts</h3>
              <p className="stat-value">{totalAttempts}</p>
            </div>
          </div>
          <div className="stat-card stat-success">
            <div className="stat-icon">✓</div>
            <div className="stat-content">
              <h3>Correct Answers</h3>
              <p className="stat-value">{globalCorrectCount}</p>
            </div>
          </div>
          <div className="stat-card stat-error">
            <div className="stat-icon">✗</div>
            <div className="stat-content">
              <h3>Incorrect Answers</h3>
              <p className="stat-value">{globalIncorrectCount}</p>
            </div>
          </div>
          <div className="stat-card stat-accuracy">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Accuracy</h3>
              <p className="stat-value">{accuracy}%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="dashboard-section actions-section">
        <button 
          className="btn-clear-progress"
          onClick={handleClearProgress}
        >
          Clear All Progress
        </button>
        <p className="action-hint">
          This will reset all statistics, learned words, and mistakes.
        </p>
      </section>
    </div>
  )
}

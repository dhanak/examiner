import { usePracticeStore } from '../store/practiceStore'
import { useVocabularyStore } from '../store/vocabularyStore'
import { useLanguageStore } from '../store/languageStore'
import useTranslation from '../hooks/useTranslation'
import { getVocabularyWords } from '../utils/vocabularyUtils'
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

  const { language } = useLanguageStore()
  const { t } = useTranslation()

  const words = getVocabularyWords(language)
  const totalVocabulary = words.length
  const learnedCount = learnedWords.size
  const mistakeCount = mistakeWords.size
  const totalAttempts = globalCorrectCount + globalIncorrectCount
  const accuracy = totalAttempts > 0 
    ? Math.round((globalCorrectCount / totalAttempts) * 100)
    : 0

  const handleClearProgress = () => {
    if (window.confirm(t('clearProgressConfirm'))) {
      resetAll()
      resetProgress()
    }
  }

  return (
    <div className="dashboard">
      {/* Vocabulary Stats */}
      <section className="dashboard-section vocabulary-section">
        <h2>{t('vocabularyProgress')}</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>{t('totalWords')}</h3>
              <p className="stat-value">{totalVocabulary}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✓</div>
            <div className="stat-content">
              <h3>{t('learnedWords')}</h3>
              <p className="stat-value">{learnedCount}</p>
              <p className="stat-percentage">{totalVocabulary > 0 ? Math.round((learnedCount / totalVocabulary) * 100) : 0}{t('percentComplete')}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3>{t('mistakeWords')}</h3>
              <p className="stat-value">{mistakeCount}</p>
              <p className="stat-percentage">{t('needReview')}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">?</div>
            <div className="stat-content">
              <h3>{t('wordsToLearn')}</h3>
              <p className="stat-value">{totalVocabulary - learnedCount}</p>
              <p className="stat-percentage">{t('notYetLearned')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Practice Stats */}
      <section className="dashboard-section practice-section">
        <h2>{t('practiceStatistics')}</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>{t('totalAttempts')}</h3>
              <p className="stat-value">{totalAttempts}</p>
            </div>
          </div>
          <div className="stat-card stat-success">
            <div className="stat-icon">✓</div>
            <div className="stat-content">
              <h3>{t('correctAnswers')}</h3>
              <p className="stat-value">{globalCorrectCount}</p>
            </div>
          </div>
          <div className="stat-card stat-error">
            <div className="stat-icon">✗</div>
            <div className="stat-content">
              <h3>{t('incorrectAnswers')}</h3>
              <p className="stat-value">{globalIncorrectCount}</p>
            </div>
          </div>
          <div className="stat-card stat-accuracy">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{t('accuracy')}</h3>
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
          {t('clearAllProgress')}
        </button>
        <p className="action-hint">
          {t('clearProgressHint')}
        </p>
      </section>
    </div>
  )
}

import React, { useRef } from 'react'
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
    resetAll,
    importStatsForLanguage
  } = usePracticeStore()

  const {
    learnedWords,
    mistakeWords,
    resetProgress,
    importProgress
  } = useVocabularyStore()

  const { language } = useLanguageStore()
  const { t } = useTranslation()

  const fileInputRef = useRef(null)

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

  const handleDownload = () => {
    const payload = {
      version: 1,
      language,
      vocabulary: {
        learnedWords: Array.from(learnedWords),
        mistakeWords: Array.from(mistakeWords)
      },
      practice: {
        globalCorrectCount: globalCorrectCount || 0,
        globalIncorrectCount: globalIncorrectCount || 0
      }
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const filename = `c1-examiner-progress-${language}-${new Date().toISOString().slice(0,10)}.json`
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = null
    fileInputRef.current?.click()
  }

  const handleFileSelected = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        // Basic validation
        if (!data || !data.vocabulary || !data.practice) {
          alert(t('importError'))
          return
        }
        if (!window.confirm(t('uploadProgressConfirm'))) return
        // Apply to current language (overwrite)
        importProgress(language, data.vocabulary)
        importStatsForLanguage(language, data.practice)
        alert(t('importSuccess'))
      } catch (err) {
        console.error('Import failed', err)
        alert(t('importError'))
      }
    }
    reader.readAsText(file)
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
        <div className="action-buttons">
          <button
            className="btn-clear-progress"
            onClick={handleClearProgress}
          >
            {t('clearAllProgress')}
          </button>

          <button className="btn btn-secondary" onClick={handleDownload}>{t('downloadProgress')}</button>
          <button className="btn btn-secondary" onClick={handleUploadClick}>{t('uploadProgress')}</button>

          <input ref={fileInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={handleFileSelected} />
        </div>
      </section>
    </div>
  )
}

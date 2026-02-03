import { usePracticeStore } from '../store/practiceStore'
import './PracticeControls.css'

export default function PracticeControls() {
  const {
    currentMode,
    direction,
    wordPoolFilter,
    correctCount,
    incorrectCount,
    setMode,
    setDirection,
    setWordPoolFilter,
    getAccuracy,
    resetSession
  } = usePracticeStore()

  const modes = [
    { id: 'multiple-choice', label: 'Multiple Choice' },
    { id: 'match-pairs', label: 'Match Pairs' },
    { id: 'fill-blanks', label: 'Fill in Blanks' }
  ]

  const directions = [
    { id: 'hu-to-en', label: 'Hungarian to English' },
    { id: 'en-to-hu', label: 'English to Hungarian' }
  ]

  const filters = [
    { id: 'all', label: 'All Words' },
    { id: 'learned', label: 'Learned Only' },
    { id: 'mistakes', label: 'Mistakes Only' }
  ]

  const totalAttempts = correctCount + incorrectCount
  const accuracy = getAccuracy()

  const handleModeChange = (modeId) => {
    setMode(modeId)
    resetSession() // Reset stats when changing modes
  }

  return (
    <div className="practice-controls">
      {/* Mode Selector */}
      <div className="control-section mode-selector">
        <div className="mode-tabs">
          {modes.map(mode => (
            <button
              key={mode.id}
              className={`mode-tab ${currentMode === mode.id ? 'active' : ''}`}
              onClick={() => handleModeChange(mode.id)}
              aria-current={currentMode === mode.id ? 'page' : undefined}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Row: Direction + Word Pool Filter */}
      <div className="control-section settings-row">
        {/* Only show direction for multiple-choice mode */}
        {currentMode === 'multiple-choice' && (
          <div className="setting-group">
            <label htmlFor="direction-select">Direction:</label>
            <select
              id="direction-select"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="direction-select"
            >
              {directions.map(dir => (
                <option key={dir.id} value={dir.id}>
                  {dir.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="setting-group">
          <label htmlFor="filter-select">Word Pool:</label>
          <select
            id="filter-select"
            value={wordPoolFilter}
            onChange={(e) => setWordPoolFilter(e.target.value)}
            className="filter-select"
          >
            {filters.map(filter => (
              <option key={filter.id} value={filter.id}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Display */}
      <div className="control-section stats-display">
        {totalAttempts > 0 ? (
          <>
            <div className="stat-item stat-correct">
              <span className="stat-icon">✓</span>
              <span className="stat-value">{correctCount}</span>
              <span className="stat-label">correct</span>
            </div>
            <div className="stat-item stat-incorrect">
              <span className="stat-icon">✗</span>
              <span className="stat-value">{incorrectCount}</span>
              <span className="stat-label">incorrect</span>
            </div>
            <div className="stat-item stat-accuracy">
              <span className="stat-value">{accuracy}%</span>
              <span className="stat-label">accuracy</span>
            </div>
          </>
        ) : (
          <div className="stat-placeholder">
            Start practicing to see your stats
          </div>
        )}
      </div>
    </div>
  )
}

import PracticeControls from '../components/PracticeControls'
import MultipleChoice from '../components/MultipleChoice'
import { usePracticeStore } from '../store/practiceStore'
import './Practice.css'

export default function Practice() {
  const { currentMode } = usePracticeStore()

  const renderPracticeMode = () => {
    switch (currentMode) {
      case 'multiple-choice':
        return <MultipleChoice />
      case 'match-pairs':
        return (
          <div className="coming-soon">
            <h2>Match Pairs</h2>
            <p>This mode is coming soon!</p>
          </div>
        )
      case 'fill-blanks':
        return (
          <div className="coming-soon">
            <h2>Fill in the Blanks</h2>
            <p>This mode is coming soon!</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="practice-page">
      <header className="practice-header">
        <h1>Practice</h1>
        <p>Test your vocabulary knowledge with interactive exercises</p>
      </header>

      <PracticeControls />

      <main className="practice-content">
        {renderPracticeMode()}
      </main>
    </div>
  )
}

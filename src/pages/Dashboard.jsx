import { useProgressStore } from '../store/progressStore'

export default function Dashboard() {
  const { totalQuestions, correctAnswers } = useProgressStore()
  
  const accuracy = totalQuestions > 0 
    ? ((correctAnswers / totalQuestions) * 100).toFixed(1)
    : 0

  return (
    <div className="dashboard">
      <h2>Your Progress</h2>
      <div className="stats">
        <div className="stat-card">
          <h3>Questions Attempted</h3>
          <p className="stat-value">{totalQuestions}</p>
        </div>
        <div className="stat-card">
          <h3>Correct Answers</h3>
          <p className="stat-value">{correctAnswers}</p>
        </div>
        <div className="stat-card">
          <h3>Accuracy</h3>
          <p className="stat-value">{accuracy}%</p>
        </div>
      </div>
    </div>
  )
}

import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the app header', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    expect(screen.getByText('C1 Examiner')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Practice')).toBeInTheDocument()
  })
})

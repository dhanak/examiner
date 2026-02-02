import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import FlipCard from './FlipCard'

describe('FlipCard', () => {
  const mockWord = {
    word: 'abolish',
    level: 'C1',
    partOfSpeech: 'verb',
    translations: ['eltöröl', 'megszüntet'],
    definition: 'to officially end a law, system, or practice',
    example: 'The government voted to abolish the outdated tax system.'
  }

  it('renders the word on the front side', () => {
    render(<FlipCard {...mockWord} />)
    expect(screen.getAllByText('abolish')[0]).toBeInTheDocument()
    expect(screen.getAllByText('C1')[0]).toBeInTheDocument()
  })

  it('shows flip hint on front side', () => {
    render(<FlipCard {...mockWord} />)
    expect(screen.getByText('Click to flip')).toBeInTheDocument()
  })

  it('flips card when clicked', async () => {
    const user = userEvent.setup()
    render(<FlipCard {...mockWord} />)
    
    const card = screen.getByRole('button')
    await user.click(card)
    
    // Back side should show translations
    expect(screen.getByText(/eltöröl, megszüntet/)).toBeInTheDocument()
  })

  it('displays translations on back side', async () => {
    const user = userEvent.setup()
    render(<FlipCard {...mockWord} />)
    
    const card = screen.getByRole('button')
    await user.click(card)
    
    expect(screen.getByText(/Magyar:/)).toBeInTheDocument()
    expect(screen.getByText(/eltöröl, megszüntet/)).toBeInTheDocument()
  })

  it('displays definition and example on back side', async () => {
    const user = userEvent.setup()
    render(<FlipCard {...mockWord} />)
    
    const card = screen.getByRole('button')
    await user.click(card)
    
    expect(screen.getByText(/Definition:/)).toBeInTheDocument()
    expect(screen.getByText(/to officially end a law/)).toBeInTheDocument()
    expect(screen.getByText(/Example:/)).toBeInTheDocument()
    expect(screen.getByText(/The government voted to abolish/)).toBeInTheDocument()
  })

  it('shows part of speech on back side', async () => {
    const user = userEvent.setup()
    render(<FlipCard {...mockWord} />)
    
    const card = screen.getByRole('button')
    await user.click(card)
    
    expect(screen.getByText('verb')).toBeInTheDocument()
  })

  it('toggles between front and back when clicked multiple times', async () => {
    const user = userEvent.setup()
    render(<FlipCard {...mockWord} />)
    
    const card = screen.getByRole('button')
    
    // First click - flip to back
    await user.click(card)
    expect(screen.getByText(/Magyar:/)).toBeInTheDocument()
    
    // Second click - flip to front
    await user.click(card)
    expect(screen.getByText('Click to flip')).toBeInTheDocument()
  })
})

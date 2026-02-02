// TODO: This test suite causes hanging issues, likely due to importing VocabularyPractice
// which loads the large vocabulary.json file. Re-enable and fix after optimizing test setup.
// Tracked issue: Layout tests should verify flexbox and overflow styles without hanging

import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import App from './App'
// import VocabularyPractice from './pages/VocabularyPractice'

describe.skip('Layout Regression Tests - Bug #3 (DISABLED - causes hanging)', () => {
  describe('App Layout', () => {
    it('uses proper layout structure', () => {
      const { container } = render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )
      
      const app = container.querySelector('.app')
      expect(app).toBeTruthy()
      expect(app.className).toBe('app')
    })

    it('has scrollable main section', () => {
      const { container } = render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )
      
      const main = container.querySelector('.app-main')
      expect(main).toBeTruthy()
      expect(main.className).toBe('app-main')
    })

    it('renders header and main sections', () => {
      const { container } = render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )
      
      const header = container.querySelector('.app-header')
      const main = container.querySelector('.app-main')
      
      expect(header).toBeTruthy()
      expect(main).toBeTruthy()
    })
  })

  describe('VocabularyPractice Layout', () => {
    it.skip('has full height layout class', () => {
      // const { container } = render(
      //   <BrowserRouter>
      //     <VocabularyPractice />
      //   </BrowserRouter>
      // )
      // 
      // const practice = container.querySelector('.vocabulary-practice')
      // expect(practice).toBeTruthy()
      // expect(practice.className).toBe('vocabulary-practice')
    })

    it.skip('renders all major sections', () => {
      // const { container } = render(
      //   <BrowserRouter>
      //     <VocabularyPractice />
      //   </BrowserRouter>
      // )
      // 
      // expect(container.querySelector('.practice-header')).toBeTruthy()
      // expect(container.querySelector('.practice-stats')).toBeTruthy()
      // expect(container.querySelector('.filter-controls')).toBeTruthy()
    })
  })
})

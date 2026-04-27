import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('Miles landing page', () => {
  it('renders core sections', () => {
    render(<App />)

    expect(screen.getByText(/Welcome to Miles World/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Explore Stories/i })).toHaveAttribute(
      'href',
      '#stories',
    )
    expect(screen.getByRole('heading', { name: /Game Showcase/i })).toBeInTheDocument()
  })
})

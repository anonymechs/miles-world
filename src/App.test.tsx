import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('Miles landing page', () => {
  it('renders core sections', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /Miles World/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Explore Stories/i })).toHaveAttribute('href', '#stories')
    expect(screen.getByRole('heading', { name: /Game Showcase/i })).toBeInTheDocument()
  })

  it('renders game showcase page', () => {
    render(
      <MemoryRouter initialEntries={['/games']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /Game Showcase/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Throw the Blue Cat!/i)).toBeInTheDocument()
    expect(screen.getByText(/Brick House Building/i)).toBeInTheDocument()
    expect(screen.getByText(/Emergency Vehicle Go!/i)).toBeInTheDocument()
  })
})

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
    expect(screen.getByText(/April 2026/i)).toBeInTheDocument()
    expect(screen.getByText(/March 2026/i)).toBeInTheDocument()
    expect(screen.getByText(/February 2026/i)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Emergency Vehicle Go!/i }),
    ).toHaveAttribute('href', '/games/emergency-vehicle-go')
    expect(
      screen.getByRole('link', { name: /Brick House Building/i }),
    ).toHaveAttribute('href', '/games/brick-house-building')
    expect(
      screen.getByRole('link', { name: /Throw the Blue Cat!/i }),
    ).toHaveAttribute('href', '/games/throw-the-blue-cat')
  })

  it('renders selected game player page', () => {
    render(
      <MemoryRouter initialEntries={['/games/emergency-vehicle-go']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /Emergency Vehicle Go!/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByTitle(/Emergency Vehicle Go!/i),
    ).toBeInTheDocument()
  })

  it('renders brick house game player page', () => {
    render(
      <MemoryRouter initialEntries={['/games/brick-house-building']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /Brick House Building/i }),
    ).toBeInTheDocument()
    expect(screen.getByTitle(/Brick House Building/i)).toBeInTheDocument()
  })

  it('renders blue cat game player page', () => {
    render(
      <MemoryRouter initialEntries={['/games/throw-the-blue-cat']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /Throw the Blue Cat!/i }),
    ).toBeInTheDocument()
    expect(screen.getByTitle(/Throw the Blue Cat!/i)).toBeInTheDocument()
  })
})

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
      screen.getByRole('heading', {
        name: /Miles is a kid creator making stories and games/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Miles making a peace sign/i })).toHaveAttribute(
      'src',
      expect.stringContaining('miles-pose-peace.png'),
    )
    // All pose frames are mounted for the fade carousel
    expect(document.querySelectorAll('.intro-portrait img')).toHaveLength(3)
    expect(
      screen.getByRole('link', { name: /Explore projects/i }),
    ).toHaveAttribute('href', '#work')
    expect(screen.getByRole('heading', { name: /Story Library/i })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /Travel Snake: World Tour/i }),
    ).toBeInTheDocument()

    // Homepage games are ordered newest → oldest
    const projectTitles = screen
      .getAllByRole('heading', { level: 2 })
      .map((el) => el.textContent)
      .filter((title) => title !== 'Story Library')
    expect(projectTitles).toEqual([
      'Steamtrain 3000',
      'Travel Snake: World Tour',
      'Throw the Blue Cat!',
      'Brick House Building',
      'Emergency Vehicle Go!',
    ])
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
    expect(screen.getByText(/Travel Snake: World Tour/i)).toBeInTheDocument()
    expect(screen.getByText(/Steamtrain 3000/i)).toBeInTheDocument()
    expect(screen.getByText(/Brick House Building/i)).toBeInTheDocument()
    expect(screen.getByText(/Emergency Vehicle Go!/i)).toBeInTheDocument()
    expect(screen.getByText(/April 2026/i)).toBeInTheDocument()
    expect(screen.getAllByText(/August 2026/i).length).toBeGreaterThanOrEqual(2)
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
    expect(
      screen.getByRole('link', { name: /Travel Snake: World Tour/i }),
    ).toHaveAttribute('href', '/games/travel-snake')
    expect(
      screen.getByRole('link', { name: /Steamtrain 3000/i }),
    ).toHaveAttribute('href', '/games/steamtrain-3000')
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
    expect(screen.getByTitle(/Emergency Vehicle Go!/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Send each vehicle to the right station/i),
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
    expect(screen.getByTitle(/Brick House Building/i)).toHaveStyle({
      minHeight: '980px',
    })
    expect(screen.getByText(/Drag bricks from the side panel/i)).toBeInTheDocument()
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
    expect(screen.getByText(/Hold Space to charge your throw/i)).toBeInTheDocument()
  })

  it('renders travel snake game player page', () => {
    render(
      <MemoryRouter initialEntries={['/games/travel-snake']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /Travel Snake: World Tour/i }),
    ).toBeInTheDocument()
    expect(screen.getByTitle(/Travel Snake: World Tour/i)).toBeInTheDocument()
    expect(screen.getByText(/Steer with arrow keys or WASD/i)).toBeInTheDocument()
  })

  it('renders steamtrain game player page', () => {
    render(
      <MemoryRouter initialEntries={['/games/steamtrain-3000']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /Steamtrain 3000/i }),
    ).toBeInTheDocument()
    expect(screen.getByTitle(/Steamtrain 3000/i)).toBeInTheDocument()
    expect(screen.getByText(/pick a track at junctions/i)).toBeInTheDocument()
  })

  it('renders about page', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /About Miles/i })).toBeInTheDocument()
    expect(screen.getByText(/I make stories and games/i)).toBeInTheDocument()
  })

  it('renders stories coming soon page', () => {
    render(
      <MemoryRouter initialEntries={['/stories']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /Coming soon/i })).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: /Main/i }).querySelector('a.is-active'),
    ).toHaveTextContent('Stories')
    expect(screen.getByText(/still cooking up funny/i)).toBeInTheDocument()
  })
})

import './App.css'
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom'

const games = [
  {
    slug: 'throw-the-blue-cat',
    title: 'Throw the Blue Cat!',
    description: 'Toss the blue cat and see how many silly targets you can hit.',
    date: 'April 2026',
    coverEmoji: '🐱',
    htmlPath: 'games/cat-throw-game.html',
  },
  {
    slug: 'brick-house-building',
    title: 'Brick House Building',
    description: 'Stack bright bricks, build big houses, and make your own town.',
    date: 'March 2026',
    coverEmoji: '🧱',
    htmlPath: 'games/build-a-house.html',
  },
  {
    slug: 'emergency-vehicle-go',
    title: 'Emergency Vehicle Go!',
    description: 'Race to help people with fire trucks, police cars, and ambulances.',
    date: 'February 2026',
    coverEmoji: '🚒',
    htmlPath: 'games/emergency-dispatch.html',
  },
]

function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Hi! I&apos;m Miles 👋</p>
        <h1 className="title">Miles World</h1>
        <p className="tagline">Come check out my stories and games!</p>
        <p className="intro">
          I make these with AI and my family. Some are funny, some are epic, and
          some are a little bit silly. Pick one and have a look!
        </p>
        <div className="cta-group">
          <a className="button primary" href="#stories">
            Explore Stories
          </a>
          <Link className="button secondary" to="/games">
            Play Miles&apos; Games
          </Link>
        </div>
      </section>
      <section className="cards">
        <article id="stories" className="card">
          <h2>Story Library</h2>
          <p>
            Pick a story! Some are funny, some are brave, and some are super
            silly. Find your favorite and read it again.
          </p>
        </article>
        <article id="games" className="card">
          <h2>Game Showcase</h2>
          <p>
            Try my games! I made these ideas with AI. Click one to play and see
            what cool things happen.
          </p>
        </article>
      </section>
    </main>
  )
}

function GamesPage() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Miles World Games</p>
        <h1 className="title">Game Showcase</h1>
        <p className="intro">
          Here are the games I made. Pick one, jump in, and have fun!
        </p>
        <div className="cta-group">
          <Link className="button secondary" to="/">
            Back to Home
          </Link>
        </div>
      </section>
      <section className="cards gallery">
        {games.map((game) => (
          <Link key={game.slug} to={`/games/${game.slug}`} className="game-link">
            <article className="card game-card">
              <div className="game-cover" aria-hidden="true">
                <span>{game.coverEmoji}</span>
              </div>
              <p className="game-chip">Game</p>
              <h2>{game.title}</h2>
              <p className="game-date">{game.date}</p>
              <p>{game.description}</p>
            </article>
          </Link>
        ))}
      </section>
    </main>
  )
}

function GamePlayerPage() {
  const { slug } = useParams()
  const game = games.find((item) => item.slug === slug)

  if (!game) {
    return <Navigate to="/games" replace />
  }

  const gameUrl = game.htmlPath
    ? `${import.meta.env.BASE_URL}${game.htmlPath}`
    : null

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Now Playing</p>
        <h1 className="title">{game.title}</h1>
        <p className="intro">
          Built by Miles and AI. Use the controls in the game below and have fun!
        </p>
        <div className="cta-group">
          <Link className="button secondary" to="/games">
            Back to Game Showcase
          </Link>
        </div>
      </section>
      <section className="game-player card">
        {gameUrl ? (
          <iframe
            className="game-frame"
            src={gameUrl}
            title={game.title}
            loading="lazy"
          />
        ) : (
          <p className="coming-soon">
            This game is coming soon. Add the HTML file and it will appear here.
          </p>
        )}
      </section>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/games" element={<GamesPage />} />
      <Route path="/games/:slug" element={<GamePlayerPage />} />
    </Routes>
  )
}

export default App

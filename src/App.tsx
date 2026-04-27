import './App.css'
import { Link, Route, Routes } from 'react-router-dom'

const games = [
  {
    title: 'Throw the Blue Cat!',
    description: 'Toss the blue cat and see how many silly targets you can hit.',
  },
  {
    title: 'Brick House Building',
    description: 'Stack bright bricks, build big houses, and make your own town.',
  },
  {
    title: 'Emergency Vehicle Go!',
    description: 'Race to help people with fire trucks, police cars, and ambulances.',
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
          <article key={game.title} className="card game-card">
            <p className="game-chip">Game</p>
            <h2>{game.title}</h2>
            <p>{game.description}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/games" element={<GamesPage />} />
    </Routes>
  )
}

export default App

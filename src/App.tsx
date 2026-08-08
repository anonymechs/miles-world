import './App.css'
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom'
import { useEffect, useState, type ReactNode } from 'react'

type Game = {
  slug: string
  title: string
  description: string
  date: string
  cover: string
  coverEmoji: string
  htmlPath: string
  instructions: string
  /** Optional taller iframe for games that need more vertical space */
  frameMinHeight?: number
}

const games: Game[] = [
  {
    slug: 'steamtrain-3000',
    title: 'Steamtrain 3000',
    description:
      'Drive the Christmas Express, collect presents, pick the right track, and blast thieves with the snow cannon.',
    date: 'August 2026',
    cover: 'games/covers/steamtrain-3000.jpg',
    coverEmoji: '🚂',
    htmlPath: 'games/steamtrain-3000.html',
    instructions:
      'Use ← → or A/D to pick a track at junctions. Space or F fires the snow cannon at thieves. Avoid red boulder beams. P pauses, R resets.',
  },
  {
    slug: 'travel-snake',
    title: 'Travel Snake: World Tour',
    description:
      'Steer a snake across the world map, eat country flags and landmarks, and visit every nation.',
    date: 'August 2026',
    cover: 'games/covers/travel-snake.jpg',
    coverEmoji: '🐍',
    htmlPath: 'games/travel-snake/index.html',
    instructions:
      'Steer with arrow keys or WASD (or swipe on touch). Eat the next flag or landmark on the map. Space or P pauses, R restarts. Don’t run into yourself!',
  },
  {
    slug: 'throw-the-blue-cat',
    title: 'Throw the Blue Cat!',
    description: 'Toss the blue cat and see how many silly targets you can hit.',
    date: 'April 2026',
    cover: 'games/covers/throw-the-blue-cat.jpg',
    coverEmoji: '🐱',
    htmlPath: 'games/cat-throw-game.html',
    instructions:
      'Hold Space to charge your throw, then release to launch the blue cat. Hit as many targets as you can. Use Reset for another go.',
  },
  {
    slug: 'brick-house-building',
    title: 'Brick House Building',
    description: 'Stack bright bricks, build big houses, and make your own town.',
    date: 'March 2026',
    cover: 'games/covers/brick-house-building.jpg',
    coverEmoji: '🧱',
    htmlPath: 'games/build-a-house.html',
    frameMinHeight: 980,
    instructions:
      'Drag bricks from the side panel onto empty slots on the house. Fill every gap before time runs out. Tap Restart to try again.',
  },
  {
    slug: 'emergency-vehicle-go',
    title: 'Emergency Vehicle Go!',
    description: 'Race to help people with fire trucks, police cars, and ambulances.',
    date: 'February 2026',
    cover: 'games/covers/emergency-services-go.jpg',
    coverEmoji: '🚒',
    htmlPath: 'games/emergency-dispatch.html',
    instructions:
      'Send each vehicle to the right station: ← fire truck, ↓ ambulance, → police, ↑ helicopter. Match the first vehicle on the conveyor before it reaches the end.',
  },
]

const MONTH_INDEX: Record<string, number> = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
}

function gameDateValue(date: string) {
  const [month, year] = date.split(' ')
  return Date.UTC(Number(year), MONTH_INDEX[month] ?? 0, 1)
}

/** Newest first. Same month keeps original catalog order. */
function gamesByDateDesc(list: Game[]) {
  return [...list]
    .map((game, index) => ({ game, index }))
    .sort((a, b) => {
      const byDate = gameDateValue(b.game.date) - gameDateValue(a.game.date)
      return byDate !== 0 ? byDate : a.index - b.index
    })
    .map(({ game }) => game)
}

function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path}`
}

const milesPoses = [
  {
    src: 'miles-pose-peace.png',
    alt: 'Miles making a peace sign',
  },
  {
    src: 'miles-pose-hips.png',
    alt: 'Miles with hands on hips',
  },
  {
    src: 'miles-pose-crossed.png',
    alt: 'Miles with arms crossed',
  },
]

const POSE_ROTATE_MS = 3400

function MilesPortrait() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % milesPoses.length)
    }, POSE_ROTATE_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="intro-portrait" aria-live="polite">
      {milesPoses.map((pose, i) => {
        const active = i === index
        return (
          <img
            key={pose.src}
            src={assetUrl(pose.src)}
            alt={active ? pose.alt : ''}
            aria-hidden={active ? undefined : true}
            className={active ? 'is-active' : undefined}
            width={408}
            height={545}
          />
        )
      })}
    </div>
  )
}

function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="site">
      <header className="nav">
        <div className="nav-inner">
          <Link to="/" className="nav-brand" aria-label="Miles World home">
            <span className="nav-mark">M</span>
            <span className="nav-name">Miles World</span>
          </Link>
          <nav className="nav-links" aria-label="Main">
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
            <NavLink to="/games" className={navClass}>
              Games
            </NavLink>
            <NavLink to="/stories" className={navClass}>
              Stories
            </NavLink>
            <NavLink to="/about" className={navClass}>
              About
            </NavLink>
          </nav>
        </div>
      </header>

      <div className="site-body">{children}</div>

      <footer className="footer">
        <div className="footer-inner">
          <p className="footer-place">
            Miles World <span className="dot">·</span> made with family &amp; AI
          </p>
          <div className="footer-links">
            <Link to="/games">Games</Link>
            <Link to="/stories">Stories</Link>
            <Link to="/about">About</Link>
            <a href="#top">Back to top</a>
          </div>
        </div>
        <p className="footer-note">Hope you enjoyed exploring! Have a fantastic day ✨</p>
      </footer>
    </div>
  )
}

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'nav-link is-active' : 'nav-link'
}

function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  )
}

function HomePage() {
  const sorted = gamesByDateDesc(games)
  const [newest, ...rest] = sorted

  return (
    <main className="page" id="top">
      <section className="intro">
        <div className="intro-panel">
          <div className="intro-copy">
            <p className="handwrite">Hey!</p>
            <h1 className="intro-title">
              Miles is a kid creator making{' '}
              <span className="accent-word">stories</span> and{' '}
              <span className="accent-word">games</span> with AI and family —
              funny, epic, and a little bit silly.
            </h1>
            <div className="intro-actions">
              <a className="btn btn-primary" href="#work">
                Explore projects
              </a>
              <Link className="btn btn-ghost" to="/games">
                Play games
              </Link>
            </div>
          </div>
          <MilesPortrait />
        </div>
      </section>

      <section className="work" id="work" aria-label="Projects">
        <Link to={`/games/${newest.slug}`} className="project project--hero">
          <div className="project-media">
            <img src={assetUrl(newest.cover)} alt="" />
            <span className="project-emoji" aria-hidden="true">
              {newest.coverEmoji}
            </span>
          </div>
          <div className="project-copy">
            <p className="project-meta">Game · {newest.date}</p>
            <h2 className="project-title">{newest.title}</h2>
            <p className="project-desc">{newest.description}</p>
          </div>
        </Link>

        <div className="work-grid">
          {rest.map((game) => (
            <ProjectCard key={game.slug} game={game} />
          ))}

          <Link to="/stories" className="project project--soft">
            <div className="soft-card-body">
              <p className="project-meta">Coming soon</p>
              <h2 className="project-title">Story Library</h2>
              <p className="project-desc">
                Funny, brave, and super silly stories — pick a favorite and read
                it again.
              </p>
              <span className="handwrite soft-note">pages loading…</span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  )
}

function ProjectCard({ game }: { game: Game }) {
  return (
    <Link to={`/games/${game.slug}`} className="project">
      <div className="project-media">
        <img src={assetUrl(game.cover)} alt="" />
        <span className="project-emoji" aria-hidden="true">
          {game.coverEmoji}
        </span>
      </div>
      <div className="project-copy">
        <p className="project-meta">Game · {game.date}</p>
        <h2 className="project-title">{game.title}</h2>
        <p className="project-desc">{game.description}</p>
      </div>
    </Link>
  )
}

function GamesPage() {
  const sorted = gamesByDateDesc(games)

  return (
    <main className="page" id="top">
      <section className="page-header">
        <p className="handwrite">Play time</p>
        <h1 className="page-title">Game Showcase</h1>
        <p className="page-lede">
          Here are the games Miles made. Pick one, jump in, and have fun!
        </p>
      </section>

      <section className="work-grid work-grid--solo" aria-label="All games">
        {sorted.map((game) => (
          <ProjectCard key={game.slug} game={game} />
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

  const gameUrl = game.htmlPath ? assetUrl(game.htmlPath) : null
  const frameStyle = game.frameMinHeight
    ? { minHeight: `${game.frameMinHeight}px` }
    : undefined

  return (
    <main className="page" id="top">
      <section className="page-header page-header--compact">
        <p className="handwrite">Now playing</p>
        <h1 className="page-title">{game.title}</h1>
        <p className="page-lede">
          Built by Miles and AI. Use the controls in the game below and have fun!
        </p>
        <div className="how-to-play">
          <p className="how-to-label">How to play</p>
          <p className="how-to-text">{game.instructions}</p>
        </div>
        <div className="intro-actions">
          <Link className="btn btn-ghost" to="/games">
            Back to Game Showcase
          </Link>
        </div>
      </section>

      <section className="player-shell">
        {gameUrl ? (
          <iframe
            className="game-frame"
            style={frameStyle}
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

function AboutPage() {
  return (
    <main className="page" id="top">
      <section className="about">
        <p className="handwrite">My journey</p>
        <h1 className="page-title">About Miles</h1>
        <div className="about-prose">
          <p>
            Hi — I&apos;m Miles! I make stories and games with help from AI and my
            family. Some are funny, some are epic, and some are a little bit
            silly.
          </p>
          <p>
            I love trying new ideas: tossing blue cats, stacking brick houses,
            and sending emergency vehicles on rescue missions. When something
            works, we keep it. When it doesn&apos;t, we laugh and try again.
          </p>
          <p>
            This site is my little world for sharing those projects. Pick a game,
            play around, and come back soon — there&apos;s always something new
            cooking.
          </p>
        </div>
        <div className="intro-actions">
          <Link className="btn btn-primary" to="/games">
            Play Miles&apos; Games
          </Link>
          <Link className="btn btn-ghost" to="/">
            Back home
          </Link>
        </div>
      </section>
    </main>
  )
}

function StoriesPage() {
  return (
    <main className="page" id="top">
      <section className="coming-soon-page">
        <p className="handwrite">Story Library</p>
        <h1 className="page-title">Coming soon</h1>
        <p className="page-lede">
          Miles is still cooking up funny, brave, and super silly stories. Check
          back soon — new pages are on the way!
        </p>
        <div className="intro-actions">
          <Link className="btn btn-primary" to="/games">
            Play games instead
          </Link>
          <Link className="btn btn-ghost" to="/">
            Back home
          </Link>
        </div>
      </section>
    </main>
  )
}

function App() {
  return (
    <SiteShell>
      <PageTransition>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/:slug" element={<GamePlayerPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </PageTransition>
    </SiteShell>
  )
}

export default App

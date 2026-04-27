import './App.css'

function App() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Welcome to Miles World</p>
        <h1>Stories, games, and imagination built together with AI.</h1>
        <p className="intro">
          A growing collection of bedtime stories and game ideas made for Miles.
          Simple, joyful, and always expanding.
        </p>
        <div className="cta-group">
          <a className="button primary" href="#stories">
            Explore Stories
          </a>
          <a className="button secondary" href="#games">
            Play Miles&apos; Games
          </a>
        </div>
      </section>
      <section className="cards">
        <article id="stories" className="card">
          <h2>Story Library</h2>
          <p>
            Save every AI-generated story in one place with tags for bedtime,
            adventure, silly, and favorites.
          </p>
        </article>
        <article id="games" className="card">
          <h2>Game Showcase</h2>
          <p>
            Highlight game experiments made with AI, with screenshots, quick
            notes, and links to play.
          </p>
        </article>
        <article className="card">
          <h2>Family Timeline</h2>
          <p>
            Track milestones by date so you can look back on the stories and
            games Miles loved at each age.
          </p>
        </article>
      </section>
    </main>
  )
}

export default App

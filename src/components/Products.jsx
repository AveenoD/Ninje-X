import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/Products.css'

const games = [
  {
    id: 'run',
    title: 'Ninja Run',
    image: '/newbg.jpeg',
    description: 'High-speed side-runner with combos, power-ups, and dynamic difficulty.',
    playRoute: '/play-run',
    download: '/vite.svg'
  },
  {
    id: 'space',
    title: 'Ninja Space',
    image: '/party.png',
    description: 'Arcade space shooter with upgrades, bosses, and responsive touch controls.',
    playRoute: '/play-space',
    download: '/Logo.png'
  },
  {
    id: 'demolition',
    title: 'Ninja Demolition',
    image: '/newpart.png',
    description: 'Brick-breaker meets ninja precision. Power-ups and tight paddle control.',
    playRoute: '/play-demolition',
    download: '/bg.png'
  }
]

function Products() {
  return (
    <>
      <section className="nx-products-hero">
        <div className="nx-products-inner">
          <h1>Games Library</h1>
          <p>Browse Ninje-X experiences. Jump into Quick Play or download builds.</p>
        </div>
      </section>

      <section className="nx-section">
        <div className="nx-grid nx-grid-products">
          {games.map(game => (
            <div key={game.id} className="nx-pcard">
              <div className="nx-pthumb">
                <img src={game.image} alt={game.title} />
              </div>
              <div className="nx-pmeta">
                <h3>{game.title}</h3>
                <p>{game.description}</p>
                <div className="nx-pactions">
                  <Link to={game.playRoute} className="nx-btn">Quick Play</Link>
                  <a href={game.download} download className="nx-btn nx-btn-secondary">Download</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default Products



import React from 'react'
import '../styles/Community.css'

const reviews = [
  {
    id: 1,
    name: 'ShadowStriker',
    avatar: null,
    text: 'Ninje-X has insane momentum and combo depth. Feels tight and rewarding!',
    reaction: '🔥 4.8/5'
  },
  {
    id: 2,
    name: 'ArcaneRunner',
    avatar: null,
    text: 'Movement is buttery smooth. The difficulty curve keeps me coming back.',
    reaction: '⚡ 4.7/5'
  },
  {
    id: 3,
    name: 'SilentEcho',
    avatar: null,
    text: 'Boss phases and enemy patterns are well balanced. Pure flow state.',
    reaction: '😎 4.9/5'
  },
  {
    id: 4,
    name: 'HealerMain',
    avatar: null,
    text: 'Accessibility settings plus solid performance on my laptop. Love it!',
    reaction: '💜 4.6/5'
  }
]

const videos = [
  {
    id: 'yt-1',
    platform: 'YouTube',
    logo: '▶',
    thumb: '/public/vite.svg',
    caption: 'Speedrun breakdown and first-look review',
    url: 'https://www.youtube.com/results?search_query=ninje-x'
  },
  {
    id: 'ig-1',
    platform: 'Instagram',
    logo: '📸',
    thumb: '/public/newbg.jpeg',
    caption: 'Community clips and highlights',
    url: 'https://www.instagram.com/'
  },
  {
    id: 'tt-1',
    platform: 'TikTok',
    logo: '🎵',
    thumb: '/public/party.png',
    caption: 'Short reactions and combos',
    url: 'https://www.tiktok.com/'
  },
  {
    id: 'yt-2',
    platform: 'YouTube',
    logo: '▶',
    thumb: '/public/newpart.png',
    caption: 'Advanced movement tips and tricks',
    url: 'https://www.youtube.com/'
  }
]

function ReviewCard({ name, avatar, text, reaction }) {
  return (
    <div className="nx-card">
      <div className="nx-card-head">
        <div className="nx-avatar">
          {avatar ? (
            <img src={avatar} alt={name} />
          ) : (
            <div className="nx-avatar-fallback">{name?.charAt(0) || 'N'}</div>
          )}
        </div>
        <div className="nx-user">
          <h4>{name}</h4>
          <span className="nx-meta">{reaction}</span>
        </div>
      </div>
      <p className="nx-card-text">{text}</p>
    </div>
  )
}

function VideoCard({ platform, logo, thumb, caption, url }) {
  return (
    <a className="nx-vcard" href={url} target="_blank" rel="noopener noreferrer">
      <div className="nx-vthumb">
        <img src={thumb} alt={caption} />
        <div className="nx-vbadge">
          <span className="nx-vlogo">{logo}</span>
          <span className="nx-vplat">{platform}</span>
        </div>
      </div>
      <div className="nx-vmeta">
        <p>{caption}</p>
      </div>
    </a>
  )
}

function Community() {
  return (
    <>
      {/* Header / Hero */}
      <section className="nx-hero">
        <div className="nx-hero-inner">
          <h1>Ninje-X Community</h1>
          <p>
            Discover stories, highlights, and creator content from players around the world.
            Join the movement, share your runs, and become a legend.
          </p>
          <div className="nx-cta">
            <a href="#reviews" className="nx-btn">Read Reviews</a>
            <a href="#videos" className="nx-btn nx-btn-secondary">Watch Videos</a>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="nx-section">
        <div className="nx-section-head">
          <h2>Player Reviews</h2>
          <p>What our community says about Ninje-X</p>
        </div>
        <div className="nx-grid nx-grid-reviews">
          {reviews.map(r => (
            <ReviewCard
              key={r.id}
              name={r.name}
              avatar={r.avatar}
              text={r.text}
              reaction={r.reaction}
            />
          ))}
        </div>
      </section>

      {/* Video News */}
      <section id="videos" className="nx-section">
        <div className="nx-section-head">
          <h2>Video News</h2>
          <p>Positive mentions and highlights across platforms</p>
        </div>
        <div className="nx-grid nx-grid-videos">
          {videos.map(v => (
            <VideoCard
              key={v.id}
              platform={v.platform}
              logo={v.logo}
              thumb={v.thumb}
              caption={v.caption}
              url={v.url}
            />
          ))}
        </div>
      </section>
    </>
  )
}

export default Community



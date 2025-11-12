import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import NinjaRunGame from './components/NinjaRunGame.jsx'
import NinjaSpaceGame from './components/NinjaSpaceGame.jsx'
import NinjaDemolitionGame from './components/NinjaDemolitionGame.jsx'
import Community from './components/Community.jsx'
import Products from './components/Products.jsx'
import Pricing from './components/Pricing.jsx'
import Lenis from 'lenis'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/play" element={<NinjaRunGame />} />
        <Route path="/play-run" element={<NinjaRunGame />} />
        <Route path="/play-space" element={<NinjaSpaceGame />} />
        <Route path="/play-demolition" element={<NinjaDemolitionGame />} />
        <Route path="/community" element={<Community />} />
        <Route path="/products" element={<Products />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

// Initialize Lenis smooth scrolling
const lenis = new Lenis({
  lerp: 0.1,
  smoothWheel: true,
  smoothTouch: false,
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

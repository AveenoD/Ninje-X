import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import '../styles/Circle.css'

function Circle() {
  const ringRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (event) => {
      gsap.to(ringRef.current, {
        x: event.clientX,
        y: event.clientY,
        duration: 0.5,
        ease: 'power2.out'
      })
    }
    
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="ring" ref={ringRef}></div>
  )
}

export default Circle
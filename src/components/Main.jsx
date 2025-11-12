import React from 'react'
import '../styles/Mian.css'
import { ArrowDown } from 'lucide-react'
import { Link } from 'react-router-dom'

// Responsive styles for .circle (inject to head, ONLY for responsiveness, no bg, shadow, etc)


function Main() {
  // Inject responsive .circle style only once
  React.useEffect(() => {
    const styleTag = document.createElement('style');
    
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  return (
    <>
      <div className="main">
        <div className="main-containt">
          <h1>THE GAME OF NINJA'S</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium debitis quasi quae laborum voluptate praesentium! Similique quasi officia, provident ipsam animi eum vero, voluptatibus pariatur illo fuga ab mollitia vel. Sapiente ullam numquam ea tempore deleniti exercitationem dolores nam laborum.
          </p>
        </div>
      </div>
      <div className="m-btn">
        <button>Download</button>
        <Link to="/play">
          <button>Quick Play</button>
        </Link>
      </div>
      <div className="circle">
        <h4 style={{ textAlign: 'center', color: 'white' }}>Scroll down </h4>
        <h6 style={{ textAlign: 'center', color: 'white' }}>
          <ArrowDown size={20} />
        </h6>
      </div>
    </>
  )
}

export default Main
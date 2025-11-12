import React from 'react';
import '../styles/Header.css';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <>
      <nav>
        <div className="logo">
          <h1>Ninje-X</h1>
        </div>

        <div className="slidenav">
          <div className="menu-options">
            <Link className="link-scroll" to="/community">Community</Link>
            <Link className="link-scroll" to="/community">Community</Link>
          </div>

          <div className="menu-options">
            <Link className="link-scroll" to="/products">Products</Link>
            <Link className="link-scroll" to="/products">Products</Link>
          </div>

          <div className="menu-options">
            <Link className="link-scroll" to="/pricing">Pricing</Link>
            <Link className="link-scroll" to="/pricing">Pricing</Link>
          </div>
        </div>

        <button className="h-btn">Sign-in</button>
      </nav>
    </>
  );
}

export default Header;

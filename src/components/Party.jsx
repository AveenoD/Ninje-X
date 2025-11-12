import React from 'react'
import'../styles/Party.css'
import { Link } from 'react-router-dom'
function Party() {
  return (
    <>
    <div className="p-container">
        <img src="newpart.png" alt="image" />
        <h1>Form your party now</h1>
        <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eveniet suscipit dolorem provident ab tempora error distinctio. Assumenda cum, illo quae velit modi ullam dicta perspiciatis error quisquam in voluptate odio quo soluta officia mollitia ducimus accusamus nam enim, esse accusantium.</p>
    <div className="p-btn">
            <button>Download</button>
            <Link to="/play">
                <button>Quick Play</button>
            </Link>
        </div>
    </div>
    </>
  )
}

export default Party
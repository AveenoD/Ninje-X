import React from 'react'
import '../styles/Footer.css'
import {Instagram,Facebook,Twitter,Youtube,Twitch,Linkedin} from 'lucide-react'
function Footer() {
  return (
    <>
     <div className="footer">
        <div className="media">
            <div className="link">

            <Instagram size={40} color="#dd3c6c" />
            <Facebook size={40} color="#4961ecff" />
            <Twitter size={40} color="#4961ecff" />
            <Youtube size={40} color="#e80e0eff" />
            <Twitch size={40} color="#4961ecff" />
            <Linkedin size={40} color="#4961ecff" />
            </div>
            <div className="img">

            <img src="Logo.png" alt="Logo" />
            </div>
            <h5>PRIVACY POLICY <span> | </span> TERMS OF SERVICE <span> | </span> RULES OF CONDUCT <span> | </span> CONTENT CREATION GUIDELINE</h5>
        </div>
        <div className="last-foot">
            <h4>@ All rights reserved || Ninje-X 2025</h4>
        </div>
     </div>
    </>
  )
}

export default Footer
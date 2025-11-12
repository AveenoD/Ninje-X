import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Header from './components/Header'
import Circle from './components/Circle'
import Main from './components/Main'
import Characters from './components/Characters'
import Party from './components/Party'
import Footer from './components/Footer'

function App() {
 

  return (
    <>
    <div className='app'>
     <Header/>
     <Main/>
    </div>
     <Characters/>
     <Party/>
     <Footer/>
    </>
  )
}

export default App

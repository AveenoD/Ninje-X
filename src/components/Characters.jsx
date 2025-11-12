import React from 'react'
import '../styles/Characters.css'
function Characters() {
  return (
    <>
    <div className="main-container-c">

    <div className="container-c">
        <div className="left">
            <img src="healer.png" alt="image" />
        </div>
        <div className="right assasin">
            <h1>THE ASSASIN</h1>
            <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Blanditiis ratione ea eaque aliquid aut molestias, quas nemo iste quo autem, molestiae, repellat minus laborum nihil. Dolorum quas quia ullam fugit quaerat ducimus aperiam recusandae fuga nam velit asperiores, aliquam voluptate!</p>
        </div>
    </div>
    <div className="container-c">
        <div className=" alt-left magician">
            <h1>THE MAGICIAN</h1>
            <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Blanditiis ratione ea eaque aliquid aut molestias, quas nemo iste quo autem, molestiae, repellat minus laborum nihil. Dolorum quas quia ullam fugit quaerat ducimus aperiam recusandae fuga nam velit asperiores, aliquam voluptate!</p>
        </div>
        <div className="alt-right ">
            <img src="wizard.png" alt="" />
        </div>
    </div>
    <div className="container-c">
        <div className="left">
            <img src="wizard.png" alt="image" />
        </div>
        <div className="right echo">
            <h1>THE ECHO OF WAR</h1>
            <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Blanditiis ratione ea eaque aliquid aut molestias, quas nemo iste quo autem, molestiae, repellat minus laborum nihil. Dolorum quas quia ullam fugit quaerat ducimus aperiam recusandae fuga nam velit asperiores, aliquam voluptate!</p>
        </div>
    </div>
    <div className="container-c">
        <div className="alt-left healer">
            <h1>THE HEALER</h1>
            <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Blanditiis ratione ea eaque aliquid aut molestias, quas nemo iste quo autem, molestiae, repellat minus laborum nihil. Dolorum quas quia ullam fugit quaerat ducimus aperiam recusandae fuga nam velit asperiores, aliquam voluptate!</p>   
        </div>
        <div className="alt-right ">
            <img src="/healer.png" alt="image" />
        </div>
    </div>
    </div>
    
    </>
  )
}

export default Characters
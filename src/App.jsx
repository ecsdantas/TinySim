import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/sidebar';
import { Menubar } from './components/menubar';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { Model, Engine } from './nodes/nodeModel' 
import Simulation from './simulation/core';
import { DropElement } from './components/dropElement';
import Modal from './components/modal';
import { SpeedInsights } from "@vercel/speed-insights/react"
import * as Elements from './elements';
import { Zoombar } from './components/zoomControl';


const App = () => {

    // Captura elementos dropados a partir da biblioteca
    DropElement()

    const [getLBarShow, setLBarShow] = useState(true)
    const [getRBarShow, setRBarShow] = useState(false)
    const [getModelStates, setModelStates] = useState({ show: false, title: 'not in use', content: <b>Empty</b>})

    // Funções do menu de simulação
    const MenuOptions = {
        Run: _ => Simulation.run(),
        RunStep: _ => Simulation.runStep(),
        LeftbarToogle: _ => setLBarShow(e => !e),
        RightbarToogle: _ => setRBarShow(e => !e)
    }

    useEffect(()=>{
        
        const InitialText = new Elements.TextModel()
        InitialText.setPosition(330, 30)
        InitialText.text = '<p>Welcome to <b>TinySim</b>.</p><br />' + 
            '<p>You can read the <a href="/instructions.html" target="_blank">instructions here</a>.</p>'
        InitialText.CGenUID = 'txt0'

        Model.addNode(InitialText)
        
        Engine.setModel(Model)
        Simulation.setModel(Model)
        
    }, [])

    return <>
        
        <div className='main'>
            <Sidebar Side='right' Show={getRBarShow} closeFcn={_ => setRBarShow(false)} />
            <Sidebar Side='left' Show={getLBarShow} closeFcn={_ => setLBarShow(false)} />
            <Menubar {...MenuOptions} />
            <Zoombar engine={ Engine } />
            <CanvasWidget className="srd-diagram" engine={Engine}  />
        </div>
        <Modal.container getState={getModelStates} setState={setModelStates}/>
        <SpeedInsights />
    </>

}

export default App;
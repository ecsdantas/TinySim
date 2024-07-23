import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/sidebar';
import { Menubar } from './components/menubar';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { Model, Engine } from './SimNodeModel' 
import Simulation from './simulation/core';
import { DropElement } from './components/dropElement';
import Modal from './components/modal';
import { SpeedInsights } from "@vercel/speed-insights/react"
import { TextModel } from './elements';


const App = () => {

    // Captura elementos dropados a partir da biblioteca
    DropElement()

    const [getLBarShow, setLBarShow] = useState(false)
    const [getRBarShow, setRBarShow] = useState(false)
    const [getModelStates, setModelStates] = useState({ show: false, title: 'not in use', content: <b>Empty</b>})

    // Funções do menu de simulação
    const MenuOptions = {
        Simulate: _ => Simulation.run(),
        LeftbarToogle: _ => setLBarShow(e => !e),
        RightbarToogle: _ => setRBarShow(e => !e)
    }

    useEffect(()=>{
        const InitialText = new TextModel()
        InitialText.setPosition(330, 30)
        InitialText.text = '<p>Welcome to TinySim.</p>' + 
'<p>This blocky simulator is under development and is only compatible with devices with a mouse and keyboard (desktops).</p>' +
'<p>To start, click on library, and drag some components. Connect ports and perform the simulation. All wires must be connected to ports, there are no connections between wires.</p>' +
'<p>Keyboard shortcuts:</p>' +
'1. Delete items: Select the desired item and press [delete] or [del]</p>' +
'2. flip horizontally: select the desired item and press [i] on the keyboard.</p>' +
'3. Configure block: Select desired block and press [o] on the keyboard.</p>' +
'4. Zoom: Rotate the scroll wheel</p>' +
'5. Move item: Select the desired item, click and hold the mouse while dragging.</p>' + 
'<p>You can now delete this message and start simulating.</p>' + 
'Any questions, mail-me: evandson@live.com'
        Model.addNode(InitialText)
        Engine.setModel(Model)    
    }, [])

    return <>
        
        <div className='main'>
            <Sidebar Side='right' Show={getRBarShow} closeFcn={_ => setRBarShow(false)} />
            <Sidebar Side='left' Show={getLBarShow} closeFcn={_ => setLBarShow(false)} />
            <Menubar {...MenuOptions} />
            <CanvasWidget className="srd-diagram" engine={Engine}  />
        </div>
        <Modal.container getState={getModelStates} setState={setModelStates}/>
        <SpeedInsights />
    </>

}

export default App;
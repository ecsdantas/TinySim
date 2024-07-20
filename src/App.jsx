import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/sidebar';
import { Menubar } from './components/menubar';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { Engine } from './SimNodeModel'
import Simulation from './simulation/core';
import { DropElement } from './components/dropElement';

const App = () => {

    // Captura elementos dropados a partir da biblioteca
    DropElement()

    const [getLBarShow, setLBarShow] = useState(true)
    const [getRBarShow, setRBarShow] = useState(false)

    // Funções do menu de simulação
    const MenuOptions = {
        Simulate: _ => Simulation.run(),
        LeftbarToogle: _ => setLBarShow(e => !e),
        RightbarToogle: _ => setRBarShow(e => !e)
    }

    return <>
        
        <div className='main'>
            <Sidebar Side='right' Show={getRBarShow} closeFcn={_ => setRBarShow(false)} />
            <Sidebar Side='left' Show={getLBarShow} closeFcn={_ => setLBarShow(false)} />
            <Menubar {...MenuOptions} />
            <CanvasWidget className="srd-diagram" engine={Engine}  />
        </div>

    </>

}

export default App;
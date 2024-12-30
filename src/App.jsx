import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/sidebar';
import { Menubar } from './components/menubar';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { Model, Engine } from './nodes/nodeModel'
import Simulation from './simulation/core';
import { DropElement } from './components/dropElement';
import Modal from './components/modal';
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Zoombar } from './components/zoomControl';
import { toast, ToastContainer } from 'react-toastify';


const App = () => {

    // Captura elementos dropados a partir da biblioteca
    DropElement()

    const [getLBarShow, setLBarShow] = useState(false)
    const [getRBarShow, setRBarShow] = useState(false)
    const [getModelStates, setModelStates] = useState({ show: false, title: 'not in use', content: <b>Empty</b> })

    // Funções do menu de simulação
    const MenuOptions = {
        Run: _ => Simulation.run(),
        RunStep: _ => Simulation.runStep(),
        Reset: _ => Simulation.resetSimulation(),
        LeftbarToogle: _ => setLBarShow(e => !e),
        RightbarToogle: _ => setRBarShow(e => !e)
    }

    useEffect(() => {

        const HelloWorld = () => (
            <div>
                <p>Welcome to <b>TinySim!</b></p>
                <p>To get started, read the <a href="/instructions.html" target="_blank">instructions</a>.</p>
            </div>
        )
        toast.info(<HelloWorld />, { autoClose: 15000, closeOnClick: false, closeButton: true })

    }, [])

    return <>

        <div className='main'>
            <Sidebar Side='right' Show={getRBarShow} closeFcn={_ => setRBarShow(false)} />
            <Sidebar Side='left' Show={getLBarShow} closeFcn={_ => setLBarShow(false)} />
            <Menubar {...MenuOptions} />
            <Zoombar />
            <CanvasWidget className="srd-diagram" engine={Engine} />
        </div>
        <Modal.container getState={getModelStates} setState={setModelStates} />
        <ToastContainer position="bottom-right"
            autoClose={5000}
            closeOnClick={true}
            className="ts-toast-container"
            progressClassName="ts-toast-progress" draggable />
        <SpeedInsights />
    </>

}

export default App;
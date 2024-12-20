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
        /*
        const InitialText = new TextModel()
        InitialText.setPosition(330, 30)
        InitialText.text = '<p>Welcome to <b>TinySim</b>.</p><br />' + 
            '<p>You can read the <a href="/instructions.html" target="_blank">instructions here</a>.</p>'
        Model.addNode(InitialText)
        */

        /*
        const constant = new ConstantModel()
        constant.setPosition(330, 200)
        
        const display = new DisplayModel()
        display.setPosition(520, 200)
        
        Model.addNode(constant)
        Model.addNode(display)

        
        const dispPort = display.getInPorts()[0]
        const constPort = constant.getOutPorts()[0]
        const link = dispPort.link(constPort)
        Model.addLink(link)
        */
        
        const c1 = new Elements.ConstantModel()
        const c2 = new Elements.ConstantModel()
        const c3 = new Elements.ConstantModel()
        c1.CGenUID = 'in1';
        c2.CGenUID = 'in2';
        c3.CGenUID = 'in3';
        c1.setPosition(330, 200)
        c2.setPosition(330, 260)
        c3.setPosition(330, 320)
        c1.value = 5;
        c2.value = 4;
        c3.value = 3;
        Model.addNode(c1)
        Model.addNode(c2)
        Model.addNode(c3)
        const add3 = new Elements.AddModel()
        add3.setPosition(530, 260)
        add3.addInPort("in3", 1)
        Model.addNode(add3)
        const disp = new Elements.DisplayModel()
        disp.setPosition(730, 260)
        disp.CGenUID = 'out1'
        Model.addNode(disp)
        
        const createLink = (source, destination) => Model.addLink( source.link(destination) )
        
        createLink(disp.getInPorts()[0], add3.getOutPorts()[0])
        createLink(add3.getInPorts()[0], c1.getOutPorts()[0])
        createLink(add3.getInPorts()[1], c2.getOutPorts()[0])
        createLink(add3.getInPorts()[2], c3.getOutPorts()[0])
        

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
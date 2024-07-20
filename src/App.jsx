import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/sidebar';
import { Menubar } from './components/menubar';

import * as Models from './elements'

import { CanvasWidget } from '@projectstorm/react-canvas-core';

import { Engine as engine, Model as model, SimNodeModel } from './SimNodeModel'
import DragAndDrop from './dragndrop'
import Simulation from './simulation/core';

const App = () => {

    useEffect(()=>{
        const handleDrop = (event) => {
            event.preventDefault();

            const data = event.dataTransfer.getData('drag-block');
            const nodeData = JSON.parse(data);
            const newNode = new Models[nodeData.modelName]({name: nodeData.modelName.replace('Model','')})
            newNode.setPosition(event.clientX - event.target.offsetLeft,
                                event.clientY - event.target.offsetTop);
            model.addNode(newNode);
            engine.setModel(model);
            Simulation.setModel(model);
        };

        const handleDragOver = (event) => {
            event.preventDefault();
        };

        const canvas = document.querySelector('.srd-diagram');
        canvas.addEventListener('drop', handleDrop);
        canvas.addEventListener('dragover', handleDragOver);

        return () => {
            canvas.removeEventListener('drop', handleDrop);
            canvas.removeEventListener('dragover', handleDragOver);
        };
    })


    /*
    useEffect(()=>{
  
        /*
        const link = port1.link(port2);
        link.addLabel('Hello World!');

        const node1 = new Models.ConstantModel({ name: 'G1' }, 9);
        node1.setPosition(320, 100);
        const node2 = new Models.ConstantModel({ name: 'G2' }, 1/3);
        node2.setPosition(320, 200);
        model.addAll(node1, node2);
        engine.setModel(model);        

    },[])
       */


    
    const [getLBarShow, setLBarShow] = useState(false)
    const [getRBarShow, setRBarShow] = useState(false)

    const Simula = () => {
        
        // Núcleo de simulação
        const simControl = {
            step: 0,
            timeVector:  [0, 1, 2, 3, 4]
        }
        const simNode = model.getNodes()[3]

        for(; simControl.step < simControl.timeVector.length; simControl.step++){
        
            simNode.solve(simControl)
        }
        
    }

    // Funções do menu de simulação
    const MenuOptions = {
        Simulate: _ => Simulation.run(),
        LeftbarToogle: _ => setLBarShow(e => !e),
        RightbarToogle: _ => setRBarShow(e => !e)
    }

    return <>
        {
        
        /*
        
        <Sidebar Side='right' Show={getRBarShow} closeFcn={_ => setRBarShow(false)} />
        <Sidebar Side='left' Show={getLBarShow} closeFcn={_ => setLBarShow(false)} />
        */ }
        <div className='main'>
            <DragAndDrop />
            <CanvasWidget className="srd-diagram" engine={engine}  />
            <Menubar {...MenuOptions} />
        </div>

    </>

}

export default App;
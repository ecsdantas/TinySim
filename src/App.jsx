import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/sidebar';
import { Menubar } from './components/menubar';

import { ConstantModel, AddModel, DisplayModel } from './elements'
import { CanvasWidget } from '@projectstorm/react-canvas-core';

import { Engine as engine, Model as model, SimNodeModel } from './SimNodeModel'
import DragAndDrop from './dragndrop'

const App = () => {

   
    useEffect(()=>{
        const handleDrop = (event) => {
            event.preventDefault();

            const data = event.dataTransfer.getData('drag-block');
            const nodeData = JSON.parse(data);

            const node = new SimNodeModel({ name: nodeData.name, color: nodeData.color });
            node.setPosition(event.clientX - event.target.offsetLeft, event.clientY - event.target.offsetTop);
            node.createPort('Out', false);
            node.createPort('In', true);
            
            model.addNode(node);
            engine.setModel(model);
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


    useEffect(()=>{

        
        
        /*
        const link = port1.link(port2);
        link.addLabel('Hello World!');
        */

        const node1 = new ConstantModel({ name: 'G1' }, 9);
        node1.setPosition(320, 100);

        const node2 = new ConstantModel({ name: 'G2' }, 1/3);
        node2.setPosition(320, 200);

        const node3 = new AddModel({ name: 'A1' });
        node3.setPosition(420, 100);

        const node4 = new DisplayModel({ name: 'D1' });
        node4.setPosition(520, 100);

        model.addAll(node1, node2, node3, node4);
        engine.setModel(model);

    },[])

    
   
    

    const [getLBarShow, setLBarShow] = useState(false)
    const [getRBarShow, setRBarShow] = useState(false)

    const Simula = () => {
        //_ => console.dir(node2.getNodeByInput(0)?.getOptions().name)
        const addnode = model.getNodes()[3]
        console.log(addnode.solve())
        engine.setModel(model);
    }

    // Funções do menu de simulação
    const MenuOptions = {
        Simulate: _ => Simula(),
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
            <button style={{ position: 'absolute', top: '20px', left: '400px'}} onClick={ Simula }>Simulate</button>
        </div>

    </>

}

export default App;
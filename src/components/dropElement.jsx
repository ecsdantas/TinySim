import React, { useEffect } from 'react';
import { ModelsArray } from '../elements'
import { Engine, Model } from '../SimNodeModel'
import Simulation from '../simulation/core';

const DropElement = () => {

    useEffect(()=>{
        const handleDrop = (event) => {
            event.preventDefault();
            const index = Number(event.dataTransfer.getData('drag-block'));            
            const newNode = new ModelsArray[index]()
            newNode.setPosition(event.clientX - event.target.offsetLeft,
                                event.clientY - event.target.offsetTop);
            Model.addNode(newNode);
            Engine.setModel(Model);
            Simulation.setModel(Model);
        };

        const handleDragOver = (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move'
        };

        const canvas = document.querySelector('.srd-diagram');
        canvas.addEventListener('drop', handleDrop);
        canvas.addEventListener('dragover', handleDragOver);

        return () => {
            canvas.removeEventListener('drop', handleDrop);
            canvas.removeEventListener('dragover', handleDragOver);
        };
    })

}

export { DropElement }
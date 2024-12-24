import React, { useEffect } from 'react';
// import { ModelsArray } from '../elements';
import { Engine, Model } from '../nodes/nodeModel';
import Simulation from '../simulation/core';
import * as Elements from "../elements";

const ModelsArray = {};
Object.entries(Elements).forEach(([name, model]) => {
    ModelsArray[name] = model;
});

const DropElement = () => {

    useEffect(() => {
        const handleDrop = (event, useTouch = false) => {
            event.preventDefault();
            const modelName = event.dataTransfer.getData('drag-block')
            if (!modelName)
                return

            const newNode = new ModelsArray[modelName]();
            const canvasRect = event.target.getBoundingClientRect();
            if (useTouch){
                const touch = event?.changedTouches[0];
                newNode.setPosition(
                    touch.clientX - canvasRect.left - newNode.width / 2,
                    touch.clientY - canvasRect.top - newNode.height / 2
                );
            }else{
                newNode.setPosition(
                    event.clientX - canvasRect.left - newNode.width / 2, // Corrigir bug do centralizar
                    event.clientY - canvasRect.top - newNode.height / 2  // widht não carrega antes de ser setado.
                );
            }
            
            // Cria IDs unicos
            const existingUIDs = new Set(Model.getNodes().map(n => n.CGenUID));
            let i = 0;
            while (existingUIDs.has(newNode.CGenUID + i)) {
                i++;
            }
            newNode.CGenUID += i;

            Model.addNode(newNode);
            Engine.setModel(Model);
            Simulation.setModel(Model);
            
        };

        const handleDragOver = (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
        };

        const handleTouchEnd = (event) => {
            handleDrop(event, useTouch = true);
        };

        const canvas = document.querySelector('.srd-diagram');
        canvas.addEventListener('drop', handleDrop);
        canvas.addEventListener('dragover', handleDragOver);
        canvas.addEventListener('touchend', handleTouchEnd);

        return () => {
            canvas.removeEventListener('drop', handleDrop);
            canvas.removeEventListener('dragover', handleDragOver);
            canvas.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);


};

export { DropElement };

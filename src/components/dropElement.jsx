import React, { useEffect } from 'react';
// import { ModelsArray } from '../elements';
import { Engine, Model } from '../nodes/nodeModel';
import Simulation from '../simulation/core';
import * as Elements from "../elements";

const ModelsArray = Object.entries(Elements)

const DropElement = () => {

    useEffect(() => {
        const handleDrop = (event) => {
            event.preventDefault();
            const index = Number(event.dataTransfer.getData('drag-block'));
            const newNode = new ModelsArray[index][1]();
            const canvasRect = event.target.getBoundingClientRect();
            newNode.setPosition(
                event.clientX - canvasRect.left - newNode.width / 2,
                event.clientY - canvasRect.top - newNode.height / 2
            );

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
            event.preventDefault();
            const touch = event.changedTouches[0];
            const index = Number(event.target.dataset.dragBlock);
            if (index !== undefined) {
                const newNode = new ModelsArray[index]();
                const canvas = document.querySelector('.srd-diagram');
                const canvasRect = canvas.getBoundingClientRect();
                newNode.setPosition(
                    touch.clientX - canvasRect.left - newNode.width / 2,
                    touch.clientY - canvasRect.top - newNode.height / 2
                );
                Model.addNode(newNode);
                Engine.setModel(Model);
                Simulation.setModel(Model);
            }
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

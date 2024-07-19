import React from 'react';
import './assets/css/dragndrop.css';

const DragAndDrop = () => {
    const handleDragStart = (event, nodeData) => {
        event.dataTransfer.setData('drag-block', JSON.stringify(nodeData));
    };

    return (
        <div className="drag-and-drop">
            <div className="drag-item" draggable onDragStart={(event) => handleDragStart(event, { name: 'Node 1', kind: 'generic' })}>
                Generic
            </div>
            <div className="drag-item" draggable onDragStart={(event) => handleDragStart(event, { name: 'Node 1', kind: 'generic' })}>
                Constant
            </div>
            <div className="drag-item" draggable onDragStart={(event) => handleDragStart(event, { name: 'Node 1', kind: 'generic' })}>
                adder
            </div>
        </div>
    );
};

export default DragAndDrop;

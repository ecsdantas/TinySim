import React from 'react';
import './assets/css/dragndrop.css';
import * as Models from './elements'

const DragAndDrop = () => {

    const modelsArray = Object.values(Models);

    const handleDragStart = (event, nodeData) => {
        event.dataTransfer.setData('drag-block', JSON.stringify(nodeData));
    };

    return (
        <div className="drag-and-drop">
            <div className='library'>
            {
                modelsArray.map((model) => {
                    const modelInitialized = new model()
                    return (
                        <div
                            key={`models-${model.name}`}
                            className='library-modal'
                            draggable
                            onDragStart={(event) => handleDragStart(event, { modelName: model.name })}>
                            { modelInitialized.icon && <div style={{margin:'0 auto'}}> { modelInitialized.icon() } </div> }
                            { model.name && <div style={{margin:'0 auto'}}> {model.name.replace('Model','') } </div> }
                        </div>
                    )

                })            
            }
            </div>

        </div>
    );
};

export default DragAndDrop;

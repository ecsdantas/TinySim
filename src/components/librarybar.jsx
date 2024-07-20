import React from "react"
import * as Models from '../elements'

export const LibraryList = () => {
    
    const modelsArray = Object.values(Models);
    const handleDragStart = (event, nodeData) => {
        event.dataTransfer.setData('drag-block', nodeData.modelName);
    };

    return (
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
    )

}
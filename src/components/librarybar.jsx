import React from "react"
import { ModelsArray } from "../elements";

export const LibraryList = () => {

    return (
        <div className='library'>
            {
                ModelsArray.map((ModelConstructor,index) => {
                    const Model = new ModelConstructor()
                    return (
                        <div
                            key={`models-${Model.getModelName()}`}
                            className='library-modal'
                            draggable
                            onDragStart={(event) => event.dataTransfer.setData('drag-block', index)} 
                            >
                            { Model.icon && <div style={{margin:'0 auto'}}> { Model.icon() } </div> }
                            { Model.kind && <div style={{margin:'0 auto'}}> { Model.kind } </div> }
                        </div>
                    )
                })
            }
        </div>
    )

}
import React from "react";
import * as Elements from "../elements";
import { Engine } from "../nodes/nodeModel";

const ModelsArray = Object.entries(Elements)

export const LibraryList = () => {
    const [getSearch, setSearch] = React.useState('');

    const handleDragStart = (event, modelName) => {
        event.dataTransfer.setData('drag-block', modelName);
    };

    const handleTouchStart = (event, modelName) => {
        const touch = event.touches[0];
        event.target.dataset.dragBlock = modelName;
        
        // Store the initial touch position
        event.target.dataset.startX = touch.clientX;
        event.target.dataset.startY = touch.clientY;
    };

    const handleTouchMove = (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        const target = event.target;

        // Calculate the new position
        const deltaX = touch.clientX - target.dataset.startX;
        const deltaY = touch.clientY - target.dataset.startY;

        // Simulate the drag movement
        target.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    };

    const handleTouchEnd = (event) => {
        const touch = event.changedTouches[0];
        const modelName = event.target.dataset.dragBlock;
        if (modelName !== undefined) {
            // Simulate the drop event
            const dropEvent = new Event('drop', {
                bubbles: true,
                cancelable: true,
            });
            dropEvent.clientX = touch.clientX;
            dropEvent.clientY = touch.clientY;
            dropEvent.dataTransfer = {
                getData: () => modelName
            };
            document.querySelector('.srd-diagram').dispatchEvent(dropEvent);
        }

        // Reset the element's transform property
        event.target.style.transform = '';
    };

    const preventChanges = () => {
        const selectedEntities = Engine.getModel().getSelectedEntities();
        selectedEntities.forEach((entity) => {
            entity.setSelected(false);
        });
        Engine.repaintCanvas();
    }

    return (
        <div className="library-container">
            <input className="search" value={getSearch} onChange={(e) => setSearch(e.target.value)} onFocus={ preventChanges }/>
            <div className="library">
                {ModelsArray.filter(([modelName, ModelClass]) => {
                    const Model = new ModelClass();
                    const tags = Model.tags || []; // Garante que tags é um array ou vazio
    
                    // Verifica se o termo de busca aparece no nome do modelo ou nas tags
                    return (
                        modelName.toLowerCase().includes(getSearch.toLowerCase()) ||
                        tags.some((tag) => tag.toLowerCase().includes(getSearch.toLowerCase()))
                    );
                }).map(([modelName, ModelClass]) => {
                    const Model = new ModelClass();
                    return (
                        <div
                            key={`models-${modelName}`}
                            className="library-modal"
                            draggable
                            onDragStart={(event) => handleDragStart(event, modelName)}
                            onTouchStart={(event) => handleTouchStart(event, modelName)}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            {Model.icon && <div style={{ margin: "0 auto" }}>{Model.icon()}</div>}
                            {Model.kind && <div style={{ margin: "0 auto" }}>{Model.kind}</div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
    
};

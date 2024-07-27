import React from "react";
import { ModelsArray } from "../elements";

export const LibraryList = () => {
    const handleDragStart = (event, index) => {
        event.dataTransfer.setData('drag-block', index);
    };

    const handleTouchStart = (event, index) => {
        const touch = event.touches[0];
        event.target.dataset.dragBlock = index;
        
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
        const index = event.target.dataset.dragBlock;
        if (index !== undefined) {
            // Simulate the drop event
            const dropEvent = new Event('drop', {
                bubbles: true,
                cancelable: true,
            });
            dropEvent.clientX = touch.clientX;
            dropEvent.clientY = touch.clientY;
            dropEvent.dataTransfer = {
                getData: () => index
            };
            document.querySelector('.srd-diagram').dispatchEvent(dropEvent);
        }

        // Reset the element's transform property
        event.target.style.transform = '';
    };

    return (
        <div className='library'>
            {
                ModelsArray.map((ModelConstructor, index) => {
                    const Model = new ModelConstructor();
                    return (
                        <div
                            key={`models-${Model.getModelName()}`}
                            className='library-modal'
                            draggable
                            onDragStart={(event) => handleDragStart(event, index)}
                            onTouchStart={(event) => handleTouchStart(event, index)}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            {Model.icon && <div style={{ margin: '0 auto' }}> {Model.icon()} </div>}
                            {Model.kind && <div style={{ margin: '0 auto' }}> {Model.kind} </div>}
                        </div>
                    );
                })
            }
        </div>
    );
};

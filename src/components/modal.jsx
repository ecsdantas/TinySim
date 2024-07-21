import React, { useState } from 'react';
import closeSVG from '../assets/icons/close-black.svg';
import Editor from 'react-simple-wysiwyg';

const Modal = {}
const useModal = {}

Modal.container = (props) => {

    const { getState, setState } = props
    
    // Bind
    useModal.getShow = getState.show
    useModal.getTitle = getState.title
    useModal.getContent = getState.content
    useModal.setShow = (show) => setState(oldState => ({...oldState, show: show}))
    useModal.setTitle = (title) => setState(oldState => ({...oldState, title: title}))
    useModal.setContent = (content) => setState(oldState => ({...oldState, content: content}))

    return (
        getState.show && (
            <div className="modal display-block">
                <section className="modal-main">
                    <div className="modal-header">
                        <h3>{getState.title}</h3>
                        <img src={closeSVG} width={24} onClick={() => useModal.setShow(false)} alt="Close" />
                    </div>
                    {getState.content}
                    
                </section>
            </div>
        )
    );
};

export default Modal;
export { useModal }
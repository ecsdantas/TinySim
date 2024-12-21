import React from 'react';

const Modal = {}
const useModal = {}

useModal.configure = (block, title, body, show) => {
    block.setSelected(false)
    useModal.setTitle(title)
    useModal.setContent(body)
    useModal.setShow(show)
}

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
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" height={ 24 } width={ 24 } onClick={() => useModal.setShow(false)} alt="Close">
                            <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m18 18-6-6m0 0L6 6m6 6 6-6m-6 6-6 6"/>
                        </svg>
                    </div>
                    {getState.content}
                </section>
            </div>
        )
    );
};

export default Modal;
export { useModal }
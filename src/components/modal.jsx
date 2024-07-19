import React from "react";
import closeSVG from "../assets/icons/close-black.svg"
const Modal = (props) => {
    const { show, handleClose, children, title } = props
    return (
        show && <div className="modal display-block">
            <section className="modal-main">
                <div className="modal-header">
                    <h3>{title ?? 'Block parameter'}</h3>
                    <img src={closeSVG} width={ 24 } onClick={handleClose}/>
                </div>
                {children}
            </section>
        </div>
    );
};

export default Modal;
import React, { useState } from 'react';
import { SimNodeModel } from '../SimNodeModel'
import Modal from '../components/modal';

const Settings = (props) => {
    const [getShow, setShow] = useState(false);
    return (
        <>
            <button onClick={ _ => setShow(e => !e)} className='settings-button'>⚙️</button>
            <Modal show={getShow} handleClose={ _ => setShow(false)} children={<>Hello world 2!</>} title={'Test Modal'} />
        </>
    )
}

class DisplayModel extends SimNodeModel {

    kind = 'display'
    isTerminalBlock = true
    settings = Settings
    
    constructor(options = {}) {
        super({...options});
        this.createPort('in', true);
        this.value = null;
        this.component = null;
    }

    // Função principal do bloco
    solution() {
        const inpt = this.getNodeByInput(0);
        if (inpt && inpt.solve) {
            this.value = inpt.solve();
            if (this.component) {
                this.component.forceUpdate();
            }
            return this.value;
        }
    }

    icon = () => <svg width={100} height={30} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x={4} y={0} width={'100%'} height={'100%'} fill='#000000' /> 
        <text x="10" y={ (30+12)/2 - 1 } fontSize={12} fill='#FFFFFF'>{this.value}</text>
    </svg>
    
    
}

export default DisplayModel
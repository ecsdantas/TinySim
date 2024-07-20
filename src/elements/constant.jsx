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

class ConstantModel extends SimNodeModel {

    kind = 'constant'
    icon = _ => Icon(this.value)
    settings = Settings
    value = 0

    constructor(options = {}, value = 10) {
        super({...options});
        
        // Create the ports of add model
        this.createPort('out', false);
        this.value = value
    }

    // Função principal do bloco
    solution() { 
        return this.value
    }

    icon = _ => <svg width={ 32 } height={ 32 } viewBox={`0 0 100 100`} fill="none" xmlns="http://www.w3.org/2000/svg" >
        <rect x={5} y={5} width={ 90 } height={ 90 } stroke="#000000" strokeWidth={1.8} strokeLinejoin="round" />
        <text x="50" y="65" fontFamily="Arial" fontSize={ 40 - 2*this.value.toString().slice(0,5).length } textAnchor="middle" fill="#000000">{this.value.toString().slice(0,5)}</text>
    </svg>
}

export default ConstantModel
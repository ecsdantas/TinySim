import React, { useEffect, useState } from "react"

import { InputGroup } from "./inputGroup"
import Simulation from "../simulation/core"

export const SettingsList = (props) => {

    // const {Side, Show, closeFcn} = props
    const [getStepTime, setStepTime] = useState(Simulation.getStepTime())
    const [getStopTime, setStopTime] = useState(Simulation.getStopTime())

    const isValid = () => {
        const stepTime = Number(getStepTime)
        const stopTime = Number(getStopTime)
        return (stepTime>0 && getStopTime >= getStepTime && ( stopTime / stepTime )  <= 10000)
    }

    useEffect(()=>{
        const stepTime = Number(getStepTime)
        const stopTime = Number(getStopTime)
        if ( isValid() ) {
            Simulation.setSimulationTime(stepTime, stopTime)
        }
    },[getStepTime, getStopTime])
    
    const handleNumber = (text, func) => {
        const match = text.match(/^\d*\.?\d*$/);
        if (match) {
            console.dir("set: " + Number(match[0]))
            func( match[0] )
        }
    }

    return (
        <div className="settings">
            <div className="group-frame">
                <h3>Simulation Settings</h3>
                {  !isValid() && <span className="danger">⚠️ Invalid settings!</span>}
                <InputGroup type="text" label='Step time' value={ getStepTime } setValue={ e => handleNumber(e, setStepTime) } unit='s' />
                <InputGroup type="text" label='Stop time' value={ getStopTime } setValue={ e => setStopTime(e) } unit='s' />
                <InputGroup type="checkbox" label='Save log' disabled />
            </div>
            
        </div>
    )

}
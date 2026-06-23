import React, { useEffect, useState } from "react"

import { InputGroup, CheckGroup, SwitchGroup, SelectGroup} from "./inputGroup"
import Simulation from "../simulation/core"
import { INTEGRATION_METHODS } from "../simulation/integrationMethods"

export const SettingsList = (props) => {

    // const {Side, Show, closeFcn} = props
    const [getStepTime, setStepTime] = useState(Simulation.getStepTime())
    const [getStopTime, setStopTime] = useState(Simulation.getStopTime())
    const [getUseStateless, setUseStateless] = useState(Simulation.statelessMode)
    const [getRealTime, setRealTime] = useState(Simulation.realTimeMode)
    const [getConsoleLog, setConsoleLog] = useState(Simulation.saveLog)
    const [getMethod, setMethod] = useState(Simulation.getMethod())

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
        Simulation.statelessMode = getUseStateless
        Simulation.realTimeMode = getRealTime
        Simulation.saveLog = getConsoleLog
        Simulation.setMethod(Number(getMethod))
    },[getStepTime, getStopTime, getUseStateless, getRealTime, getConsoleLog, getMethod])
    
    const handleNumber = (text, func) => {
        const match = text.match(/^\d*\.?\d*$/);
        if (match) {
            // console.dir("set: " + Number(match[0]))
            func( match[0] )
        }
    }

    return (
        <div className="settings">
            <div className="group-frame">
                <h3>Simulation Settings</h3>
                <SwitchGroup type="checkbox" label="Real Time" value={ getRealTime } setValue={ e => setRealTime(e) } />
                <SwitchGroup type="checkbox" label="Console Log" value={ getConsoleLog } setValue={ e => setConsoleLog(e) } />
                {  !isValid() && <span className="danger">⚠️ Invalid settings!</span> }
                { !getRealTime && <InputGroup type="text" label='Step time' value={ getStepTime } setValue={ e => handleNumber(e, setStepTime) } unit='s' disabled={getRealTime}/> }
                { !getRealTime && <InputGroup type="text" label='Stop time' value={ getStopTime } setValue={ e => setStopTime(e) } unit='s' disabled={getRealTime}/> }
                <div title={ 'Defines the numerical method used to solve dynamic blocks (Integrator, First Order).' }>
                    <SelectGroup label='Integration method' options={ INTEGRATION_METHODS } value={ getMethod } setValue={ e => setMethod(e) } /></div>
                <div  title={ 'Forces to solve a block every time it is accessed, even if its already solved. Use only if you have troubles.' }>
                    <CheckGroup type="checkbox" label='Force stateless' value={getUseStateless} setValue={ e => setUseStateless(e) }/></div>
                </div>
            
        </div>
    )

}
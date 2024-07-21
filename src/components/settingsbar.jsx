import React from "react"

import { InputGroup } from "./inputGroup"

export const SettingsList = (props) => {

    // const {Side, Show, closeFcn} = props

    return (
        <div className="settings">
            <div className="group-frame">
                <h3>Simulation Settings</h3>
                <InputGroup type="text" label='Step time' value={ 0.1 } unit='s' />
                <InputGroup type="text" label='Stop time' value={ 10 } unit='s' />
                <InputGroup type="checkbox" label='Save log' disabled />
            </div>
            
        </div>
    )

}
import React from "react"
import LibrarySVG from "../assets/icons/library-white.svg"
import PlaySVG from "../assets/icons/play-white.svg"
import SettingsSVG from "../assets/icons/settings-white.svg"

const iconSizes = { width: 32, height: 32 }

export const Menubar = (props) => {

    const {LeftbarToogle, RightbarToogle, Simulate} = props
    
    return (
        <div className='menubar'>
            <img src={ LibrarySVG } {...iconSizes} onClick={ LeftbarToogle }/>
            <img src={ PlaySVG } {...iconSizes} onClick={ Simulate }/>
            <img src={ SettingsSVG } {...iconSizes}  onClick={ RightbarToogle }/>
        </div>
    )

}
import React from "react"
import closeSVG from '../assets/icons/close-white.svg'
import { SettingsList } from "./settingsbar"
import { LibraryList } from "./librarybar"

const Content = {
                    "left": {"title":"Library", "component": LibraryList},
                    "right": {"title":"Settings", "component": SettingsList}
                }

const SidebarTitle = (props) => {
    const {Side, closeFcn} = props
    return (<>
        <div className="flex-container">
            <h4>{ Content[Side].title ?? 'Unknown' }</h4>
            <button onClick={ closeFcn } title="close">
                <img className="close" src={ closeSVG } width={ 26 } height={ 26 } />
            </button>
        </div>
    </>)
}

export const Sidebar = (props) => {

    const {Side, Show} = props
    const Component = Content[Side].component
    
    return (
        <div className={`sidebar ${Side ?? 'left'} ${Show ? 'show' : ''}`}>
            <SidebarTitle {...props}/>
            <Component {...props}/>
        </div>
    )

}
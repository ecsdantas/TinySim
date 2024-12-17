import React, { useState } from "react"
import LibrarySVG from "../assets/icons/library-white.svg"
import PlaySVG from "../assets/icons/play-white.svg"
import PlayStepSVG from "../assets/icons/playStep-white.svg"
import SettingsSVG from "../assets/icons/settings-white.svg"
import downloadSVG from "../assets/icons/download.svg"
import uploadSVG from "../assets/icons/upload.svg"
import fileSVG from "../assets/icons/file.svg"
import CodeSVG from "../assets/icons/code.svg"
import BoxSVG from "../assets/icons/box.svg"
import { Engine } from "../nodes/nodeModel"
import Simulation from "../simulation/core"
import JSZip from "jszip";


const iconSizes = { width: 28, height: 28 }

const FileMenu = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const menuIconSizes =  { width: 16, height: 16 }

    const load = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                const text = await file.text();
                const modelData = JSON.parse(text);
                const EngModel = Engine.getModel()
                EngModel.deserializeModel(modelData, Engine);
                Engine.repaintCanvas();
                Simulation.setModel(EngModel);
            }
        };
        input.click();
    }
    
    const save = () => {
        const modelData = Engine.getModel().serialize();
        const modelJson = JSON.stringify(modelData, null, 2);

        const blob = new Blob([JSON.stringify(modelData, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        
        const zip = new JSZip();
        zip.file("model.json", modelJson)
        zip.generateAsync({type:blob}).then( (content) => {
            link.href = URL.createObjectURL(content)
            link.download = 'schematic.tsim';
            link.click();
        })

    }

    return (
        <div className="dropdown dropup">
            <img src={fileSVG} {...iconSizes} onClick={() => setShowDropdown(prev => !prev)} title="File options"/>
            <ul className={`dropdown-menu ${showDropdown ? 'show' : ''}`} onMouseLeave={() => setShowDropdown(false)} onClick={ () => setShowDropdown(false) }>
                <li><img src={BoxSVG} {...menuIconSizes} title={'Load a sample diagram'} /> Samples diagram</li>
                <hr className="dropdown-divider" />
                <li onClick={load} ><img src={uploadSVG} {...menuIconSizes} title={'Load'} /> Load diagram</li>
                <li onClick={save} ><img src={downloadSVG} {...menuIconSizes} title={'Save'} /> Download diagram</li>
            </ul>
        </div>
    );
};


export const Menubar = (props) => {

    const { LeftbarToogle, RightbarToogle, Run, RunStep } = props

    return (
        <div className='menubar'>
            <FileMenu />
            <img src={LibrarySVG} {...iconSizes} onClick={LeftbarToogle} title="Library" />
            <img src={PlaySVG} {...iconSizes} onClick={Run} title="Run/Stop" />
            <img src={PlayStepSVG} {...iconSizes} onClick={RunStep} title="Run Step" />
            <img src={SettingsSVG} {...iconSizes} onClick={RightbarToogle} title="Settings" />
            {false && <img src={CodeSVG} {...iconSizes} onClick={ _ => alert('Comming soon...') } title="Code generation" />}
        </div>
    )

}
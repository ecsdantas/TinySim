import React from "react"
import LibrarySVG from "../assets/icons/library-white.svg"
import PlaySVG from "../assets/icons/play-white.svg"
import SettingsSVG from "../assets/icons/settings-white.svg"
import downloadSVG from "../assets/icons/download.svg"
import uploadSVG from "../assets/icons/upload.svg"
import { Engine } from "../nodes/nodeModel"
import Simulation from "../simulation/core"

const iconSizes = { width: 32, height: 32 }

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
    const blob = new Blob([JSON.stringify(modelData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'TinySim_Model.json';
    link.click();
}


export const Menubar = (props) => {

    const { LeftbarToogle, RightbarToogle, Simulate } = props

    return (
        <div className='menubar'>
            <img src={uploadSVG} {...iconSizes} onClick={load} title={'Load'} />
            <img src={downloadSVG} {...iconSizes} onClick={save} title={'Save'} />
            <img src={LibrarySVG} {...iconSizes} onClick={LeftbarToogle} />
            <img src={PlaySVG} {...iconSizes} onClick={Simulate} />
            <img src={SettingsSVG} {...iconSizes} onClick={RightbarToogle} />
        </div>
    )

}
import React, { useState, useEffect } from "react"
import LibrarySVG from "../assets/icons/library-white.svg"
import PlaySVG from "../assets/icons/play-white.svg"
import ResetSVG from "../assets/icons/reset.svg"
import PlayStepSVG from "../assets/icons/playStep-white.svg"
import SettingsSVG from "../assets/icons/settings-white.svg"
import downloadSVG from "../assets/icons/download.svg"
import uploadSVG from "../assets/icons/upload.svg"
import fileSVG from "../assets/icons/file.svg"
import CodeSVG from "../assets/icons/code.svg"
import BoxSVG from "../assets/icons/box.svg"
import CodeGeneration  from "../codeGeneration/codeGen"
import { Engine } from "../nodes/nodeModel"
import Simulation from "../simulation/core"
import JSZip from "jszip";
import { saveDiagram } from "../nodes/diagramIO"
import { Samples } from "./samples"
import { toast } from "react-toastify"

const iconSizes = { width: 28, height: 28 }

// Texto do indicador de progresso da simulação. Modo padrão: percentual do
// stopTime; tempo real (sem fim definido): o tempo simulado.
export function formatProgress(progress) {
    if (!progress || !progress.running) return ''
    if (progress.realTime) return `t = ${progress.currentTime.toFixed(1)} s`
    return `${Math.floor(progress.fraction * 100)}%`
}

// Estado de execução do engine, atualizado pelo subscribe() a cada fatia
export function useSimulationProgress(engine = Simulation) {
    const [progress, setProgress] = useState(() => engine.getProgress())
    useEffect(() => engine.subscribe(setProgress), [engine])
    return progress
}

const StopIcon = ({ title, ...props }) => (
    <svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer' }} {...props}>
        <title>{title}</title>
        <circle cx="14" cy="14" r="12" fill="none" stroke="#ffffff" strokeWidth="2" />
        <rect x="9" y="9" width="10" height="10" rx="1" fill="#ff6b6b" />
    </svg>
)

const RunStopButton = ({ Run }) => {
    const progress = useSimulationProgress()
    if (!progress.running) {
        return <img src={PlaySVG} {...iconSizes} onClick={Run} title="Run/Stop  ([ALT] + [1])" />
    }
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <StopIcon {...iconSizes} onClick={Run} role="button" aria-label="Stop simulation" title="Stop  ([ALT] + [1])" />
            <span className="sim-progress" data-testid="sim-progress" style={{ fontSize: 12, minWidth: 40, fontVariantNumeric: 'tabular-nums' }}>
                {formatProgress(progress)}
            </span>
        </span>
    )
}

const FileMenu = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const menuIconSizes =  { width: 16, height: 16 }

    const load = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.tsim';
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                try {
                    const zip = new JSZip();
                    const content = await zip.loadAsync(file); // Load the ZIP file
    
                    if (content.files['model.json']) {
                        const modelText = await content.files['model.json'].async('text'); // Extract model.json
                        const modelData = JSON.parse(modelText);
    
                        const EngModel = Engine.getModel();
                        EngModel.deserializeModel(modelData, Engine);
    
                        Engine.repaintCanvas();
                        Simulation.setModel(EngModel);
                    } else {
                        console.error("Invalid .tsim file: model.json not found.");
                    }
                } catch (error) {
                    console.error("Error loading .tsim file:", error);
                }
            }
        };
        input.click();
    };
    
    
    const save = () => saveDiagram(Engine);


    return (
        <div className="dropdown dropup">
            <img src={fileSVG} {...iconSizes} onClick={() => setShowDropdown(prev => !prev)} title="File options"/>
            <ul className={`dropdown-menu ${showDropdown ? 'show' : ''}`} onMouseLeave={() => setShowDropdown(false)} onClick={ () => setShowDropdown(false) }>
                <li onClick={Samples}><img src={BoxSVG} {...menuIconSizes} title={'Load a sample diagram'} /> Samples diagram</li>
                <hr className="dropdown-divider" />
                <li onClick={load} ><img src={uploadSVG} {...menuIconSizes} title={'Load'} /> Load diagram</li>
                <li onClick={save} ><img src={downloadSVG} {...menuIconSizes} title={'Save ([Ctrl] + [S])'} /> Download diagram</li>
            </ul>
        </div>
    );
};

const CGen = () => {
    const CodeGen = new CodeGeneration(Engine.getModel(), Simulation)
    toast.promise(CodeGen.compileC(), {
        pending: 'Generating code...',
        success: 'Code generated successfully!',
        error: {
            render({ data }) {
                return `Failed to generate code: ${data?.message || data}`;
            }
        }
    })
}

export const Menubar = (props) => {

    const { LeftbarToogle, RightbarToogle, Run, RunStep, Reset } = props

    return (
        <div className='menubar'>
            <FileMenu />
            <img src={LibrarySVG} {...iconSizes} onClick={LeftbarToogle} title="Library" />
            <RunStopButton Run={Run} />
            <img src={PlayStepSVG} {...iconSizes} onClick={RunStep} title="Run Step ([ALT] + [2])" />
            <img src={ResetSVG} {...iconSizes} onClick={Reset} title="Reset Simulation  ([ALT] + [3])" />
            <img src={SettingsSVG} {...iconSizes} onClick={RightbarToogle} title="Settings" />
            <img src={CodeSVG} {...iconSizes} onClick={ CGen } title="Code generation" />
        </div>
    )

}
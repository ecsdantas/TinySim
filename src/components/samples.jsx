import { useModal } from "./modal";
import { useEffect, useState } from "react";
import { Engine } from "../nodes/nodeModel"
import Simulation from "../simulation/core"
import JSZip from "jszip";

const unv = "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+"

const Load = async (path) => {
    const response = await fetch(path);
    const file = await response.blob(); // Get the file as a Blob

    const zip = new JSZip();
    const content = await zip.loadAsync(file); // Load the ZIP file

    if (content.files['model.json']) {
        const modelText = await content.files['model.json'].async('text'); // Extract model.json
        const modelData = JSON.parse(modelText);

        const EngModel = Engine.getModel();
        EngModel.deserializeModel(modelData, Engine);

        Engine.repaintCanvas();
        Simulation.setModel(EngModel);
    }
}

export const Samples = () => {




    // Modal content component
    const ControlEditor = () => {

        const [getProjects, setProjects] = useState('')

        useEffect(() => {
            fetch("/samples/index.json").then(v => v.ok && v.json().then(j => setProjects(j["samples"])))
        }, [])

        return (
            <div>
                {!Array.isArray(getProjects) && <span>Unable to load the samples project this time.</span>}
                {
                    Array.isArray(getProjects) && <ul className="sample">
                        {getProjects.map((proj, index) => {
                            return <li key={`proj_${index}`} className="sample-item" onClick={ _ => Load(proj.url) }>
                                <div className="sample-image">
                                    <img src={proj.image ? proj.image : unv} width="156" />
                                </div>
                                <div className="sample-text">
                                    <b>{proj.name}</b>
                                    <p>{proj.description}</p>
                                </div>

                            </li>
                        })}
                    </ul>
                }
            </div>
        );
    };

    useModal.configure(null, "Loading samples", <ControlEditor />, true);

};

import JSZip from 'jszip';
import { ModelActions } from './dict';

class CodeGeneration {

    #nodes = null;

    constructor(model) {
        if (!model || !model?.getNodes) throw new Error("Invalid model");
        this.#nodes = model.getNodes();
    }

    // Run simulation and generate C files
    async compileC() {
        const outputs = [];

        // Procura por outputs
        this.#nodes.filter(node => node.isTerminalBlock).forEach(node => outputs.push(node));

        // Generate model actions, ports, and required libraries
        const requiredLibs = [];
        const ports = [];
        const modelStep = [];
        this.createModelStep(outputs, ports, requiredLibs, modelStep);
        
        // Replace placeholders in templates
        const replacements = {
            "\\${MODELINFO_TEMPLATE}": `Generated using TinySim.vercel.app on ${new Date().toLocaleString()}`,
            "\\${COMPUTEMODEL_TEMPLATE}": modelStep.map(m => m + ';').join("\n\t"),
            "\\${DATATYPE_TEMPLATE}": ports.map(p => `double ${p.name};`).join("\n\t"),
            "\\${SETINPUTS_TEMPLATE}": ports.filter(p => p.isInput).map(p => `model.data.${p.name} = ${p.value};`).join("\n\t"),
            "\\${SETPRINTSINPUTS_TEMPLATE}": ports.filter(p => p.isInput).map(p => `printf("\\tSET ${p.name}: %f\\n", model.data.${p.name});`).join("\n\t"),
            "\\${SETPRINTSOUTPUTS_TEMPLATE}": ports.filter(p => !p.isInput).map(p => `printf("\\tGET ${p.name}: %f\\n", model.data.${p.name});`).join("\n\t"),
        };

        // Generate and zip files
        const templates = {
            "main.c": await import('./template/main.c.template?raw').then(module => module.default),
            "model.c": await import('./template/model.c.template?raw').then(module => module.default),
            "model.h": await import('./template/model.h.template?raw').then(module => module.default),
            "libs.h": await import('./template/libs.h.template?raw').then(module => module.default),
            "libs.c": await import('./template/libs.c.template?raw').then(module => module.default)
        };
        const outputFiles = this.generateFiles(templates, replacements, requiredLibs);
        const zipBlob = await this.createZip(outputFiles);

        // Trigger download
        this.downloadZip(zipBlob, 'TinySim-CodeGen-output.zip');
    }

    createModelStep(outputs, ports, requiredLibs, modelStep) {

        ModelActions.addPort = (portName, isInput = 0, value = 0) => {
            if (!ports.some(p => p.name === portName)) {
                ports.push({ name: portName, isInput, value });
            }
        };

        ModelActions.addLib = (lib) => {
            if (!requiredLibs.some(existingLib => existingLib.name === lib.name)) {
                requiredLibs.push(lib);
            }
        };

        ModelActions.addStep = (st) => {
            modelStep.push(st)
        };

        ModelActions.getNode = (node) => {
            const action = ModelActions[node.constructor.name] || ModelActions.default;
            return action(node);
        }

        return outputs.map(node => ModelActions.getNode(node))
        
    }

    generateFiles(templates, replacements, requiredLibs) {
        const outputFiles = {};

        for (const [fileName, templateContent] of Object.entries(templates)) {
            let outputContent = templateContent;

            for (const [placeholder, value] of Object.entries(replacements)) {
                outputContent = outputContent.replace(new RegExp(placeholder, "g"), value);
            }

            if (fileName === "libs.h") {
                const declarations = requiredLibs
                    .map(lib => lib.declaration)
                    .filter(Boolean)
                    .join("\n");
                outputContent = outputContent.replace("/* FUNCTION_DECLARATIONS */", declarations);
            }

            if (fileName === "libs.c") {
                const implementations = requiredLibs
                    .map(lib => lib.implementation)
                    .filter(Boolean)
                    .join("\n");
                outputContent = outputContent.replace("/* FUNCTION_IMPLEMENTATIONS */", implementations);
            }

            outputFiles[fileName] = outputContent;
        }

        return outputFiles;
    }

    async createZip(files) {
        const zip = new JSZip();
        for (const [fileName, content] of Object.entries(files)) {
            zip.file(fileName, content);
        }
        return await zip.generateAsync({ type: "blob" }); // Use blob for browser compatibility
    }

    downloadZip(blob, fileName) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
    }
}

export default CodeGeneration;
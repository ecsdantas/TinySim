import JSZip from 'jszip';

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
        const modelActions = this.createModelStep(outputs, ports, requiredLibs);
        
        // Replace placeholders in templates
        const replacements = {
            "\\${MODELINFO_TEMPLATE}": "Generated using TinySim.vercel.app",
            "\\${COMPUTEMODEL_TEMPLATE}": modelActions.map(m => m + ';').join("\n\t"),
            "\\${DATATYPE_TEMPLATE}": ports.map(p => `double ${p.name};`).join("\n\t"),
            "\\${SETINPUTS_TEMPLATE}": ports.filter(p => p.isInput).map(p => `model.data.${p.name} = ${p.value};`).join("\n\t"),
            "\\${SETPRINTSINPUTS_TEMPLATE}": ports.filter(p => p.isInput).map(p => `printf(\"\\tSET ${p.name}: %f\\n\", model.data.${p.name});`).join("\n\t"),
            "\\${SETPRINTSOUTPUTS_TEMPLATE}": ports.filter(p => !p.isInput).map(p => `printf(\"\\tGET ${p.name}: %f\\n\", model.data.${p.name});`).join("\n\t"),
        };

        // Generate and zip files
        const templates = {
            "main.c": await import('./template/main.c.template?raw').then(module => module.default),
            "model.c": await import('./template/model.c.template?raw').then(module => module.default),
            "model.h": await import('./template/model.h.template?raw').then(module => module.default),
            "libs.c": await import('./template/libs.c.template?raw').then(module => module.default),
            "libs.h": await import('./template/libs.h.template?raw').then(module => module.default)
        };
        const outputFiles = this.generateFiles(templates, replacements);
        const zipBlob = await this.createZip(outputFiles);

        // Trigger download
        this.downloadZip(zipBlob, 'TinySim-CodeGen-output.zip');
    }

    createModelStep(outputs, ports, requiredLibs) {
        const addPort = (portName, isInput = 0, value = 0) => {
            (!ports.map(p => p.name).includes(portName)) && ports.push({ name: portName, isInput, value });
        };

        const GetPort = (node) => {
            const cGen = node.codeGen();
            switch (cGen.class) {
                case "ConstantModel":
                    addPort(cGen.name, 1, node.value);
                    return `model->data.${cGen.name}`;

                case "DisplayModel":
                    addPort(cGen.name, 0, 0);
                    return `model->data.${cGen.name} = ${cGen.inputsNodes?.map(inputNode => GetPort(inputNode))}`;

                case "AddModel":
                    requiredLibs.push("add");
                    return `add(${cGen.inputsNodes?.map(inputNode => GetPort(inputNode)).join(",")})`;

                case "SubModel":
                    requiredLibs.push("subtract");
                    return `subtract(${cGen.inputsNodes?.map(inputNode => GetPort(inputNode)).join(",")})`;

                default:
                    return "Error";
            }
        };

        return outputs.map(outp => GetPort(outp));
    }

    generateFiles(templates, replacements) {
        const outputFiles = {};

        for (const [fileName, templateContent] of Object.entries(templates)) {
            let outputContent = templateContent;

            for (const [placeholder, value] of Object.entries(replacements)) {
                outputContent = outputContent.replace(new RegExp(placeholder, "g"), value);
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
        URL.revokeObjectURL(link.href); // Clean up
    }
}

export default CodeGeneration;

// ${COMPUTEMODEL_TEMPLATE}
// ${DATATYPE_TEMPLATE}
// ${SETINPUTS_TEMPLATE}
// ${SETPRINTSOUTPUTS_TEMPLATE}
// ${SETPRINTSINPUTS_TEMPLATE}
// ${MODELINFO_TEMPLATE}

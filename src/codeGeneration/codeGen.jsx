import JSZip from 'jszip';
import { ModelActions } from './modelActions';

class CodeGeneration {

    #nodes = null;
    #sim = [];

    constructor(model, simulation) {
        if (!model || !model?.getNodes) throw new Error("Invalid model");
        this.#nodes = model.getNodes();
        if (!simulation) throw new Error("Invalid model");
        this.#sim.realTimeMode = simulation.realTimeMode ?? 0
        this.#sim.stopTime = simulation.stopTime ?? 10
        this.#sim.samplingTime = simulation.stepSize ?? 0.1
    }

    // Run simulation and generate C files
    async compileC() {
        const outputs = [];

        // Procura por outputs
        this.#nodes.filter(node => node.isTerminalBlock).forEach(node => outputs.push(node));

        // Generate model actions, ports, and required libraries
        const requiredLibs = [];
        const includeLibs = [];
        const ports = [];
        const modelStep = [];
        const sharedModelVars = [];
        this.createModelStep(outputs, ports, requiredLibs, includeLibs, modelStep, sharedModelVars);
        
        // Replace placeholders in templates
        const replacements = {
            "\\${MODELINFO_TEMPLATE}": `Generated using TinySim.vercel.app on ${new Date().toLocaleString()}`,
            "\\${SIMULATION_MODE_TEMPLATE}": this.#sim.realTimeMode,
            "\\${SAMPLING_TIME_TEMPLATE}": this.#sim.samplingTime,
            "\\${STOP_SIMULATION_TIME_TEMPLATE}":this.#sim.stopTime,
            "\\${SHAREDMODELVARS_DECLARATION_TEMPLATE}": sharedModelVars.map(p => `${p.type? p.type : 'double'} ${p.name};`).join("\n  "),
            "\\${SHAREDMODELVARS_INITIALIZATION_TEMPLATE}": sharedModelVars.map(p => `${p.name} = ${p.value}; // initial condition of ${p.ref}`).join("\n\t"),
            "\\${COMPUTEMODEL_TEMPLATE}": modelStep.map(m => m + ';').join("\n\t"),
            "\\${INCLUDE_LIBS}": includeLibs.map(p => `#include ${p}`).join("\n"),
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

    createModelStep(outputs, ports, requiredLibs, includeLibs, modelStep, sharedModelVars) {

        this.#nodes.forEach(node => node.isvisited = false);
        const MA = new ModelActions(ports, requiredLibs, includeLibs, modelStep, sharedModelVars)
        return outputs.map(node => MA.getNode(node))
        
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
                    .map(lib => lib.declaration.trim())
                    .filter(Boolean)
                    .join("\n");
                outputContent = outputContent.replace("/* FUNCTION_DECLARATIONS */", declarations);
            }

            if (fileName === "libs.c") {
                const implementations = requiredLibs
                    .map(lib => this.indentCCode(lib.implementation))
                    .filter(Boolean)
                    .join("\n\n");
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


    indentCCode(code) {
        // Remove espaços em excesso antes e depois do código
        const trimmedCode = code.trim();
    
        // Quebra o código em linhas e inicializa variáveis
        const lines = trimmedCode.split("\n");
        let indentedCode = "";
        let indentLevel = 0;
        const indent = "    "; // 4 espaços para indentação
    
        lines.forEach(line => {
            // Remove espaços em excesso de cada linha
            line = line.trim();
    
            // Trata chaves de fechamento ("}")
            if (/^\}/.test(line)) {
                indentLevel = Math.max(indentLevel - 1, 0);
            }
    
            // Aplica a indentação atual
            indentedCode += indent.repeat(indentLevel) + line + "\n";
    
            // Trata chaves de abertura ("{")
            if (/\{$/.test(line)) {
                indentLevel++;
            }
    
            // Quebra instruções compactas (e.g., múltiplas instruções em uma única linha)
            if (/;.*\S/.test(line) && !line.endsWith("}")) {
                const instructions = line.split(";").filter(instr => instr.trim() !== "");
                instructions.forEach((instr, index) => {
                    if (index === 0) {
                        indentedCode += indent.repeat(indentLevel) + instr.trim() + ";\n";
                    } else {
                        indentedCode += indent.repeat(indentLevel + 1) + instr.trim() + ";\n";
                    }
                });
            }
        });
    
        return indentedCode.trim();
    }

}

export default CodeGeneration;
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
        const cstruct = {}
        cstruct.replacements = []; // { placement: 'FUNCTION_DECLARATIONS', content: 'void myFunction(double *input, double *output);' }
        cstruct.extraFiles = []; // { filename: 'data_csvImp.csv', content: '...' } -- arquivos extras (ex. dados de CSV Import) a empacotar no zip

        // Reseta compilações anteriores
        this.#nodes.forEach(node => node.isvisited = false);
        // Define novos actions
        const MA = new ModelActions(cstruct)
        outputs.map(node => MA.getNode(node))
        
        // Obtém os replacements
        const getPlacement = (placement, clue, alternative) => cstruct.replacements.filter(p => p.placement === placement).map(p => p.content).join(clue) || alternative;

        // Replace placeholders in templates. Keys are plain placeholder names (no
        // regex/escaping involved); generateFiles() wraps them as ${NAME} and does a
        // literal string replace, so names are never interpreted as regex syntax.
        const replacements = {
            "MODELINFO_TEMPLATE": `Generated using tinysim.vercel.app on ${new Date().toLocaleString()}`,
            "MAIN_C__INCLUDES_TEMPLATE": getPlacement('MAIN_C__INCLUDES_TEMPLATE','\n',''),
            "MAIN_C__BEFORE_MAIN_TEMPLATE": getPlacement('MAIN_C__BEFORE_MAIN_TEMPLATE','\n',''),
            "MAIN_C__BEFORE_INIT_MODEL_TEMPLATE": getPlacement('MAIN_C__BEFORE_INIT_MODEL_TEMPLATE','\n',''),
            "MAIN_C__AFTER_INIT_MODEL_TEMPLATE": getPlacement('MAIN_C__AFTER_INIT_MODEL_TEMPLATE','\n',''),
            "MAIN_C__MAIN_LOOP_BEFORE_STEP_TEMPLATE": getPlacement('MAIN_C__MAIN_LOOP_BEFORE_STEP_TEMPLATE','\n',''),
            "MAIN_C__MAIN_LOOP_AFTER_STEP_TEMPLATE": getPlacement('MAIN_C__MAIN_LOOP_AFTER_STEP_TEMPLATE','\n',''),
            "MAIN_C__MAIN_LOOP_SET_VARS_TEMPLATE": getPlacement('MAIN_C__MAIN_LOOP_SET_VARS_TEMPLATE','\n\t','// No inputs to set'),
            "MAIN_C__MAIN_LOOP_GET_VARS_TEMPLATE": getPlacement('MAIN_C__MAIN_LOOP_GET_VARS_TEMPLATE','\n\t',''),
            "MAIN_C__BEFORE_TERM_MODEL_TEMPLATE": getPlacement('MAIN_C__BEFORE_TERM_MODEL_TEMPLATE','\n',''),
            "MAIN_C__AFTER_TERM_MODEL_TEMPLATE": getPlacement('MAIN_C__AFTER_TERM_MODEL_TEMPLATE','\n',''),

            "LIBS_H__INCLUDES_TEMPLATE": getPlacement('LIBS_H__INCLUDES_TEMPLATE','\n','// No includes to add'),
            "LIBS_H__DEFINES_TEMPLATE": getPlacement('LIBS_H__DEFINES_TEMPLATE','\n','// No more defines to include'),
            "LIBS_H__DECLARATION_TEMPLATE": getPlacement('LIBS_H__DECLARATION_TEMPLATE','\n','// No functions to declare'),

            "LIBS_C__FUNCTIONS_TEMPLATE": getPlacement('LIBS_C__FUNCTIONS_TEMPLATE','\n','// No Library functions to implement'),

            "MODEL_H__DATATYPE_TEMPLATE": getPlacement('MODEL_H__DATATYPE_TEMPLATE','\n\t','// No new data types is required'),
            "MODEL_H__FUNCTIONS_TEMPLATE": getPlacement('MODEL_H__FUNCTIONS_TEMPLATE','\n\n','// No shared model functions is required'),
            "MODEL_H__VARIABLES_TEMPLATE": getPlacement('MODEL_H__VARIABLES_TEMPLATE','\n\n','// No shared model variables is required'),

            "MODEL_C__VARS_TEMPLATE": getPlacement('MODEL_C__VARS_TEMPLATE','\n','// No new model variables is required'),
            "MODEL_C__INIT_TEMPLATE": getPlacement('MODEL_C__INIT_TEMPLATE','\n\t','// No model initialization procedures is required'),
            "MODEL_C__TERM_TEMPLATE": getPlacement('MODEL_C__TERM_TEMPLATE','\n\t','// No model termination procedures is required'),
            "MODEL_C__STEP_TEMPLATE": getPlacement('MODEL_C__STEP_TEMPLATE','\n\t','// No new steps procedures is required'),
            "MODEL_C__SIMULATION_MODE_TEMPLATE": this.#sim.realTimeMode,
            "MODEL_C__SAMPLING_TIME_TEMPLATE": this.#sim.samplingTime,
            "MODEL_C__STOP_SIMULATION_TIME_TEMPLATE": this.#sim.stopTime,
        };

        // Generate and zip files
        const templates = {
            "main.c": await import('./template/main.c.template?raw').then(module => module.default),
            "model.c": await import('./template/model.c.template?raw').then(module => module.default),
            "model.h": await import('./template/model.h.template?raw').then(module => module.default),
            "libs.h": await import('./template/libs.h.template?raw').then(module => module.default),
            "libs.c": await import('./template/libs.c.template?raw').then(module => module.default),
            "Makefile": await import('./template/Makefile.template?raw').then(module => module.default),
            "README.md": await import('./template/README.template?raw').then(module => module.default)
        };
        const outputFiles = this.generateFiles(templates, replacements);

        // Arquivos extras registrados pelos cmodels (ex. os .csv reais do
        // CSV Import) não passam por placeholder substitution, só são
        // copiados como estão pro zip final.
        cstruct.extraFiles.forEach(({ filename, content }) => {
            outputFiles[filename] = content;
        });

        const zipBlob = await this.createZip(outputFiles);

        // Trigger download
        this.downloadZip(zipBlob, 'TinySim-CodeGen-output.zip');
    }

    generateFiles(templates, replacements) {
        const outputFiles = {};

        for (const [fileName, templateContent] of Object.entries(templates)) {
            let outputContent = templateContent;

            for (const [placeholder, value] of Object.entries(replacements)) {
                outputContent = outputContent.replaceAll(`\${${placeholder}}`, value);
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
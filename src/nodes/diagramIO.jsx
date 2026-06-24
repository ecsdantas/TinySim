import JSZip from "jszip";

// Módulo-folha (só depende de jszip) para que tanto a UI (menubar.jsx)
// quanto o atalho de teclado (nodeModel.jsx) compartilhem a mesma lógica
// de exportação sem criar um ciclo de import entre os dois.
export function saveDiagram(engine) {
    const modelData = engine.getModel().serialize();
    const modelJson = JSON.stringify(modelData, null, 2);

    const zip = new JSZip();
    zip.file("model.json", modelJson);

    zip.generateAsync({ type: "blob" }).then((content) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'schematic.tsim';
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }).catch((err) => {
        console.error("Error generating zip file:", err);
    });
}

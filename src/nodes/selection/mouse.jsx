import { Engine } from "../nodeModel";

export const SelectionBox = () => {
    let isDragging = false;
    let selectionStart = { x: 0, y: 0 };
    let selectionBox = null;

    // Monitora a posição do mouse para desenhar o retângulo
    document.addEventListener("mousemove", (event) => {
        if (isDragging && selectionBox) {
            const canvas = document.querySelector(".srd-diagram");
            if (!canvas) return;

            const canvasRect = canvas.getBoundingClientRect();
            const width = event.clientX - selectionStart.x;
            const height = event.clientY - selectionStart.y;

            selectionBox.style.left = `${Math.min(event.clientX, selectionStart.x) - canvasRect.left}px`;
            selectionBox.style.top = `${Math.min(event.clientY, selectionStart.y) - canvasRect.top}px`;
            selectionBox.style.width = `${Math.abs(width)}px`;
            selectionBox.style.height = `${Math.abs(height)}px`;
        }
    });

    // Inicia o desenho do retângulo apenas em áreas vazias
    document.addEventListener("mousedown", (event) => {
        if (event.button !== 0) return; // Apenas botão direito do mouse

        const canvas = document.querySelector(".srd-diagram");
        if (!canvas) return;

        const targetElement = event.target;
        if (!canvas.contains(targetElement) || targetElement.classList.contains("node") || targetElement.closest(".node")) {
            // Não ativa o retângulo se o clique for sobre um bloco ou elemento interativo
            return;
        }

        event.preventDefault(); // Impede o comportamento padrão
        isDragging = true;
        selectionStart = { x: event.clientX, y: event.clientY };

        selectionBox = document.createElement("div");
        selectionBox.style.position = "absolute";
        selectionBox.style.border = "1px dashed #000";
        selectionBox.style.backgroundColor = "rgba(0, 0, 255, 0.2)";
        selectionBox.style.pointerEvents = "none";
        canvas.appendChild(selectionBox);
    });

    // Verifica os nós ao soltar o botão direito
    document.addEventListener("mouseup", (event) => {
        if (!isDragging || !selectionBox) return;

        const canvas = document.querySelector(".srd-diagram");
        if (!canvas) return;

        const selectionRect = selectionBox.getBoundingClientRect();
        
        // Seleciona os nós dentro do retângulo
        const Model = Engine.getModel()
        Model.getNodes().map( node => {            
            const isInside = (p) => p.x > selectionRect.left &&
            p.x < selectionRect.right &&
            p.y > selectionRect.top &&
            p.y < selectionRect.bottom;

            const nodePoints = node.getBoundingBox().getPoints()
            const fit = nodePoints.some(p => isInside(p))
            node.setSelected(fit)
        })

        canvas.removeChild(selectionBox); // Remove o elemento do canvas
        selectionBox = null;
        isDragging = false;
    });
};

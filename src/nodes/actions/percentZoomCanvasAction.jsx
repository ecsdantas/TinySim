import { Action, InputType } from '@projectstorm/react-canvas-core';

// Substitui o ZoomCanvasAction padrão (que soma um valor fixo ao zoom a cada scroll)
// por um zoom multiplicativo: cada "clique" da roda do mouse aplica uma porcentagem
// sobre o zoom atual, deixando o zoom mais rápido em níveis altos e mais fino em níveis baixos.
export class PercentZoomCanvasAction extends Action {
    constructor(options = {}) {
        const step = options.zoomStep ?? 0.1; // 10% por "clique" da roda
        const minZoom = options.minZoom ?? 10;
        const maxZoom = options.maxZoom ?? 2000;

        super({
            type: InputType.MOUSE_WHEEL,
            fire: (actionEvent) => {
                const { event } = actionEvent;
                for (let layer of this.engine.getModel().getLayers()) {
                    layer.allowRepaint(false);
                }
                const model = this.engine.getModel();
                event.stopPropagation();
                const oldZoomFactor = model.getZoomLevel() / 100;

                let scrollDelta = options.inverseZoom ? -event.deltaY : event.deltaY;
                const direction = scrollDelta > 0 ? -1 : 1;

                // Pinça (trackpad) envia deltaY fracionário com ctrlKey true: aplica passos menores
                const isPinch = event.ctrlKey && scrollDelta % 1 !== 0;
                const factor = isPinch
                    ? 1 + direction * Math.min(Math.abs(scrollDelta) / 100, 1) * step
                    : 1 + direction * step;

                const newZoomLevel = Math.min(Math.max(model.getZoomLevel() * factor, minZoom), maxZoom);
                model.setZoomLevel(newZoomLevel);

                const zoomFactor = model.getZoomLevel() / 100;
                const boundingRect = event.currentTarget.getBoundingClientRect();
                const clientWidth = boundingRect.width;
                const clientHeight = boundingRect.height;
                const widthDiff = clientWidth * zoomFactor - clientWidth * oldZoomFactor;
                const heightDiff = clientHeight * zoomFactor - clientHeight * oldZoomFactor;
                const clientX = event.clientX - boundingRect.left;
                const clientY = event.clientY - boundingRect.top;
                const xFactor = (clientX - model.getOffsetX()) / oldZoomFactor / clientWidth;
                const yFactor = (clientY - model.getOffsetY()) / oldZoomFactor / clientHeight;
                model.setOffset(model.getOffsetX() - widthDiff * xFactor, model.getOffsetY() - heightDiff * yFactor);

                this.engine.repaintCanvas();
                for (let layer of this.engine.getModel().getLayers()) {
                    layer.allowRepaint(true);
                }
            }
        });
    }
}

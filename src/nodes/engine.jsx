import createEngine, { DefaultDiagramState } from '@projectstorm/react-diagrams';
import { PercentZoomCanvasAction } from './actions/percentZoomCanvasAction';

// Módulo-folha: cria só o motor do diagrama, sem depender de
// elements/index.jsx (todos os blocos). Mantido separado de nodeModel.jsx
// para que módulos que só precisam de `Engine` (ex.: bezierLinks.jsx,
// selection/mouse.jsx) não arrastem um ciclo de import de volta para os
// blocos via nodeModel.jsx -> elements/index.jsx -> <bloco> -> nodeModel.jsx.

// Desativa o ZoomCanvasAction padrão (zoom por incremento fixo) para usar um zoom percentual
const Engine = createEngine({ registerDefaultZoomCanvasAction: false });
Engine.getActionEventBus().registerAction(new PercentZoomCanvasAction());

// Permite algumas opções adicionais, como previnir fio sem ligação ponto-a-ponto
const state = Engine.getStateMachine().getCurrentState();
if (state instanceof DefaultDiagramState) {
    state.dragNewLink.config.allowLooseLinks = false;
    state.dragCanvas.config.allowDrag = false; // Desativa "pan"
}

export { Engine };

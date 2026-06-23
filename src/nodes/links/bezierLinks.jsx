import { DefaultLinkModel, PointModel } from '@projectstorm/react-diagrams';
import React from 'react';
import { Engine } from '../nodeModel';

// Tamanho do trecho reto que o fio percorre ao sair/entrar de uma porta
// antes de poder virar (estilo Simulink).
const STUB_MARGIN = 30;
// Distância mínima entre o fio e um bloco quando o roteamento precisa contorná-lo.
const ROUTE_CLEARANCE = 30;
// Raio das quinas suavizadas do roteamento ortogonal.
const CORNER_RADIUS = 12;
// Largura da área "invisível" de cada trecho usada para detectar cliques/arraste.
const SEGMENT_HIT_WIDTH = 16;
// Distância mínima do mouse antes de um clique virar de fato um arraste de trecho.
const DRAG_THRESHOLD = 4;

class BezierLinkModel extends DefaultLinkModel {
    constructor() {
        super({ type: 'bezier' });
        this.points.forEach(point => (point.isPort = true));
    }

    getPath() {
        const routePoints = this.getRoutePoints();
        return routePoints ? [this.buildRoundedPath(routePoints)] : [];
    }

    // Pontos da rota atual: ou os trechos calculados automaticamente (sem
    // pontos manuais), ou a rota já "congelada" por um arraste de trecho anterior.
    getRoutePoints() {
        if (!this.sourcePort) return null;

        const sourcePosition = this.getPortPosition(this.sourcePort);
        const targetPosition = this.targetPort ? this.getPortPosition(this.targetPort) : this.points[this.points.length - 1]?.getPosition();
        if (!sourcePosition || !targetPosition) return null;

        const intermediatePoints = this.getIntermediatePoints();
        if (intermediatePoints.length === 0) {
            return this.computeOrthogonalRoute(sourcePosition, targetPosition);
        }
        // Arrastar um trecho pode empurrar um ponto manual até coincidir com o
        // vizinho (ex.: a "ponte" some quando os dois trechos verticais se cruzam);
        // remove duplicatas para não gerar um trecho de comprimento zero.
        return this.dedupePoints([sourcePosition, ...intermediatePoints, targetPosition]);
    }

    // Lado do bloco para o qual a porta aponta: portas de saída apontam para a
    // direita e as de entrada para a esquerda, invertendo quando o bloco está espelhado.
    getPortFacing(port) {
        const isInput = !!port.getOptions().in;
        const flipped = !!port.getNode()?.flip;
        const facesRight = isInput ? flipped : !flipped;
        return facesRight ? 1 : -1;
    }

    // Caixas de todos os blocos do diagrama, junto com o nó a que pertencem
    // (para que a ponta de saída/entrada do próprio fio possa ser ignorada
    // apenas no trecho que sai/entra dela, mas ainda conte como obstáculo
    // para os demais trechos do roteamento).
    getObstacleBoxes() {
        // this.getParent() é a camada interna de links (LinkLayerModel), não o
        // diagrama; getParentCanvasModel() sobe a árvore até o DiagramModel real.
        const diagramModel = this.getParentCanvasModel?.();
        const nodes = diagramModel && typeof diagramModel.getNodes === 'function' ? diagramModel.getNodes() : [];
        return nodes.map(node => ({ node, box: node.getBoundingBox() }));
    }

    segmentIntersectsBox(p1, p2, box) {
        const topLeft = box.getTopLeft();
        const bottomRight = box.getBottomRight();
        const xMin = Math.min(p1.x, p2.x);
        const xMax = Math.max(p1.x, p2.x);
        const yMin = Math.min(p1.y, p2.y);
        const yMax = Math.max(p1.y, p2.y);
        return bottomRight.x >= xMin && topLeft.x <= xMax && bottomRight.y >= yMin && topLeft.y <= yMax;
    }

    // Verifica cada trecho contra os obstáculos, mas perdoa o bloco de origem no
    // primeiro trecho (que começa dentro dele, saindo pela porta) e o de destino
    // no último (que termina dentro dele, entrando pela porta).
    isRouteClear(points, obstacles, sourceNode, targetNode) {
        for (let i = 0; i < points.length - 1; i++) {
            const isFirstSegment = i === 0;
            const isLastSegment = i === points.length - 2;
            const blocked = obstacles.some(({ node, box }) => {
                if (isFirstSegment && node === sourceNode) return false;
                if (isLastSegment && node === targetNode) return false;
                return this.segmentIntersectsBox(points[i], points[i + 1], box);
            });
            if (blocked) return false;
        }
        return true;
    }

    // Roteia o fio em segmentos retos (horizontais/verticais), saindo e entrando
    // das portas pelo lado correto e desviando de blocos que estejam no caminho.
    computeOrthogonalRoute(sourcePoint, targetPoint) {
        const sourceNode = this.sourcePort?.getNode();
        const targetNode = this.targetPort?.getNode();
        const facingSource = this.getPortFacing(this.sourcePort);
        const facingTarget = this.targetPort ? this.getPortFacing(this.targetPort) : -1;

        const sourceStubX = sourcePoint.x + facingSource * STUB_MARGIN;
        const targetStubX = targetPoint.x + facingTarget * STUB_MARGIN;

        const obstacles = this.getObstacleBoxes();

        // Região de x onde um único cotovelo (2 quinas) atende as duas portas
        // ao mesmo tempo, saindo/entrando no sentido correto de cada uma.
        let lowerBound = -Infinity;
        let upperBound = Infinity;
        if (facingSource === 1) lowerBound = Math.max(lowerBound, sourceStubX);
        else upperBound = Math.min(upperBound, sourceStubX);
        if (facingTarget === 1) lowerBound = Math.max(lowerBound, targetStubX);
        else upperBound = Math.min(upperBound, targetStubX);

        if (lowerBound <= upperBound) {
            const midX = Number.isFinite(lowerBound) ? lowerBound : upperBound;
            const candidate = this.dedupePoints([
                sourcePoint,
                { x: midX, y: sourcePoint.y },
                { x: midX, y: targetPoint.y },
                targetPoint,
            ]);

            if (this.isRouteClear(candidate, obstacles, sourceNode, targetNode)) {
                return candidate;
            }
        }

        // Cotovelo direto não é possível (ou está bloqueado): contorna usando uma
        // faixa horizontal livre acima ou abaixo dos blocos no caminho. Tenta o
        // lado de menor desvio primeiro e só usa o outro se o primeiro também
        // estiver bloqueado.
        const minY = Math.min(sourcePoint.y, targetPoint.y);
        const maxY = Math.max(sourcePoint.y, targetPoint.y);
        const boxes = obstacles.map(o => o.box);
        const routeYOptions = this.computeClearRouteYOptions(sourceStubX, targetStubX, minY, maxY, boxes);

        let fallback = null;
        for (const routeY of routeYOptions) {
            const candidate = this.dedupePoints([
                sourcePoint,
                { x: sourceStubX, y: sourcePoint.y },
                { x: sourceStubX, y: routeY },
                { x: targetStubX, y: routeY },
                { x: targetStubX, y: targetPoint.y },
                targetPoint,
            ]);
            if (!fallback) fallback = candidate;
            if (this.isRouteClear(candidate, obstacles, sourceNode, targetNode)) {
                return candidate;
            }
        }

        // Nenhuma opção ficou totalmente livre: usa a de menor desvio mesmo assim.
        return fallback;
    }

    // Decide se o contorno passa por cima ou por baixo dos blocos no caminho,
    // retornando as duas opções de y ordenadas da que exige menor desvio para a maior.
    computeClearRouteYOptions(xA, xB, minY, maxY, obstacleBoxes) {
        const xMin = Math.min(xA, xB);
        const xMax = Math.max(xA, xB);

        const overlapping = obstacleBoxes.filter(box => {
            const topLeft = box.getTopLeft();
            const bottomRight = box.getBottomRight();
            return bottomRight.x >= xMin && topLeft.x <= xMax;
        });

        const topEdge = overlapping.length ? Math.min(...overlapping.map(box => box.getTopLeft().y)) : minY;
        const bottomEdge = overlapping.length ? Math.max(...overlapping.map(box => box.getBottomRight().y)) : maxY;

        const routeAboveY = topEdge - ROUTE_CLEARANCE;
        const routeBelowY = bottomEdge + ROUTE_CLEARANCE;
        const distAbove = minY - routeAboveY;
        const distBelow = routeBelowY - maxY;

        return distAbove <= distBelow ? [routeAboveY, routeBelowY] : [routeBelowY, routeAboveY];
    }

    dedupePoints(points) {
        const result = [];
        points.forEach(point => {
            const last = result[result.length - 1];
            if (!last || Math.hypot(point.x - last.x, point.y - last.y) > 0.01) {
                result.push(point);
            }
        });
        return result;
    }

    // Transforma a polilinha ortogonal em um path SVG com quinas suavizadas,
    // encurtando cada segmento perto dos vértices internos e arredondando com uma curva.
    buildRoundedPath(points, radius = CORNER_RADIUS) {
        if (points.length < 2) return '';
        if (points.length === 2) {
            return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
        }

        let path = `M ${points[0].x} ${points[0].y} `;
        for (let i = 1; i < points.length - 1; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const next = points[i + 1];

            const distPrev = Math.hypot(curr.x - prev.x, curr.y - prev.y);
            const distNext = Math.hypot(next.x - curr.x, next.y - curr.y);

            // Trecho vizinho de comprimento ~zero (ex.: um arraste empurrou este
            // ponto até coincidir com o vizinho): não há quina real pra arredondar,
            // e dividir por uma distância zero geraria NaN no path.
            if (distPrev < 0.01 || distNext < 0.01) {
                path += `L ${curr.x} ${curr.y} `;
                continue;
            }

            const r = Math.min(radius, distPrev / 2, distNext / 2);

            const fromPrev = {
                x: curr.x + (prev.x - curr.x) / distPrev * r,
                y: curr.y + (prev.y - curr.y) / distPrev * r,
            };
            const toNext = {
                x: curr.x + (next.x - curr.x) / distNext * r,
                y: curr.y + (next.y - curr.y) / distNext * r,
            };

            path += `L ${fromPrev.x} ${fromPrev.y} Q ${curr.x} ${curr.y}, ${toNext.x} ${toNext.y} `;
        }
        path += `L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
        return path;
    }

    getPortPosition(port) {
        const position = port.getPosition();
        return {
            x: position.x + port.width / 2,
            y: position.y + port.height / 2,
        };
    }

    getIntermediatePoints() {
        // Previne erros em caso de pontos criados fora do canvas
        this.points = this.points.filter((point, index) => {
            const pos = point.getPosition();
            const isValid = point.isPort || (pos && !isNaN(pos.x) && !isNaN(pos.y) && typeof pos.x === 'number' && typeof pos.y === 'number');
            if (!isValid) {
                console.log('Excluded points:', point);
            }
            return isValid;
        });
        return this.points.filter(point => !point.isPort).map(point => point.getPosition()).filter(pos => pos && !isNaN(pos.x) && !isNaN(pos.y));
    }

    // Congela a rota atual (até então calculada automaticamente) em pontos manuais
    // reais, na mesma ordem e posição, para que um trecho específico possa virar
    // um arraste persistente em vez de ser recalculado do zero a cada render.
    materializeRoute(routePoints) {
        const first = this.points[0];
        const last = this.points[this.points.length - 1];
        const interior = routePoints.slice(1, -1).map(pos => {
            const point = new PointModel({ link: this });
            point.setPosition(pos.x, pos.y);
            return point;
        });
        this.setPoints([first, ...interior, last]);
    }

    // Início do arraste de um trecho específico do fio. Só "congela" a rota em
    // pontos manuais (materializeRoute) se o mouse de fato se mover além de
    // DRAG_THRESHOLD — um clique simples deve apenas selecionar o fio, sem
    // travar o roteamento automático.
    handleSegmentDragStart = (event, segmentIndex, isHorizontal) => {
        const startX = event.clientX;
        const startY = event.clientY;
        let pointA = null;
        let pointB = null;
        let startA = null;
        let startB = null;

        const moveHandler = moveEvent => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            if (!pointA) {
                if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
                if (this.getIntermediatePoints().length === 0) {
                    this.materializeRoute(this.getRoutePoints());
                }
                pointA = this.points[segmentIndex];
                pointB = this.points[segmentIndex + 1];
                startA = pointA.getPosition();
                startB = pointB.getPosition();
            }

            if (isHorizontal) {
                pointA.setPosition(startA.x, startA.y + dy);
                pointB.setPosition(startB.x, startB.y + dy);
            } else {
                pointA.setPosition(startA.x + dx, startA.y);
                pointB.setPosition(startB.x + dx, startB.y);
            }
            Engine.repaintCanvas();
        };

        const upHandler = () => {
            window.removeEventListener('pointermove', moveHandler);
            window.removeEventListener('pointerup', upHandler);
        };
        window.addEventListener('pointermove', moveHandler);
        window.addEventListener('pointerup', upHandler);
    };

    handleSegmentPointerDown = (event, segmentIndex, isInterior, isHorizontal) => {
        if (!event.shiftKey) {
            const diagramModel = this.getParentCanvasModel?.();
            diagramModel?.getNodes().forEach(node => node.setSelected(false));
            diagramModel?.getLinks().forEach(link => link.setSelected(link === this));
        } else {
            this.setSelected(true);
        }
        Engine.repaintCanvas();

        // Os trechos que tocam a porta de origem/destino ficam fixos (não dá pra
        // arrastá-los sem desconectar o fio); só os trechos do meio são arrastáveis.
        if (!isInterior) return;
        this.handleSegmentDragStart(event, segmentIndex, isHorizontal);
    };

    RenderPaths = () => {
        const routePoints = this.getRoutePoints();
        if (!routePoints || routePoints.length < 2) return null;

        const fullPath = this.buildRoundedPath(routePoints);

        return (
            <g>
                <path
                    d={fullPath}
                    stroke={this.isSelected() ? '#b388e0' : 'rgba(0, 0, 0, 0.8)'}
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={this.isSelected() ? '20,5' : '0'}
                    style={{
                        pointerEvents: 'none',
                        animation: `${this.isSelected() ? 'dashAnimation 5s linear infinite' : 'none'}`
                    }}
                />
                {routePoints.slice(0, -1).map((p1, index) => {
                    const p2 = routePoints[index + 1];
                    const isInterior = index > 0 && index < routePoints.length - 2;
                    const isHorizontal = Math.abs(p1.y - p2.y) < Math.abs(p1.x - p2.x);
                    const cursor = isInterior ? (isHorizontal ? 'ns-resize' : 'ew-resize') : 'pointer';

                    return (
                        <line
                            key={`segment-${index}`}
                            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                            stroke="transparent"
                            strokeWidth={SEGMENT_HIT_WIDTH}
                            style={{ pointerEvents: 'stroke', cursor }}
                            onPointerDown={event => this.handleSegmentPointerDown(event, index, isInterior, isHorizontal)}
                        />
                    );
                })}
            </g>
        );
    };
}

export { BezierLinkModel };

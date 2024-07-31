import React, { useEffect } from "react";

export const Zoombar = (props) => {
    const { engine } = props;

    const control = {};

    const getCanvasCenter = () => {
        const { offsetWidth, offsetHeight } = engine.canvas;
        return { x: offsetWidth / 2, y: offsetHeight / 2 };
    };

    const screenToModel = (point) => {
        const zoomLevel = engine.getModel().getZoomLevel() / 100;
        const offsetX = engine.getModel().getOffsetX();
        const offsetY = engine.getModel().getOffsetY();
        return {
            x: (point.x - offsetX) / zoomLevel,
            y: (point.y - offsetY) / zoomLevel,
        };
    };

    const modelToScreen = (point) => {
        const zoomLevel = engine.getModel().getZoomLevel() / 100;
        const offsetX = engine.getModel().getOffsetX();
        const offsetY = engine.getModel().getOffsetY();
        return {
            x: point.x * zoomLevel + offsetX,
            y: point.y * zoomLevel + offsetY,
        };
    };

    const model = engine.getModel();

    control.center = screenToModel(getCanvasCenter());
    control.zoomLevel = model.getZoomLevel();

    // Zoom reset
    control.zoomReset = () => {
        model.setZoomLevel(100);
        model.setOffset(0, 0);
        engine.repaintCanvas();
    };

    // Fit nodes
    control.zoomFitNodes = () => {
        engine.zoomToFitSelectedNodes();
        engine.repaintCanvas();
    };

    // Zoom in and out
    control.zoomIn = (zoomValue) => {
        const centerBefore = screenToModel(getCanvasCenter());
        model.setZoomLevel(model.getZoomLevel() * (1 + zoomValue));
        const centerAfter = modelToScreen(centerBefore);
        model.setOffset(
            model.getOffsetX() + (getCanvasCenter().x - centerAfter.x),
            model.getOffsetY() + (getCanvasCenter().y - centerAfter.y)
        );
        engine.repaintCanvas();
    };

    const SVG = (props) => {
        const { children, onClick, title } = props;
        return (
            <button onClick={onClick} title={title} style={{ background: "none", border: "none", padding: 0 }}>
                <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg">
                    {children}
                </svg>
            </button>
        );
    };

    return (
        <div className="zoombar">
            <SVG onClick={() => control.zoomIn(0.2)} title="Mouse wheel counterclockwise">
                <circle cx="10" cy="10" r="6" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 15L19 19" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 10H10M12 10H10M10 10V8M10 10V12" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </SVG>
            <SVG onClick={() => control.zoomIn(-0.2)} title="Mouse wheel clockwise">
                <circle cx="10" cy="10" r="6" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 15L19 19" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 10H10H12" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </SVG>
            { /*
            <SVG onClick={() => control.zoomFitNodes()} title="Fit nodes">
                <path d="M4 15V18C4 19 5 20 6 20H9M15 20H18C19 20 20 19 20 18V15M20 9V6C20 5 19 4 18 4H15M4 9V6C4 5 5 4 6 4H9" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </SVG>
             */}
            <SVG onClick={() => control.zoomReset()} title="Reset zoom">
                <path d="M15 4V7C15 8 16 9 17 9H20M9 4V7C9 8 8 9 7 9H4M15 20V17C15 16 16 15 17 15H20M9 20V17C9 16 8 15 7 15H4" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </SVG>
        </div>
    );
};

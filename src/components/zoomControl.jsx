import React, { useEffect, useState } from "react";
import { Model, Engine } from "../nodes/nodeModel";

export const Zoombar = () => {
    const [control, setControl] = useState({
        showInfo: false,
        center: { x: 0, y: 0 },
        zoomLevel: 100,
    });

    useEffect(() => {
        if (!Engine.canvas) return;

        const updateControl = () => {
            setControl({
                center: screenToModel(getCanvasCenter()),
                zoomLevel: Model.getZoomLevel(),
            });
        };

        updateControl();
        Engine.repaintCanvas();
    }, []);

    const screenToModel = (point) => {
        const zoomLevel = Engine.getModel().getZoomLevel() / 100;
        const offsetX = Engine.getModel().getOffsetX();
        const offsetY = Engine.getModel().getOffsetY();
        return {
            x: (point.x - offsetX) / zoomLevel,
            y: (point.y - offsetY) / zoomLevel,
        };
    };

    const getCanvasCenter = () => {
        const { offsetWidth, offsetHeight } = Engine.canvas;
        return { x: offsetWidth / 2, y: offsetHeight / 2 };
    };

    const modelToScreen = (point) => {
        const zoomLevel = Engine.getModel().getZoomLevel() / 100;
        const offsetX = Engine.getModel().getOffsetX();
        const offsetY = Engine.getModel().getOffsetY();
        return {
            x: point.x * zoomLevel + offsetX,
            y: point.y * zoomLevel + offsetY,
        };
    };

    const zoomReset = () => {
        Model.setZoomLevel(100);
        Model.setOffset(0, 0);
        Engine.repaintCanvas();
        setControl({
            center: screenToModel(getCanvasCenter()),
            zoomLevel: 100,
        });
    };

    const zoomFitNodes = () => {
        Engine.zoomToFitSelectedNodes();
        Engine.repaintCanvas();
        setControl({
            center: screenToModel(getCanvasCenter()),
            zoomLevel: Model.getZoomLevel(),
        });
    };

    const zoomIn = (zoomValue) => {
        const centerBefore = screenToModel(getCanvasCenter());
        Model.setZoomLevel(Model.getZoomLevel() * (1 + zoomValue));
        const centerAfter = modelToScreen(centerBefore);
        Model.setOffset(
            Model.getOffsetX() + (getCanvasCenter().x - centerAfter.x),
            Model.getOffsetY() + (getCanvasCenter().y - centerAfter.y)
        );
        Engine.repaintCanvas();
        setControl({
            center: screenToModel(getCanvasCenter()),
            zoomLevel: Model.getZoomLevel(),
        });
    };

    const SVG = ({ children, onClick, title }) => (
        <button onClick={onClick} title={title} style={{ background: "none", border: "none", padding: 0 }}>
            <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg">
                {children}
            </svg>
        </button>
    );

    return (
        <div className="zoombar">
            { control.showInfo && <div>
                <small>Zoom Level: {control.zoomLevel}%<br />
                    Center: ({control.center.x.toFixed(2)}, {control.center.y.toFixed(2)})
                </small>
            </div>}
            <SVG onClick={() => zoomIn(0.2)} title="Mouse wheel counterclockwise">
                <circle cx="10" cy="10" r="6" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 15L19 19" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 10H10M12 10H10M10 10V8M10 10V12" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </SVG>
            <SVG onClick={() => zoomIn(-0.2)} title="Mouse wheel clockwise">
                <circle cx="10" cy="10" r="6" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 15L19 19" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 10H10H12" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </SVG>
            <SVG onClick={zoomReset} title="Reset zoom">
                <path d="M15 4V7C15 8 16 9 17 9H20M9 4V7C9 8 8 9 7 9H4M15 20V17C15 16 16 15 17 15H20M9 20V17C9 16 8 15 7 15H4" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </SVG>
            <SVG onClick={() => setControl(old => ({...old, showInfo: !old.showInfo}))} title="Information">
                <circle cx="12" cy="12" r="8" stroke="#000000" fill={ control.showInfo? "#000000" : "none" } strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 16V12M12 8H12.01" stroke={ control.showInfo? "#FFFFFF" : "#000000" } strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </SVG>
            <SVG onClick={() => window.open("./instructions.html", '_blank')} title="Help" >
                <circle cx="12" cy="12" r="8" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <text x="12" y="17" textAnchor="middle" fill="#000000" >?</text>
            </SVG>
        </div>
    );
};

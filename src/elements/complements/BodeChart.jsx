import React, { useEffect, useRef } from 'react';

// Renders magnitude (dB) and phase (deg) vs frequency (log scale), the
// standard Bode plot pair, using two stacked chart.js canvases.
const BodeChart = ({ magnitude, phase, plotWidth = 'auto', plotHeight = 'auto' }) => {
    const magRef = useRef(null);
    const phaseRef = useRef(null);
    const chartsRef = useRef([]);

    useEffect(() => {
        let cancelled = false;

        const render = async () => {
            const module = await import('chart.js/auto');
            if (cancelled) return;
            const Chart = module.default;

            chartsRef.current.forEach((chart) => chart && chart.destroy());
            chartsRef.current = [];

            const makeChart = (containerEl, points, label, yLabel) => {
                if (!containerEl) return null;
                containerEl.innerHTML = '';
                const canvas = document.createElement('canvas');
                canvas.style.width = plotWidth === 'auto' ? '100%' : `${plotWidth}px`;
                canvas.style.height = plotHeight === 'auto' ? '100%' : `${plotHeight}px`;
                containerEl.appendChild(canvas);
                return new Chart(canvas.getContext('2d'), {
                    type: 'line',
                    data: {
                        datasets: [{
                            label,
                            data: points,
                            fill: false,
                            borderColor: '#4bc0c0',
                            backgroundColor: '#4bc0c0',
                            pointRadius: 0,
                            tension: 0.1,
                        }],
                    },
                    options: {
                        maintainAspectRatio: false,
                        animation: false,
                        parsing: false,
                        scales: {
                            x: { type: 'logarithmic', title: { display: true, text: 'Frequency (rad/s)' } },
                            y: { title: { display: true, text: yLabel } },
                        },
                    },
                });
            };

            chartsRef.current = [
                makeChart(magRef.current, magnitude, 'Magnitude', 'Magnitude (dB)'),
                makeChart(phaseRef.current, phase, 'Phase', 'Phase (deg)'),
            ];
        };

        render();

        return () => {
            cancelled = true;
            chartsRef.current.forEach((chart) => chart && chart.destroy());
        };
    }, [magnitude, phase, plotWidth, plotHeight]);

    return (
        <div>
            <div ref={magRef} style={{ width: '100%', height: plotHeight === 'auto' ? 200 : plotHeight }} />
            <div ref={phaseRef} style={{ width: '100%', height: plotHeight === 'auto' ? 200 : plotHeight }} />
        </div>
    );
};

export default BodeChart;

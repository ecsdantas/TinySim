import React, { useEffect, useRef, useState } from 'react';

const HistogramChart = ({ datasets, plotWidth, plotHeight }) => {
  const containerRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    let Chart;
    const canvas = document.createElement('canvas');

    const loadChartJs = async () => {
      const module = await import('chart.js/auto');
      Chart = module.default;

      if (containerRef.current) {
        containerRef.current.innerHTML = ''; // Clear previous canvas
        containerRef.current.appendChild(canvas); // Append new canvas
        canvas.style.width = plotWidth === 'auto' ? '100%' : `${plotWidth}px`;
        canvas.style.height = plotHeight === 'auto' ? '100%' : `${plotHeight}px`;
        const ctx = canvas.getContext('2d');
        if (chartInstance) {
          chartInstance.destroy();
        }
        const newChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: datasets[0].data.map((_, i) => `Bin ${i + 1}`),
            datasets: datasets.map(dataset => ({
              ...dataset,
              backgroundColor: dataset.backgroundColor,
              borderColor: dataset.borderColor,
              borderWidth: 1
            })),
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
            maintainAspectRatio: false,
          },
        });

        setChartInstance(newChartInstance);
      }
    };

    loadChartJs();

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [datasets, plotWidth, plotHeight]);

  return (
    <div ref={containerRef} />
  );
};

export default HistogramChart;

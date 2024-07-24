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

        const bins = 20;
        const dataArray = datasets[0].data;
        const histogramData = new Array(bins).fill(0);
        const minValue = Math.min(...dataArray);
        const maxValue = Math.max(...dataArray);
        const binSize = (maxValue - minValue) / bins;

        dataArray.forEach(value => {
          const bin = Math.floor((value - minValue) / binSize);
          histogramData[Math.min(bin, bins - 1)] += 1;
        });

        const newChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Array.from({ length: bins }, (_, i) => `${(minValue + i * binSize).toFixed(2)}-${(minValue + (i + 1) * binSize).toFixed(2)}`),
            datasets: datasets.map(dataset => ({
              ...dataset,
              data: histogramData,
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

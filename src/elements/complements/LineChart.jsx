import React, { useState, useEffect, useRef } from 'react';

const LineChart = ({ time, datasets, plotWidth, plotHeight }) => {
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
        canvas.style.width = (plotWidth === 'auto')? '100%' : (plotWidth + 'px');
        canvas.style.height = (plotHeight === 'auto')? '100%' : (plotHeight + 'px');
        const ctx = canvas.getContext('2d');
        if (chartInstance) {
          chartInstance.destroy();
        }
        const newChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: time,
            datasets: datasets,
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
  }, [time, datasets, plotWidth, plotHeight]);
  
  

  return (
    <div ref={containerRef} />
  );
};

export default LineChart;

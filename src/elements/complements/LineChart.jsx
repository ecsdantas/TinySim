import React, { useState, useEffect, useRef } from 'react';

const LineChart = (props) => {

const { time, datasets, plotWidth, plotHeight } = props;

const containerRef = useRef(null);

const [chartInstance, setChartInstance] = props.setChartInstance ? [props.chartInstance, props.setChartInstance] : useState(null);

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
            animation: false,
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

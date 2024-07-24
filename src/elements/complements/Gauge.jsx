import React, { useEffect, useRef } from 'react';

const Gauge = ({ value, minValue, maxValue, width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const centerX = width / 2;
    const centerY = height - 10;
    const radius = Math.min(centerX, centerY) - 10;

    context.clearRect(0, 0, width, height);

    // Draw the background arc
    context.beginPath();
    context.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
    context.lineWidth = 20;
    context.strokeStyle = '#ddd';
    context.stroke();

    // Draw the value arc
    const angle = Math.PI + (value - minValue) / (maxValue - minValue) * Math.PI;
    context.beginPath();
    context.arc(centerX, centerY, radius, Math.PI, angle);
    context.lineWidth = 20;
    context.strokeStyle = '#00b0f0';
    context.stroke();

    // Draw the text
    context.font = '25px Arial';
    context.fillStyle = '#000';
    context.textAlign = 'center';
    context.fillText(`${value}`, centerX, centerY - 15);

  }, [value, minValue, maxValue, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default Gauge;

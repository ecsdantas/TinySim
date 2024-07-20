import React, { useState, useEffect, useRef } from 'react';
import { SimNodeModel } from '../SimNodeModel'
import Modal from '../components/modal';
import Simulation from '../simulation/core';
import Chart from 'chart.js/auto';

const LineChart = ({time, data}) => {
    const canvasRef = useRef(null);
  
    useEffect(() => {
      const ctx = canvasRef.current.getContext('2d');
  
      const myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: time,
          datasets: [
            {
              label: 'My First Dataset',
              data: data,
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
  
      return () => {
        myLineChart.destroy(); // Clean up the chart instance on component unmount
      };
    }, []);
  
    return <canvas ref={canvasRef} />;
  };


const Settings = (props) => {
    const [getShow, setShow] = useState(false);
    return (
        <>
            <button onClick={ _ => setShow(e => !e)} className='settings-button'>⚙️</button>
            <Modal show={getShow} handleClose={ _ => setShow(false)} children={<>Hello world 2!</>} title={'Test Modal'} />
        </>
    )
}

class PlotModel extends SimNodeModel {

    kind = 'plot'
    isTerminalBlock = true
    settings = Settings
    value = []
    
    constructor(options = {}) {
        super({...options});
        this.createPort('in', true);
        this.value = [];
        this.component = null;
    }

    // Função principal do bloco
    solution() {
        const inpt = this.getNodeByInput(0);
        if (inpt && inpt.solve) {
            this.value.push(inpt.solve());
            if (Simulation.time.length === this.value.length && this.component) {
                this.component.forceUpdate();
            }
        }
    }

    reset(){
        super.reset()
        this.value = []
    }

    icon = () => {
        if (Simulation.time.length === this.value.length){
            return <LineChart time={ Simulation.time } data={ this.value } />
        }

    /* Retorna o icone padrão */
    return (<svg width="100" height="30" viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100%" height="100%" fill="#000000" />
        <path style={{ opacity: 0.4, stroke: '#b3b3b3', strokeWidth: 1 }} d="M 88,7 V 23 M 80,7 V 23 M 73,7 V 23 M 65,7 V 23 M 57,7 V 23 M 49,7 V 23 M 41,7 V 23 M 33,7 V 23 M 25,7 V 23 M 10,7 V 23 M 18,7 v 16 m -11,0 h 87 M 7,15 h 87 M 7,7 h 87" />
        <path style={{ stroke: '#008080', fill: 'none', strokeWidth: 2 }} d="m 10,23 c 0,0 1,-10 14,-13 13,-3 90,-3 50,-3" />
    </svg>
    )}
    
    
}

export default PlotModel
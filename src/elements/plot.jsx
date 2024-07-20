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

    return (<svg width={100} height={30} viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x={0} y={0} width={'100%'} height={'100%'} fill='#000000' />
    <rect x="10" y="15" width="10" height="10" fill="#FFFFFF" />
    <rect x="30" y="10" width="10" height="15" fill="#FFFFFF" />
    <rect x="50" y="5" width="10" height="20" fill="#FFFFFF" />
    <rect x="70" y="12" width="10" height="13" fill="#FFFFFF" />
  </svg>)}
    
    
}

export default PlotModel
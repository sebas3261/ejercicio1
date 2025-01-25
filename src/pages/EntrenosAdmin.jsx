import React from 'react';
import "../css/entrenos.css";
import TopImg from '../components/TopImg';
import Header from '../components/Header';

export default function EntrenosAdmin() {
  const entrenamientos = [
    { id: 1, title: 'Entrenamiento 1', description: 'Descripción 1', time: '9:41 AM' },
    { id: 2, title: 'Entrenamiento 2', description: 'Descripción 2', time: '9:41 AM' },
    { id: 3, title: 'Entrenamiento 3', description: 'Descripción 3', time: '9:41 AM' },
    { id: 4, title: 'Entrenamiento 4', description: 'Descripción 4', time: '9:41 AM' },
    { id: 4, title: 'Entrenamiento 5', description: 'Descripción 4', time: '9:41 AM' },
    { id: 4, title: 'Entrenamiento 4', description: 'Descripción 4', time: '9:41 AM' }
  ];

  return (
    <div className='Entrenos-background'>
      <Header type="admin" />
      <TopImg number={5} />
      <div className='Entrenos-card'>
        <h2 className='Entrenos-title'>Entrenamientos</h2>
        <div className='Entrenos-list'>
          {entrenamientos.map((entreno) => (
            <div key={entreno.id} className='Entreno-item'>
              <div className='Entreno-image'></div>
              <div className='Entreno-info'>
                <h3>{entreno.title}</h3>
                <p>{entreno.description}</p>
              </div>
              <span className='Entreno-time'>{entreno.time}</span>
            </div>
          ))}
        </div>
      </div>
      <button className='Entreno-button'>Crear nuevo entrenamiento</button>
    </div>
  );
}

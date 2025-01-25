import React from 'react';
import "../css/torneos.css";
import TopImg from '../components/TopImg';
import Header from '../components/Header';

export default function TorneosUser() {
  const entrenamientos = [
    { id: 1, title: 'Torneo 1', description: 'Descripción 1', time: '9:41 AM' },
    { id: 2, title: 'Torneo 2', description: 'Descripción 2', time: '9:41 AM' },
    { id: 3, title: 'Torneo 3', description: 'Descripción 3', time: '9:41 AM' },
    { id: 4, title: 'Torneo 4', description: 'Descripción 4', time: '9:41 AM' },
    { id: 5, title: 'Torneo 5', description: 'Descripción 4', time: '9:41 AM' },
    { id: 6, title: 'Torneo 4', description: 'Descripción 4', time: '9:41 AM' }

  ];

  return (
    <div className='Torneos-background'>
      <Header type="user" />
      <TopImg number={1} />
      <div className='Torneos-card'>
        <h2 className='Torneos-title'>Tus Torneos</h2>
        <div className='Torneos-list'>
          {entrenamientos.map((entreno) => (
            <div key={entreno.id} className='Torneos-item'>
              <div className='Torneo-image'></div>
              <div className='Torneo-info'>
                <h3>{entreno.title}</h3>
                <p>{entreno.description}</p>
              </div>
              <span className='Torneo-time'>{entreno.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import "../css/UserHome.css";
import TopImg from '../components/TopImg';
import Header from '../components/Header';

export default function UserHome() {
  return (
    <div className='Admin-background'>
      <Header type="user"/>
      <TopImg number={4}/>
      <div className='Admin-card'>
        <div className='Admin-card-header'>
          <h1>Próximos torneos</h1>
          <div className="home-button">
            Ver todos
        </div>
        </div>
        <h2></h2>

      </div>
    </div>
  );
}

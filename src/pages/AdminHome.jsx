import React from 'react';
import "../css/AdminHome.css";
import TopImg from '../components/TopImg';
import Header from '../components/Header';

export default function AdminHome() {
  return (
    <div className='Admin-background'>
      <Header type="admin"/>
      <TopImg number={3}/>
      <div className='Admin-card'>
        <h2>Administrar miembros</h2>
        <h2></h2>

      </div>
    </div>
  );
}

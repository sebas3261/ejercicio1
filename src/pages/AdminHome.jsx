import React from 'react';
import "../css/AdminHome.css";
import Header from '../components/header';
import TopImg from '../components/TopImg';

export default function AdminHome() {
  return (
    <div className='Admin-background'>
      <Header type="admin" />
      <TopImg number={3}/>
      <div className='Admin-card'>
        <h2>Administrar miembros</h2>
        <h2></h2>

      </div>
    </div>
  );
}

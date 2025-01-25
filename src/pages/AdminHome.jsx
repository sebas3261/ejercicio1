import React from 'react';
import "../css/AdminHome.css";
import Header from '../components/header';
import foto3 from '../assets/foto3.jpg'; // Importa la imagen

export default function AdminHome() {
  return (
    <div className='Admin-background'>
      <Header type="admin" />
      <div className='Admin-img-container'>
        <img src={foto3} alt="Descripción de la imagen" className='Admin-img' />
      </div>
      <div className='Admin-card'>

      </div>
    </div>
  );
}

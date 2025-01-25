import React from 'react';
import "../css/UserHome.css";
import TopImg from '../components/TopImg';
import Header from '../components/Header';
import { NavLink } from "react-router";

export default function UserHome() {
  return (
    <div className='User-background'>
      <Header type="user"/>
      <TopImg number={4}/>
      <div className='User-card'>
        <div className='User-card-header'>
          <h1>Próximos torneos</h1>
        <NavLink to={"/torneosUser"} className={"navlink"}>
          <div className="home-button">
            Ver todos
        </div>
        </NavLink>
          
        </div>
        <h2></h2>

      </div>
    </div>
  );
}

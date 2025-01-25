import React from "react";
import "./header.css";
import { NavLink } from "react-router";
export default function Header({ type }) {
  if (type == "admin") {
    return (
      <div className="header-container">
        <div className="header-content">
          <NavLink to={"/admindashboard"} className={"navlink"}>
            <p>Inicio</p>
          </NavLink>
          <NavLink to={"/entrenosAdmin"} className={"navlink"}>
          <p>Entrenamiento</p>
          </NavLink>
          <NavLink to={"/torneosAdmin"} className={"navlink"}>
          <p>Torneos</p>
          </NavLink>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          fill="currentColor"
          clasName="bi bi-person"
          viewBox="0 0 16 16"
        >
          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="header-container">
      <div className="header-content">
        <NavLink to={"/userdashboard"} className={"navlink"}>
        <p>Inicio</p>
        </NavLink>
        <NavLink to={"/entrenosUser"} className={"navlink"}>
        <p>Mis entrenamientos</p>
        </NavLink>
        <NavLink to={"/torneosUser"} className={"navlink"}>
        <p>Mis torneos</p>
        </NavLink>
        <NavLink to={"/infouser"} className={"navlink"}>
        <p>Mi Información</p>
        </NavLink>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        fill="currentColor"
        clasName="bi bi-person"
        viewBox="0 0 16 16"
      >
        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
      </svg>
    </div>
  );
}

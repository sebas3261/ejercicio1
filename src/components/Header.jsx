import React from "react";
import "./header.css";
import { NavLink } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
export default function Header({ type }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout =  () => {
    const confirmLogOut = window.confirm("¿Estás seguro de que deseas cerrar tu sesión?");
  
    if (!confirmLogOut) {
      return;
    }
    else {
      logout();
    navigate("/");

    }
    

    
  }
  if (type == "profesor") {
    return (
      <div className="header-container">
        <div className="header-content">
          <NavLink to={"/entrenosProfe"} className={"navlink"}>
            <p>Entrenamiento</p>
          </NavLink>
        </div>
        <div onClick={handleLogout}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            fill="currentColor"
            class="bi bi-box-arrow-right"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
            />
            <path
              fill-rule="evenodd"
              d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
            />
          </svg>
        </div>
      </div>
    );
  }
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
        <div onClick={handleLogout}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            fill="currentColor"
            class="bi bi-box-arrow-right"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
            />
            <path
              fill-rule="evenodd"
              d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
            />
          </svg>
        </div>
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
      <div onClick={handleLogout}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          fill="currentColor"
          class="bi bi-box-arrow-right"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
          />
          <path
            fill-rule="evenodd"
            d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
          />
        </svg>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import "../css/Home.css";

export default function Home() {
  const [name, setName] = useState(""); // En este caso, `name` será el email
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogIn = async () => {
    const type = await login({ name, password }); // Aquí usamos el email como `name`
    if (type === "admin") {
      navigate("/admindashboard");
    } else if (type === "user") {
      navigate("/userdashboard");
    } else {
      alert("Error: Usuario o contraseña incorrectos no hay tipo");
    }
  };

  return (
    <div className="home-background">
      <div className="home-backbox">
        <h1>Sign in</h1>
        <div>
          <input
            type="email" // Cambiado a email para mayor claridad
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Email"
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>
        <div
          onClick={() => {
            handleLogIn();
          }}
          className="home-button"
        >
          Enter
        </div>
        <NavLink to={"/SignUp"} className={"navlink"}>
          <div>Sign up</div>
        </NavLink>
      </div>
    </div>
  );
}

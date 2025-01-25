import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import "../css/Home.css";

export default function Home() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogIn = () => {
    const type = login({ name, password, type: "admin" });
    console.log(type);
    if (type === "admin") {
      navigate("/admindashboard");
    } else {
      navigate("/userdashboard");
    }
  };
  return (
    <div className="home-background">
      <div className="home-backbox">
        <h1>Nombre del club</h1>
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="User"
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
          <div>sign up</div>
        </NavLink>
      </div>
    </div>
  );
}

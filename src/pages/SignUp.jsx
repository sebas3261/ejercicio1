import React, { useEffect, useState } from "react";
import SignUpSteps from "../components/SignUpSteps";
import "../css/Signup.css";
import { useNavigate, NavLink } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorType, setErrorType] = useState(1);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    lastname: "",
    email: "",
    number: "",
    address: "",
    birthday: "",
    level: "Principiante",
    category: "",
    rol: "user",
    emergencyContact: "",
    emergenciContactNumber: "",
    emergencyContactRelation: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === "name" || name === "emergencyContact") && !/^[a-zA-Z\s6]*$/.test(value)) {
      return;
    }

    if (name === "lastname" && !/^[a-zA-Z\s]*$/.test(value)) {
      return;
    }

    if ((name === "number" || name === "emergenciContactNumber") && !/^3\d{0,9}$/.test(value)) {
      return;
    }

    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      user.category = getCategoriaByEdad();
      console.log(user);
    }

    if (error) {
      return;
    }
    setStep(step + 1);
    setError(true);
  };

  const handleSignUp = async () => {
    setError(false);
    const emailPattern = /^[^\s@]+@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(user.email)) {
      setErrorType(4);
      setError(true);
      return false;
    }

    if (password === "") {
      setErrorType(5);
      setError(true);
      return false;
    }
    if (/\s/.test(password)) {
      setErrorType(3);
      setError(true);
      return false;
    }
    try {
      await signUp(user, password);
      navigate("/");
      alert("Registro completado exitosamente");
    } catch (error) {
      console.log(error);
    }
    setError(false);
    return true;
  };

  const getCategoriaByEdad = () => {
    const fechaActual = new Date();
    const fechaNac = new Date(user.birthday);
    let edad = fechaActual.getFullYear() - fechaNac.getFullYear();

    if (
      fechaActual.getMonth() < fechaNac.getMonth() ||
      (fechaActual.getMonth() === fechaNac.getMonth() && fechaActual.getDate() < fechaNac.getDate())
    ) {
      edad--;
    }

    if (edad >= 5 && edad <= 12) {
      return 'Infantil';
    } else if (edad >= 13 && edad <= 17) {
      return 'Juvenil';
    } else if (edad >= 18 && edad <= 39) {
      return 'Adulto';
    } else if (edad >= 40 && edad <= 100) {
      return 'Profesional';
    } else {
      return 'Infantil';
    }
  };

  return (
    <div className="signup-fields signup-background">
      <SignUpSteps
        user={user}
        handleChange={handleChange}
        step={step}
        error={error}
        setError={setError}
        setPasswordGlobal={setPassword}
        errorType={errorType}
        setErrorType={setErrorType}
      />
      <div>
        {step > 1 && (
          <button onClick={() => { setStep(step - 1); setError(false); }} className="signup-button">
            Anterior
          </button>
        )}
        {step < 3 && (
          <button onClick={handleNext} className="signup-button">
            Siguiente
          </button>
        )}
        {step === 3 && (
          <button onClick={handleSignUp} className="signup-button register-white-button">
            Registrarse
          </button>
        )}
      </div>
      <NavLink
        to="/login"
        className="navlink"
        style={{ color: "white", fontWeight: "bold", marginTop: "5px" }}
      >
        ¿Ya tienes cuenta? Iniciar sesión
      </NavLink>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import Error from "./Error";

export default function SignUpSteps({
  user,
  handleChange,
  step,
  error,
  setError,
  setPasswordGlobal,
  errorType,
  setErrorType,
}) {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  useEffect(() => {
    if (!password || !password2) {
      setError(false);
      return;
    }

    if (password.length < 6) {
      setError(true);
      setErrorType(1);
      return;
    }

    if (password !== password2) {
      setError(true);
      setErrorType(2);
      return;
    }
    setPasswordGlobal(password);
    setError(false);
  }, [password, password2]);

  useEffect(() => {
    if(step == 1){
        if(!user.name || !user.lastname || !user.number || !user.address || !user.birthday){
            setError(true);
            setErrorType(7);
            return
        }
        if (!validateFechaNacimiento(user.birthday)) {
            setError(true);
            setErrorType(8);
            return
        }
        if(user.number.length != 10){
          setError(true);
          setErrorType(9);
          return
      }
    }
    if(step == 2){
        if(!user.emergenciContactNumber || !user.emergencyContact){
            setError(true);
            setErrorType(7);
            return
        }
        if(user.emergenciContactNumber.length != 10){
          setError(true);
          setErrorType(9);
          return
        }
    }
    setError(false);
    setErrorType(7)
  },[user])

  const validateFechaNacimiento = (fechaNacimiento) => {
      const fechaActual = new Date();
      const fechaNac = new Date(fechaNacimiento);
      let edad = fechaActual.getFullYear() - fechaNac.getFullYear();
  
      if (
        fechaActual.getMonth() < fechaNac.getMonth() ||
        (fechaActual.getMonth() === fechaNac.getMonth() &&
          fechaActual.getDate() < fechaNac.getDate())
      ) {
        edad--;
      }
  
      return edad >= 5 && edad <= 100;
    };

  if (step === 3) {
    return (
      <div className="signup-fields">
        <h1>Ultimo paso: correo y contraseña</h1>
        <div>
          <input
            type="email"
            name="email"
            value={user?.email || ""}
            onChange={handleChange}
            placeholder="Correo"
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
          />
        </div>
        <div>
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            placeholder="Verificar contraseña"
          />
        </div>
        {error && <Error type={errorType} />}
      </div>
    );
  }
  if (step == 1) {
    return (
      <div className="signup-fields">
        <h1>Bienvenido a CourtSide</h1>
        <div>
          <input
            type="text"
            name="name"
            value={user?.name || ""}
            onChange={handleChange}
            placeholder="Nombre"
          />
        </div>
        <div>
          <input
            type="text"
            name="lastname"
            value={user?.lastname || ""}
            onChange={handleChange}
            placeholder="Apellido"
          />
        </div>
        <div>
          <select
            name="rol"
            value={user?.rol || "user"}
            onChange={handleChange}
          >
            <option value="user">Usuario</option>
            <option value="profesor">Profesor</option>
          </select>
        </div>
        <div>
          <input
            type="tel"
            name = "number"
            value={user?.number || ""}
            onChange={handleChange}
            placeholder="Teléfono"
          />
        </div>
        <div>
          <input
            type="text"
            name="address"
            value={user?.address || ""}
            onChange={handleChange}
            placeholder="Dirección"
          />
        </div>
        <div>
          <input
            type="date"
            name = "birthday"
            value={user?.birthday || ""}
            onChange={handleChange}
            placeholder="Fecha de nacimiento"
          />
        </div>
        <div>
          <select
            name = "level"
            value={user?.level || ""}
            onChange={handleChange}
          >
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
        </div>
        {error && <Error type={errorType} />}
      </div>
    );
  }

  if(step == 2){
    return (
        <div className='signup-fields'>
          <h1>Paso 2: Contacto de Emergencia</h1>
          <div>
            <input
              type="text"
              name = "emergencyContact"
              value={user?.emergencyContact || ""}
              onChange={handleChange}
              placeholder="Nombre del contacto"
            />
          </div>
          <div>
            <input
              type="tel"
              name = "emergenciContactNumber"
              value={user?.emergenciContactNumber || ""}
              onChange={handleChange}
              placeholder="Teléfono del contacto"
            />
          </div>
          <div>
          <select
            name = "emergencyCpntactRelation"
            value={user?.emergencyCpntactRelation || ""}
            onChange={handleChange}
          >
            <option value="Familiar">Familiar</option>
            <option value="Pareja">Pareja</option>
            <option value="Conocido">Conocido</option>
          </select>
          </div>
          {error && <Error type={errorType} />}
        </div>
      );
  }
  return
}

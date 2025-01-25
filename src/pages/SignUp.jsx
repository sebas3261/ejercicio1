import React, { useState } from "react";
import { NavLink } from "react-router";

export default function SignUp() {
  const [step, setStep] = useState(1);

  // Step 1: User information
  const [user, setUser] = useState({
    name: "",
    apellido: "",
    password: "",
    password2: "",
    email: "",
    telefono: "",
    direccion: "",
    fechaNacimiento: "",
    nivelJuego: "Principiante",
    categoria: "Infantil",
    condicionesMedicas: "",
    alergias: "",
    certificadoMedico: "",
    contactoEmergencia: "",
    telefonoEmergencia: "",
    relacionEmergencia: "",
    metodoPago: "Tarjeta",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevState) => ({ ...prevState, [name]: value }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h1>Parte 1: Información Personal</h1>
            <div>
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleInputChange}
                placeholder="Nombre"
              />
            </div>
            <div>
              <input
                type="text"
                name="apellido"
                value={user.apellido}
                onChange={handleInputChange}
                placeholder="Apellido"
              />
            </div>
            <div>
              <input
                type="tel"
                name="telefono"
                value={user.telefono}
                onChange={handleInputChange}
                placeholder="Teléfono"
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleInputChange}
                placeholder="Email"
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                value={user.password}
                onChange={handleInputChange}
                placeholder="Contraseña"
              />
            </div>
            <div>
              <input
                type="password"
                name="password2"
                value={user.password2}
                onChange={handleInputChange}
                placeholder="Verificar contraseña"
              />
            </div>
            <div>
              <input
                type="text"
                name="direccion"
                value={user.direccion}
                onChange={handleInputChange}
                placeholder="Dirección"
              />
            </div>
            <div>
              <input
                type="date"
                name="fechaNacimineto"
                value={user.fechaNacimiento}
                onChange={handleInputChange}
                placeholder="Fecha de nacimiento"
              />
            </div>
            <div>
              <select
                value={user.nivelJuego}
                name="nivelJuego"
                onChange={handleInputChange}
              >
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
            <div>
              <select
                name="categoria"
                value={user.categoria}
                onChange={handleInputChange}
              >
                <option value="Infantil">Infantil</option>
                <option value="Juvenil">Juvenil</option>
                <option value="Adulto">Adulto</option>
                <option value="Profesional">Profesional</option>
              </select>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h1>Parte 2: Información Médica</h1>
            <div>
              <textarea
                value={user.condicionesMedicas}
                name="condicionesMedicas"
                onChange={handleInputChange}
                placeholder="Condiciones Médicas"
              ></textarea>
            </div>
            <div>
              <textarea
                value={user.alergias}
                name="alergias"
                onChange={handleInputChange}
                placeholder="Alergias"
              ></textarea>
            </div>
            <div>
              <input
                type="text"
                name="certificadoMedico"
                value={user.certificadoMedico}
                onChange={handleInputChange}
                placeholder="Certificado Médico"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h1>Parte 3: Contacto de Emergencia</h1>
            <div>
              <input
                type="text"
                name="contactoEmergencia"
                value={user.contactoEmergencia}
                onChange={handleInputChange}
                placeholder="Nombre del contacto"
              />
            </div>
            <div>
              <input
                type="tel"
                name="telefonoEmergencia"
                value={user.telefonoEmergencia}
                onChange={handleInputChange}
                placeholder="Teléfono del contacto"
              />
            </div>
            <div>
              <input
                type="text"
                name="relacionEmergencia"
                value={user.relacionEmergencia}
                onChange={handleInputChange}
                placeholder="Relación con el contacto"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h1>Parte 4: Pago de Matrícula</h1>
            <div>
              <select value={user.metodoPago} onChange={handleInputChange} name="metodoPago">
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia Bancaria</option>
                <option value="Efectivo">Efectivo</option>
              </select>
            </div>
            <div>
              <button onClick={() => console.log(user)}>
                Finalizar Matrícula
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {renderStep()}
      <div>
        {step > 1 && <button onClick={() => setStep(step - 1)}>Back</button>}
        {step < 4 && <button onClick={() => setStep(step + 1)}>Next</button>}
      </div>
      <NavLink to={"/"}>
        <div>Home</div>
      </NavLink>
    </div>
  );
}

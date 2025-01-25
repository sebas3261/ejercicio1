import React, { useState } from 'react';
import { NavLink } from "react-router";

export default function SignUp() {
  const [step, setStep] = useState(1);

  // Step 1: User information
  const [name, setName] = useState('');
  const [apellido, setApellido] = useState('');
  const [password, CreatePassword] = useState('');
  const [password2, VerifyPassword] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [nivelJuego, setNivelJuego] = useState('Principiante');
  const [categoria, setCategoria] = useState('Infantil');

  // Step 2: Medical information
  const [condicionesMedicas, setCondicionesMedicas] = useState('');
  const [alergias, setAlergias] = useState('');
  const [certificadoMedico, setCertificadoMedico] = useState('');

  // Step 3: Emergency contact
  const [contactoEmergencia, setContactoEmergencia] = useState('');
  const [telefonoEmergencia, setTelefonoEmergencia] = useState('');
  const [relacionEmergencia, setRelacionEmergencia] = useState('');

  // Step 4: Payment
  const [metodoPago, setMetodoPago] = useState('Tarjeta');

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h1>Parte 1: Información Personal</h1>
            <div>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Nombre"
              />
            </div>
            <div>
              <input 
                type="text" 
                value={apellido} 
                onChange={(e) => setApellido(e.target.value)} 
                placeholder="Apellido"
              />
            </div>
            <div>
              <input 
                type="tel" 
                value={telefono} 
                onChange={(e) => setTelefono(e.target.value)} 
                placeholder="Teléfono"
              />
            </div>
            <div>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Email"
              />
            </div>
            <div>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => CreatePassword(e.target.value)} 
                placeholder="Contraseña"
              />
            </div>
            <div>
              <input 
                type="password" 
                value={password2} 
                onChange={(e) => VerifyPassword(e.target.value)} 
                placeholder="Verificar contraseña"
              />
            </div>
            <div>
              <input 
                type="text" 
                value={direccion} 
                onChange={(e) => setDireccion(e.target.value)} 
                placeholder="Dirección"
              />
            </div>
            <div>
              <input 
                type="date" 
                value={fechaNacimiento} 
                onChange={(e) => setFechaNacimiento(e.target.value)} 
                placeholder="Fecha de nacimiento"
              />
            </div>
            <div>
              <select value={nivelJuego} onChange={(e) => setNivelJuego(e.target.value)}>
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
            <div>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
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
                value={condicionesMedicas} 
                onChange={(e) => setCondicionesMedicas(e.target.value)} 
                placeholder="Condiciones Médicas"
              ></textarea>
            </div>
            <div>
              <textarea 
                value={alergias} 
                onChange={(e) => setAlergias(e.target.value)} 
                placeholder="Alergias"
              ></textarea>
            </div>
            <div>
              <input 
                type="text" 
                value={certificadoMedico} 
                onChange={(e) => setCertificadoMedico(e.target.value)} 
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
                value={contactoEmergencia} 
                onChange={(e) => setContactoEmergencia(e.target.value)} 
                placeholder="Nombre del contacto"
              />
            </div>
            <div>
              <input 
                type="tel" 
                value={telefonoEmergencia} 
                onChange={(e) => setTelefonoEmergencia(e.target.value)} 
                placeholder="Teléfono del contacto"
              />
            </div>
            <div>
              <input 
                type="text" 
                value={relacionEmergencia} 
                onChange={(e) => setRelacionEmergencia(e.target.value)} 
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
              <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia Bancaria</option>
                <option value="Efectivo">Efectivo</option>
              </select>
            </div>
            <div>
              <button onClick={() => console.log('Matrícula completada')}>Finalizar Matrícula</button>
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


import React, { useState } from 'react';
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, NavLink } from "react-router";
import "../css/Signup.css";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

export default function SignUp() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Step 1: User information
  const [name, setName] = useState('');
  const [apellido, setApellido] = useState('');
  const [password, createPassword] = useState('');
  const [password2, verifyPassword] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [edadError, setEdadError] = useState('');
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

  const handleFechaNacimientoChange = (e) => {
    const value = e.target.value;
    setFechaNacimiento(value);

    if (value) {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }

      if (age < 5 || age > 100) {
        setEdadError("La edad debe estar entre 5 y 100 años.");
      } else {
        setEdadError("");
      }
    } else {
      setEdadError("");
    }
  };

  const validateStep1 = () => {
    if (password !== password2) {
      alert('Las contraseñas deben ser iguales.');
      return false;
    }
    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    if (!email.includes('@')) {
      alert('El correo es inválido.');
      return false;
    }
    return true;
  };

  const handleFinalSubmit = async () => {
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        type: "user",
        name,
        apellido,
        email,
        telefono,
        direccion,
        fechaNacimiento,
        nivelJuego,
        categoria,
        condicionesMedicas,
        alergias,
        certificadoMedico,
        contactoEmergencia,
        telefonoEmergencia,
        relacionEmergencia,
        password,
        metodoPago
      });

      navigate("/");
      alert("Registro completado exitosamente");
    } catch (error) {
      alert("Error al guardar los datos: " + error.message);
    }
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) {
      return;
    }
    if (step === 2 && edadError) {
      alert(edadError);
      return;
    }
    setStep(step + 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className='signup-fields'>
            <h1>Bienvenido a CourtSide</h1>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo" />
            <input type="password" value={password} onChange={(e) => createPassword(e.target.value)} placeholder="Contraseña" />
            <input type="password" value={password2} onChange={(e) => verifyPassword(e.target.value)} placeholder="Verificar contraseña" />
          </div>
        );
      case 2:
        return (
          <div className='signup-fields'>
            <h1>Información Personal</h1>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" />
            <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Apellido" />
            <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono" />
            <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Dirección" />
            <input type="date" value={fechaNacimiento} onChange={handleFechaNacimientoChange} placeholder="Fecha de nacimiento" />
            {edadError && <p style={{ color: 'red' }}>{edadError}</p>}
            <select value={nivelJuego} onChange={(e) => setNivelJuego(e.target.value)}>
              <option value="Principiante">Principiante</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="Infantil">Infantil</option>
              <option value="Juvenil">Juvenil</option>
              <option value="Adulto">Adulto</option>
              <option value="Profesional">Profesional</option>
            </select>
          </div>
        );
      case 3:
        return (
          <div className='signup-fields'>
            <h1>Información Médica</h1>
            <textarea value={condicionesMedicas} onChange={(e) => setCondicionesMedicas(e.target.value)} placeholder="Condiciones Médicas"></textarea>
            <textarea value={alergias} onChange={(e) => setAlergias(e.target.value)} placeholder="Alergias"></textarea>
            <input type="text" value={certificadoMedico} onChange={(e) => setCertificadoMedico(e.target.value)} placeholder="Certificado Médico" />
          </div>
        );
      case 4:
        return (
          <div className='signup-fields'>
            <h1>Contacto de Emergencia</h1>
            <input type="text" value={contactoEmergencia} onChange={(e) => setContactoEmergencia(e.target.value)} placeholder="Nombre del contacto" />
            <input type="tel" value={telefonoEmergencia} onChange={(e) => setTelefonoEmergencia(e.target.value)} placeholder="Teléfono del contacto" />
            <input type="text" value={relacionEmergencia} onChange={(e) => setRelacionEmergencia(e.target.value)} placeholder="Relación con el contacto" />
          </div>
        );
      case 5:
        return (
          <div className='signup-fields'>
            <h1>Pago de Matrícula</h1>
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia Bancaria</option>
              <option value="Efectivo">Efectivo</option>
            </select>
            <button onClick={handleFinalSubmit} className='signup-button-matricula'>Finalizar Matrícula</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='signup-fields signup-background'>
      {renderStep()}
      <button onClick={handleNext}>Next</button>
    </div>
  );
}

import React, { useState } from 'react';
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, NavLink } from "react-router-dom"; // Corregido: "react-router" a "react-router-dom"
import "../css/Signup.css";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

export default function SignUp() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Estados para todos los pasos
  const [name, setName] = useState('');
  const [apellido, setApellido] = useState('');
  const [password, setPassword] = useState(''); // Cambiado: createPassword a setPassword
  const [password2, setPassword2] = useState(''); // Cambiado: verifyPassword a setPassword2
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [nivelJuego, setNivelJuego] = useState('Principiante');
  const [categoria, setCategoria] = useState('Infantil');
  const [condicionesMedicas, setCondicionesMedicas] = useState('');
  const [alergias, setAlergias] = useState('');
  const [certificadoMedico, setCertificadoMedico] = useState('');
  const [contactoEmergencia, setContactoEmergencia] = useState('');
  const [telefonoEmergencia, setTelefonoEmergencia] = useState('');
  const [relacionEmergencia, setRelacionEmergencia] = useState('');
  const [metodoPago, setMetodoPago] = useState('Tarjeta');

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

  // Validaciones de campos (sin cambios)

  const validateStep1 = () => {
    if (!email || !password || !password2) {
      alert('Complete todos los campos.');
      return false;
    }
    if (password !== password2) {
      alert('Las contraseñas no coinciden.');
      return false;
    }
    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    if (!email.includes('@')) {
      alert('Correo electrónico inválido.');
      return false;
    }
    return true;
  };

  const validateFields = () => {
    switch (step) {
      case 1:
        return !!email && !!password && !!password2;
      case 2:
        return !!name && !!apellido && !!telefono && !!direccion && !!fechaNacimiento;
      case 3:
        return true; // Opcional: ajustar si los campos médicos son requeridos
      case 4:
        return !!contactoEmergencia && !!telefonoEmergencia && !!relacionEmergencia;
      case 5:
        return !!metodoPago;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (!validateFields()) {
      alert('Complete todos los campos obligatorios.');
      return;
    }
    setStep(step + 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className='signup-fields'>
            <h1>Registro: Correo y Contraseña</h1>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Confirmar Contraseña"
              required
            />
          </div>
        );
      case 2:
        return (
          <div className='signup-fields'>
            <h1>Información Personal</h1>
            {/* Campos de información personal */}
          </div>
        );
      case 3:
        return (
          <div className='signup-fields'>
            <h1>Información Médica</h1>
            {/* Campos médicos */}
          </div>
        );
      case 4:
        return (
          <div className='signup-fields'>
            <h1>Contacto de Emergencia</h1>
            {/* Campos de contacto de emergencia */}
          </div>
        );
      case 5:
        return (
          <div className='signup-fields'>
            <h1>Pago de Matrícula</h1>
            {/* Campos de pago */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='signup-fields signup-background'>
      {renderStep()}
      <div>
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className='signup-button'>
            Anterior
          </button>
        )}
        {step < 5 ? (
          <button onClick={handleNext} className='signup-button'>
            Siguiente
          </button>
        ) : (
          <button onClick={handleFinalSubmit} className='signup-button'>
            Finalizar Registro
          </button>
        )}
      </div>
      <NavLink to="/" className="navlink">
        <div>¿Ya tienes cuenta? Inicia sesión</div>
      </NavLink>
    </div>
  );
}
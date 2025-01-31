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
  const [nivelJuego, setNivelJuego] = useState('Principiante');
  const [categoria, setCategoria] = useState('Infantil');
  const [rol, setRol] = useState('Usuario');

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

  // Función para validar la fecha de nacimiento
  const validateFechaNacimiento = (fechaNacimiento) => {
    const fechaActual = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = fechaActual.getFullYear() - fechaNac.getFullYear();

    // Ajustar la edad si aún no ha pasado el cumpleaños este año
    if (
      fechaActual.getMonth() < fechaNac.getMonth() ||
      (fechaActual.getMonth() === fechaNac.getMonth() && fechaActual.getDate() < fechaNac.getDate())
    ) {
      edad--;
    }

    return edad >= 5 && edad <= 100;
  };

  // Función para asignar la categoría según la edad
  const getCategoriaByEdad = (fechaNacimiento) => {
    const fechaActual = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = fechaActual.getFullYear() - fechaNac.getFullYear();

    // Ajustar la edad si aún no ha pasado el cumpleaños este año
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
      return 'Infantil'; // Por defecto, aunque la validación previa debería evitar esto
    }
  };

  const handleFinalSubmit = async () => {
    try {
      // Registrar al usuario en Firebase Authentication
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Obtener el UID del usuario registrado
      const user = userCredential.user;

      // Guardar la información adicional del usuario en Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,  // Guardamos el UID para referenciar al usuario en Firebase Authentication
        type: rol,
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
        metodoPago,
        isAuthenticated: false
      });
      navigate("/");
      alert("Registro completado exitosamente");
    } catch (error) {
      alert("Error al guardar los datos: " + error.message);
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z\s6]*$/.test(value)) {
      setName(value);
    }
  };

  const handleApellidoChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setApellido(value);
    }
  };

  const handleContactoEmergenciaChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setContactoEmergencia(value);
    }
  };

  const handleRelacionEmergenciaChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setRelacionEmergencia(value);
    }
  };

  const handleTelefonoChange = (e) => {
    const value = e.target.value;
    if (/^3\d{0,9}$/.test(value)) {
      setTelefono(value);
    }
  };

  const handleTelefonoEmergenciaChange = (e) => {
    const value = e.target.value;
    if (/^3\d{0,9}$/.test(value)) {
      if (value !== telefono) { // Verifica que no sea igual al teléfono principal
        setTelefonoEmergencia(value);
      } else {
        alert("El número de emergencia no puede ser igual al número principal.");
      }
    }
  };

  const validateStep1 = () => {
    if (password !== password2) {
      alert('Las contraseñas deben ser iguales.');
      return false;
    }
    if (password && password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    if (/\s/.test(password)) {
      alert('La contraseña no puede contener espacios.');
      return false;
    }
    const emailPattern = /^[^\s@]+@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
    alert('El correo es inválido. Recuerde que no puede tener espacios');
    return false;
  }
  return true;
  };

  const validateFields = () => {
    if (step === 1) {
      // Solo verifica si hay datos en los campos
      return password && password2 && email;
    } else if (step === 2) {
      return name && apellido && telefono && direccion && fechaNacimiento;
    } else if (step === 3) {
      return condicionesMedicas && alergias && certificadoMedico;
    } else if (step === 4) {
      return contactoEmergencia && telefonoEmergencia && relacionEmergencia;
    } else if (step === 5) {
      return metodoPago;
    }

    return false;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) {
      return;
    }

    if (step === 2) {
      if (!validateFechaNacimiento(fechaNacimiento)) {
        alert('La fecha de nacimiento debe estar en el rango de 5 a 100 años.');
        return;
      }
      const categoriaCalculada = getCategoriaByEdad(fechaNacimiento);
      setCategoria(categoriaCalculada);
    }

    if (!validateFields()) {
      if (!document.getElementById("error-msg")) {
        alert('Por favor, complete todos los campos antes de continuar.');
      }
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
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => createPassword(e.target.value)}
                placeholder="Contraseña"
              />
            </div>
            <div>
              <input
                type="password"
                value={password2}
                onChange={(e) => verifyPassword(e.target.value)}
                placeholder="Verificar contraseña"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className='signup-fields'>
            <h1>Parte 1: Información Personal</h1>
            <div>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="Nombre"
              />
            </div>
            <div>
              <input
                type="text"
                value={apellido}
                onChange={handleApellidoChange}
                placeholder="Apellido"
              />
            </div>
            <div>
              <select value={rol} onChange={(e) => setRol(e.target.value)}>
                <option value="usuario">Usuario</option>
                <option value="profesor">Profesor</option>
              </select>
            </div>
            <div>
              <input
                type="tel"
                value={telefono}
                onChange={handleTelefonoChange}
                placeholder="Teléfono"
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
              </select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className='signup-fields'>
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
      case 4:
        return (
          <div className='signup-fields'>
            <h1>Parte 3: Contacto de Emergencia</h1>
            <div>
              <input
                type="text"
                value={contactoEmergencia}
                onChange={handleContactoEmergenciaChange}
                placeholder="Nombre del contacto"
              />
            </div>
            <div>
              <input
                type="tel"
                value={telefonoEmergencia}
                onChange={handleTelefonoEmergenciaChange}
                placeholder="Teléfono del contacto"
              />
            </div>
            <div>
              <input
                type="text"
                value={relacionEmergencia}
                onChange={handleRelacionEmergenciaChange}
                placeholder="Relación con el contacto"
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className='signup-fields'>
            <h1>Parte 4: Pago de Matrícula</h1>
            <div>
              <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia Bancaria</option>
                <option value="Efectivo">Efectivo</option>
              </select>
            </div>
            <div>
              <button onClick={handleFinalSubmit} className='signup-button-matricula'>Finalizar Matrícula</button>
            </div>
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
        {step > 1 && <button onClick={() => setStep(step - 1)} className='signup-button'>Back</button>}
        {step < 5 && <button onClick={handleNext} className='signup-button'>Next</button>}
      </div>
      <NavLink to={"/"} className={"navlink"}>
        <div>Sign in</div>
      </NavLink>
    </div>
  );
}
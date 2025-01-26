import React, { useState, useEffect } from 'react';
import { db } from "../firebase";
import { collection, doc, setDoc, getDocs, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import "../css/entrenos.css";
import TopImg from '../components/TopImg';
import Header from '../components/Header';

export default function EntrenosAdmin() {
  const [showCreateEntreno, setShowCreateEntreno] = useState(false);
  const [entrenos, setEntrenos] = useState([]);
  const [entrenoName, setEntrenoName] = useState('');
  const [categoria, setCategoria] = useState('Infantil');
  const [cancha, setCancha] = useState('');
  const [users, setUsers] = useState([]);
  const [attendanceSelection, setAttendanceSelection] = useState({});

  // Cargar entrenamientos desde Firebase
  useEffect(() => {
    const fetchEntrenos = async () => {
      const querySnapshot = await getDocs(collection(db, "entrenos"));
      const entrenosList = querySnapshot.docs.map(doc => (doc.data() ));
      setEntrenos(entrenosList);
    };
  
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersList = usersSnapshot.docs.map(doc => doc.data());
      setUsers(usersList);
    };
  
    const fetchAttendanceSelection = async () => {
      const entrenosSnapshot = await getDocs(collection(db, "entrenos"));
      const attendanceMap = {};
      entrenosSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.asistencia) {
          attendanceMap[data.name] = {};
          data.asistencia.forEach(uid => {
            attendanceMap[data.name][uid] = true; // Marcar como presente
          });
        }
      });
      setAttendanceSelection(attendanceMap); // Configuramos el estado inicial
    };
  
    fetchEntrenos();
    fetchUsers();
    fetchAttendanceSelection();
  }, []);
  

  // Función para crear un nuevo entrenamiento
  const handleCreateEntreno = async () => {
    if (!entrenoName || !cancha) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    try {
      const entrenoData = {
        name: entrenoName,
        categoria,
        cancha,
        date: new Date().toISOString(),
        asistencia: [], // Inicializamos la lista de asistencia vacía
      };

      await setDoc(doc(db, "entrenos", entrenoName), entrenoData);
      setEntrenos(prev => [...prev, entrenoData]);
      alert("Entrenamiento creado exitosamente.");
      setEntrenoName('');
      setCategoria('Infantil');
      setCancha('');
      setShowCreateEntreno(false);
    } catch (error) {
      alert("Error al crear el entrenamiento: " + error.message);
    }
  };

  // Manejar cambios en la selección de asistencia para un entrenamiento
  const handleAttendanceChange = (entrenoName, userId, isPresent) => {
    setAttendanceSelection(prevSelection => ({
      ...prevSelection,
      [entrenoName]: {
        ...prevSelection[entrenoName],
        [userId]: isPresent,
      },
    }));
  };

  // Función para marcar asistencia de forma manual
  const handleMarkAttendance = async (entrenoName) => {
    const selectedEntreno = entrenos.find(entreno => entreno.name === entrenoName);
    if (!selectedEntreno) return;

    const usersToUpdate = users.filter(user => attendanceSelection[entrenoName]?.[user.uid]);
    const entrenoRef = doc(db, "entrenos", entrenoName);

    // Actualizamos la asistencia en Firebase
    await updateDoc(entrenoRef, {
      asistencia: arrayUnion(...usersToUpdate.map(user => user.uid)),
    });

    alert('Asistencia marcada para los usuarios seleccionados.');
  };

  // Función para quitar asistencia
  const handleRemoveAttendance = async (entrenoName) => {
    const selectedEntreno = entrenos.find(entreno => entreno.name === entrenoName);
    if (!selectedEntreno) return;

    const usersToRemove = users.filter(user => attendanceSelection[entrenoName]?.[user.uid]);
    const entrenoRef = doc(db, "entrenos", entrenoName);

    // Quitamos los usuarios seleccionados de la lista de asistencia en Firebase
    await updateDoc(entrenoRef, {
      asistencia: arrayRemove(...usersToRemove.map(user => user.uid)),
    });

    alert('Asistencia eliminada para los usuarios seleccionados.');
  };

  return (
    <div className='Entrenos-background'>
      <Header type="admin" />
      <TopImg number={5} />
      {!showCreateEntreno ? (
        <>
          <h2 className='Entrenos-title'>Entrenamientos</h2>
          <div className='Entrenos-card'>
            <div className='Entrenos-list-container'>
              <div className='Entrenos-list'>
                {entrenos.map((entreno, index) => (
                  <div key={index} className='Entreno-item'>
                    <div className='Entreno-image'></div>
                    <div className='Entreno-info'>
                      <h3>{entreno.name}</h3>
                      <p>Categoría: {entreno.categoria}</p>
                      <p>Cancha: {entreno.cancha}</p>
                    </div>
                    
                    <div className="button-container">
                      {/* Botón para marcar asistencia */}
                      <button
                        className="Entreno-mark-attendance"
                        onClick={() => handleMarkAttendance(entreno.name)}
                      >
                        Confirmar asistencia
                      </button>

                      {/* Botón para quitar asistencia */}
                      <button
                        className="Entreno-remove-attendance"
                        onClick={() => handleRemoveAttendance(entreno.name)}
                      >
                        Quitar asistencia
                      </button>
                    

                    {/* Mostrar lista de usuarios */}
                    <div className="asistencia-container">
                    <div>
                      {users.filter(user => user.categoria === entreno.categoria).map(user => (
                        <div key={user.uid}>
                          <input
                            type="checkbox"
                            checked={attendanceSelection[entreno.name]?.[user.uid] || false}
                            onChange={(e) => handleAttendanceChange(entreno.name, user.uid, e.target.checked)}
                          />
                          <label>{user.name}</label>
                        </div>
                      ))}
                    </div>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="entrenos-contenedor">
          <button className='Entreno-button' onClick={() => setShowCreateEntreno(true)}>
            Crear nuevo Entrenamiento
          </button>
          </div>
        </>
      ) : (
        <div className="entrenos-container">
          <h2 className='Entrenos-title'>Crear nuevo Entrenamiento</h2>
          <div className="entreno-setup">
            <div className="entreno-form-container">
              <input
                type="text"
                value={entrenoName}
                onChange={(e) => setEntrenoName(e.target.value)}
                placeholder="Nombre Entrenamiento"
              />
             <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="Infantil">Infantil</option>
              <option value="Juvenil">Juvenil</option>
              <option value="Adulto">Adulto</option>
              <option value="Profesional">Profesional</option>
            </select>
              <input
                type="text"
                value={cancha}
                onChange={(e) => setCancha(e.target.value)}
                placeholder="Nombre de la Cancha"
              />
            </div>
            <div className="entrenos-contenedor">
              <button className="Entreno-button" onClick={handleCreateEntreno}>Crear Entrenamiento</button>
              <button className="Entreno-button" onClick={() => setShowCreateEntreno(false)}>Volver a Entrenamientos</button>
            </div>
          </div>             
        </div>
      )}
    </div>
  );
}
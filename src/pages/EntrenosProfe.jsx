import React, { useState, useEffect } from 'react';
import { db } from "../firebase";
import { collection, doc, getDocs, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import "../css/entrenos.css";
import TopImg from '../components/TopImg';
import Header from '../components/Header';

export default function EntrenosProfe() {
  const [entrenos, setEntrenos] = useState([]);
  const [users, setUsers] = useState([]);
  const [attendanceSelection, setAttendanceSelection] = useState({});
  const [profesorUid, setProfesorUid] = useState(null);

  // Cargar los datos iniciales de entrenos y usuarios
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Recuperar el UID del profesor desde localStorage
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const uid = storedUser?.uid;

        if (!uid) {
          console.error("No se encontró un UID en localStorage.");
          return;
        }

        setProfesorUid(uid);

        // Obtener entrenos del Firebase
        const entrenosSnapshot = await getDocs(collection(db, "entrenos"));
        const entrenosList = entrenosSnapshot.docs.map(doc => doc.data());
        setEntrenos(entrenosList);

        // Obtener todos los usuarios
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersList = usersSnapshot.docs.map(doc => doc.data());
        setUsers(usersList);

        // Cargar la información de asistencia
        const attendanceMap = {};
        entrenosList.forEach(entreno => {
          if (entreno.asistencia) {
            attendanceMap[entreno.name] = {};
            entreno.asistencia.forEach(uid => {
              attendanceMap[entreno.name][uid] = true; // Marcar como presente
            });
          }
        });
        setAttendanceSelection(attendanceMap);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    fetchData();
  }, []);

  // Manejar los cambios en la selección de asistencia
  const handleAttendanceChange = (entrenoName, userId, isPresent) => {
    setAttendanceSelection(prevSelection => ({
      ...prevSelection,
      [entrenoName]: {
        ...prevSelection[entrenoName],
        [userId]: isPresent,
      },
    }));
  };

  // Función para marcar asistencia
  const handleMarkAttendance = async (entrenoName) => {
    const selectedEntreno = entrenos.find(entreno => entreno.name === entrenoName);
    if (!selectedEntreno) return;

    const usersToUpdate = users.filter(user => attendanceSelection[entrenoName]?.[user.uid]);
    const entrenoRef = doc(db, "entrenos", entrenoName);

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

    await updateDoc(entrenoRef, {
      asistencia: arrayRemove(...usersToRemove.map(user => user.uid)),
    });

    alert('Asistencia eliminada para los usuarios seleccionados.');
  };

  return (
    <div className='Entrenos-background'>
      <Header type="profesor" />
      <TopImg number={5} />
      <h2 className='Entrenos-title'>Entrenamientos del Profesor</h2>
      <div className='Entrenos-card'>
        <div className='Entrenos-list-container'>
          <div className='Entrenos-list'>
            {entrenos.filter(entreno => entreno.profesor === profesorUid).map((entreno, index) => (
              <div key={index} className='Entreno-item'>
                <div className='Entreno-image'></div>
                <div className='Entreno-info'>
                  <h3>{entreno.name}</h3>
                  <p>Categoría: {entreno.categoria}</p>
                  <p>Cancha: {entreno.cancha}</p>
                  <p>Profesor: {users.find(user => user.uid === entreno.profesor)?.name}</p>
                </div>

                <div className="button-container">
                  <button
                    className="Entreno-mark-attendance"
                    onClick={() => handleMarkAttendance(entreno.name)}
                  >
                    Confirmar asistencia
                  </button>

                  <button
                    className="Entreno-remove-attendance"
                    onClick={() => handleRemoveAttendance(entreno.name)}
                  >
                    Quitar asistencia
                  </button>

                  <div className="asistencia-container">
                    <div>
                      {users.filter(user => user.categoria === entreno.categoria && user.type === "user").map(user => (
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
    </div>
  );
}

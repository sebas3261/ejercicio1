import React, { useState, useEffect } from 'react';
import { db } from "../firebase";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import "../css/entrenos.css";
import TopImg from '../components/TopImg';
import Header from '../components/Header';

export default function EntrenosAdmin() {
  const [showCreateEntreno, setShowCreateEntreno] = useState(false);
  const [entrenos, setEntrenos] = useState([]);
  const [entrenoName, setEntrenoName] = useState('');
  const [categoria, setCategoria] = useState('Infantil');
  const [cancha, setCancha] = useState('');
  const [profesor, setProfesor] = useState('');
  const [users, setUsers] = useState([]);

  // Cargar entrenamientos desde Firebase
  useEffect(() => {
    const fetchEntrenos = async () => {
      const querySnapshot = await getDocs(collection(db, "entrenos"));
      const entrenosList = querySnapshot.docs.map(doc => doc.data());
      setEntrenos(entrenosList);
    };
  
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersList = usersSnapshot.docs.map(doc => doc.data());
      setUsers(usersList);
    };
  
    fetchEntrenos();
    fetchUsers();
  }, []);

  // Función para crear un nuevo entrenamiento
  const handleCreateEntreno = async () => {
    // Eliminar espacios antes y después del texto
    const trimmedEntrenoName = entrenoName.trim();
    const trimmedCancha = cancha.trim();

    if (!trimmedEntrenoName || !trimmedCancha) {
      alert("Por favor, complete todos los campos. El nombre del entrenamiento y la cancha no pueden estar vacíos.");
      return;
    }

    if (!profesor) {
      alert("Por favor, seleccione un profesor.");
      return;
    }

    // Verificar si ya existe un entrenamiento con el mismo nombre
    const entrenosSnapshot = await getDocs(collection(db, "entrenos"));
    const entrenosList = entrenosSnapshot.docs.map(doc => doc.data());
    const entrenoExistente = entrenosList.find(entreno => entreno.name === trimmedEntrenoName);

    if (entrenoExistente) {
      alert("Ya existe un entrenamiento con ese nombre. Por favor, elija otro.");
      return;
    }

    try {
      const entrenoData = {
        name: trimmedEntrenoName,
        categoria,
        cancha: trimmedCancha,
        profesor,
        date: new Date().toISOString(),
      };

      await setDoc(doc(db, "entrenos", trimmedEntrenoName), entrenoData);
      setEntrenos(prev => [...prev, entrenoData]);
      alert("Entrenamiento creado exitosamente.");
      setEntrenoName('');
      setCategoria('Infantil');
      setCancha('');
      setProfesor('');
      setShowCreateEntreno(false);
    } catch (error) {
      alert("Error al crear el entrenamiento: " + error.message);
    }
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
                      <p>Profesor: {users.find(user => user.uid === entreno.profesor)?.name }</p>
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
              <select value={profesor} onChange={(e) => setProfesor(e.target.value)}>
                <option value="">Seleccionar Profesor</option>
                {users
                  .filter(user => user.type === "profesor")
                  .map(user => (
                    <option key={user.uid} value={user.uid}>{user.name}</option>
                  ))}
              </select>
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

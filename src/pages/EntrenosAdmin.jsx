import React, { useState, useEffect } from 'react';
import { db } from "../firebase";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import "../css/Entrenos.css";
import TopImg from '../components/TopImg';
import Header from '../components/Header';

export default function EntrenosAdmin() {
  const [showCreateEntreno, setShowCreateEntreno] = useState(false);
  const [entrenos, setEntrenos] = useState([]);
  const [entrenoName, setEntrenoName] = useState('');
  const [categoria, setCategoria] = useState('Infantil');
  const [cancha, setCancha] = useState('');

  // Cargar entrenamientos desde Firebase
  useEffect(() => {
    const fetchEntrenos = async () => {
      const querySnapshot = await getDocs(collection(db, "entrenos"));
      const entrenosList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEntrenos(entrenosList);
    };

    fetchEntrenos();
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

  return (
    <div className='Entrenos-background'>
      <Header type="admin" />
      <TopImg number={5} />
      {!showCreateEntreno ? (
        <div className='Entrenos-card'>
          <h2 className='Entrenos-title'>Entrenamientos</h2>
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
                  <span className='Entreno-time'>{new Date(entreno.date).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <button className='Entreno-button' onClick={() => setShowCreateEntreno(true)}>Crear nuevo Entrenamiento</button>
        </div>
      ) : (
        <div className="entrenos-container">
          <h1>Crear Nuevo Entrenamiento</h1>
          <div className="entreno-setup">
            <input
              type="text"
              value={entrenoName}
              onChange={(e) => setEntrenoName(e.target.value)}
              placeholder="Nombre del Entrenamiento"
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
            <button onClick={handleCreateEntreno}>Crear Entrenamiento</button>
          </div>
        </div>
      )}
    </div>
  );
}


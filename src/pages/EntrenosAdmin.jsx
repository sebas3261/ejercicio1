import React, { useState, useEffect } from 'react';
import { db } from "../firebase";
import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import "../css/entrenos.css";
import TopImg from '../components/TopImg';
import Header from '../components/Header';

export default function EntrenosAdmin() {
  const [showCreateEntreno, setShowCreateEntreno] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEntrenoId, setSelectedEntrenoId] = useState(null);
  const [entrenos, setEntrenos] = useState([]);
  const [entrenoName, setEntrenoName] = useState('');
  const [categoria, setCategoria] = useState('Infantil');
  const [cancha, setCancha] = useState('');
  const [profesor, setProfesor] = useState('');
  const [users, setUsers] = useState([]);

  // Cargar entrenamientos y usuarios desde Firebase
  useEffect(() => {
    const fetchEntrenos = async () => {
      const querySnapshot = await getDocs(collection(db, "entrenos"));
      const entrenosList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  // Función para eliminar un entrenamiento
  const handleDeleteEntreno = async (entrenoId) => {
    const confirmDelete = window.confirm("¿Seguro que deseas eliminar este entrenamiento?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "entrenos", entrenoId));
      setEntrenos(prev => prev.filter(entreno => entreno.id !== entrenoId));
      alert("Entrenamiento eliminado correctamente.");
    } catch (error) {
      alert("Error al eliminar el entrenamiento: " + error.message);
    }
  };

  // Función para cargar datos al editar un entrenamiento
  const handleEditEntreno = (entreno) => {
    setSelectedEntrenoId(entreno.id);
    setEntrenoName(entreno.name);
    setCategoria(entreno.categoria);
    setCancha(entreno.cancha);
    setProfesor(entreno.profesor);
    setEditMode(true);
    setShowCreateEntreno(true);
  };

  // Función para crear o actualizar un entrenamiento
  const handleSaveEntreno = async () => {
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
  
    try {
      // Obtener todos los entrenos y verificar si el nombre ya existe
      const entrenosSnapshot = await getDocs(collection(db, "entrenos"));
      const entrenosList = entrenosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      const nombreDuplicado = entrenosList.some(entreno => 
        entreno.name.toLowerCase() === trimmedEntrenoName.toLowerCase() &&
        (!editMode || (editMode && entreno.id !== selectedEntrenoId))
      );
  
      if (nombreDuplicado) {
        alert("Ya existe un entrenamiento con este nombre. Por favor, elige otro nombre.");
        return;
      }
  
      const entrenoData = {
        name: trimmedEntrenoName,
        categoria,
        cancha: trimmedCancha,
        profesor,
        date: new Date().toISOString(),
      };
  
      if (editMode) {
        await updateDoc(doc(db, "entrenos", selectedEntrenoId), entrenoData);
        setEntrenos(prev => prev.map(entreno => (entreno.id === selectedEntrenoId ? { id: selectedEntrenoId, ...entrenoData } : entreno)));
        alert("Entrenamiento actualizado exitosamente.");
      } else {
        await setDoc(doc(db, "entrenos", trimmedEntrenoName), entrenoData);
        setEntrenos(prev => [...prev, { id: trimmedEntrenoName, ...entrenoData }]);
        alert("Entrenamiento creado exitosamente.");
      }
  
      // Resetear formulario
      setEntrenoName('');
      setCategoria('Infantil');
      setCancha('');
      setProfesor('');
      setShowCreateEntreno(false);
      setEditMode(false);
      setSelectedEntrenoId(null);
    } catch (error) {
      alert("Error al guardar el entrenamiento: " + error.message);
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
                    <button className="edit-button" onClick={() => handleEditEntreno(entreno)}>
                      Editar
                    </button>
                    <button className="delete-button" onClick={() => handleDeleteEntreno(entreno.id)}>
                      Eliminar
                    </button>
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
          <h2 className='Entrenos-title'>{editMode ? "Editar Entrenamiento" : "Crear nuevo Entrenamiento"}</h2>
          <div className="entreno-setup">
            <div className="entreno-form-container">
              <input
                type="text"
                value={entrenoName}
                onChange={(e) => setEntrenoName(e.target.value)}
                placeholder="Nombre Entrenamiento"
              />
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
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
                {users.filter(user => user.type === "profesor").map(user => (
                  <option key={user.uid} value={user.uid}>{user.name}</option>
                ))}
              </select>
            </div>
            <div className="entrenos-contenedor">
              <button className="Entreno-button" onClick={handleSaveEntreno}>
                {editMode ? "Actualizar Entrenamiento" : "Crear Entrenamiento"}
              </button>
              <button className="Entreno-button" onClick={() => setShowCreateEntreno(false)}>Volver a Entrenamientos</button>
            </div>
          </div>             
        </div>
      )}
    </div>
  );
}

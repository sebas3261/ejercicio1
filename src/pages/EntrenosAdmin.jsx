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
  const [horario, setHorario] = useState('');
  const [fecha, setFecha] = useState('');
  const [profesor, setProfesor] = useState('');
  const [users, setUsers] = useState([]);

  // Definir 20 canchas predefinidas en el frontend
  const canchasPredefinidas = Array.from({ length: 20 }, (_, i) => `Cancha ${i + 1}`);

  // Horarios predefinidos en bloques de 1.5 horas
  const horariosDisponibles = [
    "8:00-9:30", "10:00-11:30", "12:00-13:30", "14:00-15:30",
    "16:00-17:30", "18:00-19:30", "20:00-21:30"
  ];

  // Calcular fechas mínima y máxima permitidas
  const today = new Date(); // Fecha actual:
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1); // 
  const maxDate = new Date(today);
  maxDate.setMonth(today.getMonth() + 6); // 6 meses desde hoy

  const minDateStr = tomorrow.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  const maxDateStr = maxDate.toISOString().split('T')[0];

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

  // Obtener canchas disponibles según el horario y fecha seleccionados
  const getCanchasDisponibles = () => {
    if (!horario || !fecha) return canchasPredefinidas; // Si no hay horario o fecha, mostrar todas
    const canchasOcupadas = entrenos
      .filter(entreno => 
        entreno.horario === horario && 
        entreno.fecha === fecha && 
        (!editMode || entreno.id !== selectedEntrenoId)
      )
      .map(entreno => entreno.cancha);
    return canchasPredefinidas.filter(cancha => !canchasOcupadas.includes(cancha));
  };

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
    setHorario(entreno.horario || '');
    setFecha(entreno.fecha || '');
    setProfesor(entreno.profesor);
    setEditMode(true);
    setShowCreateEntreno(true);
  };
  const handleSaveEntreno = async () => {
    const trimmedEntrenoName = entrenoName.trim();
    const trimmedCancha = cancha.trim();
  
    if (!trimmedEntrenoName || !trimmedCancha || !horario || !fecha) {
      alert("Por favor, complete todos los campos: nombre, cancha, horario y fecha.");
      return;
    }
  
    if (!profesor) {
      alert("Por favor, seleccione un profesor.");
      return;
    }
  
    // Validar que la fecha esté entre mañana y 6 meses desde hoy
    const selectedDate = new Date(fecha);
    if (selectedDate < tomorrow || selectedDate > maxDate) {
      alert("Los entrenos se pueden programar para dentro de dos días y hasta 6 meses desde hoy.");
      return;
    }
  
    try {
      // Obtener todos los entrenos y torneos existentes
      const entrenosSnapshot = await getDocs(collection(db, "entrenos"));
      const entrenosList = entrenosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      const tournamentsSnapshot = await getDocs(collection(db, "tournaments"));
      const tournamentsList = tournamentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      // Verificar si el nombre ya existe (excepto en modo edición)
      const nombreDuplicado = entrenosList.some(entreno => 
        entreno.name.toLowerCase() === trimmedEntrenoName.toLowerCase() &&
        (!editMode || (editMode && entreno.id !== selectedEntrenoId))
      );
  
      if (nombreDuplicado) {
        alert("Ya existe un entrenamiento con este nombre. Por favor, elige otro nombre.");
        return;
      }
  
      // Verificar superposición de cancha, horario y fecha con entrenos
      const canchaOcupada = entrenosList.some(entreno => 
        entreno.cancha === trimmedCancha && 
        entreno.horario === horario && 
        entreno.fecha === fecha &&
        (!editMode || (editMode && entreno.id !== selectedEntrenoId))
      );
  
      if (canchaOcupada) {
        alert("La cancha seleccionada ya está ocupada en ese horario y fecha por otro entrenamiento.");
        return;
      }
  
      const torneoEnCancha = tournamentsList.some(torneo => 
        torneo.cancha === trimmedCancha && 
        torneo.horario === horario && 
        torneo.fecha === fecha
      );
  
      if (torneoEnCancha) {
        alert("No puedes programar un entrenamiento en esta cancha a esta hora porque ya hay un torneo.");
        return;
      }
  
      // Verificar si el profesor ya está asignado a otro entreno o torneo en el mismo horario y fecha
      const profesorOcupado = [...entrenosList, ...tournamentsList].some(evento => 
        evento.profesor === profesor && 
        evento.horario === horario && 
        evento.fecha === fecha &&
        (!editMode || (editMode && evento.id !== selectedEntrenoId))
      );
  
      if (profesorOcupado) {
        alert("El profesor seleccionado ya está asignado a otro evento (entrenamiento o torneo) en ese horario y fecha.");
        return;
      }
  
      // Guardar en Firebase
      const entrenoData = {
        name: trimmedEntrenoName,
        categoria,
        cancha: trimmedCancha,
        horario,
        fecha,
        profesor,
        date: new Date().toISOString(), // Fecha de creación
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
      setHorario('');
      setFecha('');
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
                      <p>Horario: {entreno.horario || 'No definido'}</p>
                      <p>Fecha: {entreno.fecha || 'No definida'}</p>
                      <p>Profesor: {users.find(user => user.uid === entreno.profesor)?.name}</p>
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
              <select value={cancha} onChange={(e) => setCancha(e.target.value)}>
                <option value="">Seleccionar Cancha</option>
                {getCanchasDisponibles().map(canchaOption => (
                  <option key={canchaOption} value={canchaOption}>{canchaOption}</option>
                ))}
              </select>
              <select value={horario} onChange={(e) => setHorario(e.target.value)}>
                <option value="">Seleccionar Horario</option>
                {horariosDisponibles.map(horarioOption => (
                  <option key={horarioOption} value={horarioOption}>{horarioOption}</option>
                ))}
              </select>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                min={minDateStr} // Desde mañana
                max={maxDateStr} // Hasta 6 meses desde hoy
                placeholder="Seleccionar Fecha"
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
              <button className="Entreno-button" onClick={() => {
                setShowCreateEntreno(false);
                setEntrenoName('');
                setCategoria('Infantil');
                setCancha('');
                setHorario('');
                setFecha('');
                setProfesor('');
                setEditMode(false);
                setSelectedEntrenoId(null);
              }}>
                Volver a Entrenamientos
              </button>
            </div>
          </div>             
        </div>
      )}
    </div>
  );
}
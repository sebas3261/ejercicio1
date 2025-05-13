import React, { useState, useEffect } from 'react';
import { db } from "../firebase";
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import "../css/entrenos.css";
import TopImg from "../components/TopImg";
import Header from "../components/Header";

export default function EntrenosProfe() {
  const [entrenos, setEntrenos] = useState([]);
  const [users, setUsers] = useState([]);
  const [attendanceSelection, setAttendanceSelection] = useState({});
  const [profesorUid, setProfesorUid] = useState(null);
  const [showCreateEntreno, setShowCreateEntreno] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEntrenoId, setSelectedEntrenoId] = useState(null);
  const [entrenoName, setEntrenoName] = useState('');
  const [categoria, setCategoria] = useState('Infantil');
  const [cancha, setCancha] = useState('');
  const [horario, setHorario] = useState('');
  const [fecha, setFecha] = useState('');
  const [profesor, setProfesor] = useState('');

  const canchasPredefinidas = Array.from({ length: 20 }, (_, i) => `Cancha ${i + 1}`);

  const horariosDisponibles = [
    "8:00-9:30", "10:00-11:30", "12:00-13:30", "14:00-15:30",
    "16:00-17:30", "18:00-19:30", "20:00-21:30"
  ];

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const maxDate = new Date(today);
  maxDate.setMonth(today.getMonth() + 6);
  const minDateStr = tomorrow.toISOString().split('T')[0];
  const maxDateStr = maxDate.toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const uid = storedUser?.uid;

        if (!uid) {
          console.error("No se encontró un UID en localStorage.");
          return;
        }

        setProfesorUid(uid);
        setProfesor(uid);

        const entrenosSnapshot = await getDocs(collection(db, "entrenos"));
        const entrenosList = entrenosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEntrenos(entrenosList);

        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersList = usersSnapshot.docs.map(doc => doc.data());
        setUsers(usersList);

        const attendanceMap = {};
        entrenosList.forEach(entreno => {
          if (entreno.asistencia) {
            attendanceMap[entreno.id] = {};
            entreno.asistencia.forEach(userUid => {
              attendanceMap[entreno.id][userUid] = true;
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

  const getCanchasDisponibles = () => {
    if (!horario || !fecha) return canchasPredefinidas;
    const canchasOcupadas = entrenos
      .filter(entreno => 
        entreno.horario === horario && 
        entreno.fecha === fecha && 
        (!editMode || entreno.id !== selectedEntrenoId)
      )
      .map(entreno => entreno.cancha);
    return canchasPredefinidas.filter(cancha => !canchasOcupadas.includes(cancha));
  };

  const handleAttendanceChange = async (entrenoId, userId, isPresent) => {
    setAttendanceSelection(prev => ({
      ...prev,
      [entrenoId]: {
        ...prev[entrenoId],
        [userId]: isPresent,
      },
    }));

    const entrenoRef = doc(db, "entrenos", entrenoId);
    try {
      if (isPresent) {
        await updateDoc(entrenoRef, {
          asistencia: arrayUnion(userId),
        });
        alert('Asistencia marcada para el usuario.');
      } else {
        await updateDoc(entrenoRef, {
          asistencia: arrayRemove(userId),
        });
        alert('Asistencia eliminada para el usuario.');
      }
    } catch (error) {
      console.error("Error al actualizar asistencia:", error);
      alert("Error al actualizar asistencia: " + error.message);
    }
  };

  const handleDeleteEntreno = async (entrenoId) => {
    const entreno = entrenos.find(e => e.id === entrenoId);
    if (entreno.profesor !== profesorUid) {
      alert("No tienes permiso para eliminar este entrenamiento.");
      return;
    }

    const confirmDelete = window.confirm("¿Seguro que deseas eliminar este entrenamiento?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "entrenos", entrenoId));
      setEntrenos(prev => prev.filter(entreno => entreno.id !== entrenoId));
      alert("Entrenamiento eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar el entrenamiento:", error);
      alert("Error al eliminar el entrenamiento: " + error.message);
    }
  };

  const handleEditEntreno = (entreno) => {
    if (entreno.profesor !== profesorUid) {
      alert("No tienes permiso para editar este entrenamiento.");
      return;
    }

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

    if (!trimmedEntrenoName || !trimmedCancha || !horario || !fecha || !profesor) {
      alert("Por favor, complete todos los campos: nombre, cancha, horario, fecha y profesor.");
      return;
    }

    const selectedDate = new Date(fecha);
    if (selectedDate < tomorrow || selectedDate > maxDate) {
      alert("Los entrenos se pueden programar para dentro de dos días y hasta 6 meses desde hoy.");
      return;
    }

    try {
      const entrenosSnapshot = await getDocs(collection(db, "entrenos"));
      const entrenosList = entrenosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const tournamentsSnapshot = await getDocs(collection(db, "tournaments"));
      const tournamentsList = tournamentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const nombreDuplicado = entrenosList.some(entreno => 
        entreno.name.toLowerCase() === trimmedEntrenoName.toLowerCase() &&
        (!editMode || (editMode && entreno.id !== selectedEntrenoId))
      );

      if (nombreDuplicado) {
        alert("Ya existe un entrenamiento con este nombre. Por favor, elige otro nombre.");
        return;
      }

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

      const profesorOcupado = [...entrenosList, ...tournamentsList].some(evento => 
        evento.profesor === profesor && 
        evento.horario === horario && 
        evento.fecha === fecha &&
        (!editMode || (editMode && evento.id !== selectedEntrenoId))
      );

      if (profesorOcupado) {
        alert("Estás asignado a otro evento (entrenamiento o torneo) en ese horario y fecha.");
        return;
      }

      const entrenoData = {
        name: trimmedEntrenoName,
        categoria,
        cancha: trimmedCancha,
        horario,
        fecha,
        profesor,
        date: new Date().toISOString(),
        asistencia: editMode ? (entrenos.find(e => e.id === selectedEntrenoId)?.asistencia || []) : [],
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

      setEntrenoName('');
      setCategoria('Infantil');
      setCancha('');
      setHorario('');
      setFecha('');
      setProfesor(profesorUid);
      setShowCreateEntreno(false);
      setEditMode(false);
      setSelectedEntrenoId(null);
    } catch (error) {
      console.error("Error al guardar el entrenamiento:", error);
      alert("Error al guardar el entrenamiento: " + error.message);
    }
  };

  return (
    <div className='Entrenos-background'>
      <Header type="profesor" />
      <TopImg number={5} />
      {!showCreateEntreno ? (
        <>
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
                      <p>Horario: {entreno.horario || 'No definido'}</p>
                      <p>Fecha: {entreno.fecha || 'No definida'}</p>
                      <p>Profesor: {users.find(user => user.uid === entreno.profesor)?.name}</p>
                    </div>
                    <div className="button-container">
                      <button className="edit-button" onClick={() => handleEditEntreno(entreno)}>
                        Editar
                      </button>
                      <button className="delete-button" onClick={() => handleDeleteEntreno(entreno.id)}>
                        Eliminar
                      </button>
                    </div>
                    <div className="asistencia-container">
                      <p className="Entreno-mark-attendance">Marque/desmarque la asistencia</p>
                      <div>
                        {users.filter(user => user.categoria === entreno.categoria && user.type === "user" && user.isAuthenticated === true).map(user => (
                          <div key={user.uid}>
                            <input
                              type="checkbox"
                              checked={attendanceSelection[entreno.id]?.[user.uid] || false}
                              onChange={(e) => handleAttendanceChange(entreno.id, user.uid, e.target.checked)}
                            />
                            <label>{user.name}</label>
                          </div>
                        ))}
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
                min={minDateStr}
                max={maxDateStr}
                placeholder="Seleccionar Fecha"
              />
              <select value={profesor} disabled>
                <option value={profesorUid}>{users.find(user => user.uid === profesorUid)?.name}</option>
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
                setProfesor(profesorUid);
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
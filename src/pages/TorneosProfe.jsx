import React, { useState, useEffect } from 'react';
import { db } from "../firebase";
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import "../css/entrenos.css";
import TopImg from "../components/TopImg";
import Header from "../components/Header";

export default function TournamentsProfe() {
  const [tournaments, setTournaments] = useState([]);
  const [players, setPlayers] = useState([]);
  const [profesorUid, setProfesorUid] = useState(null);
  const [showCreateTorneo, setShowCreateTorneo] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTorneoId, setSelectedTorneoId] = useState(null);
  const [torneoName, setTorneoName] = useState('');
  const [categoria, setCategoria] = useState('Infantil');
  const [cancha, setCancha] = useState('');
  const [horario, setHorario] = useState('');
  const [fecha, setFecha] = useState('');
  const [profesor, setProfesor] = useState('');
  const [tournamentSize, setTournamentSize] = useState(0);
  const [precio, setPrecio] = useState('');
  const [showClasifications, setShowClasifications] = useState(false);
  const [selectedClasifications, setSelectedClasifications] = useState([]);
  const [editingTournament, setEditingTournament] = useState(null);

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

        const tournamentsSnapshot = await getDocs(collection(db, "tournaments"));
        const tournamentsList = tournamentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTournaments(tournamentsList);

        const playersSnapshot = await getDocs(collection(db, "users"));
        const playersList = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlayers(playersList);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    fetchData();
  }, []);

  const getCanchasDisponibles = () => {
    if (!horario || !fecha) return canchasPredefinidas;
    const canchasOcupadas = tournaments
      .filter(torneo => 
        torneo.horario === horario && 
        torneo.fecha === fecha && 
        (!editMode || torneo.id !== selectedTorneoId)
      )
      .map(torneo => torneo.cancha);
    return canchasPredefinidas.filter(cancha => !canchasOcupadas.includes(cancha));
  };

  const handleDeleteTorneo = async (torneoId) => {
    const torneo = tournaments.find(t => t.id === torneoId);
    if (torneo.profesor?.id !== profesorUid) {
      alert("No tienes permiso para eliminar este torneo.");
      return;
    }

    const confirmDelete = window.confirm("¿Seguro que deseas eliminar este torneo?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "tournaments", torneoId));
      setTournaments(prev => prev.filter(torneo => torneo.id !== torneoId));
      alert("Torneo eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar el torneo:", error);
      alert("Error al eliminar el torneo: " + error.message);
    }
  };

  const handleEditTorneo = (torneo) => {
    if (torneo.profesor?.id !== profesorUid) {
      alert("No tienes permiso para editar este torneo.");
      return;
    }

    setSelectedTorneoId(torneo.id);
    setTorneoName(torneo.name);
    setCategoria(torneo.categoria);
    setCancha(torneo.cancha);
    setHorario(torneo.horario || '');
    setFecha(torneo.fecha || '');
    setProfesor(torneo.profesor?.id || '');
    setTournamentSize(torneo.tournamentSize || 0);
    setPrecio(torneo.precio || '');
    setEditMode(true);
    setEditingTournament(torneo);
    setShowCreateTorneo(true);
  };

  const handleCreateOrEditTorneo = async () => {
    const trimmedTorneoName = torneoName.trim();
    const trimmedCancha = cancha.trim();

    if (!trimmedTorneoName || !trimmedCancha || !horario || !fecha || !precio) {
      alert("Por favor, complete todos los campos: nombre, cancha, horario, fecha, y precio.");
      return;
    }

    if (tournamentSize < 3) {
      alert("El tamaño del torneo debe ser al menos 3 participantes.");
      return;
    }

    const selectedDate = new Date(fecha);
    if (selectedDate < tomorrow || selectedDate > maxDate) {
      alert("Los torneos se pueden programar para dentro de dos días y hasta 6 meses desde hoy.");
      return;
    }

    try {
      const tournamentsSnapshot = await getDocs(collection(db, "tournaments"));
      const tournamentsList = tournamentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const entrenosSnapshot = await getDocs(collection(db, "entrenos"));
      const entrenosList = entrenosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const nombreDuplicado = tournamentsList.some(torneo => 
        torneo.name.toLowerCase() === trimmedTorneoName.toLowerCase() &&
        (!editMode || (editMode && torneo.id !== selectedTorneoId))
      );

      if (nombreDuplicado) {
        alert("Ya existe un torneo con este nombre. Por favor, elige otro nombre.");
        return;
      }

      const canchaOcupada = tournamentsList.some(torneo => 
        torneo.cancha === trimmedCancha && 
        torneo.horario === horario && 
        torneo.fecha === fecha &&
        (!editMode || (editMode && torneo.id !== selectedTorneoId))
      );

      if (canchaOcupada) {
        alert("La cancha seleccionada ya está ocupada en ese horario y fecha por otro torneo.");
        return;
      }

      const entrenoOcupado = entrenosList.some(entreno => 
        entreno.cancha === trimmedCancha && 
        entreno.horario === horario && 
        entreno.fecha === fecha
      );

      if (entrenoOcupado) {
        alert("No puedes programar un torneo en esta cancha a esta hora porque ya hay un entrenamiento.");
        return;
      }

      const profesorOcupado = [...tournamentsList, ...entrenosList].some(evento => 
        evento.profesor?.id === profesor && 
        evento.horario === horario && 
        evento.fecha === fecha &&
        (!editMode || (editMode && evento.id !== selectedTorneoId))
      );

      if (profesorOcupado) {
        alert("Estás asignado a otro evento (entrenamiento o torneo) en ese horario y fecha.");
        return;
      }

      const profesorObj = players.find(p => p.id === profesor);
      if (!profesorObj) {
        alert("Profesor no válido.");
        return;
      }

      const torneoData = {
        name: trimmedTorneoName,
        categoria,
        cancha: trimmedCancha,
        horario,
        fecha,
        profesor: {
          id: profesorObj.id,
          name: profesorObj.name,
        },
        tournamentSize: Number(tournamentSize),
        precio: Number(precio),
        date: new Date().toISOString(),
        rankings: editMode ? (tournaments.find(t => t.id === selectedTorneoId)?.rankings || []) : [],
        inscritos: editMode ? (tournaments.find(t => t.id === selectedTorneoId)?.inscritos || []) : [],
      };

      if (editMode) {
        await updateDoc(doc(db, "tournaments", selectedTorneoId), torneoData);
        setTournaments(prev => prev.map(torneo => (torneo.id === selectedTorneoId ? { id: selectedTorneoId, ...torneoData } : torneo)));
        alert("Torneo actualizado exitosamente.");
      } else {
        await setDoc(doc(db, "tournaments", trimmedTorneoName), torneoData);
        setTournaments(prev => [...prev, { id: trimmedTorneoName, ...torneoData }]);
        alert("Torneo creado exitosamente.");
      }

      setTorneoName('');
      setCategoria('Infantil');
      setCancha('');
      setHorario('');
      setFecha('');
      setProfesor(profesorUid);
      setTournamentSize(0);
      setPrecio('');
      setShowCreateTorneo(false);
      setEditMode(false);
      setSelectedTorneoId(null);
      setEditingTournament(null);
    } catch (error) {
      console.error("Error al guardar el torneo:", error);
      alert("Error al guardar el torneo: " + error.message);
    }
  };

  const handleSetClassification = (player, position) => {
    setSelectedClasifications((prev) => {
      // Remove any existing entry for this player
      const updated = prev.filter(item => item.id !== player.id);
      // Add new entry for this player and position
      updated.push({ id: player.id, position });
      return updated;
    });
  };

  const handleSaveClasifications = async () => {
    try {
      await updateDoc(doc(db, "tournaments", editingTournament.id), {
        rankings: selectedClasifications,
      });
      alert("Clasificaciones guardadas con éxito.");
      setShowClasifications(false);
      setEditingTournament(null);
      setSelectedClasifications([]);
      setTournaments((prev) =>
        prev.map((torneo) =>
          torneo.id === editingTournament.id
            ? { ...torneo, rankings: selectedClasifications }
            : torneo
        )
      );
    } catch (error) {
      alert("Error al guardar las clasificaciones: " + error.message);
    }
  };

  const handleOpenClasifications = (torneo) => {
    if (!torneo.inscritos) {
      torneo.inscritos = [];
    }
    setEditingTournament(torneo);
    setShowClasifications(true);
    setSelectedClasifications(torneo.rankings || []);
  };

  // Helper function to get only those inscritos con matrícula al día
  const getAvailablePlayers = (currentPosition) => {
    const selectedIds = selectedClasifications
      .filter(item => item.position !== currentPosition)
      .map(item => item.id);

    return players.filter(p =>
      // 1) sólo si está inscrito
      editingTournament.inscritos?.includes(p.id) &&
      // 2) sólo si no lo hemos ya seleccionado para otra posición
      !selectedIds.includes(p.id) &&
      // 3) sólo si montoMatricula es 0
      (p.montoMatricula || 0) === 0
    );
  };


  return (
    <div className="Entrenos-background">
      <Header type="profesor" />
      <TopImg number={5} />
      {!showCreateTorneo && !showClasifications ? (
        <>
          <h2 className="Entrenos-title">Torneos del Profesor</h2>
          <div className="Entrenos-card">
            <div className="Entrenos-list-container">
              <div className="Entrenos-list">
                {tournaments.filter(torneo => torneo.profesor?.id === profesorUid).map((torneo, index) => (
                  <div key={index} className="Entreno-item">
                    <div className="Entreno-image"></div>
                    <div className="Entreno-info">
                      <h3>{torneo.name}</h3>
                      <p>Categoría: {torneo.categoria}</p>
                      <p>Cancha: {torneo.cancha}</p>
                      <p>Horario: {torneo.horario || "No definido"}</p>
                      <p>Fecha: {torneo.fecha || "No definida"}</p>
                      <p>Profesor: {players.find(p => p.id === torneo.profesor?.id)?.name}</p>
                      <p>Tamaño del torneo: {torneo.tournamentSize}</p>
                      <p>Precio: ${torneo.precio}</p>
                      <p>
                        Clasificaciones:{' '}
                        {torneo.rankings && torneo.rankings.length > 0
                          ? torneo.rankings
                              .sort((a, b) => a.position - b.position)
                              .map(r => {
                                const player = players.find(p => p.id === r.id);
                                return (
                                  <span key={r.id}>
                                    {r.position}°: {player ? player.name : 'Desconocido'}
                                  </span>
                                );
                              })
                              .reduce((prev, curr) => [prev, ', ', curr])
                          : 'No definidas'}
                      </p>
                    </div>
                    <div className="Torneo-actions">
                      <button className="edit-button" onClick={() => handleEditTorneo(torneo)}>✏️ Editar</button>
                      <button className="delete-button" onClick={() => handleDeleteTorneo(torneo.id)}>🗑️ Eliminar</button>
                      {torneo.inscritos?.length > 0 && (
                        <button className="Entreno-button" onClick={() => handleOpenClasifications(torneo)}>
                          🏅 Agregar Clasificación
                        </button>
                      )}
                    </div>
                    <div className="asistencia-container">
                      <h4>Usuarios Inscritos (matrícula al día):</h4>
                      {(() => {
                        // Filtramos los jugadores que están en inscritos Y cuya deuda sea 0
                        const inscritosPagados = players.filter(p =>
                          torneo.inscritos?.includes(p.id) &&
                          (p.montoMatricula || 0) === 0
                        );
                        return inscritosPagados.length > 0 ? (
                          <ul>
                            {inscritosPagados.map(player => (
                              <li key={player.id}>{player.name}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>No hay usuarios inscritos (con matrícula al día) aún.</p>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="entrenos-contenedor">
            <button className="Entreno-button" onClick={() => setShowCreateTorneo(true)}>
              Crear nuevo Torneo
            </button>
          </div>
        </>
      ) : showCreateTorneo ? (
        <div className="tournaments-container">
          <h2 className="Torneos-title">{editingTournament ? "Editar Torneo" : "Crear nuevo torneo"}</h2>
          <div className="torneo-setup">
            <div className="torneo-form-container">
              <input
                type="text"
                value={torneoName}
                onChange={e => setTorneoName(e.target.value)}
                placeholder="Nombre Torneo"
              />
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="Infantil">Infantil</option>
                <option value="Juvenil">Juvenil</option>
                <option value="Adulto">Adulto</option>
                <option value="Profesional">Profesional</option>
              </select>
              <div className="num-players-container">
                <span className="num-players-label">Tamaño del torneo:</span>
                <input
                  type="number"
                  value={tournamentSize}
                  onChange={(e) => setTournamentSize(Number(e.target.value))}
                  placeholder="Máximo de jugadores"
                  min="3"
                />
              </div>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="Precio del torneo"
                min="0"
              />
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
                <option value={profesorUid}>
                  {players.find(p => p.id === profesorUid)?.name}
                </option>
              </select>
            </div>
            <div className="torneos-contenedor">
              <button className="Torneo-button" onClick={handleCreateOrEditTorneo}>
                {editingTournament ? "Actualizar Torneo" : "Crear Torneo"}
              </button>
              <button
                className="Torneo-button cancelar"
                onClick={() => {
                  setShowCreateTorneo(false);
                  setTorneoName('');
                  setCategoria('Infantil');
                  setTournamentSize(0);
                  setCancha('');
                  setHorario('');
                  setFecha('');
                  setProfesor(profesorUid);
                  setPrecio('');
                  setEditMode(false);
                  setSelectedTorneoId(null);
                  setEditingTournament(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : showClasifications && editingTournament ? (
        <div className="tournaments-container">
          <h2 className="Torneos-title">Agregar Clasificación para {editingTournament.name}</h2>
          <div className="torneo-setup">
            <div className="torneo-form-container">
              <label>🥇 Primer lugar:</label>
              <select onChange={(e) => handleSetClassification(players.find(p => p.id === e.target.value), 1)}>
                <option value="">Seleccionar jugador</option>
                {getAvailablePlayers(1).map(player => (
                  <option key={player.id} value={player.id}>{player.name}</option>
                ))}
              </select>
              <label>🥈 Segundo lugar:</label>
              <select onChange={(e) => handleSetClassification(players.find(p => p.id === e.target.value), 2)}>
                <option value="">Seleccionar jugador</option>
                {getAvailablePlayers(2).map(player => (
                  <option key={player.id} value={player.id}>{player.name}</option>
                ))}
              </select>
              <label>🥉 Tercer lugar:</label>
              <select onChange={(e) => handleSetClassification(players.find(p => p.id === e.target.value), 3)}>
                <option value="">Seleccionar jugador</option>
                {getAvailablePlayers(3).map(player => (
                  <option key={player.id} value={player.id}>{player.name}</option>
                ))}
              </select>
            </div>
            <div className="torneos-contenedor">
              <button className="Torneo-button" onClick={handleSaveClasifications}>
                Guardar Clasificación
              </button>
              <button
                className="Torneo-button cancelar"
                onClick={() => {
                  setShowClasifications(false);
                  setEditingTournament(null);
                  setSelectedClasifications([]);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
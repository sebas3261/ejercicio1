import React, { useState, useEffect } from 'react';
import { db } from "../firebase";
import { collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";
import "../css/torneos.css";
import TopImg from '../components/TopImg';
import Header from '../components/Header';

export default function TorneosAdmin() {
  const [showCreateTournament, setShowCreateTournament] = useState(false);
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [tournamentName, setTournamentName] = useState('');
  const [categoria, setCategoria] = useState('Infantil');
  const [numPlayers, setNumPlayers] = useState(0);
  const [rankings, setRankings] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [editingTournament, setEditingTournament] = useState(null);
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
    const fetchPlayers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const playersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayers(playersList);
    };

    const fetchTournaments = async () => {
      const querySnapshot = await getDocs(collection(db, "tournaments"));
      const tournamentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTournaments(tournamentsList);
    };

    fetchPlayers();
    fetchTournaments();
  }, []);

  useEffect(() => {
    const filtered = players.filter(player => 
      player.categoria === categoria && 
      player.type === "user" && 
      player.isAuthenticated === true
    );
    setFilteredPlayers(filtered);
  }, [categoria, players]);

  const getCanchasDisponibles = () => {
    if (!horario || !fecha) return canchasPredefinidas;
    const canchasOcupadas = tournaments
      .filter(tournament => 
        tournament.horario === horario && 
        tournament.fecha === fecha && 
        (!editingTournament || tournament.id !== editingTournament.id)
      )
      .map(tournament => tournament.cancha);
    return canchasPredefinidas.filter(cancha => !canchasOcupadas.includes(cancha));
  };

  const maxPlayers = filteredPlayers.length;

  const handleRankChange = (position, playerId) => {
    if (editingTournament) {
      const updatedRankings = [...rankings];
      updatedRankings[position - 1] = { position, playerId };
      setRankings(updatedRankings);
      return;
    }

    const isPlayerAlreadyAssigned = rankings.some(ranking => ranking.playerId === playerId);
    if (isPlayerAlreadyAssigned) {
      alert("Este jugador ya ha sido asignado a otra posición.");
      return;
    }

    setRankings(prev => {
      const updated = [...prev];
      updated[position - 1] = { position, playerId };
      return updated;
    });
  };

  const handleCreateOrEditTournament = async () => {
    if (!tournamentName || !cancha || !horario || !fecha || !profesor) {
      alert("Por favor, complete todos los campos: nombre, cancha, horario, fecha y profesor.");
      return;
    }

    if (numPlayers === 0) {
      alert("Por favor, asigne al menos un jugador para crear el torneo.");
      return;
    }

    if (rankings.length !== numPlayers || rankings.some(r => !r.playerId)) {
      alert("Por favor, asigne todos los jugadores a sus posiciones.");
      return;
    }

    const nameExists = tournaments.some(t => 
      t.name === tournamentName && 
      (!editingTournament || editingTournament.name !== tournamentName)
    );
    if (nameExists) {
      alert("Ya existe un torneo con ese nombre. Elija otro.");
      return;
    }

    if (numPlayers > maxPlayers) {
      alert(`El número máximo de jugadores para este torneo es ${maxPlayers}.`);
      return;
    }

    const selectedDate = new Date(fecha);
    if (selectedDate < tomorrow || selectedDate > maxDate) {
      alert("La fecha debe estar entre mañana y 6 meses desde hoy.");
      return;
    }

    const tournamentsSnapshot = await getDocs(collection(db, "tournaments"));
    const tournamentsList = tournamentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const canchaOcupada = tournamentsList.some(tournament => 
      tournament.cancha === cancha && 
      tournament.horario === horario && 
      tournament.fecha === fecha && 
      (!editingTournament || tournament.id !== editingTournament.id)
    );
    if (canchaOcupada) {
      alert("La cancha seleccionada ya está ocupada en ese horario y fecha.");
      return;
    }

    const profesorOcupado = tournamentsList.some(tournament => 
      tournament.profesor === profesor && 
      tournament.horario === horario && 
      tournament.fecha === fecha && 
      (!editingTournament || tournament.id !== editingTournament.id)
    );
    if (profesorOcupado) {
      alert("El profesor seleccionado ya está asignado a otro torneo en ese horario y fecha.");
      return;
    }

    try {
      const tournamentData = {
        name: tournamentName,
        categoria,
        cancha,
        horario,
        fecha,
        profesor,
        date: new Date().toISOString(),
        rankings,
      };

      if (editingTournament) {
        await setDoc(doc(db, "tournaments", editingTournament.id), tournamentData);
        alert("Torneo actualizado exitosamente.");
        setTournaments(prev => prev.map(tournament => 
          tournament.id === editingTournament.id ? { ...tournament, ...tournamentData } : tournament
        ));
      } else {
        await setDoc(doc(db, "tournaments", tournamentName), tournamentData);
        alert("Torneo creado exitosamente.");
        setTournaments(prev => [...prev, { id: tournamentName, ...tournamentData }]);
      }

      setTournamentName('');
      setCategoria('Infantil');
      setNumPlayers(0);
      setRankings([]);
      setCancha('');
      setHorario('');
      setFecha('');
      setProfesor('');
      setShowCreateTournament(false);
      setEditingTournament(null);
    } catch (error) {
      alert("Error al guardar el torneo: " + error.message);
    }
  };

  const handleEditTournament = (tournament) => {
    setTournamentName(tournament.name);
    setCategoria(tournament.categoria);
    setNumPlayers(tournament.rankings.length);
    setRankings(tournament.rankings);
    setCancha(tournament.cancha || '');
    setHorario(tournament.horario || '');
    setFecha(tournament.fecha || '');
    setProfesor(tournament.profesor || '');
    setEditingTournament(tournament);
    setShowCreateTournament(true);
  };

  const handleDeleteTournament = async (tournamentName) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este torneo?")) {
      try {
        await deleteDoc(doc(db, "tournaments", tournamentName));
        setTournaments(prev => prev.filter(t => t.name !== tournamentName));
        alert("Torneo eliminado correctamente.");
      } catch (error) {
        alert("Error al eliminar el torneo: " + error.message);
      }
    }
  };

  return (
    <div className='Torneos-background'>
      <Header type="admin" />
      <TopImg number={1} />
      {!showCreateTournament ? (
        <>
          <h2 className='Torneos-title'>Torneos</h2>
          <div className='Torneos-card'>
            <div className='Torneos-list-container'>
              <div className='Torneos-list'>
                {tournaments.map((tournament, index) => (
                  <div key={index} className='Torneos-item'>
                    <div className='Torneo-image'></div>
                    <div className='Torneo-info'>
                      <h3>{tournament.name}</h3>
                      <p>Categoría: {tournament.categoria}</p>
                      <p>Cancha: {tournament.cancha || 'No definida'}</p>
                      <p>Horario: {tournament.horario || 'No definido'}</p>
                      <p>Fecha: {tournament.fecha || 'No definida'}</p>
                      <p>Profesor: {players.find(p => p.id === tournament.profesor)?.name || 'No asignado'}</p>
                    </div>
                    <div className="Torneo-actions">
                      <button className="edit-button" onClick={() => handleEditTournament(tournament)}>✏️ Editar</button>
                      <button className="delete-button" onClick={() => handleDeleteTournament(tournament.name)}>🗑️ Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="torneos-contenedor">
            <button className='Torneo-button' onClick={() => setShowCreateTournament(true)}>
              Crear nuevo Torneo
            </button>
          </div>
        </>
      ) : (
        <div className="tournaments-container">
          <h2 className='Torneos-title'>{editingTournament ? "Editar Torneo" : "Crear nuevo torneo"}</h2>
          <div className="torneo-setup">
            <div className="torneo-two-column-container">
              <div className="torneo-form-container">
                <input
                  type="text"
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  placeholder="Nombre del Torneo"
                />
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                  <option value="Infantil">Infantil</option>
                  <option value="Juvenil">Juvenil</option>
                  <option value="Adulto">Adulto</option>
                  <option value="Profesional">Profesional</option>
                </select>
                <div className="num-players-container">
                  <span className="num-players-label">Seleccione el número de jugadores:</span>
                  <input
                    type="number"
                    value={numPlayers}
                    onChange={(e) => setNumPlayers(Number(e.target.value))}
                    placeholder="Número de jugadores"
                    min="1"
                    max={maxPlayers}
                  />
                </div>
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
                <select value={profesor} onChange={(e) => setProfesor(e.target.value)}>
                  <option value="">Seleccionar Profesor</option>
                  {players.filter(p => p.type === "profesor").map(player => (
                    <option key={player.id} value={player.id}>{player.name}</option>
                  ))}
                </select>
              </div>
              <div className="players-list-container">
                <div className="players-list">
                  <h2>Asignar Jugadores a Posiciones</h2>
                  {numPlayers > 0 ? (
                    <table>
                      <thead>
                        <tr><th>Posición</th><th>Jugador</th></tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: numPlayers }, (_, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              <select 
                                onChange={(e) => handleRankChange(index + 1, e.target.value)} 
                                value={rankings[index]?.playerId || ""}
                              >
                                <option value="" disabled>Seleccione un jugador</option>
                                {filteredPlayers.map(player => (
                                  <option key={player.id} value={player.id}>{player.name}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No hay jugadores seleccionados aún.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="torneos-contenedor">
              <button className="Torneo-button" onClick={handleCreateOrEditTournament}>
                {editingTournament ? "Actualizar Torneo" : "Crear Torneo"}
              </button>
              <button className="Torneo-button cancelar" onClick={() => {
                setShowCreateTournament(false);
                setTournamentName('');
                setCategoria('Infantil');
                setNumPlayers(0);
                setRankings([]);
                setCancha('');
                setHorario('');
                setFecha('');
                setProfesor('');
                setEditingTournament(null);
              }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
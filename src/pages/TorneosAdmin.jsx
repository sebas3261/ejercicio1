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
    const filtered = players.filter(player => player.categoria === categoria && player.type === "user" && player.isAuthenticated === true);
    setFilteredPlayers(filtered);
  }, [categoria, players]);

  // Validación para asegurarse de que el número de jugadores no exceda el número de usuarios válidos
  const maxPlayers = filteredPlayers.length;

  const handleRankChange = (position, playerId) => {
    // Si estamos editando el torneo, permitimos que se intercambien posiciones
    if (editingTournament) {
      const updatedRankings = [...rankings];
      updatedRankings[position - 1] = { position, playerId };
      setRankings(updatedRankings);
      return;
    }

    // Verificar si el jugador ya está asignado a otra posición
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
    if (!tournamentName) {
      alert("Por favor, ingrese un nombre para el torneo.");
      return;
    }
  
    // Verificar si el número de jugadores asignados es 0
    if (numPlayers === 0) {
      alert("Por favor, asigne al menos un jugador para crear el torneo.");
      return;
    }
  
    // Verificar si el número de jugadores asignados es el mismo que el número de jugadores que se deben asignar
    if (rankings.length !== numPlayers || rankings.some(r => !r.playerId)) {
      alert("Por favor, asigne todos los jugadores a sus posiciones.");
      return;
    }
  
    // Verificar si el nombre ya existe (excepto cuando estamos editando el mismo torneo)
    const nameExists = tournaments.some(t => t.name === tournamentName && (!editingTournament || editingTournament.name !== tournamentName));
    if (nameExists) {
      alert("Ya existe un torneo con ese nombre. Elija otro.");
      return;
    }
  
    // Verificar si numPlayers no excede el número máximo de jugadores válidos
    if (numPlayers > maxPlayers) {
      alert(`El número máximo de jugadores para este torneo es ${maxPlayers}.`);
      return;
    }

    // Verificar si hay jugadores duplicados solo si estamos creando un nuevo torneo
    if (editingTournament) {
      const playerIds = rankings.map(ranking => ranking.playerId);
      const duplicates = playerIds.filter((id, index) => playerIds.indexOf(id) !== index);
      if (duplicates.length > 0) {
        alert("Hay jugadores duplicados en las posiciones.");
        return;
      }
    }
  
    try {
      const tournamentData = {
        name: tournamentName,
        categoria,
        date: new Date().toISOString(),
        rankings,
      };
  
      if (editingTournament) {
        await setDoc(doc(db, "tournaments", editingTournament.id), tournamentData);
        alert("Torneo actualizado exitosamente.");
        // Actualiza el torneo editado en el estado sin necesidad de recargar
        setTournaments(prev => prev.map(tournament => tournament.id === editingTournament.id ? { ...tournament, ...tournamentData } : tournament));
      } else {
        await setDoc(doc(db, "tournaments", tournamentName), tournamentData);
        alert("Torneo creado exitosamente.");
        // Añade el nuevo torneo al estado sin necesidad de recargar
        setTournaments(prev => [...prev, { id: tournamentName, ...tournamentData }]);
      }
  
      setTournamentName('');
      setCategoria('Infantil');
      setNumPlayers(0);
      setRankings([]);
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
                    </div>
                    <span className='Torneo-time'>{new Date(tournament.date).toLocaleString()}</span>
                    <div className="Torneo-actions">
                      <button className="edit-button" onClick={() => handleEditTournament(tournament)}>✏️ Editar</button>
                      <button className="delete-button" onClick={() => handleDeleteTournament(tournament.name)}>🗑️ Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button className='Torneo-button' onClick={() => setShowCreateTournament(true)}>
            Crear nuevo Torneo
          </button>
        </>
      ) : (
        <div className="tournaments-container">
          <h2 className='Torneos-title'>{editingTournament ? "Editar Torneo" : "Crear nuevo torneo"}</h2>
          <div className="torneo-setup">
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
              <input
                type="number"
                value={numPlayers}
                onChange={(e) => setNumPlayers(Number(e.target.value))}
                placeholder="Número de jugadores"
                min="1"
                max={maxPlayers} // Limitar el número de jugadores según el número máximo permitido
              />
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
                setEditingTournament(null);
              }}>
                Cancelar
              </button>
            </div>
            <div className="container">
              {numPlayers > 0 && (
                <div className="players-list">
                  <h2>Asignar Jugadores a Posiciones</h2>
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

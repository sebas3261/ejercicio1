import React, { useState, useEffect } from 'react';
import { db } from "../firebase";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
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
    const filtered = players.filter(player => player.categoria === categoria);
    setFilteredPlayers(filtered);
  }, [categoria, players]);

  const handleRankChange = (position, playerId) => {
    setRankings(prev => {
      const updated = [...prev];
      updated[position - 1] = { position, playerId };
      return updated;
    });
  };

  const handleCreateTournament = async () => {
    if (!tournamentName) {
      alert("Por favor, ingrese un nombre para el torneo.");
      return;
    }

    if (rankings.length !== numPlayers || rankings.some(r => !r.playerId)) {
      alert("Por favor, asigne todos los jugadores a sus posiciones.");
      return;
    }

    try {
      const tournamentData = {
        name: tournamentName,
        categoria,
        date: new Date().toISOString(),
        rankings,
      };

      await setDoc(doc(db, "tournaments", tournamentName), tournamentData);
      setTournaments(prev => [...prev, tournamentData]);
      alert("Torneo creado exitosamente.");
      setTournamentName('');
      setCategoria('Infantil');
      setNumPlayers(0);
      setRankings([]);
      setShowCreateTournament(false);
    } catch (error) {
      alert("Error al crear el torneo: " + error.message);
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
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Botón fuera de la tarjeta */}
          <button className='Torneo-button' onClick={() => setShowCreateTournament(true)}>
            Crear nuevo Torneo
          </button>
        </>
      ): (
        <div className="tournaments-container">
          <h2 className='Torneos-title'>Crear nuevo torneo</h2>
          <div className="torneo-setup">
          <div className="torneo-form-container">
            <input
              type="text"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              placeholder="Nombre del Torneo"
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
              type="number"
              value={numPlayers}
              onChange={(e) => setNumPlayers(Number(e.target.value))}
              placeholder="Número de jugadores"
              min="1"
            />
          </div>
            <div className="torneos-contenedor">
            <button className="Torneo-button" onClick={handleCreateTournament}>Crear Torneo</button>
            </div>
            
            <div className="container">
            {numPlayers > 0 && (
            <div className="players-list">
              <h2>Asignar Jugadores a Posiciones</h2>
              <table>
                <thead>
                  <tr>
                    <th>Posición</th>
                    <th>Jugador</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: numPlayers }, (_, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <select
                          onChange={(e) => handleRankChange(index + 1, e.target.value)}
                          defaultValue=""
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

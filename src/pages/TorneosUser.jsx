import React, { useEffect, useState } from "react";
import "../css/torneos.css";
import TopImg from "../components/TopImg";
import Header from "../components/Header";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function TorneosHome() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        // Recuperar el UID del usuario desde localStorage
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const uid = storedUser?.uid;

        if (!uid) {
          console.error("No se encontró un UID en localStorage.");
          return;
        }

        // Obtener la categoría del usuario desde Firestore
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.error("No se encontró información del usuario en Firestore.");
          return;
        }

        const userData = userDoc.data();
        const userCategoria = userData.categoria;

        if (!userCategoria) {
          console.error("El usuario no tiene una categoría asignada.");
          return;
        }

        // Obtener torneos según la categoría
        const tournamentsRef = collection(db, "tournaments");
        const q = query(tournamentsRef, where("categoria", "==", userCategoria));
        const tournamentsSnapshot = await getDocs(q);

        const tournaments = tournamentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTournaments(tournaments);
      } catch (error) {
        console.error("Error al cargar torneos:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPlayers = async () => {
      try {
        const playersSnapshot = await getDocs(collection(db, "users"));
        const playersList = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlayers(playersList);
      } catch (error) {
        console.error("Error al cargar jugadores:", error);
      }
    };

    fetchTournaments();
    fetchPlayers();
  }, []);

  const handleTournamentClick = (tournament) => {
    setSelectedTournament(tournament);
  };

  const handleBack = () => {
    setSelectedTournament(null);
  };

  const getPlayerNameById = (playerId) => {
    const player = players.find((p) => p.id === playerId);
    return player ? player.name : "Jugador desconocido";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-text">Cargando torneos...</p>
      </div>
    );
  }

  return (
    <div className="Torneos-background">
      <Header type="user" />
      <TopImg number={3} />
      <div className="Torneos-card">
        {!selectedTournament ? (
          <>
            <h2 className="Torneos-title">Torneos Disponibles, dar click para posiciones</h2>
            <div className="Torneos-list">
              {tournaments.length > 0 ? (
                tournaments.map((tournament) => (
                  <div
                    key={tournament.id}
                    className="Torneos-item"
                    onClick={() => handleTournamentClick(tournament)}
                  >
                    <div className="Torneo-image"></div>
                    <div className="Torneo-info">
                      <h3>{tournament.name}</h3>
                      <p>Categoría: {tournament.categoria}</p>
                      <p>
                        Fecha: {new Date(tournament.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No hay torneos disponibles para tu categoría.</p>
              )}
            </div>
          </>
        ) : (
          <div className="Torneo-details">
            <h2>{selectedTournament.name}</h2>
            <p>Categoría: {selectedTournament.categoria}</p>
            <p>Fecha: {new Date(selectedTournament.date).toLocaleDateString()}</p>
            <h3>Participantes y Posiciones:</h3>
            <ul>
              {selectedTournament.rankings?.length > 0 ? (
                selectedTournament.rankings.map((ranking, index) => (
                  <li key={index}>
                    Posición {ranking.position}: {getPlayerNameById(ranking.playerId)}
                  </li>
                ))
              ) : (
                <p>No se han asignado posiciones en este torneo.</p>
              )}
            </ul>
            <button onClick={handleBack} className="Back-button">
              Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
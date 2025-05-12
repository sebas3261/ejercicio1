import React, { useState, useEffect } from 'react'; 
import { db } from "../firebase";
import { collection, doc, setDoc, getDocs, updateDoc } from "firebase/firestore";
import "../css/torneos.css";
import TopImg from '../components/TopImg';
import Header from '../components/Header';

export default function TorneosUsuario() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("user123"); // Simulación de usuario actual
  const [errorMessage, setErrorMessage] = useState("");
  const costoTorneo = 55000;

  useEffect(() => {
    const fetchTournaments = async () => {
      const querySnapshot = await getDocs(collection(db, "tournaments"));
      const today = new Date();

      const tournamentsList = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(t => {
          if (!t.fecha) return false;
          const tournamentDate = new Date(t.fecha);
          return tournamentDate >= today;
        })
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

      setTournaments(tournamentsList);
    };

    fetchTournaments();
  }, []);

  const handleInscribirClick = (tournament) => {
    setErrorMessage("");
    setSelectedTournament(tournament);
    setShowPayment(true);
  };

  const handlePagar = async () => {
    if (!selectedTournament) return;

    const conflicto = tournaments.some(t => 
      t.id !== selectedTournament.id &&
      t.fecha === selectedTournament.fecha &&
      t.horario === selectedTournament.horario &&
      (t.inscritos || []).includes(currentUserId)
    );

    if (conflicto) {
      setErrorMessage("⚠ Ya estás inscrito en un torneo con la misma fecha y horario.");
      return;
    }

    const inscritosActuales = selectedTournament.inscritos || [];
    if (inscritosActuales.length >= selectedTournament.tournamentSize) {
      setErrorMessage("⚠ El torneo ya alcanzó el número máximo de inscritos.");
      return;
    }

    const updatedInscritos = [...inscritosActuales, currentUserId];

    await updateDoc(doc(db, "tournaments", selectedTournament.id), {
      inscritos: updatedInscritos
    });

    alert("Inscripción completada con éxito.");
    setShowPayment(false);
    setSelectedTournament(null);
    setErrorMessage("");
  };

  return (
    <div className='Torneos-background'>
      <Header type="usuario" />
      <TopImg number={1} />
      <h2 className='Torneos-title'>Próximos Torneos Disponibles</h2>
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
                  <p>Profesor: {tournament.profesor || 'No asignado'}</p>
                  <p>Tamaño del torneo: {tournament.tournamentSize}</p>
                  <p>Inscritos: {(tournament.inscritos || []).length}/{tournament.tournamentSize}</p>
                </div>
                <div className="Torneo-actions">
                  {(tournament.inscritos || []).includes(currentUserId) ? (
                    <p>✅ Ya estás inscrito</p>
                  ) : (
                    <button className="inscribirse-button" onClick={() => handleInscribirClick(tournament)}>
                      Inscribirse
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showPayment && selectedTournament && (
        <div className="pago-modal">
          <div className="pago-contenido">
            <h3>Confirmar Inscripción</h3>
            <p>Costo del torneo: ${costoTorneo.toLocaleString()}</p>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button onClick={handlePagar}>Pagar</button>
            <button onClick={() => setShowPayment(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
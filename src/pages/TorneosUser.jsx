import React, { useState, useEffect } from 'react'; 
import { db } from "../firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  increment,
  getDoc 
} from "firebase/firestore";
import "../css/torneos.css";
import TopImg from '../components/TopImg';
import Header from '../components/Header';

export default function TorneosUsuario() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userCategoria, setUserCategoria] = useState(null);
  const [loading, setLoading] = useState(true);

  // Obtén el UID del usuario almacenado en localStorage
  const stored = localStorage.getItem('user');
  const currentUserId = stored ? JSON.parse(stored).uid : null;

  useEffect(() => {
    const fetchUserAndTournaments = async () => {
      if (!currentUserId) {
        setErrorMessage("⚠ No se encontró información del usuario. Inicia sesión nuevamente.");
        setLoading(false);
        return;
      }

      try {
        // Fetch user data to get categoria
        const userDoc = await getDoc(doc(db, "users", currentUserId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.categoria) {
            setUserCategoria(userData.categoria);
          } else {
            setErrorMessage("⚠ No se encontró la categoría del usuario.");
            setLoading(false);
            return;
          }
        } else {
          setErrorMessage("⚠ No se encontró el perfil del usuario.");
          setLoading(false);
          return;
        }

        // Fetch tournaments
        const querySnapshot = await getDocs(collection(db, "tournaments"));
        const today = new Date();

        const tournamentsList = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(t => {
            if (!t.fecha || !t.categoria) return false;
            const tournamentDate = new Date(t.fecha);
            return tournamentDate >= today && t.categoria === userCategoria;
          })
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        setTournaments(tournamentsList);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setErrorMessage("⚠ Error al cargar los torneos. Intenta de nuevo.");
        setLoading(false);
      }
    };

    fetchUserAndTournaments();
  }, [currentUserId, userCategoria]);

  const handleInscribirClick = (tournament) => {
    setErrorMessage("");
    setSelectedTournament(tournament);
    setShowPayment(true);
  };

  const handlePagar = async () => {
    if (!selectedTournament || !currentUserId) return;

    // 1) Validar conflictos de horario
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

    // 2) Validar cupo
    const inscritosActuales = selectedTournament.inscritos || [];
    if (inscritosActuales.length >= selectedTournament.tournamentSize) {
      setErrorMessage("⚠ El torneo ya alcanzó el número máximo de inscritos.");
      return;
    }

    try {
      // 3) Actualizar lista de inscritos del torneo
      const updatedInscritos = [...inscritosActuales, currentUserId];
      await updateDoc(doc(db, "tournaments", selectedTournament.id), {
        inscritos: updatedInscritos
      });

      // 4) Incrementar deuda del usuario en Firestore
      await updateDoc(doc(db, "users", currentUserId), {
        montoMatricula: increment(selectedTournament.precio)
      });

      // Update local state to reflect inscription
      setTournaments(prev => prev.map(t => 
        t.id === selectedTournament.id 
          ? { ...t, inscritos: updatedInscritos }
          : t
      ));

      alert("Inscripción y registro de pago agregados con éxito.");
      setShowPayment(false);
      setSelectedTournament(null);
      setErrorMessage("");
    } catch (err) {
      console.error("Error al inscribir/pagar:", err);
      setErrorMessage("⚠ Ha ocurrido un error. Intenta de nuevo.");
    }
  };

  return (
    <div className='Torneos-background'>
      <Header type="usuario" />
      <TopImg number={5} />
      <h2 className='Torneos-title'>
        {userCategoria ? `Torneos ${userCategoria} Disponibles` : 'Cargando Torneos...'}
      </h2>
      {errorMessage && (
        <p style={{ color: '#c00', textAlign: 'center', margin: '1rem 0' }}>
          {errorMessage}
        </p>
      )}
      {loading ? (
        <p style={{ textAlign: 'center', margin: '1rem 0' }}>
          Cargando torneos...
        </p>
      ) : tournaments.length === 0 && !errorMessage ? (
        <p style={{ textAlign: 'center', margin: '1rem 0' }}>
          No hay torneos disponibles para tu categoría ({userCategoria}).
        </p>
      ) : (
        <div className='Torneos-card'>
          <div className='Torneos-list-container'>
            <div className='Torneos-list'>
              {tournaments.map((tournament) => (
                <div key={tournament.id} className='Torneos-item'>
                  <div className='Torneo-image'></div>
                  <div className='Torneo-info'>
                    <h3>{tournament.name}</h3>
                    <p>Categoría: {tournament.categoria}</p>
                    <p>Cancha: {tournament.cancha || 'No definida'}</p>
                    <p>Horario: {tournament.horario || 'No definido'}</p>
                    <p>Fecha: {tournament.fecha || 'No definida'}</p>
                    <p>Profesor: {tournament.profesor?.name || 'No asignado'}</p>
                    <p>Tamaño del torneo: {tournament.tournamentSize}</p>
                    <p>Inscritos: {(tournament.inscritos || []).length}/{tournament.tournamentSize}</p>
                    <p>Precio: ${tournament.precio || 'No asignado'}</p>
                  </div>
                  <div className="Torneo-actions">
                    {(tournament.inscritos || []).includes(currentUserId) ? (
                      <p>✅ Ya estás inscrito</p>
                    ) : (
                      <button 
                        className="inscribirse-button" 
                        onClick={() => handleInscribirClick(tournament)}
                      >
                        Inscribirse
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showPayment && selectedTournament && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: '8px',
              maxWidth: '90%',
              width: '360px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            <h3>Confirmar Inscripción</h3>
            <p>Costo del torneo: ${selectedTournament.precio.toLocaleString()}</p>
            {errorMessage && (
              <p style={{ color: '#c00', marginBottom: '1rem' }}>
                {errorMessage}
              </p>
            )}
            <button onClick={handlePagar} style={{ marginRight: '0.5rem' }}>
              Pagar
            </button>
            <button onClick={() => setShowPayment(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react'; 
import { db } from "../firebase";
import { collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";
import "../css/torneos.css";
import TopImg from '../components/TopImg';
import Header from '../components/Header';

export default function TorneosAdmin() {
  const [showCreateTournament, setShowCreateTournament] = useState(false);
  const [players, setPlayers] = useState([]);
  const [tournamentName, setTournamentName] = useState('');
  const [categoria, setCategoria] = useState('Infantil');
  const [tournamentSize, setTournamentSize] = useState(0);
  const [tournaments, setTournaments] = useState([]);
  const [editingTournament, setEditingTournament] = useState(null);
  const [cancha, setCancha] = useState('');
  const [horario, setHorario] = useState('');
  const [fecha, setFecha] = useState('');
  const [profesor, setProfesor] = useState('');
  const [precio, setPrecio] = useState('');
  const [showClasifications, setShowClasifications] = useState(false);
  const [selectedClasifications, setSelectedClasifications] = useState([]);

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
 // Verificar si el torneo ya pasó

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


// Modal o vista para ingresar clasificaciones
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

  const handleCreateOrEditTournament = async () => {
    if (!tournamentName || !cancha || !horario || !fecha || !profesor || !precio) {
      alert("Por favor, complete todos los campos requeridos.");
      return;
    }

    if (tournamentSize <= 0) {
      alert("Por favor, defina el tamaño del torneo.");
      return;
    }

    const nameExists = tournaments.some(t => 
      t.name === tournamentName && 
      (!editingTournament || editingTournament.name !== tournamentName)
    );
    if (nameExists) {
      alert("Ya existe un torneo con ese nombre.");
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
      alert("La cancha seleccionada ya está ocupada.");
      return;
    }

    const entrenosSnapshot = await getDocs(collection(db, "entrenos")); 
    const entrenosList = entrenosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const entrenoOcupado = entrenosList.some(entreno => 
      entreno.cancha === cancha && 
      entreno.horario === horario && 
      entreno.fecha === fecha
    );
    if (entrenoOcupado) {
      alert("Ya hay un entrenamiento en esa cancha y horario.");
      return;
    }

    const profesorOcupado = [...tournamentsList, ...entrenosList].some(evento => 
      evento.profesor?.id === profesor && 
      evento.horario === horario && 
      evento.fecha === fecha
    );
    if (profesorOcupado) {
      alert("El profesor ya tiene otro evento asignado.");
      return;
    }

  const profesorObj = players.find(p => p.id === profesor);
if (!profesorObj) {
  alert("Profesor no válido.");
  return;
}

const tournamentData = {
  name: tournamentName,
  categoria,
  cancha,
  horario,
  fecha,
  profesor: {
    id: profesorObj.id,
    name: profesorObj.name,
  },
  tournamentSize,
  precio: Number(precio),
  date: new Date().toISOString(),
  rankings: [],
  inscritos: [],
};


    try {
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
      setTournamentSize(0);
      setCancha('');
      setHorario('');
      setFecha('');
      setProfesor('');
      setPrecio('');
      setShowCreateTournament(false);
      setEditingTournament(null);
    } catch (error) {
      alert("Error al guardar el torneo: " + error.message);
    }
  };

  const handleEditTournament = (tournament) => {
    setTournamentName(tournament.name);
    setCategoria(tournament.categoria);
    setTournamentSize(tournament.tournamentSize);
    setCancha(tournament.cancha || '');
    setHorario(tournament.horario || '');
    setFecha(tournament.fecha || '');
    setProfesor(tournament.profesor || '');
    setPrecio(tournament.precio || '');
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
  const handleSetClassification = (player, position) => {
  setSelectedClasifications((prev) => {
    const updated = [...prev];
    const index = updated.findIndex((item) => item.id === player.id);
    if (index !== -1) {
      updated[index] = { ...updated[index], position };
    } else {
      updated.push({ id: player.id, position });
    }
    return updated;
  });
};

const handleSaveClasifications = async () => {
  try {
    // Actualizar las clasificaciones en la base de datos
    await setDoc(doc(db, "tournaments", editingTournament.id), {
      ...editingTournament,
      rankings: selectedClasifications,
    });

    alert("Clasificaciones guardadas con éxito.");
    setShowClasifications(false);
    setTournaments((prev) =>
      prev.map((tournament) =>
        tournament.id === editingTournament.id
          ? { ...tournament, rankings: selectedClasifications }
          : tournament
      )
    );
  } catch (error) {
    alert("Error al guardar las clasificaciones: " + error.message);
  }
};
const handleOpenClasifications = (tournament) => {
  if (!tournament.participantes) {
    tournament.participantes = [];
  }
    setEditingTournament(tournament);
    setShowClasifications(true);
    setSelectedClasifications([]);
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
                      <p>Tamaño del torneo: {tournament.tournamentSize}</p>
                      <p>Precio: ${tournament.precio}</p>
                    </div>
                    <div className="Torneo-actions">
                      <button className="edit-button" onClick={() => handleEditTournament(tournament)}>✏️ Editar</button>
                      <button className="delete-button" onClick={() => handleDeleteTournament(tournament.name)}>🗑️ Eliminar</button>
                       {new Date(tournament.fecha) < new Date() && (
  <button className="clas-button" onClick={() => handleOpenClasifications(tournament)}>
    🏅 Agregar Clasificación
  </button>
)}
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
            <div className="torneo-form-container">
              <input type="text" value={tournamentName} onChange={(e) => setTournamentName(e.target.value)} placeholder="Nombre del Torneo" />
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="Infantil">Infantil</option>
                <option value="Juvenil">Juvenil</option>
                <option value="Adulto">Adulto</option>
                <option value="Profesional">Profesional</option>
              </select>
              <div className="num-players-container">
                <span className="num-players-label">Tamaño del torneo:</span>
                <input type="number" value={tournamentSize} onChange={(e) => setTournamentSize(Number(e.target.value))} placeholder="Máximo de jugadores" min="1" />
              </div>
              <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Precio del torneo" min="0" />
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
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} min={minDateStr} max={maxDateStr} placeholder="Seleccionar Fecha" />
              <select value={profesor} onChange={(e) => setProfesor(e.target.value)}>
                <option value="">Seleccionar Profesor</option>
                {players.filter(p => p.type === "profesor").map(player => (
                  <option key={player.id} value={player.id}>{player.name}</option>
                ))}
              </select>
            </div>
            <div className="torneos-contenedor">
              <button className="Torneo-button" onClick={handleCreateOrEditTournament}>
                {editingTournament ? "Actualizar Torneo" : "Crear Torneo"}
              </button>
              <button className="Torneo-button cancelar" onClick={() => {
                setShowCreateTournament(false);
                setTournamentName('');
                setCategoria('Infantil');
                setTournamentSize(0);
                setCancha('');
                setHorario('');
                setFecha('');
                setProfesor('');
                setPrecio('');
                setEditingTournament(null);
              }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {showClasifications && editingTournament && (
  <div className="clasification-modal">
    <h3>Agregar Clasificación para {editingTournament.name}</h3>
    <div className="clasification-form">
      <label>🥇 Primer lugar:</label>
      <select onChange={(e) => handleSetClassification(players.find(p => p.id === e.target.value), 1)}>
        <option value="">Seleccionar jugador</option>
        {players.filter(p => editingTournament.inscritos?.includes(p.id)).map(player => (
          <option key={player.id} value={player.id}>{player.name}</option>
        ))}
      </select>

      <label>🥈 Segundo lugar:</label>
      <select onChange={(e) => handleSetClassification(players.find(p => p.id === e.target.value), 2)}>
        <option value="">Seleccionar jugador</option>
        {players.filter(p => editingTournament.inscritos?.includes(p.id)).map(player => (
          <option key={player.id} value={player.id}>{player.name}</option>
        ))}
      </select>

      <label>🥉 Tercer lugar:</label>
      <select onChange={(e) => handleSetClassification(players.find(p => p.id === e.target.value), 3)}>
        <option value="">Seleccionar jugador</option>
        {players.filter(p => editingTournament.inscritos?.includes(p.id)).map(player => (
          <option key={player.id} value={player.id}>{player.name}</option>
        ))}
      </select>

      <div className="torneos-contenedor">
        <button className="Torneo-button" onClick={handleSaveClasifications}>Guardar Clasificación</button>
        <button className="Torneo-button cancelar" onClick={() => setShowClasifications(false)}>Cancelar</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

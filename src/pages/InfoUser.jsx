import React, { useEffect, useState } from "react";
import "../css/infouser.css";
import Header from "../components/Header";
import { Chart } from "react-google-charts";
import { doc, getDoc, collection, query, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import TopImg from "../components/TopImg";
import { NavLink } from "react-router";

export default function InfoUser() {
  const [userCategory, setUserCategory] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [trainingCount, setTrainingCount] = useState(0);
  const [totalTrainings, setTotalTrainings] = useState(0);
  const [tournamentCount, setTournamentCount] = useState(0);
  const [totalTournaments, setTotalTournaments] = useState(0);
  const [tournamentsWon, setTournamentsWon] = useState(0);
  const [firstPlaceTournaments, setFirstPlaceTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const uid = storedUser?.uid;

        if (!uid) {
          console.error("No se encontró un UID en localStorage.");
          return;
        }

        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.error("No se encontró información del usuario en Firestore.");
          return;
        }

        const userData = userDoc.data();
        setUserCategory(userData.categoria || "Desconocida");
        setUserBalance(userData.montoMatricula || 0);
        setPaymentStatus(userData.montoMatricula > 0 ? "Debe dinero" : "Al día");

        // Consultar entrenos
        const entrenosQuery = query(collection(db, "entrenos"));
        const entrenosSnapshot = await getDocs(entrenosQuery);
        let attendedTrainings = 0;
        let totalCategoryTrainings = 0;

        entrenosSnapshot.forEach((doc) => {
          const entrenoData = doc.data();
          if (entrenoData.categoria === userData.categoria) {
            totalCategoryTrainings++;
          }
          if (entrenoData.asistencia && Array.isArray(entrenoData.asistencia) && entrenoData.asistencia.includes(uid)) {
            attendedTrainings++;
          }
        });

        setTrainingCount(attendedTrainings);
        setTotalTrainings(totalCategoryTrainings);

        // Consultar torneos
        const tournamentsQuery = query(collection(db, "tournaments"));
        const tournamentsSnapshot = await getDocs(tournamentsQuery);
        let attendedTournaments = 0;
        let totalCategoryTournaments = 0;
        let wonTournaments = 0;
        const firstPlaceList = [];

        tournamentsSnapshot.forEach((doc) => {
          const tournamentData = doc.data();
          const tournamentId = doc.id;

          // Verificar que el torneo tenga una categoría y que coincida con la del usuario
          if (tournamentData.categoria && tournamentData.categoria === userData.categoria) {
            totalCategoryTournaments++;
          } else {
            console.log(`Torneo ${tournamentData.name || tournamentId} no tiene categoría o no coincide:`, tournamentData.categoria);
          }

          // Verificar si el usuario está inscrito en el torneo
          if (tournamentData.inscritos && Array.isArray(tournamentData.inscritos) && tournamentData.inscritos.includes(uid)) {
            attendedTournaments++;

            // Verificar si el usuario ganó (position 0 in rankings array, id matches uid, and position === 1)
            if (tournamentData.rankings && Array.isArray(tournamentData.rankings) && tournamentData.rankings.length > 0) {
              const firstPlaceRank = tournamentData.rankings[0]; // Check the first entry in rankings
              if (firstPlaceRank.id === uid && firstPlaceRank.position === 1) {
                wonTournaments++;
                firstPlaceList.push({
                  id: tournamentId,
                  name: tournamentData.name || "Nombre no definido",
                  fecha: tournamentData.fecha || "No definida",
                  categoria: tournamentData.categoria || "Desconocida",
                  cancha: tournamentData.cancha || "No definida",
                });
                console.log(`Usuario ganó torneo ${tournamentData.name || tournamentId}:`, firstPlaceRank);
              }
            }
          } else {
            console.log(`Usuario no inscrito en torneo ${tournamentData.name || tournamentId}:`, tournamentData.inscritos);
          }
        });

        setTournamentCount(attendedTournaments);
        setTotalTournaments(totalCategoryTournaments);
        setTournamentsWon(wonTournaments);
        setFirstPlaceTournaments(firstPlaceList);

        console.log("Total torneos en categoría:", totalCategoryTournaments);
        console.log("Torneos participados:", attendedTournaments);
        console.log("Torneos ganados:", wonTournaments);

      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-text">Cargando información del usuario...</p>
      </div>
    );
  }

  const pieChartDataTrainings = [
    ["Entrenos", "Cantidad"],
    ["Asistidos", trainingCount],
    ["No asistidos", totalTrainings - trainingCount],
  ];

  const pieChartDataTournaments = [
    ["Torneos", "Cantidad"],
    ["Participados", tournamentCount],
    ["No participados", Math.max(totalTournaments - tournamentCount, 0)], // Evitar valores negativos
  ];

  const pieChartOptions = {
    pieHole: 0.4,
    colors: ["#4caf50", "#e0e0e0"],
    legend: "none",
  };

  return (
    <div className="infouser-background">
      <Header type="user" />
      <TopImg number={4} />
      <div className="infouser-card">
        <h2 className="infouser-header">Resumen de Actividad</h2>
        <div className="user-category-right">Categoría del usuario: {userCategory}</div>
        <div className="infouser-balance-box">
          <h3>Saldo</h3>
          <p>${userBalance}</p>
          <span className={`payment-status ${paymentStatus === "Debe dinero" ? "debt" : "paid"}`}>{paymentStatus}</span>
          <NavLink to={"/pagosuser"} className={"navlink"}>
            {paymentStatus === "Debe dinero" && <button className="pay-button">Pagar</button>}
          </NavLink>
        </div>

        <div className="infouser-chart">
          <div className="infouser-chart-item">
            <p>Entrenos Asistidos</p>
            <Chart chartType="PieChart" data={pieChartDataTrainings} options={pieChartOptions} width={"100%"} height={"200px"} />
          </div>
          <div className="infouser-chart-item">
            <p>Torneos Inscritos</p>
            <Chart chartType="PieChart" data={pieChartDataTournaments} options={pieChartOptions} width={"100%"} height={"200px"} />
            {tournamentsWon > 0 && (
              <p className="tournament-wins">
                🏆 Has ganado {tournamentsWon} de {totalTournaments} torneos en tu categoría.
              </p>
            )}
          </div>
          <div className="infouser-chart-item">
            <h3>Torneos Ganados</h3>
            {firstPlaceTournaments.length > 0 ? (
              <ul className="first-place-list">
                {firstPlaceTournaments.map((tournament) => (
                  <li key={tournament.id} className="first-place-item">
                    <span>🏆 {tournament.name}</span>
                    <span>Fecha: {tournament.fecha}</span>
                    
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-wins">No has ganado ningún torneo aún.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}